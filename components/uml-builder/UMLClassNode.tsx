import { Handle, Position } from '@xyflow/react'

interface UMLClassNodeProps {
  data: {
    label: string
    attributes: string[]
    methods: string[]
    classType: string
    handleNodeSelect: (className: string) => void
  }
  isSelected?: boolean
}

export function UMLClassNode({ data, isSelected }: UMLClassNodeProps) {
  const { label, attributes = [], methods = [], classType, handleNodeSelect } = data

  return (
    <div 
      onClick={() => handleNodeSelect?.(label)}
      className={`bg-blue-100 border-2 rounded-lg shadow-lg min-w-[180px] max-w-[240px] cursor-pointer transition-all hover:shadow-xl ${
        isSelected 
          ? 'border-4 border-green-500 ring-2 ring-green-400' 
          : 'border-blue-800 hover:border-blue-600'
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {/* Header */}
      <div className="bg-blue-200 border-b-2 border-blue-800 px-3 py-2 text-center font-bold text-sm">
        {classType === 'interface' && <div className="text-xs text-gray-600 font-normal">«interface»</div>}
        {classType === 'abstract' && <div className="text-xs text-gray-600 font-normal">«abstract»</div>}
        <div className={classType === 'abstract' ? 'italic' : ''}>{label}</div>
      </div>

      {/* Attributes */}
      {attributes.length > 0 && (
        <div className="border-b-2 border-blue-800 px-3 py-1">
          {attributes.map((attr, idx) => (
            <div key={idx} className="font-mono text-xs text-gray-800 truncate">{attr}</div>
          ))}
        </div>
      )}

      {/* Methods */}
      {methods.length > 0 && (
        <div className="px-3 py-1">
          {methods.map((method, idx) => (
            <div key={idx} className="font-mono text-xs text-gray-800 truncate">{method}</div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {attributes.length === 0 && methods.length === 0 && (
        <div className="px-3 py-2 text-center text-gray-500 text-xs italic">
          Add details
        </div>
      )}
    </div>
  )
}
