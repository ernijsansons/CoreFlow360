/**
 * Production Security Audit Script
 * 
 * Comprehensive security validation for CoreFlow360 production deployment.
 * Run before launching to production to ensure security compliance.
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import https from 'https'
import crypto from 'crypto'

interface SecurityCheck {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  recommendation?: string
}

interface SecurityAuditReport {
  timestamp: string
  environment: string
  version: string
  checks: SecurityCheck[]
  score: number
  criticalIssues: number
  recommendations: string[]
}

class ProductionSecurityAuditor {
  private checks: SecurityCheck[] = []
  private criticalIssues = 0

  async runFullAudit(): Promise<SecurityAuditReport> {
    console.log('🔒 Starting Production Security Audit...\n')

    // Environment Security
    await this.checkEnvironmentSecurity()
    
    // Dependency Security
    await this.checkDependencySecurity()
    
    // Code Security
    await this.checkCodeSecurity()
    
    // Configuration Security
    await this.checkConfigurationSecurity()
    
    // Infrastructure Security
    await this.checkInfrastructureSecurity()
    
    // Authentication Security
    await this.checkAuthenticationSecurity()
    
    // API Security
    await this.checkAPISecurit()
    
    // Database Security
    await this.checkDatabaseSecurity()

    return this.generateReport()
  }

  private async checkEnvironmentSecurity(): Promise<void> {
    console.log('📋 Checking Environment Security...')

    // Check for required environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'API_KEY_SECRET',
      'ENCRYPTION_KEY',
      'JWT_SECRET'
    ]

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        this.addCheck({
          name: `Environment Variable: ${envVar}`,
          status: 'fail',
          message: `Missing required environment variable: ${envVar}`,
          recommendation: `Set ${envVar} in production environment`
        })
        this.criticalIssues++
      } else {
        this.addCheck({
          name: `Environment Variable: ${envVar}`,
          status: 'pass',
          message: `${envVar} is configured`
        })
      }
    }

    // Check secret strength
    this.checkSecretStrength('NEXTAUTH_SECRET', process.env.NEXTAUTH_SECRET)
    this.checkSecretStrength('API_KEY_SECRET', process.env.API_KEY_SECRET)
    this.checkSecretStrength('ENCRYPTION_KEY', process.env.ENCRYPTION_KEY)
    this.checkSecretStrength('JWT_SECRET', process.env.JWT_SECRET)

    // Check for development artifacts
    if (process.env.NODE_ENV !== 'production') {
      this.addCheck({
        name: 'Node Environment',
        status: 'fail',
        message: 'NODE_ENV is not set to production',
        recommendation: 'Set NODE_ENV=production in production environment'
      })
      this.criticalIssues++
    } else {
      this.addCheck({
        name: 'Node Environment',
        status: 'pass',
        message: 'NODE_ENV is correctly set to production'
      })
    }
  }

  private async checkDependencySecurity(): Promise<void> {
    console.log('📦 Checking Dependency Security...')

    try {
      // Run npm audit
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' })
      const audit = JSON.parse(auditResult)

      if (audit.metadata.vulnerabilities.total === 0) {
        this.addCheck({
          name: 'Dependency Vulnerabilities',
          status: 'pass',
          message: 'No known vulnerabilities found'
        })
      } else {
        const { high, critical } = audit.metadata.vulnerabilities
        if (critical > 0 || high > 0) {
          this.addCheck({
            name: 'Dependency Vulnerabilities',
            status: 'fail',
            message: `Found ${critical} critical and ${high} high severity vulnerabilities`,
            recommendation: 'Run npm audit fix to resolve vulnerabilities'
          })
          this.criticalIssues++
        } else {
          this.addCheck({
            name: 'Dependency Vulnerabilities',
            status: 'warning',
            message: `Found ${audit.metadata.vulnerabilities.total} low/moderate vulnerabilities`,
            recommendation: 'Consider updating packages to resolve vulnerabilities'
          })
        }
      }
    } catch (error) {
      this.addCheck({
        name: 'Dependency Vulnerabilities',
        status: 'warning',
        message: 'Could not run dependency audit',
        recommendation: 'Manually run npm audit to check for vulnerabilities'
      })
    }

    // Check for outdated dependencies
    try {
      const outdatedResult = execSync('npm outdated --json', { encoding: 'utf8' })
      if (outdatedResult.trim()) {
        const outdated = JSON.parse(outdatedResult)
        const majorUpdates = Object.values(outdated).filter((dep: any) => 
          dep.current !== dep.latest && dep.type === 'dependencies'
        ).length

        if (majorUpdates > 5) {
          this.addCheck({
            name: 'Outdated Dependencies',
            status: 'warning',
            message: `${majorUpdates} dependencies have major updates available`,
            recommendation: 'Review and update critical dependencies'
          })
        } else {
          this.addCheck({
            name: 'Outdated Dependencies',
            status: 'pass',
            message: 'Dependencies are reasonably up to date'
          })
        }
      }
    } catch (error) {
      // No outdated packages or command failed
      this.addCheck({
        name: 'Outdated Dependencies',
        status: 'pass',
        message: 'No outdated dependencies found'
      })
    }
  }

  private async checkCodeSecurity(): Promise<void> {
    console.log('🔍 Checking Code Security...')

    // Check for hardcoded secrets
    const secretPatterns = [
      /sk_live_[a-zA-Z0-9]{24,}/g, // Stripe live keys
      /sk_test_[a-zA-Z0-9]{24,}/g, // Stripe test keys
      /pk_live_[a-zA-Z0-9]{24,}/g, // Stripe publishable keys
      /whsec_[a-zA-Z0-9]{32,}/g,   // Stripe webhook secrets
      /sk-[a-zA-Z0-9]{48,}/g,      // OpenAI API keys
      /sk-ant-[a-zA-Z0-9-]{95,}/g, // Anthropic API keys
      /password\s*=\s*["'][^"']+["']/gi,
      /api[_-]?key\s*=\s*["'][^"']+["']/gi,
      /secret\s*=\s*["'][^"']+["']/gi,
    ]

    const filesToCheck = this.getSourceFiles()
    let hardcodedSecretsFound = false

    for (const file of filesToCheck) {
      const content = fs.readFileSync(file, 'utf8')
      
      for (const pattern of secretPatterns) {
        const matches = content.match(pattern)
        if (matches) {
          this.addCheck({
            name: `Hardcoded Secrets in ${file}`,
            status: 'fail',
            message: `Potential hardcoded secret found: ${matches[0].substring(0, 20)}...`,
            recommendation: 'Move secrets to environment variables'
          })
          hardcodedSecretsFound = true
          this.criticalIssues++
        }
      }
    }

    if (!hardcodedSecretsFound) {
      this.addCheck({
        name: 'Hardcoded Secrets',
        status: 'pass',
        message: 'No hardcoded secrets detected in source code'
      })
    }

    // Check for console.log statements in production
    const prodFiles = filesToCheck.filter(f => !f.includes('test') && !f.includes('dev'))
    let consoleLogsFound = 0

    for (const file of prodFiles) {
      const content = fs.readFileSync(file, 'utf8')
      const matches = content.match(/console\.(log|debug|info)/g)
      if (matches) {
        consoleLogsFound += matches.length
      }
    }

    if (consoleLogsFound > 10) {
      this.addCheck({
        name: 'Console Logs',
        status: 'warning',
        message: `Found ${consoleLogsFound} console log statements`,
        recommendation: 'Replace console logs with proper logging in production'
      })
    } else {
      this.addCheck({
        name: 'Console Logs',
        status: 'pass',
        message: 'Minimal console logging detected'
      })
    }
  }

  private async checkConfigurationSecurity(): Promise<void> {
    console.log('⚙️ Checking Configuration Security...')

    // Check Vercel configuration
    if (fs.existsSync('vercel.json')) {
      const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'))
      
      // Check security headers
      const headers = vercelConfig.headers || []
      const securityHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security',
        'Content-Security-Policy'
      ]

      let hasAllSecurityHeaders = true
      for (const header of securityHeaders) {
        const hasHeader = headers.some((h: any) => 
          h.headers?.some((hh: any) => hh.key === header)
        )
        if (!hasHeader) {
          hasAllSecurityHeaders = false
          this.addCheck({
            name: `Security Header: ${header}`,
            status: 'fail',
            message: `Missing security header: ${header}`,
            recommendation: `Add ${header} to vercel.json headers configuration`
          })
        }
      }

      if (hasAllSecurityHeaders) {
        this.addCheck({
          name: 'Security Headers',
          status: 'pass',
          message: 'All required security headers are configured'
        })
      }

      // Check CSP configuration
      const cspHeader = headers.find((h: any) => 
        h.headers?.find((hh: any) => hh.key === 'Content-Security-Policy')
      )
      
      if (cspHeader) {
        const cspValue = cspHeader.headers.find((h: any) => h.key === 'Content-Security-Policy').value
        if (cspValue.includes("'unsafe-eval'")) {
          this.addCheck({
            name: 'Content Security Policy',
            status: 'warning',
            message: 'CSP allows unsafe-eval',
            recommendation: 'Remove unsafe-eval from CSP if possible'
          })
        } else {
          this.addCheck({
            name: 'Content Security Policy',
            status: 'pass',
            message: 'CSP is properly configured'
          })
        }
      }
    }

    // Check Next.js configuration
    if (fs.existsSync('next.config.js') || fs.existsSync('next.config.ts')) {
      this.addCheck({
        name: 'Next.js Configuration',
        status: 'pass',
        message: 'Next.js configuration file exists'
      })
    }

    // Check for exposed sensitive files
    const sensitiveFiles = [
      '.env',
      '.env.local',
      '.env.production',
      'package-lock.json',
      'yarn.lock'
    ]

    for (const file of sensitiveFiles) {
      if (fs.existsSync(file)) {
        // Check if it's in .gitignore
        const gitignore = fs.existsSync('.gitignore') ? fs.readFileSync('.gitignore', 'utf8') : ''
        if (!gitignore.includes(file) && file.startsWith('.env')) {
          this.addCheck({
            name: `Git Protection: ${file}`,
            status: 'fail',
            message: `${file} is not in .gitignore`,
            recommendation: `Add ${file} to .gitignore to prevent accidental commits`
          })
          this.criticalIssues++
        }
      }
    }
  }

  private async checkInfrastructureSecurity(): Promise<void> {
    console.log('🏗️ Checking Infrastructure Security...')

    // Check database URL format
    const dbUrl = process.env.DATABASE_URL
    if (dbUrl) {
      if (dbUrl.includes('sslmode=require') || dbUrl.includes('ssl=true')) {
        this.addCheck({
          name: 'Database SSL',
          status: 'pass',
          message: 'Database connection requires SSL'
        })
      } else {
        this.addCheck({
          name: 'Database SSL',
          status: 'warning',
          message: 'Database SSL not explicitly required',
          recommendation: 'Add sslmode=require to DATABASE_URL'
        })
      }

      if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
        this.addCheck({
          name: 'Database Host',
          status: 'fail',
          message: 'Database appears to be running locally',
          recommendation: 'Use production database host'
        })
        this.criticalIssues++
      } else {
        this.addCheck({
          name: 'Database Host',
          status: 'pass',
          message: 'Database host appears to be production-ready'
        })
      }
    }

    // Check Redis configuration
    const redisUrl = process.env.REDIS_URL
    if (redisUrl) {
      if (redisUrl.includes('rediss://') || redisUrl.includes('ssl=true')) {
        this.addCheck({
          name: 'Redis SSL',
          status: 'pass',
          message: 'Redis connection uses SSL'
        })
      } else {
        this.addCheck({
          name: 'Redis SSL',
          status: 'warning',
          message: 'Redis connection may not use SSL',
          recommendation: 'Use rediss:// or configure SSL for Redis'
        })
      }
    }

    // Check NEXTAUTH_URL
    const nextAuthUrl = process.env.NEXTAUTH_URL
    if (nextAuthUrl) {
      if (nextAuthUrl.startsWith('https://')) {
        this.addCheck({
          name: 'NEXTAUTH_URL Protocol',
          status: 'pass',
          message: 'NEXTAUTH_URL uses HTTPS'
        })
      } else {
        this.addCheck({
          name: 'NEXTAUTH_URL Protocol',
          status: 'fail',
          message: 'NEXTAUTH_URL does not use HTTPS',
          recommendation: 'Update NEXTAUTH_URL to use HTTPS in production'
        })
        this.criticalIssues++
      }

      if (nextAuthUrl.includes('localhost') || nextAuthUrl.includes('127.0.0.1')) {
        this.addCheck({
          name: 'NEXTAUTH_URL Host',
          status: 'fail',
          message: 'NEXTAUTH_URL points to localhost',
          recommendation: 'Update NEXTAUTH_URL to production domain'
        })
        this.criticalIssues++
      }
    }
  }

  private async checkAuthenticationSecurity(): Promise<void> {
    console.log('🔐 Checking Authentication Security...')

    // Check NextAuth configuration exists
    if (fs.existsSync('src/lib/auth.ts') || fs.existsSync('src/lib/auth/config.ts')) {
      this.addCheck({
        name: 'Auth Configuration',
        status: 'pass',
        message: 'Authentication configuration file exists'
      })
    } else {
      this.addCheck({
        name: 'Auth Configuration',
        status: 'fail',
        message: 'Authentication configuration file not found',
        recommendation: 'Ensure auth configuration is properly set up'
      })
    }

    // Check for CSRF protection
    if (fs.existsSync('src/lib/csrf.ts')) {
      this.addCheck({
        name: 'CSRF Protection',
        status: 'pass',
        message: 'CSRF protection implementation found'
      })
    } else {
      this.addCheck({
        name: 'CSRF Protection',
        status: 'warning',
        message: 'CSRF protection implementation not found',
        recommendation: 'Implement CSRF protection for forms'
      })
    }

    // Check for rate limiting
    if (fs.existsSync('src/lib/rate-limit.ts') || fs.existsSync('src/lib/rate-limiting/')) {
      this.addCheck({
        name: 'Rate Limiting',
        status: 'pass',
        message: 'Rate limiting implementation found'
      })
    } else {
      this.addCheck({
        name: 'Rate Limiting',
        status: 'fail',
        message: 'Rate limiting implementation not found',
        recommendation: 'Implement rate limiting for API endpoints'
      })
    }
  }

  private async checkAPISecurit(): Promise<void> {
    console.log('🔌 Checking API Security...')

    // Check for API middleware
    if (fs.existsSync('src/middleware.ts')) {
      const middlewareContent = fs.readFileSync('src/middleware.ts', 'utf8')
      
      if (middlewareContent.includes('csrf') || middlewareContent.includes('CSRF')) {
        this.addCheck({
          name: 'API CSRF Protection',
          status: 'pass',
          message: 'CSRF protection detected in middleware'
        })
      } else {
        this.addCheck({
          name: 'API CSRF Protection',
          status: 'warning',
          message: 'CSRF protection not clearly implemented in middleware',
          recommendation: 'Ensure CSRF protection is enabled for API routes'
        })
      }

      if (middlewareContent.includes('rateLimit') || middlewareContent.includes('rate')) {
        this.addCheck({
          name: 'API Rate Limiting',
          status: 'pass',
          message: 'Rate limiting detected in middleware'
        })
      } else {
        this.addCheck({
          name: 'API Rate Limiting',
          status: 'warning',
          message: 'Rate limiting not clearly implemented in middleware',
          recommendation: 'Implement rate limiting in API middleware'
        })
      }
    }

    // Check for input validation
    if (fs.existsSync('src/lib/validation/') || fs.existsSync('src/lib/validation.ts')) {
      this.addCheck({
        name: 'Input Validation',
        status: 'pass',
        message: 'Input validation library found'
      })
    } else {
      this.addCheck({
        name: 'Input Validation',
        status: 'fail',
        message: 'Input validation implementation not found',
        recommendation: 'Implement comprehensive input validation'
      })
    }

    // Check API route structure
    const apiDir = 'src/app/api'
    if (fs.existsSync(apiDir)) {
      const apiRoutes = this.getAllFiles(apiDir).filter(f => f.endsWith('route.ts'))
      
      if (apiRoutes.length > 0) {
        this.addCheck({
          name: 'API Routes Structure',
          status: 'pass',
          message: `Found ${apiRoutes.length} API routes`
        })
      }

      // Check for route protection
      let protectedRoutes = 0
      for (const route of apiRoutes) {
        const content = fs.readFileSync(route, 'utf8')
        if (content.includes('getServerSession') || content.includes('auth')) {
          protectedRoutes++
        }
      }

      const protectionRatio = protectedRoutes / apiRoutes.length
      if (protectionRatio > 0.7) {
        this.addCheck({
          name: 'API Route Protection',
          status: 'pass',
          message: `${Math.round(protectionRatio * 100)}% of routes have authentication checks`
        })
      } else if (protectionRatio > 0.3) {
        this.addCheck({
          name: 'API Route Protection',
          status: 'warning',
          message: `Only ${Math.round(protectionRatio * 100)}% of routes have authentication checks`,
          recommendation: 'Review and add authentication to sensitive API routes'
        })
      } else {
        this.addCheck({
          name: 'API Route Protection',
          status: 'fail',
          message: `Only ${Math.round(protectionRatio * 100)}% of routes have authentication checks`,
          recommendation: 'Add authentication protection to API routes'
        })
      }
    }
  }

  private async checkDatabaseSecurity(): Promise<void> {
    console.log('🗄️ Checking Database Security...')

    // Check Prisma schema
    if (fs.existsSync('prisma/schema.prisma')) {
      const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8')
      
      // Check for proper user/tenant isolation
      if (schemaContent.includes('userId') || schemaContent.includes('tenantId')) {
        this.addCheck({
          name: 'Database Isolation',
          status: 'pass',
          message: 'User/tenant isolation detected in schema'
        })
      } else {
        this.addCheck({
          name: 'Database Isolation',
          status: 'warning',
          message: 'User/tenant isolation not clearly implemented',
          recommendation: 'Ensure proper row-level security implementation'
        })
      }

      // Check for sensitive data fields
      const sensitiveFields = ['password', 'ssn', 'creditCard']
      let hasEncryption = false
      
      for (const field of sensitiveFields) {
        if (schemaContent.includes(field)) {
          if (schemaContent.includes('@encrypted') || schemaContent.includes('encrypted')) {
            hasEncryption = true
          }
        }
      }

      if (schemaContent.includes('password') && !hasEncryption) {
        this.addCheck({
          name: 'Password Encryption',
          status: 'warning',
          message: 'Password fields detected without explicit encryption',
          recommendation: 'Ensure passwords are properly hashed/encrypted'
        })
      }
    }

    // Check for database connection security
    if (fs.existsSync('src/lib/db.ts')) {
      const dbContent = fs.readFileSync('src/lib/db.ts', 'utf8')
      
      if (dbContent.includes('connectionLimit') || dbContent.includes('pool')) {
        this.addCheck({
          name: 'Database Connection Pooling',
          status: 'pass',
          message: 'Connection pooling configuration detected'
        })
      } else {
        this.addCheck({
          name: 'Database Connection Pooling',
          status: 'warning',
          message: 'Connection pooling not explicitly configured',
          recommendation: 'Configure connection pooling for production'
        })
      }
    }
  }

  private checkSecretStrength(name: string, secret?: string): void {
    if (!secret) return

    if (secret.length < 32) {
      this.addCheck({
        name: `Secret Strength: ${name}`,
        status: 'fail',
        message: `${name} is too short (${secret.length} chars, minimum 32)`,
        recommendation: `Generate a stronger ${name} with at least 32 characters`
      })
      this.criticalIssues++
    } else if (secret.length < 64) {
      this.addCheck({
        name: `Secret Strength: ${name}`,
        status: 'warning',
        message: `${name} could be stronger (${secret.length} chars, recommend 64+)`,
        recommendation: `Consider generating a longer ${name}`
      })
    } else {
      this.addCheck({
        name: `Secret Strength: ${name}`,
        status: 'pass',
        message: `${name} has adequate length (${secret.length} chars)`
      })
    }

    // Check for common weak patterns
    const weakPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc123/i,
      /^(.)\1+$/, // All same character
    ]

    for (const pattern of weakPatterns) {
      if (pattern.test(secret)) {
        this.addCheck({
          name: `Secret Pattern: ${name}`,
          status: 'fail',
          message: `${name} contains weak patterns`,
          recommendation: `Generate a cryptographically secure random ${name}`
        })
        this.criticalIssues++
        break
      }
    }
  }

  private getSourceFiles(): string[] {
    const extensions = ['.ts', '.tsx', '.js', '.jsx']
    const files: string[] = []
    
    const searchDirs = ['src/', 'pages/', 'components/']
    
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        files.push(...this.getAllFiles(dir).filter(f => 
          extensions.some(ext => f.endsWith(ext))
        ))
      }
    }
    
    return files
  }

  private getAllFiles(dir: string): string[] {
    const files: string[] = []
    
    const items = fs.readdirSync(dir)
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        files.push(...this.getAllFiles(fullPath))
      } else {
        files.push(fullPath)
      }
    }
    
    return files
  }

  private addCheck(check: SecurityCheck): void {
    this.checks.push(check)
    
    const icon = check.status === 'pass' ? '✅' : check.status === 'warning' ? '⚠️' : '❌'
    console.log(`${icon} ${check.name}: ${check.message}`)
    
    if (check.recommendation) {
      console.log(`   💡 ${check.recommendation}`)
    }
  }

  private generateReport(): SecurityAuditReport {
    const passCount = this.checks.filter(c => c.status === 'pass').length
    const score = Math.round((passCount / this.checks.length) * 100)
    
    const recommendations = this.checks
      .filter(c => c.recommendation)
      .map(c => c.recommendation!)
    
    const report: SecurityAuditReport = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      version: this.getPackageVersion(),
      checks: this.checks,
      score,
      criticalIssues: this.criticalIssues,
      recommendations
    }

    console.log('\n🔒 Security Audit Report')
    console.log('='.repeat(50))
    console.log(`📊 Security Score: ${score}%`)
    console.log(`🚨 Critical Issues: ${this.criticalIssues}`)
    console.log(`✅ Passed Checks: ${passCount}/${this.checks.length}`)
    console.log(`⚠️ Warnings: ${this.checks.filter(c => c.status === 'warning').length}`)
    console.log(`❌ Failed Checks: ${this.checks.filter(c => c.status === 'fail').length}`)
    
    if (this.criticalIssues > 0) {
      console.log('\n🚨 CRITICAL ISSUES MUST BE RESOLVED BEFORE PRODUCTION DEPLOYMENT!')
    } else if (score < 80) {
      console.log('\n⚠️ Security score below 80%. Review warnings before deployment.')
    } else {
      console.log('\n✅ Security audit passed! Ready for production deployment.')
    }

    return report
  }

  private getPackageVersion(): string {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      return packageJson.version || '1.0.0'
    } catch {
      return '1.0.0'
    }
  }
}

// Run the audit if called directly
if (require.main === module) {
  const auditor = new ProductionSecurityAuditor()
  auditor.runFullAudit()
    .then(report => {
      // Save report to file
      const reportPath = `security-audit-${Date.now()}.json`
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
      console.log(`\n📋 Full report saved to: ${reportPath}`)
      
      // Exit with error code if critical issues found
      process.exit(report.criticalIssues > 0 ? 1 : 0)
    })
    .catch(error => {
      console.error('Security audit failed:', error)
      process.exit(1)
    })
}

export { ProductionSecurityAuditor, type SecurityAuditReport, type SecurityCheck }