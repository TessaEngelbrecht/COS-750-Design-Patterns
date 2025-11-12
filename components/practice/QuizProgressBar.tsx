interface QuizProgressBarProps {
  currentIndex: number
  total: number
}

export function QuizProgressBar({ currentIndex, total }: QuizProgressBarProps) {
  return (
    <div className="mb-6">
      <p className="text-sm text-slate-600 mb-2">
        Question {currentIndex + 1} of {total}
      </p>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="bg-teal-700 h-2 rounded-full transition-all"
          style={{
            width: `${((currentIndex + 1) / total) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}
