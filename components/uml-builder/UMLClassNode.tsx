import { Handle, Position } from '@xyflow/react'
import { UMLNodeData } from './types'

export const UMLClassNode = ({ data }: { data: UMLNodeData }) => {
  const { label, attributes = [], methods = [], classType, handleNodeSelect } = data

  return (
    <div 
      onClick={() => handleNodeSelect(label)}
      className={`bg-blue-100 border-2 rounded-lg shadow-lg min-w-[180px] max-w-[240px] cursor-pointer transition-all hover:shadow-xl ${
        classType === 'abstract' 
          ? 'border-4 border-blue-600' 
          : 'border-blue-800 hover:border-blue-600'
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div className="bg-blue-200 border-b-2 border-blue-800 px-3 py-2 text-center font-bold text-sm">
        {classType === 'interface' && <div className="text-xs text-gray-600 font-normal">interface</div>}
        {classType === 'abstract' && <div className="text-xs text-gray-600 font-normal">abstract</div>}
        <div className={classType === 'abstract' ? 'italic' : ''}>{label}</div>
      </div>

      {attributes && attributes.length > 0 && (
        <div className="border-b-2 border-blue-800 px-3 py-1">
          {attributes.map((attr: string, idx: number) => (
            <div key={idx} className="font-mono text-xs text-gray-800 truncate">{attr}</div>
          ))}
        </div>
      )}

      {methods && methods.length > 0 && (
        <div className="px-3 py-1">
          {methods.map((method: string, idx: number) => (
            <div key={idx} className="font-mono text-xs text-gray-800 truncate">{method}</div>
          ))}
        </div>
      )}

      {(!attributes || attributes.length === 0) && (!methods || methods.length === 0) && (
        <div className="px-3 py-2 text-center text-gray-500 text-xs italic">
          Add details
        </div>
      )}
    </div>
  )
}
