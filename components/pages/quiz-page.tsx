// components/final-quiz/QuizPage.tsx
"use client";

import { useEffect, useState } from "react";
import StartFinalQuiz from "@/components/final-quiz/start-final-quiz";
import FinalQuizTaking from "@/components/final-quiz/final-quiz-taking";
import FinalQuizSubmitted from "@/components/final-quiz/final-quiz-submitted";
import { Spinner } from "@/components/ui/spinner";

interface QuizPageProps {
  user: string;          // userId from dashboard (not trusted by API)
  patternId: string;
  onNext: () => void;    // will go to Overall Results page
}

type QuizState = "loading" | "start" | "taking" | "submitted";

// (what you already had, just adjusted submitQuiz)

export default function QuizPage({ user, patternId, onNext }:QuizPageProps) {
  const [state, setState] = useState<QuizState>("loading");

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    async function checkExisting() {
      const res = await fetch("/api/final-quiz/check-existing", {
        method: "POST",
        body: JSON.stringify({ patternId }),
      }).then((r) => r.json());

      if (res.exists && res.attemptId) {
        setAttemptId(res.attemptId);
        setQuestions(res.questions);
        setState("submitted");
      } else {
        setState("start");
      }
    }

    checkExisting();
  }, [patternId]);

  async function startQuiz() {
    const res = await fetch("/api/final-quiz/create", {
      method: "POST",
      body: JSON.stringify({ patternId }),
    }).then((r) => r.json());

    setAttemptId(res.attemptId);
    setQuestions(res.questions);
    setState("taking");
  }

  async function submitQuiz(payload: { answers: any[] }) {
    if (!attemptId) return;
    const res = await fetch("/api/final-quiz/submit", {
      method: "POST",
      body: JSON.stringify({
        attemptId,
        answers: payload.answers,
      }),
    }).then((r) => r.json());

    if (res.success) {
      // Reload from check-existing so we have marked questions + correct answers
      const existing = await fetch("/api/final-quiz/check-existing", {
        method: "POST",
        body: JSON.stringify({ patternId }),
      }).then((r) => r.json());

      setAttemptId(existing.attemptId);
      setQuestions(existing.questions);
      setState("submitted");
    }
  }

  if (state === "loading")
    return (
      <div className="min-h-screen grid place-items-center">
        <Spinner />
      </div>
    );

  if (state === "start")
    return <StartFinalQuiz onStart={startQuiz} />;

  if (state === "taking" && attemptId)
    return (
      <FinalQuizTaking
        questions={questions}
        attemptId={attemptId}
        onSubmit={submitQuiz}
      />
    );

  return (
    <FinalQuizSubmitted
      questions={questions}
      attemptId={attemptId!}
      onNext={onNext}
    />
  );
}
