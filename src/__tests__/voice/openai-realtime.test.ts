/**
 * CoreFlow360 - OpenAI Realtime API Unit Tests
 * Test coverage for AI-powered voice conversations
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { OpenAIRealtimeClient } from '@/lib/voice/openai-realtime'
import WebSocket from 'ws'
import { EventEmitter } from 'events'

// Mock WebSocket
jest.mock('ws')
const MockWebSocket = WebSocket as jest.MockedClass<typeof WebSocket>

describe('OpenAIRealtimeClient', () => {
  let realtimeClient: OpenAIRealtimeClient
  let mockWs: any
  let wsEventEmitter: EventEmitter

  beforeEach(() => {
    jest.clearAllMocks()

    // Create event emitter for WebSocket mock
    wsEventEmitter = new EventEmitter()

    // Mock WebSocket instance
    mockWs = {
      on: jest.fn((event, handler) => wsEventEmitter.on(event, handler)),
      send: jest.fn(),
      close: jest.fn(),
      readyState: WebSocket.OPEN,
      removeAllListeners: jest.fn(),
      terminate: jest.fn(),
    }

    MockWebSocket.mockImplementation(() => mockWs as any)

    realtimeClient = new OpenAIRealtimeClient()
  })

  afterEach(() => {
    wsEventEmitter.removeAllListeners()
  })

  describe('Connection Management', () => {
    it('should connect to OpenAI Realtime API', async () => {
      const sessionPromise = realtimeClient.connect()

      // Simulate WebSocket open
      wsEventEmitter.emit('open')

      // Simulate session creation
      wsEventEmitter.emit(
        'message',
        JSON.stringify({
          type: 'session.created',
          session: {
            id: 'sess_123',
            model: 'gpt-4-realtime',
            modalities: ['text', 'audio'],
          },
        })
      )

      const session = await sessionPromise

      expect(session.sessionId).toBe('sess_123')
      expect(session.model).toBe('gpt-4-realtime')
      expect(MockWebSocket).toHaveBeenCalledWith(
        expect.stringContaining('wss://api.openai.com/v1/realtime'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
            'OpenAI-Beta': 'realtime=v1',
          }),
        })
      )
    })

    it('should handle connection errors', async () => {
      const connectPromise = realtimeClient.connect()

      // Simulate connection error
      wsEventEmitter.emit('error', new Error('Connection refused'))

      await expect(connectPromise).rejects.toThrow('Failed to connect')
    })

    it('should reconnect on unexpected disconnect', async () => {
      const session = await realtimeClient.connect()
      wsEventEmitter.emit('open')
      wsEventEmitter.emit(
        'message',
        JSON.stringify({
          type: 'session.created',
          session: { id: 'sess_123' },
        })
      )

      // Simulate unexpected close
      wsEventEmitter.emit('close', 1006, 'Abnormal closure')

      // Should attempt reconnection
      expect(MockWebSocket).toHaveBeenCalledTimes(2)
    })
  })

  describe('Audio Streaming', () => {
    beforeEach(async () => {
      // Establish connection first
      const connectPromise = realtimeClient.connect()
      wsEventEmitter.emit('open')
      wsEventEmitter.emit(
        'message',
        JSON.stringify({
          type: 'session.created',
          session: { id: 'sess_123' },
        })
      )
      await connectPromise
    })

    it('should send audio data', () => {
      const audioData = Buffer.from('test-audio-data')
      realtimeClient.sendAudio(audioData)

      expect(mockWs.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: audioData.toString('base64'),
        })
      )
    })

    it('should handle audio responses', (done) => {
      const audioData = 'base64-encoded-audio'

      realtimeClient.on('audio', (data) => {
        expect(data).toEqual(Buffer.from(audioData, 'base64'))
        done()
      })

      wsEventEmitter.emit(
        'message',
        JSON.stringify({
          type: 'response.audio.delta',
          delta: audioData,
        })
      )
    })

    it('should handle transcription events', (done) => {
      realtimeClient.on('transcription', (transcript) => {
        expect(transcript).toBe('Hello, how can I help you?')
        done()
      })

      wsEventEmitter.emit(
        'message',
        JSON.stringify({
          type: 'response.text.done',
          text: 'Hello, how can I help you?',
        })
      )
    })
  })

  describe('Conversation Flow', () => {
    beforeEach(async () => {
      const connectPromise = realtimeClient.connect()
      wsEventEmitter.emit('open')
      wsEventEmitter.emit(
        'message',
        JSON.stringify({
          type: 'session.created',
          session: { id: 'sess_123' },
        })
      )
      await connectPromise
    })

    it('should start conversation with system prompt', () => {
      const script = {
        greeting: 'Hello, this is CoreFlow360',
        instructions: 'Be helpful and professional',
      }

      realtimeClient.startConversation(script)

      expect(mockWs.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'system',
            content: [
              {
                type: 'text',
                text: expect.stringContaining(script.greeting),
              },
            ],
          },
        })
      )
    })

    it('should handle turn detection', () => {
      realtimeClient.configureTurnDetection({
        threshold: 0.7,
        prefix_padding_ms: 300,
        silence_duration_ms: 500,
      })

      expect(mockWs.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'session.update',
          session: {
            turn_detection: {
              type: 'server_vad',
              threshold: 0.7,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
          },
        })
      )
    })

    it('should commit audio buffer for processing', () => {
      realtimeClient.commitAudioBuffer()

      expect(mockWs.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'input_audio_buffer.commit',
        })
      )
    })
  })

  describe('Error Handling', () => {
    beforeEach(async () => {
      const connectPromise = realtimeClient.connect()
      wsEventEmitter.emit('open')
      wsEventEmitter.emit(
        'message',
        JSON.stringify({
          type: 'session.created',
          session: { id: 'sess_123' },
        })
      )
      await connectPromise
    })

    it('should handle API errors', (done) => {
      realtimeClient.on('error', (error) => {
        expect(error.message).toContain('Invalid audio format')
        expect(error.code).toBe('invalid_audio_format')
        done()
      })

      wsEventEmitter.emit(
        'message',
        JSON.stringify({
          type: 'error',
          error: {
            type: 'invalid_request_error',
            code: 'invalid_audio_format',
            message: 'Invalid audio format',
          },
        })
      )
    })

    it('should handle rate limiting', async () => {
      const promises = []

      // Send many requests quickly
      for (let i = 0; i < 100; i++) {
        promises.push(realtimeClient.sendAudio(Buffer.from('data')))
      }

      await Promise.all(promises)

      // Should implement backoff
      expect(mockWs.send.mock.calls.length).toBeLessThanOrEqual(100)
    })
  })

  describe('Interruption Handling', () => {
    beforeEach(async () => {
      const connectPromise = realtimeClient.connect()
      wsEventEmitter.emit('open')
      wsEventEmitter.emit(
        'message',
        JSON.stringify({
          type: 'session.created',
          session: { id: 'sess_123' },
        })
      )
      await connectPromise
    })

    it('should handle user interruption', () => {
      realtimeClient.interrupt()

      expect(mockWs.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'response.cancel',
        })
      )
    })

    it('should clear audio buffer on interruption', () => {
      realtimeClient.interrupt()

      expect(mockWs.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'input_audio_buffer.clear',
        })
      )
    })
  })

  describe('Performance Metrics', () => {
    beforeEach(async () => {
      const connectPromise = realtimeClient.connect()
      wsEventEmitter.emit('open')
      wsEventEmitter.emit(
        'message',
        JSON.stringify({
          type: 'session.created',
          session: { id: 'sess_123' },
        })
      )
      await connectPromise
    })

    it('should track response latency', (done) => {
      const startTime = Date.now()

      realtimeClient.on('metrics', (metrics) => {
        expect(metrics.responseLatency).toBeLessThan(100) // <100ms target
        expect(metrics.audioLatency).toBeDefined()
        done()
      })

      // Send audio
      realtimeClient.sendAudio(Buffer.from('test'))

      // Simulate quick response
      setTimeout(() => {
        wsEventEmitter.emit(
          'message',
          JSON.stringify({
            type: 'response.audio.delta',
            delta: 'audio-data',
          })
        )
      }, 50)
    })

    it('should handle high-frequency audio streaming', async () => {
      const audioChunks = 1000 // 1000 chunks
      const chunkSize = 320 // 20ms of 16kHz audio

      const startTime = Date.now()

      for (let i = 0; i < audioChunks; i++) {
        const audioData = Buffer.alloc(chunkSize)
        realtimeClient.sendAudio(audioData)
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should handle 1000 chunks efficiently
      expect(duration).toBeLessThan(1000) // Less than 1 second
      expect(mockWs.send).toHaveBeenCalledTimes(audioChunks)
    })
  })

  describe('Cleanup', () => {
    it('should clean up resources on disconnect', async () => {
      const connectPromise = realtimeClient.connect()
      wsEventEmitter.emit('open')
      wsEventEmitter.emit(
        'message',
        JSON.stringify({
          type: 'session.created',
          session: { id: 'sess_123' },
        })
      )
      await connectPromise

      realtimeClient.disconnect()

      expect(mockWs.close).toHaveBeenCalledWith(1000, 'Normal closure')
      expect(mockWs.removeAllListeners).toHaveBeenCalled()
    })

    it('should handle cleanup errors gracefully', () => {
      mockWs.close.mockImplementation(() => {
        throw new Error('Close failed')
      })

      expect(() => realtimeClient.disconnect()).not.toThrow()
    })
  })
})
