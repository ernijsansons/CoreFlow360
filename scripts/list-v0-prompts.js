#!/usr/bin/env node
/**
 * List all optimized v0.dev prompts with quick access
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function listPrompts() {
  console.log(chalk.cyan('\n🎨 Available V0.dev Prompts\n'))
  
  const promptsDir = path.join(__dirname, '..', 'v0-prompts')
  const generatedDir = path.join(__dirname, '..', 'v0-generated')
  
  try {
    const files = await fs.readdir(promptsDir)
    const mdFiles = files.filter(f => f.endsWith('.md')).sort()
    
    console.log(chalk.yellow('Original Prompts:'))
    for (const [index, file] of mdFiles.entries()) {
      const content = await fs.readFile(path.join(promptsDir, file), 'utf8')
      const title = content.match(/^# (.+)$/m)?.[1] || file
      console.log(chalk.gray(`  ${index + 1}. `) + chalk.white(file))
      console.log(chalk.dim(`     ${title}`))
    }
    
    console.log(chalk.yellow('\nOptimized Prompts:'))
    try {
      const optimizedFiles = await fs.readdir(generatedDir)
      const txtFiles = optimizedFiles.filter(f => f.startsWith('optimized-') && f.endsWith('.txt'))
      
      if (txtFiles.length === 0) {
        console.log(chalk.dim('  No optimized prompts generated yet. Run: node scripts/extract-v0-prompt.js all'))
      } else {
        for (const file of txtFiles) {
          console.log(chalk.green(`  ✓ ${file}`))
        }
      }
    } catch (error) {
      console.log(chalk.dim('  No optimized prompts found. Run: node scripts/extract-v0-prompt.js all'))
    }
    
    console.log(chalk.cyan('\n📋 Quick Commands:'))
    console.log(chalk.gray('  Extract single prompt:  ') + 'node scripts/extract-v0-prompt.js [filename]')
    console.log(chalk.gray('  Extract all prompts:    ') + 'node scripts/extract-v0-prompt.js all')
    console.log(chalk.gray('  View demo page:         ') + 'http://localhost:3000/consciousness-demo')
    
  } catch (error) {
    console.error(chalk.red('Error listing prompts:'), error.message)
  }
}

listPrompts()