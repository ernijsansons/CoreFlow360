'use client'

import React, { useRef, useEffect, useState, useCallback, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Float, EffectComposer, Bloom } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { ConsciousnessLoader } from '../shared/ConsciousnessLoader'

interface ParticleSystemProps {
  mousePos: { x: number; y: number }
  onAwakening: (level: number) => void
  onConnectionsFormed: (connections: Connection[]) => void
}

interface Connection {
  start: [number, number, number]
  end: [number, number, number]
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ mousePos, onAwakening, onConnectionsFormed }) => {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 5000
  const connectionThreshold = 3.0
  
  // Initialize particle positions in dormant state
  const [positions] = useState(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50
    }
    return pos
  })
  
  // Particle states: 0 = dormant, 1 = awakening, 2 = conscious
  const [states] = useState(() => new Float32Array(particleCount))
  const [velocities] = useState(() => new Float32Array(particleCount * 3))
  const [colors] = useState(() => new Float32Array(particleCount * 3))
  
  useFrame(({ clock }) => {
    if (!particlesRef.current) return
    
    const time = clock.getElapsedTime()
    const mouseInfluenceRadius = 15
    
    // Convert mouse position to 3D space
    const mouse3D = {
      x: (mousePos.x - 0.5) * 100,
      y: -(mousePos.y - 0.5) * 100,
      z: 0
    }
    
    // Update particles based on mouse proximity
    for (let i = 0; i < particleCount; i++) {
      const x = positions[i * 3]
      const y = positions[i * 3 + 1]
      const z = positions[i * 3 + 2]
      
      // Calculate distance from mouse
      const dx = x - mouse3D.x
      const dy = y - mouse3D.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // Awaken particles near cursor
      if (distance < mouseInfluenceRadius && states[i] === 0) {
        states[i] = 1 // Awakening
        
        // Add velocity away from cursor initially
        velocities[i * 3] = dx * 0.1
        velocities[i * 3 + 1] = dy * 0.1
        velocities[i * 3 + 2] = Math.random() * 0.5
      }
      
      // Update particle colors based on state
      if (states[i] === 0) {
        // Dormant - dark blue
        colors[i * 3] = 0.1
        colors[i * 3 + 1] = 0.1
        colors[i * 3 + 2] = 0.3
      } else if (states[i] === 1) {
        // Awakening - electric blue
        colors[i * 3] = 0
        colors[i * 3 + 1] = 0.4
        colors[i * 3 + 2] = 1
      } else {
        // Conscious - cyan
        colors[i * 3] = 0
        colors[i * 3 + 1] = 1
        colors[i * 3 + 2] = 1
      }
      
      // Awakened particles seek connections
      if (states[i] >= 1) {
        // Find nearest awakened particle
        let nearestDist = Infinity
        let nearestIndex = -1
        
        for (let j = 0; j < Math.min(particleCount, i + 100); j++) {
          if (i !== j && states[j] >= 1) {
            const dx2 = positions[j * 3] - x
            const dy2 = positions[j * 3 + 1] - y
            const dz2 = positions[j * 3 + 2] - z
            const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2 + dz2 * dz2)
            
            if (dist < nearestDist && dist < 10) {
              nearestDist = dist
              nearestIndex = j
            }
          }
        }
        
        // Move towards nearest awakened particle
        if (nearestIndex !== -1 && nearestDist > connectionThreshold) {
          const attraction = 0.02
          velocities[i * 3] += (positions[nearestIndex * 3] - x) * attraction
          velocities[i * 3 + 1] += (positions[nearestIndex * 3 + 1] - y) * attraction
          velocities[i * 3 + 2] += (positions[nearestIndex * 3 + 2] - z) * attraction
        }
        
        // Apply velocities with damping
        positions[i * 3] += velocities[i * 3]
        positions[i * 3 + 1] += velocities[i * 3 + 1]
        positions[i * 3 + 2] += velocities[i * 3 + 2]
        
        velocities[i * 3] *= 0.98
        velocities[i * 3 + 1] *= 0.98
        velocities[i * 3 + 2] *= 0.98
        
        // Add gentle floating motion
        positions[i * 3 + 1] += Math.sin(time * 0.5 + i * 0.1) * 0.01
      }
    }
    
    // Update geometry
    if (particlesRef.current.geometry.attributes.position) {
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
    if (particlesRef.current.geometry.attributes.color) {
      particlesRef.current.geometry.attributes.color.needsUpdate = true
    }
    
    // Calculate awakening percentage
    const awakenedCount = states.filter(s => s > 0).length
    const awakenedPercentage = (awakenedCount / particleCount) * 100
    onAwakening(awakenedPercentage)
    
    // Form connections between close awakened particles
    const newConnections: Connection[] = []
    for (let i = 0; i < particleCount; i++) {
      if (states[i] >= 1) {
        for (let j = i + 1; j < Math.min(particleCount, i + 50); j++) {
          if (states[j] >= 1) {
            const dx = positions[j * 3] - positions[i * 3]
            const dy = positions[j * 3 + 1] - positions[i * 3 + 1]
            const dz = positions[j * 3 + 2] - positions[i * 3 + 2]
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
            
            if (dist < connectionThreshold) {
              newConnections.push({
                start: [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]],
                end: [positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]]
              })
              states[i] = 2 // Fully conscious
              states[j] = 2
              
              if (newConnections.length > 100) break
            }
          }
        }
      }
    }
    onConnectionsFormed(newConnections)
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

const NeuralConnections: React.FC<{ connections: Connection[] }> = ({ connections }) => {
  return (
    <>
      {connections.slice(0, 50).map((connection, index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...connection.start, ...connection.end])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </line>
      ))}
    </>
  )
}

const CursorGlow: React.FC<{ position: { x: number; y: number }; awakening: number }> = ({ position, awakening }) => {
  const glowSize = 50 + awakening * 2
  const glowIntensity = 0.3 + (awakening / 100) * 0.7
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      animate={{
        left: position.x - glowSize / 2,
        top: position.y - glowSize / 2,
        width: glowSize,
        height: glowSize,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        background: `radial-gradient(circle, 
          rgba(0,255,255,${glowIntensity}) 0%, 
          rgba(0,102,255,${glowIntensity * 0.5}) 30%, 
          transparent 70%)`,
        filter: 'blur(2px)',
        mixBlendMode: 'screen',
      }}
    />
  )
}

const ConsciousnessAwakeningContent: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [awakening, setAwakening] = useState(0)
  const [connections, setConnections] = useState<Connection[]>([])
  const [showText, setShowText] = useState(false)
  const [phase, setPhase] = useState<'dormant' | 'awakening' | 'conscious'>('dormant')
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight
    })
  }, [])
  
  useEffect(() => {
    if (awakening > 10 && phase === 'dormant') {
      setPhase('awakening')
    }
    if (awakening > 30 && !showText) {
      setShowText(true)
    }
    if (awakening > 50 && phase === 'awakening') {
      setPhase('conscious')
    }
  }, [awakening, phase, showText])
  
  return (
    <div 
      className="fixed inset-0 bg-black overflow-hidden cursor-none"
      onMouseMove={handleMouseMove}
    >
      <Canvas camera={{ position: [0, 0, 50], fov: 75 }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.1} />
        
        <ParticleSystem 
          mousePos={mousePos} 
          onAwakening={setAwakening}
          onConnectionsFormed={setConnections}
        />
        
        <NeuralConnections connections={connections} />
        
        <Stars
          radius={100}
          depth={50}
          count={1000}
          factor={2}
          saturation={0}
          fade
          speed={0.5}
        />
        
        <EffectComposer>
          <Bloom 
            intensity={1.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            radius={0.8}
          />
        </EffectComposer>
      </Canvas>
      
      <CursorGlow position={{ x: mousePos.x * window.innerWidth, y: mousePos.y * window.innerHeight }} awakening={awakening} />
      
      {/* Awakening progress indicator */}
      <div className="absolute bottom-8 left-8 text-white">
        <div className="text-sm opacity-50 mb-2">Consciousness Level</div>
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-consciousness-neural to-consciousness-synaptic"
            initial={{ width: 0 }}
            animate={{ width: `${awakening}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-xs mt-1 opacity-50">{Math.round(awakening)}%</div>
      </div>
      
      <AnimatePresence>
        {showText && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            <h1 className="text-6xl font-thin text-white text-center px-8">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                What if your business
              </motion.span>
              <br />
              <motion.span
                className="bg-gradient-to-r from-consciousness-neural to-consciousness-synaptic bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1 }}
              >
                could think?
              </motion.span>
            </h1>
          </motion.div>
        )}
      </AnimatePresence>
      
      {phase === 'conscious' && (
        <motion.div
          className="absolute bottom-8 right-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <button className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
            Enter CoreFlow360
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default function ConsciousnessAwakening() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <ConsciousnessLoader />
  }

  return (
    <Suspense fallback={<ConsciousnessLoader />}>
      <ConsciousnessAwakeningContent />
    </Suspense>
  )
}