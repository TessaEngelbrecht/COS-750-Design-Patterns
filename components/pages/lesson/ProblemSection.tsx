"use client"
export const LessonTag = "observer-problem"
import { LessonSectionWrapper } from "@/components/tts/LessonSectionWrapper"

export default function ProblemSection() {
  return (
    <LessonSectionWrapper title="Problem">
    <section id="problem" data-tag={LessonTag} className="space-y-4">
      {/* <h2 className="text-2xl font-bold text-teal-700">Problem</h2> */}
      <p>
        Without the Observer Pattern, every time a new dependent class is added
        or removed, the subject’s code must be modified. This tight coupling
        leads to fragile systems
        {/* :contentReference[oaicite:4]{index=4}. */}
      </p>
      <p>
        Observer solves this by allowing subjects to broadcast changes via a
        stable interface — new observers can be attached or detached at runtime
        without altering the subject itself.
      </p>
    </section>
    </LessonSectionWrapper>
  )
}
