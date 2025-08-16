/**
 * CoreFlow360 - Workflow Manager
 * Configure and manage automated CRM workflows
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BoltIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  SparklesIcon,
  FunnelIcon,
  CogIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  BellIcon,
  UserPlusIcon,
  ChartBarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { WorkflowTrigger, CRMEvent, WorkflowCondition, WorkflowAction } from '@/lib/crm/workflow-engine'

interface WorkflowManagerProps {
  onWorkflowEdit?: (workflow: WorkflowTrigger) => void
  onWorkflowTest?: (workflow: WorkflowTrigger) => void
}

const eventIcons: Record<string, any> = {
  lead_created: UserPlusIcon,
  lead_converted: ArrowPathIcon,
  customer_lifecycle_changed: ChartBarIcon,
  deal_stage_changed: FunnelIcon,
  deal_won: CheckCircleIcon,
  deal_lost: XCircleIcon,
  activity_overdue: ClockIcon,
  email_received: EnvelopeIcon
}

const actionIcons: Record<string, any> = {
  send_email: EnvelopeIcon,
  create_task: ClockIcon,
  create_notification: BellIcon,
  update_field: PencilIcon,
  ai_analysis: SparklesIcon,
  webhook: GlobeAltIcon,
  assign_to_user: UserPlusIcon
}

export default function WorkflowManager({ onWorkflowEdit, onWorkflowTest }: WorkflowManagerProps) {
  const [workflows, setWorkflows] = useState<WorkflowTrigger[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'lead' | 'customer' | 'deal' | 'activity'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadWorkflows()
  }, [])

  const loadWorkflows = async () => {
    try {
      setLoading(true)
      
      // Mock data for demonstration
      const mockWorkflows: WorkflowTrigger[] = [
        {
          id: 'wf-001',
          name: 'High-Value Lead Alert',
          description: 'Notify sales manager when high-value lead is created',
          event: CRMEvent.LEAD_CREATED,
          conditions: [
            { field: 'aiScore', operator: 'greater_than', value: 80 }
          ],
          actions: [
            { type: 'create_notification', config: {} },
            { type: 'create_task', config: {} }
          ],
          enabled: true,
          tenantId: '1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'wf-002',
          name: 'Deal Stage Progression',
          description: 'Update deal probability and notify team on stage change',
          event: CRMEvent.DEAL_STAGE_CHANGED,
          conditions: [],
          actions: [
            { type: 'update_field', config: {} },
            { type: 'ai_analysis', config: {} }
          ],
          enabled: true,
          tenantId: '1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'wf-003',
          name: 'Churn Prevention',
          description: 'Trigger retention workflow when customer shows churn signals',
          event: CRMEvent.CUSTOMER_LIFECYCLE_CHANGED,
          conditions: [
            { field: 'lifecycle', operator: 'equals', value: 'at_risk' }
          ],
          actions: [
            { type: 'create_task', config: {} },
            { type: 'send_email', config: {}, delay: 60 }
          ],
          enabled: true,
          tenantId: '1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'wf-004',
          name: 'Deal Won Celebration',
          description: 'Celebrate and follow up on won deals',
          event: CRMEvent.DEAL_WON,
          conditions: [],
          actions: [
            { type: 'create_notification', config: {} },
            { type: 'create_task', config: {} }
          ],
          enabled: false,
          tenantId: '1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'wf-005',
          name: 'Lead Nurturing',
          description: 'Automated follow-up for inactive leads',
          event: CRMEvent.LEAD_INACTIVE,
          conditions: [
            { field: 'daysSinceLastContact', operator: 'greater_than', value: 7 }
          ],
          actions: [
            { type: 'send_email', config: {} },
            { type: 'update_field', config: {} }
          ],
          enabled: true,
          tenantId: '1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      
      setWorkflows(mockWorkflows)
    } catch (error) {
      console.error('Failed to load workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleWorkflow = async (workflowId: string) => {
    setWorkflows(prev => prev.map(wf => 
      wf.id === workflowId ? { ...wf, enabled: !wf.enabled } : wf
    ))
    
    // In production, update via API
  }

  const deleteWorkflow = async (workflowId: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      setWorkflows(prev => prev.filter(wf => wf.id !== workflowId))
      // In production, delete via API
    }
  }

  const getEventCategory = (event: CRMEvent): string => {
    const eventStr = event.toString()
    if (eventStr.startsWith('lead_')) return 'lead'
    if (eventStr.startsWith('customer_')) return 'customer'
    if (eventStr.startsWith('deal_')) return 'deal'
    if (eventStr.startsWith('activity_') || eventStr.includes('email_') || eventStr.includes('call_') || eventStr.includes('meeting_')) return 'activity'
    return 'other'
  }

  const filteredWorkflows = workflows.filter(wf => 
    selectedCategory === 'all' || getEventCategory(wf.event) === selectedCategory
  )

  const getEventIcon = (event: CRMEvent) => {
    const Icon = eventIcons[event] || BoltIcon
    return <Icon className="h-5 w-5" />
  }

  const getActionIcon = (actionType: string) => {
    const Icon = actionIcons[actionType] || CogIcon
    return <Icon className="h-4 w-4" />
  }

  const formatEventName = (event: CRMEvent): string => {
    return event.toString().split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Automation</h1>
          <p className="text-gray-600 mt-1">Configure automated triggers and actions for CRM events</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Workflow
        </button>
      </div>

      {/* Category Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {['all', 'lead', 'customer', 'deal', 'activity'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as any)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                selectedCategory === category
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
              {category !== 'all' && (
                <span className="ml-2 text-xs">
                  ({workflows.filter(wf => getEventCategory(wf.event) === category).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Workflows List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredWorkflows.map((workflow, index) => (
          <motion.div
            key={workflow.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="p-6">
              {/* Workflow Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    workflow.enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {getEventIcon(workflow.event)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{workflow.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{workflow.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleWorkflow(workflow.id)}
                    className={`p-2 rounded-md ${
                      workflow.enabled
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={workflow.enabled ? 'Disable workflow' : 'Enable workflow'}
                  >
                    {workflow.enabled ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => onWorkflowEdit?.(workflow)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md"
                    title="Edit workflow"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => deleteWorkflow(workflow.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                    title="Delete workflow"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Trigger Event */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Trigger</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                  {formatEventName(workflow.event)}
                </div>
              </div>

              {/* Conditions */}
              {workflow.conditions.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Conditions</p>
                  <div className="space-y-1">
                    {workflow.conditions.map((condition, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        <span className="font-medium">{condition.field}</span>
                        <span className="mx-1">{condition.operator.replace('_', ' ')}</span>
                        <span className="font-medium">{condition.value}</span>
                        {condition.logic && idx < workflow.conditions.length - 1 && (
                          <span className="ml-2 text-blue-600">{condition.logic}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Actions</p>
                <div className="space-y-2">
                  {workflow.actions.map((action, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="flex-shrink-0">
                        {getActionIcon(action.type)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {action.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {action.delay && (
                          <span className="ml-1 text-gray-500">
                            (delayed {action.delay} min)
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Created {new Date(workflow.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Updated {new Date(workflow.updatedAt).toLocaleDateString()}</span>
                </div>
                {workflow.enabled && (
                  <button
                    onClick={() => onWorkflowTest?.(workflow)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Test Workflow
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredWorkflows.length === 0 && (
        <div className="text-center py-12">
          <BoltIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedCategory === 'all' 
              ? 'Get started by creating your first workflow' 
              : `No ${selectedCategory} workflows configured`}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Workflow
            </button>
          </div>
        </div>
      )}

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <SparklesIcon className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-medium text-purple-900">Workflow Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 rounded-lg p-4">
            <p className="text-2xl font-semibold text-purple-900">
              {workflows.filter(w => w.enabled).length}/{workflows.length}
            </p>
            <p className="text-sm text-purple-700">Active Workflows</p>
          </div>
          <div className="bg-white/60 rounded-lg p-4">
            <p className="text-2xl font-semibold text-purple-900">247</p>
            <p className="text-sm text-purple-700">Actions This Week</p>
          </div>
          <div className="bg-white/60 rounded-lg p-4">
            <p className="text-2xl font-semibold text-purple-900">18.5h</p>
            <p className="text-sm text-purple-700">Time Saved</p>
          </div>
        </div>
        <div className="mt-4 text-sm text-purple-800">
          <strong>Recommendation:</strong> Enable the "Deal Won Celebration" workflow to improve team morale and ensure timely onboarding.
        </div>
      </motion.div>
    </div>
  )
}