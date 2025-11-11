"use client";

import { useEffect, useState } from "react";
import { StudentHeader } from "@/components/dashboards/student-header";
import { StudentNavigation } from "@/components/dashboards/student-navigation";
import { InstructionsPage } from "@/components/pages/instructions-page";
import { PracticePage } from "@/components/pages/practice-page";
import { PracticeFeedbackPage } from "@/components/pages/practice-feedback-page";
import { UMLBuilderPage } from "@/components/pages/uml-builder-page";
import { CheatSheetPage } from "@/components/pages/cheat-sheet-page";
import { QuizPage } from "@/components/pages/quiz-page";
import { ResultsPage } from "@/components/pages/results-page";
import { FeedbackPage } from "@/components/pages/feedback-page";
import { SelfReflectionPage } from "../pages/self-reflection-page";

type PageType =
  | "self-reflection"
  | "instructions"
  | "practice"
  | "practice-feedback"
  | "uml-builder"
  | "cheat-sheet"
  | "quiz"
  | "results"
  | "feedback";

interface StudentDashboardProps {
  userName: string;
  onLogout: () => void;
}

export function StudentDashboard({
  userName,
  onLogout,
}: StudentDashboardProps) {
  const [currentPage, setCurrentPage] = useState<PageType | string>("");
  const [practiceAnswers, setPracticeAnswers] = useState<any[]>([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { has_seen_self_reflection } = user;
  useEffect(() => {
    if (!has_seen_self_reflection) {
      setCurrentPage("self-reflection");
    } else {
      setCurrentPage("instructions");
    }
  }, [has_seen_self_reflection]);

  const renderPage = () => {
    switch (currentPage) {
      case "self-reflection":
        return (
          <SelfReflectionPage onNext={() => setCurrentPage("instructions")} />
        );
      case "instructions":
        return <InstructionsPage onNext={() => setCurrentPage("practice")} />;
      case "practice":
        return (
          <PracticePage
            onNext={(answers) => {
              setPracticeAnswers(answers);
              setCurrentPage("practice-feedback");
            }}
          />
        );
      case "practice-feedback":
        return (
          <PracticeFeedbackPage
            practiceAnswers={practiceAnswers}
            onNext={() => setCurrentPage("uml-builder")}
          />
        );
      case "uml-builder":
        return <UMLBuilderPage onNext={() => setCurrentPage("cheat-sheet")} />;
      case "cheat-sheet":
        return <CheatSheetPage onNext={() => setCurrentPage("quiz")} />;
      case "quiz":
        return (
          <QuizPage
            onNext={() => setCurrentPage("results")}
            email="james.davis@university.ac.za"
          />
        );
      case "results":
        return (
          <ResultsPage
            onNext={() => setCurrentPage("feedback")}
            email="james.davis@university.ac.za"
          />
        );
      case "feedback":
        return (
          <FeedbackPage onNext={() => setCurrentPage("self-reflection")} />
        );
      default:
        return (
          <SelfReflectionPage onNext={() => setCurrentPage("instructions")} />
        );
    }
  };

  const showNavigation = ![
    "self-reflection",
    "instructions",
    "feedback",
    "quiz",
  ].includes(currentPage);
  const mainPageType = currentPage as any;

  return (
    <div className="min-h-screen bg-background">
      <StudentHeader userName={userName} onLogout={onLogout} />
      {showNavigation && (
        <StudentNavigation
          currentPage={mainPageType}
          onNavigate={setCurrentPage}
        />
      )}
      <main className="flex-1">{renderPage()}</main>
    </div>
  );
}
