// import { supabase } from "@/lib/supebase";
// import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
// import type { PostgrestError } from "@supabase/supabase-js"

// export type StudentPerformanceSummary = {
//   summary_id: number
//   student_id: string | null
//   pre_quiz_score: number | null
//   pre_quiz_attempts: number | null
//   pre_quiz_confidence_level: number | null
//   prior_experience: string | null
//   struggling_sections: Record<string, any> | null
//   practice_quiz_avg_score: number | null
//   practice_quiz_attempts: number | null
//   practice_quiz_best_score: number | null
//   final_quiz_score: number | null
//   final_quiz_attempts: number | null
//   cheat_sheet_access_count: number | null
//   total_time_spent_minutes: number | null
//   section_scores: Record<string, any> | null
//   bloom_scores: Record<string, any> | null
//   flagged_for_intervention: boolean | null
//   intervention_reason: string | null
//   last_updated: string | null
//   created_at: string | null
//   users?: {
//     first_name?: string
//     last_name?: string
//     email?: string
//   }
// }

// export type DashboardListArgs = {
//   page?: number
//   pageSize?: number
//   onlyFlagged?: boolean
//   searchText?: string
//   sortBy?: keyof StudentPerformanceSummary
//   ascending?: boolean
// }

// export type DashboardListResult = { rows: StudentPerformanceSummary[]; total: number }

// const mapError = (e: PostgrestError) => ({
//   status: e.code || "SUPABASE_ERROR",
//   error: e.message,
// })

// export const educatorDashboardApi = createApi({
//   reducerPath: "educatorDashboardApi",
//   baseQuery: fakeBaseQuery(),
//   tagTypes: ["StudentPerformance"],
//   endpoints: (builder) => ({
//     getStudentsPerformance: builder.query<DashboardListResult, DashboardListArgs | void>({
//       async queryFn(args) {
//         const page = args?.page ?? 1;
//         const pageSize = args?.pageSize ?? 20;
//         const from = (page - 1) * pageSize;
//         const to = from + pageSize - 1;

//         try {
//           let q = supabase
//             .from("student_performance_summary")
//             .select(
//               "*, users!student_performance_summary_student_id_fkey(first_name,last_name,email)",
//               { count: "exact" }
//             )
//             .order(args?.sortBy ?? "created_at", { ascending: args?.ascending ?? false })
//             .range(from, to);

//           if (args?.onlyFlagged) q = q.eq("flagged_for_intervention", true);

//           if (args?.searchText?.trim())
//             q = q.ilike(
//               "users!student_performance_summary_student_id_fkey.first_name",
//               `%${args.searchText.trim()}%`
//             );

//           const { data, error, count } = await q;
//           if (error) return { error: mapError(error) };

//           const studentIds = (data ?? []).map((item: any) => item.student_id).filter(Boolean);

//           let attemptsMap: Record<string, number> = {};
//           if (studentIds.length > 0) {
//             const { data: attemptData, error: attemptError } = await supabase
//               .from("practice_quiz_results")
//               .select("student_id, attempt_number")
//               .in("student_id", studentIds);

//             if (!attemptError && attemptData) {
//               attemptData.forEach((row: any) => {
//                 const sid = row.student_id;
//                 const attempt = Number(row.attempt_number ?? 0);
//                 attemptsMap[sid] = Math.max(attemptsMap[sid] ?? 0, attempt);
//               });
//             }
//           }

//           const rows = (data ?? []).map((item: any) => ({
//             ...item,
//             practice_quiz_attempts: attemptsMap[item.student_id] ?? 0, // use dynamic attempts
//             users: item.users
//               ? {
//                 ...item.users,
//                 full_name: `${item.users.first_name ?? ""} ${item.users.last_name ?? ""}`.trim(),
//               }
//               : undefined,
//           }));

//           return {
//             data: {
//               rows,
//               total: count ?? 0,
//             },
//           };
//         } catch (err: any) {
//           return { error: { status: "UNKNOWN_ERROR", error: String(err?.message ?? err) } };
//         }
//       },
//       providesTags: (result) =>
//         result
//           ? [
//             ...result.rows.map((r) => ({ type: "StudentPerformance" as const, id: r.summary_id })),
//             { type: "StudentPerformance" as const, id: "LIST" },
//           ]
//           : [{ type: "StudentPerformance" as const, id: "LIST" }],
//     }),
//   }),
// })

// export const { useGetStudentsPerformanceQuery } = educatorDashboardApi

// import { supabase } from "@/lib/supebase";
// import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
// import type { PostgrestError } from "@supabase/supabase-js";

// export type StudentPerformanceSummary = {
//   student_id: string;
//   first_name?: string;
//   last_name?: string;
//   full_name: string;
//   email?: string;
//   final_quiz_score: number;
//   practice_quiz_avg_score: number;
//   practice_quiz_attempts: number;
//   total_time_spent: string; // hh:mm:ss
//   bloom_scores: Record<string, number>;
//   section_scores: Record<string, number>;
//   cheat_sheet_access_count: number;
//   flagged_for_intervention: boolean;
//   intervention_reason?: string | null;
// };

// export type DashboardListResult = {
//   rows: StudentPerformanceSummary[];
//   total: number;
// };

// const mapError = (e: PostgrestError) => ({
//   status: e.code || "SUPABASE_ERROR",
//   error: e.message,
// });

// const minutesToHMS = (minutes: number) => {
//   if (isNaN(minutes) || minutes < 0) minutes = 0;
//   const h = Math.floor(minutes / 60);
//   const m = Math.floor(minutes % 60);
//   const s = Math.round((minutes - Math.floor(minutes)) * 60);
//   return [h, m, s].map(n => n.toString().padStart(2, "0")).join(":");
// };

// export const educatorDashboardApi = createApi({
//   reducerPath: "educatorDashboardApi",
//   baseQuery: fakeBaseQuery(),
//   tagTypes: ["StudentPerformance"],
//   endpoints: (builder) => ({
//     getStudentsPerformance: builder.query<DashboardListResult, void>({
//       async queryFn() {
//         try {
//           // 1️⃣ Fetch students
//           const { data: users, error: usersError } = await supabase
//             .from("users")
//             .select("id, first_name, last_name, email")
//             .eq("role", "student");

//           if (usersError) return { error: mapError(usersError) };
//           if (!users || users.length === 0) return { data: { rows: [], total: 0 } };

//           const studentIds = users.map(u => u.id).filter(Boolean);
//           if (studentIds.length === 0) return { data: { rows: [], total: 0 } };

//           // 2️⃣ Fetch quiz attempts including items
//           const { data: attempts, error: attemptsError } = await supabase
//             .from("quiz_attempt")
//             .select(`
//               id,
//               student_id,
//               started_at,
//               submitted_at,
//               quiz_type:quiz_type_id (quiz_type),
//               quiz_attempt_item (
//                 id,
//                 points_earned
//               )
//             `)
//             .in("student_id", studentIds);

//           if (attemptsError) return { error: mapError(attemptsError) };

//           // 3️⃣ Fetch cheat sheet accesses
//           const attemptIds = attempts?.map(a => a.id) || [];
//           let cheatSheetData: { attempt_id: string }[] = [];
//           if (attemptIds.length > 0) {
//             const { data: cheatData, error: cheatError } = await supabase
//               .from("final_attempt_cheat_sheet_access")
//               .select("attempt_id")
//               .in("attempt_id", attemptIds);

//             if (cheatError) return { error: mapError(cheatError) };
//             cheatSheetData = cheatData || [];
//           }

//           // 4️⃣ Initialize summaries
//           const summaries: Record<string, StudentPerformanceSummary> = {};
//           const practiceAttemptScores: Record<string, number[]> = {};
//           const totalTimeMinutes: Record<string, number> = {};
//           const cheatCountMap: Record<string, number> = {};

//           users.forEach(u => {
//             const full_name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || "Unnamed Student";
//             summaries[u.id] = {
//               student_id: u.id,
//               first_name: u.first_name,
//               last_name: u.last_name,
//               full_name,
//               email: u.email,
//               final_quiz_score: 0,
//               practice_quiz_avg_score: 0,
//               practice_quiz_attempts: 0,
//               total_time_spent: "00:00:00",
//               bloom_scores: {},       
//               section_scores: {},     
//               cheat_sheet_access_count: 0,
//               flagged_for_intervention: false, 
//               intervention_reason: null,       
//             };
//             practiceAttemptScores[u.id] = [];
//             totalTimeMinutes[u.id] = 0;
//             cheatCountMap[u.id] = 0;
//           });

//           // Map cheat sheet accesses to students
//           cheatSheetData.forEach(c => {
//             const attempt = attempts?.find(a => a.id === c.attempt_id);
//             if (attempt && attempt.student_id) {
//               cheatCountMap[attempt.student_id] += 1;
//             }
//           });

//           // 5️⃣ Process attempts
//           (attempts || []).forEach(attempt => {
//             const s = summaries[attempt.student_id];
//             if (!s) return;

//             const type = attempt.quiz_type?.quiz_type?.toLowerCase() ?? "unknown";
//             const items = attempt.quiz_attempt_item || [];
//             const totalQuestions = items.length;
//             const correctAnswers = items.reduce(
//               (sum: number, item: any) => sum + ((item.points_earned ?? 0) > 0 ? 1 : 0),
//               0
//             );

//             const attemptScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

//             if (type.includes("practice")) {
//               practiceAttemptScores[s.student_id].push(attemptScore);
//             } else if (type.includes("final")) {
//               s.final_quiz_score = Math.max(s.final_quiz_score, attemptScore);
//             }

//             if (attempt.started_at && attempt.submitted_at) {
//               const durationMinutes =
//                 (new Date(attempt.submitted_at).getTime() - new Date(attempt.started_at).getTime()) / 60000;
//               totalTimeMinutes[s.student_id] += durationMinutes;
//             }
//           });

//           // 6️⃣ Compute per-student averages, time, and cheat count
//           Object.values(summaries).forEach(s => {
//             const scores = practiceAttemptScores[s.student_id] || [];
//             s.practice_quiz_avg_score =
//               scores.length > 0 ? scores.reduce((sum, sc) => sum + sc, 0) / scores.length : 0;
//             s.practice_quiz_attempts = scores.length;
//             s.total_time_spent = minutesToHMS(totalTimeMinutes[s.student_id]);
//             s.cheat_sheet_access_count = cheatCountMap[s.student_id] || 0;
//           });

//           const rows = Object.values(summaries);
//           return { data: { rows, total: rows.length } };
//         } catch (e: any) {
//           console.error("Error computing student summaries:", e);
//           return { error: { status: "UNKNOWN_ERROR", error: e.message ?? String(e) } };
//         }
//       },
//       providesTags: (result) =>
//         result
//           ? [
//               ...result.rows.map(r => ({ type: "StudentPerformance" as const, id: r.student_id })),
//               { type: "StudentPerformance" as const, id: "LIST" },
//             ]
//           : [{ type: "StudentPerformance" as const, id: "LIST" }],
//     }),
//   }),
// });

// export const { useGetStudentsPerformanceQuery } = educatorDashboardApi;


import { supabase } from "@/lib/supebase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PostgrestError } from "@supabase/supabase-js";

export type StudentPerformanceSummary = {
  student_id: string;
  first_name?: string;
  last_name?: string;
  full_name: string;
  email?: string;
  final_quiz_score: number;
  practice_quiz_avg_score: number;
  practice_quiz_attempts: number;
  total_time_spent: string; // hh:mm:ss
  bloom_scores: Record<string, number>;    // % correct per cognitive level
  section_scores: Record<string, number>;  // total questions per cognitive level
  cheat_sheet_access_count: number;
  flagged_for_intervention: boolean;
  intervention_reason?: string | null;
};

export type DashboardListResult = {
  rows: StudentPerformanceSummary[];
  total: number;
};

const mapError = (e: PostgrestError) => ({
  status: e.code || "SUPABASE_ERROR",
  error: e.message,
});

// Helper: convert total minutes to hh:mm:ss
const minutesToHMS = (minutes: number) => {
  if (isNaN(minutes) || minutes < 0) minutes = 0;
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  const s = Math.round((minutes - Math.floor(minutes)) * 60);
  return [h, m, s].map(n => n.toString().padStart(2, "0")).join(":");
};

// Bloom levels in order
const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

export const educatorDashboardApi = createApi({
  reducerPath: "educatorDashboardApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["StudentPerformance"],
  endpoints: (builder) => ({
    getStudentsPerformance: builder.query<DashboardListResult, void>({
      async queryFn() {
        try {
          // 1️⃣ Fetch all students
          const { data: users, error: usersError } = await supabase
            .from("users")
            .select("id, first_name, last_name, email")
            .eq("role", "student");

          if (usersError) return { error: mapError(usersError) };
          if (!users || users.length === 0) return { data: { rows: [], total: 0 } };

          const studentIds = users.map(u => u.id).filter(Boolean);
          if (studentIds.length === 0) return { data: { rows: [], total: 0 } };

          // 2️⃣ Fetch quiz attempts and items
          const { data: attempts, error: attemptsError } = await supabase
            .from("quiz_attempt")
            .select(`
              id,
              student_id,
              started_at,
              submitted_at,
              quiz_type:quiz_type_id (quiz_type),
              quiz_attempt_item (
                id,
                question_id,
                points_earned
              )
            `)
            .in("student_id", studentIds);

          if (attemptsError) return { error: mapError(attemptsError) };

          // 3️⃣ Fetch cheat sheet accesses
          const { data: cheatAccesses } = await supabase
            .from("final_attempt_cheat_sheet_access")
            .select("attempt_id")
            .in("attempt_id", attempts.map(a => a.id));

          const cheatMap: Record<string, number> = {};
          cheatAccesses?.forEach(c => {
            const attempt = attempts.find(a => a.id === c.attempt_id);
            if (attempt) cheatMap[attempt.student_id] = (cheatMap[attempt.student_id] || 0) + 1;
          });

          // 4️⃣ Fetch question data for bloom & section
          const questionIds = Array.from(
            new Set(attempts.flatMap(a => (a.quiz_attempt_item || []).map(i => i.question_id)))
          ).filter(Boolean);

          let bloomMap: Record<string, string> = {};
          if (questionIds.length > 0) {
            const { data: questions } = await supabase
              .from("question")
              .select(`id, bloom:bloom_id(level)`)
              .in("id", questionIds);

            questions?.forEach(q => {
              bloomMap[q.id] = q.bloom?.level ?? "Unknown";
            });
          }

          // 5️⃣ Initialize summaries with all Bloom levels
          const summaries: Record<string, StudentPerformanceSummary> = {};
          const practiceAttemptScores: Record<string, number[]> = {};
          const totalTimeMinutes: Record<string, number> = {};
          users.forEach(u => {
            const full_name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.email;
            summaries[u.id] = {
              student_id: u.id,
              first_name: u.first_name,
              last_name: u.last_name,
              full_name,
              email: u.email,
              final_quiz_score: 0,
              practice_quiz_avg_score: 0,
              practice_quiz_attempts: 0,
              total_time_spent: "00:00:00",
              bloom_scores: bloomLevels.reduce((acc, level) => ({ ...acc, [level]: 0 }), {}),
              section_scores: bloomLevels.reduce((acc, level) => ({ ...acc, [level]: 0 }), {}),
              cheat_sheet_access_count: 0,
              flagged_for_intervention: false,
              intervention_reason: null,
            };
            practiceAttemptScores[u.id] = [];
            totalTimeMinutes[u.id] = 0;
          });

          // 6️⃣ Process attempts
          (attempts || []).forEach(attempt => {
            const s = summaries[attempt.student_id];
            if (!s) return;

            const type = attempt.quiz_type?.quiz_type?.toLowerCase() ?? "unknown";
            const items = attempt.quiz_attempt_item || [];
            const totalQuestions = items.length;
            const correctAnswers = items.reduce((sum: number, item: any) => sum + ((item.points_earned ?? 0) > 0 ? 1 : 0), 0);
            const attemptScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

            if (type.includes("practice")) practiceAttemptScores[s.student_id].push(attemptScore);
            else if (type.includes("final")) s.final_quiz_score = Math.max(s.final_quiz_score, attemptScore);

            // Time spent
            if (attempt.started_at && attempt.submitted_at) {
              const durationMinutes = (new Date(attempt.submitted_at).getTime() - new Date(attempt.started_at).getTime()) / 60000;
              totalTimeMinutes[s.student_id] += durationMinutes;
            }

            // Bloom & Section scores
            items.forEach(item => {
              const bloom = bloomMap[item.question_id] ?? "Unknown";
              if (!bloomLevels.includes(bloom)) return;

              s.section_scores[bloom] += 1;
              if ((item.points_earned ?? 0) > 0) s.bloom_scores[bloom] += 1;
            });
          });

          // 7️⃣ Finalize percentages, practice averages, cheat counts
          Object.values(summaries).forEach(s => {
            const scores = practiceAttemptScores[s.student_id] || [];
            s.practice_quiz_avg_score = scores.length ? scores.reduce((sum, sc) => sum + sc, 0) / scores.length : 0;
            s.practice_quiz_attempts = scores.length;

            s.total_time_spent = minutesToHMS(totalTimeMinutes[s.student_id]);
            s.cheat_sheet_access_count = cheatMap[s.student_id] || 0;

            bloomLevels.forEach(level => {
              const correct = s.bloom_scores[level];
              const total = s.section_scores[level];
              s.bloom_scores[level] = total ? Math.round((correct / total) * 100) : 0;
            });

            if (s.final_quiz_score < 50) {
              s.flagged_for_intervention = true;
              s.intervention_reason = "Final quiz score below 50%";
            }
          });

          return { data: { rows: Object.values(summaries), total: users.length } };
        } catch (e: any) {
          console.error("Error computing student summaries:", e);
          return { error: { status: "UNKNOWN_ERROR", error: e.message ?? String(e) } };
        }
      },
      providesTags: (result) =>
        result
          ? [
            ...result.rows.map(r => ({ type: "StudentPerformance" as const, id: r.student_id })),
            { type: "StudentPerformance" as const, id: "LIST" },
          ]
          : [{ type: "StudentPerformance" as const, id: "LIST" }],
    }),
  }),
});

export const { useGetStudentsPerformanceQuery } = educatorDashboardApi;









