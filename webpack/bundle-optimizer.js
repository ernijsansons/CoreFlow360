/**
 * CoreFlow360 - Advanced Bundle Optimizer Webpack Plugin
 * Provides intelligent bundle optimization and analysis
 */

class BundleOptimizerPlugin {
  constructor(options = {}) {
    this.options = {
      enableTreeShaking: true,
      enableDuplicateDetection: true,
      enableSizeAnalysis: true,
      maxAssetSize: 2 * 1024 * 1024, // 2MB
      maxChunkSize: 1 * 1024 * 1024, // 1MB
      excludePatterns: [],
      ...options
    }
  }

  apply(compiler) {
    const pluginName = 'BundleOptimizerPlugin'

    // Hook into the compilation process
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      
      // Optimize chunk sizes
      compilation.hooks.optimizeChunks.tap(pluginName, (chunks) => {
        if (this.options.enableSizeAnalysis) {
          this.analyzeChunkSizes(chunks, compilation)
        }
      })

      // Detect duplicate modules
      compilation.hooks.afterOptimizeModules.tap(pluginName, (modules) => {
        if (this.options.enableDuplicateDetection) {
          this.detectDuplicates(modules, compilation)
        }
      })

      // Optimize assets
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE
        },
        (assets) => {
          this.optimizeAssets(assets, compilation)
        }
      )
    })

    // Final stats analysis
    compiler.hooks.done.tap(pluginName, (stats) => {
      this.generateOptimizationReport(stats)
    })
  }

  /**
   * Analyze chunk sizes and provide warnings
   */
  analyzeChunkSizes(chunks, compilation) {
    const warnings = []
    const { maxChunkSize } = this.options

    for (const chunk of chunks) {
      let chunkSize = 0
      
      for (const module of chunk.getModules()) {
        if (module.size) {
          chunkSize += module.size()
        }
      }

      if (chunkSize > maxChunkSize) {
        warnings.push({
          type: 'large-chunk',
          chunk: chunk.name || chunk.id,
          size: chunkSize,
          modules: chunk.getModules().length,
          recommendation: 'Consider splitting this chunk or using dynamic imports'
        })
      }
    }

    if (warnings.length > 0) {
      console.log('\n=¨ Bundle Optimizer Warnings:')
      warnings.forEach(warning => {
        const sizeMB = (warning.size / (1024 * 1024)).toFixed(2)
        console.log(`    Large chunk "${warning.chunk}": ${sizeMB}MB (${warning.modules} modules)`)
        console.log(`     ${warning.recommendation}`)
      })
    }
  }

  /**
   * Detect duplicate modules across chunks
   */
  detectDuplicates(modules, compilation) {
    const moduleMap = new Map()
    const duplicates = []

    for (const module of modules) {
      if (module.resource) {
        const key = this.getModuleKey(module)
        if (moduleMap.has(key)) {
          duplicates.push({
            resource: module.resource,
            chunks: [...moduleMap.get(key), ...this.getModuleChunks(module)]
          })
        } else {
          moduleMap.set(key, this.getModuleChunks(module))
        }
      }
    }

    if (duplicates.length > 0) {
      console.log('\n= Duplicate Modules Detected:')
      duplicates.slice(0, 5).forEach(duplicate => {
        const fileName = duplicate.resource.split('/').pop()
        console.log(`  =æ ${fileName} appears in chunks: ${duplicate.chunks.join(', ')}`)
      })
      
      if (duplicates.length > 5) {
        console.log(`  ... and ${duplicates.length - 5} more`)
      }
      
      console.log('     Consider using SplitChunksPlugin to eliminate duplicates')
    }
  }

  /**
   * Optimize individual assets
   */
  optimizeAssets(assets, compilation) {
    const { maxAssetSize } = this.options
    const largeAssets = []

    Object.keys(assets).forEach(assetName => {
      const asset = assets[assetName]
      const size = asset.size()

      // Skip excluded patterns
      if (this.options.excludePatterns.some(pattern => 
        new RegExp(pattern).test(assetName))) {
        return
      }

      if (size > maxAssetSize) {
        largeAssets.push({
          name: assetName,
          size,
          type: this.getAssetType(assetName)
        })
      }
    })

    if (largeAssets.length > 0) {
      console.log('\n=Ê Large Assets Report:')
      largeAssets
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .forEach(asset => {
          const sizeMB = (asset.size / (1024 * 1024)).toFixed(2)
          console.log(`  =Á ${asset.name}: ${sizeMB}MB (${asset.type})`)
        })
    }
  }

  /**
   * Generate comprehensive optimization report
   */
  generateOptimizationReport(stats) {
    const compilation = stats.compilation
    const assets = compilation.getAssets()
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalAssets: assets.length,
        totalSize: assets.reduce((total, asset) => total + asset.info.size, 0),
        chunks: compilation.chunks.size,
        modules: compilation.modules.size
      },
      recommendations: [],
      performance: {
        score: 100,
        issues: []
      }
    }

    // Calculate performance score
    const totalSizeMB = report.summary.totalSize / (1024 * 1024)
    
    if (totalSizeMB > 5) {
      report.performance.score -= 30
      report.performance.issues.push('Bundle size is very large (>5MB)')
      report.recommendations.push('Implement aggressive code splitting')
    } else if (totalSizeMB > 2) {
      report.performance.score -= 15
      report.performance.issues.push('Bundle size is large (>2MB)')
      report.recommendations.push('Consider lazy loading non-critical features')
    }

    if (compilation.chunks.size > 50) {
      report.performance.score -= 10
      report.performance.issues.push('Too many chunks may impact loading performance')
      report.recommendations.push('Optimize chunk splitting strategy')
    }

    // Tree shaking analysis
    const unusedExports = this.analyzeTreeShaking(compilation)
    if (unusedExports > 0) {
      report.performance.score -= Math.min(20, unusedExports * 2)
      report.performance.issues.push(`${unusedExports} potentially unused exports detected`)
      report.recommendations.push('Review and remove unused exports')
    }

    // Save report
    const reportPath = require('path').join(process.cwd(), 'bundle-analysis', 'optimization-report.json')
    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2))

    console.log(`\n=È Bundle Optimization Report:`)
    console.log(`   Total Size: ${totalSizeMB.toFixed(2)}MB`)
    console.log(`   Performance Score: ${report.performance.score}/100`)
    console.log(`   Report saved: ${reportPath}`)

    if (report.recommendations.length > 0) {
      console.log('\n=¡ Optimization Recommendations:')
      report.recommendations.forEach(rec => {
        console.log(`   " ${rec}`)
      })
    }
  }

  /**
   * Analyze tree shaking effectiveness
   */
  analyzeTreeShaking(compilation) {
    let unusedExports = 0
    
    for (const module of compilation.modules) {
      if (module.buildMeta && module.buildMeta.exportsType === 'namespace') {
        const exports = module.getExportsInfo()
        if (exports) {
          for (const exportInfo of exports.exports.values()) {
            if (!exportInfo.used) {
              unusedExports++
            }
          }
        }
      }
    }
    
    return unusedExports
  }

  /**
   * Get a unique key for a module
   */
  getModuleKey(module) {
    if (module.resource) {
      // Use relative path from node_modules as key
      const parts = module.resource.split('node_modules/')
      return parts.length > 1 ? parts[parts.length - 1] : module.resource
    }
    return module.identifier()
  }

  /**
   * Get chunks that contain this module
   */
  getModuleChunks(module) {
    const chunks = []
    for (const chunk of module.chunksIterable || []) {
      chunks.push(chunk.name || chunk.id)
    }
    return chunks
  }

  /**
   * Get asset type based on file extension
   */
  getAssetType(assetName) {
    if (assetName.endsWith('.js')) return 'JavaScript'
    if (assetName.endsWith('.css')) return 'CSS'
    if (assetName.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'Image'
    if (assetName.match(/\.(woff|woff2|ttf|eot)$/)) return 'Font'
    return 'Other'
  }
}

/**
 * Preset configurations for different optimization levels
 */
BundleOptimizerPlugin.presets = {
  development: {
    enableTreeShaking: false,
    enableDuplicateDetection: true,
    enableSizeAnalysis: true,
    maxAssetSize: 5 * 1024 * 1024, // 5MB
    maxChunkSize: 2 * 1024 * 1024  // 2MB
  },

  production: {
    enableTreeShaking: true,
    enableDuplicateDetection: true,
    enableSizeAnalysis: true,
    maxAssetSize: 1 * 1024 * 1024, // 1MB
    maxChunkSize: 500 * 1024       // 500KB
  },

  aggressive: {
    enableTreeShaking: true,
    enableDuplicateDetection: true,
    enableSizeAnalysis: true,
    maxAssetSize: 500 * 1024,      // 500KB
    maxChunkSize: 250 * 1024       // 250KB
  }
}

module.exports = BundleOptimizerPlugin