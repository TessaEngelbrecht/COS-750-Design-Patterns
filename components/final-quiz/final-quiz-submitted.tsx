// components/final-quiz/final-quiz-submitted.tsx
"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";

type NormalizedOption = { id: string; text: string };

type SubmittedQuestion = {
  question_id: string;
  question_format: string;
  question_text: string;
  question_data: any;
  correct_answer: any;
  points: number;

  section?: string | null;
  bloom_level?: string | null;
  difficulty?: string | null;

  student_answer: any;
  is_correct: boolean;
  points_earned: number;
};

type Props = {
  questions: SubmittedQuestion[];
  attemptId: string;
  onNext?: () => void;
};

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
  return (
    <pre className="m-0 whitespace-pre rounded-lg bg-slate-900 p-3 font-mono text-sm leading-5 text-white overflow-x-auto">
      <code>{text}</code>
    </pre>
  );
}

export default function FinalQuizSubmitted({
  questions,
  attemptId,
  onNext,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<string[]>(
    questions.map((q) => q.question_id)
  );

  const totalPoints = useMemo(
    () => questions.reduce((s, q) => s + (q.points ?? 0), 0),
    [questions]
  );
  const earnedPoints = useMemo(
    () => questions.reduce((s, q) => s + (q.points_earned ?? 0), 0),
    [questions]
  );
  const scorePct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  const toggle = (qid: string) => {
    setExpandedIds((prev) =>
      prev.includes(qid) ? prev.filter((x) => x !== qid) : [...prev, qid]
    );
  };

  const allExpanded =
    questions.length > 0 &&
    expandedIds.length === questions.length;

  const toggleAll = () => {
    if (allExpanded) setExpandedIds([]);
    else setExpandedIds(questions.map((q) => q.question_id));
  };

  const renderUserAnswer = (q: SubmittedQuestion) => {
    const sa = q.student_answer ?? {};
    if (q.question_format === "fill-in-blank") {
      const blanks = sa.blanks ?? {};
      const entries = Object.entries(blanks) as [string, string][];
      if (!entries.length) return "No answer";
      return entries
        .map(([pos, val]) => `Blank ${pos}: ${val}`)
        .join(", ");
    }
    if (q.question_format === "select-multiple") {
      const ids: string[] = sa.answers ?? [];
      const options = normalizeOptions(q.question_data?.options ?? []);
      const map = new Map(options.map((o) => [o.id, o.text]));
      return ids.length
        ? ids.map((id) => map.get(id) ?? id).join(", ")
        : "No answer";
    }
    // single-choice
    const id = sa.answer ?? "";
    const options = normalizeOptions(q.question_data?.options ?? []);
    const found = options.find((o) => o.id === id);
    return found ? found.text : id || "No answer";
  };

  const renderCorrectAnswer = (q: SubmittedQuestion) => {
    const ca = q.correct_answer ?? {};
    if (q.question_format === "fill-in-blank") {
      const blanks = ca.blanks ?? [];
      if (!Array.isArray(blanks) || !blanks.length) return "";
      return blanks
        .map(
          (b: any) =>
            `Blank ${b.position}: ${(b.answers ?? []).join(" or ")}`
        )
        .join(", ");
    }
    if (q.question_format === "select-multiple") {
      const ids: string[] = ca.answers ?? [];
      const options = normalizeOptions(q.question_data?.options ?? []);
      const map = new Map(options.map((o) => [o.id, o.text]));
      return ids.length
        ? ids.map((id) => map.get(id) ?? id).join(", ")
        : "";
    }
    const id = ca.answer ?? "";
    const options = normalizeOptions(q.question_data?.options ?? []);
    const found = options.find((o) => o.id === id);
    return found ? found.text : id;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Score Summary */}
      <div className="border-b border-slate-200 bg-white sticky top-[72px] z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Final Quiz Results
            </h2>
            <p className="text-sm text-slate-600">
              Attempt ID: <span className="font-mono text-xs">{attemptId}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-teal-700">
              {scorePct}%
            </div>
            <div className="text-sm text-slate-700">
              {earnedPoints} / {totalPoints} points
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex justify-between items-center">
        <button
          onClick={toggleAll}
          className="inline-flex items-center gap-2 rounded-lg border border-teal-200 px-3 py-2 text-teal-700 hover:bg-teal-50"
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

        {onNext && (
          <Button
            onClick={onNext}
            className="rounded-lg bg-teal-700 text-white px-6 py-2 font-semibold"
          >
            Go to Overall Results
          </Button>
        )}
      </div>

      {/* Questions */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 pb-8 space-y-4">
        {questions.map((q, idx) => {
          const open = expandedIds.includes(q.question_id);
          const userText = renderUserAnswer(q);
          const correctText = renderCorrectAnswer(q);

          return (
            <Card
              key={q.question_id}
              className={`overflow-hidden rounded-xl border-2 ${
                q.is_correct
                  ? "border-emerald-600 bg-emerald-50/40"
                  : "border-rose-500 bg-rose-50/40"
              }`}
            >
              <button
                onClick={() => toggle(q.question_id)}
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
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span>{`Question ${idx + 1}`}</span>
                      {q.is_correct ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      )}
                    </div>
                    <div className="text-xs text-slate-600 space-x-2">
                      {q.section && <span>{q.section}</span>}
                      {q.difficulty && <span>• {q.difficulty}</span>}
                      {q.bloom_level && <span>• {q.bloom_level}</span>}
                      <span>• {q.points_earned}/{q.points} pts</span>
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
                <div className="px-4 pb-4 sm:px-5 space-y-3">
                  <p className="text-slate-800 font-medium">
                    {q.question_text}
                  </p>

                  {q.question_data?.code_snippet && (
                    <CodeBlock code={q.question_data.code_snippet} />
                  )}

                  <p className="text-sm text-slate-800">
                    <span className="font-semibold">Your answer: </span>
                    <span
                      className={
                        q.is_correct ? "text-emerald-700" : "text-rose-700"
                      }
                    >
                      {userText}
                    </span>
                  </p>

                  {!q.is_correct && (
                    <p className="text-sm text-slate-800">
                      <span className="font-semibold">Correct answer: </span>
                      <span className="text-emerald-700">
                        {correctText}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </main>
    </div>
  );
}
