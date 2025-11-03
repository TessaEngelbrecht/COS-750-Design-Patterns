"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { HelpCircle } from "lucide-react"

interface UMLBuilderPageProps {
  onNext: () => void
}

const CLASSES = ["Subject", "Observer", "ConcreteSubject", "ConcreteObserver", "Interface", "Interface"]

export function UMLBuilderPage({ onNext }: UMLBuilderPageProps) {
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [attributes, setAttributes] = useState<string[]>([])
  const [methods, setMethods] = useState<string[]>([])
  const [attributeInput, setAttributeInput] = useState("")
  const [methodInput, setMethodInput] = useState("")

  const handleAddAttribute = () => {
    if (attributeInput.trim()) {
      setAttributes([...attributes, attributeInput])
      setAttributeInput("")
    }
  }

  const handleAddMethod = () => {
    if (methodInput.trim()) {
      setMethods([...methods, methodInput])
      setMethodInput("")
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Content */}
      <div className="px-6 pb-8 max-w-7xl mx-auto pt-4">
        <div className="grid grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-1">
            <Card className="p-6 bg-teal-700 text-white border-0">
              <h3 className="text-lg font-bold mb-4">Classes</h3>
              <div className="space-y-2 mb-6">
                {CLASSES.map((cls, index) => (
                  <button
                    key={`${cls}-${index}`}
                    onClick={() => setSelectedClass(cls)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors text-center ${
                      selectedClass === cls ? "bg-white text-teal-700" : "bg-teal-600 text-white hover:bg-teal-500"
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Add attribute to selected:</label>
                  <Input
                    value={attributeInput}
                    onChange={(e) => setAttributeInput(e.target.value)}
                    placeholder="e.g., -state: int"
                    className="mb-2 bg-white text-gray-800"
                  />
                  <Button
                    onClick={handleAddAttribute}
                    className="w-full bg-cyan-400 text-teal-700 hover:bg-cyan-300 font-bold"
                  >
                    Add Attribute
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Add method to selected:</label>
                  <Input
                    value={methodInput}
                    onChange={(e) => setMethodInput(e.target.value)}
                    placeholder="e.g., +notify()"
                    className="mb-2 bg-white text-gray-800"
                  />
                  <Button
                    onClick={handleAddMethod}
                    className="w-full bg-cyan-400 text-teal-700 hover:bg-cyan-300 font-bold"
                  >
                    Add Method
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Canvas Area */}
          <div className="col-span-3">
            <Card className="p-6 border-2 border-teal-700">
              <div className="flex items-start justify-between mb-4">
                <p className="text-teal-700 font-semibold">
                  Build a complete Observer pattern UML diagram. Add classes, attributes, methods and relationships.
                </p>
                <HelpCircle className="w-6 h-6 text-teal-700" />
              </div>

              {/* Canvas */}
              <div className="h-96 bg-blue-100 rounded-lg border-2 border-teal-700 flex items-center justify-center mb-6">
                <div className="space-y-4">
                  <div className="w-40 h-24 bg-blue-200 border-2 border-gray-400 rounded"></div>
                  <div className="flex gap-4 justify-center">
                    <div className="w-40 h-24 bg-blue-200 border-2 border-gray-400 rounded"></div>
                    <div className="w-40 h-24 bg-blue-200 border-2 border-gray-400 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Validation Section */}
              <Card className="p-4 bg-blue-100 border-2 border-yellow-600 mb-6">
                <p className="text-gray-800 font-semibold mb-2">Correct the following:</p>
                <ul className="space-y-1 text-gray-700">
                  <li>- xxxxx</li>
                  <li>- xxxxxxxx</li>
                  <li>- xxxxxxx</li>
                </ul>
              </Card>

              {/* Buttons */}
              <div className="flex gap-4">
                <Button className="flex-1 bg-teal-700 text-white hover:bg-teal-800 font-bold py-3 rounded-lg">
                  Validate UML
                </Button>
                <Button
                  onClick={onNext}
                  className="flex-1 bg-teal-700 text-white hover:bg-teal-800 font-bold py-3 rounded-lg"
                >
                  Continue
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
