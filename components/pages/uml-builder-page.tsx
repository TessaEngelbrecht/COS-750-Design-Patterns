"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HelpCircle } from "lucide-react"
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Import all UML builder components
import { UMLClassNode } from "@/components/uml-builder/UMLClassNode"
import { ClassSelector } from "@/components/uml-builder/ClassSelector"
import { AttributeMethodEditor } from "@/components/uml-builder/AttributeMethodEditor"
import { RelationshipManager } from "@/components/uml-builder/RelationshipManager"
import { CORRECT_PATTERN } from "@/components/uml-builder/constants"

interface UMLBuilderPageProps {
  onNext: () => void
}

const nodeTypes = {
  umlClass: UMLClassNode,
}

function UMLBuilderContent({ onNext }: UMLBuilderPageProps) {
  const { fitView } = useReactFlow()
  
  // State
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [classAttributes, setClassAttributes] = useState<Record<string, string[]>>({})
  const [classMethods, setClassMethods] = useState<Record<string, string[]>>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [helpDialog, setHelpDialog] = useState({ open: false, title: "", content: "" })
  const [visibilityAttr, setVisibilityAttr] = useState<"private" | "public" | "protected">("private")
  const [visibilityMethod, setVisibilityMethod] = useState<"public" | "private" | "protected">("public")
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedRelationType, setSelectedRelationType] = useState<string>("inheritance")
  const [selectedEdgeStyle, setSelectedEdgeStyle] = useState<string>("smoothstep")
  const [connectMode, setConnectMode] = useState(false)
  const [firstNodeId, setFirstNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const classCounterRef = useRef<Record<string, number>>({})

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  )

  // Handle node selection
  const handleNodeSelect = useCallback((className: string) => {
    if (connectMode) {
      const nodeId = nodes.find(n => n.data.className === className)?.id
      if (!nodeId) return

      if (!firstNodeId) {
        setFirstNodeId(nodeId)
      } else if (firstNodeId !== nodeId) {
        createConnection(firstNodeId, nodeId)
      } else {
        setFirstNodeId(null)
      }
    } else {
      setSelectedClass(className)
    }
  }, [connectMode, firstNodeId, nodes])

  // Create connection
  const createConnection = (sourceId: string, targetId: string) => {
    const sourceNode = nodes.find(n => n.id === sourceId)
    const targetNode = nodes.find(n => n.id === targetId)
    if (!sourceNode || !targetNode) return

    const edgeExists = edges.some(e => e.source === sourceId && e.target === targetId)
    if (edgeExists) return

    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: selectedEdgeStyle,
      animated: selectedRelationType === 'dependency',
      style: {
        strokeWidth: 2,
        stroke: '#1E3A8A',
        strokeDasharray: selectedRelationType === 'dependency' ? '5,5' : 'none',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#1E3A8A',
        width: 30,
        height: 30,
      },
      data: {
        relationType: selectedRelationType,
        sourceClass: sourceNode.data.className,
        targetClass: targetNode.data.className,
      },
    }

    setEdges((eds) => [...eds, newEdge])
    setConnectMode(false)
    setFirstNodeId(null)
    setTimeout(() => fitView({ padding: 0.2 }), 0)
  }

  // Add class to canvas
  const addClassToCanvas = (className: string, classType: string) => {
    const count = (classCounterRef.current[className] || 0) + 1
    classCounterRef.current[className] = count

    const positions = [
      { x: 50, y: 50 }, { x: 300, y: 50 }, { x: 550, y: 50 },
      { x: 50, y: 280 }, { x: 300, y: 280 }, { x: 550, y: 280 },
    ]

    const newNode: Node = {
      id: `${className}-${count}`,
      type: 'umlClass',
      position: positions[nodes.length % positions.length],
      data: {
        label: className,
        attributes: classAttributes[className] || [],
        methods: classMethods[className] || [],
        classType,
        className,
        handleNodeSelect,
      },
      draggable: true,
    }

    setNodes((nds) => [...nds, newNode])
    setSelectedClass(className)
    setTimeout(() => fitView({ padding: 0.2 }), 0)
  }

  // Add attribute with visibility
  const handleAddAttribute = (value: string) => {
    if (!selectedClass) return
    
    let attrValue = value
    if (!attrValue.match(/^[-+#]/)) {
      const symbol = visibilityAttr === 'private' ? '-' : visibilityAttr === 'public' ? '+' : '#'
      attrValue = `${symbol} ${attrValue}`
    }

    setClassAttributes(prev => ({
      ...prev,
      [selectedClass]: [...(prev[selectedClass] || []), attrValue]
    }))

    updateNodes(selectedClass)
  }

  // Add method with visibility
  const handleAddMethod = (value: string) => {
    if (!selectedClass) return
    
    let methodValue = value
    if (!methodValue.match(/^[-+#]/)) {
      const symbol = visibilityMethod === 'private' ? '-' : visibilityMethod === 'public' ? '+' : '#'
      methodValue = `${symbol} ${methodValue}`
    }

    setClassMethods(prev => ({
      ...prev,
      [selectedClass]: [...(prev[selectedClass] || []), methodValue]
    }))

    updateNodes(selectedClass)
  }

  // Update nodes
  const updateNodes = (className: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.data.className === className) {
          return {
            ...node,
            data: {
              ...node.data,
              attributes: classAttributes[className] || [],
              methods: classMethods[className] || [],
              handleNodeSelect,
            },
          }
        }
        return node
      })
    )
  }

  // Remove attribute
  const removeAttribute = (index: number) => {
    if (!selectedClass) return
    setClassAttributes(prev => ({
      ...prev,
      [selectedClass]: prev[selectedClass].filter((_, i) => i !== index)
    }))
    updateNodes(selectedClass)
  }

  // Remove method
  const removeMethod = (index: number) => {
    if (!selectedClass) return
    setClassMethods(prev => ({
      ...prev,
      [selectedClass]: prev[selectedClass].filter((_, i) => i !== index)
    }))
    updateNodes(selectedClass)
  }

  // Update edge style
  const updateEdgeStyle = (edgeId: string, newStyle: string) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId ? { ...edge, type: newStyle } : edge
      )
    )
  }

  // Validate UML
  const validateUML = () => {
    const errors: string[] = []
    const requiredClasses = ["Subject", "Observer", "ConcreteSubject", "ConcreteObserver"]
    const presentClasses = new Set(nodes.map(n => n.data.className))

    requiredClasses.forEach(reqClass => {
      if (!presentClasses.has(reqClass)) {
        errors.push(`Missing class: ${reqClass}`)
      }
    })

    // Validate attributes and methods
    Object.keys(CORRECT_PATTERN.classes).forEach(className => {
      if (presentClasses.has(className)) {
        const expected = CORRECT_PATTERN.classes[className as keyof typeof CORRECT_PATTERN.classes]
        const actual = classAttributes[className] || []

        expected.attributes.forEach(attr => {
          const attrName = attr.split(':')[0].trim().replace(/^[-+#]/, '').toLowerCase()
          if (!actual.some(a => a.toLowerCase().includes(attrName)) && expected.attributes.length > 0) {
            errors.push(`${className} missing: ${attr}`)
          }
        })

        const actualMethods = classMethods[className] || []
        expected.methods.forEach(method => {
          const methodName = method.split('(')[0].trim().replace(/^[-+#]/, '').toLowerCase()
          if (!actualMethods.some(m => m.toLowerCase().includes(methodName))) {
            errors.push(`${className} missing: ${method}`)
          }
        })
      }
    })

    if (errors.length === 0) {
      errors.push("✓ Perfect! Your UML is correct!")
    }

    setValidationErrors(errors)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pb-8 max-w-7xl mx-auto pt-4">
        <div className="grid grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="col-span-1">
            <Card className="p-4 bg-teal-700 text-white border-0 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-3">UML Builder</h3>
              
              <ClassSelector
                selectedClass={selectedClass}
                onAddClass={addClassToCanvas}
                onShowHelp={(title, content) => setHelpDialog({ open: true, title, content })}
              />

              <AttributeMethodEditor
                selectedClass={selectedClass}
                attributes={classAttributes[selectedClass || ''] || []}
                methods={classMethods[selectedClass || ''] || []}
                onAddAttribute={handleAddAttribute}
                onAddMethod={handleAddMethod}
                onRemoveAttribute={removeAttribute}
                onRemoveMethod={removeMethod}
                visibilityAttr={visibilityAttr}
                visibilityMethod={visibilityMethod}
                onVisibilityAttrChange={setVisibilityAttr}
                onVisibilityMethodChange={setVisibilityMethod}
              />

              <RelationshipManager
                selectedRelationType={selectedRelationType}
                onRelationTypeChange={setSelectedRelationType}
                connectMode={connectMode}
                onToggleConnectMode={() => {
                  setConnectMode(!connectMode)
                  setFirstNodeId(null)
                }}
                firstNodeId={firstNodeId}
                selectedEdgeId={selectedEdgeId}
                onEdgeStyleChange={updateEdgeStyle}
                onClearEdgeSelection={() => setSelectedEdgeId(null)}
              />
            </Card>
          </div>

          {/* Canvas */}
          <div className="col-span-3">
            <Card className="p-6 border-2 border-teal-700 h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-teal-700 font-semibold">Observer Pattern UML</p>
                  <p className="text-xs text-gray-600">
                    Classes: {nodes.length} | Relationships: {edges.length}
                  </p>
                </div>
                <button
                  onClick={() => setHelpDialog({
                    open: true,
                    title: "Quick Guide",
                    content: "1. Click classes to add\n2. Add details\n3. Connect classes\n4. Validate"
                  })}
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
                  onEdgeClick={(event, edge) => setSelectedEdgeId(edge.id)}
                  fitView
                >
                  <Background color="#93C5FD" gap={16} />
                  <Controls />
                </ReactFlow>
              </div>

              {/* Validation */}
              <Card className={`p-3 mb-4 border-2 ${
                validationErrors[0]?.startsWith('✓')
                  ? 'bg-green-50 border-green-600'
                  : 'bg-blue-100 border-yellow-600'
              }`}>
                <p className="text-sm font-semibold mb-1">
                  {validationErrors.length === 0 ? "Click 'Validate'" : validationErrors[0]?.startsWith('✓') ? "✓ Success!" : "Issues:"}
                </p>
                {validationErrors.length > 0 && (
                  <ul className="text-xs space-y-1">
                    {validationErrors.slice(0, 4).map((error, idx) => (
                      <li key={idx} className={error.startsWith('✓') ? 'text-green-700 font-bold' : 'text-gray-700'}>
                        {error.startsWith('✓') ? error : `• ${error}`}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <div className="flex gap-4">
                <Button onClick={validateUML} className="flex-1 bg-teal-700 text-white hover:bg-teal-800 font-bold py-3">
                  Validate UML
                </Button>
                <Button onClick={onNext} className="flex-1 bg-teal-700 text-white hover:bg-teal-800 font-bold py-3">
                  Continue
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={helpDialog.open} onOpenChange={(open) => setHelpDialog({ ...helpDialog, open })}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-teal-700">{helpDialog.title}</DialogTitle>
            <DialogDescription className="text-gray-700 whitespace-pre-line text-sm">
              {helpDialog.content}
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setHelpDialog({ ...helpDialog, open: false })}
            className="w-full bg-teal-700 text-white hover:bg-teal-800"
          >
            Got it!
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function UMLBuilderPage({ onNext }: UMLBuilderPageProps) {
  return (
    <ReactFlowProvider>
      <UMLBuilderContent onNext={onNext} />
    </ReactFlowProvider>
  )
}
