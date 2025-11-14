// "use client"

// import { useGetStudentsPerformanceQuery } from "@/api/services/EducatorDashboardStudentPerformanceSummary"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Card } from "@/components/ui/card"
// import { useState, useMemo } from "react"

// const cognitiveLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]

// export default function StudentsTab() {
//   const { data, isLoading, error } = useGetStudentsPerformanceQuery()
//   const [selectedStudent, setSelectedStudent] = useState<any>(null)

//   const students = useMemo(
//     () =>
//       (data?.rows ?? []).map((student) => ({
//         ...student,
//         users: student.users
//           ? {
//               ...student.users,
//               full_name: `${student.users.first_name ?? ""} ${student.users.last_name ?? ""}`.trim(),
//             }
//           : { full_name: "Unnamed Student" },
//       })),
//     [data?.rows]
//   )

//   if (isLoading) return <p>Loading student data...</p>
//   if (error) return <p>Error loading students</p>

//   return (
//     <div className="space-y-4">
//       <h3 className="text-lg font-bold text-teal-600 mb-4">Student Progress Overview</h3>

//       {students.map((student) => (
//         <div key={student.summary_id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
//           <div className="px-6 py-4 flex justify-between items-center">
//             <div>
//               <h4 className="font-bold text-teal-700">{student.users.full_name}</h4>
//               <p className="text-xs text-teal-600">
//                 Overall: {student.final_quiz_score ?? 0}%
//               </p>
//             </div>

//             <button
//               className="flex items-center gap-2 bg-blue-900 text-white px-4 py-1 rounded-full text-sm font-semibold hover:bg-blue-800"
//               onClick={() => setSelectedStudent(student)}
//             >
//               <img src="/icons/mdi_eye.svg" alt="View" className="h-4 w-4" />
//               <p className="hidden md:block">View Details</p>
//             </button>
//           </div>

//           {/* Summary Grid */}
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pl-6 pb-2">
//             <div>
//               <p className="text-xs text-gray-500 font-semibold">Final</p>
//               <p className="text-sm font-semibold text-teal-600">{student.final_quiz_score ?? 0}%</p>
//             </div>
//             <div>
//               <p className="text-xs text-gray-500 font-semibold">Practice Quiz</p>
//               <p className="text-sm font-semibold text-green-500">{student.practice_quiz_avg_score ?? 0}%</p>
//             </div>
//             <div>
//               <p className="text-xs text-gray-500 font-semibold">Practice Attempts</p>
//               <p className="text-sm font-semibold text-orange-600">{student.practice_quiz_attempts ?? 0}</p>
//             </div>
//             <div>
//               <p className="text-xs text-gray-500 font-semibold">Time Spent</p>
//               <p className="text-sm font-semibold text-blue-600">
//                 {((student.total_time_spent_minutes ?? 0) / 60).toFixed(1)}h
//               </p>
//             </div>
//             <div>
//               <p className="text-xs text-gray-500 font-semibold">Cheat Access</p>
//               <p className="text-sm font-semibold text-purple-600">{student.cheat_sheet_access_count ?? 0}x</p>
//             </div>
//           </div>
//         </div>
//       ))}

//       {/* Modal */}
//       <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
//         <DialogContent className="w-full bg-white border border-gray-300 shadow-lg">
//           {selectedStudent && (
//             <>
//               <DialogHeader>
//                 <DialogTitle className="text-teal-700">
//                   {selectedStudent.users.full_name} — Detailed Overview
//                 </DialogTitle>
//               </DialogHeader>

//               {/* Metric Cards */}
//               <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
//                 {/* Final */}
//                 <div className="metric-card border-l-8 border-teal-600 shadow-md border-2 rounded-lg bg-white p-4">
//                   <p className="text-md text-teal-700">Final</p>
//                   <div className="text-xl lg:text-4xl font-bold text-teal-700 pt-4">
//                     {selectedStudent.final_quiz_score ?? 0}%
//                   </div>
//                 </div>

//                 {/* Improvement */}
//                 <div className="metric-card border-l-8 border-pink-500 shadow-md border-2 rounded-lg bg-white p-4">
//                   <p className="text-md text-pink-500">Improvement</p>
//                   <div className="text-xl lg:text-4xl font-bold text-green-500 pt-4">
//                     {selectedStudent.final_quiz_score !== null && selectedStudent.pre_quiz_score !== null
//                       ? `+${selectedStudent.final_quiz_score - selectedStudent.pre_quiz_score}%`
//                       : "+0%"}
//                   </div>
//                 </div>

//                 {/* Practice Quiz */}
//                 <div className="metric-card border-l-8 border-green-500 shadow-md border-2 rounded-lg bg-white p-4">
//                   <p className="text-md text-green-500">Practice Quiz</p>
//                   <div className="text-xl lg:text-4xl font-bold text-green-500 pt-4">
//                     {selectedStudent.practice_quiz_avg_score ?? 0}%
//                   </div>
//                 </div>

//                 {/* Time Spent */}
//                 <div className="metric-card border-l-8 border-blue-600 shadow-md border-2 rounded-lg bg-white p-4">
//                   <p className="text-md text-blue-600">Time Spent</p>
//                   <div className="text-xl lg:text-4xl font-bold text-blue-600 pt-4">
//                     {((selectedStudent.total_time_spent_minutes ?? 0) / 60).toFixed(1)}h
//                   </div>
//                 </div>

//                 {/* Cheat Access */}
//                 <div className="metric-card border-l-8 border-purple-500 shadow-md border-2 rounded-lg bg-white p-4">
//                   <p className="text-md text-purple-500">Cheat Access</p>
//                   <div className="text-xl lg:text-4xl font-bold text-purple-500 pt-4">
//                     {selectedStudent.cheat_sheet_access_count ?? 0}x
//                   </div>
//                 </div>
//               </div>

//               {/* Cognitive Levels */}
//               <Card className="p-6 border-2 border-gray-200 bg-white mt-4">
//                 <h3 className="text-lg font-semibold text-teal-700 mb-2">Performance by Cognitive Level</h3>
//                 <div className="space-y-4">
//                   {cognitiveLevels.map((level) => {
//                     const score = selectedStudent.bloom_scores?.[level] ?? 0
//                     const questions = selectedStudent.section_scores?.[level] ?? 0
//                     return (
//                       <div key={level}>
//                         <div className="flex justify-between mb-1">
//                           <span className="text-gray-700 font-medium">{level}</span>
//                           <span className="text-gray-700 font-medium">
//                             {score}% ({questions} Questions)
//                           </span>
//                         </div>
//                         <div className="w-full bg-gray-200 rounded-full h-3">
//                           <div
//                             className="bg-teal-700 h-3 rounded-full transition-all duration-500"
//                             style={{ width: `${score}%` }}
//                           ></div>
//                         </div>
//                       </div>
//                     )
//                   })}
//                 </div>
//               </Card>

//               {/* Intervention Notice */}
//               {selectedStudent.flagged_for_intervention && (
//                 <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
//                   <p className="text-red-600 font-semibold">
//                     Intervention Needed: {selectedStudent.intervention_reason ?? "This student may require additional academic support."}
//                   </p>
//                 </div>
//               )}
//             </>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }

// "use client"

// import { useState, useMemo } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { useGetStudentsPerformanceQuery } from "@/api/services/EducatorDashboardStudentPerformanceSummary"
// import { Card } from "@/components/ui/card"

// interface CognitiveLevelProps {
//   selectedStudent: {
//     bloom_scores: Record<string, number>;
//     section_scores: Record<string, number>;
//   };
//   cognitiveLevels: string[];
// }

// // Helper to convert minutes to hh:mm:ss
// const minutesToHMS = (minutes: number) => {
//   const h = Math.floor(minutes / 60)
//   const m = Math.floor(minutes % 60)
//   const s = Math.round((minutes - Math.floor(minutes)) * 60)
//   return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
// }

// export default function StudentsTab() {
//   const { data, isLoading, error } = useGetStudentsPerformanceQuery()
//   const [selectedStudent, setSelectedStudent] = useState<any | null>(null)

//   const students = useMemo(() => data?.rows || [], [data])

//   if (isLoading) return <p>Loading student data...</p>
//   if (error) return <p>Error loading students</p>

//   return (
//     <div className="space-y-4">
//       <h3 className="text-lg font-bold text-teal-600 mb-4">Student Progress Overview</h3>

//       {students.map((student) => (
//         <div key={student.student_id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
//           <div className="px-6 py-4 flex justify-between items-center">
//             <div>
//               <h4 className="font-bold text-teal-700">{student.full_name}</h4>
//               <p className="text-xs text-teal-600">Overall: {student.final_quiz_score.toFixed(0)}%</p>
//             </div>
//             <button
//               className="flex items-center gap-2 bg-blue-900 text-white px-4 py-1 rounded-full text-sm font-semibold hover:bg-blue-800"
//               onClick={() => setSelectedStudent(student)}
//             >
//               <img src="/icons/mdi_eye.svg" alt="View" className="h-4 w-4" />
//               <p className="hidden md:block">View Details</p>
//             </button>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pl-6 pb-2">
//             <div>
//               <p className="text-xs text-gray-500 font-semibold">Final</p>
//               <p className="text-sm font-semibold text-teal-600">{student.final_quiz_score.toFixed(0)}%</p>
//             </div>
//             <div>
//               <p className="text-xs text-gray-500 font-semibold">Practice Quiz</p>
//               <p className="text-sm font-semibold text-green-500">{student.practice_quiz_avg_score.toFixed(0)}%</p>
//             </div>
//             <div>
//               <p className="text-xs text-gray-500 font-semibold">Practice Attempts</p>
//               <p className="text-sm font-semibold text-orange-600">{student.practice_quiz_attempts}</p>
//             </div>
//             <div>
//               <p className="text-xs text-gray-500 font-semibold">Time Spent</p>
//               <p className="text-sm font-semibold text-blue-600">
//                 {student.total_time_spent}
//               </p>
//             </div>
//             <div>
//               <p className="text-xs text-gray-500 font-semibold">Cheat Access</p>
//               <p className="text-sm font-semibold text-purple-600">{student.cheat_sheet_access_count}x</p>
//             </div>
//           </div>
//         </div>
//       ))}

//       <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
//         <DialogContent className="w-full bg-white border border-gray-300 shadow-lg">
//           {selectedStudent && (
//             <>
//               <DialogHeader>
//                 <DialogTitle className="text-teal-700">
//                   {selectedStudent.full_name} — Detailed Overview
//                 </DialogTitle>
//               </DialogHeader>

//               <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
//                 <div className="metric-card border-l-8 border-teal-600 shadow-md border-2 rounded-lg bg-white p-4">
//                   <p className="text-md text-teal-700">Final</p>
//                   <div className="text-xl lg:text-4xl font-bold text-teal-700 pt-4">
//                     {selectedStudent.final_quiz_score.toFixed(0)}%
//                   </div>
//                 </div>
//                 <div className="metric-card border-l-8 border-pink-500 shadow-md border-2 rounded-lg bg-white p-4">
//                   <p className="text-md text-pink-500">Improvement</p>
//                   <div className="text-xl lg:text-4xl font-bold text-green-500 pt-4">
//                     {selectedStudent.final_quiz_score && selectedStudent.practice_quiz_avg_score
//                       ? `${(selectedStudent.final_quiz_score - selectedStudent.practice_quiz_avg_score).toFixed(0)}%`
//                       : "0%"}
//                   </div>
//                 </div>
//                 <div className="metric-card border-l-8 border-green-500 shadow-md border-2 rounded-lg bg-white p-4">
//                   <p className="text-md text-green-500">Practice Quiz</p>
//                   <div className="text-xl lg:text-4xl font-bold text-green-500 pt-4">
//                     {selectedStudent.practice_quiz_avg_score.toFixed(0)}%
//                   </div>
//                 </div>
//                 <div className="metric-card border-l-8 border-blue-600 shadow-md border-2 rounded-lg bg-white p-4">
//                   <p className="text-md text-blue-600">Time Spent</p>
//                   <div className="text-xl lg:text-4xl font-bold text-blue-600 pt-4">
//                     {selectedStudent.total_time_spent}
//                   </div>
//                 </div>
//                 <div className="metric-card border-l-8 border-purple-500 shadow-md border-2 rounded-lg bg-white p-4">
//                   <p className="text-md text-purple-500">Cheat Access</p>
//                   <div className="text-xl lg:text-4xl font-bold text-purple-500 pt-4">
//                     {selectedStudent.cheat_sheet_access_count}x
//                   </div>
//                 </div>
//               </div>

//               {/* Cognitive Levels */}
//               <Card className="p-6 border-2 border-gray-200 bg-white mt-4">
//                  <h3 className="text-lg font-semibold text-teal-700 mb-2">Performance by Cognitive Level</h3>
//                  <div className="space-y-4">
//                    {cognitiveLevels.map((level) => {
//                      const score = selectedStudent.bloom_scores?.[level] ?? 0
//                     const questions = selectedStudent.section_scores?.[level] ?? 0
//                      return (
//                        <div key={level}>
//                          <div className="flex justify-between mb-1">
//                            <span className="text-gray-700 font-medium">{level}</span>
//                            <span className="text-gray-700 font-medium">
//                              {score}% ({questions} Questions)
//                            </span>
//                          </div>
//                          <div className="w-full bg-gray-200 rounded-full h-3">
//                            <div
//                              className="bg-teal-700 h-3 rounded-full transition-all duration-500"
//                              style={{ width: `${score}%` }}
//                            ></div>
//                          </div>
//                        </div>
//                      )
//                    })}
//                  </div>
//                </Card>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }
"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useGetStudentsPerformanceQuery } from "@/api/services/EducatorDashboardStudentPerformanceSummary"
import { Card } from "@/components/ui/card"

// Bloom levels in order
const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]

// Helper: convert minutes to hh:mm:ss
const minutesToHMS = (minutes: number) => {
  if (isNaN(minutes) || minutes < 0) minutes = 0
  const h = Math.floor(minutes / 60)
  const m = Math.floor(minutes % 60)
  const s = Math.round((minutes - Math.floor(minutes)) * 60)
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export default function StudentsTab() {
  const { data, isLoading, error } = useGetStudentsPerformanceQuery()
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)

  const students = useMemo(() => data?.rows || [], [data])

  if (isLoading) return <p>Loading student data...</p>
  if (error) return <p>Error loading students</p>

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-teal-600 mb-4">Student Progress Overview</h3>

      {students.map((student) => (
        <div key={student.student_id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-teal-700">{student.full_name}</h4>
              <p className="text-xs text-teal-600">Final: {student.final_quiz_score.toFixed(0)}%</p>
            </div>
            <button
              className="flex items-center gap-2 bg-blue-900 text-white px-4 py-1 rounded-full text-sm font-semibold hover:bg-blue-800"
              onClick={() => setSelectedStudent(student)}
            >
              <img src="/icons/mdi_eye.svg" alt="View" className="h-4 w-4" />
              <p className="hidden md:block">View Details</p>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pl-6 pb-2">
            <div>
              <p className="text-xs text-gray-500 font-semibold">Final</p>
              <p className="text-sm font-semibold text-teal-600">{student.final_quiz_score.toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">Practice Quiz</p>
              <p className="text-sm font-semibold text-green-500">{student.practice_quiz_avg_score.toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">Practice Attempts</p>
              <p className="text-sm font-semibold text-orange-600">{student.practice_quiz_attempts}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">Time Spent</p>
              <p className="text-sm font-semibold text-blue-600">{student.total_time_spent}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">Cheat Access</p>
              <p className="text-sm font-semibold text-purple-600">{student.cheat_sheet_access_count}x</p>
            </div>
          </div>
        </div>
      ))}

      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="w-full bg-white border border-gray-300 shadow-lg">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-teal-700">
                  {selectedStudent.full_name} — Detailed Overview
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div className="metric-card border-l-8 border-green-500 shadow-md border-2 rounded-lg bg-white p-4">
                  <p className="text-md text-green-500">Practice Quiz</p>
                  <div className="text-xl lg:text-4xl font-bold text-green-500 pt-4">
                    {selectedStudent.practice_quiz_avg_score.toFixed(0)}%
                  </div>
                </div>
                <div className="metric-card border-l-8 border-teal-600 shadow-md border-2 rounded-lg bg-white p-4">
                  <p className="text-md text-teal-700">Final</p>
                  <div className="text-xl lg:text-4xl font-bold text-teal-700 pt-4">
                    {selectedStudent.final_quiz_score.toFixed(0)}%
                  </div>
                </div>
                <div className="metric-card border-l-8 border-pink-500 shadow-md border-2 rounded-lg bg-white p-4">
                  <p className="text-md text-pink-500">Improvement</p>
                  <div
                    className={`text-xl lg:text-4xl font-bold pt-4 ${selectedStudent.final_quiz_score && selectedStudent.practice_quiz_avg_score
                        ? selectedStudent.final_quiz_score - selectedStudent.practice_quiz_avg_score >= 0
                          ? "text-green-500"
                          : "text-red-500"
                        : "text-gray-500"
                      }`}
                  >
                    {selectedStudent.final_quiz_score && selectedStudent.practice_quiz_avg_score
                      ? `${(selectedStudent.final_quiz_score - selectedStudent.practice_quiz_avg_score).toFixed(0)}%`
                      : "0%"}
                  </div>

                </div>

                <div className="metric-card border-l-8 border-blue-600 shadow-md border-2 rounded-lg bg-white p-4">
                  <p className="text-md text-blue-600">Time Spent</p>
                  <div className="text-xl lg:text-4xl font-bold text-blue-600 pt-4">
                    {selectedStudent.total_time_spent}
                  </div>
                </div>
                <div className="metric-card border-l-8 border-purple-500 shadow-md border-2 rounded-lg bg-white p-4">
                  <p className="text-md text-purple-500">Cheat Access</p>
                  <div className="text-xl lg:text-4xl font-bold text-purple-500 pt-4">
                    {selectedStudent.cheat_sheet_access_count}x
                  </div>
                </div>
              </div>

              {/* Cognitive Levels */}
              <Card className="p-6 border-2 border-gray-200 bg-white mt-4">
                <h3 className="text-lg font-semibold text-teal-700 mb-2">Performance by Bloom's Level</h3>
                <div className="space-y-4">
                  {bloomLevels.map(level => {
                    const score = selectedStudent.bloom_scores?.[level] ?? 0
                    const questions = selectedStudent.section_scores?.[level] ?? 0
                    return (
                      <div key={level}>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-700 font-medium">{level}</span>
                          <span className="text-gray-700 font-medium">
                            {score}% ({questions} Questions)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-teal-700 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Add Intervention thingiess here */}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

