"use client"
export const LessonTag = "observer-participants"
import { LessonSectionWrapper } from "@/components/tts/LessonSectionWrapper"

export default function ParticipantsSection() {
  return (
    <LessonSectionWrapper title="Participants">
    <section id="participants" data-tag={LessonTag} className="space-y-4">
      {/* <h2 className="text-2xl font-bold text-teal-700">Participants</h2> */}
      <ul className="list-disc ml-6 space-y-2">
        <li><strong>Subject</strong> – interface for attaching and detaching observers.</li>
        <li><strong>ConcreteSubject</strong> – implements storage and notifies observers on state change.</li>
        <li><strong>Observer</strong> – defines an <code>update()</code> interface.</li>
        <li><strong>ConcreteObserver</strong> – keeps a reference to the subject and updates its own state
        {/* :contentReference[oaicite:5]{index=5}. */}
        </li>
      </ul>
    </section>
    </LessonSectionWrapper>
  )
}
