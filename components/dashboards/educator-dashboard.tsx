"use client"

import { useState } from "react"

interface EducatorDashboardProps {
  userName: string
  onLogout: () => void
}

export function EducatorDashboard({ userName, onLogout }: EducatorDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const stats = [
    { label: "Total Students", value: "48", color: "bg-accent-blue" },
    { label: "Active Courses", value: "3", color: "bg-accent-green" },
    { label: "Assignments", value: "12", color: "bg-accent-purple" },
    { label: "Avg Score", value: "78%", color: "bg-accent-pink" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Educator Dashboard</h1>
            <p className="text-sm text-blue-100">Manage courses and track student progress</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-semibold">{userName}</p>
              <p className="text-xs text-blue-100">Educator</p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-blue-50 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className={`${stat.color} rounded-xl p-6 shadow-md hover:shadow-lg transition`}>
              <p className="text-gray-700 font-semibold text-sm mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b-2 border-gray-200 flex">
            {["overview", "students", "assignments", "analytics"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 font-semibold transition capitalize ${
                  activeTab === tab ? "text-primary border-b-4 border-primary" : "text-gray-600 hover:text-primary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Course Overview</h3>
                <p className="text-gray-600">Manage your courses and student progress here.</p>
              </div>
            )}
            {activeTab === "students" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Student Management</h3>
                <p className="text-gray-600">View and manage enrolled students.</p>
              </div>
            )}
            {activeTab === "assignments" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Assignments</h3>
                <p className="text-gray-600">Create and grade assignments.</p>
              </div>
            )}
            {activeTab === "analytics" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Analytics</h3>
                <p className="text-gray-600">View detailed learning analytics and reports.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
