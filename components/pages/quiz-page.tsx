"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"

interface QuizPageProps {
  onNext: () => void
}

const quizQuestions = [
  {
    id: 1,
    type: "fill-in-blank",
    title: "Question Type - Fill in the blank",
    text: "The Observer pattern defines a one-to-",
    blank: "_______",
    fullText: " dependency so that when one object changes state, all its dependents are notified.",
  },
  {
    id: 2,
    type: "code-fix",
    title: "Question Type - Code fix",
    description: "There is an issue in the code below. Give the line and the fix to the code below.",
    code: `1. class Subject {
2.   std::vector<std::shared_ptr<Observer>> obs;
3. public:
4.   void subscribe(std::shared_ptr<Observer> o){ obs.push_back(o); }
5. };`,
  },
  {
    id: 3,
    type: "multiple-choice",
    title: "Question Type - Multiple choice",
    text: "Best practice for Subject's list is:",
    options: [
      "A) std::unique_ptr<Observer>",
      "B) std::shared_ptr<Observer>",
      "C) Observer* raw owning",
      "D) std::weak_ptr<Observer>",
    ],
  },
]

export function QuizPage({ onNext }: QuizPageProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([])

  const toggleExpand = (id: number) => {
    setExpandedQuestions(
      expandedQuestions.includes(id) ? expandedQuestions.filter((q) => q !== id) : [...expandedQuestions, id],
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Content */}
      <div className="px-6 pb-8 max-w-7xl mx-auto pt-4">
        <div className="space-y-4 mb-8">
          {quizQuestions.map((question) => {
            const isExpanded = expandedQuestions.includes(question.id)

            return (
              <Card
                key={question.id}
                className="border-2 border-teal-700 bg-white cursor-pointer hover:shadow-md transition"
              >
                <button
                  onClick={() => toggleExpand(question.id)}
                  className="w-full p-6 flex items-center justify-between"
                >
                  <div className="flex items-start gap-4 text-left">
                    <HelpCircle className="w-6 h-6 text-teal-700 flex-shrink-0 mt-1" />
                    <h3 className="font-bold text-lg text-gray-900">{question.title}</h3>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="text-teal-700 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="text-teal-700 flex-shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 border-t-2 border-teal-700 pt-6">
                    {question.type === "fill-in-blank" && (
                      <div>
                        <p className="text-gray-800 mb-4">
                          {question.text} <span className="border-b-2 border-teal-700 font-bold px-2">_______</span>{" "}
                          {question.fullText}
                        </p>
                        <div className="mb-4">
                          <label className="block text-teal-700 font-bold mb-2">Answer</label>
                          <Input placeholder="Enter your answer" className="border-2 border-teal-700 rounded-lg" />
                        </div>
                      </div>
                    )}

                    {question.type === "code-fix" && (
                      <div>
                        <p className="text-gray-800 mb-4">{question.description}</p>
                        <Card className="bg-teal-700 text-white p-4 font-mono text-sm mb-4 whitespace-pre overflow-x-auto rounded-lg">
                          {question.code}
                        </Card>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-teal-700 font-bold mb-2">Line</label>
                            <Input placeholder="Enter line number" className="border-2 border-teal-700 rounded-lg" />
                          </div>
                          <div>
                            <label className="block text-teal-700 font-bold mb-2">Answer</label>
                            <Input placeholder="Enter the fix" className="border-2 border-teal-700 rounded-lg" />
                          </div>
                        </div>
                      </div>
                    )}

                    {question.type === "multiple-choice" && (
                      <div>
                        <p className="text-gray-800 mb-4 font-semibold">{question.text}</p>
                        <div className="space-y-2 mb-4">
                          {question.options?.map((option, idx) => (
                            <label
                              key={idx}
                              className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                            >
                              <input type="radio" name={`question-${question.id}`} className="w-4 h-4" />
                              <span className="text-gray-800">{option}</span>
                            </label>
                          ))}
                        </div>
                        <div>
                          <label className="block text-teal-700 font-bold mb-2">Answer</label>
                          <Input placeholder="Enter your answer" className="border-2 border-teal-700 rounded-lg" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        <Button
          onClick={onNext}
          className="w-full bg-teal-700 text-white hover:bg-teal-800 font-bold py-3 rounded-lg text-lg"
        >
          Continue to Results
        </Button>
      </div>
    </div>
  )
}
