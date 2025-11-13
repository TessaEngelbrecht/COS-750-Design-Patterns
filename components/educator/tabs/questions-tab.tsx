"use client";

import { useState, useEffect } from "react";
import { AddQuestionModal } from "@/components/educator/AddQuestionModal";
import { getAllQuestions } from "@/api/services/AddQuestions";

export default function QuestionsTab() {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // HARDCODED USER ID - Replace with proper auth later
  const authorId = "ed3abcb1-790a-4cf5-af95-5d80360e6566";

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await getAllQuestions();
      setQuestions(data);
    } catch (error) {
      console.error("Failed to load questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-teal-600">
          Questions for Learning Platform
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-purple-700"
        >
          + Add Question
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No questions yet. Click "Add Question" to create one.
        </div>
      ) : (
        questions.map((question) => (
          <div
            key={question.id}
            onClick={() =>
              setExpandedQuestion(
                expandedQuestion === question.id ? null : question.id
              )
            }
            className="border-2 border-teal-600 rounded-lg p-4 cursor-pointer hover:bg-teal-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-gray-800">
                    {question.content?.[0]?.question_text || "No text"}
                  </h4>
                </div>
                <div className="flex gap-3 text-sm flex-wrap">
                  <span className="bg-teal-100 text-teal-600 px-3 py-1 rounded">
                    {question.format?.format}
                  </span>
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded">
                    {question.bloom?.level}
                  </span>
                  <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded">
                    {question.difficulty?.difficulty_level}
                  </span>
                  <span className="bg-green-100 text-green-600 px-3 py-1 rounded">
                    {question.section?.section}
                  </span>
                  {question.quiz_types?.map((qt: any) => (
                    <span
                      key={qt.quiz_type?.id}
                      className="bg-amber-100 text-amber-600 px-3 py-1 rounded"
                    >
                      {qt.quiz_type?.quiz_type}
                    </span>
                  ))}
                </div>
              </div>
              <svg
                className={`w-6 h-6 text-teal-600 transition-transform ${
                  expandedQuestion === question.id ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {expandedQuestion === question.id && (
              <div className="mt-4 pt-4 border-t border-teal-200">
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Points:</strong> {question.content?.[0]?.points || 1}
                  </p>
                  <p>
                    <strong>Topics:</strong>{" "}
                    {question.topics?.map((t: any) => t.topic?.topic).join(", ") ||
                      "None"}
                  </p>
                  <div>
                    <strong>Question Data:</strong>
                    <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto text-xs">
                      {JSON.stringify(
                        question.content?.[0]?.question_data,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <div>
                    <strong>Correct Answer:</strong>
                    <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto text-xs">
                      {JSON.stringify(
                        question.content?.[0]?.correct_answer,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      <AddQuestionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadQuestions}
        authorId={authorId}
      />
    </div>
  );
}