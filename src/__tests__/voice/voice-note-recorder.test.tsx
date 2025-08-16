/**
 * CoreFlow360 - Voice Note Recorder Component Tests
 * Unit tests for voice dictation UI component
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VoiceNoteRecorder } from '@/components/voice/VoiceNoteRecorder'
import { useVoiceNoteWebSocket } from '@/hooks/useVoiceNoteWebSocket'
import '@testing-library/jest-dom'

// Mock dependencies
jest.mock('@/hooks/useVoiceNoteWebSocket')
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'user-123' } } })
}))

// Mock MediaRecorder
const mockMediaRecorder = {
  start: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  ondataavailable: null,
  onstop: null,
  onerror: null,
  state: 'inactive'
}

global.MediaRecorder = jest.fn(() => mockMediaRecorder) as any
global.MediaRecorder.isTypeSupported = jest.fn(() => true)

// Mock getUserMedia
const mockGetUserMedia = jest.fn()
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: { getUserMedia: mockGetUserMedia },
  writable: true
});

describe('VoiceNoteRecorder', () => {
  let mockWebSocket: any
  const mockOnNoteSaved = jest.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset MediaRecorder state
    mockMediaRecorder.state = 'inactive'
    
    // Mock WebSocket hook
    mockWebSocket = {
      isConnected: true,
      isConnecting: false,
      error: null,
      transcriptionActive: false,
      connect: jest.fn(),
      disconnect: jest.fn(),
      startTranscription: jest.fn(),
      stopTranscription: jest.fn()
    }
    
    ;(useVoiceNoteWebSocket as jest.Mock).mockReturnValue(mockWebSocket)
    
    // Mock successful getUserMedia
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }]
    })
  })

  describe('Initial Render', () => {
    it('should render record button in idle state', () => {
      render(<VoiceNoteRecorder customerId="cust-123" />)
      
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      expect(recordButton).toBeInTheDocument()
      expect(recordButton).not.toBeDisabled()
    })

    it('should show connection status', () => {
      render(<VoiceNoteRecorder customerId="cust-123" />)
      
      expect(screen.getByText(/connected/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/connection status/i)).toHaveClass('statusConnected')
    })

    it('should display keyboard shortcuts on desktop', () => {
      render(<VoiceNoteRecorder customerId="cust-123" />)
      
      expect(screen.getByText(/space.*start\/stop/i)).toBeInTheDocument()
      expect(screen.getByText(/p.*pause/i)).toBeInTheDocument()
    })
  })

  describe('Recording Flow', () => {
    it('should start recording on button click', async () => {
      render(<VoiceNoteRecorder customerId="cust-123" />)
      
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      await user.click(recordButton)
      
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      expect(mockMediaRecorder.start).toHaveBeenCalledWith(100)
      expect(mockWebSocket.startTranscription).toHaveBeenCalled()
    })

    it('should handle microphone permission denied', async () => {
      mockGetUserMedia.mockRejectedValueOnce(new DOMException('Permission denied', 'NotAllowedError'))
      
      render(<VoiceNoteRecorder customerId="cust-123" />)
      
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      await user.click(recordButton)
      
      await waitFor(() => {
        expect(screen.getByText(/microphone access denied/i)).toBeInTheDocument()
      })
    })

    it('should show recording state and duration', async () => {
      jest.useFakeTimers()
      
      render(<VoiceNoteRecorder customerId="cust-123" />)
      
      const recordButton = screen.getByRole('button', { name: /start recording/i })
      await user.click(recordButton)
      
      act(() => {
        mockMediaRecorder.state = 'recording'
      })
      
      // Check recording indicator
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument()
      expect(screen.getByText('00:00')).toBeInTheDocument()
      
      // Advance time
      act(() => {
        jest.advanceTimersByTime(5000)
      })
      
      expect(screen.getByText('00:05')).toBeInTheDocument()
      
      jest.useRealTimers()
    })

    it('should pause and resume recording', async () => {
      render(<VoiceNoteRecorder customerId="cust-123" />)
      
      // Start recording
      await user.click(screen.getByRole('button', { name: /start recording/i }))
      act(() => {
        mockMediaRecorder.state = 'recording'
      })
      
      // Pause
      const pauseButton = screen.getByRole('button', { name: /pause recording/i })
      await user.click(pauseButton)
      
      expect(mockMediaRecorder.pause).toHaveBeenCalled()
      act(() => {
        mockMediaRecorder.state = 'paused'
      })
      
      expect(screen.getByText(/paused/i)).toBeInTheDocument()
      
      // Resume
      await user.click(screen.getByRole('button', { name: /resume recording/i }))
      expect(mockMediaRecorder.resume).toHaveBeenCalled()
    })
  })

  describe('Real-time Transcription', () => {
    it('should display transcription in real-time', async () => {
      const { rerender } = render(<VoiceNoteRecorder customerId="cust-123" />)
      
      // Start recording
      await user.click(screen.getByRole('button', { name: /start recording/i }))
      
      // Mock transcription update
      mockWebSocket.transcriptionActive = true
      const mockOnTranscription = (useVoiceNoteWebSocket as jest.Mock).mock.calls[0][0].onTranscription
      
      act(() => {
        mockOnTranscription('Hello, this is a test', false, 0.95)
      })
      
      rerender(<VoiceNoteRecorder customerId="cust-123" />)
      
      expect(screen.getByText(/Hello, this is a test/)).toBeInTheDocument()
    })

    it('should show interim results differently', async () => {
      const { rerender } = render(<VoiceNoteRecorder customerId="cust-123" />)
      
      await user.click(screen.getByRole('button', { name: /start recording/i }))
      
      const mockOnTranscription = (useVoiceNoteWebSocket as jest.Mock).mock.calls[0][0].onTranscription
      
      // Final transcription
      act(() => {
        mockOnTranscription('Hello world', true, 0.98)
      })
      
      // Interim transcription
      act(() => {
        mockOnTranscription('How are you', false, 0.85)
      })
      
      rerender(<VoiceNoteRecorder customerId="cust-123" />)
      
      const transcriptBox = screen.getByRole('textbox', { name: /transcription/i })
      expect(transcriptBox).toHaveTextContent('Hello world How are you')
      
      // Check interim styling
      const interimText = screen.getByText('How are you')
      expect(interimText).toHaveClass('interimText')
    })

    it('should auto-scroll transcription', async () => {
      render(<VoiceNoteRecorder customerId="cust-123" />)
      
      await user.click(screen.getByRole('button', { name: /start recording/i }))
      
      const transcriptBox = screen.getByRole('textbox', { name: /transcription/i })
      const scrollSpy = jest.spyOn(transcriptBox, 'scrollTop', 'set')
      
      const mockOnTranscription = (useVoiceNoteWebSocket as jest.Mock).mock.calls[0][0].onTranscription
      
      // Add multiple transcriptions
      for (let i = 0; i < 20; i++) {
        act(() => {
          mockOnTranscription(`Line ${i} of transcription. `, true, 0.95)
        })
      }
      
      expect(scrollSpy).toHaveBeenCalled()
    })
  })

  describe('Saving Voice Notes', () => {
    it('should save voice note on stop', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'note-123', title: 'Test Note' })
      })
      
      render(<VoiceNoteRecorder customerId="cust-123" onNoteSaved={mockOnNoteSaved} />)
      
      // Start recording
      await user.click(screen.getByRole('button', { name: /start recording/i }))
      act(() => {
        mockMediaRecorder.state = 'recording'
      })
      
      // Add transcription
      const mockOnTranscription = (useVoiceNoteWebSocket as jest.Mock).mock.calls[0][0].onTranscription
      act(() => {
        mockOnTranscription('This is my voice note', true, 0.95)
      })
      
      // Simulate audio data
      const audioBlob = new Blob(['audio-data'], { type: 'audio/webm' })
      act(() => {
        mockMediaRecorder.ondataavailable?.({ data: audioBlob } as any)
      })
      
      // Stop recording
      await user.click(screen.getByRole('button', { name: /stop recording/i }))
      
      act(() => {
        mockMediaRecorder.state = 'inactive'
        mockMediaRecorder.onstop?.()
      })
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/voice-notes',
          expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData)
          })
        )
      })
      
      expect(mockOnNoteSaved).toHaveBeenCalledWith({
        id: 'note-123',
        title: 'Test Note'
      })
    })

    it('should handle save errors gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'))
      
      render(<VoiceNoteRecorder customerId="cust-123" />)
      
      // Record and stop
      await user.click(screen.getByRole('button', { name: /start recording/i }))
      act(() => {
        mockMediaRecorder.state = 'recording'
        mockMediaRecorder.ondataavailable?.({ data: new Blob(['audio']) } as any)
      })
      
      await user.click(screen.getByRole('button', { name: /stop recording/i }))
      act(() => {
        mockMediaRecorder.state = 'inactive'
        mockMediaRecorder.onstop?.()
      })
      
      await waitFor(() => {
        expect(screen.getByText(/failed to save/i)).toBeInTheDocument()
      })
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should start/stop recording with spacebar', async () => {
      render(<VoiceNoteRecorder customerId="cust-123" />)
      
      // Start with space
      fireEvent.keyDown(document, { key: ' ', code: 'Space' })
      
      await waitFor(() => {
        expect(mockMediaRecorder.start).toHaveBeenCalled()
      })
      
      act(() => {
        mockMediaRecorder.state = 'recording'
      })
      
      // Stop with space
      fireEvent.keyDown(document, { key: ' ', code: 'Space' })
      
      expect(mockMediaRecorder.stop).toHaveBeenCalled()
    })

    it('should pause/resume with P key', async () => {
      render(<VoiceNoteRecorder customerId="cust-123" />)
      
      // Start recording first
      await user.click(screen.getByRole('button', { name: /start recording/i }))
      act(() => {
        mockMediaRecorder.state = 'recording'
      })
      
      // Pause with P
      fireEvent.keyDown(document, { key: 'p', code: 'KeyP' })
      expect(mockMediaRecorder.pause).toHaveBeenCalled()
      
      act(() => {
        mockMediaRecorder.state = 'paused'
      })
      
      // Resume with P
      fireEvent.keyDown(document, { key: 'p', code: 'KeyP' })
      expect(mockMediaRecorder.resume).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<VoiceNoteRecorder customerId="cust-123" />)
      
      expect(screen.getByRole('button', { name: /start recording/i })).toHaveAttribute('aria-label')
      expect(screen.getByRole('textbox', { name: /transcription/i })).toHaveAttribute('aria-label')
      expect(screen.getByLabelText(/recording duration/i)).toBeInTheDocument()
    })

    it('should announce state changes', async () => {
      render(<VoiceNoteRecorder customerId="cust-123" />)
      
      // Check for live region
      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toHaveAttribute('aria-live', 'polite')
      
      // Start recording
      await user.click(screen.getByRole('button', { name: /start recording/i }))
      
      expect(liveRegion).toHaveTextContent(/recording started/i)
    })

    it('should be keyboard navigable', async () => {
      render(<VoiceNoteRecorder customerId="cust-123" />)
      
      // Tab to record button
      await user.tab()
      expect(screen.getByRole('button', { name: /start recording/i })).toHaveFocus()
      
      // Start recording with Enter
      await user.keyboard('{Enter}')
      expect(mockMediaRecorder.start).toHaveBeenCalled()
    })
  })

  describe('Error Recovery', () => {
    it('should recover from WebSocket disconnection', async () => {
      const { rerender } = render(<VoiceNoteRecorder customerId="cust-123" />)
      
      // Simulate disconnection
      mockWebSocket.isConnected = false
      mockWebSocket.error = new Error('Connection lost')
      
      rerender(<VoiceNoteRecorder customerId="cust-123" />)
      
      expect(screen.getByText(/connection lost/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /start recording/i })).not.toBeDisabled()
    })

    it('should handle MediaRecorder errors', async () => {
      render(<VoiceNoteRecorder customerId="cust-123" />)
      
      await user.click(screen.getByRole('button', { name: /start recording/i }))
      
      act(() => {
        mockMediaRecorder.onerror?.(new Event('error'))
      })
      
      expect(screen.getByText(/recording error/i)).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should handle rapid start/stop cycles', async () => {
      render(<VoiceNoteRecorder customerId="cust-123" />)
      
      const recordButton = screen.getByRole('button')
      
      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        await user.click(recordButton)
        act(() => {
          mockMediaRecorder.state = i % 2 === 0 ? 'recording' : 'inactive'
        })
      }
      
      // Should not crash or show errors
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    })

    it('should efficiently update transcription', async () => {
      render(<VoiceNoteRecorder customerId="cust-123" />)
      
      await user.click(screen.getByRole('button', { name: /start recording/i }))
      
      const mockOnTranscription = (useVoiceNoteWebSocket as jest.Mock).mock.calls[0][0].onTranscription
      
      // Simulate rapid transcription updates
      const startTime = performance.now()
      
      for (let i = 0; i < 100; i++) {
        act(() => {
          mockOnTranscription(`Word ${i} `, true, 0.95)
        })
      }
      
      const endTime = performance.now()
      
      // Should handle 100 updates efficiently
      expect(endTime - startTime).toBeLessThan(1000) // Less than 1 second
    })
  })
})