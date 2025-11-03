"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface SelfReflectionPageProps {
  onNext: () => void
}

export function SelfReflectionPage({ onNext }: SelfReflectionPageProps) {
  const [cplusplus, setCplusplus] = useState<string>("")
  const [observerPattern, setObserverPattern] = useState<string>("")
  const [classes, setClasses] = useState<string>("")

  const emojiOptions = [
    { value: "very-low", emoji: "😢", label: "Very Low" },
    { value: "low", emoji: "😞", label: "Low" },
    { value: "nervous", emoji: "😟", label: "Nervous" },
    { value: "neutral", emoji: "😐", label: "Neutral" },
    { value: "good", emoji: "🙂", label: "Good" },
    { value: "very-good", emoji: "😄", label: "Very Good" },
  ]

  const isComplete = cplusplus && observerPattern && classes

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 border-2 border-teal-200">
          <h1 className="text-4xl font-bold text-teal-900 mb-2">Self-Reflection</h1>
          <p className="text-lg text-teal-700 mb-8">Before we begin, let's understand where you're starting from.</p>

          {/* C++ Confidence */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-foreground mb-6">How confident are you with C++ concepts?</h3>
            <div className="grid grid-cols-6 gap-3">
              {emojiOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCplusplus(option.value)}
                  className={`py-4 px-3 rounded-lg border-2 transition-all transform hover:scale-110 ${
                    cplusplus === option.value
                      ? "border-teal-600 bg-teal-100 shadow-lg"
                      : "border-gray-300 bg-white hover:border-teal-400"
                  }`}
                >
                  <div className="text-4xl mb-2">{option.emoji}</div>
                  <div className="text-xs font-medium text-gray-700">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Observer Pattern Confidence */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-foreground mb-6">How confident are you with the Observer pattern?</h3>
            <div className="grid grid-cols-6 gap-3">
              {emojiOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setObserverPattern(option.value)}
                  className={`py-4 px-3 rounded-lg border-2 transition-all transform hover:scale-110 ${
                    observerPattern === option.value
                      ? "border-teal-600 bg-teal-100 shadow-lg"
                      : "border-gray-300 bg-white hover:border-teal-400"
                  }`}
                >
                  <div className="text-4xl mb-2">{option.emoji}</div>
                  <div className="text-xs font-medium text-gray-700">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Lecture Attendance */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-foreground mb-6">How prepared are you from the lectures?</h3>
            <div className="grid grid-cols-6 gap-3">
              {emojiOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setClasses(option.value)}
                  className={`py-4 px-3 rounded-lg border-2 transition-all transform hover:scale-110 ${
                    classes === option.value
                      ? "border-teal-600 bg-teal-100 shadow-lg"
                      : "border-gray-300 bg-white hover:border-teal-400"
                  }`}
                >
                  <div className="text-4xl mb-2">{option.emoji}</div>
                  <div className="text-xs font-medium text-gray-700">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={onNext}
            disabled={!isComplete}
            className="w-full py-6 text-lg bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-400 rounded-lg font-bold"
          >
            Continue
          </Button>
        </Card>
      </div>
    </div>
  )
}
