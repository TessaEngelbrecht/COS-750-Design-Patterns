"use client"
export const LessonTag = "observer-introduction"
import { LessonSectionWrapper } from "@/components/tts/LessonSectionWrapper"

export default function IntroductionSection() {
  return (
    <LessonSectionWrapper title="Introduction">
    {/* <section id="introduction" data-tag={LessonTag} className="space-y-4"> */}
      {/* <h2 className="text-2xl font-bold text-teal-700">Introduction</h2> */}
      <p>
        The <strong>Observer Design Pattern</strong> defines a one-to-many
        relationship between a <em>subject</em> and its <em>observers</em>.
        Whenever the subject’s state changes, all observers are notified and
        updated automatically
        {/* :contentReference[oaicite:1]{index=1}. */}
      </p>
      <p>
        This pattern works well in event-driven or even multi-threaded
        environments (beyond this course’s scope) and is widely used in GUI
        frameworks, chat systems, and monitoring dashboards.
      </p>
      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Simple browser example
// A subject (button) notifies observers (listeners)
const button = document.querySelector("#notify");
button.addEventListener("click", () => alert("Observer triggered!"));`}
      </pre>
    {/* </section> */}
    </LessonSectionWrapper>
  )
}
