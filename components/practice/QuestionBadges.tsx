import type { PracticeQuestion } from "@/api/services/PracticeQuiz"

interface QuestionBadgesProps {
  question: PracticeQuestion
}

export function QuestionBadges({ question }: QuestionBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      <span className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded">
        {question.section}
      </span>
      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
        {question.bloom_level}
      </span>
      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
        {question.difficulty_level}
      </span>
    </div>
  )
}
