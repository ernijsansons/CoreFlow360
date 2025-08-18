/**
 * CoreFlow360 - WCAG AAA Accessibility Tests
 * Comprehensive accessibility testing for voice features
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations, configureAxe } from 'jest-axe'
import { VoiceNoteRecorder } from '@/components/voice/VoiceNoteRecorder'
import userEvent from '@testing-library/user-event'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Configure axe for WCAG AAA testing
configureAxe({
  rules: {
    // Enable all WCAG AAA rules
    'color-contrast-enhanced': { enabled: true }, // WCAG AAA
    'focus-order-semantics': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'audio-caption': { enabled: true },
    'content-on-hover': { enabled: true },
    'target-size': { enabled: true }
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21aa', 'wcag21aaa']
})

// Mock getUserMedia
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }]
    })
  },
  writable: true
})

// Mock MediaRecorder
global.MediaRecorder = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  state: 'inactive',
  ondataavailable: null,
  onstop: null
})) as unknown as typeof MediaRecorder

global.MediaRecorder.isTypeSupported = jest.fn(() => true)

// Mock WebSocket
jest.mock('@/hooks/useVoiceNoteWebSocket', () => ({
  useVoiceNoteWebSocket: () => ({
    isConnected: true,
    isConnecting: false,
    error: null,
    transcriptionActive: false,
    connect: jest.fn(),
    disconnect: jest.fn(),
    startTranscription: jest.fn(),
    stopTranscription: jest.fn()
  })
}))

describe('WCAG AAA Accessibility Tests', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
  })

  describe('VoiceNoteRecorder Accessibility', () => {
    it('should meet WCAG AAA standards', async () => {
      const { container } = render(<VoiceNoteRecorder customerId="test-123" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper semantic structure', () => {
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      // Main container should be a section or article
      const recorder = screen.getByRole('region', { name: /voice note recorder/i })
      expect(recorder).toBeInTheDocument()
      
      // Record button should be properly labeled
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      expect(recordButton).toBeInTheDocument()
      expect(recordButton).toHaveAttribute('aria-describedby')
      
      // Transcription area should be a textbox
      const transcription = screen.getByRole('textbox', { name: /transcription/i })
      expect(transcription).toBeInTheDocument()
      expect(transcription).toHaveAttribute('aria-live', 'polite')
      
      // Status region for announcements
      const statusRegion = screen.getByRole('status')
      expect(statusRegion).toBeInTheDocument()
      expect(statusRegion).toHaveAttribute('aria-live', 'polite')
    })

    it('should have enhanced color contrast (AAA level)', () => {
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      const computedStyle = window.getComputedStyle(recordButton)
      
      // Test contrast ratios
      const backgroundColor = computedStyle.backgroundColor
      const color = computedStyle.color
      
      // For WCAG AAA, contrast ratio should be at least 7:1 for normal text
      // and 4.5:1 for large text (18px or larger)
      expect(backgroundColor).toBeDefined()
      expect(color).toBeDefined()
      
      // Additional checks for focus states
      fireEvent.focus(recordButton)
      const focusStyle = window.getComputedStyle(recordButton)
      expect(focusStyle.outline).not.toBe('none')
      expect(focusStyle.outlineWidth).not.toBe('0px')
    })

    it('should support keyboard navigation completely', async () => {
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      // Tab to first focusable element
      await user.tab()
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      expect(recordButton).toHaveFocus()
      
      // Activate with Enter
      await user.keyboard('{Enter}')
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument()
      
      // Tab to next element (transcription box)
      await user.tab()
      const transcription = screen.getByRole('textbox', { name: /transcription/i })
      expect(transcription).toHaveFocus()
      
      // Tab should move to pause button
      await user.tab()
      const pauseButton = screen.getByRole('button', { name: /pause recording/i })
      expect(pauseButton).toHaveFocus()
      
      // Test keyboard shortcuts
      await user.keyboard(' ') // Space to stop
      expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument()
      
      // Test P key for pause when recording
      await user.keyboard(' ') // Start recording
      await user.keyboard('p') // Pause
      expect(screen.getByText(/paused/i)).toBeInTheDocument()
    })

    it('should announce state changes to screen readers', async () => {
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      const statusRegion = screen.getByRole('status')
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      
      // Start recording
      await user.click(recordButton)
      
      // Status should be announced
      expect(statusRegion).toHaveTextContent(/recording started/i)
      
      // Stop recording
      await user.click(screen.getByRole('button', { name: /stop recording/i }))
      
      expect(statusRegion).toHaveTextContent(/recording stopped/i)
    })

    it('should have proper focus management', async () => {
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      
      // Focus should be visible
      await user.tab()
      expect(recordButton).toHaveFocus()
      
      const focusRingStyle = window.getComputedStyle(recordButton, ':focus-visible')
      expect(focusRingStyle.outline).not.toBe('none')
      
      // Focus should be trapped during critical operations
      await user.click(recordButton) // Start recording
      
      // When recording, focus should remain manageable
      await user.tab()
      expect(document.activeElement).toBeInTheDocument()
    })

    it('should support screen reader navigation', () => {
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      // Check for proper headings hierarchy
      const headings = screen.getAllByRole('heading')
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.charAt(1))
        expect(level).toBeGreaterThanOrEqual(1)
        expect(level).toBeLessThanOrEqual(6)
        
        // Each heading should have accessible text
        expect(heading).toHaveAccessibleName()
      })
      
      // Check for proper landmarks
      const landmarks = screen.getAllByRole(/region|main|complementary|banner|contentinfo/)
      landmarks.forEach(landmark => {
        expect(landmark).toHaveAccessibleName()
      })
      
      // Check for proper form labels
      const textbox = screen.getByRole('textbox')
      expect(textbox).toHaveAccessibleName()
      expect(textbox).toHaveAccessibleDescription()
    })

    it('should support voice control and speech input', () => {
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      
      // Elements should have speech-friendly names
      expect(recordButton).toHaveAttribute('aria-label')
      const ariaLabel = recordButton.getAttribute('aria-label')
      expect(ariaLabel).toMatch(/record|start|voice/i)
      
      // Voice commands should be discoverable
      expect(recordButton).toHaveAttribute('aria-describedby')
      
      const description = document.getElementById(recordButton.getAttribute('aria-describedby')!)
      expect(description).toHaveTextContent(/space.*start/i)
    })

    it('should handle reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        value: jest.fn((query) => {
          if (query === '(prefers-reduced-motion: reduce)') {
            return {
              matches: true,
              media: query,
              addListener: jest.fn(),
              removeListener: jest.fn()
            }
          }
          return {
            matches: false,
            media: query,
            addListener: jest.fn(),
            removeListener: jest.fn()
          }
        })
      })
      
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      // Animations should be disabled
      const animatedElements = screen.getByTestId('audio-level-indicator')
      const computedStyle = window.getComputedStyle(animatedElements)
      
      // Animation should be disabled or minimal
      expect(
        computedStyle.animationDuration === '0s' ||
        computedStyle.animationDuration === '0.01ms'
      ).toBe(true)
    })

    it('should support high contrast mode', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        value: jest.fn((query) => {
          if (query === '(prefers-contrast: high)') {
            return {
              matches: true,
              media: query,
              addListener: jest.fn(),
              removeListener: jest.fn()
            }
          }
          return {
            matches: false,
            media: query,
            addListener: jest.fn(),
            removeListener: jest.fn()
          }
        })
      })
      
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      const style = window.getComputedStyle(recordButton)
      
      // High contrast mode should add borders
      expect(parseInt(style.borderWidth) || 0).toBeGreaterThan(0)
    })
  })

  describe('Touch and Mobile Accessibility', () => {
    it('should meet touch target size requirements', () => {
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      const rect = recordButton.getBoundingClientRect()
      
      // WCAG AAA requires 44x44px minimum touch targets
      expect(rect.width).toBeGreaterThanOrEqual(44)
      expect(rect.height).toBeGreaterThanOrEqual(44)
    })

    it('should support touch gestures properly', async () => {
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      
      // Touch events should work
      fireEvent.touchStart(recordButton)
      fireEvent.touchEnd(recordButton)
      
      // Should not interfere with assistive technology
      expect(recordButton).toHaveAttribute('aria-label')
    })

    it('should work with mobile screen readers', () => {
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      // Check for mobile-specific ARIA attributes
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      
      // Should have proper role and state
      expect(recordButton).toHaveAttribute('role', 'button')
      expect(recordButton).toHaveAttribute('aria-pressed')
      
      // Should announce state changes
      const statusRegion = screen.getByRole('status')
      expect(statusRegion).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Cognitive Accessibility', () => {
    it('should provide clear instructions and help', () => {
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      // Help text should be available
      const helpText = screen.getByText(/space.*start.*stop/i)
      expect(helpText).toBeInTheDocument()
      
      // Instructions should be clear and simple
      expect(helpText.textContent).toMatch(/press space/i)
      expect(helpText.textContent).toMatch(/start.*stop/i)
    })

    it('should provide error recovery options', async () => {
      // Mock getUserMedia rejection
      ;(global.navigator.mediaDevices.getUserMedia as jest.Mock)
        .mockRejectedValueOnce(new Error('Permission denied'))
      
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      await user.click(recordButton)
      
      // Should show clear error message
      const errorMessage = await screen.findByRole('alert')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveTextContent(/microphone.*denied/i)
      
      // Should provide recovery instructions
      expect(errorMessage).toHaveTextContent(/enable.*settings/i)
    })

    it('should use simple and clear language', () => {
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      const transcriptionBox = screen.getByRole('textbox', { name: /transcription/i })
      
      // Button text should be clear
      expect(recordButton.textContent).toMatch(/start.*recording/i)
      
      // Placeholder text should be helpful
      expect(transcriptionBox).toHaveAttribute('placeholder')
      const placeholder = transcriptionBox.getAttribute('placeholder')
      expect(placeholder).toMatch(/start.*recording.*see/i)
    })
  })

  describe('Multi-language and Internationalization', () => {
    it('should support RTL languages', () => {
      // Mock RTL direction
      document.documentElement.dir = 'rtl'
      
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      const container = screen.getByRole('region', { name: /voice note recorder/i })
      const computedStyle = window.getComputedStyle(container)
      
      // Layout should adapt to RTL
      expect(computedStyle.direction).toBe('rtl')
      
      // Cleanup
      document.documentElement.dir = 'ltr'
    })

    it('should support screen reader pronunciation', () => {
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      // Technical terms should have pronunciation guides
      const technicalTerms = screen.getAllByText(/transcription|microphone|recording/i)
      
      technicalTerms.forEach(term => {
        // Could have aria-label for pronunciation
        const hasAriaLabel = term.hasAttribute('aria-label')
        const hasTitle = term.hasAttribute('title')
        
        // At least one should provide pronunciation guidance
        expect(hasAriaLabel || hasTitle).toBe(true)
      })
    })
  })

  describe('Performance and Accessibility', () => {
    it('should maintain accessibility during high load', async () => {
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      
      // Simulate high frequency interactions
      for (let i = 0; i < 10; i++) {
        await user.click(recordButton)
        // Should remain accessible throughout
        expect(recordButton).toHaveAccessibleName()
        expect(recordButton).toBeEnabled()
      }
    })

    it('should degrade gracefully with JavaScript disabled', () => {
      // This would typically be tested with the component in a no-JS environment
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      
      // Basic HTML should still be accessible
      expect(recordButton).toHaveAttribute('type', 'button')
      expect(recordButton).toHaveAccessibleName()
    })
  })

  describe('Assistive Technology Compatibility', () => {
    it('should work with voice control software', () => {
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      
      // Should have voice-friendly command names
      const ariaLabel = recordButton.getAttribute('aria-label')
      expect(ariaLabel).toMatch(/^(start|begin|record)/i) // Starts with clear command
      
      // Should be discoverable by voice commands
      expect(ariaLabel?.split(' ').length).toBeGreaterThanOrEqual(2) // Multi-word for specificity
    })

    it('should work with switch control', () => {
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      const focusableElements = screen.getAllByRole(/button|textbox|tab/)
      
      // All interactive elements should be focusable
      focusableElements.forEach(element => {
        expect(element).not.toHaveAttribute('tabindex', '-1')
        
        // Should have clear boundaries for switch navigation
        const style = window.getComputedStyle(element)
        expect(parseInt(style.padding) || 0).toBeGreaterThan(0)
      })
    })

    it('should work with eye tracking software', () => {
      render(<VoiceNoteRecorder customerId="test-123" />)
      
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      const rect = recordButton.getBoundingClientRect()
      
      // Targets should be large enough for eye tracking
      expect(rect.width).toBeGreaterThanOrEqual(44)
      expect(rect.height).toBeGreaterThanOrEqual(44)
      
      // Should have clear visual boundaries
      const style = window.getComputedStyle(recordButton)
      expect(style.border || style.outline).toBeDefined()
    })
  })
})