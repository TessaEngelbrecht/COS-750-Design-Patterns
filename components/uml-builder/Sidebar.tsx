import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronDown, Trash2, Plus } from "lucide-react"
import { 
  CLASS_OPTIONS, 
  RELATIONSHIP_TYPES, 
  EDGE_STYLES, 
  VISIBILITY_SYMBOLS,
  ATTRIBUTE_EXAMPLES,
  METHOD_EXAMPLES,
  CLASS_HELP
} from "./constants"

interface SidebarProps {
  selectedClass: string | null
  classAttributes: Record<string, string[]>
  classMethods: Record<string, string[]>
  attributeInput: string
  methodInput: string
  visibilityAttr: "private" | "public" | "protected"
  visibilityMethod: "public" | "private" | "protected"
  expandedHelp: string | null
  selectedRelationType: string
  connectMode: boolean
  firstNodeId: string | null
  selectedEdgeId: string | null
  
  onAddClass: (name: string, type: string) => void
  onShowHelp: (title: string, content: string) => void
  onAttributeInputChange: (value: string) => void
  onMethodInputChange: (value: string) => void
  onAddAttribute: () => void
  onAddMethod: () => void
  onRemoveAttribute: (className: string, index: number) => void
  onRemoveMethod: (className: string, index: number) => void
  onVisibilityAttrChange: (v: "private" | "public" | "protected") => void
  onVisibilityMethodChange: (v: "public" | "private" | "protected") => void
  onExpandedHelpChange: (value: string | null) => void
  onRelationTypeChange: (type: string) => void
  onToggleConnectMode: () => void
  onEdgeStyleChange: (edgeId: string, style: string) => void
  onClearEdgeSelection: () => void
}

export function Sidebar({
  selectedClass,
  classAttributes,
  classMethods,
  attributeInput,
  methodInput,
  visibilityAttr,
  visibilityMethod,
  expandedHelp,
  selectedRelationType,
  connectMode,
  firstNodeId,
  selectedEdgeId,
  onAddClass,
  onShowHelp,
  onAttributeInputChange,
  onMethodInputChange,
  onAddAttribute,
  onAddMethod,
  onRemoveAttribute,
  onRemoveMethod,
  onVisibilityAttrChange,
  onVisibilityMethodChange,
  onExpandedHelpChange,
  onRelationTypeChange,
  onToggleConnectMode,
  onEdgeStyleChange,
  onClearEdgeSelection,
}: SidebarProps) {
  return (
    <div className="col-span-1">
      <Card className="p-4 bg-teal-700 text-white border-0 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-3">Classes</h3>
        
        {/* Class Buttons */}
        <div className="space-y-2 mb-4">
          {CLASS_OPTIONS.map((cls, index) => (
            <div key={`${cls.name}-${index}`}>
              <button
                onClick={() => onAddClass(cls.name, cls.type)}
                className={`w-full py-2 px-3 rounded-lg font-semibold transition-colors text-sm text-center ${
                  selectedClass === cls.name 
                    ? "bg-white text-teal-700 shadow-lg ring-2 ring-teal-400" 
                    : "bg-teal-600 text-white hover:bg-teal-500"
                }`}
              >
                <div className="font-bold">{cls.name}</div>
                <div className="text-xs opacity-75">add to canvas</div>
              </button>
              {selectedClass === cls.name && (
                <button
                  onClick={() => onShowHelp(`About ${cls.name}`, CLASS_HELP[cls.name])}
                  className="w-full mt-1 py-1 text-xs bg-cyan-400 text-teal-700 hover:bg-cyan-300 rounded font-semibold"
                >
                  Learn More
                </button>
              )}
            </div>
          ))}
        </div>

        {selectedClass && (
          <>
            <div className="mb-3 p-3 bg-teal-800 rounded border-2 border-cyan-400">
              <div className="text-sm font-bold mb-1">Editing: {selectedClass}</div>
              <p className="text-xs text-cyan-300">Click canvas to switch</p>
            </div>

            {/* Attribute Visibility */}
            <div className="mb-4 pb-4 border-b border-teal-600">
              <label className="text-xs font-semibold mb-2 block">Attribute Visibility:</label>
              <div className="flex gap-1">
                {Object.entries(VISIBILITY_SYMBOLS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => onVisibilityAttrChange(key as "private" | "public" | "protected")}
                    className={`flex-1 px-2 py-1 text-xs rounded font-bold transition-colors ${
                      visibilityAttr === key
                        ? 'bg-cyan-400 text-teal-700'
                        : 'bg-teal-600 text-white hover:bg-teal-500'
                    }`}
                    title={label}
                  >
                    {key === 'private' ? '-' : key === 'public' ? '+' : '#'}
                  </button>
                ))}
              </div>
            </div>

            {/* Attributes */}
            <div className="mb-4 pb-4 border-b border-teal-600">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold block">Attributes:</label>
                <button
                  onClick={() => onExpandedHelpChange(expandedHelp === 'attr' ? null : 'attr')}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${expandedHelp === 'attr' ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {expandedHelp === 'attr' && (
                <div className="bg-teal-800 rounded p-2 mb-2 text-xs text-cyan-300 space-y-1">
                  <p className="font-bold">Examples:</p>
                  {ATTRIBUTE_EXAMPLES.map((ex, i) => (
                    <p key={i}>- {ex}</p>
                  ))}
                </div>
              )}
              <div className="space-y-1 mb-2 max-h-24 overflow-y-auto">
                {(classAttributes[selectedClass] || []).map((attr, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-teal-600 p-1.5 rounded text-xs">
                    <span className="font-mono truncate flex-1">{attr}</span>
                    <button
                      onClick={() => onRemoveAttribute(selectedClass, idx)}
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
                  onChange={(e) => onAttributeInputChange(e.target.value)}
                  placeholder="name: Type"
                  className="text-xs bg-white text-gray-800 h-8"
                />
                <Button
                  onClick={onAddAttribute}
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
                {Object.entries(VISIBILITY_SYMBOLS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => onVisibilityMethodChange(key as "public" | "private" | "protected")}
                    className={`flex-1 px-2 py-1 text-xs rounded font-bold transition-colors ${
                      visibilityMethod === key
                        ? 'bg-cyan-400 text-teal-700'
                        : 'bg-teal-600 text-white hover:bg-teal-500'
                    }`}
                    title={label}
                  >
                    {key === 'private' ? '-' : key === 'public' ? '+' : '#'}
                  </button>
                ))}
              </div>
            </div>

            {/* Methods */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold block">Methods:</label>
                <button
                  onClick={() => onExpandedHelpChange(expandedHelp === 'method' ? null : 'method')}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${expandedHelp === 'method' ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {expandedHelp === 'method' && (
                <div className="bg-teal-800 rounded p-2 mb-2 text-xs text-cyan-300 space-y-1">
                  <p className="font-bold">Examples:</p>
                  {METHOD_EXAMPLES.map((ex, i) => (
                    <p key={i}>- {ex}</p>
                  ))}
                </div>
              )}
              <div className="space-y-1 mb-2 max-h-24 overflow-y-auto">
                {(classMethods[selectedClass] || []).map((method, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-teal-600 p-1.5 rounded text-xs">
                    <span className="font-mono truncate flex-1">{method}</span>
                    <button
                      onClick={() => onRemoveMethod(selectedClass, idx)}
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
                  onChange={(e) => onMethodInputChange(e.target.value)}
                  placeholder="methodName()"
                  className="text-xs bg-white text-gray-800 h-8"
                />
                <Button
                  onClick={onAddMethod}
                  size="sm"
                  className="bg-cyan-400 text-teal-700 hover:bg-cyan-300 h-8 px-2"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </>
        )}

        {!selectedClass && (
          <div className="p-3 bg-teal-800 rounded text-center text-xs">
            <p className="text-cyan-300">Click a class or add to canvas</p>
          </div>
        )}

        {/* Relationships */}
        <div className="mt-4 pt-4 border-t border-teal-600">
          <h4 className="text-xs font-bold mb-2">Relationships</h4>
          <div className="space-y-2 mb-3 max-h-20 overflow-y-auto">
            {RELATIONSHIP_TYPES.map(rel => (
              <button
                key={rel.type}
                onClick={() => onRelationTypeChange(rel.type)}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  selectedRelationType === rel.type
                    ? 'bg-cyan-400 text-teal-700 font-bold'
                    : 'bg-teal-600 text-white hover:bg-teal-500'
                }`}
                title={rel.description}
              >
                <div className="font-bold">{rel.name}</div>
                <div className="text-xs opacity-75">{rel.symbol}</div>
              </button>
            ))}
          </div>
          <Button
            onClick={onToggleConnectMode}
            className={`w-full font-bold text-xs py-2 ${
              connectMode 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-cyan-400 hover:bg-cyan-300 text-teal-700'
            }`}
          >
            {connectMode ? 'Cancel' : 'Connect Classes'}
          </Button>
          {connectMode && (
            <div className="mt-2 p-2 bg-teal-800 rounded text-xs text-center">
              <p className="text-yellow-300 font-bold">
                {firstNodeId ? 'Click target class' : 'Click source class'}
              </p>
            </div>
          )}
        </div>

        {/* Edge Routing */}
        {selectedEdgeId && (
          <div className="mt-4 pt-4 border-t border-teal-600">
            <h4 className="text-xs font-bold mb-2">Line Routing</h4>
            <div className="space-y-1">
              {EDGE_STYLES.map(style => (
                <button
                  key={style.type}
                  onClick={() => onEdgeStyleChange(selectedEdgeId, style.type)}
                  className="w-full text-left px-2 py-1.5 rounded text-xs transition-colors bg-teal-600 text-white hover:bg-teal-500 font-semibold"
                >
                  {style.name}
                </button>
              ))}
            </div>
            <Button
              onClick={onClearEdgeSelection}
              className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-1"
            >
              Clear Selection
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
