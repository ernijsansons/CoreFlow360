/**
 * Mobile Performance Optimization Utilities
 * Lightweight utilities for optimizing mobile performance
 */

// Detect mobile device
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false
  return (
    window.innerWidth <= 768 ||
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  )
}

// Detect slow network connection
export const isSlowConnection = (): boolean => {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) return false
  const connection = (navigator as unknown).connection
  return connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g'
}

// Preload critical resources
export const preloadCriticalResources = () => {
  if (typeof document === 'undefined') return

  const criticalResources = ['/fonts/inter-var.woff2', '/images/logo.webp', '/images/hero-bg.webp']

  criticalResources.forEach((href) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = href.includes('.woff') ? 'font' : 'image'
    if (href.includes('.woff')) link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

// Lazy load images with intersection observer
export const createLazyImageObserver = (): IntersectionObserver | null => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return null

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.classList.remove('blur-sm')
            img.classList.add('transition-all', 'duration-300')
          }
        }
      })
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.1,
    }
  )
}

// Optimize animations for mobile
export const getOptimizedAnimationConfig = () => {
  const shouldReduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const isMobileDevice = isMobile()
  const isSlowNetwork = isSlowConnection()

  if (shouldReduceMotion || (isMobileDevice && isSlowNetwork)) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.2 },
    }
  }

  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: isMobileDevice ? 0.3 : 0.6,
      ease: 'easeOut',
    },
  }
}

// Virtual scrolling for large lists
export class VirtualScrollList {
  private container: HTMLElement
  private itemHeight: number
  private visibleCount: number
  private startIndex = 0
  private endIndex = 0

  constructor(container: HTMLElement, itemHeight: number) {
    this.container = container
    this.itemHeight = itemHeight
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2

    this.container.addEventListener('scroll', this.handleScroll.bind(this))
  }

  private handleScroll() {
    const scrollTop = this.container.scrollTop
    this.startIndex = Math.floor(scrollTop / this.itemHeight)
    this.endIndex = Math.min(this.startIndex + this.visibleCount, this.getTotalItems())
    this.updateVisibleItems()
  }

  private getTotalItems(): number {
    // Override this method based on your data
    return 1000
  }

  private updateVisibleItems() {
    // Override this method to update visible items
    
  }
}

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    
    return registration
  } catch (error) {
    
    return null
  }
}

// Critical CSS inlining
export const inlineCriticalCSS = (css: string) => {
  if (typeof document === 'undefined') return

  const style = document.createElement('style')
  style.textContent = css
  style.setAttribute('data-critical', 'true')
  document.head.appendChild(style)
}

// Resource hints
export const addResourceHints = () => {
  if (typeof document === 'undefined') return

  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  ]

  hints.forEach((hint) => {
    const link = document.createElement('link')
    link.rel = hint.rel
    link.href = hint.href
    if (hint.crossOrigin) link.crossOrigin = hint.crossOrigin
    document.head.appendChild(link)
  })
}

// Performance monitoring
export class MobilePerformanceMonitor {
  private metrics: { [key: string]: number } = {}

  startTiming(name: string) {
    this.metrics[`${name}_start`] = performance.now()
  }

  endTiming(name: string) {
    const startTime = this.metrics[`${name}_start`]
    if (startTime) {
      this.metrics[name] = performance.now() - startTime
      console.log(`${name} took ${this.metrics[name]}ms`)
    }
  }

  getMetrics() {
    return this.metrics
  }

  // Monitor Core Web Vitals
  monitorWebVitals() {
    if (typeof window === 'undefined') return

    // First Contentful Paint
    new PerformanceObserver((list) => {
      const entry = list.getEntries()[0]
      
    }).observe({ entryTypes: ['paint'] })

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let cumulativeScore = 0
      list.getEntries().forEach((entry) => {
        if (!(entry as unknown).hadRecentInput) {
          cumulativeScore += (entry as unknown).value
        }
      })
      
    }).observe({ entryTypes: ['layout-shift'] })
  }
}

export const performanceMonitor = new MobilePerformanceMonitor()

// Touch optimization
export const optimizeTouch = () => {
  if (typeof document === 'undefined') return

  // Add touch-action CSS for better scrolling
  const style = document.createElement('style')
  style.textContent = '* { touch-action: manipulation; } .scrollable { -webkit-overflow-scrolling: touch; } button, a { touch-action: manipulation; }'
  document.head.appendChild(style)
}

// Memory optimization
export const optimizeMemory = () => {
  // Clean up event listeners on page unload
  window.addEventListener('beforeunload', () => {
    // Cleanup global variables, event listeners, etc.
    if (window.performance && window.performance.clearMarks) {
      window.performance.clearMarks()
      window.performance.clearMeasures()
    }
  })
}

// Initialize all mobile optimizations
export const initMobileOptimizations = () => {
  if (typeof window === 'undefined') return

  // Only apply optimizations on mobile
  if (!isMobile()) return

  preloadCriticalResources()
  addResourceHints()
  optimizeTouch()
  optimizeMemory()
  registerServiceWorker()
  performanceMonitor.monitorWebVitals()

  console.log('🚀 Mobile optimization initialized')
}
