"use client";

type PageType =
  | "practice"
  | "uml-builder"
  | "cheat-sheet"
  | "quiz"
  | "results"
  | "feedback";

interface StudentNavigationProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

export function StudentNavigation({
  currentPage,
  onNavigate,
}: StudentNavigationProps) {
  const pages: Array<{ id: PageType; label: string; number: number }> = [
    { id: "practice", label: "Practice", number: 1 },
    { id: "uml-builder", label: "UML Builder", number: 2 },
    { id: "cheat-sheet", label: "Cheat Sheet", number: 3 },
    { id: "quiz", label: "Quiz", number: 4 },
    { id: "results", label: "Results", number: 5 },
  ];

  return (
    <nav className="sticky top-16 z-40 bg-white">
      <div className="h-1 w-full bg-sky-600" />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <ul className="flex items-start justify-evenly gap-6">
          {pages.map((page) => {
            const active = currentPage === page.id;
            return (
              <li key={page.id} className="flex-1 max-w-[180px] text-center">
                <button
                  type="button"
                  onClick={() => onNavigate(page.id)}
                  aria-current={active ? "page" : undefined}
                  className="group w-full focus:outline-none"
                >
                  <div
                    className={[
                      "mx-auto flex h-12 w-12 items-center justify-center rounded-full font-bold text-white",
                      active ? "bg-[#007B7C]" : "bg-[#007B7C]/70",
                    ].join(" ")}
                  >
                    {page.number}
                  </div>
                  <div
                    className={[
                      "mt-3 text-base font-semibold",
                      "text-black group-hover:text-teal-700 transition-colors",
                    ].join(" ")}
                  >
                    {page.label}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
