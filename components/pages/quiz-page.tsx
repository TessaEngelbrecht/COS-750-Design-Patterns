"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGetFinalQuestionsQuery } from "@/api/services/FinalQuiz";
import Image from "next/image";
import { Spinner } from "../ui/spinner";

type MCQuestionData = { options?: unknown };
type IdentifyErrorData = {
  code?: string;
  code_snippet?: string;
  language?: string;
};
type FillInBlankData = { blank?: string };
type NormalizedOption = { id: string; text: string };

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
}

export function QuizPage({ onNext }: QuizPageProps) {
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [mcAnswers, setMcAnswers] = useState<Record<number, string>>({});

  const { data, isLoading, isError, error } = useGetFinalQuestionsQuery({
    page: 1,
    pageSize: 20,
    onlyActive: true,
    formats: ["fill-in-blank", "multiple-choice", "identify-error"],
    sortBy: "question_id",
    ascending: true,
  });

  const questions = useMemo(() => {
    const rows = data?.rows ?? [];
    return rows.map((q: any) => {
      const fmt: string = q.question_format;
      const qd = (q.question_data ?? {}) as unknown;

      if (fmt === "fill-in-blank") {
        const jd = qd as FillInBlankData;
        return {
          id: q.question_id,
          kind: "fill-in-blank" as const,
          header: `Question ${q.question_id}`,
          stem: toStringSafe(q.question_text),
          blank: jd.blank ?? "_______",
        };
      }

      if (fmt === "multiple-choice") {
        const jd = qd as MCQuestionData;
        const options = normalizeOptions(
          (jd as any)?.options ?? (q as any).options
        );
        return {
          id: q.question_id,
          kind: "multiple-choice" as const,
          header: `Question ${q.question_id}`,
          stem: toStringSafe(q.question_text),
          options,
        };
      }

      if (fmt === "identify-error") {
        const jd = qd as IdentifyErrorData;
        const raw =
          (q as any).code_snippet ??
          jd?.code_snippet ??
          jd?.code ??
          (q as any).code ??
          "";
        return {
          id: q.question_id,
          kind: "code-fix" as const,
          header: `Question ${q.question_id}`,
          description: toStringSafe(q.question_text),
          code: String(raw),
        };
      }

      return {
        id: q.question_id,
        kind: "unsupported" as const,
        header: `Question ${q.question_id}`,
        typeLabel: "Unsupported",
        stem: toStringSafe(q.question_text),
        meta: `${q.section} • ${q.bloom_level} • ${q.difficulty_level}`,
      };
    });
  }, [data]);

  const toggle = (id: number) =>
    setExpandedIds((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  const setMC = (qid: number, val: string) =>
    setMcAnswers((s) => ({ ...s, [qid]: val }));

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
        <div className="mb-20 space-y-3 sm:space-y-4">
          {questions.map((q, idx) => {
            const open = expandedIds.includes(q.id);

            return (
              <Card
                key={q.id}
                className="justify-center p-0 border-2 border-teal-700/80 bg-white rounded-xl overflow-hidden shadow-sm"
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
                          <Input
                            placeholder="Enter your answer"
                            className="rounded-lg border-2 border-teal-700"
                          />
                        </div>
                      )}

                      {q.kind === "code-fix" && (
                        <div>
                          <p className="mb-3 text-slate-800">{q.description}</p>

                          <div className="mb-4">
                            <CodeBlock code={q.code} />
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-1 block font-semibold text-teal-700">
                                Line
                              </label>
                              <Input
                                placeholder="Enter line number"
                                className="rounded-lg border-2 border-teal-700"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block font-semibold text-teal-700">
                                Answer
                              </label>
                              <Input
                                placeholder="Enter the fix"
                                className="rounded-lg border-2 border-teal-700"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {q.kind === "multiple-choice" && (
                        <fieldset className="space-y-4">
                          <legend className="mb-3 font-semibold text-slate-900">
                            {q.stem}
                          </legend>

                          <div className="grid gap-3">
                            {(q as any).options?.map(
                              (
                                opt: { id: string; text: string },
                                i: number
                              ) => {
                                const inputId = `q-${q.id}-${opt.id}`;
                                const name = `q-${q.id}`;
                                const checked = mcAnswers[q.id] === opt.id;
                                return (
                                  <label
                                    key={opt.id}
                                    htmlFor={inputId}
                                    className="flex items-center gap-3 rounded-lg border border-gray-300 p-3 cursor-pointer transition hover:border-teal-400"
                                  >
                                    <input
                                      id={inputId}
                                      type="radio"
                                      name={name}
                                      value={opt.id}
                                      checked={checked}
                                      onChange={(e) =>
                                        setMC(q.id, e.target.value)
                                      }
                                      className="h-4 w-4 accent-[#007B7C]"
                                    />
                                    <span className="text-slate-800">
                                      <span className="mr-2 font-semibold">
                                        {String.fromCharCode(65 + i)}.
                                      </span>
                                      {opt.text}
                                    </span>
                                  </label>
                                );
                              }
                            )}
                          </div>
                        </fieldset>
                      )}

                      {q.kind === "unsupported" && (
                        <div className="text-slate-700">
                          Unsupported format. Check <code>question_format</code>{" "}
                          for this row.
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
        <div className="mx-auto flex max-w-5xl justify-end px-4 py-3 sm:px-6">
          <Button
            onClick={onNext}
            className="rounded-lg bg-teal-700 px-6 py-2 font-bold text-white hover:bg-teal-800"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
