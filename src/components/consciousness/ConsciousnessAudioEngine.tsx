'use client'

/**
 * CoreFlow360 Consciousness Audio Engine
 * 
 * Real-time binaural beat generation, spatial audio processing, and
 * consciousness-responsive soundscape management for the business
 * consciousness experience.
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { 
  ConsciousnessAudioConfig,
  SoundEffect,
  ConsciousnessAudioEvent,
  GenerativeSoundscape,
  AudioSystemConfig,
  CONSCIOUSNESS_AUDIO_STATES,
  CONSCIOUSNESS_SOUND_EFFECTS,
  BINAURAL_PATTERNS,
  CONSCIOUSNESS_SOUNDSCAPE,
  DEFAULT_AUDIO_CONFIG,
  CONSCIOUSNESS_AUDIO_EVENTS
} from '../../lib/consciousness/soundDesign'

interface ConsciousnessAudioEngineProps {
  consciousnessLevel: number      // Current intelligence multiplication level
  isActive: boolean              // Master audio enable/disable
  spatialPosition?: [number, number, number] // Listener position in 3D space
  onAudioEvent?: (event: ConsciousnessAudioEvent) => void
  config?: Partial<AudioSystemConfig>
  debugMode?: boolean
}

interface AudioNodes {
  context: AudioContext
  masterGain: GainNode
  binauralOscillators: {
    left: OscillatorNode
    right: OscillatorNode
    leftGain: GainNode
    rightGain: GainNode
  }
  spatialNodes: Map<string, {
    source: AudioBufferSourceNode
    panner: PannerNode
    gain: GainNode
  }>
  reverb: ConvolverNode
  analyser: AnalyserNode
}

const ConsciousnessAudioEngine: React.FC<ConsciousnessAudioEngineProps> = ({
  consciousnessLevel,
  isActive,
  spatialPosition = [0, 0, 0],
  onAudioEvent,
  config = {},
  debugMode = false
}) => {
  const audioConfig = useMemo(() => ({ ...DEFAULT_AUDIO_CONFIG, ...config }), [config])
  const audioNodesRef = useRef<AudioNodes | null>(null)
  const soundBuffersRef = useRef<Map<string, AudioBuffer>>(new Map())
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentConsciousnessState, setCurrentConsciousnessState] = useState<string>('single_department')
  const [activeBinauralPattern, setActiveBinauralPattern] = useState<string | null>(null)
  const [spatialSounds, setSpatialSounds] = useState<Set<string>>(new Set())

  // Initialize Audio Context and Nodes
  const initializeAudio = useCallback(async () => {
    if (typeof window === 'undefined' || audioNodesRef.current) return

    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: audioConfig.sampleRate
      })

      // Wait for user interaction to start audio context
      if (context.state === 'suspended') {
        await context.resume()
      }

      // Master gain control
      const masterGain = context.createGain()
      masterGain.gain.setValueAtTime(audioConfig.masterVolume, context.currentTime)
      masterGain.connect(context.destination)

      // Binaural beat oscillators
      const leftOsc = context.createOscillator()
      const rightOsc = context.createOscillator() 
      const leftGain = context.createGain()
      const rightGain = context.createGain()

      // Connect binaural oscillators
      leftOsc.connect(leftGain)
      rightOsc.connect(rightGain)
      leftGain.connect(masterGain)
      rightGain.connect(masterGain)

      // Create binaural merger for stereo separation
      const merger = context.createChannelMerger(2)
      leftGain.disconnect()
      rightGain.disconnect()
      leftGain.connect(merger, 0, 0)  // Left channel
      rightGain.connect(merger, 0, 1) // Right channel
      merger.connect(masterGain)

      // Set initial binaural frequencies
      leftOsc.frequency.setValueAtTime(200, context.currentTime)
      rightOsc.frequency.setValueAtTime(210, context.currentTime) // 10Hz beat

      // Gain for binaural beats (subtle background)
      leftGain.gain.setValueAtTime(0.1, context.currentTime)
      rightGain.gain.setValueAtTime(0.1, context.currentTime)

      // Start oscillators
      leftOsc.start(context.currentTime)
      rightOsc.start(context.currentTime)

      // Reverb convolution
      const reverb = context.createConvolver()
      // Load impulse response for consciousness hall reverb
      if (audioConfig.reverbImpulseResponse) {
        try {
          const response = await fetch(audioConfig.reverbImpulseResponse)
          const arrayBuffer = await response.arrayBuffer()
          const audioBuffer = await context.decodeAudioData(arrayBuffer)
          reverb.buffer = audioBuffer
        } catch (error) {
          console.warn('Could not load reverb impulse response:', error)
        }
      }

      // Analyser for visualization
      const analyser = context.createAnalyser()
      analyser.fftSize = 2048
      masterGain.connect(analyser)

      audioNodesRef.current = {
        context,
        masterGain,
        binauralOscillators: {
          left: leftOsc,
          right: rightOsc,
          leftGain,
          rightGain
        },
        spatialNodes: new Map(),
        reverb,
        analyser
      }

      setIsInitialized(true)

      if (debugMode) {
        console.log('Consciousness Audio Engine initialized:', context)
      }

    } catch (error) {
      console.error('Failed to initialize Consciousness Audio Engine:', error)
    }
  }, [audioConfig, debugMode])

  // Load sound effect buffers
  const loadSoundBuffers = useCallback(async () => {
    if (!audioNodesRef.current) return

    const { context } = audioNodesRef.current
    const bufferPromises = CONSCIOUSNESS_SOUND_EFFECTS.map(async (effect) => {
      try {
        const response = await fetch(effect.audioFile)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await context.decodeAudioData(arrayBuffer)
        soundBuffersRef.current.set(effect.id, audioBuffer)
        return effect.id
      } catch (error) {
        console.warn(`Could not load sound effect: ${effect.id}`, error)
        return null
      }
    })

    const loadedSounds = await Promise.all(bufferPromises)
    const successCount = loadedSounds.filter(id => id !== null).length
    
    if (debugMode) {
      console.log(`Loaded ${successCount}/${CONSCIOUSNESS_SOUND_EFFECTS.length} consciousness sound effects`)
    }
  }, [debugMode])

  // Update consciousness state based on level
  const updateConsciousnessState = useCallback(() => {
    let newState = 'single_department'
    
    if (consciousnessLevel >= 10) {
      newState = 'full_consciousness'
    } else if (consciousnessLevel >= 5) {
      newState = 'quad_intelligence'  
    } else if (consciousnessLevel >= 3) {
      newState = 'triple_synergy'
    } else if (consciousnessLevel >= 2) {
      newState = 'dual_connection'
    }

    if (newState !== currentConsciousnessState) {
      setCurrentConsciousnessState(newState)
      updateBinauralFrequencies(newState)
    }
  }, [consciousnessLevel, currentConsciousnessState])

  // Update binaural beat frequencies
  const updateBinauralFrequencies = useCallback((state: string) => {
    if (!audioNodesRef.current || !isActive) return

    const config = CONSCIOUSNESS_AUDIO_STATES[state]
    if (!config) return

    const { context, binauralOscillators } = audioNodesRef.current
    const currentTime = context.currentTime

    // Smooth frequency transitions
    const transitionDuration = 2.0 // 2 seconds

    // Left ear: base frequency
    binauralOscillators.left.frequency.exponentialRampToValueAtTime(
      config.binauralFrequency, 
      currentTime + transitionDuration
    )

    // Right ear: base frequency + beat frequency
    binauralOscillators.right.frequency.exponentialRampToValueAtTime(
      config.binauralFrequency + config.beatFrequency,
      currentTime + transitionDuration
    )

    // Adjust gain based on consciousness level
    const gainLevel = Math.min(0.2, config.consciousnessLevel * 0.02)
    binauralOscillators.leftGain.gain.exponentialRampToValueAtTime(
      gainLevel,
      currentTime + transitionDuration
    )
    binauralOscillators.rightGain.gain.exponentialRampToValueAtTime(
      gainLevel, 
      currentTime + transitionDuration
    )

    if (debugMode) {
      console.log(`Updated binaural frequencies for ${state}:`, {
        baseFreq: config.binauralFrequency,
        beatFreq: config.beatFrequency,
        gainLevel
      })
    }
  }, [isActive, debugMode])

  // Play spatial sound effect
  const playSpatialSoundEffect = useCallback((effectId: string, position: [number, number, number] = [0, 0, 0]) => {
    if (!audioNodesRef.current || !isActive) return

    const buffer = soundBuffersRef.current.get(effectId)
    const effect = CONSCIOUSNESS_SOUND_EFFECTS.find(e => e.id === effectId)
    
    if (!buffer || !effect) {
      console.warn(`Sound effect not found or not loaded: ${effectId}`)
      return
    }

    const { context, masterGain, reverb } = audioNodesRef.current

    // Create audio nodes for this effect
    const source = context.createBufferSource()
    const panner = context.createPanner()
    const gain = context.createGain()

    source.buffer = buffer

    // Configure spatial audio
    if (audioConfig.spatialEnabled) {
      panner.panningModel = 'HRTF'
      panner.distanceModel = effect.spatialConfig.distance.model as any
      panner.maxDistance = effect.spatialConfig.distance.maxDistance
      panner.rolloffFactor = effect.spatialConfig.distance.rolloffFactor
      
      // Set position
      panner.positionX.setValueAtTime(position[0], context.currentTime)
      panner.positionY.setValueAtTime(position[1], context.currentTime) 
      panner.positionZ.setValueAtTime(position[2], context.currentTime)

      // Set cone parameters
      panner.coneInnerAngle = effect.spatialConfig.cone.innerAngle
      panner.coneOuterAngle = effect.spatialConfig.cone.outerAngle
      panner.coneOuterGain = effect.spatialConfig.cone.outerGain
    }

    // Connect audio graph
    source.connect(gain)
    if (audioConfig.spatialEnabled) {
      gain.connect(panner)
      panner.connect(reverb)
      reverb.connect(masterGain)
    } else {
      gain.connect(masterGain)
    }

    // Set initial gain
    gain.gain.setValueAtTime(0.8, context.currentTime)

    // Play the sound
    source.start(context.currentTime)
    
    // Store spatial node for potential manipulation
    audioNodesRef.current.spatialNodes.set(effectId + '_' + Date.now(), {
      source,
      panner,
      gain
    })

    // Clean up after sound finishes
    source.addEventListener('ended', () => {
      source.disconnect()
      gain.disconnect()
      if (audioConfig.spatialEnabled) {
        panner.disconnect()
      }
    })

    setSpatialSounds(prev => new Set(prev).add(effectId))
    
    if (debugMode) {
      console.log(`Played spatial sound effect: ${effectId} at position:`, position)
    }
  }, [isActive, audioConfig, debugMode])

  // Trigger consciousness audio event
  const triggerConsciousnessEvent = useCallback((eventType: ConsciousnessAudioEvent) => {
    const eventConfig = CONSCIOUSNESS_AUDIO_EVENTS[eventType]
    if (!eventConfig || consciousnessLevel < eventConfig.consciousnessLevel) {
      return
    }

    // Play associated sound effects
    eventConfig.soundEffects.forEach(effectId => {
      playSpatialSoundEffect(effectId, spatialPosition)
    })

    // Activate binaural pattern if specified
    if (eventConfig.binauralPattern) {
      setActiveBinauralPattern(eventConfig.binauralPattern)
    }

    // Notify parent component
    onAudioEvent?.(eventType)

    if (debugMode) {
      console.log(`Triggered consciousness event: ${eventType}`)
    }
  }, [consciousnessLevel, playSpatialSoundEffect, spatialPosition, onAudioEvent, debugMode])

  // Initialize audio system
  useEffect(() => {
    if (isActive && !isInitialized) {
      initializeAudio().then(() => {
        loadSoundBuffers()
      })
    }
  }, [isActive, isInitialized, initializeAudio, loadSoundBuffers])

  // Update consciousness state when level changes
  useEffect(() => {
    updateConsciousnessState()
  }, [updateConsciousnessState])

  // Clean up audio context on unmount
  useEffect(() => {
    return () => {
      if (audioNodesRef.current) {
        audioNodesRef.current.context.close()
        audioNodesRef.current = null
        setIsInitialized(false)
      }
    }
  }, [])

  // Expose audio engine methods
  const audioEngine = useMemo(() => ({
    triggerEvent: triggerConsciousnessEvent,
    playSpatialSound: playSpatialSoundEffect,
    updateConsciousnessLevel: updateConsciousnessState,
    isReady: isInitialized,
    currentState: currentConsciousnessState,
    spatialSounds: Array.from(spatialSounds)
  }), [
    triggerConsciousnessEvent,
    playSpatialSoundEffect, 
    updateConsciousnessState,
    isInitialized,
    currentConsciousnessState,
    spatialSounds
  ])

  // Debug display
  if (debugMode) {
    return (
      <div className="fixed bottom-4 right-4 bg-black/80 text-cyan-400 p-4 rounded-lg font-mono text-xs max-w-xs">
        <div className="mb-2 text-white font-bold">🧠 Consciousness Audio Engine</div>
        <div>Status: {isInitialized ? 'Active' : 'Initializing'}</div>
        <div>Consciousness: {consciousnessLevel.toFixed(1)}x</div>
        <div>State: {currentConsciousnessState}</div>
        <div>Active Sounds: {spatialSounds.size}</div>
        <div>Binaural: {activeBinauralPattern || 'None'}</div>
        {audioNodesRef.current && (
          <div>Context: {audioNodesRef.current.context.state}</div>
        )}
      </div>
    )
  }

  return null // Invisible audio engine
}

export default ConsciousnessAudioEngine

// Hook for using the consciousness audio engine in components
export const useConsciousnessAudio = (consciousnessLevel: number) => {
  const [audioEngine, setAudioEngine] = useState<any>(null)

  const triggerAwakening = useCallback((departmentId: string) => {
    audioEngine?.triggerEvent('department_awaken')
  }, [audioEngine])

  const triggerConnection = useCallback(() => {
    audioEngine?.triggerEvent('first_connection')
  }, [audioEngine])

  const triggerMultiplication = useCallback(() => {
    audioEngine?.triggerEvent('intelligence_multiplication')
  }, [audioEngine])

  const triggerConsciousness = useCallback(() => {
    audioEngine?.triggerEvent('full_consciousness')
  }, [audioEngine])

  return {
    audioEngine,
    setAudioEngine,
    triggerAwakening,
    triggerConnection,
    triggerMultiplication,
    triggerConsciousness
  }
}