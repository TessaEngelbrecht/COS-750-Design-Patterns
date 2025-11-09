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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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

export default function LearningAreasTab() {
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
    <ScreenSizeChecker>
      <div className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <GraphHeading
              title="Bloom’s Taxonomy — Performance vs Coverage"
              helpText="This radar chart shows student performance (scores) and coverage (number of questions attempted) across each Bloom level. It helps identify areas of strength and where more practice may be needed."
            />
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={bloomRadar}>
                <PolarGrid stroke="#E0E0E0" />
                <PolarAngleAxis dataKey="level" />
                <PolarRadiusAxis />
                <Radar
                  name="Performance"
                  dataKey="performance"
                  stroke="#0D9488"
                  fill="#0D9488"
                  fillOpacity={0.5}
                />
                <Radar name="Coverage" dataKey="coverage" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <GraphHeading
              title="Question Sections Overview"
              helpText="This polar area chart shows the number of questions per section. It helps educators see which sections have more or fewer questions in the quiz."
            />
            <ReactApexChart options={polarOptions} series={polarSeries} type="polarArea" height={350} />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <GraphHeading
            title="Questions by Bloom & Difficulty"
            helpText="This stacked bar chart shows how many questions exist for each Bloom level, broken down by difficulty (Easy, Medium, Hard). It helps identify which Bloom levels may need more challenging or easier questions."
          />
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={questionsByBloomDifficulty} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="bloom" label={{ value: "Bloom Level", position: "insideBottom", dy: 15 }} />
              <YAxis label={{ value: "Number of Questions", angle: -90, position: "insideLeft", dy: 60 }} />
              <Tooltip />
              <Bar dataKey="Easy" stackId="a" fill="#66BB6A" />
              <Bar dataKey="Medium" stackId="a" fill="#FDD835" />
              <Bar dataKey="Hard" stackId="a" fill="#EF5350" />
              <Legend verticalAlign="top" align="right" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </ScreenSizeChecker>
  );
}
