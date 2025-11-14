"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { useGetFinalQuestionsQuery } from "@/api/services/FinalQuiz";
import { supabase } from "@/lib/supebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CheatSheetContent from "../cheat-sheet-content";
import type { ListResult } from "@/api/services/FinalQuiz";

/* ============================== Types ============================== */

type NormalizedOption = { id: string; text: string };
type QId = string; // UUID from DB

type MCQuestionData = { options?: unknown };
type IdentifyErrorData = {
  code?: string;
  code_snippet?: string;
  language?: string;
  options?: unknown;
};
type FillInBlankData = { blank?: string };

type Graded =
  | { state: "unanswered" }
  | { state: "correct" }
  | { state: "incorrect"; expected?: string; got?: string }
  | { state: "ungraded" };

type Q =
  | {
    id: QId;
    kind: "fill-in-blank";
    stem: string;
    blank: string;
    acceptable: string[];
    points: number | null;
  }
  | {
    id: QId;
    kind: "multiple-choice";
    stem: string;
    options: NormalizedOption[];
    correct: string;
    code: string;
    points: number | null;
  }
  | {
    id: QId;
    kind: "code-fix";
    stem: string;
    code: string;
    points: number | null;
  }
  | {
    id: QId;
    kind: "unsupported";
    stem: string;
    points: number | null;
  };

/* ============================== Utils ============================== */

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

const normalizeWord = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\(\s*\)$/, "");

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

export interface QuizPageProps {
  onNext: () => void;
  user: string; // JSON string with { email }
}

/* ============================== Component ============================== */

export function QuizPage({ onNext, user }: QuizPageProps) {
  const email = JSON.parse(user ?? "{}")?.email as string | undefined;

  const [expandedIds, setExpandedIds] = useState<QId[]>([]);
  const [locked, setLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedOnce, setSavedOnce] = useState(false);
  const [cheatOpen, setCheatOpen] = useState(false);

  // we still track these for UI; server logs each open in its own table
  const [cheatAccessed, setCheatAccessed] = useState<boolean>(false);
  const [cheatAccessCount, setCheatAccessCount] = useState<number>(0);

  const [mcAnswers, setMcAnswers] = useState<Record<QId, string>>({});
  const [fibAnswers, setFibAnswers] = useState<Record<QId, string>>({});
  const [results, setResults] = useState<Record<QId, Graded>>({});

  const itemRefs = useRef<Record<QId, HTMLDivElement | null>>({});

  const pageStartRef = useRef<number>(Date.now());
  const perQuestionSecondsRef = useRef<Record<QId, number>>({});
  const activeTimerRef = useRef<{ qid: QId | null; start: number | null }>({
    qid: null,
    start: null,
  });

  // keep the current attempt id
  const [attemptId, setAttemptId] = useState<string | null>(null);

  /* ========= timing ========= */

  const stopActiveTimer = () => {
    const { qid, start } = activeTimerRef.current;
    if (qid != null && start != null) {
      const delta = Math.max(0, Math.round((Date.now() - start) / 1000));
      perQuestionSecondsRef.current[qid] =
        (perQuestionSecondsRef.current[qid] ?? 0) + delta;
    }
    activeTimerRef.current = { qid: null, start: null };
  };

  const startTimerFor = (qid: QId) => {
    stopActiveTimer();
    activeTimerRef.current = { qid, start: Date.now() };
  };

  useEffect(() => {
    return () => stopActiveTimer();
  }, []);

  useEffect(() => {
    if (!locked) pageStartRef.current = Date.now();
  }, [locked]);

  /* ========= data ========= */

  const [checking, setChecking] = useState(true);

  const getActiveEmail = (): string | null => {
    if (email?.trim()) return email.trim();
    if (typeof window !== "undefined") {
      const e = localStorage.getItem("email");
      if (e?.trim()) return e.trim();
    }
    return null;
  };

  const { data, isLoading, isError, error } = useGetFinalQuestionsQuery({
    onlyActive: true,
    formats: ["fill-in-blank", "multiple-choice", "identify-error"],
    quizType: "Final Quiz",
  });

  const questions: Q[] = useMemo(() => {
    const rows = ((): any[] => {
      if (data && typeof data === "object" && "rows" in data) {
        return (data as ListResult).rows ?? [];
      }
      return [];
    })();

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
          id: String(q.question_id ?? q.question_id ?? q.id),
          kind: "fill-in-blank" as const,
          stem: toStringSafe(q.question_text),
          blank: jd?.blank ?? "_______",
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
          id: String(q.question_id ?? q.question_id ?? q.id),
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
            id: String(q.question_id ?? q.question_id ?? q.id),
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
          id: String(q.question_id ?? q.question_id ?? q.id),
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
        id: String(q.question_id ?? q.question_id ?? q.id),
        kind: "unsupported" as const,
        stem: toStringSafe(q.question_text),
        points,
      };
    });
  }, [data]);

  const allExpanded =
    questions.length > 0 && expandedIds.length === questions.length;

  const toggleAll = () => {
    stopActiveTimer();
    setExpandedIds(allExpanded ? [] : questions.map((q) => q.id));
  };

  /* ========= attempt helpers ========= */

  async function getOrCreateAttempt(student_id: string) {
    const { data: quizTypeRow, error: typeErr } = await supabase
      .from("quiz_type")
      .select("id")
      .eq("quiz_type", "Final Quiz")
      .limit(1)
      .maybeSingle();
    if (typeErr) throw typeErr;
    if (!quizTypeRow?.id) return { state: "none" };
    const quizTypeId = quizTypeRow.id;

    const { data: existing, error: findErr } = await supabase
      .from("quiz_attempt")
      .select("id, submitted_at")
      .eq("student_id", student_id)
      .eq("quiz_type_id", quizTypeId)
      .is("submitted_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (findErr) throw findErr;
    if (existing?.id) return existing.id as string;

    const { data: created, error: createErr } = await supabase
      .from("quiz_attempt")
      .insert({ student_id:student_id, quiz_type_id: quizTypeId })
      .select("id")
      .single();
    if (createErr) throw createErr;
    return created!.id as string;
  }

  async function getOrCreateAttemptItem(
    quiz_attempt_id: string,
    question_id: string
  ) {
    const { data: found, error: findErr } = await supabase
      .from("quiz_attempt_item")
      .select("id")
      .eq("quiz_attempt_id", quiz_attempt_id)
      .eq("question_id", question_id)
      .maybeSingle();
    if (findErr) throw findErr;
    if (found?.id) return found.id as string;

    const { data: ins, error: insErr } = await supabase
      .from("quiz_attempt_item")
      .insert({ quiz_attempt_id, question_id })
      .select("id")
      .single();
    if (insErr) throw insErr;
    return ins.id as string;
  }

  // Prepare an attempt once we know the student
  useEffect(() => {
    (async () => {
      try {
        const activeEmail = getActiveEmail();
        if (!activeEmail) return;

        const { data: userRow, error: userErr } = await supabase
          .from("users")
          .select("id")
          .eq("email", activeEmail)
          .maybeSingle();
        if (userErr || !userRow?.id) return;

        const attempt = await getOrCreateAttempt(userRow.id as string);
        setAttemptId(attempt);
      } catch (e) {
        console.warn("init attempt failed", e);
      } finally {
        setChecking(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, questions.length]);

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Spinner />
        <div className="mt-2 text-slate-600">Checking your quiz status…</div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Spinner />
        <div className="mt-2 text-slate-600">Loading questions…</div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="p-6 text-red-600">
        Error loading questions: {String((error as any)?.error ?? error)}
      </div>
    );
  }
  if (!questions.length) return <div className="p-6">No questions found.</div>;

  /* ========= interaction ========= */

  const toggle = (id: QId) => {
    setExpandedIds((s) => {
      const isOpen = s.includes(id);
      if (isOpen) {
        if (activeTimerRef.current.qid === id) stopActiveTimer();
        return s.filter((x) => x !== id);
      } else {
        startTimerFor(id);
        return [...s, id];
      }
    });
  };

  const isAnswered = (q: Q): boolean => {
    if (q.kind === "multiple-choice") return !!mcAnswers[q.id];
    if (q.kind === "fill-in-blank") return !!fibAnswers[q.id]?.trim();
    if (q.kind === "code-fix") return true;
    return true;
  };

  const firstUnansweredId = (): QId | null => {
    for (const q of questions) if (!isAnswered(q)) return q.id;
    return null;
  };

  const scrollToQuestion = (id: QId) => {
    setExpandedIds((s) => (s.includes(id) ? s : [...s, id]));
    startTimerFor(id);
    const el = itemRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const gradeAll = () => {
    const next: Record<QId, Graded> = {};
    for (const q of questions) {
      if (q.kind === "multiple-choice") {
        const picked = mcAnswers[q.id];
        if (!picked) next[q.id] = { state: "unanswered" };
        else if (picked === q.correct) next[q.id] = { state: "correct" };
        else next[q.id] = { state: "incorrect", got: picked };
      } else if (q.kind === "fill-in-blank") {
        const typed = fibAnswers[q.id];
        if (!typed || !typed.trim()) next[q.id] = { state: "unanswered" };
        else {
          const ok = (q.acceptable ?? []).some(
            (a: string) => normalizeWord(a) === normalizeWord(typed)
          );
          next[q.id] = ok
            ? { state: "correct" }
            : { state: "incorrect", got: typed };
        }
      } else {
        next[q.id] = { state: "ungraded" };
      }
    }
    setResults(next);
  };

  const getElapsedSeconds = () => {
    stopActiveTimer();
    const perQ = Object.values(perQuestionSecondsRef.current).reduce(
      (a, b) => a + (b || 0),
      0
    );
    const pageTotal = Math.max(
      0,
      Math.round((Date.now() - pageStartRef.current) / 1000)
    );
    return Math.max(perQ, pageTotal);
  };

  /* ========= SAVE (new schema) ========= */

  async function saveResults(
    activeEmail: string | null,
    _elapsedSeconds?: number,
    markSubmitted: boolean = true
  ) {
    setSaveError(null);
    setSaving(true);
    try {
      const emailTrim = activeEmail?.trim();
      if (!emailTrim) throw new Error("Missing email when saving results.");

      // resolve student
      const { data: userRow, error: userErr } = await supabase
        .from("users")
        .select("id")
        .eq("email", emailTrim)
        .maybeSingle();
      if (userErr) throw userErr;
      if (!userRow?.id) throw new Error("User not found for provided email.");
      const student_id = userRow.id as string;

      // ensure attempt
      let aId = attemptId;
      if (!aId) {
        aId = await getOrCreateAttempt(student_id);
        setAttemptId(aId);
      }

      // create/update attempt items + results
      const jobs: Promise<any>[] = [];

      for (const q of questions) {
        if (q.kind === "multiple-choice") {
          const picked = mcAnswers[q.id] ?? null;
          const is_correct = picked ? picked === q.correct : false;
          const points_earned = is_correct ? q.points ?? 0 : 0;
          const question_id = String(q.id);

          jobs.push(
            (async () => {
              const itemId = await getOrCreateAttemptItem(aId!, question_id);
              const { error: resErr } = await supabase
                .from("quiz_attempt_item_result")
                .upsert({
                  quiz_attempt_item_id: itemId,
                  is_correct,
                  points_earned,
                });
              if (resErr) throw resErr;
            })()
          );
        } else if (q.kind === "fill-in-blank") {
          const typed = (fibAnswers[q.id] ?? "").trim();
          const ok =
            !!typed &&
            (q.acceptable ?? []).some(
              (a: string) => normalizeWord(a) === normalizeWord(typed)
            );
          const is_correct = ok;
          const points_earned = is_correct ? q.points ?? 0 : 0;
          const question_id = String(q.id);

          jobs.push(
            (async () => {
              const itemId = await getOrCreateAttemptItem(aId!, question_id);
              const { error: resErr } = await supabase
                .from("quiz_attempt_item_result")
                .upsert({
                  quiz_attempt_item_id: itemId,
                  is_correct,
                  points_earned,
                });
              if (resErr) throw resErr;
            })()
          );
        } else {
          // code-fix / unsupported -> not scored here
        }
      }

      await Promise.all(jobs);

      // finalize attempt
      if (markSubmitted) {
        const { error: subErr } = await supabase
          .from("quiz_attempt")
          .update({ submitted_at: new Date().toISOString() })
          .eq("id", aId!);
        if (subErr) throw subErr;
      }

      setSavedOnce(true);
      return true;
    } catch (e: any) {
      console.error("saveResults error:", e);
      setSaveError(e?.message || String(e));
      return false;
    } finally {
      setSaving(false);
    }
  }

  const handleContinue = async () => {
    const activeEmail = getActiveEmail();

    if (locked) {
      if (!savedOnce) {
        const ok = await saveResults(activeEmail, getElapsedSeconds(), true);
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

    stopActiveTimer();
    gradeAll();
    setLocked(true);

    const ok = await saveResults(activeEmail, getElapsedSeconds(), true);
    if (!ok) return;
  };

  /* ============================== Render ============================== */

  const cardChrome = (qId: QId) => {
    const r = results[qId];
    if (!r) return "border-2 border-teal-700/80 bg-white";
    if (r.state === "correct")
      return "border-2 border-emerald-600 bg-emerald-50";
    if (r.state === "incorrect") return "border-2 border-rose-600 bg-rose-50";
    if (r.state === "unanswered")
      return "border-2 border-amber-500 bg-amber-50";
    return "border-2 border-slate-300 bg-white";
  };

  const headerBadge = (qId: QId) => {
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

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-[72px] left-0 right-0 border-b border-slate-200 bg-white backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <Dialog
              open={cheatOpen}
              onOpenChange={async (next) => {
                if (!cheatOpen && next) {
                  setCheatAccessed(true);
                  setCheatAccessCount((c) => c + 1);

                  // log a cheat-sheet access for this attempt
                  try {
                    const activeEmail = getActiveEmail();
                    if (activeEmail) {
                      const { data: userRow } = await supabase
                        .from("users")
                        .select("id")
                        .eq("email", activeEmail)
                        .maybeSingle();
                      if (userRow?.id) {
                        let aId = attemptId;
                        if (!aId) {
                          aId = await getOrCreateAttempt(userRow.id as string);
                          setAttemptId(aId);
                        }
                        if (aId) {
                          await supabase
                            .from("final_attempt_cheat_sheet_access")
                            .insert({ attempt_id: aId });
                        }
                      }
                    }
                  } catch (e) {
                    console.warn("cheat sheet access log failed:", e);
                  }
                }
                setCheatOpen(next);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-lg border border-teal-200 px-3 py-2 text-teal-700 hover:bg-teal-50"
                >
                  <img
                    src="/icons/idea.svg"
                    alt=""
                    className="h-[24px] w-[24px]"
                  />
                </Button>
              </DialogTrigger>

              {/* Scrollable dialog */}
              <DialogContent className="max-w-[92vw] lg:max-w-6xl h-[85vh] p-0 overflow-hidden flex flex-col">
                <DialogHeader className="px-6 pt-4 pb-3 border-b shrink-0">
                  <DialogTitle className="text-teal-700">
                    Quick Reference
                  </DialogTitle>
                </DialogHeader>

                <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-2 pb-3">
                  <h2 className="font-bold text-teal-700">Introduction</h2>
                  <span>
                    The Observer Pattern creates a one-to-many link between a Subject and its Observers. When the Subject changes state, all registered Observers are automatically notified and updated. It allows dynamic attach/detach and keeps components loosely coupled.
                  </span>

                  <h2 className="font-bold text-teal-700 mt-4">Intent</h2>
                  <ul className="list-disc ml-6 space-y-1">
                    <li><strong>Name:</strong> Observer</li>
                    <li><strong>Classification:</strong> Behavioural Pattern</li>
                    <li><strong>Strategy:</strong> Delegation (Object)
                    </li>
                    <li>
                      <strong>Intent:</strong> Define a one-to-many dependency so that when
                      one object changes state, all its dependents are notified and updated
                      automatically.
                    </li>
                  </ul>

                  <h2 className="font-bold text-teal-700 mt-4">Participants</h2>
                  <ul className="list-disc ml-6 space-y-1">
                    <li><strong>Subject</strong> – interface for attaching and detaching observers.</li>
                    <li><strong>ConcreteSubject</strong> – implements storage and notifies observers on state change.</li>
                    <li><strong>Observer</strong> – defines an <code>update()</code> interface.</li>
                    <li><strong>ConcreteObserver</strong> – keeps a reference to the subject and updates its own state
                    </li>
                  </ul>

                  <h2 className="font-bold text-teal-700 mt-4">Structure</h2>

                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {`interface Subject {
    attach(o: Observer): void;
    detach(o: Observer): void;
    notify(): void;
}

interface Observer {
    update(subject: Subject): void;
}`}
                  </pre>
                </div>
              </DialogContent>
            </Dialog>

            {/* Expand/Collapse All */}
            <button
              onClick={toggleAll}
              className="inline-flex items-center gap-2 rounded-lg border border-teal-200 px-3 py-2 text-teal-700 hover:bg-teal-50"
              aria-expanded={allExpanded}
              aria-label={
                allExpanded ? "Collapse all questions" : "Expand all questions"
              }
            >
              {allExpanded ? (
                <>
                  <ChevronUp className="h-5 w-5" />
                  <span className="font-medium">Collapse all</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-5 w-5" />
                  <span className="font-medium">Expand all</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4">
        {saveError && (
          <div className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-rose-700">
            Couldn’t save your results: {saveError}
          </div>
        )}

        <div className="mb-20 space-y-3 sm:space-y-4">
          {questions.map((q, idx) => {
            const open = expandedIds.includes(q.id);
            return (
              <Card
                key={q.id}
                ref={(el) => {
                  itemRefs.current[q.id] = el;
                }}
                className={`justify-center p-0 rounded-xl overflow-hidden shadow-sm ${cardChrome(
                  q.id
                )}`}
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
                                {results[q.id]?.state === "correct" ? (
                                  <img
                                    src="/icons/check.svg"
                                    alt=""
                                    className="h-[24px] w-[24px]"
                                  />
                                ) : results[q.id]?.state === "incorrect" ? (
                                  <img
                                    src="/icons/cross.svg"
                                    alt=""
                                    className="h-[24px] w-[24px]"
                                  />
                                ) : (
                                  ""
                                )}
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

                              const showCorrect = graded?.state === "correct";
                              const isCorrectOpt =
                                showCorrect && correctId === opt.id;
                              const isWrongPicked =
                                graded?.state === "incorrect" && checked;

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
                                isCorrectOpt ? gradedCorrect : "",
                                isWrongPicked ? gradedWrong : "",
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
                                      ""
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
