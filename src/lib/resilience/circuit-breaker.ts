/**
 * CoreFlow360 - Circuit Breaker Pattern Implementation
 * Prevents cascading failures by failing fast when services are down
 */

export interface CircuitBreakerConfig {
  failureThreshold: number // Number of failures before opening
  recoveryTimeout: number // Time in ms before trying again
  monitoringPeriod: number // Time window for failure counting
  expectedErrors?: string[] // Error types that should open the circuit
  successThreshold?: number // Successes needed to close from half-open
  volumeThreshold?: number // Minimum calls before circuit can open
  errorRateThreshold?: number // Error rate (0-1) that triggers opening
  adaptiveRecovery?: boolean // Whether to use adaptive recovery times
  maxRecoveryTimeout?: number // Maximum recovery timeout
}

export interface ErrorClassification {
  type: 'temporary' | 'permanent' | 'rate_limit' | 'authentication' | 'unknown'
  retryable: boolean
  weight: number // How much this error counts towards failure threshold
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export interface CircuitBreakerStats {
  state: CircuitState
  failures: number
  successes: number
  lastFailureTime: number
  lastSuccessTime: number
  totalCalls: number
  errorRate: number
  consecutiveFailures: number
  consecutiveSuccesses: number
  halfOpenSuccesses: number
  adaptiveRecoveryTimeout: number
  windowFailures: number[]
  recentErrors: { timestamp: number; type: string; message: string }[]
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED'
  private failures = 0
  private successes = 0
  private lastFailureTime = 0
  private lastSuccessTime = 0
  private totalCalls = 0
  private nextAttempt = 0
  private consecutiveFailures = 0
  private consecutiveSuccesses = 0
  private halfOpenSuccesses = 0
  private windowFailures: number[] = []
  private recentErrors: { timestamp: number; type: string; message: string }[] = []
  private adaptiveRecoveryTimeout: number

  constructor(
    private name: string,
    private config: CircuitBreakerConfig
  ) {
    this.adaptiveRecoveryTimeout = config.recoveryTimeout
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.totalCalls++
    this.cleanupOldWindows()

    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        const error = new Error(
          `Circuit breaker '${this.name}' is OPEN. Next attempt in ${Math.ceil((this.nextAttempt - Date.now()) / 1000)}s`
        )
        error.name = 'CircuitBreakerOpenError'
        throw error
      } else {
        this.state = 'HALF_OPEN'
        this.halfOpenSuccesses = 0
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure(error as Error)
      throw error
    }
  }

  private onSuccess(): void {
    this.successes++
    this.consecutiveSuccesses++
    this.consecutiveFailures = 0
    this.lastSuccessTime = Date.now()

    if (this.state === 'HALF_OPEN') {
      this.halfOpenSuccesses++
      const successThreshold = this.config.successThreshold || 3

      if (this.halfOpenSuccesses >= successThreshold) {
        this.state = 'CLOSED'
        this.failures = 0
        this.adaptiveRecoveryTimeout = this.config.recoveryTimeout // Reset adaptive timeout
      }
    } else if (this.state === 'CLOSED') {
      this.failures = 0
    }
  }

  private onFailure(error: Error): void {
    const now = Date.now()
    this.failures++
    this.consecutiveFailures++
    this.consecutiveSuccesses = 0
    this.lastFailureTime = now

    // Classify the error
    const errorClassification = this.classifyError(error)

    // Store recent error for analysis
    this.recentErrors.push({
      timestamp: now,
      type: errorClassification.type,
      message: error.message,
    })

    // Keep only last 50 errors
    if (this.recentErrors.length > 50) {
      this.recentErrors.shift()
    }

    // Add weighted failure to window
    this.windowFailures.push(now)

    // Only count certain errors towards circuit breaker
    if (this.config.expectedErrors?.length) {
      const isExpectedError = this.config.expectedErrors.some((expectedError) =>
        error.message.toLowerCase().includes(expectedError.toLowerCase())
      )
      if (!isExpectedError && errorClassification.type !== 'temporary') {
        return // Don't count this failure
      }
    }

    // Check if circuit should open
    const shouldOpen = this.shouldOpenCircuit(errorClassification)

    if (this.state === 'HALF_OPEN' || shouldOpen) {
      this.state = 'OPEN'

      // Adaptive recovery timeout
      if (this.config.adaptiveRecovery) {
        this.adaptiveRecoveryTimeout = Math.min(
          this.adaptiveRecoveryTimeout * 1.5,
          this.config.maxRecoveryTimeout || 300000 // Max 5 minutes
        )
      }

      this.nextAttempt = now + this.adaptiveRecoveryTimeout
    }
  }

  private classifyError(error: Error): ErrorClassification {
    const message = error.message.toLowerCase()
    const name = error.name.toLowerCase()

    // Rate limiting errors
    if (
      message.includes('rate limit') ||
      message.includes('too many requests') ||
      name.includes('ratelimit')
    ) {
      return { type: 'rate_limit', retryable: true, weight: 0.5 }
    }

    // Authentication errors
    if (
      message.includes('unauthorized') ||
      message.includes('authentication') ||
      message.includes('forbidden')
    ) {
      return { type: 'authentication', retryable: false, weight: 0.2 }
    }

    // Temporary network/connection errors
    if (
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('econnreset') ||
      message.includes('enotfound') ||
      message.includes('socket')
    ) {
      return { type: 'temporary', retryable: true, weight: 1.0 }
    }

    // Permanent errors (4xx client errors)
    if (
      message.includes('bad request') ||
      message.includes('not found') ||
      message.includes('validation')
    ) {
      return { type: 'permanent', retryable: false, weight: 0.1 }
    }

    // Unknown errors - treat as temporary
    return { type: 'unknown', retryable: true, weight: 0.8 }
  }

  private shouldOpenCircuit(errorClassification: ErrorClassification): boolean {
    // Don't open for non-retryable errors unless they're overwhelming
    if (
      !errorClassification.retryable &&
      this.consecutiveFailures < this.config.failureThreshold * 2
    ) {
      return false
    }

    // Check volume threshold
    const volumeThreshold = this.config.volumeThreshold || 10
    if (this.totalCalls < volumeThreshold) {
      return false
    }

    // Check consecutive failures
    if (this.consecutiveFailures >= this.config.failureThreshold) {
      return true
    }

    // Check error rate in window
    if (this.config.errorRateThreshold) {
      const errorRate = this.calculateErrorRate()
      if (errorRate >= this.config.errorRateThreshold) {
        return true
      }
    }

    return false
  }

  private calculateErrorRate(): number {
    const windowMs = this.config.monitoringPeriod || 60000
    const now = Date.now()
    const windowStart = now - windowMs

    const recentFailures = this.windowFailures.filter(
      (timestamp) => timestamp >= windowStart
    ).length
    const recentCalls = Math.max(1, this.totalCalls) // Avoid division by zero

    return recentFailures / recentCalls
  }

  private cleanupOldWindows(): void {
    const windowMs = this.config.monitoringPeriod || 60000
    const cutoff = Date.now() - windowMs

    // Clean up old window failures
    this.windowFailures = this.windowFailures.filter((timestamp) => timestamp >= cutoff)

    // Clean up old error records (keep last 24 hours)
    const errorCutoff = Date.now() - 24 * 60 * 60 * 1000
    this.recentErrors = this.recentErrors.filter((error) => error.timestamp >= errorCutoff)
  }

  getStats(): CircuitBreakerStats {
    this.cleanupOldWindows()

    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalCalls: this.totalCalls,
      errorRate: this.calculateErrorRate(),
      consecutiveFailures: this.consecutiveFailures,
      consecutiveSuccesses: this.consecutiveSuccesses,
      halfOpenSuccesses: this.halfOpenSuccesses,
      adaptiveRecoveryTimeout: this.adaptiveRecoveryTimeout,
      windowFailures: [...this.windowFailures],
      recentErrors: [...this.recentErrors],
    }
  }

  reset(): void {
    this.state = 'CLOSED'
    this.failures = 0
    this.successes = 0
    this.lastFailureTime = 0
    this.lastSuccessTime = 0
    this.totalCalls = 0
    this.nextAttempt = 0
    this.consecutiveFailures = 0
    this.consecutiveSuccesses = 0
    this.halfOpenSuccesses = 0
    this.windowFailures = []
    this.recentErrors = []
    this.adaptiveRecoveryTimeout = this.config.recoveryTimeout
  }

  forceOpen(): void {
    this.state = 'OPEN'
    this.nextAttempt = Date.now() + this.config.recoveryTimeout
  }

  forceClose(): void {
    this.state = 'CLOSED'
    this.failures = 0
  }
}

/**
 * Circuit Breaker Registry
 */
class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>()

  getOrCreate(name: string, config: CircuitBreakerConfig): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, config))
    }
    return this.breakers.get(name)!
  }

  get(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name)
  }

  getAll(): Map<string, CircuitBreaker> {
    return new Map(this.breakers)
  }

  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {}
    for (const [name, breaker] of this.breakers) {
      stats[name] = breaker.getStats()
    }
    return stats
  }

  reset(name?: string): void {
    if (name) {
      this.breakers.get(name)?.reset()
    } else {
      this.breakers.forEach((breaker) => breaker.reset())
    }
  }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry()

/**
 * Pre-configured circuit breakers for common services
 */
export const circuitBreakers = {
  database: circuitBreakerRegistry.getOrCreate('database', {
    failureThreshold: 5,
    recoveryTimeout: 30000, // 30 seconds
    monitoringPeriod: 60000, // 1 minute
    expectedErrors: ['connection', 'timeout', 'pool'],
    successThreshold: 3,
    volumeThreshold: 10,
    errorRateThreshold: 0.5,
    adaptiveRecovery: true,
    maxRecoveryTimeout: 300000,
  }),

  redis: circuitBreakerRegistry.getOrCreate('redis', {
    failureThreshold: 3,
    recoveryTimeout: 10000, // 10 seconds
    monitoringPeriod: 30000, // 30 seconds
    expectedErrors: ['connection', 'timeout'],
    successThreshold: 2,
    volumeThreshold: 5,
    errorRateThreshold: 0.6,
    adaptiveRecovery: true,
    maxRecoveryTimeout: 120000,
  }),

  stripe: circuitBreakerRegistry.getOrCreate('stripe', {
    failureThreshold: 5,
    recoveryTimeout: 60000, // 1 minute
    monitoringPeriod: 300000, // 5 minutes
    expectedErrors: ['rate_limit', 'api_connection', 'api_error'],
    successThreshold: 3,
    volumeThreshold: 10,
    errorRateThreshold: 0.3,
    adaptiveRecovery: true,
    maxRecoveryTimeout: 600000,
  }),

  openai: circuitBreakerRegistry.getOrCreate('openai', {
    failureThreshold: 3,
    recoveryTimeout: 60000, // 1 minute
    monitoringPeriod: 300000, // 5 minutes
    expectedErrors: ['rate_limit', 'insufficient_quota', 'service_unavailable'],
    successThreshold: 2,
    volumeThreshold: 5,
    errorRateThreshold: 0.4,
    adaptiveRecovery: true,
    maxRecoveryTimeout: 900000,
  }),

  anthropic: circuitBreakerRegistry.getOrCreate('anthropic', {
    failureThreshold: 3,
    recoveryTimeout: 60000, // 1 minute
    monitoringPeriod: 300000, // 5 minutes
    expectedErrors: ['rate_limit', 'overloaded', 'service_unavailable'],
    successThreshold: 2,
    volumeThreshold: 5,
    errorRateThreshold: 0.4,
    adaptiveRecovery: true,
    maxRecoveryTimeout: 900000,
  }),

  sendgrid: circuitBreakerRegistry.getOrCreate('sendgrid', {
    failureThreshold: 5,
    recoveryTimeout: 300000, // 5 minutes
    monitoringPeriod: 600000, // 10 minutes
    expectedErrors: ['rate_limit', 'quota_exceeded', 'service_unavailable'],
    successThreshold: 3,
    volumeThreshold: 10,
    errorRateThreshold: 0.3,
    adaptiveRecovery: true,
    maxRecoveryTimeout: 1800000,
  }),

  webhook: circuitBreakerRegistry.getOrCreate('webhook', {
    failureThreshold: 3,
    recoveryTimeout: 30000, // 30 seconds
    monitoringPeriod: 120000, // 2 minutes
    expectedErrors: ['connection', 'timeout', 'signature'],
    successThreshold: 2,
    volumeThreshold: 5,
    errorRateThreshold: 0.5,
    adaptiveRecovery: true,
    maxRecoveryTimeout: 300000,
  }),
}

/**
 * Decorator for adding circuit breaker to methods
 */
export function withCircuitBreaker(breakerName: string, config?: CircuitBreakerConfig) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      const breaker = config
        ? circuitBreakerRegistry.getOrCreate(breakerName, config)
        : circuitBreakers[breakerName as keyof typeof circuitBreakers]

      if (!breaker) {
        throw new Error(`Circuit breaker '${breakerName}' not found`)
      }

      return breaker.execute(() => originalMethod.apply(this, args))
    }

    return descriptor
  }
}

/**
 * Utility function to wrap any async operation with circuit breaker
 */
export async function withCircuitBreakerProtection<T>(
  breakerName: string,
  operation: () => Promise<T>,
  config?: CircuitBreakerConfig
): Promise<T> {
  const breaker = config
    ? circuitBreakerRegistry.getOrCreate(breakerName, config)
    : circuitBreakers[breakerName as keyof typeof circuitBreakers]

  if (!breaker) {
    throw new Error(`Circuit breaker '${breakerName}' not found`)
  }

  return breaker.execute(operation)
}
