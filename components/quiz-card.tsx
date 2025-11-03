"use client"

interface Question {
  id: number
  type: string
  text: string
  options?: string[]
  code?: string
  correct: string | number
  level: string
  explanation: string
}

interface QuizCardProps {
  question: Question
  answer: string | undefined
  onAnswer: (answer: string) => void
}

export default function QuizCard({ question, answer, onAnswer }: QuizCardProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-teal-700 p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold">?</div>
        <span className="font-bold text-gray-700">Question Type – {question.type}</span>
      </div>

      <p className="text-gray-800 mb-6 font-medium">{question.text}</p>

      {question.type === "multiple-choice" && question.options && (
        <div className="space-y-3 mb-6">
          {question.options.map((option, idx) => (
            <label
              key={idx}
              className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-teal-700 cursor-pointer transition"
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={idx.toString()}
                checked={answer === idx.toString()}
                onChange={(e) => onAnswer(e.target.value)}
                className="w-4 h-4 accent-teal-700"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === "fill-in-blank" && (
        <div className="mb-6">
          <input
            type="text"
            value={answer || ""}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Enter your answer"
            className="w-full px-4 py-3 border-2 border-teal-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
        </div>
      )}

      {question.type === "code-fix" && question.code && (
        <div className="mb-6">
          <div className="bg-teal-700 text-white p-4 rounded-lg font-mono text-sm mb-4 whitespace-pre-line">
            {question.code}
          </div>
          <input
            type="text"
            value={answer || ""}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Enter line number with error"
            className="w-full px-4 py-3 border-2 border-teal-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
        </div>
      )}

      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
        <p className="text-sm font-bold text-blue-900 mb-1">Cognitive Level: {question.level}</p>
      </div>
    </div>
  )
}
