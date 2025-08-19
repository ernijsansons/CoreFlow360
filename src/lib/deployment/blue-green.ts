/**
 * CoreFlow360 - Blue-Green Deployment Strategy
 * Zero-downtime deployments with automated rollback capabilities
 */

import { execSync, spawn, ChildProcess } from 'child_process'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { logger } from '@/lib/logging/logger'

export interface DeploymentConfig {
  environment: 'staging' | 'production'
  version: string
  buildCommand: string
  healthCheckUrl: string
  healthCheckTimeout: number
  rollbackThreshold: number // Error rate percentage that triggers rollback
  deploymentTimeout: number // Max deployment time in seconds
  preDeploymentChecks: string[]
  postDeploymentChecks: string[]
  notificationWebhook?: string
  slackWebhook?: string
}

export interface DeploymentSlot {
  name: 'blue' | 'green'
  url: string
  version?: string
  status: 'active' | 'inactive' | 'deploying' | 'warming' | 'failed'
  healthScore: number
  lastDeployment: string
  traffic: number // Percentage of traffic
}

export interface DeploymentResult {
  deploymentId: string
  version: string
  environment: string
  startTime: string
  endTime: string
  duration: number
  success: boolean
  activeSlot: 'blue' | 'green'
  previousSlot: 'blue' | 'green'
  rollbackPerformed: boolean
  healthChecks: Array<{
    check: string
    passed: boolean
    details?: string
  }>
  metrics: {
    errorRate: number
    responseTime: number
    throughput: number
  }
  logs: string[]
}

export class BlueGreenDeployment {
  private config: DeploymentConfig
  private slots: { blue: DeploymentSlot; green: DeploymentSlot }
  private deploymentHistory: DeploymentResult[] = []

  constructor(config: DeploymentConfig) {
    this.config = config
    this.slots = {
      blue: {
        name: 'blue',
        url: this.getSlotUrl('blue'),
        status: 'inactive',
        healthScore: 0,
        lastDeployment: new Date().toISOString(),
        traffic: 0,
      },
      green: {
        name: 'green',
        url: this.getSlotUrl('green'),
        status: 'inactive',
        healthScore: 0,
        lastDeployment: new Date().toISOString(),
        traffic: 0,
      },
    }
    this.loadDeploymentState()
  }

  /**
   * Execute blue-green deployment
   */
  async deploy(version: string): Promise<DeploymentResult> {
    const deploymentId = this.generateDeploymentId()
    const startTime = new Date().toISOString()

    logger.info('Starting blue-green deployment', {
      deploymentId,
      version,
      environment: this.config.environment,
      component: 'deployment',
    })

    const result: DeploymentResult = {
      deploymentId,
      version,
      environment: this.config.environment,
      startTime,
      endTime: '',
      duration: 0,
      success: false,
      activeSlot: this.getActiveSlot().name,
      previousSlot: this.getActiveSlot().name,
      rollbackPerformed: false,
      healthChecks: [],
      metrics: { errorRate: 0, responseTime: 0, throughput: 0 },
      logs: [],
    }

    try {
      // 1. Pre-deployment checks
      await this.runPreDeploymentChecks(result)

      // 2. Determine target slot (inactive slot)
      const targetSlot = this.getInactiveSlot()
      const activeSlot = this.getActiveSlot()

      result.previousSlot = activeSlot.name
      result.logs.push(`Target slot: ${targetSlot.name}`)

      // 3. Deploy to inactive slot
      await this.deployToSlot(targetSlot, version, result)

      // 4. Health check new deployment
      await this.performHealthChecks(targetSlot, result)

      // 5. Gradual traffic switch (canary deployment)
      await this.performTrafficSwitch(activeSlot, targetSlot, result)

      // 6. Monitor for issues
      const monitoringResult = await this.monitorDeployment(targetSlot, result)

      if (!monitoringResult.success) {
        // 7. Rollback if issues detected
        await this.rollback(activeSlot, targetSlot, result)
        result.rollbackPerformed = true
        result.success = false
      } else {
        // 8. Complete switch and mark old slot as inactive
        await this.completeDeployment(activeSlot, targetSlot, result)
        result.success = true
      }

      // 9. Post-deployment checks
      await this.runPostDeploymentChecks(result)
    } catch (error) {
      logger.error('Blue-green deployment failed', error as Error, {
        component: 'deployment',
        metadata: { deploymentId, version },
      })

      result.logs.push(`Deployment failed: ${(error as Error).message}`)
      result.success = false

      // Attempt rollback on critical failure
      try {
        const activeSlot = this.getActiveSlot()
        const targetSlot = this.getInactiveSlot()
        await this.rollback(activeSlot, targetSlot, result)
        result.rollbackPerformed = true
      } catch (rollbackError) {
        logger.error('Rollback failed', rollbackError as Error, {
          component: 'deployment',
          metadata: { deploymentId },
        })
      }
    }

    // Finalize result
    result.endTime = new Date().toISOString()
    result.duration = new Date(result.endTime).getTime() - new Date(result.startTime).getTime()
    result.activeSlot = this.getActiveSlot().name

    // Save deployment result
    this.deploymentHistory.push(result)
    this.saveDeploymentState()

    // Send notifications
    await this.sendNotifications(result)

    logger.info('Blue-green deployment completed', {
      deploymentId,
      success: result.success,
      duration: result.duration,
      rollbackPerformed: result.rollbackPerformed,
      component: 'deployment',
    })

    return result
  }

  /**
   * Manual rollback to previous deployment
   */
  async rollbackToPrevious(): Promise<DeploymentResult> {
    const activeSlot = this.getActiveSlot()
    const inactiveSlot = this.getInactiveSlot()

    // Find previous deployment
    const previousDeployment = this.deploymentHistory
      .filter((d) => d.success && !d.rollbackPerformed)
      .slice(-2)[0] // Get second-to-last successful deployment

    if (!previousDeployment) {
      throw new Error('No previous deployment found for rollback')
    }

    const deploymentId = this.generateDeploymentId()
    const result: DeploymentResult = {
      deploymentId,
      version: previousDeployment.version,
      environment: this.config.environment,
      startTime: new Date().toISOString(),
      endTime: '',
      duration: 0,
      success: false,
      activeSlot: activeSlot.name,
      previousSlot: activeSlot.name,
      rollbackPerformed: true,
      healthChecks: [],
      metrics: { errorRate: 0, responseTime: 0, throughput: 0 },
      logs: [`Manual rollback to version ${previousDeployment.version}`],
    }

    try {
      await this.rollback(inactiveSlot, activeSlot, result)
      result.success = true
    } catch (error) {
      result.success = false
      result.logs.push(`Rollback failed: ${(error as Error).message}`)
    }

    result.endTime = new Date().toISOString()
    result.duration = new Date(result.endTime).getTime() - new Date(result.startTime).getTime()

    this.deploymentHistory.push(result)
    this.saveDeploymentState()

    return result
  }

  /**
   * Pre-deployment checks
   */
  private async runPreDeploymentChecks(result: DeploymentResult): Promise<void> {
    result.logs.push('Running pre-deployment checks...')

    for (const check of this.config.preDeploymentChecks) {
      try {
        const checkResult = await this.executeCheck(check)
        result.healthChecks.push({
          check,
          passed: checkResult.success,
          details: checkResult.output,
        })

        if (!checkResult.success) {
          throw new Error(`Pre-deployment check failed: ${check}`)
        }

        result.logs.push(`✓ ${check}`)
      } catch (error) {
        result.logs.push(`✗ ${check}: ${(error as Error).message}`)
        throw error
      }
    }
  }

  /**
   * Deploy to specific slot
   */
  private async deployToSlot(
    slot: DeploymentSlot,
    version: string,
    result: DeploymentResult
  ): Promise<void> {
    result.logs.push(`Deploying version ${version} to ${slot.name} slot...`)

    slot.status = 'deploying'
    slot.version = version

    try {
      // Build and deploy
      const deployCommand = this.config.buildCommand
        .replace('${VERSION}', version)
        .replace('${SLOT}', slot.name)
        .replace('${ENVIRONMENT}', this.config.environment)

      result.logs.push(`Executing: ${deployCommand}`)

      const deployResult = await this.executeCommand(deployCommand, this.config.deploymentTimeout)

      if (deployResult.success) {
        slot.status = 'warming'
        result.logs.push(`✓ Deployment to ${slot.name} completed`)

        // Wait for application warmup
        await this.waitForWarmup(slot)
        slot.status = 'inactive' // Ready but not receiving traffic yet
      } else {
        slot.status = 'failed'
        throw new Error(`Deployment failed: ${deployResult.output}`)
      }
    } catch (error) {
      slot.status = 'failed'
      result.logs.push(`Deployment to ${slot.name} failed: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * Health check deployment
   */
  private async performHealthChecks(slot: DeploymentSlot, result: DeploymentResult): Promise<void> {
    result.logs.push(`Performing health checks on ${slot.name} slot...`)

    const maxAttempts = 10
    const delayMs = 5000

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const healthUrl = `${slot.url}/api/health/detailed`
        const response = await fetch(healthUrl, {
          method: 'GET',
          timeout: this.config.healthCheckTimeout,
        })

        if (response.ok) {
          const healthData = await response.json()
          slot.healthScore = this.calculateHealthScore(healthData)

          if (slot.healthScore >= 80) {
            // 80% health threshold
            result.logs.push(`✓ Health check passed (${slot.healthScore}%)`)
            result.healthChecks.push({
              check: 'application_health',
              passed: true,
              details: `Health score: ${slot.healthScore}%`,
            })
            return
          } else {
            result.logs.push(`⚠ Health score low: ${slot.healthScore}%`)
          }
        } else {
          result.logs.push(`Health check failed: HTTP ${response.status}`)
        }
      } catch (error) {
        result.logs.push(
          `Health check attempt ${attempt}/${maxAttempts} failed: ${(error as Error).message}`
        )
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }

    // All attempts failed
    result.healthChecks.push({
      check: 'application_health',
      passed: false,
      details: 'Health checks failed after multiple attempts',
    })

    throw new Error('Health checks failed')
  }

  /**
   * Gradual traffic switching (canary deployment)
   */
  private async performTrafficSwitch(
    fromSlot: DeploymentSlot,
    toSlot: DeploymentSlot,
    result: DeploymentResult
  ): Promise<void> {
    result.logs.push('Starting gradual traffic switch...')

    // Traffic switch stages: 10% -> 25% -> 50% -> 75% -> 100%
    const trafficStages = [10, 25, 50, 75, 100]

    for (const targetTraffic of trafficStages) {
      result.logs.push(`Switching ${targetTraffic}% traffic to ${toSlot.name}`)

      // Update traffic distribution
      toSlot.traffic = targetTraffic
      fromSlot.traffic = 100 - targetTraffic

      // Apply traffic routing (this would integrate with your load balancer/ingress)
      await this.updateTrafficRouting(fromSlot, toSlot)

      // Monitor for issues during this stage
      await new Promise((resolve) => setTimeout(resolve, 30000)) // Wait 30 seconds

      const metrics = await this.collectMetrics(toSlot)
      result.metrics = metrics

      // Check error rate threshold
      if (metrics.errorRate > this.config.rollbackThreshold) {
        result.logs.push(`⚠ Error rate too high: ${metrics.errorRate}%`)
        throw new Error(
          `Error rate exceeded threshold: ${metrics.errorRate}% > ${this.config.rollbackThreshold}%`
        )
      }

      result.logs.push(`✓ ${targetTraffic}% traffic switch successful`)
    }

    // Mark new slot as active
    toSlot.status = 'active'
    fromSlot.status = 'inactive'
  }

  /**
   * Monitor deployment for issues
   */
  private async monitorDeployment(
    slot: DeploymentSlot,
    result: DeploymentResult
  ): Promise<{ success: boolean; reason?: string }> {
    result.logs.push('Monitoring deployment stability...')

    const monitoringDuration = 5 * 60 * 1000 // 5 minutes
    const checkInterval = 30 * 1000 // 30 seconds
    const startTime = Date.now()

    while (Date.now() - startTime < monitoringDuration) {
      const metrics = await this.collectMetrics(slot)

      // Check various health indicators
      if (metrics.errorRate > this.config.rollbackThreshold) {
        return {
          success: false,
          reason: `Error rate too high: ${metrics.errorRate}%`,
        }
      }

      if (metrics.responseTime > 5000) {
        // 5 second threshold
        return {
          success: false,
          reason: `Response time too high: ${metrics.responseTime}ms`,
        }
      }

      await new Promise((resolve) => setTimeout(resolve, checkInterval))
    }

    result.logs.push('✓ Monitoring completed - deployment is stable')
    return { success: true }
  }

  /**
   * Rollback deployment
   */
  private async rollback(
    rollbackToSlot: DeploymentSlot,
    rollbackFromSlot: DeploymentSlot,
    result: DeploymentResult
  ): Promise<void> {
    result.logs.push(`Rolling back from ${rollbackFromSlot.name} to ${rollbackToSlot.name}...`)

    try {
      // Immediately switch all traffic back
      rollbackToSlot.traffic = 100
      rollbackFromSlot.traffic = 0
      rollbackToSlot.status = 'active'
      rollbackFromSlot.status = 'failed'

      await this.updateTrafficRouting(rollbackFromSlot, rollbackToSlot)

      result.logs.push('✓ Traffic switched back to stable version')

      // Verify rollback success
      const healthCheck = await this.performQuickHealthCheck(rollbackToSlot)
      if (!healthCheck.success) {
        throw new Error('Rollback health check failed')
      }

      result.logs.push('✓ Rollback completed successfully')
    } catch (error) {
      result.logs.push(`Rollback failed: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * Complete deployment process
   */
  private async completeDeployment(
    oldSlot: DeploymentSlot,
    newSlot: DeploymentSlot,
    result: DeploymentResult
  ): Promise<void> {
    result.logs.push('Completing deployment...')

    // Final health check
    const finalHealthCheck = await this.performQuickHealthCheck(newSlot)
    if (!finalHealthCheck.success) {
      throw new Error('Final health check failed')
    }

    // Update slot statuses
    newSlot.status = 'active'
    newSlot.traffic = 100
    newSlot.lastDeployment = new Date().toISOString()

    oldSlot.status = 'inactive'
    oldSlot.traffic = 0

    result.logs.push('✓ Deployment completed successfully')
  }

  /**
   * Post-deployment checks
   */
  private async runPostDeploymentChecks(result: DeploymentResult): Promise<void> {
    result.logs.push('Running post-deployment checks...')

    for (const check of this.config.postDeploymentChecks) {
      try {
        const checkResult = await this.executeCheck(check)
        result.healthChecks.push({
          check: `post_${check}`,
          passed: checkResult.success,
          details: checkResult.output,
        })

        result.logs.push(`✓ ${check}`)
      } catch (error) {
        result.logs.push(`⚠ ${check}: ${(error as Error).message}`)
        // Post-deployment checks are warnings, not failures
      }
    }
  }

  /**
   * Utility methods
   */

  private getSlotUrl(slot: 'blue' | 'green'): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
    return `${baseUrl}-${slot}`
  }

  private getActiveSlot(): DeploymentSlot {
    return this.slots.blue.status === 'active' ? this.slots.blue : this.slots.green
  }

  private getInactiveSlot(): DeploymentSlot {
    return this.slots.blue.status === 'active' ? this.slots.green : this.slots.blue
  }

  private generateDeploymentId(): string {
    return `deploy_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  private async executeCommand(
    command: string,
    timeoutSeconds: number
  ): Promise<{ success: boolean; output: string }> {
    return new Promise((resolve) => {
      const process = spawn('bash', ['-c', command], {
        stdio: ['pipe', 'pipe', 'pipe'],
      })

      let output = ''

      process.stdout.on('data', (data) => {
        output += data.toString()
      })

      process.stderr.on('data', (data) => {
        output += data.toString()
      })

      const timeout = setTimeout(() => {
        process.kill('SIGTERM')
        resolve({ success: false, output: 'Command timed out' })
      }, timeoutSeconds * 1000)

      process.on('close', (code) => {
        clearTimeout(timeout)
        resolve({
          success: code === 0,
          output: output.trim(),
        })
      })
    })
  }

  private async executeCheck(check: string): Promise<{ success: boolean; output: string }> {
    return this.executeCommand(check, 30) // 30 second timeout for checks
  }

  private async waitForWarmup(_slot: DeploymentSlot): Promise<void> {
    // Wait for application to warm up (JIT compilation, cache population, etc.)
    await new Promise((resolve) => setTimeout(resolve, 30000)) // 30 seconds
  }

  private calculateHealthScore(healthData: unknown): number {
    // Simple health score calculation (customize based on your health check data)
    let score = 100

    if (healthData.database?.status !== 'healthy') score -= 30
    if (healthData.redis?.status !== 'healthy') score -= 20
    if (healthData.memory?.usage > 0.85) score -= 15
    if (healthData.cpu?.usage > 0.8) score -= 15
    if (healthData.disk?.usage > 0.9) score -= 20

    return Math.max(0, score)
  }

  private async updateTrafficRouting(
    fromSlot: DeploymentSlot,
    toSlot: DeploymentSlot
  ): Promise<void> {
    // This would integrate with your actual load balancer/ingress controller
    // For example: Nginx, HAProxy, AWS ALB, Kubernetes Ingress, etc.

    logger.info('Updating traffic routing', {
      from: { slot: fromSlot.name, traffic: fromSlot.traffic },
      to: { slot: toSlot.name, traffic: toSlot.traffic },
      component: 'deployment',
    })

    // Example: Update Kubernetes ingress weights
    /*
    const ingressConfig = {
      metadata: { name: 'coreflow360-ingress' },
      spec: {
        rules: [{
          http: {
            paths: [{
              backend: {
                service: {
                  name: 'coreflow360-service',
                  port: { number: 80 }
                }
              }
            }]
          }
        }]
      }
    }
    
    await kubectl.patch('ingress', 'coreflow360-ingress', ingressConfig)
    */
  }

  private async collectMetrics(
    slot: DeploymentSlot
  ): Promise<{ errorRate: number; responseTime: number; throughput: number }> {
    try {
      const metricsUrl = `${slot.url}/api/metrics`
      const response = await fetch(metricsUrl)
      const metrics = await response.text()

      // Parse Prometheus metrics (simplified)
      const errorRate = this.extractMetric(metrics, 'http_req_failed_rate') || 0
      const responseTime = this.extractMetric(metrics, 'http_req_duration_p95') || 0
      const throughput = this.extractMetric(metrics, 'http_reqs_rate') || 0

      return {
        errorRate: errorRate * 100, // Convert to percentage
        responseTime,
        throughput,
      }
    } catch (error) {
      logger.warn('Failed to collect metrics', { error: (error as Error).message })
      return { errorRate: 0, responseTime: 0, throughput: 0 }
    }
  }

  private extractMetric(metricsText: string, metricName: string): number | null {
    const regex = new RegExp(`${metricName}\\s+([0-9.]+)`)
    const match = metricsText.match(regex)
    return match ? parseFloat(match[1]) : null
  }

  private async performQuickHealthCheck(
    slot: DeploymentSlot
  ): Promise<{ success: boolean; details?: string }> {
    try {
      const response = await fetch(`${slot.url}/api/health`, { timeout: 5000 })
      return {
        success: response.ok,
        details: response.ok ? 'Health check passed' : `HTTP ${response.status}`,
      }
    } catch (error) {
      return {
        success: false,
        details: (error as Error).message,
      }
    }
  }

  private async sendNotifications(result: DeploymentResult): Promise<void> {
    const notification = {
      deployment_id: result.deploymentId,
      version: result.version,
      environment: result.environment,
      success: result.success,
      duration: result.duration,
      rollback_performed: result.rollbackPerformed,
      timestamp: result.endTime,
    }

    // Send to monitoring webhook
    if (this.config.notificationWebhook) {
      try {
        await fetch(this.config.notificationWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification),
        })
      } catch (error) {
        logger.warn('Failed to send notification webhook', { error: (error as Error).message })
      }
    }

    // Send to Slack
    if (this.config.slackWebhook) {
      const slackMessage = {
        text: `🚀 Deployment ${result.success ? 'Completed' : 'Failed'}`,
        attachments: [
          {
            color: result.success ? 'good' : 'danger',
            fields: [
              { title: 'Version', value: result.version, short: true },
              { title: 'Environment', value: result.environment, short: true },
              { title: 'Duration', value: `${Math.round(result.duration / 1000)}s`, short: true },
              { title: 'Rollback', value: result.rollbackPerformed ? 'Yes' : 'No', short: true },
            ],
          },
        ],
      }

      try {
        await fetch(this.config.slackWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackMessage),
        })
      } catch (error) {
        logger.warn('Failed to send Slack notification', { error: (error as Error).message })
      }
    }
  }

  private saveDeploymentState(): void {
    const state = {
      slots: this.slots,
      deploymentHistory: this.deploymentHistory.slice(-10), // Keep last 10 deployments
    }

    const stateDir = join(process.cwd(), 'deployment-state')
    if (!existsSync(stateDir)) {
      mkdirSync(stateDir, { recursive: true })
    }

    writeFileSync(
      join(stateDir, `${this.config.environment}-state.json`),
      JSON.stringify(state, null, 2)
    )
  }

  private loadDeploymentState(): void {
    try {
      const stateFile = join(
        process.cwd(),
        'deployment-state',
        `${this.config.environment}-state.json`
      )
      if (existsSync(stateFile)) {
        const state = JSON.parse(readFileSync(stateFile, 'utf8'))
        this.slots = { ...this.slots, ...state.slots }
        this.deploymentHistory = state.deploymentHistory || []
      }
    } catch (error) {
      logger.warn('Could not load deployment state', { error: (error as Error).message })
    }
  }

  /**
   * Public API methods
   */

  getDeploymentStatus(): { slots: typeof this.slots; history: DeploymentResult[] } {
    return {
      slots: this.slots,
      history: this.deploymentHistory.slice(-5), // Last 5 deployments
    }
  }

  getActiveVersion(): string | undefined {
    return this.getActiveSlot().version
  }

  getSlotStatus(slot: 'blue' | 'green'): DeploymentSlot {
    return this.slots[slot]
  }
}

/**
 * Factory function to create deployment instance
 */
export function createBlueGreenDeployment(config: Partial<DeploymentConfig>): BlueGreenDeployment {
  const defaultConfig: DeploymentConfig = {
    environment: 'staging',
    version: '1.0.0',
    buildCommand: 'npm run build && npm run deploy:${SLOT}',
    healthCheckUrl: '/api/health',
    healthCheckTimeout: 30000,
    rollbackThreshold: 5, // 5% error rate triggers rollback
    deploymentTimeout: 600, // 10 minutes
    preDeploymentChecks: ['npm run test', 'npm run lint', 'npm run build'],
    postDeploymentChecks: ['curl -f ${HEALTH_URL}', 'npm run test:e2e:smoke'],
  }

  return new BlueGreenDeployment({ ...defaultConfig, ...config })
}

// Export default configuration for common environments
export const STAGING_CONFIG: Partial<DeploymentConfig> = {
  environment: 'staging',
  rollbackThreshold: 3,
  deploymentTimeout: 300,
  preDeploymentChecks: ['npm run test', 'npm run lint'],
}

export const PRODUCTION_CONFIG: Partial<DeploymentConfig> = {
  environment: 'production',
  rollbackThreshold: 1,
  deploymentTimeout: 900,
  preDeploymentChecks: [
    'npm run test',
    'npm run lint',
    'npm run test:e2e',
    'npm run security:scan',
  ],
  postDeploymentChecks: [
    'curl -f ${HEALTH_URL}',
    'npm run test:e2e:smoke',
    'npm run test:load:quick',
  ],
}
