"use client"

import { useState } from "react"

const mockQuestions = [
  {
    id: 1,
    text: "What is the Observer pattern primarily used for?",
    type: "Multiple Choice",
    bloomLevel: "Remember",
    focusArea: "Basics",
  },
  {
    id: 2,
    text: "How do Subjects notify Observers of state changes?",
    type: "Multiple Choice",
    bloomLevel: "Understand",
    focusArea: "Notification",
  },
  {
    id: 3,
    text: "Implement an Observer interface with appropriate methods.",
    type: "Code Fix",
    bloomLevel: "Apply",
    focusArea: "Implementation",
  },
]

export default function QuestionsTab() {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-teal-600">Questions for Learning Platform</h3>
        <button className="bg-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-purple-700">
          + Add Question
        </button>
      </div>

      {mockQuestions.map((question) => (
        <div
          key={question.id}
          onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
          className="border-2 border-teal-600 rounded-lg p-4 cursor-pointer hover:bg-teal-50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-teal-600 font-bold">?</span>
                <h4 className="font-bold text-gray-800">{question.text}</h4>
              </div>
              <div className="flex gap-3 text-sm">
                <span className="bg-teal-100 text-teal-600 px-3 py-1 rounded">{question.type}</span>
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded">{question.bloomLevel}</span>
                <span className="bg-green-100 text-green-600 px-3 py-1 rounded">{question.focusArea}</span>
              </div>
            </div>
            <svg
              className={`w-6 h-6 text-teal-600 transition-transform ${expandedQuestion === question.id ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  )
}
