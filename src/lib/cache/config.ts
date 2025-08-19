/**
 * CoreFlow360 - Cache Configuration
 * Environment-based cache settings
 */

// Cache feature flags
export const CACHE_FEATURES = {
  ENABLED: process.env.REDIS_URL || process.env.REDIS_HOST ? true : false,
  SESSION_CACHE: process.env.ENABLE_SESSION_CACHE !== 'false',
  QUERY_CACHE: process.env.ENABLE_QUERY_CACHE !== 'false',
  API_CACHE: process.env.ENABLE_API_CACHE !== 'false',
  METRICS_CACHE: process.env.ENABLE_METRICS_CACHE !== 'false',
}

// Cache TTL overrides from environment
export const CACHE_TTL_OVERRIDES = {
  SESSION: parseInt(process.env.CACHE_TTL_SESSION || '3600'),
  USER: parseInt(process.env.CACHE_TTL_USER || '300'),
  API: parseInt(process.env.CACHE_TTL_API || '60'),
  QUERY: parseInt(process.env.CACHE_TTL_QUERY || '300'),
  METRICS: parseInt(process.env.CACHE_TTL_METRICS || '30'),
}

// Cache size limits
export const CACHE_LIMITS = {
  MAX_KEYS: parseInt(process.env.CACHE_MAX_KEYS || '10000'),
  MAX_MEMORY: process.env.CACHE_MAX_MEMORY || '256mb',
  EVICTION_POLICY: process.env.CACHE_EVICTION_POLICY || 'allkeys-lru',
}

// Cache warming configuration
export const CACHE_WARMING = {
  ENABLED: process.env.ENABLE_CACHE_WARMING === 'true',
  STARTUP_DELAY: parseInt(process.env.CACHE_WARMING_DELAY || '5000'),
  BATCH_SIZE: parseInt(process.env.CACHE_WARMING_BATCH || '10'),
  TARGETS: (process.env.CACHE_WARMING_TARGETS || '').split(',').filter(Boolean),
}

// Cache monitoring
export const CACHE_MONITORING = {
  LOG_HITS: process.env.LOG_CACHE_HITS === 'true',
  LOG_MISSES: process.env.LOG_CACHE_MISSES === 'true',
  METRICS_ENABLED: process.env.CACHE_METRICS_ENABLED !== 'false',
  SLOW_QUERY_THRESHOLD: parseInt(process.env.CACHE_SLOW_QUERY_MS || '100'),
}

/**
 * Get cache configuration for specific feature
 */
export function getCacheConfig(feature: keyof typeof CACHE_FEATURES): boolean {
  return CACHE_FEATURES.ENABLED && CACHE_FEATURES[feature]
}

/**
 * Get TTL for cache type
 */
export function getCacheTTL(type: keyof typeof CACHE_TTL_OVERRIDES): number {
  return CACHE_TTL_OVERRIDES[type]
}

/**
 * Log cache operation if monitoring enabled
 */
export function logCacheOperation(
  operation: 'hit' | 'miss' | 'set' | 'delete',
  key: string,
  duration?: number
): void {
  if (!CACHE_MONITORING.METRICS_ENABLED) return

  const shouldLog =
    (operation === 'hit' && CACHE_MONITORING.LOG_HITS) ||
    (operation === 'miss' && CACHE_MONITORING.LOG_MISSES) ||
    operation === 'set' ||
    operation === 'delete'

  if (shouldLog) {
    ` : ''}`)
  }

  if (duration && duration > CACHE_MONITORING.SLOW_QUERY_THRESHOLD) {
    
  }
}
