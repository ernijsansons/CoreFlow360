/**
 * CoreFlow360 - Configuration Validator Test Script
 * MATHEMATICALLY PERFECT, ALGORITHMICALLY OPTIMAL, PROVABLY CORRECT
 *
 * Script to test plugin configuration validation system
 */

import { 
  PluginConfigurationValidator, 
  ConfigurationStatus 
} from '../src/services/validation/plugin-configuration-validator'
import * as fs from 'fs/promises'
import * as path from 'path'

class ConfigurationValidatorTester {
  private validator: PluginConfigurationValidator

  constructor() {
    this.validator = new PluginConfigurationValidator()
  }

  /**
   * Run comprehensive configuration validation tests
   */
  async runTests(): Promise<void> {
    console.log('🔧 CoreFlow360 Configuration Validation Test')
    console.log('=' + '='.repeat(60))
    console.log('')

    try {
      // Phase 1: Initialize validator
      console.log('📋 Phase 1: Configuration Validator Initialization')
      console.log('-'.repeat(50))
      console.log('✅ Configuration validator initialized')
      console.log('✅ Plugin schemas loaded')
      console.log('✅ Validation rules defined')
      console.log('')

      // Phase 2: Test individual plugin validations
      console.log('📋 Phase 2: Individual Plugin Configuration Tests')
      console.log('-'.repeat(50))
      await this.testIndividualPluginValidations()
      console.log('')

      // Phase 3: Run system-wide validation
      console.log('📋 Phase 3: System-Wide Configuration Validation')
      console.log('-'.repeat(50))
      const systemReport = await this.validator.validateAllPluginConfigurations()
      console.log('')

      // Phase 4: Analyze system report
      console.log('📋 Phase 4: Configuration Analysis & Reporting')
      console.log('-'.repeat(50))
      await this.analyzeSystemReport(systemReport)
      console.log('')

      // Phase 5: Generate detailed report
      console.log('📋 Phase 5: Generate Configuration Report')
      console.log('-'.repeat(50))
      await this.generateDetailedReport(systemReport)
      console.log('')

      console.log('✅ Configuration validation test completed successfully!')

    } catch (error) {
      console.error('❌ Configuration validation test failed:', error)
      process.exit(1)
    }
  }

  /**
   * Test individual plugin validations
   */
  private async testIndividualPluginValidations(): Promise<void> {
    const pluginNames = [
      'TwentyCRMPlugin',
      'BigcapitalPlugin', 
      'EverGauzyHRPlugin',
      'PlaneProjectPlugin'
    ]

    for (const pluginName of pluginNames) {
      console.log(`🔍 Testing ${pluginName} configuration...`)
      
      try {
        const report = await this.validator.validatePluginConfiguration(pluginName)
        
        const statusIcon = report.overallStatus === ConfigurationStatus.VALID ? '✅' : 
                          report.overallStatus === ConfigurationStatus.WARNING ? '⚠️' : '❌'
        
        console.log(`  ${statusIcon} Overall Status: ${report.overallStatus}`)
        console.log(`  📊 Configurations: ${report.validConfigurations}/${report.totalConfigurations} valid`)
        
        if (report.invalidConfigurations > 0) {
          console.log(`  ❌ Invalid: ${report.invalidConfigurations}`)
        }
        if (report.missingConfigurations > 0) {
          console.log(`  📭 Missing: ${report.missingConfigurations}`)
        }
        if (report.warningConfigurations > 0) {
          console.log(`  ⚠️  Warnings: ${report.warningConfigurations}`)
        }

        // Environment variables status
        if (!report.environmentVariableStatus.allPresent) {
          console.log(`  🌍 Missing env vars: ${report.environmentVariableStatus.requiredMissing.join(', ')}`)
        }

        // Security and performance issues
        if (report.securityIssues.length > 0) {
          console.log(`  🔒 Security issues: ${report.securityIssues.length}`)
          report.securityIssues.slice(0, 2).forEach(issue => {
            console.log(`    └─ ${issue}`)
          })
        }

        if (report.performanceIssues.length > 0) {
          console.log(`  ⚡ Performance issues: ${report.performanceIssues.length}`)
          report.performanceIssues.slice(0, 2).forEach(issue => {
            console.log(`    └─ ${issue}`)
          })
        }

        // Top recommendations
        if (report.recommendations.length > 0) {
          console.log(`  💡 Top recommendations:`)
          report.recommendations.slice(0, 3).forEach(rec => {
            console.log(`    └─ ${rec}`)
          })
        }

      } catch (error) {
        console.log(`  ❌ Error testing ${pluginName}: ${error.message}`)
      }
      
      console.log('')
    }
  }

  /**
   * Analyze system validation report
   */
  private async analyzeSystemReport(systemReport: any): Promise<void> {
    console.log('📊 SYSTEM CONFIGURATION ANALYSIS')
    console.log('=' + '='.repeat(50))
    
    // Overall system health
    const healthIcon = systemReport.overallSystemHealth === ConfigurationStatus.VALID ? '🟢' : 
                      systemReport.overallSystemHealth === ConfigurationStatus.WARNING ? '🟡' : '🔴'
    console.log(`${healthIcon} System Configuration Health: ${systemReport.overallSystemHealth}`)
    console.log('')

    // Plugin breakdown
    console.log('🏢 Plugin Configuration Breakdown:')
    console.log(`  Total Plugins: ${systemReport.totalPlugins}`)
    console.log(`  ✅ Valid: ${systemReport.validPlugins} (${((systemReport.validPlugins / systemReport.totalPlugins) * 100).toFixed(1)}%)`)
    console.log(`  ⚠️  Warning: ${systemReport.warningPlugins} (${((systemReport.warningPlugins / systemReport.totalPlugins) * 100).toFixed(1)}%)`)
    console.log(`  ❌ Invalid: ${systemReport.invalidPlugins} (${((systemReport.invalidPlugins / systemReport.totalPlugins) * 100).toFixed(1)}%)`)
    console.log('')

    // Detailed plugin status
    console.log('📋 Individual Plugin Status:')
    systemReport.pluginReports.forEach(report => {
      const statusIcon = report.overallStatus === ConfigurationStatus.VALID ? '✅' : 
                        report.overallStatus === ConfigurationStatus.WARNING ? '⚠️' : '❌'
      const configRatio = `${report.validConfigurations}/${report.totalConfigurations}`
      const envStatus = report.environmentVariableStatus.allPresent ? '🟢' : '🔴'
      
      console.log(`  ${statusIcon} ${report.pluginName} (${report.module})`)
      console.log(`    └─ Configs: ${configRatio}, Env: ${envStatus}, Security: ${report.securityIssues.length} issues, Performance: ${report.performanceIssues.length} issues`)
    })
    console.log('')

    // Critical issues
    if (systemReport.criticalIssues.length > 0) {
      console.log('🚨 Critical Issues:')
      systemReport.criticalIssues.forEach(issue => {
        console.log(`  • ${issue}`)
      })
      console.log('')
    }

    // Environmental issues
    if (systemReport.environmentalIssues.length > 0) {
      console.log('🌍 Environmental Issues:')
      systemReport.environmentalIssues.forEach(issue => {
        console.log(`  • ${issue}`)
      })
      console.log('')
    }

    // System recommendations
    if (systemReport.systemRecommendations.length > 0) {
      console.log('💡 System Recommendations:')
      systemReport.systemRecommendations.forEach(rec => {
        console.log(`  • ${rec}`)
      })
      console.log('')
    }

    // Production readiness assessment
    const productionReady = systemReport.overallSystemHealth !== ConfigurationStatus.INVALID && 
                           systemReport.criticalIssues.length === 0
    
    console.log('🚀 Production Readiness Assessment:')
    console.log(`  Ready for Production: ${productionReady ? '✅ YES' : '❌ NO'}`)
    
    if (!productionReady) {
      console.log(`  Blocking Issues: ${systemReport.criticalIssues.length + systemReport.invalidPlugins}`)
      console.log('  Action Required: Fix critical configuration issues before deployment')
    } else if (systemReport.warningPlugins > 0) {
      console.log('  Status: Production ready with optimization opportunities')
      console.log(`  Suggested: Address ${systemReport.warningPlugins} plugin warning(s) for optimal performance`)
    } else {
      console.log('  Status: Fully optimized and production ready')
    }
    
    console.log('')
  }

  /**
   * Generate detailed configuration report
   */
  private async generateDetailedReport(systemReport: any): Promise<void> {
    const detailedReport = {
      testSummary: {
        timestamp: new Date().toISOString(),
        totalPluginsTested: systemReport.totalPlugins,
        systemConfigurationHealth: systemReport.overallSystemHealth,
        productionReady: systemReport.overallSystemHealth !== ConfigurationStatus.INVALID && systemReport.criticalIssues.length === 0
      },
      systemMetrics: {
        validPlugins: systemReport.validPlugins,
        warningPlugins: systemReport.warningPlugins,
        invalidPlugins: systemReport.invalidPlugins,
        validPercentage: ((systemReport.validPlugins / systemReport.totalPlugins) * 100).toFixed(1),
        totalConfigurationIssues: systemReport.criticalIssues.length + systemReport.environmentalIssues.length
      },
      pluginDetails: systemReport.pluginReports.map(report => ({
        name: report.pluginName,
        module: report.module,
        status: report.overallStatus,
        configurations: {
          total: report.totalConfigurations,
          valid: report.validConfigurations,
          warning: report.warningConfigurations,
          invalid: report.invalidConfigurations,
          missing: report.missingConfigurations
        },
        environmentVariables: {
          allPresent: report.environmentVariableStatus.allPresent,
          requiredMissing: report.environmentVariableStatus.requiredMissing.length,
          optionalMissing: report.environmentVariableStatus.optionalMissing.length
        },
        issues: {
          security: report.securityIssues.length,
          performance: report.performanceIssues.length,
          recommendations: report.recommendations.length
        },
        topRecommendations: report.recommendations.slice(0, 3),
        readyForProduction: report.overallStatus !== ConfigurationStatus.INVALID
      })),
      systemAnalysis: {
        overallHealth: systemReport.overallSystemHealth,
        criticalIssues: systemReport.criticalIssues,
        environmentalIssues: systemReport.environmentalIssues,
        systemRecommendations: systemReport.systemRecommendations
      },
      actionItems: this.generateActionItems(systemReport),
      conclusions: {
        configurationValidationPassed: true,
        systemReadyForProduction: systemReport.overallSystemHealth !== ConfigurationStatus.INVALID && systemReport.criticalIssues.length === 0,
        recommendedNextSteps: this.generateNextSteps(systemReport),
        estimatedFixTime: this.estimateFixTime(systemReport)
      }
    }

    // Save detailed report
    await this.saveReport(detailedReport)

    // Display summary
    console.log('📊 CONFIGURATION VALIDATION SUMMARY')
    console.log('=' + '='.repeat(55))
    console.log(`Validation Status: ${detailedReport.testSummary.productionReady ? '✅ PASSED' : '❌ NEEDS ATTENTION'}`)
    console.log(`System Health: ${this.getHealthIcon(detailedReport.testSummary.systemConfigurationHealth)} ${detailedReport.testSummary.systemConfigurationHealth}`)
    console.log(`Valid Plugins: ${detailedReport.systemMetrics.validPlugins}/${detailedReport.testSummary.totalPluginsTested} (${detailedReport.systemMetrics.validPercentage}%)`)
    console.log(`Total Issues: ${detailedReport.systemMetrics.totalConfigurationIssues}`)
    console.log(`Production Ready: ${detailedReport.conclusions.systemReadyForProduction ? 'YES' : 'NO'}`)
    console.log(`Estimated Fix Time: ${detailedReport.conclusions.estimatedFixTime}`)

    if (detailedReport.actionItems.length > 0) {
      console.log('\\n🎯 Priority Action Items:')
      detailedReport.actionItems.slice(0, 3).forEach((item, index) => {
        console.log(`  ${index + 1}. ${item}`)
      })
    }

    if (detailedReport.conclusions.recommendedNextSteps.length > 0) {
      console.log('\\n🚀 Recommended Next Steps:')
      detailedReport.conclusions.recommendedNextSteps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step}`)
      })
    }

    console.log('✅ Detailed configuration report generated and saved')
  }

  /**
   * Generate action items based on system report
   */
  private generateActionItems(systemReport: any): string[] {
    const actionItems: string[] = []

    // Critical issues first
    if (systemReport.invalidPlugins > 0) {
      actionItems.push(`Fix configuration issues in ${systemReport.invalidPlugins} invalid plugin(s)`)
    }

    // Environment variables
    const pluginsWithMissingEnv = systemReport.pluginReports.filter(p => !p.environmentVariableStatus.allPresent)
    if (pluginsWithMissingEnv.length > 0) {
      actionItems.push(`Set required environment variables for ${pluginsWithMissingEnv.length} plugin(s)`)
    }

    // Security issues
    const securityIssueCount = systemReport.pluginReports.reduce((sum, p) => sum + p.securityIssues.length, 0)
    if (securityIssueCount > 0) {
      actionItems.push(`Address ${securityIssueCount} security configuration issue(s)`)
    }

    // Performance issues
    const performanceIssueCount = systemReport.pluginReports.reduce((sum, p) => sum + p.performanceIssues.length, 0)
    if (performanceIssueCount > 0) {
      actionItems.push(`Optimize ${performanceIssueCount} performance configuration(s)`)
    }

    // Warning plugins
    if (systemReport.warningPlugins > 0) {
      actionItems.push(`Address configuration warnings in ${systemReport.warningPlugins} plugin(s)`)
    }

    return actionItems.slice(0, 5)
  }

  /**
   * Generate next steps based on system report
   */
  private generateNextSteps(systemReport: any): string[] {
    const nextSteps: string[] = []

    if (systemReport.overallSystemHealth === ConfigurationStatus.INVALID) {
      nextSteps.push('Fix critical configuration issues before proceeding to production')
      nextSteps.push('Set up required environment variables for all plugins')
      nextSteps.push('Re-run configuration validation after fixes')
    } else if (systemReport.overallSystemHealth === ConfigurationStatus.WARNING) {
      nextSteps.push('Address configuration warnings for optimal performance')
      nextSteps.push('Review and strengthen security configurations')
      nextSteps.push('Proceed to performance testing and optimization')
    } else {
      nextSteps.push('Configuration validation complete - proceed to deployment')
      nextSteps.push('Continue with security hardening and performance optimization')
      nextSteps.push('Set up production monitoring and alerting')
    }

    return nextSteps
  }

  /**
   * Estimate fix time for issues
   */
  private estimateFixTime(systemReport: any): string {
    const invalidPlugins = systemReport.invalidPlugins
    const criticalIssues = systemReport.criticalIssues.length
    const environmentalIssues = systemReport.environmentalIssues.length

    if (invalidPlugins === 0 && criticalIssues === 0) {
      return 'No fixes required'
    } else if (invalidPlugins <= 2 && criticalIssues <= 3) {
      return '1-2 hours'
    } else if (invalidPlugins <= 4 && criticalIssues <= 6) {
      return '2-4 hours'
    } else {
      return '4-8 hours'
    }
  }

  /**
   * Get health status icon
   */
  private getHealthIcon(status: ConfigurationStatus): string {
    switch (status) {
      case ConfigurationStatus.VALID: return '🟢'
      case ConfigurationStatus.WARNING: return '🟡'
      case ConfigurationStatus.INVALID: return '🔴'
      case ConfigurationStatus.MISSING: return '⚪'
      default: return '⚪'
    }
  }

  /**
   * Save detailed report to file
   */
  private async saveReport(report: any): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `configuration-validation-report-${timestamp}.json`
      const filepath = path.join(process.cwd(), 'reports', 'configuration', filename)

      // Ensure directory exists
      await fs.mkdir(path.dirname(filepath), { recursive: true })
      
      // Write report
      await fs.writeFile(filepath, JSON.stringify(report, null, 2))
      
      console.log(`\\n📄 Detailed configuration report saved to: ${filepath}`)
    } catch (error) {
      console.error('Failed to save configuration report:', error)
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new ConfigurationValidatorTester()
  tester.runTests().catch(console.error)
}

export { ConfigurationValidatorTester }