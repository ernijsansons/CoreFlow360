/**
 * CoreFlow360 - Deployment Dashboard
 * Comprehensive deployment pipeline management and monitoring
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  DeploymentStage, 
  DeploymentStatus, 
  DeploymentStrategy, 
  EnvironmentType 
} from '@/lib/deployment/pipeline-orchestrator'

// Interfaces
interface DeploymentExecution {
  id: string
  pipelineId: string
  version: string
  branch: string
  commit: string
  author: string
  message: string
  status: DeploymentStatus
  strategy: DeploymentStrategy
  environment: EnvironmentType
  startedAt: Date
  completedAt?: Date
  duration?: number
  stages: {
    stage: DeploymentStage
    status: DeploymentStatus
    startedAt?: Date
    completedAt?: Date
    duration?: number
    logs: string[]
    artifacts: string[]
    metrics: Record<string, number>
    error?: {
      message: string
      code: string
      stack?: string
    }
  }[]
  metrics: {
    buildTime: number
    testCoverage: number
    performanceScore: number
    securityScore: number
    deploymentSize: number
    rollbackTime?: number
  }
  approvals: {
    required: boolean
    approvers: string[]
    approved: boolean
    approvedBy?: string
    approvedAt?: Date
  }
  notifications: {
    sent: boolean
    channels: string[]
    timestamp: Date
  }[]
}

interface PipelineConfig {
  id: string
  name: string
  repository: {
    url: string
    branch: string
  }
  environments: {
    type: EnvironmentType
    name: string
    url: string
    replicas: number
  }[]
}

interface DeploymentDashboardProps {
  refreshInterval?: number
}

export default function DeploymentDashboard({ 
  refreshInterval = 30000 
}: DeploymentDashboardProps) {
  const [executions, setExecutions] = useState<DeploymentExecution[]>([])
  const [pipelines, setPipelines] = useState<PipelineConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedExecution, setSelectedExecution] = useState<DeploymentExecution | null>(null)
  const [activeTab, setActiveTab] = useState<'deployments' | 'pipelines' | 'infrastructure'>('deployments')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedEnvironment, setSelectedEnvironment] = useState<EnvironmentType | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<DeploymentStatus | 'all'>('all')

  // Form states
  const [deploymentForm, setDeploymentForm] = useState({
    pipelineId: '',
    branch: '',
    environment: EnvironmentType.STAGING,
    strategy: DeploymentStrategy.ROLLING,
    message: '',
  })

  // Fetch deployments
  const fetchDeployments = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        action: 'list',
        limit: '20',
      })
      
      if (selectedEnvironment !== 'all') {
        params.append('environment', selectedEnvironment)
      }
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus)
      }

      const response = await fetch(`/api/admin/deployments?${params}`)
      if (!response.ok) throw new Error('Failed to fetch deployments')
      
      const data = await response.json()
      setExecutions(data.executions.map((exec: any) => ({
        ...exec,
        startedAt: new Date(exec.startedAt),
        completedAt: exec.completedAt ? new Date(exec.completedAt) : undefined,
        stages: exec.stages.map((stage: any) => ({
          ...stage,
          startedAt: stage.startedAt ? new Date(stage.startedAt) : undefined,
          completedAt: stage.completedAt ? new Date(stage.completedAt) : undefined,
        })),
        approvals: {
          ...exec.approvals,
          approvedAt: exec.approvals.approvedAt ? new Date(exec.approvals.approvedAt) : undefined,
        },
        notifications: exec.notifications.map((notif: any) => ({
          ...notif,
          timestamp: new Date(notif.timestamp),
        })),
      })))
    } catch (err) {
      console.error('Deployments fetch error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [selectedEnvironment, selectedStatus])

  // Fetch pipelines
  const fetchPipelines = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/deployments?action=pipelines')
      if (!response.ok) throw new Error('Failed to fetch pipelines')
      
      const data = await response.json()
      setPipelines(data.pipelines)
    } catch (err) {
      console.error('Pipelines fetch error:', err)
    }
  }, [])

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([fetchDeployments(), fetchPipelines()])
      setError(null)
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [fetchDeployments, fetchPipelines])

  // Set up auto-refresh
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, refreshInterval])

  // Execute deployment
  const executeDeployment = async () => {
    try {
      const response = await fetch('/api/admin/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute',
          ...deploymentForm,
        }),
      })

      if (!response.ok) throw new Error('Failed to execute deployment')
      
      setShowCreateModal(false)
      setDeploymentForm({
        pipelineId: '',
        branch: '',
        environment: EnvironmentType.STAGING,
        strategy: DeploymentStrategy.ROLLING,
        message: '',
      })
      
      await fetchData()
    } catch (err) {
      console.error('Deployment execution failed:', err)
    }
  }

  // Cancel deployment
  const cancelDeployment = async (executionId: string) => {
    try {
      const response = await fetch('/api/admin/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          executionId,
        }),
      })

      if (!response.ok) throw new Error('Failed to cancel deployment')
      
      await fetchData()
    } catch (err) {
      console.error('Deployment cancellation failed:', err)
    }
  }

  // Approve deployment
  const approveDeployment = async (executionId: string) => {
    try {
      const response = await fetch('/api/admin/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          executionId,
          approver: 'admin', // In real app, get from session
        }),
      })

      if (!response.ok) throw new Error('Failed to approve deployment')
      
      await fetchData()
    } catch (err) {
      console.error('Deployment approval failed:', err)
    }
  }

  // Rollback deployment
  const rollbackDeployment = async (executionId: string) => {
    try {
      const response = await fetch('/api/admin/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rollback',
          executionId,
        }),
      })

      if (!response.ok) throw new Error('Failed to rollback deployment')
      
      await fetchData()
    } catch (err) {
      console.error('Deployment rollback failed:', err)
    }
  }

  const getStatusColor = (status: DeploymentStatus): string => {
    switch (status) {
      case DeploymentStatus.SUCCESS: return 'text-green-600 bg-green-100'
      case DeploymentStatus.RUNNING: return 'text-blue-600 bg-blue-100'
      case DeploymentStatus.FAILED: return 'text-red-600 bg-red-100'
      case DeploymentStatus.CANCELLED: return 'text-gray-600 bg-gray-100'
      case DeploymentStatus.PENDING: return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getEnvironmentColor = (env: EnvironmentType): string => {
    switch (env) {
      case EnvironmentType.PRODUCTION: return 'text-red-600 bg-red-100'
      case EnvironmentType.STAGING: return 'text-orange-600 bg-orange-100'
      case EnvironmentType.DEVELOPMENT: return 'text-blue-600 bg-blue-100'
      case EnvironmentType.PREVIEW: return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Deployment Dashboard</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Deploy
          </button>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'deployments', label: 'Deployments' },
            { id: 'pipelines', label: 'Pipelines' },
            { id: 'infrastructure', label: 'Infrastructure' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Deployments Tab */}
      {activeTab === 'deployments' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                <select
                  value={selectedEnvironment}
                  onChange={(e) => setSelectedEnvironment(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="all">All Environments</option>
                  {Object.values(EnvironmentType).map(env => (
                    <option key={env} value={env}>{env.charAt(0).toUpperCase() + env.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="all">All Statuses</option>
                  {Object.values(DeploymentStatus).map(status => (
                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Deployments List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Deployments</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {executions.map((execution) => (
                <div key={execution.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}>
                          {execution.status.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEnvironmentColor(execution.environment)}`}>
                          {execution.environment.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                          {execution.strategy.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {execution.version} • {execution.branch} • {execution.commit.substring(0, 7)}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {execution.message}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>By {execution.author}</span>
                        <span>Started {formatTimeAgo(execution.startedAt)}</span>
                        {execution.duration && (
                          <span>Duration: {formatDuration(execution.duration)}</span>
                        )}
                        {execution.metrics.testCoverage > 0 && (
                          <span>Coverage: {execution.metrics.testCoverage.toFixed(1)}%</span>
                        )}
                      </div>
                      
                      {/* Stage Progress */}
                      <div className="mt-3">
                        <div className="flex items-center space-x-1">
                          {execution.stages.map((stage, index) => (
                            <div
                              key={stage.stage}
                              className={`h-2 flex-1 rounded ${
                                stage.status === DeploymentStatus.SUCCESS ? 'bg-green-500' :
                                stage.status === DeploymentStatus.RUNNING ? 'bg-blue-500 animate-pulse' :
                                stage.status === DeploymentStatus.FAILED ? 'bg-red-500' :
                                stage.status === DeploymentStatus.SKIPPED ? 'bg-gray-300' :
                                'bg-gray-200'
                              }`}
                              title={`${stage.stage}: ${stage.status}`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{execution.stages[0]?.stage.replace('_', ' ')}</span>
                          <span>{execution.stages[execution.stages.length - 1]?.stage.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedExecution(execution)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Details
                      </button>
                      
                      {execution.status === DeploymentStatus.RUNNING && (
                        <button
                          onClick={() => cancelDeployment(execution.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Cancel
                        </button>
                      )}
                      
                      {execution.approvals.required && !execution.approvals.approved && (
                        <button
                          onClick={() => approveDeployment(execution.id)}
                          className="text-sm text-green-600 hover:text-green-800"
                        >
                          Approve
                        </button>
                      )}
                      
                      {execution.status === DeploymentStatus.SUCCESS && execution.environment === EnvironmentType.PRODUCTION && (
                        <button
                          onClick={() => rollbackDeployment(execution.id)}
                          className="text-sm text-orange-600 hover:text-orange-800"
                        >
                          Rollback
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pipelines Tab */}
      {activeTab === 'pipelines' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Deployment Pipelines</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {pipelines.map((pipeline) => (
              <div key={pipeline.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{pipeline.name}</h4>
                    <p className="text-sm text-gray-600">{pipeline.repository.url}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Branch: {pipeline.repository.branch}</span>
                      <span>Environments: {pipeline.environments.length}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setDeploymentForm({ ...deploymentForm, pipelineId: pipeline.id })
                        setShowCreateModal(true)
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Deploy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Infrastructure Tab */}
      {activeTab === 'infrastructure' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Infrastructure as Code</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-300 rounded-lg p-4">
                <h4 className="font-medium mb-2">Terraform</h4>
                <p className="text-sm text-gray-600 mb-3">Generate Terraform templates for AWS, GCP, Azure</p>
                <button className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700">
                  Generate Template
                </button>
              </div>
              
              <div className="border border-gray-300 rounded-lg p-4">
                <h4 className="font-medium mb-2">CloudFormation</h4>
                <p className="text-sm text-gray-600 mb-3">AWS CloudFormation stack templates</p>
                <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700">
                  Generate Template
                </button>
              </div>
              
              <div className="border border-gray-300 rounded-lg p-4">
                <h4 className="font-medium mb-2">Kubernetes</h4>
                <p className="text-sm text-gray-600 mb-3">Kubernetes manifests and Helm charts</p>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                  Generate Manifests
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Execute Deployment</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline</label>
                <select
                  value={deploymentForm.pipelineId}
                  onChange={(e) => setDeploymentForm({ ...deploymentForm, pipelineId: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select Pipeline</option>
                  {pipelines.map(pipeline => (
                    <option key={pipeline.id} value={pipeline.id}>{pipeline.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <input
                  type="text"
                  value={deploymentForm.branch}
                  onChange={(e) => setDeploymentForm({ ...deploymentForm, branch: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="main"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                  <select
                    value={deploymentForm.environment}
                    onChange={(e) => setDeploymentForm({ ...deploymentForm, environment: e.target.value as EnvironmentType })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {Object.values(EnvironmentType).map(env => (
                      <option key={env} value={env}>{env.charAt(0).toUpperCase() + env.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Strategy</label>
                  <select
                    value={deploymentForm.strategy}
                    onChange={(e) => setDeploymentForm({ ...deploymentForm, strategy: e.target.value as DeploymentStrategy })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {Object.values(DeploymentStrategy).map(strategy => (
                      <option key={strategy} value={strategy}>
                        {strategy.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <input
                  type="text"
                  value={deploymentForm.message}
                  onChange={(e) => setDeploymentForm({ ...deploymentForm, message: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Deployment message"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={executeDeployment}
                disabled={!deploymentForm.pipelineId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Deploy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execution Detail Modal */}
      {selectedExecution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Deployment Details</h3>
              <button
                onClick={() => setSelectedExecution(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <div className="space-y-6">
                {/* Execution Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Version</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedExecution.version}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedExecution.status)}`}>
                        {selectedExecution.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stages */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Deployment Stages</h4>
                  <div className="space-y-3">
                    {selectedExecution.stages.map((stage, index) => (
                      <div key={stage.stage} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{stage.stage.replace('_', ' ').toUpperCase()}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stage.status)}`}>
                            {stage.status.toUpperCase()}
                          </span>
                        </div>
                        {stage.duration && (
                          <div className="text-xs text-gray-500 mb-2">
                            Duration: {formatDuration(stage.duration)}
                          </div>
                        )}
                        {stage.logs.length > 0 && (
                          <div className="bg-gray-50 rounded p-2 max-h-32 overflow-y-auto">
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                              {stage.logs.slice(-5).join('\n')}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Build Time:</span>
                      <span className="ml-2 font-medium">{formatDuration(selectedExecution.metrics.buildTime)}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Test Coverage:</span>
                      <span className="ml-2 font-medium">{selectedExecution.metrics.testCoverage.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Performance Score:</span>
                      <span className="ml-2 font-medium">{selectedExecution.metrics.performanceScore.toFixed(1)}/100</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Security Score:</span>
                      <span className="ml-2 font-medium">{selectedExecution.metrics.securityScore.toFixed(1)}/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}