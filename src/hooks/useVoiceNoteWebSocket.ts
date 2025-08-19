/**
 * CoreFlow360 - Voice Note WebSocket Hook
 * Custom hook for managing WebSocket connection with error recovery
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface UseVoiceNoteWebSocketOptions {
  autoConnect?: boolean
  reconnectAttempts?: number
  reconnectDelay?: number
  onTranscription?: (transcript: string, isFinal: boolean, confidence: number) => void
  onError?: (error: Error) => void
  onConnectionChange?: (connected: boolean) => void
}

interface TranscriptionResult {
  transcript: string
  confidence: number
  isFinal: boolean
  words?: Array<{
    word: string
    start: number
    end: number
    confidence: number
  }>
}

export function useVoiceNoteWebSocket(options: UseVoiceNoteWebSocketOptions = {}) {
  const {
    autoConnect = false,
    reconnectAttempts = 3,
    reconnectDelay = 2000,
    onTranscription,
    onError,
    onConnectionChange,
  } = options

  const { data: session } = useSession()

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [transcriptionActive, setTranscriptionActive] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectCountRef = useRef(0)
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN || isConnecting) {
      return
    }

    if (!session?.user) {
      setError(new Error('Authentication required'))
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Get auth token (implement based on your auth system)
      const token = await getAuthToken()

      const wsUrl = `${process.env.NEXT_PUBLIC_VOICE_NOTE_WS_URL || 'ws://localhost:8081'}?token=${token}`
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        setIsConnected(true)
        setIsConnecting(false)
        setError(null)
        reconnectCountRef.current = 0

        if (onConnectionChange) {
          onConnectionChange(true)
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleWebSocketMessage(data)
        } catch (err) {}
      }

      ws.onerror = (event) => {
        const error = new Error('WebSocket connection error')
        setError(error)

        if (onError) {
          onError(error)
        }
      }

      ws.onclose = (event) => {
        setIsConnected(false)
        setIsConnecting(false)
        setTranscriptionActive(false)

        if (onConnectionChange) {
          onConnectionChange(false)
        }

        // Attempt reconnection if not a normal closure
        if (event.code !== 1000 && reconnectCountRef.current < reconnectAttempts) {
          scheduleReconnect()
        }
      }

      wsRef.current = ws
    } catch (error: unknown) {
      setError(error)
      setIsConnecting(false)

      if (onError) {
        onError(error)
      }
    }
  }, [session, isConnecting, reconnectAttempts, onConnectionChange, onError])

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnect')
      wsRef.current = null
    }

    setIsConnected(false)
    setTranscriptionActive(false)
  }, [])

  /**
   * Start transcription
   */
  const startTranscription = useCallback(async (stream: MediaStream) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected')
    }

    try {
      // Send start transcription message
      wsRef.current.send(
        JSON.stringify({
          type: 'start_transcription',
        })
      )

      // Setup audio processing
      await setupAudioProcessing(stream)

      setTranscriptionActive(true)
    } catch (error: unknown) {
      throw error
    }
  }, [])

  /**
   * Stop transcription
   */
  const stopTranscription = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'stop_transcription',
        })
      )
    }

    // Cleanup audio processing
    if (audioProcessorRef.current) {
      audioProcessorRef.current.disconnect()
      audioProcessorRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setTranscriptionActive(false)
  }, [])

  /**
   * Send audio data
   */
  const sendAudioData = useCallback((audioData: ArrayBuffer) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return
    }

    // Convert to base64 for transmission
    const base64Audio = arrayBufferToBase64(audioData)

    wsRef.current.send(
      JSON.stringify({
        type: 'audio_data',
        audio: base64Audio,
      })
    )
  }, [])

  /**
   * Setup audio processing from MediaStream
   */
  const setupAudioProcessing = async (stream: MediaStream) => {
    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as unknown).webkitAudioContext)(
        {
          sampleRate: 16000,
        }
      )

      const source = audioContextRef.current.createMediaStreamSource(stream)

      // Create script processor for audio chunks
      const bufferSize = 4096
      audioProcessorRef.current = audioContextRef.current.createScriptProcessor(bufferSize, 1, 1)

      audioProcessorRef.current.onaudioprocess = (event) => {
        if (!transcriptionActive) return

        const inputData = event.inputBuffer.getChannelData(0)
        const pcmData = convertFloat32ToInt16(inputData)

        sendAudioData(pcmData.buffer)
      }

      // Connect audio nodes
      source.connect(audioProcessorRef.current)
      audioProcessorRef.current.connect(audioContextRef.current.destination)
    } catch (error) {
      throw error
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  const handleWebSocketMessage = (data: unknown) => {
    switch (data.type) {
      case 'connection':
        break

      case 'transcription':
        if (onTranscription) {
          onTranscription(data.transcript, data.isFinal, data.confidence)
        }
        break

      case 'transcription_started':
        break

      case 'transcription_stopped':
        setTranscriptionActive(false)
        break

      case 'error':
        const error = new Error(data.message)
        setError(error)
        if (onError) {
          onError(error)
        }
        break

      case 'pong':
        // Heartbeat response
        break

      default:
    }
  }

  /**
   * Schedule reconnection attempt
   */
  const scheduleReconnect = () => {
    reconnectCountRef.current++

    reconnectTimeoutRef.current = setTimeout(() => {
      connect()
    }, reconnectDelay * reconnectCountRef.current)
  }

  /**
   * Send heartbeat ping
   */
  const sendPing = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ping' }))
    }
  }, [])

  /**
   * Get auth token
   */
  const getAuthToken = async (): Promise<string> => {
    // Implement based on your auth system
    // This is a placeholder
    const response = await fetch('/api/auth/ws-token')
    const data = await response.json()
    return data.token
  }

  /**
   * Convert Float32Array to Int16Array
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
   * Convert ArrayBuffer to base64
   */
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && session?.user) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, session])

  // Setup heartbeat
  useEffect(() => {
    if (!isConnected) return

    const pingInterval = setInterval(sendPing, 30000)

    return () => {
      clearInterval(pingInterval)
    }
  }, [isConnected, sendPing])

  return {
    isConnected,
    isConnecting,
    error,
    transcriptionActive,
    connect,
    disconnect,
    startTranscription,
    stopTranscription,
    sendAudioData,
  }
}
