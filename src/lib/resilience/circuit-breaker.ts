/**
 * CoreFlow360 - Circuit Breaker Pattern Implementation
 * Prevents cascading failures by failing fast when services are down
 */

export interface CircuitBreakerConfig {
  failureThreshold: number    // Number of failures before opening
  recoveryTimeout: number     // Time in ms before trying again
  monitoringPeriod: number   // Time window for failure counting
  expectedErrors?: string[]   // Error types that should open the circuit
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export interface CircuitBreakerStats {
  state: CircuitState
  failures: number
  successes: number
  lastFailureTime: number
  lastSuccessTime: number
  totalCalls: number
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED'
  private failures = 0
  private successes = 0
  private lastFailureTime = 0
  private lastSuccessTime = 0
  private totalCalls = 0
  private nextAttempt = 0

  constructor(
    private name: string,
    private config: CircuitBreakerConfig
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.totalCalls++

    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        const error = new Error(`Circuit breaker '${this.name}' is OPEN`)
        error.name = 'CircuitBreakerOpenError'
        throw error
      } else {
        this.state = 'HALF_OPEN'
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
    this.failures = 0
    this.successes++
    this.lastSuccessTime = Date.now()

    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED'
    }
  }

  private onFailure(error: Error): void {
    this.failures++
    this.lastFailureTime = Date.now()

    // Only count expected errors towards circuit breaker
    if (this.config.expectedErrors?.length) {
      const isExpectedError = this.config.expectedErrors.some(
        expectedError => error.message.toLowerCase().includes(expectedError.toLowerCase())
      )
      if (!isExpectedError) {
        return // Don't count this failure
      }
    }

    if (this.state === 'HALF_OPEN' || this.failures >= this.config.failureThreshold) {
      this.state = 'OPEN'
      this.nextAttempt = Date.now() + this.config.recoveryTimeout
    }
  }

  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalCalls: this.totalCalls
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
      this.breakers.forEach(breaker => breaker.reset())
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
    expectedErrors: ['connection', 'timeout', 'pool']
  }),

  redis: circuitBreakerRegistry.getOrCreate('redis', {
    failureThreshold: 3,
    recoveryTimeout: 10000, // 10 seconds
    monitoringPeriod: 30000, // 30 seconds
    expectedErrors: ['connection', 'timeout']
  }),

  stripe: circuitBreakerRegistry.getOrCreate('stripe', {
    failureThreshold: 5,
    recoveryTimeout: 60000, // 1 minute
    monitoringPeriod: 300000, // 5 minutes
    expectedErrors: ['rate_limit', 'api_connection', 'api_error']
  }),

  openai: circuitBreakerRegistry.getOrCreate('openai', {
    failureThreshold: 3,
    recoveryTimeout: 60000, // 1 minute
    monitoringPeriod: 300000, // 5 minutes
    expectedErrors: ['rate_limit', 'insufficient_quota', 'service_unavailable']
  }),

  anthropic: circuitBreakerRegistry.getOrCreate('anthropic', {
    failureThreshold: 3,
    recoveryTimeout: 60000, // 1 minute
    monitoringPeriod: 300000, // 5 minutes
    expectedErrors: ['rate_limit', 'overloaded', 'service_unavailable']
  }),

  sendgrid: circuitBreakerRegistry.getOrCreate('sendgrid', {
    failureThreshold: 5,
    recoveryTimeout: 300000, // 5 minutes
    monitoringPeriod: 600000, // 10 minutes
    expectedErrors: ['rate_limit', 'quota_exceeded', 'service_unavailable']
  })
}

/**
 * Decorator for adding circuit breaker to methods
 */
export function withCircuitBreaker(
  breakerName: string,
  config?: CircuitBreakerConfig
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
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