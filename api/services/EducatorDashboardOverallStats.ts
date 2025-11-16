import { supabase } from "@/lib/supebase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PostgrestError } from "@supabase/supabase-js";

export type DashboardStats = {
  totalStudents: number;
  avgProgress: number;
  avgScore: number;
  atRiskCount: number;
};

export type DesignPattern = {
  id: string;
  design_pattern: string;
  description: string | null;
  icon: string | null;
  active: boolean | null;
};

const mapError = (e: PostgrestError) => ({
  status: e.code || "SUPABASE_ERROR",
  error: e.message,
});


export const educatorDashboardStatsApi = createApi({
  reducerPath: "educatorDashboardStatsApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["DashboardStats", "DesignPatterns"],
  endpoints: (builder) => ({

    getStats: builder.query<DashboardStats, void>({
      async queryFn() {
        try {
          const { data: allStudents, error: allStudentsError } = await supabase
            .from("users")
            .select("id")
            .eq("role", "student");

          if (allStudentsError) {
            console.error("Error fetching total students:", allStudentsError);
            return { error: mapError(allStudentsError) };
          }

          const totalStudents = allStudents?.length ?? 0;

          const { data: quizAttempts, error: quizError } = await supabase
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

          if (quizError) {
            console.error("Supabase Error fetching quiz_attempt:", quizError);
            return { error: mapError(quizError) };
          }

          const processedAttempts = (quizAttempts ?? []).map((attempt: any) => {
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
            if (!finalByStudent[a.student_id]) finalByStudent[a.student_id] = a;
          });

          const avgScore =
            Object.values(finalByStudent).length > 0
              ? Object.values(finalByStudent)
                  .map((a: any) => (a.totalQuestions > 0 ? (a.correctAnswers / a.totalQuestions) * 100 : 0))
                  .reduce((sum, s) => sum + s, 0) / Object.values(finalByStudent).length
              : 0;

          const { data: unresolvedData, error: unresolvedError } = await supabase
            .from("intervention_trigger_log")
            .select(`
              learning_profile:learning_profile_id (
                student_id
              )
            `)
            .is("resolved", false)

          if (unresolvedError) {
            console.error("Error fetching unresolved interventions:", unresolvedError);
            return { error: mapError(unresolvedError) };
          }

          const atRiskStudentIds = new Set(
            (unresolvedData ?? []).map(row => row.learning_profile.student_id)
          );

          const validStudentIds = new Set((allStudents ?? []).map(s => s.id));
          const atRiskCount = [...atRiskStudentIds].filter(id => validStudentIds.has(id)).length;

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

    getDesignPatterns: builder.query<DesignPattern[], void>({
      async queryFn() {
        const { data, error } = await supabase
          .from("design_patterns")
          .select("*")
          .order("design_pattern");

        if (error) return { error: mapError(error) };

        return { data: data ?? [] };
      },
      providesTags: [{ type: "DesignPatterns", id: "LIST" }],
    }),
  }),
});


export const { useGetStatsQuery, useGetDesignPatternsQuery } = educatorDashboardStatsApi;
