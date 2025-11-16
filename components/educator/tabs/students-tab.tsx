"use client";

import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGetStudentsPerformanceQuery, useMarkInterventionResolvedMutation } from "@/api/services/EducatorDashboardStudentPerformanceSummary";
import { Card } from "@/components/ui/card";

const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

export default function StudentsTab({ patternId }: { patternId?: string }) {
  const { data, isLoading, error } = useGetStudentsPerformanceQuery({ patternId }, { refetchOnMountOrArgChange: true });
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentsState, setStudentsState] = useState<any[]>([]);
  const [markResolved, { isLoading: isMarking }] = useMarkInterventionResolvedMutation();

  const students = useMemo(() => {
    if (studentsState.length === 0 && data?.rows) setStudentsState(data.rows);
    return studentsState;
  }, [data, studentsState]);

  useEffect(() => {
    if (data?.rows) {
      setStudentsState(data.rows);
    }
  }, [data?.rows]);

  if (isLoading) return <p className="text-center py-8">Loading student data...</p>;

  if (error) return <p className="text-center py-8 text-red-600">Error loading students</p>;

  const hasUnresolved = (student: any) => student.interventions?.some((i) => !i.resolved);

  const handleMarkResolved = async (studentId: string, intervention: any) => {
    if (!intervention.learning_profile_id || !intervention.ruleSetId) return;

    try {
      await markResolved({
        learningProfileId: intervention.learning_profile_id,
        ruleSetId: intervention.ruleSetId,
      }).unwrap();

      setSelectedStudent((prev) =>
        prev
          ? {
              ...prev,
              interventions: prev.interventions?.map((iv) =>
                iv.ruleSetId === intervention.ruleSetId && iv.learning_profile_id === intervention.learning_profile_id
                  ? { ...iv, resolved: true }
                  : iv
              ),
            }
          : prev
      );

      setStudentsState((prev) =>
        prev.map((s) =>
          s.student_id === studentId
            ? {
                ...s,
                interventions: s.interventions?.map((iv) =>
                  iv.ruleSetId === intervention.ruleSetId && iv.learning_profile_id === intervention.learning_profile_id
                    ? { ...iv, resolved: true }
                    : iv
                ),
              }
            : s
        )
      );
    } catch (err) {
      console.error("Failed to mark intervention resolved:", err);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base sm:text-lg font-bold text-teal-600 mb-4">Student Progress Overview</h3>

      {students.length === 0 ? (
        <div className="text-center py-12 sm:py-20 text-gray-500">
          {patternId ? "The selected design pattern is inactive or has no students." : "No students found."}
        </div>
      ) : (
        students.map((student) => (
          <div key={student.student_id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="font-bold text-teal-700 flex items-center gap-2 break-words">
                  {student.full_name}
                  {hasUnresolved(student) && <span className="text-red-600 font-bold">⚠️</span>}
                </h4>
                <p className="text-xs text-teal-600">Final: {student.final_quiz_score.toFixed(0)}%</p>
              </div>
              <button
                className="flex items-center gap-2 bg-blue-900 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-sm font-semibold hover:bg-blue-800 w-full sm:w-auto justify-center"
                onClick={() => setSelectedStudent(student)}
              >
                <img src="/icons/mdi_eye.svg" alt="View" className="h-4 w-4" />
                <p className="sm:block">View Details</p>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 px-4 sm:px-6 pb-3 sm:pb-4">
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
        ))
      )}

      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl max-h-[90vh] bg-white border border-gray-300 shadow-lg overflow-y-auto">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-teal-700">
                  {selectedStudent.full_name} — Detailed Overview
                </DialogTitle>
              </DialogHeader>

              {/* Metrics cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-4">
                <div className="metric-card border-l-8 border-green-500 shadow-md border-2 rounded-lg bg-white p-4">
                  <p className="text-md text-green-500">Practice Quiz</p>
                  <div className="text-2xl lg:text-4xl font-bold text-green-500 pt-4">
                    {selectedStudent.practice_quiz_avg_score.toFixed(0)}%
                  </div>
                </div>
                <div className="metric-card border-l-8 border-teal-600 shadow-md border-2 rounded-lg bg-white p-4">
                  <p className="text-md text-teal-700">Final</p>
                  <div className="text-2xl lg:text-4xl font-bold text-teal-700 pt-4">
                    {selectedStudent.final_quiz_score.toFixed(0)}%
                  </div>
                </div>
                <div className="metric-card border-l-8 border-pink-500 shadow-md border-2 rounded-lg bg-white p-4">
                  <p className="text-md text-pink-500">Improvement</p>
                  <div
                    className={`text-2xl lg:text-4xl font-bold pt-4 ${
                      selectedStudent.final_quiz_score - selectedStudent.practice_quiz_avg_score >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {(selectedStudent.final_quiz_score - selectedStudent.practice_quiz_avg_score).toFixed(0)}%
                  </div>
                </div>
                <div className="metric-card border-l-8 border-blue-600 shadow-md border-2 rounded-lg bg-white p-4">
                  <p className="text-md text-blue-600">Time Spent</p>
                  <div className="text-2xl lg:text-4xl font-bold text-blue-600 pt-4">
                    {selectedStudent.total_time_spent}
                  </div>
                </div>
                <div className="metric-card border-l-8 border-purple-500 shadow-md border-2 rounded-lg bg-white p-4">
                  <p className="text-md text-purple-500">Cheat Access</p>
                  <div className="text-2xl lg:text-4xl font-bold text-purple-500 pt-4">
                    {selectedStudent.cheat_sheet_access_count}x
                  </div>
                </div>
              </div>

              {/* Bloom Levels */}
              <Card className="p-6 border-2 border-gray-200 bg-white mt-4">
                <h3 className="text-lg font-semibold text-teal-700 mb-2">Performance by Bloom's Level</h3>
                <div className="space-y-4">
                  {bloomLevels.map((level) => {
                    const score = selectedStudent.bloom_scores?.[level] ?? 0;
                    const questions = selectedStudent.section_scores?.[level] ?? 0;
                    return (
                      <div key={level}>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-700 font-medium text-sm sm:text-base">{level}</span>
                          <span className="text-gray-700 font-medium text-sm sm:text-base">
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
                    );
                  })}
                </div>
              </Card>

              {/* Interventions */}
              {selectedStudent.interventions?.some((i) => !i.resolved) && (
                <Card className="p-6 border-2 border-gray-200 bg-red-50 mt-4 max-h-[40vh] overflow-y-auto">
                  <h3 className="text-lg font-semibold text-red-700 mb-2">Triggered Interventions</h3>
                  <ul className="list-none space-y-3">
                    {selectedStudent.interventions
                      .filter((i) => !i.resolved)
                      .reduce((acc: any[], curr) => {
                        const existing = acc.find((a) => a.type === curr.type);
                        if (existing) existing.rules.push(...curr.rules);
                        else acc.push({ ...curr, rules: [...curr.rules] });
                        return acc;
                      }, [])
                      .map((i, idx) => (
                        <li key={idx} className="flex flex-col gap-2 border-b border-red-200 pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold break-words">{i.type}</p>
                              <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                                {Array.from(new Set(i.rules)).map((r, subIdx) => (
                                  <li key={subIdx} className="break-words">{r}</li>
                                ))}
                              </ul>
                            </div>
                            <button
                              className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                                isMarking ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"
                              }`}
                              disabled={isMarking || !i.learning_profile_id || !i.ruleSetId}
                              onClick={() => handleMarkResolved(selectedStudent.student_id, i)}
                            >
                              {isMarking ? "Resolving..." : "Mark as Resolved"}
                            </button>
                          </div>
                        </li>
                      ))}
                  </ul>
                </Card>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
