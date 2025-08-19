#!/usr/bin/env tsx

/**
 * CoreFlow360 - Comprehensive Deployment Script with API Integration
 * Integrates with GitHub and Vercel APIs for robust deployment
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

interface DeploymentConfig {
  githubToken?: string
  vercelToken?: string
  vercelProjectId?: string
  vercelOrgId?: string
  githubRepo?: string
  githubOwner?: string
  branch: string
  environment: 'production' | 'preview'
}

interface DeploymentStatus {
  success: boolean
  message: string
  details?: any
  deploymentUrl?: string
  commitSha?: string
}

class DeploymentManager {
  private config: DeploymentConfig
  private results: DeploymentStatus[] = []

  constructor(config: Partial<DeploymentConfig> = {}) {
    this.config = {
      branch: 'main',
      environment: 'production',
      ...config
    }
  }

  async deploy(): Promise<DeploymentStatus> {
    console.log('🚀 CoreFlow360 - Comprehensive Deployment')
    console.log('=========================================\n')

    try {
      // Step 1: Pre-deployment validation
      console.log('📋 Step 1: Pre-deployment validation...')
      const validationResult = await this.runValidation()
      if (!validationResult.success) {
        return validationResult
      }

      // Step 2: Get current commit info
      console.log('📋 Step 2: Getting commit information...')
      const commitInfo = await this.getCommitInfo()
      if (!commitInfo.success) {
        return commitInfo
      }

      // Step 3: Check GitHub Actions status
      console.log('📋 Step 3: Checking GitHub Actions status...')
      const githubStatus = await this.checkGitHubActions()
      if (!githubStatus.success) {
        return githubStatus
      }

      // Step 4: Trigger Vercel deployment
      console.log('📋 Step 4: Triggering Vercel deployment...')
      const vercelDeployment = await this.triggerVercelDeployment()
      if (!vercelDeployment.success) {
        return vercelDeployment
      }

      // Step 5: Monitor deployment
      console.log('📋 Step 5: Monitoring deployment...')
      const monitoringResult = await this.monitorDeployment(vercelDeployment.deploymentUrl!)
      if (!monitoringResult.success) {
        return monitoringResult
      }

      // Step 6: Health check
      console.log('📋 Step 6: Running health checks...')
      const healthResult = await this.runHealthChecks()
      if (!healthResult.success) {
        return healthResult
      }

      console.log('\n✅ Deployment completed successfully!')
      return {
        success: true,
        message: 'Deployment completed successfully',
        deploymentUrl: vercelDeployment.deploymentUrl,
        commitSha: commitInfo.commitSha,
        details: {
          validation: validationResult,
          githubStatus,
          vercelDeployment,
          monitoring: monitoringResult,
          health: healthResult
        }
      }

    } catch (error) {
      console.error('❌ Deployment failed:', error)
      return {
        success: false,
        message: `Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      }
    }
  }

  private async runValidation(): Promise<DeploymentStatus> {
    try {
      // Run our validation script
      execSync('npm run validate:deployment', { stdio: 'pipe' })
      
      return {
        success: true,
        message: 'Pre-deployment validation passed'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Pre-deployment validation failed',
        details: { error }
      }
    }
  }

  private async getCommitInfo(): Promise<DeploymentStatus & { commitSha?: string }> {
    try {
      // Get current commit SHA
      const commitSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
      
      // Get commit message
      const commitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim()
      
      // Get branch name
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim()
      
      console.log(`📝 Commit: ${commitSha.substring(0, 8)}`)
      console.log(`📝 Message: ${commitMessage}`)
      console.log(`🌿 Branch: ${branch}`)
      
      return {
        success: true,
        message: 'Commit information retrieved',
        commitSha,
        details: { commitMessage, branch }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get commit information',
        details: { error }
      }
    }
  }

  private async checkGitHubActions(): Promise<DeploymentStatus> {
    try {
      // Check if we have GitHub token
      if (!this.config.githubToken) {
        console.log('⚠️  No GitHub token provided, skipping GitHub Actions check')
        return {
          success: true,
          message: 'GitHub Actions check skipped (no token)'
        }
      }

      // Get recent workflow runs
      const response = await fetch(
        `https://api.github.com/repos/${this.config.githubOwner}/${this.config.githubRepo}/actions/runs?branch=${this.config.branch}&per_page=5`,
        {
          headers: {
            'Authorization': `token ${this.config.githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const runs = await response.json()
      const latestRun = runs.workflow_runs[0]

      if (latestRun && latestRun.conclusion === 'failure') {
        return {
          success: false,
          message: `Latest GitHub Actions run failed: ${latestRun.name}`,
          details: { run: latestRun }
        }
      }

      console.log('✅ GitHub Actions status: OK')
      return {
        success: true,
        message: 'GitHub Actions status verified'
      }

    } catch (error) {
      console.log('⚠️  GitHub Actions check failed, continuing...')
      return {
        success: true,
        message: 'GitHub Actions check failed but continuing',
        details: { error }
      }
    }
  }

  private async triggerVercelDeployment(): Promise<DeploymentStatus & { deploymentUrl?: string }> {
    try {
      // Check if we have Vercel token
      if (!this.config.vercelToken) {
        console.log('⚠️  No Vercel token provided, using deploy hook')
        return this.triggerVercelDeployHook()
      }

      // Use Vercel API for deployment
      const response = await fetch('https://api.vercel.com/v1/deployments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.vercelToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'coreflow360',
          projectId: this.config.vercelProjectId,
          target: this.config.environment,
          gitSource: {
            type: 'github',
            repoId: `${this.config.githubOwner}/${this.config.githubRepo}`,
            ref: this.config.branch
          }
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Vercel API error: ${response.status} - ${error}`)
      }

      const deployment = await response.json()
      const deploymentUrl = `https://vercel.com/${this.config.vercelOrgId}/${deployment.name}/${deployment.id}`

      console.log(`🚀 Vercel deployment triggered: ${deploymentUrl}`)
      
      return {
        success: true,
        message: 'Vercel deployment triggered successfully',
        deploymentUrl,
        details: { deployment }
      }

    } catch (error) {
      console.log('⚠️  Vercel API deployment failed, trying deploy hook...')
      return this.triggerVercelDeployHook()
    }
  }

  private async triggerVercelDeployHook(): Promise<DeploymentStatus & { deploymentUrl?: string }> {
    try {
      // Use the deploy hook from documentation
      const deployHook = 'https://api.vercel.com/v1/integrations/deploy/prj_A09SK4Bp6C6TYcJXedNtZA2UvCs9/Emwdczu7Uz'
      
      const response = await fetch(deployHook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          force: true,
          target: this.config.environment,
          gitBranch: this.config.branch
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Deploy hook error: ${response.status} - ${error}`)
      }

      const result = await response.json()
      const deploymentUrl = `https://vercel.com/ernijsansons-projects/core-flow360`

      console.log(`🚀 Vercel deployment triggered via hook: ${deploymentUrl}`)
      
      return {
        success: true,
        message: 'Vercel deployment triggered via hook',
        deploymentUrl,
        details: { result }
      }

    } catch (error) {
      return {
        success: false,
        message: 'Failed to trigger Vercel deployment',
        details: { error }
      }
    }
  }

  private async monitorDeployment(deploymentUrl: string): Promise<DeploymentStatus> {
    console.log('⏳ Monitoring deployment...')
    
    // Wait for deployment to start
    await this.sleep(10000) // 10 seconds
    
    // Check deployment status multiple times
    for (let i = 0; i < 30; i++) { // 5 minutes max
      try {
        const response = await fetch('https://coreflow360.com/api/health')
        
        if (response.ok) {
          console.log('✅ Deployment appears to be live')
          return {
            success: true,
            message: 'Deployment monitoring completed'
          }
        }
      } catch (error) {
        // Site not ready yet, continue waiting
      }
      
      console.log(`⏳ Waiting for deployment... (${i + 1}/30)`)
      await this.sleep(10000) // 10 seconds
    }

    return {
      success: false,
      message: 'Deployment monitoring timeout'
    }
  }

  private async runHealthChecks(): Promise<DeploymentStatus> {
    try {
      // Wait a bit more for full deployment
      await this.sleep(5000)
      
      // Check health endpoint
      const healthResponse = await fetch('https://coreflow360.com/api/health')
      
      if (!healthResponse.ok) {
        return {
          success: false,
          message: `Health check failed: ${healthResponse.status}`,
          details: { status: healthResponse.status }
        }
      }

      const healthData = await healthResponse.json()
      
      if (healthData.status !== 'healthy') {
        return {
          success: false,
          message: `Health check returned status: ${healthData.status}`,
          details: { healthData }
        }
      }

      console.log('✅ Health checks passed')
      return {
        success: true,
        message: 'Health checks passed'
      }

    } catch (error) {
      return {
        success: false,
        message: 'Health checks failed',
        details: { error }
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Helper method to get environment variables
  private getEnvVar(name: string): string | undefined {
    return process.env[name]
  }
}

// Main execution
async function main() {
  // Load configuration from environment variables
  const config: Partial<DeploymentConfig> = {
    githubToken: process.env.GITHUB_TOKEN,
    vercelToken: process.env.VERCEL_TOKEN,
    vercelProjectId: process.env.VERCEL_PROJECT_ID,
    vercelOrgId: process.env.VERCEL_ORG_ID,
    githubRepo: process.env.GITHUB_REPOSITORY?.split('/')[1],
    githubOwner: process.env.GITHUB_REPOSITORY?.split('/')[0],
    branch: process.env.GITHUB_REF?.replace('refs/heads/', '') || 'main',
    environment: (process.env.VERCEL_ENV as 'production' | 'preview') || 'production'
  }

  const deployer = new DeploymentManager(config)
  const result = await deployer.deploy()

  if (result.success) {
    console.log('\n🎉 Deployment Summary:')
    console.log('=====================')
    console.log(`✅ Status: ${result.message}`)
    if (result.deploymentUrl) {
      console.log(`🌐 URL: ${result.deploymentUrl}`)
    }
    if (result.commitSha) {
      console.log(`📝 Commit: ${result.commitSha}`)
    }
    process.exit(0)
  } else {
    console.log('\n❌ Deployment Failed:')
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
    console.error('❌ Deployment script failed:', error)
    process.exit(1)
  })
}

export { DeploymentManager, DeploymentConfig, DeploymentStatus }
