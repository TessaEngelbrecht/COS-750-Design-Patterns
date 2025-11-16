"use client"

import { useState } from "react"
import OverviewTab from "./tabs/overview-tab"
import StudentsTab from "./tabs/students-tab"
import QuestionsTab from "./tabs/questions-tab"
import LearningAreasTab from "./tabs/learning-areas-tab"
import { useGetStatsQuery } from "@/api/services/EducatorDashboardOverallStats"
import { Plus } from "lucide-react"

interface DashboardProps {
  user: any
  router: any
}

export default function EducatorDashboard({ user, router }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [triggerAddQuestion, setTriggerAddQuestion] = useState(false)

  // Fetch live stats
  const { data: stats, isLoading, error } = useGetStatsQuery()

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleAddQuestion = () => {
    setActiveTab("questions")
    // Trigger the add question modal in the Questions tab
    setTriggerAddQuestion(true)
    // Reset trigger after a short delay
    setTimeout(() => setTriggerAddQuestion(false), 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-teal-600 text-white py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Observer Pattern Learning Platform</h1>
            <p className="text-teal-100 mt-1 text-sm sm:text-base">Educator Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto bg-white text-teal-600 px-6 py-2 rounded-full font-semibold hover:bg-teal-50 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="metric-card border-l-8 border-2 border-teal-600">
            <div className="text-3xl font-bold text-teal-600">
              {isLoading ? "..." : stats?.totalStudents ?? 0}
            </div>
            <p className="text-sm text-gray-600">Total Students</p>
          </div>

          <div className="metric-card border-l-8 border-2 border-pink-500">
            <div className="text-3xl font-bold text-pink-500">
              {isLoading ? "..." : `${stats?.avgProgress?.toFixed(0) ?? 0}%`}
            </div>
            <p className="text-sm text-gray-600">AVG Practice Quiz</p>
          </div>

          <div className="metric-card border-l-8 border-2 border-green-500">
            <div className="text-3xl font-bold text-green-500">
              {isLoading ? "..." : `${stats?.avgScore?.toFixed(0) ?? 0}%`}
            </div>
            <p className="text-sm text-gray-600">AVG Final Quiz</p>
          </div>

          <div className="metric-card border-l-8 border-2 border-red-500">
            <div className="text-3xl font-bold text-red-500">
              {isLoading ? "..." : stats?.atRiskCount ?? 0}
            </div>
            <p className="text-sm text-gray-600">At Risk</p>
          </div>

          {/* Add Question Card */}
          <button
            onClick={handleAddQuestion}
            className="metric-card border-l-8 border-2 border-purple-500 hover:bg-purple-50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-center">
              <Plus className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm text-gray-600 font-semibold mt-2">Add Question</p>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex flex-col sm:flex-row border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 font-semibold text-center transition-colors whitespace-nowrap ${
                activeTab === "overview"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 font-semibold text-center transition-colors whitespace-nowrap ${
                activeTab === "students"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab("questions")}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 font-semibold text-center transition-colors whitespace-nowrap ${
                activeTab === "questions"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Questions
            </button>
            <button
              onClick={() => setActiveTab("learning-areas")}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 font-semibold text-center transition-colors whitespace-nowrap ${
                activeTab === "learning-areas"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Learning Areas
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-8">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "students" && <StudentsTab />}
            {activeTab === "questions" && <QuestionsTab triggerAddQuestion={triggerAddQuestion} />}
            {activeTab === "learning-areas" && <LearningAreasTab />}
          </div>
        </div>
      </main>
    </div>
  )
}
