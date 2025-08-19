/**
 * CoreFlow360 - Green Computing Optimizations
 * Advanced performance and sustainability optimizations for reduced carbon footprint
 */

export interface GreenOptimizationConfig {
  enableLazyLoading: boolean
  aggressiveCodeSplitting: boolean
  optimizeImages: boolean
  enableServiceWorker: boolean
  useCDN: boolean
  enableGreenMode: boolean
  batterySavingMode: boolean
  reducedMotion: boolean
  prefetchStrategy: 'aggressive' | 'conservative' | 'adaptive'
  cacheStrategy: 'aggressive' | 'balanced' | 'minimal'
}

export interface PerformanceMetrics {
  bundleSize: number
  loadTime: number
  renderTime: number
  energyScore: number // 0-100 (higher is better)
  carbonFootprint: number // grams CO2 per page view
  cacheHitRate: number
  compressionRatio: number
}

export interface BatteryInfo {
  isCharging: boolean
  chargingLevel: number // 0-1
  dischargingTime: number // minutes
  chargingTime: number // minutes
}

class GreenComputingOptimizer {
  private config: GreenOptimizationConfig
  private metrics: PerformanceMetrics | null = null
  private batteryInfo: BatteryInfo | null = null
  private observers: PerformanceObserver[] = []
  private energyProfile: 'high' | 'medium' | 'low' = 'medium'

  constructor(config?: Partial<GreenOptimizationConfig>) {
    this.config = {
      enableLazyLoading: true,
      aggressiveCodeSplitting: true,
      optimizeImages: true,
      enableServiceWorker: true,
      useCDN: true,
      enableGreenMode: false,
      batterySavingMode: false,
      reducedMotion: false,
      prefetchStrategy: 'adaptive',
      cacheStrategy: 'balanced',
      ...config,
    }

    this.initializeOptimizations()
  }

  private async initializeOptimizations(): Promise<void> {
    await this.detectDeviceCapabilities()
    await this.setupPerformanceMonitoring()
    await this.enableBatteryOptimizations()
    this.setupIntersectionObserver()
    this.setupImageOptimization()
    this.enableGreenModeIfNeeded()
  }

  // Device Capability Detection
  private async detectDeviceCapabilities(): Promise<void> {
    try {
      // Detect connection type
      const connection =
        (navigator as unknown).connection ||
        (navigator as unknown).mozConnection ||
        (navigator as unknown).webkitConnection

      if (connection) {
        const effectiveType = connection.effectiveType
        const downlink = connection.downlink // Mbps
        const rtt = connection.rtt // ms

        // Adjust energy profile based on connection
        if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
          this.energyProfile = 'low'
          this.config.prefetchStrategy = 'minimal' as unknown
          this.config.cacheStrategy = 'aggressive'
        } else if (effectiveType === '3g' || downlink < 5) {
          this.energyProfile = 'medium'
          this.config.prefetchStrategy = 'conservative'
        } else {
          this.energyProfile = 'high'
          this.config.prefetchStrategy = 'adaptive'
        }

        console.log(
          '[Green Computing] Connection type detected:',
          effectiveType,
          'Energy profile:',
          this.energyProfile
        )
      }

      // Detect battery status
      if ('getBattery' in navigator) {
        const battery = await (navigator as unknown).getBattery()
        this.batteryInfo = {
          isCharging: battery.charging,
          chargingLevel: battery.level,
          dischargingTime: battery.dischargingTime / 60, // Convert to minutes
          chargingTime: battery.chargingTime / 60,
        }

        // Enable battery saving if low battery
        if (this.batteryInfo.chargingLevel < 0.2 && !this.batteryInfo.isCharging) {
          this.enableBatterySavingMode()
        }

        // Listen for battery changes
        battery.addEventListener('levelchange', () => {
          if (this.batteryInfo) {
            this.batteryInfo.chargingLevel = battery.level
            if (battery.level < 0.2 && !battery.charging) {
              this.enableBatterySavingMode()
            }
          }
        })
      }

      // Detect reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) {
        this.config.reducedMotion = true
        this.enableReducedMotion()
      }

      // Detect data saver preference
      const saveData = (navigator as unknown).connection?.saveData
      if (saveData) {
        this.enableDataSaverMode()
      }
    } catch (error) {}
  }

  // Performance Monitoring
  private async setupPerformanceMonitoring(): Promise<void> {
    if ('PerformanceObserver' in window) {
      // Monitor Core Web Vitals
      const vitalsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processVitalMetric(entry)
        }
      })

      try {
        vitalsObserver.observe({ entryTypes: ['measure', 'navigation', 'resource', 'paint'] })
        this.observers.push(vitalsObserver)
      } catch (error) {}

      // Monitor long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            // Tasks longer than 50ms
            this.optimizeLongTask(entry)
          }
        }
      })

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.push(longTaskObserver)
      } catch (error) {}
    }

    // Custom performance metrics
    this.startMetricsCollection()
  }

  private processVitalMetric(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming
        this.updateMetrics({
          loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
          renderTime: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
        })
        break

      case 'paint':
        if (entry.name === 'first-contentful-paint') {
        }
        break

      case 'resource':
        const resourceEntry = entry as PerformanceResourceTiming
        if (resourceEntry.transferSize) {
          this.trackResourceEfficiency(resourceEntry)
        }
        break
    }
  }

  private optimizeLongTask(entry: PerformanceEntry): void {
    // Suggest optimizations
    if (entry.duration > 100) {
      this.suggestTaskOptimization(entry)
    }
  }

  private suggestTaskOptimization(entry: PerformanceEntry): void {
    // This would integrate with the sustainability dashboard
    const suggestion = {
      type: 'long-task',
      duration: entry.duration,
      timestamp: entry.startTime,
      recommendation:
        'Consider breaking this task into smaller chunks using setTimeout or requestIdleCallback',
    }

    // Dispatch custom event for the dashboard
    window.dispatchEvent(new CustomEvent('green-optimization-suggestion', { detail: suggestion }))
  }

  // Battery Optimizations
  private async enableBatteryOptimizations(): Promise<void> {
    if (this.batteryInfo?.chargingLevel && this.batteryInfo.chargingLevel < 0.3) {
      this.enableBatterySavingMode()
    }
  }

  private enableBatterySavingMode(): void {
    this.config.batterySavingMode = true
    this.config.reducedMotion = true
    this.config.prefetchStrategy = 'minimal' as unknown

    // Reduce CPU-intensive operations
    this.reduceAnimations()
    this.optimizeRenderingFrequency()
    this.disableNonEssentialFeatures()

    // Notify UI
    document.documentElement.setAttribute('data-battery-saving', 'true')
    window.dispatchEvent(new CustomEvent('battery-saving-enabled'))
  }

  // Image Optimization
  private setupImageOptimization(): void {
    if (!this.config.optimizeImages) return

    // Lazy load images
    if (this.config.enableLazyLoading) {
      this.setupLazyLoading()
    }

    // Optimize image formats
    this.optimizeImageFormats()

    // Responsive images
    this.setupResponsiveImages()
  }

  private setupLazyLoading(): void {
    const images = document.querySelectorAll('img[data-src]')

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              img.src = img.dataset.src || ''
              img.classList.remove('lazy')
              imageObserver.unobserve(img)
            }
          })
        },
        {
          rootMargin: '50px',
        }
      )

      images.forEach((img) => imageObserver.observe(img))
    } else {
      // Fallback for browsers without IntersectionObserver
      images.forEach((img) => {
        const image = img as HTMLImageElement
        image.src = image.dataset.src || ''
      })
    }
  }

  private optimizeImageFormats(): void {
    // Check for WebP support
    const webpSupported = this.checkWebPSupport()
    const avifSupported = this.checkAVIFSupport()

    if (avifSupported || webpSupported) {
      this.replaceImageFormats(avifSupported ? 'avif' : 'webp')
    }
  }

  private checkWebPSupport(): boolean {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }

  private checkAVIFSupport(): boolean {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
  }

  private replaceImageFormats(format: 'webp' | 'avif'): void {
    const images = document.querySelectorAll('img')
    images.forEach((img) => {
      const src = img.src
      if (src && !src.includes(`.${format}`)) {
        // This would typically be handled by the server/CDN
        const optimizedSrc = src.replace(/\.(jpg|jpeg|png)$/i, `.${format}`)
        img.src = optimizedSrc
      }
    })
  }

  private setupResponsiveImages(): void {
    const images = document.querySelectorAll('img[data-responsive]')

    images.forEach((img) => {
      const image = img as HTMLImageElement
      const devicePixelRatio = window.devicePixelRatio || 1
      const width = image.offsetWidth * devicePixelRatio

      // Generate responsive URLs (typically handled by CDN)
      const baseSrc = image.dataset.responsive || image.src
      const responsiveSrc = `${baseSrc}?w=${Math.round(width)}&q=85&f=auto`

      image.src = responsiveSrc
    })
  }

  // Green Mode Features
  private enableGreenModeIfNeeded(): void {
    const shouldEnableGreenMode =
      this.energyProfile === 'low' ||
      this.config.enableGreenMode ||
      (this.batteryInfo?.chargingLevel && this.batteryInfo.chargingLevel < 0.2)

    if (shouldEnableGreenMode) {
      this.enableGreenMode()
    }
  }

  private enableGreenMode(): void {
    this.config.enableGreenMode = true

    // Apply green optimizations
    this.enableDarkMode()
    this.reduceAnimations()
    this.optimizeRenderingFrequency()
    this.enableAggressiveCaching()

    // Set CSS variables for green mode
    document.documentElement.style.setProperty('--green-mode', '1')
    document.documentElement.setAttribute('data-green-mode', 'true')

    // Notify components
    window.dispatchEvent(new CustomEvent('green-mode-enabled'))
  }

  // Performance Optimizations
  private reduceAnimations(): void {
    document.documentElement.style.setProperty('--animation-duration', '0.1s')
    document.documentElement.style.setProperty('--transition-duration', '0.1s')

    // Disable complex animations
    const style = document.createElement('style')
    style.textContent = `
      * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
      }
      .complex-animation {
        animation: none !important;
      }
    `
    document.head.appendChild(style)
  }

  private optimizeRenderingFrequency(): void {
    // Throttle scroll events
    let scrollTimeout: NodeJS.Timeout
    window.addEventListener(
      'scroll',
      () => {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          window.dispatchEvent(new CustomEvent('throttled-scroll'))
        }, 16) // 60fps max
      },
      { passive: true }
    )

    // Optimize resize events
    let resizeTimeout: NodeJS.Timeout
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('throttled-resize'))
      }, 100)
    })
  }

  private disableNonEssentialFeatures(): void {
    // Disable auto-playing videos
    const videos = document.querySelectorAll('video[autoplay]')
    videos.forEach((video) => {
      ;(video as HTMLVideoElement).autoplay = false
    })

    // Reduce polling frequency
    window.dispatchEvent(new CustomEvent('reduce-polling-frequency'))

    // Disable non-critical background processes
    window.dispatchEvent(new CustomEvent('disable-background-processes'))
  }

  private enableDarkMode(): void {
    if (!document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('green-mode-dark', 'true')
    }
  }

  private enableAggressiveCaching(): void {
    this.config.cacheStrategy = 'aggressive'

    // Register aggressive caching strategy with service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({
          type: 'ENABLE_AGGRESSIVE_CACHING',
        })
      })
    }
  }

  private setupIntersectionObserver(): void {
    // Lazy load non-critical sections
    const lazyElements = document.querySelectorAll('[data-lazy-section]')

    if ('IntersectionObserver' in window && lazyElements.length > 0) {
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const element = entry.target as HTMLElement
              element.classList.add('lazy-loaded')

              // Trigger lazy loading
              const event = new CustomEvent('lazy-section-loaded', { detail: element })
              element.dispatchEvent(event)

              sectionObserver.unobserve(element)
            }
          })
        },
        {
          rootMargin: '100px',
        }
      )

      lazyElements.forEach((element) => sectionObserver.observe(element))
    }
  }

  private enableDataSaverMode(): void {
    // Reduce image quality
    this.optimizeImagesForDataSaver()

    // Disable autoplay
    this.disableAutoplay()

    // Reduce prefetching
    this.config.prefetchStrategy = 'minimal' as unknown
  }

  private optimizeImagesForDataSaver(): void {
    const images = document.querySelectorAll('img')
    images.forEach((img) => {
      const src = img.src
      if (src && !src.includes('q=')) {
        // Reduce quality for data saving
        const dataSaverSrc = src.includes('?') ? src + '&q=60&f=auto' : src + '?q=60&f=auto'
        img.src = dataSaverSrc
      }
    })
  }

  private disableAutoplay(): void {
    const mediaElements = document.querySelectorAll('video, audio')
    mediaElements.forEach((element) => {
      const media = element as HTMLMediaElement
      media.autoplay = false
      media.preload = 'none'
    })
  }

  // Metrics and Reporting
  private startMetricsCollection(): void {
    // Collect bundle size information
    this.calculateBundleSize()

    // Monitor cache performance
    this.monitorCachePerformance()

    // Calculate energy score
    this.calculateEnergyScore()
  }

  private calculateBundleSize(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const jsResources = resources.filter((r) => r.name.includes('.js'))
      const cssResources = resources.filter((r) => r.name.includes('.css'))

      const totalSize = [...jsResources, ...cssResources].reduce((sum, resource) => {
        return sum + (resource.transferSize || 0)
      }, 0)

      this.updateMetrics({ bundleSize: totalSize })
    }
  }

  private monitorCachePerformance(): void {
    if ('performance' in window) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const cachedResources = resources.filter((r) => r.transferSize === 0)
      const totalResources = resources.length

      const cacheHitRate = totalResources > 0 ? (cachedResources.length / totalResources) * 100 : 0
      this.updateMetrics({ cacheHitRate })
    }
  }

  private calculateEnergyScore(): void {
    // Simplified energy scoring algorithm
    let score = 100

    // Penalize large bundle sizes
    if (this.metrics?.bundleSize) {
      const sizePenalty = Math.min(30, (this.metrics.bundleSize / 1024 / 1024) * 5) // 5 points per MB
      score -= sizePenalty
    }

    // Reward good cache performance
    if (this.metrics?.cacheHitRate) {
      score += (this.metrics.cacheHitRate - 50) * 0.2 // Bonus for cache hit rate above 50%
    }

    // Penalize slow load times
    if (this.metrics?.loadTime) {
      const timePenalty = Math.min(20, (this.metrics.loadTime / 1000) * 10) // 10 points per second
      score -= timePenalty
    }

    // Reward green optimizations
    if (this.config.enableGreenMode) score += 10
    if (this.config.reducedMotion) score += 5
    if (this.config.batterySavingMode) score += 15

    this.updateMetrics({ energyScore: Math.max(0, Math.min(100, score)) })
  }

  private trackResourceEfficiency(resource: PerformanceResourceTiming): void {
    const compressionRatio =
      resource.encodedBodySize > 0 ? resource.decodedBodySize / resource.encodedBodySize : 1

    if (compressionRatio > 1.5) {
      console.log(
        '[Green Computing] Good compression detected:',
        resource.name,
        compressionRatio.toFixed(2)
      )
    }

    this.updateMetrics({ compressionRatio })
  }

  // Public API
  public updateMetrics(newMetrics: Partial<PerformanceMetrics>): void {
    this.metrics = { ...this.metrics, ...newMetrics } as PerformanceMetrics

    // Calculate carbon footprint
    if (this.metrics) {
      this.metrics.carbonFootprint = this.calculateCarbonFootprint(this.metrics)
    }

    // Dispatch update event
    window.dispatchEvent(
      new CustomEvent('green-metrics-updated', {
        detail: this.metrics,
      })
    )
  }

  private calculateCarbonFootprint(metrics: PerformanceMetrics): number {
    // Simplified carbon calculation (grams CO2 per page view)
    const baseCarbon = 0.5 // Base carbon per page view
    const sizeMultiplier = (metrics.bundleSize / 1024 / 1024) * 0.1 // 0.1g per MB
    const timeMultiplier = (metrics.loadTime / 1000) * 0.05 // 0.05g per second

    let totalCarbon = baseCarbon + sizeMultiplier + timeMultiplier

    // Apply green optimizations discount
    if (this.config.enableGreenMode) totalCarbon *= 0.7
    if (this.config.batterySavingMode) totalCarbon *= 0.8
    if (metrics.cacheHitRate > 80) totalCarbon *= 0.9

    return Math.max(0.1, totalCarbon) // Minimum 0.1g
  }

  public getMetrics(): PerformanceMetrics | null {
    return this.metrics
  }

  public getConfig(): GreenOptimizationConfig {
    return { ...this.config }
  }

  public updateConfig(newConfig: Partial<GreenOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // Apply configuration changes
    if (newConfig.enableGreenMode !== undefined) {
      if (newConfig.enableGreenMode) {
        this.enableGreenMode()
      } else {
        this.disableGreenMode()
      }
    }
  }

  private disableGreenMode(): void {
    this.config.enableGreenMode = false
    document.documentElement.removeAttribute('data-green-mode')
    document.documentElement.style.removeProperty('--green-mode')
    window.dispatchEvent(new CustomEvent('green-mode-disabled'))
  }

  public generateSustainabilityReport(): {
    score: number
    metrics: PerformanceMetrics | null
    optimizations: string[]
    carbonSavings: number
  } {
    const optimizations: string[] = []
    let carbonSavings = 0

    if (this.config.enableGreenMode) {
      optimizations.push('Green mode enabled (30% energy reduction)')
      carbonSavings += 0.3
    }

    if (this.config.batterySavingMode) {
      optimizations.push('Battery saving mode active (20% energy reduction)')
      carbonSavings += 0.2
    }

    if (this.config.enableLazyLoading) {
      optimizations.push('Lazy loading enabled (reduces initial load)')
      carbonSavings += 0.15
    }

    if (this.metrics?.cacheHitRate && this.metrics.cacheHitRate > 80) {
      optimizations.push('High cache efficiency (reduces network requests)')
      carbonSavings += 0.1
    }

    return {
      score: this.metrics?.energyScore || 0,
      metrics: this.metrics,
      optimizations,
      carbonSavings: carbonSavings * 100, // Convert to percentage
    }
  }

  public cleanup(): void {
    // Clean up observers
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
  }
}

// Export singleton instance
export const greenComputingOptimizer = new GreenComputingOptimizer()

// React hook for easy integration
export function useGreenComputing() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null)
  const [isGreenModeEnabled, setIsGreenModeEnabled] = React.useState(false)

  React.useEffect(() => {
    const handleMetricsUpdate = (event: CustomEvent) => {
      setMetrics(event.detail)
    }

    const handleGreenModeEnabled = () => setIsGreenModeEnabled(true)
    const handleGreenModeDisabled = () => setIsGreenModeEnabled(false)

    window.addEventListener('green-metrics-updated', handleMetricsUpdate as unknown)
    window.addEventListener('green-mode-enabled', handleGreenModeEnabled)
    window.addEventListener('green-mode-disabled', handleGreenModeDisabled)

    // Initialize
    setMetrics(greenComputingOptimizer.getMetrics())
    setIsGreenModeEnabled(greenComputingOptimizer.getConfig().enableGreenMode)

    return () => {
      window.removeEventListener('green-metrics-updated', handleMetricsUpdate as unknown)
      window.removeEventListener('green-mode-enabled', handleGreenModeEnabled)
      window.removeEventListener('green-mode-disabled', handleGreenModeDisabled)
    }
  }, [])

  return {
    metrics,
    isGreenModeEnabled,
    enableGreenMode: () => greenComputingOptimizer.updateConfig({ enableGreenMode: true }),
    disableGreenMode: () => greenComputingOptimizer.updateConfig({ enableGreenMode: false }),
    getConfig: () => greenComputingOptimizer.getConfig(),
    updateConfig: (config: Partial<GreenOptimizationConfig>) =>
      greenComputingOptimizer.updateConfig(config),
    generateReport: () => greenComputingOptimizer.generateSustainabilityReport(),
  }
}

// Import React for the hook
import React from 'react'
