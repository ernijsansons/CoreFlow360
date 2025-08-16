/**
 * CoreFlow360 - Resilient External Service Wrapper
 * Combines circuit breakers, retries, and timeouts for external API calls
 */

import { circuitBreakers, withCircuitBreakerProtection } from '@/lib/resilience/circuit-breaker';
import { handleError, ErrorContext } from '@/lib/errors/error-handler';

export interface ServiceCallOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  circuitBreakerName?: string;
  context?: Partial<ErrorContext>;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: string[];
}

/**
 * Enhanced retry mechanism with exponential backoff
 */
class RetryManager {
  static async withRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig,
    context?: Partial<ErrorContext>
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on last attempt
        if (attempt === config.maxRetries) {
          break;
        }
        
        // Check if error is retryable
        if (!this.isRetryableError(lastError, config.retryableErrors)) {
          break;
        }
        
        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffFactor, attempt),
          config.maxDelay
        );
        
        const jitteredDelay = delay + Math.random() * delay * 0.1; // Add 10% jitter
        
        console.warn(`Retrying operation after ${Math.round(jitteredDelay)}ms (attempt ${attempt + 1}/${config.maxRetries + 1}). Error: ${lastError.message}`);
        
        await new Promise(resolve => setTimeout(resolve, jitteredDelay));
      }
    }
    
    throw lastError!;
  }
  
  private static isRetryableError(error: Error, retryableErrors: string[]): boolean {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();
    
    return retryableErrors.some(retryableError =>
      message.includes(retryableError.toLowerCase()) ||
      name.includes(retryableError.toLowerCase())
    );
  }
}

/**
 * Resilient service wrapper for external API calls
 */
export class ResilientServiceWrapper {
  private static readonly defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffFactor: 2,
    retryableErrors: [
      'timeout',
      'connection',
      'network',
      'rate_limit',
      'temporary',
      'unavailable',
      'overloaded',
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED'
    ]
  };

  /**
   * Stripe API wrapper with circuit breaker and retry logic
   */
  static async stripeOperation<T>(
    operation: () => Promise<T>,
    options: ServiceCallOptions = {}
  ): Promise<T> {
    const context: ErrorContext = {
      service: 'stripe',
      endpoint: 'stripe_api',
      method: 'POST',
      ...options.context
    };

    return this.executeWithResilience(
      operation,
      'stripe',
      {
        ...this.defaultRetryConfig,
        retryableErrors: [
          ...this.defaultRetryConfig.retryableErrors,
          'api_connection_error',
          'api_error',
          'rate_limit_error'
        ]
      },
      context,
      options
    );
  }

  /**
   * OpenAI API wrapper with circuit breaker and retry logic
   */
  static async openAIOperation<T>(
    operation: () => Promise<T>,
    options: ServiceCallOptions = {}
  ): Promise<T> {
    const context: ErrorContext = {
      service: 'openai',
      endpoint: 'openai_api',
      method: 'POST',
      ...options.context
    };

    return this.executeWithResilience(
      operation,
      'openai',
      {
        ...this.defaultRetryConfig,
        maxRetries: 2, // Lower retries for AI services due to longer processing times
        baseDelay: 2000, // Longer initial delay
        retryableErrors: [
          ...this.defaultRetryConfig.retryableErrors,
          'insufficient_quota',
          'model_overloaded',
          'service_unavailable',
          'rate_limit_exceeded'
        ]
      },
      context,
      options
    );
  }

  /**
   * Anthropic API wrapper with circuit breaker and retry logic
   */
  static async anthropicOperation<T>(
    operation: () => Promise<T>,
    options: ServiceCallOptions = {}
  ): Promise<T> {
    const context: ErrorContext = {
      service: 'anthropic',
      endpoint: 'anthropic_api',
      method: 'POST',
      ...options.context
    };

    return this.executeWithResilience(
      operation,
      'anthropic',
      {
        ...this.defaultRetryConfig,
        maxRetries: 2,
        baseDelay: 2000,
        retryableErrors: [
          ...this.defaultRetryConfig.retryableErrors,
          'overloaded_error',
          'rate_limit_error',
          'service_unavailable'
        ]
      },
      context,
      options
    );
  }

  /**
   * Email service wrapper (SendGrid/Resend) with circuit breaker and retry logic
   */
  static async emailOperation<T>(
    operation: () => Promise<T>,
    options: ServiceCallOptions = {}
  ): Promise<T> {
    const context: ErrorContext = {
      service: 'email',
      endpoint: 'email_api',
      method: 'POST',
      ...options.context
    };

    return this.executeWithResilience(
      operation,
      'sendgrid',
      {
        ...this.defaultRetryConfig,
        maxRetries: 5, // Email is important, retry more
        baseDelay: 500,
        retryableErrors: [
          ...this.defaultRetryConfig.retryableErrors,
          'quota_exceeded',
          'rate_limit',
          'internal_server_error',
          'service_unavailable'
        ]
      },
      context,
      options
    );
  }

  /**
   * Database operation wrapper with circuit breaker and retry logic
   */
  static async databaseOperation<T>(
    operation: () => Promise<T>,
    options: ServiceCallOptions = {}
  ): Promise<T> {
    const context: ErrorContext = {
      service: 'database',
      endpoint: 'database_query',
      method: 'QUERY',
      ...options.context
    };

    return this.executeWithResilience(
      operation,
      'database',
      {
        ...this.defaultRetryConfig,
        maxRetries: 2, // Database should be reliable, minimal retries
        baseDelay: 500,
        maxDelay: 5000,
        retryableErrors: [
          'connection',
          'timeout',
          'pool_timeout',
          'deadlock',
          'lock_timeout',
          'temporary'
        ]
      },
      context,
      options
    );
  }

  /**
   * Redis operation wrapper with circuit breaker and retry logic
   */
  static async redisOperation<T>(
    operation: () => Promise<T>,
    options: ServiceCallOptions = {}
  ): Promise<T> {
    const context: ErrorContext = {
      service: 'redis',
      endpoint: 'redis_operation',
      method: 'REDIS',
      ...options.context
    };

    return this.executeWithResilience(
      operation,
      'redis',
      {
        ...this.defaultRetryConfig,
        maxRetries: 2,
        baseDelay: 200,
        maxDelay: 2000,
        retryableErrors: [
          'connection',
          'timeout',
          'readonly',
          'loading',
          'busy'
        ]
      },
      context,
      options
    );
  }

  /**
   * Webhook operation wrapper with circuit breaker and retry logic
   */
  static async webhookOperation<T>(
    operation: () => Promise<T>,
    options: ServiceCallOptions = {}
  ): Promise<T> {
    const context: ErrorContext = {
      service: 'webhook',
      endpoint: 'webhook_call',
      method: 'POST',
      ...options.context
    };

    return this.executeWithResilience(
      operation,
      'webhook',
      {
        ...this.defaultRetryConfig,
        maxRetries: 3,
        baseDelay: 1000,
        retryableErrors: [
          ...this.defaultRetryConfig.retryableErrors,
          'signature_verification',
          'invalid_signature'
        ]
      },
      context,
      options
    );
  }

  /**
   * Generic resilient operation executor
   */
  private static async executeWithResilience<T>(
    operation: () => Promise<T>,
    circuitBreakerName: string,
    retryConfig: RetryConfig,
    context: ErrorContext,
    options: ServiceCallOptions
  ): Promise<T> {
    const startTime = Date.now();

    try {
      // Wrap with timeout if specified
      const timeoutMs = options.timeout || 30000; // Default 30 seconds
      const operationWithTimeout = this.withTimeout(operation, timeoutMs);

      // Apply circuit breaker protection
      const circuitBreakerProtectedOp = () =>
        withCircuitBreakerProtection(circuitBreakerName, operationWithTimeout);

      // Apply retry logic
      const result = await RetryManager.withRetry(
        circuitBreakerProtectedOp,
        retryConfig,
        context
      );

      // Log successful operation
      const duration = Date.now() - startTime;
      console.log(`✅ ${context.service} operation completed in ${duration}ms`);

      return result;
    } catch (error) {
      // Enhanced error context
      const enhancedContext: ErrorContext = {
        ...context,
        duration: Date.now() - startTime,
        circuitBreakerName,
        retryAttempts: retryConfig.maxRetries
      };

      console.error(`❌ ${context.service} operation failed:`, error);
      return handleError(error, enhancedContext);
    }
  }

  /**
   * Add timeout wrapper to operations
   */
  private static withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): () => Promise<T> {
    return () => {
      return new Promise<T>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Operation timeout after ${timeoutMs}ms`));
        }, timeoutMs);

        operation()
          .then((result) => {
            clearTimeout(timeoutId);
            resolve(result);
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            reject(error);
          });
      });
    };
  }

  /**
   * Health check for all external services
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, {
      circuitState: string;
      errorRate: number;
      lastSuccess: number;
      available: boolean;
    }>;
  }> {
    const serviceNames = ['stripe', 'openai', 'anthropic', 'sendgrid', 'database', 'redis', 'webhook'];
    const serviceHealth: Record<string, any> = {};
    let healthyCount = 0;

    for (const serviceName of serviceNames) {
      const breaker = circuitBreakers[serviceName as keyof typeof circuitBreakers];
      if (breaker) {
        const stats = breaker.getStats();
        const available = stats.state === 'CLOSED' || stats.state === 'HALF_OPEN';
        
        serviceHealth[serviceName] = {
          circuitState: stats.state,
          errorRate: Math.round(stats.errorRate * 100),
          lastSuccess: stats.lastSuccessTime,
          available
        };

        if (available && stats.errorRate < 0.5) {
          healthyCount++;
        }
      }
    }

    const overallStatus = 
      healthyCount === serviceNames.length ? 'healthy' :
      healthyCount >= serviceNames.length * 0.7 ? 'degraded' :
      'unhealthy';

    return {
      status: overallStatus,
      services: serviceHealth
    };
  }

  /**
   * Get comprehensive statistics for all services
   */
  static getServiceStats() {
    const serviceNames = ['stripe', 'openai', 'anthropic', 'sendgrid', 'database', 'redis', 'webhook'];
    const stats: Record<string, any> = {};

    for (const serviceName of serviceNames) {
      const breaker = circuitBreakers[serviceName as keyof typeof circuitBreakers];
      if (breaker) {
        stats[serviceName] = breaker.getStats();
      }
    }

    return stats;
  }

  /**
   * Reset all circuit breakers (for testing/recovery)
   */
  static resetAllCircuitBreakers(): void {
    Object.values(circuitBreakers).forEach(breaker => {
      breaker.reset();
    });
    console.log('🔄 All circuit breakers have been reset');
  }
}

/**
 * Convenience exports for specific service operations
 */
export const {
  stripeOperation,
  openAIOperation,
  anthropicOperation,
  emailOperation,
  databaseOperation,
  redisOperation,
  webhookOperation,
  healthCheck: serviceHealthCheck,
  getServiceStats,
  resetAllCircuitBreakers
} = ResilientServiceWrapper;

/**
 * Type-safe wrapper functions for common operations
 */

// Stripe operations
export const resilientStripe = {
  createCustomer: (data: any) => stripeOperation(() => 
    // Stripe customer creation logic would go here
    Promise.resolve({ id: 'cus_example', ...data })
  ),
  
  createSubscription: (data: any) => stripeOperation(() =>
    // Stripe subscription creation logic would go here
    Promise.resolve({ id: 'sub_example', ...data })
  ),
  
  processPayment: (data: any) => stripeOperation(() =>
    // Stripe payment processing logic would go here
    Promise.resolve({ id: 'pi_example', status: 'succeeded', ...data })
  )
};

// AI operations
export const resilientAI = {
  openAIChat: (messages: any[]) => openAIOperation(() =>
    // OpenAI chat completion logic would go here
    Promise.resolve({ choices: [{ message: { content: 'AI response' } }] })
  ),
  
  anthropicClaude: (prompt: string) => anthropicOperation(() =>
    // Anthropic Claude API logic would go here
    Promise.resolve({ completion: 'Claude response' })
  )
};

// Database operations
export const resilientDB = {
  query: <T>(sql: string, params?: any[]) => databaseOperation<T>(() =>
    // Database query logic would go here
    Promise.resolve([] as any)
  ),
  
  transaction: <T>(callback: () => Promise<T>) => databaseOperation(callback)
};

// Cache operations
export const resilientCache = {
  get: <T>(key: string) => redisOperation<T | null>(() =>
    // Redis get logic would go here
    Promise.resolve(null)
  ),
  
  set: (key: string, value: any, ttl?: number) => redisOperation(() =>
    // Redis set logic would go here
    Promise.resolve('OK')
  ),
  
  del: (key: string) => redisOperation(() =>
    // Redis delete logic would go here
    Promise.resolve(1)
  )
};

export default ResilientServiceWrapper;