"use client"
export const LessonTag = "observer-identification"
import { LessonSectionWrapper } from "@/components/tts/LessonSectionWrapper"

export default function IdentificationSection() {
  return (
    <LessonSectionWrapper title="Identification">
    <section id="identification" data-tag={LessonTag} className="space-y-4">
      {/* <h2 className="text-2xl font-bold text-teal-700">Identification</h2> */}
      <ul className="list-disc ml-6 space-y-1">
        <li><strong>Name:</strong> Observer</li>
        <li><strong>Classification:</strong> Behavioural Pattern</li>
        <li><strong>Strategy:</strong> Delegation (Object)
        {/* :contentReference[oaicite:2]{index=2} */}
        </li>
        <li>
          <strong>Intent:</strong> Define a one-to-many dependency so that when
          one object changes state, all its dependents are notified and updated
          automatically.
        </li>
      </ul>
    </section>
    </LessonSectionWrapper>
  )
}
