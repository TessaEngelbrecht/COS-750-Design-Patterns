"use client";

import { useState, Fragment, useEffect } from "react";
import OverviewTab from "./tabs/overview-tab";
import StudentsTab from "./tabs/students-tab";
import QuestionsTab from "./tabs/questions-tab";
import LearningAreasTab from "./tabs/learning-areas-tab";
import { useGetStatsQuery, useGetDesignPatternsQuery } from "@/api/services/EducatorDashboardOverallStats";
import { useGetGraphsDataQuery } from "@/api/services/EducatorOverviewStatsGraphs";
import { Menu, Transition } from "@headlessui/react";

interface DashboardProps {
  user: any;
  router: any;
}

export default function EducatorDashboard({ user, router }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPatternId, setSelectedPatternId] = useState<string | undefined>(undefined);

  const { data: stats, isLoading } = useGetStatsQuery();
  const { data: patterns, isLoading: patternsLoading } = useGetDesignPatternsQuery();

  const { data: graphsData, isLoading: graphsLoading, refetch: refetchGraphs } = useGetGraphsDataQuery(
    { patternId: selectedPatternId ?? "" },
    { skip: activeTab !== "overview" }
  );

  useEffect(() => {
    if (activeTab === "overview") refetchGraphs();
  }, [selectedPatternId, activeTab, refetchGraphs]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-teal-600 text-white py-6 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Observer Pattern Learning Platform</h1>
            <p className="text-teal-100 mt-1">Educator Dashboard</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Design Patterns Dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="bg-teal-600 border-white border-2 text-white px-6 py-2 rounded-full font-semibold hover:bg-teal-500">
                {selectedPatternId
                  ? patterns?.find((p) => p.id === selectedPatternId)?.design_pattern
                  : "All Patterns"}
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
                <Menu.Items className="absolute right-0 mt-2 w-56 bg-white text-gray-800 shadow-md rounded-md z-10">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`block px-4 py-2 text-sm w-full text-left ${active ? "bg-teal-100" : ""}`}
                        onClick={() => setSelectedPatternId(undefined)}
                      >
                        All Patterns
                      </button>
                    )}
                  </Menu.Item>
                  {patternsLoading && <div className="px-4 py-2 text-sm">Loading...</div>}
                  {patterns?.map((p) => (
                    <Menu.Item key={p.id}>
                      {({ active }) => (
                        <button
                          className={`block px-4 py-2 text-sm w-full text-left ${active ? "bg-teal-100" : ""}`}
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
              className="bg-white text-teal-600 px-6 py-2 rounded-full font-semibold hover:bg-teal-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="metric-card border-l-8 border-2 border-teal-600">
            <div className="text-3xl font-bold text-teal-600">{isLoading ? "..." : stats?.totalStudents ?? 0}</div>
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
            <div className="text-3xl font-bold text-red-500">{isLoading ? "..." : stats?.atRiskCount ?? 0}</div>
            <p className="text-sm text-gray-600">At Risk</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex border-b border-gray-200">
            {["overview", "students", "learning-areas", "questions"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 font-semibold text-center transition-colors ${
                  activeTab === tab
                    ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "overview" && <OverviewTab data={graphsData} isLoading={graphsLoading} />}
            {activeTab === "students" && <StudentsTab />}
            {activeTab === "learning-areas" && <LearningAreasTab data={graphsData} isLoading={graphsLoading} />}
            {activeTab === "questions" && <QuestionsTab />}
          </div>
        </div>
      </main>
    </div>
  );
}
