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

  return (
    <nav className="bg-white border-b-2 border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {pages.map((page, idx) => (
            <div key={page.id} className="flex items-center">
              <button
                onClick={() => onNavigate(page.id)}
                className={`flex flex-col items-center gap-2 px-6 py-3 font-semibold transition ${
                  currentPage === page.id
                    ? "text-teal-700 border-b-4 border-teal-700"
                    : "text-gray-600 hover:text-teal-700"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    currentPage === page.id ? "bg-teal-700" : "bg-gray-300"
                  }`}
                >
                  {page.number}
                </div>
                <span className="text-xs md:text-sm">{page.label}</span>
              </button>
              {idx < pages.length - 1 && <div className="w-8 h-1 bg-gray-300 mx-2" />}
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}
