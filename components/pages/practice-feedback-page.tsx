"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"

interface PracticeFeedbackPageProps {
  practiceAnswers: any[]
  onNext: () => void
}

const practiceQuestions = [
  {
    id: 1,
    question: "The Observer pattern defines a one-to-___ relationship",
    userAnswer: "many",
    correct: true,
    feedback: "Correct! The Observer pattern is all about one-to-many relationships.",
  },
  {
    id: 2,
    question: "In the provided code, which line has an issue?",
    userAnswer: "Line 4",
    correct: true,
    feedback: "Right! Line 4's subscribe method doesn't check for duplicates.",
  },
  {
    id: 3,
    question: "Best practice for Subject's observer list is:",
    userAnswer: "B) std::shared_ptr<Observer>",
    correct: false,
    feedback: "Almost! While shared_ptr works, std::vector<unique_ptr> is often preferred for ownership clarity.",
  },
]

export function PracticeFeedbackPage({ onNext }: PracticeFeedbackPageProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-8 border-2 border-teal-200 mb-8">
        <h2 className="text-3xl font-bold text-teal-900 mb-2">Practice Quiz Feedback</h2>
        <p className="text-lg text-teal-700">Here's how you did on each question:</p>
      </Card>

      <div className="space-y-4 mb-8">
        {practiceQuestions.map((item) => (
          <Card
            key={item.id}
            className={`p-6 border-2 ${item.correct ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}
          >
            <div className="flex items-start gap-4">
              <div>
                {item.correct ? (
                  <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-2">{item.question}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Your answer:</strong> {item.userAnswer}
                </p>
                <p className={`text-sm font-semibold ${item.correct ? "text-green-700" : "text-red-700"}`}>
                  {item.feedback}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button
        onClick={onNext}
        className="w-full py-6 text-lg bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-bold"
      >
        Continue to UML Builder
      </Button>
    </div>
  )
}
