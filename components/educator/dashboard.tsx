"use client"

import { useState } from "react"
import OverviewTab from "./tabs/overview-tab"
import StudentsTab from "./tabs/students-tab"
import QuestionsTab from "./tabs/questions-tab"
import LearningAreasTab from "./tabs/learning-areas-tab"

interface DashboardProps {
  user: any
  router: any
}

export default function EducatorDashboard({ user, router }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-teal-600 text-white py-6 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Observer Pattern Learning Platform</h1>
            <p className="text-teal-100 mt-1">Educator Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-teal-600 px-6 py-2 rounded-full font-semibold hover:bg-teal-50"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="metric-card border-l-4 border-teal-600">
            <div className="text-3xl font-bold text-teal-600">18</div>
            <p className="text-sm text-gray-600">Total Students</p>
          </div>
          <div className="metric-card border-l-4 border-pink-500">
            <div className="text-3xl font-bold text-pink-500">75%</div>
            <p className="text-sm text-gray-600">AVG Progress</p>
          </div>
          <div className="metric-card border-l-4 border-green-500">
            <div className="text-3xl font-bold text-green-500">67%</div>
            <p className="text-sm text-gray-600">AVG Score</p>
          </div>
          <div className="metric-card border-l-4 border-red-500">
            <div className="text-3xl font-bold text-red-500">5</div>
            <p className="text-sm text-gray-600">At Risk</p>
          </div>
          <div className="metric-card border-l-4 border-purple-500">
            <div className="text-3xl font-bold text-purple-500">+</div>
            <p className="text-sm text-gray-600">Add Quiz</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-colors ${
                activeTab === "overview"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-colors ${
                activeTab === "students"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab("questions")}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-colors ${
                activeTab === "questions"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Questions
            </button>
            <button
              onClick={() => setActiveTab("learning-areas")}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-colors ${
                activeTab === "learning-areas"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Learning Areas
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "students" && <StudentsTab />}
            {activeTab === "questions" && <QuestionsTab />}
            {activeTab === "learning-areas" && <LearningAreasTab />}
          </div>
        </div>
      </main>
    </div>
  )
}
