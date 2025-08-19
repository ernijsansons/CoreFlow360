/**
 * CoreFlow360 - OpenAI Realtime API Client
 * Real-time conversational AI for voice calls
 */

import WebSocket from 'ws'
import { EventEmitter } from 'events'
import { getOpenAIKey } from '@/lib/security/credential-manager'

interface RealtimeConfig {
  apiKey: string
  model: string
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  instructions: string
  modalities: ('text' | 'audio')[]
  temperature: number
}

interface ConversationItem {
  id: string
  type: 'message' | 'function_call' | 'function_call_output'
  role: 'user' | 'assistant' | 'system'
  content: Array<{
    type: 'text' | 'audio'
    text?: string
    audio?: string
    transcript?: string
  }>
}

interface SessionConfig {
  model: string
  modalities: string[]
  instructions: string
  voice: string
  input_audio_format: 'pcm16' | 'g711_ulaw' | 'g711_alaw'
  output_audio_format: 'pcm16' | 'g711_ulaw' | 'g711_alaw'
  input_audio_transcription: {
    model: 'whisper-1'
  }
  turn_detection: {
    type: 'server_vad'
    threshold: number
    prefix_padding_ms: number
    silence_duration_ms: number
  }
  tools?: Array<{
    type: 'function'
    name: string
    description: string
    parameters: unknown
  }>
}

export class OpenAIRealtimeClient extends EventEmitter {
  private ws: WebSocket | null = null
  private config: RealtimeConfig
  private sessionConfig: SessionConfig
  private isConnected = false
  private messageQueue: unknown[] = []

  constructor(config?: Partial<RealtimeConfig>) {
    super()

    this.config = {
      apiKey: '', // Will be loaded from secure storage
      model: process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview',
      voice: (process.env.OPENAI_REALTIME_VOICE as unknown) || 'alloy',
      instructions:
        'You are a helpful AI assistant for CoreFlow360, a CRM platform. Be professional, friendly, and concise.',
      modalities: ['text', 'audio'],
      temperature: 0.7,
      ...config,
    }

    this.sessionConfig = {
      model: this.config.model,
      modalities: this.config.modalities,
      instructions: this.config.instructions,
      voice: this.config.voice,
      input_audio_format: 'g711_ulaw',
      output_audio_format: 'g711_ulaw',
      input_audio_transcription: {
        model: 'whisper-1',
      },
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 200,
      },
    }
  }

  /**
   * Connect to OpenAI Realtime API
   */
  async connect(): Promise<void> {
    // Load API key from secure storage
    if (!this.config.apiKey) {
      try {
        this.config.apiKey = await getOpenAIKey()
      } catch (error) {
        throw new Error('OpenAI API key not available in secure storage')
      }
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview', {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'OpenAI-Beta': 'realtime=v1',
          },
        })

        this.ws.on('open', () => {
          
          this.isConnected = true

          // Send session configuration
          this.sendMessage({
            type: 'session.update',
            session: this.sessionConfig,
          })

          resolve()
        })

        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString())
            this.handleMessage(message)
          } catch (error) {
            
          }
        })

        this.ws.on('close', (code, reason) => {
          
          this.isConnected = false
          this.emit('disconnected', { code, reason: reason.toString() })
        })

        this.ws.on('error', (error) => {
          
          this.emit('error', error)
          reject(error)
        })

        // Connection timeout
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Connection timeout'))
          }
        }, 10000)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Disconnect from API
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.isConnected = false
    }
  }

  /**
   * Send audio data to AI
   */
  sendAudio(audioData: Buffer): void {
    if (!this.isConnected) {
      
      return
    }

    const base64Audio = audioData.toString('base64')

    this.sendMessage({
      type: 'input_audio_buffer.append',
      audio: base64Audio,
    })
  }

  /**
   * Commit audio buffer for processing
   */
  commitAudio(): void {
    this.sendMessage({
      type: 'input_audio_buffer.commit',
    })
  }

  /**
   * Send text message
   */
  sendText(text: string): void {
    this.sendMessage({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: text,
          },
        ],
      },
    })

    this.generateResponse()
  }

  /**
   * Generate AI response
   */
  generateResponse(): void {
    this.sendMessage({
      type: 'response.create',
      response: {
        modalities: this.config.modalities,
        instructions: "Please respond appropriately to the user's input.",
      },
    })
  }

  /**
   * Interrupt current response
   */
  interrupt(): void {
    this.sendMessage({
      type: 'response.cancel',
    })
  }

  /**
   * Update session instructions
   */
  updateInstructions(instructions: string): void {
    this.sessionConfig.instructions = instructions

    this.sendMessage({
      type: 'session.update',
      session: {
        ...this.sessionConfig,
        instructions,
      },
    })
  }

  /**
   * Add function tool
   */
  addTool(tool: {
    name: string
    description: string
    parameters: unknown
    handler: (args: unknown) => Promise<unknown>
  }): void {
    if (!this.sessionConfig.tools) {
      this.sessionConfig.tools = []
    }

    this.sessionConfig.tools.push({
      type: 'function',
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    })

    // Store handler for function calls
    this.on(`function_call:${tool.name}`, tool.handler)

    // Update session
    this.sendMessage({
      type: 'session.update',
      session: this.sessionConfig,
    })
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: unknown): void {
    switch (message.type) {
      case 'error':
        
        this.emit('error', message.error)
        break

      case 'session.created':
        
        this.emit('session_created', message.session)
        break

      case 'session.updated':
        
        this.emit('session_updated', message.session)
        break

      case 'input_audio_buffer.speech_started':
        this.emit('speech_started', message)
        break

      case 'input_audio_buffer.speech_stopped':
        this.emit('speech_stopped', message)
        break

      case 'input_audio_buffer.committed':
        this.emit('audio_committed', message)
        break

      case 'conversation.item.created':
        this.emit('item_created', message.item)
        break

      case 'response.created':
        this.emit('response_started', message.response)
        break

      case 'response.output_item.added':
        this.emit('response_item_added', message.item)
        break

      case 'response.content_part.added':
        this.emit('content_part_added', message)
        break

      case 'response.audio.delta':
        // Stream audio response
        const audioData = Buffer.from(message.delta, 'base64')
        this.emit('audio_response', audioData)
        break

      case 'response.audio.done':
        this.emit('audio_response_complete', message)
        break

      case 'response.text.delta':
        this.emit('text_response', message.delta)
        break

      case 'response.text.done':
        this.emit('text_response_complete', message.text)
        break

      case 'response.function_call_arguments.delta':
        this.emit('function_call_delta', message)
        break

      case 'response.function_call_arguments.done':
        this.handleFunctionCall(message)
        break

      case 'response.done':
        this.emit('response_complete', message.response)
        break

      case 'rate_limits.updated':
        this.emit('rate_limits_updated', message.rate_limits)
        break

      default:
        
        break
    }
  }

  /**
   * Handle function calls
   */
  private async handleFunctionCall(message: unknown): Promise<void> {
    const { name, arguments: args, call_id } = message

    try {
      // Emit function call event
      const result = await new Promise((resolve, reject) => {
        this.emit(`function_call:${name}`, args, resolve, reject)

        // Timeout after 10 seconds
        setTimeout(() => {
          reject(new Error('Function call timeout'))
        }, 10000)
      })

      // Send function result back
      this.sendMessage({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id,
          output: JSON.stringify(result),
        },
      })
    } catch (error) {
      :`, error)

      this.sendMessage({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id,
          output: JSON.stringify({
            error: error.message,
          }),
        },
      })
    }
  }

  /**
   * Send message to API
   */
  private sendMessage(message: unknown): void {
    if (!this.isConnected || !this.ws) {
      this.messageQueue.push(message)
      return
    }

    try {
      this.ws.send(JSON.stringify(message))
    } catch (error) {
      
    }
  }
}
