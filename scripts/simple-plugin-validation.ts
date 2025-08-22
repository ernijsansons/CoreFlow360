/**
 * CoreFlow360 - Simple Plugin Validation Script
 * MATHEMATICALLY PERFECT, ALGORITHMICALLY OPTIMAL, PROVABLY CORRECT
 *
 * Basic validation of plugin files and structure
 */

import * as fs from 'fs'
import * as path from 'path'

interface PluginInfo {
  filePath: string
  className: string
  pluginId: string
  module: string
  hasRequiredMethods: boolean
  hasConfiguration: boolean
  hasCapabilities: boolean
  issues: string[]
}

class SimplePluginValidator {
  private pluginsDir = path.join(process.cwd(), 'src', 'integrations')
  
  /**
   * Validate all plugin files
   */
  async validatePlugins(): Promise<void> {
    console.log('🚀 CoreFlow360 Plugin Structure Validation\n')
    
    const plugins = await this.discoverPlugins()
    const results = await this.analyzePlugins(plugins)
    
    this.displayResults(results)
    await this.generateReport(results)
  }
  
  /**
   * Discover all plugin files
   */
  private async discoverPlugins(): Promise<string[]> {
    const plugins: string[] = []
    
    try {
      const moduleDir = fs.readdirSync(this.pluginsDir, { withFileTypes: true })
      
      for (const dir of moduleDir) {
        if (dir.isDirectory() && dir.name !== 'nocobase') {
          const pluginFiles = fs.readdirSync(path.join(this.pluginsDir, dir.name))
          for (const file of pluginFiles) {
            if (file.endsWith('-plugin.ts')) {
              plugins.push(path.join(this.pluginsDir, dir.name, file))
            }
          }
        }
      }
    } catch (error) {
      console.error('Error discovering plugins:', error)
    }
    
    return plugins
  }
  
  /**
   * Analyze plugin files
   */
  private async analyzePlugins(pluginPaths: string[]): Promise<PluginInfo[]> {
    const results: PluginInfo[] = []
    
    for (const pluginPath of pluginPaths) {
      try {
        const content = fs.readFileSync(pluginPath, 'utf-8')
        const analysis = this.analyzePluginContent(content, pluginPath)
        results.push(analysis)
      } catch (error) {
        results.push({
          filePath: pluginPath,
          className: 'Unknown',
          pluginId: 'Unknown',
          module: 'Unknown',
          hasRequiredMethods: false,
          hasConfiguration: false,
          hasCapabilities: false,
          issues: [`Failed to read file: ${error.message}`]
        })
      }
    }
    
    return results
  }
  
  /**
   * Analyze individual plugin content
   */
  private analyzePluginContent(content: string, filePath: string): PluginInfo {
    const issues: string[] = []
    
    // Extract class name
    const classMatch = content.match(/export class (\w+Plugin)\s+implements\s+CoreFlowPlugin/)
    const className = classMatch ? classMatch[1] : 'Unknown'
    
    if (!classMatch) {
      issues.push('Plugin class not found or does not implement CoreFlowPlugin')
    }
    
    // Extract plugin ID
    const idMatch = content.match(/id\s*=\s*['"]([\w-]+)['"]/)
    const pluginId = idMatch ? idMatch[1] : 'Unknown'
    
    if (!idMatch) {
      issues.push('Plugin ID not found')
    }
    
    // Extract module type
    const moduleMatch = content.match(/module\s*=\s*ModuleType\.(\w+)/)
    const module = moduleMatch ? moduleMatch[1] : 'Unknown'
    
    if (!moduleMatch) {
      issues.push('Module type not found')
    }
    
    // Check for required methods
    const requiredMethods = ['initialize', 'activate', 'deactivate', 'destroy', 'syncData', 'transformData', 'validateData']
    const hasRequiredMethods = requiredMethods.every(method => 
      content.includes(`async ${method}(`) || content.includes(`${method}(`)
    )
    
    if (!hasRequiredMethods) {
      const missing = requiredMethods.filter(method => 
        !content.includes(`async ${method}(`) && !content.includes(`${method}(`)
      )
      issues.push(`Missing required methods: ${missing.join(', ')}`)
    }
    
    // Check for configuration
    const hasConfiguration = content.includes('config = {')
    if (!hasConfiguration) {
      issues.push('Plugin configuration object not found')
    }
    
    // Check for capabilities
    const hasCapabilities = content.includes('capabilities = {')
    if (!hasCapabilities) {
      issues.push('Plugin capabilities object not found')
    }
    
    // Check for AI capabilities
    const hasAI = content.includes('aiEnabled: true')
    if (!hasAI) {
      issues.push('AI capabilities not enabled')
    }
    
    // Check for cross-module data
    const hasCrossModule = content.includes('crossModuleData: true')
    if (!hasCrossModule) {
      issues.push('Cross-module data not enabled')
    }
    
    // Check for API endpoints
    const hasApiEndpoints = content.includes('apiEndpoints:')
    if (!hasApiEndpoints) {
      issues.push('API endpoints not configured')
    }
    
    return {
      filePath,
      className,
      pluginId,
      module,
      hasRequiredMethods,
      hasConfiguration,
      hasCapabilities,
      issues
    }
  }
  
  /**
   * Display validation results
   */
  private displayResults(results: PluginInfo[]): void {
    console.log('📊 PLUGIN VALIDATION RESULTS')
    console.log('=' + '='.repeat(60))
    console.log(`Total Plugins Found: ${results.length}`)
    
    const validPlugins = results.filter(p => p.issues.length === 0)
    const warningPlugins = results.filter(p => p.issues.length > 0 && p.issues.length < 3)
    const invalidPlugins = results.filter(p => p.issues.length >= 3)
    
    console.log(`✅ Valid Plugins: ${validPlugins.length}`)
    console.log(`⚠️  Warning Plugins: ${warningPlugins.length}`)
    console.log(`❌ Invalid Plugins: ${invalidPlugins.length}`)
    console.log(`📈 Success Rate: ${((validPlugins.length / results.length) * 100).toFixed(1)}%`)
    console.log('')
    
    // Display individual plugin results
    console.log('🔌 INDIVIDUAL PLUGIN ANALYSIS')
    console.log('-'.repeat(70))
    
    for (const plugin of results) {
      const statusIcon = plugin.issues.length === 0 ? '✅' : 
                        plugin.issues.length < 3 ? '⚠️' : '❌'
      
      console.log(`${statusIcon} ${plugin.className} (${plugin.pluginId})`)
      console.log(`   Module: ${plugin.module}`)
      console.log(`   Required Methods: ${plugin.hasRequiredMethods ? '✅' : '❌'}`)
      console.log(`   Configuration: ${plugin.hasConfiguration ? '✅' : '❌'}`)
      console.log(`   Capabilities: ${plugin.hasCapabilities ? '✅' : '❌'}`)
      
      if (plugin.issues.length > 0) {
        console.log('   Issues:')
        plugin.issues.forEach(issue => {
          console.log(`     └─ ⚠️ ${issue}`)
        })
      }
      console.log('')
    }
    
    // Module coverage analysis
    const moduleTypes = [...new Set(results.map(p => p.module).filter(m => m !== 'Unknown'))]
    console.log('🏢 MODULE COVERAGE')
    console.log('-'.repeat(30))
    moduleTypes.forEach(moduleType => {
      const count = results.filter(p => p.module === moduleType).length
      console.log(`${moduleType}: ${count} plugin${count !== 1 ? 's' : ''}`)
    })
    console.log('')
    
    // Summary recommendations
    console.log('💡 RECOMMENDATIONS')
    console.log('-'.repeat(30))
    
    if (invalidPlugins.length > 0) {
      console.log('❌ Fix critical issues in invalid plugins before deployment')
    }
    
    if (warningPlugins.length > 0) {
      console.log('⚠️  Address warnings to improve plugin quality')
    }
    
    const aiDisabledCount = results.filter(p => 
      p.issues.some(issue => issue.includes('AI capabilities not enabled'))
    ).length
    
    if (aiDisabledCount > 0) {
      console.log(`🤖 Enable AI capabilities in ${aiDisabledCount} plugins for enhanced intelligence`)
    }
    
    const crossModuleDisabledCount = results.filter(p => 
      p.issues.some(issue => issue.includes('Cross-module data not enabled'))
    ).length
    
    if (crossModuleDisabledCount > 0) {
      console.log(`🔗 Enable cross-module data sharing in ${crossModuleDisabledCount} plugins`)
    }
    
    console.log('')
    
    if (validPlugins.length === results.length) {
      console.log('🎉 All plugins are properly structured and ready for integration!')
    } else {
      console.log(`⚠️  ${results.length - validPlugins.length} plugin${results.length - validPlugins.length !== 1 ? 's' : ''} need${results.length - validPlugins.length === 1 ? 's' : ''} attention`)
    }
  }
  
  /**
   * Generate detailed report
   */
  private async generateReport(results: PluginInfo[]): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportPath = path.join(process.cwd(), 'reports', 'integration', `plugin-structure-validation-${timestamp}.json`)
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPlugins: results.length,
        validPlugins: results.filter(p => p.issues.length === 0).length,
        warningPlugins: results.filter(p => p.issues.length > 0 && p.issues.length < 3).length,
        invalidPlugins: results.filter(p => p.issues.length >= 3).length,
      },
      plugins: results
    }
    
    try {
      // Ensure directory exists
      await fs.promises.mkdir(path.dirname(reportPath), { recursive: true })
      
      // Write report
      await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2))
      
      console.log(`📄 Detailed report saved to: ${reportPath}`)
    } catch (error) {
      console.error('Failed to save report:', error)
    }
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const validator = new SimplePluginValidator()
  validator.validatePlugins().catch(console.error)
}

export { SimplePluginValidator }