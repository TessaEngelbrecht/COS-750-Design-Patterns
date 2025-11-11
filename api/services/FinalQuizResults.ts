import { supabase } from "@/lib/supebase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PostgrestError } from "@supabase/supabase-js";

export type BloomLevel =
  | "Remember"
  | "Understand"
  | "Apply"
  | "Analyze"
  | "Evaluate"
  | "Create";

type RowResult = {
  result_id: number;
  student_id: string;
  question_id: number;
  is_correct: boolean;
  time_spent_seconds: number | null;
  cheat_sheet_accessed: boolean | null;
  cheat_sheet_access: number | null;
  final_quiz_questions: { bloom_level: BloomLevel | null } | null; // joined
};

export type CognitiveItem = {
  level: BloomLevel;
  score: number; // 0..100
  questions: number; // count
};

export type FinalSummary = {
  total: number;
  correct: number;
  finalPct: number;
  timeSpentSeconds: number;
  cheatAccesses: number;
  cognitive: CognitiveItem[];
};

export type GetFinalSummaryArgs = {
  email: string;
};

const mapError = (e: PostgrestError) => ({
  status: e.code || "SUPABASE_ERROR",
  error: e.message,
});

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

export const resultsApi = createApi({
  reducerPath: "resultsApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["FinalSummary"],
  endpoints: (builder) => ({
    getFinalSummary: builder.query<FinalSummary, GetFinalSummaryArgs>({
      async queryFn({ email }) {
        const { data: userRow, error: userErr } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (userErr) return { error: mapError(userErr) };
        if (!userRow)
          return { error: { status: 404, error: "User not found" } as any };

        const { data, error } = await supabase
          .from("final_quiz_results")
          .select(
            `
            result_id,
            student_id,
            question_id,
            is_correct,
            time_spent_seconds,
            cheat_sheet_accessed,
            final_quiz_questions:final_quiz_questions!inner (
              bloom_level
            )
          `
          )
          .eq("student_id", userRow.id)
          .order("question_id", { ascending: true });

        if (error) return { error: mapError(error) };

        const rows = (data ?? []) as unknown as RowResult[];
        const total = rows.length;
        const correct = rows.filter((r) => r.is_correct).length;
        const finalPct = pct(correct, total);
        const timeSpentSeconds = rows.reduce(
          (acc, r) => acc + (r.time_spent_seconds ?? 0),
          0
        );
        const cheatAccesses = rows.filter(
          (r) => !!r.cheat_sheet_accessed
        ).length;

        const levels: BloomLevel[] = [
          "Remember",
          "Understand",
          "Apply",
          "Analyze",
          "Evaluate",
          "Create",
        ];
        const tally = new Map<BloomLevel, { total: number; correct: number }>();
        levels.forEach((lv) => tally.set(lv, { total: 0, correct: 0 }));

        rows.forEach((r) => {
          const lv = (r.final_quiz_questions?.bloom_level ??
            "Remember") as BloomLevel;
          const t = tally.get(lv)!;
          t.total += 1;
          if (r.is_correct) t.correct += 1;
        });

        const cognitive = levels.map((lv) => {
          const t = tally.get(lv)!;
          return {
            level: lv,
            score: pct(t.correct, t.total),
            questions: t.total,
          };
        });

        return {
          data: {
            total,
            correct,
            finalPct,
            timeSpentSeconds,
            cheatAccesses,
            cognitive,
          },
        };
      },
      providesTags: (_res, _err, args) => [
        { type: "FinalSummary" as const, id: args.email },
      ],
    }),
  }),
});

export const { useGetFinalSummaryQuery } = resultsApi;
