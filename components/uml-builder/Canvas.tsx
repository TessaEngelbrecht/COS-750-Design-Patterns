import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HelpCircle } from "lucide-react"
import {
  ReactFlow,
  Controls,
  Background,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  useReactFlow,
} from '@xyflow/react'
import { UMLNodeData, UMLEdgeData } from './types'

interface CanvasProps {
  nodes: Node[]
  edges: Edge[]
  validationErrors: string[]
  selectedEdgeId: string | null
  
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onEdgeClick: (edgeId: string) => void
  onShowHelp: (title: string, content: string) => void
  onValidate: () => void
  onNext: () => void
  onRemoveEdge: (edgeId: string) => void
  onEdgeSelected: (edgeId: string) => void
}

export function Canvas({
  nodes,
  edges,
  validationErrors,
  selectedEdgeId,
  onNodesChange,
  onEdgesChange,
  onEdgeClick,
  onShowHelp,
  onValidate,
  onNext,
  onRemoveEdge,
  onEdgeSelected,
}: CanvasProps) {
  const nodeTypes = {
    umlClass: require('./UMLClassNode').UMLClassNode,
  }

  return (
    <div className="col-span-3">
      <Card className="p-6 border-2 border-teal-700 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-teal-700 font-semibold text-sm">Observer Pattern UML Diagram</p>
            <p className="text-xs text-gray-600">
              Classes: {nodes.length} | Relationships: {edges.length}
            </p>
          </div>
          <button
            onClick={() => onShowHelp(
              "Quick Guide",
              "1. Add classes from sidebar\n2. Click a class to edit\n3. Add attributes and methods\n4. Select relationship type\n5. Click Connect Classes and select two classes\n6. Click an edge to change line style\n7. Click Validate to check"
            )}
            className="text-teal-700 hover:text-teal-600"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 bg-blue-50 rounded-lg border-2 border-teal-700 mb-4">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            onEdgeClick={(event, edge) => {
              onEdgeSelected(edge.id)
              onEdgeClick(edge.id)
            }}
          >
            <Background color="#93C5FD" gap={16} />
            <Controls />
          </ReactFlow>
        </div>

        {edges.length > 0 && (
          <Card className="p-3 mb-4 bg-gray-50 max-h-20 overflow-y-auto">
            <p className="text-xs font-bold text-gray-700 mb-2">Relationships:</p>
            <div className="space-y-1">
              {edges.map(edge => {
                const edgeData = edge.data as UMLEdgeData | undefined
                const sourceNode = nodes.find(n => n.id === edge.source)
                const targetNode = nodes.find(n => n.id === edge.target)
                const sourceClassName = (sourceNode?.data as UMLNodeData)?.className
                const targetClassName = (targetNode?.data as UMLNodeData)?.className

                return (
                  <button
                    key={edge.id}
                    onClick={() => onEdgeSelected(edge.id)}
                    className={`w-full flex items-center justify-between text-xs bg-white p-2 rounded transition-colors hover:bg-blue-100 ${
                      selectedEdgeId === edge.id ? 'ring-2 ring-teal-500' : ''
                    }`}
                  >
                    <span className="font-mono">
                      {sourceClassName} 
                      {" "}{edgeData?.relationType === 'inheritance' ? '◁──' : edgeData?.relationType === 'composition' ? '◆──' : edgeData?.relationType === 'dependency' ? '┄┄>' : '──>'} 
                      {targetClassName}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveEdge(edge.id)
                      }}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      Remove
                    </button>
                  </button>
                )
              })}
            </div>
          </Card>
        )}

        <Card className={`p-3 mb-4 border-2 ${
          validationErrors.length > 0 && !validationErrors[0].startsWith('Perfect')
            ? 'bg-yellow-50 border-yellow-600'
            : validationErrors.length > 0
            ? 'bg-green-50 border-green-600'
            : 'bg-blue-100 border-yellow-600'
        }`}>
          <p className="text-sm font-semibold mb-1">
            {validationErrors.length === 0 
              ? "Click Validate to check your diagram" 
              : validationErrors[0].startsWith('Perfect')
              ? "Success!"
              : "Issues:"}
          </p>
          {validationErrors.length > 0 && (
            <ul className="space-y-0.5 text-gray-700 text-xs">
              {validationErrors.slice(0, 4).map((error, idx) => (
                <li key={idx} className={error.startsWith('Perfect') ? 'text-green-700 font-semibold' : ''}>
                  {error.startsWith('Perfect') ? error : `- ${error}`}
                </li>
              ))}
              {validationErrors.length > 4 && (
                <li className="text-gray-600 italic">and {validationErrors.length - 4} more</li>
              )}
            </ul>
          )}
        </Card>

        <div className="flex gap-4">
          <Button 
            onClick={onValidate}
            className="flex-1 bg-teal-700 text-white hover:bg-teal-800 font-bold py-3 rounded-lg"
          >
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
  )
}
