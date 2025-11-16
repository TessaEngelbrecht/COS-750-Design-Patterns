"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface CheatSheetContentProps {
  onClose?: () => void;
}

const cheatSheetSections = [
  { label: "Bloom" },
  { label: "C++ Loops" },
  { label: "Observer" },
];

// YouTube links per section
const cheatSheetLinks = [
  "https://youtu.be/ayefSTAnCR8?si=CBuv3CmL6WsFptOs", // Bloom taxonomy
  "https://youtu.be/jNl5gJ_xSNQ?si=NG3wnth0QAMS3KVt", // C++ loops explained
  "https://youtu.be/-oLDJ2dbadA?si=Q8F_U5Yfq1yv9HuQ", // The observer pattern
];

const bloomHexagons = [
  { text: "Evaluate", color: "border-cyan-500" },
  { text: "Apply", color: "border-green-500" },
  { text: "Create", color: "border-red-500" },
  { text: "Analyze", color: "border-yellow-500" },
  { text: "Understand", color: "border-purple-700" },
  { text: "Remember", color: "border-pink-500" },
];

const loopExamples = [
  {
    type: "for",
    color: "border-cyan-500",
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
    description:
      "Used when the number of iterations is unknown (depends on a condition).",
    code: 'int i = 0;\nwhile (i < n) {\n  cout << i << "\\n";\n  i++;\n}',
    details: ["Checks condition first.", "Runs zero or more times."],
  },
  {
    type: "do-while",
    color: "border-yellow-600",
    description: "Used when the loop must run at least once.",
    code: 'int i = 0;\ndo {\n  cout << i << "\\n";\n  i++;\n} while (i < n);',
    details: [],
  },
];

const observerContent = {
  what: "One-to-many dependency where a Subject keeps a list of Observers and notifies them automatically when its state changes.",
  roles: [
    "Subject (Observable): attach/subscribe, detach/unsubscribe, notify.",
    "Observer (Listener): update(event/state).",
    "ConcreteSubject / ConcreteObserver: implementations.",
  ],
  variants: [
    "Push vs Pull",
    "Synchronous vs Asynchronous",
    "Typed events / channels (different event kinds; optional payload).",
    "Weak refs to avoid memory leaks (where language supports).",
  ],
  when: [
    "Multiple parts of your app must react to the same change.",
    "You want to decouple the thing that changes from the things that react.",
    "Replacing polling with push notifications.",
  ],
  uml: `Subject o------ (1..*) Observer
  • attach(o)   • update(event)
  • detach(o)   • notify(event)`,
  key: [
    "Don't do work in notifications that could throw and stop other observers; isolate or catch per observer.",
  ],
};

const hexagonStyle: React.CSSProperties = {
  clipPath: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)",
};

export default function CheatSheetContent({ onClose }: CheatSheetContentProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePlayButtonClick = () => {
    window.open(cheatSheetLinks[activeIndex], "_blank");
  };

  return (
    // No fixed height here — the parent Dialog controls scrolling
    <div className="px-6 pb-6 pt-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Sidebar */}
        <div className="col-span-1">
          <Card className="p-4 bg-teal-700 text-white border-0 space-y-2">
            <h3 className="font-bold text-lg mb-4">Cheat Section</h3>

            {cheatSheetSections.map((section, i) => (
              <button
                key={section.label}
                className={`w-full py-2 px-4 rounded font-semibold transition mb-4 ${
                  activeIndex === i
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-gray-900 hover:text-white"
                }`}
                onClick={() => setActiveIndex(i)}
              >
                {section.label}
              </button>
            ))}

            <div className="pt-2 flex justify-center">
              <div className="w-8 h-8 text-white">↓</div>
            </div>

            {/* Play button for current section */}
            <div className="flex flex-col items-center mt-6">
              <button
                onClick={handlePlayButtonClick}
                className="focus:outline-none flex flex-row items-center gap-4"
                aria-label="Play related YouTube video"
              >
                <div className="rounded-full border-2 border-white w-16 h-16 flex items-center justify-center text-white text-2xl font-bold hover:bg-white/10">
                  ▶
                </div>
                <span className="font-bold text-white text-lg">
                  {cheatSheetSections[activeIndex].label}
                </span>
              </button>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="col-span-3 space-y-6">
          {/* Bloom */}
          {activeIndex === 0 && (
            <div className="flex flex-col items-center min-h-[420px]">
              <div className="relative w-96 h-96 flex items-center justify-center">
                {bloomHexagons.map((hex, i) => {
                  const angle = (i / bloomHexagons.length) * 2 * Math.PI;
                  const radius = 200;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  return (
                    <div
                      key={hex.text}
                      style={{
                        ...hexagonStyle,
                        position: "absolute",
                        left: `calc(50% + ${x}px - 64px)`,
                        top: `calc(50% + ${y}px - 64px)`,
                        width: "128px",
                        height: "128px",
                      }}
                      className={`flex items-center justify-center font-bold text-lg border-4 ${hex.color} bg-white text-black mx-2`}
                    >
                      {hex.text}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* C++ Loops */}
          {activeIndex === 1 && (
            <div className="space-y-6">
              {/* Loop selector buttons (static showcase) */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  "for",
                  "while",
                  "do-while",
                  "range-based",
                  "nested",
                  "break/continue",
                ].map((type, idx) => (
                  <div
                    key={type}
                    className={`border-4 ${
                      idx === 0
                        ? "border-cyan-500"
                        : idx === 1
                        ? "border-green-500"
                        : idx === 2
                        ? "border-yellow-600"
                        : idx === 3
                        ? "border-red-500"
                        : idx === 4
                        ? "border-blue-700"
                        : "border-pink-600"
                    } rounded text-center p-1 font-semibold bg-white text-black`}
                  >
                    {type}
                  </div>
                ))}
              </div>

              {/* Loop cards */}
              {loopExamples.map((example) => (
                <Card
                  key={example.type}
                  className={`border-4 ${example.color} bg-white text-black`}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {example.type} loop
                    </h3>
                    <p className="text-gray-700 mb-4">{example.description}</p>

                    <Card className="bg-white border-2 border-gray-300 p-4 mb-4 font-mono text-sm text-gray-800 whitespace-pre">
                      {example.code}
                    </Card>

                    {example.details.length > 0 && (
                      <ul className="space-y-2">
                        {example.details.map((detail, idx) => (
                          <li
                            key={idx}
                            className="text-gray-800 flex items-start gap-2"
                          >
                            <span className="font-bold">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Observer */}
          {activeIndex === 2 && (
            <div className="space-y-6">
              <div>
                <div className="px-4 py-2 rounded-t bg-blue-500 text-white font-bold">
                  What it is
                </div>
                <div className="bg-white border border-blue-500 rounded-b px-6 py-4">
                  {observerContent.what}
                </div>
              </div>

              <div>
                <div className="px-4 py-2 rounded-t bg-green-500 text-white font-bold">
                  Roles
                </div>
                <div className="bg-white border border-green-500 rounded-b px-6 py-4">
                  <ul className="list-disc pl-5">
                    {observerContent.roles.map((role, i) => (
                      <li key={i}>{role}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <div className="px-4 py-2 rounded-t bg-yellow-500 text-white font-bold">
                  Variants & options
                </div>
                <div className="bg-white border border-yellow-500 rounded-b px-6 py-4">
                  <ul className="list-disc pl-5">
                    {observerContent.variants.map((variant, i) => (
                      <li key={i}>{variant}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <div className="px-4 py-2 rounded-t bg-purple-500 text-white font-bold">
                  When to use
                </div>
                <div className="bg-white border border-purple-500 rounded-b px-6 py-4">
                  <ul className="list-disc pl-5">
                    {observerContent.when.map((when, i) => (
                      <li key={i}>{when}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <div className="px-4 py-2 rounded-t bg-pink-500 text-white font-bold">
                  Minimal UML (text)
                </div>
                <div className="bg-white border border-pink-500 rounded-b px-6 py-4 font-mono whitespace-pre">
                  {observerContent.uml}
                </div>
              </div>

              <div>
                <div className="px-4 py-2 rounded-t bg-red-500 text-white font-bold">
                  Key guidelines
                </div>
                <div className="bg-white border border-red-500 rounded-b px-6 py-4">
                  <ul className="list-disc pl-5">
                    {observerContent.key.map((k, i) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="px-8 py-3 bg-teal-700 text-white hover:bg-teal-800 rounded-full font-bold text-lg"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
