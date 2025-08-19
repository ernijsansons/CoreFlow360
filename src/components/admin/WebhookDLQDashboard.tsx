/**
 * CoreFlow360 - Webhook Dead Letter Queue Dashboard
 * Admin interface for managing failed webhook events with recovery tools
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Play,
  Eye,
} from 'lucide-react'

interface DLQEvent {
  id: string
  eventType: string
  sourceProvider: string
  payload: Record<string, unknown>
  originalHeaders: Record<string, string>
  failureReason: string
  stackTrace?: string
  lastAttemptAt: Date
  attemptCount: number
  maxRetries: number
  status: 'pending' | 'processing' | 'recovered' | 'abandoned'
  priority: 'low' | 'medium' | 'high' | 'critical'
  tenantId: string
  createdAt: Date
  scheduledRetryAt?: Date
  recoveredAt?: Date
  abandonedAt?: Date
  impactLevel: 'low' | 'medium' | 'high' | 'critical'
  businessImpact: string
  technicalNotes?: string
}

interface DLQMetrics {
  totalEvents: number
  pendingEvents: number
  recoveredEvents: number
  abandonedEvents: number
  averageRecoveryTime: number
  failuresByProvider: Record<string, number>
  successRate: number
  lastProcessedAt: Date
}

export default function WebhookDLQDashboard() {
  const [metrics, setMetrics] = useState<DLQMetrics | null>(null)
  const [pendingEvents, setPendingEvents] = useState<DLQEvent[]>([])
  const [recoveredEvents, setRecoveredEvents] = useState<DLQEvent[]>([])
  const [abandonedEvents, setAbandonedEvents] = useState<DLQEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<DLQEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [processingEvent, setProcessingEvent] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const [metricsRes, pendingRes, recoveredRes, abandonedRes] = await Promise.all([
        fetch('/api/admin/webhook-dlq/metrics'),
        fetch('/api/admin/webhook-dlq/events?status=pending'),
        fetch('/api/admin/webhook-dlq/events?status=recovered&limit=20'),
        fetch('/api/admin/webhook-dlq/events?status=abandoned&limit=20'),
      ])

      const [metricsData, pendingData, recoveredData, abandonedData] = await Promise.all([
        metricsRes.json(),
        pendingRes.json(),
        recoveredRes.json(),
        abandonedRes.json(),
      ])

      setMetrics(metricsData)
      setPendingEvents(pendingData)
      setRecoveredEvents(recoveredData)
      setAbandonedEvents(abandonedData)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const retryEvent = async (eventId: string) => {
    try {
      setProcessingEvent(eventId)
      const response = await fetch(`/api/admin/webhook-dlq/retry/${eventId}`, {
        method: 'POST',
      })

      if (response.ok) {
        await loadDashboardData() // Refresh data
      } else {
      }
    } catch (error) {
    } finally {
      setProcessingEvent(null)
    }
  }

  const abandonEvent = async (eventId: string, reason: string) => {
    try {
      setProcessingEvent(eventId)
      const response = await fetch(`/api/admin/webhook-dlq/abandon/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        await loadDashboardData() // Refresh data
      } else {
      }
    } catch (error) {
    } finally {
      setProcessingEvent(null)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'processing':
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'recovered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'abandoned':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMins > 0) return `${diffMins}m ago`
    return 'Just now'
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading webhook DLQ dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhook Dead Letter Queue</h1>
          <p className="text-muted-foreground">
            Monitor and recover failed webhook events with zero data loss
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <AlertTriangle className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalEvents}</div>
              <p className="text-muted-foreground text-xs">All time webhook failures</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.pendingEvents}</div>
              <p className="text-muted-foreground text-xs">Awaiting retry</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recovered</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.recoveredEvents}</div>
              <p className="text-muted-foreground text-xs">Successfully processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <div className="h-4 w-4 rounded-full bg-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
              <Progress value={metrics.successRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Provider Failure Breakdown */}
      {metrics && Object.keys(metrics.failuresByProvider).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Failures by Provider</CardTitle>
            <CardDescription>
              Distribution of failed events across webhook providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Object.entries(metrics.failuresByProvider).map(([provider, count]) => (
                <div key={provider} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-muted-foreground text-sm capitalize">{provider}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({metrics?.pendingEvents || 0})</TabsTrigger>
          <TabsTrigger value="recovered">Recovered ({metrics?.recoveredEvents || 0})</TabsTrigger>
          <TabsTrigger value="abandoned">Abandoned ({metrics?.abandonedEvents || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingEvents.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                <h3 className="text-lg font-semibold">No Pending Events</h3>
                <p className="text-muted-foreground">All webhooks are processing successfully!</p>
              </CardContent>
            </Card>
          ) : (
            pendingEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(event.status)}
                      <CardTitle className="text-lg">{event.eventType}</CardTitle>
                      <Badge variant={getPriorityColor(event.priority)}>{event.priority}</Badge>
                      <Badge variant="outline">{event.sourceProvider}</Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedEvent(event)}>
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => retryEvent(event.id)}
                        disabled={processingEvent === event.id}
                      >
                        {processingEvent === event.id ? (
                          <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="mr-1 h-4 w-4" />
                        )}
                        Retry
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => abandonEvent(event.id, 'Manual abandon from admin')}
                        disabled={processingEvent === event.id}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Abandon
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{event.businessImpact}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div>
                      <span className="font-medium">Attempts:</span>
                      <div>
                        {event.attemptCount} / {event.maxRetries}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Last Attempt:</span>
                      <div>{formatTimeAgo(event.lastAttemptAt)}</div>
                    </div>
                    <div>
                      <span className="font-medium">Next Retry:</span>
                      <div>
                        {event.scheduledRetryAt
                          ? formatTimeAgo(event.scheduledRetryAt)
                          : 'Not scheduled'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Impact:</span>
                      <Badge variant={getPriorityColor(event.impactLevel)}>
                        {event.impactLevel}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="font-medium">Failure Reason:</span>
                    <div className="bg-muted mt-1 rounded p-2 text-sm">{event.failureReason}</div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="recovered" className="space-y-4">
          {recoveredEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(event.status)}
                    <CardTitle className="text-lg">{event.eventType}</CardTitle>
                    <Badge variant="outline">{event.sourceProvider}</Badge>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setSelectedEvent(event)}>
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                  <div>
                    <span className="font-medium">Recovered:</span>
                    <div>{event.recoveredAt ? formatTimeAgo(event.recoveredAt) : 'Unknown'}</div>
                  </div>
                  <div>
                    <span className="font-medium">Attempts:</span>
                    <div>{event.attemptCount}</div>
                  </div>
                  <div>
                    <span className="font-medium">Recovery Method:</span>
                    <div>{event.technicalNotes || 'Unknown'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="abandoned" className="space-y-4">
          {abandonedEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(event.status)}
                    <CardTitle className="text-lg">{event.eventType}</CardTitle>
                    <Badge variant="destructive">Abandoned</Badge>
                    <Badge variant="outline">{event.sourceProvider}</Badge>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setSelectedEvent(event)}>
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                  <div>
                    <span className="font-medium">Abandoned:</span>
                    <div>{event.abandonedAt ? formatTimeAgo(event.abandonedAt) : 'Unknown'}</div>
                  </div>
                  <div>
                    <span className="font-medium">Total Attempts:</span>
                    <div>{event.attemptCount}</div>
                  </div>
                  <div>
                    <span className="font-medium">Reason:</span>
                    <div>{event.technicalNotes || 'Max retries exceeded'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-4xl overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Event Details: {selectedEvent.eventType}</CardTitle>
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Event Information</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div>
                      <span className="font-medium">ID:</span> {selectedEvent.id}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {selectedEvent.eventType}
                    </div>
                    <div>
                      <span className="font-medium">Provider:</span> {selectedEvent.sourceProvider}
                    </div>
                    <div>
                      <span className="font-medium">Priority:</span> {selectedEvent.priority}
                    </div>
                    <div>
                      <span className="font-medium">Impact:</span> {selectedEvent.impactLevel}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {selectedEvent.status}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Processing Details</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div>
                      <span className="font-medium">Created:</span>{' '}
                      {new Date(selectedEvent.createdAt).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Last Attempt:</span>{' '}
                      {new Date(selectedEvent.lastAttemptAt).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Attempts:</span> {selectedEvent.attemptCount} /{' '}
                      {selectedEvent.maxRetries}
                    </div>
                    {selectedEvent.scheduledRetryAt && (
                      <div>
                        <span className="font-medium">Next Retry:</span>{' '}
                        {new Date(selectedEvent.scheduledRetryAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium">Business Impact</h4>
                <div className="bg-muted mt-2 rounded p-3 text-sm">
                  {selectedEvent.businessImpact}
                </div>
              </div>

              <div>
                <h4 className="font-medium">Failure Reason</h4>
                <div className="bg-muted mt-2 rounded p-3 text-sm">
                  {selectedEvent.failureReason}
                </div>
              </div>

              {selectedEvent.stackTrace && (
                <div>
                  <h4 className="font-medium">Stack Trace</h4>
                  <pre className="bg-muted mt-2 max-h-32 overflow-auto rounded p-3 text-xs">
                    {selectedEvent.stackTrace}
                  </pre>
                </div>
              )}

              <div>
                <h4 className="font-medium">Original Headers</h4>
                <pre className="bg-muted mt-2 max-h-32 overflow-auto rounded p-3 text-xs">
                  {JSON.stringify(selectedEvent.originalHeaders, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-medium">Payload</h4>
                <pre className="bg-muted mt-2 max-h-64 overflow-auto rounded p-3 text-xs">
                  {JSON.stringify(selectedEvent.payload, null, 2)}
                </pre>
              </div>

              {selectedEvent.technicalNotes && (
                <div>
                  <h4 className="font-medium">Technical Notes</h4>
                  <div className="bg-muted mt-2 rounded p-3 text-sm">
                    {selectedEvent.technicalNotes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
