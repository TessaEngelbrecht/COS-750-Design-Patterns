"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play } from "lucide-react"

interface InstructionsPageProps {
  onNext: () => void
}

export function InstructionsPage({ onNext }: InstructionsPageProps) {
  const instructions = [
    {
      number: 1,
      title: "Practice",
      description:
        "This is to test the users pre-quiz before the final quiz to see where the user lies with the content that was provided in the class. From clicking start the user will be timed.",
    },
    {
      number: 2,
      title: "UML Builder",
      description: "Interactive tool to build and visualize UML diagrams for the Observer Pattern design.",
    },
    {
      number: 3,
      title: "Cheat Sheet",
      description: "Reference guide with key concepts, code examples, and best practices for the Observer Pattern.",
    },
    {
      number: 4,
      title: "Quiz",
      description: "Final assessment covering all aspects of the Observer Pattern implementation and concepts.",
    },
    {
      number: 5,
      title: "Results",
      description: "Detailed performance analytics and personalized feedback on your learning progress.",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-teal-700 mb-8">Instructions</h2>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="col-span-1">
            <Card className="p-6 bg-teal-700 text-white border-0">
              <h3 className="text-xl font-bold mb-6">Instruction Section</h3>
              <div className="space-y-3">
                <button className="w-full py-3 px-4 bg-gray-800 text-white rounded font-semibold hover:bg-gray-700">
                  Steps
                </button>
                <button className="w-full py-3 px-4 bg-teal-600 text-white rounded font-semibold hover:bg-teal-500">
                  Intent And Problem
                </button>
                <button className="w-full py-3 px-4 bg-teal-600 text-white rounded font-semibold hover:bg-teal-500">
                  When To Use
                </button>
                <button className="w-full py-3 px-4 bg-teal-600 text-white rounded font-semibold hover:bg-teal-500">
                  What To Avoid
                </button>
                <button className="w-full py-3 px-4 bg-teal-600 text-white rounded font-semibold hover:bg-teal-500">
                  Glossary
                </button>
              </div>

              {/* Play Button */}
              <div className="mt-8 flex flex-col items-center gap-3">
                <div className="w-20 h-20 border-4 border-white rounded-full flex items-center justify-center hover:bg-teal-600 cursor-pointer transition">
                  <Play className="w-10 h-10 text-white fill-white" />
                </div>
                <p className="text-center font-semibold text-sm">Check Steps</p>
              </div>
            </Card>
          </div>

          {/* Right Content */}
          <div className="col-span-2 space-y-4">
            {instructions.map((item) => (
              <Card key={item.number} className="p-6 border-2 border-teal-700 bg-blue-100 hover:shadow-lg transition">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {item.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="flex justify-end mt-8">
          <Button
            onClick={onNext}
            className="px-8 py-3 bg-teal-700 text-white hover:bg-teal-800 rounded-full font-bold text-lg"
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  )
}
