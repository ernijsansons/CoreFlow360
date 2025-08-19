/**
 * CoreFlow360 - AI Workflow Visualizer
 * Visual representation of how AI adapts based on active modules
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useModuleAccess } from '@/hooks/useModuleAccess'

interface WorkflowNode {
  id: string
  type: 'trigger' | 'ai' | 'action' | 'decision'
  label: string
  module: string
  x: number
  y: number
}

interface WorkflowEdge {
  from: string
  to: string
  condition?: string
}

interface WorkflowScenario {
  id: string
  name: string
  description: string
  requiredModules: string[]
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

const AIWorkflowVisualizer: React.FC = () => {
  const { activeModules, hasAllModules } = useModuleAccess()
  const [selectedScenario, setSelectedScenario] = useState<WorkflowScenario | null>(null)
  const [animationStep, setAnimationStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const workflows: WorkflowScenario[] = [
    {
      id: 'lead-to-cash',
      name: 'Lead to Cash',
      description: 'AI-powered sales process from lead capture to payment',
      requiredModules: ['crm', 'accounting'],
      nodes: [
        { id: 'lead', type: 'trigger', label: 'New Lead', module: 'crm', x: 50, y: 100 },
        { id: 'score', type: 'ai', label: 'AI Lead Scoring', module: 'crm', x: 200, y: 100 },
        { id: 'qualify', type: 'decision', label: 'Qualified?', module: 'crm', x: 350, y: 100 },
        { id: 'nurture', type: 'action', label: 'Nurture Campaign', module: 'crm', x: 350, y: 200 },
        { id: 'deal', type: 'action', label: 'Create Deal', module: 'crm', x: 500, y: 100 },
        {
          id: 'predict',
          type: 'ai',
          label: 'Revenue Prediction',
          module: 'accounting',
          x: 650,
          y: 100,
        },
        {
          id: 'invoice',
          type: 'action',
          label: 'Generate Invoice',
          module: 'accounting',
          x: 800,
          y: 100,
        },
        {
          id: 'payment',
          type: 'ai',
          label: 'Payment Follow-up',
          module: 'accounting',
          x: 950,
          y: 100,
        },
      ],
      edges: [
        { from: 'lead', to: 'score' },
        { from: 'score', to: 'qualify' },
        { from: 'qualify', to: 'deal', condition: 'Yes' },
        { from: 'qualify', to: 'nurture', condition: 'No' },
        { from: 'nurture', to: 'score' },
        { from: 'deal', to: 'predict' },
        { from: 'predict', to: 'invoice' },
        { from: 'invoice', to: 'payment' },
      ],
    },
    {
      id: 'demand-forecast',
      name: 'Demand Forecasting',
      description: 'Cross-module AI predicts inventory needs from sales and projects',
      requiredModules: ['crm', 'inventory', 'projects'],
      nodes: [
        { id: 'pipeline', type: 'trigger', label: 'Pipeline Update', module: 'crm', x: 50, y: 100 },
        {
          id: 'milestone',
          type: 'trigger',
          label: 'Project Milestone',
          module: 'projects',
          x: 50,
          y: 200,
        },
        {
          id: 'analyze',
          type: 'ai',
          label: 'Demand Analysis',
          module: 'inventory',
          x: 250,
          y: 150,
        },
        {
          id: 'forecast',
          type: 'ai',
          label: 'AI Forecasting',
          module: 'inventory',
          x: 450,
          y: 150,
        },
        {
          id: 'optimize',
          type: 'ai',
          label: 'Order Optimization',
          module: 'inventory',
          x: 650,
          y: 150,
        },
        { id: 'purchase', type: 'action', label: 'Create PO', module: 'inventory', x: 850, y: 150 },
        { id: 'alert', type: 'action', label: 'Alert Team', module: 'inventory', x: 850, y: 250 },
      ],
      edges: [
        { from: 'pipeline', to: 'analyze' },
        { from: 'milestone', to: 'analyze' },
        { from: 'analyze', to: 'forecast' },
        { from: 'forecast', to: 'optimize' },
        { from: 'optimize', to: 'purchase', condition: 'Critical' },
        { from: 'optimize', to: 'alert', condition: 'Monitor' },
      ],
    },
    {
      id: 'performance-sales',
      name: 'Performance-Sales Correlation',
      description: 'AI connects employee performance with sales outcomes',
      requiredModules: ['hr', 'crm'],
      nodes: [
        { id: 'review', type: 'trigger', label: 'Performance Review', module: 'hr', x: 50, y: 100 },
        { id: 'correlate', type: 'ai', label: 'Correlate Sales', module: 'crm', x: 250, y: 100 },
        { id: 'insights', type: 'ai', label: 'Generate Insights', module: 'hr', x: 450, y: 100 },
        { id: 'recommend', type: 'ai', label: 'AI Recommendations', module: 'hr', x: 650, y: 100 },
        { id: 'coaching', type: 'action', label: 'Coaching Plan', module: 'hr', x: 850, y: 100 },
        { id: 'goals', type: 'action', label: 'Update Goals', module: 'crm', x: 850, y: 200 },
      ],
      edges: [
        { from: 'review', to: 'correlate' },
        { from: 'correlate', to: 'insights' },
        { from: 'insights', to: 'recommend' },
        { from: 'recommend', to: 'coaching' },
        { from: 'recommend', to: 'goals' },
      ],
    },
  ]

  // Filter workflows based on active modules
  const availableWorkflows = workflows.filter((workflow) => hasAllModules(workflow.requiredModules))

  useEffect(() => {
    if (isPlaying && selectedScenario) {
      const timer = setTimeout(() => {
        if (animationStep < selectedScenario.nodes.length - 1) {
          setAnimationStep(animationStep + 1)
        } else {
          setIsPlaying(false)
          setAnimationStep(0)
        }
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [isPlaying, animationStep, selectedScenario])

  const getNodeColor = (node: WorkflowNode) => {
    const colors = {
      trigger: 'bg-blue-500',
      ai: 'bg-purple-500',
      action: 'bg-green-500',
      decision: 'bg-yellow-500',
    }
    return colors[node.type]
  }

  const playAnimation = (scenario: WorkflowScenario) => {
    setSelectedScenario(scenario)
    setAnimationStep(0)
    setIsPlaying(true)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-gray-900">AI Workflow Visualizer</h2>
        <p className="text-gray-600">
          See how AI orchestrates workflows across your active modules
        </p>
      </div>

      {/* Module Status */}
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Active Modules:</span>
            <div className="flex space-x-2">
              {activeModules.length > 0 ? (
                activeModules.map((module) => (
                  <span
                    key={module}
                    className="inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                  >
                    {module.toUpperCase()}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">None active</span>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {availableWorkflows.length} workflow{availableWorkflows.length !== 1 ? 's' : ''}{' '}
            available
          </div>
        </div>
      </div>

      {/* Workflow Selection */}
      {availableWorkflows.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {availableWorkflows.map((workflow) => (
            <motion.div
              key={workflow.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => playAnimation(workflow)}
              className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                selectedScenario?.id === workflow.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="mb-1 font-semibold text-gray-900">{workflow.name}</h3>
              <p className="mb-2 text-sm text-gray-600">{workflow.description}</p>
              <div className="flex space-x-1">
                {workflow.requiredModules.map((module) => (
                  <span
                    key={module}
                    className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
                  >
                    {module}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-gray-50 py-12 text-center">
          <div className="mb-4 text-4xl">🔒</div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No Workflows Available</h3>
          <p className="mb-4 text-gray-600">Activate multiple modules to unlock AI workflows</p>
          <div className="text-sm text-gray-500">
            Try activating: CRM + Accounting, or CRM + Inventory + Projects
          </div>
        </div>
      )}

      {/* Workflow Visualization */}
      {selectedScenario && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-white p-6 shadow-lg"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{selectedScenario.name}</h3>
            <button
              onClick={() => playAnimation(selectedScenario)}
              className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isPlaying ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                )}
              </svg>
              <span>{isPlaying ? 'Pause' : 'Play'} Animation</span>
            </button>
          </div>

          <div className="relative overflow-x-auto rounded-lg bg-gray-50 p-8">
            <svg className="h-80 w-full" viewBox="0 0 1000 300">
              {/* Render edges */}
              {selectedScenario.edges.map((edge, index) => {
                const fromNode = selectedScenario.nodes.find((n) => n.id === edge.from)
                const toNode = selectedScenario.nodes.find((n) => n.id === edge.to)

                if (!fromNode || !toNode) return null

                const isActive =
                  animationStep >= selectedScenario.nodes.findIndex((n) => n.id === toNode.id)

                return (
                  <g key={index}>
                    <line
                      x1={fromNode.x + 40}
                      y1={fromNode.y}
                      x2={toNode.x - 40}
                      y2={toNode.y}
                      stroke={isActive ? '#8B5CF6' : '#E5E7EB'}
                      strokeWidth={2}
                      markerEnd="url(#arrowhead)"
                    />
                    {edge.condition && (
                      <text
                        x={(fromNode.x + toNode.x) / 2}
                        y={(fromNode.y + toNode.y) / 2 - 10}
                        className="fill-gray-600 text-xs"
                        textAnchor="middle"
                      >
                        {edge.condition}
                      </text>
                    )}
                  </g>
                )
              })}

              {/* Arrow marker definition */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#8B5CF6" />
                </marker>
              </defs>

              {/* Render nodes */}
              {selectedScenario.nodes.map((node, index) => {
                const isActive = index <= animationStep

                return (
                  <motion.g
                    key={node.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: isActive ? 1 : 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <rect
                      x={node.x - 40}
                      y={node.y - 20}
                      width={80}
                      height={40}
                      rx={8}
                      className={`${
                        isActive ? getNodeColor(node) : 'fill-gray-300'
                      } ${isActive ? 'opacity-100' : 'opacity-50'}`}
                    />
                    <text
                      x={node.x}
                      y={node.y + 5}
                      className="fill-white text-xs font-medium"
                      textAnchor="middle"
                    >
                      {node.label}
                    </text>
                    <text
                      x={node.x}
                      y={node.y - 30}
                      className="fill-gray-600 text-xs"
                      textAnchor="middle"
                    >
                      {node.module.toUpperCase()}
                    </text>
                  </motion.g>
                )
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded bg-blue-500"></div>
              <span className="text-sm text-gray-600">Trigger</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded bg-purple-500"></div>
              <span className="text-sm text-gray-600">AI Processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded bg-green-500"></div>
              <span className="text-sm text-gray-600">Action</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Decision</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Benefits */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4">
          <h4 className="mb-2 font-semibold text-blue-900">Single Module AI</h4>
          <p className="text-sm text-blue-700">Isolated intelligence within module boundaries</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-4">
          <h4 className="mb-2 font-semibold text-purple-900">Cross-Module AI</h4>
          <p className="text-sm text-purple-700">Insights and automation across departments</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-4">
          <h4 className="mb-2 font-semibold text-green-900">Full Orchestration</h4>
          <p className="text-sm text-green-700">Complete business process automation</p>
        </div>
      </div>
    </div>
  )
}

export default AIWorkflowVisualizer
