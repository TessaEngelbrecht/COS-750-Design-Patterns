"use client"
import { logoutUser } from "@/lib/auth/logout";

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

interface StudentHeaderProps {
  userName: string;
  currentPage?: PageType;
  onBackToPatternSelection?: () => void;
}

export function StudentHeader({ 
  userName, 
  currentPage,
  onBackToPatternSelection 
}: StudentHeaderProps) {
  // Show "Change Pattern" button only if NOT on pattern-selection page
  const showChangePatternButton = currentPage && currentPage !== "pattern-selection";

  return (
    <header className="bg-teal-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Design Pattern Learning Platform</h1>
          
          {showChangePatternButton && onBackToPatternSelection && (
            <button
              onClick={onBackToPatternSelection}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg transition font-semibold text-sm"
            >
              Change Pattern
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-semibold">{userName}</p>
            <p className="text-xs text-blue-100">Student</p>
          </div>
          <button
            onClick={logoutUser}
            className="px-4 py-2 bg-white text-teal-700 font-semibold rounded-lg hover:bg-blue-50 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}