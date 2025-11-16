import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase();
  const attemptId = (await context.params).id;

  try {
    const { data, error } = await supabase
      .from("quiz_attempt_item")
      .select(`
        question_id,
        student_answer,
        is_correct,
        points_earned,
        question:question_id (
          question_text:question_content(question_text),
          question_data:question_content(question_data),
          correct_answer:question_content(correct_answer),
          format:format_id(format),
          bloom:bloom_id(level),
          difficulty:difficulty_id(difficulty_level),
          section:section_id(section)
        )
      `)
      .eq("quiz_attempt_id", attemptId);

    if (error) throw error;

    const items = data.map((row) => {
        // Safely unwrap 1-level arrays
        const q = Array.isArray(row.question) ? row.question[0] : row.question;

        const questionTextObj = Array.isArray(q?.question_text)
            ? q.question_text[0]
            : q?.question_text;

        const questionDataObj = Array.isArray(q?.question_data)
            ? q.question_data[0]
            : q?.question_data;

        const correctAnswerObj = Array.isArray(q?.correct_answer)
            ? q.correct_answer[0]
            : q?.correct_answer;

        const formatObj = Array.isArray(q?.format) ? q.format[0] : q?.format;
        const bloomObj = Array.isArray(q?.bloom) ? q.bloom[0] : q?.bloom;
        const difficultyObj = Array.isArray(q?.difficulty)
            ? q.difficulty[0]
            : q?.difficulty;
        const sectionObj = Array.isArray(q?.section) ? q.section[0] : q?.section;

        return {
            question_id: row.question_id,
            user_answer: row.student_answer,
            is_correct: row.is_correct,
            points_earned: row.points_earned,

            // Flattened fields
            question_text: questionTextObj?.question_text ?? "",
            question_data: questionDataObj?.question_data ?? null,
            correct_answer: correctAnswerObj?.correct_answer ?? null,

            question_format: formatObj?.format ?? "unknown",
            bloom_level: bloomObj?.level ?? "N/A",
            difficulty: difficultyObj?.difficulty_level ?? "N/A",
            section: sectionObj?.section ?? "Unknown",
        };
    });

    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch attempt" },
      { status: 500 }
    );
  }
}
