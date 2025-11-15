// /app/api/practice-quiz/generate/[patternId]/route.ts

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export async function GET(
  req: Request,
  context: { params: Promise<{ patternId: string }> }
) {
  try {
    const supabase = await createServerSupabase();
    const patternId = (await context.params).patternId;

    if (!patternId)
      return NextResponse.json(
        { error: "Pattern ID missing" },
        { status: 400 }
      );

    const user = await getUser();
    if (!user)
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    const studentId = user.profile.id;

    // 2. Fetch quiz type dynamically
    const { data: quizType } = await supabase
      .from("quiz_type")
      .select("id")
      .eq("quiz_type", "Practice Quiz")
      .single();

    if (!quizType)
      return NextResponse.json(
        { error: "Practice quiz type missing in database" },
        { status: 500 }
      );

    const practiceQuizTypeId = quizType.id;

    console.log(
      "Generating practice quiz for student:",
      studentId,
      "pattern:",
      patternId
    );

    // 3. Get student pattern learning profile
    const { data: learning_profile, error: lpErr } = await supabase
      .from("student_pattern_learning_profile")
      .select("*")
      .eq("student_id", studentId)
      .eq("pattern_id", patternId)
      .maybeSingle();

    if (lpErr) {
      console.error("❌ learning_profile error:", lpErr);
    }

    if (!learning_profile)
      return NextResponse.json(
        { error: "No learning profile found for this pattern" },
        { status: 404 }
      );

    const profileId = learning_profile.id;

    // 4. Topic confidence
    const { data: topicConf } = await supabase
      .from("student_topic_confidence")
      .select("topic_id, confidence_score")
      .eq("profile_id", profileId);

    const topicMap = new Map(
      topicConf?.map((t) => [t.topic_id, t.confidence_score]) ?? []
    );

    // 5. Bloom mastery
    const { data: bloomMasteryRaw } = await supabase
      .from("student_bloom_mastery")
      .select("bloom_id, mastery_score")
      .eq("profile_id", profileId);

    const bloomMap = new Map(
      bloomMasteryRaw?.map((b) => [b.bloom_id, b.mastery_score]) ?? []
    );

    // We'll need an average mastery for difficulty bias
    const avgBloomMastery =
      bloomMasteryRaw && bloomMasteryRaw.length > 0
        ? bloomMasteryRaw.reduce((sum, b) => sum + (b.mastery_score ?? 50), 0) /
          bloomMasteryRaw.length
        : 50; // default mid mastery if none

    // 6. Difficulty preferences
    const { data: difficultyPref } = await supabase
      .from("student_difficulty_pref")
      .select("difficulty_id, pref_score")
      .eq("profile_id", profileId);

    const difficultyMap = new Map(
      difficultyPref?.map((d) => [d.difficulty_id, d.pref_score]) ?? []
    );

    // 7. Previously seen questions
    const { data: attempts } = await supabase
      .from("quiz_attempt")
      .select("id")
      .eq("student_id", studentId)
      .eq("quiz_type_id", practiceQuizTypeId);

    const attemptIds = attempts?.map((a) => a.id) ?? [];

    let seenSet = new Set<string>();

    if (attemptIds.length > 0) {
      const { data: seenItems } = await supabase
        .from("quiz_attempt_item")
        .select("question_id")
        .in("quiz_attempt_id", attemptIds);

      seenSet = new Set(seenItems?.map((x) => x.question_id));
    }

    // 8. Fetch questions with content + section + topics
    // 8.1. Fetch question IDs for pattern
    const { data: qmap, error: qmapErr } = await supabase
      .from("question_pattern")
      .select("question_id")
      .eq("pattern_id", patternId);

    if (qmapErr)
      return NextResponse.json({ error: qmapErr.message }, { status: 500 });

    if (!qmap || qmap.length === 0)
      return NextResponse.json(
        { error: "No questions linked to this pattern" },
        { status: 404 }
      );

    // Extract IDs
    const questionIds = qmap.map((row) => row.question_id);

    // 8.2. Fetch full questions
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
        question_topic (
          topic_id,
          learning_topic:topic_id ( topic )
        ),
        section:section_id ( id, section )
      `
      )
      .in("id", questionIds);

    if (qErr)
      return NextResponse.json({ error: qErr.message }, { status: 500 });

    if (!questions || questions.length === 0)
      return NextResponse.json(
        { error: "No questions found for mapped IDs" },
        { status: 404 }
      );

    // ---------------------------------------------------------
    // 9. Scoring with MULTI-TOPIC weighting
    // ---------------------------------------------------------

    function computeScore(q: any) {
      const topicIds = q.question_topic?.map((t: any) => t.topic_id) ?? [];

      // Multi-topic: average difficulty (areas you're weaker in)
      const avgTopicGap =
        topicIds.length > 0
          ? topicIds
              .map((tId: string) => 100 - (topicMap.get(tId) ?? 50))
              .reduce((a: number, b: number) => a + b, 0) / topicIds.length
          : 50;

      const bloomGap = 100 - (bloomMap.get(q.bloom_id) ?? 50);
      const difficultyPrefVal = difficultyMap.get(q.difficulty_id) ?? 50;
      const isSeen = seenSet.has(q.id);

      return (
        (avgTopicGap / 100) * 0.4 +
        (bloomGap / 100) * 0.4 +
        (difficultyPrefVal / 100) * 0.1 +
        (isSeen ? -0.2 : 0.1)
      );
    }

    const enriched = questions.map((q: any) => {
      const sectionObj = Array.isArray(q.section)
        ? q.section[0]
        : q.section;

      const contentObj = Array.isArray(q.question_content)
        ? q.question_content[0]
        : q.question_content;

      return {
        ...q,
        score: computeScore(q),

        // section info
        section: sectionObj?.section ?? "Unknown",
        section_id: sectionObj?.id ?? null,

        // flattened question content
        question_content: contentObj,
      };
    });

    console.log("Enriched questions with scores:", enriched);

    // ---------------------------------------------------------
    // 10. Section quotas (adjust dynamically)
    // ---------------------------------------------------------

    const TARGET_TOTAL = 20;

    const TARGET_SPLIT: Record<string, number> = {
      "Theory & Concepts": 0.3,
      "Code Implementation": 0.3,
      "Pattern Participants/Relationships": 0.2,
      "UML Diagrams": 0.2,
    };

    // Count available per section
    const bySection = new Map<string, any[]>();
    enriched.forEach((q: any) => {
      if (!bySection.has(q.section)) bySection.set(q.section, []);
      bySection.get(q.section)!.push(q);
    });

    // Compute initial target counts per section
    let quotas: Record<string, number> = Object.fromEntries(
      Object.entries(TARGET_SPLIT).map(([section, pct]) => [
        section,
        Math.round(pct * TARGET_TOTAL),
      ])
    );

    // Fix shortages (if any)
    let shortage = 0;

    for (const section of Object.keys(quotas)) {
      const available = bySection.get(section)?.length ?? 0;

      if (available < quotas[section]) {
        shortage += quotas[section] - available;
        quotas[section] = available;
      }
    }

    // Redistribute shortage proportionally across sections with surplus
    if (shortage > 0) {
      const expandable = Object.keys(quotas).filter(
        (sec) => (bySection.get(sec)?.length ?? 0) > quotas[sec]
      );

      if (expandable.length > 0) {
        const perSectionAdd = Math.floor(shortage / expandable.length);

        expandable.forEach((sec, idx) => {
          const available = bySection.get(sec)!.length;

          const add =
            idx === expandable.length - 1
              ? shortage - perSectionAdd * (expandable.length - 1)
              : perSectionAdd;

          quotas[sec] = Math.min(available, quotas[sec] + add);
        });
      }
    }

    // ---------------------------------------------------------
    // 10.1 Mastery-based difficulty distribution (global caps)
    // ---------------------------------------------------------

    // Easy / Medium / Hard availability
    const difficultyAvailable = {
      Easy: enriched.filter(
        (q) => q.difficulty?.difficulty_level === "Easy"
      ).length,
      Medium: enriched.filter(
        (q) => q.difficulty?.difficulty_level === "Medium"
      ).length,
      Hard: enriched.filter(
        (q) => q.difficulty?.difficulty_level === "Hard"
      ).length,
    };

    // Average mastery in [0,1]
    const mastery01 = clamp(avgBloomMastery / 100, 0, 1);

    // Base difficulty probabilities
    let pEasy = 0.3;
    let pMed = 0.5;
    let pHard = 0.2;

    // ELO-like adjustment:
    // - higher mastery → less Easy, more Hard
    // - lower mastery → more Easy, less Hard
    const delta = (mastery01 - 0.5) * 0.6; // range roughly [-0.3, 0.3]

    pEasy = clamp(pEasy - delta, 0.1, 0.6);
    pHard = clamp(pHard + delta, 0.1, 0.6);
    pMed = clamp(1 - pEasy - pHard, 0.1, 0.8);

    // Normalize (just in case of numerical drift)
    const sumP = pEasy + pMed + pHard;
    pEasy /= sumP;
    pMed /= sumP;
    pHard /= sumP;

    // Convert to target counts
    let targetEasy = Math.round(pEasy * TARGET_TOTAL);
    let targetMed = Math.round(pMed * TARGET_TOTAL);
    let targetHard = Math.round(pHard * TARGET_TOTAL);

    // Ensure totals add up to TARGET_TOTAL
    let diffTotal = targetEasy + targetMed + targetHard;
    if (diffTotal !== TARGET_TOTAL) {
      const diff = TARGET_TOTAL - diffTotal;
      // adjust Medium as a buffer
      targetMed += diff;
    }

    // Hard cap / soft floor logic
    const minEasy = Math.floor(TARGET_TOTAL * 0.2); // at least 20% Easy
    const maxHardCap = Math.ceil(TARGET_TOTAL * 0.5); // at most 50% Hard

    targetEasy = Math.max(targetEasy, minEasy);
    targetHard = Math.min(targetHard, maxHardCap);

    // Rebalance Medium to keep sum close to TARGET_TOTAL
    diffTotal = targetEasy + targetMed + targetHard;
    if (diffTotal !== TARGET_TOTAL) {
      targetMed += TARGET_TOTAL - diffTotal;
      if (targetMed < 0) targetMed = 0;
    }

    // Respect availability
    const maxPerDifficulty = {
      Easy: Math.min(difficultyAvailable.Easy, targetEasy),
      Medium: Math.min(difficultyAvailable.Medium, targetMed),
      Hard: Math.min(difficultyAvailable.Hard, targetHard),
    };

    // Running counters while selecting
    const difficultyCounts = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    };

    // ---------------------------------------------------------
    // 11. Weighted random selection PER SECTION with difficulty caps
    // ---------------------------------------------------------

    function weightedPickOne(items: any[]): any | null {
      if (!items.length) return null;
      const total = items.reduce((s: number, x: any) => s + x.score, 0);
      if (total <= 0) {
        // all scores zero or negative – just uniform
        const idx = Math.floor(Math.random() * items.length);
        return items[idx];
      }
      let r = Math.random() * total;
      for (const item of items) {
        r -= item.score;
        if (r <= 0) return item;
      }
      return items[items.length - 1];
    }

    function selectForSectionWithDifficultyCaps(
      items: any[],
      count: number
    ): any[] {
      const selected: any[] = [];
      const usedIds = new Set<string>();

      let attempts = 0;
      const MAX_ATTEMPTS = 5000;

      while (
        selected.length < count &&
        attempts < MAX_ATTEMPTS &&
        items.length > 0
      ) {
        attempts++;

        const candidate = weightedPickOne(items);
        if (!candidate) break;

        const qId = candidate.id;
        if (usedIds.has(qId)) continue;

        const diffLabel =
          candidate.difficulty?.difficulty_level ?? "Medium";

        // map unknown difficulty to Medium bucket
        const key =
          diffLabel === "Easy"
            ? "Easy"
            : diffLabel === "Hard"
            ? "Hard"
            : "Medium";

        // Check global caps
        if (difficultyCounts[key] >= maxPerDifficulty[key]) {
          // Can't take more of this difficulty – try again
          continue;
        }

        // Accept
        usedIds.add(qId);
        selected.push(candidate);
        difficultyCounts[key]++;
      }

      return selected;
    }

    const finalSelection: any[] = [];

    // First pass: respect section quotas + difficulty caps
    for (const [section, qList] of bySection) {
      const quota = quotas[section] ?? 0;
      if (quota > 0 && qList.length > 0) {
        const chosen = selectForSectionWithDifficultyCaps(qList, quota);
        finalSelection.push(...chosen);
      }
    }

    // If we didn't reach TARGET_TOTAL (because of caps/availability),
    // do a small fallback fill ignoring difficulty caps, but still avoid duplicates.
    if (finalSelection.length < TARGET_TOTAL) {
      const remainingNeeded = TARGET_TOTAL - finalSelection.length;
      const alreadyIds = new Set(finalSelection.map((q) => q.id));

      const remainingPool = enriched.filter((q) => !alreadyIds.has(q.id));

      for (let i = 0; i < remainingNeeded && remainingPool.length > 0; i++) {
        const cand = weightedPickOne(remainingPool);
        if (!cand) break;
        if (alreadyIds.has(cand.id)) continue;
        finalSelection.push(cand);
        alreadyIds.add(cand.id);
      }
    }

    // ---------------------------------------------------------
    // 12. Create quiz attempt
    // ---------------------------------------------------------

    const { data: attempt, error: attemptErr } = await supabase
      .from("quiz_attempt")
      .insert({
        student_id: studentId,
        quiz_type_id: practiceQuizTypeId,
        total_questions: finalSelection.length,
      })
      .select()
      .single();

    if (attemptErr)
      return NextResponse.json({ error: attemptErr.message });

    // ---------------------------------------------------------
    // 13. Response
    // ---------------------------------------------------------

    return NextResponse.json({
      attemptId: attempt.id,
      totalSelected: finalSelection.length,
      questions: finalSelection.map((q) => ({
        question_id: q.id,
        question_format: q.question_format.format ?? "unknown",
        question_text: q.question_content?.question_text,
        question_data: q.question_content?.question_data,
        correct_answer: q.question_content?.correct_answer ?? null, // you can later strip this out
        points: q.question_content?.points ?? 1,

        bloom_id: q.bloom_id,
        bloom_level: q.bloom?.level ?? null,

        difficulty_id: q.difficulty_id,
        difficulty: q.difficulty?.difficulty_level ?? null,

        section_id: q.section_id,
        section: q.section,

        topics:
          q.question_topic?.map((t: any) => ({
            topic_id: t.topic_id,
            topic: t.learning_topic?.topic ?? null,
          })) ?? [],

        score: q.score,
      })),
    });
  } catch (err: any) {
    console.error("❌ practice-quiz/generate error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
