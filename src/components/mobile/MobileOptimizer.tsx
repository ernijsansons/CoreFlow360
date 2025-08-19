'use client'

import { useEffect } from 'react'
import { initMobileOptimizations, isMobile, isSlowConnection } from '@/lib/mobile-optimization'

export function MobileOptimizer() {
  useEffect(() => {
    // Initialize mobile optimizations
    initMobileOptimizations()

    // Add mobile-specific CSS classes
    if (isMobile()) {
      document.documentElement.classList.add('mobile-device')

      if (isSlowConnection()) {
        document.documentElement.classList.add('slow-connection')
      }
    }

    // Disable animations on slow connections
    if (isSlowConnection()) {
      const style = document.createElement('style')
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `
      document.head.appendChild(style)
    }

    // Optimize scroll performance
    if (isMobile()) {
      const style = document.createElement('style')
      style.textContent = `
        body {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        
        .mobile-device {
          font-size: 16px; /* Prevent zoom on input focus */
        }
        
        .mobile-device input,
        .mobile-device textarea,
        .mobile-device select {
          font-size: 16px;
        }
        
        .mobile-device button {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        
        .mobile-device .framer-motion-div {
          will-change: auto;
        }
        
        .slow-connection img {
          filter: blur(5px);
          transition: filter 0.3s ease-out;
        }
        
        .slow-connection img[src] {
          filter: none;
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  return null
}
