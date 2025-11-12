"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/lib/supebase";

type BloomLevel =
  | "Remember"
  | "Understand"
  | "Apply"
  | "Analyze"
  | "Evaluate"
  | "Create";

type RowResult = {
  result_id: number;
  student_id: string;
  question_id: number;
  is_correct: boolean;
  points_earned: number | null;
  time_spent_seconds: number | null;
  cheat_sheet_accessed: boolean | null;
  cheat_sheet_access: any | null;
  final_quiz_questions: {
    bloom_level: BloomLevel | null;
    points: number | null;
  } | null;
};

type CognitiveBucket = { level: BloomLevel; score: number; questions: number };

interface ResultsPageProps {
  onNext: () => void;
  email?: string;
  practicePct?: number;
}

function pct(n: number, d: number) {
  return d ? Math.round((n / d) * 100) : 0;
}
function fmtHours(totalSeconds: number) {
  return totalSeconds ? `${(totalSeconds / 3600).toFixed(1)}h` : "0h";
}
type Recommendation = { title: string; bullets: string[] };

function makeLevelTip(level: BloomLevel): string[] {
  switch (level) {
    case "Remember":
      return [
        "Create a one-page summary of the Observer pattern participants and responsibilities.",
        "Drill flashcards for key terms (Subject, Observer, ConcreteSubject, ConcreteObserver).",
      ];
    case "Understand":
      return [
        "Explain the pattern in your own words and contrast it with Pub/Sub.",
        "Sketch the UML from memory, then check against the reference.",
      ];
    case "Apply":
      return [
        "Implement a small Observer example (e.g., WeatherStation → Displays).",
        "Refactor an existing class to emit updates via Observer instead of direct calls.",
      ];
    case "Analyze":
      return [
        "Compare push vs pull models; list trade-offs for data size, coupling, and performance.",
        "Identify when Observer is overkill—write two scenarios where direct calls are simpler.",
      ];
    case "Evaluate":
      return [
        "Review code and judge correctness of attach/detach/notify implementations.",
        "Check for edge cases: re-entrancy, self-detach, notification storms.",
      ];
    case "Create":
      return [
        "Design an event system with batched notifications and throttling; justify choices.",
        "Extend the pattern with async delivery using a queue or thread pool.",
      ];
    default:
      return [];
  }
}

export function ResultsPage({
  onNext,
  email: emailProp,
  practicePct,
}: ResultsPageProps) {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [rows, setRows] = useState<RowResult[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (emailProp) {
        if (!cancelled) setEmail(emailProp);
        return;
      }

      try {
        const { data: session } = await supabase.auth.getSession();
        const user = localStorage.getItem("user");
        const email = JSON.parse(user || "{}")?.email;
        if (!cancelled) setEmail(email);
      } catch {
        if (!cancelled) setEmail(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [emailProp]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setLoadError(null);

      try {
        if (!email) {
          if (mounted) {
            setRows([]);
            setLoading(false);
          }
          return;
        }

        const { data: userRow, error: userErr } = await supabase
          .from("users")
          .select("id")
          .eq("email", email.trim())
          .maybeSingle();
        if (userErr) throw userErr;

        if (!userRow?.id) {
          if (mounted) {
            setRows([]);
            setLoading(false);
          }
          return;
        }

        const { data: resultRows, error: resErr } = await supabase
          .from("final_quiz_results")
          .select(
            `
            result_id,
            student_id,
            question_id,
            is_correct,
            points_earned,
            time_spent_seconds,
            cheat_sheet_accessed,
            cheat_sheet_access,
            final_quiz_questions!inner (
              bloom_level,
              points
            )
          `
          )
          .eq("student_id", userRow.id)
          .order("question_id", { ascending: true });

        if (resErr) throw resErr;

        type RawRow = Omit<RowResult, "final_quiz_questions"> & {
          final_quiz_questions:
            | Array<{ bloom_level: BloomLevel | null; points: number | null }>
            | { bloom_level: BloomLevel | null; points: number | null }
            | null;
        };

        const normalized: RowResult[] = (resultRows ?? []).map((r: RawRow) => ({
          result_id: r.result_id,
          student_id: r.student_id,
          question_id: r.question_id,
          is_correct: r.is_correct,
          points_earned: r.points_earned ?? null,
          time_spent_seconds: r.time_spent_seconds ?? null,
          cheat_sheet_accessed: r.cheat_sheet_accessed ?? null,
          cheat_sheet_access: r.cheat_sheet_access ?? null,
          final_quiz_questions: Array.isArray(r.final_quiz_questions)
            ? r.final_quiz_questions[0] ?? null
            : r.final_quiz_questions ?? null,
        }));

        if (mounted) {
          setRows(normalized);
          setLoading(false);
        }
      } catch (e: any) {
        if (mounted) {
          setLoadError(e?.message || String(e));
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [email]);

  const { finalPct, cheatAccesses, timeSpent, cognitive, totalAnswered } =
    useMemo(() => {
      const total = rows.length;
      const correct = rows.filter((r) => r.is_correct).length;
      const finalPct = pct(correct, total);

      const cheatAccesses = rows.length ? rows[0]?.cheat_sheet_access ?? 0 : 0;
      const timeSpent = rows.length ? rows[0]?.time_spent_seconds ?? 0 : 0;

      const levels: BloomLevel[] = [
        "Remember",
        "Understand",
        "Apply",
        "Analyze",
        "Evaluate",
        "Create",
      ];
      const buckets = new Map<BloomLevel, { total: number; correct: number }>();
      levels.forEach((lv) => buckets.set(lv, { total: 0, correct: 0 }));

      rows.forEach((r) => {
        const lv = (r.final_quiz_questions?.bloom_level ??
          "Remember") as BloomLevel;
        const b = buckets.get(lv)!;
        b.total += 1;
        if (r.is_correct) b.correct += 1;
      });

      const cognitive: CognitiveBucket[] = levels.map((lv) => {
        const b = buckets.get(lv)!;
        return {
          level: lv,
          score: pct(b.correct, b.total),
          questions: b.total,
        };
      });

      return {
        finalPct,
        cheatAccesses,
        timeSpent,
        cognitive,
        totalAnswered: total,
      };
    }, [rows]);

  const improvementPct =
    typeof practicePct === "number" ? finalPct - practicePct : undefined;

  const bloomLow = cognitive.some((c) => c.questions > 0 && c.score < 50);
  const needsIntervention = bloomLow || cheatAccesses >= 20;

  const status:
    | { kind: "fail"; title: string; msg: string; bg: string; icon: string }
    | { kind: "warn"; title: string; msg: string; bg: string; icon: string }
    | { kind: "pass"; title: string; msg: string; bg: string; icon: string } =
    finalPct < 50
      ? {
          kind: "fail",
          title: "Failed",
          msg: "You have not completed the Observer Pattern module, test retake needed.",
          bg: "bg-[#F2C7C7]",
          icon: "/icons/icon_two.svg",
        }
      : needsIntervention
      ? {
          kind: "warn",
          title: "CONGRATULATIONS!",
          msg: "You have completed the Observer Pattern module — some intervention is recommended.",
          bg: "bg-[#FFFF00]/50",
          icon: "/icons/icon_one.svg",
        }
      : {
          kind: "pass",
          title: "CONGRATULATIONS!",
          msg: "You have completed the Observer Pattern module.",
          bg: "bg-[#C7DCF2]",
          icon: "/icons/icon_three.svg",
        };

  const recommendations: Recommendation[] = useMemo(() => {
    const recs: Recommendation[] = [];

    if (finalPct < 50) {
      recs.push({
        title: "Primary Actions",
        bullets: [
          "Retake the Observer module after reviewing the study guide.",
          "Schedule a 30-minute revision focusing on the weakest Bloom levels below.",
        ],
      });
    } else if (needsIntervention) {
      recs.push({
        title: "Primary Actions",
        bullets: [
          "You passed, but some areas need attention—target the two weakest levels.",
          "Do one applied coding task to consolidate learning (see tips below).",
        ],
      });
    } else {
      recs.push({
        title: "Primary Actions",
        bullets: [
          "Solid performance—maintain with spaced practice (2× 20-minute sessions this week).",
          "Try a project-level application (async notifications / throttled updates).",
        ],
      });
    }

    if (cheatAccesses >= 20) {
      recs.push({
        title: "Academic Integrity & Independence",
        bullets: [
          "Reduce reliance on the cheat sheet—attempt questions unaided first, then verify.",
          "Use the checklist: Can I explain Subject/Observer responsibilities without notes?",
        ],
      });
    }

    if (timeSpent < 20 * 60 && totalAnswered >= 10) {
      recs.push({
        title: "Pacing",
        bullets: [
          "Your time-on-task suggests rushing. Allocate at least 45–60 minutes for the full quiz.",
          "Read stems carefully; for code items, predict the update flow before answering.",
        ],
      });
    }

    const weak = [...cognitive]
      .filter((c) => c.questions > 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 2);
    if (weak.length) {
      recs.push({
        title: "Targeted Skill Focus",
        bullets: weak.flatMap((w) => [
          `Focus on "${w.level}" (current ${w.score}%).`,
          ...makeLevelTip(w.level),
        ]),
      });
    }

    if (typeof improvementPct === "number") {
      if (improvementPct >= 15) {
        recs.push({
          title: "Momentum",
          bullets: [
            `Great improvement (+${improvementPct}%). Keep the cadence: two short sessions this week.`,
          ],
        });
      } else if (improvementPct < 0) {
        recs.push({
          title: "Course-correct",
          bullets: [
            `Your score dropped (${improvementPct}%). Revisit mis-answered items and re-attempt similar ones.`,
          ],
        });
      }
    }

    if (!recs.length) {
      recs.push({
        title: "Keep It Up",
        bullets: [
          "Maintain spaced practice and try a real-world refactor to Observer in a small codebase.",
        ],
      });
    }

    return recs;
  }, [
    finalPct,
    needsIntervention,
    cheatAccesses,
    timeSpent,
    totalAnswered,
    cognitive,
    improvementPct,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-white">
        <Spinner />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen grid place-items-center bg-white p-6 text-red-600">
        Couldn’t load results: {loadError}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pb-8 max-w-7xl mx-auto pt-4">
        <Card className={`p-2 border-4 border-teal-700 ${status.bg} mb-8`}>
          <div className="flex items-center justify-between">
            <div className="p-4">
              <h2
                className={`text-3xl font-bold mb-2 ${
                  status.kind === "fail" ? "text-red-500" : "text-teal-700"
                }`}
              >
                {status.title}
              </h2>
              <p className="text-lg text-gray-800 font-bold">{status.msg}</p>
            </div>
            <div className="p-4 hidden md:flex">
              <img
                src={status.icon}
                alt="status"
                className="h-[3rem] w-[3rem]"
              />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="border-l-8 border-teal-600 shadow-md rounded-lg bg-white p-4">
            <p className="text-md text-teal-700">Final</p>
            <div className="text-4xl font-bold text-teal-700 pt-4">{`${finalPct}%`}</div>
          </div>

          <div className="border-l-8 border-pink-500 shadow-md rounded-lg bg-white p-4">
            <p className="text-md text-pink-500">Improvement</p>
            <div className="text-4xl font-bold pt-4">
              {typeof practicePct === "number" ? (
                <span
                  className={
                    finalPct - practicePct >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {finalPct - practicePct >= 0 ? "+" : ""}
                  {finalPct - practicePct}%
                </span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>
          </div>

          <div className="border-l-8 border-green-500 shadow-md rounded-lg bg-white p-4">
            <p className="text-md text-green-500">Practice Quiz</p>
            <div className="text-4xl font-bold text-green-500 pt-4">
              {typeof practicePct === "number" ? `${practicePct}%` : "—"}
            </div>
          </div>

          <div className="border-l-8 border-blue-600 shadow-md rounded-lg bg-white p-4">
            <p className="text-md text-blue-600">Time Spent</p>
            <div className="text-4xl font-bold text-blue-600 pt-4">
              {fmtHours(timeSpent)}
            </div>
          </div>

          <div className="border-l-8 border-purple-500 shadow-md rounded-lg bg-white p-4">
            <p className="text-md text-purple-500">Cheat Access</p>
            <div className="text-4xl font-bold text-purple-500 pt-4">{`${cheatAccesses}x`}</div>
          </div>
        </div>

        <Card className="p-8 border-2 border-gray-300 mb-8 bg-white">
          <h3 className="text-2xl font-bold text-teal-700 mb-3">
            Performance by Cognitive Level
          </h3>
          <div className="space-y-4">
            {cognitive.map((item) => (
              <div key={item.level}>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700 font-medium">
                    {item.level}
                  </span>
                  <span className="text-gray-700 font-medium">
                    {item.score}% ({item.questions} Questions)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-teal-700 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-blue-100 mb-8">
          <h3 className="text-xl font-bold text-teal-700 mb-3">
            Recommendations
          </h3>
          <div className="space-y-5">
            {recommendations.map((rec, i) => (
              <div key={`${rec.title}-${i}`}>
                <h4 className="font-semibold text-slate-900 mb-1">
                  {rec.title}
                </h4>
                <ul className="list-disc pl-5 text-gray-800 space-y-1">
                  {rec.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        <Button
          onClick={onNext}
          className="w-full bg-teal-700 text-white hover:bg-teal-800 font-bold py-3 rounded-lg text-lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
