#!/usr/bin/env node
/**
 * CoreFlow360 V0.dev Deployment System
 * 
 * Secure script to deploy all 12 revolutionary website experiences to v0.dev
 * Uses API keys from thermonuclear-automation environment
 * 
 * Usage: node scripts/v0-deployment-system.js [options]
 */

import fs from 'fs/promises'
import path from 'path'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import chalk from 'chalk'
import ora from 'ora'

// Load environment variables from local .env files
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

class V0DeploymentSystem {
  constructor() {
    this.apiKey = process.env.V0_API_KEY
    this.baseUrl = 'https://api.v0.dev/v1'
    this.promptsDir = path.resolve('./v0-prompts')
    this.outputDir = path.resolve('./v0-generated')
    
    // Validate API key
    if (!this.apiKey) {
      console.error(chalk.red('❌ V0_API_KEY not found in environment variables'))
      console.log(chalk.yellow('💡 Make sure V0_API_KEY is set in .env.local file'))
      process.exit(1)
    }
    
    console.log(chalk.green('🔑 V0 API key loaded successfully'))
  }
  
  async initialize() {
    console.log(chalk.cyan('\n🚀 CoreFlow360 V0.dev Deployment System\n'))
    
    // Create output directory
    try {
      await fs.mkdir(this.outputDir, { recursive: true })
      console.log(chalk.green(`📁 Output directory created: ${this.outputDir}`))
    } catch (error) {
      console.error(chalk.red('❌ Failed to create output directory:', error.message))
      process.exit(1)
    }
    
    // Validate prompts directory
    try {
      const stats = await fs.stat(this.promptsDir)
      if (!stats.isDirectory()) {
        throw new Error('Prompts directory not found')
      }
      console.log(chalk.green(`📂 Prompts directory found: ${this.promptsDir}`))
    } catch (error) {
      console.error(chalk.red('❌ Prompts directory not accessible:', error.message))
      process.exit(1)
    }
  }
  
  async getPromptFiles() {
    try {
      const files = await fs.readdir(this.promptsDir)
      const promptFiles = files
        .filter(file => file.endsWith('.md'))
        .sort((a, b) => {
          // Sort by number prefix (01-, 02-, etc.)
          const aNum = parseInt(a.match(/^(\d+)/)?.[1] || '0')
          const bNum = parseInt(b.match(/^(\d+)/)?.[1] || '0')
          return aNum - bNum
        })
      
      console.log(chalk.blue(`\n📋 Found ${promptFiles.length} prompt files:`))
      promptFiles.forEach((file, i) => {
        console.log(chalk.gray(`  ${i + 1}. ${file}`))
      })
      
      return promptFiles
    } catch (error) {
      console.error(chalk.red('❌ Failed to read prompt files:', error.message))
      process.exit(1)
    }
  }
  
  async readPromptFile(filename) {
    try {
      const filePath = path.join(this.promptsDir, filename)
      const content = await fs.readFile(filePath, 'utf8')
      
      // Extract title and description from markdown
      const titleMatch = content.match(/^# (.+)$/m)
      const descMatch = content.match(/^Create (.+)$/m)
      
      const title = titleMatch?.[1] || filename.replace('.md', '')
      const description = descMatch?.[1] || 'Revolutionary CoreFlow360 experience'
      
      return {
        filename,
        title,
        description,
        content,
        size: content.length
      }
    } catch (error) {
      console.error(chalk.red(`❌ Failed to read ${filename}:`, error.message))
      return null
    }
  }
  
  async deployToV0(prompt, retryCount = 0) {
    const maxRetries = 2
    const spinner = ora(`Deploying ${prompt.title}...`).start()
    
    try {
      // Prepare the request payload for Claude API
      const payload = {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `You are an expert React/Next.js developer creating immersive 3D business components with Three.js and React Three Fiber. Generate complete, production-ready components based on this prompt:

${prompt.content}

Requirements:
- Use Next.js 15.4.5 with TypeScript
- Use Tailwind CSS for styling
- Include Three.js/React Three Fiber for 3D elements
- Make components business-friendly and professional
- Focus on efficiency and automation, not just "AI"
- Export as default component
- Include proper imports

Generate ONLY the React component code, no explanations.`
          }
        ]
      }
      
      // Use Claude API if available, fallback to V0.dev
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout
      
      const useClaudeAPI = process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('your_anthropic_api_key')
      
      if (useClaudeAPI) {
        var response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
            'User-Agent': 'CoreFlow360-Deploy/1.0'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        })
      } else {
        // Fallback to V0.dev API with OpenAI format
        const v0Payload = {
          model: 'v0-1.5-md',
          messages: [
            {
              role: 'system',
              content: 'You are an expert React/Next.js developer creating immersive 3D business components with Three.js and React Three Fiber. Generate complete, production-ready components that are business-friendly and professional.'
            },
            {
              role: 'user',
              content: prompt.content
            }
          ],
          max_completion_tokens: 4000
        }
        
        var response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'CoreFlow360-Deploy/1.0'
          },
          body: JSON.stringify(v0Payload),
          signal: controller.signal
        })
      }
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorData}`)
      }
      
      const result = await response.json()
      
      spinner.succeed(chalk.green(`✅ ${prompt.title} deployed successfully`))
      
      // Extract the generated code from Claude API response
      const generatedContent = result.content?.[0]?.text || result.choices?.[0]?.message?.content || result.content || ''
      
      if (!generatedContent) {
        throw new Error('No content received from API')
      }
      
      // Save the generated code
      const outputFile = path.join(
        this.outputDir, 
        prompt.filename.replace('.md', '.tsx')
      )
      
      await fs.writeFile(outputFile, generatedContent, 'utf8')
      
      console.log(chalk.gray(`   💾 Code saved to: ${outputFile}`))
      console.log(chalk.gray(`   🌐 V0 URL: ${result.url || 'N/A'}`))
      console.log(chalk.gray(`   📊 Tokens used: ${result.usage?.total_tokens || 'N/A'}`))
      
      return {
        ...result,
        prompt: prompt,
        outputFile,
        success: true
      }
      
    } catch (error) {
      spinner.fail(chalk.red(`❌ Failed to deploy ${prompt.title} (attempt ${retryCount + 1})`))
      console.error(chalk.red(`   Error: ${error.message}`))
      
      // Retry logic
      if (retryCount < maxRetries && !error.message.includes('401') && !error.message.includes('403')) {
        console.log(chalk.yellow(`   🔄 Retrying in 3 seconds... (${retryCount + 1}/${maxRetries})`))
        await new Promise(resolve => setTimeout(resolve, 3000))
        return this.deployToV0(prompt, retryCount + 1)
      }
      
      return {
        prompt: prompt,
        error: error.message,
        success: false,
        retries: retryCount
      }
    }
  }
  
  async deployAll(options = {}) {
    const { batchSize = 3, delay = 2000, dryRun = false } = options
    
    console.log(chalk.yellow(`\n⚡ Deployment Settings:`))
    console.log(chalk.gray(`   Batch size: ${batchSize} prompts`))
    console.log(chalk.gray(`   Delay between batches: ${delay}ms`))
    console.log(chalk.gray(`   Dry run: ${dryRun ? 'Yes' : 'No'}`))
    
    const promptFiles = await this.getPromptFiles()
    const results = []
    
    // Process prompts in batches to avoid rate limiting
    for (let i = 0; i < promptFiles.length; i += batchSize) {
      const batch = promptFiles.slice(i, i + batchSize)
      
      console.log(chalk.cyan(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}...`))
      
      // Read all prompts in current batch
      const prompts = []
      for (const filename of batch) {
        const prompt = await this.readPromptFile(filename)
        if (prompt) prompts.push(prompt)
      }
      
      if (dryRun) {
        // Dry run - just validate prompts
        prompts.forEach(prompt => {
          console.log(chalk.blue(`   📝 Would deploy: ${prompt.title} (${prompt.size} chars)`))
        })
      } else {
        // Actually deploy to v0.dev
        const batchResults = await Promise.all(
          prompts.map(prompt => this.deployToV0(prompt))
        )
        results.push(...batchResults)
      }
      
      // Delay between batches (except for last batch)
      if (i + batchSize < promptFiles.length) {
        console.log(chalk.gray(`   ⏸️  Waiting ${delay}ms before next batch...`))
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    return results
  }
  
  async generateDeploymentReport(results) {
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    
    console.log(chalk.cyan('\n📊 Deployment Report:'))
    console.log(chalk.green(`   ✅ Successful: ${successful.length}`))
    console.log(chalk.red(`   ❌ Failed: ${failed.length}`))
    console.log(chalk.blue(`   📈 Success Rate: ${((successful.length / results.length) * 100).toFixed(1)}%`))
    
    if (successful.length > 0) {
      console.log(chalk.green('\n🎉 Successfully Deployed:'))
      successful.forEach((result, i) => {
        console.log(chalk.green(`   ${i + 1}. ${result.prompt.title}`))
        if (result.url) {
          console.log(chalk.gray(`      🌐 ${result.url}`))
        }
      })
    }
    
    if (failed.length > 0) {
      console.log(chalk.red('\n💥 Failed Deployments:'))
      failed.forEach((result, i) => {
        console.log(chalk.red(`   ${i + 1}. ${result.prompt.title}`))
        console.log(chalk.red(`      Error: ${result.error}`))
      })
    }
    
    // Generate detailed report file
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        successRate: (successful.length / results.length) * 100
      },
      results: results.map(r => ({
        title: r.prompt.title,
        filename: r.prompt.filename,
        success: r.success,
        url: r.url || null,
        error: r.error || null,
        tokens: r.usage?.total_tokens || null
      }))
    }
    
    const reportFile = path.join(this.outputDir, 'deployment-report.json')
    await fs.writeFile(reportFile, JSON.stringify(reportData, null, 2), 'utf8')
    
    console.log(chalk.blue(`\n📄 Detailed report saved: ${reportFile}`))
    
    return reportData
  }
  
  async validateEnvironment() {
    console.log(chalk.yellow('\n🔍 Environment Validation:'))
    
    // Check API key format
    if (this.apiKey.startsWith('v1:') && this.apiKey.length > 20) {
      console.log(chalk.green('   ✅ API key format valid'))
    } else {
      console.log(chalk.red('   ❌ API key format invalid'))
      return false
    }
    
    // Test Claude API connectivity
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'User-Agent': 'CoreFlow360-Deploy/1.0'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }]
        })
      })
      
      if (response.ok) {
        console.log(chalk.green('   ✅ Claude API connectivity confirmed'))
        return true
      } else {
        console.log(chalk.red(`   ❌ Claude API error: ${response.status}`))
        return false
      }
    } catch (error) {
      console.log(chalk.red(`   ❌ Claude API unreachable: ${error.message}`))
      return false
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const options = {
    dryRun: args.includes('--dry-run'),
    validate: args.includes('--validate'),
    batchSize: parseInt(args.find(arg => arg.startsWith('--batch='))?.split('=')[1]) || 3,
    delay: parseInt(args.find(arg => arg.startsWith('--delay='))?.split('=')[1]) || 2000
  }
  
  const deployer = new V0DeploymentSystem()
  
  try {
    await deployer.initialize()
    
    if (options.validate) {
      const isValid = await deployer.validateEnvironment()
      if (!isValid) {
        console.log(chalk.red('\n❌ Environment validation failed'))
        process.exit(1)
      }
      console.log(chalk.green('\n✅ Environment validation passed'))
      return
    }
    
    const results = await deployer.deployAll(options)
    
    if (!options.dryRun) {
      await deployer.generateDeploymentReport(results)
      
      const successful = results.filter(r => r.success).length
      const total = results.length
      
      if (successful === total) {
        console.log(chalk.green.bold('\n🎊 All deployments successful! CoreFlow360 is ready to revolutionize business consciousness.'))
      } else {
        console.log(chalk.yellow.bold(`\n⚠️  ${successful}/${total} deployments successful. Review failed items above.`))
      }
    } else {
      console.log(chalk.blue.bold('\n✅ Dry run completed. Use without --dry-run to deploy.'))
    }
    
  } catch (error) {
    console.error(chalk.red.bold('\n💥 Deployment system error:'), error.message)
    process.exit(1)
  }
}

// Usage help
function showHelp() {
  console.log(chalk.cyan(`
CoreFlow360 V0.dev Deployment System

USAGE:
  node scripts/v0-deployment-system.js [options]

OPTIONS:
  --dry-run           Preview deployments without executing
  --validate          Test environment and API connectivity
  --batch=N           Deploy N prompts at once (default: 3)
  --delay=MS          Wait MS milliseconds between batches (default: 2000)
  --help              Show this help message

EXAMPLES:
  node scripts/v0-deployment-system.js --validate
  node scripts/v0-deployment-system.js --dry-run
  node scripts/v0-deployment-system.js --batch=2 --delay=3000
  node scripts/v0-deployment-system.js

ENVIRONMENT:
  Requires V0_API_KEY in thermonuclear-automation/.env file
  
SECURITY:
  - API keys are never logged or stored in output files
  - All requests use HTTPS with proper authentication
  - Rate limiting prevents API abuse
  `))
}

// Handle CLI arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp()
} else {
  main().catch(error => {
    console.error(chalk.red.bold('Fatal error:'), error)
    process.exit(1)
  })
}

export default V0DeploymentSystem