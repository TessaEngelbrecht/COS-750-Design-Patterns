"use client"
export const LessonTag = "observer-structure"
import { LessonSectionWrapper } from "@/components/tts/LessonSectionWrapper"
import Image from "next/image"

export default function StructureSection() {
  return (
    <LessonSectionWrapper title="Structure">
      <div data-tag="observer-structure" className="space-y-4">
        <p>
          The pattern contains two hierarchies — the <strong>Subject</strong>
          hierarchy (things being observed) and the
          <strong> Observer</strong> hierarchy (things watching). Subjects keep a
          list of observers and notify them when state changes.
        </p>

        {/* UML Diagram */}
        <div className="my-6">
          <h3 className="text-lg font-semibold text-teal-700 mb-3">
            UML Class Diagram
          </h3>
          <div className="border-2 border-teal-200 rounded-lg p-4 bg-white">
            <Image
              src="/images/observer_uml.png"
              alt="Observer Pattern UML Class Diagram showing Subject and Observer hierarchies"
              width={800}
              height={600}
              className="w-full h-auto"
              priority
              data-pdf-image="true"
            />
            <p className="text-sm text-gray-600 mt-2 text-center italic">
              Figure 1: Observer Pattern UML Structure
            </p>
          </div>
        </div>

        {/* Code Example */}
        <h3 className="text-lg font-semibold text-teal-700 mt-6 mb-3">
          Code Structure
        </h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto border border-gray-800 shadow-md font-mono">
          <code>{`interface Subject {
  attach(o: Observer): void;
  detach(o: Observer): void;
  notify(): void;
}

interface Observer {
  update(subject: Subject): void;
}`}</code>
        </pre>
      </div>
    </LessonSectionWrapper>
  )
}
