"use client"

import { useRef } from "react"
import { SpeechButton, SpeechButtonRef } from "./SpeechButton"

interface LessonSectionWrapperProps {
  title: string
  children: React.ReactNode
}

function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") return children
  if (Array.isArray(children)) return children.map(extractTextFromChildren).join(" ")
  if (typeof children === "object" && children !== null && "props" in children) {
    const element = children as any
    return element.type === "pre"
      ? ""
      : extractTextFromChildren(element.props.children)
  }
  return ""
}

export function LessonSectionWrapper({ title, children }: LessonSectionWrapperProps) {
  const ref = useRef<SpeechButtonRef>(null)
  const textContent = extractTextFromChildren(children)

  return (
    <section className="space-y-4" data-tts-section>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-teal-700">{title}</h2>
        <SpeechButton ref={ref} text={`${title}. ${textContent}`} />
      </div>
      <div>{children}</div>
    </section>
  )
}
