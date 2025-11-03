"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface FeedbackPageProps {
  onNext: () => void
}

export function FeedbackPage({ onNext }: FeedbackPageProps) {
  const [cplusplus, setCplusplus] = useState<string>("")
  const [observerPattern, setObserverPattern] = useState<string>("")
  const [classes, setClasses] = useState<string>("")
  const [improvements, setImprovements] = useState<string>("")

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-8 border-2 border-accent">
        <h2 className="text-3xl font-bold text-primary mb-2">Observer Pattern Learning Platform</h2>

        <div className="bg-accent/10 border-2 border-accent rounded-lg p-4 mb-6">
          <p className="text-foreground">What and Why: A short explanation on what this app is for....</p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-4">
              How confident are you with C++ concepts and development?
            </h3>
            <div className="grid grid-cols-6 gap-2">
              {["Very Low", "Low", "Nervous", "Neutral", "Good", "Very Good"].map((option) => (
                <button
                  key={option}
                  className={`py-4 px-3 rounded-lg border-2 font-medium text-center transition-colors ${
                    cplusplus === option
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setCplusplus(option)}
                >
                  <div className="text-2xl mb-1">
                    {option === "Very Low" && "😢"}
                    {option === "Low" && "😞"}
                    {option === "Nervous" && "😟"}
                    {option === "Neutral" && "😐"}
                    {option === "Good" && "🙂"}
                    {option === "Very Good" && "😄"}
                  </div>
                  <div className="text-xs">{option}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-foreground mb-4">
              How confident are you with the Observer pattern concepts?
            </h3>
            <div className="grid grid-cols-6 gap-2">
              {["Very Low", "Low", "Nervous", "Neutral", "Good", "Very Good"].map((option) => (
                <button
                  key={option}
                  className={`py-4 px-3 rounded-lg border-2 font-medium text-center transition-colors ${
                    observerPattern === option
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setObserverPattern(option)}
                >
                  <div className="text-2xl mb-1">
                    {option === "Very Low" && "😢"}
                    {option === "Low" && "😞"}
                    {option === "Nervous" && "😟"}
                    {option === "Neutral" && "😐"}
                    {option === "Good" && "🙂"}
                    {option === "Very Good" && "😄"}
                  </div>
                  <div className="text-xs">{option}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-foreground mb-4">
              How confident are you with the classes you attended?
            </h3>
            <div className="grid grid-cols-6 gap-2">
              {["Very Low", "Low", "Nervous", "Neutral", "Good", "Very Good"].map((option) => (
                <button
                  key={option}
                  className={`py-4 px-3 rounded-lg border-2 font-medium text-center transition-colors ${
                    classes === option
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setClasses(option)}
                >
                  <div className="text-2xl mb-1">
                    {option === "Very Low" && "😢"}
                    {option === "Low" && "😞"}
                    {option === "Nervous" && "😟"}
                    {option === "Neutral" && "😐"}
                    {option === "Good" && "🙂"}
                    {option === "Very Good" && "😄"}
                  </div>
                  <div className="text-xs">{option}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-foreground mb-3">What improvements can be made by the lecturer:</h3>
            <Textarea
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="Share your feedback..."
              className="min-h-32 border-2 border-border"
            />
          </div>
        </div>

        <Button onClick={onNext} className="w-full mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
          Continue
        </Button>
      </Card>
    </div>
  )
}
