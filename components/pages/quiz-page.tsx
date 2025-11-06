"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGetFinalQuestionsQuery } from "@/api/services/FinalQuiz";
import Image from "next/image";
import { Spinner } from "../ui/spinner";
import { supabase } from "@/lib/supebase";

type MCQuestionData = { options?: unknown };
type IdentifyErrorData = {
  code?: string;
  code_snippet?: string;
  language?: string;
  options?: unknown;
};
type FillInBlankData = { blank?: string };
type NormalizedOption = { id: string; text: string };

type QKind = "fill-in-blank" | "multiple-choice" | "code-fix" | "unsupported";

type Graded =
  | { state: "unanswered" }
  | { state: "correct" }
  | { state: "incorrect"; expected?: string; got?: string }
  | { state: "ungraded" };

type Q =
  | {
      id: number;
      kind: "fill-in-blank";
      stem: string;
      blank: string;
      acceptable: string[];
      points: number | null;
    }
  | {
      id: number;
      kind: "multiple-choice";
      stem: string;
      options: NormalizedOption[];
      correct: string;
      code: string;
      points: number | null;
    }
  | {
      id: number;
      kind: "code-fix";
      stem: string;
      code: string;
      points: number | null;
    }
  | {
      id: number;
      kind: "unsupported";
      stem: string;
      points: number | null;
    };

const toStringSafe = (v: unknown): string => {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "text" in (v as any))
    return String((v as any).text);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
};

const normalizeOptions = (opts: unknown): NormalizedOption[] => {
  if (!Array.isArray(opts)) return [];
  return opts.map((o, i) => {
    if (typeof o === "string")
      return { id: String.fromCharCode(65 + i), text: o };
    if (o && typeof o === "object") {
      const id = String((o as any).id ?? String.fromCharCode(65 + i));
      const text = toStringSafe((o as any).text ?? (o as any).label ?? "");
      return { id, text };
    }
    return { id: String.fromCharCode(65 + i), text: String(o ?? "") };
  });
};

function CodeBlock({ code }: { code: string }) {
  const raw = typeof code === "string" ? code : "";
  const lines = raw.replace(/\r/g, "").split("\n");
  const digits = String(lines.length).length;
  const numbered = lines
    .map((ln, i) => `${String(i + 1).padStart(digits, " ")}. ${ln ?? ""}`)
    .join("\n");
  return (
    <pre className="m-0 rounded-lg bg-teal-700 p-3 font-mono text-sm italic leading-5 text-white whitespace-pre">
      <code>{numbered}</code>
    </pre>
  );
}

export interface QuizPageProps {
  onNext: () => void;
  email: string;
}

export function QuizPage({ onNext, email }: QuizPageProps) {
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedOnce, setSavedOnce] = useState(false);

  const [mcAnswers, setMcAnswers] = useState<Record<number, string>>({});
  const [fibAnswers, setFibAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, Graded>>({});

  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const { data, isLoading, isError, error } = useGetFinalQuestionsQuery({
    page: 1,
    pageSize: 20,
    onlyActive: true,
    formats: ["fill-in-blank", "multiple-choice", "identify-error"],
    sortBy: "question_id",
    ascending: true,
  });

  const questions: Q[] = useMemo(() => {
    const rows = data?.rows ?? [];
    return rows.map((q: any) => {
      const fmt: string = q.question_format;
      const qd = (q.question_data ?? {}) as unknown;
      const points: number | null = q.points ?? null;

      if (fmt === "fill-in-blank") {
        const jd = qd as FillInBlankData;
        const acceptable =
          (q.correct_answer?.blanks?.[0]?.answers as string[] | undefined) ??
          [];
        return {
          id: q.question_id,
          kind: "fill-in-blank" as const,
          stem: toStringSafe(q.question_text),
          blank: jd.blank ?? "_______",
          acceptable,
          points,
        };
      }

      if (fmt === "multiple-choice") {
        const jd = qd as MCQuestionData;
        const options = normalizeOptions(
          (jd as any)?.options ?? (q as any).options
        );
        const correct = String(q.correct_answer?.answer ?? "");
        return {
          id: q.question_id,
          kind: "multiple-choice" as const,
          stem: toStringSafe(q.question_text),
          options,
          correct,
          code: String(
            (q as any).code_snippet ??
              (qd as any)?.code_snippet ??
              (qd as any)?.code ??
              (q as any).code ??
              ""
          ),
          points,
        };
      }

      if (fmt === "identify-error") {
        const jd = qd as IdentifyErrorData;
        const options = normalizeOptions(jd?.options ?? (q as any).options);
        if (options.length > 0) {
          const correct = String(q.correct_answer?.answer ?? "");
          return {
            id: q.question_id,
            kind: "multiple-choice" as const,
            stem: toStringSafe(q.question_text),
            options,
            correct,
            code: String(
              (q as any).code_snippet ??
                jd?.code_snippet ??
                jd?.code ??
                (q as any).code ??
                ""
            ),
            points,
          };
        }
        return {
          id: q.question_id,
          kind: "code-fix" as const,
          stem: toStringSafe(q.question_text),
          code: String(
            (q as any).code_snippet ??
              jd?.code_snippet ??
              jd?.code ??
              (q as any).code ??
              ""
          ),
          points,
        };
      }

      return {
        id: q.question_id,
        kind: "unsupported" as const,
        stem: toStringSafe(q.question_text),
        points,
      };
    });
  }, [data]);

  const toggle = (id: number) =>
    setExpandedIds((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );

  const normalizeWord = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/\(\s*\)$/, "");

  const isAnswered = (q: Q): boolean => {
    if (q.kind === "multiple-choice") return !!mcAnswers[q.id];
    if (q.kind === "fill-in-blank") return !!fibAnswers[q.id]?.trim();
    if (q.kind === "code-fix") return true;
    return true;
  };

  const firstUnansweredId = (): number | null => {
    for (const q of questions) if (!isAnswered(q)) return q.id;
    return null;
  };

  const scrollToQuestion = (id: number) => {
    setExpandedIds((s) => (s.includes(id) ? s : [...s, id]));
    const el = itemRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // grading
  const gradeAll = () => {
    const next: Record<number, Graded> = {};
    for (const q of questions) {
      if (q.kind === "multiple-choice") {
        const picked = mcAnswers[q.id];
        if (!picked) next[q.id] = { state: "unanswered" };
        else if (picked === q.correct) next[q.id] = { state: "correct" };
        else
          next[q.id] = { state: "incorrect", expected: q.correct, got: picked };
      } else if (q.kind === "fill-in-blank") {
        const typed = fibAnswers[q.id];
        if (!typed || !typed.trim()) next[q.id] = { state: "unanswered" };
        else {
          const ok = (q.acceptable ?? []).some(
            (a: string) => normalizeWord(a) === normalizeWord(typed)
          );
          next[q.id] = ok
            ? { state: "correct" }
            : {
                state: "incorrect",
                expected: (q.acceptable ?? [])[0],
                got: typed,
              };
        }
      } else {
        next[q.id] = { state: "ungraded" };
      }
    }
    setResults(next);
  };

  async function saveResults(activeEmail: string) {
    setSaveError(null);
    setSaving(true);
    try {
      let emailTrim = activeEmail?.trim();
      emailTrim = "alice.johnson@university.ac.za";
      if (!emailTrim) throw new Error("Missing email when saving results.");

      const { data: userRow, error: userErr } = await supabase
        .from("users")
        .select("id")
        .eq("email", emailTrim)
        .maybeSingle();
      if (userErr) throw userErr;
      if (!userRow?.id) throw new Error("User not found for provided email.");
      const student_id = userRow.id as string;

      const rowsToInsert = questions
        .filter(
          (q) => q.kind === "multiple-choice" || q.kind === "fill-in-blank"
        )
        .map((q) => {
          if (q.kind === "multiple-choice") {
            const picked = mcAnswers[q.id] ?? null;
            const graded = results[q.id];
            const is_correct = graded?.state === "correct";
            const points_earned = is_correct ? q.points ?? 0 : 0;
            return {
              student_id,
              question_id: q.id,
              student_answer: { answer: picked },
              is_correct,
              points_earned,
              time_spent_seconds: null,
              cheat_sheet_accessed: false,
            };
          } else {
            const typed = (fibAnswers[q.id] ?? "").trim();
            const graded = results[q.id];
            const is_correct = graded?.state === "correct";
            const points_earned = is_correct ? q.points ?? 0 : 0;
            return {
              student_id,
              question_id: q.id,
              student_answer: { answer: typed },
              is_correct,
              points_earned,
              time_spent_seconds: null,
              cheat_sheet_accessed: false,
            };
          }
        });

      if (!rowsToInsert.length) {
        setSavedOnce(true);
        return true;
      }

      const up = await supabase
        .from("final_quiz_results")
        .upsert(rowsToInsert, { onConflict: "student_id,question_id" });

      if (!up.error) {
        setSavedOnce(true);
        return true;
      }

      if (up.error.code === "42P10") {
        const qids = rowsToInsert.map((r) => r.question_id);

        const { error: delErr } = await supabase
          .from("final_quiz_results")
          .delete()
          .eq("student_id", student_id)
          .in("question_id", qids);
        if (delErr) throw delErr;

        const { error: insErr } = await supabase
          .from("final_quiz_results")
          .insert(rowsToInsert);
        if (insErr) throw insErr;

        setSavedOnce(true);
        return true;
      }

      throw up.error;
    } catch (e: any) {
      console.error("saveResults error:", e);
      setSaveError(e?.message || String(e));
      return false;
    } finally {
      setSaving(false);
    }
  }

  const handleContinue = async () => {
    if (locked) {
      if (!savedOnce) {
        const ok = await saveResults(email);
        if (!ok) return;
      }
      onNext();
      return;
    }

    const missing = firstUnansweredId();
    if (missing !== null) {
      scrollToQuestion(missing);
      return;
    }

    gradeAll();
    setLocked(true);
    const ok = await saveResults(email);
    if (!ok) return;
  };

  const cardChrome = (qId: number) => {
    const r = results[qId];
    if (!r) return "border-2 border-teal-700/80 bg-white";
    if (r.state === "correct")
      return "border-2 border-emerald-600 bg-emerald-50";
    if (r.state === "incorrect") return "border-2 border-rose-600 bg-rose-50";
    if (r.state === "unanswered")
      return "border-2 border-amber-500 bg-amber-50";
    return "border-2 border-slate-300 bg-white";
  };

  const headerBadge = (qId: number) => {
    const r = results[qId];
    if (!r) return null;
    if (r.state === "correct")
      return (
        <img src="/icons/check.svg" alt="" className="h-[24px] w-[24px]" />
      );
    if (r.state === "incorrect")
      return (
        <img src="/icons/cross.svg" alt="" className="h-[24px] w-[24px]" />
      );
    if (r.state === "unanswered")
      return <span className="ml-2 text-amber-500">•</span>;
    return <span className="ml-2 text-slate-400">⧗</span>;
  };

  if (isLoading) return <Spinner />;
  if (isError)
    return (
      <div className="p-6 text-red-600">
        Error: {String((error as any)?.error ?? error)}
      </div>
    );
  if (!questions.length) return <div className="p-6">No questions found.</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4">
        {saveError && (
          <div className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-rose-700">
            Couldn’t save your results: {saveError}
          </div>
        )}

        <div className="mb-20 space-y-3 sm:space-y-4">
          {questions.map((q, idx) => {
            const open = expandedIds.includes(q.id);
            const chrome = cardChrome(q.id);

            return (
              <Card
                key={q.id}
                ref={(el) => {
                  itemRefs.current[q.id] = el;
                }}
                className={`justify-center p-0 rounded-xl overflow-hidden shadow-sm ${chrome}`}
              >
                <button
                  onClick={() => toggle(q.id)}
                  className="w-full flex items-center justify-between p-[12px] text-left"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Image
                      src="/material-symbols_help.svg"
                      alt=""
                      width={32}
                      height={32}
                      priority
                    />
                    <span className="font-semibold text-slate-900">{`Question ${
                      idx + 1
                    }`}</span>
                    {headerBadge(q.id)}
                  </div>
                  {open ? (
                    <ChevronUp className="h-5 w-5 text-teal-700" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-teal-700" />
                  )}
                </button>

                {open && (
                  <div>
                    <div className="px-4 pb-4 sm:px-5">
                      {q.kind === "fill-in-blank" && (
                        <div>
                          <p className="mb-3 leading-relaxed text-slate-800">
                            {q.stem}
                          </p>
                          <label className="mb-1 block font-semibold text-teal-700">
                            Answer
                          </label>
                          <div className="relative">
                            <Input
                              value={fibAnswers[q.id] ?? ""}
                              onChange={(e) =>
                                !locked &&
                                setFibAnswers((s) => ({
                                  ...s,
                                  [q.id]: e.target.value,
                                }))
                              }
                              placeholder="Enter your answer"
                              disabled={locked}
                              className={`rounded-lg border-2 pr-9 ${
                                results[q.id]?.state === "incorrect"
                                  ? "border-rose-600"
                                  : results[q.id]?.state === "correct"
                                  ? "border-emerald-600"
                                  : results[q.id]?.state === "unanswered"
                                  ? "border-amber-500"
                                  : "border-teal-700"
                              }`}
                            />
                            {results[q.id]?.state && (
                              <span
                                className={`absolute right-3 top-1/2 -translate-y-1/2 text-lg ${
                                  results[q.id]?.state === "correct"
                                    ? "text-emerald-600"
                                    : results[q.id]?.state === "incorrect"
                                    ? "text-rose-600"
                                    : "text-amber-500"
                                }`}
                              >
                                {results[q.id]?.state === "correct"
                                  ? "✔"
                                  : results[q.id]?.state === "incorrect"
                                  ? "✖"
                                  : "•"}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {q.kind === "multiple-choice" && (
                        <fieldset className="space-y-4" aria-disabled={locked}>
                          <legend className="mb-3 font-semibold text-slate-900">
                            {q.stem}
                          </legend>

                          {q.code ? (
                            <div className="mb-3">
                              <CodeBlock code={q.code} />
                            </div>
                          ) : null}

                          <div className="grid gap-3">
                            {q.options.map((opt, i) => {
                              const inputId = `q-${q.id}-${opt.id}`;
                              const name = `q-${q.id}`;
                              const picked = mcAnswers[q.id];
                              const checked = picked === opt.id;
                              const graded = results[q.id];
                              const correctId = q.correct;

                              const isCorrectOpt =
                                graded && correctId === opt.id;
                              const isWrongPicked =
                                graded && checked && correctId !== opt.id;

                              const base =
                                "flex items-center justify-between rounded-lg border p-3 transition";
                              const selectable =
                                "cursor-pointer hover:border-teal-400";
                              const chosen =
                                "border-teal-600 ring-2 ring-teal-200 bg-teal-50";
                              const neutral = "border-gray-300";
                              const gradedCorrect =
                                "border-emerald-600 bg-emerald-50";
                              const gradedWrong = "border-rose-600 bg-rose-50";

                              const labelClass = [
                                base,
                                !locked ? selectable : "cursor-default",
                                checked && !graded ? chosen : "",
                                !checked && !graded ? neutral : "",
                                graded && isCorrectOpt ? gradedCorrect : "",
                                graded && isWrongPicked ? gradedWrong : "",
                              ].join(" ");

                              return (
                                <label
                                  key={opt.id}
                                  htmlFor={inputId}
                                  className={labelClass}
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      id={inputId}
                                      type="radio"
                                      name={name}
                                      value={opt.id}
                                      checked={checked}
                                      disabled={locked}
                                      onChange={(e) =>
                                        !locked &&
                                        setMcAnswers((s) => ({
                                          ...s,
                                          [q.id]: e.target.value,
                                        }))
                                      }
                                      className="h-4 w-4 accent-[#007B7C]"
                                    />
                                    <span className="text-slate-800">
                                      <span className="mr-2 font-semibold">
                                        {String.fromCharCode(65 + i)}.
                                      </span>
                                      {opt.text}
                                    </span>
                                  </div>

                                  {graded ? (
                                    isCorrectOpt ? (
                                      <img
                                        src="/icons/check.svg"
                                        alt=""
                                        className="h-[24px] w-[24px]"
                                      />
                                    ) : isWrongPicked ? (
                                      <img
                                        src="/icons/cross.svg"
                                        alt=""
                                        className="h-[24px] w-[24px]"
                                      />
                                    ) : (
                                      <span className="text-slate-300">•</span>
                                    )
                                  ) : null}
                                </label>
                              );
                            })}
                          </div>
                        </fieldset>
                      )}

                      {q.kind === "code-fix" && (
                        <div>
                          <p className="mb-3 text-slate-800">{q.stem}</p>
                          <div className="mb-4">
                            <CodeBlock code={q.code ?? ""} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 border-t border-slate-200 bg-white backdrop-blur">
        <div className="mx-auto flex max-w-5xl justify-end gap-3 px-4 py-3 sm:px-6">
          <Button
            onClick={handleContinue}
            className="rounded-lg bg-[#007B7C] px-6 py-2 font-bold text-white hover:brightness-110 disabled:opacity-60"
            disabled={saving}
          >
            {locked
              ? saving
                ? "Saving…"
                : "Next"
              : saving
              ? "Saving…"
              : "Continue (Mark)"}
          </Button>
        </div>
      </div>
    </div>
  );
}
