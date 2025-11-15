// components/final-quiz/start-final-quiz.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StartFinalQuizProps {
  onStart: () => void;
}

export default function StartFinalQuiz({ onStart }: StartFinalQuizProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <Card className="max-w-xl w-full p-6 border-teal-700/80 border-2 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-teal-800 mb-3">
          Final Quiz: Observer Pattern
        </h1>
        <p className="text-slate-700 mb-4">
          This final quiz evaluates your understanding of the Observer pattern:
          its intent, structure, participants, implementation, and UML
          representation.
        </p>
        <ul className="list-disc ml-5 space-y-1 text-slate-700 mb-4">
          <li>Once started, all questions are shown at once.</li>
          <li>You can expand and collapse questions individually.</li>
          <li>
            The cheat sheet is available, and its usage will be recorded for
            analysis.
          </li>
          <li>Your results contribute to your learning profile and analytics.</li>
        </ul>

        <div className="flex justify-end mt-4">
          <Button
            onClick={onStart}
            className="bg-teal-700 hover:bg-teal-800 text-white font-semibold px-6 py-2 rounded-lg"
          >
            Start Final Quiz
          </Button>
        </div>
      </Card>
    </div>
  );
}
