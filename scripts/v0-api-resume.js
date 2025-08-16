#!/usr/bin/env node
/**
 * V0.dev API Resume Script
 * Continues generating the remaining consciousness experiences
 */

import fs from 'fs/promises'
import path from 'path'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import chalk from 'chalk'
import ora from 'ora'

// Load environment
dotenv.config({ path: '.env.local' })

class V0ResumeDeployment {
  constructor() {
    this.apiKey = process.env.V0_API_KEY
    this.baseUrl = 'https://api.v0.dev/v1'
    this.outputDir = path.resolve('./v0-deployed')
    
    if (!this.apiKey) {
      console.error(chalk.red('❌ V0_API_KEY not found'))
      process.exit(1)
    }
  }

  async checkExistingFiles() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true })
      const files = await fs.readdir(this.outputDir)
      return files.filter(f => f.endsWith('.tsx'))
    } catch {
      return []
    }
  }

  async generateCode(prompt, title) {
    const spinner = ora(`Generating ${title}...`).start()
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'v0',
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.1,
          max_tokens: 8000
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`HTTP ${response.status}: ${error}`)
      }

      const result = await response.json()
      
      // Extract code from response
      let code = ''
      if (result.choices?.[0]?.message?.content) {
        code = result.choices[0].message.content
      } else if (result.content) {
        code = result.content
      }

      // Clean up the response
      code = code.replace(/<Thinking>[\s\S]*?<\/Thinking>/g, '')
      code = code.replace(/<CodeProject[\s\S]*?>[\s\S]*?```tsx[\s\S]*?([\s\S]*?)```[\s\S]*?<\/CodeProject>/g, '$1')
      
      if (code.includes('```tsx')) {
        const match = code.match(/```tsx\s*([\s\S]*?)```/);
        if (match) {
          code = match[1];
        }
      }

      spinner.succeed(chalk.green(`✅ Generated ${title}`))
      return code.trim()
      
    } catch (error) {
      spinner.fail(chalk.red(`❌ Failed: ${error.message}`))
      throw error
    }
  }

  async deployExperience(filename, title, content) {
    console.log(chalk.cyan(`\n🎯 Deploying: ${title}`))
    
    const v0Prompt = `Create a stunning, immersive React component for: ${title}

${content}

REQUIREMENTS:
- Next.js 15.4.5 with TypeScript
- Tailwind CSS for styling  
- Framer Motion for animations
- React Three Fiber for 3D (if needed)
- Dark theme with gradients (violet-600, cyan-600, emerald-600)
- Glassmorphism effects
- Professional business-focused design
- Full TypeScript types (no any)
- Export default function component

Generate ONLY the complete TSX component code with all imports. No explanations.`

    try {
      const code = await this.generateCode(v0Prompt, title)
      
      const outputPath = path.join(this.outputDir, filename.replace('.md', '.tsx'))
      await fs.writeFile(outputPath, code, 'utf8')
      
      console.log(chalk.gray(`   💾 Saved to: ${outputPath}`))
      console.log(chalk.gray(`   📏 Size: ${code.length} characters`))
      
      return { success: true, path: outputPath, size: code.length }
      
    } catch (error) {
      console.error(chalk.red(`   ❌ Error: ${error.message}`))
      return { success: false, error: error.message }
    }
  }

  async resumeDeployment() {
    // All prompts in order
    const allPrompts = [
      { file: 'consciousness-ui-components.md', title: 'Consciousness UI Components' },
      { file: '01-consciousness-awakening.md', title: 'The Arrival: Consciousness Birth' },
      { file: '02-revelation-business-sleeping.md', title: 'The Revelation: Business Sleeping' },
      { file: '03-mirror-current-vs-future.md', title: 'The Mirror: Current vs Future' },
      { file: '04-oracle-department-intelligence.md', title: 'The Oracle: Department Intelligence' },
      { file: '05-multiplication-chamber.md', title: 'The Multiplication Chamber' },
      { file: '06-competition-graveyard.md', title: 'The Graveyard: Failed Software' },
      { file: '07-intelligence-factory.md', title: 'The Factory: Intelligence Manufacturing' },
      { file: '08-roi-singularity.md', title: 'The ROI Singularity' },
      { file: '09-time-machine.md', title: 'The Time Machine: Future Preview' },
      { file: '10-neural-command-center.md', title: 'The Neural Command Center' },
      { file: '11-dream-versus-reality.md', title: 'Dream vs Reality: Split World' },
      { file: '12-commitment-threshold.md', title: 'The Commitment Threshold' },
      { file: '13-seo-business-solutions.md', title: 'SEO Business Solutions' }
    ]

    console.log(chalk.cyan('\n🚀 V0.dev Resume Deployment\n'))
    
    // Check existing files
    const existingFiles = await this.checkExistingFiles()
    console.log(chalk.blue(`📁 Found ${existingFiles.length} existing files\n`))
    
    // Filter out already generated
    const remaining = allPrompts.filter(p => 
      !existingFiles.includes(p.file.replace('.md', '.tsx'))
    )
    
    console.log(chalk.yellow(`📋 ${remaining.length} files remaining to generate\n`))
    
    if (remaining.length === 0) {
      console.log(chalk.green('✅ All files already generated!'))
      return
    }
    
    const results = []
    
    // Process in batches of 3
    const batchSize = 3
    for (let i = 0; i < remaining.length; i += batchSize) {
      const batch = remaining.slice(i, i + batchSize)
      console.log(chalk.cyan(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(remaining.length/batchSize)}\n`))
      
      for (const prompt of batch) {
        try {
          const promptPath = path.join('./v0-prompts', prompt.file)
          const content = await fs.readFile(promptPath, 'utf8')
          
          const result = await this.deployExperience(
            prompt.file,
            prompt.title,
            content
          )
          
          results.push({ ...prompt, ...result })
          
          // Rate limiting within batch
          if (batch.indexOf(prompt) < batch.length - 1) {
            console.log(chalk.gray('   ⏸  Waiting 3 seconds...'))
            await new Promise(resolve => setTimeout(resolve, 3000))
          }
          
        } catch (error) {
          results.push({ 
            ...prompt, 
            success: false, 
            error: error.message 
          })
        }
      }
      
      // Longer wait between batches
      if (i + batchSize < remaining.length) {
        console.log(chalk.gray('\n⏸  Waiting 5 seconds before next batch...'))
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }
    
    // Summary
    const successful = results.filter(r => r.success).length
    console.log(chalk.cyan('\n📊 Deployment Summary:'))
    console.log(chalk.green(`   ✅ Successful: ${successful}/${results.length}`))
    
    // Check total completion
    const finalFiles = await this.checkExistingFiles()
    console.log(chalk.blue(`\n📁 Total files generated: ${finalFiles.length}/13`))
    
    if (finalFiles.length === 13) {
      console.log(chalk.green.bold('\n🎉 All 13 consciousness experiences deployed!'))
      await this.createIndexFile()
    } else {
      console.log(chalk.yellow('\n⚠️  Some files still missing. Run again to complete.'))
    }
  }

  async createIndexFile() {
    const indexContent = `// CoreFlow360 Consciousness Experiences
// Generated by v0.dev API

export const consciousnessExperiences = [
  {
    id: 'consciousness-ui-components',
    title: 'Living Business Intelligence Constellation',
    description: 'Interactive 3D visualization of your business metrics',
    component: () => import('./consciousness-ui-components.tsx')
  },
  {
    id: '01-consciousness-awakening',
    title: 'The Arrival',
    subtitle: 'Consciousness Birth Experience',
    description: 'Witness the birth of your business intelligence',
    component: () => import('./01-consciousness-awakening.tsx')
  },
  {
    id: '02-revelation-business-sleeping',
    title: 'The Revelation',
    subtitle: 'Your Business Sleeping',
    description: 'Discover the hidden potential in your operations',
    component: () => import('./02-revelation-business-sleeping.tsx')
  },
  {
    id: '03-mirror-current-vs-future',
    title: 'The Mirror',
    subtitle: 'Current vs. Future You',
    description: 'See your business transformation in split reality',
    component: () => import('./03-mirror-current-vs-future.tsx')
  },
  {
    id: '04-oracle-department-intelligence',
    title: 'The Oracle',
    subtitle: 'Department Intelligence',
    description: 'Connect with AI agents for every department',
    component: () => import('./04-oracle-department-intelligence.tsx')
  },
  {
    id: '05-multiplication-chamber',
    title: 'The Multiplication Chamber',
    subtitle: 'Intelligence Exponential Growth',
    description: 'Experience exponential intelligence multiplication',
    component: () => import('./05-multiplication-chamber.tsx')
  },
  {
    id: '06-competition-graveyard',
    title: 'The Graveyard',
    subtitle: 'Failed Software Cemetery',
    description: 'Walk through the cemetery of outdated software',
    component: () => import('./06-competition-graveyard.tsx')
  },
  {
    id: '07-intelligence-factory',
    title: 'The Factory',
    subtitle: 'Intelligence Manufacturing',
    description: 'See how CoreFlow360 manufactures intelligence',
    component: () => import('./07-intelligence-factory.tsx')
  },
  {
    id: '08-roi-singularity',
    title: 'The ROI Singularity',
    subtitle: 'Return on Investment Visualization',
    description: 'Watch your ROI reach escape velocity',
    component: () => import('./08-roi-singularity.tsx')
  },
  {
    id: '09-time-machine',
    title: 'The Time Machine',
    subtitle: 'Future Business Preview',
    description: 'Travel to see your business in the future',
    component: () => import('./09-time-machine.tsx')
  },
  {
    id: '10-neural-command-center',
    title: 'The Neural Command Center',
    subtitle: 'Business Brain Interface',
    description: 'Control your entire business from one interface',
    component: () => import('./10-neural-command-center.tsx')
  },
  {
    id: '11-dream-versus-reality',
    title: 'Dream vs Reality',
    subtitle: 'Split-World Experience',
    description: 'Experience the gap between dreams and reality',
    component: () => import('./11-dream-versus-reality.tsx')
  },
  {
    id: '12-commitment-threshold',
    title: 'The Commitment Threshold',
    subtitle: 'Decision Portal Experience',
    description: 'Cross the threshold into transformation',
    component: () => import('./12-commitment-threshold.tsx')
  },
  {
    id: '13-seo-business-solutions',
    title: 'SEO Business Solutions',
    subtitle: 'Visibility Consciousness',
    description: 'Unlock your business visibility potential',
    component: () => import('./13-seo-business-solutions.tsx')
  }
]

export default consciousnessExperiences`

    const indexPath = path.join(this.outputDir, 'index.ts')
    await fs.writeFile(indexPath, indexContent, 'utf8')
    console.log(chalk.green(`\n✅ Created index file: ${indexPath}`))
  }
}

// Main execution
async function main() {
  const deployer = new V0ResumeDeployment()
  await deployer.resumeDeployment()
}

// Run
main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})