/**
 * CoreFlow360 - Voice Navigation and Accessibility Enhancement
 * Advanced voice commands and natural language navigation for consciousness interface
 */

export interface VoiceCommand {
  phrase: string
  aliases: string[]
  action: string
  parameters?: Record<string, any>
  confirmationRequired?: boolean
  accessibilityLevel: 'basic' | 'enhanced' | 'expert'
  description: string
}

export interface VoiceNavigationState {
  isListening: boolean
  isProcessing: boolean
  currentCommand: string
  confidence: number
  lastCommand: VoiceCommand | null
  errorMessage: string | null
  language: string
  voiceSettings: VoiceSettings
}

export interface VoiceSettings {
  enabled: boolean
  language: string
  voiceSpeed: number // 0.1 to 2.0
  voicePitch: number // 0 to 2
  volume: number // 0 to 1
  continuousListening: boolean
  confirmationTimeout: number // milliseconds
  noiseThreshold: number // 0 to 1
  preferredVoice: string
  accessibilityMode: 'standard' | 'verbose' | 'minimal'
}

export interface NavigationContext {
  currentPage: string
  availableActions: string[]
  focusedElement: string | null
  breadcrumbs: string[]
  userRole: string
  subscriptionTier: 'neural' | 'synaptic' | 'autonomous' | 'transcendent'
}

class VoiceNavigationEngine {
  private recognition: SpeechRecognition | null = null
  private synthesis: SpeechSynthesis | null = null
  private state: VoiceNavigationState
  private commands: VoiceCommand[] = []
  private listeners: Array<(state: VoiceNavigationState) => void> = []
  private context: NavigationContext | null = null

  constructor() {
    this.state = {
      isListening: false,
      isProcessing: false,
      currentCommand: '',
      confidence: 0,
      lastCommand: null,
      errorMessage: null,
      language: 'en-US',
      voiceSettings: this.getDefaultVoiceSettings()
    }

    this.initializeVoiceRecognition()
    this.initializeVoiceSynthesis()
    this.loadVoiceCommands()
  }

  private getDefaultVoiceSettings(): VoiceSettings {
    return {
      enabled: false,
      language: 'en-US',
      voiceSpeed: 1.0,
      voicePitch: 1.0,
      volume: 0.8,
      continuousListening: false,
      confirmationTimeout: 5000,
      noiseThreshold: 0.3,
      preferredVoice: 'default',
      accessibilityMode: 'standard'
    }
  }

  private initializeVoiceRecognition(): void {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('[Voice Navigation] Speech recognition not supported')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognition()

    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = this.state.language

    this.recognition.onstart = () => {
      this.updateState({ isListening: true, errorMessage: null })
      this.announceToScreenReader('Voice navigation activated')
    }

    this.recognition.onend = () => {
      this.updateState({ isListening: false })
      if (this.state.voiceSettings.continuousListening && this.state.voiceSettings.enabled) {
        this.startListening()
      }
    }

    this.recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1]
      if (lastResult.isFinal) {
        const command = lastResult[0].transcript.trim()
        const confidence = lastResult[0].confidence
        this.processVoiceCommand(command, confidence)
      }
    }

    this.recognition.onerror = (event) => {
      this.updateState({ 
        isListening: false, 
        isProcessing: false,
        errorMessage: `Voice recognition error: ${event.error}` 
      })
    }
  }

  private initializeVoiceSynthesis(): void {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis
    } else {
      console.warn('[Voice Navigation] Speech synthesis not supported')
    }
  }

  private loadVoiceCommands(): void {
    this.commands = [
      // Navigation Commands
      {
        phrase: 'go to dashboard',
        aliases: ['open dashboard', 'show dashboard', 'navigate to dashboard'],
        action: 'navigate',
        parameters: { path: '/dashboard' },
        accessibilityLevel: 'basic',
        description: 'Navigate to the main dashboard'
      },
      {
        phrase: 'go to customers',
        aliases: ['open customers', 'show customers', 'customer list'],
        action: 'navigate',
        parameters: { path: '/dashboard/customers' },
        accessibilityLevel: 'basic',
        description: 'Navigate to customer management'
      },
      {
        phrase: 'go to consciousness center',
        aliases: ['open consciousness', 'consciousness dashboard', 'ai center'],
        action: 'navigate',
        parameters: { path: '/consciousness' },
        accessibilityLevel: 'enhanced',
        description: 'Navigate to consciousness interface'
      },
      {
        phrase: 'go to sustainability',
        aliases: ['open sustainability', 'green dashboard', 'environmental metrics'],
        action: 'navigate',
        parameters: { path: '/sustainability' },
        accessibilityLevel: 'enhanced',
        description: 'Navigate to sustainability dashboard'
      },

      // Action Commands
      {
        phrase: 'create new customer',
        aliases: ['add customer', 'new customer', 'create customer'],
        action: 'create',
        parameters: { entity: 'customer' },
        confirmationRequired: true,
        accessibilityLevel: 'basic',
        description: 'Open new customer creation form'
      },
      {
        phrase: 'save current form',
        aliases: ['save form', 'submit form', 'save changes'],
        action: 'save',
        accessibilityLevel: 'basic',
        description: 'Save the current form'
      },
      {
        phrase: 'cancel current action',
        aliases: ['cancel', 'go back', 'abort'],
        action: 'cancel',
        accessibilityLevel: 'basic',
        description: 'Cancel current action and go back'
      },

      // Search Commands
      {
        phrase: 'search for',
        aliases: ['find', 'look for', 'search'],
        action: 'search',
        accessibilityLevel: 'basic',
        description: 'Search for specific content'
      },
      {
        phrase: 'filter by',
        aliases: ['filter', 'show only', 'filter results'],
        action: 'filter',
        accessibilityLevel: 'enhanced',
        description: 'Apply filters to current view'
      },

      // Accessibility Commands
      {
        phrase: 'increase text size',
        aliases: ['zoom in', 'larger text', 'bigger font'],
        action: 'accessibility',
        parameters: { type: 'fontSize', direction: 'increase' },
        accessibilityLevel: 'basic',
        description: 'Increase font size for better readability'
      },
      {
        phrase: 'decrease text size',
        aliases: ['zoom out', 'smaller text', 'smaller font'],
        action: 'accessibility',
        parameters: { type: 'fontSize', direction: 'decrease' },
        accessibilityLevel: 'basic',
        description: 'Decrease font size'
      },
      {
        phrase: 'enable high contrast',
        aliases: ['high contrast mode', 'contrast mode', 'dark mode'],
        action: 'accessibility',
        parameters: { type: 'contrast', value: 'high' },
        accessibilityLevel: 'basic',
        description: 'Enable high contrast mode for better visibility'
      },
      {
        phrase: 'reduce motion',
        aliases: ['disable animations', 'stop motion', 'reduce animations'],
        action: 'accessibility',
        parameters: { type: 'motion', value: 'reduced' },
        accessibilityLevel: 'basic',
        description: 'Reduce or disable animations'
      },

      // Consciousness Commands (Advanced)
      {
        phrase: 'activate neural mode',
        aliases: ['neural consciousness', 'basic ai mode'],
        action: 'consciousness',
        parameters: { level: 'neural' },
        accessibilityLevel: 'enhanced',
        description: 'Activate neural-level consciousness features'
      },
      {
        phrase: 'activate synaptic mode',
        aliases: ['synaptic consciousness', 'advanced ai mode'],
        action: 'consciousness',
        parameters: { level: 'synaptic' },
        accessibilityLevel: 'enhanced',
        description: 'Activate synaptic-level consciousness features'
      },
      {
        phrase: 'show ai insights',
        aliases: ['ai insights', 'consciousness insights', 'intelligent recommendations'],
        action: 'showInsights',
        accessibilityLevel: 'enhanced',
        description: 'Display AI-powered business insights'
      },

      // Voice Control Commands
      {
        phrase: 'stop listening',
        aliases: ['stop voice', 'disable voice', 'voice off'],
        action: 'voiceControl',
        parameters: { action: 'stop' },
        accessibilityLevel: 'basic',
        description: 'Stop voice recognition'
      },
      {
        phrase: 'help with voice commands',
        aliases: ['voice help', 'what can I say', 'voice commands'],
        action: 'showHelp',
        accessibilityLevel: 'basic',
        description: 'Show available voice commands'
      }
    ]
  }

  public async startListening(): Promise<void> {
    if (!this.recognition || !this.state.voiceSettings.enabled) {
      throw new Error('Voice recognition not available or disabled')
    }

    try {
      this.recognition.start()
      this.announceToScreenReader('Listening for voice commands')
    } catch (error) {
      console.error('[Voice Navigation] Failed to start listening:', error)
      this.updateState({ errorMessage: 'Failed to start voice recognition' })
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      this.recognition.stop()
      this.updateState({ isListening: false })
      this.announceToScreenReader('Voice navigation stopped')
    }
  }

  public async processVoiceCommand(command: string, confidence: number): Promise<void> {
    this.updateState({ 
      isProcessing: true, 
      currentCommand: command,
      confidence: confidence 
    })

    try {
      const matchedCommand = this.findMatchingCommand(command)
      
      if (!matchedCommand) {
        this.handleUnknownCommand(command)
        return
      }

      // Check accessibility level
      if (!this.isCommandAccessible(matchedCommand)) {
        this.announceToScreenReader('This command requires a higher subscription tier')
        return
      }

      // Execute command with confirmation if required
      if (matchedCommand.confirmationRequired) {
        await this.confirmCommand(matchedCommand)
      } else {
        await this.executeCommand(matchedCommand)
      }

      this.updateState({ lastCommand: matchedCommand })
      
    } catch (error) {
      console.error('[Voice Navigation] Command processing error:', error)
      this.updateState({ errorMessage: 'Failed to process voice command' })
      this.announceToScreenReader('Command processing failed')
    } finally {
      this.updateState({ isProcessing: false, currentCommand: '' })
    }
  }

  private findMatchingCommand(input: string): VoiceCommand | null {
    const normalizedInput = input.toLowerCase().trim()
    
    // Direct phrase match
    let match = this.commands.find(cmd => 
      cmd.phrase.toLowerCase() === normalizedInput
    )
    
    if (match) return match

    // Alias match
    match = this.commands.find(cmd => 
      cmd.aliases.some(alias => alias.toLowerCase() === normalizedInput)
    )
    
    if (match) return match

    // Partial match for complex commands
    match = this.commands.find(cmd => {
      const phrase = cmd.phrase.toLowerCase()
      return normalizedInput.includes(phrase) || phrase.includes(normalizedInput)
    })

    return match
  }

  private isCommandAccessible(command: VoiceCommand): boolean {
    if (!this.context) return true

    const tierLevels = {
      'neural': 1,
      'synaptic': 2,
      'autonomous': 3,
      'transcendent': 4
    }

    const accessibilityLevels = {
      'basic': 1,
      'enhanced': 2,
      'expert': 3
    }

    const userTierLevel = tierLevels[this.context.subscriptionTier]
    const commandLevel = accessibilityLevels[command.accessibilityLevel]

    return userTierLevel >= commandLevel
  }

  private async confirmCommand(command: VoiceCommand): Promise<void> {
    this.announceToScreenReader(
      `Are you sure you want to ${command.description}? Say "yes" to confirm or "no" to cancel.`
    )

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.announceToScreenReader('Command confirmation timed out')
        resolve()
      }, this.state.voiceSettings.confirmationTimeout)

      const handleConfirmation = (event: any) => {
        const response = event.results[event.results.length - 1][0].transcript.toLowerCase().trim()
        
        if (response.includes('yes') || response.includes('confirm')) {
          clearTimeout(timeout)
          this.executeCommand(command)
          this.recognition?.removeEventListener('result', handleConfirmation)
          resolve()
        } else if (response.includes('no') || response.includes('cancel')) {
          clearTimeout(timeout)
          this.announceToScreenReader('Command cancelled')
          this.recognition?.removeEventListener('result', handleConfirmation)
          resolve()
        }
      }

      this.recognition?.addEventListener('result', handleConfirmation)
    })
  }

  private async executeCommand(command: VoiceCommand): Promise<void> {
    switch (command.action) {
      case 'navigate':
        await this.handleNavigation(command.parameters?.path)
        break
      case 'create':
        await this.handleCreate(command.parameters?.entity)
        break
      case 'save':
        await this.handleSave()
        break
      case 'cancel':
        await this.handleCancel()
        break
      case 'search':
        await this.handleSearch(command.parameters?.query)
        break
      case 'filter':
        await this.handleFilter(command.parameters)
        break
      case 'accessibility':
        await this.handleAccessibilityChange(command.parameters)
        break
      case 'consciousness':
        await this.handleConsciousnessChange(command.parameters)
        break
      case 'showInsights':
        await this.handleShowInsights()
        break
      case 'voiceControl':
        await this.handleVoiceControl(command.parameters)
        break
      case 'showHelp':
        await this.handleShowHelp()
        break
      default:
        this.announceToScreenReader('Unknown command action')
    }
  }

  private async handleNavigation(path: string): Promise<void> {
    if (path) {
      window.location.href = path
      this.announceToScreenReader(`Navigating to ${path}`)
    }
  }

  private async handleCreate(entity: string): Promise<void> {
    if (entity) {
      // Trigger create modal/form
      const event = new CustomEvent('voice-create', { detail: { entity } })
      document.dispatchEvent(event)
      this.announceToScreenReader(`Opening ${entity} creation form`)
    }
  }

  private async handleSave(): Promise<void> {
    // Trigger save action
    const event = new CustomEvent('voice-save')
    document.dispatchEvent(event)
    this.announceToScreenReader('Saving current form')
  }

  private async handleCancel(): Promise<void> {
    // Trigger cancel action
    const event = new CustomEvent('voice-cancel')
    document.dispatchEvent(event)
    this.announceToScreenReader('Cancelling current action')
  }

  private async handleSearch(query?: string): Promise<void> {
    // If no query provided, focus search input
    const searchInput = document.querySelector('[data-voice-search]') as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
      this.announceToScreenReader('Search input focused. Please speak your search query.')
    }
  }

  private async handleFilter(parameters: any): Promise<void> {
    const event = new CustomEvent('voice-filter', { detail: parameters })
    document.dispatchEvent(event)
    this.announceToScreenReader('Applying filters')
  }

  private async handleAccessibilityChange(parameters: any): Promise<void> {
    const event = new CustomEvent('voice-accessibility', { detail: parameters })
    document.dispatchEvent(event)
    
    const { type, direction, value } = parameters
    let message = ''
    
    if (type === 'fontSize') {
      message = `${direction === 'increase' ? 'Increasing' : 'Decreasing'} text size`
    } else if (type === 'contrast') {
      message = `Enabling ${value} contrast mode`
    } else if (type === 'motion') {
      message = `Setting motion to ${value}`
    }
    
    this.announceToScreenReader(message)
  }

  private async handleConsciousnessChange(parameters: any): Promise<void> {
    const event = new CustomEvent('voice-consciousness', { detail: parameters })
    document.dispatchEvent(event)
    this.announceToScreenReader(`Activating ${parameters.level} consciousness mode`)
  }

  private async handleShowInsights(): Promise<void> {
    const event = new CustomEvent('voice-show-insights')
    document.dispatchEvent(event)
    this.announceToScreenReader('Displaying AI insights')
  }

  private async handleVoiceControl(parameters: any): Promise<void> {
    if (parameters.action === 'stop') {
      this.stopListening()
      this.updateSettings({ enabled: false })
    }
  }

  private async handleShowHelp(): Promise<void> {
    const availableCommands = this.commands
      .filter(cmd => this.isCommandAccessible(cmd))
      .map(cmd => cmd.phrase)
      .slice(0, 5) // Show first 5 commands
      .join(', ')
    
    this.announceToScreenReader(`Available voice commands include: ${availableCommands}. Say "voice help" for more options.`)
  }

  private handleUnknownCommand(command: string): void {
    this.announceToScreenReader(`Sorry, I didn't understand "${command}". Say "help with voice commands" to see available options.`)
  }

  private announceToScreenReader(message: string): void {
    // Create announcement for screen readers
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)

    // Also use speech synthesis if available and enabled
    if (this.synthesis && this.state.voiceSettings.enabled) {
      this.speak(message)
    }
  }

  private speak(text: string): void {
    if (!this.synthesis) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = this.state.voiceSettings.voiceSpeed
    utterance.pitch = this.state.voiceSettings.voicePitch
    utterance.volume = this.state.voiceSettings.volume
    utterance.lang = this.state.voiceSettings.language

    // Set preferred voice if available
    const voices = this.synthesis.getVoices()
    const preferredVoice = voices.find(voice => 
      voice.name === this.state.voiceSettings.preferredVoice
    )
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    this.synthesis.speak(utterance)
  }

  // Public API methods
  public updateSettings(settings: Partial<VoiceSettings>): void {
    this.state.voiceSettings = { ...this.state.voiceSettings, ...settings }
    
    if (this.recognition) {
      this.recognition.lang = this.state.voiceSettings.language
      this.recognition.continuous = this.state.voiceSettings.continuousListening
    }

    // Save to localStorage
    localStorage.setItem('coreflow360-voice-settings', JSON.stringify(this.state.voiceSettings))
  }

  public updateContext(context: NavigationContext): void {
    this.context = context
  }

  public getState(): VoiceNavigationState {
    return { ...this.state }
  }

  public subscribe(listener: (state: VoiceNavigationState) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  public getAvailableCommands(): VoiceCommand[] {
    return this.commands.filter(cmd => this.isCommandAccessible(cmd))
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis?.getVoices() || []
  }

  private updateState(updates: Partial<VoiceNavigationState>): void {
    this.state = { ...this.state, ...updates }
    this.listeners.forEach(listener => listener(this.state))
  }
}

// Export singleton instance
export const voiceNavigationEngine = new VoiceNavigationEngine()

// React hook for easy integration
export function useVoiceNavigation() {
  const [state, setState] = React.useState(voiceNavigationEngine.getState())

  React.useEffect(() => {
    const unsubscribe = voiceNavigationEngine.subscribe(setState)
    
    // Load saved settings
    const savedSettings = localStorage.getItem('coreflow360-voice-settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        voiceNavigationEngine.updateSettings(settings)
      } catch (error) {
        console.error('Failed to load voice settings:', error)
      }
    }

    return unsubscribe
  }, [])

  return {
    state,
    startListening: () => voiceNavigationEngine.startListening(),
    stopListening: () => voiceNavigationEngine.stopListening(),
    updateSettings: (settings: Partial<VoiceSettings>) => voiceNavigationEngine.updateSettings(settings),
    updateContext: (context: NavigationContext) => voiceNavigationEngine.updateContext(context),
    getAvailableCommands: () => voiceNavigationEngine.getAvailableCommands(),
    getAvailableVoices: () => voiceNavigationEngine.getAvailableVoices()
  }
}

// Declare global types for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

// Import React for the hook (this would normally be at the top)
import React from 'react'