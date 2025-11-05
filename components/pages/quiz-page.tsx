"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGetFinalQuestionsQuery } from "@/api/services/FinalQuiz";
import Image from "next/image";

type MCQuestionData = { options: unknown };
type IdentifyErrorData = { code?: string; language?: string };
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

export interface QuizPageProps {
  onNext: () => void;
}

export function QuizPage({ onNext }: QuizPageProps) {
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

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
    return rows.map((q) => {
      const fmt = q.question_format;
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
        return {
          id: q.question_id,
          kind: "multiple-choice" as const,
          header: `Question ${q.question_id}`,
          stem: toStringSafe(q.question_text),
          options: normalizeOptions(jd?.options),
        };
      }

      if (fmt === "identify-error") {
        const jd = qd as IdentifyErrorData;
        return {
          id: q.question_id,
          kind: "code-fix" as const,
          header: `Question ${q.question_id}`,
          description: toStringSafe(q.question_text),
          code: jd?.code ?? "",
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

  if (isLoading) return <div className="p-6">Loading questions…</div>;
  if (isError)
    return (
      <div className="p-6 text-red-600">
        Error: {String((error as any)?.error ?? error)}
      </div>
    );
  if (!questions.length) return <div className="p-6">No questions found.</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 max-w-5xl mx-auto py-4">
        <div className="space-y-3 sm:space-y-4 mb-20">
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
                    <span className="font-semibold text-slate-900">
                      {`Question ${idx + 1}`}
                    </span>
                  </div>
                  {open ? (
                    <ChevronUp className="text-teal-700 w-5 h-5" />
                  ) : (
                    <ChevronDown className="text-teal-700 w-5 h-5" />
                  )}
                </button>

                {open && (
                  <div>
                    <div className="px-4 sm:px-5 py-4">
                      {q.kind === "fill-in-blank" && (
                        <div>
                          <p className="text-slate-800 mb-3 leading-relaxed">
                            {q.stem}{" "}
                            <span className="border-b-2 border-teal-700 font-bold px-2">
                              {q.blank}
                            </span>{" "}
                          </p>
                          <label className="block text-teal-700 font-semibold mb-1">
                            Answer
                          </label>
                          <Input
                            placeholder="Enter your answer"
                            className="border-2 border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600/40 rounded-lg"
                          />
                        </div>
                      )}

                      {q.kind === "code-fix" && (
                        <div>
                          <p className="text-slate-800 mb-3">{q.description}</p>
                          <Card className="bg-teal-700 text-white p-4 font-mono text-xs sm:text-sm mb-4 whitespace-pre overflow-x-auto rounded-lg">
                            {q.code}
                          </Card>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-teal-700 font-semibold mb-1">
                                Line
                              </label>
                              <Input
                                placeholder="Enter line number"
                                className="border-2 border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600/40 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-teal-700 font-semibold mb-1">
                                Answer
                              </label>
                              <Input
                                placeholder="Enter the fix"
                                className="border-2 border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600/40 rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {q.kind === "multiple-choice" && (
                        <div>
                          <p className="text-slate-900 font-semibold mb-3">
                            {q.stem}
                          </p>

                          <div className="mb-5">
                            {(q as any).options?.map(
                              (
                                opt: { id: string; text: string },
                                idx: number
                              ) => (
                                <p
                                  key={opt.id}
                                  className="text-slate-800 leading-7"
                                >
                                  <span className="font-semibold mr-1">
                                    {String.fromCharCode(65 + idx)})
                                  </span>
                                  {opt.text}
                                </p>
                              )
                            )}
                          </div>

                          <label className="block text-teal-700 font-bold mb-1">
                            Answer
                          </label>
                          <Input
                            placeholder="Enter your answer"
                            className="border-2 border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600/40 rounded-lg"
                          />
                        </div>
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

      <div className="sticky bottom-0 left-0 right-0 bg-white backdrop-blur border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex justify-end">
          <Button
            onClick={onNext}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2 rounded-lg"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
