/**
 * CoreFlow360 - Scaling Management Dashboard
 * Advanced load balancing and container orchestration interface
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { LoadBalancingStrategy } from '@/lib/scaling/load-balancer'

// Data interfaces
interface ScalingOverview {
  loadBalancer: {
    totalServers: number
    healthyServers: number
    totalConnections: number
    averageResponseTime: number
    throughput: number
    errorRate: number
  }
  containers: {
    platform: string
    totalContainers: number
    runningContainers: number
    failedContainers: number
    deployments: number
    services: number
  }
  cluster: {
    nodes: number
    totalCPU: number
    usedCPU: number
    cpuUtilization: number
    totalMemory: number
    usedMemory: number
    memoryUtilization: number
  }
  timestamp: string
}

interface ServerInstance {
  id: string
  name: string
  hostname: string
  port: number
  status: 'healthy' | 'degraded' | 'unhealthy' | 'maintenance'
  cpu: number
  memory: number
  responseTime: number
  currentConnections: number
  maxConnections: number
}

interface ContainerInstance {
  id: string
  name: string
  status: 'pending' | 'running' | 'terminating' | 'failed'
  platform: string
  node: string
  namespace: string
  createdAt: string
  metrics: {
    cpu: number
    memory: number
  }
}

interface ScalingDashboardProps {
  refreshInterval?: number
}

export default function ScalingDashboard({ 
  refreshInterval = 30000 
}: ScalingDashboardProps) {
  const [overview, setOverview] = useState<ScalingOverview | null>(null)
  const [servers, setServers] = useState<ServerInstance[]>([])
  const [containers, setContainers] = useState<ContainerInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'servers' | 'containers' | 'config'>('overview')
  const [showScaleModal, setShowScaleModal] = useState(false)
  const [showDeployModal, setShowDeployModal] = useState(false)
  
  // Form states
  const [scaleForm, setScaleForm] = useState({
    deploymentName: '',
    replicas: 1,
    action: 'up' as 'up' | 'down',
    count: 1,
  })
  
  const [deployForm, setDeployForm] = useState({
    name: '',
    namespace: 'default',
    image: '',
    tag: 'latest',
    replicas: 1,
    port: 3000,
  })

  // Fetch scaling overview
  const fetchOverview = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/scaling?type=overview')
      if (!response.ok) throw new Error('Failed to fetch overview')
      
      const data = await response.json()
      setOverview(data)
    } catch (err) {
      console.error('Overview fetch error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [])

  // Fetch servers
  const fetchServers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/scaling?type=load_balancer')
      if (!response.ok) throw new Error('Failed to fetch servers')
      
      const data = await response.json()
      setServers(data.servers || [])
    } catch (err) {
      console.error('Servers fetch error:', err)
    }
  }, [])

  // Fetch containers
  const fetchContainers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/scaling?type=containers')
      if (!response.ok) throw new Error('Failed to fetch containers')
      
      const data = await response.json()
      setContainers(data.containers || [])
    } catch (err) {
      console.error('Containers fetch error:', err)
    }
  }, [])

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([fetchOverview(), fetchServers(), fetchContainers()])
      setError(null)
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [fetchOverview, fetchServers, fetchContainers])

  // Set up auto-refresh
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, refreshInterval])

  // Handle manual scaling
  const handleManualScale = async () => {
    try {
      const response = await fetch('/api/admin/scaling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manual_scale',
          action: scaleForm.action,
          count: scaleForm.count,
        }),
      })

      if (!response.ok) throw new Error('Failed to scale')
      
      setShowScaleModal(false)
      await fetchData() // Refresh data
    } catch (err) {
      console.error('Manual scaling failed:', err)
    }
  }

  // Handle deployment scaling
  const handleScaleDeployment = async () => {
    try {
      const response = await fetch('/api/admin/scaling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scale_deployment',
          deploymentName: scaleForm.deploymentName,
          replicas: scaleForm.replicas,
        }),
      })

      if (!response.ok) throw new Error('Failed to scale deployment')
      
      setShowScaleModal(false)
      await fetchData() // Refresh data
    } catch (err) {
      console.error('Deployment scaling failed:', err)
    }
  }

  // Handle application deployment
  const handleDeployApplication = async () => {
    try {
      const deployment = {
        name: deployForm.name,
        namespace: deployForm.namespace,
        replicas: deployForm.replicas,
        strategy: {
          type: 'RollingUpdate',
          rollingUpdate: {
            maxSurge: 1,
            maxUnavailable: 1,
          },
        },
        selector: { app: deployForm.name },
        template: {
          metadata: {
            labels: { app: deployForm.name },
          },
        },
        containers: [{
          name: deployForm.name,
          image: deployForm.image,
          tag: deployForm.tag,
          ports: [{ containerPort: deployForm.port, protocol: 'TCP' as const }],
          environment: {
            NODE_ENV: 'production',
            PORT: deployForm.port.toString(),
          },
          resources: {
            requests: { cpu: '100m', memory: '128Mi' },
            limits: { cpu: '500m', memory: '512Mi' },
          },
          volumes: [],
          labels: { app: deployForm.name },
          healthCheck: {
            path: '/health',
            port: deployForm.port,
            initialDelaySeconds: 30,
            periodSeconds: 10,
            timeoutSeconds: 5,
            failureThreshold: 3,
          },
          scaling: {
            minReplicas: 1,
            maxReplicas: 10,
            targetCPU: 70,
            targetMemory: 80,
          },
        }],
      }

      const response = await fetch('/api/admin/scaling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deploy_application',
          deployment,
        }),
      })

      if (!response.ok) throw new Error('Failed to deploy application')
      
      setShowDeployModal(false)
      await fetchData() // Refresh data
    } catch (err) {
      console.error('Application deployment failed:', err)
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy':
      case 'running':
        return 'text-green-600 bg-green-100'
      case 'degraded':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'unhealthy':
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'maintenance':
      case 'terminating':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Scaling Dashboard</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowScaleModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Scale
          </button>
          <button
            onClick={() => setShowDeployModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
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
            { id: 'overview', label: 'Overview' },
            { id: 'servers', label: 'Load Balancer' },
            { id: 'containers', label: 'Containers' },
            { id: 'config', label: 'Configuration' },
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

      {/* Overview Tab */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Load Balancer</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Healthy Servers</span>
                  <span className="text-sm font-medium">{overview.loadBalancer.healthyServers}/{overview.loadBalancer.totalServers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Connections</span>
                  <span className="text-sm font-medium">{overview.loadBalancer.totalConnections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Response</span>
                  <span className="text-sm font-medium">{formatDuration(overview.loadBalancer.averageResponseTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="text-sm font-medium">{(overview.loadBalancer.errorRate * 100).toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Containers</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Running</span>
                  <span className="text-sm font-medium">{overview.containers.runningContainers}/{overview.containers.totalContainers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Platform</span>
                  <span className="text-sm font-medium capitalize">{overview.containers.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Deployments</span>
                  <span className="text-sm font-medium">{overview.containers.deployments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Services</span>
                  <span className="text-sm font-medium">{overview.containers.services}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cluster Resources</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">CPU Usage</span>
                  <span className="text-sm font-medium">{overview.cluster.cpuUtilization.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(overview.cluster.cpuUtilization, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Memory Usage</span>
                  <span className="text-sm font-medium">{overview.cluster.memoryUtilization.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(overview.cluster.memoryUtilization, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Servers Tab */}
      {activeTab === 'servers' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Load Balancer Servers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Server</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Memory</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connections</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {servers.map((server) => (
                  <tr key={server.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{server.name}</div>
                        <div className="text-sm text-gray-500">{server.hostname}:{server.port}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(server.status)}`}>
                        {server.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {server.cpu.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {server.memory.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(server.responseTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {server.currentConnections}/{server.maxConnections}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Containers Tab */}
      {activeTab === 'containers' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Container Instances</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Container</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Node</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Namespace</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Memory</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {containers.map((container) => (
                  <tr key={container.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{container.name}</div>
                      <div className="text-sm text-gray-500">{container.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(container.status)}`}>
                        {container.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {container.node}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {container.namespace}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {container.metrics.cpu.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatBytes(container.metrics.memory * 1024 * 1024)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(container.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Scaling Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Load Balancing Strategy</label>
              <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                <option value={LoadBalancingStrategy.LEAST_CONNECTIONS}>Least Connections</option>
                <option value={LoadBalancingStrategy.ROUND_ROBIN}>Round Robin</option>
                <option value={LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN}>Weighted Round Robin</option>
                <option value={LoadBalancingStrategy.LEAST_RESPONSE_TIME}>Least Response Time</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Instances</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  defaultValue="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Instances</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  defaultValue="20"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Target CPU (%)</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  defaultValue="70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Memory (%)</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  defaultValue="80"
                />
              </div>
            </div>
            
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Update Configuration
            </button>
          </div>
        </div>
      )}

      {/* Scale Modal */}
      {showScaleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Scale Resources</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scale Type</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="manual"
                      className="mr-2"
                      defaultChecked
                    />
                    Manual Scale (Servers)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="deployment"
                      className="mr-2"
                    />
                    Scale Deployment
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select
                  value={scaleForm.action}
                  onChange={(e) => setScaleForm(prev => ({ ...prev, action: e.target.value as 'up' | 'down' }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="up">Scale Up</option>
                  <option value="down">Scale Down</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={scaleForm.count}
                  onChange={(e) => setScaleForm(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowScaleModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleManualScale}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Scale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Deploy Application</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
                <input
                  type="text"
                  value={deployForm.name}
                  onChange={(e) => setDeployForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="my-app"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Docker Image</label>
                <input
                  type="text"
                  value={deployForm.image}
                  onChange={(e) => setDeployForm(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="nginx"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                  <input
                    type="text"
                    value={deployForm.tag}
                    onChange={(e) => setDeployForm(prev => ({ ...prev, tag: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="latest"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                  <input
                    type="number"
                    value={deployForm.port}
                    onChange={(e) => setDeployForm(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Replicas</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={deployForm.replicas}
                  onChange={(e) => setDeployForm(prev => ({ ...prev, replicas: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeployModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeployApplication}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Deploy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}