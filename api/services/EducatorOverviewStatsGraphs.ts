// import { supabase } from "@/lib/supebase";
// import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
// import type { PostgrestError } from "@supabase/supabase-js";

// export type ScoreDistributionItem = { range: string; count: number };
// export type QuestionAccuracyItem = { question_id: number; correct: number; incorrect: number };
// export type BloomRadarItem = {
//   level: "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create";
//   performance: number; // avg student score (%)
//   coverage: number; // % of total questions
// };
// export type QuestionSectionItem = {
//   section: string;
//   bloom_level: string;
//   difficulty: string;
//   average_score: number;
// };
// export type QuestionsByBloomDifficultyItem = { bloom: string; Easy: number; Medium: number; Hard: number };
// export type CombinedChartItem = { section: string; bloom_level: string; difficulty: string; average_score: number };

// export type PracticeTrendItem = { attempt_no: number; avg_score: number };
// export type PracticeVsFinalBloomItem = { bloom_level: string; practice_avg: number; final_avg: number };
// export type PracticeDifficultyOverAttemptsItem = { attempt_no: number; difficulty: string; avg_score: number };
// export type PracticeBloomOverAttemptsItem = { attempt_no: number; bloom_level: string; avg_score: number };

// export type EducatorOverviewGraphData = {
//   scoreDistribution: ScoreDistributionItem[];
//   questionAccuracy: QuestionAccuracyItem[];
//   bloomRadar: BloomRadarItem[];
//   questionsByBloomDifficulty: QuestionsByBloomDifficultyItem[];
//   questionSections: QuestionSectionItem[];
//   combinedData: CombinedChartItem[];
//   practiceTrend: PracticeTrendItem[];
//   practiceVsFinalBloom: PracticeVsFinalBloomItem[];
//   practiceDifficultyOverAttempts: PracticeDifficultyOverAttemptsItem[];
//   practiceBloomOverAttempts: PracticeBloomOverAttemptsItem[];
// };

// const mapError = (e: PostgrestError) => ({ status: e.code || "SUPABASE_ERROR", error: e.message });

// export const educatorOverviewApi = createApi({
//   reducerPath: "educatorOverviewApi",
//   baseQuery: fakeBaseQuery(),
//   tagTypes: ["OverviewGraphs"],
//   endpoints: (builder) => ({
//     getGraphsData: builder.query<EducatorOverviewGraphData, void>({
//       async queryFn() {
//         try {

//           const { data: scores, error: scoreError } = await supabase
//             .from("student_performance_summary")
//             .select("final_quiz_score");
//           if (scoreError) return { error: mapError(scoreError) };

//           const scoreDistribution: ScoreDistributionItem[] = Array.from({ length: 10 }, (_, i) => ({
//             range: `${i * 10}-${(i + 1) * 10}%`,
//             count: 0,
//           }));
//           (scores ?? []).forEach((r: any) => {
//             const s = Number(r.final_quiz_score ?? 0);
//             const idx = Math.min(Math.floor(s / 10), 9);
//             scoreDistribution[idx].count += 1;
//           });

//           const { data: finalResults, error: finalResultsError } = await supabase
//             .from("final_quiz_results")
//             .select("question_id,is_correct");
//           if (finalResultsError) return { error: mapError(finalResultsError) };

//           const questionMap: Record<number, { correct: number; incorrect: number }> = {};
//           (finalResults ?? []).forEach((r: any) => {
//             const qid = Number(r.question_id);
//             if (!questionMap[qid]) questionMap[qid] = { correct: 0, incorrect: 0 };
//             if (r.is_correct) questionMap[qid].correct++;
//             else questionMap[qid].incorrect++;
//           });
//           const questionAccuracy: QuestionAccuracyItem[] = Object.entries(questionMap).map(([qid, val]) => ({
//             question_id: Number(qid),
//             correct: val.correct,
//             incorrect: val.incorrect,
//           }));

//           const { data: bloomScoresRows, error: bloomScoresError } = await supabase
//             .from("student_performance_summary")
//             .select("bloom_scores");
//           if (bloomScoresError) return { error: mapError(bloomScoresError) };

//           const performanceMap: Record<string, { total: number; count: number }> = {};
//           (bloomScoresRows ?? []).forEach((r: any) => {
//             const bloomObj = r.bloom_scores ?? {};
//             if (bloomObj && typeof bloomObj === "object") {
//               Object.entries(bloomObj).forEach(([lvl, val]) => {
//                 const num = Number(val);
//                 if (!Number.isFinite(num)) return;
//                 if (!performanceMap[lvl]) performanceMap[lvl] = { total: 0, count: 0 };
//                 performanceMap[lvl].total += num;
//                 performanceMap[lvl].count++;
//               });
//             }
//           });
//           const avgPerformance: Record<string, number> = {};
//           Object.entries(performanceMap).forEach(([lvl, v]) => {
//             avgPerformance[lvl] = v.count > 0 ? Math.round(v.total / v.count) : 0;
//           });

//           const { data: questionBloomRows, error: questionBloomError } = await supabase
//             .from("final_quiz_questions")
//             .select("bloom_level");
//           if (questionBloomError) return { error: mapError(questionBloomError) };

//           const coverageMap: Record<string, number> = {};
//           const totalFinalQuestions = (questionBloomRows ?? []).length;
//           (questionBloomRows ?? []).forEach((r: any) => {
//             const lvl = r.bloom_level ?? "Unknown";
//             coverageMap[lvl] = (coverageMap[lvl] ?? 0) + 1;
//           });
//           Object.keys(coverageMap).forEach((k) => {
//             coverageMap[k] = totalFinalQuestions > 0 ? Math.round((coverageMap[k] / totalFinalQuestions) * 100) : 0;
//           });

//           const bloomOrder = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
//           const bloomRadar: BloomRadarItem[] = bloomOrder.map((lvl) => ({
//             level: lvl as BloomRadarItem["level"],
//             performance: avgPerformance[lvl] ?? 0,
//             coverage: coverageMap[lvl] ?? 0,
//           }));

//           const { data: finalQuestions, error: finalQuestionsError } = await supabase
//             .from("final_quiz_questions")
//             .select("question_id,section,bloom_level,difficulty_level");
//           if (finalQuestionsError) return { error: mapError(finalQuestionsError) };

//           const qScoreMap: Record<number, { total: number; count: number }> = {};
//           (finalResults ?? []).forEach((r: any) => {
//             const qid = Number(r.question_id);
//             if (!qScoreMap[qid]) qScoreMap[qid] = { total: 0, count: 0 };
//             qScoreMap[qid].total += r.is_correct ? 100 : 0;
//             qScoreMap[qid].count++;
//           });

//           const questionSections: QuestionSectionItem[] = (finalQuestions ?? []).map((q: any) => {
//             const avgData = qScoreMap[Number(q.question_id)];
//             const avg = avgData && avgData.count > 0 ? Math.round(avgData.total / avgData.count) : 0;
//             return {
//               section: q.section ?? "Unknown",
//               bloom_level: q.bloom_level ?? "Unknown",
//               difficulty: q.difficulty_level ?? "Medium",
//               average_score: avg,
//             };
//           });

//           const qByBloomDiffMap: Record<string, QuestionsByBloomDifficultyItem> = {};
//           questionSections.forEach((q) => {
//             const bloom = q.bloom_level ?? "Unknown";
//             if (!qByBloomDiffMap[bloom]) qByBloomDiffMap[bloom] = { bloom, Easy: 0, Medium: 0, Hard: 0 };
//             const diffKey = (q.difficulty as "Easy" | "Medium" | "Hard") ?? "Medium";
//             qByBloomDiffMap[bloom][diffKey] += 1;
//           });
//           const questionsByBloomDifficulty = Object.values(qByBloomDiffMap);

//           const combinedData: CombinedChartItem[] = questionSections.map((q) => ({
//             section: q.section,
//             bloom_level: q.bloom_level,
//             difficulty: q.difficulty,
//             average_score: q.average_score,
//           }));

//           const { data: practiceRows, error: practiceError } = await supabase
//             .from("practice_quiz_results")
//             .select(`
//               student_id,
//               attempt_number,
//               is_correct,
//               question_id,
//               practice_quiz_questions (
//                 bloom_level,
//                 difficulty_level
//               )
//             `)
//             .order("attempt_number", { ascending: true });

//           if (practiceError) console.warn("practice fetch warning:", practiceError.message);

//           const attemptMap: Record<number, { total: number; count: number }> = {};
//           const diffAttemptMap: Record<string, { total: number; count: number }> = {};
//           const bloomAttemptMap: Record<string, { total: number; count: number }> = {};

//           (practiceRows ?? []).forEach((p: any) => {
//             const attempt = Number(p.attempt_number ?? 1);
//             const isCorrect = Boolean(p.is_correct);
//             const bloomLevel = p.practice_quiz_questions?.bloom_level ?? "Unknown";
//             const difficulty = p.practice_quiz_questions?.difficulty_level ?? "Medium";

//             if (!attemptMap[attempt]) attemptMap[attempt] = { total: 0, count: 0 };
//             attemptMap[attempt].total += isCorrect ? 100 : 0;
//             attemptMap[attempt].count++;

//             const diffKey = `${attempt}|||${difficulty}`;
//             if (!diffAttemptMap[diffKey]) diffAttemptMap[diffKey] = { total: 0, count: 0 };
//             diffAttemptMap[diffKey].total += isCorrect ? 100 : 0;
//             diffAttemptMap[diffKey].count++;

//             const bloomKey = `${attempt}|||${bloomLevel}`;
//             if (!bloomAttemptMap[bloomKey]) bloomAttemptMap[bloomKey] = { total: 0, count: 0 };
//             bloomAttemptMap[bloomKey].total += isCorrect ? 100 : 0;
//             bloomAttemptMap[bloomKey].count++;
//           });

//           const practiceTrend: PracticeTrendItem[] = Object.entries(attemptMap)
//             .map(([attempt_no, v]) => ({
//               attempt_no: Number(attempt_no),
//               avg_score: v.count > 0 ? Math.round(v.total / v.count) : 0,
//             }))
//             .sort((a, b) => a.attempt_no - b.attempt_no);

//           const practiceDifficultyOverAttempts: PracticeDifficultyOverAttemptsItem[] = Object.entries(diffAttemptMap)
//             .map(([k, v]) => {
//               const [attempt_noStr, difficulty] = k.split("|||");
//               return {
//                 attempt_no: Number(attempt_noStr),
//                 difficulty,
//                 avg_score: v.count > 0 ? Math.round(v.total / v.count) : 0,
//               };
//             })
//             .sort((a, b) => a.attempt_no - b.attempt_no);

//           const practiceBloomOverAttempts: PracticeBloomOverAttemptsItem[] = Object.entries(bloomAttemptMap)
//             .map(([k, v]) => {
//               const [attempt_noStr, bloom_level] = k.split("|||");
//               return {
//                 attempt_no: Number(attempt_noStr),
//                 bloom_level,
//                 avg_score: v.count > 0 ? Math.round(v.total / v.count) : 0,
//               };
//             })
//             .sort((a, b) => a.attempt_no - b.attempt_no);

//           const practiceBloomMap: Record<string, { total: number; count: number }> = {};
//           (practiceRows ?? []).forEach((p: any) => {
//             const bloomLevel = p.practice_quiz_questions?.bloom_level ?? "Unknown";
//             if (!practiceBloomMap[bloomLevel]) practiceBloomMap[bloomLevel] = { total: 0, count: 0 };
//             practiceBloomMap[bloomLevel].total += p.is_correct ? 100 : 0;
//             practiceBloomMap[bloomLevel].count++;
//           });

//           const practiceVsFinalBloom: PracticeVsFinalBloomItem[] = bloomOrder.map((lvl) => ({
//             bloom_level: lvl,
//             practice_avg: practiceBloomMap[lvl]?.count ? Math.round(practiceBloomMap[lvl].total / practiceBloomMap[lvl].count) : 0,
//             final_avg: avgPerformance[lvl] ?? 0,
//           }));

//           return {
//             data: {
//               scoreDistribution,
//               questionAccuracy,
//               bloomRadar,
//               questionsByBloomDifficulty,
//               questionSections,
//               combinedData,
//               practiceTrend,
//               practiceVsFinalBloom,
//               practiceDifficultyOverAttempts,
//               practiceBloomOverAttempts,
//             },
//           };
//         } catch (err: any) {
//           console.error("Educator Overview Fetch Error:", err);
//           return { error: { status: "UNKNOWN_ERROR", error: String(err?.message ?? err) } };
//         }
//       },
//       providesTags: [{ type: "OverviewGraphs", id: "LIST" }],
//     }),
//   }),
// });

// export const { useGetGraphsDataQuery } = educatorOverviewApi;

// import { supabase } from "@/lib/supebase";
// import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
// import type { PostgrestError } from "@supabase/supabase-js";

// export type ScoreDistributionItem = { range: string; count: number };
// export type QuestionAccuracyItem = { question_id: string; correct: number; incorrect: number };
// export type BloomRadarItem = { level: string; performance: number; coverage: number };
// export type QuestionSectionItem = { section: string; bloom_level: string; difficulty: string; average_score: number };
// export type QuestionsByBloomDifficultyItem = { bloom: string; Easy: number; Medium: number; Hard: number };
// export type CombinedChartItem = QuestionSectionItem;
// export type PracticeTrendItem = { attempt_no: number; avg_score: number };
// export type PracticeVsFinalBloomItem = { bloom_level: string; practice_avg: number; final_avg: number };
// export type PracticeDifficultyOverAttemptsItem = { attempt_no: number; difficulty: string; avg_score: number };
// export type PracticeBloomOverAttemptsItem = { attempt_no: number; bloom_level: string; avg_score: number };

// export type EducatorOverviewGraphData = {
//   scoreDistribution: ScoreDistributionItem[];
//   questionAccuracy: QuestionAccuracyItem[];
//   bloomRadar: BloomRadarItem[];
//   questionsByBloomDifficulty: QuestionsByBloomDifficultyItem[];
//   questionSections: QuestionSectionItem[];
//   combinedData: CombinedChartItem[];
//   practiceTrend: PracticeTrendItem[];
//   practiceVsFinalBloom: PracticeVsFinalBloomItem[];
//   practiceDifficultyOverAttempts: PracticeDifficultyOverAttemptsItem[];
//   practiceBloomOverAttempts: PracticeBloomOverAttemptsItem[];
// };

// const mapError = (e: PostgrestError) => ({ status: e.code || "SUPABASE_ERROR", error: e.message });

// export const educatorOverviewApi = createApi({
//   reducerPath: "educatorOverviewApi",
//   baseQuery: fakeBaseQuery(),
//   tagTypes: ["OverviewGraphs"],
//   endpoints: (builder) => ({
//     getGraphsData: builder.query<EducatorOverviewGraphData, void>({
//       async queryFn() {
//         try {

//           // -----------------------------------------------------------
//           // 1️⃣ Lookup Quiz Type IDs (VERY IMPORTANT)
//           // -----------------------------------------------------------
//           const { data: finalType, error: finalTypeError } = await supabase
//             .from("quiz_type")
//             .select("id")
//             .eq("quiz_type", "Final Quiz")
//             .single();

//           if (finalTypeError) return { error: mapError(finalTypeError) };

//           const { data: practiceType, error: practiceTypeError } = await supabase
//             .from("quiz_type")
//             .select("id")
//             .eq("quiz_type", "Practice Quiz")
//             .single();

//           if (practiceTypeError) return { error: mapError(practiceTypeError) };

//           const finalTypeId = finalType.id;
//           const practiceTypeId = practiceType.id;

//           // -----------------------------------------------------------
//           // 2️⃣ Fetch Final Quiz Attempts
//           // -----------------------------------------------------------
//           const { data: finalAttempts, error: finalError } = await supabase
//             .from("quiz_attempt")
//             .select(`
//               id,
//               student_id,
//               quiz_type_id,
//               quiz_attempt_item(
//                 id,
//                 question_id,
//                 is_correct,
//                 question:question_id(
//                   bloom_id(level),
//                   difficulty_id(difficulty_level),
//                   section_id(section)
//                 )
//               )
//             `)
//             .eq("quiz_type_id", finalTypeId);

//           if (finalError) return { error: mapError(finalError) };

//           // -----------------------------------------------------------
//           // Final Quiz Aggregations
//           // -----------------------------------------------------------
//           const scoreDistribution = Array.from({ length: 10 }, (_, i) => ({
//             range: `${i * 10}-${(i + 1) * 10}%`,
//             count: 0,
//           }));

//           const questionMap: Record<string, { correct: number; incorrect: number }> = {};
//           const bloomPerformance: Record<string, { total: number; count: number }> = {};
//           const bloomCoverage: Record<string, number> = {};
//           const questionSections: QuestionSectionItem[] = [];

//           (finalAttempts ?? []).forEach((attempt: any) => {
//             let totalScore = 0;

//             const items = attempt.quiz_attempt_item ?? [];

//             items.forEach((item: any) => {
//               const isCorrect = item.is_correct ? 100 : 0;
//               totalScore += isCorrect;

//               const qid = item.question_id;

//               if (!questionMap[qid]) questionMap[qid] = { correct: 0, incorrect: 0 };
//               item.is_correct ? questionMap[qid].correct++ : questionMap[qid].incorrect++;

//               const bloom = item.question?.bloom_id?.level ?? "Unknown";
//               if (!bloomPerformance[bloom]) bloomPerformance[bloom] = { total: 0, count: 0 };
//               bloomPerformance[bloom].total += isCorrect;
//               bloomPerformance[bloom].count++;

//               const diff = item.question?.difficulty_id?.difficulty_level ?? "Medium";
//               const section = item.question?.section_id?.section ?? "Unknown";

//               questionSections.push({
//                 section,
//                 bloom_level: bloom,
//                 difficulty: diff,
//                 average_score: isCorrect,
//               });

//               bloomCoverage[bloom] = (bloomCoverage[bloom] ?? 0) + 1;
//             });

//             const avgScore = items.length > 0 ? totalScore / items.length : 0;
//             const idx = Math.min(Math.floor(avgScore / 10), 9);
//             scoreDistribution[idx].count++;
//           });

//           const questionAccuracy = Object.entries(questionMap).map(([qid, v]) => ({
//             question_id: qid,
//             correct: v.correct,
//             incorrect: v.incorrect,
//           }));

//           const bloomOrder = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

//           const bloomRadar: BloomRadarItem[] = bloomOrder.map((lvl) => ({
//             level: lvl,
//             performance: bloomPerformance[lvl]?.count
//               ? Math.round(bloomPerformance[lvl].total / bloomPerformance[lvl].count)
//               : 0,
//             coverage: bloomCoverage[lvl] ?? 0,
//           }));

//           const qByBloomDiffMap: Record<string, QuestionsByBloomDifficultyItem> = {};
//           questionSections.forEach((q) => {
//             if (!qByBloomDiffMap[q.bloom_level])
//               qByBloomDiffMap[q.bloom_level] = { bloom: q.bloom_level, Easy: 0, Medium: 0, Hard: 0 };

//             const key = q.difficulty as "Easy" | "Medium" | "Hard";
//             qByBloomDiffMap[q.bloom_level][key]++;
//           });

//           const questionsByBloomDifficulty = Object.values(qByBloomDiffMap);

//           const combinedData = [...questionSections];

//           // -----------------------------------------------------------
//           // 3️⃣ Practice Quizzes
//           // -----------------------------------------------------------
//           const { data: practiceAttempts, error: practiceError } = await supabase
//             .from("quiz_attempt")
//             .select(`
//               id,
//               student_id,
//               quiz_type_id,
//               quiz_attempt_item(
//                 id,
//                 question_id,
//                 is_correct,
//                 question:question_id(
//                   bloom_id(level),
//                   difficulty_id(difficulty_level),
//                   section_id(section)
//                 )
//               )
//             `)
//             .eq("quiz_type_id", practiceTypeId);

//           if (practiceError) console.warn("Practice fetch warning:", practiceError.message);

//           const attemptMap: Record<number, { total: number; count: number }> = {};
//           const diffAttemptMap: Record<string, { total: number; count: number }> = {};
//           const bloomAttemptMap: Record<string, { total: number; count: number }> = {};

//           (practiceAttempts ?? []).forEach((attempt: any, index: number) => {
//             const attempt_no = index + 1;
//             const items = attempt.quiz_attempt_item ?? [];

//             items.forEach((item: any) => {
//               const isCorrect = item.is_correct ? 100 : 0;

//               if (!attemptMap[attempt_no]) attemptMap[attempt_no] = { total: 0, count: 0 };
//               attemptMap[attempt_no].total += isCorrect;
//               attemptMap[attempt_no].count++;

//               const diff = item.question?.difficulty_id?.difficulty_level ?? "Medium";
//               const diffKey = `${attempt_no}|||${diff}`;
//               if (!diffAttemptMap[diffKey]) diffAttemptMap[diffKey] = { total: 0, count: 0 };
//               diffAttemptMap[diffKey].total += isCorrect;
//               diffAttemptMap[diffKey].count++;

//               const bloom = item.question?.bloom_id?.level ?? "Unknown";
//               const bloomKey = `${attempt_no}|||${bloom}`;
//               if (!bloomAttemptMap[bloomKey]) bloomAttemptMap[bloomKey] = { total: 0, count: 0 };
//               bloomAttemptMap[bloomKey].total += isCorrect;
//               bloomAttemptMap[bloomKey].count++;
//             });
//           });

//           const practiceTrend = Object.entries(attemptMap).map(([k, v]) => ({
//             attempt_no: Number(k),
//             avg_score: Math.round(v.total / v.count),
//           }));

//           const practiceDifficultyOverAttempts = Object.entries(diffAttemptMap).map(([k, v]) => {
//             const [attempt_no, difficulty] = k.split("|||");
//             return {
//               attempt_no: Number(attempt_no),
//               difficulty,
//               avg_score: Math.round(v.total / v.count),
//             };
//           });

//           const practiceBloomOverAttempts = Object.entries(bloomAttemptMap).map(([k, v]) => {
//             const [attempt_no, bloom_level] = k.split("|||");
//             return {
//               attempt_no: Number(attempt_no),
//               bloom_level,
//               avg_score: Math.round(v.total / v.count),
//             };
//           });

//           const practiceBloomMap: Record<string, { total: number; count: number }> = {};
//           (practiceAttempts ?? []).forEach((attempt: any) => {
//             attempt.quiz_attempt_item?.forEach((item: any) => {
//               const bloom = item.question?.bloom_id?.level ?? "Unknown";
//               if (!practiceBloomMap[bloom]) practiceBloomMap[bloom] = { total: 0, count: 0 };
//               practiceBloomMap[bloom].total += item.is_correct ? 100 : 0;
//               practiceBloomMap[bloom].count++;
//             });
//           });

//           const practiceVsFinalBloom: PracticeVsFinalBloomItem[] = bloomOrder.map((lvl) => ({
//             bloom_level: lvl,
//             practice_avg: practiceBloomMap[lvl]?.count
//               ? Math.round(practiceBloomMap[lvl].total / practiceBloomMap[lvl].count)
//               : 0,
//             final_avg: bloomPerformance[lvl]?.count
//               ? Math.round(bloomPerformance[lvl].total / bloomPerformance[lvl].count)
//               : 0,
//           }));

//           return {
//             data: {
//               scoreDistribution,
//               questionAccuracy,
//               bloomRadar,
//               questionsByBloomDifficulty,
//               questionSections,
//               combinedData,
//               practiceTrend,
//               practiceVsFinalBloom,
//               practiceDifficultyOverAttempts,
//               practiceBloomOverAttempts,
//             },
//           };
//         } catch (err: any) {
//           console.error("Educator Overview Fetch Error:", err);
//           return { error: { status: "UNKNOWN_ERROR", error: err?.message ?? String(err) } };
//         }
//       },
//       providesTags: [{ type: "OverviewGraphs", id: "LIST" }],
//     }),
//   }),
// });

// export const { useGetGraphsDataQuery } = educatorOverviewApi;

// // import { supabase } from "@/lib/supebase";
// // import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
// // import type { PostgrestError } from "@supabase/supabase-js";

// // export type ScoreDistributionItem = { range: string; count: number };
// // export type QuestionAccuracyItem = { question_id: string; correct: number; incorrect: number };
// // export type BloomRadarItem = { level: string; performance: number; coverage: number };
// // export type QuestionSectionItem = { section: string; bloom_level: string; difficulty: string; average_score: number };
// // export type QuestionsByBloomDifficultyItem = { bloom: string; Easy: number; Medium: number; Hard: number };
// // export type CombinedChartItem = QuestionSectionItem;
// // export type PracticeTrendItem = { attempt_no: number; avg_score: number };
// // export type PracticeVsFinalBloomItem = { bloom_level: string; practice_avg: number; final_avg: number };
// // export type PracticeDifficultyOverAttemptsItem = { attempt_no: number; difficulty: string; avg_score: number };
// // export type PracticeBloomOverAttemptsItem = { attempt_no: number; bloom_level: string; avg_score: number };

// // export type EducatorOverviewGraphData = {
// //     scoreDistribution: ScoreDistributionItem[];
// //     questionAccuracy: QuestionAccuracyItem[];
// //     bloomRadar: BloomRadarItem[];
// //     questionsByBloomDifficulty: QuestionsByBloomDifficultyItem[];
// //     questionSections: QuestionSectionItem[];
// //     combinedData: CombinedChartItem[];
// //     practiceTrend: PracticeTrendItem[];
// //     practiceVsFinalBloom: PracticeVsFinalBloomItem[];
// //     practiceDifficultyOverAttempts: PracticeDifficultyOverAttemptsItem[];
// //     practiceBloomOverAttempts: PracticeBloomOverAttemptsItem[];
// // };

// // const mapError = (e: PostgrestError) => ({ status: e.code || "SUPABASE_ERROR", error: e.message });

// // export const educatorOverviewApi = createApi({
// //     reducerPath: "educatorOverviewApi",
// //     baseQuery: fakeBaseQuery(),
// //     tagTypes: ["OverviewGraphs"],
// //     endpoints: (builder) => ({
// //         getGraphsData: builder.query<EducatorOverviewGraphData, void>({
// //             async queryFn() {
// //                 try {
// //                     const { data: quizTypes, error: quizTypeError } = await supabase
// //                         .from("quiz_type")
// //                         .select("id, quiz_type");
// //                     if (quizTypeError) return { error: mapError(quizTypeError) };

// //                     const practiceTypeId = quizTypes?.find((t) => t.quiz_type === "Practice Quiz")?.id;
// //                     const finalTypeId = quizTypes?.find((t) => t.quiz_type === "Final Quiz")?.id;
// //                     if (!practiceTypeId || !finalTypeId) {
// //                         return { error: { status: "MISSING_QUIZ_TYPES", error: "Practice Quiz or Final Quiz type not found" } };
// //                     }

// //                     const { data: finalAttempts, error: finalError } = await supabase
// //                         .from("quiz_attempt")
// //                         .select(`
// //                             id,
// //                             student_id,
// //                             quiz_type_id,
// //                             quiz_attempt_item(
// //                                 id,
// //                                 is_correct,
// //                                 question:question_id(
// //                                     bloom_id(level),
// //                                     difficulty_id(difficulty_level),
// //                                     section_id(section)
// //                                 )
// //                             )
// //                         `)
// //                         .eq("quiz_type_id", finalTypeId);
// //                     if (finalError) return { error: mapError(finalError) };

// //                     // ---------------------------------------------------
// //                     // Aggregate Final Quiz Data
// //                     // ---------------------------------------------------
// //                     const scoreDistribution: ScoreDistributionItem[] = Array.from({ length: 10 }, (_, i) => ({
// //                         range: `${i * 10}-${(i + 1) * 10}%`,
// //                         count: 0,
// //                     }));

// //                     const questionMap: Record<string, { correct: number; incorrect: number }> = {};
// //                     const bloomPerformance: Record<string, { total: number; count: number }> = {};
// //                     const bloomCoverage: Record<string, number> = {};
// //                     const questionSections: QuestionSectionItem[] = [];

// //                     (finalAttempts ?? []).forEach((attempt: any) => {
// //                         let totalScore = 0;
// //                         const items = attempt.quiz_attempt_item ?? [];

// //                         items.forEach((item: any) => {
// //                             const isCorrect = item.is_correct ? 100 : 0;
// //                             totalScore += isCorrect;

// //                             const qid = item.question_id;
// //                             if (!questionMap[qid]) questionMap[qid] = { correct: 0, incorrect: 0 };
// //                             item.is_correct ? questionMap[qid].correct++ : questionMap[qid].incorrect++;

// //                             const bloom = item.question?.bloom_id?.level ?? "Unknown";
// //                             if (!bloomPerformance[bloom]) bloomPerformance[bloom] = { total: 0, count: 0 };
// //                             bloomPerformance[bloom].total += isCorrect;
// //                             bloomPerformance[bloom].count++;

// //                             const diff = item.question?.difficulty_id?.difficulty_level ?? "Medium";
// //                             const section = item.question?.section_id?.section ?? "Unknown";

// //                             questionSections.push({ section, bloom_level: bloom, difficulty: diff, average_score: isCorrect });
// //                             bloomCoverage[bloom] = (bloomCoverage[bloom] ?? 0) + 1;
// //                         });

// //                         const avgScore = items.length > 0 ? totalScore / items.length : 0;
// //                         const idx = Math.min(Math.floor(avgScore / 10), 9);
// //                         scoreDistribution[idx].count++;
// //                     });

// //                     // Sequentially number questions 1..N for raw counts of correct/incorrect
// //                     const sortedQids = Object.keys(questionMap).sort((a, b) => Number(a) - Number(b));
// //                     const questionAccuracy: QuestionAccuracyItem[] = sortedQids.map((qid, index) => ({
// //                         question_id: (index + 1).toString(),
// //                         correct: questionMap[qid].correct,
// //                         incorrect: questionMap[qid].incorrect,
// //                     }));

// //                     const bloomOrder = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
// //                     const bloomRadar: BloomRadarItem[] = bloomOrder.map((lvl) => ({
// //                         level: lvl,
// //                         performance: bloomPerformance[lvl]?.count
// //                             ? Math.round(bloomPerformance[lvl].total / bloomPerformance[lvl].count)
// //                             : 0,
// //                         coverage: bloomCoverage[lvl] ?? 0,
// //                     }));

// //                     const qByBloomDiffMap: Record<string, QuestionsByBloomDifficultyItem> = {};
// //                     questionSections.forEach((q) => {
// //                         if (!qByBloomDiffMap[q.bloom_level])
// //                             qByBloomDiffMap[q.bloom_level] = { bloom: q.bloom_level, Easy: 0, Medium: 0, Hard: 0 };
// //                         qByBloomDiffMap[q.bloom_level][q.difficulty as "Easy" | "Medium" | "Hard"]++;
// //                     });

// //                     const questionsByBloomDifficulty = Object.values(qByBloomDiffMap);
// //                     const combinedData = [...questionSections];

// //                     // ---------------------------------------------------
// //                     // Practice Quiz Aggregation
// //                     // ---------------------------------------------------
// //                     const { data: practiceAttemptsRaw, error: practiceError } = await supabase
// //                         .from("quiz_attempt")
// //                         .select(`
// //                             id,
// //                             student_id,
// //                             quiz_type_id,
// //                             started_at,
// //                             quiz_attempt_item(
// //                                 id,
// //                                 is_correct,
// //                                 question:question_id(
// //                                     bloom_id(level),
// //                                     difficulty_id(difficulty_level)
// //                                 )
// //                             )
// //                         `)
// //                         .eq("quiz_type_id", practiceTypeId)
// //                         .order("student_id", { ascending: true })
// //                         .order("started_at", { ascending: true });

// //                     if (practiceError) console.warn("Practice fetch error:", practiceError.message);

// //                     const studentMap: Record<string, any[]> = {};
// //                     (practiceAttemptsRaw ?? []).forEach((attempt) => {
// //                         if (!studentMap[attempt.student_id]) studentMap[attempt.student_id] = [];
// //                         studentMap[attempt.student_id].push(attempt);
// //                     });

// //                     const practiceAttempts: any[] = [];
// //                     Object.values(studentMap).forEach((attempts: any[]) => {
// //                         attempts.forEach((a, idx) => {
// //                             practiceAttempts.push({ ...a, attempt_no: idx + 1 });
// //                         });
// //                     });

// //                     const attemptMap: Record<number, { total: number; count: number }> = {};
// //                     const diffAttemptMap: Record<string, { total: number; count: number }> = {};
// //                     const bloomAttemptMap: Record<string, { total: number; count: number }> = {};

// //                     practiceAttempts.forEach((attempt) => {
// //                         const attempt_no = attempt.attempt_no;
// //                         const items = attempt.quiz_attempt_item ?? [];

// //                         items.forEach((item: any) => {
// //                             const isCorrect = item.is_correct ? 100 : 0;

// //                             if (!attemptMap[attempt_no]) attemptMap[attempt_no] = { total: 0, count: 0 };
// //                             attemptMap[attempt_no].total += isCorrect;
// //                             attemptMap[attempt_no].count++;

// //                             const diff = item.question?.difficulty_id?.difficulty_level ?? "Medium";
// //                             const diffKey = `${attempt_no}|||${diff}`;
// //                             if (!diffAttemptMap[diffKey]) diffAttemptMap[diffKey] = { total: 0, count: 0 };
// //                             diffAttemptMap[diffKey].total += isCorrect;
// //                             diffAttemptMap[diffKey].count++;

// //                             const bloom = item.question?.bloom_id?.level ?? "Unknown";
// //                             const bloomKey = `${attempt_no}|||${bloom}`;
// //                             if (!bloomAttemptMap[bloomKey]) bloomAttemptMap[bloomKey] = { total: 0, count: 0 };
// //                             bloomAttemptMap[bloomKey].total += isCorrect;
// //                             bloomAttemptMap[bloomKey].count++;
// //                         });
// //                     });

// //                     const practiceTrend = Object.entries(attemptMap).map(([attempt_no, v]) => ({
// //                         attempt_no: Number(attempt_no),
// //                         avg_score: Math.round(v.total / v.count),
// //                     }));

// //                     const practiceDifficultyOverAttempts = Object.entries(diffAttemptMap).map(([key, v]) => {
// //                         const [attempt_noStr, difficulty] = key.split("|||");
// //                         return {
// //                             attempt_no: Number(attempt_noStr),
// //                             difficulty,
// //                             avg_score: Math.round(v.total / v.count),
// //                         };
// //                     });

// //                     const practiceBloomOverAttempts = Object.entries(bloomAttemptMap).map(([key, v]) => {
// //                         const [attempt_noStr, bloom_level] = key.split("|||");
// //                         return {
// //                             attempt_no: Number(attempt_noStr),
// //                             bloom_level,
// //                             avg_score: Math.round(v.total / v.count),
// //                         };
// //                     });

// //                     const practiceBloomMap: Record<string, { total: number; count: number }> = {};
// //                     practiceAttempts.forEach((attempt) => {
// //                         attempt.quiz_attempt_item?.forEach((item: any) => {
// //                             const bloom = item.question?.bloom_id?.level ?? "Unknown";
// //                             if (!practiceBloomMap[bloom]) practiceBloomMap[bloom] = { total: 0, count: 0 };
// //                             practiceBloomMap[bloom].total += item.is_correct ? 100 : 0;
// //                             practiceBloomMap[bloom].count++;
// //                         });
// //                     });

// //                     const practiceVsFinalBloom = bloomOrder.map((lvl) => ({
// //                         bloom_level: lvl,
// //                         practice_avg: practiceBloomMap[lvl]?.count ? Math.round(practiceBloomMap[lvl].total / practiceBloomMap[lvl].count) : 0,
// //                         final_avg: bloomPerformance[lvl]?.count ? Math.round(bloomPerformance[lvl].total / bloomPerformance[lvl].count) : 0,
// //                     }));

// //                     return {
// //                         data: {
// //                             scoreDistribution,
// //                             questionAccuracy,
// //                             bloomRadar,
// //                             questionsByBloomDifficulty,
// //                             questionSections,
// //                             combinedData,
// //                             practiceTrend,
// //                             practiceVsFinalBloom,
// //                             practiceDifficultyOverAttempts,
// //                             practiceBloomOverAttempts,
// //                         },
// //                     };
// //                 } catch (err: any) {
// //                     console.error("Educator Overview Fetch Error:", err);
// //                     return { error: { status: "UNKNOWN_ERROR", error: String(err?.message ?? err) } };
// //                 }
// //             },
// //             providesTags: [{ type: "OverviewGraphs", id: "LIST" }],
// //         }),
// //     }),
// // });

// // export const { useGetGraphsDataQuery } = educatorOverviewApi;


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
          // 2️⃣ Fetch Final Quiz Attempts
          // -----------------------------------------------------------
          const { data: finalAttempts, error: finalError } = await supabase
            .from("quiz_attempt")
            .select(`
              id,
              student_id,
              quiz_type_id,
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
            .eq("quiz_type_id", finalTypeId);
          if (finalError) return { error: mapError(finalError) };

          // -----------------------------------------------------------
          // Final Quiz Aggregations (unchanged)
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

          const qByBloomDiffMap: Record<string, QuestionsByBloomDifficultyItem> = {};
          questionSections.forEach((q) => {
            if (!qByBloomDiffMap[q.bloom_level])
              qByBloomDiffMap[q.bloom_level] = { bloom: q.bloom_level, Easy: 0, Medium: 0, Hard: 0 };
            qByBloomDiffMap[q.bloom_level][q.difficulty as "Easy" | "Medium" | "Hard"]++;
          });
          const questionsByBloomDifficulty = Object.values(qByBloomDiffMap);
          const combinedData = [...questionSections];

          // -----------------------------------------------------------
          // 3️⃣ Fetch Practice Quiz Attempts
          // -----------------------------------------------------------
          const { data: practiceAttemptsRaw, error: practiceError } = await supabase
            .from("quiz_attempt")
            .select(`
              id,
              student_id,
              quiz_type_id,
              started_at,
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
            .order("student_id", { ascending: true })
            .order("started_at", { ascending: true });

          if (practiceError) console.warn("Practice fetch error:", practiceError.message);

          // Group attempts per student to get sequential attempt numbers
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
          return { error: { status: "UNKNOWN_ERROR", error: err?.message ?? String(err) } };
        }
      },
      providesTags: [{ type: "OverviewGraphs", id: "LIST" }],
    }),
  }),
});

export const { useGetGraphsDataQuery } = educatorOverviewApi;

