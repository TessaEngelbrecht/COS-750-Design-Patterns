"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle, RotateCcw, TrendingUp } from "lucide-react"
import type { PracticeQuestion } from "@/api/services/PracticeQuiz"

interface PracticeFeedbackPageProps {
  questions: PracticeQuestion[]
  userAnswers: Record<number, any>
  onRetake: () => void
  onNext: () => void
}

export function PracticeFeedbackPage({
  questions,
  userAnswers,
  onRetake,
  onNext,
}: PracticeFeedbackPageProps) {
  // Calculate overall score
  const totalQuestions = questions?.length || 0
  const correctCount = questions?.filter((q) => {
    const userAnswer = userAnswers[q.question_id]
    if (!userAnswer) return false

    // Check based on question format
    if (q.question_format === "fill-in-blank") {
      return checkFillInBlankAnswer(userAnswer.blanks, q.correct_answer)
    } else if (q.question_format === "select-multiple") {
      return checkSelectMultipleAnswer(userAnswer.answers, q.correct_answer)
    } else {
      return (
        userAnswer.answer?.trim().toLowerCase() ===
        q.correct_answer?.answer?.trim().toLowerCase()
      )
    }
  }).length || 0

  const scorePercentage = totalQuestions > 0 
    ? Math.round((correctCount / totalQuestions) * 100) 
    : 0

  // Analyze performance by section
  const sectionPerformance: Record<
    string,
    { correct: number; total: number }
  > = {}
  questions?.forEach((q) => {
    if (!sectionPerformance[q.section]) {
      sectionPerformance[q.section] = { correct: 0, total: 0 }
    }
    sectionPerformance[q.section].total++

    const userAnswer = userAnswers[q.question_id]
    if (userAnswer) {
      const isCorrect =
        q.question_format === "fill-in-blank"
          ? checkFillInBlankAnswer(userAnswer.blanks, q.correct_answer)
          : q.question_format === "select-multiple"
          ? checkSelectMultipleAnswer(userAnswer.answers, q.correct_answer)
          : userAnswer.answer?.trim().toLowerCase() ===
            q.correct_answer?.answer?.trim().toLowerCase()

      if (isCorrect) {
        sectionPerformance[q.section].correct++
      }
    }
  })

  // Find sections that need improvement (< 70%)
  const weakSections = Object.entries(sectionPerformance)
    .filter(([_, perf]) => (perf.correct / perf.total) * 100 < 70)
    .map(([section]) => section)

  // Helper function to check fill-in-blank
  function checkFillInBlankAnswer(
    userBlanks: Record<number, string>,
    correctAnswer: any
  ): boolean {
    if (!correctAnswer?.blanks || !userBlanks) return false
    return correctAnswer.blanks.every((blank: any) => {
      const userAns = userBlanks[blank.position]?.trim().toLowerCase()
      return blank.answers.some(
        (ans: string) => ans.toLowerCase() === userAns
      )
    })
  }

  // Helper function to check select-multiple
  function checkSelectMultipleAnswer(
    userAnswers: string[],
    correctAnswer: any
  ): boolean {
    if (!correctAnswer?.answers || !userAnswers) return false
    const userSorted = [...userAnswers].sort()
    const correctSorted = [...correctAnswer.answers].sort()
    return (
      userSorted.length === correctSorted.length &&
      userSorted.every((ans, idx) => ans === correctSorted[idx])
    )
  }

  // Get user answer display text
  function getUserAnswerDisplay(q: PracticeQuestion): string {
    const userAnswer = userAnswers[q.question_id]
    if (!userAnswer) return "No answer"

    if (q.question_format === "fill-in-blank") {
      return Object.entries(userAnswer.blanks || {})
        .map(([pos, ans]) => `Blank ${pos}: ${ans}`)
        .join(", ")
    } else if (q.question_format === "select-multiple") {
      return (userAnswer.answers || []).join(", ")
    } else {
      return userAnswer.answer || "No answer"
    }
  }

  // Get correct answer display text
  function getCorrectAnswerDisplay(q: PracticeQuestion): string {
    if (q.question_format === "fill-in-blank") {
      return (
        q.correct_answer?.blanks
          ?.map(
            (blank: any) =>
              `Blank ${blank.position}: ${blank.answers.join(" or ")}`
          )
          .join(", ") || ""
      )
    } else if (q.question_format === "select-multiple") {
      return (q.correct_answer?.answers || []).join(", ")
    } else {
      return q.correct_answer?.answer || ""
    }
  }

  // Check if user answer is correct
  function isAnswerCorrect(q: PracticeQuestion): boolean {
    const userAnswer = userAnswers[q.question_id]
    if (!userAnswer) return false

    if (q.question_format === "fill-in-blank") {
      return checkFillInBlankAnswer(userAnswer.blanks, q.correct_answer)
    } else if (q.question_format === "select-multiple") {
      return checkSelectMultipleAnswer(userAnswer.answers, q.correct_answer)
    } else {
      return (
        userAnswer.answer?.trim().toLowerCase() ===
        q.correct_answer?.answer?.trim().toLowerCase()
      )
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Overall Score Card */}
      <Card className="p-8 border-2 border-teal-700 bg-white mb-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Practice Quiz Results
          </h2>
          <div className="flex items-center justify-center gap-6 my-6">
            <div className="text-6xl font-bold text-teal-700">
              {scorePercentage}%
            </div>
            <div className="text-left">
              <p className="text-2xl font-semibold text-slate-800">
                {correctCount} / {totalQuestions}
              </p>
              <p className="text-lg text-slate-600">Questions Correct</p>
            </div>
          </div>

          {/* Performance Message */}
          <p className="text-lg text-slate-700 mb-4">
            {scorePercentage >= 90
              ? "Excellent work! You have a strong understanding of the Observer pattern."
              : scorePercentage >= 70
              ? "Good job! You're on the right track. Review the questions below to strengthen your knowledge."
              : scorePercentage >= 50
              ? "Keep practicing. Focus on the areas highlighted below to improve your understanding."
              : "Review the material and try again. Practice will help you master these concepts."}
          </p>

          {/* Section Performance Warning */}
          {weakSections.length > 0 && (
            <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-amber-700 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold text-amber-900 mb-2">
                    Areas for Improvement:
                  </h3>
                  <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
                    {weakSections.map((section) => (
                      <li key={section}>
                        {section} -{" "}
                        {Math.round(
                          (sectionPerformance[section].correct /
                            sectionPerformance[section].total) *
                            100
                        )}
                        % correct
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Section Breakdown */}
      <Card className="p-6 border-2 border-slate-200 mb-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          Performance by Section
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(sectionPerformance).map(([section, perf]) => {
            const percentage = Math.round((perf.correct / perf.total) * 100)
            return (
              <div
                key={section}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <h4 className="font-semibold text-slate-800 mb-2">
                  {section}
                </h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        percentage >= 70
                          ? "bg-green-600"
                          : percentage >= 50
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 min-w-[60px]">
                    {perf.correct}/{perf.total} ({percentage}%)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Question Review */}
      <h3 className="text-2xl font-bold text-slate-900 mb-4">
        Detailed Review
      </h3>
      <div className="space-y-4 mb-8">
        {questions?.map((question, index) => {
          const isCorrect = isAnswerCorrect(question)
          const userAnswer = getUserAnswerDisplay(question)
          const correctAnswer = getCorrectAnswerDisplay(question)

          return (
            <Card
              key={question.question_id}
              className={`p-6 border-2 ${
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
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-slate-900">
                      Question {index + 1}
                    </h4>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-white rounded border border-slate-300">
                        {question.section}
                      </span>
                      <span className="text-xs px-2 py-1 bg-white rounded border border-slate-300">
                        {question.bloom_level}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-800 mb-3 font-medium">
                    {question.question_text}
                  </p>

                  {/* Show code snippet if exists */}
                  {question.question_data?.code_snippet && (
                    <Card className="bg-slate-900 text-white p-3 font-mono text-xs mb-3 overflow-x-auto rounded">
                      <pre className="whitespace-pre-wrap">
                        {question.question_data.code_snippet.replace(
                          /\\n/g,
                          "\n"
                        )}
                      </pre>
                    </Card>
                  )}

                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <strong>Your answer:</strong>{" "}
                      <span
                        className={
                          isCorrect ? "text-green-700" : "text-red-700"
                        }
                      >
                        {userAnswer}
                      </span>
                    </p>

                    {!isCorrect && (
                      <p className="text-gray-700">
                        <strong>Correct answer:</strong>{" "}
                        <span className="text-green-700">{correctAnswer}</span>
                      </p>
                    )}

                    <p
                      className={`font-semibold ${
                        isCorrect ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      <strong>Explanation:</strong>{" "}
                      {question.correct_answer?.reason}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onRetake}
          variant="outline"
          className="flex-1 py-6 text-lg border-2 border-teal-700 text-teal-700 hover:bg-teal-50 rounded-lg font-bold"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Try Another Practice Quiz
        </Button>
      </div>
    </div>
  )
}
