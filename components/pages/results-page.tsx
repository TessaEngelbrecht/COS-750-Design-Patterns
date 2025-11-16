"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

type BloomLevel =
  | "Remember"
  | "Understand"
  | "Apply"
  | "Analyze"
  | "Evaluate"
  | "Create"
  | "Unknown";

type CognitiveBucket = {
  label: string;
  score: number;
  questions: number;
};

type Recommendation = { title: string; bullets: string[] };

interface ResultsPageProps {
  onNext: () => void;
  /** Pattern / learning unit id */
  patternId: string;
  /** Optional override; if omitted, we can still use DB-based averages */
  practicePct?: number;
}

function pct(n: number, d: number) {
  return d ? Math.round((n / d) * 100) : 0;
}

function fmtHours(totalSeconds: number) {
  return totalSeconds ? `${(totalSeconds / 3600).toFixed(1)}h` : "0h";
}

// -------------------- Tips for Bloom levels --------------------
function makeLevelTip(level: BloomLevel): string[] {
  switch (level) {
    case "Remember":
      return [
        "Create a one-page summary of the Observer pattern participants and responsibilities.",
        "Drill flashcards for key terms (Subject, Observer, ConcreteSubject, ConcreteObserver).",
      ];
    case "Understand":
      return [
        "Explain the pattern in your own words and contrast it with Pub/Sub.",
        "Sketch the UML from memory, then check against the reference.",
      ];
    case "Apply":
      return [
        "Implement a small Observer example (e.g., WeatherStation → Displays).",
        "Refactor an existing class to emit updates via Observer instead of direct calls.",
      ];
    case "Analyze":
      return [
        "Compare push vs pull models; list trade-offs for data size, coupling, and performance.",
        "Identify when Observer is overkill—write two scenarios where direct calls are simpler.",
      ];
    case "Evaluate":
      return [
        "Review code and judge correctness of attach/detach/notify implementations.",
        "Check for edge cases: re-entrancy, self-detach, notification storms.",
      ];
    case "Create":
      return [
        "Design an event system with batched notifications and throttling; justify choices.",
        "Extend the pattern with async delivery using a queue or thread pool.",
      ];
    default:
      return [];
  }
}

export function ResultsPage({
  onNext,
  patternId,
  practicePct: practicePctProp,
}: ResultsPageProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [finalItems, setFinalItems] = useState<any[]>([]);
  const [finalSubmittedAt, setFinalSubmittedAt] = useState<string | null>(null);

  const [cheatAccesses, setCheatAccesses] = useState(0);

  // Practice-related
  const [practiceItems, setPracticeItems] = useState<any[]>([]);
  const [practiceAttemptsMeta, setPracticeAttemptsMeta] = useState<
    { id: string; submitted_at: string | null }[]
  >([]);
  const [practicePctDb, setPracticePctDb] = useState<number | null>(null);

  // Fallback practice average from profile if needed
  const practicePctFromProfile =
    typeof practicePctProp === "number" ? practicePctProp : practicePctDb ?? undefined;

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const supabase = await createClient();

        // 1️⃣ Current auth user
        const {
          data: { user },
          error: authErr,
        } = await supabase.auth.getUser();

        if (authErr) throw authErr;
        if (!user) throw new Error("Not authenticated.");
        const studentId = user.id;

        if (!patternId) {
          throw new Error("Missing patternId for results lookup.");
        }

        // 2️⃣ Quiz type ids for Final & Practice Quiz
        const { data: quizTypes, error: quizTypesErr } = await supabase
          .from("quiz_type")
          .select("id, quiz_type")
          .in("quiz_type", ["Final Quiz", "Practice Quiz"]);

        if (quizTypesErr) throw quizTypesErr;

        const finalQuizTypeId = quizTypes?.find(
          (q) => q.quiz_type === "Final Quiz"
        )?.id;
        const practiceQuizTypeId = quizTypes?.find(
          (q) => q.quiz_type === "Practice Quiz"
        )?.id;

        if (!finalQuizTypeId) throw new Error("Final Quiz type not found.");
        if (!practiceQuizTypeId) {
          throw new Error("Practice Quiz type not found.");
        }

        // 3️⃣ Find all attempts linked to this pattern (any type)
        const { data: patternMap, error: pmErr } = await supabase
          .from("quiz_attempt_pattern")
          .select("attempt_id")
          .eq("pattern_id", patternId);
        if (pmErr) throw pmErr;

        const attemptIds = (patternMap ?? []).map((r) => r.attempt_id);
        if (!attemptIds.length) {
          throw new Error("No quiz attempts found for this pattern.");
        }

        // 4️⃣ Final quiz attempt (latest submitted)
        const { data: attemptRow, error: attemptErr } = await supabase
          .from("quiz_attempt")
          .select("id, submitted_at")
          .in("id", attemptIds)
          .eq("student_id", studentId)
          .eq("quiz_type_id", finalQuizTypeId)
          .not("submitted_at", "is", null)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (attemptErr) throw attemptErr;
        if (!attemptRow?.id) {
          throw new Error("No submitted final quiz attempt found for this pattern.");
        }
        const finalAttemptId = attemptRow.id;
        const finalSubmitted = attemptRow.submitted_at ?? null;

        // 5️⃣ Fetch final quiz items (quiz_attempt_item + question metadata)
        const { data: finalItemsData, error: itemsErr } = await supabase
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
              question_content:question_content (
                points
              )
            )
          `
          )
          .eq("quiz_attempt_id", finalAttemptId);
        if (itemsErr) throw itemsErr;
        if (!finalItemsData || !finalItemsData.length) {
          throw new Error("No final quiz items found for this attempt.");
        }

        // 6️⃣ Cheat-sheet accesses for the final attempt
        const { data: cheatRows, error: cheatErr } = await supabase
          .from("final_attempt_cheat_sheet_access")
          .select("id")
          .eq("attempt_id", finalAttemptId);
        if (cheatErr) throw cheatErr;
        const cheatCount = (cheatRows ?? []).length;

        // 7️⃣ Practice attempts for this pattern & student
        const { data: practiceAttemptsRows, error: practiceAttemptsErr } =
          await supabase
            .from("quiz_attempt")
            .select("id, submitted_at")
            .in("id", attemptIds)
            .eq("student_id", studentId)
            .eq("quiz_type_id", practiceQuizTypeId)
            .not("submitted_at", "is", null)
            .order("submitted_at", { ascending: true });

        if (practiceAttemptsErr) throw practiceAttemptsErr;

        let practiceItemsData: any[] = [];
        if (practiceAttemptsRows && practiceAttemptsRows.length > 0) {
          const practiceAttemptIds = practiceAttemptsRows.map((a) => a.id);

          const { data: pItems, error: pItemsErr } = await supabase
            .from("quiz_attempt_item")
            .select(
              `
              quiz_attempt_id,
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
                question_content:question_content (
                  points
                )
              )
            `
            )
            .in("quiz_attempt_id", practiceAttemptIds);
          if (pItemsErr) throw pItemsErr;
          practiceItemsData = pItems ?? [];
        }

        // 8️⃣ Practice average from profile (fallback)
        if (!practicePctProp) {
          const { data: profileRow, error: profileErr } = await supabase
            .from("student_pattern_learning_profile")
            .select("practice_quiz_average")
            .eq("student_id", studentId)
            .eq("pattern_id", patternId)
            .maybeSingle();
          if (profileErr) throw profileErr;
          if (profileRow?.practice_quiz_average != null) {
            setPracticePctDb(profileRow.practice_quiz_average);
          }
        }

        if (!mounted) return;
        setFinalItems(finalItemsData);
        setFinalSubmittedAt(finalSubmitted);
        setCheatAccesses(cheatCount);
        setPracticeAttemptsMeta(practiceAttemptsRows ?? []);
        setPracticeItems(practiceItemsData);
        setLoading(false);
      } catch (e: any) {
        if (!mounted) return;
        setLoadError(e?.message || String(e));
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [patternId, practicePctProp]);

  // ====================== Derived metrics ======================

  const {
    finalPct,
    timeSpent,
    finalBloomBuckets,
    finalSectionBuckets,
    finalTopicBuckets,
    totalQuestions,
    practiceOverallPct,
    practiceAttemptsCount,
    practiceBloomBuckets,
    practiceSectionBuckets,
    practiceTopicBuckets,
    bloomComparisonData,
    sectionComparisonData,
    practiceTimelineData,
  } = useMemo(() => {
    // No final items → everything zeroed out
    if (!finalItems.length) {
      return {
        finalPct: 0,
        timeSpent: 0,
        finalBloomBuckets: [] as CognitiveBucket[],
        finalSectionBuckets: [] as CognitiveBucket[],
        finalTopicBuckets: [] as CognitiveBucket[],
        totalQuestions: 0,
        practiceOverallPct: undefined as number | undefined,
        practiceAttemptsCount: 0,
        practiceBloomBuckets: [] as CognitiveBucket[],
        practiceSectionBuckets: [] as CognitiveBucket[],
        practiceTopicBuckets: [] as CognitiveBucket[],
        bloomComparisonData: [] as any[],
        sectionComparisonData: [] as any[],
        practiceTimelineData: [] as any[],
      };
    }

    // ---------- Final quiz aggregation (points-based) ----------
    let totalPoints = 0;
    let earnedPoints = 0;
    let timeSum = 0;

    const bloomMapFinal = new Map<string, { total: number; correct: number }>();
    const sectionMapFinal = new Map<string, { total: number; correct: number }>();
    const topicMapFinal = new Map<string, { total: number; correct: number }>();

    const ensure = (
      map: Map<string, { total: number; correct: number }>,
      key: string
    ) => {
      if (!map.has(key)) {
        map.set(key, { total: 0, correct: 0 });
      }
      return map.get(key)!;
    };

    finalItems.forEach((row: any) => {
      const q = row.question ?? null;
      const isCorrect = !!row.is_correct;
      const itemPoints = Number(q?.question_content?.points ?? 1);
      const pointsEarned = Number(row.points_earned ?? 0);
      const seconds = Number(row.time_spent_seconds ?? 0);

      totalPoints += itemPoints;
      earnedPoints += pointsEarned;
      timeSum += seconds;

      // Bloom
      const bloomLabel: string =
        (q?.bloom?.level as BloomLevel | undefined) ?? "Unknown";
      const b = ensure(bloomMapFinal, bloomLabel);
      b.total += 1;
      if (isCorrect) b.correct += 1;

      // Section
      const sectionLabel: string = q?.section?.section ?? "Unknown Section";
      const s = ensure(sectionMapFinal, sectionLabel);
      s.total += 1;
      if (isCorrect) s.correct += 1;

      // Topics (many-to-many)
      const topics = Array.isArray(q?.question_topic) ? q.question_topic : [];
      topics.forEach((t: any) => {
        const label: string = t?.learning_topic?.topic ?? "General";
        const tt = ensure(topicMapFinal, label);
        tt.total += 1;
        if (isCorrect) tt.correct += 1;
      });
    });

    const finalBloomBuckets: CognitiveBucket[] = Array.from(
      bloomMapFinal.entries()
    ).map(([label, v]) => ({
      label,
      score: pct(v.correct, v.total),
      questions: v.total,
    }));

    const finalSectionBuckets: CognitiveBucket[] = Array.from(
      sectionMapFinal.entries()
    ).map(([label, v]) => ({
      label,
      score: pct(v.correct, v.total),
      questions: v.total,
    }));

    const finalTopicBuckets: CognitiveBucket[] = Array.from(
      topicMapFinal.entries()
    ).map(([label, v]) => ({
      label,
      score: pct(v.correct, v.total),
      questions: v.total,
    }));

    const finalPct =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    // ---------- Practice quiz aggregation (question-count-based) ----------
    //  Score per attempt:
    //    score = (# items with points_earned > 0) / (total items) * 100
    const bloomMapPractice = new Map<string, { total: number; correct: number }>();
    const sectionMapPractice = new Map<
      string,
      { total: number; correct: number }
    >();
    const topicMapPractice = new Map<string, { total: number; correct: number }>();

    const perAttempt = new Map<
      string,
      { totalQuestions: number; correctQuestions: number }
    >();

    practiceItems.forEach((row: any) => {
      const q = row.question ?? null;
      const pointsEarned = Number(row.points_earned ?? 0);
      const gotPoints = pointsEarned > 0; // treat as "correct"
      const attemptId = String(row.quiz_attempt_id);

      // Per-attempt aggregation (count-based)
      if (!perAttempt.has(attemptId)) {
        perAttempt.set(attemptId, { totalQuestions: 0, correctQuestions: 0 });
      }
      const agg = perAttempt.get(attemptId)!;
      agg.totalQuestions += 1;
      if (gotPoints) agg.correctQuestions += 1;

      // Bloom
      const bloomLabel: string =
        (q?.bloom?.level as BloomLevel | undefined) ?? "Unknown";
      const b = ensure(bloomMapPractice, bloomLabel);
      b.total += 1;
      if (gotPoints) b.correct += 1;

      // Section
      const sectionLabel: string = q?.section?.section ?? "Unknown Section";
      const s = ensure(sectionMapPractice, sectionLabel);
      s.total += 1;
      if (gotPoints) s.correct += 1;

      // Topic
      const topics = Array.isArray(q?.question_topic) ? q.question_topic : [];
      topics.forEach((t: any) => {
        const label: string = t?.learning_topic?.topic ?? "General";
        const tt = ensure(topicMapPractice, label);
        tt.total += 1;
        if (gotPoints) tt.correct += 1;
      });
    });

    const practiceBloomBuckets: CognitiveBucket[] = Array.from(
      bloomMapPractice.entries()
    ).map(([label, v]) => ({
      label,
      score: pct(v.correct, v.total),
      questions: v.total,
    }));

    const practiceSectionBuckets: CognitiveBucket[] = Array.from(
      sectionMapPractice.entries()
    ).map(([label, v]) => ({
      label,
      score: pct(v.correct, v.total),
      questions: v.total,
    }));

    const practiceTopicBuckets: CognitiveBucket[] = Array.from(
      topicMapPractice.entries()
    ).map(([label, v]) => ({
      label,
      score: pct(v.correct, v.total),
      questions: v.total,
    }));

    // ---------- Practice attempt timeline + overall average ----------
    const practiceScores: number[] = [];
    const practiceTimelineData: {
      index: number;
      practiceBefore?: number | null;
      practiceAfter?: number | null;
      finalScore: number;
    }[] = [];

    const finalTime = finalSubmittedAt ? new Date(finalSubmittedAt).getTime() : null;

    (practiceAttemptsMeta ?? []).forEach((att, idx) => {
      const agg = perAttempt.get(String(att.id));
      if (!agg || agg.totalQuestions <= 0) return;

      const score = Math.round(
        (agg.correctQuestions / agg.totalQuestions) * 100
      );
      practiceScores.push(score);

      let practiceBefore: number | null | undefined = null;
      let practiceAfter: number | null | undefined = null;

      if (finalTime && att.submitted_at) {
        const t = new Date(att.submitted_at).getTime();
        if (t <= finalTime) {
          practiceBefore = score;
        } else {
          practiceAfter = score;
        }
      } else {
        // If final time missing, treat as "before"
        practiceBefore = score;
      }

      practiceTimelineData.push({
        index: idx + 1,
        practiceBefore,
        practiceAfter,
        finalScore: finalPct,
      });
    });

    const practiceAttemptsCount = practiceScores.length;
    const practiceOverallPct =
      practiceScores.length > 0
        ? Math.round(
            practiceScores.reduce((sum, v) => sum + v, 0) /
              practiceScores.length
          )
        : undefined;

    // ---------- Comparison data for bar charts ----------
    const bloomLabels = new Set<string>([
      ...finalBloomBuckets.map((b) => b.label),
      ...practiceBloomBuckets.map((b) => b.label),
    ]);

    const bloomComparisonData = Array.from(bloomLabels).map((label) => {
      const fb = finalBloomBuckets.find((b) => b.label === label);
      const pb = practiceBloomBuckets.find((b) => b.label === label);
      return {
        label,
        finalScore: fb?.score ?? 0,
        practiceScore: pb?.score ?? 0,
      };
    });

    const sectionLabels = new Set<string>([
      ...finalSectionBuckets.map((s) => s.label),
      ...practiceSectionBuckets.map((s) => s.label),
    ]);

    const sectionComparisonData = Array.from(sectionLabels).map((label) => {
      const fs = finalSectionBuckets.find((s) => s.label === label);
      const ps = practiceSectionBuckets.find((s) => s.label === label);
      return {
        label,
        finalScore: fs?.score ?? 0,
        practiceScore: ps?.score ?? 0,
      };
    });

    return {
      finalPct,
      timeSpent: timeSum,
      finalBloomBuckets,
      finalSectionBuckets,
      finalTopicBuckets,
      totalQuestions: finalItems.length,
      practiceOverallPct,
      practiceAttemptsCount,
      practiceBloomBuckets,
      practiceSectionBuckets,
      practiceTopicBuckets,
      bloomComparisonData,
      sectionComparisonData,
      practiceTimelineData,
    };
  }, [finalItems, practiceItems, practiceAttemptsMeta, finalSubmittedAt]);

  // Effective practice percentage: prefer computed average from attempts; fall back to profile
  const effectivePracticePct =
    typeof practiceOverallPct === "number"
      ? practiceOverallPct
      : practicePctFromProfile;

  const improvementPct =
    typeof effectivePracticePct === "number"
      ? finalPct - effectivePracticePct
      : undefined;

  const bloomLow = finalBloomBuckets.some(
    (b) => b.questions > 0 && b.score < 50 && b.label !== "Unknown"
  );
  const sectionLow = finalSectionBuckets.some(
    (s) => s.questions > 0 && s.score < 50 && s.label !== "Unknown Section"
  );

  const needsIntervention =
    bloomLow || sectionLow || cheatAccesses >= 20 || finalPct < 50;

  const status:
    | { kind: "fail"; title: string; msg: string; bg: string; icon: string }
    | { kind: "warn"; title: string; msg: string; bg: string; icon: string }
    | { kind: "pass"; title: string; msg: string; bg: string; icon: string } =
    finalPct < 50
      ? {
          kind: "fail",
          title: "Failed",
          msg: "You have not completed this pattern’s section; a retake is required.",
          bg: "bg-[#F2C7C7]",
          icon: "/icons/icon_two.svg",
        }
      : needsIntervention
      ? {
          kind: "warn",
          title: "CONGRATULATIONS!",
          msg: "You completed the module — some targeted intervention is recommended.",
          bg: "bg-[#FFFF00]/50",
          icon: "/icons/icon_one.svg",
        }
      : {
          kind: "pass",
          title: "CONGRATULATIONS!",
          msg: "You have successfully completed the module.",
          bg: "bg-[#C7DCF2]",
          icon: "/icons/icon_three.svg",
        };

  // -------------------- Recommendations --------------------

  const recommendations: Recommendation[] = useMemo(() => {
    const recs: Recommendation[] = [];

    if (finalPct < 50) {
      recs.push({
        title: "Primary Actions",
        bullets: [
          "Retake the module after revisiting the study material and practice quiz.",
          "Schedule a 30-minute revision focusing on the weakest Bloom levels and sections below.",
        ],
      });
    } else if (needsIntervention) {
      recs.push({
        title: "Primary Actions",
        bullets: [
          "You passed, but some areas need attention—target your weakest Bloom level and section.",
          "Do one applied coding task to consolidate learning (see tips below).",
        ],
      });
    } else {
      recs.push({
        title: "Primary Actions",
        bullets: [
          "Solid performance—maintain with spaced practice (2× 20-minute sessions this week).",
          "Try a project-level application (e.g., async or event-driven Observer usage).",
        ],
      });
    }

    if (cheatAccesses >= 20) {
      recs.push({
        title: "Cheat Sheet Usage",
        bullets: [
          "You relied heavily on the cheat sheet—try answering first, then checking the sheet.",
          "Use the sheet as a verification tool rather than a primary source during questions.",
        ],
      });
    }

    if (timeSpent < 20 * 60 && totalQuestions >= 10) {
      recs.push({
        title: "Pacing",
        bullets: [
          "Your time-on-task suggests rushing. Aim for at least 45–60 minutes on the full quiz.",
          "For code questions, walk through the update flow mentally before selecting an answer.",
        ],
      });
    }

    // Weakest Bloom + Section + Topic (based on FINAL quiz)
    const sortedBlooms = [...finalBloomBuckets]
      .filter((b) => b.questions > 0 && b.label !== "Unknown")
      .sort((a, b) => a.score - b.score);
    const sortedSections = [...finalSectionBuckets]
      .filter((s) => s.questions > 0 && s.label !== "Unknown Section")
      .sort((a, b) => a.score - b.score);
    const sortedTopics = [...finalTopicBuckets]
      .filter((t) => t.questions > 0)
      .sort((a, b) => a.score - b.score);

    const weakestBloom = sortedBlooms[0];
    const weakestSection = sortedSections[0];
    const weakestTopic = sortedTopics[0];

    if (weakestBloom || weakestSection || weakestTopic) {
      const bullets: string[] = [];
      if (weakestBloom) {
        bullets.push(
          `Focus on Bloom level "${weakestBloom.label}" (currently ${weakestBloom.score}%).`,
          ...makeLevelTip(weakestBloom.label as BloomLevel)
        );
      }
      if (weakestSection) {
        bullets.push(
          `Revisit the "${weakestSection.label}" section (currently ${weakestSection.score}%).`,
          "Redo questions in this section and explain each answer choice to yourself or a peer."
        );
      }
      if (weakestTopic) {
        bullets.push(
          `Strengthen topic: "${weakestTopic.label}" (currently ${weakestTopic.score}%).`,
          "Use the cheat sheet / notes to summarise this topic in your own words and create a small example."
        );
      }
      recs.push({
        title: "Targeted Skill Focus",
        bullets,
      });
    }

    if (typeof improvementPct === "number") {
      if (improvementPct >= 15) {
        recs.push({
          title: "Momentum",
          bullets: [
            `Great improvement (+${improvementPct}%). Keep this cadence: two short sessions this week focusing on application-level questions.`,
          ],
        });
      } else if (improvementPct < 0) {
        recs.push({
          title: "Course-correct",
          bullets: [
            `Your score dropped (${improvementPct}%). Revisit mis-answered items from the final quiz and repeat similar practice questions.`,
          ],
        });
      }
    }

    if (!recs.length) {
      recs.push({
        title: "Keep It Up",
        bullets: [
          "Maintain spaced practice and try a real-world refactor to the Observer pattern in a small codebase.",
        ],
      });
    }

    return recs;
  }, [
    finalPct,
    needsIntervention,
    cheatAccesses,
    timeSpent,
    totalQuestions,
    finalBloomBuckets,
    finalSectionBuckets,
    finalTopicBuckets,
    improvementPct,
  ]);

  // ====================== UI ======================

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-white">
        <Spinner />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen grid place-items-center bg-white p-6 text-red-600">
        Couldn’t load results: {loadError}
      </div>
    );
  }

  if (!finalItems.length) {
    return (
      <div className="min-h-screen grid place-items-center bg-white p-6 text-slate-600">
        No final quiz results found for this pattern.
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-white">
    <div className="px-4 sm:px-6 pb-8 max-w-7xl mx-auto pt-4">
      {/* Status Banner */}
      <Card className={`p-3 sm:p-4 border-2 sm:border-4 border-teal-700 ${status.bg} mb-6 sm:mb-8`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <h2
              className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 ${
                status.kind === "fail" ? "text-red-500" : "text-teal-700"
              }`}
            >
              {status.title}
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-800 font-semibold sm:font-bold">
              {status.msg}
            </p>
          </div>
          <div className="hidden md:flex flex-shrink-0">
            <img
              src={status.icon}
              alt="status"
              className="h-10 w-10 sm:h-12 sm:w-12"
            />
          </div>
        </div>
      </Card>

      {/* Top KPI cards - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
        {/* Final */}
        <div className="border-l-4 sm:border-l-8 border-teal-600 shadow-md rounded-lg bg-white p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-teal-700 font-medium">Final Quiz</p>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-teal-700 pt-2 sm:pt-4">
            {`${finalPct}%`}
          </div>
        </div>

        {/* Improvement */}
        <div className="border-l-4 sm:border-l-8 border-pink-500 shadow-md rounded-lg bg-white p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-pink-500 font-medium">Improvement</p>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold pt-2 sm:pt-4">
            {typeof effectivePracticePct === "number" ? (
              <span
                className={
                  (improvementPct ?? 0) >= 0 ? "text-green-600" : "text-red-600"
                }
              >
                {(improvementPct ?? 0) >= 0 ? "+" : ""}
                {improvementPct}%
              </span>
            ) : (
              <span className="text-slate-400">—</span>
            )}
          </div>
        </div>

        {/* Practice Average */}
        <div className="border-l-4 sm:border-l-8 border-green-500 shadow-md rounded-lg bg-white p-3 sm:p-4 col-span-2 sm:col-span-1">
          <p className="text-xs sm:text-sm text-green-500 font-medium">Practice Quiz Avg</p>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-500 pt-2">
            {typeof effectivePracticePct === "number"
              ? `${effectivePracticePct}%`
              : "—"}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-600 mt-1">
            {practiceAttemptsCount > 0
              ? `${practiceAttemptsCount} attempts`
              : "No attempts"}
          </p>
        </div>

        {/* Time Spent (Final) */}
        <div className="border-l-4 sm:border-l-8 border-blue-600 shadow-md rounded-lg bg-white p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-blue-600 font-medium">Time Spent</p>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 pt-2 sm:pt-4">
            {fmtHours(timeSpent)}
          </div>
        </div>

        {/* Cheat Sheet Accesses (Final) */}
        <div className="border-l-4 sm:border-l-8 border-purple-500 shadow-md rounded-lg bg-white p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-purple-500 font-medium">Cheat Access</p>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-500 pt-2 sm:pt-4">
            {`${cheatAccesses}x`}
          </div>
        </div>
      </div>

      {/* Practice vs Final comparison bar (overall) */}
      <Card className="p-4 sm:p-6 border-2 border-gray-200 mb-6 sm:mb-8 bg-white">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-teal-700 mb-3 sm:mb-4">
          Overall Practice vs Final Comparison
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <div className="flex justify-between mb-1 text-xs sm:text-sm font-medium">
              <span className="text-green-700">Practice Quiz Average</span>
              <span className="text-green-700">
                {typeof effectivePracticePct === "number"
                  ? `${effectivePracticePct}%`
                  : "—"}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
              <div
                className="h-2 sm:h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    typeof effectivePracticePct === "number"
                      ? effectivePracticePct
                      : 0
                  }%`,
                  backgroundColor: "#22C55E",
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1 text-xs sm:text-sm font-medium">
              <span className="text-teal-700">Final Quiz</span>
              <span className="text-teal-700">{finalPct}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
              <div
                className="h-2 sm:h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${finalPct}%`,
                  backgroundColor: "#0F766E",
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Practice timeline vs Final */}
      <Card className="p-4 sm:p-6 border-2 border-gray-200 mb-6 sm:mb-8 bg-white">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-teal-700 mb-3 sm:mb-4">
          Practice Timeline vs Final Quiz
        </h3>
        {practiceTimelineData.length === 0 ? (
          <p className="text-slate-600 text-xs sm:text-sm">
            No practice quiz attempts recorded for this pattern.
          </p>
        ) : (
          <div className="w-full" style={{ height: '300px', minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={practiceTimelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="index"
                  label={{
                    value: "Practice Attempt",
                    position: "insideBottom",
                    dy: 10,
                  }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  label={{
                    value: "Score (%)",
                    angle: -90,
                    position: "insideLeft",
                    dx: -5,
                  }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="practiceBefore"
                  name="Practice (before final)"
                  stroke="#22C55E"
                  dot
                />
                <Line
                  type="monotone"
                  dataKey="practiceAfter"
                  name="Practice (after final)"
                  stroke="#A855F7"
                  strokeDasharray="4 2"
                  dot
                />
                <Line
                  type="monotone"
                  dataKey="finalScore"
                  name="Final quiz score"
                  stroke="#0F766E"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <p className="text-[10px] sm:text-xs text-slate-600 mt-2">
          Each point represents a completed practice quiz. The final quiz score
          is shown as a reference line.
        </p>
      </Card>

      {/* Bloom + Section side-by-side comparison charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="p-4 sm:p-6 border-2 border-gray-300 bg-white">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-teal-700 mb-3">
            Bloom Level: Practice vs Final
          </h3>
          {bloomComparisonData.length === 0 ? (
            <p className="text-slate-600 text-xs sm:text-sm">
              No Bloom-level metadata available for these questions.
            </p>
          ) : (
            <div className="w-full" style={{ height: '300px', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bloomComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar
                    dataKey="practiceScore"
                    name="Practice avg (%)"
                    fill="#22C55E"
                  />
                  <Bar
                    dataKey="finalScore"
                    name="Final quiz (%)"
                    fill="#0F766E"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-4 sm:p-6 border-2 border-gray-300 bg-white">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-teal-700 mb-3">
            Section: Practice vs Final
          </h3>
          {sectionComparisonData.length === 0 ? (
            <p className="text-slate-600 text-xs sm:text-sm">
              No section metadata available for these questions.
            </p>
          ) : (
            <div className="w-full" style={{ height: '300px', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar
                    dataKey="practiceScore"
                    name="Practice avg (%)"
                    fill="#22C55E"
                  />
                  <Bar
                    dataKey="finalScore"
                    name="Final quiz (%)"
                    fill="#0F766E"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Topic summary (final quiz, textual) */}
      <Card className="p-4 sm:p-6 border-2 border-gray-200 mb-6 sm:mb-8 bg-white">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-teal-700 mb-3">
          Topic-Level Overview (Final Quiz)
        </h3>
        {finalTopicBuckets.length === 0 ? (
          <p className="text-slate-600 text-xs sm:text-sm">
            No topic metadata was linked to these questions.
          </p>
        ) : (
          <div className="space-y-2 text-xs sm:text-sm">
            {finalTopicBuckets
              .sort((a, b) => a.score - b.score)
              .map((t) => (
                <div
                  key={t.label}
                  className="flex items-center justify-between border-b border-slate-100 pb-1"
                >
                  <span className="font-medium text-slate-800 break-words pr-2">
                    {t.label}
                  </span>
                  <span className="text-slate-700 whitespace-nowrap">
                    {t.score}% ({t.questions} Q)
                  </span>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* Recommendations / Interventions */}
      <Card className="p-4 sm:p-6 bg-blue-100 mb-6 sm:mb-8">
        <h3 className="text-lg sm:text-xl font-bold text-teal-700 mb-3">
          Recommendations & Suggested Interventions
        </h3>
        <div className="space-y-4 sm:space-y-5">
          {recommendations.map((rec, i) => (
            <div key={`${rec.title}-${i}`}>
              <h4 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">
                {rec.title}
              </h4>
              <ul className="list-disc pl-4 sm:pl-5 text-gray-800 space-y-1 text-xs sm:text-sm">
                {rec.bullets.map((b, j) => (
                  <li key={j} className="break-words">{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Button
        onClick={onNext}
        className="w-full bg-teal-700 text-white hover:bg-teal-800 font-bold py-2.5 sm:py-3 rounded-lg text-base sm:text-lg"
      >
        Continue
      </Button>
    </div>
  </div>
);
};