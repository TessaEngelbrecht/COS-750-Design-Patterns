"use client";

import { useState, useEffect } from "react";
import { AddQuestionModal } from "@/components/educator/AddQuestionModal";
import { getAllQuestions, deactivateQuestion, activateQuestion } from "@/api/services/AddQuestions";
import { Pencil, Trash2, CheckCircle, Search, X, Filter, ChevronDown } from "lucide-react";

export default function QuestionsTab() {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [filterFormat, setFilterFormat] = useState("");
  const [filterBloom, setFilterBloom] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterQuizType, setFilterQuizType] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const authorId = "ed3abcb1-790a-4cf5-af95-5d80360e6566";

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await getAllQuestions();
      setQuestions(data);
      setFilteredQuestions(data);
    } catch (error) {
      console.error("Failed to load questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    let filtered = [...questions];

    if (searchText.trim()) {
      filtered = filtered.filter((q) =>
        q.content?.[0]?.question_text?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filterFormat) {
      filtered = filtered.filter((q) => q.format?.format === filterFormat);
    }

    if (filterBloom) {
      filtered = filtered.filter((q) => q.bloom?.level === filterBloom);
    }

    if (filterDifficulty) {
      filtered = filtered.filter((q) => q.difficulty?.difficulty_level === filterDifficulty);
    }

    if (filterSection) {
      filtered = filtered.filter((q) => q.section?.section === filterSection);
    }

    if (filterQuizType) {
      filtered = filtered.filter((q) =>
        q.quiz_types?.some((qt: any) => qt.quiz_type?.quiz_type === filterQuizType)
      );
    }

    if (filterStatus === "active") {
      filtered = filtered.filter((q) => q.is_active);
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter((q) => !q.is_active);
    }

    setFilteredQuestions(filtered);
  }, [searchText, filterFormat, filterBloom, filterDifficulty, filterSection, filterQuizType, filterStatus, questions]);

  const handleClearFilters = () => {
    setSearchText("");
    setFilterFormat("");
    setFilterBloom("");
    setFilterDifficulty("");
    setFilterSection("");
    setFilterQuizType("");
    setFilterStatus("all");
  };

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

  const getQuizTypeBadgeColor = (quizType: string) => {
    if (quizType.toLowerCase().includes("practice")) {
      return "bg-indigo-100 text-indigo-700 border border-indigo-300";
    } else if (quizType.toLowerCase().includes("final")) {
      return "bg-rose-100 text-rose-700 border border-rose-300";
    }
    return "bg-amber-100 text-amber-600 border border-amber-300";
  };

  const uniqueFormats = [...new Set(questions.map((q) => q.format?.format).filter(Boolean))];
  const uniqueBlooms = [...new Set(questions.map((q) => q.bloom?.level).filter(Boolean))];
  const uniqueDifficulties = [...new Set(questions.map((q) => q.difficulty?.difficulty_level).filter(Boolean))];
  const uniqueSections = [...new Set(questions.map((q) => q.section?.section).filter(Boolean))];
  const uniqueQuizTypes = [
    ...new Set(
      questions
        .flatMap((q) => q.quiz_types?.map((qt: any) => qt.quiz_type?.quiz_type))
        .filter(Boolean)
    ),
  ];

  const activeFiltersCount = [
    searchText,
    filterFormat,
    filterBloom,
    filterDifficulty,
    filterSection,
    filterQuizType,
    filterStatus !== "all" ? filterStatus : "",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          <h3 className="text-lg sm:text-xl font-bold text-teal-700">
            Questions for Learning Platform
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {filteredQuestions.length} of {questions.length} questions
            {activeFiltersCount > 0 && ` (${activeFiltersCount} filters active)`}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingQuestion(null);
            setShowAddModal(true);
          }}
          className="w-full sm:w-auto bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition shadow-md text-sm sm:text-base whitespace-nowrap"
        >
          + Add Question
        </button>
      </div>

      {/* Search Bar - Always Visible */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by question text..."
          className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      {/* Toggle Filters Button (Mobile) */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-600 rounded-lg font-semibold text-teal-700"
      >
        <span className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Advanced Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </span>
        <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
      </button>

      {/* Advanced Filters Panel */}
      <div className={`${showFilters ? "block" : "hidden"} lg:block bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-600 rounded-xl p-4 sm:p-6 shadow-sm`}>
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" />
          <h4 className="text-base sm:text-lg font-bold text-teal-700">Filters</h4>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
          {/* Format */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              Format
            </label>
            <select
              value={filterFormat}
              onChange={(e) => setFilterFormat(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border-2 border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">All Formats</option>
              {uniqueFormats.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>

          {/* Bloom */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              Bloom Level
            </label>
            <select
              value={filterBloom}
              onChange={(e) => setFilterBloom(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border-2 border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">All Levels</option>
              {uniqueBlooms.map((bloom) => (
                <option key={bloom} value={bloom}>
                  {bloom}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              Difficulty
            </label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border-2 border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">All Difficulties</option>
              {uniqueDifficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              Section
            </label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border-2 border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">All Sections</option>
              {uniqueSections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>

          {/* Quiz Type */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              Quiz Type
            </label>
            <select
              value={filterQuizType}
              onChange={(e) => setFilterQuizType(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border-2 border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">All Quiz Types</option>
              {uniqueQuizTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border-2 border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Clear Button */}
        {activeFiltersCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base bg-red-100 text-red-700 border-2 border-red-300 rounded-lg hover:bg-red-200 transition font-semibold"
          >
            <X className="w-4 h-4" />
            Clear All Filters ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-teal-700 mx-auto mb-4 rounded-full"></div>
          <p className="text-slate-600 text-sm sm:text-base">Loading questions...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <p className="text-slate-500 text-base sm:text-lg font-medium px-4">
            {questions.length === 0
              ? "No questions yet. Click 'Add Question' to create one."
              : "No questions match your current filters."}
          </p>
          {questions.length > 0 && activeFiltersCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="mt-4 text-teal-600 hover:text-teal-700 font-semibold underline text-sm sm:text-base"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="border-2 border-teal-600 rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-teal-50 transition-all hover:shadow-md"
            >
              <div
                onClick={() =>
                  setExpandedQuestion(
                    expandedQuestion === question.id ? null : question.id
                  )
                }
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2 flex-wrap">
                      <h4 className="font-bold text-gray-800 text-sm sm:text-base break-words">
                        {question.content?.[0]?.question_text || "No text"}
                      </h4>
                      {!question.is_active && (
                        <span className="text-[10px] sm:text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-semibold whitespace-nowrap">
                          INACTIVE
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 sm:gap-2 text-[10px] sm:text-xs flex-wrap">
                      <span className="bg-teal-100 text-teal-600 px-2 py-1 rounded font-medium">
                        {question.format?.format}
                      </span>
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded font-medium">
                        {question.bloom?.level}
                      </span>
                      <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded font-medium">
                        {question.difficulty?.difficulty_level}
                      </span>
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded font-medium">
                        {question.section?.section}
                      </span>
                      {question.quiz_types?.map((qt: any) => (
                        <span
                          key={qt.quiz_type?.id}
                          className={`px-2 py-1 rounded font-medium ${getQuizTypeBadgeColor(
                            qt.quiz_type?.quiz_type || ""
                          )}`}
                        >
                          {qt.quiz_type?.quiz_type}
                        </span>
                      ))}
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 sm:w-6 sm:h-6 text-teal-600 transition-transform flex-shrink-0 ${
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
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-teal-200">
                  <div className="space-y-2 text-xs sm:text-sm">
                    <p>
                      <strong>Points:</strong> {question.content?.[0]?.points || 1}
                    </p>
                    <p className="break-words">
                      <strong>Topics:</strong>{" "}
                      {question.topics?.map((t: any) => t.topic?.topic).join(", ") ||
                        "None"}
                    </p>
                    <div>
                      <strong>Question Data:</strong>
                      <pre className="bg-slate-100 p-2 sm:p-3 rounded mt-1 overflow-x-auto text-[10px] sm:text-xs border border-slate-300">
                        {JSON.stringify(
                          question.content?.[0]?.question_data,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                    <div>
                      <strong>Correct Answer:</strong>
                      <pre className="bg-slate-100 p-2 sm:p-3 rounded mt-1 overflow-x-auto text-[10px] sm:text-xs border border-slate-300">
                        {JSON.stringify(
                          question.content?.[0]?.correct_answer,
                          null,
                          2
                        )}
                      </pre>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                      <button
                        onClick={(e) => handleEdit(question, e)}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-xs sm:text-sm"
                      >
                        <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                        Edit Question
                      </button>

                      {question.is_active ? (
                        <button
                          onClick={(e) => handleToggleActive(question, e)}
                          className="flex items-center justify-center gap-2 bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold text-xs sm:text-sm"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleToggleActive(question, e)}
                          className="flex items-center justify-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold text-xs sm:text-sm"
                        >
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
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
