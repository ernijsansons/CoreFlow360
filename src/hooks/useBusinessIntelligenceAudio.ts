/**
 * CoreFlow360 Business Intelligence Audio Hook
 *
 * React hook for managing business intelligence audio experiences throughout
 * the application. Provides easy integration with business intelligence
 * state changes and user interactions.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  BusinessIntelligenceAudioEvent,
  AudioSystemConfig,
  DEFAULT_AUDIO_CONFIG,
} from '../lib/business-intelligence/soundDesign'

interface BusinessIntelligenceAudioState {
  isEnabled: boolean
  isInitialized: boolean
  intelligenceLevel: number
  currentState: string
  spatialPosition: [number, number, number]
  activeEvents: BusinessIntelligenceAudioEvent[]
  audioConfig: AudioSystemConfig
}

interface BusinessIntelligenceAudioActions {
  enable: () => void
  disable: () => void
  setIntelligenceLevel: (level: number) => void
  updateSpatialPosition: (position: [number, number, number]) => void
  triggerEvent: (event: BusinessIntelligenceAudioEvent) => void
  updateConfig: (config: Partial<AudioSystemConfig>) => void
  playDepartmentAwakening: (departmentId: string) => void
  playConnectionSound: () => void
  playMultiplicationSound: () => void
  playIntelligenceEmergence: () => void
}

interface UseBusinessIntelligenceAudioOptions {
  initiallyEnabled?: boolean
  initialIntelligenceLevel?: number
  initialSpatialPosition?: [number, number, number]
  audioConfig?: Partial<AudioSystemConfig>
  onAudioEvent?: (event: BusinessIntelligenceAudioEvent) => void
  debugMode?: boolean
}

interface UseBusinessIntelligenceAudioReturn extends BusinessIntelligenceAudioState, BusinessIntelligenceAudioActions {
  audioEngine: unknown | null
  setAudioEngine: (engine: unknown) => void
}

/**
 * Primary hook for business intelligence audio integration
 */
export const useBusinessIntelligenceAudio = (
  options: UseBusinessIntelligenceAudioOptions = {}
): UseBusinessIntelligenceAudioReturn => {
  const {
    initiallyEnabled = false,
    initialIntelligenceLevel = 1,
    initialSpatialPosition = [0, 0, 0],
    audioConfig = {},
    onAudioEvent,
    debugMode = false,
  } = options

  // Audio engine state
  const [audioEngine, setAudioEngine] = useState<unknown>(null)
  const [isEnabled, setIsEnabled] = useState(initiallyEnabled)
  const [isInitialized, setIsInitialized] = useState(false)
  const [intelligenceLevel, setIntelligenceLevel] = useState(initialIntelligenceLevel)
  const [currentState, setCurrentState] = useState('single_department')
  const [spatialPosition, setSpatialPosition] =
    useState<[number, number, number]>(initialSpatialPosition)
  const [activeEvents, setActiveEvents] = useState<BusinessIntelligenceAudioEvent[]>([])
  const [fullAudioConfig, setFullAudioConfig] = useState<AudioSystemConfig>({
    ...DEFAULT_AUDIO_CONFIG,
    ...audioConfig,
  })

  // Refs for tracking
  const lastintelligenceLevel = useRef(intelligenceLevel)
  const eventTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Update business intelligence state based on level
  const updateBusinessIntelligenceState = useCallback(() => {
    let newState = 'single_department'

    if (intelligenceLevel >= 10) {
      newState = 'full_business_intelligence'
    } else if (intelligenceLevel >= 5) {
      newState = 'quad_intelligence'
    } else if (intelligenceLevel >= 3) {
      newState = 'triple_synergy'
    } else if (intelligenceLevel >= 2) {
      newState = 'dual_connection'
    }

    if (newState !== currentState) {
      setCurrentState(newState)

      if (debugMode) {
        console.log(
          `Business intelligence state updated: ${currentState} -> ${newState} (level: ${intelligenceLevel})`
        )
      }
    }
  }, [intelligenceLevel, currentState, debugMode])

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

  // Trigger business intelligence audio event
  const triggerEvent = useCallback(
    (event: BusinessIntelligenceAudioEvent) => {
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

  const playIntelligenceEmergence = useCallback(() => {
    triggerEvent('full_business_intelligence')
  }, [triggerEvent])

  // Auto-trigger events based on business intelligence level changes
  useEffect(() => {
    const levelDiff = intelligenceLevel - lastintelligenceLevel.current

    if (levelDiff > 0 && isEnabled) {
      // Business intelligence level increased
      if (intelligenceLevel >= 2 && lastintelligenceLevel.current < 2) {
        // First connection achieved
        setTimeout(() => playConnectionSound(), 500)
      }

      if (intelligenceLevel >= 4 && lastintelligenceLevel.current < 4) {
        // Intelligence multiplication begins
        setTimeout(() => playMultiplicationSound(), 800)
      }

      if (intelligenceLevel >= 10 && lastintelligenceLevel.current < 10) {
        // Full intelligent automation
        setTimeout(() => playIntelligenceEmergence(), 1200)
      }
    }

    lastintelligenceLevel.current = intelligenceLevel
  }, [
    intelligenceLevel,
    isEnabled,
    playConnectionSound,
    playMultiplicationSound,
    playIntelligenceEmergence,
  ])

  // Update business intelligence state when level changes
  useEffect(() => {
    updateBusinessIntelligenceState()
  }, [updateBusinessIntelligenceState])

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
    intelligenceLevel,
    currentState,
    spatialPosition,
    activeEvents,
    audioConfig: fullAudioConfig,
    audioEngine,

    // Actions
    enable,
    disable,
    setIntelligenceLevel,
    updateSpatialPosition,
    triggerEvent,
    updateConfig,
    playDepartmentAwakening,
    playConnectionSound,
    playMultiplicationSound,
    playIntelligenceEmergence,
    setAudioEngine,
  }
}

/**
 * Simplified hook for basic business intelligence audio integration
 */
export const useBasicBusinessIntelligenceAudio = (intelligenceLevel: number) => {
  const {
    enable,
    disable,
    isEnabled,
    playDepartmentAwakening,
    playConnectionSound,
    playMultiplicationSound,
    playIntelligenceEmergence,
  } = useBusinessIntelligenceAudio({
    initialIntelligenceLevel: intelligenceLevel,
    initiallyEnabled: false,
  })

  return {
    enableAudio: enable,
    disableAudio: disable,
    isAudioEnabled: isEnabled,
    playAwakening: playDepartmentAwakening,
    playConnection: playConnectionSound,
    playMultiplication: playMultiplicationSound,
    playEmergence: playIntelligenceEmergence,
  }
}

/**
 * Hook for pricing calculator audio integration
 */
export const usePricingAudio = (intelligenceMultiplier: number) => {
  const { triggerEvent, setIntelligenceLevel } = useBusinessIntelligenceAudio({
    initiallyEnabled: true,
    initialIntelligenceLevel: intelligenceMultiplier,
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

  // Update business intelligence level based on intelligence multiplier
  useEffect(() => {
    setIntelligenceLevel(intelligenceMultiplier)
  }, [intelligenceMultiplier, setIntelligenceLevel])

  return {
    onDepartmentSelect: handleDepartmentSelect,
    onCalculationUpdate: handleCalculationUpdate,
    onMultiplicationVisualize: handleMultiplicationVisualization,
  }
}

/**
 * Hook for cursor business intelligence audio effects
 */
export const useCursorBusinessIntelligenceAudio = () => {
  const { triggerEvent } = useBusinessIntelligenceAudio({
    initiallyEnabled: true,
  })

  const handleCursorMove = useCallback(
    (_x: number, _y: number) => {
      // Subtle cursor business intelligence field
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

// Export alias for compatibility
export const useIntelligenceAudio = useBusinessIntelligenceAudio
