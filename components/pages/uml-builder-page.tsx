"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { HelpCircle, Info, Trash2, Plus, ChevronDown } from "lucide-react"
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MarkerType,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useXYPack,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface UMLBuilderPageProps {
  onNext: () => void
}

const CORRECT_PATTERN = {
  classes: {
    Subject: {
      attributes: ["- observerList: Observer*"],
      methods: ["+ attach(Observer)", "+ detach(Observer)", "+ notify()"],
      type: "abstract"
    },
    Observer: {
      attributes: [],
      methods: ["+ update()"],
      type: "interface"
    },
    ConcreteSubject: {
      attributes: ["- subjectState: State*"],
      methods: ["+ getState(): State*", "+ setState()"],
      type: "concrete"
    },
    ConcreteObserver: {
      attributes: ["- observerState: State*", "- subject: ConcreteSubject*"],
      methods: ["+ update()"],
      type: "concrete"
    }
  },
  relationships: [
    { from: "ConcreteSubject", to: "Subject", type: "inheritance" },
    { from: "ConcreteObserver", to: "Observer", type: "inheritance" },
    { from: "Subject", to: "Observer", type: "composition" },
    { from: "ConcreteObserver", to: "ConcreteSubject", type: "association" }
  ]
}

const CLASS_OPTIONS = [
  { name: "Subject", type: "abstract" },
  { name: "Observer", type: "interface" },
  { name: "ConcreteSubject", type: "concrete" },
  { name: "ConcreteObserver", type: "concrete" }
]

const RELATIONSHIP_TYPES = [
  { name: "Inheritance", symbol: "◁──", type: "inheritance", description: "Use when a class extends another class (is-a relationship)" },
  { name: "Composition", symbol: "◆──", type: "composition", description: "Use when a class contains another class (has-a strong relationship)" },
  { name: "Association", symbol: "───>", type: "association", description: "Use for general relationships between classes" },
  { name: "Dependency", symbol: "┄┄>", type: "dependency", description: "Use when one class depends on another but doesn't own it" }
]

const EDGE_STYLES = [
  { name: "Smooth", type: "smoothstep" },
  { name: "Straight", type: "straight" },
  { name: "Bezier", type: "default" },
  { name: "Step", type: "step" }
]

const VISIBILITY_SYMBOLS = {
  private: "- (private)",
  public: "+ (public)",
  protected: "# (protected)"
}

const ATTRIBUTE_EXAMPLES = [
  "- name: String",
  "- count: int",
  "- items: List<Item>",
  "- observerList: Observer*",
  "- state: State*",
  "+ publicField: double"
]

const METHOD_EXAMPLES = [
  "+ update()",
  "+ notify()",
  "+ getState(): State*",
  "+ setState(state: State)",
  "- privateMethod(): void",
  "# protectedMethod(param: String): boolean"
]

// Custom node component for UML classes with Handle
const UMLClassNode = ({ data, isSelected }: any) => {
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
      {/* Handles for connections - all 4 sides */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {/* Class name header */}
      <div className="bg-blue-200 border-b-2 border-blue-800 px-3 py-2 text-center font-bold text-sm">
        {classType === 'interface' && <div className="text-xs text-gray-600 font-normal">«interface»</div>}
        {classType === 'abstract' && <div className="text-xs text-gray-600 font-normal">«abstract»</div>}
        <div className={classType === 'abstract' ? 'italic' : ''}>{label}</div>
      </div>

      {/* Attributes section */}
      {attributes && attributes.length > 0 && (
        <div className="border-b-2 border-blue-800 px-3 py-1">
          {attributes.map((attr: string, idx: number) => (
            <div key={idx} className="font-mono text-xs text-gray-800 truncate">{attr}</div>
          ))}
        </div>
      )}

      {/* Methods section */}
      {methods && methods.length > 0 && (
        <div className="px-3 py-1">
          {methods.map((method: string, idx: number) => (
            <div key={idx} className="font-mono text-xs text-gray-800 truncate">{method}</div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {(!attributes || attributes.length === 0) && (!methods || methods.length === 0) && (
        <div className="px-3 py-2 text-center text-gray-500 text-xs italic">
          Add details
        </div>
      )}
    </div>
  )
}

const nodeTypes = {
  umlClass: UMLClassNode,
}

// Internal component that uses useReactFlow - MUST be inside ReactFlowProvider
function UMLBuilderContent({ onNext }: UMLBuilderPageProps) {
  const { fitView } = useReactFlow()
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [classAttributes, setClassAttributes] = useState<Record<string, string[]>>({})
  const [classMethods, setClassMethods] = useState<Record<string, string[]>>({})
  const [attributeInput, setAttributeInput] = useState("")
  const [methodInput, setMethodInput] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [helpDialog, setHelpDialog] = useState<{open: boolean, content: string, title: string}>({
    open: false,
    content: "",
    title: ""
  })
  const [visibilityAttr, setVisibilityAttr] = useState<"private" | "public" | "protected">("private")
  const [visibilityMethod, setVisibilityMethod] = useState<"public" | "private" | "protected">("public")
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null)
  const [selectedEdgeStyle, setSelectedEdgeStyle] = useState<string>("smoothstep")
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedRelationType, setSelectedRelationType] = useState<string>("inheritance")
  const [connectMode, setConnectMode] = useState(false)
  const [firstNodeId, setFirstNodeId] = useState<string | null>(null)
  const classCounterRef = useRef<Record<string, number>>({})

  // Use refs to capture current input values at time of adding
  const attributeInputRef = useRef<string>("")
  const methodInputRef = useRef<string>("")

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  )

  // Handle node click to select class for editing
  const handleNodeSelect = useCallback((className: string) => {
    if (connectMode) {
      const nodeId = nodes.find(n => n.data.className === className)?.id
      if (!nodeId) return

      if (!firstNodeId) {
        setFirstNodeId(nodeId)
      } else if (firstNodeId !== nodeId) {
        createConnection(firstNodeId, nodeId)
        setFirstNodeId(null)
      } else {
        setFirstNodeId(null)
      }
    } else {
      setSelectedClass(className)
    }
  }, [connectMode, firstNodeId, nodes])

  // Create a connection between two nodes
  const createConnection = (sourceId: string, targetId: string) => {
    const sourceNode = nodes.find(n => n.id === sourceId)
    const targetNode = nodes.find(n => n.id === targetId)

    if (!sourceNode || !targetNode) return

    const edgeExists = edges.some(
      e => e.source === sourceId && e.target === targetId
    )

    if (edgeExists) {
      showHelp("Connection Exists", "These classes are already connected!")
      return
    }

    const newEdgeId = `edge-${sourceId}-${targetId}-${Date.now()}`
    
    const newEdge: Edge = {
      id: newEdgeId,
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
        edgeStyle: selectedEdgeStyle,
      },
    }

    setEdges((eds) => [...eds, newEdge])
    setConnectMode(false)
    setFirstNodeId(null)
    
    setTimeout(() => fitView({ padding: 0.2 }), 0)
    
    showHelp("Connected!", `${sourceNode.data.className} connected to ${targetNode.data.className}\n\nClick an edge to change its routing style!`)
  }

  // Add class to canvas with instant click
  const addClassToCanvas = (className: string, classType: string) => {
    const count = (classCounterRef.current[className] || 0) + 1
    classCounterRef.current[className] = count

    const newId = `${className}-${count}`
    const positions = [
      { x: 50, y: 50 },
      { x: 300, y: 50 },
      { x: 550, y: 50 },
      { x: 50, y: 280 },
      { x: 300, y: 280 },
      { x: 550, y: 280 },
    ]
    
    const position = positions[nodes.length % positions.length]

    const newNode: Node = {
      id: newId,
      type: 'umlClass',
      position,
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

  // Update edge style
  const updateEdgeStyle = (edgeId: string, newStyle: string) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            type: newStyle,
            data: {
              ...edge.data,
              edgeStyle: newStyle,
            }
          }
        }
        return edge
      })
    )
  }

  // Update nodes when class data changes
  const updateNodesData = (className: string) => {
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

  // Add attribute
  const handleAddAttribute = () => {
    if (!selectedClass) {
      showHelp(
        "Select a Class First",
        "Click a class name on the left OR click a class on the canvas to select it."
      )
      return
    }

    let currentAttrValue = attributeInputRef.current.trim()

    if (!currentAttrValue) {
      showHelp(
        "Enter an Attribute",
        "Please enter an attribute name and type.\n\nExamples:\nname: String\ncount: int\nitems: List<Item>\n\nVisibility will be added automatically!"
      )
      return
    }

    if (!currentAttrValue.match(/^[-+#]/)) {
      currentAttrValue = `${visibilityAttr === 'private' ? '-' : visibilityAttr === 'public' ? '+' : '#'} ${currentAttrValue}`
    }

    setClassAttributes(prev => {
      const existing = prev[selectedClass] || []
      const updated = [...existing, currentAttrValue]
      
      setNodes((nds) =>
        nds.map((node) => {
          if (node.data.className === selectedClass) {
            return {
              ...node,
              data: {
                ...node.data,
                attributes: updated,
                handleNodeSelect,
              },
            }
          }
          return node
        })
      )
      
      return {
        ...prev,
        [selectedClass]: updated
      }
    })

    attributeInputRef.current = ""
    setAttributeInput("")
  }

  // Add method
  const handleAddMethod = () => {
    if (!selectedClass) {
      showHelp(
        "Select a Class First",
        "Click a class name on the left OR click a class on the canvas to select it."
      )
      return
    }

    let currentMethodValue = methodInputRef.current.trim()

    if (!currentMethodValue) {
      showHelp(
        "Enter a Method",
        "Please enter a method name with parentheses.\n\nExamples:\nupdate()\ngetState(): State*\nsetState(state: State)\n\nVisibility will be added automatically!"
      )
      return
    }

    if (!currentMethodValue.match(/^[-+#]/)) {
      currentMethodValue = `${visibilityMethod === 'private' ? '-' : visibilityMethod === 'public' ? '+' : '#'} ${currentMethodValue}`
    }

    setClassMethods(prev => {
      const existing = prev[selectedClass] || []
      const updated = [...existing, currentMethodValue]

      setNodes((nds) =>
        nds.map((node) => {
          if (node.data.className === selectedClass) {
            return {
              ...node,
              data: {
                ...node.data,
                methods: updated,
                handleNodeSelect,
              },
            }
          }
          return node
        })
      )

      return {
        ...prev,
        [selectedClass]: updated
      }
    })

    methodInputRef.current = ""
    setMethodInput("")
  }

  // Remove an attribute
  const removeAttribute = (className: string, index: number) => {
    setClassAttributes(prev => {
      const updated = {
        ...prev,
        [className]: prev[className].filter((_, i) => i !== index)
      }

      setNodes((nds) =>
        nds.map((node) => {
          if (node.data.className === className) {
            return {
              ...node,
              data: {
                ...node.data,
                attributes: updated[className],
                handleNodeSelect,
              },
            }
          }
          return node
        })
      )

      return updated
    })
  }

  // Remove a method
  const removeMethod = (className: string, index: number) => {
    setClassMethods(prev => {
      const updated = {
        ...prev,
        [className]: prev[className].filter((_, i) => i !== index)
      }

      setNodes((nds) =>
        nds.map((node) => {
          if (node.data.className === className) {
            return {
              ...node,
              data: {
                ...node.data,
                methods: updated[className],
                handleNodeSelect,
              },
            }
          }
          return node
        })
      )

      return updated
    })
  }

  // Start/stop connection mode
  const toggleConnectionMode = () => {
    if (connectMode) {
      setConnectMode(false)
      setFirstNodeId(null)
    } else {
      setConnectMode(true)
      setFirstNodeId(null)
    }
  }

  // Remove an edge
  const removeEdge = (edgeId: string) => {
    setEdges((eds) => eds.filter(e => e.id !== edgeId))
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

    Object.keys(CORRECT_PATTERN.classes).forEach(className => {
      if (presentClasses.has(className)) {
        const expected = CORRECT_PATTERN.classes[className as keyof typeof CORRECT_PATTERN.classes]
        const actual = classAttributes[className] || []

        expected.attributes.forEach(attr => {
          const attrName = attr.split(':')[0].trim().replace(/^[-+#]/, '').toLowerCase()
          const found = actual.some(a => a.toLowerCase().includes(attrName))
          if (!found && expected.attributes.length > 0) {
            errors.push(`${className} missing attribute: ${attr}`)
          }
        })

        const actualMethods = classMethods[className] || []
        expected.methods.forEach(method => {
          const methodName = method.split('(')[0].trim().replace(/^[-+#]/, '').toLowerCase()
          const found = actualMethods.some(m => m.toLowerCase().includes(methodName))
          if (!found) {
            errors.push(`${className} missing method: ${method}`)
          }
        })
      }
    })

    const requiredRelationships = CORRECT_PATTERN.relationships
    requiredRelationships.forEach(rel => {
      const found = edges.some(e => {
        const sourceClass = nodes.find(n => n.id === e.source)?.data.className
        const targetClass = nodes.find(n => n.id === e.target)?.data.className
        return sourceClass === rel.from && targetClass === rel.to
      })
      if (!found) {
        errors.push(`Missing relationship: ${rel.from} → ${rel.to}`)
      }
    })

    if (errors.length === 0) {
      errors.push("✓ Perfect! Your Observer pattern UML is correct!")
    }

    setValidationErrors(errors)
  }

  const showHelp = (title: string, content: string) => {
    setHelpDialog({ open: true, title, content })
  }

  const getClassHelp = (className: string) => {
    const helpContent: Record<string, string> = {
      "Subject": "The Subject is the abstract class that maintains a list of observers and notifies them of state changes.\n\nRequired:\n• observerList: Observer* (attribute to store list of observers)\n• attach(Observer) (method to add an observer)\n• detach(Observer) (method to remove an observer)\n• notify() (method to alert all observers of changes)\n\nRole: Acts as the central hub that tracks all observers and triggers their updates when state changes.",
      
      "Observer": "The Observer is an interface that defines the update contract.\n\nRequired:\n• update() method (called when subject's state changes)\n\nRole: Provides the contract that all concrete observers must follow. Any class implementing this interface agrees to have an update() method.",
      
      "ConcreteSubject": "ConcreteSubject extends Subject and maintains the actual state.\n\nRequired:\n• subjectState: State* (stores the actual state data)\n• getState(): State* (allows observers to read the current state)\n• setState() (updates the state and triggers notifications)\n\nRole: Holds the real data and triggers observer notifications when that data changes.",
      
      "ConcreteObserver": "ConcreteObserver implements the Observer interface.\n\nRequired:\n• observerState: State* (observer's copy of the state)\n• subject: ConcreteSubject* (reference to the subject being observed)\n• update() (syncs observer's state with subject's state)\n\nRole: Listens to the subject and updates itself whenever the subject changes."
    }

    return helpContent[className] || "Select a class to see helpful information."
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pb-8 max-w-7xl mx-auto pt-4">
        <div className="grid grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-1">
            <Card className="p-4 bg-teal-700 text-white border-0 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-3">Classes</h3>
              
              {/* Class Buttons */}
              <div className="space-y-2 mb-4">
                {CLASS_OPTIONS.map((cls, index) => (
                  <div key={`${cls.name}-${index}`}>
                    <button
                      onClick={() => addClassToCanvas(cls.name, cls.type)}
                      className={`w-full py-2 px-3 rounded-lg font-semibold transition-colors text-sm text-center ${
                        selectedClass === cls.name 
                          ? "bg-white text-teal-700 shadow-lg ring-2 ring-teal-400" 
                          : "bg-teal-600 text-white hover:bg-teal-500"
                      }`}
                      title={`Click to add ${cls.name} to canvas`}
                    >
                      <div className="font-bold">{cls.name}</div>
                      <div className="text-xs opacity-75">add to canvas</div>
                    </button>
                    {selectedClass === cls.name && (
                      <button
                        onClick={() => showHelp(`About ${cls.name}`, getClassHelp(cls.name))}
                        className="w-full mt-1 py-1 text-xs bg-cyan-400 text-teal-700 hover:bg-cyan-300 rounded font-semibold"
                      >
                        Details
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

                  {/* Visibility Selector for Attributes */}
                  <div className="mb-4 pb-4 border-b border-teal-600">
                    <label className="text-xs font-semibold mb-2 block">Attribute Visibility:</label>
                    <div className="flex gap-1">
                      {Object.entries(VISIBILITY_SYMBOLS).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setVisibilityAttr(key as "private" | "public" | "protected")}
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

                  {/* Attributes Section */}
                  <div className="mb-4 pb-4 border-b border-teal-600">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold block">Attributes:</label>
                      <button
                        onClick={() => setExpandedHelp(expandedHelp === 'attr' ? null : 'attr')}
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        <ChevronDown className={`w-3 h-3 transition-transform ${expandedHelp === 'attr' ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    {expandedHelp === 'attr' && (
                      <div className="bg-teal-800 rounded p-2 mb-2 text-xs text-cyan-300 space-y-1">
                        <p className="font-bold">Examples:</p>
                        {ATTRIBUTE_EXAMPLES.map((ex, i) => (
                          <p key={i}>• {ex}</p>
                        ))}
                      </div>
                    )}
                    <div className="space-y-1 mb-2 max-h-24 overflow-y-auto">
                      {(classAttributes[selectedClass] || []).map((attr, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-teal-600 p-1.5 rounded text-xs">
                          <span className="font-mono truncate flex-1">{attr}</span>
                          <button
                            onClick={() => removeAttribute(selectedClass, idx)}
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
                        onChange={(e) => {
                          setAttributeInput(e.target.value)
                          attributeInputRef.current = e.target.value
                        }}
                        placeholder="name: Type"
                        className="text-xs bg-white text-gray-800 h-8"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddAttribute()}
                      />
                      <Button
                        onClick={handleAddAttribute}
                        size="sm"
                        className="bg-cyan-400 text-teal-700 hover:bg-cyan-300 h-8 px-2"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Visibility Selector for Methods */}
                  <div className="mb-4 pb-4 border-b border-teal-600">
                    <label className="text-xs font-semibold mb-2 block">Method Visibility:</label>
                    <div className="flex gap-1">
                      {Object.entries(VISIBILITY_SYMBOLS).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setVisibilityMethod(key as "public" | "private" | "protected")}
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

                  {/* Methods Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold block">Methods:</label>
                      <button
                        onClick={() => setExpandedHelp(expandedHelp === 'method' ? null : 'method')}
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        <ChevronDown className={`w-3 h-3 transition-transform ${expandedHelp === 'method' ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    {expandedHelp === 'method' && (
                      <div className="bg-teal-800 rounded p-2 mb-2 text-xs text-cyan-300 space-y-1">
                        <p className="font-bold">Examples:</p>
                        {METHOD_EXAMPLES.map((ex, i) => (
                          <p key={i}>• {ex}</p>
                        ))}
                      </div>
                    )}
                    <div className="space-y-1 mb-2 max-h-24 overflow-y-auto">
                      {(classMethods[selectedClass] || []).map((method, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-teal-600 p-1.5 rounded text-xs">
                          <span className="font-mono truncate flex-1">{method}</span>
                          <button
                            onClick={() => removeMethod(selectedClass, idx)}
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
                        onChange={(e) => {
                          setMethodInput(e.target.value)
                          methodInputRef.current = e.target.value
                        }}
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
                </>
              )}

              {!selectedClass && (
                <div className="p-3 bg-teal-800 rounded text-center text-xs">
                  <p className="text-cyan-300">
                    Click a class or add to canvas
                  </p>
                </div>
              )}

              {/* Relationships Section */}
              <div className="mt-4 pt-4 border-t border-teal-600">
                <h4 className="text-xs font-bold mb-2">Relationships</h4>
                <div className="space-y-2 mb-3 max-h-20 overflow-y-auto">
                  {RELATIONSHIP_TYPES.map(rel => (
                    <button
                      key={rel.type}
                      onClick={() => setSelectedRelationType(rel.type)}
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
                  onClick={toggleConnectionMode}
                  className={`w-full font-bold text-xs py-2 ${
                    connectMode 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-cyan-400 hover:bg-cyan-300 text-teal-700'
                  }`}
                >
                  {connectMode ? 'Cancel' : 'Connect'}
                </Button>
                {connectMode && (
                  <div className="mt-2 p-2 bg-teal-800 rounded text-xs text-center">
                    <p className="text-yellow-300 font-bold">
                      {firstNodeId ? 'Click target' : 'Click source'}
                    </p>
                  </div>
                )}
              </div>

              {/* Edge Routing Styles */}
              {selectedEdgeId && (
                <div className="mt-4 pt-4 border-t border-teal-600">
                  <h4 className="text-xs font-bold mb-2">How should the lines connect?</h4>
                  <div className="space-y-1">
                    {EDGE_STYLES.map(style => (
                      <button
                        key={style.type}
                        onClick={() => updateEdgeStyle(selectedEdgeId, style.type)}
                        className="w-full text-left px-2 py-1.5 rounded text-xs transition-colors bg-teal-600 text-white hover:bg-teal-500 font-semibold"
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                  <Button
                    onClick={() => setSelectedEdgeId(null)}
                    className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-1"
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Canvas Area */}
          <div className="col-span-3">
            <Card className="p-6 border-2 border-teal-700 h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-teal-700 font-semibold text-sm">Observer Pattern UML Diagram</p>
                  <p className="text-xs text-gray-600">
                    Classes: {nodes.length} | Relationships: {edges.length}
                    {connectMode && <span className="text-yellow-600 ml-2">🔗 CONNECT</span>}
                  </p>
                </div>
                <button
                  onClick={() => showHelp(
                    "Quick Guide",
                    "1. Add classes from sidebar\n2. Click a class to edit\n3. Add attributes/methods\n4. Select relationship type\n5. Click 'Connect' and click classes\n6. Click an edge to change routing\n7. Click 'Validate' to check"
                  )}
                  className="text-teal-700 hover:text-teal-600"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>

              {/* React Flow Canvas */}
              <div className="flex-1 bg-blue-50 rounded-lg border-2 border-teal-700 mb-4">
                <ReactFlow
                  nodes={nodes.map(node => ({
                    ...node,
                    data: {
                      ...node.data,
                      handleNodeSelect,
                    }
                  }))}
                  edges={edges.map(edge => ({
                    ...edge,
                    selected: edge.id === selectedEdgeId,
                    onClick: () => setSelectedEdgeId(edge.id)
                  }))}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  nodeTypes={nodeTypes}
                  fitView
                  onEdgeClick={(event, edge) => {
                    setSelectedEdgeId(edge.id)
                    showHelp("Edge Selected", `Click 'Edge Routing' options on the left to change how this connection line flows!\n\nRoutings:\n• Smooth - curved lines\n• Straight - direct lines\n• Bezier - smooth curves\n• Step - right-angle turns`)
                  }}
                >
                  <Background color="#93C5FD" gap={16} />
                  <Controls />
                </ReactFlow>
              </div>

              {/* Edges Info */}
              {edges.length > 0 && (
                <Card className="p-3 mb-4 bg-gray-50 max-h-20 overflow-y-auto">
                  <p className="text-xs font-bold text-gray-700 mb-2">Relationships (Click to edit routing):</p>
                  <div className="space-y-1">
                    {edges.map(edge => (
                      <button
                        key={edge.id}
                        onClick={() => {
                          setSelectedEdgeId(edge.id)
                          showHelp("Edge Selected", "Change its routing style using options on the left!")
                        }}
                        className={`w-full flex items-center justify-between text-xs bg-white p-2 rounded transition-colors hover:bg-blue-100 ${
                          selectedEdgeId === edge.id ? 'ring-2 ring-teal-500' : ''
                        }`}
                      >
                        <span className="font-mono">
                          {nodes.find(n => n.id === edge.source)?.data.className} 
                          {" "}{edge.data.relationType === 'inheritance' ? '◁──' : edge.data.relationType === 'composition' ? '◆──' : edge.data.relationType === 'dependency' ? '┄┄>' : '──>'} 
                          {nodes.find(n => n.id === edge.target)?.data.className}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeEdge(edge.id)
                          }}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ✕
                        </button>
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Validation Section */}
              <Card className={`p-3 mb-4 border-2 ${
                validationErrors.length > 0 && validationErrors[0].startsWith('✓')
                  ? 'bg-green-50 border-green-600'
                  : 'bg-blue-100 border-yellow-600'
              }`}>
                <p className="text-sm font-semibold mb-1">
                  {validationErrors.length === 0 
                    ? "Click 'Validate' to check your diagram" 
                    : validationErrors[0].startsWith('✓')
                    ? "✓ Success!"
                    : "⚠ Issues:"}
                </p>
                {validationErrors.length > 0 && (
                  <ul className="space-y-0.5 text-gray-700 text-xs">
                    {validationErrors.slice(0, 4).map((error, idx) => (
                      <li key={idx} className={error.startsWith('✓') ? 'text-green-700 font-semibold' : ''}>
                        {error.startsWith('✓') ? error : `• ${error}`}
                      </li>
                    ))}
                    {validationErrors.length > 4 && (
                      <li className="text-gray-600 italic">... and {validationErrors.length - 4} more</li>
                    )}
                  </ul>
                )}
              </Card>

              {/* Buttons */}
              <div className="flex gap-4">
                <Button 
                  onClick={validateUML}
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
        </div>
      </div>

      {/* Help Dialog */}
      <Dialog open={helpDialog.open} onOpenChange={(open) => setHelpDialog({...helpDialog, open})}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-teal-700">{helpDialog.title}</DialogTitle>
            <DialogDescription className="text-gray-700 whitespace-pre-line text-sm">
              {helpDialog.content}
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setHelpDialog({...helpDialog, open: false})}
            className="w-full bg-teal-700 text-white hover:bg-teal-800"
          >
            Got it!
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Main export with ReactFlowProvider wrapper
export function UMLBuilderPage({ onNext }: UMLBuilderPageProps) {
  return (
    <ReactFlowProvider>
      <UMLBuilderContent onNext={onNext} />
    </ReactFlowProvider>
  )
}
