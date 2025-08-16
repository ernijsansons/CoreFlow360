#!/usr/bin/env node

/**
 * CoreFlow360 - Service Worker Auto-Versioning Script
 * Automatically updates service worker with build hash for cache busting
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { execSync } = require('child_process')

class ServiceWorkerVersioning {
  constructor() {
    this.projectRoot = process.cwd()
    this.swPath = path.join(this.projectRoot, 'public', 'sw.js')
    this.manifestPath = path.join(this.projectRoot, 'public', 'manifest.json')
    this.buildHash = this.generateBuildHash()
    this.timestamp = new Date().toISOString()
  }

  generateBuildHash() {
    try {
      // Try to get git commit hash first
      const gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
      console.log(`[SW Versioning] Using git hash: ${gitHash}`)
      return gitHash
    } catch (error) {
      // Fallback to file-based hash if git is not available
      console.log('[SW Versioning] Git not available, generating file-based hash')
      return this.generateFileBasedHash()
    }
  }

  generateFileBasedHash() {
    try {
      // Generate hash based on key source files
      const filesToHash = [
        'package.json',
        'next.config.js',
        'tailwind.config.ts'
      ]

      const hasher = crypto.createHash('sha256')
      
      filesToHash.forEach(file => {
        const filePath = path.join(this.projectRoot, file)
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8')
          hasher.update(content)
        }
      })

      // Also include current timestamp for uniqueness
      hasher.update(Date.now().toString())
      
      const hash = hasher.digest('hex').substring(0, 8)
      console.log(`[SW Versioning] Generated file-based hash: ${hash}`)
      return hash
    } catch (error) {
      console.error('[SW Versioning] Failed to generate file-based hash:', error)
      return Date.now().toString().substring(-8) // Fallback to timestamp
    }
  }

  updateServiceWorker() {
    try {
      if (!fs.existsSync(this.swPath)) {
        console.error(`[SW Versioning] Service worker not found at: ${this.swPath}`)
        return false
      }

      console.log(`[SW Versioning] Updating service worker with hash: ${this.buildHash}`)
      
      let swContent = fs.readFileSync(this.swPath, 'utf8')
      
      // Replace build hash placeholder
      swContent = swContent.replace(
        'BUILD_HASH_PLACEHOLDER',
        this.buildHash
      )

      // Update version timestamp
      swContent = swContent.replace(
        /const VERSION_TIMESTAMP = .*/,
        `const VERSION_TIMESTAMP = ${Date.now()}`
      )

      // Add build metadata comment
      const buildMetadata = `
// Build Metadata
// Generated: ${this.timestamp}
// Build Hash: ${this.buildHash}
// Auto-versioned by CoreFlow360 build system
`
      
      swContent = buildMetadata + swContent

      // Write updated service worker
      fs.writeFileSync(this.swPath, swContent, 'utf8')
      console.log(`[SW Versioning] Service worker updated successfully`)
      
      return true
    } catch (error) {
      console.error('[SW Versioning] Failed to update service worker:', error)
      return false
    }
  }

  updateManifest() {
    try {
      if (!fs.existsSync(this.manifestPath)) {
        console.log('[SW Versioning] Manifest not found, skipping manifest update')
        return true
      }

      const manifestContent = fs.readFileSync(this.manifestPath, 'utf8')
      const manifest = JSON.parse(manifestContent)

      // Update manifest with version info
      manifest.version = this.buildHash
      manifest.build_timestamp = this.timestamp
      
      // Update the name to include version for debugging
      if (process.env.NODE_ENV === 'development') {
        manifest.name = `${manifest.name} (${this.buildHash})`
        manifest.short_name = `${manifest.short_name} (${this.buildHash.substring(0, 4)})`
      }

      fs.writeFileSync(this.manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
      console.log(`[SW Versioning] Manifest updated with version: ${this.buildHash}`)
      
      return true
    } catch (error) {
      console.error('[SW Versioning] Failed to update manifest:', error)
      return false
    }
  }

  generateVersionInfo() {
    const versionInfo = {
      buildHash: this.buildHash,
      timestamp: this.timestamp,
      environment: process.env.NODE_ENV || 'development',
      cacheNames: {
        main: `coreflow360-v${this.buildHash}`,
        static: `coreflow360-static-v${this.buildHash}`,
        dynamic: `coreflow360-dynamic-v${this.buildHash}`
      },
      features: [
        'offline-support',
        'auto-versioning',
        'cache-management',
        'background-sync',
        'push-notifications'
      ]
    }

    const versionInfoPath = path.join(this.projectRoot, 'public', 'version.json')
    fs.writeFileSync(versionInfoPath, JSON.stringify(versionInfo, null, 2), 'utf8')
    console.log(`[SW Versioning] Version info generated: ${versionInfoPath}`)
    
    return versionInfo
  }

  cleanOldCaches() {
    // Generate a script to clean old caches - this will be executed by the service worker
    const cacheCleanupScript = `
// Cache cleanup script - generated automatically
self.addEventListener('activate', async (event) => {
  console.log('[SW] Cleaning up old caches...')
  
  event.waitUntil(
    caches.keys().then(async (cacheNames) => {
      const currentCaches = [
        'coreflow360-v${this.buildHash}',
        'coreflow360-static-v${this.buildHash}',
        'coreflow360-dynamic-v${this.buildHash}'
      ]
      
      const cachesToDelete = cacheNames.filter(cacheName => 
        cacheName.startsWith('coreflow360-') && 
        !currentCaches.includes(cacheName)
      )
      
      console.log('[SW] Deleting old caches:', cachesToDelete)
      
      await Promise.all(
        cachesToDelete.map(cacheName => caches.delete(cacheName))
      )
      
      console.log('[SW] Cache cleanup completed')
    })
  )
})
`

    const cacheScriptPath = path.join(this.projectRoot, 'public', 'cache-cleanup.js')
    fs.writeFileSync(cacheScriptPath, cacheCleanupScript, 'utf8')
    console.log(`[SW Versioning] Cache cleanup script generated`)
  }

  async run() {
    console.log(`[SW Versioning] Starting service worker versioning...`)
    console.log(`[SW Versioning] Project root: ${this.projectRoot}`)
    console.log(`[SW Versioning] Build hash: ${this.buildHash}`)
    
    const results = {
      serviceWorker: this.updateServiceWorker(),
      manifest: this.updateManifest(),
      versionInfo: this.generateVersionInfo()
    }

    this.cleanOldCaches()

    // Summary
    const success = Object.values(results).every(result => result)
    
    if (success) {
      console.log(`\n✅ [SW Versioning] All updates completed successfully!`)
      console.log(`   Build Hash: ${this.buildHash}`)
      console.log(`   Timestamp: ${this.timestamp}`)
      console.log(`   Cache Names:`)
      console.log(`     - Main: coreflow360-v${this.buildHash}`)
      console.log(`     - Static: coreflow360-static-v${this.buildHash}`)
      console.log(`     - Dynamic: coreflow360-dynamic-v${this.buildHash}`)
    } else {
      console.error(`\n❌ [SW Versioning] Some updates failed:`)
      Object.entries(results).forEach(([key, success]) => {
        console.log(`   ${success ? '✅' : '❌'} ${key}`)
      })
      process.exit(1)
    }

    return results
  }

  // Method to be called during CI/CD
  static async runForProduction() {
    console.log('[SW Versioning] Running in production mode...')
    
    // Set production environment if not set
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production'
    }

    const versioning = new ServiceWorkerVersioning()
    const results = await versioning.run()

    // Generate deployment info for monitoring
    const deploymentInfo = {
      version: versioning.buildHash,
      timestamp: versioning.timestamp,
      environment: 'production',
      results,
      deployment: {
        status: Object.values(results).every(r => r) ? 'success' : 'partial',
        notes: 'Service worker auto-versioned for production deployment'
      }
    }

    const deploymentPath = path.join(versioning.projectRoot, 'deployment-info.json')
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2), 'utf8')
    
    console.log(`[SW Versioning] Deployment info saved: ${deploymentPath}`)
    
    return deploymentInfo
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2)
  const isProduction = args.includes('--production') || process.env.NODE_ENV === 'production'
  
  if (isProduction) {
    ServiceWorkerVersioning.runForProduction()
      .then(() => {
        console.log('[SW Versioning] Production versioning completed')
        process.exit(0)
      })
      .catch(error => {
        console.error('[SW Versioning] Production versioning failed:', error)
        process.exit(1)
      })
  } else {
    const versioning = new ServiceWorkerVersioning()
    versioning.run()
      .then(() => {
        console.log('[SW Versioning] Development versioning completed')
      })
      .catch(error => {
        console.error('[SW Versioning] Development versioning failed:', error)
        process.exit(1)
      })
  }
}

module.exports = ServiceWorkerVersioning