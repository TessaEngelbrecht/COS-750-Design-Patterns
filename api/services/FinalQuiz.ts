import { supabase } from "@/lib/supebase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PostgrestError } from "@supabase/supabase-js";

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
  question_text: unknown;
  question_data: unknown;
  correct_answer: unknown;
  points: number | null;
  created_at: string | null;
  updated_at: string | null;
  is_active: boolean | null;
};

export type ListArgs = {
  page?: number;
  pageSize?: number;
  searchText?: string;
  sections?: FinalQuizQuestion["section"][];
  blooms?: FinalQuizQuestion["bloom_level"][];
  difficulties?: FinalQuizQuestion["difficulty_level"][];
  formats?: FinalQuizQuestion["question_format"][];
  onlyActive?: boolean;
  sortBy?: keyof FinalQuizQuestion;
  ascending?: boolean;
};

export type ListResult = { rows: FinalQuizQuestion[]; total: number };

const mapError = (e: PostgrestError) => ({
  status: e.code || "SUPABASE_ERROR",
  error: e.message,
});

export const finalQuizApi = createApi({
  reducerPath: "finalQuizApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["FinalQuizQuestions"],
  endpoints: (builder) => ({
    getFinalQuestions: builder.query<ListResult, ListArgs | void>({
      async queryFn(args) {
        const page = args?.page ?? 1;
        const pageSize = args?.pageSize ?? 20;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let q = supabase
          .from("final_quiz_questions")
          .select("*", { count: "exact" })
          .order(args?.sortBy ?? "question_id", {
            ascending: args?.ascending ?? true,
          })
          .range(from, to);

        if (args?.onlyActive ?? true) q = q.eq("is_active", true);
        if (args?.sections?.length) q = q.in("section", args.sections);
        if (args?.blooms?.length) q = q.in("bloom_level", args.blooms);
        if (args?.difficulties?.length)
          q = q.in("difficulty_level", args.difficulties);
        if (args?.formats?.length) q = q.in("question_format", args.formats);
        if (args?.searchText?.trim())
          q = q.ilike("question_text", `%${args.searchText.trim()}%`);

        const { data, error, count } = await q;
        if (error) return { error: mapError(error) };
        return {
          data: {
            rows: (data ?? []) as FinalQuizQuestion[],
            total: count ?? 0,
          },
        };
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

export const { useGetFinalQuestionsQuery } = finalQuizApi;
