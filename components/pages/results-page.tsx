"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ResultsPageProps {
  onNext: () => void
}

const cognitiveData = [
  { level: "Remember", score: 90, questions: 3 },
  { level: "Understand", score: 80, questions: 3 },
  { level: "Apply", score: 90, questions: 3 },
  { level: "Analyze", score: 50, questions: 3 },
  { level: "Evaluate", score: 60, questions: 3 },
  { level: "Create", score: 15, questions: 3 },
]

export function ResultsPage({ onNext }: ResultsPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Content */}
      <div className="px-6 pb-8 max-w-7xl mx-auto pt-4">
        {/* Congratulations */}
        <Card className="p-2 border-4 border-teal-700 bg-[#F2C7C7] mb-8">
          <div className="flex items-center justify-between">
            <div className="p-4">
              <h2 className="text-3xl font-bold text-red-500 mb-2">Failed</h2>
              <p className="text-lg text-gray-800 font-bold">You have not completed the Observer Pattern module, test retake needed.</p>
            </div>
            <div className="p-4 flex items-center justify-center hidden md:flex">
              <img src="/icons/icon_two.svg" alt="Check Icon" className="h-[3rem] w-[3rem]" />
            </div>
          </div>
        </Card>

        <Card className="p-2 border-4 border-teal-700 bg-[#FFFF00]/50 mb-8">
          <div className="flex items-center justify-between">
            <div className="p-4">
              <h2 className="text-3xl font-bold text-teal-700 mb-2">CONGRATULATIONS!</h2>
              <p className="text-lg text-gray-800 font-bold">You have completed the Observer Pattern module - There is some intervention needed.</p>
            </div>
            <div className="p-4 flex items-center justify-center hidden md:flex">
              <img src="/icons/icon_one.svg" alt="Check Icon" className="h-[3rem] w-[3rem]" />
            </div>
          </div>
        </Card>

        <Card className="p-2 border-4 border-teal-700 bg-[#C7DCF2] mb-8">
          <div className="flex items-center justify-between">
            <div className="p-4">
              <h2 className="text-3xl font-bold text-teal-700 mb-2">CONGRATULATIONS!</h2>
              <p className="text-lg text-gray-800 font-bold">You have completed the Observer Pattern module</p>
            </div>
            <div className="p-4 flex items-center justify-center hidden md:flex">
              <img src="/icons/icon_three.svg" alt="Check Icon" className="h-[3rem] w-[3rem]" />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="metric-card border-l-8 border-teal-600 shadow-md rounded-lg bg-white p-4">
            <p className="text-md text-teal-700">Final</p>
            <div className="text-4xl font-bold text-teal-700 pt-4">80%</div>
          </div>

          <div className="metric-card border-l-8 border-pink-500 shadow-md rounded-lg bg-white p-4">
            <p className="text-md text-pink-500">Improvement</p>
            <div className="text-4xl font-bold text-green-500 pt-4">+45%</div>
          </div>

          <div className="metric-card border-l-8 border-green-500 shadow-md rounded-lg bg-white p-4">
            <p className="text-md text-green-500">Practice Quiz</p>
            <div className="text-4xl font-bold text-green-500 pt-4">45%</div>
          </div>

          <div className="metric-card border-l-8 border-blue-600 shadow-md rounded-lg bg-white p-4">
            <p className="text-md text-blue-600">Time Spent</p>
            <div className="text-4xl font-bold text-blue-600 pt-4">4.5h</div>
          </div>

          <div className="metric-card border-l-8 border-purple-500 shadow-md rounded-lg bg-white p-4">
            <p className="text-md text-purple-500">Cheat Access</p>
            <div className="text-4xl font-bold text-purple-500 pt-4">34x</div>
          </div>
        </div>

        {/* Performance Chart */}
        <Card className="p-8 border-2 border-gray-300 mb-8 bg-white">
          <h3 className="text-2xl font-bold text-teal-700 mb-3">Performance by Cognitive Level</h3>
          <div className="space-y-4">
            {cognitiveData.map((item) => (
              <div key={item.level}>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700 font-medium">{item.level}</span>
                  <span className="text-gray-700 font-medium">
                    {item.score}% ({item.questions} Questions)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-teal-700 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommendations */}
        <Card className="p-6 bg-blue-100 mb-8">
          <h3 className="text-xl font-bold text-teal-700 mb-3">Recommendations</h3>
          <p className="text-gray-800">
            Focus on improving your Create and Analyze skills by practicing more complex pattern applications.
          </p>
        </Card>

        <Button
          onClick={onNext}
          className="w-full bg-teal-700 text-white hover:bg-teal-800 font-bold py-3 rounded-lg text-lg"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
