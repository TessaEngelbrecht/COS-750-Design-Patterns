import { Button } from "@/components/ui/button"

interface QuizNavigationProps {
  currentIndex: number
  total: number
  isSubmitted: boolean
  isLastQuestion: boolean
  onPrevious: () => void
  onNext: () => void
}

export function QuizNavigation({
  currentIndex,
  total,
  isSubmitted,
  isLastQuestion,
  onPrevious,
  onNext,
}: QuizNavigationProps) {
  return (
    <div className="flex justify-between items-center">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="border-2 border-teal-700 text-teal-700 hover:bg-teal-50"
      >
        Previous
      </Button>

      <span className="text-slate-600 font-medium">
        {currentIndex + 1} / {total}
      </span>

      <Button
        onClick={onNext}
        disabled={!isSubmitted}
        className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2 rounded-lg disabled:opacity-50"
      >
        {isLastQuestion ? "Finish Practice" : "Next Question"}
      </Button>
    </div>
  )
}
