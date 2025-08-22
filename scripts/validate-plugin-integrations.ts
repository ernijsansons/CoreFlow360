/**
 * CoreFlow360 - Plugin Integration Validation Script
 * MATHEMATICALLY PERFECT, ALGORITHMICALLY OPTIMAL, PROVABLY CORRECT
 *
 * Script to validate all plugin integrations and generate comprehensive report
 */

import { PluginRegistryValidator } from '../src/services/integration/plugin-registry-validator'
import { CoreFlowEventBus } from '../src/core/events/event-bus'
import { AIAgentOrchestrator } from '../src/ai/orchestration/ai-agent-orchestrator'
import { PrismaClient } from '@prisma/client'
import { Redis } from 'ioredis'
import fs from 'fs/promises'
import path from 'path'

class PluginValidationRunner {
  private validator: PluginRegistryValidator
  private prisma: PrismaClient
  private redis: Redis

  constructor() {
    // Initialize dependencies (mock for validation purposes)
    this.prisma = new PrismaClient()
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    })

    const eventBus = new CoreFlowEventBus(this.redis, this.prisma, {} as any)
    const aiOrchestrator = new AIAgentOrchestrator({} as any, {} as any, {} as any, this.prisma, this.redis)

    this.validator = new PluginRegistryValidator(eventBus, aiOrchestrator)
  }

  /**
   * Run comprehensive plugin validation
   */
  async runValidation(): Promise<void> {
    console.log('🚀 Starting CoreFlow360 Plugin Integration Validation...\n')

    try {
      // Step 1: Initialize all plugins
      console.log('📦 Initializing all known plugins...')
      await this.validator.initializeAllPlugins()
      console.log('✅ Plugin initialization completed\n')

      // Step 2: Validate all plugins
      console.log('🔍 Validating plugin integrations...')
      const report = await this.validator.validateAllPlugins()
      console.log('✅ Validation completed\n')

      // Step 3: Display results
      this.displayResults(report)

      // Step 4: Generate detailed report
      const detailedReport = this.validator.generateDetailedReport(report)
      await this.saveReport(detailedReport)

      // Step 5: Check for critical issues
      await this.checkCriticalIssues(report)

    } catch (error) {
      console.error('❌ Validation failed:', error)
      process.exit(1)
    }
  }

  /**
   * Display validation results
   */
  private displayResults(report: any): void {
    console.log('📊 VALIDATION RESULTS')
    console.log('=' + '='.repeat(50))
    console.log(`Total Plugins Discovered: ${report.totalPlugins}`)
    console.log(`✅ Valid Plugins: ${report.validPlugins}`)
    console.log(`⚠️  Warning Plugins: ${report.pluginResults.filter((p: any) => p.status === 'WARNING').length}`)
    console.log(`❌ Invalid Plugins: ${report.invalidPlugins}`)
    console.log(`📈 Success Rate: ${((report.validPlugins / report.totalPlugins) * 100).toFixed(1)}%`)
    console.log('')

    // Display system health
    console.log('🏥 SYSTEM HEALTH')
    console.log('-'.repeat(30))
    console.log(`Event Bus: ${report.systemHealth.eventBusReady ? '✅ Ready' : '❌ Not Ready'}`)
    console.log(`AI Orchestrator: ${report.systemHealth.aiOrchestratorReady ? '✅ Ready' : '❌ Not Ready'}`)
    console.log(`Cross-Module Sync: ${report.systemHealth.crossModuleSyncEnabled ? '✅ Enabled' : '❌ Disabled'}`)
    console.log('')

    // Display plugin breakdown
    console.log('🔌 PLUGIN BREAKDOWN')
    console.log('-'.repeat(40))
    for (const plugin of report.pluginResults) {
      const statusIcon = plugin.status === 'VALID' ? '✅' : plugin.status === 'WARNING' ? '⚠️' : '❌'
      console.log(`${statusIcon} ${plugin.pluginId}`)
      
      if (plugin.issues.length > 0) {
        plugin.issues.forEach((issue: string) => {
          console.log(`   └─ ⚠️ ${issue}`)
        })
      }
      
      // Show key capabilities
      const capabilities = []
      if (plugin.capabilities.aiEnabled) capabilities.push('AI')
      if (plugin.capabilities.crossModuleData) capabilities.push('Cross-Module')
      if (plugin.capabilities.realTimeSync) capabilities.push('Real-Time')
      if (capabilities.length > 0) {
        console.log(`   └─ 🎯 Capabilities: ${capabilities.join(', ')}`)
      }
    }
    console.log('')

    // Display recommendations
    if (report.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS')
      console.log('-'.repeat(40))
      report.recommendations.forEach((rec: string) => {
        console.log(`• ${rec}`)
      })
      console.log('')
    }
  }

  /**
   * Save detailed report to file
   */
  private async saveReport(report: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `plugin-validation-report-${timestamp}.md`
    const filepath = path.join(process.cwd(), 'reports', 'integration', filename)

    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(filepath), { recursive: true })
      
      // Write report
      await fs.writeFile(filepath, report, 'utf-8')
      
      console.log(`📄 Detailed report saved to: ${filepath}`)
    } catch (error) {
      console.error('❌ Failed to save report:', error)
    }
  }

  /**
   * Check for critical issues that would block deployment
   */
  private async checkCriticalIssues(report: any): Promise<void> {
    const criticalIssues: string[] = []

    // Check for invalid plugins
    if (report.invalidPlugins > 0) {
      criticalIssues.push(`${report.invalidPlugins} plugins have critical validation errors`)
    }

    // Check system health
    if (!report.systemHealth.eventBusReady) {
      criticalIssues.push('Event Bus is not ready - cross-module communication will fail')
    }

    if (!report.systemHealth.aiOrchestratorReady) {
      criticalIssues.push('AI Orchestrator is not ready - AI features will be unavailable')
    }

    // Check for plugins with missing dependencies
    const dependencyIssues = report.pluginResults.filter((p: any) => !p.dependencies.satisfied)
    if (dependencyIssues.length > 0) {
      criticalIssues.push(`${dependencyIssues.length} plugins have unresolved dependencies`)
    }

    // Check AI capability coverage
    const aiEnabledCount = report.pluginResults.filter((p: any) => p.capabilities.aiEnabled).length
    const aiCoverage = (aiEnabledCount / report.totalPlugins) * 100
    if (aiCoverage < 80) {
      criticalIssues.push(`Only ${aiCoverage.toFixed(1)}% of plugins have AI enabled (target: 80%+)`)
    }

    // Report critical issues
    if (criticalIssues.length > 0) {
      console.log('🚨 CRITICAL ISSUES DETECTED')
      console.log('=' + '='.repeat(50))
      criticalIssues.forEach(issue => {
        console.log(`❌ ${issue}`)
      })
      console.log('')
      console.log('⚠️  These issues must be resolved before production deployment!')
      process.exit(1)
    } else {
      console.log('🎉 All plugin integrations are healthy and ready for deployment!')
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      await this.prisma.$disconnect()
      await this.redis.quit()
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const runner = new PluginValidationRunner()
  
  runner.runValidation()
    .then(() => runner.cleanup())
    .catch(async (error) => {
      console.error('Validation script failed:', error)
      await runner.cleanup()
      process.exit(1)
    })
}

export { PluginValidationRunner }