"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { QuestionCard } from "@/components/question-card"

// ---- Types ----
type QuestionType = "fill-in-blank" | "code-fix" | "multiple-choice"

export interface Question {
  id: number
  type: QuestionType
  text: string
  category: string
  blank?: string
  code?: string[]
  options?: string[]
  answer?: string
}

interface PracticePageProps {
  onNext: (answers: any[]) => void
}

// ---- Question Data ----
const questions: Question[] = [
  {
    id: 1,
    type: "fill-in-blank",
    text: "The Observer pattern defines a one-to-",
    blank: "many",
    category: "Remember",
  },
  {
    id: 2,
    type: "code-fix",
    text: "There is an issue in the code. Line 4 has a problem.",
    code: [
      "class Subject {",
      "std::vector<std::shared_ptr<Observer>> obs;",
      "public:",
      "void subscribe(std::shared_ptr<Observer> o){ obs.push_back(o); }",
      "};",
    ],
    category: "Understand",
  },
  {
    id: 3,
    type: "multiple-choice",
    text: "Best practice for Subject's list is:",
    options: [
      "A) std::unique_ptr<Observer>",
      "B) std::shared_ptr<Observer>",
      "C) Observer* raw owning",
      "D) std::weak_ptr<Observer>",
    ],
    answer: "B",
    category: "Apply",
  },
]

// ---- Component ----
export function PracticePage({ onNext }: PracticePageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const handleAnswer = (answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      const result = Object.entries(answers).map(([id, answer]) => ({
        questionId: Number(id),
        answer,
      }))
      onNext(result)
    } else {
      setCurrentQuestionIndex((i) => Math.min(i + 1, questions.length - 1))
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <QuestionCard
        question={currentQuestion}
        onAnswer={handleAnswer}
        // currentAnswer={answers[currentQuestion.id]}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
      />

      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <span className="text-muted-foreground">
          Question {currentQuestionIndex + 1}/{questions.length}
        </span>

        <Button className="bg-teal-700" onClick={handleNext}>
          {isLastQuestion ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  )
}
