"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

const scoreDistributionData = [
  { range: "0-30%", count: 3 },
  { range: "30-50%", count: 8 },
  { range: "50-70%", count: 15 },
  { range: "70-90%", count: 25 },
  { range: "90-100%", count: 7 },
]

const questionAccuracyData = [
  { question: "1", correct: 15, incorrect: 3 },
  { question: "2", correct: 18, incorrect: 0 },
  { question: "3", correct: 12, incorrect: 6 },
  { question: "4", correct: 10, incorrect: 8 },
  { question: "5", correct: 17, incorrect: 1 },
  { question: "6", correct: 14, incorrect: 4 },
  { question: "7", correct: 9, incorrect: 9 },
  { question: "8", correct: 16, incorrect: 2 },
  { question: "9", correct: 11, incorrect: 7 },
  { question: "10", correct: 13, incorrect: 5 },
]

const bloomRadarData = [
  { subject: "Remember", A: 85, fullMark: 100 },
  { subject: "Understand", A: 70, fullMark: 100 },
  { subject: "Apply", A: 65, fullMark: 100 },
  { subject: "Analyze", A: 55, fullMark: 100 },
  { subject: "Evaluate", A: 60, fullMark: 100 },
  { subject: "Create", A: 40, fullMark: 100 },
]

const bloomDistributionData = [
  { name: "Create", value: 18 },
  { name: "Evaluate", value: 25 },
  { name: "Analyze", value: 30 },
  { name: "Apply", value: 35 },
  { name: "Understand", value: 28 },
  { name: "Remember", value: 22 },
]

const COLORS = ["#EF5350", "#26C6DA", "#FDD835", "#66BB6A", "#AB47BC", "#EC407A"]

export default function OverviewTab() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Final Assessment Score Distribution */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-teal-600 mb-4">Final Assessment Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0D9488" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Question Accuracy Distribution */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-teal-600 mb-4">Question Accuracy Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={questionAccuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="question" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="correct" fill="#66BB6A" stackId="a" radius={[8, 8, 0, 0]} />
              <Bar dataKey="incorrect" fill="#EF5350" stackId="a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bloom's Taxonomy Understanding */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-teal-600 mb-4">Bloom's Taxonomy Understanding</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={bloomRadarData}>
              <PolarGrid stroke="#E0E0E0" />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar name="Performance" dataKey="A" stroke="#0D9488" fill="#0D9488" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bloom's Taxonomy Distribution */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-teal-600 mb-4">Bloom's Taxonomy Distribution</h3>
          <div className="space-y-3">
            {bloomDistributionData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[idx] }}></div>
                <span className="font-semibold text-sm">{item.name}</span>
                <div className="flex-1 bg-gray-300 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor: COLORS[idx],
                      width: `${(item.value / 35) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-600 w-8">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
