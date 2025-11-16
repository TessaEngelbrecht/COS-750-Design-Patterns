
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { getQuestionMetadata, createQuestion, updateQuestion } from "@/api/services/AddQuestions";

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  authorId: string;
  editQuestion?: any;
}

export function AddQuestionModal({
  isOpen,
  onClose,
  onSuccess,
  authorId,
  editQuestion,
}: AddQuestionModalProps) {
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [questionText, setQuestionText] = useState("");
  const [formatId, setFormatId] = useState("");
  const [difficultyId, setDifficultyId] = useState("");
  const [bloomId, setBloomId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [points, setPoints] = useState(1);
  const [quizTypeIds, setQuizTypeIds] = useState<string[]>([]);
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [questionDataJson, setQuestionDataJson] = useState("{}");
  const [correctAnswerJson, setCorrectAnswerJson] = useState("{}");

  const isEditMode = !!editQuestion;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      loadMetadata();
      if (editQuestion) {
        populateEditData();
      } else {
        resetForm();
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, editQuestion]);

  const populateEditData = () => {
    if (!editQuestion) return;

    setQuestionText(editQuestion.content?.[0]?.question_text || "");
    setFormatId(editQuestion.format?.id || "");
    setDifficultyId(editQuestion.difficulty?.id || "");
    setBloomId(editQuestion.bloom?.id || "");
    setSectionId(editQuestion.section?.id || "");
    setPoints(editQuestion.content?.[0]?.points || 1);
    
    const quizTypes = editQuestion.quiz_types?.map((qt: any) => qt.quiz_type?.id) || [];
    setQuizTypeIds(quizTypes);
    
    const topics = editQuestion.topics?.map((t: any) => t.topic?.id) || [];
    setTopicIds(topics);
    
    setQuestionDataJson(JSON.stringify(editQuestion.content?.[0]?.question_data || {}, null, 2));
    setCorrectAnswerJson(JSON.stringify(editQuestion.content?.[0]?.correct_answer || {}, null, 2));
  };

  const loadMetadata = async () => {
    try {
      setLoading(true);
      const data = await getQuestionMetadata();
      setMetadata(data);
    } catch (error) {
      alert("Failed to load form options");
    } finally {
      setLoading(false);
    }
  };

  const handleFormatChange = (formatId: string) => {
    setFormatId(formatId);
    
    if (isEditMode) return;
    
    const format = metadata?.formats.find((f: any) => f.id === formatId);
    
    if (format) {
      switch (format.format) {
        case "multiple-choice":
          setQuestionDataJson(JSON.stringify({
            options: [
              { id: "A", text: "Option A" },
              { id: "B", text: "Option B" },
              { id: "C", text: "Option C" },
              { id: "D", text: "Option D" }
            ]
          }, null, 2));
          setCorrectAnswerJson(JSON.stringify({
            answer: "A",
            reason: "Explanation here"
          }, null, 2));
          break;
        case "select-multiple":
          setQuestionDataJson(JSON.stringify({
            options: [
              { id: "A", text: "Option A" },
              { id: "B", text: "Option B" },
              { id: "C", text: "Option C" }
            ]
          }, null, 2));
          setCorrectAnswerJson(JSON.stringify({
            answers: ["A", "B"],
            reason: "Explanation here"
          }, null, 2));
          break;
        case "fill-in-blank":
          setQuestionDataJson(JSON.stringify({
            code_snippet: "Optional code here",
            blanks: [
              { position: 1, hint: "Hint for blank 1" }
            ]
          }, null, 2));
          setCorrectAnswerJson(JSON.stringify({
            blanks: [
              { position: 1, answers: ["answer1", "answer2"] }
            ],
            reason: "Explanation here"
          }, null, 2));
          break;
        case "identify-error":
          setQuestionDataJson(JSON.stringify({
            code_snippet: "Code with error here",
            options: [
              { id: "A", text: "Line 1" },
              { id: "B", text: "Line 2" }
            ]
          }, null, 2));
          setCorrectAnswerJson(JSON.stringify({
            answer: "A",
            reason: "Explanation here"
          }, null, 2));
          break;
      }
    }
  };

  const toggleQuizType = (id: string) => {
    setQuizTypeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleTopic = (id: string) => {
    setTopicIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!questionText.trim()) {
      alert("Please enter question text");
      return;
    }
    if (!formatId || !difficultyId || !bloomId || !sectionId) {
      alert("Please select all required fields");
      return;
    }
    if (quizTypeIds.length === 0) {
      alert("Please select at least one quiz type (Practice or Final)");
      return;
    }

    let questionData, correctAnswer;
    try {
      questionData = JSON.parse(questionDataJson);
      correctAnswer = JSON.parse(correctAnswerJson);
    } catch (error) {
      alert("Invalid JSON format in question data or correct answer");
      return;
    }

    setSaving(true);
    try {
      if (isEditMode) {
        await updateQuestion({
          question_id: editQuestion.id,
          format_id: formatId,
          difficulty_id: difficultyId,
          bloom_id: bloomId,
          section_id: sectionId,
          question_text: questionText,
          question_data: questionData,
          correct_answer: correctAnswer,
          points,
          quiz_type_ids: quizTypeIds,
          topic_ids: topicIds,
        });
        alert("Question updated successfully!");
      } else {
        await createQuestion({
          format_id: formatId,
          difficulty_id: difficultyId,
          bloom_id: bloomId,
          section_id: sectionId,
          author_id: authorId,
          question_text: questionText,
          question_data: questionData,
          correct_answer: correctAnswer,
          points,
          quiz_type_ids: quizTypeIds,
          topic_ids: topicIds,
        });
        alert("Question created successfully!");
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      alert(`Failed to ${isEditMode ? 'update' : 'create'} question: ` + (error.message || error));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setQuestionText("");
    setFormatId("");
    setDifficultyId("");
    setBloomId("");
    setSectionId("");
    setPoints(1);
    setQuizTypeIds([]);
    setTopicIds([]);
    setQuestionDataJson("{}");
    setCorrectAnswerJson("{}");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-teal-700">
            {isEditMode ? "Edit Question" : "Add New Question"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading form...</div>
        ) : (
          <div className="space-y-6">
            {/* Question Text */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Question Text *
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 min-h-[100px]"
                placeholder="Enter your question here..."
              />
            </div>

            {/* Format */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Question Format *
              </label>
              <select
                value={formatId}
                onChange={(e) => handleFormatChange(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3"
              >
                <option value="">Select format...</option>
                {metadata?.formats.map((format: any) => (
                  <option key={format.id} value={format.id}>
                    {format.format} {format.description && `- ${format.description}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Difficulty *
                </label>
                <select
                  value={difficultyId}
                  onChange={(e) => setDifficultyId(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg p-3"
                >
                  <option value="">Select...</option>
                  {metadata?.difficultyLevels.map((diff: any) => (
                    <option key={diff.id} value={diff.id}>
                      {diff.difficulty_level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bloom Level *
                </label>
                <select
                  value={bloomId}
                  onChange={(e) => setBloomId(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg p-3"
                >
                  <option value="">Select...</option>
                  {metadata?.bloomLevels.map((bloom: any) => (
                    <option key={bloom.id} value={bloom.id}>
                      {bloom.level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Section *
                </label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg p-3"
                >
                  <option value="">Select...</option>
                  {metadata?.sections.map((section: any) => (
                    <option key={section.id} value={section.id}>
                      {section.section}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Points
              </label>
              <Input
                type="number"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
                min={1}
                className="w-full border-2 border-gray-300 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quiz Type * (Select at least one)
              </label>
              <div className="flex gap-4">
                {metadata?.quizTypes.map((type: any) => (
                  <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quizTypeIds.includes(type.id)}
                      onChange={() => toggleQuizType(type.id)}
                      className="w-5 h-5"
                    />
                    <span>{type.quiz_type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Related Topics (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-3 rounded">
                {metadata?.topics.map((topic: any) => (
                  <label key={topic.id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={topicIds.includes(topic.id)}
                      onChange={() => toggleTopic(topic.id)}
                      className="w-4 h-4"
                    />
                    <span>{topic.topic}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Question Data (JSON)
              </label>
              <textarea
                value={questionDataJson}
                onChange={(e) => setQuestionDataJson(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 font-mono text-sm min-h-[150px]"
                placeholder='{"options": [...]}'
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correct Answer (JSON)
              </label>
              <textarea
                value={correctAnswerJson}
                onChange={(e) => setCorrectAnswerJson(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 font-mono text-sm min-h-[150px]"
                placeholder='{"answer": "A", "reason": "..."}'
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
              >
                {saving ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Question" : "Create Question")}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
