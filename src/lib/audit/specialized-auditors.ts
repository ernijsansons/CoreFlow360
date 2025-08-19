/**
 * CoreFlow360 - Specialized AI-Powered Auditors
 * Advanced audit implementations with domain expertise
 */

import { AuditFinding } from './audit-orchestration'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { logger } from '@/lib/logging/logger'

export interface CodePattern {
  pattern: RegExp
  severity: AuditFinding['severity']
  category: string
  description: string
  recommendation: string
}

export interface SecurityVulnerability {
  type: string
  severity: AuditFinding['severity']
  cwe_id?: string
  owasp_category?: string
  description: string
  remediation: string
}

export interface PerformanceIssue {
  type: 'memory' | 'cpu' | 'network' | 'database' | 'rendering'
  impact: 'low' | 'medium' | 'high' | 'critical'
  description: string
  optimization: string
}

export class SecurityAuditor {
  private securityPatterns: CodePattern[] = [
    {
      pattern: /(password|secret|token|key)\s*[:=]\s*["'][^"']+["']/gi,
      severity: 'critical',
      category: 'security',
      description: 'Hardcoded credentials detected',
      recommendation: 'Move sensitive data to environment variables or secure vault',
    },
    {
      pattern: /eval\s*\(/gi,
      severity: 'critical',
      category: 'security',
      description: 'Code injection vulnerability via eval()',
      recommendation:
        'Replace eval() with safer alternatives like JSON.parse() or Function constructor',
    },
    {
      pattern: /innerHTML\s*[=+]/gi,
      severity: 'high',
      category: 'security',
      description: 'XSS vulnerability via innerHTML',
      recommendation: 'Use textContent or sanitize HTML input with DOMPurify',
    },
    {
      pattern: /\$\{[^}]*\}/g,
      severity: 'medium',
      category: 'security',
      description: 'Template literal injection potential',
      recommendation: 'Validate and sanitize all dynamic template inputs',
    },
    {
      pattern: /document\.write\s*\(/gi,
      severity: 'medium',
      category: 'security',
      description: 'XSS risk via document.write',
      recommendation: 'Use modern DOM manipulation methods',
    },
  ]

  async auditAuthentication(projectRoot: string): Promise<AuditFinding[]> {
    const findings: AuditFinding[] = []

    // Check NextAuth configuration
    const authConfigPath = join(projectRoot, 'src/lib/auth.ts')
    if (this.fileExists(authConfigPath)) {
      const authConfig = readFileSync(authConfigPath, 'utf8')

      // Check for secure session configuration
      if (!authConfig.includes('jwt') && !authConfig.includes('database')) {
        findings.push({
          id: 'auth_001',
          category: 'security',
          severity: 'high',
          title: 'Insecure Session Storage',
          description: 'Authentication not configured with secure session storage',
          impact: 'Sessions could be vulnerable to tampering or not persist across server restarts',
          effort: 'medium',
          implementation_cost: 16,
          business_value: 80,
          technical_debt: 40,
          location: authConfigPath,
          evidence: ['NextAuth configuration lacks secure session strategy'],
          recommendations: [
            'Configure JWT with secure signing key',
            'Or use database sessions for better security',
            'Enable secure cookie settings',
          ],
          dependencies: [],
          related_findings: [],
        })
      }

      // Check for CSRF protection
      if (!authConfig.includes('csrf')) {
        findings.push({
          id: 'auth_002',
          category: 'security',
          severity: 'medium',
          title: 'Missing CSRF Protection',
          description: 'No explicit CSRF protection configuration found',
          impact: 'Vulnerable to cross-site request forgery attacks',
          effort: 'low',
          implementation_cost: 8,
          business_value: 60,
          technical_debt: 20,
          location: authConfigPath,
          evidence: ['No CSRF token configuration in auth setup'],
          recommendations: [
            'Enable NextAuth CSRF protection',
            'Configure secure cookies with SameSite attribute',
            'Implement CSRF tokens for sensitive operations',
          ],
          dependencies: [],
          related_findings: [],
        })
      }
    }

    return findings
  }

  async auditInputValidation(projectRoot: string): Promise<AuditFinding[]> {
    const findings: AuditFinding[] = []
    const apiFiles = this.findFiles(join(projectRoot, 'src/app/api'), '.ts')

    for (const file of apiFiles) {
      const content = readFileSync(file, 'utf8')

      // Check for input validation
      if (!content.includes('zod') && !content.includes('joi') && !content.includes('yup')) {
        const relativePath = file.replace(projectRoot, '')
        findings.push({
          id: `input_${Math.random().toString(36).substring(7)}`,
          category: 'security',
          severity: 'high',
          title: 'Missing Input Validation',
          description: 'API endpoint lacks input validation schema',
          impact: 'Vulnerable to injection attacks and data corruption',
          effort: 'medium',
          implementation_cost: 12,
          business_value: 70,
          technical_debt: 30,
          location: relativePath,
          evidence: ['No validation library usage detected'],
          recommendations: [
            'Implement Zod schema validation',
            'Validate all request parameters and body',
            'Add request rate limiting',
          ],
          dependencies: [],
          related_findings: [],
        })
      }

      // Check for SQL injection patterns
      if (content.match(/\$\{.*\}/g) && content.includes('sql')) {
        findings.push({
          id: `sql_${Math.random().toString(36).substring(7)}`,
          category: 'security',
          severity: 'critical',
          title: 'Potential SQL Injection',
          description: 'Dynamic SQL construction with template literals',
          impact: 'Critical security vulnerability - database could be compromised',
          effort: 'high',
          implementation_cost: 24,
          business_value: 100,
          technical_debt: 80,
          location: file.replace(projectRoot, ''),
          evidence: ['Template literal usage in SQL context'],
          recommendations: [
            'Use parameterized queries with Prisma',
            'Implement input sanitization',
            'Add database query logging',
          ],
          dependencies: [],
          related_findings: [],
        })
      }
    }

    return findings
  }

  async auditDataProtection(projectRoot: string): Promise<AuditFinding[]> {
    const findings: AuditFinding[] = []

    // Check for PII handling
    const allFiles = this.findFiles(join(projectRoot, 'src'), '.ts', '.tsx')
    const piiPatterns = [
      /email/gi,
      /phone/gi,
      /ssn|social.security/gi,
      /credit.card|creditcard/gi,
      /password/gi,
    ]

    for (const file of allFiles) {
      const content = readFileSync(file, 'utf8')

      for (const pattern of piiPatterns) {
        if (pattern.test(content) && !content.includes('encrypt') && !content.includes('hash')) {
          findings.push({
            id: `pii_${Math.random().toString(36).substring(7)}`,
            category: 'security',
            severity: 'high',
            title: 'Unencrypted PII Handling',
            description: 'Potentially sensitive data handled without encryption',
            impact: 'Compliance risk and potential data exposure',
            effort: 'medium',
            implementation_cost: 20,
            business_value: 85,
            technical_debt: 35,
            location: file.replace(projectRoot, ''),
            evidence: [`PII pattern detected: ${pattern.source}`],
            recommendations: [
              'Implement encryption for sensitive data',
              'Add data masking for logs',
              'Review GDPR/CCPA compliance requirements',
            ],
            dependencies: [],
            related_findings: [],
          })
          break // Only report once per file
        }
      }
    }

    return findings
  }

  private fileExists(path: string): boolean {
    try {
      return statSync(path).isFile()
    } catch {
      return false
    }
  }

  private findFiles(dir: string, ...extensions: string[]): string[] {
    const files: string[] = []

    try {
      const items = readdirSync(dir)

      for (const item of items) {
        const fullPath = join(dir, item)
        const stat = statSync(fullPath)

        if (stat.isDirectory() && !item.startsWith('.')) {
          files.push(...this.findFiles(fullPath, ...extensions))
        } else if (stat.isFile() && extensions.some((ext) => item.endsWith(ext))) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      // Directory doesn't exist or permission denied
    }

    return files
  }
}

export class PerformanceAuditor {
  async auditDatabaseQueries(projectRoot: string): Promise<AuditFinding[]> {
    const findings: AuditFinding[] = []
    const prismaFiles = this.findFiles(join(projectRoot, 'src'), '.ts', '.tsx')

    for (const file of prismaFiles) {
      const content = readFileSync(file, 'utf8')

      // Check for N+1 query patterns
      const nPlusOnePattern = /\.map\s*\(\s*async.*?prisma\./gs
      const nPlusOneMatches = content.match(nPlusOnePattern)

      if (nPlusOneMatches && nPlusOneMatches.length > 0) {
        findings.push({
          id: `n1_${Math.random().toString(36).substring(7)}`,
          category: 'performance',
          severity: 'high',
          title: 'N+1 Query Pattern Detected',
          description: 'Database queries inside async map operations',
          impact: 'Severe performance degradation as data scales',
          effort: 'medium',
          implementation_cost: 16,
          business_value: 70,
          technical_debt: 45,
          location: file.replace(projectRoot, ''),
          evidence: nPlusOneMatches,
          recommendations: [
            'Use Prisma include/select for eager loading',
            'Batch queries using Promise.all()',
            'Implement query result caching',
          ],
          dependencies: [],
          related_findings: [],
        })
      }

      // Check for missing database indexes
      if (content.includes('findMany') && !content.includes('take') && !content.includes('skip')) {
        findings.push({
          id: `idx_${Math.random().toString(36).substring(7)}`,
          category: 'performance',
          severity: 'medium',
          title: 'Unbounded Database Query',
          description: 'Database query without pagination or limits',
          impact: 'Memory exhaustion and slow response times',
          effort: 'low',
          implementation_cost: 8,
          business_value: 50,
          technical_debt: 25,
          location: file.replace(projectRoot, ''),
          evidence: ['findMany without take/skip parameters'],
          recommendations: [
            'Add pagination with take/skip',
            'Implement cursor-based pagination for large datasets',
            'Add database query monitoring',
          ],
          dependencies: [],
          related_findings: [],
        })
      }
    }

    return findings
  }

  async auditCachingStrategy(projectRoot: string): Promise<AuditFinding[]> {
    const findings: AuditFinding[] = []

    // Check for Redis/caching implementation
    const hasRedis = this.findFiles(join(projectRoot, 'src'), '.ts').some((file) => {
      const content = readFileSync(file, 'utf8')
      return content.includes('redis') || content.includes('cache')
    })

    if (!hasRedis) {
      findings.push({
        id: 'cache_001',
        category: 'performance',
        severity: 'medium',
        title: 'Missing Caching Strategy',
        description: 'No caching layer implemented for database queries',
        impact: 'Higher response times and database load',
        effort: 'high',
        implementation_cost: 32,
        business_value: 60,
        technical_debt: 40,
        location: 'Application architecture',
        evidence: ['No Redis or cache implementation found'],
        recommendations: [
          'Implement Redis for session and query caching',
          'Add Next.js API route caching',
          'Cache expensive computations and API responses',
        ],
        dependencies: [],
        related_findings: [],
      })
    }

    // Check for Next.js caching best practices
    const apiFiles = this.findFiles(join(projectRoot, 'src/app/api'), '.ts')
    for (const file of apiFiles) {
      const content = readFileSync(file, 'utf8')

      if (!content.includes('revalidate') && !content.includes('cache')) {
        findings.push({
          id: `api_cache_${Math.random().toString(36).substring(7)}`,
          category: 'performance',
          severity: 'low',
          title: 'Missing API Route Caching',
          description: 'API route lacks caching headers or revalidation',
          impact: 'Unnecessary repeated computations',
          effort: 'low',
          implementation_cost: 4,
          business_value: 30,
          technical_debt: 15,
          location: file.replace(projectRoot, ''),
          evidence: ['No caching configuration in API route'],
          recommendations: [
            'Add appropriate cache headers',
            'Implement ISR where applicable',
            'Use Next.js unstable_cache for expensive operations',
          ],
          dependencies: [],
          related_findings: [],
        })
      }
    }

    return findings
  }

  async auditBundleSize(projectRoot: string): Promise<AuditFinding[]> {
    const findings: AuditFinding[] = []

    // Check package.json for heavy dependencies
    const packageJsonPath = join(projectRoot, 'package.json')
    if (this.fileExists(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }

      const heavyPackages = ['lodash', 'moment', '@mui/material', 'antd', 'jquery']

      const foundHeavy = heavyPackages.filter((pkg) => dependencies[pkg])

      if (foundHeavy.length > 0) {
        findings.push({
          id: 'bundle_001',
          category: 'performance',
          severity: 'medium',
          title: 'Heavy Dependencies Detected',
          description: `Large packages that could impact bundle size: ${foundHeavy.join(', ')}`,
          impact: 'Slower initial page loads and higher bandwidth usage',
          effort: 'medium',
          implementation_cost: 20,
          business_value: 45,
          technical_debt: 30,
          location: 'package.json',
          evidence: foundHeavy.map((pkg) => `${pkg}: ${dependencies[pkg]}`),
          recommendations: [
            'Consider lighter alternatives (date-fns vs moment)',
            'Use tree-shaking and selective imports',
            'Implement code splitting for heavy components',
          ],
          dependencies: [],
          related_findings: [],
        })
      }
    }

    // Check for missing dynamic imports
    const pageFiles = this.findFiles(join(projectRoot, 'src/app'), '.tsx')
    for (const file of pageFiles) {
      const content = readFileSync(file, 'utf8')

      if (content.includes('import') && !content.includes('dynamic') && content.length > 5000) {
        findings.push({
          id: `dynamic_${Math.random().toString(36).substring(7)}`,
          category: 'performance',
          severity: 'low',
          title: 'Large Component Without Code Splitting',
          description: 'Large page component without dynamic imports',
          impact: 'Larger initial bundle size',
          effort: 'low',
          implementation_cost: 6,
          business_value: 35,
          technical_debt: 20,
          location: file.replace(projectRoot, ''),
          evidence: [`File size: ${content.length} characters`],
          recommendations: [
            'Use Next.js dynamic imports for heavy components',
            'Implement route-based code splitting',
            'Lazy load non-critical components',
          ],
          dependencies: [],
          related_findings: [],
        })
      }
    }

    return findings
  }

  private fileExists(path: string): boolean {
    try {
      return statSync(path).isFile()
    } catch {
      return false
    }
  }

  private findFiles(dir: string, ...extensions: string[]): string[] {
    const files: string[] = []

    try {
      const items = readdirSync(dir)

      for (const item of items) {
        const fullPath = join(dir, item)
        const stat = statSync(fullPath)

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          files.push(...this.findFiles(fullPath, ...extensions))
        } else if (stat.isFile() && extensions.some((ext) => item.endsWith(ext))) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      // Directory doesn't exist or permission denied
    }

    return files
  }
}

export class ArchitectureAuditor {
  async auditLayeredArchitecture(projectRoot: string): Promise<AuditFinding[]> {
    const findings: AuditFinding[] = []

    // Check for proper separation of concerns
    const srcStructure = this.analyzeFolderStructure(join(projectRoot, 'src'))

    const expectedFolders = ['components', 'lib', 'app', 'types', 'hooks']
    const missingFolders = expectedFolders.filter((folder) => !srcStructure.includes(folder))

    if (missingFolders.length > 0) {
      findings.push({
        id: 'arch_001',
        category: 'architecture',
        severity: 'medium',
        title: 'Incomplete Project Structure',
        description: `Missing standard folders: ${missingFolders.join(', ')}`,
        impact: 'Reduced code organization and maintainability',
        effort: 'low',
        implementation_cost: 8,
        business_value: 40,
        technical_debt: 25,
        location: 'src/',
        evidence: [`Current structure: ${srcStructure.join(', ')}`],
        recommendations: [
          'Create missing standard folders',
          'Organize code by feature or layer',
          'Add README files for each major directory',
        ],
        dependencies: [],
        related_findings: [],
      })
    }

    // Check for circular dependencies
    const circularDeps = await this.detectCircularDependencies(projectRoot)
    if (circularDeps.length > 0) {
      findings.push({
        id: 'arch_002',
        category: 'architecture',
        severity: 'high',
        title: 'Circular Dependencies',
        description: `${circularDeps.length} circular dependency chains detected`,
        impact: 'Can cause runtime errors, makes testing difficult',
        effort: 'high',
        implementation_cost: 40,
        business_value: 70,
        technical_debt: 60,
        location: 'Multiple files',
        evidence: circularDeps.map((dep) => `${dep.from} ↔ ${dep.to}`),
        recommendations: [
          'Refactor to break circular dependencies',
          'Use dependency injection patterns',
          'Create clear architectural layers',
        ],
        dependencies: [],
        related_findings: [],
      })
    }

    return findings
  }

  async auditAPIDesign(projectRoot: string): Promise<AuditFinding[]> {
    const findings: AuditFinding[] = []
    const apiFiles = this.findFiles(join(projectRoot, 'src/app/api'), '.ts')

    for (const file of apiFiles) {
      const content = readFileSync(file, 'utf8')

      // Check for proper error handling
      if (!content.includes('try') && !content.includes('catch')) {
        findings.push({
          id: `api_${Math.random().toString(36).substring(7)}`,
          category: 'architecture',
          severity: 'high',
          title: 'Missing Error Handling',
          description: 'API route lacks proper error handling',
          impact: 'Unhandled errors can crash the application',
          effort: 'low',
          implementation_cost: 6,
          business_value: 60,
          technical_debt: 20,
          location: file.replace(projectRoot, ''),
          evidence: ['No try/catch blocks found'],
          recommendations: [
            'Add comprehensive error handling',
            'Implement error logging',
            'Return consistent error responses',
          ],
          dependencies: [],
          related_findings: [],
        })
      }

      // Check for HTTP method validation
      const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
      const hasMethodCheck = httpMethods.some((method) =>
        content.includes(`request.method === '${method}'`)
      )

      if (!hasMethodCheck && !content.includes('NextRequest')) {
        findings.push({
          id: `method_${Math.random().toString(36).substring(7)}`,
          category: 'architecture',
          severity: 'medium',
          title: 'Missing HTTP Method Validation',
          description: 'API route doesnt validate HTTP methods',
          impact: 'Security risk and unexpected behavior',
          effort: 'low',
          implementation_cost: 4,
          business_value: 50,
          technical_debt: 15,
          location: file.replace(projectRoot, ''),
          evidence: ['No HTTP method validation found'],
          recommendations: [
            'Add HTTP method validation',
            'Return 405 for unsupported methods',
            'Use Next.js App Router patterns',
          ],
          dependencies: [],
          related_findings: [],
        })
      }
    }

    return findings
  }

  private analyzeFolderStructure(path: string): string[] {
    try {
      return readdirSync(path).filter((item) => {
        try {
          return statSync(join(path, item)).isDirectory()
        } catch {
          return false
        }
      })
    } catch {
      return []
    }
  }

  private async detectCircularDependencies(
    projectRoot: string
  ): Promise<Array<{ from: string; to: string }>> {
    // Simplified circular dependency detection
    const dependencies: Array<{ from: string; to: string }> = []
    const files = this.findFiles(join(projectRoot, 'src'), '.ts', '.tsx')

    for (const file of files) {
      const content = readFileSync(file, 'utf8')
      const imports = content.match(/import.*from\s+['"]([^'"]+)['"]/g) || []

      for (const imp of imports) {
        const match = imp.match(/from\s+['"]([^'"]+)['"]/)
        if ((match && match[1].startsWith('./')) || match?.[1].startsWith('../')) {
          // This would need more sophisticated analysis
          // For now, just placeholder data
        }
      }
    }

    return dependencies
  }

  private findFiles(dir: string, ...extensions: string[]): string[] {
    const files: string[] = []

    try {
      const items = readdirSync(dir)

      for (const item of items) {
        const fullPath = join(dir, item)
        try {
          const stat = statSync(fullPath)

          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            files.push(...this.findFiles(fullPath, ...extensions))
          } else if (stat.isFile() && extensions.some((ext) => item.endsWith(ext))) {
            files.push(fullPath)
          }
        } catch {
          // Skip files we can't read
        }
      }
    } catch (error) {
      // Directory doesn't exist or permission denied
    }

    return files
  }
}

export class BusinessLogicAuditor {
  async auditDataIntegrity(projectRoot: string): Promise<AuditFinding[]> {
    const findings: AuditFinding[] = []

    // Check Prisma schema for proper constraints
    const schemaPath = join(projectRoot, 'prisma/schema.prisma')
    if (this.fileExists(schemaPath)) {
      const schema = readFileSync(schemaPath, 'utf8')

      // Check for missing foreign key constraints
      const models = schema.match(/model\s+\w+\s*{[^}]+}/g) || []

      for (const model of models) {
        if (model.includes('Id') && !model.includes('@relation')) {
          findings.push({
            id: `fk_${Math.random().toString(36).substring(7)}`,
            category: 'business_logic',
            severity: 'medium',
            title: 'Missing Foreign Key Constraints',
            description: 'Database model has ID references without proper relations',
            impact: 'Data integrity issues and referential integrity violations',
            effort: 'medium',
            implementation_cost: 12,
            business_value: 70,
            technical_debt: 35,
            location: 'prisma/schema.prisma',
            evidence: ['Models with Id fields lacking @relation decorators'],
            recommendations: [
              'Add proper @relation decorators',
              'Implement cascading deletes where appropriate',
              'Add database constraints for data integrity',
            ],
            dependencies: [],
            related_findings: [],
          })
        }
      }
    }

    return findings
  }

  async auditBusinessRules(projectRoot: string): Promise<AuditFinding[]> {
    const findings: AuditFinding[] = []
    const businessLogicFiles = this.findFiles(join(projectRoot, 'src/lib'), '.ts')

    for (const file of businessLogicFiles) {
      const content = readFileSync(file, 'utf8')

      // Check for hardcoded business values
      const hardcodedValues = content.match(/\b\d+\.\d{2}\b/g) // Decimal values like prices
      if (hardcodedValues && hardcodedValues.length > 2) {
        findings.push({
          id: `biz_${Math.random().toString(36).substring(7)}`,
          category: 'business_logic',
          severity: 'medium',
          title: 'Hardcoded Business Values',
          description: 'Business logic contains hardcoded numeric values',
          impact: 'Difficult to maintain and update business rules',
          effort: 'medium',
          implementation_cost: 16,
          business_value: 55,
          technical_debt: 40,
          location: file.replace(projectRoot, ''),
          evidence: hardcodedValues,
          recommendations: [
            'Extract business rules to configuration',
            'Create business rules engine',
            'Use database-driven configuration',
          ],
          dependencies: [],
          related_findings: [],
        })
      }

      // Check for missing transaction handling
      if (
        content.includes('prisma') &&
        content.includes('create') &&
        !content.includes('$transaction')
      ) {
        findings.push({
          id: `tx_${Math.random().toString(36).substring(7)}`,
          category: 'business_logic',
          severity: 'high',
          title: 'Missing Transaction Handling',
          description: 'Database operations without proper transaction management',
          impact: 'Data consistency issues during failures',
          effort: 'medium',
          implementation_cost: 12,
          business_value: 75,
          technical_debt: 30,
          location: file.replace(projectRoot, ''),
          evidence: ['Database operations without $transaction'],
          recommendations: [
            'Wrap related operations in transactions',
            'Implement proper rollback handling',
            'Add transaction logging for debugging',
          ],
          dependencies: [],
          related_findings: [],
        })
      }
    }

    return findings
  }

  private fileExists(path: string): boolean {
    try {
      return statSync(path).isFile()
    } catch {
      return false
    }
  }

  private findFiles(dir: string, ...extensions: string[]): string[] {
    const files: string[] = []

    try {
      const items = readdirSync(dir)

      for (const item of items) {
        const fullPath = join(dir, item)
        try {
          const stat = statSync(fullPath)

          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            files.push(...this.findFiles(fullPath, ...extensions))
          } else if (stat.isFile() && extensions.some((ext) => item.endsWith(ext))) {
            files.push(fullPath)
          }
        } catch {
          // Skip files we can't read
        }
      }
    } catch (error) {
      // Directory doesn't exist or permission denied
    }

    return files
  }
}

// Export all auditor instances
export const securityAuditor = new SecurityAuditor()
export const performanceAuditor = new PerformanceAuditor()
export const architectureAuditor = new ArchitectureAuditor()
export const businessLogicAuditor = new BusinessLogicAuditor()
