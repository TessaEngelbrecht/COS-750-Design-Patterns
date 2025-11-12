import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import type { PracticeQuestion } from "@/api/services/PracticeQuiz"

interface AnswerFeedbackProps {
  question: PracticeQuestion
  isCorrect: boolean | null
  userAnswers: Record<number, any>
}

export function AnswerFeedback({
  question,
  isCorrect,
  userAnswers,
}: AnswerFeedbackProps) {
  if (isCorrect === null) return null

  return (
    <Card
      className={`mt-6 p-6 border-2 ${
        isCorrect
          ? "border-green-500 bg-green-50"
          : "border-red-500 bg-red-50"
      }`}
    >
      <div className="flex items-start gap-4">
        <div>
          {isCorrect ? (
            <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
          )}
        </div>
        <div className="flex-1">
          <h3
            className={`font-bold text-lg mb-2 ${
              isCorrect ? "text-green-800" : "text-red-800"
            }`}
          >
            {isCorrect ? "Correct!" : "Incorrect"}
          </h3>

          {question.question_format === "fill-in-blank" ? (
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Your answers:
              </p>
              {question.correct_answer?.blanks?.map((blank: any) => {
                const userAns =
                  userAnswers[question.question_id]?.blanks?.[blank.position]
                const correctAnswers = blank.answers.join(" or ")
                const isBlankCorrect = blank.answers
                  .map((a: string) => a.toLowerCase())
                  .includes(userAns?.toLowerCase())

                return (
                  <div key={blank.position} className="mb-2">
                    <p className="text-sm text-gray-700">
                      <strong>Blank {blank.position}:</strong>{" "}
                      <span
                        className={
                          isBlankCorrect ? "text-green-700" : "text-red-700"
                        }
                      >
                        {userAns}
                      </span>
                      {!isBlankCorrect && (
                        <span className="text-gray-600 ml-2">
                          (Correct: {correctAnswers})
                        </span>
                      )}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : question.question_format === "select-multiple" ? (
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Your selections:
              </p>
              <p className="text-sm text-gray-700 mb-2">
                {userAnswers[question.question_id]?.answers?.join(", ") ||
                  "None"}
              </p>
              {!isCorrect && (
                <p className="text-sm text-gray-700">
                  <strong>Correct answers:</strong>{" "}
                  {question.correct_answer?.answers?.join(", ")}
                </p>
              )}
            </div>
          ) : (
            <div className="mb-3">
              <p className="text-sm text-gray-700">
                <strong>Your answer:</strong>{" "}
                {userAnswers[question.question_id]?.answer}
              </p>
              {!isCorrect && (
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Correct answer:</strong>{" "}
                  {question.correct_answer?.answer}
                </p>
              )}
            </div>
          )}

          <p
            className={`text-sm font-semibold ${
              isCorrect ? "text-green-700" : "text-red-700"
            }`}
          >
            <strong>Explanation:</strong> {question.correct_answer?.reason}
          </p>
        </div>
      </div>
    </Card>
  )
}
