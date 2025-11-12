import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supebase";

export type FinalQuizQuestion = {
  question_id: number;
  pattern_type: string;
  section:
    | "Theory & Concepts"
    | "UML Diagrams"
    | "Code Implementation"
    | "Pattern Participants/Relationships";
  bloom_level:
    | "Remember"
    | "Understand"
    | "Apply"
    | "Analyze"
    | "Evaluate"
    | "Create";
  difficulty_level: "Easy" | "Medium" | "Hard";
  question_format:
    | "multiple-choice"
    | "select-multiple"
    | "fill-in-blank"
    | "identify-error"
    | "uml-interactive"
    | "drag-drop";
  question_text: string;
  question_data: Record<string, unknown>;
  correct_answer: unknown;
  points: number | null;
  created_at: string | null;
  updated_at: string | null;
  is_active: boolean | null;
};

export type ListArgs = {
  sections?: FinalQuizQuestion["section"][];
  blooms?: FinalQuizQuestion["bloom_level"][];
  difficulties?: FinalQuizQuestion["difficulty_level"][];
  formats?: FinalQuizQuestion["question_format"][];
  onlyActive?: boolean;
};

export type ListResult = { rows: FinalQuizQuestion[]; total: number };

const mapError = (e: PostgrestError) => ({
  status: e.code || "SUPABASE_ERROR",
  error: e.message,
});

interface HasFilters {
  eq: (col: string, val: unknown) => any;
  in: (col: string, vals: unknown[]) => any;
  ilike: (col: string, pattern: string) => any;
}

const applyCommonFilters = <T extends HasFilters>(
  q: T,
  args?: Omit<ListArgs, "page" | "pageSize" | "noPagination">
): T => {
  const onlyActive = args?.onlyActive ?? true;
  let qb = q;
  if (onlyActive) qb = qb.eq("is_active", true);
  if (args?.sections?.length) qb = qb.in("section", args.sections);
  if (args?.blooms?.length) qb = qb.in("bloom_level", args.blooms);
  if (args?.difficulties?.length)
    qb = qb.in("difficulty_level", args.difficulties);
  if (args?.formats?.length) qb = qb.in("question_format", args.formats);
  return qb;
};

export const finalQuizApi = createApi({
  reducerPath: "finalQuizApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["FinalQuizQuestions"],
  endpoints: (builder) => ({
    getFinalQuestions: builder.query<ListResult, ListArgs | undefined>({
      async queryFn(args) {
        let q = supabase.from("final_quiz_questions").select("*");

        q = applyCommonFilters(q, args);

        const { data, error, count } = await q;
        if (error) return { error: mapError(error) } as const;

        const rows = (data ?? []) as FinalQuizQuestion[];
        const total = typeof count === "number" ? count : rows.length;
        return { data: { rows, total } } as const;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.rows.map((r) => ({
                type: "FinalQuizQuestions" as const,
                id: r.question_id,
              })),
              { type: "FinalQuizQuestions" as const, id: "LIST" },
            ]
          : [{ type: "FinalQuizQuestions" as const, id: "LIST" }],
    }),

    getFinalQuestionsAll: builder.query<
      ListResult,
      Omit<ListArgs, "page" | "pageSize" | "noPagination"> | undefined
    >({
      async queryFn(args) {
        let q = supabase.from("final_quiz_questions").select("*");
        q = applyCommonFilters(q, args);

        const { data, error } = await q;
        if (error) return { error: mapError(error) } as const;

        const rows = (data ?? []) as FinalQuizQuestion[];
        return { data: { rows, total: rows.length } } as const;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.rows.map((r) => ({
                type: "FinalQuizQuestions" as const,
                id: r.question_id,
              })),
              { type: "FinalQuizQuestions" as const, id: "LIST" },
            ]
          : [{ type: "FinalQuizQuestions" as const, id: "LIST" }],
    }),
  }),
});

export const { useGetFinalQuestionsQuery, useGetFinalQuestionsAllQuery } =
  finalQuizApi;
