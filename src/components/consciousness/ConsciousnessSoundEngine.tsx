'use client'

/**
 * CoreFlow360 Consciousness Sound Engine
 * 
 * Advanced spatial audio system that creates immersive consciousness experiences
 * through binaural beats, spatial positioning, and adaptive soundscapes.
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { 
  CONSCIOUSNESS_AUDIO_STATES, 
  CONSCIOUSNESS_SOUND_EFFECTS, 
  BINAURAL_PATTERNS,
  CONSCIOUSNESS_SOUNDSCAPE,
  DEFAULT_AUDIO_CONFIG,
  type ConsciousnessAudioConfig,
  type SoundEffect,
  type ConsciousnessAudioEvent,
  type AudioSystemConfig
} from '../../lib/consciousness/soundDesign'

interface ConsciousnessSoundEngineProps {
  isEnabled?: boolean
  masterVolume?: number
  consciousnessLevel?: number
  selectedDepartments?: string[]
  cursorPosition?: { x: number; y: number }
  onAudioStateChange?: (state: 'loading' | 'ready' | 'playing' | 'error') => void
  config?: Partial<AudioSystemConfig>
}

interface AudioState {
  context: AudioContext | null
  masterGain: GainNode | null
  spatialPanner: PannerNode | null
  reverbConvolver: ConvolverNode | null
  binauralOscillators: OscillatorNode[]
  soundBuffers: Map<string, AudioBuffer>
  isInitialized: boolean
}

const ConsciousnessSoundEngine: React.FC<ConsciousnessSoundEngineProps> = ({
  isEnabled = true,
  masterVolume = 0.7,
  consciousnessLevel = 0,
  selectedDepartments = [],
  cursorPosition,
  onAudioStateChange,
  config = {}
}) => {
  const audioConfig = { ...DEFAULT_AUDIO_CONFIG, ...config }
  const [audioState, setAudioState] = useState<AudioState>({
    context: null,
    masterGain: null,
    spatialPanner: null,
    reverbConvolver: null,
    binauralOscillators: [],
    soundBuffers: new Map(),
    isInitialized: false
  })
  const [currentConsciousnessState, setCurrentConsciousnessState] = useState<string>('single_department')
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Refs for persistent audio nodes
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const spatialPannerRef = useRef<PannerNode | null>(null)
  const activeSoundsRef = useRef<Map<string, AudioBufferSourceNode>>(new Map())

  // Initialize Web Audio API
  const initializeAudioContext = useCallback(async () => {
    if (!isEnabled || audioState.isInitialized) return

    try {
      onAudioStateChange?.('loading')
      
      // Create audio context
      const context = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: audioConfig.sampleRate
      })
      audioContextRef.current = context

      // Create master gain node
      const masterGain = context.createGain()
      masterGain.gain.setValueAtTime(masterVolume, context.currentTime)
      masterGain.connect(context.destination)
      masterGainRef.current = masterGain

      // Create spatial panner for 3D audio
      const spatialPanner = context.createPanner()
      spatialPanner.panningModel = 'HRTF'
      spatialPanner.distanceModel = 'exponential'
      spatialPanner.maxDistance = audioConfig.spatialMaxDistance
      spatialPanner.connect(masterGain)
      spatialPannerRef.current = spatialPanner

      // Create reverb convolver
      const reverbConvolver = context.createConvolver()
      // Load reverb impulse response (placeholder - would load actual file)
      const reverbBuffer = context.createBuffer(2, context.sampleRate * 2, context.sampleRate)
      reverbConvolver.buffer = reverbBuffer
      reverbConvolver.connect(masterGain)

      // Load sound effect buffers
      const soundBuffers = new Map<string, AudioBuffer>()
      for (const effect of CONSCIOUSNESS_SOUND_EFFECTS) {
        try {
          // In a real implementation, we'd load actual audio files
          // For now, create synthetic audio buffers
          const buffer = await createSyntheticSoundBuffer(context, effect)
          soundBuffers.set(effect.id, buffer)
        } catch (err) {
          console.warn(`Failed to load sound effect: ${effect.id}`, err)
        }
      }

      setAudioState({
        context,
        masterGain,
        spatialPanner,
        reverbConvolver,
        binauralOscillators: [],
        soundBuffers,
        isInitialized: true
      })

      onAudioStateChange?.('ready')
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
      onAudioStateChange?.('error')
    }
  }, [isEnabled, masterVolume, audioConfig, onAudioStateChange])

  // Create synthetic sound buffer for demonstration
  const createSyntheticSoundBuffer = useCallback(async (
    context: AudioContext, 
    effect: SoundEffect
  ): Promise<AudioBuffer> => {
    const duration = 2 // 2 seconds
    const sampleRate = context.sampleRate
    const buffer = context.createBuffer(2, duration * sampleRate, sampleRate)
    
    // Generate binaural beat based on effect's base frequency
    const leftChannel = buffer.getChannelData(0)
    const rightChannel = buffer.getChannelData(1)
    
    const baseFreq = effect.binauralBase
    const beatFreq = 10 // 10Hz beat frequency
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 2) // Exponential decay
      
      // Left channel: base frequency
      leftChannel[i] = Math.sin(2 * Math.PI * baseFreq * t) * envelope * 0.3
      
      // Right channel: base frequency + beat frequency
      rightChannel[i] = Math.sin(2 * Math.PI * (baseFreq + beatFreq) * t) * envelope * 0.3
    }
    
    return buffer
  }, [])

  // Update consciousness state based on selected departments
  useEffect(() => {
    if (!selectedDepartments.length) {
      setCurrentConsciousnessState('single_department')
      return
    }

    if (selectedDepartments.length === 1) {
      setCurrentConsciousnessState('single_department')
    } else if (selectedDepartments.length === 2) {
      setCurrentConsciousnessState('dual_connection')
    } else if (selectedDepartments.length === 3) {
      setCurrentConsciousnessState('triple_synergy')
    } else if (selectedDepartments.length === 4) {
      setCurrentConsciousnessState('quad_intelligence')
    } else if (selectedDepartments.length >= 5) {
      setCurrentConsciousnessState('full_consciousness')
    }
  }, [selectedDepartments])

  // Create and manage binaural beat oscillators
  const createBinauralBeats = useCallback((audioConfig: ConsciousnessAudioConfig) => {
    if (!audioContextRef.current || !masterGainRef.current) return

    const context = audioContextRef.current
    
    // Stop existing oscillators
    audioState.binauralOscillators.forEach(osc => {
      try {
        osc.stop()
      } catch (e) {
        // Oscillator might already be stopped
      }
    })

    if (!audioConfig.binauralEnabled) return

    // Create left channel oscillator
    const leftOsc = context.createOscillator()
    const leftGain = context.createGain()
    leftOsc.frequency.setValueAtTime(audioConfig.binauralFrequency, context.currentTime)
    leftOsc.type = 'sine'
    leftGain.gain.setValueAtTime(0.1, context.currentTime)
    
    // Create right channel oscillator (with beat frequency offset)
    const rightOsc = context.createOscillator()
    const rightGain = context.createGain()
    rightOsc.frequency.setValueAtTime(
      audioConfig.binauralFrequency + audioConfig.beatFrequency, 
      context.currentTime
    )
    rightOsc.type = 'sine'
    rightGain.gain.setValueAtTime(0.1, context.currentTime)
    
    // Create stereo splitter and merger for binaural effect
    const splitter = context.createChannelSplitter(2)
    const merger = context.createChannelMerger(2)
    
    leftOsc.connect(leftGain)
    rightOsc.connect(rightGain)
    leftGain.connect(merger, 0, 0)
    rightGain.connect(merger, 0, 1)
    merger.connect(masterGainRef.current!)
    
    // Start oscillators
    leftOsc.start()
    rightOsc.start()
    
    setAudioState(prev => ({
      ...prev,
      binauralOscillators: [leftOsc, rightOsc]
    }))
  }, [audioState.binauralOscillators])

  // Play sound effect
  const playSoundEffect = useCallback((effectId: string, options: {
    volume?: number
    position?: [number, number, number]
    delay?: number
  } = {}) => {
    if (!audioContextRef.current || !masterGainRef.current) return

    const context = audioContextRef.current
    const buffer = audioState.soundBuffers.get(effectId)
    if (!buffer) return

    const source = context.createBufferSource()
    const gain = context.createGain()
    const panner = context.createPanner()

    source.buffer = buffer
    
    // Configure gain
    const volume = options.volume ?? 0.5
    gain.gain.setValueAtTime(volume, context.currentTime)
    
    // Configure spatial positioning
    if (options.position) {
      panner.panningModel = 'HRTF'
      panner.setPosition(...options.position)
    }
    
    // Connect nodes
    source.connect(gain)
    gain.connect(panner)
    panner.connect(masterGainRef.current)
    
    // Start playback
    const delay = options.delay ?? 0
    source.start(context.currentTime + delay)
    
    // Track active sound for cleanup
    activeSoundsRef.current.set(effectId, source)
    
    // Auto-cleanup when sound ends
    source.onended = () => {
      activeSoundsRef.current.delete(effectId)
    }
  }, [audioState.soundBuffers])

  // Handle consciousness state changes
  useEffect(() => {
    if (!audioState.isInitialized) return

    const consciousnessAudioConfig = CONSCIOUSNESS_AUDIO_STATES[currentConsciousnessState]
    if (consciousnessAudioConfig && audioConfig.binauralEnabled) {
      createBinauralBeats(consciousnessAudioConfig)
    }
  }, [currentConsciousnessState, audioState.isInitialized, createBinauralBeats, audioConfig.binauralEnabled])

  // Handle department selection events
  const handleDepartmentSelect = useCallback((departmentId: string) => {
    playSoundEffect('department_select', {
      volume: 0.3,
      delay: 0
    })
  }, [playSoundEffect])

  // Handle department connections
  const handleDepartmentConnection = useCallback(() => {
    if (selectedDepartments.length >= 2) {
      playSoundEffect('synaptic_connection', {
        volume: 0.4,
        position: [0, 1, 0],
        delay: 0.5
      })
    }
  }, [selectedDepartments.length, playSoundEffect])

  // Handle intelligence multiplication
  const handleIntelligenceMultiplication = useCallback(() => {
    if (selectedDepartments.length >= 3) {
      playSoundEffect('intelligence_multiplication', {
        volume: 0.5,
        delay: 0.2
      })
      
      // Chain to consciousness emergence if full consciousness
      if (selectedDepartments.length >= 5) {
        setTimeout(() => {
          playSoundEffect('consciousness_emergence', {
            volume: 0.6,
            position: [0, 5, 0],
            delay: 1
          })
        }, 2000)
      }
    }
  }, [selectedDepartments.length, playSoundEffect])

  // Handle cursor movement (subtle awareness field)
  useEffect(() => {
    if (!cursorPosition || !audioConfig.spatialEnabled) return

    // Update spatial panner position based on cursor
    if (spatialPannerRef.current) {
      const normalizedX = (cursorPosition.x / window.innerWidth - 0.5) * 2
      const normalizedY = (cursorPosition.y / window.innerHeight - 0.5) * 2
      
      spatialPannerRef.current.setPosition(
        normalizedX * 5, // X position
        -normalizedY * 5, // Y position (inverted)
        1 // Z position (in front)
      )
    }

    // Occasionally play cursor consciousness field
    if (Math.random() < 0.01) { // 1% chance per cursor move
      playSoundEffect('cursor_consciousness', {
        volume: 0.1,
        position: [normalizedX * 2, -normalizedY * 2, 1]
      })
    }
  }, [cursorPosition, audioConfig.spatialEnabled, playSoundEffect])

  // Initialize audio on first user interaction
  useEffect(() => {
    if (isEnabled && !audioState.isInitialized) {
      // Wait for user interaction to initialize audio context
      const handleUserInteraction = () => {
        initializeAudioContext()
        document.removeEventListener('click', handleUserInteraction)
        document.removeEventListener('keydown', handleUserInteraction)
      }
      
      document.addEventListener('click', handleUserInteraction)
      document.addEventListener('keydown', handleUserInteraction)
      
      return () => {
        document.removeEventListener('click', handleUserInteraction)
        document.removeEventListener('keydown', handleUserInteraction)
      }
    }
  }, [isEnabled, audioState.isInitialized, initializeAudioContext])

  // Expose sound engine API through custom events
  useEffect(() => {
    const handleAudioEvent = (event: CustomEvent<{
      type: ConsciousnessAudioEvent
      data?: any
    }>) => {
      const { type, data } = event.detail
      
      switch (type) {
        case 'department_awaken':
          handleDepartmentSelect(data?.departmentId)
          break
        case 'synapse_form':
          handleDepartmentConnection()
          break
        case 'intelligence_multiply':
          handleIntelligenceMultiplication()
          break
        case 'consciousness_emerge':
          playSoundEffect('consciousness_emergence', { volume: 0.7 })
          break
        case 'pricing_calculate':
          playSoundEffect('pricing_calculation', { volume: 0.3 })
          break
      }
    }

    window.addEventListener('consciousness-audio', handleAudioEvent as EventListener)
    return () => {
      window.removeEventListener('consciousness-audio', handleAudioEvent as EventListener)
    }
  }, [handleDepartmentSelect, handleDepartmentConnection, handleIntelligenceMultiplication, playSoundEffect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop all active sounds
      activeSoundsRef.current.forEach(source => {
        try {
          source.stop()
        } catch (e) {
          // Sound might already be stopped
        }
      })
      
      // Stop oscillators
      audioState.binauralOscillators.forEach(osc => {
        try {
          osc.stop()
        } catch (e) {
          // Oscillator might already be stopped
        }
      })
      
      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Master volume control
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        isEnabled ? masterVolume : 0,
        audioContextRef.current?.currentTime ?? 0
      )
    }
  }, [masterVolume, isEnabled])

  // Return null - this is a headless component
  return null
}

// Helper function to trigger consciousness audio events
export const triggerConsciousnessAudioEvent = (
  type: ConsciousnessAudioEvent, 
  data?: any
) => {
  const event = new CustomEvent('consciousness-audio', {
    detail: { type, data }
  })
  window.dispatchEvent(event)
}

export default ConsciousnessSoundEngine