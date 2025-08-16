#!/usr/bin/env node
/**
 * Extract and optimize v0.dev prompts for maximum quality output
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function extractPrompt(filename) {
  try {
    const promptPath = path.join(__dirname, '..', 'v0-prompts', filename)
    const content = await fs.readFile(promptPath, 'utf8')
    
    // Extract key sections
    const title = content.match(/^# (.+)$/m)?.[1] || 'Component'
    const description = content.split('\n\n')[1] || ''
    
    // Create optimized v0.dev prompt
    const optimizedPrompt = `${title}

${description}

Technical Requirements:
- Next.js 15.4.5 with App Router
- TypeScript with strict mode (no any types)
- Tailwind CSS with custom consciousness theme colors
- Framer Motion for smooth 60fps animations
- Three.js + React Three Fiber for 3D elements
- Responsive design with mobile-first approach

Core Features:
${extractFeatures(content)}

Visual Design:
- Dark theme with consciousness-aware gradients
- Colors: Neural (#2563eb), Synaptic (#7c3aed), Autonomous (#f59e0b), Transcendent (prismatic)
- Glassmorphism effects with backdrop-filter
- Particle systems and neural network visualizations
- Smooth animations and micro-interactions

Performance Requirements:
- 60fps animations on desktop, 30fps minimum on mobile
- Lazy loading for heavy 3D components
- Progressive enhancement strategy
- Sub-100ms interaction response times

Please create a production-ready component with proper TypeScript types, error boundaries, loading states, and accessibility features (WCAG 2.1 AA).

Temperature: 0.1`

    // Save optimized prompt
    const outputPath = path.join(__dirname, '..', 'v0-generated', `optimized-${filename}.txt`)
    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, optimizedPrompt, 'utf8')
    
    console.log(`✅ Extracted and optimized: ${filename}`)
    console.log(`📄 Saved to: ${outputPath}`)
    console.log(`📏 Prompt length: ${optimizedPrompt.length} characters`)
    console.log('---')
    
    return { title, filename, optimizedPrompt }
  } catch (error) {
    console.error(`❌ Failed to extract ${filename}:`, error.message)
    return null
  }
}

function extractFeatures(content) {
  // Extract bullet points and key features
  const features = []
  const lines = content.split('\n')
  
  for (const line of lines) {
    if (line.match(/^[-*]\s+\*\*[^*]+\*\*:/)) {
      features.push(line.replace(/^[-*]\s+/, ''))
    }
  }
  
  return features.slice(0, 10).join('\n')
}

async function main() {
  console.log('🚀 V0.dev Prompt Optimizer\n')
  
  // Get prompt file from command line or use default
  const promptFile = process.argv[2] || '01-consciousness-awakening.md'
  
  if (promptFile === 'all') {
    // Process all prompts
    const promptsDir = path.join(__dirname, '..', 'v0-prompts')
    const files = await fs.readdir(promptsDir)
    const mdFiles = files.filter(f => f.endsWith('.md'))
    
    console.log(`📋 Processing ${mdFiles.length} prompts...\n`)
    
    for (const file of mdFiles) {
      await extractPrompt(file)
    }
    
    console.log('\n✨ All prompts optimized for v0.dev!')
    console.log('📁 Check v0-generated/ directory for optimized prompts')
  } else {
    // Process single prompt
    const result = await extractPrompt(promptFile)
    
    if (result) {
      console.log('\n📋 Optimized prompt ready for v0.dev:')
      console.log('========================================')
      console.log(result.optimizedPrompt)
      console.log('========================================')
      console.log('\n✨ Copy the above prompt to v0.dev for best results!')
    }
  }
}

// Run the extractor
main().catch(console.error)