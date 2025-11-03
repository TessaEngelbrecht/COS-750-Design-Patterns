"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

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
        <Card className="p-6 border-4 border-teal-700 bg-blue-100 mb-8">
          <h2 className="text-3xl font-bold text-teal-700 mb-2">CONGRATULATIONS!</h2>
          <p className="text-lg text-gray-800">You have completed the Observer Pattern module</p>
        </Card>

        {/* Metrics */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <Card className="p-6 border-2 border-teal-700 bg-white text-center">
            <p className="text-sm text-gray-600 mb-2 font-semibold">Final</p>
            <p className="text-4xl font-bold text-teal-700">80%</p>
          </Card>
          <Card className="p-6 border-4 border-pink-500 bg-white text-center">
            <p className="text-sm text-gray-600 mb-2 font-semibold">Improvement</p>
            <p className="text-4xl font-bold text-green-600">+45%</p>
          </Card>
          <Card className="p-6 border-4 border-green-600 bg-white text-center">
            <p className="text-sm text-gray-600 mb-2 font-semibold">Practice Quiz</p>
            <p className="text-4xl font-bold text-green-600">45%</p>
          </Card>
          <Card className="p-6 border-4 border-blue-600 bg-white text-center">
            <p className="text-sm text-gray-600 mb-2 font-semibold">Time Spent</p>
            <p className="text-4xl font-bold text-blue-600">4.5h</p>
          </Card>
          <Card className="p-6 border-4 border-purple-600 bg-white text-center">
            <p className="text-sm text-gray-600 mb-2 font-semibold">Cheat Access</p>
            <p className="text-4xl font-bold text-purple-600">34x</p>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="p-8 border-2 border-gray-300 mb-8 bg-white">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Performance by Cognitive Level</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cognitiveData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#0d7377" radius={[8, 8, 0, 0]}>
                {cognitiveData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#0d7377" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-6 gap-2 text-sm">
            {cognitiveData.map((item) => (
              <div key={item.level} className="flex items-center justify-center flex-col">
                <div className="text-center text-gray-700 font-bold">
                  {item.score}% ({item.questions} Questions)
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommendations */}
        <Card className="p-6 bg-blue-100 border-2 border-gray-300 mb-8">
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
