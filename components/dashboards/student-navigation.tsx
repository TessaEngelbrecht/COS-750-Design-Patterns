"use client"

type PageType = "practice" | "uml-builder" | "cheat-sheet" | "quiz" | "results" | "feedback"

interface StudentNavigationProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
}

export function StudentNavigation({ currentPage, onNavigate }: StudentNavigationProps) {
  const pages: Array<{ id: PageType; label: string; number: number }> = [
    { id: "practice", label: "Practice", number: 1 },
    { id: "uml-builder", label: "UML Builder", number: 2 },
    { id: "cheat-sheet", label: "Cheat Sheet", number: 3 },
    { id: "quiz", label: "Quiz", number: 4 },
    { id: "results", label: "Results", number: 5 },
  ]

  const currentIdx = pages.findIndex(page => page.id === currentPage)

  return (
    <nav className="bg-white sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {pages.map((page, idx) => {
            const isCompleted = idx <= currentIdx
            return (
              <div key={page.id} className="flex items-center">
                <button
                  onClick={() => onNavigate(page.id)}
                  className="flex flex-col items-center gap-2 px-6 py-3 font-bold transition text-black"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      isCompleted ? "bg-teal-700" : "bg-teal-500"
                    }`}
                  >
                    {page.number}
                  </div>
                  <span className="text-xs md:text-sm font-bold">
                    {page.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  )
}
