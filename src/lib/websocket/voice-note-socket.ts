/**
 * CoreFlow360 - Voice Note WebSocket Handler
 * Real-time transcription with Deepgram streaming
 */

import { WebSocketServer, WebSocket } from 'ws'
import { createServer, Server } from 'http'
import { parse } from 'url'
import jwt from 'jsonwebtoken'

interface DeepgramConfig {
  apiKey: string
  model: string
  language: string
  punctuate: boolean
  interimResults: boolean
  endpointing: number
  vadEvents: boolean
}

interface ClientConnection {
  id: string
  userId: string
  clientWs: WebSocket
  deepgramWs: WebSocket | null
  isAlive: boolean
  reconnectAttempts: number
}

class VoiceNoteWebSocketServer {
  private wss: WebSocketServer
  private httpServer: Server
  private connections: Map<string, ClientConnection> = new Map()
  private deepgramConfig: DeepgramConfig

  constructor(port: number = 8080) {
    this.httpServer = createServer()
    this.wss = new WebSocketServer({ server: this.httpServer })

    this.deepgramConfig = {
      apiKey: process.env.DEEPGRAM_API_KEY!,
      model: 'nova-2',
      language: 'en-US',
      punctuate: true,
      interimResults: true,
      endpointing: 300,
      vadEvents: true,
    }

    this.setupWebSocketServer()
    this.startHeartbeat()

    this.httpServer.listen(port, () => {
      console.log(`Voice Note WebSocket server listening on port ${port}`)
    })
  }

  /**
   * Setup WebSocket server handlers
   */
  private setupWebSocketServer(): void {
    this.wss.on('connection', async (ws: WebSocket, req) => {
      const { pathname, query } = parse(req.url || '', true)

      // Verify authentication
      const token = query.token as string
      const userId = await this.verifyToken(token)

      if (!userId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }))
        ws.close(1008, 'Unauthorized')
        return
      }

      const connectionId = this.generateConnectionId()

      console.log(`New voice note connection from user: ${userId}`)

      // Create client connection
      const connection: ClientConnection = {
        id: connectionId,
        userId,
        clientWs: ws,
        deepgramWs: null,
        isAlive: true,
        reconnectAttempts: 0,
      }

      this.connections.set(connectionId, connection)

      // Setup client handlers
      this.setupClientHandlers(connection)

      // Send connection confirmation
      ws.send(
        JSON.stringify({
          type: 'connection',
          status: 'connected',
          connectionId,
        })
      )
    })

    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error)
    })
  }

  /**
   * Setup handlers for client WebSocket
   */
  private setupClientHandlers(connection: ClientConnection): void {
    const { clientWs, id } = connection

    // Handle incoming messages
    clientWs.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString())

        switch (message.type) {
          case 'start_transcription':
            await this.startTranscription(connection)
            break

          case 'audio_data':
            await this.forwardAudioToDeepgram(connection, message.audio)
            break

          case 'stop_transcription':
            await this.stopTranscription(connection)
            break

          case 'ping':
            connection.isAlive = true
            clientWs.send(JSON.stringify({ type: 'pong' }))
            break

          default:
            console.warn(`Unknown message type: ${message.type}`)
        }
      } catch (error) {
        console.error('Message processing error:', error)
        this.sendError(connection, 'Message processing error')
      }
    })

    // Handle client disconnect
    clientWs.on('close', () => {
      console.log(`Client disconnected: ${id}`)
      this.cleanupConnection(id)
    })

    // Handle client errors
    clientWs.on('error', (error) => {
      console.error(`Client error for ${id}:`, error)
      this.cleanupConnection(id)
    })

    // Handle heartbeat
    clientWs.on('pong', () => {
      connection.isAlive = true
    })
  }

  /**
   * Start Deepgram transcription session
   */
  private async startTranscription(connection: ClientConnection): Promise<void> {
    try {
      // Close existing Deepgram connection if any
      if (connection.deepgramWs) {
        connection.deepgramWs.close()
      }

      // Create Deepgram WebSocket URL
      const deepgramUrl = this.buildDeepgramUrl()

      // Connect to Deepgram
      const deepgramWs = new WebSocket(deepgramUrl, {
        headers: {
          Authorization: `Token ${this.deepgramConfig.apiKey}`,
        },
      })

      connection.deepgramWs = deepgramWs

      // Handle Deepgram connection
      deepgramWs.on('open', () => {
        console.log('Deepgram connection established')

        connection.clientWs.send(
          JSON.stringify({
            type: 'transcription_started',
            status: 'connected',
          })
        )
      })

      // Handle Deepgram messages
      deepgramWs.on('message', (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString())

          if (response.type === 'Results') {
            this.handleTranscriptionResult(connection, response)
          } else if (response.type === 'Metadata') {
            // Handle metadata if needed
            console.log('Deepgram metadata:', response)
          }
        } catch (error) {
          console.error('Error processing Deepgram response:', error)
        }
      })

      // Handle Deepgram errors
      deepgramWs.on('error', (error) => {
        console.error('Deepgram WebSocket error:', error)
        this.handleDeepgramError(connection, error)
      })

      // Handle Deepgram close
      deepgramWs.on('close', (code, reason) => {
        console.log(`Deepgram connection closed. Code: ${code}, Reason: ${reason}`)

        if (connection.clientWs.readyState === WebSocket.OPEN) {
          connection.clientWs.send(
            JSON.stringify({
              type: 'transcription_stopped',
              reason: reason?.toString() || 'Connection closed',
            })
          )
        }
      })
    } catch (error) {
      console.error('Failed to start transcription:', error)
      this.sendError(connection, 'Failed to start transcription')
    }
  }

  /**
   * Build Deepgram WebSocket URL
   */
  private buildDeepgramUrl(): string {
    const params = new URLSearchParams({
      encoding: 'linear16',
      sample_rate: '16000',
      channels: '1',
      model: this.deepgramConfig.model,
      language: this.deepgramConfig.language,
      punctuate: this.deepgramConfig.punctuate.toString(),
      interim_results: this.deepgramConfig.interimResults.toString(),
      endpointing: this.deepgramConfig.endpointing.toString(),
      vad_events: this.deepgramConfig.vadEvents.toString(),
    })

    return `wss://api.deepgram.com/v1/listen?${params}`
  }

  /**
   * Forward audio data to Deepgram
   */
  private async forwardAudioToDeepgram(
    connection: ClientConnection,
    audioData: string
  ): Promise<void> {
    if (!connection.deepgramWs || connection.deepgramWs.readyState !== WebSocket.OPEN) {
      console.warn('Deepgram connection not ready, dropping audio data')
      return
    }

    try {
      // Convert base64 to buffer
      const audioBuffer = Buffer.from(audioData, 'base64')

      // Send to Deepgram
      connection.deepgramWs.send(audioBuffer)
    } catch (error) {
      console.error('Audio forwarding error:', error)
      this.sendError(connection, 'Audio forwarding error')
    }
  }

  /**
   * Handle transcription results from Deepgram
   */
  private handleTranscriptionResult(connection: ClientConnection, result: any): void:
    try {
      const channel = result.channel
      const alternatives = channel.alternatives

      if (alternatives && alternatives.length > 0) {
        const alternative = alternatives[0]

        // Send transcription to client
        connection.clientWs.send(
          JSON.stringify({
            type: 'transcription',
            transcript: alternative.transcript,
            confidence: alternative.confidence,
            words: alternative.words,
            isFinal: result.is_final || false,
            speech_final: result.speech_final || false,
            channel_index: result.channel_index || 0,
          })
        )
      }
    } catch (error) {
      console.error('Error handling transcription result:', error)
    }
  }

  /**
   * Handle Deepgram connection errors
   */
  private handleDeepgramError(connection: ClientConnection, error: any): void {
    console.error('Deepgram error:', error)

    // Attempt reconnection if appropriate
    if (connection.reconnectAttempts < 3) {
      connection.reconnectAttempts++

      setTimeout(() => {
        console.log(
          `Attempting Deepgram reconnection for ${connection.id} (attempt ${connection.reconnectAttempts})`
        )
        this.startTranscription(connection)
      }, 2000 * connection.reconnectAttempts)
    } else {
      this.sendError(connection, 'Transcription service unavailable')
      this.stopTranscription(connection)
    }
  }

  /**
   * Stop transcription session
   */
  private async stopTranscription(connection: ClientConnection): Promise<void> {
    if (connection.deepgramWs) {
      connection.deepgramWs.close()
      connection.deepgramWs = null
      connection.reconnectAttempts = 0
    }

    if (connection.clientWs.readyState === WebSocket.OPEN) {
      connection.clientWs.send(
        JSON.stringify({
          type: 'transcription_stopped',
          status: 'stopped',
        })
      )
    }
  }

  /**
   * Send error message to client
   */
  private sendError(connection: ClientConnection, message: string): void {
    if (connection.clientWs.readyState === WebSocket.OPEN) {
      connection.clientWs.send(
        JSON.stringify({
          type: 'error',
          message,
          timestamp: Date.now(),
        })
      )
    }
  }

  /**
   * Cleanup connection
   */
  private cleanupConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId)

    if (connection) {
      // Close Deepgram connection
      if (connection.deepgramWs) {
        connection.deepgramWs.close()
      }

      // Close client connection if still open
      if (connection.clientWs.readyState === WebSocket.OPEN) {
        connection.clientWs.close()
      }

      // Remove from connections map
      this.connections.delete(connectionId)
    }
  }

  /**
   * Start heartbeat interval
   */
  private startHeartbeat(): void {
    setInterval(() => {
      this.connections.forEach((connection) => {
        if (!connection.isAlive) {
          console.log(`Connection ${connection.id} is inactive, cleaning up`)
          this.cleanupConnection(connection.id)
          return
        }

        connection.isAlive = false
        connection.clientWs.ping()
      })
    }, 30000) // 30 seconds
  }

  /**
   * Verify JWT token
   */
  private async verifyToken(token: string): Promise<string | null> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      return decoded.userId || null
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }

  /**
   * Generate unique connection ID
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Graceful shutdown
   */
  public shutdown(): void {
    console.log('Shutting down Voice Note WebSocket server...')

    // Close all connections
    this.connections.forEach((connection) => {
      this.cleanupConnection(connection.id)
    })

    // Close WebSocket server
    this.wss.close()

    // Close HTTP server
    this.httpServer.close()
  }
}

// Export singleton instance
let voiceNoteServer: VoiceNoteWebSocketServer | null = null

export function getVoiceNoteServer(): VoiceNoteWebSocketServer {
  if (!voiceNoteServer) {
    const port = parseInt(process.env.VOICE_NOTE_WS_PORT || '8081')
    voiceNoteServer = new VoiceNoteWebSocketServer(port)
  }
  return voiceNoteServer
}

// Graceful shutdown on process termination
process.on('SIGTERM', () => {
  if (voiceNoteServer) {
    voiceNoteServer.shutdown()
  }
})

process.on('SIGINT', () => {
  if (voiceNoteServer) {
    voiceNoteServer.shutdown()
  }
})
