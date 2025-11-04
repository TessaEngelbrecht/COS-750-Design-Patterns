"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"

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

const cognitiveData = [
  { level: "Remember", score: 90, questions: 3 },
  { level: "Understand", score: 80, questions: 3 },
  { level: "Apply", score: 90, questions: 3 },
  { level: "Analyze", score: 50, questions: 3 },
  { level: "Evaluate", score: 60, questions: 3 },
  { level: "Create", score: 15, questions: 3 },
]

export default function StudentsTab() {
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-teal-600 mb-4">Student Progress Overview</h3>

      {mockStudents.map((student) => (
        <div key={student.id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-teal-700">{student.name}</h4>
              <p className="text-xs text-teal-600">Overall: {student.overallScore}%</p>
            </div>

            {/* View Details Button */}
            <button
              className="flex items-center gap-2 bg-blue-900 text-white px-4 py-1 rounded-full text-sm font-semibold hover:bg-blue-800"
              onClick={() => setSelectedStudent(student)}
            >
              <img src="/icons/mdi_eye.svg" alt="View" className="h-4 w-4" />
              View Details
            </button>
          </div>

          {/* Student summary grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pl-6 pb-2">
            <div>
              <p className="text-xs text-gray-500 font-semibold">Final</p>
              <p className="text-sm font-semibold text-teal-600">{student.final}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">Improvement</p>
              <p className="text-sm font-semibold text-pink-500">+{student.improvement}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">Practice Quiz</p>
              <p className="text-sm font-semibold text-green-500">{student.practiceQuiz}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">Time Spent</p>
              <p className="text-sm font-semibold text-blue-600">{student.timeSpent}h</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">Cheat Access</p>
              <p className="text-sm font-semibold text-purple-600">{student.cheatAccess}x</p>
            </div>
          </div>
        </div>
      ))}

      {/* Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent
          className="w-full bg-white border border-gray-300 shadow-lg"
        >
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-teal-700">
                  {selectedStudent.name} — Detailed Overview
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div className="metric-card border-l-8 border-teal-600 shadow-md border-2 rounded-lg bg-white p-4">
                  <p className="text-md text-teal-700">Final</p>
                  <div className="text-xl lg:text-4xl font-bold text-teal-700 pt-4">{selectedStudent.final}%</div>
                </div>

                <div className="metric-card border-l-8 border-pink-500 shadow-md border-2 rounded-lg bg-white p-4">
                  <p className="text-md text-pink-500">Improvement</p>
                  <div className="text-xl lg:text-4xl font-bold text-green-500 pt-4">+{selectedStudent.improvement}%</div>
                </div>

                <div className="metric-card border-l-8 border-green-500 shadow-md border-2 rounded-lg bg-white p-4">
                  <p className="text-md text-green-500">Practice Quiz</p>
                  <div className="text-xl lg:text-4xl font-bold text-green-500 pt-4">{selectedStudent.practiceQuiz}%</div>
                </div>

                <div className="metric-card border-l-8 border-blue-600 shadow-md border-2 rounded-lg bg-white p-4">
                  <p className="text-md text-blue-600">Time Spent</p>
                  <div className="text-xl lg:text-4xl font-bold text-blue-600 pt-4">{selectedStudent.timeSpent}h</div>
                </div>

                <div className="metric-card border-l-8 border-purple-500 shadow-md border-2 rounded-lg bg-white p-4">
                  <p className="text-md text-purple-500">Cheat Access</p>
                  <div className="text-xl lg:text-4xl font-bold text-purple-500 pt-4">{selectedStudent.cheatAccess}x</div>
                </div>
              </div>

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

              {selectedStudent.interventionNeeded && (
                <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
                  <p className="text-red-600 font-semibold">
                    Intervention Needed: This student requires academic support.
                  </p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
