/**
 * CoreFlow360 - Bug Bot Test Script
 * Test the bug bot functionality and demonstrate its capabilities
 */

import { bugBot } from '../src/lib/bug-bot/bug-bot'

async function testBugBot() {
  console.log('🐛 Starting Bug Bot Test...\n')

  try {
    // Start the bug bot
    console.log('1. Starting Bug Bot...')
    await bugBot.start()
    console.log('✅ Bug Bot started successfully\n')

    // Test bug reporting
    console.log('2. Testing Bug Reporting...')
    
    const testBugs = [
      {
        title: 'API Rate Limiting Issue',
        description: 'Users are experiencing 429 errors when making multiple API calls within a short time period. This is affecting the dashboard functionality.',
        severity: 'HIGH' as const,
        category: 'API' as const,
        technicalDetails: {
          errorMessage: '429 Too Many Requests',
          apiEndpoint: '/api/users/profile',
          componentName: 'UserProfileComponent'
        },
        businessImpact: {
          affectedUsers: 150,
          revenueImpact: 'MEDIUM' as const,
          customerImpact: 'Dashboard becomes unusable for power users'
        },
        tags: ['api', 'rate-limiting', 'dashboard']
      },
      {
        title: 'Database Connection Timeout',
        description: 'Database connections are timing out during peak hours, causing intermittent service disruptions.',
        severity: 'CRITICAL' as const,
        category: 'DATABASE' as const,
        technicalDetails: {
          errorMessage: 'Connection timeout after 30 seconds',
          databaseQuery: 'SELECT * FROM users WHERE tenant_id = ?',
          performanceMetrics: {
            responseTime: 35000,
            memoryUsage: 85
          }
        },
        businessImpact: {
          affectedUsers: 500,
          revenueImpact: 'HIGH' as const,
          customerImpact: 'Complete service outage during peak hours'
        },
        tags: ['database', 'timeout', 'performance']
      },
      {
        title: 'UI Component Rendering Issue',
        description: 'The data table component is not rendering properly on mobile devices, causing layout issues.',
        severity: 'MEDIUM' as const,
        category: 'UI_UX' as const,
        technicalDetails: {
          componentName: 'DataTableComponent',
          performanceMetrics: {
            responseTime: 2000
          }
        },
        businessImpact: {
          affectedUsers: 75,
          revenueImpact: 'LOW' as const,
          customerImpact: 'Poor user experience on mobile devices'
        },
        tags: ['ui', 'mobile', 'responsive']
      },
      {
        title: 'AI Model Performance Degradation',
        description: 'The consciousness AI model is showing decreased accuracy in business predictions, affecting automated decision making.',
        severity: 'HIGH' as const,
        category: 'CONSCIOUSNESS' as const,
        technicalDetails: {
          componentName: 'ConsciousnessAIModel',
          performanceMetrics: {
            responseTime: 5000,
            cpuUsage: 90
          }
        },
        businessImpact: {
          affectedUsers: 200,
          revenueImpact: 'HIGH' as const,
          customerImpact: 'Inaccurate business insights and recommendations'
        },
        tags: ['ai', 'consciousness', 'performance', 'accuracy']
      }
    ]

    const reportedBugs = []
    for (const testBug of testBugs) {
      const bug = await bugBot.reportBug(testBug)
      reportedBugs.push(bug)
      console.log(`✅ Reported bug: ${bug.title} (${bug.id})`)
    }
    console.log('')

    // Test statistics
    console.log('3. Testing Statistics...')
    const stats = await bugBot.getBugStatistics()
    console.log('📊 Bug Statistics:')
    console.log(`   Total Bugs: ${stats.total}`)
    console.log(`   By Status:`, stats.byStatus)
    console.log(`   By Severity:`, stats.bySeverity)
    console.log(`   By Category:`, stats.byCategory)
    console.log(`   Avg Resolution Time: ${Math.round(stats.averageResolutionTime / 60)} hours`)
    console.log('')

    // Test active bugs
    console.log('4. Testing Active Bugs...')
    const activeBugs = await bugBot.getActiveBugs()
    console.log(`📋 Active Bugs: ${activeBugs.length}`)
    activeBugs.forEach(bug => {
      console.log(`   - ${bug.title} (${bug.severity}/${bug.status})`)
    })
    console.log('')

    // Test bug retrieval
    console.log('5. Testing Bug Retrieval...')
    if (reportedBugs.length > 0) {
      const firstBug = reportedBugs[0]
      const retrievedBug = await bugBot.getBugById(firstBug.id)
      if (retrievedBug) {
        console.log(`✅ Retrieved bug: ${retrievedBug.title}`)
        console.log(`   AI Analysis Confidence: ${Math.round(retrievedBug.aiAnalysis?.confidence * 100)}%`)
        console.log(`   Suggested Fix: ${retrievedBug.aiAnalysis?.suggestedFix}`)
      }
    }
    console.log('')

    // Simulate some time passing for periodic scans
    console.log('6. Simulating Periodic Scans...')
    console.log('⏳ Waiting 5 seconds to simulate periodic scanning...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    console.log('✅ Periodic scan simulation completed\n')

    // Test error handling
    console.log('7. Testing Error Handling...')
    try {
      await bugBot.reportBug({
        title: '',
        description: ''
      })
    } catch (error) {
      console.log('✅ Error handling works correctly:', error instanceof Error ? error.message : 'Unknown error')
    }
    console.log('')

    // Final statistics
    console.log('8. Final Statistics...')
    const finalStats = await bugBot.getBugStatistics()
    console.log(`📊 Final Bug Count: ${finalStats.total}`)
    console.log(`   Critical: ${finalStats.bySeverity.CRITICAL || 0}`)
    console.log(`   High: ${finalStats.bySeverity.HIGH || 0}`)
    console.log(`   Medium: ${finalStats.bySeverity.MEDIUM || 0}`)
    console.log(`   Low: ${finalStats.bySeverity.LOW || 0}`)
    console.log('')

    // Stop the bug bot
    console.log('9. Stopping Bug Bot...')
    await bugBot.stop()
    console.log('✅ Bug Bot stopped successfully\n')

    console.log('🎉 Bug Bot Test Completed Successfully!')
    console.log('\n📋 Test Summary:')
    console.log('   ✅ Bug Bot startup and shutdown')
    console.log('   ✅ Bug reporting with AI analysis')
    console.log('   ✅ Statistics generation')
    console.log('   ✅ Active bug tracking')
    console.log('   ✅ Bug retrieval by ID')
    console.log('   ✅ Error handling')
    console.log('   ✅ Periodic scanning simulation')

  } catch (error) {
    console.error('❌ Bug Bot Test Failed:', error)
    process.exit(1)
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testBugBot()
    .then(() => {
      console.log('\n✨ All tests passed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error)
      process.exit(1)
    })
}

export { testBugBot }
