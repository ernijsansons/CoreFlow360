/**
 * CoreFlow360 - Visual Workflow Designer
 * Interactive flowchart editor with drag-and-drop functionality
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  Settings,
  Plus,
  Trash2,
  Copy,
  Link,
  Zap,
  Mail,
  Calendar,
  Database,
  Filter,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  Edit3,
  Eye,
  Save,
} from 'lucide-react'
import { AccessibleButton } from '@/components/accessibility/AccessibleComponents'
import {
  Workflow,
  WorkflowNode,
  WorkflowConnection,
  WorkflowNodeType,
} from '@/lib/automation/workflow-types'

interface VisualWorkflowDesignerProps {
  workflow: Workflow
  onChange: (workflow: Workflow) => void
  readonly?: boolean
  className?: string
}

export function VisualWorkflowDesigner({
  workflow,
  onChange,
  readonly = false,
  className = '',
}: VisualWorkflowDesignerProps) {
  // State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ _x: 0, _y: 0 })
  const [showNodeEditor, setShowNodeEditor] = useState(false)
  const [isRunningPreview, setIsRunningPreview] = useState(false)

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Record<string, HTMLDivElement>>({})

  // Node type configurations
  const nodeConfigs = {
    [WorkflowNodeType.TRIGGER_WEBHOOK]: {
      icon: Zap,
      color: 'from-violet-500 to-purple-600',
      category: 'trigger',
      label: 'Webhook',
    },
    [WorkflowNodeType.TRIGGER_EMAIL]: {
      icon: Mail,
      color: 'from-blue-500 to-cyan-600',
      category: 'trigger',
      label: 'Email Trigger',
    },
    [WorkflowNodeType.TRIGGER_TIME_BASED]: {
      icon: Clock,
      color: 'from-orange-500 to-red-600',
      category: 'trigger',
      label: 'Schedule',
    },
    [WorkflowNodeType.ACTION_SEND_EMAIL]: {
      icon: Mail,
      color: 'from-emerald-500 to-green-600',
      category: 'action',
      label: 'Send Email',
    },
    [WorkflowNodeType.ACTION_CREATE_TASK]: {
      icon: Calendar,
      color: 'from-indigo-500 to-blue-600',
      category: 'action',
      label: 'Create Task',
    },
    [WorkflowNodeType.ACTION_UPDATE_CRM]: {
      icon: Database,
      color: 'from-teal-500 to-emerald-600',
      category: 'action',
      label: 'Update CRM',
    },
    [WorkflowNodeType.LOGIC_CONDITION]: {
      icon: Filter,
      color: 'from-yellow-500 to-orange-600',
      category: 'logic',
      label: 'Condition',
    },
    [WorkflowNodeType.LOGIC_DELAY]: {
      icon: Clock,
      color: 'from-gray-500 to-slate-600',
      category: 'logic',
      label: 'Delay',
    },
  }

  // Handle node drag
  const handleNodeDrag = useCallback(
    (nodeId: string, deltaX: number, deltaY: number) => {
      if (readonly) return

      const updatedNodes = workflow.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            position: {
              x: Math.max(0, node.position.x + deltaX),
              y: Math.max(0, node.position.y + deltaY),
            },
          }
        }
        return node
      })

      onChange({
        ...workflow,
        nodes: updatedNodes,
      })
    },
    [workflow, onChange, readonly]
  )

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId)
  }, [])

  // Handle node double-click (edit)
  const handleNodeDoubleClick = useCallback(
    (nodeId: string) => {
      if (readonly) return
      setSelectedNodeId(nodeId)
      setShowNodeEditor(true)
    },
    [readonly]
  )

  // Preview workflow execution
  const handlePreviewExecution = useCallback(async () => {
    setIsRunningPreview(true)

    // Simulate execution flow
    for (const node of workflow.nodes) {
      // Highlight current node
      const nodeElement = nodeRefs.current[node.id]
      if (nodeElement) {
        nodeElement.classList.add('animate-pulse', 'ring-2', 'ring-green-500')
      }

      // Wait for animation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Remove highlight
      if (nodeElement) {
        nodeElement.classList.remove('animate-pulse', 'ring-2', 'ring-green-500')
      }
    }

    setIsRunningPreview(false)
  }, [workflow.nodes])

  return (
    <div className={`relative h-full overflow-hidden bg-gray-950 ${className}`}>
      {/* Toolbar */}
      <div className="absolute top-4 right-4 left-4 z-20">
        <div className="flex items-center justify-between rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-white">{workflow.name}</h3>
            <span className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-400">
              {workflow.nodes.length} steps
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!readonly && (
              <>
                <AccessibleButton
                  variant="ghost"
                  size="sm"
                  onClick={handlePreviewExecution}
                  disabled={isRunningPreview}
                >
                  {isRunningPreview ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </AccessibleButton>

                <AccessibleButton variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </AccessibleButton>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative h-full w-full overflow-auto pt-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
          backgroundSize: '20px 20px',
        }}
      >
        {/* Connections */}
        <svg
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          style={{ minWidth: '100%', minHeight: '100%' }}
        >
          {workflow.connections.map((connection) => {
            const sourceNode = workflow.nodes.find((n) => n.id === connection.sourceNodeId)
            const targetNode = workflow.nodes.find((n) => n.id === connection.targetNodeId)

            if (!sourceNode || !targetNode) return null

            return (
              <WorkflowConnection
                key={connection.id}
                connection={connection}
                sourcePosition={sourceNode.position}
                targetPosition={targetNode.position}
                isActive={isRunningPreview}
              />
            )
          })}
        </svg>

        {/* Nodes */}
        <div className="relative z-20">
          {workflow.nodes.map((node) => (
            <WorkflowNodeComponent
              key={node.id}
              node={node}
              config={nodeConfigs[node.type]}
              isSelected={selectedNodeId === node.id}
              readonly={readonly}
              onSelect={() => handleNodeSelect(node.id)}
              onDoubleClick={() => handleNodeDoubleClick(node.id)}
              onDrag={(deltaX, deltaY) => handleNodeDrag(node.id, deltaX, deltaY)}
              ref={(el) => {
                if (el) nodeRefs.current[node.id] = el
              }}
            />
          ))}
        </div>

        {/* Add Node Button */}
        {!readonly && (
          <motion.button
            className="fixed right-8 bottom-8 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg transition-shadow hover:shadow-xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              // TODO: Show node picker
            }}
          >
            <Plus className="h-6 w-6 text-white" />
          </motion.button>
        )}
      </div>

      {/* Node Editor Panel */}
      <AnimatePresence>
        {showNodeEditor && selectedNodeId && (
          <NodeEditorPanel
            node={workflow.nodes.find((n) => n.id === selectedNodeId)!}
            onClose={() => setShowNodeEditor(false)}
            onSave={(updatedNode) => {
              const updatedNodes = workflow.nodes.map((n) =>
                n.id === selectedNodeId ? updatedNode : n
              )
              onChange({ ...workflow, nodes: updatedNodes })
              setShowNodeEditor(false)
            }}
          />
        )}
      </AnimatePresence>

      {/* Minimap */}
      {workflow.nodes.length > 5 && (
        <div className="absolute bottom-4 left-4 z-20 h-32 w-48 overflow-hidden rounded-lg border border-gray-700 bg-gray-900/80 backdrop-blur-sm">
          <div className="p-2">
            <div className="mb-2 text-xs text-gray-400">Workflow Overview</div>
            <div className="relative">
              {/* Minimap nodes */}
              {workflow.nodes.map((node) => {
                const scale = 0.1
                return (
                  <div
                    key={node.id}
                    className="absolute h-2 w-2 rounded-sm bg-violet-500"
                    style={{
                      left: node.position.x * scale,
                      top: node.position.y * scale,
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Individual Workflow Node Component
interface WorkflowNodeComponentProps {
  node: WorkflowNode
  config: unknown
  isSelected: boolean
  readonly: boolean
  onSelect: () => void
  onDoubleClick: () => void
  onDrag: (deltaX: number, deltaY: number) => void
}

const WorkflowNodeComponent = React.forwardRef<HTMLDivElement, WorkflowNodeComponentProps>(
  ({ node, config, isSelected, readonly, onSelect, onDoubleClick, onDrag }, ref) => {
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    const Icon = config?.icon || Zap

    const handleMouseDown = (e: React.MouseEvent) => {
      if (readonly) return

      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      onSelect()

      e.preventDefault()
      e.stopPropagation()
    }

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!isDragging || readonly) return

        const deltaX = e.clientX - dragStart.x
        const deltaY = e.clientY - dragStart.y

        onDrag(deltaX, deltaY)
        setDragStart({ x: e.clientX, y: e.clientY })
      },
      [isDragging, dragStart, onDrag, readonly]
    )

    const handleMouseUp = useCallback(() => {
      setIsDragging(false)
    }, [])

    useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }
      }
    }, [isDragging, handleMouseMove, handleMouseUp])

    return (
      <motion.div
        ref={ref}
        className={`group absolute cursor-pointer select-none ${
          readonly ? 'cursor-default' : 'cursor-move'
        }`}
        style={{
          left: node.position.x,
          top: node.position.y,
          zIndex: isSelected ? 30 : 20,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: readonly ? 1 : 1.05 }}
        onMouseDown={handleMouseDown}
        onDoubleClick={onDoubleClick}
      >
        {/* Node */}
        <div
          className={`relative min-w-[180px] rounded-xl border bg-gray-900 p-4 transition-all duration-200 ${
            isSelected
              ? 'border-violet-500 shadow-lg shadow-violet-500/20'
              : 'border-gray-700 hover:border-gray-600'
          } ${isDragging ? 'scale-105 shadow-xl' : ''} `}
        >
          {/* Node Header */}
          <div className="mb-2 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r ${config?.color || 'from-gray-500 to-gray-600'} `}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">
                {node.label || config?.label || 'Workflow Step'}
              </div>
              <div className="text-xs text-gray-400">{config?.category || 'step'}</div>
            </div>

            {!readonly && (
              <div className="opacity-0 transition-opacity group-hover:opacity-100">
                <button className="p-1 text-gray-400 transition-colors hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Node Description */}
          {node.description && (
            <p className="mb-2 line-clamp-2 text-xs text-gray-400">{node.description}</p>
          )}

          {/* Status Indicator */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-gray-400">Ready</span>
            </div>

            {isSelected && !readonly && <span className="text-violet-400">Selected</span>}
          </div>

          {/* Connection Points */}
          <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 transform rounded-full border-2 border-gray-800 bg-gray-600 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 transform rounded-full border-2 border-gray-800 bg-gray-600 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        {/* Selection Ring */}
        {isSelected && (
          <div className="pointer-events-none absolute inset-0 animate-pulse rounded-xl border-2 border-violet-500" />
        )}
      </motion.div>
    )
  }
)

WorkflowNodeComponent.displayName = 'WorkflowNodeComponent'

// Workflow Connection Component
interface WorkflowConnectionProps {
  connection: WorkflowConnection
  sourcePosition: { x: number; y: number }
  targetPosition: { x: number; y: number }
  isActive: boolean
}

function WorkflowConnection({
  connection,
  sourcePosition,
  targetPosition,
  isActive,
}: WorkflowConnectionProps) {
  const sourceX = sourcePosition.x + 90 // Center of node
  const sourceY = sourcePosition.y + 80 // Bottom of node
  const targetX = targetPosition.x + 90 // Center of node
  const targetY = targetPosition.y + 20 // Top of node

  // Calculate curve path
  const midY = sourceY + (targetY - sourceY) / 2
  const path = `M ${sourceX} ${sourceY} C ${sourceX} ${midY} ${targetX} ${midY} ${targetX} ${targetY}`

  return (
    <g>
      {/* Connection Path */}
      <path
        d={path}
        stroke={isActive ? '#10b981' : '#4b5563'}
        strokeWidth="2"
        fill="none"
        className={`transition-all duration-300 ${isActive ? 'animate-pulse' : ''}`}
        markerEnd="url(#arrowhead)"
      />

      {/* Arrow Marker */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={isActive ? '#10b981' : '#4b5563'}
            className="transition-colors duration-300"
          />
        </marker>
      </defs>

      {/* Connection Label */}
      {connection.label && (
        <text
          x={sourceX + (targetX - sourceX) / 2}
          y={sourceY + (targetY - sourceY) / 2}
          textAnchor="middle"
          className="fill-gray-400 text-xs"
        >
          {connection.label}
        </text>
      )}

      {/* Active Flow Animation */}
      {isActive && (
        <circle r="3" fill="#10b981" className="animate-pulse">
          <animateMotion dur="2s" repeatCount="indefinite" path={path} />
        </circle>
      )}
    </g>
  )
}

// Node Editor Panel
interface NodeEditorPanelProps {
  node: WorkflowNode
  onClose: () => void
  onSave: (node: WorkflowNode) => void
}

function NodeEditorPanel({ node, onClose, onSave }: NodeEditorPanelProps) {
  const [editedNode, setEditedNode] = useState(node)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="m-4 w-full max-w-2xl rounded-2xl border border-gray-700 bg-gray-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Edit Node</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">Node Label</label>
            <input
              type="text"
              value={editedNode.label}
              onChange={(e) => setEditedNode({ ...editedNode, label: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Description</label>
            <textarea
              value={editedNode.description || ''}
              onChange={(e) => setEditedNode({ ...editedNode, description: e.target.value })}
              className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
              rows={3}
            />
          </div>

          {/* Node-specific configuration would go here */}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <AccessibleButton variant="secondary" onClick={onClose}>
            Cancel
          </AccessibleButton>
          <AccessibleButton onClick={() => onSave(editedNode)}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </AccessibleButton>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default VisualWorkflowDesigner
