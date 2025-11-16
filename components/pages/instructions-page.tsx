"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, SkipForward, BookOpen, Play, Download } from "lucide-react"
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
import VideoWithPopover from "../ui/videoPlayer"

// PDF Generation Function - With Image Support
const generateLessonPDF = () => {

  const sections = [
    { title: 'Introduction', tag: 'observer-introduction' },
    { title: 'Identification', tag: 'observer-identification' },
    { title: 'Structure', tag: 'observer-structure' },
    { title: 'Problem', tag: 'observer-problem' },
    { title: 'Participants', tag: 'observer-participants' },
    { title: 'Explanations', tag: 'observer-explanations' },
    { title: 'Example', tag: 'observer-example' },
    { title: 'Exercises', tag: 'observer-exercises' },
  ];

  // Filter to only loaded sections
  const loadedSections = sections.filter(section => {
    const element = document.querySelector(`[data-tag="${section.tag}"]`);
    const hasContent = element && element.innerHTML.trim().length > 20;
    //console.log(`📄 ${section.title}:`, hasContent ? '✅ Found' : '❌ Skipped');
    return hasContent;
  });

  if (loadedSections.length === 0) {
    alert('No lesson content is currently loaded. Please switch to "Full Page" mode in the Lesson tab first.');
    return;
  }

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Observer Pattern - Lesson Content</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.7;
          color: #1f2937;
          max-width: 850px;
          margin: 0 auto;
          padding: 40px 30px;
          background: white;
        }
        .header {
          text-align: center;
          margin-bottom: 50px;
          padding-bottom: 20px;
          border-bottom: 4px solid #0f766e;
        }
        h1 {
          color: #0f766e;
          font-size: 32px;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #64748b;
          font-size: 16px;
        }
        .section {
          margin-bottom: 40px;
          page-break-inside: avoid;
        }
        h2 {
          color: #0d9488;
          font-size: 24px;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #99f6e4;
          page-break-after: avoid;
        }
        h3 {
          color: #14b8a6;
          font-size: 18px;
          margin-top: 20px;
          margin-bottom: 12px;
          font-weight: 600;
        }
        p {
          margin: 12px 0;
          text-align: justify;
        }
        ul, ol {
          margin: 12px 0;
          padding-left: 30px;
        }
        li {
          margin: 8px 0;
          line-height: 1.6;
        }
        code {
          background: #f1f5f9;
          color: #0f172a;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', Consolas, monospace;
          font-size: 0.9em;
          border: 1px solid #e2e8f0;
        }
        pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 20px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 16px 0;
          page-break-inside: avoid;
          border: 1px solid #334155;
        }
        pre code {
          background: none;
          color: inherit;
          padding: 0;
          border: none;
          font-size: 13px;
          line-height: 1.6;
        }
        strong {
          color: #0f766e;
          font-weight: 600;
        }
        em {
          color: #14b8a6;
          font-style: italic;
        }
        img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 20px auto;
          border: 2px solid #99f6e4;
          border-radius: 8px;
          page-break-inside: avoid;
        }
        .content-note {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 12px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 14px;
          color: #92400e;
        }
        @media print {
          body {
            padding: 20px;
            font-size: 11pt;
          }
          .section {
            page-break-before: auto;
            page-break-after: auto;
          }
          h2 {
            page-break-after: avoid;
          }
          pre, img {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Observer Design Pattern</h1>
        <p class="subtitle">Lesson Content (${loadedSections.length} of ${sections.length} sections)</p>
      </div>
  `;

  // Add note if not all sections are loaded
  if (loadedSections.length < sections.length) {
    const missingSections = sections
      .filter(s => !loadedSections.find(l => l.tag === s.tag))
      .map(s => s.title);
    
    htmlContent += `
      <div class="content-note">
        <p><strong>Note:</strong> This PDF contains only the sections that were loaded in your browser.</p>
        <p><strong>Missing sections:</strong> ${missingSections.join(', ')}</p>
        <p>To include all sections, switch to "Full Page" mode in the Lesson tab before downloading.</p>
      </div>
    `;
  }

  // Add only loaded sections
  loadedSections.forEach(section => {
    const element = document.querySelector(`[data-tag="${section.tag}"]`);
    
    if (element) {
      htmlContent += `<div class="section">`;
      htmlContent += `<h2>${section.title}</h2>`;
      
      // Clone the element to avoid modifying the original
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Remove any interactive elements like buttons
      clone.querySelectorAll('button').forEach(btn => btn.remove());
      
      // Convert Next.js Image components to regular img tags for PDF
      clone.querySelectorAll('img').forEach(img => {
        // Get the actual src (Next.js might transform it)
        const src = img.getAttribute('src');
        if (src && src.startsWith('/')) {
          // Convert relative path to absolute URL
          img.setAttribute('src', window.location.origin + src);
        }
      });
      
      // Get the inner HTML with all formatting preserved
      const content = clone.innerHTML;
      
      htmlContent += content;
      htmlContent += `</div>`;
    }
  });

  htmlContent += `
      <div style="margin-top: 60px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
        <p>Generated from Observer Pattern Learning Platform</p>
        <p>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
      </div>
    </body>
    </html>
  `;

  // Create new window
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('Please allow popups to download the PDF');
    return;
  }

  // Write content
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Trigger print dialog after content and images load
  setTimeout(() => {
    printWindow.print();
  }, 500); // Increased timeout to allow images to load
};




export function InstructionsPage({ onNext }: { onNext: () => void }) {
  const HEADER_H_PX = 70
  const [showVideo, setShowVideo] = useState(false);
  const playVideo = () => setShowVideo(true);
  const closeVideo = () => setShowVideo(false);

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
        <button
          onClick={playVideo}
          className="w-14 h-14 rounded-full border-[2px] border border-teal-700 flex items-center justify-center hover:bg-teal-200 mx-auto mt-4"
        >
          <Play className="w-6 h-6 text-teal-700" />
        </button>
        <div className="text-teal-700 flex font-bold text-xs items-center justify-center mx-auto">
          Observer Pattern Overview
        </div>
      </div>
      <VideoWithPopover open={showVideo} onClose={closeVideo} />
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
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
      <Button
        onClick={generateLessonPDF}
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap"
      >
        <Download className="w-4 h-4" />
        Download PDF
      </Button>
      <Button
        onClick={handleSkipToQuiz}
        className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap"
      >
        <SkipForward className="w-4 h-4" />
        Skip to Quiz
      </Button>
    </div>
  )}
</div>


        {/* Content */}
        <div className="pb-12" data-lesson-content>
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
