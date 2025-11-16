// app/api/final-quiz/create/route.ts
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

    // 1. Final Quiz type
    const { data: quizType, error: qTypeErr } = await supabase
      .from("quiz_type")
      .select("id")
      .eq("quiz_type", "Final Quiz")
      .single();

    if (qTypeErr || !quizType) {
      return NextResponse.json(
        { error: "Final Quiz type missing" },
        { status: 500 }
      );
    }
    const finalQuizTypeId = quizType.id;

    // 2. Question ids for this pattern AND quiz type
    const { data: qmap, error: qmapErr } = await supabase
      .from("question_pattern")
      .select("question_id")
      .eq("pattern_id", patternId);

    if (qmapErr)
      return NextResponse.json({ error: qmapErr.message }, { status: 500 });

    if (!qmap || qmap.length === 0) {
      return NextResponse.json(
        { error: "No questions mapped to this pattern" },
        { status: 404 }
      );
    }

    const patternQuestionIds = qmap.map((row) => row.question_id);

    // Filter through question_quiz_type for Final Quiz only
    const { data: qqt, error: qqtErr } = await supabase
      .from("question_quiz_type")
      .select("question_id")
      .eq("quiz_type_id", finalQuizTypeId)
      .in("question_id", patternQuestionIds);

    if (qqtErr)
      return NextResponse.json({ error: qqtErr.message }, { status: 500 });

    if (!qqt || qqt.length === 0) {
      return NextResponse.json(
        { error: "No questions mapped to this pattern for Final Quiz" },
        { status: 404 }
      );
    }

    const questionIds = qqt.map((row) => row.question_id);

    // 3. Load full questions (no correct_answer on the client)
    const { data: questions, error: qErr } = await supabase
      .from("question")
      .select(
        `
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
      `
      )
      .in("id", questionIds);

    if (qErr)
      return NextResponse.json({ error: qErr.message }, { status: 500 });

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: "No questions found for mapped IDs" },
        { status: 404 }
      );
    }

    const flattened = questions.map((q: any) => {
      const sectionObj = Array.isArray(q.section) ? q.section[0] : q.section;
      const contentObj = Array.isArray(q.question_content)
        ? q.question_content[0]
        : q.question_content;

      return {
        question_id: q.id,
        question_format: q.question_format?.format ?? "unknown",
        question_text: contentObj?.question_text ?? "",
        question_data: contentObj?.question_data ?? null, // includes options, blanks, code_snippet, etc.
        // ❌ no correct_answer sent here
        points: contentObj?.points ?? 1,
        bloom_id: q.bloom_id,
        bloom_level: q.bloom?.level ?? null,
        difficulty_id: q.difficulty_id,
        difficulty: q.difficulty?.difficulty_level ?? null,
        section_id: sectionObj?.id ?? null,
        section: sectionObj?.section ?? "Unknown",
      };
    });

    // 4. Create attempt
    const { data: attempt, error: attemptErr } = await supabase
      .from("quiz_attempt")
      .insert({
        student_id: studentId,
        quiz_type_id: finalQuizTypeId,
        total_questions: flattened.length,
      })
      .select()
      .single();

    if (attemptErr) {
      return NextResponse.json({ error: attemptErr.message }, { status: 500 });
    }

    // link attempt ⇔ pattern
    const { error: qpiErr } = await supabase
      .from("quiz_attempt_pattern")
      .insert({
        attempt_id: attempt.id,
        pattern_id: patternId,
      });

    if (qpiErr) {
      return NextResponse.json({ error: qpiErr.message }, { status: 500 });
    }

    return NextResponse.json({
      attemptId: attempt.id,
      questions: flattened,
    });
  } catch (err: any) {
    console.error("final-quiz/create error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
