/**
 * CoreFlow360 - Bug Bot Demo Script
 * Demonstrates the bug bot functionality with real examples
 */

import { bugBot } from '../src/lib/bug-bot/bug-bot'

async function demoBugBot() {
  console.log('🐛 CoreFlow360 Bug Bot Demo\n')
  console.log('This demo shows how the bug bot automatically detects, categorizes, and analyzes bugs.\n')

  try {
    // Start the bug bot
    console.log('🚀 Starting Bug Bot...')
    await bugBot.start()
    console.log('✅ Bug Bot is now monitoring for issues\n')

    // Demo 1: API Error
    console.log('📝 Demo 1: API Rate Limiting Issue')
    const apiBug = await bugBot.reportBug({
      title: 'API Rate Limiting Issue',
      description: 'Users are experiencing 429 errors when making multiple API calls. The dashboard becomes unusable for power users.',
      severity: 'HIGH',
      category: 'API',
      technicalDetails: {
        errorMessage: '429 Too Many Requests',
        apiEndpoint: '/api/users/profile',
        componentName: 'UserProfileComponent'
      },
      businessImpact: {
        affectedUsers: 150,
        revenueImpact: 'MEDIUM',
        customerImpact: 'Dashboard becomes unusable for power users'
      },
      tags: ['api', 'rate-limiting', 'dashboard']
    })
    console.log(`   ✅ Bug reported: ${apiBug.title}`)
    console.log(`   🏷️  AI Category: ${apiBug.category}`)
    console.log(`   ⚠️  AI Severity: ${apiBug.severity}`)
    console.log(`   🎯 AI Confidence: ${Math.round(apiBug.aiAnalysis!.confidence * 100)}%`)
    console.log(`   💡 AI Fix: ${apiBug.aiAnalysis!.suggestedFix}\n`)

    // Demo 2: Database Issue
    console.log('📝 Demo 2: Database Connection Timeout')
    const dbBug = await bugBot.reportBug({
      title: 'Database Connection Timeout',
      description: 'Database connections are timing out during peak hours, causing intermittent service disruptions.',
      severity: 'CRITICAL',
      category: 'DATABASE',
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
        revenueImpact: 'HIGH',
        customerImpact: 'Complete service outage during peak hours'
      },
      tags: ['database', 'timeout', 'performance']
    })
    console.log(`   ✅ Bug reported: ${dbBug.title}`)
    console.log(`   🏷️  AI Category: ${dbBug.category}`)
    console.log(`   ⚠️  AI Severity: ${dbBug.severity}`)
    console.log(`   🎯 AI Confidence: ${Math.round(dbBug.aiAnalysis!.confidence * 100)}%`)
    console.log(`   💡 AI Fix: ${dbBug.aiAnalysis!.suggestedFix}\n`)

    // Demo 3: UI Issue
    console.log('📝 Demo 3: UI Component Rendering Issue')
    const uiBug = await bugBot.reportBug({
      title: 'UI Component Rendering Issue',
      description: 'The data table component is not rendering properly on mobile devices, causing layout issues.',
      severity: 'MEDIUM',
      category: 'UI_UX',
      technicalDetails: {
        componentName: 'DataTableComponent',
        performanceMetrics: {
          responseTime: 2000
        }
      },
      businessImpact: {
        affectedUsers: 75,
        revenueImpact: 'LOW',
        customerImpact: 'Poor user experience on mobile devices'
      },
      tags: ['ui', 'mobile', 'responsive']
    })
    console.log(`   ✅ Bug reported: ${uiBug.title}`)
    console.log(`   🏷️  AI Category: ${uiBug.category}`)
    console.log(`   ⚠️  AI Severity: ${uiBug.severity}`)
    console.log(`   🎯 AI Confidence: ${Math.round(uiBug.aiAnalysis!.confidence * 100)}%`)
    console.log(`   💡 AI Fix: ${uiBug.aiAnalysis!.suggestedFix}\n`)

    // Demo 4: AI/Consciousness Issue
    console.log('📝 Demo 4: AI Model Performance Degradation')
    const aiBug = await bugBot.reportBug({
      title: 'AI Model Performance Degradation',
      description: 'The consciousness AI model is showing decreased accuracy in business predictions, affecting automated decision making.',
      severity: 'HIGH',
      category: 'CONSCIOUSNESS',
      technicalDetails: {
        componentName: 'ConsciousnessAIModel',
        performanceMetrics: {
          responseTime: 5000,
          cpuUsage: 90
        }
      },
      businessImpact: {
        affectedUsers: 200,
        revenueImpact: 'HIGH',
        customerImpact: 'Inaccurate business insights and recommendations'
      },
      tags: ['ai', 'consciousness', 'performance', 'accuracy']
    })
    console.log(`   ✅ Bug reported: ${aiBug.title}`)
    console.log(`   🏷️  AI Category: ${aiBug.category}`)
    console.log(`   ⚠️  AI Severity: ${aiBug.severity}`)
    console.log(`   🎯 AI Confidence: ${Math.round(aiBug.aiAnalysis!.confidence * 100)}%`)
    console.log(`   💡 AI Fix: ${aiBug.aiAnalysis!.suggestedFix}\n`)

    // Show statistics
    console.log('📊 Bug Statistics:')
    const stats = await bugBot.getBugStatistics()
    console.log(`   Total Bugs: ${stats.total}`)
    console.log(`   By Status: ${JSON.stringify(stats.byStatus)}`)
    console.log(`   By Severity: ${JSON.stringify(stats.bySeverity)}`)
    console.log(`   By Category: ${JSON.stringify(stats.byCategory)}`)
    console.log(`   Avg Resolution Time: ${Math.round(stats.averageResolutionTime / 60)} hours\n`)

    // Show active bugs
    console.log('📋 Active Bugs:')
    const activeBugs = await bugBot.getActiveBugs()
    activeBugs.forEach((bug, index) => {
      console.log(`   ${index + 1}. ${bug.title}`)
      console.log(`      Status: ${bug.status} | Severity: ${bug.severity} | Category: ${bug.category}`)
      console.log(`      AI Confidence: ${Math.round(bug.aiAnalysis!.confidence * 100)}%`)
    })
    console.log('')

    // Demo auto-triage
    console.log('🤖 Auto-Triage Demo:')
    console.log('   The bug bot automatically triages bugs with high AI confidence...')
    const highConfidenceBugs = activeBugs.filter(bug => bug.aiAnalysis!.confidence > 0.7)
    console.log(`   Found ${highConfidenceBugs.length} bugs with high confidence for auto-triage\n`)

    // Stop the bug bot
    console.log('🛑 Stopping Bug Bot...')
    await bugBot.stop()
    console.log('✅ Bug Bot stopped\n')

    console.log('🎉 Demo Completed Successfully!')
    console.log('\n📋 What the Bug Bot Did:')
    console.log('   ✅ Automatically categorized bugs by type (API, Database, UI, AI)')
    console.log('   ✅ Assessed severity based on business impact')
    console.log('   ✅ Generated AI analysis with confidence scores')
    console.log('   ✅ Suggested fixes and estimated resolution times')
    console.log('   ✅ Applied smart tagging for better organization')
    console.log('   ✅ Provided comprehensive statistics and reporting')
    console.log('\n🚀 The Bug Bot is now ready to monitor your CoreFlow360 application!')

  } catch (error) {
    console.error('❌ Demo failed:', error)
    process.exit(1)
  }
}

// Run the demo
demoBugBot()
  .then(() => {
    console.log('\n✨ Demo completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Demo failed:', error)
    process.exit(1)
  })
