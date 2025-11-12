"use client";
import dynamic from "next/dynamic";
import { Fragment } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useGetGraphsDataQuery } from "@/api/services/EducatorOverviewStatsGraphs";
import { Popover, Transition } from "@headlessui/react";
import { ScreenSizeChecker } from "@/components/uml-builder/ScreenSizeChecker";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

function GraphHeading({ title, helpText }: { title: string; helpText: string }) {
  return (
    <div className="flex items-center mb-4">
      <h3 className="text-lg font-bold text-teal-600">{title}</h3>
      <Popover className="relative ml-2">
        <Popover.Button className="text-teal-700 hover:text-teal-600 font-bold rounded-full border w-5 h-5 flex items-center justify-center bg-teal-100">
          ?
        </Popover.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel className="absolute z-10 w-64 bg-white border border-gray-300 shadow-lg p-3 rounded-md top-6 left-1/2 -translate-x-1/2 text-sm">
            {helpText}
          </Popover.Panel>
        </Transition>
      </Popover>
    </div>
  );
}

export default function OverviewTab() {
  const { data, isLoading } = useGetGraphsDataQuery();
  if (isLoading || !data) return <div className="text-center py-20">Loading overview data...</div>;

  const {
    scoreDistribution,
    questionAccuracy,
    practiceTrend,
    practiceVsFinalBloom,
    practiceDifficultyOverAttempts,
    practiceBloomOverAttempts,
  } = data;

  return (
    <ScreenSizeChecker>
      <div className="space-y-10">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <GraphHeading
              title="Final Assessment Score Distribution"
              helpText="Shows the number of students falling into each score range for the final assessment. Useful to quickly identify overall performance trends."
            />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="range" label={{ value: "Score Range", position: "insideBottom", dy: 15 }} />
                <YAxis label={{ value: "Number of Students", angle: -90, position: "insideLeft", dy: 60 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0D9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <GraphHeading
              title="Final Quiz Question Accuracy"
              helpText="Shows how many students answered each question correctly or incorrectly. Helps identify difficult questions or weak topics."
            />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={questionAccuracy} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="question_id" label={{ value: "Question ID", position: "insideBottom", dy: 15 }} />
                <YAxis label={{ value: "Number of Students", angle: -90, position: "insideLeft", dy: 60 }} />
                <Tooltip />
                <Bar dataKey="correct" stackId="a" fill="#66BB6A" radius={[8, 8, 0, 0]} />
                <Bar dataKey="incorrect" stackId="a" fill="#EF5350" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <GraphHeading
            title="Practice Performance Trend (Across Attempts)"
            helpText="Shows the average score for students across all practice attempts. Helps visualize improvement over time."
          />
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={practiceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="attempt_no" label={{ value: "Attempt", position: "insideBottom", dy: 15 }} />
              <YAxis label={{ value: "Average Score (%)", angle: -90, position: "insideLeft", dy: 45 }} />
              <Tooltip />
              <Line type="monotone" dataKey="avg_score" stroke="#0D9488" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <GraphHeading
            title="Practice vs Final — Bloom Comparison"
            helpText="Compares practice scores to final quiz scores across Bloom levels. Helps identify areas of strength or needing improvement."
          />
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={practiceVsFinalBloom} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bloom_level" label={{ value: "Bloom Level", position: "insideBottom", dy: 15 }} />
              <YAxis label={{ value: "Average Score (%)", angle: -90, position: "insideLeft", dy: 45 }} />
              <Tooltip />
              <Legend verticalAlign="top" align="right" />
              <Bar dataKey="practice_avg" fill="#60A5FA" name="Practice Avg" />
              <Bar dataKey="final_avg" fill="#34D399" name="Final Avg" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <GraphHeading
            title="Average Practice Score by Difficulty"
            helpText="Shows average scores for each difficulty level (Easy, Medium, Hard). Each line represents a separate attempt."
          />
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={["Easy", "Medium", "Hard"].map((diff) => {
                const obj: any = { difficulty: diff };
                practiceDifficultyOverAttempts.forEach((item) => {
                  obj[`Attempt ${item.attempt_no}`] =
                    item.difficulty === diff ? item.avg_score : obj[`Attempt ${item.attempt_no}`] ?? 0;
                });
                return obj;
              })}
              margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
            >
              <XAxis dataKey="difficulty" label={{ value: "Difficulty Level", position: "insideBottom", dy: 15 }} />
              <YAxis label={{ value: 'Average Score (%)', angle: -90, position: 'insideLeft', dy: 45 }} />
              <Tooltip />
              <Legend verticalAlign="top" align="right" />
              {Array.from(new Set(practiceDifficultyOverAttempts.map((a) => a.attempt_no))).map((attempt_no, idx) => (
                <Line
                  key={attempt_no}
                  type="monotone"
                  dataKey={`Attempt ${attempt_no}`}
                  stroke={["#FFA500", "#0D9488", "#FF4500", "#8B5CF6", "#F97316"][idx % 5]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <GraphHeading
            title="Average Practice Score by Bloom Level"
            helpText="Shows average scores per Bloom level. Each line represents a separate attempt across cognitive skills."
          />
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"].map((bloom) => {
                const obj: any = { bloom };
                practiceBloomOverAttempts.forEach((item) => {
                  obj[`Attempt ${item.attempt_no}`] =
                    item.bloom_level === bloom ? item.avg_score : obj[`Attempt ${item.attempt_no}`] ?? 0;
                });
                return obj;
              })}
              margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
            >
              <XAxis dataKey="bloom" label={{ value: "Bloom Level", position: "insideBottom", dy: 15 }} />
              <YAxis label={{ value: 'Average Score (%)', angle: -90, position: 'insideLeft', dy: 45 }} />
              <Tooltip />
              <Legend verticalAlign="top" align="right" />
              {Array.from(new Set(practiceBloomOverAttempts.map((a) => a.attempt_no))).map((attempt_no, idx) => (
                <Line
                  key={attempt_no}
                  type="monotone"
                  dataKey={`Attempt ${attempt_no}`}
                  stroke={["#FFA500", "#0D9488", "#FF4500", "#8B5CF6", "#F97316", "#10B981"][idx % 6]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ScreenSizeChecker>
  );
}
