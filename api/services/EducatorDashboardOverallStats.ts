import { supabase } from "@/lib/supebase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PostgrestError } from "@supabase/supabase-js";

export type DashboardStats = {
  totalStudents: number;
  avgProgress: number; 
  avgScore: number;   
  atRiskCount: number; // stub for now
};

const mapError = (e: PostgrestError) => ({
  status: e.code || "SUPABASE_ERROR",
  error: e.message,
});

export const educatorDashboardStatsApi = createApi({
  reducerPath: "educatorDashboardStatsApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["DashboardStats"],
  endpoints: (builder) => ({
    getStats: builder.query<DashboardStats, void>({
      async queryFn() {
        try {
          console.log("Fetching all quiz attempts...");

          const { data, error } = await supabase
            .from("quiz_attempt")
            .select(`
              id,
              student_id,
              quiz_type:quiz_type_id (quiz_type),
              quiz_attempt_item (
                id,
                quiz_attempt_item_result (is_correct)
              )
            `);

          if (error) {
            console.error("Supabase Error fetching quiz_attempt:", error);
            return { error: mapError(error) };
          }

          if (!data || data.length === 0) {
            return { data: { totalStudents: 0, avgProgress: 0, avgScore: 0, atRiskCount: -1 } };
          }

          console.log(`Total attempts fetched: ${data.length}`);

          const processedAttempts = data.map((attempt: any) => {
            const type = attempt.quiz_type?.quiz_type?.toLowerCase() || "unknown";
            const totalQuestions = attempt.quiz_attempt_item?.length ?? 0;
            const correctAnswers = attempt.quiz_attempt_item?.reduce(
              (sum: number, item: any) => sum + (item.quiz_attempt_item_result?.is_correct ? 1 : 0),
              0
            );

            return {
              student_id: attempt.student_id,
              type,
              totalQuestions,
              correctAnswers,
            };
          });

          const practiceAttempts = processedAttempts.filter(a => a.type.includes("practice"));
          const avgProgress =
            practiceAttempts.length > 0
              ? practiceAttempts
                  .map(a => (a.totalQuestions > 0 ? (a.correctAnswers / a.totalQuestions) * 100 : 0))
                  .reduce((sum, p) => sum + p, 0) / practiceAttempts.length
              : 0;

          const finalAttempts = processedAttempts.filter(a => a.type.includes("final"));
          const finalByStudent: Record<string, any> = {};
          finalAttempts.forEach(a => {
            if (!finalByStudent[a.student_id]) {
              finalByStudent[a.student_id] = a;
            }
          });
          const avgScore =
            Object.values(finalByStudent).length > 0
              ? Object.values(finalByStudent)
                  .map((a: any) => (a.totalQuestions > 0 ? (a.correctAnswers / a.totalQuestions) * 100 : 0))
                  .reduce((sum, s) => sum + s, 0) / Object.values(finalByStudent).length
              : 0;

          const uniqueStudents = new Set(processedAttempts.map(a => a.student_id));
          const totalStudents = uniqueStudents.size;

          console.log("✅ Computed stats:", { totalStudents, avgProgress, avgScore, atRiskCount: -1 });

          return {
            data: {
              totalStudents,
              avgProgress,
              avgScore,
              atRiskCount: -1,
            },
          };
        } catch (e: any) {
          console.error("Unknown Error:", e);
          return { error: { status: "UNKNOWN_ERROR", error: e.message } };
        }
      },
      providesTags: [{ type: "DashboardStats", id: "LIST" }],
    }),
  }),
});

export const { useGetStatsQuery } = educatorDashboardStatsApi;
