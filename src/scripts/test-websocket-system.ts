/**
 * CoreFlow360 - WebSocket System Test Script
 * Comprehensive testing of the WebSocket analytics streaming system
 */

import { io, Socket } from 'socket.io-client'

interface TestResult {
  testName: string
  passed: boolean
  details: string
  metrics?: any
  duration?: number
}

class WebSocketTestSuite {
  private results: TestResult[] = []
  private socket: Socket | null = null
  private receivedMessages: any[] = []

  log(message: string) {
    console.log(`[WEBSOCKET TEST] ${message}`)
  }

  addResult(testName: string, passed: boolean, details: string, metrics?: any, duration?: number) {
    this.results.push({ testName, passed, details, metrics, duration })
    const status = passed ? '✅ PASS' : '❌ FAIL'
    this.log(`${status}: ${testName} - ${details}${duration ? ` (${duration}ms)` : ''}`)
  }

  async runAllTests() {
    this.log('Starting WebSocket Analytics System Test Suite...')
    
    await this.testConnectionEstablishment()
    await this.testAuthentication()
    await this.testChannelSubscription()
    await this.testDataStreaming()
    await this.testRealTimeEvents()
    await this.testConnectionResilience()
    await this.testPerformanceMetrics()
    await this.testCleanup()
    
    this.generateReport()
  }

  async testConnectionEstablishment() {
    this.log('Testing WebSocket connection establishment...')
    
    const startTime = Date.now()
    try {
      this.socket = io('http://localhost:3000', {
        transports: ['websocket'],
        forceNew: true,
        timeout: 5000
      })

      const connected = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 5000)
        
        this.socket!.on('connect', () => {
          clearTimeout(timeout)
          resolve(true)
        })
        
        this.socket!.on('connect_error', () => {
          clearTimeout(timeout)
          resolve(false)
        })
      })

      const duration = Date.now() - startTime

      this.addResult(
        'Connection Establishment',
        connected,
        connected ? `Connected successfully with ID: ${this.socket?.id}` : 'Failed to connect',
        { socketId: this.socket?.id, connected },
        duration
      )

    } catch (error) {
      this.addResult(
        'Connection Establishment',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testAuthentication() {
    this.log('Testing WebSocket authentication...')
    
    if (!this.socket || !this.socket.connected) {
      this.addResult('Authentication', false, 'No connection available')
      return
    }

    const startTime = Date.now()
    try {
      const authResult = await new Promise<any>((resolve) => {
        const timeout = setTimeout(() => resolve({ success: false, error: 'Timeout' }), 5000)
        
        this.socket!.on('authenticated', (data) => {
          clearTimeout(timeout)
          resolve({ success: true, data })
        })
        
        this.socket!.on('authentication_failed', (data) => {
          clearTimeout(timeout)
          resolve({ success: false, error: data.error })
        })
        
        // Send authentication
        this.socket!.emit('authenticate', {
          token: 'test_token_123456789',
          tenantId: 'test_tenant',
          userId: 'test_user',
          userAgent: 'WebSocket Test Suite',
          department: 'engineering'
        })
      })

      const duration = Date.now() - startTime

      this.addResult(
        'Authentication',
        authResult.success,
        authResult.success ? 'Authentication successful' : `Authentication failed: ${authResult.error}`,
        authResult.data,
        duration
      )

    } catch (error) {
      this.addResult(
        'Authentication',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testChannelSubscription() {
    this.log('Testing channel subscription...')
    
    if (!this.socket || !this.socket.connected) {
      this.addResult('Channel Subscription', false, 'No connection available')
      return
    }

    const startTime = Date.now()
    try {
      const subscriptions = [
        'dashboard:metrics',
        'analytics:revenue',
        'events:realtime'
      ]

      let successfulSubscriptions = 0

      for (const channel of subscriptions) {
        const subscribed = await new Promise<boolean>((resolve) => {
          const timeout = setTimeout(() => resolve(false), 3000)
          
          this.socket!.on('subscription_confirmed', (data) => {
            if (data.channel === channel) {
              clearTimeout(timeout)
              resolve(true)
            }
          })
          
          this.socket!.on('subscription_error', () => {
            clearTimeout(timeout)
            resolve(false)
          })
          
          this.socket!.emit('subscribe', {
            channel,
            filters: {
              tenantId: 'test_tenant',
              timeframe: '5m'
            }
          })
        })

        if (subscribed) {
          successfulSubscriptions++
        }
      }

      const duration = Date.now() - startTime
      const allSubscribed = successfulSubscriptions === subscriptions.length

      this.addResult(
        'Channel Subscription',
        allSubscribed,
        `Successfully subscribed to ${successfulSubscriptions}/${subscriptions.length} channels`,
        { successfulSubscriptions, totalChannels: subscriptions.length },
        duration
      )

    } catch (error) {
      this.addResult(
        'Channel Subscription',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testDataStreaming() {
    this.log('Testing data streaming...')
    
    if (!this.socket || !this.socket.connected) {
      this.addResult('Data Streaming', false, 'No connection available')
      return
    }

    const startTime = Date.now()
    try {
      this.receivedMessages = []
      
      // Set up message listeners
      const messageTypes = ['initial_data', 'analytics_update', 'metrics_update']
      
      messageTypes.forEach(type => {
        this.socket!.on(type, (data) => {
          this.receivedMessages.push({
            type,
            data,
            timestamp: new Date(),
            channel: data.channel
          })
        })
      })

      // Wait for messages for 10 seconds
      await new Promise(resolve => setTimeout(resolve, 10000))

      const duration = Date.now() - startTime
      const receivedCount = this.receivedMessages.length
      const hasInitialData = this.receivedMessages.some(m => m.type === 'initial_data')
      const hasUpdates = this.receivedMessages.some(m => m.type.includes('_update'))

      this.addResult(
        'Data Streaming',
        receivedCount > 0 && (hasInitialData || hasUpdates),
        `Received ${receivedCount} messages (Initial: ${hasInitialData}, Updates: ${hasUpdates})`,
        { 
          messagesReceived: receivedCount,
          hasInitialData,
          hasUpdates,
          messageTypes: [...new Set(this.receivedMessages.map(m => m.type))]
        },
        duration
      )

    } catch (error) {
      this.addResult(
        'Data Streaming',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testRealTimeEvents() {
    this.log('Testing real-time event tracking...')
    
    if (!this.socket || !this.socket.connected) {
      this.addResult('Real-Time Events', false, 'No connection available')
      return
    }

    const startTime = Date.now()
    try {
      let eventReceived = false
      
      this.socket.on('realtime_event', (data) => {
        if (data.data.type === 'test_event') {
          eventReceived = true
        }
      })

      // Send a test event
      this.socket.emit('track_event', {
        type: 'test_event',
        data: { message: 'WebSocket test event', value: 123 },
        timestamp: new Date()
      })

      // Wait for event to be processed and broadcast back
      await new Promise(resolve => setTimeout(resolve, 3000))

      const duration = Date.now() - startTime

      this.addResult(
        'Real-Time Events',
        eventReceived,
        eventReceived ? 'Test event sent and received successfully' : 'Test event not received',
        { eventReceived },
        duration
      )

    } catch (error) {
      this.addResult(
        'Real-Time Events',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testConnectionResilience() {
    this.log('Testing connection resilience...')
    
    if (!this.socket || !this.socket.connected) {
      this.addResult('Connection Resilience', false, 'No connection available')
      return
    }

    const startTime = Date.now()
    try {
      let reconnected = false
      
      this.socket.on('reconnect', () => {
        reconnected = true
      })

      // Simulate connection drop
      this.socket.disconnect()
      
      // Wait a moment then reconnect
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.socket.connect()

      // Wait for reconnection
      await new Promise(resolve => setTimeout(resolve, 5000))

      const duration = Date.now() - startTime
      const isConnected = this.socket.connected

      this.addResult(
        'Connection Resilience',
        isConnected,
        isConnected ? 'Successfully reconnected after disconnect' : 'Failed to reconnect',
        { reconnected, finalState: isConnected },
        duration
      )

    } catch (error) {
      this.addResult(
        'Connection Resilience',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testPerformanceMetrics() {
    this.log('Testing performance metrics...')
    
    if (!this.socket || !this.socket.connected) {
      this.addResult('Performance Metrics', false, 'No connection available')
      return
    }

    const startTime = Date.now()
    try {
      const pingTimes: number[] = []
      const messageCount = 10

      // Send multiple ping messages and measure response times
      for (let i = 0; i < messageCount; i++) {
        const pingStart = Date.now()
        
        const pongReceived = await new Promise<boolean>((resolve) => {
          const timeout = setTimeout(() => resolve(false), 2000)
          
          this.socket!.once('pong', () => {
            clearTimeout(timeout)
            const pingTime = Date.now() - pingStart
            pingTimes.push(pingTime)
            resolve(true)
          })
          
          this.socket!.emit('ping')
        })

        if (!pongReceived) break
        
        // Small delay between pings
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const duration = Date.now() - startTime
      const avgLatency = pingTimes.length > 0 ? pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length : 0
      const maxLatency = Math.max(...pingTimes, 0)
      const minLatency = Math.min(...pingTimes, 0)

      this.addResult(
        'Performance Metrics',
        pingTimes.length >= messageCount * 0.8, // At least 80% successful
        `Avg latency: ${avgLatency.toFixed(1)}ms, Min: ${minLatency}ms, Max: ${maxLatency}ms`,
        { 
          avgLatency: avgLatency.toFixed(1),
          minLatency,
          maxLatency,
          successfulPings: pingTimes.length,
          totalPings: messageCount
        },
        duration
      )

    } catch (error) {
      this.addResult(
        'Performance Metrics',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testCleanup() {
    this.log('Testing cleanup and disconnection...')
    
    const startTime = Date.now()
    try {
      let cleanDisconnect = false
      
      if (this.socket) {
        this.socket.on('disconnect', () => {
          cleanDisconnect = true
        })
        
        this.socket.disconnect()
        
        // Wait for disconnect event
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      const duration = Date.now() - startTime

      this.addResult(
        'Cleanup',
        cleanDisconnect || !this.socket,
        cleanDisconnect ? 'Clean disconnection successful' : 'Disconnection completed',
        { cleanDisconnect },
        duration
      )

    } catch (error) {
      this.addResult(
        'Cleanup',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  generateReport() {
    this.log('\n' + '='.repeat(60))
    this.log('WEBSOCKET ANALYTICS SYSTEM TEST REPORT')
    this.log('='.repeat(60))
    
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.passed).length
    const failedTests = totalTests - passedTests
    const successRate = (passedTests / totalTests * 100).toFixed(1)
    const totalDuration = this.results.reduce((sum, r) => sum + (r.duration || 0), 0)
    
    this.log(`Total Tests: ${totalTests}`)
    this.log(`Passed: ${passedTests}`)
    this.log(`Failed: ${failedTests}`)
    this.log(`Success Rate: ${successRate}%`)
    this.log(`Total Duration: ${totalDuration}ms`)
    
    this.log('\nDETAILED RESULTS:')
    this.log('-'.repeat(40))
    
    this.results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌'
      this.log(`${index + 1}. ${status} ${result.testName}`)
      this.log(`   ${result.details}`)
      if (result.duration) {
        this.log(`   Duration: ${result.duration}ms`)
      }
      if (result.metrics) {
        this.log(`   Metrics: ${JSON.stringify(result.metrics, null, 2)}`)
      }
      this.log('')
    })
    
    this.log('\nMESSAGE ANALYSIS:')
    this.log('-'.repeat(40))
    this.log(`Total messages received: ${this.receivedMessages.length}`)
    
    const messagesByType = this.receivedMessages.reduce((acc, msg) => {
      acc[msg.type] = (acc[msg.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(messagesByType).forEach(([type, count]) => {
      this.log(`  ${type}: ${count} messages`)
    })
    
    if (failedTests > 0) {
      this.log('⚠️  SOME TESTS FAILED - Please review the WebSocket implementation')
    } else {
      this.log('🎉 ALL TESTS PASSED - WebSocket analytics system is working correctly!')
    }
    
    this.log('='.repeat(60))
  }
}

// Run the test suite
async function runWebSocketTests() {
  const testSuite = new WebSocketTestSuite()
  await testSuite.runAllTests()
}

// Export for use in other contexts
export { WebSocketTestSuite, runWebSocketTests }

// Run if executed directly
if (require.main === module) {
  runWebSocketTests().catch(console.error)
}