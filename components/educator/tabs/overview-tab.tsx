"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import ReactApexChart from "react-apexcharts";
import { useGetGraphsDataQuery } from "@/api/services/EducatorOverviewStatsGraphs";

export default function OverviewTab() {
  const { data, isLoading } = useGetGraphsDataQuery();
  if (isLoading || !data) return <div className="text-center py-20">Loading overview data...</div>;

  const { scoreDistribution, questionAccuracy, bloomRadar, questionSections, questionsByBloomDifficulty } = data;

  const sectionCounts = questionSections.reduce<Record<string, number>>((acc, q) => {
    const sectionName = q.section ?? "Unknown Section";
    acc[sectionName] = (acc[sectionName] || 0) + 1;
    return acc;
  }, {});

  const polarSeries = Object.values(sectionCounts);
  const polarCategories = Object.keys(sectionCounts);

  const polarOptions: ApexCharts.ApexOptions = {
    chart: { type: "polarArea" },
    labels: polarCategories,
    stroke: { colors: ["#fff"] },
    fill: { opacity: 0.8 },
    responsive: [
      {
        breakpoint: 480,
        options: { chart: { width: 200 }, legend: { position: "bottom" } },
      },
    ],
  };

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Distribution */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-teal-600 mb-4">Final Assessment Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0D9488" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Question Accuracy */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-teal-600 mb-4">Final Quiz Question Accuracy</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={questionAccuracy}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="question_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="correct" stackId="a" fill="#66BB6A" radius={[8, 8, 0, 0]} />
              <Bar dataKey="incorrect" stackId="a" fill="#EF5350" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-teal-600 mb-4">Bloom’s Taxonomy — Performance vs Coverage</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={bloomRadar}>
              <PolarGrid stroke="#E0E0E0" />
              <PolarAngleAxis dataKey="level" />
              <PolarRadiusAxis />
              <Radar name="Performance" dataKey="performance" stroke="#0D9488" fill="#0D9488" fillOpacity={0.5} />
              <Radar name="Coverage" dataKey="coverage" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-teal-600 mb-4">Question Sections Overview</h3>
          <ReactApexChart options={polarOptions} series={polarSeries} type="polarArea" height={350} />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-teal-600 mb-4">Questions by Bloom & Difficulty</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={questionsByBloomDifficulty}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
            <XAxis dataKey="bloom" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Easy" stackId="a" fill="#66BB6A" />
            <Bar dataKey="Medium" stackId="a" fill="#FDD835" />
            <Bar dataKey="Hard" stackId="a" fill="#EF5350" />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
