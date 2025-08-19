#!/usr/bin/env tsx

/**
 * CoreFlow360 - Deployment Validation Script
 * Validates all critical components before deployment
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

interface ValidationResult {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: any
}

class DeploymentValidator {
  private results: ValidationResult[] = []

  async validateAll(): Promise<void> {
    console.log('🔍 CoreFlow360 - Deployment Validation')
    console.log('=====================================\n')

    // Core validations
    await this.validateEnvironment()
    await this.validateDependencies()
    await this.validateBuildScripts()
    await this.validateGitHubActions()
    await this.validateVercelConfig()
    await this.validateDatabase()
    await this.validateSecurity()

    // Report results
    this.printResults()
    
    // Exit with appropriate code
    const hasFailures = this.results.some(r => r.status === 'fail')
    if (hasFailures) {
      console.log('\n❌ Deployment validation failed!')
      process.exit(1)
    } else {
      console.log('\n✅ Deployment validation passed!')
      process.exit(0)
    }
  }

  private async validateEnvironment(): Promise<void> {
    console.log('📋 Validating environment configuration...')
    
    // Check .env.example exists
    if (existsSync('.env.example')) {
      this.addResult('env-example', 'pass', '.env.example file exists')
    } else {
      this.addResult('env-example', 'fail', '.env.example file missing')
    }

    // Check required environment variables in example
    try {
      const envExample = readFileSync('.env.example', 'utf-8')
      const requiredVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL']
      
      for (const varName of requiredVars) {
        if (envExample.includes(varName)) {
          this.addResult(`env-${varName}`, 'pass', `${varName} documented in .env.example`)
        } else {
          this.addResult(`env-${varName}`, 'warning', `${varName} not documented in .env.example`)
        }
      }
    } catch (error) {
      this.addResult('env-read', 'fail', `Failed to read .env.example: ${error}`)
    }
  }

  private async validateDependencies(): Promise<void> {
    console.log('📦 Validating dependencies...')
    
    try {
      // Check package.json exists
      if (existsSync('package.json')) {
        this.addResult('package-json', 'pass', 'package.json exists')
        
        const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'))
        
        // Check required scripts
        const requiredScripts = ['build', 'build:ci', 'dev', 'start']
        for (const script of requiredScripts) {
          if (packageJson.scripts?.[script]) {
            this.addResult(`script-${script}`, 'pass', `${script} script exists`)
          } else {
            this.addResult(`script-${script}`, 'fail', `${script} script missing`)
          }
        }
        
        // Check Next.js version
        const nextVersion = packageJson.dependencies?.next
        if (nextVersion) {
          this.addResult('next-version', 'pass', `Next.js version: ${nextVersion}`)
        } else {
          this.addResult('next-version', 'fail', 'Next.js not found in dependencies')
        }
      } else {
        this.addResult('package-json', 'fail', 'package.json missing')
      }
    } catch (error) {
      this.addResult('dependencies', 'fail', `Failed to validate dependencies: ${error}`)
    }
  }

  private async validateBuildScripts(): Promise<void> {
    console.log('🔨 Validating build scripts...')
    
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'))
      const buildScript = packageJson.scripts?.build
      
      if (buildScript) {
        // Check if build script includes memory optimization
        if (buildScript.includes('--max-old-space-size=8192')) {
          this.addResult('build-memory', 'pass', 'Build script includes memory optimization')
        } else {
          this.addResult('build-memory', 'warning', 'Build script missing memory optimization')
        }
        
        // Check if build script disables telemetry
        if (buildScript.includes('NEXT_TELEMETRY_DISABLED=1')) {
          this.addResult('build-telemetry', 'pass', 'Build script disables telemetry')
        } else {
          this.addResult('build-telemetry', 'warning', 'Build script does not disable telemetry')
        }
      } else {
        this.addResult('build-script', 'fail', 'Build script missing')
      }
    } catch (error) {
      this.addResult('build-validation', 'fail', `Failed to validate build scripts: ${error}`)
    }
  }

  private async validateGitHubActions(): Promise<void> {
    console.log('⚙️  Validating GitHub Actions...')
    
    const workflowsDir = '.github/workflows'
    if (existsSync(workflowsDir)) {
      this.addResult('workflows-dir', 'pass', 'GitHub Actions workflows directory exists')
      
      // Check for CI workflow
      if (existsSync(join(workflowsDir, 'ci.yml'))) {
        this.addResult('ci-workflow', 'pass', 'CI workflow exists')
      } else {
        this.addResult('ci-workflow', 'warning', 'CI workflow missing')
      }
      
      // Check for deployment workflow
      if (existsSync(join(workflowsDir, 'vercel-deploy.yml'))) {
        this.addResult('deploy-workflow', 'pass', 'Vercel deployment workflow exists')
      } else {
        this.addResult('deploy-workflow', 'warning', 'Vercel deployment workflow missing')
      }
    } else {
      this.addResult('workflows-dir', 'fail', 'GitHub Actions workflows directory missing')
    }
  }

  private async validateVercelConfig(): Promise<void> {
    console.log('🚀 Validating Vercel configuration...')
    
    if (existsSync('vercel.json')) {
      this.addResult('vercel-config', 'pass', 'vercel.json exists')
      
      try {
        const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf-8'))
        
        // Check build command
        if (vercelConfig.buildCommand === 'npm run build:ci') {
          this.addResult('vercel-build-command', 'pass', 'Vercel uses build:ci command')
        } else {
          this.addResult('vercel-build-command', 'warning', 'Vercel build command may not be optimal')
        }
        
        // Check headers
        if (vercelConfig.headers && vercelConfig.headers.length > 0) {
          this.addResult('vercel-headers', 'pass', 'Vercel security headers configured')
        } else {
          this.addResult('vercel-headers', 'warning', 'Vercel security headers not configured')
        }
      } catch (error) {
        this.addResult('vercel-config-parse', 'fail', `Failed to parse vercel.json: ${error}`)
      }
    } else {
      this.addResult('vercel-config', 'warning', 'vercel.json missing (using defaults)')
    }
  }

  private async validateDatabase(): Promise<void> {
    console.log('🗄️  Validating database configuration...')
    
    // Check Prisma schema
    if (existsSync('prisma/schema.prisma')) {
      this.addResult('prisma-schema', 'pass', 'Prisma schema exists')
    } else {
      this.addResult('prisma-schema', 'fail', 'Prisma schema missing')
    }
    
    // Check migrations directory
    if (existsSync('prisma/migrations')) {
      this.addResult('prisma-migrations', 'pass', 'Prisma migrations directory exists')
    } else {
      this.addResult('prisma-migrations', 'warning', 'Prisma migrations directory missing')
    }
  }

  private async validateSecurity(): Promise<void> {
    console.log('🔒 Validating security configuration...')
    
    // Check for security headers in vercel.json
    if (existsSync('vercel.json')) {
      try {
        const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf-8'))
        const hasSecurityHeaders = vercelConfig.headers?.some((header: any) => 
          header.headers?.some((h: any) => 
            ['X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy'].includes(h.key)
          )
        )
        
        if (hasSecurityHeaders) {
          this.addResult('security-headers', 'pass', 'Security headers configured')
        } else {
          this.addResult('security-headers', 'warning', 'Security headers not fully configured')
        }
      } catch (error) {
        this.addResult('security-validation', 'fail', `Failed to validate security: ${error}`)
      }
    }
    
    // Check for .gitignore
    if (existsSync('.gitignore')) {
      const gitignore = readFileSync('.gitignore', 'utf-8')
      const sensitiveFiles = ['.env', '.env.local', '.env.production']
      
      for (const file of sensitiveFiles) {
        if (gitignore.includes(file)) {
          this.addResult(`gitignore-${file}`, 'pass', `${file} in .gitignore`)
        } else {
          this.addResult(`gitignore-${file}`, 'warning', `${file} not in .gitignore`)
        }
      }
    } else {
      this.addResult('gitignore', 'fail', '.gitignore missing')
    }
  }

  private addResult(name: string, status: 'pass' | 'fail' | 'warning', message: string, details?: any): void {
    this.results.push({ name, status, message, details })
  }

  private printResults(): void {
    console.log('\n📊 Validation Results:')
    console.log('=====================')
    
    const passes = this.results.filter(r => r.status === 'pass')
    const warnings = this.results.filter(r => r.status === 'warning')
    const failures = this.results.filter(r => r.status === 'fail')
    
    console.log(`✅ Passed: ${passes.length}`)
    console.log(`⚠️  Warnings: ${warnings.length}`)
    console.log(`❌ Failed: ${failures.length}`)
    console.log('')
    
    // Print failures first
    if (failures.length > 0) {
      console.log('❌ Failures:')
      failures.forEach(result => {
        console.log(`  • ${result.name}: ${result.message}`)
      })
      console.log('')
    }
    
    // Print warnings
    if (warnings.length > 0) {
      console.log('⚠️  Warnings:')
      warnings.forEach(result => {
        console.log(`  • ${result.name}: ${result.message}`)
      })
      console.log('')
    }
    
    // Print passes (summary)
    if (passes.length > 0) {
      console.log('✅ Passed validations:')
      passes.forEach(result => {
        console.log(`  • ${result.name}: ${result.message}`)
      })
    }
  }
}

// Run validation
if (require.main === module) {
  const validator = new DeploymentValidator()
  validator.validateAll().catch(error => {
    console.error('❌ Validation failed:', error)
    process.exit(1)
  })
}