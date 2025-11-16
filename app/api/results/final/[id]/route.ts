import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

function pct(n: number, d: number) {
  return d ? Math.round((n / d) * 100) : 0;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabase();
    const { id } = await context.params;
    const patternId = id;

    // -------------------------------
    // 1️⃣ Auth
    // -------------------------------
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const studentId = user.id;

    // -------------------------------
    // 2️⃣ Final Quiz type ID
    // -------------------------------
    const { data: quizTypeRow } = await supabase
      .from("quiz_type")
      .select("id")
      .eq("quiz_type", "Final Quiz")
      .maybeSingle();
    if (!quizTypeRow)
      return NextResponse.json({ error: "Final Quiz type missing" });

    const finalQuizTypeId = quizTypeRow.id;

    // -------------------------------
    // 3️⃣ Get attempt for this pattern
    // -------------------------------
    const { data: patternMap } = await supabase
      .from("quiz_attempt_pattern")
      .select("attempt_id")
      .eq("pattern_id", patternId);

    const attemptIds = (patternMap ?? []).map((r) => r.attempt_id);

    const { data: attempt } = await supabase
      .from("quiz_attempt")
      .select("id, submitted_at")
      .in("id", attemptIds)
      .eq("student_id", studentId)
      .eq("quiz_type_id", finalQuizTypeId)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!attempt)
      return NextResponse.json({
        error: "No submitted final quiz for this pattern.",
      });

    const attemptId = attempt.id;

    // -------------------------------
    // 4️⃣ Fetch all items (+ metadata)
    // -------------------------------
    const { data: items, error: itemsErr } = await supabase
      .from("quiz_attempt_item")
      .select(
        `
        is_correct,
        points_earned,
        time_spent_seconds,
        question:question_id (
          id,
          bloom_id,
          bloom:bloom_id ( level ),
          difficulty_id,
          difficulty:difficulty_id ( difficulty_level ),
          section:section_id ( id, section ),
          question_topic (
            topic_id,
            learning_topic:topic_id ( topic )
          ),
          question_content:question_content ( points )
        )
      `
      )
      .eq("quiz_attempt_id", attemptId);

    if (itemsErr)
      return NextResponse.json({ error: itemsErr.message });

    // -------------------------------
    // 5️⃣ Cheat sheet count
    // -------------------------------
    const { data: cheatRows } = await supabase
      .from("final_attempt_cheat_sheet_access")
      .select("id")
      .eq("attempt_id", attemptId);

    const cheatCount = (cheatRows ?? []).length;

    // -------------------------------
    // 6️⃣ Practice quiz average from profile
    // -------------------------------
    const { data: profile } = await supabase
      .from("student_pattern_learning_profile")
      .select("practice_quiz_average")
      .eq("student_id", studentId)
      .eq("pattern_id", patternId)
      .maybeSingle();

    const practicePct = profile?.practice_quiz_average ?? null;

    // -------------------------------
    // 7️⃣ Compute scoring
    // -------------------------------
    let totalPoints = 0;
    let earned = 0;
    let timeSpent = 0;

    // Bloom / Section / Topic aggregations
    const bloomMap = new Map();
    const sectionMap = new Map();
    const topicMap = new Map();

    const ensure = (map: Map<any, any>, key: string) => {
      if (!map.has(key)) map.set(key, { total: 0, correct: 0 });
      return map.get(key);
    };

    items.forEach((row) => {
        const q = row.question[0] ?? {};

        // --- unwrap arrays returned by Supabase ---
        const bloomObj = Array.isArray(q.bloom) ? q.bloom[0] : null;
        const sectionObj = Array.isArray(q.section) ? q.section[0] : null;
        const contentObj = Array.isArray(q.question_content)
            ? q.question_content[0]
            : null;
        const topicsArr = Array.isArray(q.question_topic) ? q.question_topic : [];

        const isCorrect = row.is_correct;
        const itemPoints = contentObj?.points ?? 1;
        const earnedPoints = row.points_earned ?? 0;
        const secs = row.time_spent_seconds ?? 0;

        totalPoints += itemPoints;
        earned += earnedPoints;
        timeSpent += secs;

        // --- Bloom ---
        const bloomLabel = bloomObj?.level ?? "Unknown";
        const b = ensure(bloomMap, bloomLabel);
        b.total += 1;
        if (isCorrect) b.correct += 1;

        // --- Section ---
        const secLabel = sectionObj?.section ?? "Unknown Section";
        const s = ensure(sectionMap, secLabel);
        s.total += 1;
        if (isCorrect) s.correct += 1;

        // --- Topics ---
        topicsArr.forEach((t) => {
            const topicObj = Array.isArray(t.learning_topic)
            ? t.learning_topic[0]
            : null;

            const label = topicObj?.topic ?? "General";
            const tt = ensure(topicMap, label);
            tt.total += 1;
            if (isCorrect) tt.correct += 1;
        });
        });

    const finalPct = totalPoints ? Math.round((earned / totalPoints) * 100) : 0;
    const improvementPct =
      typeof practicePct === "number" ? finalPct - practicePct : null;

    // -------------------------------
    // 8️⃣ Intervention detection
    // -------------------------------
    const bloomLow = [...bloomMap.values()].some(
      (b) => b.total > 0 && pct(b.correct, b.total) < 50
    );
    const sectionLow = [...sectionMap.values()].some(
      (s) => s.total > 0 && pct(s.correct, s.total) < 50
    );

    const needsIntervention =
      finalPct < 50 || bloomLow || sectionLow || cheatCount >= 20;

    // Log intervention if needed
    if (needsIntervention) {
      await supabase.from("intervention_log").insert({
        student_id: studentId,
        pattern_id: patternId,
        attempt_id: attemptId,
        final_score: finalPct,
        cheat_accesses: cheatCount,
        bloom_low: bloomLow,
        section_low: sectionLow,
      });
    }

    // -------------------------------
    // 9️⃣ Construct response
    // -------------------------------
    return NextResponse.json({
      status: finalPct < 50
        ? {
            kind: "fail",
            title: "Failed",
            message: "Please retake the module.",
          }
        : needsIntervention
        ? {
            kind: "warn",
            title: "CONGRATULATIONS!",
            message:
              "You passed, but some areas need intervention.",
          }
        : {
            kind: "pass",
            title: "CONGRATULATIONS!",
            message: "You successfully completed the module.",
          },

      scores: {
        finalPct,
        practicePct,
        improvementPct,
        timeSpentSeconds: timeSpent,
        cheatSheetAccesses: cheatCount,
      },

      bloom: [...bloomMap.entries()].map(([label, v]) => ({
        label,
        score: pct(v.correct, v.total),
        questions: v.total,
      })),

      sections: [...sectionMap.entries()].map(([label, v]) => ({
        label,
        score: pct(v.correct, v.total),
        questions: v.total,
      })),

      topics: [...topicMap.entries()].map(([label, v]) => ({
        label,
        score: pct(v.correct, v.total),
        questions: v.total,
      })),

      intervention: {
        needsIntervention,
        logged: needsIntervention,
      },
    });
  } catch (err: any) {
    console.error("final results error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
