/**
 * CoreFlow360 - API Key Validation
 * Secure API key validation for server-to-server requests
 */

import { z } from 'zod'
import { redis } from '@/lib/cache/unified-redis'
import crypto from 'crypto'

const ApiKeySchema = z.object({
  id: z.string(),
  key: z.string(),
  tenantId: z.string(),
  scope: z.array(z.string()),
  rateLimit: z.number().default(1000),
  expiresAt: z.date().optional(),
  isActive: z.boolean().default(true)
})

export type ApiKey = z.infer<typeof ApiKeySchema>

/**
 * Validate API key
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey || apiKey.length < 32) {
    return false
  }

  try {
    // Hash the API key for lookup
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
    const cacheKey = `api_key:${keyHash}`
    
    // Check cache first
    const cached = await redis.get(cacheKey)
    if (cached) {
      const keyData = JSON.parse(cached)
      return keyData.isActive && (!keyData.expiresAt || new Date(keyData.expiresAt) > new Date())
    }

    // In production, this would check against database
    // For now, validate against environment variables
    const validKeys = [
      process.env.COREFLOW_API_KEY,
      process.env.STRIPE_SECRET_KEY,
      process.env.INTERNAL_API_KEY
    ].filter(Boolean)

    const isValid = validKeys.includes(apiKey)

    // Cache result for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify({
      isActive: isValid,
      expiresAt: null
    }))

    return isValid

  } catch (error) {
    console.error('API key validation failed:', error)
    return false
  }
}

/**
 * Generate new API key
 */
export function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Get API key metadata
 */
export async function getApiKeyMetadata(apiKey: string): Promise<Partial<ApiKey> | null> {
  try {
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
    const cacheKey = `api_key_meta:${keyHash}`
    
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    // Return default metadata for valid keys
    const isValid = await validateApiKey(apiKey)
    if (isValid) {
      const metadata = {
        scope: ['events:write', 'analytics:read'],
        rateLimit: 1000,
        isActive: true
      }
      
      await redis.setex(cacheKey, 3600, JSON.stringify(metadata))
      return metadata
    }

    return null

  } catch (error) {
    console.error('Failed to get API key metadata:', error)
    return null
  }
}

export default validateApiKey