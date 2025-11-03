"use client"

import { useState } from "react"

const mockStudents = [
  {
    id: 1,
    name: "Student A",
    overallScore: 85,
    final: 80,
    improvement: 45,
    practiceQuiz: 45,
    timeSpent: 4.5,
    cheatAccess: 34,
    interventionNeeded: false,
  },
  {
    id: 2,
    name: "Student B",
    overallScore: 88,
    final: 85,
    improvement: 40,
    practiceQuiz: 50,
    timeSpent: 5.0,
    cheatAccess: 12,
    interventionNeeded: false,
  },
  {
    id: 3,
    name: "Student C",
    overallScore: 42,
    final: 35,
    improvement: 10,
    practiceQuiz: 25,
    timeSpent: 2.5,
    cheatAccess: 45,
    interventionNeeded: true,
  },
  {
    id: 4,
    name: "Student D",
    overallScore: 92,
    final: 90,
    improvement: 50,
    practiceQuiz: 60,
    timeSpent: 6.0,
    cheatAccess: 5,
    interventionNeeded: false,
  },
  {
    id: 5,
    name: "Student E",
    overallScore: 65,
    final: 60,
    improvement: 25,
    practiceQuiz: 40,
    timeSpent: 3.5,
    cheatAccess: 28,
    interventionNeeded: true,
  },
]

export default function StudentsTab() {
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-teal-600 mb-4">Student Progress Overview</h3>
      {mockStudents.map((student) => (
        <div key={student.id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
          <div
            onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
            className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors flex justify-between items-center"
          >
            <div>
              <h4 className="font-bold text-gray-800">{student.name}</h4>
              <p className="text-sm text-teal-600">Overall: {student.overallScore}%</p>
            </div>
            <button className="bg-blue-900 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-800">
              View Details
            </button>
          </div>

          {expandedStudent === student.id && (
            <div className="px-6 py-4 bg-white border-t-2 border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Final</p>
                  <p className="text-2xl font-bold text-teal-600">{student.final}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Improvement</p>
                  <p className="text-2xl font-bold text-pink-500">+{student.improvement}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Practice Quiz</p>
                  <p className="text-2xl font-bold text-green-500">{student.practiceQuiz}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Time Spent</p>
                  <p className="text-2xl font-bold text-blue-600">{student.timeSpent}h</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Cheat Access</p>
                  <p className="text-2xl font-bold text-purple-600">{student.cheatAccess}x</p>
                </div>
              </div>
              {student.interventionNeeded && (
                <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
                  <p className="text-red-600 font-semibold">
                    Intervention Needed: This student requires academic support
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
