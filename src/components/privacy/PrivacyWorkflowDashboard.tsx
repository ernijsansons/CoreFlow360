'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Play,
  Pause,
  Square,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Workflow,
  Settings,
  Plus,
  MoreVertical,
  Timer,
  Users,
  Target,
  TrendingUp,
} from 'lucide-react'

interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout'
  startTime: Date
  endTime?: Date
  duration?: number
  triggeredBy: {
    type: 'event' | 'schedule' | 'manual' | 'threshold' | 'api_call'
    source: string
    metadata?: Record<string, unknown>
  }
  actionResults: Array<{
    actionId: string
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
    startTime?: Date
    endTime?: Date
    result?: unknown
    error?: string
  }>
  metrics: {
    totalActions: number
    completedActions: number
    failedActions: number
    skippedActions: number
  }
}

interface PrivacyWorkflow {
  id: string
  name: string
  description: string
  triggerType: 'event' | 'schedule' | 'manual' | 'threshold' | 'api_call'
  priority: 'low' | 'medium' | 'high' | 'critical'
  isActive: boolean
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    nextRun?: Date
  }
  lastExecution?: {
    status: string
    startTime: Date
    duration?: number
  }
  metrics: {
    totalExecutions: number
    successRate: number
    averageDuration: number
  }
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category:
    | 'compliance'
    | 'risk_management'
    | 'incident_response'
    | 'data_subject_rights'
    | 'monitoring'
    | 'testing'
  estimatedDuration: number
  tags: string[]
}

export function PrivacyWorkflowDashboard() {
  const [workflows, setWorkflows] = useState<PrivacyWorkflow[]>([])
  const [activeExecutions, setActiveExecutions] = useState<WorkflowExecution[]>([])
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    runningExecutions: 0,
    todayExecutions: 0,
    successRate: 0,
    avgExecutionTime: 0,
    recentActivity: [],
  })

  useEffect(() => {
    loadWorkflows()
    loadTemplates()
    loadDashboardMetrics()
  }, [])

  const loadWorkflows = async () => {
    // Mock data - in production, fetch from API
    const mockWorkflows: PrivacyWorkflow[] = [
      {
        id: 'daily_health_check',
        name: 'Daily Privacy Health Check',
        description:
          'Daily automated privacy compliance health check including consent audits and risk assessment',
        triggerType: 'schedule',
        priority: 'medium',
        isActive: true,
        schedule: {
          frequency: 'daily',
          nextRun: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
        },
        lastExecution: {
          status: 'completed',
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
          duration: 450000,
        },
        metrics: {
          totalExecutions: 30,
          successRate: 96.7,
          averageDuration: 420000,
        },
      },
      {
        id: 'gdpr_compliance_check',
        name: 'GDPR Compliance Check',
        description: 'Weekly comprehensive GDPR compliance verification',
        triggerType: 'schedule',
        priority: 'high',
        isActive: true,
        schedule: {
          frequency: 'weekly',
          nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
        lastExecution: {
          status: 'completed',
          startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          duration: 1200000,
        },
        metrics: {
          totalExecutions: 12,
          successRate: 100,
          averageDuration: 1150000,
        },
      },
      {
        id: 'breach_response',
        name: 'Data Breach Response',
        description: 'Automated incident response for data breach detection',
        triggerType: 'event',
        priority: 'critical',
        isActive: true,
        lastExecution: {
          status: 'completed',
          startTime: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          duration: 1800000,
        },
        metrics: {
          totalExecutions: 3,
          successRate: 100,
          averageDuration: 1650000,
        },
      },
      {
        id: 'data_subject_requests',
        name: 'Data Subject Request Automation',
        description: 'Automated processing of GDPR/CCPA data subject requests',
        triggerType: 'event',
        priority: 'high',
        isActive: true,
        lastExecution: {
          status: 'running',
          startTime: new Date(Date.now() - 30 * 60 * 1000),
        },
        metrics: {
          totalExecutions: 156,
          successRate: 94.2,
          averageDuration: 900000,
        },
      },
    ]

    setWorkflows(mockWorkflows)

    // Mock active executions
    const mockExecutions: WorkflowExecution[] = [
      {
        id: 'exec_001',
        workflowId: 'data_subject_requests',
        status: 'running',
        startTime: new Date(Date.now() - 30 * 60 * 1000),
        triggeredBy: {
          type: 'event',
          source: 'data_subject_request_submitted',
        },
        actionResults: [
          { actionId: 'verify_identity', status: 'completed' },
          { actionId: 'process_request', status: 'running' },
          { actionId: 'notify_completion', status: 'pending' },
        ],
        metrics: {
          totalActions: 3,
          completedActions: 1,
          failedActions: 0,
          skippedActions: 0,
        },
      },
    ]

    setActiveExecutions(mockExecutions)
  }

  const loadTemplates = async () => {
    const mockTemplates: WorkflowTemplate[] = [
      {
        id: 'gdpr_incident_response',
        name: 'GDPR Incident Response',
        description: 'Automated workflow for GDPR data breach incident response',
        category: 'incident_response',
        estimatedDuration: 1800000,
        tags: ['gdpr', 'incident', 'breach', 'notification'],
      },
      {
        id: 'consent_optimization',
        name: 'Consent Rate Optimization',
        description: 'Workflow to optimize consent collection and management',
        category: 'compliance',
        estimatedDuration: 900000,
        tags: ['consent', 'optimization', 'gdpr', 'ccpa'],
      },
      {
        id: 'vendor_assessment',
        name: 'Vendor Privacy Assessment',
        description: 'Automated privacy risk assessment for third-party vendors',
        category: 'risk_management',
        estimatedDuration: 1200000,
        tags: ['vendor', 'risk', 'assessment', 'third-party'],
      },
      {
        id: 'data_retention_cleanup',
        name: 'Data Retention Cleanup',
        description: 'Automated cleanup of data based on retention policies',
        category: 'compliance',
        estimatedDuration: 600000,
        tags: ['retention', 'cleanup', 'gdpr', 'data_minimization'],
      },
    ]

    setTemplates(mockTemplates)
  }

  const loadDashboardMetrics = async () => {
    const metrics = {
      totalWorkflows: 12,
      activeWorkflows: 9,
      runningExecutions: 1,
      todayExecutions: 24,
      successRate: 95.8,
      avgExecutionTime: 720000,
      recentActivity: [
        {
          workflowName: 'Daily Privacy Health Check',
          status: 'completed',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          duration: 420000,
        },
        {
          workflowName: 'Data Subject Request',
          status: 'running',
          startTime: new Date(Date.now() - 30 * 60 * 1000),
        },
        {
          workflowName: 'Risk Assessment',
          status: 'completed',
          startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
          duration: 180000,
        },
      ],
    }

    setDashboardMetrics(metrics)
  }

  const executeWorkflow = async (workflowId: string) => {
    // Mock API call to execute workflow

    // Update workflow status optimistically
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === workflowId
          ? { ...w, lastExecution: { status: 'running', startTime: new Date() } }
          : w
      )
    )
  }

  const pauseWorkflow = async (workflowId: string) => {
    setWorkflows((prev) => prev.map((w) => (w.id === workflowId ? { ...w, isActive: false } : w)))
  }

  const resumeWorkflow = async (workflowId: string) => {
    setWorkflows((prev) => prev.map((w) => (w.id === workflowId ? { ...w, isActive: true } : w)))
  }

  const createWorkflowFromTemplate = async (_templateId: string) => {
    // Mock workflow creation
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 animate-pulse text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'timeout':
        return <Timer className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A'
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const formatSuccessRate = (rate: number) => {
    return `${rate.toFixed(1)}%`
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Privacy Workflow Orchestration</h1>
          <p className="mt-2 text-gray-600">
            Automated privacy compliance workflows and orchestration
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Workflow
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Workflows</p>
                <p className="text-2xl font-bold">{dashboardMetrics.totalWorkflows}</p>
                <p className="text-xs text-green-600">{dashboardMetrics.activeWorkflows} active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Running Now</p>
                <p className="text-2xl font-bold">{dashboardMetrics.runningExecutions}</p>
                <p className="text-xs text-gray-600">{dashboardMetrics.todayExecutions} today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatSuccessRate(dashboardMetrics.successRate)}
                </p>
                <p className="text-xs text-gray-600">Last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Avg Duration</p>
                <p className="text-2xl font-bold">
                  {formatDuration(dashboardMetrics.avgExecutionTime)}
                </p>
                <p className="text-xs text-gray-600">Per execution</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Active Workflows</TabsTrigger>
          <TabsTrigger value="executions">Running Executions</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <p className="text-sm text-gray-600">{workflow.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(workflow.priority)}>
                        {workflow.priority}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Trigger:</span>
                      <p className="font-medium capitalize">{workflow.triggerType}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <div className="flex items-center gap-1">
                        {workflow.isActive ? (
                          <Badge variant="outline" className="border-green-600 text-green-600">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            Paused
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {workflow.schedule && (
                    <div className="text-sm">
                      <span className="text-gray-500">Next Run:</span>
                      <p className="font-medium">{workflow.schedule.nextRun?.toLocaleString()}</p>
                    </div>
                  )}

                  {workflow.lastExecution && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Last Execution:</span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(workflow.lastExecution.status)}
                          <span className="capitalize">{workflow.lastExecution.status}</span>
                        </div>
                      </div>
                      {workflow.lastExecution.duration && (
                        <div className="text-sm text-gray-600">
                          Duration: {formatDuration(workflow.lastExecution.duration)}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded bg-gray-50 p-2">
                      <p className="font-medium">{workflow.metrics.totalExecutions}</p>
                      <p className="text-gray-600">Executions</p>
                    </div>
                    <div className="rounded bg-gray-50 p-2">
                      <p className="font-medium text-green-600">
                        {formatSuccessRate(workflow.metrics.successRate)}
                      </p>
                      <p className="text-gray-600">Success</p>
                    </div>
                    <div className="rounded bg-gray-50 p-2">
                      <p className="font-medium">
                        {formatDuration(workflow.metrics.averageDuration)}
                      </p>
                      <p className="text-gray-600">Avg Time</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => executeWorkflow(workflow.id)}
                      className="flex-1"
                    >
                      <Play className="mr-1 h-3 w-3" />
                      Run Now
                    </Button>
                    {workflow.isActive ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => pauseWorkflow(workflow.id)}
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resumeWorkflow(workflow.id)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          {activeExecutions.length > 0 ? (
            <div className="space-y-4">
              {activeExecutions.map((execution) => {
                const workflow = workflows.find((w) => w.id === execution.workflowId)
                const progress =
                  (execution.metrics.completedActions / execution.metrics.totalActions) * 100

                return (
                  <Card key={execution.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {workflow?.name || 'Unknown Workflow'}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            Triggered by {execution.triggeredBy.type}:{' '}
                            {execution.triggeredBy.source}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(execution.status)}
                          <Badge className={getPriorityColor(workflow?.priority || 'medium')}>
                            {execution.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="mb-2 flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {execution.metrics.completedActions}/{execution.metrics.totalActions}{' '}
                            actions
                          </span>
                        </div>
                        <Progress value={progress} />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Started:</span>
                          <p className="font-medium">{execution.startTime.toLocaleTimeString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <p className="font-medium">
                            {formatDuration(Date.now() - execution.startTime.getTime())}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Action Status</h4>
                        {execution.actionResults.map((action, index) => (
                          <div key={action.actionId} className="flex items-center gap-2 text-sm">
                            <div className="flex h-6 w-6 items-center justify-center">
                              {action.status === 'completed' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : action.status === 'running' ? (
                                <Activity className="h-4 w-4 animate-pulse text-blue-500" />
                              ) : action.status === 'failed' ? (
                                <XCircle className="h-4 w-4 text-red-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            <span className="flex-1">Action {index + 1}</span>
                            <Badge
                              variant="outline"
                              className={
                                action.status === 'completed'
                                  ? 'border-green-600 text-green-600'
                                  : action.status === 'running'
                                    ? 'border-blue-600 text-blue-600'
                                    : action.status === 'failed'
                                      ? 'border-red-600 text-red-600'
                                      : 'border-gray-600 text-gray-600'
                              }
                            >
                              {action.status}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-600 text-red-600">
                          <Square className="mr-1 h-3 w-3" />
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">No Active Executions</h3>
                <p className="text-gray-600">All workflows are currently idle</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {template.category.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      ~{formatDuration(template.estimatedDuration)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => createWorkflowFromTemplate(template.id)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Create Workflow
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardMetrics.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(activity.status)}
                      <div>
                        <p className="font-medium">{activity.workflowName}</p>
                        <p className="text-sm text-gray-600">
                          {activity.startTime.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={
                          activity.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : activity.status === 'running'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {activity.status}
                      </Badge>
                      {activity.duration && (
                        <p className="mt-1 text-sm text-gray-600">
                          {formatDuration(activity.duration)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
