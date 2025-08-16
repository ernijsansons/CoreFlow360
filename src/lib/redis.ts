/**
 * CoreFlow360 - Redis Caching Layer
 * Re-exports the unified Redis implementation for backward compatibility
 */

// Re-export everything from the unified implementation
export * from './cache/unified-redis'
export { unifiedCache as redis } from './cache/unified-redis'

// For backward compatibility, also export as default
import { unifiedCache } from './cache/unified-redis'
export default unifiedCache