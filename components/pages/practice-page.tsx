"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CheckCircle2, XCircle, Check } from "lucide-react"
import { savePracticeAnswer, type PracticeQuestion } from "@/api/services/PracticeQuiz"
import { generatePracticeQuizEngine } from "@/lib/practice-quiz-engine"
import { PracticeFeedbackPage } from "@/components/pages/practice-feedback-page"
import Image from "next/image"

// ============ HELPER FUNCTIONS ============
type NormalizedOption = { id: string; text: string }

const toStringSafe = (v: unknown): string => {
  if (typeof v === "string") return v
  if (v && typeof v === "object" && "text" in (v as any))
    return String((v as any).text)
  if (typeof v === "number" || typeof v === "boolean") return String(v)
  return ""
}

const normalizeOptions = (opts: unknown): NormalizedOption[] => {
  if (!Array.isArray(opts)) return []
  return opts.map((o, i) => {
    if (typeof o === "string")
      return { id: String.fromCharCode(65 + i), text: o }
    if (o && typeof o === "object") {
      const id = String((o as any).id ?? String.fromCharCode(65 + i))
      const text = toStringSafe((o as any).text ?? (o as any).label ?? "")
      return { id, text }
    }
    return { id: String.fromCharCode(65 + i), text: String(o ?? "") }
  })
}

const getCurrentUserId = (): string | null => {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("user")
  if (!userStr) return null
  try {
    const { id } = JSON.parse(userStr)
    return id
  } catch {
    return null
  }
}

// ============ COMPONENT ============
interface PracticePageProps {
  onNext: () => void
}

export function PracticePage({ onNext }: PracticePageProps) {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({})
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(
    new Set()
  )
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([])
  const [fillInBlankAnswers, setFillInBlankAnswers] = useState<
    Record<number, string>
  >({})
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [isSaving, setIsSaving] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  // ============ FETCH QUESTIONS WITH ENGINE ============
  const fetchQuestions = async (excludeIds: number[] = [], isRetake = false) => {
    try {
      setIsLoading(true)
      setError(null)
      const studentId = getCurrentUserId()
      if (!studentId) {
        throw new Error("No user found. Please sign in.")
      }

      console.log("📚 Generating practice quiz with engine...")
      const quizQuestions = await generatePracticeQuizEngine({
        studentId,
        excludeQuestionIds: excludeIds,
        usePreviousResults: isRetake,
      })
      console.log(`✅ Engine returned ${quizQuestions.length} questions`)
      setQuestions(quizQuestions)
    } catch (err: any) {
      console.error("❌ Error loading questions:", err)
      setError(err.message || "Failed to load questions")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch questions on mount
  useEffect(() => {
    fetchQuestions()
  }, [])

  // Reset states when question changes
  useEffect(() => {
    setQuestionStartTime(Date.now())
    setCurrentAnswer("")
    setSelectedMultiple([])
    setFillInBlankAnswers({})
  }, [currentQuestionIndex])

  const currentQuestion = questions[currentQuestionIndex]
  const isSubmitted = currentQuestion
    ? submittedQuestions.has(currentQuestion.question_id)
    : false
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  // ============ ANSWER CHECKING FUNCTIONS ============
  const checkFillInBlankAnswer = (
    userBlanks: Record<number, string>,
    correctAnswer: any
  ): boolean => {
    if (!correctAnswer?.blanks) return false

    return correctAnswer.blanks.every((blank: any) => {
      const position = blank.position
      const userAnswer = userBlanks[position]?.trim().toLowerCase()
      const acceptableAnswers = blank.answers.map((a: string) =>
        a.toLowerCase()
      )
      return acceptableAnswers.includes(userAnswer)
    })
  }

  const checkSelectMultipleAnswer = (
    userAnswers: string[],
    correctAnswer: any
  ): boolean => {
    if (!correctAnswer?.answers || !userAnswers) return false
    const userSorted = [...userAnswers].sort()
    const correctSorted = [...correctAnswer.answers].sort()
    return (
      userSorted.length === correctSorted.length &&
      userSorted.every((ans, idx) => ans === correctSorted[idx])
    )
  }

  const toggleMultipleSelection = (optionId: string) => {
    setSelectedMultiple((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId)
      } else {
        return [...prev, optionId]
      }
    })
  }

  // ============ SUBMIT HANDLER ============
  const handleSubmit = async () => {
    if (isSaving || !currentQuestion) return

    let answerToSubmit: any
    let isCorrect = false

    // Handle different question formats
    if (currentQuestion.question_format === "fill-in-blank") {
      const blanks = currentQuestion.correct_answer?.blanks || []
      const allFilled = blanks.every(
        (b: any) => fillInBlankAnswers[b.position]?.trim()
      )

      if (!allFilled) {
        alert("Please fill in all blanks before submitting.")
        return
      }

      answerToSubmit = { blanks: fillInBlankAnswers }
      isCorrect = checkFillInBlankAnswer(
        fillInBlankAnswers,
        currentQuestion.correct_answer
      )
    } else if (currentQuestion.question_format === "select-multiple") {
      if (selectedMultiple.length === 0) {
        alert("Please select at least one option before submitting.")
        return
      }

      answerToSubmit = { answers: selectedMultiple }
      isCorrect = checkSelectMultipleAnswer(
        selectedMultiple,
        currentQuestion.correct_answer
      )
    } else {
      // Multiple choice or identify-error
      if (!currentAnswer.trim()) {
        alert("Please provide an answer before submitting.")
        return
      }

      answerToSubmit = { answer: currentAnswer }
      const userAns = currentAnswer.trim().toLowerCase()
      const correctAns = currentQuestion.correct_answer?.answer
        ?.trim()
        .toLowerCase()
      isCorrect = userAns === correctAns
    }

    setIsSaving(true)

    const student_id = getCurrentUserId()
    if (!student_id) {
      alert("No user found. Please log in again.")
      setIsSaving(false)
      return
    }

    const timeSpentSeconds = Math.floor((Date.now() - questionStartTime) / 1000)

    console.log("📝 Submitting answer:", {
      question_id: currentQuestion.question_id,
      format: currentQuestion.question_format,
      user_answer: answerToSubmit,
      correct_answer: currentQuestion.correct_answer,
      is_correct: isCorrect,
      time_spent: timeSpentSeconds,
    })

    try {
      await savePracticeAnswer({
        student_id,
        question_id: currentQuestion.question_id,
        student_answer: answerToSubmit,
        is_correct: isCorrect,
        points_earned: isCorrect ? currentQuestion.points || 1 : 0,
        time_spent_seconds: timeSpentSeconds,
        attempt_number: 1,
      })

      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion.question_id]: answerToSubmit,
      }))
      setSubmittedQuestions((prev) =>
        new Set(prev).add(currentQuestion.question_id)
      )
    } catch (err) {
      console.error("❌ Failed to save answer:", err)
      alert("Failed to save your answer. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  // ============ NAVIGATION HANDLERS ============
  const handleNext = () => {
    if (isLastQuestion) {
      console.log("🎉 Practice quiz completed!")
      setShowFeedback(true)
    } else {
      setCurrentQuestionIndex((i) => i + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1)
    }
  }

  const handleRetake = () => {
    // Get question IDs from the last quiz to exclude
    const lastQuizIds = questions.map((q) => q.question_id)

    // Reset all state
    setQuestions([])
    setCurrentQuestionIndex(0)
    setUserAnswers({})
    setSubmittedQuestions(new Set())
    setCurrentAnswer("")
    setSelectedMultiple([])
    setFillInBlankAnswers({})
    setShowFeedback(false)

    // Fetch new engine-driven quiz (with exclusions and adaptation)
    fetchQuestions(lastQuizIds, true)
  }

  const checkAnswer = () => {
    if (!currentQuestion || !isSubmitted) return null

    const savedAnswer = userAnswers[currentQuestion.question_id]

    if (currentQuestion.question_format === "fill-in-blank") {
      return checkFillInBlankAnswer(
        savedAnswer?.blanks || {},
        currentQuestion.correct_answer
      )
    } else if (currentQuestion.question_format === "select-multiple") {
      return checkSelectMultipleAnswer(
        savedAnswer?.answers || [],
        currentQuestion.correct_answer
      )
    } else {
      const userAns = savedAnswer?.answer?.trim().toLowerCase()
      const correctAns = currentQuestion.correct_answer?.answer
        ?.trim()
        .toLowerCase()
      return userAns === correctAns
    }
  }

  // ============ SHOW FEEDBACK PAGE ============
  if (showFeedback && questions.length > 0) {
    return (
      <PracticeFeedbackPage
        questions={questions}
        userAnswers={userAnswers}
        onRetake={handleRetake}
        onNext={onNext}
      />
    )
  }

  // ============ LOADING STATE ============
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading questions…</p>
        </div>
      </div>
    )
  }

  // ============ ERROR STATE ============
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="p-6 border-2 border-red-500 bg-red-50 max-w-md">
          <h2 className="text-xl font-bold text-red-800 mb-2">
            Error Loading Questions
          </h2>
          <p className="text-red-600">{error}</p>
        </Card>
      </div>
    )
  }

  // ============ NO QUESTIONS STATE ============
  if (!questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="p-6 border-2 border-slate-300 max-w-md">
          <p className="text-slate-600 text-center">
            No practice questions found.
          </p>
        </Card>
      </div>
    )
  }

  const isCorrect = checkAnswer()

  // ============ MAIN QUIZ UI ============
  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 max-w-4xl mx-auto py-6">
        {/* Progress indicator */}
        <div className="mb-6">
          <p className="text-sm text-slate-600 mb-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-teal-700 h-2 rounded-full transition-all"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-6 border-2 border-teal-700/80 bg-white rounded-xl mb-6">
          <div className="flex items-start gap-4 mb-4">
            <Image
              src="/material-symbols_help.svg"
              alt=""
              width={32}
              height={32}
              priority
            />
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded">
                  {currentQuestion.section}
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {currentQuestion.bloom_level}
                </span>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                  {currentQuestion.difficulty_level}
                </span>
              </div>

              {/* Fill-in-blank */}
              {currentQuestion.question_format === "fill-in-blank" && (
                <div>
                  <p className="text-slate-800 mb-4 text-lg leading-relaxed font-semibold">
                    {currentQuestion.question_text}
                  </p>

                  {/* Code Snippet if exists */}
                  {/* Code Snippet - Fixed \n handling */}
{currentQuestion.question_data?.code_snippet && (
  <Card className="bg-slate-900 text-white p-4 font-mono text-sm mb-4 overflow-x-auto rounded-lg">
    <pre className="whitespace-pre-wrap">
      {currentQuestion.question_data.code_snippet
        .replace(/\\\\n/g, '\n')  // Handle double-escaped newlines
        .replace(/\\n/g, '\n')     // Handle single-escaped newlines
        .replace(/\\\\/g, '')}     // Remove any remaining double backslashes
    </pre>
  </Card>
)}


                  {/* Blank inputs */}
                  <div className="space-y-4">
                    {currentQuestion.correct_answer?.blanks?.map(
                      (blank: any) => {
                        const blankData = currentQuestion.question_data?.blanks?.find(
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
                      }
                    )}
                  </div>
                </div>
              )}

              {/* Select Multiple - CHECKBOXES */}
              {currentQuestion.question_format === "select-multiple" && (
                <div>
                  <p className="text-slate-800 font-semibold mb-2 text-lg">
                    {currentQuestion.question_text}
                  </p>
                  <p className="text-sm text-slate-600 mb-4 italic">
                    Select all that apply
                  </p>

                  <div className="mb-4 space-y-2">
                    {normalizeOptions(
                      currentQuestion.question_data?.options
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() =>
                          !isSubmitted && toggleMultipleSelection(opt.id)
                        }
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
                            <span className="font-semibold mr-2">
                              {opt.id})
                            </span>
                            {opt.text}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Multiple choice - RADIO BUTTONS */}
              {currentQuestion.question_format === "multiple-choice" && (
                <div>
                  <p className="text-slate-800 font-semibold mb-4 text-lg">
                    {currentQuestion.question_text}
                  </p>

                  <div className="mb-4 space-y-2">
                    {normalizeOptions(
                      currentQuestion.question_data?.options
                    ).map((opt) => (
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
                            <span className="font-semibold mr-2">
                              {opt.id})
                            </span>
                            {opt.text}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Identify error / code fix */}
              {currentQuestion.question_format === "identify-error" && (
                <div>
                  <p className="text-slate-800 mb-3 font-semibold text-lg">
                    {currentQuestion.question_text}
                  </p>

                  {/* Show code snippet if exists */}
                  {currentQuestion.question_data?.code_snippet && (
                    <Card className="bg-slate-900 text-white p-4 font-mono text-sm mb-4 overflow-x-auto rounded-lg">
                      <pre className="whitespace-pre-wrap">
                        {currentQuestion.question_data.code_snippet.replace(
                          /\\n/g,
                          "\n"
                        )}
                      </pre>
                    </Card>
                  )}

                  {/* If options exist, show as multiple choice */}
                  {currentQuestion.question_data?.options &&
                  Array.isArray(currentQuestion.question_data.options) ? (
                    <div>
                      <p className="text-sm text-slate-600 mb-3 italic">
                        Select the correct answer
                      </p>
                      <div className="mb-4 space-y-2">
                        {normalizeOptions(
                          currentQuestion.question_data.options
                        ).map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() =>
                              !isSubmitted && setCurrentAnswer(opt.id)
                            }
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
                                <span className="font-semibold mr-2">
                                  {opt.id})
                                </span>
                                {opt.text}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Otherwise show text input for line number/fix */
                    <div>
                      <label className="block text-teal-700 font-semibold mb-2">
                        Your Answer (e.g., Line 4 or describe the issue)
                      </label>
                      <Input
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="Enter line number or describe the fix"
                        disabled={isSubmitted}
                        className="border-2 border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600/40 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              {!isSubmitted && (
                <Button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="mt-4 bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2 rounded-lg w-full disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Submit Answer"}
                </Button>
              )}
            </div>
          </div>

          {/* Feedback Section */}
          {isSubmitted && (
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

                  {/* Show user's answers */}
                  {currentQuestion.question_format === "fill-in-blank" ? (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-800 mb-2">
                        Your answers:
                      </p>
                      {currentQuestion.correct_answer?.blanks?.map(
                        (blank: any) => {
                          const userAns =
                            userAnswers[currentQuestion.question_id]?.blanks?.[
                              blank.position
                            ]
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
                                    isBlankCorrect
                                      ? "text-green-700"
                                      : "text-red-700"
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
                        }
                      )}
                    </div>
                  ) : currentQuestion.question_format === "select-multiple" ? (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-800 mb-2">
                        Your selections:
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        {userAnswers[currentQuestion.question_id]?.answers?.join(
                          ", "
                        ) || "None"}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-gray-700">
                          <strong>Correct answers:</strong>{" "}
                          {currentQuestion.correct_answer?.answers?.join(", ")}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">
                        <strong>Your answer:</strong>{" "}
                        {userAnswers[currentQuestion.question_id]?.answer}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-gray-700 mt-1">
                          <strong>Correct answer:</strong>{" "}
                          {currentQuestion.correct_answer?.answer}
                        </p>
                      )}
                    </div>
                  )}

                  <p
                    className={`text-sm font-semibold ${
                      isCorrect ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    <strong>Explanation:</strong>{" "}
                    {currentQuestion.correct_answer?.reason}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="border-2 border-teal-700 text-teal-700 hover:bg-teal-50"
          >
            Previous
          </Button>

          <span className="text-slate-600 font-medium">
            {currentQuestionIndex + 1} / {questions.length}
          </span>

          <Button
            onClick={handleNext}
            disabled={!isSubmitted}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {isLastQuestion ? "Finish Practice" : "Next Question"}
          </Button>
        </div>
      </div>
    </div>
  )
}
