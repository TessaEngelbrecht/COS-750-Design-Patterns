"use client"
export const LessonTag = "observer-explanations"
import { LessonSectionWrapper } from "@/components/tts/LessonSectionWrapper"

export default function ExplanationsSection() {
  return (
    <LessonSectionWrapper title="Explanations">
    <section id="explanations" data-tag={LessonTag} className="space-y-8">
      {/* <h2 className="text-2xl font-bold text-teal-700">Explanations</h2> */}

      <div>
        <h3 className="text-xl font-semibold text-teal-600">Clarification</h3>
        <p>
          The two hierarchies — Subjects and Observers — interact through a
          well-defined interface. Observers register, the subject triggers
          updates, and observers respond via their
          <code> update()</code> methods
          {/* :contentReference[oaicite:6]{index=6}. */}
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-teal-600">Code Improvements Achieved</h3>
        <p>
          The pattern achieves <strong>separation of concerns</strong>:
          observers are independent and may register or deregister dynamically
          without affecting the subject.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-teal-600">Implementation Issues</h3>
        <p>
          Two issues arise — detaching observers and transferring state.
          Observers must detach when destroyed, and state can follow either the
          <em> push </em>or<em> pull </em>model:
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Push Model:</strong> Subject sends all data to observers (higher coupling).</li>
          <li><strong>Pull Model:</strong> Observers request state from subject (lower coupling, more calls).
          {/* :contentReference[oaicite:7]{index=7} */}
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-teal-600">Common Misconceptions</h3>
        <p>
          The Observer pattern is <em>not</em> a global broadcast. Only
          registered observers receive updates
          {/* :contentReference[oaicite:8]{index=8}. */}
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-teal-600">Related Patterns</h3>
        <ul className="list-disc ml-6">
          <li><strong>Mediator –</strong> coordinates independent objects, often used with Observer.</li>
          <li><strong>Singleton –</strong> ensures a single global subject instance
          {/* :contentReference[oaicite:9]{index=9}. */}
          </li>
        </ul>
      </div>
    </section>
    </LessonSectionWrapper>
  )
}
