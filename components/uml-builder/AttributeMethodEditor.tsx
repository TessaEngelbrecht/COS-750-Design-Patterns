import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, ChevronDown } from "lucide-react"
import { ATTRIBUTE_EXAMPLES, METHOD_EXAMPLES } from "./constants"

interface AttributeMethodEditorProps {
  selectedClass: string | null
  attributes: string[]
  methods: string[]
  onAddAttribute: (value: string) => void
  onAddMethod: (value: string) => void
  onRemoveAttribute: (index: number) => void
  onRemoveMethod: (index: number) => void
  visibilityAttr: "private" | "public" | "protected"
  visibilityMethod: "public" | "private" | "protected"
  onVisibilityAttrChange: (v: "private" | "public" | "protected") => void
  onVisibilityMethodChange: (v: "public" | "private" | "protected") => void
}

export function AttributeMethodEditor({
  selectedClass,
  attributes,
  methods,
  onAddAttribute,
  onAddMethod,
  onRemoveAttribute,
  onRemoveMethod,
  visibilityAttr,
  visibilityMethod,
  onVisibilityAttrChange,
  onVisibilityMethodChange,
}: AttributeMethodEditorProps) {
  const [attributeInput, setAttributeInput] = useState("")
  const [methodInput, setMethodInput] = useState("")
  const [showAttrExamples, setShowAttrExamples] = useState(false)
  const [showMethodExamples, setShowMethodExamples] = useState(false)

  const handleAddAttr = () => {
    if (attributeInput.trim()) {
      onAddAttribute(attributeInput.trim())
      setAttributeInput("")
    }
  }

  const handleAddMethod = () => {
    if (methodInput.trim()) {
      onAddMethod(methodInput.trim())
      setMethodInput("")
    }
  }

  if (!selectedClass) {
    return (
      <div className="p-3 bg-teal-800 rounded text-center text-xs">
        <p className="text-cyan-300">Select a class to edit</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 p-3 bg-teal-800 rounded border-2 border-cyan-400">
        <div className="text-sm font-bold">Editing: {selectedClass}</div>
      </div>

      {/* Attribute Visibility */}
      <div className="mb-4 pb-4 border-b border-teal-600">
        <label className="text-xs font-semibold mb-2 block">Attribute Visibility:</label>
        <div className="flex gap-1">
          {(['private', 'public', 'protected'] as const).map((vis) => (
            <button
              key={vis}
              onClick={() => onVisibilityAttrChange(vis)}
              className={`flex-1 px-2 py-1 text-xs rounded font-bold ${
                visibilityAttr === vis
                  ? 'bg-cyan-400 text-teal-700'
                  : 'bg-teal-600 text-white hover:bg-teal-500'
              }`}
            >
              {vis === 'private' ? '-' : vis === 'public' ? '+' : '#'}
            </button>
          ))}
        </div>
      </div>

      {/* Attributes */}
      <div className="mb-4 pb-4 border-b border-teal-600">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold">Attributes:</label>
          <button
            onClick={() => setShowAttrExamples(!showAttrExamples)}
            className="text-cyan-400 hover:text-cyan-300"
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${showAttrExamples ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {showAttrExamples && (
          <div className="bg-teal-800 rounded p-2 mb-2 text-xs text-cyan-300">
            {ATTRIBUTE_EXAMPLES.map((ex, i) => (
              <div key={i}>• {ex}</div>
            ))}
          </div>
        )}
        <div className="space-y-1 mb-2 max-h-24 overflow-y-auto">
          {attributes.map((attr, idx) => (
            <div key={idx} className="flex items-center justify-between bg-teal-600 p-1.5 rounded text-xs">
              <span className="font-mono truncate flex-1">{attr}</span>
              <button
                onClick={() => onRemoveAttribute(idx)}
                className="ml-1 text-red-300 hover:text-red-100"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          <Input
            value={attributeInput}
            onChange={(e) => setAttributeInput(e.target.value)}
            placeholder="name: Type"
            className="text-xs bg-white text-gray-800 h-8"
            onKeyPress={(e) => e.key === 'Enter' && handleAddAttr()}
          />
          <Button
            onClick={handleAddAttr}
            size="sm"
            className="bg-cyan-400 text-teal-700 hover:bg-cyan-300 h-8 px-2"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Method Visibility */}
      <div className="mb-4 pb-4 border-b border-teal-600">
        <label className="text-xs font-semibold mb-2 block">Method Visibility:</label>
        <div className="flex gap-1">
          {(['private', 'public', 'protected'] as const).map((vis) => (
            <button
              key={vis}
              onClick={() => onVisibilityMethodChange(vis)}
              className={`flex-1 px-2 py-1 text-xs rounded font-bold ${
                visibilityMethod === vis
                  ? 'bg-cyan-400 text-teal-700'
                  : 'bg-teal-600 text-white hover:bg-teal-500'
              }`}
            >
              {vis === 'private' ? '-' : vis === 'public' ? '+' : '#'}
            </button>
          ))}
        </div>
      </div>

      {/* Methods */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold">Methods:</label>
          <button
            onClick={() => setShowMethodExamples(!showMethodExamples)}
            className="text-cyan-400 hover:text-cyan-300"
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${showMethodExamples ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {showMethodExamples && (
          <div className="bg-teal-800 rounded p-2 mb-2 text-xs text-cyan-300">
            {METHOD_EXAMPLES.map((ex, i) => (
              <div key={i}>• {ex}</div>
            ))}
          </div>
        )}
        <div className="space-y-1 mb-2 max-h-24 overflow-y-auto">
          {methods.map((method, idx) => (
            <div key={idx} className="flex items-center justify-between bg-teal-600 p-1.5 rounded text-xs">
              <span className="font-mono truncate flex-1">{method}</span>
              <button
                onClick={() => onRemoveMethod(idx)}
                className="ml-1 text-red-300 hover:text-red-100"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          <Input
            value={methodInput}
            onChange={(e) => setMethodInput(e.target.value)}
            placeholder="methodName()"
            className="text-xs bg-white text-gray-800 h-8"
            onKeyPress={(e) => e.key === 'Enter' && handleAddMethod()}
          />
          <Button
            onClick={handleAddMethod}
            size="sm"
            className="bg-cyan-400 text-teal-700 hover:bg-cyan-300 h-8 px-2"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
