"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { HelpCircle, SkipForward } from "lucide-react"

interface Question {
  id: number
  type: "fill-in-blank" | "code-fix" | "multiple-choice"
  text: string
  blank?: string
  code?: string[]
  options?: string[]
  answer?: string
  category?: string
}

interface QuestionCardProps {
  question: Question
  onAnswer: (answer: any) => void
  questionNumber: number
  totalQuestions: number
}

export function QuestionCard({ question, onAnswer, questionNumber, totalQuestions }: QuestionCardProps) {
  const [userAnswer, setUserAnswer] = useState("")
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleSubmitAnswer = () => {
    if (question.type === "fill-in-blank" && question.blank) {
      const correct = userAnswer.toLowerCase().trim() === question.blank.toLowerCase()
      setIsCorrect(correct)
    }
    setAnswered(true)
  }

  const handleContinue = () => {
    setUserAnswer("")
    setAnswered(false)
    onAnswer(userAnswer)
  }

  return (
    <Card
      className={`p-8 border-2 min-h-96 ${
        answered && isCorrect
          ? "border-accent bg-accent/5"
          : answered && !isCorrect
            ? "border-destructive bg-destructive/5"
            : "border-teal-700 bg-teal-700/5"
      }`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-6 h-6 text-teal-700 mt-1 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {question.type === "fill-in-blank" && "Question Type – Fill in the blank"}
              {question.type === "code-fix" && "Question Type – Code fix"}
              {question.type === "multiple-choice" && "Question Type – Multiple choice"}
            </h2>
          </div>
        </div>
        <span className="text-sm text-muted-foreground">
          Question {questionNumber}/{totalQuestions}
        </span>
      </div>

      <p className="text-lg text-foreground mb-8">{question.text}</p>

      {question.type === "fill-in-blank" && (
        <div className="mb-8">
          <Input
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="border-2 border-border py-3 px-4"
            disabled={answered}
          />
          {answered && (
            <p className={`mt-3 font-medium ${isCorrect ? "text-accent" : "text-destructive"}`}>
              {isCorrect ? "✓ Correct!" : `✗ Incorrect. The answer is: ${question.blank}`}
            </p>
          )}
        </div>
      )}

      {question.type === "multiple-choice" && (
        <div className="space-y-3 mb-8">
          {question.options?.map((option, idx) => (
            <button
              key={idx}
              onClick={() => !answered && setUserAnswer(option)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                userAnswer === option ? "border-teal-700 bg-teal-700/10" : "border-border bg-background hover:bg-muted"
              }`}
              disabled={answered}
            >
              {option}
            </button>
          ))}
          {answered && (
            <p className={`mt-3 font-medium ${userAnswer === question.answer ? "text-accent" : "text-destructive"}`}>
              {userAnswer === question.answer ? "✓ Correct!" : `✗ Incorrect. The answer is: ${question.answer}`}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        {!answered ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={!userAnswer}
            className="flex-1 bg-teal-700 text-primary-foreground hover:bg-teal-700/90"
          >
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleContinue} className="flex-1 bg-teal-700 text-primary-foreground hover:bg-teal-700/90">
            Next Question
          </Button>
        )}
        <Button variant="outline" className="gap-2 bg-transparent">
          <SkipForward size={18} />
          Skip
        </Button>
      </div>
    </Card>
  )
}
