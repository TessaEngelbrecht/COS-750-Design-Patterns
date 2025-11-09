import { supabase } from "@/lib/supebase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PostgrestError } from "@supabase/supabase-js";

export type ScoreDistributionItem = { range: string; count: number };
export type QuestionAccuracyItem = { question_id: number; correct: number; incorrect: number };
export type BloomRadarItem = {
  level: "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create";
  performance: number; // avg student score (%)
  coverage: number; // % of total questions
};
export type QuestionSectionItem = {
  section: string;
  bloom_level: string;
  difficulty: string;
  average_score: number;
};
export type QuestionsByBloomDifficultyItem = { bloom: string; Easy: number; Medium: number; Hard: number };
export type CombinedChartItem = { section: string; bloom_level: string; difficulty: string; average_score: number };

export type PracticeTrendItem = { attempt_no: number; avg_score: number };
export type PracticeVsFinalBloomItem = { bloom_level: string; practice_avg: number; final_avg: number };
export type PracticeDifficultyOverAttemptsItem = { attempt_no: number; difficulty: string; avg_score: number };
export type PracticeBloomOverAttemptsItem = { attempt_no: number; bloom_level: string; avg_score: number };

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

          const { data: scores, error: scoreError } = await supabase
            .from("student_performance_summary")
            .select("final_quiz_score");
          if (scoreError) return { error: mapError(scoreError) };

          const scoreDistribution: ScoreDistributionItem[] = Array.from({ length: 10 }, (_, i) => ({
            range: `${i * 10}-${(i + 1) * 10}%`,
            count: 0,
          }));
          (scores ?? []).forEach((r: any) => {
            const s = Number(r.final_quiz_score ?? 0);
            const idx = Math.min(Math.floor(s / 10), 9);
            scoreDistribution[idx].count += 1;
          });

          const { data: finalResults, error: finalResultsError } = await supabase
            .from("final_quiz_results")
            .select("question_id,is_correct");
          if (finalResultsError) return { error: mapError(finalResultsError) };

          const questionMap: Record<number, { correct: number; incorrect: number }> = {};
          (finalResults ?? []).forEach((r: any) => {
            const qid = Number(r.question_id);
            if (!questionMap[qid]) questionMap[qid] = { correct: 0, incorrect: 0 };
            if (r.is_correct) questionMap[qid].correct++;
            else questionMap[qid].incorrect++;
          });
          const questionAccuracy: QuestionAccuracyItem[] = Object.entries(questionMap).map(([qid, val]) => ({
            question_id: Number(qid),
            correct: val.correct,
            incorrect: val.incorrect,
          }));

          const { data: bloomScoresRows, error: bloomScoresError } = await supabase
            .from("student_performance_summary")
            .select("bloom_scores");
          if (bloomScoresError) return { error: mapError(bloomScoresError) };

          const performanceMap: Record<string, { total: number; count: number }> = {};
          (bloomScoresRows ?? []).forEach((r: any) => {
            const bloomObj = r.bloom_scores ?? {};
            if (bloomObj && typeof bloomObj === "object") {
              Object.entries(bloomObj).forEach(([lvl, val]) => {
                const num = Number(val);
                if (!Number.isFinite(num)) return;
                if (!performanceMap[lvl]) performanceMap[lvl] = { total: 0, count: 0 };
                performanceMap[lvl].total += num;
                performanceMap[lvl].count++;
              });
            }
          });
          const avgPerformance: Record<string, number> = {};
          Object.entries(performanceMap).forEach(([lvl, v]) => {
            avgPerformance[lvl] = v.count > 0 ? Math.round(v.total / v.count) : 0;
          });

          const { data: questionBloomRows, error: questionBloomError } = await supabase
            .from("final_quiz_questions")
            .select("bloom_level");
          if (questionBloomError) return { error: mapError(questionBloomError) };

          const coverageMap: Record<string, number> = {};
          const totalFinalQuestions = (questionBloomRows ?? []).length;
          (questionBloomRows ?? []).forEach((r: any) => {
            const lvl = r.bloom_level ?? "Unknown";
            coverageMap[lvl] = (coverageMap[lvl] ?? 0) + 1;
          });
          Object.keys(coverageMap).forEach((k) => {
            coverageMap[k] = totalFinalQuestions > 0 ? Math.round((coverageMap[k] / totalFinalQuestions) * 100) : 0;
          });

          const bloomOrder = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
          const bloomRadar: BloomRadarItem[] = bloomOrder.map((lvl) => ({
            level: lvl as BloomRadarItem["level"],
            performance: avgPerformance[lvl] ?? 0,
            coverage: coverageMap[lvl] ?? 0,
          }));

          const { data: finalQuestions, error: finalQuestionsError } = await supabase
            .from("final_quiz_questions")
            .select("question_id,section,bloom_level,difficulty_level");
          if (finalQuestionsError) return { error: mapError(finalQuestionsError) };

          const qScoreMap: Record<number, { total: number; count: number }> = {};
          (finalResults ?? []).forEach((r: any) => {
            const qid = Number(r.question_id);
            if (!qScoreMap[qid]) qScoreMap[qid] = { total: 0, count: 0 };
            qScoreMap[qid].total += r.is_correct ? 100 : 0;
            qScoreMap[qid].count++;
          });

          const questionSections: QuestionSectionItem[] = (finalQuestions ?? []).map((q: any) => {
            const avgData = qScoreMap[Number(q.question_id)];
            const avg = avgData && avgData.count > 0 ? Math.round(avgData.total / avgData.count) : 0;
            return {
              section: q.section ?? "Unknown",
              bloom_level: q.bloom_level ?? "Unknown",
              difficulty: q.difficulty_level ?? "Medium",
              average_score: avg,
            };
          });

          const qByBloomDiffMap: Record<string, QuestionsByBloomDifficultyItem> = {};
          questionSections.forEach((q) => {
            const bloom = q.bloom_level ?? "Unknown";
            if (!qByBloomDiffMap[bloom]) qByBloomDiffMap[bloom] = { bloom, Easy: 0, Medium: 0, Hard: 0 };
            const diffKey = (q.difficulty as "Easy" | "Medium" | "Hard") ?? "Medium";
            qByBloomDiffMap[bloom][diffKey] += 1;
          });
          const questionsByBloomDifficulty = Object.values(qByBloomDiffMap);

          const combinedData: CombinedChartItem[] = questionSections.map((q) => ({
            section: q.section,
            bloom_level: q.bloom_level,
            difficulty: q.difficulty,
            average_score: q.average_score,
          }));

          const { data: practiceRows, error: practiceError } = await supabase
            .from("practice_quiz_results")
            .select(`
              student_id,
              attempt_number,
              is_correct,
              question_id,
              practice_quiz_questions (
                bloom_level,
                difficulty_level
              )
            `)
            .order("attempt_number", { ascending: true });

          if (practiceError) console.warn("practice fetch warning:", practiceError.message);

          const attemptMap: Record<number, { total: number; count: number }> = {};
          const diffAttemptMap: Record<string, { total: number; count: number }> = {};
          const bloomAttemptMap: Record<string, { total: number; count: number }> = {};

          (practiceRows ?? []).forEach((p: any) => {
            const attempt = Number(p.attempt_number ?? 1);
            const isCorrect = Boolean(p.is_correct);
            const bloomLevel = p.practice_quiz_questions?.bloom_level ?? "Unknown";
            const difficulty = p.practice_quiz_questions?.difficulty_level ?? "Medium";

            if (!attemptMap[attempt]) attemptMap[attempt] = { total: 0, count: 0 };
            attemptMap[attempt].total += isCorrect ? 100 : 0;
            attemptMap[attempt].count++;

            const diffKey = `${attempt}|||${difficulty}`;
            if (!diffAttemptMap[diffKey]) diffAttemptMap[diffKey] = { total: 0, count: 0 };
            diffAttemptMap[diffKey].total += isCorrect ? 100 : 0;
            diffAttemptMap[diffKey].count++;

            const bloomKey = `${attempt}|||${bloomLevel}`;
            if (!bloomAttemptMap[bloomKey]) bloomAttemptMap[bloomKey] = { total: 0, count: 0 };
            bloomAttemptMap[bloomKey].total += isCorrect ? 100 : 0;
            bloomAttemptMap[bloomKey].count++;
          });

          const practiceTrend: PracticeTrendItem[] = Object.entries(attemptMap)
            .map(([attempt_no, v]) => ({
              attempt_no: Number(attempt_no),
              avg_score: v.count > 0 ? Math.round(v.total / v.count) : 0,
            }))
            .sort((a, b) => a.attempt_no - b.attempt_no);

          const practiceDifficultyOverAttempts: PracticeDifficultyOverAttemptsItem[] = Object.entries(diffAttemptMap)
            .map(([k, v]) => {
              const [attempt_noStr, difficulty] = k.split("|||");
              return {
                attempt_no: Number(attempt_noStr),
                difficulty,
                avg_score: v.count > 0 ? Math.round(v.total / v.count) : 0,
              };
            })
            .sort((a, b) => a.attempt_no - b.attempt_no);

          const practiceBloomOverAttempts: PracticeBloomOverAttemptsItem[] = Object.entries(bloomAttemptMap)
            .map(([k, v]) => {
              const [attempt_noStr, bloom_level] = k.split("|||");
              return {
                attempt_no: Number(attempt_noStr),
                bloom_level,
                avg_score: v.count > 0 ? Math.round(v.total / v.count) : 0,
              };
            })
            .sort((a, b) => a.attempt_no - b.attempt_no);

          const practiceBloomMap: Record<string, { total: number; count: number }> = {};
          (practiceRows ?? []).forEach((p: any) => {
            const bloomLevel = p.practice_quiz_questions?.bloom_level ?? "Unknown";
            if (!practiceBloomMap[bloomLevel]) practiceBloomMap[bloomLevel] = { total: 0, count: 0 };
            practiceBloomMap[bloomLevel].total += p.is_correct ? 100 : 0;
            practiceBloomMap[bloomLevel].count++;
          });

          const practiceVsFinalBloom: PracticeVsFinalBloomItem[] = bloomOrder.map((lvl) => ({
            bloom_level: lvl,
            practice_avg: practiceBloomMap[lvl]?.count ? Math.round(practiceBloomMap[lvl].total / practiceBloomMap[lvl].count) : 0,
            final_avg: avgPerformance[lvl] ?? 0,
          }));

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
            },
          };
        } catch (err: any) {
          console.error("Educator Overview Fetch Error:", err);
          return { error: { status: "UNKNOWN_ERROR", error: String(err?.message ?? err) } };
        }
      },
      providesTags: [{ type: "OverviewGraphs", id: "LIST" }],
    }),
  }),
});

export const { useGetGraphsDataQuery } = educatorOverviewApi;
