import { supabase } from "@/lib/supebase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import type { PostgrestError } from "@supabase/supabase-js"

export type StudentPerformanceSummary = {
  summary_id: number
  student_id: string | null
  pre_quiz_score: number | null
  pre_quiz_attempts: number | null
  pre_quiz_confidence_level: number | null
  prior_experience: string | null
  struggling_sections: Record<string, any> | null
  practice_quiz_avg_score: number | null
  practice_quiz_attempts: number | null
  practice_quiz_best_score: number | null
  final_quiz_score: number | null
  final_quiz_attempts: number | null
  cheat_sheet_access_count: number | null
  total_time_spent_minutes: number | null
  section_scores: Record<string, any> | null
  bloom_scores: Record<string, any> | null
  flagged_for_intervention: boolean | null
  intervention_reason: string | null
  last_updated: string | null
  created_at: string | null
  users?: {
    first_name?: string
    last_name?: string
    email?: string
  }
}

export type DashboardListArgs = {
  page?: number
  pageSize?: number
  onlyFlagged?: boolean
  searchText?: string
  sortBy?: keyof StudentPerformanceSummary
  ascending?: boolean
}

export type DashboardListResult = { rows: StudentPerformanceSummary[]; total: number }

const mapError = (e: PostgrestError) => ({
  status: e.code || "SUPABASE_ERROR",
  error: e.message,
})

export const educatorDashboardApi = createApi({
  reducerPath: "educatorDashboardApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["StudentPerformance"],
  endpoints: (builder) => ({
    getStudentsPerformance: builder.query<DashboardListResult, DashboardListArgs | void>({
      async queryFn(args) {
        const page = args?.page ?? 1;
        const pageSize = args?.pageSize ?? 20;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        try {
          let q = supabase
            .from("student_performance_summary")
            .select(
              "*, users!student_performance_summary_student_id_fkey(first_name,last_name,email)",
              { count: "exact" }
            )
            .order(args?.sortBy ?? "created_at", { ascending: args?.ascending ?? false })
            .range(from, to);

          if (args?.onlyFlagged) q = q.eq("flagged_for_intervention", true);

          if (args?.searchText?.trim())
            q = q.ilike(
              "users!student_performance_summary_student_id_fkey.first_name",
              `%${args.searchText.trim()}%`
            );

          const { data, error, count } = await q;
          if (error) return { error: mapError(error) };

          const studentIds = (data ?? []).map((item: any) => item.student_id).filter(Boolean);

          let attemptsMap: Record<string, number> = {};
          if (studentIds.length > 0) {
            const { data: attemptData, error: attemptError } = await supabase
              .from("practice_quiz_results")
              .select("student_id, attempt_number")
              .in("student_id", studentIds);

            if (!attemptError && attemptData) {
              attemptData.forEach((row: any) => {
                const sid = row.student_id;
                const attempt = Number(row.attempt_number ?? 0);
                attemptsMap[sid] = Math.max(attemptsMap[sid] ?? 0, attempt);
              });
            }
          }

          const rows = (data ?? []).map((item: any) => ({
            ...item,
            practice_quiz_attempts: attemptsMap[item.student_id] ?? 0, // use dynamic attempts
            users: item.users
              ? {
                ...item.users,
                full_name: `${item.users.first_name ?? ""} ${item.users.last_name ?? ""}`.trim(),
              }
              : undefined,
          }));

          return {
            data: {
              rows,
              total: count ?? 0,
            },
          };
        } catch (err: any) {
          return { error: { status: "UNKNOWN_ERROR", error: String(err?.message ?? err) } };
        }
      },
      providesTags: (result) =>
        result
          ? [
            ...result.rows.map((r) => ({ type: "StudentPerformance" as const, id: r.summary_id })),
            { type: "StudentPerformance" as const, id: "LIST" },
          ]
          : [{ type: "StudentPerformance" as const, id: "LIST" }],
    }),
  }),
})

export const { useGetStudentsPerformanceQuery } = educatorDashboardApi
