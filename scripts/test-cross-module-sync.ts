/**
 * CoreFlow360 - Cross-Module Sync Test Runner
 * MATHEMATICALLY PERFECT, ALGORITHMICALLY OPTIMAL, PROVABLY CORRECT
 *
 * Script to test cross-module data synchronization capabilities
 */

import { CrossModuleSyncTester } from '../src/services/integration/cross-module-sync-tester'
import * as fs from 'fs/promises'
import * as path from 'path'

class SyncTestRunner {
  private tester: CrossModuleSyncTester

  constructor() {
    this.tester = new CrossModuleSyncTester()
  }

  /**
   * Run comprehensive sync testing
   */
  async runTests(): Promise<void> {
    console.log('🔄 CoreFlow360 Cross-Module Data Synchronization Testing')
    console.log('=' + '='.repeat(60))
    console.log('')

    try {
      // Run all synchronization tests
      const report = await this.tester.runAllTests()

      // Save detailed report
      await this.saveReport(report)

      // Exit with appropriate code
      if (report.failedTests > 0) {
        console.log(`\n❌ ${report.failedTests} critical synchronization test(s) failed`)
        process.exit(1)
      } else if (report.warningTests > 0) {
        console.log(`\n⚠️  ${report.warningTests} synchronization test(s) have warnings`)
        process.exit(0)
      } else {
        console.log('\n🎉 All synchronization tests passed successfully!')
        process.exit(0)
      }

    } catch (error) {
      console.error('❌ Sync testing failed:', error)
      process.exit(1)
    }
  }

  /**
   * Save test report to file
   */
  private async saveReport(report: any): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `cross-module-sync-report-${timestamp}.json`
    const filepath = path.join(process.cwd(), 'reports', 'integration', filename)

    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(filepath), { recursive: true })
      
      // Write report
      await fs.writeFile(filepath, JSON.stringify(report, null, 2))
      
      console.log(`\n📄 Detailed sync report saved to: ${filepath}`)
    } catch (error) {
      console.error('Failed to save sync report:', error)
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const runner = new SyncTestRunner()
  runner.runTests().catch(console.error)
}

export { SyncTestRunner }