#!/usr/bin/env node
/**
 * Test script to verify Redis modules don't initialize during build
 */

// Set build-time environment variables
process.env.VERCEL = '1'
process.env.CI = '1'
process.env.NEXT_PHASE = 'phase-production-build'
process.env.VERCEL_ENV = 'preview'

console.log('🔍 Testing Redis module initialization during build...\n')
console.log('Environment variables set:')
console.log('- VERCEL:', process.env.VERCEL)
console.log('- CI:', process.env.CI)
console.log('- NEXT_PHASE:', process.env.NEXT_PHASE)
console.log('- VERCEL_ENV:', process.env.VERCEL_ENV)
console.log('')

const modules = [
  '@/lib/redis',
  '@/lib/redis/client',
  '@/lib/cache/unified-redis',
  '@/lib/security/enhanced-rate-limit',
  '@/lib/queues/lead-processor',
  '@/lib/queue/client',
  '@/middleware/security'
]

console.log('Testing module imports...\n')

for (const modulePath of modules) {
  try {
    console.log(`✓ Testing ${modulePath}...`)
    const actualPath = modulePath.replace('@/', '../src/')
    
    // Override console methods to capture output
    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error
    const logs = []
    
    console.log = (...args) => logs.push({ type: 'log', args })
    console.warn = (...args) => logs.push({ type: 'warn', args })
    console.error = (...args) => logs.push({ type: 'error', args })
    
    try {
      require(actualPath)
      
      // Restore console
      console.log = originalLog
      console.warn = originalWarn
      console.error = originalError
      
      // Check for Redis connection attempts
      const redisLogs = logs.filter(log => 
        log.args.some(arg => 
          typeof arg === 'string' && 
          (arg.includes('Redis') || arg.includes('redis'))
        )
      )
      
      if (redisLogs.length > 0) {
        console.log(`  📝 Redis-related logs:`)
        redisLogs.forEach(log => {
          console.log(`     ${log.type}: ${log.args.join(' ')}`)
        })
      }
      
      const connectionAttempts = logs.filter(log =>
        log.args.some(arg =>
          typeof arg === 'string' &&
          (arg.includes('connect') || arg.includes('Connection'))
        )
      )
      
      if (connectionAttempts.length > 0) {
        console.error(`  ❌ Module attempted Redis connection during build!`)
        connectionAttempts.forEach(log => {
          console.error(`     ${log.type}: ${log.args.join(' ')}`)
        })
      } else {
        console.log(`  ✅ Module loaded successfully without Redis connections`)
      }
    } catch (error) {
      // Restore console
      console.log = originalLog
      console.warn = originalWarn
      console.error = originalError
      
      console.error(`  ❌ Error loading module: ${error.message}`)
    }
    
    console.log('')
  } catch (error) {
    console.error(`❌ Failed to test ${modulePath}: ${error.message}`)
  }
}

console.log('\n✅ Redis build test completed!')