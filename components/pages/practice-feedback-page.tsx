"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, RotateCcw, TrendingUp } from "lucide-react";

interface FeedbackQuestion {
  question_id: string;
  question_text: string;
  question_data: any;
  question_format: string;
  section: string;
  bloom_level: string;
  correct_answer: any;
  user_answer: any;
  is_correct: boolean;
}

interface PracticeFeedbackPageProps {
  attemptId: string;
  onNext: () => void;
  onRetake: () => void;
}

export function PracticeFeedbackPage({ attemptId, onNext, onRetake }: PracticeFeedbackPageProps) {
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAttempt() {
      try {
        const res = await fetch(`/api/practice-quiz/attempt/${attemptId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to load attempt");

        setQuestions(data.items);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadAttempt();
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-600 px-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-teal-700 mx-auto mb-4 rounded-full"></div>
          <p>Loading results…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 sm:p-6 bg-red-50 border-red-500 max-w-md mx-auto mt-10 sm:mt-20 mx-4">
        <h2 className="font-bold text-red-700 text-lg sm:text-xl mb-2">Error</h2>
        <p className="text-sm sm:text-base">{error}</p>
      </Card>
    );
  }

  if (!questions.length) {
    return (
      <div className="text-center text-slate-600 mt-10 sm:mt-20 px-4">
        <p>No results found for this attempt.</p>
      </div>
    );
  }

  const total = questions.length;
  const correct = questions.filter((q) => q.is_correct).length;
  const scorePercentage = Math.round((correct / total) * 100);

  const sectionPerformance: Record<string, { correct: number; total: number }> = {};

  questions.forEach((q) => {
    if (!sectionPerformance[q.section]) {
      sectionPerformance[q.section] = { correct: 0, total: 0 };
    }
    sectionPerformance[q.section].total++;
    if (q.is_correct) sectionPerformance[q.section].correct++;
  });

  const weakSections = Object.entries(sectionPerformance)
    .filter(([_, perf]) => (perf.correct / perf.total) * 100 < 70)
    .map(([section]) => section);

  function formatUserAnswer(q: FeedbackQuestion) {
    const ans = q.user_answer;
    if (!ans) return "No answer";

    if (q.question_format === "fill-in-blank") {
      return Object.entries(ans.blanks || {})
        .map(([pos, val]) => `Blank ${pos}: ${val}`)
        .join(", ");
    }

    if (q.question_format === "select-multiple") {
      return (ans.answers || []).join(", ");
    }

    return ans.answer ?? "No answer";
  }

  function formatCorrectAnswer(q: FeedbackQuestion) {
    const ca = q.correct_answer;
    if (!ca) return "";

    if (q.question_format === "fill-in-blank") {
      return ca.blanks
        ?.map(
          (blank: any) =>
            `Blank ${blank.position}: ${blank.answers.join(" or ")}`
        )
        .join(", ");
    }

    if (q.question_format === "select-multiple") {
      return ca.answers?.join(", ");
    }

    return ca.answer ?? "";
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-8">
      {/* SCORE CARD */}
      <Card className="p-6 sm:p-8 border-2 border-teal-700 bg-white mb-6 sm:mb-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Practice Quiz Results
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 my-6">
            <div className="text-5xl sm:text-6xl font-bold text-teal-700">
              {scorePercentage}%
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-semibold text-slate-800">
                {correct} / {total}
              </p>
              <p className="text-base sm:text-lg text-slate-600">Correct</p>
            </div>
          </div>

          <p className="text-base sm:text-lg text-slate-700 mb-4">
            {scorePercentage >= 90
              ? "Excellent work!"
              : scorePercentage >= 70
              ? "Good job! Review below to strengthen key areas."
              : scorePercentage >= 50
              ? "Keep practicing — you're improving!"
              : "Review the material and try again."}
          </p>

          {weakSections.length > 0 && (
            <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-amber-700 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold text-amber-900 mb-2 text-sm sm:text-base">
                    Areas for Improvement:
                  </h3>
                  <ul className="list-disc list-inside text-xs sm:text-sm text-amber-800 space-y-1">
                    {weakSections.map((sec) => (
                      <li key={sec} className="break-words">
                        {sec} –{" "}
                        {Math.round(
                          (sectionPerformance[sec].correct /
                            sectionPerformance[sec].total) *
                            100
                        )}
                        %
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* SECTION PERFORMANCE */}
      <Card className="p-4 sm:p-6 border-2 border-slate-200 mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">
          Performance by Section
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(sectionPerformance).map(([section, perf]) => {
            const pct = Math.round((perf.correct / perf.total) * 100);
            return (
              <div
                key={section}
                className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <h4 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base break-words">
                  {section}
                </h4>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        pct >= 70
                          ? "bg-green-600"
                          : pct >= 50
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap">
                    {perf.correct}/{perf.total} ({pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* DETAILED REVIEW */}
      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
        Detailed Review
      </h3>

      <div className="space-y-4 mb-8">
        {questions.map((q, index) => (
          <Card
            key={q.question_id}
            className={`p-4 sm:p-6 border-2 ${
              q.is_correct ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
            }`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                {q.is_correct ? (
                  <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    Question {index + 1}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-white rounded border border-slate-300 whitespace-nowrap">
                      {q.section}
                    </span>
                    <span className="text-xs px-2 py-1 bg-white rounded border border-slate-300 whitespace-nowrap">
                      {q.bloom_level}
                    </span>
                  </div>
                </div>

                <p className="text-slate-800 mb-3 font-medium text-sm sm:text-base break-words">
                  {q.question_text}
                </p>

                {q.question_data?.code_snippet && (
                  <Card className="bg-slate-900 text-white p-3 font-mono text-xs mb-3 overflow-x-auto rounded">
                    <pre className="whitespace-pre-wrap break-words">
                      {q.question_data.code_snippet.replace(/\\n/g, "\n")}
                    </pre>
                  </Card>
                )}

                <p className="text-gray-700 text-xs sm:text-sm break-words">
                  <strong>Your answer:</strong>{" "}
                  <span
                    className={q.is_correct ? "text-green-700" : "text-red-700"}
                  >
                    {formatUserAnswer(q)}
                  </span>
                </p>

                {!q.is_correct && (
                  <p className="text-gray-700 text-xs sm:text-sm break-words">
                    <strong>Correct answer:</strong>{" "}
                    <span className="text-green-700">
                      {formatCorrectAnswer(q)}
                    </span>
                  </p>
                )}

                <p
                  className={`mt-1 text-xs sm:text-sm font-semibold break-words ${
                    q.is_correct ? "text-green-700" : "text-red-700"
                  }`}
                >
                  <strong>Explanation:</strong> {q.correct_answer?.reason}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          onClick={onRetake}
          variant="outline"
          className="flex-1 py-4 sm:py-6 text-base sm:text-lg border-2 border-teal-700 text-teal-700 hover:bg-teal-50 rounded-lg font-bold"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Try Another Practice Quiz
        </Button>

        <Button
          onClick={onNext}
          className="flex-1 py-4 sm:py-6 text-base sm:text-lg bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold"
        >
          Continue to UML Builder
        </Button>
      </div>
    </div>
  );
}
