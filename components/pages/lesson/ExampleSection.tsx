"use client"
export const LessonTag = "observer-example"
import { LessonSectionWrapper } from "@/components/tts/LessonSectionWrapper"

export default function ExampleSection() {
  return (
    <LessonSectionWrapper title="Example – Racing Scenario">
    <section id="example" data-tag={LessonTag} className="space-y-4">
      {/* <h2 className="text-2xl font-bold text-teal-700">Example – Racing Scenario</h2> */}
      <p>
        In the F1 Grand Prix, the <strong>RacingCar</strong> is the subject,
        while the <strong>PitCrew</strong> are observers deciding on refuelling
        or tyre changes. The pit stop workshop attaches and notifies these crew
        members
        {/* :contentReference[oaicite:10]{index=10}. */}
      </p>
      <p>
        add image and question about what the pit crew should do
      </p>
    </section>
    </LessonSectionWrapper>
  )
}
