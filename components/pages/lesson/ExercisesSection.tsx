"use client"
export const LessonTag = "observer-exercises"
import { LessonSectionWrapper } from "@/components/tts/LessonSectionWrapper"

export default function ExercisesSection() {
  return (
    <LessonSectionWrapper title="Exercises">
    <section id="exercises" data-tag={LessonTag} className="space-y-4">
      {/* <h2 className="text-2xl font-bold text-teal-700">Exercises</h2> */}
      <ol className="list-decimal ml-6 space-y-2">
        <li>
          Draw a sequence diagram for the RacingCar and PitCrew example. Label
          where <code>attach()</code>, <code>notify()</code>, and
          <code>update()</code> occur.
        </li>
        <li>
          Implement a simple subject–observer pair in your preferred language.
        </li>
        <li>
          Extend the implementation to include a Mediator that manages multiple subjects.
        </li>
        <li>
          Experiment with push vs pull updates—measure which is more efficient.
        </li>
      </ol>
    </section>
    </LessonSectionWrapper>
  )
}
