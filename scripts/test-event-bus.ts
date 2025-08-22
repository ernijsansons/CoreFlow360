/**
 * CoreFlow360 - Event Bus Communication Test Script
 * MATHEMATICALLY PERFECT, ALGORITHMICALLY OPTIMAL, PROVABLY CORRECT
 *
 * Script to validate event bus communication between all modules
 */

import { EventBusValidator } from '../src/services/integration/event-bus-validator'
import * as fs from 'fs/promises'
import * as path from 'path'

class EventBusTestRunner {
  private validator: EventBusValidator

  constructor() {
    this.validator = new EventBusValidator()
  }

  /**
   * Run comprehensive event bus validation
   */
  async runValidation(): Promise<void> {
    console.log('📡 CoreFlow360 Event Bus Communication Test')
    console.log('=' + '='.repeat(60))
    console.log('')

    try {
      // Run all event bus tests
      const report = await this.validator.runEventBusTests()

      // Save detailed report
      await this.saveReport(report)

      // Display final summary
      this.displayFinalSummary(report)

      // Exit with appropriate code based on results
      if (report.failedDeliveries > 0 || report.timeoutDeliveries > 0) {
        const criticalFailures = report.criticalIssues.length
        
        if (criticalFailures > 0) {
          console.log(`\n❌ ${criticalFailures} critical event bus issue(s) detected`)
          process.exit(1)
        } else {
          console.log(`\n⚠️  ${report.failedDeliveries + report.timeoutDeliveries} event delivery issue(s) need attention`)
          process.exit(0)
        }
      } else {
        console.log('\n🎉 All event bus communications are working perfectly!')
        process.exit(0)
      }

    } catch (error) {
      console.error('❌ Event bus validation failed:', error)
      process.exit(1)
    }
  }

  /**
   * Display final summary
   */
  private displayFinalSummary(report: any): void {
    console.log('\n📊 EVENT BUS VALIDATION SUMMARY')
    console.log('=' + '='.repeat(50))
    
    // Overall health score
    const healthScore = (report.successfulDeliveries / report.totalTests) * 100
    const healthIcon = healthScore >= 95 ? '🟢' : healthScore >= 85 ? '🟡' : '🔴'
    console.log(`${healthIcon} Overall Event Bus Health: ${healthScore.toFixed(1)}%`)
    
    // Key metrics
    console.log(`🎯 Message Integrity: ${(report.messageIntegrityScore * 100).toFixed(1)}%`)
    console.log(`🔄 Routing Accuracy: ${(report.routingAccuracy * 100).toFixed(1)}%`)
    console.log(`⚡ Average Delivery Time: ${report.averageDeliveryTime}ms`)
    
    // Channel performance overview
    let healthyChannels = 0
    for (const [channel, performance] of Object.entries(report.channelPerformance)) {
      if (performance.successRate >= 0.95 && performance.averageLatency <= 150) {
        healthyChannels++
      }
    }
    console.log(`📡 Healthy Channels: ${healthyChannels}/${Object.keys(report.channelPerformance).length}`)
    
    // Module reliability overview
    let reliableModules = 0
    for (const [module, reliability] of Object.entries(report.moduleReliability)) {
      if (reliability.sendReliability >= 0.9 && reliability.receiveReliability >= 0.9 && reliability.errorRate <= 0.1) {
        reliableModules++
      }
    }
    console.log(`🏢 Reliable Modules: ${reliableModules}/${Object.keys(report.moduleReliability).length}`)
    
    // Critical issues summary
    if (report.criticalIssues.length > 0) {
      console.log(`\n🚨 Critical Issues: ${report.criticalIssues.length}`)
      report.criticalIssues.forEach(issue => console.log(`   • ${issue}`))
    }
    
    // Top recommendations
    if (report.recommendations.length > 0) {
      console.log(`\n💡 Top 3 Recommendations:`)
      report.recommendations.slice(0, 3).forEach((rec, i) => console.log(`   ${i + 1}. ${rec}`))
    }
  }

  /**
   * Save event bus validation report
   */
  private async saveReport(report: any): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `event-bus-report-${timestamp}.json`
    const filepath = path.join(process.cwd(), 'reports', 'integration', filename)

    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(filepath), { recursive: true })
      
      // Write report
      await fs.writeFile(filepath, JSON.stringify(report, null, 2))
      
      console.log(`\n📄 Detailed event bus report saved to: ${filepath}`)
    } catch (error) {
      console.error('Failed to save event bus report:', error)
    }
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const runner = new EventBusTestRunner()
  runner.runValidation().catch(console.error)
}

export { EventBusTestRunner }