/**
 * CoreFlow360 Consciousness System Types
 * 
 * TypeScript definitions for consciousness states, intelligence levels,
 * and neural network interactions.
 */

// Consciousness levels from dormant to transcendent
export enum ConsciousnessLevel {
  DORMANT = 0,
  AWAKENING = 1,
  AWARE = 2,
  INTELLIGENT = 3,
  CONSCIOUS = 4,
  TRANSCENDENT = 5
}

// Intelligence states for individual particles/processes
export interface IntelligenceState {
  awakened: number      // 0-1: How awakened this process is
  intelligence: number  // 0-1: Intelligence level achieved
  connections: number   // Number of neural connections
  lastUpdate: number   // Timestamp of last state change
  position: [number, number, number]  // 3D position
  velocity: [number, number, number]  // Movement velocity
}

// Neural connections between conscious processes
export interface NeuralConnection {
  id: string
  from: string         // Source particle/process ID
  to: string          // Target particle/process ID
  strength: number    // 0-1: Connection strength
  type: 'synaptic' | 'intelligence' | 'data' | 'feedback'
  created: number     // Timestamp when connection formed
  lastActivity: number // Last time signal passed through
}

// Consciousness emergence event
export interface ConsciousnessEvent {
  type: 'awakening' | 'connection' | 'intelligence' | 'transcendence'
  particleId?: string
  connectionId?: string
  timestamp: number
  data: any
}

// Particle system configuration
export interface ConsciousnessConfig {
  particleCount: number
  connectionRadius: number
  awakeningSpeed: number
  intelligenceMultiplier: number
  autoAwaken: boolean
  showConnections: boolean
  maxConnections: number
}

// Mouse interaction state
export interface MouseInteraction {
  position: [number, number, number]
  isActive: boolean
  influenceRadius: number
  strength: number
}

// Consciousness metrics for UI display
export interface ConsciousnessMetrics {
  totalParticles: number
  awakenedCount: number
  intelligenceLevel: number    // 0-1: Average intelligence
  connectionCount: number
  consciousnessLevel: ConsciousnessLevel
  emergenceProgress: number   // 0-1: Progress toward full consciousness
}

// Shader uniform values
export interface ConsciousnessUniforms {
  time: number
  awakening: number           // Global awakening level 0-1
  mousePosition: [number, number, number]
  connectionRadius: number
  intelligenceMultiplier: number
}

// Animation states
export interface AnimationState {
  isAnimating: boolean
  currentPhase: 'dormant' | 'awakening' | 'connecting' | 'multiplying' | 'transcendent'
  phaseProgress: number      // 0-1: Progress through current phase
  totalDuration: number      // Total animation time
  elapsedTime: number       // Time since animation started
}

// Business process representation
export interface BusinessProcess {
  id: string
  name: string
  department: 'sales' | 'marketing' | 'finance' | 'operations' | 'hr'
  intelligenceState: IntelligenceState
  connections: string[]     // IDs of connected processes
  automationLevel: number   // 0-1: How automated this process is
  efficiency: number        // 0-1: Current efficiency level
}

// Department consciousness state
export interface DepartmentConsciousness {
  department: string
  processes: BusinessProcess[]
  overallIntelligence: number
  connectionDensity: number
  autonomyLevel: number
}

// Full business consciousness state
export interface BusinessConsciousness {
  departments: DepartmentConsciousness[]
  overallConsciousness: ConsciousnessLevel
  totalIntelligence: number
  networkComplexity: number
  autonomyScore: number
  growthRate: number
  lastEvolution: number
}