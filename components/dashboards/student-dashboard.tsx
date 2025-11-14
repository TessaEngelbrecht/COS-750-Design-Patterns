"use client";

import { useState } from "react";
import PatternSelectionPage from "@/components/pages/pattern-selection-page";
import SelfReflectionPage from "@/components/pages/self-reflection-page";
import { InstructionsPage } from "@/components/pages/instructions-page";
import { PracticePage } from "@/components/pages/practice-page";
import { PracticeFeedbackPage } from "@/components/pages/practice-feedback-page";
import { UMLBuilderPage } from "@/components/pages/uml-builder-page";
import { CheatSheetPage } from "@/components/pages/cheat-sheet-page";
import { QuizPage } from "@/components/pages/quiz-page";
import { ResultsPage } from "@/components/pages/results-page";
import { FeedbackPage } from "@/components/pages/feedback-page";
import { StudentNavigation } from "@/components/dashboards/student-navigation";
import { StudentHeader } from "./student-header";

type PageType =
  | "pattern-selection"
  | "self-reflection"
  | "instructions"
  | "practice"
  | "practice-feedback"
  | "uml-builder"
  | "cheat-sheet"
  | "quiz"
  | "results"
  | "feedback";

interface StudentDashboard {
  userId: string;
  userName: string;
  role: string;
}

export default function StudentDashboard({
  userId,
  userName,
  role,
}: StudentDashboard) {
  const [currentPage, setCurrentPage] = useState<PageType>("pattern-selection");
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [practiceAnswers, setPracticeAnswers] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const goTo = (page: PageType) => setCurrentPage(page);
// ---------------------------
  // NEW: Check if reflection already completed
  // ---------------------------
  const evaluateReflectionStatus = async (patternId: string) => {
    setLoadingProfile(true);

    const res = await fetch(`/api/pattern-profile/${patternId}`);
    const data = await res.json();

    const hasDoneReflection =
      data?.profile?.has_completed_reflection === true;

    setLoadingProfile(false);

    if (hasDoneReflection) {
      goTo("instructions");
    } else {
      goTo("self-reflection");
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "pattern-selection":
        return (
          <PatternSelectionPage
            onSelect={(patternId) => {
              setSelectedPattern(patternId);
              evaluateReflectionStatus(patternId);
            }}
          />
        );

      case "self-reflection":
        if (!selectedPattern) {
          console.warn("⏳ Waiting for patternId to hydrate...");
          return <div className="p-6">Loading pattern…</div>;
        }

        return (
          <SelfReflectionPage
            patternId={selectedPattern}
            userId={userId}
            onNext={() => goTo("instructions")}
          />
        );

      case "instructions":
        return (
          <InstructionsPage
            // patternId={selectedPattern!}
            onNext={() => goTo("practice")}
          />
        );

      case "practice":
          return (
            <PracticePage
              patternId={selectedPattern!}
              onNext={(attemptId) => {
                setAttemptId(attemptId);
                goTo("practice-feedback");
              }}
            />
          );

      case "practice-feedback":
          return (
            <PracticeFeedbackPage
              attemptId={attemptId!}     // <-- The feedback page fetches everything itself
              onNext={() => goTo("uml-builder")}
              onRetake={() => goTo("practice")}
            />
          );

      case "uml-builder":
        return (
          <UMLBuilderPage
            // patternId={selectedPattern!}
            onNext={() => goTo("cheat-sheet")}
          />
        );

      case "cheat-sheet":
        return (
          <CheatSheetPage
            // patternId={selectedPattern!}
            onNext={() => goTo("quiz")}
          />
        );

      case "quiz":
        return (
          <QuizPage
            // patternId={selectedPattern!}
            // userId={userId}
            user = {userId}
            onNext={() => goTo("results")}
          />
        );

      case "results":
        return <ResultsPage onNext={() => goTo("feedback")} />;

      case "feedback":
        return <FeedbackPage onNext={() => goTo("pattern-selection")} />;
    }
  };

  // Only show navigation for main learning steps
  const showNav = ![
    "pattern-selection",
    "self-reflection",
    "instructions",
    "feedback",
    "quiz",
  ].includes(currentPage);

  return (
    <div className="min-h-screen bg-background">
        <StudentHeader userName={userName}/>
        {showNav && (
          <StudentNavigation
            currentPage={
              currentPage as
                | "practice"
                | "uml-builder"
                | "cheat-sheet"
                | "quiz"
                | "results"
                | "feedback"
            }
            onNavigate={setCurrentPage}
          />
        )}
      <main className="flex-1">
        {renderPage()}
      </main>
    </div>
  );
}
