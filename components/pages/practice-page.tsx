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
  onNext: (id:any) => void;
}

export function PracticePage({ patternId, onNext }: PracticePageProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, any>>({});
  const [submittedSet, setSubmittedSet] = useState<Set<string>>(new Set());

  const [currentAnswer, setCurrentAnswer] = useState("");
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [fillInBlanks, setFillInBlanks] = useState<Record<number, string>>({});

  const [questionStart, setQuestionStart] = useState(Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const [showFeedbackPage, setShowFeedbackPage] = useState(false);

  // ------------------------------------------------------------
  // LOAD QUESTIONS (Using New API)
  // ------------------------------------------------------------
  async function loadQuiz() {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(`/api/practice-quiz/generate/${patternId}`);
      const data = await res.json();
      console.log

      if (!res.ok) throw new Error(data.error || "Failed to load quiz");

      setAttemptId(data.attemptId);
      setQuestions(data.questions);
    } catch (err: any) {
      console.error("❌ Load quiz failed:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    
    loadQuiz();
  }, [patternId]);

  // Reset question state on index change
  useEffect(() => {
    setQuestionStart(Date.now());
    setCurrentAnswer("");
    setSelectedMultiple([]);
    setFillInBlanks({});
  }, [currentIndex]);

  // ------------------------------------------------------------
  // Current question helpers
  // ------------------------------------------------------------
  const q = questions[currentIndex];
  const isSubmitted = q ? submittedSet.has(q.question_id) : false;
  const isLast = currentIndex === questions.length - 1;

  // ------------------------------------------------------------
  // Multiple-select toggler
  // ------------------------------------------------------------
  const toggleMultiple = (id: string) => {
    setSelectedMultiple((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ------------------------------------------------------------
  // SUBMIT ANSWER TO API
  // ------------------------------------------------------------
  async function handleSubmit() {
    if (!q || !attemptId || isSaving) return;

    let formattedAnswer: any;
    let isCorrect = false;

    // Fill-in-blank
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
    }

    // Select-multiple
    else if (q.question_format === "select-multiple") {
      if (selectedMultiple.length === 0) {
        alert("Select at least one option.");
        return;
      }
      formattedAnswer = { answers: selectedMultiple };
      isCorrect = checkSelectMultipleAnswer(selectedMultiple, q.correct_answer);
    }

    // Simple answer / MCQ
    else {
      if (!currentAnswer.trim()) {
        alert("Please enter an answer.");
        return;
      }
      formattedAnswer = { answer: currentAnswer };
      const correctAns = q.correct_answer?.answer?.trim()?.toLowerCase();
      isCorrect = currentAnswer.trim().toLowerCase() === correctAns;
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

  // ------------------------------------------------------------
  // Check if answer is correct (for UI feedback)
  // ------------------------------------------------------------
  function getIsCorrect() {
    if (!q || !isSubmitted) return null;

    const saved = submittedAnswers[q.question_id];
    if (!saved) return null;

    if (q.question_format === "fill-in-blank")
      return checkFillInBlankAnswer(saved.blanks, q.correct_answer);

    if (q.question_format === "select-multiple")
      return checkSelectMultipleAnswer(saved.answers, q.correct_answer);

    const userAns = saved.answer?.trim().toLowerCase();
    const correctAns = q.correct_answer?.answer?.trim().toLowerCase();
    return userAns === correctAns;
  }

  const correctness = getIsCorrect();

  // ------------------------------------------------------------
  // Navigation
  // ------------------------------------------------------------
  const handleNext = () => {
    if (isLast) {
      onNext(attemptId);   // <-- send the attempt ID only
      return;
    }
    setCurrentIndex(i => i + 1);
  };

  // ------------------------------------------------------------
  // Loading + error states
  // ------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-600">
        <div>
          <div className="animate-spin h-12 w-12 border-b-2 border-teal-700 mx-auto mb-4 rounded-full"></div>
          Loading questions…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="p-6 bg-red-50 border-red-500 max-w-md">
          <h2 className="font-bold text-red-700 text-xl mb-2">Error</h2>
          <p>{error}</p>
        </Card>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-600">
        No practice questions found.
      </div>
    );
  }

  // ------------------------------------------------------------
  // MAIN RENDER
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 max-w-4xl mx-auto py-6">
        <QuizProgressBar currentIndex={currentIndex} total={questions.length} />

        <Card className="p-6 border-teal-700/80 border-2 bg-white rounded-xl mb-6">
          <div className="flex items-start gap-4 mb-4">
            <Image
              src="/material-symbols_help.svg"
              alt=""
              width={32}
              height={32}
              priority
            />

            <div className="flex-1">
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
                  className="w-full mt-4 bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2 rounded-lg"
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
