#!/usr/bin/env node
/**
 * CoreFlow360 Local Component Generator
 * Generates React components from prompts using Claude Code's assistance
 */

import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'

class LocalComponentGenerator {
  constructor() {
    this.promptsDir = path.resolve('./v0-prompts')
    this.outputDir = path.resolve('./v0-generated')
  }

  async initialize() {
    console.log(chalk.cyan('\n🚀 CoreFlow360 Local Component Generator\n'))
    
    // Create output directory
    try {
      await fs.mkdir(this.outputDir, { recursive: true })
      console.log(chalk.green(`📁 Output directory ready: ${this.outputDir}`))
    } catch (error) {
      console.error(chalk.red('❌ Failed to create output directory:', error.message))
      process.exit(1)
    }
  }

  async getPromptFiles() {
    try {
      const files = await fs.readdir(this.promptsDir)
      return files
        .filter(file => file.endsWith('.md'))
        .sort((a, b) => {
          const getNumber = (filename) => {
            const match = filename.match(/^(\d+)/)
            return match ? parseInt(match[1]) : (filename === 'consciousness-ui-components.md' ? 0 : 999)
          }
          return getNumber(a) - getNumber(b)
        })
    } catch (error) {
      console.error(chalk.red('❌ Failed to read prompts directory:', error.message))
      return []
    }
  }

  async generateComponentTemplate(promptFile) {
    const promptPath = path.join(this.promptsDir, promptFile)
    const content = await fs.readFile(promptPath, 'utf8')
    
    // Extract title from first line
    const lines = content.split('\n')
    const title = lines[0].replace(/^#\s*/, '').trim()
    
    // Generate component name from filename
    const componentName = promptFile
      .replace('.md', '')
      .replace(/^\d+-/, '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')

    // Create basic React component template
    const componentTemplate = `import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Float } from '@react-three/drei'
import * as THREE from 'three'

/**
 * ${title}
 * 
 * Generated from: ${promptFile}
 * 
 * TODO: Implement the full component based on the prompt requirements:
 * ${content.split('\n').slice(0, 5).map(line => ` * ${line}`).join('\n')}
 * 
 * Key Requirements:
 * - Business-friendly design (avoid overusing "AI" terminology)
 * - Professional and accessible to business owners
 * - 3D elements using Three.js/React Three Fiber
 * - Responsive design with Tailwind CSS
 * - TypeScript support
 */

interface ${componentName}Props {
  className?: string
}

export default function ${componentName}({ className = '' }: ${componentName}Props) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className={\`relative min-h-screen bg-black overflow-hidden \${className}\`}>
      {/* 3D Canvas Background */}
      <Canvas className="absolute inset-0" camera={{ position: [0, 0, 50], fov: 75 }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} />
        
        {/* 3D Elements - TODO: Implement based on prompt */}
        <Float speed={1.4} rotationIntensity={1} floatIntensity={2}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="#0066FF" transparent opacity={0.6} />
          </mesh>
        </Float>
        
        <Stars radius={300} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
        <OrbitControls enableZoom={false} />
      </Canvas>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {/* TODO: Add proper title from prompt */}
            ${title}
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {/* TODO: Add description from prompt */}
            Professional business automation that transforms operations into intelligent workflows.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
              Get Started
            </button>
            <button className="px-8 py-4 border border-gray-600 hover:border-gray-400 text-white rounded-lg font-semibold transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
      
      {/* TODO: Implement specific interactive elements based on prompt requirements */}
    </div>
  )
}

/*
IMPLEMENTATION NOTES:
===================

This is a template component. To complete implementation:

1. Read the full prompt content in: ${promptFile}
2. Implement the specific 3D visualizations described
3. Add interactive elements as specified
4. Ensure business-friendly language throughout
5. Test responsiveness and accessibility
6. Add proper TypeScript types for all props

Prompt Content:
${content.split('\n').slice(0, 20).join('\n')}
...

*/`

    return {
      content: componentTemplate,
      componentName,
      title
    }
  }

  async generateAllComponents() {
    const promptFiles = await this.getPromptFiles()
    const results = []

    console.log(chalk.yellow(`\n📋 Found ${promptFiles.length} prompt files\n`))

    for (const promptFile of promptFiles) {
      try {
        console.log(chalk.blue(`🔄 Generating template for: ${promptFile}`))
        
        const generated = await this.generateComponentTemplate(promptFile)
        const outputFile = path.join(this.outputDir, promptFile.replace('.md', '.tsx'))
        
        await fs.writeFile(outputFile, generated.content, 'utf8')
        
        console.log(chalk.green(`✅ Generated: ${generated.componentName}`))
        console.log(chalk.gray(`   📄 File: ${outputFile}`))
        console.log(chalk.gray(`   📝 Title: ${generated.title}\n`))
        
        results.push({
          promptFile,
          outputFile,
          componentName: generated.componentName,
          title: generated.title,
          success: true
        })
      } catch (error) {
        console.log(chalk.red(`❌ Failed to generate: ${promptFile}`))
        console.log(chalk.red(`   Error: ${error.message}\n`))
        
        results.push({
          promptFile,
          error: error.message,
          success: false
        })
      }
    }

    // Generate summary report
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    console.log(chalk.cyan('\n📊 Generation Summary:'))
    console.log(chalk.green(`   ✅ Successful: ${successful.length}`))
    console.log(chalk.red(`   ❌ Failed: ${failed.length}`))
    console.log(chalk.blue(`   📈 Success Rate: ${((successful.length / results.length) * 100).toFixed(1)}%\n`))

    if (successful.length > 0) {
      console.log(chalk.green('✅ Generated Components:'))
      successful.forEach((result, i) => {
        console.log(chalk.green(`   ${i + 1}. ${result.componentName}`))
      })
    }

    if (failed.length > 0) {
      console.log(chalk.red('\n💥 Failed Components:'))
      failed.forEach((result, i) => {
        console.log(chalk.red(`   ${i + 1}. ${result.promptFile}: ${result.error}`))
      })
    }

    console.log(chalk.cyan('\n📝 Next Steps:'))
    console.log(chalk.gray('   1. Review generated component templates in v0-generated/'))
    console.log(chalk.gray('   2. Implement the specific features described in each prompt'))
    console.log(chalk.gray('   3. Test components and refine business-friendly messaging'))
    console.log(chalk.gray('   4. Integrate components into the main application'))

    return results
  }
}

// Run the generator
async function main() {
  const generator = new LocalComponentGenerator()
  await generator.initialize()
  await generator.generateAllComponents()
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export default LocalComponentGenerator