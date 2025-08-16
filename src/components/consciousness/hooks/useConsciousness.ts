/**
 * useConsciousness Hook
 * 
 * React hook for managing consciousness state, particle interactions,
 * and intelligence multiplication in CoreFlow360 experiences.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import * as THREE from 'three'
import { 
  ConsciousnessLevel, 
  IntelligenceState, 
  NeuralConnection,
  ConsciousnessEvent,
  ConsciousnessMetrics,
  AnimationState
} from '../types'

interface UseConsciousnessOptions {
  particleCount?: number
  connectionRadius?: number
  awakeningSpeed?: number
  intelligenceMultiplier?: number
  autoAwaken?: boolean
  onConsciousnessEvent?: (event: ConsciousnessEvent) => void
}

interface UseConsciousnessReturn {
  // State
  metrics: ConsciousnessMetrics
  animationState: AnimationState
  mousePosition: THREE.Vector3
  
  // Actions
  awakeParticle: (particleId: string) => void
  createConnection: (fromId: string, toId: string) => void
  updateMousePosition: (position: THREE.Vector3) => void
  startAnimation: () => void
  pauseAnimation: () => void
  resetConsciousness: () => void
  
  // Particle management
  particles: Map<string, IntelligenceState>
  connections: Map<string, NeuralConnection>
  
  // Utilities
  getConsciousnessLevel: () => ConsciousnessLevel
  getEmergenceProgress: () => number
  isFullyConscious: () => boolean
}

export const useConsciousness = (options: UseConsciousnessOptions = {}): UseConsciousnessReturn => {
  const {
    particleCount = 10000,
    connectionRadius = 3,
    awakeningSpeed = 0.05,
    intelligenceMultiplier = 1,
    autoAwaken = false,
    onConsciousnessEvent
  } = options
  
  // Core state
  const [particles, setParticles] = useState<Map<string, IntelligenceState>>(new Map())
  const [connections, setConnections] = useState<Map<string, NeuralConnection>>(new Map())
  const [mousePosition, setMousePosition] = useState(new THREE.Vector3(0, 0, 0))
  const [animationState, setAnimationState] = useState<AnimationState>({
    isAnimating: false,
    currentPhase: 'dormant',
    phaseProgress: 0,
    totalDuration: 0,
    elapsedTime: 0
  })
  
  // Performance refs
  const animationFrameRef = useRef<number>()
  const lastUpdateTime = useRef(Date.now())
  const eventQueue = useRef<ConsciousnessEvent[]>([])
  
  // Initialize particles
  useEffect(() => {
    const initialParticles = new Map<string, IntelligenceState>()
    
    for (let i = 0; i < particleCount; i++) {
      const id = `particle_${i}`
      
      // Spherical distribution
      const radius = Math.random() * 20 + 5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)  
      const z = radius * Math.cos(phi)
      
      initialParticles.set(id, {
        awakened: 0,
        intelligence: 0,
        connections: 0,
        lastUpdate: Date.now(),
        position: [x, y, z],
        velocity: [
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        ]
      })
    }
    
    setParticles(initialParticles)
  }, [particleCount])
  
  // Animation loop
  const animate = useCallback(() => {
    const now = Date.now()
    const deltaTime = now - lastUpdateTime.current
    lastUpdateTime.current = now
    
    if (!animationState.isAnimating) return
    
    // Update particles
    const updatedParticles = new Map(particles)
    const updatedConnections = new Map(connections)
    
    let awakenedCount = 0
    let totalIntelligence = 0
    
    // Process each particle
    for (const [id, particle] of updatedParticles) {
      const [x, y, z] = particle.position
      const particlePos = new THREE.Vector3(x, y, z)
      const distanceToMouse = particlePos.distanceTo(mousePosition)
      
      // Mouse awakening
      if (distanceToMouse < connectionRadius) {
        particle.awakened = Math.min(1, particle.awakened + awakeningSpeed)
        particle.lastUpdate = now
        
        // Emit awakening event
        if (particle.awakened > 0.1 && particle.awakened - awakeningSpeed <= 0.1) {
          eventQueue.current.push({
            type: 'awakening',
            particleId: id,
            timestamp: now,
            data: { awakeningLevel: particle.awakened }
          })
        }
      }
      
      // Auto-awakening mode
      if (autoAwaken) {
        particle.awakened = Math.min(1, particle.awakened + 0.001)
      }
      
      // Intelligence multiplication through connections
      if (particle.awakened > 0.5) {
        awakenedCount++
        
        // Find nearby awakened particles for connections
        for (const [otherId, otherParticle] of updatedParticles) {
          if (id === otherId || otherParticle.awakened < 0.5) continue
          
          const [ox, oy, oz] = otherParticle.position
          const otherPos = new THREE.Vector3(ox, oy, oz)
          const distance = particlePos.distanceTo(otherPos)
          
          if (distance < connectionRadius) {
            const connectionId = `${id}-${otherId}`
            const reverseConnectionId = `${otherId}-${id}`
            
            // Create bidirectional connection
            if (!updatedConnections.has(connectionId) && !updatedConnections.has(reverseConnectionId)) {
              updatedConnections.set(connectionId, {
                id: connectionId,
                from: id,
                to: otherId,
                strength: Math.random() * 0.5 + 0.5,
                type: 'synaptic',
                created: now,
                lastActivity: now
              })
              
              // Increase intelligence through connection
              particle.intelligence = Math.min(1, particle.intelligence + 0.01 * intelligenceMultiplier)
              otherParticle.intelligence = Math.min(1, otherParticle.intelligence + 0.01 * intelligenceMultiplier)
              
              particle.connections++
              otherParticle.connections++
              
              // Emit connection event
              eventQueue.current.push({
                type: 'connection',
                connectionId,
                timestamp: now,
                data: { from: id, to: otherId, strength: updatedConnections.get(connectionId)!.strength }
              })
            }
          }
        }
      }
      
      // Update particle movement
      const [vx, vy, vz] = particle.velocity
      particle.position[0] += vx * Math.sin(now * 0.001 + parseInt(id.split('_')[1]) * 0.01)
      particle.position[1] += vy * Math.cos(now * 0.001 + parseInt(id.split('_')[1]) * 0.01)
      particle.position[2] += vz * Math.sin(now * 0.0005 + parseInt(id.split('_')[1]) * 0.005)
      
      totalIntelligence += particle.intelligence
    }
    
    // Process event queue
    while (eventQueue.current.length > 0) {
      const event = eventQueue.current.shift()!
      onConsciousnessEvent?.(event)
    }
    
    // Update state
    setParticles(updatedParticles)
    setConnections(updatedConnections)
    
    // Update animation state
    setAnimationState(prev => ({
      ...prev,
      elapsedTime: prev.elapsedTime + deltaTime,
      phaseProgress: Math.min(1, (prev.elapsedTime + deltaTime) / prev.totalDuration)
    }))
    
    // Continue animation
    if (animationState.isAnimating) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }
  }, [
    particles, 
    connections, 
    mousePosition, 
    animationState.isAnimating, 
    connectionRadius, 
    awakeningSpeed, 
    intelligenceMultiplier, 
    autoAwaken,
    onConsciousnessEvent
  ])
  
  // Start/stop animation
  const startAnimation = useCallback(() => {
    setAnimationState(prev => ({ ...prev, isAnimating: true, totalDuration: 60000 }))
    animationFrameRef.current = requestAnimationFrame(animate)
  }, [animate])
  
  const pauseAnimation = useCallback(() => {
    setAnimationState(prev => ({ ...prev, isAnimating: false }))
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])
  
  // Particle management actions
  const awakeParticle = useCallback((particleId: string) => {
    setParticles(prev => {
      const updated = new Map(prev)
      const particle = updated.get(particleId)
      if (particle) {
        particle.awakened = Math.min(1, particle.awakened + 0.5)
        particle.lastUpdate = Date.now()
        updated.set(particleId, particle)
      }
      return updated
    })
  }, [])
  
  const createConnection = useCallback((fromId: string, toId: string) => {
    const connectionId = `${fromId}-${toId}`
    setConnections(prev => {
      const updated = new Map(prev)
      updated.set(connectionId, {
        id: connectionId,
        from: fromId,
        to: toId,
        strength: 1,
        type: 'intelligence',
        created: Date.now(),
        lastActivity: Date.now()
      })
      return updated
    })
  }, [])
  
  const updateMousePosition = useCallback((position: THREE.Vector3) => {
    setMousePosition(position)
  }, [])
  
  const resetConsciousness = useCallback(() => {
    setParticles(prev => {
      const reset = new Map(prev)
      for (const [id, particle] of reset) {
        particle.awakened = 0
        particle.intelligence = 0
        particle.connections = 0
        particle.lastUpdate = Date.now()
      }
      return reset
    })
    setConnections(new Map())
    setAnimationState({
      isAnimating: false,
      currentPhase: 'dormant',
      phaseProgress: 0,
      totalDuration: 0,
      elapsedTime: 0
    })
  }, [])
  
  // Computed values
  const metrics: ConsciousnessMetrics = {
    totalParticles: particles.size,
    awakenedCount: Array.from(particles.values()).filter(p => p.awakened > 0.1).length,
    intelligenceLevel: Array.from(particles.values()).reduce((sum, p) => sum + p.intelligence, 0) / particles.size,
    connectionCount: connections.size,
    consciousnessLevel: getConsciousnessLevel(),
    emergenceProgress: getEmergenceProgress()
  }
  
  function getConsciousnessLevel(): ConsciousnessLevel {
    const { awakenedCount, totalParticles, intelligenceLevel, connectionCount } = metrics
    
    const awakeningRatio = awakenedCount / totalParticles
    const connectionDensity = connectionCount / totalParticles
    
    if (awakeningRatio < 0.01) return ConsciousnessLevel.DORMANT
    if (awakeningRatio < 0.1) return ConsciousnessLevel.AWAKENING
    if (awakeningRatio < 0.3 || intelligenceLevel < 0.2) return ConsciousnessLevel.AWARE
    if (awakeningRatio < 0.6 || intelligenceLevel < 0.5) return ConsciousnessLevel.INTELLIGENT
    if (awakeningRatio < 0.8 || intelligenceLevel < 0.8) return ConsciousnessLevel.CONSCIOUS
    return ConsciousnessLevel.TRANSCENDENT
  }
  
  function getEmergenceProgress(): number {
    const level = getConsciousnessLevel()
    return level / ConsciousnessLevel.TRANSCENDENT
  }
  
  function isFullyConscious(): boolean {
    return getConsciousnessLevel() === ConsciousnessLevel.TRANSCENDENT
  }
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])
  
  return {
    // State
    metrics,
    animationState,
    mousePosition,
    
    // Actions  
    awakeParticle,
    createConnection,
    updateMousePosition,
    startAnimation,
    pauseAnimation,
    resetConsciousness,
    
    // Data
    particles,
    connections,
    
    // Utilities
    getConsciousnessLevel,
    getEmergenceProgress,
    isFullyConscious
  }
}

export default useConsciousness