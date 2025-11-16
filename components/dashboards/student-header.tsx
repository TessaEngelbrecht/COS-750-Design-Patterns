"use client"
import { logoutUser } from "@/lib/auth/logout";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";

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
  onBackToLesson?: () => void;
}

export function StudentHeader({ 
  userName, 
  currentPage,
  onBackToPatternSelection,
  onBackToLesson
}: StudentHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const showChangePatternButton = currentPage && currentPage !== "pattern-selection";
  const showBackToLessonButton = currentPage && ![
    "pattern-selection",
    "self-reflection", 
    "instructions"
  ].includes(currentPage);

  return (
    <header className="bg-teal-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl lg:text-2xl font-bold">Design Pattern Learning Platform</h1>
            
            {showChangePatternButton && onBackToPatternSelection && (
              <button
                onClick={onBackToPatternSelection}
                className="flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg transition font-semibold text-sm whitespace-nowrap"
              >
                Change Pattern
              </button>
            )}

            {showBackToLessonButton && onBackToLesson && (
              <button
                onClick={onBackToLesson}
                className="flex items-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg transition font-semibold text-sm whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" />
                Back to Lesson
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4">
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

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold truncate max-w-[60%]">
              Design Patterns
            </h1>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-teal-600 rounded-lg transition"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="mt-3 pb-2 space-y-2 border-t border-teal-600 pt-3">
              <div className="flex items-center gap-2 pb-2 border-b border-teal-600">
                <div className="text-sm">
                  <p className="font-semibold">{userName}</p>
                  <p className="text-xs text-blue-100">Student</p>
                </div>
              </div>

              {showChangePatternButton && onBackToPatternSelection && (
                <button
                  onClick={() => {
                    onBackToPatternSelection();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg transition font-semibold text-sm"
                >
                  Change Pattern
                </button>
              )}

              {showBackToLessonButton && onBackToLesson && (
                <button
                  onClick={() => {
                    onBackToLesson();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg transition font-semibold text-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  Back to Lesson
                </button>
              )}

              <button
                onClick={logoutUser}
                className="w-full px-3 py-2 bg-white text-teal-700 font-semibold rounded-lg hover:bg-blue-50 transition text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}