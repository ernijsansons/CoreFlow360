/**
 * CoreFlow360 - Multi-Tenant Scalability Orchestrator
 * Enterprise-grade scalability architecture for handling massive concurrent tenants
 * with automatic scaling, resource management, and performance optimization
 */

import { EventEmitter } from 'events'
import { performance } from 'perf_hooks'

export interface TenantMetrics {
  tenantId: string
  name: string
  plan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM'
  userCount: number
  storageUsage: number // MB
  requestsPerMinute: number
  averageResponseTime: number
  errorRate: number
  activeConnections: number
  databaseConnections: number
  lastActive: Date
  region: string
  tier: 'HOT' | 'WARM' | 'COLD'
  resources: {
    cpu: number // percentage
    memory: number // MB
    bandwidth: number // MB/s
    storage: number // MB
  }
  limits: {
    maxUsers: number
    maxStorage: number // MB
    maxRequestsPerMinute: number
    maxConnections: number
  }
  features: {
    aiModules: string[]
    integrations: string[]
    customDomains: boolean
    whiteLabeling: boolean
    sso: boolean
    auditLogs: boolean
  }
}

export interface ScalingEvent {
  id: string
  tenantId: string
  type: 'SCALE_UP' | 'SCALE_DOWN' | 'MIGRATE' | 'ARCHIVE' | 'RESOURCE_ALERT'
  trigger: 'CPU_THRESHOLD' | 'MEMORY_THRESHOLD' | 'REQUEST_VOLUME' | 'USER_GROWTH' | 'MANUAL'
  timestamp: Date
  metadata: {
    previousResources?: TenantMetrics['resources']
    newResources?: TenantMetrics['resources']
    reason: string
    autoScaled: boolean
    costImpact?: number
  }
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  duration?: number
}

export interface ResourcePool {
  region: string
  tier: 'HOT' | 'WARM' | 'COLD'
  total: {
    cpu: number // cores
    memory: number // GB
    storage: number // TB
    bandwidth: number // GB/s
  }
  allocated: {
    cpu: number
    memory: number
    storage: number
    bandwidth: number
  }
  available: {
    cpu: number
    memory: number
    storage: number
    bandwidth: number
  }
  cost: {
    cpuPerHour: number
    memoryPerGBHour: number
    storagePerGBMonth: number
    bandwidthPerGB: number
  }
  health: 'HEALTHY' | 'WARNING' | 'CRITICAL'
}

export interface ShardingStrategy {
  strategy: 'TENANT_ID_HASH' | 'GEOGRAPHIC' | 'USAGE_BASED' | 'CUSTOM'
  shardCount: number
  shards: Array<{
    id: string
    tenants: string[]
    capacity: number
    currentLoad: number
    region: string
    status: 'ACTIVE' | 'READONLY' | 'MIGRATING' | 'MAINTENANCE'
  }>
  rebalancing: {
    enabled: boolean
    lastRebalance: Date
    nextScheduled: Date
    threshold: number // percentage imbalance to trigger
  }
}

export interface CachingStrategy {
  layers: Array<{
    name: string
    type: 'REDIS' | 'MEMCACHED' | 'CDN' | 'APPLICATION'
    ttl: number
    maxSize: number // MB
    hitRate: number
    regions: string[]
  }>
  policies: {
    tenantData: 'PER_TENANT' | 'SHARED' | 'HYBRID'
    sessionData: 'DISTRIBUTED' | 'STICKY' | 'REPLICATED'
    staticAssets: 'GLOBAL_CDN' | 'REGIONAL_CDN' | 'EDGE_CACHE'
  }
  invalidation: {
    strategy: 'TTL' | 'EVENT_DRIVEN' | 'MANUAL' | 'HYBRID'
    crossRegionSync: boolean
    batchUpdates: boolean
  }
}

export class MultiTenantScalabilityOrchestrator extends EventEmitter {
  private tenants: Map<string, TenantMetrics> = new Map()
  private resourcePools: Map<string, ResourcePool> = new Map()
  private scalingEvents: ScalingEvent[] = []
  private shardingStrategy: ShardingStrategy
  private cachingStrategy: CachingStrategy
  private isMonitoring = false
  private monitoringInterval?: NodeJS.Timeout
  private autoScalingEnabled = true

  constructor() {
    super()
    this.initializeResourcePools()
    this.initializeShardingStrategy()
    this.initializeCachingStrategy()
    this.startMonitoring()
  }

  /**
   * Analyze tenant resource usage and generate scaling recommendations
   */
  async analyzeScalabilityRequirements(): Promise<{
    totalTenants: number
    activeTenants: number
    resourceUtilization: {
      cpu: number
      memory: number
      storage: number
      bandwidth: number
    }
    scalingRecommendations: Array<{
      tenantId: string
      action: 'SCALE_UP' | 'SCALE_DOWN' | 'MIGRATE' | 'OPTIMIZE'
      reason: string
      impact: 'LOW' | 'MEDIUM' | 'HIGH'
      costChange: number
      timeline: string
    }>
    infrastructureNeeds: Array<{
      region: string
      resourceType: 'CPU' | 'MEMORY' | 'STORAGE' | 'BANDWIDTH'
      currentCapacity: number
      projectedNeed: number
      urgency: 'LOW' | 'MEDIUM' | 'HIGH'
    }>
  }> {
    const totalTenants = this.tenants.size
    const activeTenants = Array.from(this.tenants.values()).filter(
      (t) => t.lastActive > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length

    // Calculate aggregate resource utilization
    const totalResources = Array.from(this.tenants.values()).reduce(
      (acc, tenant) => ({
        cpu: acc.cpu + tenant.resources.cpu,
        memory: acc.memory + tenant.resources.memory,
        storage: acc.storage + tenant.resources.storage,
        bandwidth: acc.bandwidth + tenant.resources.bandwidth,
      }),
      { cpu: 0, memory: 0, storage: 0, bandwidth: 0 }
    )

    // Generate scaling recommendations
    const scalingRecommendations = await this.generateScalingRecommendations()

    // Analyze infrastructure needs
    const infrastructureNeeds = this.analyzeInfrastructureNeeds()

    const resourceUtilization = {
      cpu: Math.round((totalResources.cpu / this.getTotalPoolCapacity('cpu')) * 100),
      memory: Math.round((totalResources.memory / this.getTotalPoolCapacity('memory')) * 100),
      storage: Math.round((totalResources.storage / this.getTotalPoolCapacity('storage')) * 100),
      bandwidth: Math.round(
        (totalResources.bandwidth / this.getTotalPoolCapacity('bandwidth')) * 100
      ),
    }

    return {
      totalTenants,
      activeTenants,
      resourceUtilization,
      scalingRecommendations,
      infrastructureNeeds,
    }
  }

  /**
   * Design optimal tenant distribution and sharding strategy
   */
  async optimizeTenantDistribution(): Promise<{
    currentDistribution: Array<{
      shardId: string
      tenantCount: number
      loadPercentage: number
      region: string
      recommendation: string
    }>
    rebalancingPlan: Array<{
      tenantId: string
      fromShard: string
      toShard: string
      reason: string
      estimatedDowntime: number
      complexity: 'LOW' | 'MEDIUM' | 'HIGH'
    }>
    performanceImpact: {
      queryLatencyImprovement: number
      throughputIncrease: number
      resourceEfficiency: number
    }
  }> {
    // Analyze current shard distribution
    const currentDistribution = this.shardingStrategy.shards.map((shard) => ({
      shardId: shard.id,
      tenantCount: shard.tenants.length,
      loadPercentage: Math.round((shard.currentLoad / shard.capacity) * 100),
      region: shard.region,
      recommendation: this.generateShardRecommendation(shard),
    }))

    // Generate rebalancing plan
    const rebalancingPlan = this.generateRebalancingPlan()

    // Estimate performance impact
    const performanceImpact = this.estimatePerformanceImpact(rebalancingPlan)

    return {
      currentDistribution,
      rebalancingPlan,
      performanceImpact,
    }
  }

  /**
   * Implement auto-scaling for tenant resources
   */
  async executeAutoScaling(): Promise<{
    scaleUpActions: number
    scaleDownActions: number
    migratedTenants: number
    totalCostImpact: number
    failedActions: Array<{
      tenantId: string
      action: string
      error: string
    }>
  }> {
    let scaleUpActions = 0
    let scaleDownActions = 0
    let migratedTenants = 0
    let totalCostImpact = 0
    const failedActions: Array<{ tenantId: string; action: string; error: string }> = []

    if (!this.autoScalingEnabled) {
      return { scaleUpActions, scaleDownActions, migratedTenants, totalCostImpact, failedActions }
    }

    for (const [tenantId, tenant] of this.tenants.entries()) {
      try {
        const scalingDecision = this.evaluateScalingDecision(tenant)

        if (scalingDecision.action !== 'NONE') {
          const scalingEvent = await this.executeScalingAction(tenant, scalingDecision)

          switch (scalingDecision.action) {
            case 'SCALE_UP':
              scaleUpActions++
              break
            case 'SCALE_DOWN':
              scaleDownActions++
              break
            case 'MIGRATE':
              migratedTenants++
              break
          }

          totalCostImpact += scalingEvent.metadata.costImpact || 0
        }
      } catch (error) {
        failedActions.push({
          tenantId,
          action: 'AUTO_SCALE',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    this.emit('autoScalingCompleted', {
      scaleUpActions,
      scaleDownActions,
      migratedTenants,
      totalCostImpact,
    })

    return { scaleUpActions, scaleDownActions, migratedTenants, totalCostImpact, failedActions }
  }

  /**
   * Monitor tenant performance and resource usage
   */
  private async monitorTenants(): Promise<void> {
    for (const [tenantId, tenant] of this.tenants.entries()) {
      // Simulate real-time metrics collection
      const updatedMetrics = this.collectTenantMetrics(tenantId)
      this.tenants.set(tenantId, { ...tenant, ...updatedMetrics })

      // Check for threshold violations
      this.checkResourceThresholds(tenant)

      // Update tenant tier based on activity
      this.updateTenantTier(tenant)
    }

    // Update resource pool utilization
    this.updateResourcePools()

    // Check for rebalancing needs
    if (this.shouldRebalanceShards()) {
      this.emit('rebalancingRequired')
    }
  }

  /**
   * Generate scaling recommendations for tenants
   */
  private async generateScalingRecommendations(): Promise<
    Array<{
      tenantId: string
      action: 'SCALE_UP' | 'SCALE_DOWN' | 'MIGRATE' | 'OPTIMIZE'
      reason: string
      impact: 'LOW' | 'MEDIUM' | 'HIGH'
      costChange: number
      timeline: string
    }>
  > {
    const recommendations = []

    for (const [tenantId, tenant] of this.tenants.entries()) {
      // CPU threshold analysis
      if (tenant.resources.cpu > 85) {
        recommendations.push({
          tenantId,
          action: 'SCALE_UP' as const,
          reason: `CPU utilization at ${tenant.resources.cpu}% - needs additional resources`,
          impact: 'HIGH' as const,
          costChange: this.calculateCostChange(tenant, 'SCALE_UP'),
          timeline: 'Immediate',
        })
      } else if (tenant.resources.cpu < 20 && tenant.plan !== 'STARTER') {
        recommendations.push({
          tenantId,
          action: 'SCALE_DOWN' as const,
          reason: `CPU utilization at ${tenant.resources.cpu}% - over-provisioned`,
          impact: 'LOW' as const,
          costChange: this.calculateCostChange(tenant, 'SCALE_DOWN'),
          timeline: '1-2 weeks',
        })
      }

      // Memory threshold analysis
      if (tenant.resources.memory > tenant.limits.maxStorage * 0.9) {
        recommendations.push({
          tenantId,
          action: 'SCALE_UP' as const,
          reason: `Memory usage at ${Math.round((tenant.resources.memory / tenant.limits.maxStorage) * 100)}% of limit`,
          impact: 'HIGH' as const,
          costChange: this.calculateCostChange(tenant, 'SCALE_UP'),
          timeline: 'Immediate',
        })
      }

      // Geographic optimization
      if (tenant.averageResponseTime > 500 && tenant.tier === 'HOT') {
        recommendations.push({
          tenantId,
          action: 'MIGRATE' as const,
          reason: `High latency (${tenant.averageResponseTime}ms) - consider regional migration`,
          impact: 'MEDIUM' as const,
          costChange: 0,
          timeline: '2-4 weeks',
        })
      }

      // Usage pattern optimization
      if (tenant.errorRate > 2 && tenant.requestsPerMinute > 1000) {
        recommendations.push({
          tenantId,
          action: 'OPTIMIZE' as const,
          reason: `High error rate (${tenant.errorRate}%) with heavy usage - optimization needed`,
          impact: 'MEDIUM' as const,
          costChange: -50, // Cost savings through optimization
          timeline: '1 week',
        })
      }
    }

    return recommendations
  }

  /**
   * Evaluate scaling decision for a tenant
   */
  private evaluateScalingDecision(tenant: TenantMetrics): {
    action: 'SCALE_UP' | 'SCALE_DOWN' | 'MIGRATE' | 'NONE'
    reason: string
    urgency: 'LOW' | 'MEDIUM' | 'HIGH'
  } {
    // High CPU utilization
    if (tenant.resources.cpu > 90) {
      return {
        action: 'SCALE_UP',
        reason: 'CPU utilization critical',
        urgency: 'HIGH',
      }
    }

    // High memory utilization
    if (tenant.resources.memory > tenant.limits.maxStorage * 0.95) {
      return {
        action: 'SCALE_UP',
        reason: 'Memory approaching limit',
        urgency: 'HIGH',
      }
    }

    // Request rate exceeding limits
    if (tenant.requestsPerMinute > tenant.limits.maxRequestsPerMinute * 0.9) {
      return {
        action: 'SCALE_UP',
        reason: 'Request rate approaching limit',
        urgency: 'MEDIUM',
      }
    }

    // Under-utilization (only for paid plans)
    if (
      tenant.plan !== 'STARTER' &&
      tenant.resources.cpu < 15 &&
      tenant.resources.memory < tenant.limits.maxStorage * 0.3
    ) {
      return {
        action: 'SCALE_DOWN',
        reason: 'Resources under-utilized',
        urgency: 'LOW',
      }
    }

    // High latency in hot tier
    if (tenant.tier === 'HOT' && tenant.averageResponseTime > 1000) {
      return {
        action: 'MIGRATE',
        reason: 'High latency requiring resource optimization',
        urgency: 'MEDIUM',
      }
    }

    return {
      action: 'NONE',
      reason: 'No scaling action needed',
      urgency: 'LOW',
    }
  }

  /**
   * Execute scaling action for a tenant
   */
  private async executeScalingAction(
    tenant: TenantMetrics,
    decision: ReturnType<typeof this.evaluateScalingDecision>
  ): Promise<ScalingEvent> {
    const scalingEvent: ScalingEvent = {
      id: `scale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId: tenant.tenantId,
      type: decision.action as unknown,
      trigger: this.determineTrigger(decision.reason),
      timestamp: new Date(),
      metadata: {
        previousResources: { ...tenant.resources },
        reason: decision.reason,
        autoScaled: true,
      },
      status: 'PENDING',
    }

    try {
      scalingEvent.status = 'IN_PROGRESS'
      const startTime = performance.now()

      // Simulate scaling operation
      const newResources = this.calculateNewResources(tenant, decision.action)
      scalingEvent.metadata.newResources = newResources
      scalingEvent.metadata.costImpact = this.calculateCostChange(tenant, decision.action)

      // Update tenant resources
      tenant.resources = newResources
      this.tenants.set(tenant.tenantId, tenant)

      const endTime = performance.now()
      scalingEvent.duration = endTime - startTime
      scalingEvent.status = 'COMPLETED'
    } catch (error) {
      scalingEvent.status = 'FAILED'
      scalingEvent.metadata.error = error instanceof Error ? error.message : 'Unknown error'
    }

    this.scalingEvents.push(scalingEvent)
    this.emit('scalingEvent', scalingEvent)

    return scalingEvent
  }

  // Utility methods and initialization

  private initializeResourcePools(): void {
    const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']

    regions.forEach((region) => {
      this.resourcePools.set(region, {
        region,
        tier: 'HOT',
        total: {
          cpu: 1000, // cores
          memory: 4000, // GB
          storage: 100, // TB
          bandwidth: 10, // GB/s
        },
        allocated: {
          cpu: Math.floor(Math.random() * 700) + 200,
          memory: Math.floor(Math.random() * 2800) + 800,
          storage: Math.floor(Math.random() * 70) + 20,
          bandwidth: Math.floor(Math.random() * 7) + 2,
        },
        available: { cpu: 0, memory: 0, storage: 0, bandwidth: 0 },
        cost: {
          cpuPerHour: 0.05,
          memoryPerGBHour: 0.01,
          storagePerGBMonth: 0.001,
          bandwidthPerGB: 0.09,
        },
        health: 'HEALTHY',
      })
    })

    this.updateResourcePools()
  }

  private initializeShardingStrategy(): void {
    this.shardingStrategy = {
      strategy: 'TENANT_ID_HASH',
      shardCount: 8,
      shards: Array.from({ length: 8 }, (_, i) => ({
        id: `shard_${i}`,
        tenants: [],
        capacity: 1000,
        currentLoad: Math.floor(Math.random() * 600) + 200,
        region: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'][i % 4],
        status: 'ACTIVE' as const,
      })),
      rebalancing: {
        enabled: true,
        lastRebalance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000),
        threshold: 20, // 20% imbalance threshold
      },
    }
  }

  private initializeCachingStrategy(): void {
    this.cachingStrategy = {
      layers: [
        {
          name: 'Application Cache',
          type: 'REDIS',
          ttl: 300, // 5 minutes
          maxSize: 1024, // 1GB
          hitRate: 85,
          regions: ['us-east-1', 'us-west-2', 'eu-west-1'],
        },
        {
          name: 'Session Cache',
          type: 'REDIS',
          ttl: 1800, // 30 minutes
          maxSize: 512, // 512MB
          hitRate: 95,
          regions: ['us-east-1', 'us-west-2', 'eu-west-1'],
        },
        {
          name: 'CDN',
          type: 'CDN',
          ttl: 86400, // 24 hours
          maxSize: 10240, // 10GB
          hitRate: 90,
          regions: ['global'],
        },
      ],
      policies: {
        tenantData: 'PER_TENANT',
        sessionData: 'DISTRIBUTED',
        staticAssets: 'GLOBAL_CDN',
      },
      invalidation: {
        strategy: 'EVENT_DRIVEN',
        crossRegionSync: true,
        batchUpdates: true,
      },
    }
  }

  private startMonitoring(): void {
    this.isMonitoring = true

    // Generate sample tenant data
    this.generateSampleTenants()

    this.monitoringInterval = setInterval(async () => {
      if (this.isMonitoring) {
        await this.monitorTenants()
      }
    }, 30000) // Every 30 seconds
  }

  private generateSampleTenants(): void {
    const plans: TenantMetrics['plan'][] = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM']
    const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']
    const tiers: TenantMetrics['tier'][] = ['HOT', 'WARM', 'COLD']

    for (let i = 0; i < 50; i++) {
      const plan = plans[Math.floor(Math.random() * plans.length)]
      const region = regions[Math.floor(Math.random() * regions.length)]
      const tier = tiers[Math.floor(Math.random() * tiers.length)]

      const tenant: TenantMetrics = {
        tenantId: `tenant_${i + 1}`,
        name: `Company ${i + 1}`,
        plan,
        userCount: Math.floor(Math.random() * 1000) + 10,
        storageUsage: Math.floor(Math.random() * 5000) + 100,
        requestsPerMinute: Math.floor(Math.random() * 1000) + 50,
        averageResponseTime: Math.floor(Math.random() * 800) + 100,
        errorRate: Math.random() * 5,
        activeConnections: Math.floor(Math.random() * 100) + 5,
        databaseConnections: Math.floor(Math.random() * 50) + 2,
        lastActive: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000),
        region,
        tier,
        resources: {
          cpu: Math.floor(Math.random() * 80) + 10,
          memory: Math.floor(Math.random() * 2000) + 500,
          bandwidth: Math.floor(Math.random() * 100) + 10,
          storage: Math.floor(Math.random() * 5000) + 1000,
        },
        limits: this.getPlanLimits(plan),
        features: this.getPlanFeatures(plan),
      }

      this.tenants.set(tenant.tenantId, tenant)
    }
  }

  private getPlanLimits(plan: TenantMetrics['plan']): TenantMetrics['limits'] {
    switch (plan) {
      case 'STARTER':
        return {
          maxUsers: 10,
          maxStorage: 1000, // 1GB
          maxRequestsPerMinute: 100,
          maxConnections: 10,
        }
      case 'PROFESSIONAL':
        return {
          maxUsers: 100,
          maxStorage: 10000, // 10GB
          maxRequestsPerMinute: 1000,
          maxConnections: 50,
        }
      case 'ENTERPRISE':
        return {
          maxUsers: 1000,
          maxStorage: 100000, // 100GB
          maxRequestsPerMinute: 10000,
          maxConnections: 200,
        }
      case 'CUSTOM':
        return {
          maxUsers: 10000,
          maxStorage: 1000000, // 1TB
          maxRequestsPerMinute: 100000,
          maxConnections: 1000,
        }
    }
  }

  private getPlanFeatures(plan: TenantMetrics['plan']): TenantMetrics['features'] {
    switch (plan) {
      case 'STARTER':
        return {
          aiModules: ['basic-crm'],
          integrations: ['email'],
          customDomains: false,
          whiteLabeling: false,
          sso: false,
          auditLogs: false,
        }
      case 'PROFESSIONAL':
        return {
          aiModules: ['crm', 'accounting', 'hr'],
          integrations: ['email', 'calendar', 'storage'],
          customDomains: true,
          whiteLabeling: false,
          sso: false,
          auditLogs: true,
        }
      case 'ENTERPRISE':
        return {
          aiModules: ['crm', 'accounting', 'hr', 'projects', 'analytics'],
          integrations: ['email', 'calendar', 'storage', 'erp', 'bi'],
          customDomains: true,
          whiteLabeling: true,
          sso: true,
          auditLogs: true,
        }
      case 'CUSTOM':
        return {
          aiModules: ['all'],
          integrations: ['unlimited'],
          customDomains: true,
          whiteLabeling: true,
          sso: true,
          auditLogs: true,
        }
    }
  }

  private collectTenantMetrics(_tenantId: string): Partial<TenantMetrics> {
    // Simulate real-time metrics with some variation
    return {
      requestsPerMinute: Math.floor(Math.random() * 200) + 50,
      averageResponseTime: Math.floor(Math.random() * 100) + 100,
      errorRate: Math.random() * 3,
      activeConnections: Math.floor(Math.random() * 20) + 5,
      resources: {
        cpu: Math.floor(Math.random() * 30) + 30,
        memory: Math.floor(Math.random() * 500) + 500,
        bandwidth: Math.floor(Math.random() * 50) + 10,
        storage: Math.floor(Math.random() * 1000) + 1000,
      },
      lastActive: new Date(),
    }
  }

  private checkResourceThresholds(tenant: TenantMetrics): void {
    // CPU threshold
    if (tenant.resources.cpu > 90) {
      this.emit('resourceAlert', {
        tenantId: tenant.tenantId,
        type: 'CPU_HIGH',
        value: tenant.resources.cpu,
        threshold: 90,
      })
    }

    // Memory threshold
    if (tenant.resources.memory > tenant.limits.maxStorage * 0.9) {
      this.emit('resourceAlert', {
        tenantId: tenant.tenantId,
        type: 'MEMORY_HIGH',
        value: tenant.resources.memory,
        threshold: tenant.limits.maxStorage * 0.9,
      })
    }

    // Request rate threshold
    if (tenant.requestsPerMinute > tenant.limits.maxRequestsPerMinute * 0.8) {
      this.emit('resourceAlert', {
        tenantId: tenant.tenantId,
        type: 'REQUEST_RATE_HIGH',
        value: tenant.requestsPerMinute,
        threshold: tenant.limits.maxRequestsPerMinute * 0.8,
      })
    }
  }

  private updateTenantTier(tenant: TenantMetrics): void {
    const hoursInactive = (Date.now() - tenant.lastActive.getTime()) / (1000 * 60 * 60)

    if (hoursInactive > 168) {
      // 1 week
      tenant.tier = 'COLD'
    } else if (hoursInactive > 24) {
      // 1 day
      tenant.tier = 'WARM'
    } else {
      tenant.tier = 'HOT'
    }
  }

  private updateResourcePools(): void {
    for (const [region, pool] of this.resourcePools.entries()) {
      pool.available = {
        cpu: pool.total.cpu - pool.allocated.cpu,
        memory: pool.total.memory - pool.allocated.memory,
        storage: pool.total.storage - pool.allocated.storage,
        bandwidth: pool.total.bandwidth - pool.allocated.bandwidth,
      }

      // Update health status
      const utilizationPercent = Math.max(
        (pool.allocated.cpu / pool.total.cpu) * 100,
        (pool.allocated.memory / pool.total.memory) * 100,
        (pool.allocated.storage / pool.total.storage) * 100
      )

      if (utilizationPercent > 90) {
        pool.health = 'CRITICAL'
      } else if (utilizationPercent > 75) {
        pool.health = 'WARNING'
      } else {
        pool.health = 'HEALTHY'
      }
    }
  }

  private shouldRebalanceShards(): boolean {
    const loads = this.shardingStrategy.shards.map((s) => s.currentLoad / s.capacity)
    const maxLoad = Math.max(...loads)
    const minLoad = Math.min(...loads)
    const imbalance = ((maxLoad - minLoad) / maxLoad) * 100

    return imbalance > this.shardingStrategy.rebalancing.threshold
  }

  private generateShardRecommendation(shard: (typeof this.shardingStrategy.shards)[0]): string {
    const loadPercent = (shard.currentLoad / shard.capacity) * 100

    if (loadPercent > 85) {
      return 'Scale up or migrate tenants to reduce load'
    } else if (loadPercent < 30) {
      return 'Consider consolidating with other shards'
    } else if (shard.status !== 'ACTIVE') {
      return 'Requires maintenance attention'
    } else {
      return 'Operating optimally'
    }
  }

  private generateRebalancingPlan(): Array<{
    tenantId: string
    fromShard: string
    toShard: string
    reason: string
    estimatedDowntime: number
    complexity: 'LOW' | 'MEDIUM' | 'HIGH'
  }> {
    const plan = []
    const overloadedShards = this.shardingStrategy.shards.filter(
      (s) => s.currentLoad / s.capacity > 0.8
    )
    const underloadedShards = this.shardingStrategy.shards.filter(
      (s) => s.currentLoad / s.capacity < 0.4
    )

    // Simulate tenant migrations from overloaded to underloaded shards
    for (const overloaded of overloadedShards.slice(0, 3)) {
      const targetShard = underloadedShards[0]
      if (targetShard) {
        plan.push({
          tenantId: `tenant_${Math.floor(Math.random() * 50) + 1}`,
          fromShard: overloaded.id,
          toShard: targetShard.id,
          reason: 'Load balancing - redistribute from overloaded shard',
          estimatedDowntime: 300, // 5 minutes
          complexity: 'MEDIUM' as const,
        })
      }
    }

    return plan
  }

  private estimatePerformanceImpact(
    rebalancingPlan: ReturnType<typeof this.generateRebalancingPlan>
  ) {
    return {
      queryLatencyImprovement: rebalancingPlan.length * 15, // 15% per migration
      throughputIncrease: rebalancingPlan.length * 10, // 10% per migration
      resourceEfficiency: rebalancingPlan.length * 8, // 8% per migration
    }
  }

  private analyzeInfrastructureNeeds(): Array<{
    region: string
    resourceType: 'CPU' | 'MEMORY' | 'STORAGE' | 'BANDWIDTH'
    currentCapacity: number
    projectedNeed: number
    urgency: 'LOW' | 'MEDIUM' | 'HIGH'
  }> {
    const needs = []

    for (const [region, pool] of this.resourcePools.entries()) {
      const cpuUtilization = (pool.allocated.cpu / pool.total.cpu) * 100
      const memoryUtilization = (pool.allocated.memory / pool.total.memory) * 100

      if (cpuUtilization > 80) {
        needs.push({
          region,
          resourceType: 'CPU' as const,
          currentCapacity: pool.total.cpu,
          projectedNeed: pool.total.cpu * 1.5,
          urgency: cpuUtilization > 90 ? ('HIGH' as const) : ('MEDIUM' as const),
        })
      }

      if (memoryUtilization > 80) {
        needs.push({
          region,
          resourceType: 'MEMORY' as const,
          currentCapacity: pool.total.memory,
          projectedNeed: pool.total.memory * 1.3,
          urgency: memoryUtilization > 90 ? ('HIGH' as const) : ('MEDIUM' as const),
        })
      }
    }

    return needs
  }

  private getTotalPoolCapacity(resourceType: keyof ResourcePool['total']): number {
    return Array.from(this.resourcePools.values()).reduce(
      (total, pool) => total + pool.total[resourceType],
      0
    )
  }

  private calculateCostChange(tenant: TenantMetrics, action: string): number {
    const baseHourlyCost = this.calculateTenantHourlyCost(tenant)

    switch (action) {
      case 'SCALE_UP':
        return baseHourlyCost * 0.5 // 50% cost increase
      case 'SCALE_DOWN':
        return baseHourlyCost * -0.3 // 30% cost reduction
      case 'MIGRATE':
        return 0 // No cost change for migration
      default:
        return 0
    }
  }

  private calculateTenantHourlyCost(tenant: TenantMetrics): number {
    const pool = this.resourcePools.get(tenant.region)
    if (!pool) return 50 // Fallback cost

    return (
      tenant.resources.cpu * pool.cost.cpuPerHour +
      (tenant.resources.memory / 1024) * pool.cost.memoryPerGBHour +
      tenant.resources.bandwidth * pool.cost.bandwidthPerGB
    )
  }

  private calculateNewResources(tenant: TenantMetrics, action: string): TenantMetrics['resources'] {
    const current = tenant.resources

    switch (action) {
      case 'SCALE_UP':
        return {
          cpu: Math.min(current.cpu * 1.5, 100),
          memory: current.memory * 1.3,
          bandwidth: current.bandwidth * 1.2,
          storage: current.storage,
        }
      case 'SCALE_DOWN':
        return {
          cpu: Math.max(current.cpu * 0.7, 10),
          memory: Math.max(current.memory * 0.8, 256),
          bandwidth: Math.max(current.bandwidth * 0.8, 5),
          storage: current.storage,
        }
      default:
        return current
    }
  }

  private determineTrigger(reason: string): ScalingEvent['trigger'] {
    if (reason.toLowerCase().includes('cpu')) return 'CPU_THRESHOLD'
    if (reason.toLowerCase().includes('memory')) return 'MEMORY_THRESHOLD'
    if (reason.toLowerCase().includes('request')) return 'REQUEST_VOLUME'
    if (reason.toLowerCase().includes('user')) return 'USER_GROWTH'
    return 'MANUAL'
  }

  /**
   * Get current tenant metrics
   */
  getTenantMetrics(tenantId?: string): TenantMetrics | TenantMetrics[] {
    if (tenantId) {
      const tenant = this.tenants.get(tenantId)
      if (!tenant) throw new Error(`Tenant ${tenantId} not found`)
      return tenant
    }
    return Array.from(this.tenants.values())
  }

  /**
   * Get resource pool status
   */
  getResourcePoolStatus(): Map<string, ResourcePool> {
    return this.resourcePools
  }

  /**
   * Get scaling events history
   */
  getScalingEvents(tenantId?: string): ScalingEvent[] {
    if (tenantId) {
      return this.scalingEvents.filter((event) => event.tenantId === tenantId)
    }
    return this.scalingEvents
  }

  /**
   * Get sharding strategy details
   */
  getShardingStrategy(): ShardingStrategy {
    return this.shardingStrategy
  }

  /**
   * Get caching strategy details
   */
  getCachingStrategy(): CachingStrategy {
    return this.cachingStrategy
  }

  /**
   * Enable/disable auto-scaling
   */
  setAutoScaling(enabled: boolean): void {
    this.autoScalingEnabled = enabled
  }

  /**
   * Cleanup and shutdown
   */
  async cleanup(): Promise<void> {
    this.isMonitoring = false

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }

    this.removeAllListeners()
  }
}

export default MultiTenantScalabilityOrchestrator
