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

export type CognitiveItem = {
  level: BloomLevel;
  score: number;
  questions: number;
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
        // 1️⃣ Lookup student
        const { data: userRow, error: userErr } = await supabase
          .from("users")
          .select("id")
          .eq("email", email.trim())
          .maybeSingle();

        if (userErr) return { error: mapError(userErr) };
        if (!userRow)
          return {
            error: { status: 404, error: "User not found" } as any,
          };
        const studentId = userRow.id;

        // 2️⃣ Get quiz_type_id for "Final Quiz"
        const { data: quizTypeRow, error: quizTypeErr } = await supabase
          .from("quiz_type")
          .select("id")
          .eq("quiz_type", "Final Quiz")
          .maybeSingle();

        if (quizTypeErr) return { error: mapError(quizTypeErr) };
        if (!quizTypeRow)
          return {
            error: {
              status: 404,
              error: "Quiz type 'Final Quiz' not found",
            } as any,
          };
        const quizTypeId = quizTypeRow.id;

        // 3️⃣ Fetch attempt items + results + question Bloom + cheat sheet logs
        const { data, error } = await supabase
          .from("quiz_attempt_item_result")
          .select(`
            is_correct,
            points_earned,
            quiz_attempt_item:quiz_attempt_item!inner (
              id,
              question:question!inner (
                id,
                bloom_level:bloom_level!left (level)
              ),
              quiz_attempt:quiz_attempt!inner (
                id,
                student_id,
                quiz_type_id,
                final_attempt_cheat_sheet_access:final_attempt_cheat_sheet_access!left (
                  id,
                  access_time
                )
              )
            )
          `)
          .eq("quiz_attempt_item.quiz_attempt.student_id", studentId)
          .eq("quiz_attempt_item.quiz_attempt.quiz_type_id", quizTypeId);

        if (error) return { error: mapError(error) };

        const rows = data ?? [];

        // 4️⃣ Compute totals
        const total = rows.length;
        const correct = rows.filter((r) => r.is_correct).length;
        const finalPct = pct(correct, total);

        // There is no time_spent_seconds column in schema — default to 0 for now
        const timeSpentSeconds = 0;

        // Count distinct attempts where any cheat access was logged
        const cheatAccesses = new Set(
          rows
            .map((r) => r.quiz_attempt_item?.quiz_attempt)
            .filter(
              (qa) =>
                qa?.final_attempt_cheat_sheet_access &&
                qa.final_attempt_cheat_sheet_access.length > 0
            )
            .map((qa) => qa?.id)
        ).size;

        // 5️⃣ Bloom-level breakdown
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
          const lv =
            (r.quiz_attempt_item?.question?.bloom_level?.level as BloomLevel) ??
            "Remember";
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
