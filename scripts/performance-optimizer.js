#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class PerformanceOptimizer {
  constructor() {
    this.projectRoot = process.cwd()
    this.optimizations = []
  }

  async runOptimizations() {
    console.log('🚀 Starting Performance Optimization...\n')
    
    // 1. Bundle Analysis
    await this.analyzeBundleSize()
    
    // 2. Image Optimization
    await this.optimizeImages()
    
    // 3. Code Splitting Analysis
    await this.analyzeCodeSplitting()
    
    // 4. Unused Dependencies
    await this.findUnusedDependencies()
    
    // 5. Memory Optimization
    await this.optimizeMemoryUsage()
    
    // 6. Build Optimization
    await this.optimizeBuild()
    
    // Generate Report
    this.generateReport()
  }

  async analyzeBundleSize() {
    console.log('📊 Analyzing Bundle Size...')
    
    try {
      // Use webpack-bundle-analyzer
      const result = execSync('npx webpack-bundle-analyzer .next/static/chunks/*.js --mode static --report bundle-report.html --no-open', {
        encoding: 'utf-8',
        timeout: 30000
      })
      
      this.optimizations.push({
        category: 'Bundle Size',
        status: 'analyzed',
        message: 'Bundle analysis completed. Check bundle-report.html',
        impact: 'high'
      })
      
    } catch (error) {
      console.log('⚠️  Bundle analyzer not available, using alternative analysis')
      
      // Alternative: check file sizes
      const chunks = this.getChunkSizes()
      this.optimizations.push({
        category: 'Bundle Size',
        status: 'estimated',
        message: `Found ${chunks.length} chunks, largest: ${chunks[0]?.size || 'unknown'}`,
        impact: 'medium',
        data: chunks
      })
    }
  }

  getChunkSizes() {
    const chunksDir = path.join(this.projectRoot, '.next/static/chunks')
    if (!fs.existsSync(chunksDir)) return []
    
    return fs.readdirSync(chunksDir)
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const filePath = path.join(chunksDir, file)
        const stats = fs.statSync(filePath)
        return {
          name: file,
          size: `${(stats.size / 1024).toFixed(2)}KB`,
          sizeBytes: stats.size
        }
      })
      .sort((a, b) => b.sizeBytes - a.sizeBytes)
  }

  async optimizeImages() {
    console.log('🖼️  Optimizing Images...')
    
    const imageDir = path.join(this.projectRoot, 'public')
    const images = this.findImages(imageDir)
    
    const largeImages = images.filter(img => img.sizeBytes > 500000) // > 500KB
    
    if (largeImages.length > 0) {
      this.optimizations.push({
        category: 'Images',
        status: 'needs_optimization',
        message: `Found ${largeImages.length} large images that should be optimized`,
        impact: 'high',
        recommendations: [
          'Use next/image for automatic optimization',
          'Convert to WebP format',
          'Implement lazy loading',
          'Add responsive image sizes'
        ],
        data: largeImages
      })
    } else {
      this.optimizations.push({
        category: 'Images',
        status: 'optimized',
        message: 'Image sizes look good',
        impact: 'low'
      })
    }
  }

  findImages(dir, images = []) {
    if (!fs.existsSync(dir)) return images
    
    const files = fs.readdirSync(dir)
    
    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stats = fs.statSync(filePath)
      
      if (stats.isDirectory()) {
        this.findImages(filePath, images)
      } else if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(file)) {
        images.push({
          name: file,
          path: filePath,
          size: `${(stats.size / 1024).toFixed(2)}KB`,
          sizeBytes: stats.size
        })
      }
    })
    
    return images
  }

  async analyzeCodeSplitting() {
    console.log('🔀 Analyzing Code Splitting...')
    
    const recommendations = []
    
    // Check if dynamic imports are used
    const hasLazyLoading = this.checkForLazyLoading()
    if (!hasLazyLoading) {
      recommendations.push('Implement lazy loading for components')
      recommendations.push('Use dynamic imports for heavy libraries')
    }
    
    // Check for large vendor chunks
    const chunks = this.getChunkSizes()
    const largeChunks = chunks.filter(chunk => chunk.sizeBytes > 1000000) // > 1MB
    
    if (largeChunks.length > 0) {
      recommendations.push('Split large chunks using splitChunks configuration')
      recommendations.push('Consider route-based code splitting')
    }
    
    this.optimizations.push({
      category: 'Code Splitting',
      status: recommendations.length > 0 ? 'needs_improvement' : 'optimized',
      message: `Found ${largeChunks.length} large chunks`,
      impact: 'high',
      recommendations,
      data: largeChunks
    })
  }

  checkForLazyLoading() {
    const srcDir = path.join(this.projectRoot, 'src')
    if (!fs.existsSync(srcDir)) return false
    
    // Simple check for dynamic imports
    const files = this.findJSFiles(srcDir)
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8')
      if (content.includes('dynamic(') || content.includes('import(')) {
        return true
      }
    }
    return false
  }

  findJSFiles(dir, files = []) {
    if (!fs.existsSync(dir)) return files
    
    const dirFiles = fs.readdirSync(dir)
    
    dirFiles.forEach(file => {
      const filePath = path.join(dir, file)
      const stats = fs.statSync(filePath)
      
      if (stats.isDirectory()) {
        this.findJSFiles(filePath, files)
      } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
        files.push(filePath)
      }
    })
    
    return files
  }

  async findUnusedDependencies() {
    console.log('📦 Checking for Unused Dependencies...')
    
    try {
      const result = execSync('npx depcheck', { encoding: 'utf-8', timeout: 30000 })
      
      if (result.includes('No unused dependencies found')) {
        this.optimizations.push({
          category: 'Dependencies',
          status: 'optimized',
          message: 'No unused dependencies found',
          impact: 'low'
        })
      } else {
        this.optimizations.push({
          category: 'Dependencies',
          status: 'needs_cleanup',
          message: 'Found unused dependencies',
          impact: 'medium',
          recommendations: ['Remove unused dependencies to reduce bundle size'],
          data: result
        })
      }
    } catch (error) {
      console.log('⚠️  Depcheck failed, checking manually...')
      
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      const deps = Object.keys(packageJson.dependencies || {})
      
      this.optimizations.push({
        category: 'Dependencies',
        status: 'manual_review_needed',
        message: `${deps.length} dependencies installed`,
        impact: 'medium',
        recommendations: ['Manually review dependencies for unused packages']
      })
    }
  }

  async optimizeMemoryUsage() {
    console.log('🧠 Optimizing Memory Usage...')
    
    const recommendations = []
    
    // Check Node.js memory settings
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
    const buildScript = packageJson.scripts?.build || ''
    
    if (!buildScript.includes('--max-old-space-size')) {
      recommendations.push('Add --max-old-space-size=8192 to build script')
    }
    
    // Check for memory leaks in components
    const memoryLeakChecks = this.checkForMemoryLeaks()
    recommendations.push(...memoryLeakChecks)
    
    this.optimizations.push({
      category: 'Memory',
      status: recommendations.length > 0 ? 'needs_optimization' : 'optimized',
      message: `Memory optimization analysis complete`,
      impact: 'high',
      recommendations
    })
  }

  checkForMemoryLeaks() {
    const recommendations = []
    const files = this.findJSFiles(path.join(this.projectRoot, 'src'))
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8')
      
      // Check for missing cleanup in useEffect
      if (content.includes('useEffect') && content.includes('setInterval') && !content.includes('clearInterval')) {
        recommendations.push(`Potential memory leak in ${file}: setInterval without clearInterval`)
      }
      
      if (content.includes('addEventListener') && !content.includes('removeEventListener')) {
        recommendations.push(`Potential memory leak in ${file}: addEventListener without cleanup`)
      }
    }
    
    return recommendations
  }

  async optimizeBuild() {
    console.log('⚡ Optimizing Build Configuration...')
    
    const recommendations = []
    
    // Check Next.js config
    const nextConfigExists = fs.existsSync('next.config.js') || fs.existsSync('next.config.ts')
    if (!nextConfigExists) {
      recommendations.push('Create next.config.js with optimization settings')
    } else {
      // Check existing config for optimizations
      const configContent = fs.readFileSync(nextConfigExists ? 'next.config.js' : 'next.config.ts', 'utf-8')
      
      if (!configContent.includes('compress')) {
        recommendations.push('Enable compression in Next.js config')
      }
      
      if (!configContent.includes('swcMinify')) {
        recommendations.push('Enable SWC minification for faster builds')
      }
    }
    
    this.optimizations.push({
      category: 'Build',
      status: recommendations.length > 0 ? 'needs_optimization' : 'optimized',
      message: 'Build configuration analysis complete',
      impact: 'medium',
      recommendations
    })
  }

  generateReport() {
    console.log('\n📋 Performance Optimization Report\n')
    console.log('=' * 50)
    
    const highImpact = this.optimizations.filter(opt => opt.impact === 'high')
    const mediumImpact = this.optimizations.filter(opt => opt.impact === 'medium')
    const lowImpact = this.optimizations.filter(opt => opt.impact === 'low')
    
    console.log('\n🔥 HIGH IMPACT OPTIMIZATIONS:')
    highImpact.forEach(opt => {
      console.log(`  ${opt.category}: ${opt.message}`)
      if (opt.recommendations) {
        opt.recommendations.forEach(rec => console.log(`    - ${rec}`))
      }
    })
    
    console.log('\n⚡ MEDIUM IMPACT OPTIMIZATIONS:')
    mediumImpact.forEach(opt => {
      console.log(`  ${opt.category}: ${opt.message}`)
      if (opt.recommendations) {
        opt.recommendations.forEach(rec => console.log(`    - ${rec}`))
      }
    })
    
    console.log('\n✅ LOW IMPACT / OPTIMIZED:')
    lowImpact.forEach(opt => {
      console.log(`  ${opt.category}: ${opt.message}`)
    })
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.optimizations.length,
        highImpact: highImpact.length,
        mediumImpact: mediumImpact.length,
        lowImpact: lowImpact.length
      },
      optimizations: this.optimizations
    }
    
    fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2))
    console.log('\n📁 Detailed report saved to performance-report.json')
    
    // Quick fixes script
    this.generateQuickFixes()
  }

  generateQuickFixes() {
    const fixes = []
    
    this.optimizations.forEach(opt => {
      if (opt.category === 'Memory' && opt.recommendations?.includes('Add --max-old-space-size=8192 to build script')) {
        fixes.push('# Fix memory issues')
        fixes.push('npm pkg set scripts.build="npx prisma generate && NODE_OPTIONS=\'--max-old-space-size=8192\' next build"')
      }
      
      if (opt.category === 'Build' && opt.recommendations?.includes('Create next.config.js with optimization settings')) {
        fixes.push('# Create optimized next.config.js')
        fixes.push(`cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  swcMinify: true,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  }
}

module.exports = nextConfig
EOF`)
      }
    })
    
    if (fixes.length > 0) {
      fs.writeFileSync('quick-fixes.sh', fixes.join('\n'))
      console.log('🔧 Quick fixes saved to quick-fixes.sh')
      console.log('   Run: bash quick-fixes.sh')
    }
  }
}

// Run if called directly
if (require.main === module) {
  const optimizer = new PerformanceOptimizer()
  optimizer.runOptimizations().catch(console.error)
}

module.exports = PerformanceOptimizer