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

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Imports for lesson structure
import IntroductionSection, { LessonTag as IntroTag } from "./lesson/IntroductionSection"
import IdentificationSection, { LessonTag as IdTag } from "./lesson/IdentificationSection"
import StructureSection, { LessonTag as StructureTag } from "./lesson/StructureSection"
import ProblemSection, { LessonTag as ProblemTag } from "./lesson/ProblemSection"
import ParticipantsSection, { LessonTag as ParticipantsTag } from "./lesson/ParticipantsSection"
import ExplanationsSection, { LessonTag as ExplanationTag } from "./lesson/ExplanationsSection"
import ExampleSection, { LessonTag as ExampleTag } from "./lesson/ExampleSection"
import ExercisesSection, { LessonTag as ExerciseTag } from "./lesson/ExercisesSection"
import { LessonPageWithTTS } from "@/components/tts/LessonPageWithTTS"

interface InstructionsPageProps {
  onNext: () => void
}

export function InstructionsPage({ onNext }: { onNext: () => void }) {
  const [activeMainTab, setActiveMainTab] = useState("Instructional Layout")
  const [activeLessonTab, setActiveLessonTab] = useState("Introduction")
  const [showAllLessonContent, setShowAllLessonContent] = useState(false)

  // Refs for scroll navigation
  const sectionRefs = {
    Introduction: useRef<HTMLDivElement>(null),
    Identification: useRef<HTMLDivElement>(null),
    Structure: useRef<HTMLDivElement>(null),
    Problem: useRef<HTMLDivElement>(null),
    Participants: useRef<HTMLDivElement>(null),
    Explanations: useRef<HTMLDivElement>(null),
    Example: useRef<HTMLDivElement>(null),
    Exercises: useRef<HTMLDivElement>(null),
  }

  const lessonTabs = [
    "Introduction",
    "Identification",
    "Structure",
    "Problem",
    "Participants",
    "Explanations",
    "Example",
    "Exercises",
  ]

  const scrollToSection = (section: string) => {
    const ref = sectionRefs[section as keyof typeof sectionRefs]
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }
  const instructions = [
    {
      number: 1,
      title: "Practice",
      description:
        "This is to test the users pre-quiz before the final quiz to see where the user lies with the content that was provided in the class. From clicking start the user will be timed.",
    },
    {
      number: 2,
      title: "UML Builder",
      description:
        "Interactive tool to build and visualize UML diagrams for the Observer Pattern design.",
    },
    {
      number: 3,
      title: "Cheat Sheet",
      description:
        "Reference guide with key concepts, code examples, and best practices for the Observer Pattern.",
    },
    {
      number: 4,
      title: "Quiz",
      description:
        "Final assessment covering all aspects of the Observer Pattern implementation and concepts.",
    },
    {
      number: 5,
      title: "Results",
      description:
        "Detailed performance analytics and personalized feedback on your learning progress.",
    },
  ]

  // Rendering logic
  const renderInstructionalSection = () => {
    return (
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
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-700">{item.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const renderLessonSection = () => {
    switch (activeLessonTab) {
      case "Introduction":
        return <IntroductionSection />
      case "Identification":
        return <IdentificationSection />
      case "Structure":
        return <StructureSection />
      case "Problem":
        return <ProblemSection />
      case "Participants":
        return <ParticipantsSection />
      case "Explanations":
        return <ExplanationsSection />
      case "Example":
        return <ExampleSection />
      case "Exercises":
        return <ExercisesSection />
      default:
        return <div>Select a lesson section.</div>
    }
  }

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
                  return <IntroductionSection />
                case "Identification":
                  return <IdentificationSection />
                case "Structure":
                  return <StructureSection />
                case "Problem":
                  return <ProblemSection />
                case "Participants":
                  return <ParticipantsSection />
                case "Explanations":
                  return <ExplanationsSection />
                case "Example":
                  return <ExampleSection />
                case "Exercises":
                  return <ExercisesSection />
                default:
                  return null
              }
            })()}
          </div>
        ))}
      </LessonPageWithTTS>
    </div>
  )

  const scrollToTop = () => {
    // Smooth scroll to top of main content container
    const container = document.querySelector("main")
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* ===== Fixed Left Sidebar ===== */}
      <aside className="w-64 bg-teal-700 text-white flex flex-col fixed left-0 top-18 h-[calc(100vh-4rem)] border-r border-teal-800 shadow-lg">
        <div className="p-5 border-b border-teal-600">
          <h2 className="text-lg font-bold mb-2">Observer Pattern</h2>

          {/* Main Mode Switch */}
          <div className="flex mb-4">
            {["Instructional Layout", "Lesson"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveMainTab(tab)}
                className={`flex-1 text-xs font-semibold px-2 py-1 rounded-l-sm ${
                  activeMainTab === tab
                    ? "bg-gray-900 text-white"
                    : "bg-teal-600 hover:bg-teal-500 text-gray-100"
                } ${tab === "Lesson" ? "rounded-r-sm" : ""}`}
              >
                {tab.replace(" Layout", "")}
              </button>
            ))}
          </div>

          {/* Lesson Mode Toggle */}
          {activeMainTab === "Lesson" && (
            <div className="flex bg-teal-600 rounded-full overflow-hidden mb-3 text-xs">
              <button
                onClick={() => setShowAllLessonContent(false)}
                className={`flex-1 py-1 ${
                  !showAllLessonContent
                    ? "bg-gray-900 text-white"
                    : "hover:bg-teal-500 text-gray-200"
                }`}
              >
                Sub-Tabs
              </button>
              <button
                onClick={() => setShowAllLessonContent(true)}
                className={`flex-1 py-1 ${
                  showAllLessonContent
                    ? "bg-gray-900 text-white"
                    : "hover:bg-teal-500 text-gray-200"
                }`}
              >
                Full Page
              </button>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
          {(activeMainTab === "Lesson" ? lessonTabs : []).map(
            (section) => (
              <button
                key={section}
                onClick={() => {
                  setActiveLessonTab(section)
                  if (activeMainTab === "Lesson" && showAllLessonContent)
                    scrollToSection(section)
                }}
                className={`block w-full text-left py-2 px-3 rounded-md font-medium transition ${
                  activeLessonTab === section
                    ? "bg-gray-800 text-white"
                    : "bg-teal-600 hover:bg-teal-500"
                }`}
              >
                {section}
              </button>
            )
          )}
        </div>

        {/* Footer Play Button */}
        <div className="p-4 border-t border-teal-600 flex flex-col items-center">
          <div className="w-14 h-14 border-4 border-white rounded-full flex items-center justify-center hover:bg-teal-600 cursor-pointer transition">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
          <p className="text-xs mt-1 font-semibold">Start Lesson</p>
        </div>
      </aside>

      {/* ===== Right Content Area ===== */}
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-teal-700 mb-6">
            {activeMainTab === "Lesson"
              ? "Lesson Content"
              : "Instructional Overview"}
          </h1>

          {/* <Card className="p-6 border-2 border-teal-700 bg-blue-50"> */}
            {activeMainTab === "Lesson" ? (
              showAllLessonContent ? (
                renderAllLessonSections()
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeLessonTab} // ensures re-animation on tab change
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                  >
                    {renderLessonSection()}
                  </motion.div>
                </AnimatePresence>
              )
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key="instructional-layout"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                >
                  {renderInstructionalSection()}
                </motion.div>
              </AnimatePresence>
            )}
          {/* </Card> */}

          {/* ===== Footer Button ===== */}
          <div className="flex justify-between mt-8">
            {activeMainTab === "Instructional Layout" ? (
              <div className="flex justify-end w-full">
                <Button
                  onClick={() => {
                    setActiveMainTab("Lesson")
                    setActiveLessonTab("Introduction")
                    setShowAllLessonContent(false)
                    scrollToTop()
                  }}
                  className="px-8 py-3 bg-teal-700 text-white hover:bg-teal-800 rounded-full font-bold text-lg"
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
                  className="px-8 py-3 bg-teal-700 text-white hover:bg-teal-800 rounded-full font-bold text-lg"
                >
                  Start Quiz
                </Button>
              </div>
            ) : (
              <>
                {/* Back Button */}
                <Button
                  onClick={() => {
                    const currentIndex = lessonTabs.indexOf(activeLessonTab)
                    if (currentIndex > 0) {
                      setActiveLessonTab(lessonTabs[currentIndex - 1])
                      scrollToTop()
                    }
                  }}
                  disabled={lessonTabs.indexOf(activeLessonTab) === 0}
                  className="px-8 py-3 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-full font-bold text-lg disabled:opacity-50"
                >
                  Back
                </Button>

                {/* Next or Start Quiz */}
                <Button
                  onClick={() => {
                    const currentIndex = lessonTabs.indexOf(activeLessonTab)
                    if (currentIndex < lessonTabs.length - 1) {
                      setActiveLessonTab(lessonTabs[currentIndex + 1])
                      scrollToTop()
                    } else {
                      onNext()
                    }
                  }}
                  className="px-8 py-3 bg-teal-700 text-white hover:bg-teal-800 rounded-full font-bold text-lg"
                >
                  {activeLessonTab === lessonTabs[lessonTabs.length - 1]
                    ? "Start Quiz"
                    : "Next"}
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}