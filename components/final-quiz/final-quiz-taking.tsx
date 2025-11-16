// components/final-quiz/final-quiz-taking.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import CheatSheetDialog from "@/components/final-quiz/cheat-sheet-dialog";

type FinalQuestion = {
  question_id: string;
  question_format: string; // "fill-in-blank" | "multiple-choice" | "select-multiple" | "identify-error"
  question_text: string;
  question_data: any; // { options?: {id,text}[], blanks?: any[], code_snippet?: string, ... }
  points: number;
  bloom_level?: string | null;
  difficulty?: string | null;
  section?: string | null;
};

type Props = {
  questions: FinalQuestion[];
  attemptId: string;
  onSubmit: (payload: {
    answers: {
      question_id: string;
      question_format: string;
      student_answer: any;
      time_spent_seconds: number;
    }[];
  }) => Promise<void> | void;
};

type NormalizedOption = { id: string; text: string };

function toStringSafe(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "text" in (v as any))
    return String((v as any).text);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

function normalizeOptions(opts: unknown): NormalizedOption[] {
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
}

function coerceMultiline(s: string): string {
  if (!s) return "";
  let t = s;

  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    try {
      if (t.startsWith('"') && t.endsWith('"')) return JSON.parse(t);
    } catch {}
    t = t.slice(1, -1);
  }

  if (!t.includes("\n") && /\\n/.test(t)) {
    t = t.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
  }
  t = t.replace(/\\t/g, "\t");
  return t;
}

function CodeBlock({ code }: { code: string }) {
  const raw = typeof code === "string" ? code : "";
  const text = coerceMultiline(raw).replace(/\r/g, "");
  const lines = text.split("\n");
  const digits = String(lines.length).length;
  const numbered = lines
    .map((ln, i) => `${String(i + 1).padStart(digits, " ")}. ${ln ?? ""}`)
    .join("\n");
  return (
    <pre className="m-0 whitespace-pre rounded-lg bg-teal-700 p-3 font-mono text-sm leading-5 text-white overflow-x-auto">
      <code>{numbered}</code>
    </pre>
  );
}

export default function FinalQuizTaking({
  questions,
  attemptId,
  onSubmit,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<string[]>(
    questions.length ? [questions[0].question_id] : []
  );

  const [mcAnswers, setMcAnswers] = useState<Record<string, string>>({});
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string[]>>(
    {}
  );
  const [blankAnswers, setBlankAnswers] = useState<
    Record<string, Record<number, string>>
  >({});
  const [saving, setSaving] = useState(false);

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const perQuestionSecondsRef = useRef<Record<string, number>>({});
  const activeTimerRef = useRef<{ qid: string | null; start: number | null }>({
    qid: null,
    start: null,
  });

  // timing helpers
  const stopActiveTimer = () => {
    const { qid, start } = activeTimerRef.current;
    if (qid && start != null) {
      const delta = Math.max(0, Math.round((Date.now() - start) / 1000));
      perQuestionSecondsRef.current[qid] =
        (perQuestionSecondsRef.current[qid] ?? 0) + delta;
    }
    activeTimerRef.current = { qid: null, start: null };
  };

  const startTimerFor = (qid: string) => {
    stopActiveTimer();
    activeTimerRef.current = { qid, start: Date.now() };
  };

  useEffect(() => {
    if (questions[0]) startTimerFor(questions[0].question_id);
    return () => stopActiveTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleExpand = (qid: string) => {
    setExpandedIds((prev) => {
      const isOpen = prev.includes(qid);
      if (isOpen) {
        if (activeTimerRef.current.qid === qid) stopActiveTimer();
        return prev.filter((x) => x !== qid);
      } else {
        startTimerFor(qid);
        return [...prev, qid];
      }
    });
  };

  const toggleMulti = (qid: string, optId: string) => {
    setMultiAnswers((prev) => {
      const existing = prev[qid] ?? [];
      if (existing.includes(optId)) {
        return { ...prev, [qid]: existing.filter((x) => x !== optId) };
      }
      return { ...prev, [qid]: [...existing, optId] };
    });
  };

  const setBlank = (qid: string, pos: number, value: string) => {
    setBlankAnswers((prev) => ({
      ...prev,
      [qid]: { ...(prev[qid] ?? {}), [pos]: value },
    }));
  };

  const handleSubmit = async () => {
    stopActiveTimer();
    setSaving(true);
    try {
      const answersPayload = questions.map((q) => {
        let student_answer: any = null;
        if (q.question_format === "fill-in-blank") {
          student_answer = { blanks: blankAnswers[q.question_id] ?? {} };
        } else if (q.question_format === "select-multiple") {
          student_answer = { answers: multiAnswers[q.question_id] ?? [] };
        } else {
          student_answer = { answer: mcAnswers[q.question_id] ?? "" };
        }

        return {
          question_id: q.question_id,
          question_format: q.question_format,
          student_answer,
          time_spent_seconds: perQuestionSecondsRef.current[q.question_id] ?? 0,
        };
      });

      await onSubmit({ answers: answersPayload });
    } finally {
      setSaving(false);
    }
  };

  const allExpanded =
    questions.length > 0 &&
    expandedIds.length === questions.length;

  const toggleAll = () => {
    stopActiveTimer();
    if (allExpanded) setExpandedIds([]);
    else setExpandedIds(questions.map((q) => q.question_id));
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-[72px] left-0 right-0 border-b border-slate-200 bg-white backdrop-blur z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center justify-between">
            
            {/* Left side */}
            <div className="flex items-center gap-4">
            <span className="font-semibold text-teal-700">Final Quiz</span>

            <CheatSheetDialog
                attemptId={attemptId}
                onOpenLog={async () => {
                await fetch("/api/final-quiz/cheat-sheet-access", {
                    method: "POST",
                    body: JSON.stringify({ attemptId }),
                });
                }}
            />
            </div>

            {/* Right side */}
            <button
            onClick={toggleAll}
            className="inline-flex items-center gap-2 rounded-lg border border-teal-200 px-3 py-2 text-teal-700 hover:bg-teal-50"
            aria-expanded={allExpanded}
            >
            {allExpanded ? (
                <>
                <ChevronUp className="h-5 w-5" />
                <span>Collapse all</span>
                </>
            ) : (
                <>
                <ChevronDown className="h-5 w-5" />
                <span>Expand all</span>
                </>
            )}
            </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-4 space-y-4">
        {questions.map((q, idx) => {
          const open = expandedIds.includes(q.question_id);
          const qData = q.question_data ?? {};
          const options = normalizeOptions(qData.options ?? []);
          const blanksMeta =
            Array.isArray(qData.blanks) && qData.blanks.length > 0
              ? qData.blanks
              : [{ position: 1 }];

          return (
            <Card
              key={q.question_id}
              ref={(el) => {
                itemRefs.current[q.question_id] = el;
              }}
              className="overflow-hidden rounded-xl border border-teal-700/70"
            >
              <button
                onClick={() => toggleExpand(q.question_id)}
                className="w-full flex items-center justify-between p-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src="/material-symbols_help.svg"
                    alt=""
                    width={32}
                    height={32}
                    priority
                  />
                  <div>
                    <div className="font-semibold text-slate-900">
                      {`Question ${idx + 1}`}
                    </div>
                    <div className="text-xs text-slate-600 space-x-2">
                      {q.section && <span>{q.section}</span>}
                      {q.difficulty && <span>• {q.difficulty}</span>}
                      {q.bloom_level && <span>• {q.bloom_level}</span>}
                    </div>
                  </div>
                </div>
                {open ? (
                  <ChevronUp className="h-5 w-5 text-teal-700" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-teal-700" />
                )}
              </button>

              {open && (
                <div className="px-4 pb-4 sm:px-5 space-y-4">
                  <p className="mt-1 text-slate-800">{q.question_text}</p>

                  {qData.code_snippet && (
                    <CodeBlock code={qData.code_snippet} />
                  )}

                  {/* Fill in blank (supports multi-blanks) */}
                  {q.question_format === "fill-in-blank" && (
                    <div className="space-y-3">
                      {blanksMeta.map((b: any, i: number) => {
                        const pos = b.position ?? i + 1;
                        const value =
                          blankAnswers[q.question_id]?.[pos] ?? "";
                        return (
                          <div key={pos}>
                            <label className="block text-sm font-semibold text-teal-700 mb-1">
                              {`Blank ${pos}`}
                            </label>
                            <Input
                              value={value}
                              onChange={(e) =>
                                setBlank(q.question_id, pos, e.target.value)
                              }
                              placeholder="Enter your answer"
                              className="rounded-lg border-2 border-teal-700"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Select-multiple */}
                  {q.question_format === "select-multiple" && (
                    <div className="space-y-2">
                      {options.map((opt, i) => {
                        const chosen =
                          (multiAnswers[q.question_id] ?? []).includes(
                            opt.id
                          );
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              toggleMulti(q.question_id, opt.id)
                            }
                            className={`w-full flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm ${
                              chosen
                                ? "border-teal-700 bg-teal-50"
                                : "border-slate-300 hover:border-teal-500"
                            }`}
                          >
                            <span className="mt-0.5 font-semibold">
                              {String.fromCharCode(65 + i)}.
                            </span>
                            <span>{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Multiple-choice / identify-error (single id) */}
                  {(q.question_format === "multiple-choice" ||
                    q.question_format === "identify-error") &&
                    options.length > 0 && (
                      <div className="space-y-2">
                        {options.map((opt, i) => {
                          const chosen =
                            mcAnswers[q.question_id] === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() =>
                                setMcAnswers((prev) => ({
                                  ...prev,
                                  [q.question_id]: opt.id,
                                }))
                              }
                              className={`w-full flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm ${
                                chosen
                                  ? "border-teal-700 bg-teal-50"
                                  : "border-slate-300 hover:border-teal-500"
                              }`}
                            >
                              <span className="mt-0.5 font-semibold">
                                {String.fromCharCode(65 + i)}.
                              </span>
                              <span>{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                </div>
              )}
            </Card>
          );
        })}
      </main>

      <footer className="sticky bottom-0 left-0 right-0 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex justify-end">
          <Button
            onClick={handleSubmit}
            className="rounded-lg bg-teal-700 text-white px-6 py-2 font-semibold"
            disabled={saving}
          >
            {saving ? "Submitting…" : "Submit Final Quiz"}
          </Button>
        </div>
      </footer>
    </div>
  );
}
