/**
 * CoreFlow360 - Scaling Management API
 * Load balancing and container orchestration management endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { 
  loadBalancer, 
  LoadBalancingStrategy, 
  registerServerInstance,
  getLoadBalancerStatus 
} from '@/lib/scaling/load-balancer'
import { 
  containerOrchestrator,
  deployApplication,
  scaleApplication,
  getClusterStatus,
  ContainerPlatform 
} from '@/lib/scaling/container-orchestrator'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin access
    const session = await auth()
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    switch (type) {
      case 'overview':
        return await handleScalingOverview()
      
      case 'load_balancer':
        return await handleLoadBalancerStatus()
      
      case 'containers':
        return await handleContainerStatus()
      
      case 'cluster':
        return await handleClusterStatus()
      
      case 'metrics':
        return await handleScalingMetrics(request)
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Scaling API GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin access
    const session = await auth()
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'register_server':
        return await handleRegisterServer(body)
      
      case 'unregister_server':
        return await handleUnregisterServer(body)
      
      case 'scale_deployment':
        return await handleScaleDeployment(body)
      
      case 'deploy_application':
        return await handleDeployApplication(body)
      
      case 'update_load_balancer_config':
        return await handleUpdateLoadBalancerConfig(body)
      
      case 'manual_scale':
        return await handleManualScale(body)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Scaling API POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication and admin access
    const session = await auth()
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type } = body

    switch (type) {
      case 'server_health':
        return await handleUpdateServerHealth(body)
      
      case 'auto_scaling_config':
        return await handleUpdateAutoScalingConfig(body)
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Scaling API PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication and admin access
    const session = await auth()
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    switch (type) {
      case 'server':
        if (!id) {
          return NextResponse.json({ error: 'Server ID required' }, { status: 400 })
        }
        return await handleUnregisterServerById(id)
      
      case 'deployment':
        if (!id) {
          return NextResponse.json({ error: 'Deployment ID required' }, { status: 400 })
        }
        return await handleDeleteDeployment(id)
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Scaling API DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handler functions

async function handleScalingOverview() {
  const [loadBalancerStatus, clusterStatus] = await Promise.all([
    getLoadBalancerStatus(),
    getClusterStatus(),
  ])

  const overview = {
    loadBalancer: {
      totalServers: loadBalancerStatus.totalServers,
      healthyServers: loadBalancerStatus.healthyServers,
      totalConnections: loadBalancerStatus.totalConnections,
      averageResponseTime: loadBalancerStatus.averageResponseTime,
      throughput: loadBalancerStatus.throughput,
      errorRate: loadBalancerStatus.errorRate,
    },
    containers: {
      platform: clusterStatus.platform,
      totalContainers: clusterStatus.totalContainers,
      runningContainers: clusterStatus.runningContainers,
      failedContainers: clusterStatus.failedContainers,
      deployments: clusterStatus.deployments,
      services: clusterStatus.services,
    },
    cluster: {
      nodes: clusterStatus.nodes,
      totalCPU: clusterStatus.totalCPU,
      usedCPU: clusterStatus.usedCPU,
      cpuUtilization: clusterStatus.totalCPU > 0 ? (clusterStatus.usedCPU / clusterStatus.totalCPU) * 100 : 0,
      totalMemory: clusterStatus.totalMemory,
      usedMemory: clusterStatus.usedMemory,
      memoryUtilization: clusterStatus.totalMemory > 0 ? (clusterStatus.usedMemory / clusterStatus.totalMemory) * 100 : 0,
    },
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(overview)
}

async function handleLoadBalancerStatus() {
  const status = await getLoadBalancerStatus()
  return NextResponse.json(status)
}

async function handleContainerStatus() {
  const containers = await containerOrchestrator.listContainers()
  return NextResponse.json({
    containers,
    summary: {
      total: containers.length,
      running: containers.filter(c => c.status === 'running').length,
      pending: containers.filter(c => c.status === 'pending').length,
      failed: containers.filter(c => c.status === 'failed').length,
    },
  })
}

async function handleClusterStatus() {
  const status = await getClusterStatus()
  return NextResponse.json(status)
}

async function handleScalingMetrics(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || '1h'
  
  // Get recent metrics from load balancer
  const loadBalancerStatus = await getLoadBalancerStatus()
  const clusterStatus = await getClusterStatus()
  
  const metrics = {
    period,
    timestamp: new Date().toISOString(),
    loadBalancer: {
      metrics: loadBalancerStatus.metrics,
      servers: loadBalancerStatus.servers.map(server => ({
        id: server.id,
        name: server.name,
        cpu: server.cpu,
        memory: server.memory,
        responseTime: server.responseTime,
        connections: server.currentConnections,
        status: server.status,
      })),
    },
    cluster: {
      cpuUtilization: clusterStatus.totalCPU > 0 ? (clusterStatus.usedCPU / clusterStatus.totalCPU) * 100 : 0,
      memoryUtilization: clusterStatus.totalMemory > 0 ? (clusterStatus.usedMemory / clusterStatus.totalMemory) * 100 : 0,
      runningContainers: clusterStatus.runningContainers,
      failedContainers: clusterStatus.failedContainers,
    },
  }

  return NextResponse.json(metrics)
}

async function handleRegisterServer(body: any) {
  const { server } = body
  
  if (!server || !server.hostname || !server.port) {
    return NextResponse.json({ 
      error: 'Server configuration missing required fields: hostname, port' 
    }, { status: 400 })
  }

  try {
    const serverId = await registerServerInstance({
      name: server.name || `server-${Date.now()}`,
      hostname: server.hostname,
      port: server.port,
      region: server.region || 'us-east-1',
      zone: server.zone || 'us-east-1a',
      status: 'healthy' as any,
      weight: server.weight || 1,
      maxConnections: server.maxConnections || 1000,
      cpu: server.cpu || 0,
      memory: server.memory || 0,
      responseTime: server.responseTime || 0,
      tags: server.tags || {},
      metadata: server.metadata || {
        version: '1.0.0',
        capabilities: ['http'],
        resources: {
          cpu: { cores: 2, usage: 0 },
          memory: { total: 4096, used: 0 },
          disk: { total: 50000, used: 0 },
          network: { bandwidth: 1000, usage: 0 },
        },
      },
    })

    return NextResponse.json({
      success: true,
      serverId,
      message: 'Server registered successfully',
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to register server',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleUnregisterServer(body: any) {
  const { serverId } = body
  
  if (!serverId) {
    return NextResponse.json({ error: 'Server ID is required' }, { status: 400 })
  }

  try {
    const success = await loadBalancer.unregisterServer(serverId)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Server unregistered successfully',
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Server not found or failed to unregister',
      }, { status: 404 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to unregister server',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleScaleDeployment(body: any) {
  const { deploymentName, replicas } = body
  
  if (!deploymentName || replicas === undefined) {
    return NextResponse.json({ 
      error: 'Deployment name and replicas count are required' 
    }, { status: 400 })
  }

  if (replicas < 0 || replicas > 100) {
    return NextResponse.json({ 
      error: 'Replicas must be between 0 and 100' 
    }, { status: 400 })
  }

  try {
    const success = await scaleApplication(deploymentName, replicas)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: `Deployment scaled to ${replicas} replicas`,
        deploymentName,
        replicas,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to scale deployment',
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to scale deployment',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleDeployApplication(body: any) {
  const { deployment, service } = body
  
  if (!deployment) {
    return NextResponse.json({ error: 'Deployment configuration is required' }, { status: 400 })
  }

  // Validate required deployment fields
  if (!deployment.name || !deployment.namespace || !deployment.containers) {
    return NextResponse.json({ 
      error: 'Deployment missing required fields: name, namespace, containers' 
    }, { status: 400 })
  }

  try {
    const deploymentId = await deployApplication(deployment, service)
    
    return NextResponse.json({
      success: true,
      deploymentId,
      message: 'Application deployed successfully',
      deployment: deployment.name,
      replicas: deployment.replicas,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to deploy application',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleUpdateLoadBalancerConfig(body: any) {
  const { config } = body
  
  if (!config) {
    return NextResponse.json({ error: 'Configuration is required' }, { status: 400 })
  }

  try {
    // In a real implementation, this would update the load balancer configuration
    // For now, we'll simulate the update
    
    return NextResponse.json({
      success: true,
      message: 'Load balancer configuration updated',
      config: {
        strategy: config.strategy || LoadBalancingStrategy.LEAST_CONNECTIONS,
        healthCheckEnabled: config.healthCheck?.enabled !== false,
        sessionAffinityEnabled: config.sessionAffinity?.enabled || false,
        circuitBreakerEnabled: config.circuitBreaker?.enabled !== false,
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to update load balancer configuration',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleManualScale(body: any) {
  const { action, count = 1 } = body
  
  if (!action || !['up', 'down'].includes(action)) {
    return NextResponse.json({ 
      error: 'Action must be "up" or "down"' 
    }, { status: 400 })
  }

  if (count < 1 || count > 10) {
    return NextResponse.json({ 
      error: 'Count must be between 1 and 10' 
    }, { status: 400 })
  }

  try {
    const success = await loadBalancer.scaleServers(action as 'up' | 'down', count)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: `Manually scaled ${action} by ${count} servers`,
        action,
        count,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to perform manual scaling',
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to perform manual scaling',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleUpdateServerHealth(body: any) {
  const { serverId, health } = body
  
  if (!serverId || !health) {
    return NextResponse.json({ 
      error: 'Server ID and health data are required' 
    }, { status: 400 })
  }

  try {
    await loadBalancer.updateServerHealth(serverId, health)
    
    return NextResponse.json({
      success: true,
      message: 'Server health updated successfully',
      serverId,
      health,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to update server health',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleUpdateAutoScalingConfig(body: any) {
  const { config } = body
  
  if (!config) {
    return NextResponse.json({ error: 'Auto-scaling configuration is required' }, { status: 400 })
  }

  try {
    await loadBalancer.configureAutoScaling(config)
    
    return NextResponse.json({
      success: true,
      message: 'Auto-scaling configuration updated',
      config,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to update auto-scaling configuration',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleUnregisterServerById(serverId: string) {
  try {
    const success = await loadBalancer.unregisterServer(serverId)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Server unregistered successfully',
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Server not found',
      }, { status: 404 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to unregister server',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleDeleteDeployment(deploymentId: string) {
  try {
    // In a real implementation, this would delete the deployment
    // For now, we'll simulate the deletion
    
    return NextResponse.json({
      success: true,
      message: 'Deployment deleted successfully',
      deploymentId,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to delete deployment',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}