"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Square, Volume2 } from "lucide-react"

export function LessonPageWithTTS({ children }: { children: React.ReactNode }) {
  const [speaking, setSpeaking] = useState(false)

  const playAllSections = () => {
    const buttons = Array.from(
      document.querySelectorAll(".tts-speech-button")
    ) as HTMLButtonElement[]

    if (!buttons.length) {
      console.warn("No speech buttons found.")
      return
    }

    let current = 0
    setSpeaking(true)

    const playNext = () => {
      if (current >= buttons.length) {
        setSpeaking(false)
        return
      }

      const button = buttons[current]
      button.scrollIntoView({ behavior: "smooth", block: "center" })
      button.click()

      const activeSpeech = window.speechSynthesis
      const checkEnd = setInterval(() => {
        if (!activeSpeech.speaking) {
          clearInterval(checkEnd)
          current++
          setTimeout(playNext, 400) // small pause
        }
      }, 250)
    }

    playNext()
  }

  const stopAll = () => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={speaking ? stopAll : playAllSections}
          className="bg-teal-700 text-white hover:bg-teal-800 flex items-center gap-2"
        >
          {speaking ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {speaking ? "Stop Lecture" : "Play Entire Lesson"}
        </Button>
      </div>
      {children}
    </div>
  )
}
