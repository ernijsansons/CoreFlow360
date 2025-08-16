#!/usr/bin/env node
/**
 * Direct v0.dev API Integration
 * Uses the v0 Models API for code generation
 */

import fs from 'fs/promises'
import path from 'path'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import chalk from 'chalk'
import ora from 'ora'

// Load environment
dotenv.config({ path: '.env.local' })

class V0DirectAPI {
  constructor() {
    this.apiKey = process.env.V0_API_KEY
    this.baseUrl = 'https://api.v0.dev/v1'
    this.outputDir = path.resolve('./v0-deployed')
    
    if (!this.apiKey) {
      console.error(chalk.red('❌ V0_API_KEY not found'))
      process.exit(1)
    }
  }

  async generateCode(prompt, title) {
    const spinner = ora(`Generating ${title}...`).start()
    
    try {
      // Use v0 Models API
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

      // Clean up the response - remove thinking tags and extract actual code
      code = code.replace(/<Thinking>[\s\S]*?<\/Thinking>/g, '')
      code = code.replace(/<CodeProject[\s\S]*?>[\s\S]*?```tsx[\s\S]*?([\s\S]*?)```[\s\S]*?<\/CodeProject>/g, '$1')
      
      // If still has markers, try another extraction
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

  async deployConsciousnessExperience(filename, title, content) {
    console.log(chalk.cyan(`\n🎯 Deploying: ${title}`))
    
    // Create focused prompt for v0
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
      // Generate code
      const code = await this.generateCode(v0Prompt, title)
      
      // Save to file
      await fs.mkdir(this.outputDir, { recursive: true })
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

  async deployAll() {
    const prompts = [
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
      { file: '12-commitment-threshold.md', title: 'The Commitment Threshold' }
    ]

    console.log(chalk.cyan('\n🚀 V0.dev Direct API Deployment\n'))
    
    const results = []
    
    for (const [index, prompt] of prompts.entries()) {
      try {
        const promptPath = path.join('./v0-prompts', prompt.file)
        const content = await fs.readFile(promptPath, 'utf8')
        
        const result = await this.deployConsciousnessExperience(
          prompt.file,
          prompt.title,
          content
        )
        
        results.push({ ...prompt, ...result })
        
        // Rate limiting
        if (index < prompts.length - 1) {
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

    // Generate report
    const successful = results.filter(r => r.success).length
    console.log(chalk.cyan('\n📊 Deployment Summary:'))
    console.log(chalk.green(`   ✅ Successful: ${successful}/${results.length}`))
    
    if (successful === results.length) {
      console.log(chalk.green.bold('\n🎉 All consciousness experiences deployed!'))
      
      // Create index file
      await this.createIndexFile(results)
    }
    
    return results
  }

  async createIndexFile(results) {
    const indexContent = `// CoreFlow360 Consciousness Experiences
// Generated by v0.dev API

export const consciousnessExperiences = [
${results.filter(r => r.success).map(r => `  {
    id: '${r.file.replace('.md', '')}',
    title: '${r.title}',
    component: () => import('./${r.file.replace('.md', '.tsx')}')
  }`).join(',\n')}
]

export default consciousnessExperiences`

    const indexPath = path.join(this.outputDir, 'index.ts')
    await fs.writeFile(indexPath, indexContent, 'utf8')
    console.log(chalk.green(`\n✅ Created index file: ${indexPath}`))
  }

  async testSingle() {
    console.log(chalk.yellow('\n🧪 Testing with single prompt...\n'))
    
    const testPrompt = {
      file: 'consciousness-ui-components.md',
      title: 'Test: Consciousness UI Component'
    }
    
    try {
      const content = await fs.readFile(
        path.join('./v0-prompts', testPrompt.file), 
        'utf8'
      )
      
      const result = await this.deployConsciousnessExperience(
        testPrompt.file,
        testPrompt.title,
        content
      )
      
      if (result.success) {
        console.log(chalk.green('\n✅ Test successful!'))
        
        // Show preview of generated code
        const code = await fs.readFile(result.path, 'utf8')
        console.log(chalk.gray('\n📄 Preview (first 500 chars):'))
        console.log(chalk.gray(code.substring(0, 500) + '...'))
        
        return true
      }
      
    } catch (error) {
      console.error(chalk.red(`\n❌ Test failed: ${error.message}`))
    }
    
    return false
  }
}

// Main execution
async function main() {
  const deployer = new V0DirectAPI()
  
  // Check for test mode
  if (process.argv.includes('--test')) {
    await deployer.testSingle()
    return
  }
  
  // Full deployment
  await deployer.deployAll()
}

// Run
main().catch(error => {
  console.error(chalk.red('Fatal error:'), error)
  process.exit(1)
})