// "use client"

// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"
// import { Play } from "lucide-react"

// interface InstructionsPageProps {
//   onNext: () => void
// }

// export function InstructionsPage({ onNext }: InstructionsPageProps) {
//   const instructions = [
//     {
//       number: 1,
//       title: "Practice",
//       description:
//         "This is to test the users pre-quiz before the final quiz to see where the user lies with the content that was provided in the class. From clicking start the user will be timed.",
//     },
//     {
//       number: 2,
//       title: "UML Builder",
//       description: "Interactive tool to build and visualize UML diagrams for the Observer Pattern design.",
//     },
//     {
//       number: 3,
//       title: "Cheat Sheet",
//       description: "Reference guide with key concepts, code examples, and best practices for the Observer Pattern.",
//     },
//     {
//       number: 4,
//       title: "Quiz",
//       description: "Final assessment covering all aspects of the Observer Pattern implementation and concepts.",
//     },
//     {
//       number: 5,
//       title: "Results",
//       description: "Detailed performance analytics and personalized feedback on your learning progress.",
//     },
//   ]

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Main Content */}
//       <div className="px-6 py-8 max-w-7xl mx-auto">
//         <h2 className="text-3xl font-bold text-teal-700 mb-8">Instructions</h2>

//         <div className="grid grid-cols-3 gap-8">
//           {/* Left Sidebar */}
//           <div className="col-span-1">
//             <Card className="p-6 bg-teal-700 text-white border-0">
//               <h3 className="text-xl font-bold mb-6">Instruction Section</h3>
//               <div className="space-y-3">
//                 <button className="w-full py-3 px-4 bg-gray-800 text-white rounded font-semibold hover:bg-gray-700">
//                   Steps
//                 </button>
//                 <button className="w-full py-3 px-4 bg-teal-600 text-white rounded font-semibold hover:bg-teal-500">
//                   Intent And Problem
//                 </button>
//                 <button className="w-full py-3 px-4 bg-teal-600 text-white rounded font-semibold hover:bg-teal-500">
//                   When To Use
//                 </button>
//                 <button className="w-full py-3 px-4 bg-teal-600 text-white rounded font-semibold hover:bg-teal-500">
//                   What To Avoid
//                 </button>
//                 <button className="w-full py-3 px-4 bg-teal-600 text-white rounded font-semibold hover:bg-teal-500">
//                   Glossary
//                 </button>
//               </div>

//               {/* Play Button */}
//               <div className="mt-8 flex flex-col items-center gap-3">
//                 <div className="w-20 h-20 border-4 border-white rounded-full flex items-center justify-center hover:bg-teal-600 cursor-pointer transition">
//                   <Play className="w-10 h-10 text-white fill-white" />
//                 </div>
//                 <p className="text-center font-semibold text-sm">Check Steps</p>
//               </div>
//             </Card>
//           </div>

//           {/* Right Content */}
//           <div className="col-span-2 space-y-4">
//             {instructions.map((item) => (
//               <Card key={item.number} className="p-6 border-2 border-teal-700 bg-blue-100 hover:shadow-lg transition">
//                 <div className="flex gap-4">
//                   <div className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
//                     {item.number}
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
//                     <p className="text-gray-700">{item.description}</p>
//                   </div>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         </div>

//         {/* Start Button */}
//         <div className="flex justify-end mt-8">
//           <Button
//             onClick={onNext}
//             className="px-8 py-3 bg-teal-700 text-white hover:bg-teal-800 rounded-full font-bold text-lg"
//           >
//             Start
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }

"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, SkipForward, BookOpen } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import IntroductionSection from "./lesson/IntroductionSection"
import IdentificationSection from "./lesson/IdentificationSection"
import StructureSection from "./lesson/StructureSection"
import ProblemSection from "./lesson/ProblemSection"
import ParticipantsSection from "./lesson/ParticipantsSection"
import ExplanationsSection from "./lesson/ExplanationsSection"
import ExampleSection from "./lesson/ExampleSection"
import ExercisesSection from "./lesson/ExercisesSection"
import { LessonPageWithTTS } from "@/components/tts/LessonPageWithTTS"

export function InstructionsPage({ onNext }: { onNext: () => void }) {
  const HEADER_H_PX = 70

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeMainTab, setActiveMainTab] = useState("Instructional Layout")
  const [activeLessonTab, setActiveLessonTab] = useState("Introduction")
  const [showAllLessonContent, setShowAllLessonContent] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const sectionRefs = {
    Introduction: useRef<HTMLDivElement>(null),
    Identification: useRef<HTMLDivElement>(null),
    Structure: useRef<HTMLDivElement>(null),
    Problem: useRef<HTMLDivElement>(null),
    Participants: useRef<HTMLDivElement>(null),
    Explanations: useRef<HTMLDivElement>(null),
    Example: useRef<HTMLDivElement>(null),
    Exercises: useRef<HTMLDivElement>(null),
  };

  const lessonTabs = [
    "Introduction",
    "Identification",
    "Structure",
    "Problem",
    "Participants",
    "Explanations",
    "Example",
    "Exercises",
  ];

  const scrollToSection = (section: string) => {
    const ref = sectionRefs[section as keyof typeof sectionRefs];
    if (ref?.current)
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsSidebarOpen(false);
  };

  const instructions = [
    {
      number: 1,
      title: "Practice",
      description: "Practice-quiz to assess knowledge and improve before the final quiz.",
    },
    {
      number: 2,
      title: "UML Builder",
      description: "Interactive tool to build and visualize UML diagrams.",
    },
    {
      number: 3,
      title: "Quiz",
      description: "Final assessment covering all Observer Pattern concepts.",
    },
    {
      number: 4,
      title: "Results",
      description: "Detailed analytics and personalized feedback.",
    },
  ];

  const handleSkipToQuiz = () => {
    onNext();
    scrollToTop();
  }

  const renderInstructionalSection = () => (
    <div className="space-y-4">
      {instructions.map((item) => (
        <Card
          key={item.number}
          className="p-6 border-2 border-teal-700 bg-blue-50 hover:shadow-lg transition"
        >
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
              {item.number}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1 break-words">
                {item.title}
              </h3>
              <p className="text-gray-700">{item.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderLessonSection = () => {
    switch (activeLessonTab) {
      case "Introduction":
        return <IntroductionSection />;
      case "Identification":
        return <IdentificationSection />;
      case "Structure":
        return <StructureSection />;
      case "Problem":
        return <ProblemSection />;
      case "Participants":
        return <ParticipantsSection />;
      case "Explanations":
        return <ExplanationsSection />;
      case "Example":
        return <ExampleSection />;
      case "Exercises":
        return <ExercisesSection />;
      default:
        return <div>Select a lesson section.</div>;
    }
  };

  const renderAllLessonSections = () => (
    <div className="space-y-10">
      <LessonPageWithTTS>
        {lessonTabs.map((section) => (
          <div
            key={section}
            ref={sectionRefs[section as keyof typeof sectionRefs]}
            id={section.toLowerCase()}
            className="scroll-mt-24"
          >
            {(() => {
              switch (section) {
                case "Introduction":
                  return <IntroductionSection />;
                case "Identification":
                  return <IdentificationSection />;
                case "Structure":
                  return <StructureSection />;
                case "Problem":
                  return <ProblemSection />;
                case "Participants":
                  return <ParticipantsSection />;
                case "Explanations":
                  return <ExplanationsSection />;
                case "Example":
                  return <ExampleSection />;
                case "Exercises":
                  return <ExercisesSection />;
                default:
                  return null;
              }
            })()}
          </div>
        ))}
      </LessonPageWithTTS>
    </div>
  );

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div
      className="min-h-screen bg-white overflow-x-hidden pb-12 sm:pb-16"
      style={{ ["--app-header-h" as any]: `${HEADER_H_PX}px` }}
    >
      <div className="flex">
{/* ===== Desktop Sidebar ===== */}
<aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:left-0 lg:top-[var(--app-header-h)] lg:h-[calc(100vh-var(--app-header-h))] bg-white border-r-2 border-teal-700 shadow-lg z-30">
<div className="p-5 border-b-2 border-teal-700">
<div className="flex items-center gap-2 mb-3">
<BookOpen className="w-5 h-5 text-teal-700" />
<h2 className="text-lg font-bold text-teal-700">Lesson Navigation</h2>
</div>
        {/* Main Tabs */}
        <div className="flex gap-2 mb-4">
          {["Instructional", "Lesson"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveMainTab(tab === "Instructional" ? "Instructional Layout" : "Lesson")}
              className={`flex-1 text-xs font-semibold px-3 py-2 rounded-lg border-2 transition ${
                (tab === "Instructional" && activeMainTab === "Instructional Layout") ||
                (tab === "Lesson" && activeMainTab === "Lesson")
                  ? "bg-teal-700 text-white border-teal-700"
                  : "bg-white text-teal-700 border-teal-700 hover:bg-green-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Lesson Mode Toggle */}
        {activeMainTab === "Lesson" && (
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setShowAllLessonContent(false)}
              className={`flex-1 py-2 rounded-lg border-2 font-semibold transition ${
                !showAllLessonContent
                  ? "bg-teal-700 text-white border-teal-700"
                  : "bg-white text-teal-700 border-teal-700 hover:bg-green-50"
              }`}
            >
              Sub-Tabs
            </button>
            <button
              onClick={() => setShowAllLessonContent(true)}
              className={`flex-1 py-2 rounded-lg border-2 font-semibold transition ${
                showAllLessonContent
                  ? "bg-teal-700 text-white border-teal-700"
                  : "bg-white text-teal-700 border-teal-700 hover:bg-green-50"
              }`}
            >
              Full Page
            </button>
          </div>
        )}
      </div>

      {/* Nav list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
        {(activeMainTab === "Lesson" ? lessonTabs : []).map((section) => (
          <button
            key={section}
            onClick={() => {
              setActiveLessonTab(section)
              if (activeMainTab === "Lesson" && showAllLessonContent) scrollToSection(section)
            }}
            className={`block w-full text-left py-2.5 px-3 rounded-lg font-medium transition border-2 ${
              activeLessonTab === section
                ? "bg-teal-700 text-white border-teal-700 shadow-md"
                : "bg-white text-teal-700 border-teal-700 hover:border-teal-700 hover:bg-green-50"
            }`}
          >
            {section}
          </button>
        ))}
      </div>
    </aside>

    {/* ===== Mobile Navigation Bar ===== */}
    <div className="lg:hidden fixed inset-x-0 top-[var(--app-header-h)] z-40 bg-white border-b-2 border-teal-700 shadow-md">
      <div className="px-4 py-3">
        {/* Main Tabs + Dropdown */}
        <div className="flex items-center gap-2">
          {/* Tab Buttons */}
          <button
            onClick={() => setActiveMainTab("Instructional Layout")}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border-2 transition ${
              activeMainTab === "Instructional Layout"
                ? "bg-teal-700 text-white border-teal-700"
                : "bg-white text-teal-700 border-teal-700 hover:bg-green-50"
            }`}
          >
            Instructional
          </button>
          <button
            onClick={() => setActiveMainTab("Lesson")}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border-2 transition ${
              activeMainTab === "Lesson"
                ? "bg-teal-700 text-white border-teal-700"
                : "bg-white text-teal-700 border-teal-700 hover:bg-green-50"
            }`}
          >
            Lesson
          </button>

          {/* Dropdown for Lesson Sections */}
          {activeMainTab === "Lesson" && (
            <div className="relative ml-auto">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border-2 bg-white text-teal-700 border-teal-700 hover:bg-green-50 transition"
              >
                {activeLessonTab}
                <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-teal-700 rounded-lg shadow-xl z-40 max-h-80 overflow-y-auto">
                    {lessonTabs.map((section) => (
                      <button
                        key={section}
                        onClick={() => {
                          setActiveLessonTab(section)
                          if (showAllLessonContent) scrollToSection(section)
                          setDropdownOpen(false)
                        }}
                        className={`block w-full text-left px-4 py-2.5 text-sm font-medium transition ${
                          activeLessonTab === section
                            ? "bg-teal-700 text-white"
                            : "text-teal-700 hover:bg-green-50"
                        }`}
                      >
                        {section}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* ===== Main content ===== */}
    <main className="flex-1 w-full pt-[calc(var(--app-header-h)+60px)] lg:pt-[var(--app-header-h)] px-4 sm:px-6 lg:pl-72 xl:pl-80 max-w-full pb-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-700 break-words">
            {activeMainTab === "Lesson" ? "Lesson Content" : "Instructional Overview"}
          </h1>
          {activeMainTab === "Lesson" && (
            <Button
              onClick={handleSkipToQuiz}
              className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap"
            >
              <SkipForward className="w-4 h-4" />
              Skip to Quiz
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="pb-12">
          <AnimatePresence mode="wait">
            {activeMainTab === "Lesson" ? (
              showAllLessonContent ? (
                <motion.div key="all-lesson" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {renderAllLessonSections()}
                </motion.div>
              ) : (
                <motion.div
                  key={activeLessonTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="[&_pre]:overflow-x-auto [&_code]:break-words"
                >
                  {renderLessonSection()}
                </motion.div>
              )
            ) : (
              <motion.div
                key="instructional"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                {renderInstructionalSection()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer nav */}
        <div className="flex flex-col sm:flex-row sm:justify-between mt-8 gap-3 pb-16">
          {activeMainTab === "Instructional Layout" ? (
            <div className="flex justify-end w-full">
              <Button
                onClick={() => {
                  setActiveMainTab("Lesson")
                  setActiveLessonTab("Introduction")
                  setShowAllLessonContent(false)
                  scrollToTop()
                }}
                className="w-full sm:w-auto px-6 py-3 bg-teal-700 text-white hover:bg-teal-800 rounded-full font-bold text-base sm:text-lg"
              >
                Start Lesson
              </Button>
            </div>
          ) : showAllLessonContent ? (
            <div className="flex justify-end w-full">
              <Button
                onClick={() => {
                  onNext()
                  scrollToTop()
                }}
                className="w-full sm:w-auto px-6 py-3 bg-teal-700 text-white hover:bg-teal-800 rounded-full font-bold text-base sm:text-lg"
              >
                Start Quiz
              </Button>
            </div>
          ) : (
            <>
              <Button
                onClick={() => {
                  const i = lessonTabs.indexOf(activeLessonTab)
                  if (i > 0) {
                    setActiveLessonTab(lessonTabs[i - 1])
                    scrollToTop()
                  }
                }}
                disabled={lessonTabs.indexOf(activeLessonTab) === 0}
                className="w-full sm:w-auto px-6 py-3 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-full font-bold text-base sm:text-lg disabled:opacity-50"
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  const i = lessonTabs.indexOf(activeLessonTab)
                  if (i < lessonTabs.length - 1) {
                    setActiveLessonTab(lessonTabs[i + 1])
                    scrollToTop()
                  } else {
                    onNext()
                  }
                }}
                className="w-full sm:w-auto px-6 py-3 bg-teal-700 text-white hover:bg-teal-800 rounded-full font-bold text-base sm:text-lg"
              >
                {activeLessonTab === lessonTabs[lessonTabs.length - 1] ? "Start Quiz" : "Next"}
              </Button>
            </>
          )}
        </div>
      </div>
    </main>
  </div>
</div>
)
}
