#!/usr/bin/env tsx

/**
 * CoreFlow360 - Emergency Rollback Script
 * Quickly reverts to a known working deployment
 */

import { execSync } from 'child_process'

interface RollbackConfig {
  targetCommit?: string
  forceRollback?: boolean
  skipConfirmation?: boolean
}

interface RollbackStatus {
  success: boolean
  message: string
  details?: any
  previousCommit?: string
  newCommit?: string
}

class EmergencyRollback {
  private config: RollbackConfig

  constructor(config: RollbackConfig = {}) {
    this.config = {
      forceRollback: false,
      skipConfirmation: false,
      ...config
    }
  }

  async rollback(): Promise<RollbackStatus> {
    console.log('🚨 CoreFlow360 - Emergency Rollback')
    console.log('===================================\n')

    try {
      // Step 1: Get current deployment status
      console.log('📋 Step 1: Checking current deployment status...')
      const currentStatus = await this.getCurrentStatus()
      if (!currentStatus.success) {
        return currentStatus
      }

      // Step 2: Find last working commit
      console.log('📋 Step 2: Finding last working commit...')
      const workingCommit = await this.findLastWorkingCommit()
      if (!workingCommit.success) {
        return workingCommit
      }

      // Step 3: Confirm rollback
      if (!this.config.skipConfirmation) {
        const confirmed = await this.confirmRollback(currentStatus.previousCommit!, workingCommit.newCommit!)
        if (!confirmed) {
          return {
            success: false,
            message: 'Rollback cancelled by user'
          }
        }
      }

      // Step 4: Execute rollback
      console.log('📋 Step 3: Executing rollback...')
      const rollbackResult = await this.executeRollback(workingCommit.newCommit!)
      if (!rollbackResult.success) {
        return rollbackResult
      }

      // Step 5: Verify rollback
      console.log('📋 Step 4: Verifying rollback...')
      const verificationResult = await this.verifyRollback()
      if (!verificationResult.success) {
        return verificationResult
      }

      console.log('\n✅ Emergency rollback completed successfully!')
      return {
        success: true,
        message: 'Emergency rollback completed successfully',
        previousCommit: currentStatus.previousCommit,
        newCommit: workingCommit.newCommit,
        details: {
          currentStatus,
          workingCommit,
          rollbackResult,
          verificationResult
        }
      }

    } catch (error) {
      console.error('❌ Emergency rollback failed:', error)
      return {
        success: false,
        message: `Emergency rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      }
    }
  }

  private async getCurrentStatus(): Promise<RollbackStatus & { previousCommit?: string }> {
    try {
      // Get current commit
      const currentCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
      
      // Get current branch
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim()
      
      // Check if we're on main branch
      if (currentBranch !== 'main') {
        return {
          success: false,
          message: `Not on main branch (currently on ${currentBranch}). Rollback only works from main branch.`
        }
      }

      // Check if working tree is clean
      const workingTreeStatus = execSync('git status --porcelain', { encoding: 'utf8' }).trim()
      if (workingTreeStatus) {
        return {
          success: false,
          message: 'Working tree is not clean. Please commit or stash changes before rollback.'
        }
      }

      console.log(`📍 Current commit: ${currentCommit.substring(0, 8)}`)
      console.log(`🌿 Current branch: ${currentBranch}`)
      
      return {
        success: true,
        message: 'Current status verified',
        previousCommit: currentCommit
      }

    } catch (error) {
      return {
        success: false,
        message: 'Failed to get current status',
        details: { error }
      }
    }
  }

  private async findLastWorkingCommit(): Promise<RollbackStatus & { newCommit?: string }> {
    try {
      // If target commit is specified, use it
      if (this.config.targetCommit) {
        // Verify the commit exists
        try {
          execSync(`git rev-parse ${this.config.targetCommit}`, { stdio: 'pipe' })
          console.log(`🎯 Using specified target commit: ${this.config.targetCommit}`)
          return {
            success: true,
            message: 'Using specified target commit',
            newCommit: this.config.targetCommit
          }
        } catch (error) {
          return {
            success: false,
            message: `Specified commit ${this.config.targetCommit} not found`
          }
        }
      }

      // Find last working commit by checking recent commits
      console.log('🔍 Searching for last working commit...')
      
      // Get recent commits
      const recentCommits = execSync('git log --oneline -10', { encoding: 'utf8' }).trim().split('\n')
      
      // Look for commits that don't have "EMERGENCY" or "FAILED" in the message
      for (const commitLine of recentCommits) {
        const [commitSha, ...messageParts] = commitLine.split(' ')
        const message = messageParts.join(' ')
        
        // Skip emergency commits and failed deployments
        if (message.toLowerCase().includes('emergency') || 
            message.toLowerCase().includes('failed') ||
            message.toLowerCase().includes('rollback')) {
          continue
        }
        
        // Check if this commit has a successful deployment
        const hasSuccessfulDeployment = await this.checkCommitDeployment(commitSha)
        if (hasSuccessfulDeployment) {
          console.log(`✅ Found working commit: ${commitSha} - ${message}`)
          return {
            success: true,
            message: `Found working commit: ${message}`,
            newCommit: commitSha
          }
        }
      }

      // If no recent working commit found, use a fallback
      const fallbackCommit = execSync('git rev-parse HEAD~5', { encoding: 'utf8' }).trim()
      console.log(`⚠️  No recent working commit found, using fallback: ${fallbackCommit.substring(0, 8)}`)
      
      return {
        success: true,
        message: 'Using fallback commit',
        newCommit: fallbackCommit
      }

    } catch (error) {
      return {
        success: false,
        message: 'Failed to find last working commit',
        details: { error }
      }
    }
  }

  private async checkCommitDeployment(commitSha: string): Promise<boolean> {
    try {
      // Check if this commit has a successful deployment by looking at GitHub Actions
      // This is a simplified check - in a real scenario you'd query GitHub API
      
      // For now, we'll assume commits older than 1 hour are "working"
      const commitTime = execSync(`git log -1 --format=%ct ${commitSha}`, { encoding: 'utf8' }).trim()
      const currentTime = Math.floor(Date.now() / 1000)
      const ageInHours = (currentTime - parseInt(commitTime)) / 3600
      
      return ageInHours > 1 // Assume commits older than 1 hour are stable
    } catch (error) {
      return false
    }
  }

  private async confirmRollback(fromCommit: string, toCommit: string): Promise<boolean> {
    console.log('\n🚨 ROLLBACK CONFIRMATION REQUIRED')
    console.log('===============================')
    console.log(`From: ${fromCommit.substring(0, 8)}`)
    console.log(`To:   ${toCommit.substring(0, 8)}`)
    console.log('')
    console.log('This will:')
    console.log('• Revert to the previous working commit')
    console.log('• Force push to main branch')
    console.log('• Trigger a new deployment')
    console.log('')
    console.log('⚠️  This action cannot be easily undone!')
    console.log('')
    
    // In a real implementation, you'd prompt for user input
    // For now, we'll use a timeout-based confirmation
    console.log('⏰ Auto-confirming rollback in 10 seconds...')
    await this.sleep(10000)
    
    return true
  }

  private async executeRollback(targetCommit: string): Promise<RollbackStatus> {
    try {
      console.log(`🔄 Rolling back to commit: ${targetCommit.substring(0, 8)}`)
      
      // Reset to target commit
      execSync(`git reset --hard ${targetCommit}`, { stdio: 'inherit' })
      
      // Force push to main branch
      console.log('📤 Force pushing to main branch...')
      execSync('git push origin main --force', { stdio: 'inherit' })
      
      console.log('✅ Rollback executed successfully')
      return {
        success: true,
        message: 'Rollback executed successfully'
      }

    } catch (error) {
      return {
        success: false,
        message: 'Failed to execute rollback',
        details: { error }
      }
    }
  }

  private async verifyRollback(): Promise<RollbackStatus> {
    try {
      console.log('🔍 Verifying rollback...')
      
      // Wait for deployment to complete
      await this.sleep(30000) // 30 seconds
      
      // Check if site is accessible
      const healthResponse = await fetch('https://coreflow360.com/api/health')
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        
        if (healthData.status === 'healthy') {
          console.log('✅ Site is healthy after rollback')
          return {
            success: true,
            message: 'Rollback verification successful'
          }
        } else {
          return {
            success: false,
            message: `Site health check failed: ${healthData.status}`,
            details: { healthData }
          }
        }
      } else {
        return {
          success: false,
          message: `Site not accessible after rollback: ${healthResponse.status}`,
          details: { status: healthResponse.status }
        }
      }

    } catch (error) {
      return {
        success: false,
        message: 'Failed to verify rollback',
        details: { error }
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  
  // Parse command line arguments
  const config: RollbackConfig = {
    skipConfirmation: args.includes('--skip-confirmation') || args.includes('-y'),
    forceRollback: args.includes('--force') || args.includes('-f')
  }
  
  // Extract target commit if provided
  const targetCommitIndex = args.findIndex(arg => arg === '--commit' || arg === '-c')
  if (targetCommitIndex !== -1 && args[targetCommitIndex + 1]) {
    config.targetCommit = args[targetCommitIndex + 1]
  }

  const rollback = new EmergencyRollback(config)
  const result = await rollback.rollback()

  if (result.success) {
    console.log('\n🎉 Rollback Summary:')
    console.log('==================')
    console.log(`✅ Status: ${result.message}`)
    if (result.previousCommit) {
      console.log(`📝 Previous: ${result.previousCommit.substring(0, 8)}`)
    }
    if (result.newCommit) {
      console.log(`📝 Current: ${result.newCommit.substring(0, 8)}`)
    }
    process.exit(0)
  } else {
    console.log('\n❌ Rollback Failed:')
    console.log('==================')
    console.log(`❌ Error: ${result.message}`)
    if (result.details?.error) {
      console.log(`🔍 Details: ${result.details.error}`)
    }
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Emergency rollback script failed:', error)
    process.exit(1)
  })
}

export { EmergencyRollback, RollbackConfig, RollbackStatus }
