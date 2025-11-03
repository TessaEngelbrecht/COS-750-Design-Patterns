"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface CheatSheetPageProps {
  onNext: () => void
}

const cheatSheetSections = [
  { label: "Bloom", active: true },
  { label: "C++ Loops", active: false },
  { label: "Observer", active: false },
]

const loopExamples = [
  {
    type: "for",
    color: "border-cyan-500",
    bgColor: "bg-cyan-100",
    description: "Used when the number of iterations is known.",
    code: 'for (int i = 0; i < n; i++) {\n  cout << i << "\\n";\n}',
    details: [
      "Initialization: int i = 0",
      "Condition: i < n",
      "Update: i++",
      "Execution order: init → condition → body → update → condition → ...",
    ],
  },
  {
    type: "while",
    color: "border-green-500",
    bgColor: "bg-green-100",
    description: "Used when the number of iterations is unknown (depends on a condition).",
    code: 'int i = 0;\nwhile (i < n) {\n  cout << i << "\\n";\n  i++;\n}',
    details: ["Checks condition first.", "Runs zero or more times."],
  },
  {
    type: "do-while",
    color: "border-yellow-600",
    bgColor: "bg-yellow-100",
    description: "Used when the loop must run at least once.",
    code: 'int i = 0;\ndo {\n  cout << i << "\\n";\n  i++;\n} while (i < n);',
    details: [],
  },
]

export function CheatSheetPage({ onNext }: CheatSheetPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Content */}
      <div className="px-6 pb-8 max-w-7xl mx-auto pt-4">
        <div className="grid grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-1">
            <Card className="p-4 bg-teal-700 text-white border-0 space-y-2">
              <h3 className="font-bold text-lg mb-4">Cheat Section</h3>
              {cheatSheetSections.map((section) => (
                <button
                  key={section.label}
                  className={`w-full py-2 px-4 rounded font-semibold transition ${
                    section.active ? "bg-white text-teal-700" : "bg-teal-600 text-white hover:bg-teal-500"
                  }`}
                >
                  {section.label}
                </button>
              ))}
              <div className="pt-4 flex justify-center">
                <div className="w-8 h-8 text-white">↓</div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-3 space-y-6">
            {loopExamples.map((example) => (
              <div key={example.type}>
                <Card className={`border-4 ${example.color} ${example.bgColor}`}>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{example.type} loop</h3>
                    <p className="text-gray-700 mb-4">{example.description}</p>

                    <Card className="bg-white border-2 border-gray-300 p-4 mb-4 font-mono text-sm text-gray-800 whitespace-pre">
                      {example.code}
                    </Card>

                    {example.details.length > 0 && (
                      <ul className="space-y-2">
                        {example.details.map((detail, idx) => (
                          <li key={idx} className="text-gray-800 flex items-start gap-2">
                            <span className="font-bold">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button
            onClick={onNext}
            className="px-8 py-3 bg-teal-700 text-white hover:bg-teal-800 rounded-full font-bold text-lg"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
