import { Input } from "@/components/ui/input"
import { CodeSnippet } from "../CodeSnippet"
import type { PracticeQuestion } from "@/api/services/PracticeQuiz"

interface FillInBlankQuestionProps {
  question: PracticeQuestion
  fillInBlankAnswers: Record<number, string>
  setFillInBlankAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>
  isSubmitted: boolean
}

export function FillInBlankQuestion({
  question,
  fillInBlankAnswers,
  setFillInBlankAnswers,
  isSubmitted,
}: FillInBlankQuestionProps) {
  return (
    <div>
      <p className="text-slate-800 mb-4 text-lg leading-relaxed font-semibold">
        {question.question_text}
      </p>

      {question.question_data?.code_snippet && (
        <CodeSnippet code={question.question_data.code_snippet} />
      )}

      <div className="space-y-4">
        {question.correct_answer?.blanks?.map((blank: any) => {
          const blankData = question.question_data?.blanks?.find(
            (b: any) => b.position === blank.position
          )
          return (
            <div key={blank.position}>
              <label className="block text-teal-700 font-semibold mb-2">
                Blank {blank.position}
                {blankData?.hint && (
                  <span className="text-slate-500 font-normal ml-2 text-sm">
                    (Hint: {blankData.hint})
                  </span>
                )}
              </label>
              <Input
                value={fillInBlankAnswers[blank.position] || ""}
                onChange={(e) =>
                  setFillInBlankAnswers((prev) => ({
                    ...prev,
                    [blank.position]: e.target.value,
                  }))
                }
                placeholder={`Enter answer for blank ${blank.position}`}
                disabled={isSubmitted}
                className="border-2 border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600/40 rounded-lg"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
