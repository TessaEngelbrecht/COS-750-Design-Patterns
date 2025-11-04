import { Button } from "@/components/ui/button"
import { RELATIONSHIP_TYPES, EDGE_STYLES } from "./constants"

interface RelationshipManagerProps {
  selectedRelationType: string
  onRelationTypeChange: (type: string) => void
  connectMode: boolean
  onToggleConnectMode: () => void
  firstNodeId: string | null
  selectedEdgeId: string | null
  onEdgeStyleChange: (edgeId: string, style: string) => void
  onClearEdgeSelection: () => void
}

export function RelationshipManager({
  selectedRelationType,
  onRelationTypeChange,
  connectMode,
  onToggleConnectMode,
  firstNodeId,
  selectedEdgeId,
  onEdgeStyleChange,
  onClearEdgeSelection,
}: RelationshipManagerProps) {
  return (
    <div className="mt-4 pt-4 border-t border-teal-600">
      <h4 className="text-xs font-bold mb-2">Relationships</h4>
      
      {/* Relationship Types */}
      <div className="space-y-2 mb-3">
        {RELATIONSHIP_TYPES.map(rel => (
          <button
            key={rel.type}
            onClick={() => onRelationTypeChange(rel.type)}
            className={`w-full text-left px-2 py-1 rounded text-xs ${
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

      {/* Connect Button */}
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

      {/* Edge Styling */}
      {selectedEdgeId && (
        <div className="mt-4 pt-4 border-t border-teal-600">
          <h4 className="text-xs font-bold mb-2">Edge Routing</h4>
          <div className="space-y-1">
            {EDGE_STYLES.map(style => (
              <button
                key={style.type}
                onClick={() => onEdgeStyleChange(selectedEdgeId, style.type)}
                className="w-full text-left px-2 py-1.5 rounded text-xs bg-teal-600 text-white hover:bg-teal-500 font-semibold"
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
    </div>
  )
}
