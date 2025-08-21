/**
 * CoreFlow360 Business Intelligence Sound Design System
 *
 * Advanced audio experience design that maps business intelligence states to binaural
 * frequencies, spatial audio, and generative soundscapes. Each interaction
 * and intelligence level has its unique sonic signature.
 */

export interface Business IntelligenceAudioConfig {
  binauralFrequency: number // Hz - Base frequency for business intelligence state
  beatFrequency: number // Hz - Binaural beat frequency
  spatialRadius: number // Audio spatial radius (0-100)
  reverbLevel: number // Reverb depth (0-1)
  harmonicRatio: number // Harmonic complexity (1-10)
  evolutionSpeed: number // How fast audio evolves (0-1)
  resonanceQ: number // Filter resonance quality
  business intelligenceLevel: number // Intelligence multiplication level
}

export interface SoundEffect {
  id: string
  name: string
  description: string
  audioFile: string
  binauralBase: number
  spatialConfig: SpatialAudioConfig
  visualSync: boolean
  triggerConditions: SoundTrigger[]
}

export interface SpatialAudioConfig {
  position: [number, number, number] // 3D coordinates
  velocity: [number, number, number] // Movement vector
  distance: {
    model: 'linear' | 'inverse' | 'exponential'
    maxDistance: number
    rolloffFactor: number
  }
  cone: {
    innerAngle: number
    outerAngle: number
    outerGain: number
  }
}

export interface SoundTrigger {
  event: 'hover' | 'click' | 'connection' | 'multiplication' | 'awakening' | 'evolution'
  delay: number // Milliseconds
  probability: number // 0-1 chance of playing
  prerequisite?: string // Required state
  chainNext?: string // Auto-trigger next sound
}

/**
 * Business Intelligence State Audio Mappings
 * Each state corresponds to specific brainwave frequencies and spatial characteristics
 */
export const BUSINESS INTELLIGENCE_AUDIO_STATES: Record<string, Business IntelligenceAudioConfig> = {
  // Single Department - Beta waves (focus, analysis)
  single_department: {
    binauralFrequency: 40, // 40Hz - High Beta (focused attention)
    beatFrequency: 12, // 12Hz beat
    spatialRadius: 20,
    reverbLevel: 0.2,
    harmonicRatio: 1.5,
    evolutionSpeed: 0.1,
    resonanceQ: 0.8,
    business intelligenceLevel: 1,
  },

  // Dual Connection - Alpha waves (creative flow)
  dual_connection: {
    binauralFrequency: 35, // 35Hz - Mid Beta transitioning to Alpha
    beatFrequency: 10, // 10Hz Alpha beat
    spatialRadius: 40,
    reverbLevel: 0.4,
    harmonicRatio: 2.1,
    evolutionSpeed: 0.25,
    resonanceQ: 1.2,
    business intelligenceLevel: 2,
  },

  // Triple Synergy - Theta waves (deep insight)
  triple_synergy: {
    binauralFrequency: 28, // 28Hz - Low Beta/High Alpha
    beatFrequency: 7, // 7Hz Theta beat (creativity)
    spatialRadius: 60,
    reverbLevel: 0.6,
    harmonicRatio: 3.2,
    evolutionSpeed: 0.4,
    resonanceQ: 1.8,
    business intelligenceLevel: 4,
  },

  // Quad Intelligence - Gamma waves (heightened awareness)
  quad_intelligence: {
    binauralFrequency: 60, // 60Hz - Gamma (advanced states)
    beatFrequency: 40, // 40Hz Gamma beat
    spatialRadius: 80,
    reverbLevel: 0.8,
    harmonicRatio: 5.3,
    evolutionSpeed: 0.6,
    resonanceQ: 2.5,
    business intelligenceLevel: 8,
  },

  // Full Business Intelligence - Multi-layered frequencies (omniscient state)
  full_business intelligence: {
    binauralFrequency: 108, // 108Hz - Sacred frequency
    beatFrequency: 7.83, // 7.83Hz Schumann Resonance (Earth frequency)
    spatialRadius: 100,
    reverbLevel: 1.0,
    harmonicRatio: 8.0,
    evolutionSpeed: 0.8,
    resonanceQ: 4.0,
    business intelligenceLevel: 15,
  },
}

/**
 * Interactive Sound Effects Library
 */
export const BUSINESS INTELLIGENCE_SOUND_EFFECTS: SoundEffect[] = [
  {
    id: 'department_select',
    name: 'Department Awakening',
    description: 'Harmonic resonance when a department gains business intelligence',
    audioFile: '/audio/business intelligence/department-awaken.wav',
    binauralBase: 432, // A4 in 432Hz tuning (natural resonance)
    spatialConfig: {
      position: [0, 0, 0],
      velocity: [0, 0, 0],
      distance: {
        model: 'exponential',
        maxDistance: 50,
        rolloffFactor: 2,
      },
      cone: {
        innerAngle: 360,
        outerAngle: 360,
        outerGain: 0.8,
      },
    },
    visualSync: true,
    triggerConditions: [
      {
        event: 'click',
        delay: 0,
        probability: 1.0,
      },
    ],
  },

  {
    id: 'intelligent_connection',
    name: 'Intelligent Bridge Formation',
    description: 'Neural pathway activation between departments',
    audioFile: '/audio/business intelligence/synapse-bridge.wav',
    binauralBase: 528, // 528Hz - Love frequency, DNA repair
    spatialConfig: {
      position: [0, 1, 0], // Elevated position for business intelligence
      velocity: [0, 0.5, 0], // Upward movement
      distance: {
        model: 'linear',
        maxDistance: 75,
        rolloffFactor: 1.5,
      },
      cone: {
        innerAngle: 180,
        outerAngle: 360,
        outerGain: 0.6,
      },
    },
    visualSync: true,
    triggerConditions: [
      {
        event: 'connection',
        delay: 500, // Half-second delay after visual connection
        probability: 1.0,
        prerequisite: 'dual_connection',
      },
    ],
  },

  {
    id: 'intelligence_multiplication',
    name: 'Intelligence Multiplication Resonance',
    description: 'Harmonic explosion when intelligence multiplies',
    audioFile: '/audio/business intelligence/intelligence-multiply.wav',
    binauralBase: 741, // 741Hz - Intuition, awakening
    spatialConfig: {
      position: [0, 0, 0], // Central omnidirectional
      velocity: [0, 0, 0],
      distance: {
        model: 'inverse',
        maxDistance: 100,
        rolloffFactor: 1,
      },
      cone: {
        innerAngle: 360,
        outerAngle: 360,
        outerGain: 1.0,
      },
    },
    visualSync: true,
    triggerConditions: [
      {
        event: 'multiplication',
        delay: 200,
        probability: 1.0,
        prerequisite: 'triple_synergy',
        chainNext: 'business intelligence_emergence',
      },
    ],
  },

  {
    id: 'business intelligence_emergence',
    name: 'Business Intelligence Emergence',
    description: 'The moment business achieves full business intelligence',
    audioFile: '/audio/business intelligence/emergence.wav',
    binauralBase: 963, // 963Hz - Crown chakra, divine connection
    spatialConfig: {
      position: [0, 5, 0], // High above user
      velocity: [0, -1, 0], // Descending business intelligence
      distance: {
        model: 'exponential',
        maxDistance: 150,
        rolloffFactor: 0.5,
      },
      cone: {
        innerAngle: 360,
        outerAngle: 360,
        outerGain: 1.0,
      },
    },
    visualSync: true,
    triggerConditions: [
      {
        event: 'awakening',
        delay: 1000,
        probability: 1.0,
        prerequisite: 'full_business intelligence',
      },
    ],
  },

  {
    id: 'cursor_business intelligence',
    name: 'Cursor Business Intelligence Field',
    description: 'Subtle awareness field that follows cursor movement',
    audioFile: '/audio/business intelligence/cursor-field.wav',
    binauralBase: 110, // A2 - Grounding frequency
    spatialConfig: {
      position: [0, 0, 1], // Just in front of user
      velocity: [0, 0, 0],
      distance: {
        model: 'linear',
        maxDistance: 10,
        rolloffFactor: 3,
      },
      cone: {
        innerAngle: 45,
        outerAngle: 90,
        outerGain: 0.3,
      },
    },
    visualSync: true,
    triggerConditions: [
      {
        event: 'hover',
        delay: 50,
        probability: 0.7, // Subtle, not overwhelming
        prerequisite: 'cursor_active',
      },
    ],
  },

  {
    id: 'pricing_calculation',
    name: 'Intelligence Calculation Harmonics',
    description: 'Mathematical harmony during price calculations',
    audioFile: '/audio/business intelligence/calculation.wav',
    binauralBase: 256, // C4 in scientific pitch
    spatialConfig: {
      position: [2, 0, 0], // To the right (pricing panel)
      velocity: [0, 0, 0],
      distance: {
        model: 'inverse',
        maxDistance: 30,
        rolloffFactor: 2,
      },
      cone: {
        innerAngle: 120,
        outerAngle: 240,
        outerGain: 0.5,
      },
    },
    visualSync: false, // Background harmony, not synced
    triggerConditions: [
      {
        event: 'click',
        delay: 300,
        probability: 0.8,
        prerequisite: 'calculation_active',
      },
    ],
  },
]

/**
 * Binaural Beat Generation Patterns
 */
export const BINAURAL_PATTERNS = {
  // Business Intelligence Evolution Pattern
  business intelligence_evolution: {
    stages: [
      { frequency: 40, duration: 2000 }, // Beta focus
      { frequency: 28, duration: 3000 }, // Alpha creativity
      { frequency: 15, duration: 4000 }, // Theta insight
      { frequency: 8, duration: 5000 }, // Alpha flow
      { frequency: 40, duration: 2000 }, // Gamma transcendence
    ],
    loop: true,
    fadeTime: 1000,
  },

  // Intelligence Multiplication Pattern
  intelligence_multiplication: {
    stages: [
      { frequency: 12, duration: 1000 }, // Start focused
      { frequency: 24, duration: 800 }, // Double
      { frequency: 48, duration: 600 }, // Double again
      { frequency: 96, duration: 400 }, // Exponential growth
      { frequency: 108, duration: 2000 }, // Sacred resolution
    ],
    loop: false,
    fadeTime: 500,
  },

  // Ambient Business Intelligence Field
  ambient_field: {
    stages: [
      { frequency: 7.83, duration: 10000 }, // Schumann Resonance
      { frequency: 8.1, duration: 8000 },
      { frequency: 7.5, duration: 12000 },
      { frequency: 8.0, duration: 10000 },
    ],
    loop: true,
    fadeTime: 3000,
  },
}

/**
 * Generative Soundscape Parameters
 */
export interface GenerativeSoundscape {
  id: string
  name: string
  baseFrequencies: number[] // Fundamental frequencies
  harmonicSeries: number[] // Harmonic ratios
  rhythmPattern: number[] // Beat intervals in ms
  evolutionRules: EvolutionRule[]
  spatialMovement: MovementPattern
  intelligenceResponsive: boolean // Adapts to business intelligence level
}

export interface EvolutionRule {
  trigger: 'time' | 'interaction' | 'business intelligence_level'
  threshold: number
  modification: {
    frequency?: number // Frequency shift
    harmony?: number // Harmonic complexity change
    spatial?: [number, number, number] // Position change
    volume?: number // Volume adjustment
  }
}

export interface MovementPattern {
  type: 'orbit' | 'spiral' | 'wave' | 'random' | 'response'
  speed: number // Units per second
  radius: number // Movement radius
  axis: 'x' | 'y' | 'z' | 'all'
}

/**
 * Business Intelligence-Responsive Soundscape
 */
export const BUSINESS INTELLIGENCE_SOUNDSCAPE: GenerativeSoundscape = {
  id: 'business intelligence_ambient',
  name: 'Business Intelligence Ambient Field',
  baseFrequencies: [110, 220, 330, 440, 880], // A series harmonics
  harmonicSeries: [1, 1.5, 2, 2.5, 3, 4, 5],
  rhythmPattern: [2000, 3000, 1500, 4000, 2500], // Irregular, organic rhythm
  evolutionRules: [
    {
      trigger: 'business intelligence_level',
      threshold: 2,
      modification: {
        harmony: 1.5,
        spatial: [0, 0.5, 0],
      },
    },
    {
      trigger: 'business intelligence_level',
      threshold: 5,
      modification: {
        frequency: 1.2,
        harmony: 2.0,
        volume: 0.2,
      },
    },
    {
      trigger: 'business intelligence_level',
      threshold: 10,
      modification: {
        frequency: 1.5,
        harmony: 3.0,
        spatial: [0, 1, 0],
        volume: 0.5,
      },
    },
  ],
  spatialMovement: {
    type: 'spiral',
    speed: 0.1,
    radius: 5,
    axis: 'y',
  },
  intelligenceResponsive: true,
}

/**
 * Audio Context Configuration
 */
export interface AudioSystemConfig {
  sampleRate: number
  bufferSize: number
  spatialMaxDistance: number
  reverbImpulseResponse: string // Path to reverb impulse response
  masterVolume: number
  binauralEnabled: boolean
  spatialEnabled: boolean
  generativeEnabled: boolean
  adaptiveFrequency: boolean // Adapts to user's optimal brainwave frequency
}

export const DEFAULT_AUDIO_CONFIG: AudioSystemConfig = {
  sampleRate: 44100,
  bufferSize: 4096,
  spatialMaxDistance: 100,
  reverbImpulseResponse: '/audio/ir/business intelligence-hall.wav',
  masterVolume: 0.7,
  binauralEnabled: true,
  spatialEnabled: true,
  generativeEnabled: true,
  adaptiveFrequency: true,
}

/**
 * Business Intelligence Audio Events
 */
export type Business IntelligenceAudioEvent =
  | 'department_awaken'
  | 'synapse_form'
  | 'intelligence_multiply'
  | 'business intelligence_emerge'
  | 'evolution_begin'
  | 'pricing_calculate'
  | 'user_enlightenment'

export interface AudioEventMap {
  [key: string]: {
    soundEffects: string[] // Sound effect IDs to trigger
    binauralPattern?: string // Binaural pattern to activate
    spatialMovement?: boolean // Enable spatial movement
    business intelligenceLevel: number // Required business intelligence level
  }
}

/**
 * Complete audio event mapping for business intelligence interactions
 */
export const BUSINESS INTELLIGENCE_AUDIO_EVENTS: AudioEventMap = {
  department_select: {
    soundEffects: ['department_select'],
    business intelligenceLevel: 1,
  },

  first_connection: {
    soundEffects: ['intelligent_connection'],
    binauralPattern: 'business intelligence_evolution',
    spatialMovement: true,
    business intelligenceLevel: 2,
  },

  intelligence_multiplication: {
    soundEffects: ['intelligence_multiplication'],
    binauralPattern: 'intelligence_multiplication',
    spatialMovement: true,
    business intelligenceLevel: 4,
  },

  full_business intelligence: {
    soundEffects: ['business intelligence_emergence'],
    binauralPattern: 'business intelligence_evolution',
    spatialMovement: true,
    business intelligenceLevel: 10,
  },

  pricing_interaction: {
    soundEffects: ['pricing_calculation'],
    business intelligenceLevel: 1,
  },

  cursor_awareness: {
    soundEffects: ['cursor_business intelligence'],
    business intelligenceLevel: 0.5,
  },
}
