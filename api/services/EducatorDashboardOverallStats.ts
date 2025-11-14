import { supabase } from "@/lib/supebase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PostgrestError } from "@supabase/supabase-js";

export type DashboardStats = {
  totalStudents: number;
  avgProgress: number;
  avgScore: number;
  atRiskCount: number;
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
          // Fetch all students
          const { data: allStudents, error: allStudentsError } = await supabase
            .from("users")
            .select("id")
            .eq("role", "student");

          if (allStudentsError) {
            console.error("Error fetching total students:", allStudentsError);
          }

          const totalStudents = allStudents?.length ?? 0;

          // Fetch all quiz attempts
          console.log("Fetching all quiz attempts...");
          const { data, error } = await supabase
            .from("quiz_attempt")
            .select(`
              id,
              student_id,
              quiz_type:quiz_type_id (quiz_type),
              quiz_attempt_item (
                id,
                is_correct,
                points_earned
              )
            `);

          if (error) {
            console.error("Supabase Error fetching quiz_attempt:", error);
            return { error: mapError(error) };
          }

          const processedAttempts = (data ?? []).map((attempt: any) => {
            const type = attempt.quiz_type?.quiz_type?.toLowerCase() || "unknown";
            const totalQuestions = attempt.quiz_attempt_item?.length ?? 0;
            const correctAnswers = attempt.quiz_attempt_item?.reduce(
              (sum: number, item: any) => sum + (item.is_correct ? 1 : 0),
              0
            );

            return {
              student_id: attempt.student_id,
              type,
              totalQuestions,
              correctAnswers,
            };
          });

          // Average progress for practice quizzes
          const practiceAttempts = processedAttempts.filter(a => a.type.includes("practice"));
          const avgProgress =
            practiceAttempts.length > 0
              ? practiceAttempts
                  .map(a => (a.totalQuestions > 0 ? (a.correctAnswers / a.totalQuestions) * 100 : 0))
                  .reduce((sum, p) => sum + p, 0) / practiceAttempts.length
              : 0;

          // Average score for final quizzes
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

          // Count at-risk students (distinct student_ids)
          const { data: atRiskData, error: atRiskError } = await supabase
            .from("intervention_trigger_log")
            .select(`
              learning_profile:learning_profile_id (
                student_id
              )
            `)
            .is("resolved", false);

          if (atRiskError) {
            console.error("Error fetching at-risk students:", atRiskError);
          }

          const atRiskStudentIds = new Set(
            (atRiskData ?? []).map((row: any) => row.learning_profile.student_id)
          );
          const atRiskCount = atRiskStudentIds.size;

          console.log("✅ Computed stats:", { totalStudents, avgProgress, avgScore, atRiskCount });

          return {
            data: {
              totalStudents,
              avgProgress,
              avgScore,
              atRiskCount,
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
