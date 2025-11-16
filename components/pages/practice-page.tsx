"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  checkFillInBlankAnswer,
  checkSelectMultipleAnswer,
} from "@/lib/practice-quiz-helpers";

import { QuizProgressBar } from "@/components/practice/QuizProgressBar";
import { QuestionBadges } from "@/components/practice/QuestionBadges";

import { FillInBlankQuestion } from "@/components/practice/questions/FillInBlankQuestion";
import { MultipleChoiceQuestion } from "@/components/practice/questions/MultipleChoiceQuestion";
import { SelectMultipleQuestion } from "@/components/practice/questions/SelectMultipleQuestion";
import { IdentifyErrorQuestion } from "@/components/practice/questions/IdentifyErrorQuestion";

import { AnswerFeedback } from "@/components/practice/AnswerFeedback";
import { QuizNavigation } from "@/components/practice/QuizNavigation";

import Image from "next/image";

interface PracticePageProps {
  patternId: string;
  onNext: (id: any) => void;
}

export function PracticePage({ patternId, onNext }: PracticePageProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, any>>({});
  const [submittedSet, setSubmittedSet] = useState<Set<string>>(new Set());

  const [currentAnswer, setCurrentAnswer] = useState("");
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [fillInBlanks, setFillInBlanks] = useState<Record<number, string>>({});

  const [questionStart, setQuestionStart] = useState(Date.now());
  const [isSaving, setIsSaving] = useState(false);

  async function loadQuiz() {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(`/api/practice-quiz/generate/${patternId}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load quiz");

      setAttemptId(data.attemptId);
      setQuestions(data.questions);
      setHasStarted(true);
    } catch (err: any) {
      console.error("❌ Load quiz failed:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setQuestionStart(Date.now());
    setCurrentAnswer("");
    setSelectedMultiple([]);
    setFillInBlanks({});
  }, [currentIndex]);

  const q = questions[currentIndex];
  const isSubmitted = q ? submittedSet.has(q.question_id) : false;
  const isLast = currentIndex === questions.length - 1;

  const toggleMultiple = (id: string) => {
    setSelectedMultiple((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  async function handleSubmit() {
    if (!q || !attemptId || isSaving) return;

    let formattedAnswer: any;
    let isCorrect = false;

    if (q.question_format === "fill-in-blank") {
      const blanksNeeded = q.correct_answer?.blanks ?? [];
      const allFilled = blanksNeeded.every(
        (b: any) => fillInBlanks[b.position]?.trim()
      );
      if (!allFilled) {
        alert("Please fill in all blanks.");
        return;
      }
      formattedAnswer = { blanks: fillInBlanks };
      isCorrect = checkFillInBlankAnswer(fillInBlanks, q.correct_answer);
    } else if (q.question_format === "select-multiple") {
      if (!selectedMultiple.length) {
        alert("Select at least one option.");
        return;
      }
      formattedAnswer = { answers: selectedMultiple };
      isCorrect = checkSelectMultipleAnswer(selectedMultiple, q.correct_answer);
    } else {
      if (!currentAnswer.trim()) {
        alert("Please enter an answer.");
        return;
      }
      formattedAnswer = { answer: currentAnswer };
      isCorrect =
        currentAnswer.trim().toLowerCase() ===
        q.correct_answer?.answer?.trim()?.toLowerCase();
    }

    setIsSaving(true);

    try {
      const timeSpent = Math.floor((Date.now() - questionStart) / 1000);

      await fetch("/api/practice-quiz/submit", {
        method: "POST",
        body: JSON.stringify({
          attempt_id: attemptId,
          question_id: q.question_id,
          student_answer: formattedAnswer,
          is_correct: isCorrect,
          points_earned: isCorrect ? q.points ?? 1 : 0,
          time_spent_seconds: timeSpent,
        }),
      });

      setSubmittedAnswers((p) => ({ ...p, [q.question_id]: formattedAnswer }));
      setSubmittedSet((p) => new Set([...p, q.question_id]));
    } catch (err) {
      console.error("❌ Saving error", err);
      alert("Could not save answer.");
    } finally {
      setIsSaving(false);
    }
  }

  function getIsCorrect() {
    if (!q || !isSubmitted) return null;

    const saved = submittedAnswers[q.question_id];
    if (!saved) return null;

    if (q.question_format === "fill-in-blank")
      return checkFillInBlankAnswer(saved.blanks, q.correct_answer);

    if (q.question_format === "select-multiple")
      return checkSelectMultipleAnswer(saved.answers, q.correct_answer);

    return (
      saved.answer?.trim().toLowerCase() ===
      q.correct_answer?.answer?.trim().toLowerCase()
    );
  }

  const correctness = getIsCorrect();

  const handleNext = () => {
    if (isLast) {
      onNext(attemptId);
      return;
    }
    setCurrentIndex((i) => i + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-600 px-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-teal-700 mx-auto mb-4 rounded-full"></div>
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
        <Card className="p-4 sm:p-6 bg-red-50 border-red-500 max-w-md w-full">
          <h2 className="font-bold text-red-700 text-lg sm:text-xl mb-2">Error</h2>
          <p className="text-sm sm:text-base">{error}</p>
        </Card>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <Card className="p-6 sm:p-10 max-w-xl w-full text-center border-teal-700/70 border-2 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Practice Quiz
          </h2>

          <p className="text-sm sm:text-base text-slate-700 mb-6">
            This adaptive practice quiz is tailored to your learning profile.
          </p>

          <Button
            className="w-full sm:w-auto bg-teal-700 text-white font-bold px-6 sm:px-8 py-3 text-base sm:text-lg rounded-lg
                       hover:bg-teal-800 disabled:bg-slate-400"
            disabled={isLoading}
            onClick={loadQuiz}
          >
            {isLoading ? "Preparing Quiz..." : "Start Quiz"}
          </Button>

          {error && <p className="text-red-600 text-xs sm:text-sm mt-4">{error}</p>}
        </Card>
      </div>
    );
  }

  if (!questions.length || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-600 px-4">
        <p className="text-center">No practice questions found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-8">
      <div className="px-4 sm:px-6 max-w-4xl mx-auto py-4 sm:py-6">
        <QuizProgressBar currentIndex={currentIndex} total={questions.length} />

        <Card className="p-4 sm:p-6 border-teal-700/80 border-2 bg-white rounded-xl mb-4 sm:mb-6">
          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            <Image
              src="/material-symbols_help.svg"
              alt=""
              width={24}
              height={24}
              className="sm:w-8 sm:h-8 flex-shrink-0"
              priority
            />

            <div className="flex-1 min-w-0">
              <QuestionBadges question={q} />

              {q.question_format === "fill-in-blank" && (
                <FillInBlankQuestion
                  question={q}
                  fillInBlankAnswers={fillInBlanks}
                  setFillInBlankAnswers={setFillInBlanks}
                  isSubmitted={isSubmitted}
                />
              )}

              {q.question_format === "select-multiple" && (
                <SelectMultipleQuestion
                  question={q}
                  selectedMultiple={selectedMultiple}
                  toggleMultipleSelection={toggleMultiple}
                  isSubmitted={isSubmitted}
                />
              )}

              {q.question_format === "multiple-choice" && (
                <MultipleChoiceQuestion
                  question={q}
                  currentAnswer={currentAnswer}
                  setCurrentAnswer={setCurrentAnswer}
                  isSubmitted={isSubmitted}
                />
              )}

              {q.question_format === "identify-error" && (
                <IdentifyErrorQuestion
                  question={q}
                  currentAnswer={currentAnswer}
                  setCurrentAnswer={setCurrentAnswer}
                  isSubmitted={isSubmitted}
                />
              )}

              {!isSubmitted && (
                <Button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="w-full mt-4 bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base"
                >
                  {isSaving ? "Saving..." : "Submit Answer"}
                </Button>
              )}
            </div>
          </div>

          <AnswerFeedback
            question={q}
            isCorrect={correctness}
            userAnswers={submittedAnswers}
          />
        </Card>

        <QuizNavigation
          currentIndex={currentIndex}
          total={questions.length}
          isSubmitted={isSubmitted}
          isLastQuestion={isLast}
          onPrevious={() => currentIndex > 0 && setCurrentIndex((i) => i - 1)}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
