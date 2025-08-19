#!/usr/bin/env node

/**
 * CoreFlow360 - Deployment Validation Script
 * Comprehensive pre-deployment validation
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// ANSI color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bold}${colors.cyan}🚀 ${msg}${colors.reset}`)
}

class DeploymentValidator {
  constructor() {
    this.errors = []
    this.warnings = []
    this.projectRoot = path.resolve(__dirname, '..')
  }

  async validate() {
    log.header('CoreFlow360 Deployment Validation')
    console.log('=' * 50)

    await this.validateFileIntegrity()
    await this.validateConfiguration()
    await this.validateDependencies()
    await this.validateEnvironment()
    await this.validateTypeScript()
    await this.validateTests()
    await this.validateSecurity()
    await this.validatePerformance()

    this.generateReport()
  }

  async validateFileIntegrity() {
    log.info('Validating file integrity...')

    const criticalFiles = [
      'package.json',
      'next.config.ts',
      'vercel.json',
      'src/middleware.ts',
      'src/lib/config/environment.ts',
      'src/lib/auth.ts',
      'prisma/schema.prisma'
    ]

    for (const file of criticalFiles) {
      const filePath = path.join(this.projectRoot, file)
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Critical file missing: ${file}`)
      } else {
        const stats = fs.statSync(filePath)
        if (stats.size === 0) {
          this.errors.push(`Critical file is empty: ${file}`)
        }
      }
    }

    // Check for corrupted files (files with excessive repetition)
    const filesToCheck = [
      'src/lib/config/environment.ts',
      'src/__tests__/auth/session-security.test.ts',
      'src/__tests__/stripe/webhook-processing.test.ts'
    ]

    for (const file of filesToCheck) {
      const filePath = path.join(this.projectRoot, file)
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        
        // Check for suspicious repetition patterns
        const repetitionPatterns = [
          /process\.env\.SECRET_KEY.*(\|\|.*){10,}/,
          /(\/\/.*){20,}/,
          /(".*".*){20,}/
        ]

        for (const pattern of repetitionPatterns) {
          if (pattern.test(content)) {
            this.errors.push(`File appears corrupted with repetitive patterns: ${file}`)
            break
          }
        }
      }
    }

    if (this.errors.length === 0) {
      log.success('File integrity validation passed')
    }
  }

  async validateConfiguration() {
    log.info('Validating configuration files...')

    // Validate package.json
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'))
      
      // Check for consistent memory allocation
      const buildScript = packageJson.scripts?.build || ''
      const memoryAllocation = buildScript.match(/--max-old-space-size=(\d+)/)
      
      if (memoryAllocation) {
        const memoryMB = parseInt(memoryAllocation[1])
        if (memoryMB < 8192) {
          this.warnings.push(`Build memory allocation is ${memoryMB}MB, recommended: 8192MB`)
        }
      }

      // Check for required scripts
      const requiredScripts = ['dev', 'build', 'start', 'lint']
      for (const script of requiredScripts) {
        if (!packageJson.scripts?.[script]) {
          this.errors.push(`Missing required script: ${script}`)
        }
      }

    } catch (error) {
      this.errors.push(`Invalid package.json: ${error.message}`)
    }

    // Validate vercel.json
    try {
      const vercelConfig = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'vercel.json'), 'utf8'))
      
      // Check function timeouts
      const functions = vercelConfig.functions
      if (functions) {
        Object.entries(functions).forEach(([pattern, config]) => {
          if (config.maxDuration && config.maxDuration < 60) {
            this.warnings.push(`Function timeout for ${pattern} is ${config.maxDuration}s, recommended: 60s`)
          }
        })
      }

    } catch (error) {
      this.errors.push(`Invalid vercel.json: ${error.message}`)
    }

    // Validate Next.js config
    try {
      const nextConfigPath = path.join(this.projectRoot, 'next.config.ts')
      const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8')
      
      // Check for emergency ignores
      if (nextConfigContent.includes('ignoreBuildErrors: true')) {
        this.errors.push('TypeScript build errors are being ignored in next.config.ts')
      }
      
      if (nextConfigContent.includes('ignoreDuringBuilds: true')) {
        this.errors.push('ESLint errors are being ignored during builds in next.config.ts')
      }

    } catch (error) {
      this.errors.push(`Error reading next.config.ts: ${error.message}`)
    }

    if (this.errors.length === 0) {
      log.success('Configuration validation passed')
    }
  }

  async validateDependencies() {
    log.info('Validating dependencies...')

    try {
      // Check for package vulnerabilities
      execSync('npm audit --audit-level moderate', { 
        stdio: 'pipe',
        cwd: this.projectRoot 
      })
      log.success('No moderate or high severity vulnerabilities found')
    } catch (error) {
      this.warnings.push('npm audit found security vulnerabilities')
    }

    // Check for outdated dependencies
    try {
      const outdated = execSync('npm outdated --json', { 
        stdio: 'pipe',
        cwd: this.projectRoot 
      }).toString()
      
      if (outdated.trim()) {
        const outdatedPackages = JSON.parse(outdated)
        const criticalPackages = ['next', 'react', 'typescript']
        
        for (const pkg of criticalPackages) {
          if (outdatedPackages[pkg]) {
            this.warnings.push(`Critical package ${pkg} is outdated`)
          }
        }
      }
    } catch (error) {
      // npm outdated returns non-zero exit code when packages are outdated
      // This is expected behavior
    }
  }

  async validateEnvironment() {
    log.info('Validating environment configuration...')

    // Check for hardcoded secrets
    const secretPatterns = [
      /sk_test_[a-zA-Z0-9]+/,
      /pk_test_[a-zA-Z0-9]+/,
      /whsec_[a-zA-Z0-9]+/,
      /password.*=.*123/i,
      /secret.*=.*test/i
    ]

    const filesToScan = [
      'src/lib/config/environment.ts',
      'src/lib/config/environment-build.ts',
      'src/lib/auth.ts'
    ]

    for (const file of filesToScan) {
      const filePath = path.join(this.projectRoot, file)
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        
        for (const pattern of secretPatterns) {
          if (pattern.test(content)) {
            this.errors.push(`Potential hardcoded secret found in ${file}`)
            break
          }
        }
      }
    }

    // Validate environment schema
    try {
      const envPath = path.join(this.projectRoot, 'src/lib/config/environment.ts')
      const envContent = fs.readFileSync(envPath, 'utf8')
      
      // Check for proper build-time handling
      if (!envContent.includes('getIsBuildTime')) {
        this.errors.push('Environment config missing build-time detection')
      }
      
      if (!envContent.includes('z.string().optional()')) {
        this.warnings.push('Environment config may not handle optional variables properly')
      }

    } catch (error) {
      this.errors.push(`Error validating environment config: ${error.message}`)
    }
  }

  async validateTypeScript() {
    log.info('Validating TypeScript configuration...')

    try {
      // Run TypeScript type checking
      execSync('npx tsc --noEmit', { 
        stdio: 'pipe',
        cwd: this.projectRoot 
      })
      log.success('TypeScript type checking passed')
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || ''
      const errorCount = (output.match(/error TS/g) || []).length
      
      if (errorCount > 0) {
        this.errors.push(`TypeScript validation failed with ${errorCount} errors`)
      } else {
        this.warnings.push('TypeScript validation returned non-zero exit code')
      }
    }

    // Check tsconfig.json
    try {
      const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json')
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'))
      
      if (!tsconfig.compilerOptions?.strict) {
        this.warnings.push('TypeScript strict mode is not enabled')
      }
      
      if (tsconfig.compilerOptions?.skipLibCheck !== true) {
        this.warnings.push('TypeScript skipLibCheck should be enabled for build performance')
      }

    } catch (error) {
      this.errors.push(`Error reading tsconfig.json: ${error.message}`)
    }
  }

  async validateTests() {
    log.info('Validating test configuration...')

    try {
      // Check if critical test files exist and are not empty
      const testFiles = [
        'src/__tests__/auth/session-security-clean.test.ts',
        'src/__tests__/stripe/webhook-processing.test.ts',
        'src/__tests__/system/deployment-validation.test.ts'
      ]

      for (const testFile of testFiles) {
        const testPath = path.join(this.projectRoot, testFile)
        if (fs.existsSync(testPath)) {
          const stats = fs.statSync(testPath)
          if (stats.size === 0) {
            this.errors.push(`Test file is empty: ${testFile}`)
          } else if (stats.size < 100) {
            this.warnings.push(`Test file appears incomplete: ${testFile}`)
          }
        } else {
          this.warnings.push(`Test file missing: ${testFile}`)
        }
      }

      // Run a quick test to ensure the test environment works
      execSync('npm run test --passWithNoTests --silent', { 
        stdio: 'pipe',
        cwd: this.projectRoot 
      })
      log.success('Test environment validation passed')
      
    } catch (error) {
      this.warnings.push('Test environment validation failed')
    }
  }

  async validateSecurity() {
    log.info('Validating security configuration...')

    // Check middleware security headers
    const middlewarePath = path.join(this.projectRoot, 'src/middleware.ts')
    if (fs.existsSync(middlewarePath)) {
      const middlewareContent = fs.readFileSync(middlewarePath, 'utf8')
      
      const securityHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Referrer-Policy'
      ]
      
      for (const header of securityHeaders) {
        if (!middlewareContent.includes(header)) {
          this.errors.push(`Missing security header: ${header}`)
        }
      }
    }

    // Check for console.log statements in production code
    const prodFiles = [
      'src/middleware.ts',
      'src/lib/auth.ts',
      'src/lib/config/environment.ts'
    ]

    for (const file of prodFiles) {
      const filePath = path.join(this.projectRoot, file)
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        if (content.includes('console.log(') || content.includes('console.error(')) {
          this.warnings.push(`Console statements found in production file: ${file}`)
        }
      }
    }
  }

  async validatePerformance() {
    log.info('Validating performance configuration...')

    // Check bundle size configuration
    const nextConfigPath = path.join(this.projectRoot, 'next.config.ts')
    if (fs.existsSync(nextConfigPath)) {
      const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8')
      
      if (!nextConfigContent.includes('splitChunks')) {
        this.warnings.push('Bundle splitting not configured for optimal performance')
      }
      
      if (!nextConfigContent.includes('optimizePackageImports')) {
        this.warnings.push('Package import optimization not configured')
      }
    }

    // Check image optimization
    if (fs.existsSync(nextConfigPath)) {
      const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8')
      
      if (!nextConfigContent.includes('formats:')) {
        this.warnings.push('Image format optimization not configured')
      }
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60))
    log.header('Deployment Validation Report')
    console.log('='.repeat(60))

    if (this.errors.length === 0 && this.warnings.length === 0) {
      log.success('🎉 All validations passed! Ready for deployment.')
      process.exit(0)
    }

    if (this.errors.length > 0) {
      console.log(`\n${colors.red}${colors.bold}❌ CRITICAL ERRORS (${this.errors.length}):${colors.reset}`)
      this.errors.forEach((error, index) => {
        console.log(`${colors.red}  ${index + 1}. ${error}${colors.reset}`)
      })
    }

    if (this.warnings.length > 0) {
      console.log(`\n${colors.yellow}${colors.bold}⚠️  WARNINGS (${this.warnings.length}):${colors.reset}`)
      this.warnings.forEach((warning, index) => {
        console.log(`${colors.yellow}  ${index + 1}. ${warning}${colors.reset}`)
      })
    }

    console.log('\n' + '='.repeat(60))

    if (this.errors.length > 0) {
      log.error('❌ Deployment validation failed. Please fix critical errors before deploying.')
      process.exit(1)
    } else {
      log.warning('⚠️  Deployment validation passed with warnings. Review warnings before deploying.')
      process.exit(0)
    }
  }
}

// Run validation
const validator = new DeploymentValidator()
validator.validate().catch((error) => {
  log.error(`Validation script failed: ${error.message}`)
  process.exit(1)
})