import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supebase";

export type FinalQuizQuestion = {
  question_id: string; // UUID
  pattern_type: string | null;
  section:
    | "Theory & Concepts"
    | "UML Diagrams"
    | "Code Implementation"
    | "Pattern Participants/Relationships"
    | string;
  bloom_level:
    | "Remember"
    | "Understand"
    | "Apply"
    | "Analyze"
    | "Evaluate"
    | "Create"
    | string;
  difficulty_level: "Easy" | "Medium" | "Hard" | string;
  question_format:
    | "multiple-choice"
    | "select-multiple"
    | "fill-in-blank"
    | "identify-error"
    | "uml-interactive"
    | "drag-drop"
    | string;
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
  quizType?: string; // e.g. "Final Quiz"
};

export type ListResult = { rows: FinalQuizQuestion[]; total: number };

type FinalAttemptStatus =
  | { state: "none" }
  | { state: "active"; attemptId: string; startedAt: string }
  | {
      state: "submitted";
      attemptId: string;
      startedAt: string;
      submittedAt: string;
    };

function throwIf(error?: any): void {
  if (error) {
    const e = new Error(error.message);
    // @ts-expect-error keep original for debugging
    e.code = error.code;
    throw e;
  }
}

// ---- helpers ---------------------------------------------------------------

async function getQuestionIdsForQuizType(
  quizType = "Final Quiz"
): Promise<string[]> {
  const { data: qt, error: qtErr } = await supabase
    .from("quiz_type")
    .select("id")
    .eq("quiz_type", quizType)
    .maybeSingle();
  throwIf(qtErr);
  if (!qt?.id) return [];

  const { data: links, error: linkErr } = await supabase
    .from("question_quiz_type")
    .select("question_id")
    .eq("quiz_type_id", qt.id);
  throwIf(linkErr);

  return (links ?? []).map((r: any) => String(r.question_id));
}

async function fetchFinalQuestionsStrict(args?: ListArgs): Promise<ListResult> {
  let filterIds: string[] | null = null;
  if (args?.quizType) {
    filterIds = await getQuestionIdsForQuizType(args.quizType);
    if (filterIds.length === 0) return { rows: [], total: 0 };
  }

  let q = supabase.from("question_content").select(
    `
      question_id,
      question_text,
      question_data,
      correct_answer,
      points,
      question:question!inner(
        id,
        is_active,
        created_at,
        updated_at,
        question_format:question_format!inner(format),
        bloom_level:bloom_level!inner(level),
        difficulty_level:difficulty_level!inner(difficulty_level),
        sections:sections!inner(section)
      )
    `,
    { count: "exact" }
  );

  if (filterIds) q = q.in("question_id", filterIds);

  const { data, error, count } = await q;
  throwIf(error);

  const raw = (data ?? []) as any[];
  let rows: FinalQuizQuestion[] = raw.map((r) => {
    const qn = r.question ?? {};
    return {
      question_id: String(r.question_id),
      question_text: String(r.question_text ?? ""),
      question_data: (r.question_data ?? {}) as Record<string, unknown>,
      correct_answer: r.correct_answer,
      points: typeof r.points === "number" ? r.points : r.points ?? null,
      created_at: qn.created_at ?? null,
      updated_at: qn.updated_at ?? null,
      is_active: typeof qn.is_active === "boolean" ? qn.is_active : null,
      question_format: qn.question_format?.format ?? "",
      bloom_level: qn.bloom_level?.level ?? "",
      difficulty_level: qn.difficulty_level?.difficulty_level ?? "",
      section: qn.sections?.section ?? "",
      pattern_type: null,
    } as FinalQuizQuestion;
  });

  if (args?.onlyActive ?? true) rows = rows.filter((r) => !!r.is_active);
  if (args?.sections?.length) {
    const set = new Set(args.sections);
    rows = rows.filter((r) => set.has(r.section));
  }
  if (args?.blooms?.length) {
    const set = new Set(args.blooms);
    rows = rows.filter((r) => set.has(r.bloom_level as any));
  }
  if (args?.difficulties?.length) {
    const set = new Set(args.difficulties);
    rows = rows.filter((r) => set.has(r.difficulty_level as any));
  }
  if (args?.formats?.length) {
    const set = new Set(args.formats);
    rows = rows.filter((r) => set.has(r.question_format as any));
  }

  const total = typeof count === "number" ? count : rows.length;
  return { rows, total };
}

async function fetchFinalAttemptStatusStrict(
  email: string,
  quizType = "Final Quiz"
): Promise<FinalAttemptStatus> {
  const { data: userRow, error: userErr } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.trim())
    .maybeSingle();
  throwIf(userErr);
  if (!userRow?.id) return { state: "none" };
  const studentId = String(userRow.id);

  // get quiz_type
  const { data: quizTypeRow, error: typeErr } = await supabase
    .from("quiz_type")
    .select("id")
    .eq("quiz_type", quizType)
    .maybeSingle();
  throwIf(typeErr);
  if (!quizTypeRow?.id) return { state: "none" };
  const quizTypeId = quizTypeRow.id;

  const { data: attempts, error: aErr } = await supabase
    .from("quiz_attempt")
    .select("id, started_at, submitted_at")
    .eq("student_id", studentId)
    .eq("quiz_type_id", quizTypeId)
    .order("started_at", { ascending: false })
    .limit(25);
  throwIf(aErr);

  if (!attempts?.length) return { state: "none" };

  // Prefer the most recent submitted attempt
  for (const a of attempts) {
    if (a.submitted_at) {
      return {
        state: "submitted",
        attemptId: String(a.id),
        startedAt: String(a.started_at),
        submittedAt: String(a.submitted_at),
      };
    }
  }

  // 5️⃣ Otherwise, check for most recent active attempt
  for (const a of attempts) {
    if (!a.submitted_at) {
      return {
        state: "active",
        attemptId: String(a.id),
        startedAt: String(a.started_at),
      };
    }
  }

  return { state: "none" };
}

// ---- API -------------------------------------------------------------------

export const finalQuizApi = createApi({
  reducerPath: "finalQuizApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["FinalQuizQuestions", "FinalAttemptStatus"],
  endpoints: (builder) => ({
    getFinalQuestions: builder.query<ListResult, ListArgs | undefined>({
      async queryFn(args) {
        try {
          const data = await fetchFinalQuestionsStrict(args);
          return { data };
        } catch (e: any) {
          return {
            error: {
              status: e?.code ?? "UNEXPECTED",
              data: e?.message ?? String(e),
            } as any,
          };
        }
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
        try {
          const data = await fetchFinalQuestionsStrict(args);
          return { data };
        } catch (e: any) {
          return {
            error: {
              status: e?.code ?? "UNEXPECTED",
              data: e?.message ?? String(e),
            } as any,
          };
        }
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

    // NEW: tell if the student already took (submitted) or has an active Final attempt
    getFinalAttemptStatus: builder.query<
      FinalAttemptStatus,
      { email: string; quizType?: string }
    >({
      async queryFn({ email, quizType }) {
        try {
          const data = await fetchFinalAttemptStatusStrict(
            email,
            quizType ?? "Final Quiz"
          );
          return { data };
        } catch (e: any) {
          return {
            error: {
              status: e?.code ?? "UNEXPECTED",
              data: e?.message ?? String(e),
            } as any,
          };
        }
      },
      providesTags: (_res, _err, args) => [
        {
          type: "FinalAttemptStatus" as const,
          id: (args.email || "unknown") + "::" + (args.quizType ?? "Final Quiz"),
        },
      ],
    }),
  }),
});

export const {
  useGetFinalQuestionsQuery,
  useGetFinalQuestionsAllQuery,
  useGetFinalAttemptStatusQuery, // << use this in QuizPage
} = finalQuizApi;
