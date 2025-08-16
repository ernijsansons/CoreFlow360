import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/db'
import { redis } from '@/lib/redis'
import os from 'os'

/**
 * Comprehensive health check endpoint with detailed metrics
 * GET /api/health/detailed
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  // Initialize health status
  const health = {
    status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    services: {} as Record<string, any>,
    system: {} as Record<string, any>,
    performance: {} as Record<string, any>,
  }
  
  // Check database health
  try {
    const dbHealth = await checkDatabaseHealth()
    health.services.database = dbHealth
    
    if (dbHealth.status !== 'healthy') {
      health.status = dbHealth.status === 'unhealthy' ? 'unhealthy' : 'degraded'
    }
  } catch (error) {
    health.services.database = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Database check failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }
    health.status = 'unhealthy'
  }
  
  // Check Redis health
  try {
    const redisConnected = await redis.ping()
    const redisStats = redis.getStats()
    const hitRate = redis.getHitRate()
    
    health.services.redis = {
      status: redisConnected ? 'healthy' : 'unhealthy',
      connected: redisConnected,
      stats: redisStats,
      hitRate: `${hitRate.toFixed(2)}%`,
      message: redisConnected ? 'Redis connection successful' : 'Redis connection failed'
    }
    
    if (!redisConnected) {
      health.status = health.status === 'unhealthy' ? 'unhealthy' : 'degraded'
    }
  } catch (error) {
    health.services.redis = {
      status: 'unhealthy',
      connected: false,
      message: 'Redis check failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }
    health.status = health.status === 'unhealthy' ? 'unhealthy' : 'degraded'
  }
  
  // Check external services
  const externalServices = {
    stripe: await checkStripeHealth(),
    openai: await checkOpenAIHealth(),
    sendgrid: await checkSendGridHealth(),
  }
  
  health.services.external = externalServices
  
  // Any external service failure degrades health
  if (Object.values(externalServices).some(s => s.status !== 'healthy' && s.status !== 'unconfigured')) {
    health.status = health.status === 'unhealthy' ? 'unhealthy' : 'degraded'
  }
  
  // System metrics
  health.system = {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
      usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2),
      process: process.memoryUsage(),
    },
    cpu: {
      model: os.cpus()[0]?.model,
      cores: os.cpus().length,
      loadAverage: os.loadavg(),
      usage: await getCPUUsage(),
    },
    disk: await getDiskUsage(),
  }
  
  // Performance metrics
  health.performance = {
    responseTime: Date.now() - startTime,
    redis: {
      hitRate: `${redis.getHitRate().toFixed(2)}%`,
      stats: redis.getStats()
    }
  }
  
  // Add response headers
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'X-Response-Time': String(Date.now() - startTime),
    'X-Health-Status': health.status,
  })
  
  // Return appropriate status code
  const statusCode = health.status === 'healthy' ? 200 : 
                    health.status === 'degraded' ? 200 : 503
  
  return new NextResponse(
    JSON.stringify(health, null, 2),
    { status: statusCode, headers }
  )
}

/**
 * Check Stripe health
 */
async function checkStripeHealth() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { status: 'unconfigured', message: 'Stripe not configured' }
  }
  
  try {
    // In production, you would make a simple API call to Stripe
    // For now, just check if the key format is valid
    const isValid = process.env.STRIPE_SECRET_KEY.startsWith('sk_')
    
    return {
      status: isValid ? 'healthy' : 'unhealthy',
      message: isValid ? 'Stripe API key valid' : 'Invalid Stripe API key format'
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Stripe health check failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }
  }
}

/**
 * Check OpenAI health
 */
async function checkOpenAIHealth() {
  if (!process.env.OPENAI_API_KEY) {
    return { status: 'unconfigured', message: 'OpenAI not configured' }
  }
  
  try {
    // Check if API key format is valid
    const isValid = process.env.OPENAI_API_KEY.startsWith('sk-')
    
    return {
      status: isValid ? 'healthy' : 'unhealthy',
      message: isValid ? 'OpenAI API key valid' : 'Invalid OpenAI API key format'
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'OpenAI health check failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }
  }
}

/**
 * Check SendGrid health
 */
async function checkSendGridHealth() {
  if (!process.env.SENDGRID_API_KEY) {
    return { status: 'unconfigured', message: 'SendGrid not configured' }
  }
  
  try {
    // Check if API key format is valid
    const isValid = process.env.SENDGRID_API_KEY.startsWith('SG.')
    
    return {
      status: isValid ? 'healthy' : 'unhealthy',
      message: isValid ? 'SendGrid API key valid' : 'Invalid SendGrid API key format'
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'SendGrid health check failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }
  }
}

/**
 * Get CPU usage percentage
 */
async function getCPUUsage(): Promise<number> {
  const startUsage = process.cpuUsage()
  const startTime = Date.now()
  
  // Wait 100ms to measure CPU usage
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const endUsage = process.cpuUsage(startUsage)
  const endTime = Date.now()
  
  const userPercent = 100 * endUsage.user / 1000 / (endTime - startTime)
  const systemPercent = 100 * endUsage.system / 1000 / (endTime - startTime)
  
  return Math.round(userPercent + systemPercent)
}

/**
 * Get disk usage (placeholder for actual implementation)
 */
async function getDiskUsage() {
  // This would require a platform-specific implementation
  // For now, return placeholder data
  return {
    available: true,
    message: 'Disk usage monitoring requires platform-specific implementation'
  }
}