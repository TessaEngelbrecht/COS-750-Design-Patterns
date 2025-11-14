"use client";

import { useState, useEffect } from "react";
import { AddQuestionModal } from "@/components/educator/AddQuestionModal";
import { getAllQuestions, deactivateQuestion, activateQuestion } from "@/api/services/AddQuestions";
import { Pencil, Trash2, CheckCircle } from "lucide-react";

export default function QuestionsTab() {
const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
const [questions, setQuestions] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [showAddModal, setShowAddModal] = useState(false);
const [editingQuestion, setEditingQuestion] = useState<any>(null);

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

const handleEdit = (question: any, e: React.MouseEvent) => {
e.stopPropagation();
setEditingQuestion(question);
setShowAddModal(true);
};

const handleToggleActive = async (question: any, e: React.MouseEvent) => {
e.stopPropagation();
const action = question.is_active ? "deactivate" : "activate";
if (!confirm(`Are you sure you want to ${action} this question?`)) {
  return;
}

try {
  if (question.is_active) {
    await deactivateQuestion(question.id);
    alert("Question deactivated successfully!");
  } else {
    await activateQuestion(question.id);
    alert("Question activated successfully!");
  }
  loadQuestions();
} catch (error: any) {
  alert(`Failed to ${action} question: ` + (error.message || error));
}
};

const handleCloseModal = () => {
setShowAddModal(false);
setEditingQuestion(null);
};

// Helper function to get quiz type badge color
const getQuizTypeBadgeColor = (quizType: string) => {
if (quizType.toLowerCase().includes("practice")) {
return "bg-indigo-100 text-indigo-700 border border-indigo-300";
} else if (quizType.toLowerCase().includes("final")) {
return "bg-rose-100 text-rose-700 border border-rose-300";
}
return "bg-amber-100 text-amber-600 border border-amber-300";
};

return (
<div className="space-y-4">
<div className="flex justify-between items-center mb-6">
<h3 className="text-lg font-bold text-teal-600">
Questions for Learning Platform
</h3>
<button
onClick={() => {
setEditingQuestion(null);
setShowAddModal(true);
}}
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
        className="border-2 border-teal-600 rounded-lg p-4 cursor-pointer hover:bg-teal-50 transition-colors"
      >
        <div
          onClick={() =>
            setExpandedQuestion(
              expandedQuestion === question.id ? null : question.id
            )
          }
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-bold text-gray-800">
                  {question.content?.[0]?.question_text || "No text"}
                </h4>
                {!question.is_active && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-semibold">
                    INACTIVE
                  </span>
                )}
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
                    className={`px-3 py-1 rounded font-medium ${getQuizTypeBadgeColor(qt.quiz_type?.quiz_type || "")}`}
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

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 pt-4 border-t">
                <button
                  onClick={(e) => handleEdit(question, e)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Question
                </button>
                
                {question.is_active ? (
                  <button
                    onClick={(e) => handleToggleActive(question, e)}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleToggleActive(question, e)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Activate
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    ))
  )}

  <AddQuestionModal
    isOpen={showAddModal}
    onClose={handleCloseModal}
    onSuccess={loadQuestions}
    authorId={authorId}
    editQuestion={editingQuestion}
  />
</div>
);
}