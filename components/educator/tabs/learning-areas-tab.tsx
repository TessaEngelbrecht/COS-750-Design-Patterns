"use client"

const bloomLevels = [
  { level: "Remember", percentage: 90, questions: 3 },
  { level: "Understand", percentage: 80, questions: 3 },
  { level: "Apply", percentage: 90, questions: 3 },
  { level: "Analyze", percentage: 50, questions: 3 },
  { level: "Evaluate", percentage: 60, questions: 3 },
  { level: "Create", percentage: 15, questions: 3 },
]

export default function LearningAreasTab() {
  return (
    <div>
      <h3 className="text-lg font-bold text-teal-600 mb-6">Learning Area Analysis</h3>
      <div className="space-y-4">
        {bloomLevels.map((item) => (
          <div key={item.level} className="flex items-center gap-4">
            <div className="w-32 font-semibold text-gray-700">{item.level}</div>
            <div className="flex-1">
              <div className="bg-gray-300 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
            <div className="w-20 text-right font-bold text-gray-700">{item.percentage}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}
