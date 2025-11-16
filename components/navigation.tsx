"use client"

type PageType = "practice" | "uml-builder" | "quiz" | "results" | "feedback"

interface NavigationProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const steps = [
    { id: "practice" as const, label: "Practice", number: 1 },
    { id: "uml-builder" as const, label: "UML Builder", number: 2 },
    // { id: "cheat-sheet" as const, label: "Cheat Sheet", number: 3 },
    { id: "quiz" as const, label: "Quiz", number: 4 },
    { id: "results" as const, label: "Results", number: 5 },
    { id: "feedback" as const, label: "Feedback", number: 6 },
  ];

  return (
    <div className="bg-background border-b border-border py-6 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center">
            <button onClick={() => onNavigate(step.id)} className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${
                  currentPage === step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-primary/20"
                }`}
              >
                {step.number}
              </div>
              <span
                className={`text-sm font-medium mt-2 ${
                  currentPage === step.id ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
