import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class RateLimiter {
  private store: RateLimitStore = {}
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key]
      }
    })
  }

  private getIdentifier(request: NextRequest): string {
    // Use IP address and user agent for identification
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    return `${ip}-${userAgent.slice(0, 50)}`
  }

  async isAllowed(request: NextRequest): Promise<{
    allowed: boolean
    limit: number
    current: number
    remaining: number
    resetTime: number
  }> {
    const identifier = this.getIdentifier(request)
    const now = Date.now()
    
    if (!this.store[identifier] || this.store[identifier].resetTime < now) {
      this.store[identifier] = {
        count: 1,
        resetTime: now + this.windowMs
      }
      
      return {
        allowed: true,
        limit: this.maxRequests,
        current: 1,
        remaining: this.maxRequests - 1,
        resetTime: this.store[identifier].resetTime
      }
    }

    this.store[identifier].count++
    const current = this.store[identifier].count
    
    return {
      allowed: current <= this.maxRequests,
      limit: this.maxRequests,
      current,
      remaining: Math.max(0, this.maxRequests - current),
      resetTime: this.store[identifier].resetTime
    }
  }
}

// Create different rate limiters for different endpoints
export const apiRateLimiter = new RateLimiter(60 * 1000, 100) // 100 requests per minute
export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 5) // 5 requests per 15 minutes
export const strictRateLimiter = new RateLimiter(60 * 1000, 10) // 10 requests per minute

export function createRateLimit(windowMs: number, maxRequests: number) {
  return new RateLimiter(windowMs, maxRequests)
}