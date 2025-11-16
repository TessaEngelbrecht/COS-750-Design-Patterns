"use client"

import type React from "react"

import { useState } from "react"
import { Trash2 } from "lucide-react"

interface UMLClass {
  id: string
  name: string
  x: number
  y: number
  attributes: string[]
  methods: string[]
  type: "Subject" | "Observer" | "ConcreteSubject" | "ConcreteObserver" | "Interface"
}

interface Connection {
  id: string
  fromId: string
  toId: string
  type: "inheritance" | "association" | "realization"
}

export default function UMLBuilder() {
  const [classes, setClasses] = useState<UMLClass[]>([
    { id: "1", name: "Subject", x: 100, y: 100, attributes: [], methods: [], type: "Subject" },
    { id: "2", name: "Observer", x: 400, y: 100, attributes: [], methods: [], type: "Observer" },
    { id: "3", name: "ConcreteSubject", x: 100, y: 300, attributes: [], methods: [], type: "ConcreteSubject" },
    { id: "4", name: "ConcreteObserver", x: 400, y: 300, attributes: [], methods: [], type: "ConcreteObserver" },
  ])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [newAttribute, setNewAttribute] = useState("")
  const [newMethod, setNewMethod] = useState("")
  const [draggedClass, setDraggedClass] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, classId: string) => {
    setDraggedClass(classId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedClass) return

    const canvas = e.currentTarget as HTMLElement
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left - 50
    const y = e.clientY - rect.top - 30

    setClasses(classes.map((cls) => (cls.id === draggedClass ? { ...cls, x: Math.max(0, x), y: Math.max(0, y) } : cls)))
    setDraggedClass(null)
  }

  const addAttribute = () => {
    if (!selectedClass || !newAttribute) return
    setClasses(
      classes.map((cls) =>
        cls.id === selectedClass ? { ...cls, attributes: [...cls.attributes, newAttribute] } : cls,
      ),
    )
    setNewAttribute("")
  }

  const addMethod = () => {
    if (!selectedClass || !newMethod) return
    setClasses(
      classes.map((cls) => (cls.id === selectedClass ? { ...cls, methods: [...cls.methods, newMethod] } : cls)),
    )
    setNewMethod("")
  }

  const deleteClass = (id: string) => {
    setClasses(classes.filter((cls) => cls.id !== id))
    setConnections(connections.filter((conn) => conn.fromId !== id && conn.toId !== id))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Canvas */}
      <div
        className="lg:col-span-2 border-2 border-teal-700 rounded-xl bg-gray-50 relative overflow-auto"
        style={{ minHeight: "500px" }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* SVG for connections */}
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
          {connections.map((conn) => {
            const fromClass = classes.find((c) => c.id === conn.fromId)
            const toClass = classes.find((c) => c.id === conn.toId)
            if (!fromClass || !toClass) return null

            return (
              <line
                key={conn.id}
                x1={fromClass.x + 100}
                y1={fromClass.y + 60}
                x2={toClass.x + 100}
                y2={toClass.y + 60}
                stroke="#0d9488"
                strokeWidth="2"
              />
            )
          })}
        </svg>

        {/* Class boxes */}
        {classes.map((cls) => (
          <div
            key={cls.id}
            draggable
            onDragStart={(e) => handleDragStart(e, cls.id)}
            onClick={() => setSelectedClass(cls.id)}
            className={`absolute w-48 rounded-lg border-2 cursor-move transition-all ${
              selectedClass === cls.id
                ? "border-teal-700 bg-teal-50 shadow-lg"
                : "border-teal-600 bg-white hover:shadow"
            }`}
            style={{ left: `${cls.x}px`, top: `${cls.y}px` }}
          >
            <div className="bg-teal-700 text-white p-3 rounded-t font-bold text-center">{cls.name}</div>
            <div className="p-3 border-t border-teal-200">
              <div className="text-xs font-bold text-teal-700 mb-2">Attributes:</div>
              <div className="mb-3">
                {cls.attributes.map((attr, idx) => (
                  <div key={idx} className="text-xs text-gray-700 ml-2">
                    - {attr}
                  </div>
                ))}
              </div>
              <div className="text-xs font-bold text-teal-700 mb-2">Methods:</div>
              <div>
                {cls.methods.map((method, idx) => (
                  <div key={idx} className="text-xs text-gray-700 ml-2">
                    + {method}()
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Panel */}
      <div className="space-y-6">
        {/* Classes List */}
        <div className="bg-gray-50 rounded-xl p-4 border border-teal-200">
          <h3 className="font-bold text-teal-700 mb-3">Classes</h3>
          <div className="space-y-2">
            {classes.map((cls) => (
              <div
                key={cls.id}
                onClick={() => setSelectedClass(cls.id)}
                className={`p-2 rounded cursor-pointer transition ${
                  selectedClass === cls.id
                    ? "bg-teal-700 text-white"
                    : "bg-white border border-teal-200 hover:border-teal-700"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{cls.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteClass(cls.id)
                    }}
                    className="hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Attribute */}
        {selectedClass && (
          <div className="bg-gray-50 rounded-xl p-4 border border-teal-200">
            <h3 className="font-bold text-teal-700 mb-3">Add Attribute to Selected:</h3>
            <input
              type="text"
              value={newAttribute}
              onChange={(e) => setNewAttribute(e.target.value)}
              placeholder="e.g., observers"
              className="w-full px-3 py-2 border-2 border-teal-700 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-teal-700"
              onKeyDown={(e) => e.key === "Enter" && addAttribute()}
            />
            <button
              onClick={addAttribute}
              className="w-full bg-teal-700 text-white font-bold py-2 rounded hover:bg-teal-800 transition"
            >
              Add Attribute
            </button>
          </div>
        )}

        {/* Add Method */}
        {selectedClass && (
          <div className="bg-gray-50 rounded-xl p-4 border border-teal-200">
            <h3 className="font-bold text-teal-700 mb-3">Add Method to Selected:</h3>
            <input
              type="text"
              value={newMethod}
              onChange={(e) => setNewMethod(e.target.value)}
              placeholder="e.g., notify()"
              className="w-full px-3 py-2 border-2 border-teal-700 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-teal-700"
              onKeyDown={(e) => e.key === "Enter" && addMethod()}
            />
            <button
              onClick={addMethod}
              className="w-full bg-teal-700 text-white font-bold py-2 rounded hover:bg-teal-800 transition"
            >
              Add Method
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
