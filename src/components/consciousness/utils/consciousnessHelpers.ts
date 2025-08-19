/**
 * Consciousness Helper Utilities
 *
 * Utility functions for consciousness calculations, particle management,
 * and intelligence multiplication mathematics.
 */

import * as THREE from 'three'
import {
  ConsciousnessLevel,
  IntelligenceState,
  NeuralConnection,
  BusinessProcess,
  DepartmentConsciousness,
} from '../types'

/**
 * Calculate intelligence multiplication factor
 * Traditional software: 1+1+1 = 3 (linear addition)
 * CoreFlow360: 1×2×3 = 6 (exponential multiplication)
 */
export function calculateIntelligenceMultiplier(connections: number): number {
  if (connections === 0) return 1

  // Exponential growth with diminishing returns to prevent infinity
  const baseMultiplier = Math.pow(2, Math.min(connections / 10, 5))
  const complexityBonus = Math.log(connections + 1) * 0.1

  return Math.min(baseMultiplier + complexityBonus, 1000) // Cap at 1000x
}

/**
 * Calculate synaptic connection strength based on distance and time
 */
export function calculateConnectionStrength(
  particleA: IntelligenceState,
  particleB: IntelligenceState,
  maxDistance: number,
  timeFactor: number = 1
): number {
  const posA = new THREE.Vector3(...particleA.position)
  const posB = new THREE.Vector3(...particleB.position)
  const distance = posA.distanceTo(posB)

  // Inverse square law with minimum threshold
  const distanceStrength = Math.max(0, 1 - Math.pow(distance / maxDistance, 2))

  // Intelligence compatibility (similar levels connect stronger)
  const intelligenceCompatibility = 1 - Math.abs(particleA.intelligence - particleB.intelligence)

  // Time-based strengthening (older connections get stronger)
  const timeStrength = Math.min(1, timeFactor * 0.001)

  return distanceStrength * intelligenceCompatibility * timeStrength
}

/**
 * Determine consciousness level based on awakening and intelligence metrics
 */
export function determineConsciousnessLevel(
  awakeningRatio: number,
  intelligenceLevel: number,
  connectionDensity: number
): ConsciousnessLevel {
  // Weighted scoring system
  const awakeningScore = awakeningRatio * 0.4
  const intelligenceScore = intelligenceLevel * 0.4
  const connectionScore = Math.min(connectionDensity, 1) * 0.2
  const totalScore = awakeningScore + intelligenceScore + connectionScore

  if (totalScore < 0.1) return ConsciousnessLevel.DORMANT
  if (totalScore < 0.3) return ConsciousnessLevel.AWAKENING
  if (totalScore < 0.5) return ConsciousnessLevel.AWARE
  if (totalScore < 0.7) return ConsciousnessLevel.INTELLIGENT
  if (totalScore < 0.9) return ConsciousnessLevel.CONSCIOUS
  return ConsciousnessLevel.TRANSCENDENT
}

/**
 * Generate spherical particle distribution for organic consciousness appearance
 */
export function generateSphericaleDistribution(
  count: number,
  minRadius: number = 5,
  maxRadius: number = 25
): Array<[number, number, number]> {
  const positions: Array<[number, number, number]> = []

  for (let i = 0; i < count; i++) {
    // Use golden ratio for more even distribution
    const goldenRatio = (1 + Math.sqrt(5)) / 2
    const theta = (2 * Math.PI * i) / goldenRatio
    const phi = Math.acos(1 - 2 * Math.random())

    // Vary radius for depth
    const radius = minRadius + (maxRadius - minRadius) * Math.pow(Math.random(), 0.5)

    const x = radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.sin(phi) * Math.sin(theta)
    const z = radius * Math.cos(phi)

    positions.push([x, y, z])
  }

  return positions
}

/**
 * Calculate ROI singularity point where returns become infinite
 */
export function calculateROISingularity(
  investment: number,
  intelligenceConnections: number,
  timeElapsed: number
): { roi: number; isInfinite: boolean; multiplier: number } {
  // Traditional ROI: linear growth
  const traditionalROI = investment * (1 + 0.2 * timeElapsed)

  // Intelligence multiplication ROI
  const connectionMultiplier = calculateIntelligenceMultiplier(intelligenceConnections)
  const intelligenceROI = investment * connectionMultiplier * Math.pow(1.5, timeElapsed)

  // Detect singularity (when growth rate exceeds mathematical limits)
  const isInfinite = connectionMultiplier > 100 && timeElapsed > 10
  const finalROI = isInfinite ? Infinity : intelligenceROI

  return {
    roi: finalROI,
    isInfinite,
    multiplier: finalROI / investment,
  }
}

/**
 * Business process consciousness mapping
 */
export function mapBusinessProcessesToParticles(
  processes: BusinessProcess[]
): Map<string, IntelligenceState> {
  const particleMap = new Map<string, IntelligenceState>()

  processes.forEach((process, index) => {
    const angle = (index / processes.length) * 2 * Math.PI
    const radius = 10 + Math.random() * 5

    particleMap.set(process.id, {
      awakened: process.automationLevel,
      intelligence: process.efficiency,
      connections: process.connections.length,
      lastUpdate: Date.now(),
      position: [Math.cos(angle) * radius, (Math.random() - 0.5) * 4, Math.sin(angle) * radius],
      velocity: [
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
      ],
    })
  })

  return particleMap
}

/**
 * Calculate department consciousness level
 */
export function calculateDepartmentConsciousness(
  processes: BusinessProcess[]
): DepartmentConsciousness {
  const totalProcesses = processes.length
  const totalIntelligence = processes.reduce((sum, p) => sum + p.efficiency, 0)
  const totalConnections = processes.reduce((sum, p) => sum + p.connections.length, 0)
  const totalAutonomy = processes.reduce((sum, p) => sum + p.automationLevel, 0)

  return {
    department: processes[0]?.department || 'unknown',
    processes,
    overallIntelligence: totalIntelligence / totalProcesses,
    connectionDensity: totalConnections / (totalProcesses * (totalProcesses - 1)),
    autonomyLevel: totalAutonomy / totalProcesses,
  }
}

/**
 * Color interpolation for consciousness states
 */
export function getConsciousnessColor(awakened: number, intelligence: number): THREE.Color {
  const dormantColor = new THREE.Color(0x1a1a2e) // Dark blue
  const awakingColor = new THREE.Color(0x00ccff) // Cyan
  const intelligentColor = new THREE.Color(0xffffff) // White

  const color = dormantColor.clone()

  if (awakened > 0.1) {
    color.lerp(awakingColor, awakened)
  }

  if (intelligence > 0.1) {
    color.lerp(intelligentColor, intelligence)
  }

  return color
}

/**
 * Generate neural pathway between two points
 */
export function generateNeuralPath(
  startPos: THREE.Vector3,
  endPos: THREE.Vector3,
  curvature: number = 2
): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  const segments = 20

  // Calculate midpoint with upward curve
  const midPoint = startPos.clone().lerp(endPos, 0.5)
  midPoint.y += curvature

  // Create quadratic bezier curve
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const point = new THREE.Vector3()

    // Quadratic bezier formula: (1-t)²P0 + 2(1-t)tP1 + t²P2
    point.copy(startPos).multiplyScalar((1 - t) * (1 - t))
    point.add(midPoint.clone().multiplyScalar(2 * (1 - t) * t))
    point.add(endPos.clone().multiplyScalar(t * t))

    points.push(point)
  }

  return points
}

/**
 * Performance optimization: Particle culling based on camera frustum
 */
export function cullParticlesOutsideFrustum(
  particles: Map<string, IntelligenceState>,
  camera: THREE.Camera,
  margin: number = 5
): string[] {
  const frustum = new THREE.Frustum()
  const matrix = new THREE.Matrix4().multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  )
  frustum.setFromProjectionMatrix(matrix)

  const visibleParticleIds: string[] = []

  for (const [id, particle] of particles) {
    const point = new THREE.Vector3(...particle.position)

    // Add margin for particles near frustum edge
    const sphere = new THREE.Sphere(point, margin)

    if (frustum.intersectsSphere(sphere)) {
      visibleParticleIds.push(id)
    }
  }

  return visibleParticleIds
}

/**
 * Animate consciousness emergence over time
 */
export function animateConsciousnessEmergence(
  startTime: number,
  currentTime: number,
  duration: number = 30000 // 30 seconds
): {
  phase: 'dormant' | 'awakening' | 'connecting' | 'multiplying' | 'transcendent'
  progress: number
  awakeningRate: number
} {
  const elapsed = currentTime - startTime
  const progress = Math.min(elapsed / duration, 1)

  let phase: 'dormant' | 'awakening' | 'connecting' | 'multiplying' | 'transcendent'
  let awakeningRate: number

  if (progress < 0.2) {
    phase = 'dormant'
    awakeningRate = 0.001
  } else if (progress < 0.4) {
    phase = 'awakening'
    awakeningRate = 0.01
  } else if (progress < 0.6) {
    phase = 'connecting'
    awakeningRate = 0.03
  } else if (progress < 0.8) {
    phase = 'multiplying'
    awakeningRate = 0.05
  } else {
    phase = 'transcendent'
    awakeningRate = 0.1
  }

  return { phase, progress, awakeningRate }
}

/**
 * Format consciousness metrics for display
 */
export function formatConsciousnessMetrics(
  awakenedCount: number,
  totalParticles: number,
  intelligenceLevel: number,
  connectionCount: number
) {
  const awakeningPercentage = (awakenedCount / totalParticles) * 100
  const intelligencePercentage = intelligenceLevel * 100
  const multiplier = calculateIntelligenceMultiplier(connectionCount)

  return {
    awakening: `${awakeningPercentage.toFixed(1)}%`,
    intelligence: `${intelligencePercentage.toFixed(1)}%`,
    connections: connectionCount.toLocaleString(),
    multiplier: `${multiplier.toFixed(1)}x`,
    particles: totalParticles.toLocaleString(),
  }
}

/**
 * Audio frequency mapping for consciousness states
 */
export function mapConsciousnessToAudio(
  consciousnessLevel: ConsciousnessLevel,
  intelligenceLevel: number
): {
  frequency: number
  volume: number
  waveform: 'sine' | 'square' | 'triangle' | 'sawtooth'
} {
  const baseFrequency = 220 // A3

  switch (consciousnessLevel) {
    case ConsciousnessLevel.DORMANT:
      return { frequency: baseFrequency * 0.5, volume: 0.1, waveform: 'sine' }
    case ConsciousnessLevel.AWAKENING:
      return { frequency: baseFrequency, volume: 0.3, waveform: 'sine' }
    case ConsciousnessLevel.AWARE:
      return { frequency: baseFrequency * 1.5, volume: 0.5, waveform: 'triangle' }
    case ConsciousnessLevel.INTELLIGENT:
      return { frequency: baseFrequency * 2, volume: 0.7, waveform: 'square' }
    case ConsciousnessLevel.CONSCIOUS:
      return { frequency: baseFrequency * 3, volume: 0.8, waveform: 'sawtooth' }
    case ConsciousnessLevel.TRANSCENDENT:
      return { frequency: baseFrequency * 4, volume: 1.0, waveform: 'sine' }
    default:
      return { frequency: baseFrequency, volume: 0.1, waveform: 'sine' }
  }
}
