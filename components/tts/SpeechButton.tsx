"use client"

import { useEffect, useState, forwardRef, useImperativeHandle } from "react"
import { Volume2, Square } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface SpeechButtonRef {
  play: () => void
  stop: () => void
}

interface SpeechButtonProps {
  text: string
}

export const SpeechButton = forwardRef<SpeechButtonRef, SpeechButtonProps>(
  function SpeechButton({ text }, ref) {
    const [speaking, setSpeaking] = useState(false)
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
    const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(
      null
    )

    useEffect(() => {
      const loadVoices = () => setVoices(window.speechSynthesis.getVoices())
      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }, [])

    const play = () => {
      if (!text || speaking) return
      const u = new SpeechSynthesisUtterance(text)
      u.voice = voices.find((v) => v.lang.startsWith("en")) || null
      u.rate = 1
      u.pitch = 1
      u.onend = () => setSpeaking(false)
      setUtterance(u)
      setSpeaking(true)
      window.speechSynthesis.speak(u)
    }

    const stop = () => {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }

    // expose play() and stop() methods
    useImperativeHandle(ref, () => ({ play, stop }))

    return (
      <Button
        onClick={speaking ? stop : play}
        className="bg-teal-700 text-white hover:bg-teal-800 flex items-center gap-2 tts-speech-button"
      >
        {speaking ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        {speaking ? "Stop" : "Listen"}
      </Button>
    )
  }
)
