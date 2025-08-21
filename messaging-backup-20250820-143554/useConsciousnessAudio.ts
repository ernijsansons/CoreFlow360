/**
 * CoreFlow360 Consciousness Audio Hook
 *
 * React hook for managing consciousness audio experiences throughout
 * the application. Provides easy integration with business consciousness
 * state changes and user interactions.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ConsciousnessAudioEvent,
  AudioSystemConfig,
  DEFAULT_AUDIO_CONFIG,
} from '../lib/consciousness/soundDesign'

interface ConsciousnessAudioState {
  isEnabled: boolean
  isInitialized: boolean
  consciousnessLevel: number
  currentState: string
  spatialPosition: [number, number, number]
  activeEvents: ConsciousnessAudioEvent[]
  audioConfig: AudioSystemConfig
}

interface ConsciousnessAudioActions {
  enable: () => void
  disable: () => void
  setConsciousnessLevel: (level: number) => void
  updateSpatialPosition: (position: [number, number, number]) => void
  triggerEvent: (event: ConsciousnessAudioEvent) => void
  updateConfig: (config: Partial<AudioSystemConfig>) => void
  playDepartmentAwakening: (departmentId: string) => void
  playConnectionSound: () => void
  playMultiplicationSound: () => void
  playConsciousnessEmergence: () => void
}

interface UseConsciousnessAudioOptions {
  initiallyEnabled?: boolean
  initialConsciousnessLevel?: number
  initialSpatialPosition?: [number, number, number]
  audioConfig?: Partial<AudioSystemConfig>
  onAudioEvent?: (event: ConsciousnessAudioEvent) => void
  debugMode?: boolean
}

interface UseConsciousnessAudioReturn extends ConsciousnessAudioState, ConsciousnessAudioActions {
  audioEngine: unknown | null
  setAudioEngine: (engine: unknown) => void
}

/**
 * Primary hook for consciousness audio integration
 */
export const useConsciousnessAudio = (
  options: UseConsciousnessAudioOptions = {}
): UseConsciousnessAudioReturn => {
  const {
    initiallyEnabled = false,
    initialConsciousnessLevel = 1,
    initialSpatialPosition = [0, 0, 0],
    audioConfig = {},
    onAudioEvent,
    debugMode = false,
  } = options

  // Audio engine state
  const [audioEngine, setAudioEngine] = useState<unknown>(null)
  const [isEnabled, setIsEnabled] = useState(initiallyEnabled)
  const [isInitialized, setIsInitialized] = useState(false)
  const [consciousnessLevel, setConsciousnessLevel] = useState(initialConsciousnessLevel)
  const [currentState, setCurrentState] = useState('single_department')
  const [spatialPosition, setSpatialPosition] =
    useState<[number, number, number]>(initialSpatialPosition)
  const [activeEvents, setActiveEvents] = useState<ConsciousnessAudioEvent[]>([])
  const [fullAudioConfig, setFullAudioConfig] = useState<AudioSystemConfig>({
    ...DEFAULT_AUDIO_CONFIG,
    ...audioConfig,
  })

  // Refs for tracking
  const lastConsciousnessLevel = useRef(consciousnessLevel)
  const eventTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

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

    if (newState !== currentState) {
      setCurrentState(newState)

      if (debugMode) {
        console.log(
          `Consciousness state updated: ${currentState} -> ${newState} (level: ${consciousnessLevel})`
        )
      }
    }
  }, [consciousnessLevel, currentState, debugMode])

  // Enable audio system
  const enable = useCallback(() => {
    setIsEnabled(true)

    if (debugMode) {
    }
  }, [debugMode])

  // Disable audio system
  const disable = useCallback(() => {
    setIsEnabled(false)

    // Clear any pending events
    eventTimeouts.current.forEach((timeout) => clearTimeout(timeout))
    eventTimeouts.current.clear()

    if (debugMode) {
    }
  }, [debugMode])

  // Update spatial position
  const updateSpatialPosition = useCallback(
    (position: [number, number, number]) => {
      setSpatialPosition(position)

      if (audioEngine) {
        audioEngine.updateSpatialPosition?.(position)
      }
    },
    [audioEngine]
  )

  // Trigger consciousness audio event
  const triggerEvent = useCallback(
    (event: ConsciousnessAudioEvent) => {
      if (!isEnabled || !audioEngine) {
        if (debugMode) {
        }
        return
      }

      // Add to active events
      setActiveEvents((prev) => {
        if (!prev.includes(event)) {
          return [...prev, event]
        }
        return prev
      })

      // Trigger through audio engine
      audioEngine.triggerEvent?.(event)

      // Notify parent
      onAudioEvent?.(event)

      // Remove from active events after duration
      const eventTimeout = setTimeout(() => {
        setActiveEvents((prev) => prev.filter((e) => e !== event))
      }, 3000) // 3 second event duration

      eventTimeouts.current.set(event, eventTimeout)

      if (debugMode) {
      }
    },
    [isEnabled, audioEngine, onAudioEvent, debugMode]
  )

  // Update audio configuration
  const updateConfig = useCallback(
    (config: Partial<AudioSystemConfig>) => {
      setFullAudioConfig((prev) => ({ ...prev, ...config }))

      if (debugMode) {
      }
    },
    [debugMode]
  )

  // Convenience methods for common events
  const playDepartmentAwakening = useCallback(
    (_departmentId: string) => {
      triggerEvent('department_awaken')

      if (debugMode) {
      }
    },
    [triggerEvent, debugMode]
  )

  const playConnectionSound = useCallback(() => {
    triggerEvent('first_connection')
  }, [triggerEvent])

  const playMultiplicationSound = useCallback(() => {
    triggerEvent('intelligence_multiplication')
  }, [triggerEvent])

  const playConsciousnessEmergence = useCallback(() => {
    triggerEvent('full_consciousness')
  }, [triggerEvent])

  // Auto-trigger events based on consciousness level changes
  useEffect(() => {
    const levelDiff = consciousnessLevel - lastConsciousnessLevel.current

    if (levelDiff > 0 && isEnabled) {
      // Consciousness level increased
      if (consciousnessLevel >= 2 && lastConsciousnessLevel.current < 2) {
        // First connection achieved
        setTimeout(() => playConnectionSound(), 500)
      }

      if (consciousnessLevel >= 4 && lastConsciousnessLevel.current < 4) {
        // Intelligence multiplication begins
        setTimeout(() => playMultiplicationSound(), 800)
      }

      if (consciousnessLevel >= 10 && lastConsciousnessLevel.current < 10) {
        // Full consciousness emergence
        setTimeout(() => playConsciousnessEmergence(), 1200)
      }
    }

    lastConsciousnessLevel.current = consciousnessLevel
  }, [
    consciousnessLevel,
    isEnabled,
    playConnectionSound,
    playMultiplicationSound,
    playConsciousnessEmergence,
  ])

  // Update consciousness state when level changes
  useEffect(() => {
    updateConsciousnessState()
  }, [updateConsciousnessState])

  // Initialize audio system
  useEffect(() => {
    if (isEnabled && audioEngine) {
      setIsInitialized(true)
    } else {
      setIsInitialized(false)
    }
  }, [isEnabled, audioEngine])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      eventTimeouts.current.forEach((timeout) => clearTimeout(timeout))
      eventTimeouts.current.clear()
    }
  }, [])

  return {
    // State
    isEnabled,
    isInitialized,
    consciousnessLevel,
    currentState,
    spatialPosition,
    activeEvents,
    audioConfig: fullAudioConfig,
    audioEngine,

    // Actions
    enable,
    disable,
    setConsciousnessLevel,
    updateSpatialPosition,
    triggerEvent,
    updateConfig,
    playDepartmentAwakening,
    playConnectionSound,
    playMultiplicationSound,
    playConsciousnessEmergence,
    setAudioEngine,
  }
}

/**
 * Simplified hook for basic consciousness audio integration
 */
export const useBasicConsciousnessAudio = (consciousnessLevel: number) => {
  const {
    enable,
    disable,
    isEnabled,
    playDepartmentAwakening,
    playConnectionSound,
    playMultiplicationSound,
    playConsciousnessEmergence,
  } = useConsciousnessAudio({
    initialConsciousnessLevel: consciousnessLevel,
    initiallyEnabled: false,
  })

  return {
    enableAudio: enable,
    disableAudio: disable,
    isAudioEnabled: isEnabled,
    playAwakening: playDepartmentAwakening,
    playConnection: playConnectionSound,
    playMultiplication: playMultiplicationSound,
    playEmergence: playConsciousnessEmergence,
  }
}

/**
 * Hook for pricing calculator audio integration
 */
export const usePricingAudio = (intelligenceMultiplier: number) => {
  const { triggerEvent, setConsciousnessLevel } = useConsciousnessAudio({
    initiallyEnabled: true,
    initialConsciousnessLevel: intelligenceMultiplier,
  })

  const handleDepartmentSelect = useCallback(() => {
    triggerEvent('department_awaken')
  }, [triggerEvent])

  const handleCalculationUpdate = useCallback(() => {
    triggerEvent('pricing_interaction')
  }, [triggerEvent])

  const handleMultiplicationVisualization = useCallback(() => {
    if (intelligenceMultiplier >= 2) {
      triggerEvent('intelligence_multiplication')
    }
  }, [intelligenceMultiplier, triggerEvent])

  // Update consciousness level based on intelligence multiplier
  useEffect(() => {
    setConsciousnessLevel(intelligenceMultiplier)
  }, [intelligenceMultiplier, setConsciousnessLevel])

  return {
    onDepartmentSelect: handleDepartmentSelect,
    onCalculationUpdate: handleCalculationUpdate,
    onMultiplicationVisualize: handleMultiplicationVisualization,
  }
}

/**
 * Hook for cursor consciousness audio effects
 */
export const useCursorConsciousnessAudio = () => {
  const { triggerEvent } = useConsciousnessAudio({
    initiallyEnabled: true,
  })

  const handleCursorMove = useCallback(
    (_x: number, _y: number) => {
      // Subtle cursor consciousness field
      if (Math.random() < 0.05) {
        // 5% chance on mouse move
        triggerEvent('cursor_awareness')
      }
    },
    [triggerEvent]
  )

  return {
    onCursorMove: handleCursorMove,
  }
}
