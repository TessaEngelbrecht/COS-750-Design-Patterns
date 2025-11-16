"use client";

import { useState, Fragment } from "react";
import OverviewTab from "./tabs/overview-tab";
import StudentsTab from "./tabs/students-tab";
import QuestionsTab from "./tabs/questions-tab";
import LearningAreasTab from "./tabs/learning-areas-tab";
import { useGetStatsQuery, useGetDesignPatternsQuery } from "@/api/services/EducatorDashboardOverallStats";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDown } from "lucide-react";

interface DashboardProps {
  user: any;
  router: any;
}

export default function EducatorDashboard({ user, router }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPatternId, setSelectedPatternId] = useState<string | undefined>(undefined);

  const { data: stats, isLoading: statsLoading } = useGetStatsQuery({ patternId: selectedPatternId });
  const { data: patterns, isLoading: patternsLoading } = useGetDesignPatternsQuery();

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "students", label: "Students" },
    { id: "learning-areas", label: "Learning Areas" },
    { id: "questions", label: "Questions" },
  ];

  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label || "Overview";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-teal-600 text-white py-4 sm:py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                Observer Pattern Learning Platform
              </h1>
              <p className="text-teal-100 mt-1 text-xs sm:text-sm">Educator Dashboard</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              {/* Design Patterns Dropdown */}
              <Menu as="div" className="relative w-full sm:w-auto">
                <Menu.Button className="w-full sm:w-auto bg-teal-600 border-white border-2 text-white px-4 sm:px-6 py-2 rounded-full font-semibold hover:bg-teal-500 transition flex items-center justify-between gap-2">
                  <span className="truncate">
                    {selectedPatternId
                      ? patterns?.find((p) => p.id === selectedPatternId)?.design_pattern
                      : "All Patterns"}
                  </span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-full sm:w-56 bg-white text-gray-800 shadow-lg rounded-md z-20 max-h-60 overflow-y-auto">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`block px-4 py-2 text-sm w-full text-left ${
                            active ? "bg-teal-100" : ""
                          }`}
                          onClick={() => setSelectedPatternId(undefined)}
                        >
                          All Patterns
                        </button>
                      )}
                    </Menu.Item>
                    {patternsLoading && (
                      <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                    )}
                    {patterns?.map((p) => (
                      <Menu.Item key={p.id}>
                        {({ active }) => (
                          <button
                            className={`block px-4 py-2 text-sm w-full text-left ${
                              active ? "bg-teal-100" : ""
                            }`}
                            onClick={() => setSelectedPatternId(p.id)}
                          >
                            {p.design_pattern}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>

              <button
                onClick={handleLogout}
                className="w-full sm:w-auto bg-white text-teal-600 px-4 sm:px-6 py-2 rounded-full font-semibold hover:bg-teal-50 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6 lg:py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <div className="metric-card border-l-8 border-2 border-teal-600">
            <div className="text-2xl sm:text-3xl font-bold text-teal-600">
              {statsLoading ? "..." : stats?.totalStudents ?? 0}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
          </div>

          <div className="metric-card border-l-8 border-2 border-pink-500">
            <div className="text-2xl sm:text-3xl font-bold text-pink-500">
              {statsLoading ? "..." : `${stats?.avgProgress?.toFixed(0) ?? 0}%`}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">AVG Practice Quiz</p>
          </div>

          <div className="metric-card border-l-8 border-2 border-green-500">
            <div className="text-2xl sm:text-3xl font-bold text-green-500">
              {statsLoading ? "..." : `${stats?.avgScore?.toFixed(0) ?? 0}%`}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">AVG Final Quiz</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Desktop Tabs */}
          <div className="hidden md:flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 lg:py-4 px-4 lg:px-6 font-semibold text-center transition-colors text-sm lg:text-base ${
                  activeTab === tab.id
                    ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile Tab Dropdown */}
          <div className="md:hidden border-b border-gray-200">
            <Menu as="div" className="relative">
              <Menu.Button className="w-full py-3 px-4 font-semibold text-left transition-colors text-teal-600 bg-teal-50 flex items-center justify-between">
                <span>{activeTabLabel}</span>
                <ChevronDown className="w-5 h-5" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute left-0 right-0 mt-0 bg-white shadow-lg z-10 border-t border-gray-200">
                  {tabs.map((tab) => (
                    <Menu.Item key={tab.id}>
                      {({ active }) => (
                        <button
                          className={`block w-full px-4 py-3 text-left font-medium ${
                            activeTab === tab.id
                              ? "bg-teal-100 text-teal-700"
                              : active
                              ? "bg-gray-100 text-gray-800"
                              : "text-gray-600"
                          }`}
                          onClick={() => setActiveTab(tab.id)}
                        >
                          {tab.label}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === "overview" && <OverviewTab patternId={selectedPatternId} />}
            {activeTab === "students" && <StudentsTab patternId={selectedPatternId} />}
            {activeTab === "learning-areas" && <LearningAreasTab patternId={selectedPatternId} />}
            {activeTab === "questions" && <QuestionsTab />}
          </div>
        </div>
      </main>
    </div>
  );
}
