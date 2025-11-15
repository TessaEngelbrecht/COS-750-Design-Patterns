"use client";

type PageType =
  | "practice"
  | "uml-builder"
  // | "cheat-sheet"
  | "quiz"
  | "results"
  | "feedback";

interface StudentNavigationProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

export function StudentNavigation({ currentPage, onNavigate }: StudentNavigationProps) {
  const pages: Array<{ id: PageType; label: string; number: number }> = [
    { id: "practice", label: "Practice", number: 1 },
    { id: "uml-builder", label: "UML Builder", number: 2 },
    // { id: "cheat-sheet", label: "Cheat Sheet", number: 3 },
    { id: "quiz", label: "Quiz", number: 3 },
    { id: "results", label: "Results", number: 4 },
  ];

  return (
    <nav className="sticky top-16 z-40 bg-white shadow-sm">
      <div className="h-1 w-full bg-teal-600" />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        {/* Desktop View */}
        <ul className="hidden sm:flex justify-evenly items-start gap-2 lg:gap-6">
          {pages.map(({ id, label, number }) => {
            const active = currentPage === id;
            return (
              <li key={id} className="flex-1 max-w-[180px] text-center">
                <button
                  type="button"
                  onClick={() => onNavigate(id)}
                  className="group w-full focus:outline-none"
                >
                  <div
                    className={[
                      "mx-auto flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-full font-bold text-white transition-all",
                      active ? "bg-teal-700 shadow-lg" : "bg-teal-500/80 group-hover:bg-teal-600"
                    ].join(" ")}
                  >
                    {number}
                  </div>

                  <div
                    className={[
                      "mt-2 text-xs lg:text-base font-semibold transition-colors",
                      active ? "text-teal-700" : "text-black group-hover:text-teal-700"
                    ].join(" ")}
                  >
                    {label}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Mobile View - Horizontal Scroll */}
        <div className="sm:hidden overflow-x-auto">
          <ul className="flex gap-4 pb-2">
            {pages.map(({ id, label, number }) => {
              const active = currentPage === id;
              return (
                <li key={id} className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate(id)}
                    className="group focus:outline-none"
                  >
                    <div className="flex flex-col items-center min-w-[70px]">
                      <div
                        className={[
                          "flex h-10 w-10 items-center justify-center rounded-full font-bold text-white transition-all",
                          active ? "bg-teal-700 shadow-lg" : "bg-teal-500/80"
                        ].join(" ")}
                      >
                        {number}
                      </div>

                      <div
                        className={[
                          "mt-2 text-xs font-semibold whitespace-nowrap",
                          active ? "text-teal-700" : "text-black"
                        ].join(" ")}
                      >
                        {label}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}