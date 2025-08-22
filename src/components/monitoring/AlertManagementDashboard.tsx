'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  AlertTriangle, 
  Bell, 
  Settings,
  Plus,
  Edit,
  Trash2,
  TestTube,
  Mail,
  MessageSquare,
  Webhook,
  Phone,
  Zap,
  CheckCircle,
  Clock,
  X
} from 'lucide-react'
import { AlertChannel, alertChannelManager } from '@/lib/monitoring/alert-channels'

interface AlertRule {
  id: string
  name: string
  metric: string
  threshold: number
  comparison: 'gt' | 'lt' | 'eq'
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  cooldown: number
}

interface AlertHistory {
  id: string
  alertId: string
  name: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  resolved: boolean
  resolvedAt?: string
}

export default function AlertManagementDashboard() {
  const [channels, setChannels] = useState<AlertChannel[]>([])
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'channels' | 'rules' | 'history'>('channels')
  
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setChannels(alertChannelManager.getChannels())
      
      // Load alert history
      const response = await fetch('/api/monitoring/alerts/store')
      if (response.ok) {
        const history = await response.json()
        setAlertHistory(history)
      }
    } catch (error) {
      console.error('Failed to load alert data:', error)
    } finally {
      setLoading(false)
    }
  }

  const testChannel = async (channelId: string) => {
    try {
      await alertChannelManager.testChannel(channelId)
      alert('Test alert sent successfully!')
    } catch (error) {
      alert(`Test failed: ${error}`)
    }
  }

  const toggleChannel = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId)
    if (channel) {
      alertChannelManager.updateChannel(channelId, { enabled: !channel.enabled })
      setChannels(alertChannelManager.getChannels())
    }
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail
      case 'slack': return MessageSquare
      case 'webhook': return Webhook
      case 'sms': return Phone
      case 'pagerduty': return Zap
      default: return Bell
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/monitoring/alerts/store', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, resolved: true })
      })
      
      if (response.ok) {
        setAlertHistory(prev => 
          prev.map(alert => 
            alert.alertId === alertId 
              ? { ...alert, resolved: true, resolvedAt: new Date().toISOString() }
              : alert
          )
        )
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Alert Management</h1>
          <p className="text-gray-600">
            Configure alert channels and manage monitoring notifications
          </p>
        </div>
        <Button onClick={loadData}>
          <Settings className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'channels', name: 'Alert Channels', icon: Bell },
            { id: 'history', name: 'Alert History', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 inline mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Alert Channels Tab */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          {/* Channel Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Channels</p>
                    <p className="text-2xl font-bold">{channels.length}</p>
                  </div>
                  <Bell className="w-8 h-8 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Channels</p>
                    <p className="text-2xl font-bold">{channels.filter(c => c.enabled).length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Critical Alerts</p>
                    <p className="text-2xl font-bold">
                      {channels.filter(c => c.severityFilter.includes('critical')).length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Recent Alerts</p>
                    <p className="text-2xl font-bold">{alertHistory.filter(a => !a.resolved).length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert Channels List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Alert Channels</span>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Channel
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channels.map((channel) => {
                  const Icon = getChannelIcon(channel.type)
                  return (
                    <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Icon className="w-6 h-6 text-gray-600" />
                        <div>
                          <h3 className="font-medium">{channel.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{channel.type}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">
                          {channel.severityFilter.map(severity => (
                            <Badge key={severity} className={`mr-1 ${getSeverityColor(severity)}`}>
                              {severity}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={channel.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {channel.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testChannel(channel.id)}
                          >
                            <TestTube className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleChannel(channel.id)}
                          >
                            {channel.enabled ? <X className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </Button>
                          
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No alerts found</p>
                  </div>
                ) : (
                  alertHistory.slice(0, 20).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <AlertTriangle className={`w-5 h-5 ${
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'high' ? 'text-orange-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                        <div>
                          <h3 className="font-medium">{alert.name}</h3>
                          <p className="text-sm text-gray-600">{formatDate(alert.timestamp)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        
                        {alert.resolved ? (
                          <Badge className="bg-green-100 text-green-800">
                            Resolved
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => resolveAlert(alert.alertId)}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}