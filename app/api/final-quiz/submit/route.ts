// app/api/final-quiz/submit/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";

type SubmittedAnswer = {
  question_id: string;
  question_format: string;
  student_answer: any; // { answer: id } | { answers: id[] } | { blanks: { [pos]: string } }
  time_spent_seconds?: number;
};

function arraysEqualAsSets(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

function normalize(s: string | null | undefined) {
  return (s ?? "").trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const { attemptId, answers } = (await req.json()) as {
      attemptId: string;
      answers: SubmittedAnswer[];
    };

    if (!attemptId || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "Missing attemptId or answers" },
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

    // Ensure attempt belongs to this user
    const { data: attempt, error: attemptErr } = await supabase
      .from("quiz_attempt")
      .select("id, student_id")
      .eq("id", attemptId)
      .single();

    if (attemptErr || !attempt) {
      return NextResponse.json(
        { error: "Attempt not found" },
        { status: 404 }
      );
    }

    if (attempt.student_id !== user.profile.id) {
      return NextResponse.json(
        { error: "Attempt does not belong to this user" },
        { status: 403 }
      );
    }

    // Load correct answers for these questions
    const questionIds = [...new Set(answers.map((a) => a.question_id))];

    const { data: questions, error: qErr } = await supabase
      .from("question")
      .select(
        `
        id,
        question_content:question_content (
          correct_answer,
          points
        )
      `
      )
      .in("id", questionIds);

    if (qErr) {
      return NextResponse.json({ error: qErr.message }, { status: 500 });
    }

    const qMap = new Map<
      string,
      { correct_answer: any; points: number | null }
    >(
      (questions ?? []).map((q: any) => {
        const contentObj = Array.isArray(q.question_content)
          ? q.question_content[0]
          : q.question_content;
        return [
          q.id,
          {
            correct_answer: contentObj?.correct_answer ?? null,
            points: contentObj?.points ?? 1,
          },
        ];
      })
    );

    // Insert attempt items
    const rowsToInsert: any[] = [];

    for (const ans of answers) {
      const meta = qMap.get(ans.question_id);
      if (!meta) continue;

      const correctAnswer = meta.correct_answer;
      const points = meta.points ?? 1;

      let isCorrect = false;

      if (ans.question_format === "fill-in-blank") {
        // Multi-blank support: correct_answer.blanks: [{position, answers[]}]
        const blanks = correctAnswer?.blanks ?? [];
        const userBlanks: Record<number, string> = ans.student_answer?.blanks ?? {};

        isCorrect =
          blanks.length > 0 &&
          blanks.every((blank: any) => {
            const pos = blank.position;
            const userVal = normalize(userBlanks[pos]);
            if (!userVal) return false;
            return (blank.answers ?? []).some(
              (opt: string) => normalize(opt) === userVal
            );
          });
      } else if (ans.question_format === "select-multiple") {
        const correctIds: string[] = correctAnswer?.answers ?? [];
        const userIds: string[] = ans.student_answer?.answers ?? [];
        isCorrect = arraysEqualAsSets(
          (userIds ?? []).map(String),
          (correctIds ?? []).map(String)
        );
      } else {
        // "multiple-choice" or "identify-error" (single ID)
        const correctId: string = correctAnswer?.answer ?? "";
        const userId: string = ans.student_answer?.answer ?? "";
        isCorrect = String(userId) === String(correctId);
      }

      rowsToInsert.push({
        quiz_attempt_id: attemptId,
        question_id: ans.question_id,
        student_answer: ans.student_answer,
        is_correct: isCorrect,
        points_earned: isCorrect ? points : 0,
        time_spent_seconds: ans.time_spent_seconds ?? null,
      });
    }

    if (rowsToInsert.length > 0) {
      const { error: insErr } = await supabase
        .from("quiz_attempt_item")
        .insert(rowsToInsert);

      if (insErr) {
        return NextResponse.json({ error: insErr.message }, { status: 500 });
      }
    }

    // Mark attempt as submitted → your trigger will update learning metrics
    const { error: updErr } = await supabase
      .from("quiz_attempt")
      .update({ submitted_at: new Date().toISOString() })
      .eq("id", attemptId);

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("final-quiz/submit error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
