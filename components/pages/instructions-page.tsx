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
import { Play, Menu, X } from "lucide-react"
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
  // Match this to your real header height (px). 64px is a common appbar size.
  const HEADER_H_PX = 70

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeMainTab, setActiveMainTab] = useState("Lesson") // default to Lesson if you prefer
  const [activeLessonTab, setActiveLessonTab] = useState("Introduction")
  const [showAllLessonContent, setShowAllLessonContent] = useState(false)

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
    if (ref?.current) ref.current.scrollIntoView({ behavior: "smooth", block: "start" })
    setIsSidebarOpen(false)
  }

  const instructions = [
    { number: 1, title: "Practice", description: "Pre-quiz to assess knowledge before the final quiz." },
    { number: 2, title: "UML Builder", description: "Interactive tool to build and visualize UML diagrams." },
    { number: 3, title: "Cheat Sheet", description: "Reference guide with key concepts and examples." },
    { number: 4, title: "Quiz", description: "Final assessment covering all Observer Pattern concepts." },
    { number: 5, title: "Results", description: "Detailed analytics and personalized feedback." },
  ]

  const renderInstructionalSection = () => (
    <div className="space-y-4">
      {instructions.map((item) => (
        <Card key={item.number} className="p-6 border-2 border-teal-700 bg-blue-50 hover:shadow-lg transition">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
              {item.number}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1 break-words">{item.title}</h3>
              <p className="text-gray-700">{item.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  const renderLessonSection = () => {
    switch (activeLessonTab) {
      case "Introduction": return <IntroductionSection />
      case "Identification": return <IdentificationSection />
      case "Structure": return <StructureSection />
      case "Problem": return <ProblemSection />
      case "Participants": return <ParticipantsSection />
      case "Explanations": return <ExplanationsSection />
      case "Example": return <ExampleSection />
      case "Exercises": return <ExercisesSection />
      default: return <div>Select a lesson section.</div>
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
                case "Introduction": return <IntroductionSection />
                case "Identification": return <IdentificationSection />
                case "Structure": return <StructureSection />
                case "Problem": return <ProblemSection />
                case "Participants": return <ParticipantsSection />
                case "Explanations": return <ExplanationsSection />
                case "Example": return <ExampleSection />
                case "Exercises": return <ExercisesSection />
                default: return null
              }
            })()}
          </div>
        ))}
      </LessonPageWithTTS>
    </div>
  )

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  return (
    // Inject header height as a CSS var used below
    <div
      className="min-h-screen bg-white overflow-x-hidden"
      style={{ ["--app-header-h" as any]: `${HEADER_H_PX}px` }}
    >
      <div className="flex">
        {/* ===== Sidebar (desktop fixed under header) ===== */}
        <aside
          className={`
            hidden md:flex md:flex-col md:w-64 md:fixed md:left-0
            md:top-[var(--app-header-h)]
            md:h-[calc(100vh-var(--app-header-h))]
            bg-teal-700 text-white border-r border-teal-800 shadow-lg z-30
          `}
        >
          <div className="p-5 border-b border-teal-600">
            <h2 className="text-lg font-bold mb-2">Lesson Navigation</h2>

            {/* Mode Switch */}
            <div className="flex mb-4">
              {["Instructional Layout", "Lesson"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveMainTab(tab)}
                  className={`flex-1 text-xs font-semibold px-2 py-1 ${
                    activeMainTab === tab
                      ? "bg-gray-900 text-white"
                      : "bg-teal-600 hover:bg-teal-500 text-gray-100"
                  } ${tab === "Lesson" ? "rounded-r-sm" : "rounded-l-sm"}`}
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
                    !showAllLessonContent ? "bg-gray-900 text-white" : "hover:bg-teal-500 text-gray-200"
                  }`}
                >
                  Sub-Tabs
                </button>
                <button
                  onClick={() => setShowAllLessonContent(true)}
                  className={`flex-1 py-1 ${
                    showAllLessonContent ? "bg-gray-900 text-white" : "hover:bg-teal-500 text-gray-200"
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
                className={`block w-full text-left py-2 px-3 rounded-md font-medium transition ${
                  activeLessonTab === section ? "bg-gray-800 text-white" : "bg-teal-600 hover:bg-teal-500"
                }`}
              >
                {section}
              </button>
            ))}
          </div>

          {/* <div className="p-4 border-t border-teal-600 flex flex-col items-center">
            <div className="w-14 h-14 border-4 border-white rounded-full flex items-center justify-center hover:bg-teal-600 cursor-pointer transition">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
            <p className="text-xs mt-1 font-semibold">Start Lesson</p>
          </div> */}
        </aside>

        {/* ===== Mobile topbar controls (no extra header) ===== */}
        <div className="md:hidden fixed inset-x-0 top-[var(--app-header-h)] z-40 bg-teal-700/95 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <h2 className="text-white font-semibold">Lesson Navigation</h2>
            <button onClick={() => setIsSidebarOpen(v => !v)} className="text-white">
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* ===== Mobile drawer ===== */}
        <aside
          className={`
            md:hidden fixed left-0 right-0
            top-[calc(var(--app-header-h)+48px)]  /* below the mobile topbar above */
            bottom-0 z-40 bg-teal-700 text-white
            transform transition-transform duration-300
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            w-64 shadow-xl
          `}
        >
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
              {(activeMainTab === "Lesson" ? lessonTabs : []).map((section) => (
                <button
                  key={section}
                  onClick={() => {
                    setActiveLessonTab(section)
                    if (activeMainTab === "Lesson" && showAllLessonContent) scrollToSection(section)
                    setIsSidebarOpen(false)
                  }}
                  className={`block w-full text-left py-2 px-3 rounded-md font-medium transition ${
                    activeLessonTab === section ? "bg-gray-800 text-white" : "bg-teal-600 hover:bg-teal-500"
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-teal-600 flex flex-col items-center">
              <div className="w-14 h-14 border-4 border-white rounded-full flex items-center justify-center hover:bg-teal-600 cursor-pointer transition">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
              <p className="text-xs mt-1 font-semibold">Start Lesson</p>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* ===== Main content ===== */}
        <main
          className={`
            flex-1 w-full
            pt-[calc(var(--app-header-h)+48px)] md:pt-[var(--app-header-h)]
            px-4 sm:px-6 md:px-8
            md:pl-80
            l:pl-64
            max-w-full
          `}
        >
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-teal-700 mb-6 break-words">
              {activeMainTab === "Lesson" ? "Lesson Content" : "Instructional Overview"}
            </h1>

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
                    // keep long code blocks from pushing layout
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

            {/* Footer nav */}
            <div className="flex flex-wrap justify-between mt-8 gap-3">
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
                  <Button
                    onClick={() => {
                      const i = lessonTabs.indexOf(activeLessonTab)
                      if (i > 0) {
                        setActiveLessonTab(lessonTabs[i - 1])
                        scrollToTop()
                      }
                    }}
                    disabled={lessonTabs.indexOf(activeLessonTab) === 0}
                    className="px-8 py-3 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-full font-bold text-lg disabled:opacity-50"
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
                    className="px-8 py-3 bg-teal-700 text-white hover:bg-teal-800 rounded-full font-bold text-lg"
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
