import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const body = await req.json();

    const {
      attempt_id,
      question_id,
      student_answer,
      is_correct,
      points_earned,
      time_spent_seconds,
    } = body;

    if (!attempt_id || !question_id) {
      return NextResponse.json(
        { error: "Missing attempt_id or question_id" },
        { status: 400 }
      );
    }

    // Validate authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify attempt belongs to user
    const { data: attempt, error: attemptErr } = await supabase
      .from("quiz_attempt")
      .select("id, student_id")
      .eq("id", attempt_id)
      .single();

    if (attemptErr || !attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.student_id !== user.id) {
      return NextResponse.json(
        { error: "Illegal submission — attempt does not belong to you" },
        { status: 403 }
      );
    }

    // -----------------------------------------------
    // 3. Insert quiz_attempt_item
    // -----------------------------------------------
    const { data: item, error: itemErr } = await supabase
      .from("quiz_attempt_item")
      .insert({
        quiz_attempt_id: attempt_id,
        question_id,
        is_correct,
        points_earned,
      })
      .select()
      .single();

    if (itemErr) {
      return NextResponse.json({ error: itemErr.message }, { status: 500 });
    }

    // -----------------------------------------------
    // 4. Store student answer & time spent
    // -----------------------------------------------
    const { error: answerErr } = await supabase
      .from("quiz_attempt_item")
      .update({
        student_answer,
        time_spent_seconds,
      })
      .eq("id", item.id);

    if (answerErr) {
      return NextResponse.json({ error: answerErr.message }, { status: 500 });
    }

    // -----------------------------------------------
    // 5. Check if attempt is now fully answered
    // -----------------------------------------------

    // Count items already saved for this attempt
    const { data: itemCountData } = await supabase
      .from("quiz_attempt_item")
      .select("id", { count: "exact" })
      .eq("quiz_attempt_id", attempt_id);

    const answeredCount = itemCountData?.length ?? 0;

    // Fetch how many questions were generated for this attempt
    const { data: questionCountData, error: qErr } = await supabase
      .from("quiz_attempt")
      .select("total_questions")
      .eq("id", attempt_id)
      .single();

    if (!qErr && questionCountData?.total_questions) {
      const totalQuestions = questionCountData.total_questions;

      // If fully answered → mark as submitted
      if (answeredCount >= totalQuestions) {
        await supabase
          .from("quiz_attempt")
          .update({ submitted_at: new Date().toISOString() })
          .eq("id", attempt_id);
        }
    }

    return NextResponse.json({
      success: true,
      item_id: item.id,
      question_id,
      is_correct,
      saved_answer: student_answer,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
