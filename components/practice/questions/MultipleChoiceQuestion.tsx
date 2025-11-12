import { normalizeOptions } from "@/lib/practice-quiz-helpers"
import type { PracticeQuestion } from "@/api/services/PracticeQuiz"

interface MultipleChoiceQuestionProps {
  question: PracticeQuestion
  currentAnswer: string
  setCurrentAnswer: (answer: string) => void
  isSubmitted: boolean
}

export function MultipleChoiceQuestion({
  question,
  currentAnswer,
  setCurrentAnswer,
  isSubmitted,
}: MultipleChoiceQuestionProps) {
  return (
    <div>
      <p className="text-slate-800 font-semibold mb-4 text-lg">
        {question.question_text}
      </p>

      <div className="mb-4 space-y-2">
        {normalizeOptions(question.question_data?.options).map((opt) => (
          <button
            key={opt.id}
            onClick={() => !isSubmitted && setCurrentAnswer(opt.id)}
            disabled={isSubmitted}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              currentAnswer === opt.id
                ? "border-teal-700 bg-teal-50"
                : "border-slate-200 hover:border-teal-500"
            } ${
              isSubmitted
                ? "cursor-not-allowed opacity-70"
                : "cursor-pointer"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  currentAnswer === opt.id
                    ? "border-teal-700 bg-teal-700"
                    : "border-slate-300"
                }`}
              >
                {currentAnswer === opt.id && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <p className="text-slate-800">
                <span className="font-semibold mr-2">{opt.id})</span>
                {opt.text}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
