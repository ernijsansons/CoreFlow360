/**
 * CoreFlow360 - Accessibility Utilities
 * WCAG 2.1 AAA compliance utilities for inclusive design
 */

'use client'

import { useEffect, useRef, useState } from 'react'

// WCAG Color Contrast Utilities
export interface ColorContrastResult {
  ratio: number
  wcagAA: boolean
  wcagAAA: boolean
  level: 'fail' | 'aa' | 'aaa'
}

export function calculateColorContrast(color1: string, color2: string): ColorContrastResult {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) {
    return { ratio: 0, wcagAA: false, wcagAAA: false, level: 'fail' }
  }

  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)

  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

  return {
    ratio,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7.0,
    level: ratio >= 7.0 ? 'aaa' : ratio >= 4.5 ? 'aa' : 'fail',
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// Focus Management Hook
export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<Element | null>(null)
  const [keyboardNavigation, setKeyboardNavigation] = useState(false)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      setFocusedElement(e.target as Element)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setKeyboardNavigation(true)
      }
    }

    const handleMouseDown = () => {
      setKeyboardNavigation(false)
    }

    document.addEventListener('focusin', handleFocus)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('focusin', handleFocus)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  const saveFocus = () => {
    previousFocus.current = document.activeElement as HTMLElement
  }

  const restoreFocus = () => {
    if (previousFocus.current && document.contains(previousFocus.current)) {
      previousFocus.current.focus()
    }
  }

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = getFocusableElements(container)
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)

    // Focus first element
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }

  return {
    focusedElement,
    keyboardNavigation,
    saveFocus,
    restoreFocus,
    trapFocus,
  }
}

// Get focusable elements within a container
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ')

  return Array.from(container.querySelectorAll(focusableSelectors)).filter((element) => {
    return (
      element instanceof HTMLElement &&
      !element.hasAttribute('disabled') &&
      element.tabIndex >= 0 &&
      isElementVisible(element)
    )
  }) as HTMLElement[]
}

function isElementVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element)
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0
  )
}

// Screen Reader Announcements
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Skip Links Component
export function useSkipLinks() {
  const skipLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#footer', label: 'Skip to footer' },
  ]

  const SkipLinksComponent = () => (
    <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50">
      {skipLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="mr-2 inline-block rounded-lg bg-violet-600 px-4 py-2 font-medium text-white focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none"
        >
          {link.label}
        </a>
      ))}
    </div>
  )

  return { SkipLinksComponent }
}

// High Contrast Mode Detection
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    // Check for high contrast mode
    const checkHighContrast = () => {
      const testElement = document.createElement('div')
      testElement.style.border = '1px solid'
      testElement.style.borderColor = 'rgb(31, 41, 55)'
      testElement.style.position = 'absolute'
      testElement.style.height = '5px'
      testElement.style.top = '-999px'
      testElement.style.backgroundColor = 'rgb(31, 41, 55)'

      document.body.appendChild(testElement)

      const computedStyle = window.getComputedStyle(testElement)
      const isHighContrast = computedStyle.borderTopColor !== computedStyle.backgroundColor

      document.body.removeChild(testElement)
      setIsHighContrast(isHighContrast)
    }

    checkHighContrast()
    window.addEventListener('resize', checkHighContrast)

    return () => {
      window.removeEventListener('resize', checkHighContrast)
    }
  }, [])

  return isHighContrast
}

// Reduced Motion Detection
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// ARIA Live Region Hook
export function useAriaLiveRegion() {
  const regionRef = useRef<HTMLDivElement>(null)

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (regionRef.current) {
      regionRef.current.setAttribute('aria-live', priority)
      regionRef.current.textContent = message

      // Clear after a delay
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = ''
        }
      }, 1000)
    }
  }

  const LiveRegion = () => (
    <div ref={regionRef} className="sr-only" aria-live="polite" aria-atomic="true" />
  )

  return { announce, LiveRegion }
}

// Keyboard Navigation Utilities
export const KeyboardCodes = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const

export function handleArrowKeyNavigation(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  options: {
    loop?: boolean
    orientation?: 'horizontal' | 'vertical'
    onSelect?: (index: number) => void
  } = {}
): number {
  const { loop = true, orientation = 'vertical', onSelect } = options

  let newIndex = currentIndex

  const isVertical = orientation === 'vertical'
  const upKey = isVertical ? KeyboardCodes.ARROW_UP : KeyboardCodes.ARROW_LEFT
  const downKey = isVertical ? KeyboardCodes.ARROW_DOWN : KeyboardCodes.ARROW_RIGHT

  switch (event.key) {
    case upKey:
      event.preventDefault()
      newIndex = currentIndex > 0 ? currentIndex - 1 : loop ? items.length - 1 : 0
      break
    case downKey:
      event.preventDefault()
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : loop ? 0 : items.length - 1
      break
    case KeyboardCodes.HOME:
      event.preventDefault()
      newIndex = 0
      break
    case KeyboardCodes.END:
      event.preventDefault()
      newIndex = items.length - 1
      break
    case KeyboardCodes.ENTER:
    case KeyboardCodes.SPACE:
      event.preventDefault()
      onSelect?.(currentIndex)
      return currentIndex
  }

  if (newIndex !== currentIndex) {
    items[newIndex]?.focus()
    return newIndex
  }

  return currentIndex
}

// Accessibility Testing Utilities
export interface AccessibilityViolation {
  id: string
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
  description: string
  element: Element
  help: string
}

export async function runBasicAccessibilityChecks(
  container: HTMLElement = document.body
): Promise<AccessibilityViolation[]> {
  const violations: AccessibilityViolation[] = []

  // Check for images without alt text
  const images = container.querySelectorAll('img:not([alt])')
  images.forEach((img) => {
    violations.push({
      id: 'img-alt',
      impact: 'critical',
      description: 'Image without alt attribute',
      element: img,
      help: 'Add an alt attribute to describe the image content',
    })
  })

  // Check for buttons without accessible names
  const buttons = container.querySelectorAll('button:not([aria-label]):not([aria-labelledby])')
  buttons.forEach((button) => {
    if (!button.textContent?.trim()) {
      violations.push({
        id: 'button-name',
        impact: 'critical',
        description: 'Button without accessible name',
        element: button,
        help: 'Add text content, aria-label, or aria-labelledby to the button',
      })
    }
  })

  // Check for form inputs without labels
  const inputs = container.querySelectorAll(
    'input:not([type="hidden"]):not([aria-label]):not([aria-labelledby])'
  )
  inputs.forEach((input) => {
    const id = input.getAttribute('id')
    if (!id || !container.querySelector(`label[for="${id}"]`)) {
      violations.push({
        id: 'label',
        impact: 'critical',
        description: 'Form input without associated label',
        element: input,
        help: 'Add a label element or aria-label attribute',
      })
    }
  })

  // Check for sufficient color contrast
  const textElements = container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, a')
  textElements.forEach((element) => {
    const style = window.getComputedStyle(element)
    const color = style.color
    const backgroundColor = style.backgroundColor

    if (color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
      const contrast = calculateColorContrast(color, backgroundColor)
      if (!contrast.wcagAA) {
        violations.push({
          id: 'color-contrast',
          impact: 'serious',
          description: `Insufficient color contrast (${contrast.ratio.toFixed(2)}:1)`,
          element: element,
          help: 'Ensure color contrast ratio is at least 4.5:1 for normal text',
        })
      }
    }
  })

  return violations
}

// Screen Reader Only CSS Class
export const srOnlyStyles = `
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.focus\\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
`
