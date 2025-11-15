import { supabase } from "@/lib/supebase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PostgrestError } from "@supabase/supabase-js";

export type ScoreDistributionItem = { range: string; count: number };
export type QuestionAccuracyItem = { question_id: string; correct: number; incorrect: number };
export type BloomRadarItem = { level: string; performance: number; coverage: number };
export type QuestionSectionItem = { section: string; bloom_level: string; difficulty: string; average_score: number };
export type QuestionsByBloomDifficultyItem = { bloom: string; Easy: number; Medium: number; Hard: number };
export type CombinedChartItem = QuestionSectionItem;
export type PracticeTrendItem = { attempt_no: number; avg_score: number };
export type PracticeVsFinalBloomItem = { bloom_level: string; practice_avg: number; final_avg: number };
export type PracticeDifficultyOverAttemptsItem = { attempt_no: number; difficulty: string; avg_score: number };
export type PracticeBloomOverAttemptsItem = { attempt_no: number; bloom_level: string; avg_score: number };
export type InterventionGraphItem = { rule_set_id: string; rule_set_name: string; students_flagged: number };

export type EducatorOverviewGraphData = {
  scoreDistribution: ScoreDistributionItem[];
  questionAccuracy: QuestionAccuracyItem[];
  bloomRadar: BloomRadarItem[];
  questionsByBloomDifficulty: QuestionsByBloomDifficultyItem[];
  questionSections: QuestionSectionItem[];
  combinedData: CombinedChartItem[];
  practiceTrend: PracticeTrendItem[];
  practiceVsFinalBloom: PracticeVsFinalBloomItem[];
  practiceDifficultyOverAttempts: PracticeDifficultyOverAttemptsItem[];
  practiceBloomOverAttempts: PracticeBloomOverAttemptsItem[];
  interventions: InterventionGraphItem[];
};

const mapError = (e: PostgrestError) => ({ status: e.code || "SUPABASE_ERROR", error: e.message });

export const educatorOverviewApi = createApi({
  reducerPath: "educatorOverviewApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["OverviewGraphs"],
  endpoints: (builder) => ({
    getGraphsData: builder.query<EducatorOverviewGraphData, void>({
      async queryFn() {
        try {
          // -----------------------------------------------------------
          // 1️⃣ Lookup Quiz Type IDs
          // -----------------------------------------------------------
          const { data: quizTypes, error: quizTypeError } = await supabase
            .from("quiz_type")
            .select("id, quiz_type");
          if (quizTypeError) return { error: mapError(quizTypeError) };

          const practiceTypeId = quizTypes?.find((t) => t.quiz_type === "Practice Quiz")?.id;
          const finalTypeId = quizTypes?.find((t) => t.quiz_type === "Final Quiz")?.id;
          if (!practiceTypeId || !finalTypeId) {
            return { error: { status: "MISSING_QUIZ_TYPES", error: "Practice Quiz or Final Quiz type not found" } };
          }

          // -----------------------------------------------------------
          // 2️⃣ Fetch Final Quiz Attempts (submitted only)
          // -----------------------------------------------------------
          const { data: finalAttempts, error: finalError } = await supabase
            .from("quiz_attempt")
            .select(`
              id,
              student_id,
              quiz_type_id,
              submitted_at,
              quiz_attempt_item(
                id,
                question_id,
                is_correct,
                question:question_id(
                  bloom_id(level),
                  difficulty_id(difficulty_level),
                  section_id(section)
                )
              )
            `)
            .eq("quiz_type_id", finalTypeId)
            .not("submitted_at", "is", null);
          if (finalError) return { error: mapError(finalError) };

          // -----------------------------------------------------------
          // Final Quiz Aggregations
          // -----------------------------------------------------------
          const scoreDistribution = Array.from({ length: 10 }, (_, i) => ({
            range: `${i * 10}-${(i + 1) * 10}%`,
            count: 0,
          }));

          const questionMap: Record<string, { correct: number; incorrect: number }> = {};
          const bloomPerformance: Record<string, { total: number; count: number }> = {};
          const bloomCoverage: Record<string, number> = {};
          const questionSections: QuestionSectionItem[] = [];

          (finalAttempts ?? []).forEach((attempt: any) => {
            let totalScore = 0;
            const items = attempt.quiz_attempt_item ?? [];

            items.forEach((item: any) => {
              const isCorrect = item.is_correct ? 100 : 0;
              totalScore += isCorrect;

              const qid = item.question_id;
              if (!questionMap[qid]) questionMap[qid] = { correct: 0, incorrect: 0 };
              item.is_correct ? questionMap[qid].correct++ : questionMap[qid].incorrect++;

              const bloom = item.question?.bloom_id?.level ?? "Unknown";
              if (!bloomPerformance[bloom]) bloomPerformance[bloom] = { total: 0, count: 0 };
              bloomPerformance[bloom].total += isCorrect;
              bloomPerformance[bloom].count++;

              const diff = item.question?.difficulty_id?.difficulty_level ?? "Medium";
              const section = item.question?.section_id?.section ?? "Unknown";

              questionSections.push({
                section,
                bloom_level: bloom,
                difficulty: diff,
                average_score: isCorrect,
              });

              bloomCoverage[bloom] = (bloomCoverage[bloom] ?? 0) + 1;
            });

            const avgScore = items.length > 0 ? totalScore / items.length : 0;
            const idx = Math.min(Math.floor(avgScore / 10), 9);
            scoreDistribution[idx].count++;
          });

          const sortedQids = Object.keys(questionMap).sort((a, b) => Number(a) - Number(b));
          const questionAccuracy: QuestionAccuracyItem[] = sortedQids.map((qid, index) => ({
            question_id: (index + 1).toString(),
            correct: questionMap[qid].correct,
            incorrect: questionMap[qid].incorrect,
          }));

          const bloomOrder = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
          const bloomRadar: BloomRadarItem[] = bloomOrder.map((lvl) => ({
            level: lvl,
            performance: bloomPerformance[lvl]?.count
              ? Math.round(bloomPerformance[lvl].total / bloomPerformance[lvl].count)
              : 0,
            coverage: bloomCoverage[lvl] ?? 0,
          }));

          // -----------------------------------------------------------
          // 3️⃣ Questions by Bloom & Difficulty (stacked bar)
          // -----------------------------------------------------------
          const { data: questionsRaw, error: questionsError } = await supabase
            .from("question")
            .select(`
              id,
              bloom_id(level),
              difficulty_id(difficulty_level)
            `)
            .eq("is_active", true);

          if (questionsError) return { error: mapError(questionsError) };

          const questionsByBloomDifficultyMap: Record<string, QuestionsByBloomDifficultyItem> = {};
          questionsRaw?.forEach((q: any) => {
            const bloom = q.bloom_id?.level ?? "Unknown";
            const difficulty = q.difficulty_id?.difficulty_level ?? "Medium";

            if (!questionsByBloomDifficultyMap[bloom]) {
              questionsByBloomDifficultyMap[bloom] = { bloom, Easy: 0, Medium: 0, Hard: 0 };
            }

            questionsByBloomDifficultyMap[bloom][difficulty as "Easy" | "Medium" | "Hard"]++;
          });

          const questionsByBloomDifficulty = Object.values(questionsByBloomDifficultyMap).sort((a, b) =>
            a.bloom.localeCompare(b.bloom)
          );

          const combinedData = [...questionSections];

          // -----------------------------------------------------------
          // 4️⃣ Practice & Intervention Data (unchanged)
          // -----------------------------------------------------------
          const { data: practiceAttemptsRaw, error: practiceError } = await supabase
            .from("quiz_attempt")
            .select(`
              id,
              student_id,
              quiz_type_id,
              started_at,
              submitted_at,
              quiz_attempt_item(
                id,
                is_correct,
                question:question_id(
                  bloom_id(level),
                  difficulty_id(difficulty_level)
                )
              )
            `)
            .eq("quiz_type_id", practiceTypeId)
            .not("submitted_at", "is", null)
            .order("student_id", { ascending: true })
            .order("started_at", { ascending: true });

          if (practiceError) console.warn("Practice fetch error:", practiceError.message);

          // Map attempts per student
          const studentMap: Record<string, any[]> = {};
          (practiceAttemptsRaw ?? []).forEach((attempt) => {
            if (!studentMap[attempt.student_id]) studentMap[attempt.student_id] = [];
            studentMap[attempt.student_id].push(attempt);
          });

          const practiceAttempts: any[] = [];
          Object.values(studentMap).forEach((attempts: any[]) => {
            attempts.forEach((a, idx) => {
              practiceAttempts.push({ ...a, attempt_no: idx + 1 });
            });
          });

          const attemptMap: Record<number, { total: number; count: number }> = {};
          const diffAttemptMap: Record<string, { total: number; count: number }> = {};
          const bloomAttemptMap: Record<string, { total: number; count: number }> = {};

          practiceAttempts.forEach((attempt) => {
            const attempt_no = attempt.attempt_no;
            const items = attempt.quiz_attempt_item ?? [];

            items.forEach((item: any) => {
              const isCorrect = item.is_correct ? 100 : 0;

              if (!attemptMap[attempt_no]) attemptMap[attempt_no] = { total: 0, count: 0 };
              attemptMap[attempt_no].total += isCorrect;
              attemptMap[attempt_no].count++;

              const diff = item.question?.difficulty_id?.difficulty_level ?? "Medium";
              const diffKey = `${attempt_no}|||${diff}`;
              if (!diffAttemptMap[diffKey]) diffAttemptMap[diffKey] = { total: 0, count: 0 };
              diffAttemptMap[diffKey].total += isCorrect;
              diffAttemptMap[diffKey].count++;

              const bloom = item.question?.bloom_id?.level ?? "Unknown";
              const bloomKey = `${attempt_no}|||${bloom}`;
              if (!bloomAttemptMap[bloomKey]) bloomAttemptMap[bloomKey] = { total: 0, count: 0 };
              bloomAttemptMap[bloomKey].total += isCorrect;
              bloomAttemptMap[bloomKey].count++;
            });
          });

          const practiceTrend = Object.entries(attemptMap).map(([attempt_no, v]) => ({
            attempt_no: Number(attempt_no),
            avg_score: Math.round(v.total / v.count),
          }));

          const practiceDifficultyOverAttempts = Object.entries(diffAttemptMap).map(([key, v]) => {
            const [attempt_noStr, difficulty] = key.split("|||");
            return {
              attempt_no: Number(attempt_noStr),
              difficulty,
              avg_score: Math.round(v.total / v.count),
            };
          });

          const practiceBloomOverAttempts = Object.entries(bloomAttemptMap).map(([key, v]) => {
            const [attempt_noStr, bloom_level] = key.split("|||");
            return {
              attempt_no: Number(attempt_noStr),
              bloom_level,
              avg_score: Math.round(v.total / v.count),
            };
          });

          const practiceBloomMap: Record<string, { total: number; count: number }> = {};
          practiceAttempts.forEach((attempt) => {
            attempt.quiz_attempt_item?.forEach((item: any) => {
              const bloom = item.question?.bloom_id?.level ?? "Unknown";
              if (!practiceBloomMap[bloom]) practiceBloomMap[bloom] = { total: 0, count: 0 };
              practiceBloomMap[bloom].total += item.is_correct ? 100 : 0;
              practiceBloomMap[bloom].count++;
            });
          });

          const practiceVsFinalBloom: PracticeVsFinalBloomItem[] = bloomOrder.map((lvl) => ({
            bloom_level: lvl,
            practice_avg: practiceBloomMap[lvl]?.count
              ? Math.round(practiceBloomMap[lvl].total / practiceBloomMap[lvl].count)
              : 0,
            final_avg: bloomPerformance[lvl]?.count
              ? Math.round(bloomPerformance[lvl].total / bloomPerformance[lvl].count)
              : 0,
          }));

          // -----------------------------------------------------------
          // 5️⃣ Intervention Rule Set Flags
          // -----------------------------------------------------------
          const { data: interventionRaw, error: interventionError } = await supabase
            .from("intervention_trigger_log")
            .select(`
                rule_set_id,
                intervention_rule_set:rule_set_id(name),
                learning_profile_id,
                student:learning_profile_id(student_id)
              `);

          if (interventionError) return { error: mapError(interventionError) };

          const interventionMap: Record<string, { rule_set_name: string; students: Set<string> }> = {};
          interventionRaw?.forEach((entry) => {
            const ruleSetId = entry.rule_set_id;
            const studentId = entry.student?.student_id;

            if (!interventionMap[ruleSetId]) {
              interventionMap[ruleSetId] = {
                rule_set_name: entry.intervention_rule_set?.name ?? "Unknown Rule Set",
                students: new Set<string>(),
              };
            }

            if (studentId) interventionMap[ruleSetId].students.add(studentId);
          });

          const interventions = Object.entries(interventionMap)
            .map(([rule_set_id, { rule_set_name, students }]) => ({
              rule_set_id,
              rule_set_name,
              students_flagged: students.size,
            }))
            .sort((a, b) => b.students_flagged - a.students_flagged);

          return {
            data: {
              scoreDistribution,
              questionAccuracy,
              bloomRadar,
              questionsByBloomDifficulty,
              questionSections,
              combinedData,
              practiceTrend,
              practiceVsFinalBloom,
              practiceDifficultyOverAttempts,
              practiceBloomOverAttempts,
              interventions,
            },
          };
        } catch (err: any) {
          console.error("Educator Overview Fetch Error:", err);
          return { error: { status: "UNKNOWN_ERROR", error: err?.message ?? String(err) } };
        }
      },
      providesTags: [{ type: "OverviewGraphs", id: "LIST" }],
    }),
  }),
});

export const { useGetGraphsDataQuery } = educatorOverviewApi;
