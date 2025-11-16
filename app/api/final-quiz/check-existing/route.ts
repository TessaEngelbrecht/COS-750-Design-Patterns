// app/api/final-quiz/check-existing/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";

export async function POST(req: Request) {
  try {
    const { patternId } = await req.json();

    if (!patternId) {
      return NextResponse.json(
        { error: "Missing patternId" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabase();
    const user = await getUser();
    if (!user)
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    const studentId = user.profile.id;

    // Final Quiz type
    const { data: quizType } = await supabase
      .from("quiz_type")
      .select("id")
      .eq("quiz_type", "Final Quiz")
      .single();

    if (!quizType) {
      return NextResponse.json(
        { error: "Final Quiz type missing" },
        { status: 500 }
      );
    }
    const finalQuizTypeId = quizType.id;

    // Find a submitted attempt for this student & pattern
    const { data: attemptRow, error: attemptErr } = await supabase
      .from("quiz_attempt")
      .select(
        `
        id,
        submitted_at,
        quiz_attempt_pattern!inner (
          pattern_id
        )
      `
      )
      .eq("student_id", studentId)
      .eq("quiz_type_id", finalQuizTypeId)
      .eq("quiz_attempt_pattern.pattern_id", patternId)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (attemptErr) {
      return NextResponse.json({ error: attemptErr.message }, { status: 500 });
    }

    if (!attemptRow?.id) {
      return NextResponse.json({ exists: false });
    }

    const attemptId = attemptRow.id;

    // Load all items for this attempt
    const { data: items, error: itemsErr } = await supabase
      .from("quiz_attempt_item")
      .select(
        `
        question_id,
        student_answer,
        is_correct,
        points_earned,
        question:question_id (
          id,
          format_id,
          question_format:format_id ( format ),
          bloom_id,
          bloom:bloom_id ( level ),
          difficulty_id,
          difficulty:difficulty_id ( difficulty_level ),
          question_content:question_content (
            question_text,
            question_data,
            correct_answer,
            points
          ),
          section:section_id ( id, section )
        )
      `
      )
      .eq("quiz_attempt_id", attemptId);

    if (itemsErr) {
      return NextResponse.json({ error: itemsErr.message }, { status: 500 });
    }

    const questions = (items ?? []).map((row: any) => {
      const q = Array.isArray(row.question) ? row.question[0] : row.question;

      const sectionObj = Array.isArray(q?.section) ? q.section[0] : q?.section;
      const contentObj = Array.isArray(q?.question_content)
        ? q.question_content[0]
        : q?.question_content;

      return {
        question_id: row.question_id,
        question_format: q?.question_format?.format ?? "unknown",
        question_text: contentObj?.question_text ?? "",
        question_data: contentObj?.question_data ?? null,
        correct_answer: contentObj?.correct_answer ?? null, // safe now (review page only)
        points: contentObj?.points ?? 1,

        bloom_id: q?.bloom_id,
        bloom_level: q?.bloom?.level ?? null,
        difficulty_id: q?.difficulty_id,
        difficulty: q?.difficulty?.difficulty_level ?? null,
        section_id: sectionObj?.id ?? null,
        section: sectionObj?.section ?? "Unknown",

        student_answer: row.student_answer,
        is_correct: row.is_correct,
        points_earned: row.points_earned,
      };
    });

    return NextResponse.json({
      exists: true,
      attemptId,
      questions,
    });
  } catch (err: any) {
    console.error("final-quiz/check-existing error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
