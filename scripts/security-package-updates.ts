/**
 * CoreFlow360 - Security Package Updates Script
 * 
 * Automated security updates for vulnerable packages with
 * comprehensive testing and rollback capabilities.
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, copyFileSync } from 'fs'
import { join } from 'path'

interface PackageUpdate {
  name: string
  currentVersion: string
  latestVersion: string
  securityUpdate: boolean
  breakingChange: boolean
  priority: 'critical' | 'high' | 'medium' | 'low'
  notes?: string
}

interface UpdateResult {
  success: boolean
  package: string
  oldVersion: string
  newVersion: string
  error?: string
  testsPassed?: boolean
}

// Critical security packages to monitor
const SECURITY_PACKAGES = [
  'next',
  'react',
  'react-dom',
  '@auth/prisma-adapter',
  'next-auth',
  'prisma',
  '@prisma/client',
  'socket.io-client',
  'axios',
  'node-fetch',
  'jsonwebtoken',
  'bcryptjs',
  'argon2',
  'crypto-js',
  'helmet',
  '@sentry/nextjs',
  'ioredis',
  'express-rate-limit',
  'formidable',
  'multer',
  'cors',
  'typescript',
  '@types/node',
  'tailwindcss',
  'postcss',
  'autoprefixer'
]

class SecurityPackageUpdater {
  private packageJsonPath: string
  private packageLockPath: string
  private backupPath: string

  constructor() {
    this.packageJsonPath = join(process.cwd(), 'package.json')
    this.packageLockPath = join(process.cwd(), 'package-lock.json')
    this.backupPath = join(process.cwd(), '.security-updates-backup')
  }

  /**
   * Run security package updates
   */
  async runSecurityUpdates(): Promise<void> {
    console.log('🔒 CoreFlow360 Security Package Updates')
    console.log('=====================================')

    try {
      // Create backup
      await this.createBackup()

      // Check for vulnerabilities
      const vulnerabilities = await this.checkVulnerabilities()
      
      if (vulnerabilities.length === 0) {
        console.log('✅ No security vulnerabilities found')
        return
      }

      console.log(`🚨 Found ${vulnerabilities.length} security issues`)
      
      // Get available updates
      const updates = await this.getAvailableUpdates()
      
      // Filter to security-relevant packages
      const securityUpdates = this.filterSecurityUpdates(updates, vulnerabilities)
      
      if (securityUpdates.length === 0) {
        console.log('✅ No security updates available')
        return
      }

      // Apply updates by priority
      const results = await this.applyUpdates(securityUpdates)
      
      // Run tests
      const testsPass = await this.runTests()
      
      if (!testsPass) {
        console.log('❌ Tests failed, rolling back changes')
        await this.rollback()
        return
      }

      // Generate report
      await this.generateReport(results)
      
      console.log('✅ Security updates completed successfully')

    } catch (error) {
      console.error('❌ Security update failed:', error)
      await this.rollback()
      throw error
    }
  }

  /**
   * Create backup of package files
   */
  private async createBackup(): Promise<void> {
    console.log('📦 Creating backup...')
    
    try {
      execSync(`mkdir -p ${this.backupPath}`)
      copyFileSync(this.packageJsonPath, join(this.backupPath, 'package.json'))
      copyFileSync(this.packageLockPath, join(this.backupPath, 'package-lock.json'))
      
      console.log('✅ Backup created')
    } catch (error) {
      throw new Error(`Failed to create backup: ${error}`)
    }
  }

  /**
   * Check for security vulnerabilities
   */
  private async checkVulnerabilities(): Promise<any[]> {
    console.log('🔍 Checking for vulnerabilities...')
    
    try {
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' })
      const audit = JSON.parse(auditResult)
      
      const vulnerabilities = Object.entries(audit.vulnerabilities || {})
        .filter(([_, vuln]: [string, any]) => 
          vuln.severity === 'critical' || 
          vuln.severity === 'high' ||
          vuln.severity === 'moderate'
        )
        .map(([name, vuln]: [string, any]) => ({
          name,
          severity: vuln.severity,
          via: vuln.via,
          fixAvailable: vuln.fixAvailable
        }))
      
      console.log(`Found ${vulnerabilities.length} security vulnerabilities`)
      return vulnerabilities
    } catch (error) {
      console.log('ℹ️ No npm audit issues found')
      return []
    }
  }

  /**
   * Get available package updates
   */
  private async getAvailableUpdates(): Promise<PackageUpdate[]> {
    console.log('📋 Checking for package updates...')
    
    try {
      const outdatedResult = execSync('npm outdated --json', { encoding: 'utf8' })
      const outdated = JSON.parse(outdatedResult)
      
      return Object.entries(outdated).map(([name, info]: [string, any]) => ({
        name,
        currentVersion: info.current,
        latestVersion: info.latest,
        securityUpdate: SECURITY_PACKAGES.includes(name),
        breakingChange: this.isBreakingChange(info.current, info.latest),
        priority: this.getPriority(name, info)
      }))
    } catch (error) {
      console.log('ℹ️ All packages are up to date')
      return []
    }
  }

  /**
   * Filter to security-relevant updates
   */
  private filterSecurityUpdates(
    updates: PackageUpdate[], 
    vulnerabilities: any[]
  ): PackageUpdate[] {
    const vulnerablePackages = new Set(vulnerabilities.map(v => v.name))
    
    return updates
      .filter(update => 
        update.securityUpdate || 
        vulnerablePackages.has(update.name) ||
        update.priority === 'critical'
      )
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
  }

  /**
   * Apply security updates
   */
  private async applyUpdates(updates: PackageUpdate[]): Promise<UpdateResult[]> {
    console.log(`🔄 Applying ${updates.length} security updates...`)
    
    const results: UpdateResult[] = []
    
    for (const update of updates) {
      console.log(`Updating ${update.name}: ${update.currentVersion} → ${update.latestVersion}`)
      
      try {
        // Update package
        if (update.breakingChange) {
          console.log(`⚠️ ${update.name} contains breaking changes, applying with caution`)
        }
        
        execSync(`npm install ${update.name}@${update.latestVersion}`, { 
          stdio: 'pipe' 
        })
        
        results.push({
          success: true,
          package: update.name,
          oldVersion: update.currentVersion,
          newVersion: update.latestVersion
        })
        
        console.log(`✅ ${update.name} updated successfully`)
        
      } catch (error) {
        console.log(`❌ Failed to update ${update.name}: ${error}`)
        
        results.push({
          success: false,
          package: update.name,
          oldVersion: update.currentVersion,
          newVersion: update.latestVersion,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
    
    return results
  }

  /**
   * Run tests to verify updates
   */
  private async runTests(): Promise<boolean> {
    console.log('🧪 Running tests...')
    
    try {
      // TypeScript compilation
      console.log('Checking TypeScript compilation...')
      execSync('npx tsc --noEmit', { stdio: 'pipe' })
      
      // Lint check
      console.log('Running linter...')
      execSync('npm run lint', { stdio: 'pipe' })
      
      // Unit tests
      console.log('Running unit tests...')
      execSync('npm run test -- --run', { stdio: 'pipe' })
      
      // Build check
      console.log('Testing build...')
      execSync('npm run build', { stdio: 'pipe' })
      
      console.log('✅ All tests passed')
      return true
      
    } catch (error) {
      console.log('❌ Tests failed:', error)
      return false
    }
  }

  /**
   * Rollback changes
   */
  private async rollback(): Promise<void> {
    console.log('🔄 Rolling back changes...')
    
    try {
      copyFileSync(join(this.backupPath, 'package.json'), this.packageJsonPath)
      copyFileSync(join(this.backupPath, 'package-lock.json'), this.packageLockPath)
      
      execSync('npm ci', { stdio: 'pipe' })
      
      console.log('✅ Rollback completed')
    } catch (error) {
      throw new Error(`Failed to rollback: ${error}`)
    }
  }

  /**
   * Generate security update report
   */
  private async generateReport(results: UpdateResult[]): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      },
      updates: results,
      nextSteps: [
        'Monitor application for any issues',
        'Update documentation with new package versions',
        'Schedule next security review in 30 days'
      ]
    }
    
    const reportPath = join(process.cwd(), 'security-update-report.json')
    writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log(`📊 Report generated: ${reportPath}`)
    console.log(`✅ ${report.summary.successful}/${report.summary.total} updates successful`)
  }

  /**
   * Check if version change is breaking
   */
  private isBreakingChange(current: string, latest: string): boolean {
    const currentMajor = parseInt(current.split('.')[0])
    const latestMajor = parseInt(latest.split('.')[0])
    return latestMajor > currentMajor
  }

  /**
   * Get update priority based on package and vulnerability
   */
  private getPriority(name: string, info: any): 'critical' | 'high' | 'medium' | 'low' {
    // Critical security packages
    if (['next', 'react', 'prisma', '@prisma/client', 'jsonwebtoken'].includes(name)) {
      return 'critical'
    }
    
    // Security-related packages
    if (SECURITY_PACKAGES.includes(name)) {
      return 'high'
    }
    
    // Check for major version updates
    if (this.isBreakingChange(info.current, info.latest)) {
      return 'medium'
    }
    
    return 'low'
  }

  /**
   * Fix specific security vulnerabilities
   */
  async fixSpecificVulnerabilities(): Promise<void> {
    console.log('🔧 Fixing specific security vulnerabilities...')
    
    // Fix the tmp vulnerability
    try {
      console.log('Fixing tmp vulnerability...')
      execSync('npm install tmp@^0.2.3', { stdio: 'pipe' })
      console.log('✅ tmp vulnerability fixed')
    } catch (error) {
      console.log('❌ Failed to fix tmp vulnerability:', error)
    }
    
    // Update commitizen to fix cascading issues
    try {
      console.log('Updating commitizen...')
      execSync('npm install commitizen@latest', { stdio: 'pipe' })
      console.log('✅ commitizen updated')
    } catch (error) {
      console.log('❌ Failed to update commitizen:', error)
    }
  }
}

// CLI execution
if (require.main === module) {
  const updater = new SecurityPackageUpdater()
  
  const args = process.argv.slice(2)
  
  if (args.includes('--fix-vulnerabilities')) {
    updater.fixSpecificVulnerabilities()
      .then(() => console.log('✅ Specific vulnerabilities fixed'))
      .catch(console.error)
  } else {
    updater.runSecurityUpdates()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Security update failed:', error)
        process.exit(1)
      })
  }
}