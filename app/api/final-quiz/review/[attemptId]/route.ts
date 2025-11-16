// app/api/final-quiz/review/[attemptId]/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";

export async function GET(
  req: Request,
  context: { params: Promise<{ attemptId: string }> }
) {
  try {
    const supabase = await createServerSupabase();
    const user = await getUser();
    if (!user)
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    const studentId = user.profile.id;

    const attemptId = (await context.params).attemptId;

    const { data: attempt, error: aErr } = await supabase
      .from("quiz_attempt")
      .select(
        `
        id,
        student_id,
        quiz_type_id,
        submitted_at,
        quiz_type:quiz_type_id ( quiz_type )
      `
      )
      .eq("id", attemptId)
      .single();

    if (aErr || !attempt) {
      return NextResponse.json(
        { error: "Attempt not found" },
        { status: 404 }
      );
    }

    if (attempt.student_id !== studentId) {
      return NextResponse.json(
        { error: "Attempt does not belong to this user" },
        { status: 403 }
      );
    }

    if (!attempt.submitted_at) {
      return NextResponse.json(
        { error: "Attempt not yet submitted" },
        { status: 400 }
      );
    }

    const { data: items, error: iErr } = await supabase
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
          question_content:question_content (
            question_text,
            question_data,
            correct_answer,
            points
          ),
          section:section_id ( section ),
          difficulty:difficulty_id ( difficulty_level ),
          bloom:bloom_id ( level )
        )
      `
      )
      .eq("quiz_attempt_id", attemptId);

    if (iErr)
      return NextResponse.json({ error: iErr.message }, { status: 500 });

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No attempt items found" },
        { status: 404 }
      );
    }

    let totalQuestions = 0;
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const flatItems = items.map((row: any) => {
      const q = Array.isArray(row.question) ? row.question[0] : row.question;
      const contentObj = Array.isArray(q?.question_content)
        ? q.question_content[0]
        : q?.question_content;

      const sectionObj = Array.isArray(q?.section)
        ? q.section[0]
        : q?.section;
      const diffObj = Array.isArray(q?.difficulty)
        ? q.difficulty[0]
        : q?.difficulty;
      const bloomObj = Array.isArray(q?.bloom)
        ? q.bloom[0]
        : q?.bloom;

      const maxPoints = contentObj?.points ?? 1;

      totalQuestions += 1;
      if (row.is_correct) correctCount += 1;
      totalPoints += maxPoints;
      earnedPoints += row.points_earned ?? 0;

      return {
        question_id: row.question_id,
        question_format: q?.question_format?.format ?? "unknown",
        question_text: contentObj?.question_text ?? "",
        question_data: contentObj?.question_data ?? null,
        correct_answer: contentObj?.correct_answer ?? null,
        student_answer: row.student_answer,
        is_correct: row.is_correct,
        points_earned: row.points_earned ?? 0,
        max_points: maxPoints,
        section: sectionObj?.section ?? "Unknown",
        difficulty: diffObj?.difficulty_level ?? null,
        bloom_level: bloomObj?.level ?? null,
      };
    });

    const percent =
      totalPoints > 0
        ? Math.round((earnedPoints / totalPoints) * 100)
        : 0;

    return NextResponse.json({
      attemptId,
      summary: {
        totalQuestions,
        correctCount,
        totalPoints,
        earnedPoints,
        percent,
      },
      items: flatItems,
    });
  } catch (err: any) {
    console.error("final-quiz/review error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
