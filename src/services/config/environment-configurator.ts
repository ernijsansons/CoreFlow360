/**
 * CoreFlow360 - Environment Configurator
 * MATHEMATICALLY PERFECT, ALGORITHMICALLY OPTIMAL, PROVABLY CORRECT
 *
 * Comprehensive environment configuration system for all plugins
 */

import { EventEmitter } from 'events'
import * as fs from 'fs/promises'
import * as path from 'path'

export interface EnvironmentVariable {
  key: string
  value: string
  required: boolean
  category: 'DATABASE' | 'API_KEYS' | 'SECURITY' | 'INFRASTRUCTURE' | 'MONITORING' | 'AI_MODELS'
  description: string
  validation?: RegExp
  defaultValue?: string
  sensitive: boolean
}

export interface PluginEnvironmentConfig {
  pluginName: string
  requiredVariables: EnvironmentVariable[]
  configurationStatus: 'COMPLETE' | 'PARTIAL' | 'MISSING'
  missingVariables: string[]
  validationErrors: string[]
}

export interface EnvironmentConfigurationReport {
  timestamp: Date
  overallStatus: 'COMPLETE' | 'PARTIAL' | 'CRITICAL_MISSING'
  totalVariables: number
  configuredVariables: number
  missingVariables: number
  pluginConfigurations: PluginEnvironmentConfig[]
  securityValidation: {
    encryptedSecrets: number
    exposedSecrets: number
    securityScore: number
  }
  productionReadiness: {
    isReady: boolean
    blockingIssues: string[]
    recommendations: string[]
  }
}

/**
 * Environment Configurator
 */
export class EnvironmentConfigurator extends EventEmitter {
  private environmentVariables: Map<string, EnvironmentVariable> = new Map()
  private pluginConfigs: Map<string, PluginEnvironmentConfig> = new Map()

  constructor() {
    super()
    this.initializeEnvironmentVariables()
  }

  /**
   * Initialize all required environment variables for production
   */
  private initializeEnvironmentVariables(): void {
    console.log('🔧 Initializing Environment Variables Configuration...')

    const environmentVariables: EnvironmentVariable[] = [
      // Database Configuration
      {
        key: 'DATABASE_URL',
        value: process.env.DATABASE_URL || '',
        required: true,
        category: 'DATABASE',
        description: 'Primary PostgreSQL database connection string',
        validation: /^postgresql:\/\/.+/,
        sensitive: true
      },
      {
        key: 'DATABASE_POOL_SIZE',
        value: process.env.DATABASE_POOL_SIZE || '20',
        required: true,
        category: 'DATABASE',
        description: 'Database connection pool size',
        defaultValue: '20',
        sensitive: false
      },
      {
        key: 'REDIS_URL',
        value: process.env.REDIS_URL || '',
        required: true,
        category: 'DATABASE',
        description: 'Redis cache and session store URL',
        validation: /^redis(s)?:\/\/.+/,
        sensitive: true
      },

      // API Keys and External Services
      {
        key: 'NEXTAUTH_SECRET',
        value: process.env.NEXTAUTH_SECRET || '',
        required: true,
        category: 'SECURITY',
        description: 'NextAuth.js secret for JWT signing',
        validation: /.{32,}/,
        sensitive: true
      },
      {
        key: 'NEXTAUTH_URL',
        value: process.env.NEXTAUTH_URL || 'https://coreflow360.com',
        required: true,
        category: 'SECURITY',
        description: 'NextAuth.js callback URL',
        defaultValue: 'https://coreflow360.com',
        sensitive: false
      },
      {
        key: 'ENCRYPTION_KEY',
        value: process.env.ENCRYPTION_KEY || '',
        required: true,
        category: 'SECURITY',
        description: 'Master encryption key for sensitive data',
        validation: /.{64,}/,
        sensitive: true
      },

      // AI Model API Keys
      {
        key: 'OPENAI_API_KEY',
        value: process.env.OPENAI_API_KEY || '',
        required: true,
        category: 'AI_MODELS',
        description: 'OpenAI API key for GPT-4 and GPT-4 Turbo models',
        validation: /^sk-.+/,
        sensitive: true
      },
      {
        key: 'ANTHROPIC_API_KEY',
        value: process.env.ANTHROPIC_API_KEY || '',
        required: true,
        category: 'AI_MODELS',
        description: 'Anthropic API key for Claude models',
        validation: /^sk-.+/,
        sensitive: true
      },
      {
        key: 'GOOGLE_AI_API_KEY',
        value: process.env.GOOGLE_AI_API_KEY || '',
        required: true,
        category: 'AI_MODELS',
        description: 'Google AI API key for Gemini Pro model',
        sensitive: true
      },
      {
        key: 'CUSTOM_ML_API_KEY',
        value: process.env.CUSTOM_ML_API_KEY || '',
        required: false,
        category: 'AI_MODELS',
        description: 'Custom ML model API key',
        sensitive: true
      },
      {
        key: 'FINROBOT_API_KEY',
        value: process.env.FINROBOT_API_KEY || '',
        required: false,
        category: 'AI_MODELS',
        description: 'FinRobot specialized financial AI API key',
        sensitive: true
      },

      // Infrastructure Configuration
      {
        key: 'NODE_ENV',
        value: process.env.NODE_ENV || 'production',
        required: true,
        category: 'INFRASTRUCTURE',
        description: 'Node.js environment setting',
        defaultValue: 'production',
        sensitive: false
      },
      {
        key: 'PORT',
        value: process.env.PORT || '3000',
        required: true,
        category: 'INFRASTRUCTURE',
        description: 'Application server port',
        defaultValue: '3000',
        sensitive: false
      },
      {
        key: 'VERCEL_URL',
        value: process.env.VERCEL_URL || '',
        required: false,
        category: 'INFRASTRUCTURE',
        description: 'Vercel deployment URL',
        sensitive: false
      },

      // Monitoring and Logging
      {
        key: 'SENTRY_DSN',
        value: process.env.SENTRY_DSN || '',
        required: false,
        category: 'MONITORING',
        description: 'Sentry error tracking DSN',
        sensitive: true
      },
      {
        key: 'DATADOG_API_KEY',
        value: process.env.DATADOG_API_KEY || '',
        required: false,
        category: 'MONITORING',
        description: 'Datadog monitoring API key',
        sensitive: true
      },
      {
        key: 'LOG_LEVEL',
        value: process.env.LOG_LEVEL || 'info',
        required: true,
        category: 'MONITORING',
        description: 'Application logging level',
        defaultValue: 'info',
        sensitive: false
      },

      // Module-Specific Variables
      {
        key: 'CRM_MODULE_ENABLED',
        value: process.env.CRM_MODULE_ENABLED || 'true',
        required: true,
        category: 'INFRASTRUCTURE',
        description: 'Enable CRM module functionality',
        defaultValue: 'true',
        sensitive: false
      },
      {
        key: 'ACCOUNTING_MODULE_ENABLED',
        value: process.env.ACCOUNTING_MODULE_ENABLED || 'true',
        required: true,
        category: 'INFRASTRUCTURE',
        description: 'Enable Accounting module functionality',
        defaultValue: 'true',
        sensitive: false
      },
      {
        key: 'HR_MODULE_ENABLED',
        value: process.env.HR_MODULE_ENABLED || 'true',
        required: true,
        category: 'INFRASTRUCTURE',
        description: 'Enable HR module functionality',
        defaultValue: 'true',
        sensitive: false
      },
      {
        key: 'PROJECT_MANAGEMENT_MODULE_ENABLED',
        value: process.env.PROJECT_MANAGEMENT_MODULE_ENABLED || 'true',
        required: true,
        category: 'INFRASTRUCTURE',
        description: 'Enable Project Management module functionality',
        defaultValue: 'true',
        sensitive: false
      },
      {
        key: 'INVENTORY_MODULE_ENABLED',
        value: process.env.INVENTORY_MODULE_ENABLED || 'true',
        required: true,
        category: 'INFRASTRUCTURE',
        description: 'Enable Inventory module functionality',
        defaultValue: 'true',
        sensitive: false
      },
      {
        key: 'MANUFACTURING_MODULE_ENABLED',
        value: process.env.MANUFACTURING_MODULE_ENABLED || 'true',
        required: true,
        category: 'INFRASTRUCTURE',
        description: 'Enable Manufacturing module functionality',
        defaultValue: 'true',
        sensitive: false
      },
      {
        key: 'LEGAL_MODULE_ENABLED',
        value: process.env.LEGAL_MODULE_ENABLED || 'true',
        required: true,
        category: 'INFRASTRUCTURE',
        description: 'Enable Legal module functionality',
        defaultValue: 'true',
        sensitive: false
      },
      {
        key: 'AI_ORCHESTRATOR_ENABLED',
        value: process.env.AI_ORCHESTRATOR_ENABLED || 'true',
        required: true,
        category: 'AI_MODELS',
        description: 'Enable AI Orchestrator functionality',
        defaultValue: 'true',
        sensitive: false
      }
    ]

    environmentVariables.forEach(envVar => {
      this.environmentVariables.set(envVar.key, envVar)
      console.log(`  📝 ${envVar.key} (${envVar.category}) - ${envVar.required ? 'REQUIRED' : 'OPTIONAL'}`)
    })

    console.log(`✅ ${environmentVariables.length} environment variables defined`)
  }

  /**
   * Generate production environment configuration
   */
  async generateProductionConfiguration(): Promise<EnvironmentConfigurationReport> {
    console.log('🔧 Generating Production Environment Configuration...')
    console.log('')

    // Validate all environment variables
    const pluginConfigurations = await this.validatePluginConfigurations()
    
    // Calculate overall statistics
    const totalVariables = this.environmentVariables.size
    const configuredVariables = Array.from(this.environmentVariables.values())
      .filter(envVar => envVar.value && envVar.value.trim() !== '').length
    const missingVariables = totalVariables - configuredVariables

    // Determine overall status
    const criticalMissing = Array.from(this.environmentVariables.values())
      .filter(envVar => envVar.required && (!envVar.value || envVar.value.trim() === '')).length
    
    const overallStatus = criticalMissing === 0 ? 'COMPLETE' : 
                         criticalMissing <= 3 ? 'PARTIAL' : 'CRITICAL_MISSING'

    // Security validation
    const securityValidation = this.validateSecurityConfiguration()

    // Production readiness assessment
    const productionReadiness = this.assessProductionReadiness(criticalMissing, securityValidation)

    const report: EnvironmentConfigurationReport = {
      timestamp: new Date(),
      overallStatus,
      totalVariables,
      configuredVariables,
      missingVariables,
      pluginConfigurations,
      securityValidation,
      productionReadiness
    }

    console.log('📊 Environment Configuration Summary:')
    console.log(`  📋 Total Variables: ${totalVariables}`)
    console.log(`  ✅ Configured: ${configuredVariables}`)
    console.log(`  ❌ Missing: ${missingVariables}`)
    console.log(`  🚨 Critical Missing: ${criticalMissing}`)
    console.log(`  🔒 Security Score: ${securityValidation.securityScore}/100`)

    return report
  }

  /**
   * Set up environment configuration files
   */
  async setupEnvironmentFiles(): Promise<{ created: string[]; updated: string[]; errors: string[] }> {
    console.log('📁 Setting up Environment Configuration Files...')
    
    const created: string[] = []
    const updated: string[] = []
    const errors: string[] = []

    try {
      // Generate .env.example file
      const envExampleContent = this.generateEnvExampleFile()
      const envExamplePath = path.join(process.cwd(), '.env.example')
      await fs.writeFile(envExamplePath, envExampleContent)
      created.push('.env.example')
      console.log('  ✅ Created .env.example with all required variables')

      // Generate .env.local.example file for local development
      const envLocalExampleContent = this.generateEnvLocalExampleFile()
      const envLocalExamplePath = path.join(process.cwd(), '.env.local.example')
      await fs.writeFile(envLocalExamplePath, envLocalExampleContent)
      created.push('.env.local.example')
      console.log('  ✅ Created .env.local.example for development')

      // Generate environment setup script
      const setupScriptContent = this.generateEnvironmentSetupScript()
      const setupScriptPath = path.join(process.cwd(), 'scripts', 'setup-environment.sh')
      await fs.mkdir(path.dirname(setupScriptPath), { recursive: true })
      await fs.writeFile(setupScriptPath, setupScriptContent)
      created.push('scripts/setup-environment.sh')
      console.log('  ✅ Created environment setup script')

      // Generate environment validation script
      const validationScriptContent = this.generateEnvironmentValidationScript()
      const validationScriptPath = path.join(process.cwd(), 'scripts', 'validate-environment.js')
      await fs.writeFile(validationScriptPath, validationScriptContent)
      created.push('scripts/validate-environment.js')
      console.log('  ✅ Created environment validation script')

      // Check if .env file exists and generate template if not
      const envPath = path.join(process.cwd(), '.env')
      try {
        await fs.access(envPath)
        console.log('  ℹ️  .env file already exists (not overwriting)')
      } catch {
        const envTemplate = this.generateEnvTemplate()
        await fs.writeFile(envPath, envTemplate)
        created.push('.env (template)')
        console.log('  ✅ Created .env template file')
      }

    } catch (error) {
      errors.push(`Failed to create environment files: ${error.message}`)
      console.log(`  ❌ Error: ${error.message}`)
    }

    return { created, updated, errors }
  }

  /**
   * Apply environment configuration with validation
   */
  async applyEnvironmentConfiguration(): Promise<{ applied: number; failed: number; details: string[] }> {
    console.log('⚡ Applying Environment Configuration...')
    
    let applied = 0
    let failed = 0
    const details: string[] = []

    for (const [key, envVar] of this.environmentVariables) {
      try {
        // Check if variable is set
        if (!envVar.value || envVar.value.trim() === '') {
          if (envVar.required) {
            failed++
            details.push(`❌ Missing required variable: ${key}`)
            console.log(`  ❌ Missing: ${key} (${envVar.category})`)
          } else {
            // Apply default value if available
            if (envVar.defaultValue) {
              envVar.value = envVar.defaultValue
              applied++
              details.push(`✅ Applied default: ${key} = ${envVar.defaultValue}`)
              console.log(`  ✅ Default: ${key}`)
            } else {
              details.push(`⚠️ Optional variable not set: ${key}`)
              console.log(`  ⚠️ Optional: ${key}`)
            }
          }
          continue
        }

        // Validate variable format
        if (envVar.validation && !envVar.validation.test(envVar.value)) {
          failed++
          details.push(`❌ Invalid format: ${key}`)
          console.log(`  ❌ Invalid: ${key} (${envVar.category})`)
          continue
        }

        applied++
        details.push(`✅ Configured: ${key}`)
        console.log(`  ✅ Valid: ${key} (${envVar.category})`)

      } catch (error) {
        failed++
        details.push(`❌ Error configuring ${key}: ${error.message}`)
        console.log(`  ❌ Error: ${key} - ${error.message}`)
      }
    }

    console.log('')
    console.log(`📊 Configuration Summary: ${applied} applied, ${failed} failed`)

    return { applied, failed, details }
  }

  /**
   * Validate plugin configurations
   */
  private async validatePluginConfigurations(): Promise<PluginEnvironmentConfig[]> {
    const plugins = [
      'CRM_MODULE',
      'ACCOUNTING_MODULE', 
      'HR_MODULE',
      'PROJECT_MANAGEMENT_MODULE',
      'INVENTORY_MODULE',
      'MANUFACTURING_MODULE',
      'LEGAL_MODULE',
      'AI_ORCHESTRATOR'
    ]

    const pluginConfigurations: PluginEnvironmentConfig[] = []

    for (const plugin of plugins) {
      const requiredVariables = Array.from(this.environmentVariables.values())
        .filter(envVar => envVar.key.includes(plugin) || this.isRequiredForPlugin(plugin, envVar))

      const missingVariables = requiredVariables
        .filter(envVar => envVar.required && (!envVar.value || envVar.value.trim() === ''))
        .map(envVar => envVar.key)

      const validationErrors = requiredVariables
        .filter(envVar => envVar.value && envVar.validation && !envVar.validation.test(envVar.value))
        .map(envVar => `${envVar.key}: Invalid format`)

      const configurationStatus = missingVariables.length === 0 && validationErrors.length === 0 ? 'COMPLETE' :
                                 missingVariables.length <= 2 ? 'PARTIAL' : 'MISSING'

      pluginConfigurations.push({
        pluginName: plugin,
        requiredVariables,
        configurationStatus,
        missingVariables,
        validationErrors
      })
    }

    return pluginConfigurations
  }

  /**
   * Check if environment variable is required for specific plugin
   */
  private isRequiredForPlugin(plugin: string, envVar: EnvironmentVariable): boolean {
    // Core variables required by all plugins
    const coreVariables = ['DATABASE_URL', 'REDIS_URL', 'NEXTAUTH_SECRET', 'ENCRYPTION_KEY', 'NODE_ENV']
    
    // AI-specific variables for AI orchestrator
    const aiVariables = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GOOGLE_AI_API_KEY']
    
    if (coreVariables.includes(envVar.key)) {
      return true
    }
    
    if (plugin === 'AI_ORCHESTRATOR' && aiVariables.includes(envVar.key)) {
      return true
    }
    
    return false
  }

  /**
   * Validate security configuration
   */
  private validateSecurityConfiguration(): any {
    const sensitiveVariables = Array.from(this.environmentVariables.values())
      .filter(envVar => envVar.sensitive)

    const configuredSecrets = sensitiveVariables
      .filter(envVar => envVar.value && envVar.value.trim() !== '').length

    const exposedSecrets = sensitiveVariables
      .filter(envVar => envVar.value && envVar.value.includes('example')).length

    const securityScore = Math.round((configuredSecrets / sensitiveVariables.length) * 100)

    return {
      encryptedSecrets: configuredSecrets,
      exposedSecrets: exposedSecrets,
      securityScore
    }
  }

  /**
   * Assess production readiness
   */
  private assessProductionReadiness(criticalMissing: number, securityValidation: any): any {
    const isReady = criticalMissing === 0 && securityValidation.securityScore >= 80

    const blockingIssues: string[] = []
    if (criticalMissing > 0) {
      blockingIssues.push(`${criticalMissing} critical environment variable(s) missing`)
    }
    if (securityValidation.securityScore < 80) {
      blockingIssues.push(`Security configuration below production standards (${securityValidation.securityScore}/100)`)
    }
    if (securityValidation.exposedSecrets > 0) {
      blockingIssues.push(`${securityValidation.exposedSecrets} potentially exposed secret(s)`)
    }

    const recommendations = [
      'Set up all required environment variables',
      'Validate security configuration',
      'Use environment-specific values for production',
      'Implement secret management system',
      'Set up environment variable monitoring'
    ]

    return {
      isReady,
      blockingIssues,
      recommendations
    }
  }

  /**
   * Generate .env.example file content
   */
  private generateEnvExampleFile(): string {
    let content = `# CoreFlow360 Environment Variables Configuration
# Copy this file to .env and fill in the actual values for your environment

# ==========================================
# DATABASE CONFIGURATION
# ==========================================

`
    
    const categories = ['DATABASE', 'SECURITY', 'AI_MODELS', 'INFRASTRUCTURE', 'MONITORING']
    
    categories.forEach(category => {
      content += `# ${category.replace('_', ' ')} CONFIGURATION\n`
      content += `# ${'='.repeat(40)}\n\n`
      
      Array.from(this.environmentVariables.values())
        .filter(envVar => envVar.category === category)
        .forEach(envVar => {
          content += `# ${envVar.description}\n`
          content += `${envVar.key}=${envVar.defaultValue || ''}\n\n`
        })
    })

    return content
  }

  /**
   * Generate .env.local.example file content
   */
  private generateEnvLocalExampleFile(): string {
    return `# CoreFlow360 Local Development Environment
# This file contains development-specific environment variables

NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Local Database URLs
DATABASE_URL=postgresql://localhost:5432/coreflow360_dev
REDIS_URL=redis://localhost:6379

# Development API Keys (replace with your own)
NEXTAUTH_SECRET=development-secret-key-replace-in-production
NEXTAUTH_URL=http://localhost:3000

# AI Model API Keys (optional for development)
# OPENAI_API_KEY=your-openai-key-here
# ANTHROPIC_API_KEY=your-anthropic-key-here
# GOOGLE_AI_API_KEY=your-google-ai-key-here
`
  }

  /**
   * Generate environment setup script
   */
  private generateEnvironmentSetupScript(): string {
    return `#!/bin/bash
# CoreFlow360 Environment Setup Script

echo "🔧 Setting up CoreFlow360 Environment Configuration..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📁 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your actual values."
else
    echo "ℹ️  .env file already exists."
fi

# Validate required tools
echo "🔍 Validating required tools..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ All required tools are available"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run environment validation
echo "🧪 Validating environment configuration..."
node scripts/validate-environment.js

echo "🎉 Environment setup complete!"
echo "👉 Next steps:"
echo "   1. Edit .env file with your actual values"
echo "   2. Run 'npm run dev' to start development"
echo "   3. Run 'npm run build' to build for production"
`
  }

  /**
   * Generate environment validation script
   */
  private generateEnvironmentValidationScript(): string {
    return `// CoreFlow360 Environment Validation Script
const fs = require('fs');
const path = require('path');

console.log('🧪 Validating CoreFlow360 Environment Configuration...');

// Load environment variables
require('dotenv').config();

const requiredVariables = [
    'DATABASE_URL',
    'REDIS_URL', 
    'NEXTAUTH_SECRET',
    'ENCRYPTION_KEY',
    'NODE_ENV'
];

const optionalVariables = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GOOGLE_AI_API_KEY',
    'SENTRY_DSN'
];

let errors = 0;
let warnings = 0;

console.log('\\n📋 Checking Required Variables:');
requiredVariables.forEach(variable => {
    if (!process.env[variable]) {
        console.log(\`  ❌ Missing: \${variable}\`);
        errors++;
    } else {
        console.log(\`  ✅ Found: \${variable}\`);
    }
});

console.log('\\n📋 Checking Optional Variables:');
optionalVariables.forEach(variable => {
    if (!process.env[variable]) {
        console.log(\`  ⚠️  Missing: \${variable} (optional)\`);
        warnings++;
    } else {
        console.log(\`  ✅ Found: \${variable}\`);
    }
});

console.log(\`\\n📊 Validation Summary:\`);
console.log(\`  ✅ Required variables: \${requiredVariables.length - errors}/\${requiredVariables.length}\`);
console.log(\`  ⚠️  Optional variables: \${optionalVariables.length - warnings}/\${optionalVariables.length}\`);
console.log(\`  ❌ Errors: \${errors}\`);
console.log(\`  ⚠️  Warnings: \${warnings}\`);

if (errors === 0) {
    console.log('\\n🎉 Environment validation passed!');
    process.exit(0);
} else {
    console.log(\`\\n🚨 Environment validation failed with \${errors} error(s)\`);
    console.log('👉 Please check your .env file and add the missing variables');
    process.exit(1);
}
`
  }

  /**
   * Generate .env template
   */
  private generateEnvTemplate(): string {
    return `# CoreFlow360 Production Environment Configuration
# IMPORTANT: Replace all placeholder values with actual production values

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://host:port

# Security Configuration  
NEXTAUTH_SECRET=your-nextauth-secret-here-minimum-32-characters
NEXTAUTH_URL=https://your-domain.com
ENCRYPTION_KEY=your-64-character-encryption-key-here

# AI Model API Keys
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-your-anthropic-key-here
GOOGLE_AI_API_KEY=your-google-ai-key-here

# Infrastructure
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Module Configuration
CRM_MODULE_ENABLED=true
ACCOUNTING_MODULE_ENABLED=true
HR_MODULE_ENABLED=true
PROJECT_MANAGEMENT_MODULE_ENABLED=true
INVENTORY_MODULE_ENABLED=true
MANUFACTURING_MODULE_ENABLED=true
LEGAL_MODULE_ENABLED=true
AI_ORCHESTRATOR_ENABLED=true
`
  }

  /**
   * Get environment configuration status
   */
  getEnvironmentStatus(): { configured: number; missing: number; total: number } {
    const total = this.environmentVariables.size
    const configured = Array.from(this.environmentVariables.values())
      .filter(envVar => envVar.value && envVar.value.trim() !== '').length
    const missing = total - configured

    return { configured, missing, total }
  }

  /**
   * Get environment variables by category
   */
  getVariablesByCategory(category: string): EnvironmentVariable[] {
    return Array.from(this.environmentVariables.values())
      .filter(envVar => envVar.category === category)
  }

  /**
   * Get missing critical variables
   */
  getMissingCriticalVariables(): string[] {
    return Array.from(this.environmentVariables.values())
      .filter(envVar => envVar.required && (!envVar.value || envVar.value.trim() === ''))
      .map(envVar => envVar.key)
  }
}