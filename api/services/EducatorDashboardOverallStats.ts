import { supabase } from "@/lib/supebase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PostgrestError } from "@supabase/supabase-js";

export type DashboardStats = {
  totalStudents: number;
  avgProgress: number; // Average practice quiz
  avgScore: number;    // Average final quiz
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
          // Fetch all necessary scores and intervention flags
          const { data, error } = await supabase
            .from("student_performance_summary")
            .select("practice_quiz_avg_score, final_quiz_score, flagged_for_intervention");

          if (error) return { error: mapError(error) };
          if (!data) return { data: { totalStudents: 0, avgProgress: 0, avgScore: 0, atRiskCount: 0 } };

          const totalStudents = data.length;
          const avgProgress =
            totalStudents > 0
              ? data.reduce((sum, s) => sum + (s.practice_quiz_avg_score ?? 0), 0) / totalStudents
              : 0;
          const avgScore =
            totalStudents > 0
              ? data.reduce((sum, s) => sum + (s.final_quiz_score ?? 0), 0) / totalStudents
              : 0;
          const atRiskCount = data.filter((s) => s.flagged_for_intervention).length;

          return {
            data: {
              totalStudents,
              avgProgress,
              avgScore,
              atRiskCount,
            },
          };
        } catch (e: any) {
          return { error: { status: "UNKNOWN_ERROR", error: e.message } };
        }
      },
      providesTags: [{ type: "DashboardStats", id: "LIST" }],
    }),
  }),
});

export const { useGetStatsQuery } = educatorDashboardStatsApi;
