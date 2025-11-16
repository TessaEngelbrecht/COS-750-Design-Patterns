"use client";
export const LessonTag = "observer-introduction";
import { LessonSectionWrapper } from "@/components/tts/LessonSectionWrapper";
import { BookOpen } from "lucide-react";

export default function IntroductionSection() {
  return (
    <LessonSectionWrapper title="Introduction">
      <div className="space-y-6" data-tag="observer-introduction">
        <div className="border-l-4 border-teal-600 pl-4 py-2">
          <p className="text-lg leading-relaxed text-gray-800">
            The{" "}
            <strong className="text-teal-700">Observer Design Pattern</strong>{" "}
            defines a one-to-many relationship between a{" "}
            <em className="text-teal-600">subject</em> and its{" "}
            <em className="text-teal-600">observers</em>. Whenever the subject's
            state changes, all observers are notified and updated automatically.
          </p>
        </div>

        {/* Use cases section */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-200">
          <p className="text-base leading-relaxed text-gray-700">
            This pattern works well in event-driven or even multi-threaded
            environments (beyond this course's scope) and is widely used in GUI
            frameworks, chat systems, and monitoring dashboards.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-teal-700 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Browser Example
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto border border-gray-800 shadow-md font-mono">
            <code>{`// Simple browser example
// A subject (button) notifies observers (listeners)
const button = document.querySelector("#notify");
button.addEventListener("click", () => 
  alert("Observer triggered!")
);`}</code>
          </pre>
        </div>
      </div>
    </LessonSectionWrapper>
  );
}
