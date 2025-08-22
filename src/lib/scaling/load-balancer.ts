/**
 * CoreFlow360 - Advanced Load Balancing and Auto-Scaling System
 * Intelligent traffic distribution and automatic scaling capabilities
 */

import { getRedis } from '@/lib/redis/client'
import { productionMonitor } from '@/lib/monitoring/production-alerts'
import { advancedCache } from '@/lib/cache/advanced-cache'

// Load balancing strategies
export enum LoadBalancingStrategy {
  ROUND_ROBIN = 'round_robin',
  LEAST_CONNECTIONS = 'least_connections',
  WEIGHTED_ROUND_ROBIN = 'weighted_round_robin',
  LEAST_RESPONSE_TIME = 'least_response_time',
  IP_HASH = 'ip_hash',
  GEOGRAPHIC = 'geographic',
  HEALTH_BASED = 'health_based',
}

// Server health status
export enum ServerStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  MAINTENANCE = 'maintenance',
  DRAINING = 'draining',
}

// Server instance interface
export interface ServerInstance {
  id: string
  name: string
  hostname: string
  port: number
  region: string
  zone: string
  status: ServerStatus
  weight: number
  currentConnections: number
  maxConnections: number
  cpu: number
  memory: number
  responseTime: number
  lastHealthCheck: Date
  tags: Record<string, string>
  metadata: {
    version: string
    capabilities: string[]
    resources: {
      cpu: { cores: number; usage: number }
      memory: { total: number; used: number }
      disk: { total: number; used: number }
      network: { bandwidth: number; usage: number }
    }
  }
}

// Load balancer configuration
export interface LoadBalancerConfig {
  strategy: LoadBalancingStrategy
  healthCheck: {
    enabled: boolean
    interval: number
    timeout: number
    healthyThreshold: number
    unhealthyThreshold: number
    path: string
    expectedCodes: number[]
  }
  sessionAffinity: {
    enabled: boolean
    cookieName: string
    ttl: number
  }
  circuitBreaker: {
    enabled: boolean
    failureThreshold: number
    recoveryTime: number
    halfOpenRequests: number
  }
  rateLimiting: {
    enabled: boolean
    requestsPerSecond: number
    burstSize: number
  }
  ssl: {
    termination: 'edge' | 'passthrough' | 'reencrypt'
    certificateId?: string
    protocols: string[]
    ciphers: string[]
  }
}

// Auto-scaling configuration
export interface AutoScalingConfig {
  enabled: boolean
  minInstances: number
  maxInstances: number
  targetCPU: number
  targetMemory: number
  targetResponseTime: number
  targetThroughput: number
  scaleUpCooldown: number
  scaleDownCooldown: number
  metrics: {
    cpu: { enabled: boolean; threshold: number }
    memory: { enabled: boolean; threshold: number }
    responseTime: { enabled: boolean; threshold: number }
    throughput: { enabled: boolean; threshold: number }
    errorRate: { enabled: boolean; threshold: number }
  }
  scaling: {
    stepSize: number
    aggressiveness: 'conservative' | 'moderate' | 'aggressive'
    predictive: boolean
  }
}

// Traffic routing rules
export interface RoutingRule {
  id: string
  priority: number
  conditions: {
    path?: string
    method?: string
    headers?: Record<string, string>
    query?: Record<string, string>
    sourceIP?: string[]
    userAgent?: string
    geographic?: string[]
  }
  targets: {
    servers: string[]
    weight: number
    backup?: boolean
  }[]
  actions: {
    redirect?: { url: string; code: number }
    rewrite?: { path: string }
    headers?: { add?: Record<string, string>; remove?: string[] }
  }
}

// Load balancing metrics
export interface LoadBalancingMetrics {
  timestamp: Date
  totalRequests: number
  activeConnections: number
  averageResponseTime: number
  errorRate: number
  throughput: number
  serverMetrics: Record<string, {
    requests: number
    connections: number
    responseTime: number
    errors: number
    cpu: number
    memory: number
  }>
  geographical: Record<string, {
    requests: number
    responseTime: number
  }>
}

export class LoadBalancer {
  private static instance: LoadBalancer
  private servers = new Map<string, ServerInstance>()
  private config: LoadBalancerConfig
  private autoScalingConfig: AutoScalingConfig
  private routingRules: RoutingRule[] = []
  private redis = getRedis()
  private roundRobinIndex = 0
  private circuitBreakers = new Map<string, { failures: number; lastFailure: Date; state: 'closed' | 'open' | 'half-open' }>()
  private sessionStore = new Map<string, string>() // sessionId -> serverId
  private metricsBuffer: LoadBalancingMetrics[] = []
  private isRunning = false

  constructor() {
    this.config = this.getDefaultConfig()
    this.autoScalingConfig = this.getDefaultAutoScalingConfig()
    this.startHealthChecks()
    this.startMetricsCollection()
  }

  static getInstance(): LoadBalancer {
    if (!LoadBalancer.instance) {
      LoadBalancer.instance = new LoadBalancer()
    }
    return LoadBalancer.instance
  }

  /**
   * Register a server instance
   */
  async registerServer(server: Omit<ServerInstance, 'id' | 'currentConnections' | 'lastHealthCheck'>): Promise<string> {
    const serverId = this.generateServerId()
    
    const serverInstance: ServerInstance = {
      ...server,
      id: serverId,
      currentConnections: 0,
      lastHealthCheck: new Date(),
    }

    this.servers.set(serverId, serverInstance)
    
    // Store in Redis for persistence
    if (this.redis) {
      await this.redis.hset('load_balancer:servers', serverId, JSON.stringify(serverInstance))
    }

    // Initialize circuit breaker
    this.circuitBreakers.set(serverId, {
      failures: 0,
      lastFailure: new Date(0),
      state: 'closed',
    })

    console.log(`Server registered: ${serverId} (${server.hostname}:${server.port})`)
    return serverId
  }

  /**
   * Unregister a server instance
   */
  async unregisterServer(serverId: string): Promise<boolean> {
    const server = this.servers.get(serverId)
    if (!server) return false

    // Set server to draining status first
    server.status = ServerStatus.DRAINING
    this.servers.set(serverId, server)

    // Wait for connections to drain
    await this.drainServerConnections(serverId)

    // Remove from active servers
    this.servers.delete(serverId)
    this.circuitBreakers.delete(serverId)

    // Remove from Redis
    if (this.redis) {
      await this.redis.hdel('load_balancer:servers', serverId)
    }

    console.log(`Server unregistered: ${serverId}`)
    return true
  }

  /**
   * Route incoming request to appropriate server
   */
  async routeRequest(request: {
    path: string
    method: string
    headers: Record<string, string>
    sourceIP: string
    sessionId?: string
    userAgent?: string
  }): Promise<ServerInstance | null> {
    try {
      // Apply routing rules first
      const targetServer = await this.applyRoutingRules(request)
      if (targetServer) return targetServer

      // Get healthy servers
      const healthyServers = this.getHealthyServers()
      if (healthyServers.length === 0) {
        throw new Error('No healthy servers available')
      }

      // Apply session affinity if enabled
      if (this.config.sessionAffinity.enabled && request.sessionId) {
        const affinityServerId = this.sessionStore.get(request.sessionId)
        if (affinityServerId) {
          const affinityServer = this.servers.get(affinityServerId)
          if (affinityServer && affinityServer.status === ServerStatus.HEALTHY) {
            await this.incrementServerConnections(affinityServerId)
            return affinityServer
          }
        }
      }

      // Select server based on load balancing strategy
      const selectedServer = await this.selectServer(healthyServers, request)
      if (!selectedServer) {
        throw new Error('Failed to select server')
      }

      // Update session affinity
      if (this.config.sessionAffinity.enabled && request.sessionId) {
        this.sessionStore.set(request.sessionId, selectedServer.id)
      }

      // Increment server connections
      await this.incrementServerConnections(selectedServer.id)

      // Record metrics
      await this.recordRoutingMetrics(selectedServer, request)

      return selectedServer
    } catch (error) {
      console.error('Request routing failed:', error)
      productionMonitor.recordMetric('load_balancer_routing_failed', 1)
      return null
    }
  }

  /**
   * Update server health and metrics
   */
  async updateServerHealth(
    serverId: string,
    health: {
      status: ServerStatus
      cpu: number
      memory: number
      responseTime: number
      connections: number
      errorRate?: number
    }
  ): Promise<void> {
    const server = this.servers.get(serverId)
    if (!server) return

    // Update server metrics
    server.status = health.status
    server.cpu = health.cpu
    server.memory = health.memory
    server.responseTime = health.responseTime
    server.currentConnections = health.connections
    server.lastHealthCheck = new Date()

    this.servers.set(serverId, server)

    // Update circuit breaker based on health
    this.updateCircuitBreaker(serverId, health.errorRate || 0)

    // Store in Redis
    if (this.redis) {
      await this.redis.hset('load_balancer:servers', serverId, JSON.stringify(server))
    }

    // Check auto-scaling triggers
    await this.checkAutoScaling()

    // Record health metrics
    productionMonitor.recordMetric(`server_${serverId}_cpu`, health.cpu)
    productionMonitor.recordMetric(`server_${serverId}_memory`, health.memory)
    productionMonitor.recordMetric(`server_${serverId}_response_time`, health.responseTime)
  }

  /**
   * Get current load balancing status
   */
  async getLoadBalancingStatus(): Promise<{
    totalServers: number
    healthyServers: number
    totalConnections: number
    averageResponseTime: number
    throughput: number
    errorRate: number
    servers: ServerInstance[]
    metrics: LoadBalancingMetrics[]
  }> {
    const servers = Array.from(this.servers.values())
    const healthyServers = servers.filter(s => s.status === ServerStatus.HEALTHY)
    const totalConnections = servers.reduce((sum, s) => sum + s.currentConnections, 0)
    const averageResponseTime = servers.reduce((sum, s) => sum + s.responseTime, 0) / servers.length || 0
    
    // Get recent metrics
    const recentMetrics = this.metricsBuffer.slice(-10)
    
    return {
      totalServers: servers.length,
      healthyServers: healthyServers.length,
      totalConnections,
      averageResponseTime,
      throughput: recentMetrics.reduce((sum, m) => sum + m.throughput, 0) / recentMetrics.length || 0,
      errorRate: recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length || 0,
      servers,
      metrics: recentMetrics,
    }
  }

  /**
   * Configure auto-scaling settings
   */
  async configureAutoScaling(config: Partial<AutoScalingConfig>): Promise<void> {
    this.autoScalingConfig = { ...this.autoScalingConfig, ...config }
    
    // Store configuration
    if (this.redis) {
      await this.redis.set('load_balancer:auto_scaling_config', JSON.stringify(this.autoScalingConfig))
    }

    console.log('Auto-scaling configuration updated:', this.autoScalingConfig)
  }

  /**
   * Add routing rule
   */
  async addRoutingRule(rule: Omit<RoutingRule, 'id'>): Promise<string> {
    const ruleId = this.generateRuleId()
    const routingRule: RoutingRule = { ...rule, id: ruleId }
    
    this.routingRules.push(routingRule)
    this.routingRules.sort((a, b) => a.priority - b.priority)

    // Store in Redis
    if (this.redis) {
      await this.redis.hset('load_balancer:routing_rules', ruleId, JSON.stringify(routingRule))
    }

    return ruleId
  }

  /**
   * Remove routing rule
   */
  async removeRoutingRule(ruleId: string): Promise<boolean> {
    const index = this.routingRules.findIndex(rule => rule.id === ruleId)
    if (index === -1) return false

    this.routingRules.splice(index, 1)

    // Remove from Redis
    if (this.redis) {
      await this.redis.hdel('load_balancer:routing_rules', ruleId)
    }

    return true
  }

  /**
   * Scale servers manually
   */
  async scaleServers(action: 'up' | 'down', count: number = 1): Promise<boolean> {
    try {
      if (action === 'up') {
        return await this.scaleUp(count)
      } else {
        return await this.scaleDown(count)
      }
    } catch (error) {
      console.error('Manual scaling failed:', error)
      return false
    }
  }

  // Private methods

  private getDefaultConfig(): LoadBalancerConfig {
    return {
      strategy: LoadBalancingStrategy.LEAST_CONNECTIONS,
      healthCheck: {
        enabled: true,
        interval: 30000, // 30 seconds
        timeout: 5000, // 5 seconds
        healthyThreshold: 2,
        unhealthyThreshold: 3,
        path: '/health',
        expectedCodes: [200, 201],
      },
      sessionAffinity: {
        enabled: false,
        cookieName: 'lb_session',
        ttl: 3600000, // 1 hour
      },
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        recoveryTime: 60000, // 1 minute
        halfOpenRequests: 3,
      },
      rateLimiting: {
        enabled: true,
        requestsPerSecond: 1000,
        burstSize: 200,
      },
      ssl: {
        termination: 'edge',
        protocols: ['TLSv1.2', 'TLSv1.3'],
        ciphers: [
          'ECDHE-RSA-AES128-GCM-SHA256',
          'ECDHE-RSA-AES256-GCM-SHA384',
          'ECDHE-RSA-CHACHA20-POLY1305',
        ],
      },
    }
  }

  private getDefaultAutoScalingConfig(): AutoScalingConfig {
    return {
      enabled: true,
      minInstances: 2,
      maxInstances: 20,
      targetCPU: 70,
      targetMemory: 80,
      targetResponseTime: 500,
      targetThroughput: 1000,
      scaleUpCooldown: 300000, // 5 minutes
      scaleDownCooldown: 600000, // 10 minutes
      metrics: {
        cpu: { enabled: true, threshold: 70 },
        memory: { enabled: true, threshold: 80 },
        responseTime: { enabled: true, threshold: 500 },
        throughput: { enabled: true, threshold: 1000 },
        errorRate: { enabled: true, threshold: 0.05 },
      },
      scaling: {
        stepSize: 2,
        aggressiveness: 'moderate',
        predictive: false,
      },
    }
  }

  private async selectServer(servers: ServerInstance[], request: any): Promise<ServerInstance | null> {
    switch (this.config.strategy) {
      case LoadBalancingStrategy.ROUND_ROBIN:
        return this.selectRoundRobin(servers)
      
      case LoadBalancingStrategy.LEAST_CONNECTIONS:
        return this.selectLeastConnections(servers)
      
      case LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN:
        return this.selectWeightedRoundRobin(servers)
      
      case LoadBalancingStrategy.LEAST_RESPONSE_TIME:
        return this.selectLeastResponseTime(servers)
      
      case LoadBalancingStrategy.IP_HASH:
        return this.selectByIPHash(servers, request.sourceIP)
      
      case LoadBalancingStrategy.GEOGRAPHIC:
        return this.selectByGeographic(servers, request)
      
      case LoadBalancingStrategy.HEALTH_BASED:
        return this.selectByHealth(servers)
      
      default:
        return this.selectLeastConnections(servers)
    }
  }

  private selectRoundRobin(servers: ServerInstance[]): ServerInstance {
    const server = servers[this.roundRobinIndex % servers.length]
    this.roundRobinIndex++
    return server
  }

  private selectLeastConnections(servers: ServerInstance[]): ServerInstance {
    return servers.reduce((least, current) => 
      current.currentConnections < least.currentConnections ? current : least
    )
  }

  private selectWeightedRoundRobin(servers: ServerInstance[]): ServerInstance {
    const totalWeight = servers.reduce((sum, server) => sum + server.weight, 0)
    let randomWeight = Math.random() * totalWeight
    
    for (const server of servers) {
      randomWeight -= server.weight
      if (randomWeight <= 0) {
        return server
      }
    }
    
    return servers[0] // Fallback
  }

  private selectLeastResponseTime(servers: ServerInstance[]): ServerInstance {
    return servers.reduce((fastest, current) => 
      current.responseTime < fastest.responseTime ? current : fastest
    )
  }

  private selectByIPHash(servers: ServerInstance[], sourceIP: string): ServerInstance {
    const crypto = require('crypto')
    const hash = crypto.createHash('md5').update(sourceIP).digest('hex')
    const index = parseInt(hash.substring(0, 8), 16) % servers.length
    return servers[index]
  }

  private selectByGeographic(servers: ServerInstance[], request: any): ServerInstance {
    // Simplified geographic selection - would use GeoIP in production
    const clientRegion = request.headers['cf-region'] || 'us-east-1'
    const regionalServers = servers.filter(s => s.region === clientRegion)
    
    if (regionalServers.length > 0) {
      return this.selectLeastConnections(regionalServers)
    }
    
    return this.selectLeastConnections(servers)
  }

  private selectByHealth(servers: ServerInstance[]): ServerInstance {
    // Score servers based on health metrics
    const scoredServers = servers.map(server => ({
      server,
      score: this.calculateHealthScore(server),
    }))
    
    scoredServers.sort((a, b) => b.score - a.score)
    return scoredServers[0].server
  }

  private calculateHealthScore(server: ServerInstance): number {
    const cpuScore = Math.max(0, 100 - server.cpu)
    const memoryScore = Math.max(0, 100 - server.memory)
    const responseTimeScore = Math.max(0, 1000 - server.responseTime) / 10
    const connectionScore = Math.max(0, server.maxConnections - server.currentConnections) / server.maxConnections * 100
    
    return (cpuScore + memoryScore + responseTimeScore + connectionScore) / 4
  }

  private getHealthyServers(): ServerInstance[] {
    return Array.from(this.servers.values()).filter(server => {
      const circuitBreaker = this.circuitBreakers.get(server.id)
      return server.status === ServerStatus.HEALTHY && 
             circuitBreaker?.state !== 'open'
    })
  }

  private async applyRoutingRules(request: any): Promise<ServerInstance | null> {
    for (const rule of this.routingRules) {
      if (this.matchesRoutingRule(rule, request)) {
        // Find target servers
        const targetServers = rule.targets
          .flatMap(target => target.servers)
          .map(serverId => this.servers.get(serverId))
          .filter(server => server && server.status === ServerStatus.HEALTHY)

        if (targetServers.length > 0) {
          return this.selectLeastConnections(targetServers as ServerInstance[])
        }
      }
    }
    return null
  }

  private matchesRoutingRule(rule: RoutingRule, request: any): boolean {
    const { conditions } = rule
    
    if (conditions.path && !request.path.match(new RegExp(conditions.path))) {
      return false
    }
    
    if (conditions.method && conditions.method !== request.method) {
      return false
    }
    
    if (conditions.headers) {
      for (const [header, value] of Object.entries(conditions.headers)) {
        if (request.headers[header.toLowerCase()] !== value) {
          return false
        }
      }
    }
    
    return true
  }

  private async incrementServerConnections(serverId: string): Promise<void> {
    const server = this.servers.get(serverId)
    if (server) {
      server.currentConnections++
      this.servers.set(serverId, server)
    }
  }

  private async decrementServerConnections(serverId: string): Promise<void> {
    const server = this.servers.get(serverId)
    if (server && server.currentConnections > 0) {
      server.currentConnections--
      this.servers.set(serverId, server)
    }
  }

  private updateCircuitBreaker(serverId: string, errorRate: number): void {
    const breaker = this.circuitBreakers.get(serverId)
    if (!breaker || !this.config.circuitBreaker.enabled) return

    const now = new Date()

    if (errorRate > 0.1) { // 10% error rate threshold
      breaker.failures++
      breaker.lastFailure = now
      
      if (breaker.failures >= this.config.circuitBreaker.failureThreshold) {
        breaker.state = 'open'
        console.warn(`Circuit breaker opened for server: ${serverId}`)
      }
    } else {
      breaker.failures = Math.max(0, breaker.failures - 1)
    }

    // Check for recovery
    if (breaker.state === 'open' && 
        now.getTime() - breaker.lastFailure.getTime() > this.config.circuitBreaker.recoveryTime) {
      breaker.state = 'half-open'
      console.info(`Circuit breaker half-opened for server: ${serverId}`)
    }

    this.circuitBreakers.set(serverId, breaker)
  }

  private async checkAutoScaling(): Promise<void> {
    if (!this.autoScalingConfig.enabled) return

    const servers = Array.from(this.servers.values())
    const healthyServers = servers.filter(s => s.status === ServerStatus.HEALTHY)
    
    // Calculate average metrics
    const avgCPU = servers.reduce((sum, s) => sum + s.cpu, 0) / servers.length
    const avgMemory = servers.reduce((sum, s) => sum + s.memory, 0) / servers.length
    const avgResponseTime = servers.reduce((sum, s) => sum + s.responseTime, 0) / servers.length

    // Check scale up conditions
    if (healthyServers.length < this.autoScalingConfig.maxInstances) {
      if ((this.autoScalingConfig.metrics.cpu.enabled && avgCPU > this.autoScalingConfig.metrics.cpu.threshold) ||
          (this.autoScalingConfig.metrics.memory.enabled && avgMemory > this.autoScalingConfig.metrics.memory.threshold) ||
          (this.autoScalingConfig.metrics.responseTime.enabled && avgResponseTime > this.autoScalingConfig.metrics.responseTime.threshold)) {
        await this.triggerAutoScale('up')
      }
    }

    // Check scale down conditions
    if (healthyServers.length > this.autoScalingConfig.minInstances) {
      if (avgCPU < this.autoScalingConfig.metrics.cpu.threshold * 0.5 &&
          avgMemory < this.autoScalingConfig.metrics.memory.threshold * 0.5 &&
          avgResponseTime < this.autoScalingConfig.metrics.responseTime.threshold * 0.5) {
        await this.triggerAutoScale('down')
      }
    }
  }

  private async triggerAutoScale(direction: 'up' | 'down'): Promise<void> {
    const now = Date.now()
    const cooldownPeriod = direction === 'up' ? 
      this.autoScalingConfig.scaleUpCooldown : 
      this.autoScalingConfig.scaleDownCooldown

    // Check cooldown (simplified - would need more sophisticated tracking)
    const lastScaleKey = `last_scale_${direction}`
    const lastScale = await this.redis?.get(lastScaleKey)
    if (lastScale && now - parseInt(lastScale) < cooldownPeriod) {
      return
    }

    console.log(`Auto-scaling ${direction} triggered`)
    
    // Record scaling event
    await this.redis?.set(lastScaleKey, now.toString())
    productionMonitor.recordMetric(`auto_scale_${direction}`, 1)

    // In production, this would trigger actual server provisioning/deprovisioning
    if (direction === 'up') {
      await this.scaleUp(this.autoScalingConfig.scaling.stepSize)
    } else {
      await this.scaleDown(this.autoScalingConfig.scaling.stepSize)
    }
  }

  private async scaleUp(count: number): Promise<boolean> {
    console.log(`Scaling up ${count} instances`)
    
    // In production, this would:
    // 1. Provision new server instances (EC2, GKE, etc.)
    // 2. Wait for them to be healthy
    // 3. Register them with the load balancer
    
    // For simulation, create mock servers
    for (let i = 0; i < count; i++) {
      await this.registerServer({
        name: `auto-scaled-${Date.now()}-${i}`,
        hostname: `auto-server-${i}.example.com`,
        port: 3000,
        region: 'us-east-1',
        zone: 'us-east-1a',
        status: ServerStatus.HEALTHY,
        weight: 1,
        maxConnections: 1000,
        cpu: 30,
        memory: 40,
        responseTime: 100,
        tags: { 'auto-scaled': 'true' },
        metadata: {
          version: '1.0.0',
          capabilities: ['http', 'websocket'],
          resources: {
            cpu: { cores: 4, usage: 30 },
            memory: { total: 8192, used: 3276 },
            disk: { total: 100000, used: 20000 },
            network: { bandwidth: 1000, usage: 100 },
          },
        },
      })
    }

    return true
  }

  private async scaleDown(count: number): Promise<boolean> {
    console.log(`Scaling down ${count} instances`)
    
    const autoScaledServers = Array.from(this.servers.values())
      .filter(server => server.tags['auto-scaled'] === 'true')
      .sort((a, b) => a.currentConnections - b.currentConnections)

    const serversToRemove = autoScaledServers.slice(0, Math.min(count, autoScaledServers.length))
    
    for (const server of serversToRemove) {
      await this.unregisterServer(server.id)
    }

    return true
  }

  private startHealthChecks(): void {
    if (!this.config.healthCheck.enabled) return

    setInterval(async () => {
      await this.performHealthChecks()
    }, this.config.healthCheck.interval)
  }

  private async performHealthChecks(): Promise<void> {
    const servers = Array.from(this.servers.values())
    
    const healthCheckPromises = servers.map(server => this.healthCheckServer(server))
    await Promise.allSettled(healthCheckPromises)
  }

  private async healthCheckServer(server: ServerInstance): Promise<void> {
    try {
      const start = Date.now()
      
      // Simulate health check (in production, would make HTTP request)
      const isHealthy = Math.random() > 0.05 // 95% success rate
      const responseTime = Date.now() - start

      await this.updateServerHealth(server.id, {
        status: isHealthy ? ServerStatus.HEALTHY : ServerStatus.UNHEALTHY,
        cpu: server.cpu,
        memory: server.memory,
        responseTime,
        connections: server.currentConnections,
        errorRate: isHealthy ? 0 : 0.1,
      })
    } catch (error) {
      console.error(`Health check failed for server ${server.id}:`, error)
      await this.updateServerHealth(server.id, {
        status: ServerStatus.UNHEALTHY,
        cpu: server.cpu,
        memory: server.memory,
        responseTime: 5000, // Timeout
        connections: server.currentConnections,
        errorRate: 1.0,
      })
    }
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.collectMetrics()
    }, 30000) // Every 30 seconds
  }

  private async collectMetrics(): Promise<void> {
    const servers = Array.from(this.servers.values())
    const metrics: LoadBalancingMetrics = {
      timestamp: new Date(),
      totalRequests: 0,
      activeConnections: servers.reduce((sum, s) => sum + s.currentConnections, 0),
      averageResponseTime: servers.reduce((sum, s) => sum + s.responseTime, 0) / servers.length || 0,
      errorRate: 0,
      throughput: 0,
      serverMetrics: {},
      geographical: {},
    }

    servers.forEach(server => {
      metrics.serverMetrics[server.id] = {
        requests: 0, // Would be tracked from actual routing
        connections: server.currentConnections,
        responseTime: server.responseTime,
        errors: 0,
        cpu: server.cpu,
        memory: server.memory,
      }
    })

    this.metricsBuffer.push(metrics)
    
    // Keep only last 100 metrics entries
    if (this.metricsBuffer.length > 100) {
      this.metricsBuffer = this.metricsBuffer.slice(-100)
    }

    // Store in Redis for persistence
    if (this.redis) {
      await this.redis.lpush('load_balancer:metrics', JSON.stringify(metrics))
      await this.redis.ltrim('load_balancer:metrics', 0, 999) // Keep last 1000 entries
    }
  }

  private async recordRoutingMetrics(server: ServerInstance, request: any): Promise<void> {
    // Record routing decision metrics
    productionMonitor.recordMetric('load_balancer_request_routed', 1)
    productionMonitor.recordMetric(`load_balancer_server_${server.id}_requests`, 1)
  }

  private async drainServerConnections(serverId: string): Promise<void> {
    const server = this.servers.get(serverId)
    if (!server) return

    // Wait for connections to drain (simplified)
    while (server.currentConnections > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log(`Draining server ${serverId}: ${server.currentConnections} connections remaining`)
    }
  }

  private generateServerId(): string {
    return `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Singleton instance
export const loadBalancer = LoadBalancer.getInstance()

// Utility functions
export async function registerServerInstance(config: Omit<ServerInstance, 'id' | 'currentConnections' | 'lastHealthCheck'>): Promise<string> {
  return loadBalancer.registerServer(config)
}

export async function getLoadBalancerStatus() {
  return loadBalancer.getLoadBalancingStatus()
}

export async function routeRequest(request: any): Promise<ServerInstance | null> {
  return loadBalancer.routeRequest(request)
}