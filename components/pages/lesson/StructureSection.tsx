"use client"
export const LessonTag = "observer-structure"
import { LessonSectionWrapper } from "@/components/tts/LessonSectionWrapper"

export default function StructureSection() {
  return (
    <LessonSectionWrapper title="Structure">
      <div data-tag="observer-structure" className="space-y-4">
        <p>
          The pattern contains two hierarchies — the <strong>Subject</strong>
          hierarchy (things being observed) and the
          <strong> Observer</strong> hierarchy (things watching). Subjects keep a
          list of observers and notify them when state changes
        </p>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`interface Subject {
  attach(o: Observer): void;
  detach(o: Observer): void;
  notify(): void;
}

interface Observer {
  update(subject: Subject): void;
}`}
        </pre>
      </div>
    </LessonSectionWrapper>
  )
}
