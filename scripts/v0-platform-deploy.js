#!/usr/bin/env node
/**
 * CoreFlow360 V0 Platform API Deployment Script
 * 
 * Uses the correct v0 Platform API to deploy consciousness experiences
 * Follows the proper flow: Create Chat → Send Message → Get Code → Deploy
 */

import fs from 'fs/promises'
import path from 'path'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import chalk from 'chalk'
import ora from 'ora'

// Load environment variables
dotenv.config({ path: '.env.local' })

class V0PlatformDeployer {
  constructor() {
    this.apiKey = process.env.V0_API_KEY
    this.baseUrl = 'https://api.v0.dev/v1'
    this.promptsDir = path.resolve('./v0-prompts')
    this.outputDir = path.resolve('./v0-generated')
    
    if (!this.apiKey) {
      console.error(chalk.red('❌ V0_API_KEY not found in .env.local'))
      process.exit(1)
    }
    
    console.log(chalk.green('🔑 V0 API key loaded successfully'))
  }

  async initialize() {
    console.log(chalk.cyan('\n🚀 CoreFlow360 V0 Platform Deployment System\n'))
    
    // Create output directory
    await fs.mkdir(this.outputDir, { recursive: true })
    console.log(chalk.green(`📁 Output directory ready: ${this.outputDir}`))
  }

  async createChat(prompt) {
    const spinner = ora(`Creating chat for ${prompt.title}...`).start()
    
    try {
      const response = await fetch(`${this.baseUrl}/chats`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: prompt.optimizedContent,
          modelConfiguration: {
            modelId: 'v0-1.5-lg', // Use largest model for best quality
            imageGenerations: true,
            thinking: true
          }
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`HTTP ${response.status}: ${error}`)
      }

      const result = await response.json()
      spinner.succeed(chalk.green(`✅ Chat created: ${result.id}`))
      
      return result
    } catch (error) {
      spinner.fail(chalk.red(`❌ Failed to create chat: ${error.message}`))
      throw error
    }
  }

  async waitForChatCompletion(chatId, maxAttempts = 60) {
    const spinner = ora('Waiting for code generation...').start()
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`${this.baseUrl}/chats/${chatId}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const chat = await response.json()
        
        // Check if chat has completed (has messages with code)
        if (chat.messages && chat.messages.length > 1) {
          const lastMessage = chat.messages[chat.messages.length - 1]
          if (lastMessage.role === 'assistant' && lastMessage.content) {
            spinner.succeed(chalk.green('✅ Code generation complete'))
            return chat
          }
        }

        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, 2000))
        spinner.text = `Waiting for code generation... (${i + 1}/${maxAttempts})`
      } catch (error) {
        // Continue waiting
      }
    }

    spinner.fail(chalk.red('❌ Timeout waiting for code generation'))
    throw new Error('Code generation timeout')
  }

  async extractCodeFromChat(chat) {
    // Find the assistant's message with code
    const codeMessage = chat.messages?.find(
      msg => msg.role === 'assistant' && msg.content
    )

    if (!codeMessage) {
      throw new Error('No code found in chat response')
    }

    // Extract code blocks from markdown
    const codeMatch = codeMessage.content.match(/```(?:tsx?|jsx?|javascript|typescript)?\n([\s\S]+?)```/g)
    
    if (!codeMatch) {
      // If no code blocks, assume entire content is code
      return codeMessage.content
    }

    // Combine all code blocks
    const code = codeMatch
      .map(block => block.replace(/```(?:tsx?|jsx?|javascript|typescript)?\n/, '').replace(/```$/, ''))
      .join('\n\n')

    return code
  }

  async createProject(chatId, title) {
    const spinner = ora('Creating project...').start()
    
    try {
      const response = await fetch(`${this.baseUrl}/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: title,
          chatId: chatId
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`HTTP ${response.status}: ${error}`)
      }

      const project = await response.json()
      spinner.succeed(chalk.green(`✅ Project created: ${project.id}`))
      return project
    } catch (error) {
      spinner.fail(chalk.red(`❌ Failed to create project: ${error.message}`))
      return null
    }
  }

  async deployProject(projectId, chatId) {
    const spinner = ora('Deploying to Vercel...').start()
    
    try {
      const response = await fetch(`${this.baseUrl}/deployments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: projectId,
          chatId: chatId
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`HTTP ${response.status}: ${error}`)
      }

      const deployment = await response.json()
      spinner.succeed(chalk.green(`✅ Deployed successfully`))
      return deployment
    } catch (error) {
      spinner.fail(chalk.red(`❌ Deployment failed: ${error.message}`))
      return null
    }
  }

  async deployPrompt(promptData) {
    console.log(chalk.cyan(`\n📦 Deploying: ${promptData.title}`))
    
    try {
      // Step 1: Create chat
      const chat = await this.createChat(promptData)
      
      // Step 2: Wait for code generation
      const completedChat = await this.waitForChatCompletion(chat.id)
      
      // Step 3: Extract code
      const code = await this.extractCodeFromChat(completedChat)
      
      // Step 4: Save code locally
      const outputFile = path.join(
        this.outputDir,
        promptData.filename.replace('.md', '.tsx')
      )
      await fs.writeFile(outputFile, code, 'utf8')
      console.log(chalk.gray(`   💾 Code saved to: ${outputFile}`))
      
      // Step 5: Create project (optional)
      let project = null
      if (process.env.DEPLOY_TO_VERCEL === 'true') {
        project = await this.createProject(chat.id, promptData.title)
        
        // Step 6: Deploy project
        if (project) {
          const deployment = await this.deployProject(project.id, chat.id)
          if (deployment) {
            console.log(chalk.gray(`   🌐 Deployed to: ${deployment.webUrl}`))
          }
        }
      }
      
      return {
        success: true,
        chatId: chat.id,
        chatUrl: chat.webUrl,
        projectId: project?.id,
        outputFile,
        codeLength: code.length
      }
      
    } catch (error) {
      console.error(chalk.red(`   ❌ Error: ${error.message}`))
      return {
        success: false,
        error: error.message
      }
    }
  }

  async optimizePrompt(content, title) {
    // Create optimized prompt for v0.dev
    return `Create a revolutionary, immersive React component for CoreFlow360's consciousness experience.

${title}

${content}

Technical Requirements:
- Next.js 15.4.5 with TypeScript
- Tailwind CSS with dark theme
- Framer Motion for animations
- React Three Fiber for 3D effects (if needed)
- Fully responsive design
- Accessibility compliant (WCAG 2.1 AA)

Visual Requirements:
- Dark futuristic theme with neural/consciousness aesthetics
- Gradient colors: violet-600, cyan-600, emerald-600
- Glassmorphism effects
- Smooth 60fps animations
- Particle effects and visual flourishes

Component Requirements:
- Export as default function component
- Include all necessary imports
- Add loading states and error boundaries
- TypeScript with proper types (no any)
- Performance optimized with React.memo where appropriate

Generate ONLY the complete component code, no explanations.`
  }

  async processPrompts() {
    const promptFiles = await fs.readdir(this.promptsDir)
    const mdFiles = promptFiles
      .filter(f => f.endsWith('.md'))
      .sort((a, b) => {
        const aNum = parseInt(a.match(/^(\d+)/)?.[1] || '0')
        const bNum = parseInt(b.match(/^(\d+)/)?.[1] || '0')
        return aNum - bNum
      })

    console.log(chalk.blue(`\n📋 Found ${mdFiles.length} prompts to deploy\n`))

    const results = []
    
    for (const [index, filename] of mdFiles.entries()) {
      const filePath = path.join(this.promptsDir, filename)
      const content = await fs.readFile(filePath, 'utf8')
      
      // Extract title
      const titleMatch = content.match(/^# (.+)$/m)
      const title = titleMatch?.[1] || filename.replace('.md', '')
      
      // Optimize prompt for v0
      const optimizedContent = await this.optimizePrompt(content, title)
      
      const promptData = {
        filename,
        title,
        content,
        optimizedContent
      }
      
      // Deploy with rate limiting
      const result = await this.deployPrompt(promptData)
      results.push({ ...result, filename, title })
      
      // Add delay between deployments to avoid rate limiting
      if (index < mdFiles.length - 1) {
        console.log(chalk.gray('   ⏸️  Waiting 5 seconds before next deployment...'))
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }

    return results
  }

  async generateReport(results) {
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    
    console.log(chalk.cyan('\n📊 Deployment Report:'))
    console.log(chalk.green(`   ✅ Successful: ${successful.length}`))
    console.log(chalk.red(`   ❌ Failed: ${failed.length}`))
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length
      },
      deployments: results.map(r => ({
        title: r.title,
        filename: r.filename,
        success: r.success,
        chatId: r.chatId,
        chatUrl: r.chatUrl,
        outputFile: r.outputFile,
        error: r.error
      }))
    }
    
    const reportPath = path.join(this.outputDir, 'v0-deployment-report.json')
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    
    console.log(chalk.blue(`\n📄 Report saved to: ${reportPath}`))
    
    if (successful.length > 0) {
      console.log(chalk.green('\n🎉 Successfully deployed components:'))
      successful.forEach((r, i) => {
        console.log(chalk.green(`   ${i + 1}. ${r.title}`))
        console.log(chalk.gray(`      📁 ${r.outputFile}`))
        console.log(chalk.gray(`      💬 ${r.chatUrl}`))
      })
    }
  }

  async testSinglePrompt() {
    // Test with consciousness-ui-components.md first
    const testFile = 'consciousness-ui-components.md'
    const filePath = path.join(this.promptsDir, testFile)
    
    try {
      const content = await fs.readFile(filePath, 'utf8')
      const title = 'V0.dev Consciousness-Aware UI Generation'
      const optimizedContent = await this.optimizePrompt(content, title)
      
      const result = await this.deployPrompt({
        filename: testFile,
        title,
        content,
        optimizedContent
      })
      
      if (result.success) {
        console.log(chalk.green('\n✅ Test deployment successful!'))
        console.log(chalk.green('   Proceeding with full deployment...'))
        return true
      } else {
        console.log(chalk.red('\n❌ Test deployment failed'))
        console.log(chalk.red(`   Error: ${result.error}`))
        return false
      }
    } catch (error) {
      console.error(chalk.red(`❌ Test failed: ${error.message}`))
      return false
    }
  }
}

// Main execution
async function main() {
  const deployer = new V0PlatformDeployer()
  
  try {
    await deployer.initialize()
    
    // Test with single prompt first
    console.log(chalk.yellow('\n🧪 Testing deployment with single prompt...\n'))
    const testSuccess = await deployer.testSinglePrompt()
    
    if (!testSuccess) {
      console.log(chalk.red('\n❌ Test failed. Please check your API key and try again.'))
      process.exit(1)
    }
    
    // If test succeeds, ask to continue
    console.log(chalk.yellow('\n🤔 Continue with full deployment of all 12 experiences? (y/n)'))
    
    // For automated deployment, continue automatically
    if (process.argv.includes('--auto')) {
      console.log(chalk.green('   Auto mode enabled, continuing...'))
      const results = await deployer.processPrompts()
      await deployer.generateReport(results)
    } else {
      console.log(chalk.blue('\n💡 Run with --auto flag to deploy all prompts automatically'))
    }
    
  } catch (error) {
    console.error(chalk.red('\n💥 Fatal error:'), error)
    process.exit(1)
  }
}

// Run if called directly
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  main()
}

export default V0PlatformDeployer