/**
 * CoreFlow360 - Voice Dictation E2E Tests
 * End-to-end testing for complete dictation flow
 */

import { test, expect, chromium, Page, BrowserContext } from '@playwright/test'
import { db } from '@/lib/db'

test.describe('Voice Dictation E2E Flow', () => {
  let context: BrowserContext
  let page: Page
  let mockAudioFile: Buffer

  test.beforeAll(async () => {
    // Create test audio file (simulate 5 seconds of audio)
    mockAudioFile = Buffer.alloc(80000) // 16kHz * 1 channel * 2 bytes * 5 seconds
    mockAudioFile.fill(0x00) // Fill with silence
  })

  test.beforeEach(async () => {
    // Launch browser with media permissions
    const browser = await chromium.launch()
    context = await browser.newContext({
      permissions: ['microphone'],
      extraHTTPHeaders: {
        'feature-policy': 'microphone *',
      },
    })

    page = await context.newPage()

    // Mock getUserMedia
    await page.addInitScript(() => {
      // Mock MediaDevices.getUserMedia
      const mockStream = {
        getTracks: () => [
          {
            stop: () => {},
            kind: 'audio',
            enabled: true,
          },
        ],
        getAudioTracks: () => [
          {
            stop: () => {},
            kind: 'audio',
            enabled: true,
          },
        ],
      }

      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: () => Promise.resolve(mockStream),
        },
      })

      // Mock MediaRecorder
      window.MediaRecorder = class MockMediaRecorder {
        static isTypeSupported() {
          return true
        }

        constructor() {
          this.state = 'inactive'
          this.ondataavailable = null
          this.onstop = null
          this.onerror = null
        }

        start() {
          this.state = 'recording'
          // Simulate recording data after 100ms
          setTimeout(() => {
            if (this.ondataavailable) {
              const audioBlob = new Blob(['mock-audio-data'], { type: 'audio/webm' })
              this.ondataavailable({ data: audioBlob })
            }
          }, 100)
        }

        stop() {
          this.state = 'inactive'
          if (this.onstop) {
            setTimeout(() => this.onstop(), 10)
          }
        }

        pause() {
          this.state = 'paused'
        }

        resume() {
          this.state = 'recording'
        }
      }
    })

    // Mock WebSocket for real-time transcription
    await page.addInitScript(() => {
      const originalWebSocket = window.WebSocket
      window.WebSocket = class MockWebSocket {
        constructor(url) {
          this.url = url
          this.readyState = 1 // OPEN
          this.onopen = null
          this.onmessage = null
          this.onclose = null
          this.onerror = null

          // Simulate connection opened
          setTimeout(() => {
            if (this.onopen) this.onopen({})

            // Simulate transcription messages
            this.simulateTranscription()
          }, 50)
        }

        send(data) {
          // Mock sending data
        }

        close() {
          this.readyState = 3 // CLOSED
          if (this.onclose) this.onclose({})
        }

        simulateTranscription() {
          const transcriptions = [
            { type: 'transcription', transcript: 'Hello', isFinal: false, confidence: 0.8 },
            {
              type: 'transcription',
              transcript: 'Hello, this is',
              isFinal: false,
              confidence: 0.85,
            },
            {
              type: 'transcription',
              transcript: 'Hello, this is a test',
              isFinal: true,
              confidence: 0.95,
            },
            { type: 'transcription', transcript: 'transcription', isFinal: false, confidence: 0.9 },
            {
              type: 'transcription',
              transcript: 'transcription for the voice',
              isFinal: false,
              confidence: 0.92,
            },
            {
              type: 'transcription',
              transcript: 'transcription for the voice note system.',
              isFinal: true,
              confidence: 0.98,
            },
          ]

          transcriptions.forEach((msg, index) => {
            setTimeout(
              () => {
                if (this.onmessage) {
                  this.onmessage({ data: JSON.stringify(msg) })
                }
              },
              200 * (index + 1)
            )
          })
        }
      }
    })

    // Navigate to customer page with voice note recorder
    await page.goto('/dashboard/customers/test-customer')
  })

  test.afterEach(async () => {
    await context.close()
  })

  test('Complete voice dictation flow - record, transcribe, save', async () => {
    // Wait for page to load and voice recorder to be visible
    await page.waitForSelector('[data-testid="voice-note-recorder"]')

    // Check initial state
    const recordButton = page.locator('[data-testid="record-button"]')
    await expect(recordButton).toBeVisible()
    await expect(recordButton).toHaveText(/start recording/i)

    const transcriptionBox = page.locator('[data-testid="transcription-box"]')
    await expect(transcriptionBox).toBeVisible()
    await expect(transcriptionBox).toHaveText(/start recording to see transcription/i)

    // Start recording
    await recordButton.click()

    // Verify recording state
    await expect(recordButton).toHaveText(/stop recording/i)
    await expect(recordButton).toHaveClass(/recordButtonRecording/)

    // Check that duration timer starts
    const durationDisplay = page.locator('[data-testid="duration-display"]')
    await expect(durationDisplay).toBeVisible()
    await expect(durationDisplay).toHaveText('00:00')

    // Wait a bit and check timer progression
    await page.waitForTimeout(1100)
    await expect(durationDisplay).toHaveText('00:01')

    // Check real-time transcription appears
    await page.waitForTimeout(300)
    await expect(transcriptionBox).toContainText('Hello')

    await page.waitForTimeout(200)
    await expect(transcriptionBox).toContainText('Hello, this is')

    await page.waitForTimeout(200)
    await expect(transcriptionBox).toContainText('Hello, this is a test')

    // Wait for more transcription
    await page.waitForTimeout(800)
    await expect(transcriptionBox).toContainText('voice note system')

    // Test pause functionality
    const pauseButton = page.locator('[data-testid="pause-button"]')
    await expect(pauseButton).toBeVisible()
    await pauseButton.click()

    // Check paused state
    await expect(durationDisplay).toContainText(/paused/i)
    await expect(pauseButton).toHaveText(/resume/i)

    // Resume recording
    await pauseButton.click()
    await expect(pauseButton).toHaveText(/pause/i)

    // Stop recording
    await recordButton.click()

    // Verify stopped state
    await expect(recordButton).toHaveText(/start recording/i)
    await expect(recordButton).not.toHaveClass(/recordButtonRecording/)

    // Check final transcription
    await expect(transcriptionBox).toContainText(
      'Hello, this is a test transcription for the voice note system.'
    )

    // Wait for save to complete (should happen automatically)
    await page.waitForSelector('[data-testid="save-success"]', { timeout: 5000 })
    await expect(page.locator('[data-testid="save-success"]')).toBeVisible()

    // Verify success message
    await expect(page.locator('[data-testid="save-success"]')).toContainText(/voice note saved/i)
  })

  test('Keyboard shortcuts functionality', async () => {
    await page.waitForSelector('[data-testid="voice-note-recorder"]')

    const recordButton = page.locator('[data-testid="record-button"]')
    const transcriptionBox = page.locator('[data-testid="transcription-box"]')

    // Start recording with spacebar
    await page.keyboard.press('Space')

    await expect(recordButton).toHaveText(/stop recording/i)

    // Wait for some transcription
    await page.waitForTimeout(500)
    await expect(transcriptionBox).toContainText('Hello')

    // Pause with P key
    await page.keyboard.press('KeyP')

    await expect(page.locator('[data-testid="duration-display"]')).toContainText(/paused/i)

    // Resume with P key
    await page.keyboard.press('KeyP')

    await expect(page.locator('[data-testid="duration-display"]')).not.toContainText(/paused/i)

    // Stop recording with spacebar
    await page.keyboard.press('Space')

    await expect(recordButton).toHaveText(/start recording/i)
  })

  test('Error handling - microphone permission denied', async () => {
    // Override getUserMedia to reject
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: () =>
            Promise.reject(new DOMException('Permission denied', 'NotAllowedError')),
        },
      })
    })

    await page.goto('/dashboard/customers/test-customer')
    await page.waitForSelector('[data-testid="voice-note-recorder"]')

    const recordButton = page.locator('[data-testid="record-button"]')
    await recordButton.click()

    // Should show error message
    await page.waitForSelector('[data-testid="error-message"]')
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      /microphone access denied/i
    )

    // Button should remain in idle state
    await expect(recordButton).toHaveText(/start recording/i)
  })

  test('WebSocket connection error handling', async () => {
    // Override WebSocket to simulate connection failure
    await page.addInitScript(() => {
      window.WebSocket = class MockWebSocket {
        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('Connection failed'))
            }
          }, 100)
        }
        send() {}
        close() {}
      }
    })

    await page.goto('/dashboard/customers/test-customer')
    await page.waitForSelector('[data-testid="voice-note-recorder"]')

    // Should show connection error
    await page.waitForSelector('[data-testid="connection-error"]')
    await expect(page.locator('[data-testid="connection-error"]')).toBeVisible()

    // Recording should still work without real-time transcription
    const recordButton = page.locator('[data-testid="record-button"]')
    await recordButton.click()

    await expect(recordButton).toHaveText(/stop recording/i)

    await page.waitForTimeout(1000)
    await recordButton.click()

    // Should still save successfully
    await page.waitForSelector('[data-testid="save-success"]')
  })

  test('Mobile responsive behavior', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/dashboard/customers/test-customer')
    await page.waitForSelector('[data-testid="voice-note-recorder"]')

    const recordButton = page.locator('[data-testid="record-button"]')

    // Check mobile-optimized button size
    const buttonBox = await recordButton.boundingBox()
    expect(buttonBox?.width).toBeGreaterThanOrEqual(80) // 20x20 touch target
    expect(buttonBox?.height).toBeGreaterThanOrEqual(80)

    // Touch interaction
    await recordButton.tap()

    await expect(recordButton).toHaveText(/stop recording/i)

    // Check transcription box mobile layout
    const transcriptionBox = page.locator('[data-testid="transcription-box"]')
    const transcriptionStyle = await transcriptionBox.evaluate((el) => window.getComputedStyle(el))

    // Should have mobile-optimized scrolling
    expect(transcriptionStyle.webkitOverflowScrolling || transcriptionStyle.overflowScrolling).toBe(
      'touch'
    )

    // Keyboard shortcuts should be hidden on mobile
    await expect(page.locator('[data-testid="keyboard-shortcuts"]')).toBeHidden()
  })

  test('Accessibility compliance', async () => {
    await page.waitForSelector('[data-testid="voice-note-recorder"]')

    // Check ARIA labels
    const recordButton = page.locator('[data-testid="record-button"]')
    await expect(recordButton).toHaveAttribute('aria-label')

    const transcriptionBox = page.locator('[data-testid="transcription-box"]')
    await expect(transcriptionBox).toHaveAttribute('aria-label')

    // Check live region for status updates
    const statusRegion = page.locator('[role="status"]')
    await expect(statusRegion).toBeVisible()
    await expect(statusRegion).toHaveAttribute('aria-live', 'polite')

    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await expect(recordButton).toBeFocused()

    // Start recording with Enter
    await page.keyboard.press('Enter')
    await expect(recordButton).toHaveText(/stop recording/i)

    // Check focus indicators
    const focusedElement = await page.evaluate(() => {
      const focused = document.activeElement
      return window.getComputedStyle(focused, ':focus').getPropertyValue('box-shadow')
    })

    expect(focusedElement).toContain('rgb') // Should have focus ring

    // Check for high contrast support
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' })

    const buttonStyle = await recordButton.evaluate((el) => window.getComputedStyle(el))

    expect(buttonStyle.borderWidth).toBe('2px') // High contrast mode border
  })

  test('Performance benchmarks', async () => {
    await page.goto('/dashboard/customers/test-customer')
    await page.waitForSelector('[data-testid="voice-note-recorder"]')

    const recordButton = page.locator('[data-testid="record-button"]')

    // Measure recording start time
    const startTime = Date.now()
    await recordButton.click()
    await page.waitForSelector('[data-testid="record-button"]:has-text("Stop")')
    const recordingStarted = Date.now()

    // Recording should start within 100ms
    expect(recordingStarted - startTime).toBeLessThan(100)

    // Test transcription latency
    const transcriptionStart = Date.now()
    await page.waitForSelector('[data-testid="transcription-box"]:has-text("Hello")')
    const transcriptionAppeared = Date.now()

    // First transcription should appear within 300ms
    expect(transcriptionAppeared - transcriptionStart).toBeLessThan(300)

    // Wait for recording to accumulate some data
    await page.waitForTimeout(2000)

    // Measure save time
    const saveStart = Date.now()
    await recordButton.click()
    await page.waitForSelector('[data-testid="save-success"]')
    const saveDone = Date.now()

    // Save should complete within 1 second
    expect(saveDone - saveStart).toBeLessThan(1000)
  })

  test('Multiple concurrent recordings', async () => {
    // Open multiple tabs
    const page2 = await context.newPage()
    const page3 = await context.newPage()

    await Promise.all([
      page.goto('/dashboard/customers/test-customer-1'),
      page2.goto('/dashboard/customers/test-customer-2'),
      page3.goto('/dashboard/customers/test-customer-3'),
    ])

    await Promise.all([
      page.waitForSelector('[data-testid="voice-note-recorder"]'),
      page2.waitForSelector('[data-testid="voice-note-recorder"]'),
      page3.waitForSelector('[data-testid="voice-note-recorder"]'),
    ])

    // Start recording on all tabs
    await Promise.all([
      page.click('[data-testid="record-button"]'),
      page2.click('[data-testid="record-button"]'),
      page3.click('[data-testid="record-button"]'),
    ])

    // All should be in recording state
    await Promise.all([
      expect(page.locator('[data-testid="record-button"]')).toHaveText(/stop/i),
      expect(page2.locator('[data-testid="record-button"]')).toHaveText(/stop/i),
      expect(page3.locator('[data-testid="record-button"]')).toHaveText(/stop/i),
    ])

    // Wait for transcriptions
    await page.waitForTimeout(1000)

    // Stop all recordings
    await Promise.all([
      page.click('[data-testid="record-button"]'),
      page2.click('[data-testid="record-button"]'),
      page3.click('[data-testid="record-button"]'),
    ])

    // All should save successfully
    await Promise.all([
      page.waitForSelector('[data-testid="save-success"]'),
      page2.waitForSelector('[data-testid="save-success"]'),
      page3.waitForSelector('[data-testid="save-success"]'),
    ])
  })

  test('Data persistence and retrieval', async () => {
    await page.goto('/dashboard/customers/test-customer')
    await page.waitForSelector('[data-testid="voice-note-recorder"]')

    // Record a note
    await page.click('[data-testid="record-button"]')
    await page.waitForTimeout(2000)
    await page.click('[data-testid="record-button"]')

    // Wait for save
    await page.waitForSelector('[data-testid="save-success"]')

    // Navigate away and back
    await page.goto('/dashboard')
    await page.goto('/dashboard/customers/test-customer')

    // Check that saved notes are displayed
    await page.waitForSelector('[data-testid="voice-notes-list"]')

    const notesList = page.locator('[data-testid="voice-notes-list"]')
    await expect(notesList).toBeVisible()

    // Should contain our transcription
    await expect(notesList).toContainText('Hello, this is a test transcription')

    // Test note playback
    const playButton = page.locator('[data-testid="play-note-button"]').first()
    await playButton.click()

    // Should start playing
    await expect(playButton).toHaveText(/pause/i)
  })
})
