"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { savePracticeAnswer, type PracticeQuestion } from "@/api/services/PracticeQuiz"
import { generatePracticeQuizEngine } from "@/lib/practice-quiz-engine"
import { PracticeFeedbackPage } from "@/components/pages/practice-feedback-page"
import { getCurrentUserId, checkFillInBlankAnswer, checkSelectMultipleAnswer } from "@/lib/practice-quiz-helpers"
import { QuizProgressBar } from "@/components/practice/QuizProgressBar"
import { QuestionBadges } from "@/components/practice/QuestionBadges"
import { FillInBlankQuestion } from "@/components/practice/questions/FillInBlankQuestion"
import { MultipleChoiceQuestion } from "@/components/practice/questions/MultipleChoiceQuestion"
import { SelectMultipleQuestion } from "@/components/practice/questions/SelectMultipleQuestion"
import { IdentifyErrorQuestion } from "@/components/practice/questions/IdentifyErrorQuestion"
import { AnswerFeedback } from "@/components/practice/AnswerFeedback"
import { QuizNavigation } from "@/components/practice/QuizNavigation"
import Image from "next/image"


interface PracticePageProps {
  onNext: () => void
}

export function PracticePage({ onNext }: PracticePageProps) {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({})
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set())
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([])
  const [fillInBlankAnswers, setFillInBlankAnswers] = useState<Record<number, string>>({})
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [isSaving, setIsSaving] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  const fetchQuestions = async (excludeIds: number[] = [], isRetake = false) => {
    try {
      setIsLoading(true)
      setError(null)
      const studentId = getCurrentUserId()
      if (!studentId) throw new Error("No user found. Please sign in.")

      //console.log("📚 Generating practice quiz with engine...")
      const quizQuestions = await generatePracticeQuizEngine({
        studentId,
        excludeQuestionIds: excludeIds,
        usePreviousResults: isRetake,
      })
      //console.log(`✅ Engine returned ${quizQuestions.length} questions`)
      setQuestions(quizQuestions)
    } catch (err: any) {
      console.error("❌ Error loading questions:", err)
      setError(err.message || "Failed to load questions")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchQuestions() }, [])

  useEffect(() => {
    setQuestionStartTime(Date.now())
    setCurrentAnswer("")
    setSelectedMultiple([])
    setFillInBlankAnswers({})
  }, [currentQuestionIndex])

  const currentQuestion = questions[currentQuestionIndex]
  const isSubmitted = currentQuestion ? submittedQuestions.has(currentQuestion.question_id) : false
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const toggleMultipleSelection = (optionId: string) => {
    setSelectedMultiple((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    )
  }

  const handleSubmit = async () => {
    if (isSaving || !currentQuestion) return

    let answerToSubmit: any
    let isCorrect = false

    if (currentQuestion.question_format === "fill-in-blank") {
      const blanks = currentQuestion.correct_answer?.blanks || []
      const allFilled = blanks.every((b: any) => fillInBlankAnswers[b.position]?.trim())
      if (!allFilled) { alert("Please fill in all blanks before submitting."); return }
      answerToSubmit = { blanks: fillInBlankAnswers }
      isCorrect = checkFillInBlankAnswer(fillInBlankAnswers, currentQuestion.correct_answer)
    } else if (currentQuestion.question_format === "select-multiple") {
      if (selectedMultiple.length === 0) { alert("Please select at least one option before submitting."); return }
      answerToSubmit = { answers: selectedMultiple }
      isCorrect = checkSelectMultipleAnswer(selectedMultiple, currentQuestion.correct_answer)
    } else {
      if (!currentAnswer.trim()) { alert("Please provide an answer before submitting."); return }
      answerToSubmit = { answer: currentAnswer }
      const userAns = currentAnswer.trim().toLowerCase()
      const correctAns = currentQuestion.correct_answer?.answer?.trim().toLowerCase()
      isCorrect = userAns === correctAns
    }

    setIsSaving(true)

    const student_id = getCurrentUserId()
    if (!student_id) { alert("No user found. Please log in again."); setIsSaving(false); return }

    const timeSpentSeconds = Math.floor((Date.now() - questionStartTime) / 1000)

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

      setUserAnswers((prev) => ({ ...prev, [currentQuestion.question_id]: answerToSubmit }))
      setSubmittedQuestions((prev) => new Set(prev).add(currentQuestion.question_id))
    } catch (err) {
      console.error("❌ Failed to save answer:", err)
      alert("Failed to save your answer. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = () => {
    if (isLastQuestion) { setShowFeedback(true) }
    else { setCurrentQuestionIndex((i) => i + 1) }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((i) => i - 1)
  }

  const handleRetake = () => {
    const lastQuizIds = questions.map((q) => q.question_id)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setUserAnswers({})
    setSubmittedQuestions(new Set())
    setCurrentAnswer("")
    setSelectedMultiple([])
    setFillInBlankAnswers({})
    setShowFeedback(false)
    fetchQuestions(lastQuizIds, true)
  }

  const checkAnswer = () => {
    if (!currentQuestion || !isSubmitted) return null
    const savedAnswer = userAnswers[currentQuestion.question_id]
    if (currentQuestion.question_format === "fill-in-blank") {
      return checkFillInBlankAnswer(savedAnswer?.blanks || {}, currentQuestion.correct_answer)
    } else if (currentQuestion.question_format === "select-multiple") {
      return checkSelectMultipleAnswer(savedAnswer?.answers || [], currentQuestion.correct_answer)
    } else {
      const userAns = savedAnswer?.answer?.trim().toLowerCase()
      const correctAns = currentQuestion.correct_answer?.answer?.trim().toLowerCase()
      return userAns === correctAns
    }
  }

  if (showFeedback && questions.length > 0) {
    return <PracticeFeedbackPage questions={questions} userAnswers={userAnswers} onRetake={handleRetake} onNext={onNext} />
  }

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="p-6 border-2 border-red-500 bg-red-50 max-w-md">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Questions</h2>
          <p className="text-red-600">{error}</p>
        </Card>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="p-6 border-2 border-slate-300 max-w-md">
          <p className="text-slate-600 text-center">No practice questions found.</p>
        </Card>
      </div>
    )
  }

  const isCorrect = checkAnswer()

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 max-w-4xl mx-auto py-6">
        <QuizProgressBar currentIndex={currentQuestionIndex} total={questions.length} />

        <Card className="p-6 border-2 border-teal-700/80 bg-white rounded-xl mb-6">
          <div className="flex items-start gap-4 mb-4">
            <Image src="/material-symbols_help.svg" alt="" width={32} height={32} priority />
            <div className="flex-1">
              <QuestionBadges question={currentQuestion} />

              {currentQuestion.question_format === "fill-in-blank" && (
                <FillInBlankQuestion
                  question={currentQuestion}
                  fillInBlankAnswers={fillInBlankAnswers}
                  setFillInBlankAnswers={setFillInBlankAnswers}
                  isSubmitted={isSubmitted}
                />
              )}

              {currentQuestion.question_format === "select-multiple" && (
                <SelectMultipleQuestion
                  question={currentQuestion}
                  selectedMultiple={selectedMultiple}
                  toggleMultipleSelection={toggleMultipleSelection}
                  isSubmitted={isSubmitted}
                />
              )}

              {currentQuestion.question_format === "multiple-choice" && (
                <MultipleChoiceQuestion
                  question={currentQuestion}
                  currentAnswer={currentAnswer}
                  setCurrentAnswer={setCurrentAnswer}
                  isSubmitted={isSubmitted}
                />
              )}

              {currentQuestion.question_format === "identify-error" && (
                <IdentifyErrorQuestion
                  question={currentQuestion}
                  currentAnswer={currentAnswer}
                  setCurrentAnswer={setCurrentAnswer}
                  isSubmitted={isSubmitted}
                />
              )}

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

          <AnswerFeedback question={currentQuestion} isCorrect={isCorrect} userAnswers={userAnswers} />
        </Card>

        <QuizNavigation
          currentIndex={currentQuestionIndex}
          total={questions.length}
          isSubmitted={isSubmitted}
          isLastQuestion={isLastQuestion}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>
    </div>
  )
}