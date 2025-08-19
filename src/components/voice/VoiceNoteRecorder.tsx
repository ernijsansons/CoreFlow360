'use client'

/**
 * CoreFlow360 - Voice Note Recorder Component
 * One-click dictation with real-time transcription for sales reps
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'

interface VoiceNoteRecorderProps {
  customerId?: string
  leadId?: string
  onNoteSaved?: (note: VoiceNote) => void
  className?: string
}

interface VoiceNote {
  id: string
  transcript: string
  duration: number
  confidence: number
  audioUrl?: string
  createdAt: Date
}

interface TranscriptionSegment {
  text: string
  confidence: number
  isFinal: boolean
  timestamp: number
}

export default function VoiceNoteRecorder({
  customerId,
  leadId,
  onNoteSaved,
  className = '',
}: VoiceNoteRecorderProps) {
  // State management
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected'
  >('disconnected')
  const [audioLevel, setAudioLevel] = useState(0)

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const websocketRef = useRef<WebSocket | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const transcriptSegmentsRef = useRef<TranscriptionSegment[]>([])

  // Check microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission()
    return () => {
      cleanup()
    }
  }, [])

  // Update duration timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording, isPaused])

  /**
   * Check microphone permission
   */
  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      setMicPermission(result.state as 'granted' | 'denied' | 'prompt')

      result.addEventListener('change', () => {
        setMicPermission(result.state as 'granted' | 'denied' | 'prompt')
      })
    } catch (err) {}
  }

  /**
   * Initialize WebSocket connection to Deepgram
   */
  const initializeWebSocket = useCallback(() => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setConnectionStatus('connecting')

    const wsUrl =
      `${process.env.NEXT_PUBLIC_WS_URL || 'wss://api.deepgram.com'}/v1/listen?` +
      new URLSearchParams({
        encoding: 'linear16',
        sample_rate: '16000',
        channels: '1',
        model: 'nova-2',
        language: 'en-US',
        punctuate: 'true',
        interim_results: 'true',
        endpointing: '300',
        vad_events: 'true',
      }).toString()

    const ws = new WebSocket(wsUrl, {
      headers: {
        Authorization: `Token ${process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY}`,
      },
    })

    ws.onopen = () => {
      setConnectionStatus('connected')
      setError(null)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'Results') {
          const result = data.channel.alternatives[0]

          if (result.transcript) {
            const segment: TranscriptionSegment = {
              text: result.transcript,
              confidence: result.confidence || 0,
              isFinal: data.is_final || false,
              timestamp: Date.now(),
            }

            if (data.is_final) {
              // Final transcript - add to main transcript
              transcriptSegmentsRef.current.push(segment)
              setTranscript((prev) => (prev ? `${prev} ${result.transcript}` : result.transcript))
              setInterimTranscript('')
            } else {
              // Interim result - show as preview
              setInterimTranscript(result.transcript)
            }
          }
        }
      } catch (err) {}
    }

    ws.onerror = (event) => {
      setError('Connection error - retrying...')
      setConnectionStatus('disconnected')
      scheduleReconnect()
    }

    ws.onclose = () => {
      setConnectionStatus('disconnected')

      if (isRecording) {
        scheduleReconnect()
      }
    }

    websocketRef.current = ws
  }, [isRecording])

  /**
   * Schedule WebSocket reconnection
   */
  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      if (isRecording) {
        initializeWebSocket()
      }
    }, 3000)
  }

  /**
   * Start recording
   */
  const startRecording = async () => {
    try {
      setError(null)

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream
      setMicPermission('granted')

      // Initialize audio context for visualization
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256

      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      // Start audio level monitoring
      monitorAudioLevel()

      // Initialize WebSocket for real-time transcription
      initializeWebSocket()

      // Setup MediaRecorder for audio recording
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      })

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)

          // Send audio data to WebSocket if connected
          if (websocketRef.current?.readyState === WebSocket.OPEN) {
            event.data.arrayBuffer().then((buffer) => {
              const int16Array = convertFloat32ToInt16(new Float32Array(buffer))
              websocketRef.current?.send(int16Array)
            })
          }
        }
      }

      mediaRecorderRef.current.onerror = (event) => {
        setError('Recording error occurred')
        stopRecording()
      }

      // Start recording
      mediaRecorderRef.current.start(250) // Collect data every 250ms
      setIsRecording(true)
      setDuration(0)
      setTranscript('')
      setInterimTranscript('')
      audioChunksRef.current = []
      transcriptSegmentsRef.current = []
    } catch (err: unknown) {
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please enable microphone permissions.')
        setMicPermission('denied')
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone.')
      } else {
        setError('Failed to start recording. Please try again.')
      }
    }
  }

  /**
   * Stop recording
   */
  const stopRecording = async () => {
    if (!isRecording) return

    setIsRecording(false)
    setIsPaused(false)
    setIsProcessing(true)

    try {
      // Stop media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }

      // Close WebSocket
      if (websocketRef.current) {
        websocketRef.current.close()
        websocketRef.current = null
      }

      // Stop audio stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }

      // Process and save the recording
      if (audioChunksRef.current.length > 0 && (transcript || interimTranscript)) {
        await saveVoiceNote()
      } else {
        setError('No audio recorded or transcribed')
        setIsProcessing(false)
      }
    } catch (err) {
      setError('Failed to save recording')
      setIsProcessing(false)
    }
  }

  /**
   * Pause/Resume recording
   */
  const togglePause = () => {
    if (!isRecording) return

    if (isPaused) {
      mediaRecorderRef.current?.resume()
      setIsPaused(false)
    } else {
      mediaRecorderRef.current?.pause()
      setIsPaused(true)
    }
  }

  /**
   * Monitor audio levels for visualization
   */
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

    const checkLevel = () => {
      if (!isRecording || !analyserRef.current) return

      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      setAudioLevel(average / 255) // Normalize to 0-1

      requestAnimationFrame(checkLevel)
    }

    checkLevel()
  }

  /**
   * Convert Float32Array to Int16Array for Deepgram
   */
  const convertFloat32ToInt16 = (buffer: Float32Array): Int16Array => {
    const int16 = new Int16Array(buffer.length)
    for (let i = 0; i < buffer.length; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]))
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
    return int16
  }

  /**
   * Save voice note to database
   */
  const saveVoiceNote = async () => {
    try {
      const finalTranscript = transcript + (interimTranscript ? ` ${interimTranscript}` : '')

      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, {
        type: mediaRecorderRef.current?.mimeType || 'audio/webm',
      })

      // Calculate average confidence
      const avgConfidence =
        transcriptSegmentsRef.current.length > 0
          ? transcriptSegmentsRef.current.reduce((sum, seg) => sum + seg.confidence, 0) /
            transcriptSegmentsRef.current.length
          : 0.8

      // Prepare form data
      const formData = new FormData()
      formData.append('audio', audioBlob, `voice_note_${Date.now()}.webm`)
      formData.append('transcript', finalTranscript)
      formData.append('duration', duration.toString())
      formData.append('confidence', avgConfidence.toString())

      if (customerId) formData.append('customerId', customerId)
      if (leadId) formData.append('leadId', leadId)

      // Save to database
      const response = await fetch('/api/voice-notes', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to save voice note')
      }

      const savedNote = await response.json()

      // Reset state
      setTranscript('')
      setInterimTranscript('')
      setDuration(0)
      audioChunksRef.current = []
      transcriptSegmentsRef.current = []
      setIsProcessing(false)

      // Notify parent component
      if (onNoteSaved) {
        onNoteSaved(savedNote)
      }

      // Show success message
      showSuccessNotification()
    } catch (err) {
      setError('Failed to save voice note')
      setIsProcessing(false)
    }
  }

  /**
   * Show success notification
   */
  const showSuccessNotification = () => {
    // Implementation depends on your notification system
  }

  /**
   * Cleanup resources
   */
  const cleanup = () => {
    if (isRecording) {
      stopRecording()
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  /**
   * Format duration display
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * Get recording button label for accessibility
   */
  const getRecordButtonLabel = (): string => {
    if (isProcessing) return 'Processing voice note'
    if (isRecording && isPaused) return 'Resume recording'
    if (isRecording) return 'Stop recording'
    return 'Start voice note'
  }

  return (
    <div className={`voice-note-recorder ${className}`}>
      {/* Error Display */}
      {error && (
        <div
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {/* Permission Warning */}
      {micPermission === 'denied' && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
          <span className="font-medium">Microphone access denied.</span> Please enable microphone
          permissions in your browser settings.
        </div>
      )}

      {/* Main Recording Interface */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {/* Recording Controls */}
        <div className="mb-6 flex items-center justify-center">
          <div className="relative">
            {/* Audio Level Visualizer */}
            {isRecording && !isPaused && (
              <div
                className="absolute inset-0 animate-pulse rounded-full bg-blue-500"
                style={{
                  transform: `scale(${1 + audioLevel * 0.3})`,
                  opacity: 0.3,
                }}
              />
            )}

            {/* Main Record Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing || micPermission === 'denied'}
              className={`relative flex h-20 w-20 transform items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
                isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              } ${
                isProcessing || micPermission === 'denied' ? 'cursor-not-allowed opacity-50' : ''
              } focus:ring-4 focus:ring-blue-300 focus:outline-none`}
              aria-label={getRecordButtonLabel()}
              aria-pressed={isRecording}
            >
              {isProcessing ? (
                <svg className="h-8 w-8 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : isRecording ? (
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <rect x="6" y="6" width="8" height="8" rx="1" />
                </svg>
              ) : (
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="6" />
                </svg>
              )}
            </button>

            {/* Pause Button */}
            {isRecording && !isProcessing && (
              <button
                onClick={togglePause}
                className="absolute top-1/2 -right-16 flex h-12 w-12 -translate-y-1/2 transform items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                aria-label={isPaused ? 'Resume recording' : 'Pause recording'}
              >
                {isPaused ? (
                  <svg className="h-5 w-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 4v12l8-6z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <rect x="6" y="4" width="3" height="12" />
                    <rect x="11" y="4" width="3" height="12" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Duration Display */}
        {(isRecording || duration > 0) && (
          <div className="mb-4 text-center">
            <span className="font-mono text-2xl text-gray-700" aria-live="polite">
              {formatDuration(duration)}
            </span>
            {isPaused && <span className="ml-2 text-sm text-gray-500">(Paused)</span>}
          </div>
        )}

        {/* Connection Status */}
        {isRecording && (
          <div className="mb-4 flex items-center justify-center">
            <div
              className={`flex items-center text-sm ${connectionStatus === 'connected' ? 'text-green-600' : ''} ${connectionStatus === 'connecting' ? 'text-yellow-600' : ''} ${connectionStatus === 'disconnected' ? 'text-red-600' : ''} `}
            >
              <div
                className={`mr-2 h-2 w-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-600' : ''} ${connectionStatus === 'connecting' ? 'animate-pulse bg-yellow-600' : ''} ${connectionStatus === 'disconnected' ? 'bg-red-600' : ''} `}
              />
              {connectionStatus === 'connected' && 'Connected'}
              {connectionStatus === 'connecting' && 'Connecting...'}
              {connectionStatus === 'disconnected' && 'Disconnected'}
            </div>
          </div>
        )}

        {/* Transcription Display */}
        {(transcript || interimTranscript || isRecording) && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-gray-700">Transcription</h3>
            <div
              className="max-h-[200px] min-h-[100px] overflow-y-auto rounded-lg bg-gray-50 p-4"
              aria-live="polite"
              aria-label="Voice note transcription"
            >
              <p className="whitespace-pre-wrap text-gray-800">
                {transcript}
                {interimTranscript && (
                  <span className="text-gray-500 italic"> {interimTranscript}</span>
                )}
              </p>
              {!transcript && !interimTranscript && isRecording && (
                <p className="text-gray-400 italic">Start speaking...</p>
              )}
            </div>
          </div>
        )}

        {/* Mobile Instructions */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            {isRecording
              ? 'Speak clearly into your microphone'
              : 'Tap the button to start recording your voice note'}
          </p>
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="mt-4 text-center text-xs text-gray-400">
        <kbd className="rounded bg-gray-100 px-2 py-1">Space</kbd> to start/stop •
        <kbd className="ml-2 rounded bg-gray-100 px-2 py-1">P</kbd> to pause/resume
      </div>

      {/* Hidden Live Region for Screen Readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isRecording && `Recording: ${formatDuration(duration)}`}
        {isProcessing && 'Processing and saving your voice note'}
      </div>
    </div>
  )
}
