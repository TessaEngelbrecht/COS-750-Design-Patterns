import { supabase } from "@/lib/supebase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PostgrestError } from "@supabase/supabase-js";

export type ScoreDistributionItem = {
  range: string;
  count: number;
};

export type QuestionAccuracyItem = {
  question_id: number;
  correct: number;
  incorrect: number;
};

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

export type QuestionsByBloomDifficultyItem = {
  bloom: string;
  Easy: number;
  Medium: number;
  Hard: number;
};

export type CombinedChartItem = {
  section: string;
  bloom_level: string;
  difficulty: string;
  average_score: number;
};

export type EducatorOverviewGraphData = {
  scoreDistribution: ScoreDistributionItem[];
  questionAccuracy: QuestionAccuracyItem[];
  bloomRadar: BloomRadarItem[];
  questionsByBloomDifficulty: QuestionsByBloomDifficultyItem[];
  questionSections: QuestionSectionItem[];
  combinedData: CombinedChartItem[];
};

const mapError = (e: PostgrestError) => ({
  status: e.code || "SUPABASE_ERROR",
  error: e.message,
});

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

          const scoreDistribution: ScoreDistributionItem[] = Array.from(
            { length: 10 },
            (_, i) => ({ range: `${i * 10}-${(i + 1) * 10}%`, count: 0 })
          );

          (scores ?? []).forEach((row: any) => {
            const score = row.final_quiz_score ?? 0;
            const index = Math.min(Math.floor(score / 10), 9);
            scoreDistribution[index].count += 1;
          });

          const { data: results, error: resultsError } = await supabase
            .from("final_quiz_results")
            .select("question_id,is_correct");
          if (resultsError) return { error: mapError(resultsError) };

          const questionMap: Record<number, { correct: number; incorrect: number }> = {};
          (results ?? []).forEach((row: any) => {
            if (!questionMap[row.question_id]) questionMap[row.question_id] = { correct: 0, incorrect: 0 };
            if (row.is_correct) questionMap[row.question_id].correct += 1;
            else questionMap[row.question_id].incorrect += 1;
          });

          const questionAccuracy: QuestionAccuracyItem[] = Object.entries(questionMap).map(
            ([question_id, val]) => ({
              question_id: parseInt(question_id),
              correct: val.correct,
              incorrect: val.incorrect,
            })
          );

          const { data: bloomScores, error: bloomError } = await supabase
            .from("student_performance_summary")
            .select("bloom_scores");
          if (bloomError) return { error: mapError(bloomError) };

          const performanceMap: Record<string, { total: number; count: number }> = {};
          (bloomScores ?? []).forEach((row: any) => {
            const bloom = row.bloom_scores ?? {};
            Object.entries(bloom).forEach(([level, val]: [string, any]) => {
              if (val === null || typeof val !== "number") return;
              if (!performanceMap[level]) performanceMap[level] = { total: 0, count: 0 };
              performanceMap[level].total += val;
              performanceMap[level].count += 1;
            });
          });

          const avgPerformance: Record<string, number> = {};
          Object.entries(performanceMap).forEach(([level, val]) => {
            avgPerformance[level] = val.count > 0 ? Math.round(val.total / val.count) : 0;
          });

          const { data: questionBloom, error: questionBloomError } = await supabase
            .from("final_quiz_questions")
            .select("bloom_level");
          if (questionBloomError) return { error: mapError(questionBloomError) };

          const coverageMap: Record<string, number> = {};
          const totalQuestions = (questionBloom ?? []).length;
          (questionBloom ?? []).forEach((row: any) => {
            const level = row.bloom_level;
            if (!coverageMap[level]) coverageMap[level] = 0;
            coverageMap[level] += 1;
          });
          Object.keys(coverageMap).forEach((level) => {
            coverageMap[level] = totalQuestions
              ? Math.round((coverageMap[level] / totalQuestions) * 100)
              : 0;
          });

          const bloomOrder = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
          const bloomRadar: BloomRadarItem[] = bloomOrder.map((level) => ({
            level: level as BloomRadarItem["level"],
            performance: avgPerformance[level] ?? 0,
            coverage: coverageMap[level] ?? 0,
          }));

          const { data: questions, error: questionsError } = await supabase
            .from("final_quiz_questions")
            .select("question_id,section,bloom_level,difficulty_level");
          if (questionsError) return { error: mapError(questionsError) };

          const questionScoreMap: Record<number, { total: number; count: number }> = {};
          (results ?? []).forEach((row: any) => {
            if (!questionScoreMap[row.question_id])
              questionScoreMap[row.question_id] = { total: 0, count: 0 };
            questionScoreMap[row.question_id].total += row.is_correct ? 100 : 0;
            questionScoreMap[row.question_id].count += 1;
          });

          const questionSections: QuestionSectionItem[] = (questions ?? []).map((q: any) => {
            const avgScoreData = questionScoreMap[q.question_id];
            const average_score =
              avgScoreData && avgScoreData.count > 0
                ? Math.round(avgScoreData.total / avgScoreData.count)
                : 0;
            return {
              section: q.section ?? "Unknown",
              bloom_level: q.bloom_level ?? "Unknown",
              difficulty: q.difficulty_level ?? "Medium",
              average_score,
            };
          });

          // Questions by Bloom + Difficulty
          const questionsByBloomDifficultyMap: Record<string, QuestionsByBloomDifficultyItem> = {};
          questionSections.forEach((q) => {
            if (!questionsByBloomDifficultyMap[q.bloom_level]) {
              questionsByBloomDifficultyMap[q.bloom_level] = { bloom: q.bloom_level, Easy: 0, Medium: 0, Hard: 0 };
            }
            const diff = q.difficulty as keyof Omit<QuestionsByBloomDifficultyItem, "bloom">;
            questionsByBloomDifficultyMap[q.bloom_level][diff] += 1;
          });
          const questionsByBloomDifficulty = Object.values(questionsByBloomDifficultyMap);

          // Combined chart data (for table or other graphs)
          const combinedData: CombinedChartItem[] = questionSections.map((q) => ({
            section: q.section,
            bloom_level: q.bloom_level,
            difficulty: q.difficulty,
            average_score: q.average_score,
          }));

          return {
            data: { scoreDistribution, questionAccuracy, bloomRadar, questionsByBloomDifficulty, questionSections, combinedData },
          };
        } catch (err) {
          console.error("Educator Overview Fetch Error:", err);
          return { error: { status: "UNKNOWN_ERROR", error: "Failed to fetch graphs data" } };
        }
      },
      providesTags: [{ type: "OverviewGraphs", id: "LIST" }],
    }),
  }),
});

export const { useGetGraphsDataQuery } = educatorOverviewApi;
