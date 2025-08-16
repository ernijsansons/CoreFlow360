#!/usr/bin/env node

/**
 * CoreFlow360 - Bundle Analysis Script
 * Analyzes bundle size and provides optimization recommendations
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('= CoreFlow360 - Bundle Analysis Starting...\n')

// Ensure bundle-analysis directory exists
const analysisDir = path.join(process.cwd(), 'bundle-analysis')
if (!fs.existsSync(analysisDir)) {
  fs.mkdirSync(analysisDir, { recursive: true })
}

try {
  // Run build with analysis
  console.log('=æ Building application with bundle analysis...')
  execSync('ANALYZE=true npm run build', { stdio: 'inherit' })
  
  // Check if analysis files were generated
  const clientAnalysis = path.join(analysisDir, 'client.html')
  const serverAnalysis = path.join(analysisDir, 'server.html')
  const statsFile = path.join(analysisDir, 'stats.json')
  
  console.log('\n Bundle analysis completed!')
  console.log(`=Ê Client bundle report: ${clientAnalysis}`)
  console.log(`=¥ Server bundle report: ${serverAnalysis}`)
  
  // Parse stats if available
  if (fs.existsSync(statsFile)) {
    console.log('\n=È Bundle Statistics:')
    
    const stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'))
    const assets = stats.assets || []
    
    // Analyze main assets
    const mainAssets = assets.filter(asset => 
      asset.name.includes('pages/') || 
      asset.name.includes('chunks/') ||
      asset.name.includes('static/js/')
    )
    
    console.log(`Total assets: ${assets.length}`)
    console.log(`JavaScript assets: ${mainAssets.length}`)
    
    // Calculate total size
    const totalSize = mainAssets.reduce((total, asset) => total + asset.size, 0)
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2)
    
    console.log(`Total JavaScript size: ${totalSizeMB} MB`)
    
    // Find largest chunks
    const largestAssets = mainAssets
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
    
    console.log('\n<Ë Largest assets:')
    largestAssets.forEach((asset, index) => {
      const sizeMB = (asset.size / (1024 * 1024)).toFixed(2)
      console.log(`${index + 1}. ${asset.name}: ${sizeMB} MB`)
    })
    
    // Bundle recommendations
    console.log('\n=¡ Bundle Optimization Recommendations:')
    
    if (totalSize > 3 * 1024 * 1024) { // > 3MB
      console.log('  Bundle size is large (>3MB). Consider:')
      console.log('   - Implementing dynamic imports for large components')
      console.log('   - Tree shaking unused code')
      console.log('   - Code splitting by route')
    }
    
    // Check for duplicate dependencies
    const chunkNames = mainAssets.map(asset => asset.name)
    const duplicateLibs = findPotentialDuplicates(chunkNames)
    
    if (duplicateLibs.length > 0) {
      console.log('= Potential duplicate libraries detected:')
      duplicateLibs.forEach(lib => {
        console.log(`   - ${lib}`)
      })
    }
    
    // Performance metrics
    const performanceScore = calculatePerformanceScore(totalSize, mainAssets.length)
    console.log(`\n<¯ Bundle Performance Score: ${performanceScore}/100`)
    
    if (performanceScore < 70) {
      console.log('=¨ Bundle needs optimization!')
    } else if (performanceScore < 85) {
      console.log('  Bundle has room for improvement')
    } else {
      console.log(' Bundle performance is good!')
    }
  }
  
  // Generate summary report
  generateSummaryReport()
  
  console.log(`\n< Open ${clientAnalysis} in your browser to view detailed analysis`)
  
} catch (error) {
  console.error('L Bundle analysis failed:', error.message)
  process.exit(1)
}

/**
 * Find potential duplicate libraries in chunk names
 */
function findPotentialDuplicates(chunkNames) {
  const libraries = new Set()
  const duplicates = []
  
  const commonLibs = [
    'react', 'lodash', 'date-fns', 'axios', 'moment', 
    'chart.js', 'three', 'd3', 'socket.io'
  ]
  
  chunkNames.forEach(name => {
    commonLibs.forEach(lib => {
      if (name.toLowerCase().includes(lib)) {
        if (libraries.has(lib)) {
          duplicates.push(lib)
        } else {
          libraries.add(lib)
        }
      }
    })
  })
  
  return [...new Set(duplicates)]
}

/**
 * Calculate performance score based on bundle metrics
 */
function calculatePerformanceScore(totalSize, assetCount) {
  let score = 100
  
  // Size penalty
  const sizeMB = totalSize / (1024 * 1024)
  if (sizeMB > 5) score -= 30
  else if (sizeMB > 3) score -= 20
  else if (sizeMB > 1.5) score -= 10
  
  // Asset count penalty (too many requests)
  if (assetCount > 50) score -= 20
  else if (assetCount > 30) score -= 10
  
  // Minimum score
  return Math.max(score, 0)
}

/**
 * Generate a summary report
 */
function generateSummaryReport() {
  const report = {
    timestamp: new Date().toISOString(),
    analysis: {
      client_report: 'bundle-analysis/client.html',
      server_report: 'bundle-analysis/server.html',
      stats_file: 'bundle-analysis/stats.json'
    },
    recommendations: [
      'Use dynamic imports for large components',
      'Implement route-based code splitting',
      'Optimize third-party library imports',
      'Enable tree shaking for unused code',
      'Consider lazy loading for non-critical features'
    ],
    next_steps: [
      'Review largest chunks in the client report',
      'Identify opportunities for dynamic imports',
      'Analyze component usage patterns',
      'Consider implementing progressive loading'
    ]
  }
  
  const reportPath = path.join(process.cwd(), 'bundle-analysis', 'summary.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  console.log(`\n=Ý Summary report saved: ${reportPath}`)
}