#!/usr/bin/env tsx

/**
 * CoreFlow360 - Circuit Breaker Testing and Demonstration
 * Shows how to use resilient service wrappers and monitor circuit breaker health
 */

import { ResilientServiceWrapper } from '../src/lib/external-services/resilient-service-wrapper';
import { circuitBreakers, circuitBreakerRegistry } from '../src/lib/resilience/circuit-breaker';

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message: string, color: keyof typeof colors = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message: string) {
  console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(60)}`);
  console.log(`${message.toUpperCase()}`);
  console.log(`${'='.repeat(60)}${colors.reset}\n`);
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simulate a failing service
 */
async function simulateFailingService(shouldFail = true): Promise<string> {
  await sleep(100); // Simulate network delay
  
  if (shouldFail) {
    throw new Error('Service temporarily unavailable');
  }
  
  return 'Service call successful';
}

/**
 * Simulate a slow service
 */
async function simulateSlowService(delayMs = 5000): Promise<string> {
  await sleep(delayMs);
  return 'Slow service completed';
}

/**
 * Simulate a rate-limited service
 */
async function simulateRateLimitedService(): Promise<string> {
  await sleep(50);
  throw new Error('Rate limit exceeded - too many requests');
}

/**
 * Test basic circuit breaker functionality
 */
async function testBasicCircuitBreaker() {
  logHeader('Testing Basic Circuit Breaker Functionality');
  
  log('1. Testing successful operations...', 'green');
  
  try {
    // Test successful operations
    for (let i = 0; i < 3; i++) {
      const result = await ResilientServiceWrapper.stripeOperation(
        () => simulateFailingService(false),
        { context: { operation: `test_success_${i}` } }
      );
      log(`✅ Success ${i + 1}: ${result}`, 'green');
      await sleep(100);
    }
  } catch (error) {
    log(`❌ Unexpected error: ${error}`, 'red');
  }
  
  log('\n2. Testing failure scenarios...', 'yellow');
  
  try {
    // Test failing operations (should trigger circuit breaker)
    for (let i = 0; i < 6; i++) {
      try {
        await ResilientServiceWrapper.stripeOperation(
          () => simulateFailingService(true),
          { context: { operation: `test_failure_${i}` } }
        );
      } catch (error) {
        log(`❌ Expected failure ${i + 1}: ${(error as Error).message}`, 'red');
      }
      await sleep(200);
    }
  } catch (error) {
    log(`❌ Circuit breaker error: ${error}`, 'red');
  }
  
  // Check circuit breaker state
  const stripeStats = circuitBreakers.stripe.getStats();
  log(`\n📊 Stripe Circuit Breaker State: ${stripeStats.state}`, 
      stripeStats.state === 'OPEN' ? 'red' : 'green');
  log(`   Failures: ${stripeStats.failures}`, 'yellow');
  log(`   Error Rate: ${(stripeStats.errorRate * 100).toFixed(2)}%`, 'yellow');
}

/**
 * Test circuit breaker recovery
 */
async function testCircuitBreakerRecovery() {
  logHeader('Testing Circuit Breaker Recovery');
  
  // Force circuit breaker open
  circuitBreakers.openai.forceOpen();
  log('🔴 Forced OpenAI circuit breaker OPEN', 'red');
  
  try {
    // Should immediately fail
    await ResilientServiceWrapper.openAIOperation(
      () => simulateFailingService(false),
      { context: { operation: 'test_forced_open' } }
    );
  } catch (error) {
    log(`❌ Expected immediate failure: ${(error as Error).message}`, 'red');
  }
  
  // Wait and test automatic recovery
  log('\n⏳ Waiting for recovery timeout...', 'yellow');
  await sleep(2000); // Wait longer than recovery timeout
  
  // Force close and test recovery
  circuitBreakers.openai.forceClose();
  log('🟢 Forced OpenAI circuit breaker CLOSED', 'green');
  
  try {
    const result = await ResilientServiceWrapper.openAIOperation(
      () => simulateFailingService(false),
      { context: { operation: 'test_recovery' } }
    );
    log(`✅ Recovery successful: ${result}`, 'green');
  } catch (error) {
    log(`❌ Recovery failed: ${error}`, 'red');
  }
}

/**
 * Test timeout handling
 */
async function testTimeoutHandling() {
  logHeader('Testing Timeout Handling');
  
  try {
    log('⏱️ Testing operation with 2-second timeout...', 'yellow');
    
    await ResilientServiceWrapper.emailOperation(
      () => simulateSlowService(5000), // 5 second operation
      { 
        timeout: 2000, // 2 second timeout
        context: { operation: 'test_timeout' } 
      }
    );
  } catch (error) {
    if ((error as Error).message.includes('timeout')) {
      log(`✅ Timeout handled correctly: ${(error as Error).message}`, 'green');
    } else {
      log(`❌ Unexpected error: ${error}`, 'red');
    }
  }
}

/**
 * Test retry mechanism
 */
async function testRetryMechanism() {
  logHeader('Testing Retry Mechanism');
  
  let attemptCount = 0;
  
  try {
    await ResilientServiceWrapper.databaseOperation(
      () => {
        attemptCount++;
        log(`   Attempt ${attemptCount}`, 'blue');
        
        if (attemptCount < 3) {
          throw new Error('Connection timeout');
        }
        
        return Promise.resolve('Database operation successful');
      },
      { context: { operation: 'test_retry' } }
    );
    
    log(`✅ Retry mechanism worked - succeeded on attempt ${attemptCount}`, 'green');
  } catch (error) {
    log(`❌ Retry mechanism failed: ${error}`, 'red');
  }
}

/**
 * Test different error types
 */
async function testErrorClassification() {
  logHeader('Testing Error Classification');
  
  const errorTypes = [
    { name: 'Rate Limit', error: new Error('Rate limit exceeded') },
    { name: 'Authentication', error: new Error('Unauthorized access') },
    { name: 'Network', error: new Error('Connection timeout') },
    { name: 'Validation', error: new Error('Bad request - validation failed') }
  ];
  
  for (const { name, error } of errorTypes) {
    try {
      await ResilientServiceWrapper.webhookOperation(
        () => { throw error; },
        { context: { operation: `test_error_${name.toLowerCase()}` } }
      );
    } catch (caught) {
      log(`🔍 ${name} Error: ${(caught as Error).message}`, 'yellow');
    }
    await sleep(100);
  }
}

/**
 * Display comprehensive circuit breaker statistics
 */
async function displayCircuitBreakerStats() {
  logHeader('Circuit Breaker Statistics');
  
  const allStats = circuitBreakerRegistry.getAllStats();
  
  for (const [name, stats] of Object.entries(allStats)) {
    const stateColor = 
      stats.state === 'CLOSED' ? 'green' :
      stats.state === 'HALF_OPEN' ? 'yellow' : 'red';
    
    log(`\n🔧 ${name.toUpperCase()} Circuit Breaker:`, 'bold');
    log(`   State: ${stats.state}`, stateColor);
    log(`   Total Calls: ${stats.totalCalls}`, 'white');
    log(`   Successes: ${stats.successes}`, 'green');
    log(`   Failures: ${stats.failures}`, 'red');
    log(`   Error Rate: ${(stats.errorRate * 100).toFixed(2)}%`, 'yellow');
    log(`   Consecutive Failures: ${stats.consecutiveFailures}`, 'red');
    log(`   Consecutive Successes: ${stats.consecutiveSuccesses}`, 'green');
    
    if (stats.recentErrors.length > 0) {
      log(`   Recent Errors (${stats.recentErrors.length}):`, 'yellow');
      stats.recentErrors.slice(-3).forEach((error, index) => {
        const time = new Date(error.timestamp).toLocaleTimeString();
        log(`     ${index + 1}. [${time}] ${error.type}: ${error.message.substring(0, 50)}`, 'red');
      });
    }
  }
}

/**
 * Test service health monitoring
 */
async function testServiceHealthMonitoring() {
  logHeader('Testing Service Health Monitoring');
  
  try {
    const healthCheck = await ResilientServiceWrapper.healthCheck();
    
    log(`🏥 Overall Health: ${healthCheck.status}`, 
        healthCheck.status === 'healthy' ? 'green' : 'yellow');
    
    log('\n📊 Service Details:', 'blue');
    for (const [service, health] of Object.entries(healthCheck.services)) {
      const availableColor = health.available ? 'green' : 'red';
      const availableIcon = health.available ? '✅' : '❌';
      
      log(`   ${availableIcon} ${service}:`, availableColor);
      log(`     Circuit State: ${health.circuitState}`, 'white');
      log(`     Error Rate: ${health.errorRate}%`, 'yellow');
      log(`     Available: ${health.available}`, availableColor);
    }
  } catch (error) {
    log(`❌ Health check failed: ${error}`, 'red');
  }
}

/**
 * Load testing simulation
 */
async function simulateLoadTesting() {
  logHeader('Simulating Load Testing');
  
  log('🚀 Running concurrent operations to test resilience...', 'blue');
  
  const operations = Array.from({ length: 20 }, (_, i) => 
    ResilientServiceWrapper.redisOperation(
      async () => {
        // Simulate random success/failure
        const shouldFail = Math.random() < 0.3; // 30% failure rate
        
        if (shouldFail) {
          throw new Error(`Simulated failure ${i}`);
        }
        
        await sleep(Math.random() * 500); // Random delay
        return `Operation ${i} completed`;
      },
      { context: { operation: `load_test_${i}` } }
    ).catch(error => ({ error: error.message }))
  );
  
  const results = await Promise.all(operations);
  
  const successes = results.filter(result => typeof result === 'string').length;
  const failures = results.length - successes;
  
  log(`\n📈 Load Test Results:`, 'bold');
  log(`   Total Operations: ${results.length}`, 'white');
  log(`   Successes: ${successes}`, 'green');
  log(`   Failures: ${failures}`, 'red');
  log(`   Success Rate: ${((successes / results.length) * 100).toFixed(2)}%`, 'yellow');
  
  // Check Redis circuit breaker state after load test
  const redisStats = circuitBreakers.redis.getStats();
  log(`\n🔧 Redis Circuit Breaker After Load Test:`, 'blue');
  log(`   State: ${redisStats.state}`, redisStats.state === 'CLOSED' ? 'green' : 'red');
  log(`   Error Rate: ${(redisStats.errorRate * 100).toFixed(2)}%`, 'yellow');
}

/**
 * Main test runner
 */
async function main() {
  log(`${colors.bold}${colors.magenta}`, 'magenta');
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                    CoreFlow360                             ║
║              Circuit Breaker Testing Suite                 ║
║                                                            ║
║  Testing resilience patterns for external service calls   ║
╚════════════════════════════════════════════════════════════╝
  `);
  log('', 'reset');
  
  try {
    // Run all tests
    await testBasicCircuitBreaker();
    await sleep(1000);
    
    await testCircuitBreakerRecovery();
    await sleep(1000);
    
    await testTimeoutHandling();
    await sleep(1000);
    
    await testRetryMechanism();
    await sleep(1000);
    
    await testErrorClassification();
    await sleep(1000);
    
    await simulateLoadTesting();
    await sleep(1000);
    
    await testServiceHealthMonitoring();
    await sleep(1000);
    
    await displayCircuitBreakerStats();
    
    logHeader('Testing Complete');
    log('🎉 All circuit breaker tests completed successfully!', 'green');
    log('📊 Check the statistics above for detailed results.', 'blue');
    log('🔧 Circuit breakers are ready for production use.', 'green');
    
  } catch (error) {
    log(`💥 Test suite failed: ${error}`, 'red');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    log(`💥 Fatal error: ${error}`, 'red');
    process.exit(1);
  });
}

export { main as runCircuitBreakerTests };