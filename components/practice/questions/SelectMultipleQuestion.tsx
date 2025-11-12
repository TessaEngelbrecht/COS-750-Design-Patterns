import { Check } from "lucide-react"
import { normalizeOptions } from "@/lib/practice-quiz-helpers"
import type { PracticeQuestion } from "@/api/services/PracticeQuiz"

interface SelectMultipleQuestionProps {
  question: PracticeQuestion
  selectedMultiple: string[]
  toggleMultipleSelection: (optionId: string) => void
  isSubmitted: boolean
}

export function SelectMultipleQuestion({
  question,
  selectedMultiple,
  toggleMultipleSelection,
  isSubmitted,
}: SelectMultipleQuestionProps) {
  return (
    <div>
      <p className="text-slate-800 font-semibold mb-2 text-lg">
        {question.question_text}
      </p>
      <p className="text-sm text-slate-600 mb-4 italic">
        Select all that apply
      </p>

      <div className="mb-4 space-y-2">
        {normalizeOptions(question.question_data?.options).map((opt) => (
          <button
            key={opt.id}
            onClick={() => !isSubmitted && toggleMultipleSelection(opt.id)}
            disabled={isSubmitted}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              selectedMultiple.includes(opt.id)
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
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selectedMultiple.includes(opt.id)
                    ? "border-teal-700 bg-teal-700"
                    : "border-slate-300"
                }`}
              >
                {selectedMultiple.includes(opt.id) && (
                  <Check className="w-3 h-3 text-white" />
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