'use client'

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { OrbitControls, Stars, Trail, Float, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { motion, AnimatePresence } from 'framer-motion'

// Types
interface MousePosition {
  x: number
  y: number
}

interface Connection {
  start: [number, number, number]
  end: [number, number, number]
  strength: number
}

interface ParticleSystemProps {
  mousePos: MousePosition
  onAwakening: (level: number) => void
  onConnectionsFormed: (connections: Connection[]) => void
  onPhaseChange: (phase: string) => void
}

interface CursorGlowProps {
  position: MousePosition
  awakening: number
}

interface NeuralConnectionsProps {
  connections: Connection[]
}

// Custom shader material
const ConsciousnessMaterial = shaderMaterial(
  {
    time: 0,
    mousePos: new THREE.Vector2(0, 0),
    awakening: 0,
  },
  // Vertex shader
  `
    varying float vDistance;
    varying float vState;
    varying vec3 vPosition;
    attribute float state;
    uniform float time;
    uniform vec2 mousePos;
    uniform float awakening;

    void main() {
      vState = state;
      vPosition = position;
      
      vec3 pos = position;
      float mouseDistance = distance(pos.xy, mousePos * 50.0);
      float influence = 1.0 / (1.0 + mouseDistance * 0.1);
      
      pos += sin(time + pos.x * 0.1) * influence * 2.0;
      pos += cos(time + pos.y * 0.1) * influence * 2.0;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vDistance = length(mvPosition.xyz);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = (20.0 / -mvPosition.z) * (1.0 + state * 2.0) * (1.0 + awakening * 0.5);
    }
  `,
  // Fragment shader
  `
    varying float vDistance;
    varying float vState;
    varying vec3 vPosition;
    uniform float time;
    uniform float awakening;

    void main() {
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      
      if (dist > 0.5) discard;
      
      float strength = 1.0 - dist * 2.0;
      strength = pow(strength, 2.0);
      
      vec3 dormantColor = vec3(0.1, 0.1, 0.3);
      vec3 awakeningColor = vec3(0.0, 0.4, 1.0);
      vec3 consciousColor = vec3(0.0, 1.0, 1.0);
      
      vec3 finalColor = mix(
        mix(dormantColor, awakeningColor, smoothstep(0.0, 1.0, vState)),
        consciousColor,
        smoothstep(1.0, 2.0, vState)
      );
      
      finalColor += sin(time + vPosition.x * 0.1) * 0.1 * awakening;
      
      float alpha = strength * (0.3 + vState * 0.7) * (1.0 + awakening);
      gl_FragColor = vec4(finalColor * strength, alpha);
    }
  `
)

extend({ ConsciousnessMaterial })

// Particle System Component
const ParticleSystem: React.FC<ParticleSystemProps> = ({ 
  mousePos, 
  onAwakening, 
  onConnectionsFormed, 
  onPhaseChange 
}) => {
  const particlesRef = useRef<THREE.Points>(null)
  const materialRef = useRef<any>(null)
  const particleCount = 8000
  const connectionThreshold = 4.0
  
  const { positions, states, velocities, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const st = new Float32Array(particleCount)
    const vel = new Float32Array(particleCount * 3)
    const col = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 120
      pos[i * 3 + 1] = (Math.random() - 0.5) * 120
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60
      
      st[i] = 0
      vel[i * 3] = 0
      vel[i * 3 + 1] = 0
      vel[i * 3 + 2] = 0
      
      col[i * 3] = 0.1
      col[i * 3 + 1] = 0.1
      col[i * 3 + 2] = 0.3
    }
    
    return { positions: pos, states: st, velocities: vel, colors: col }
  }, [])

  useFrame(({ clock }) => {
    if (!particlesRef.current || !materialRef.current) return
    
    const time = clock.getElapsedTime()
    const mouseInfluenceRadius = 20
    
    materialRef.current.time = time
    materialRef.current.mousePos.set(mousePos.x, -mousePos.y)
    
    let awakenedCount = 0
    const newConnections: Connection[] = []
    
    // Update particles based on mouse proximity
    for (let i = 0; i < particleCount; i++) {
      const x = positions[i * 3]
      const y = positions[i * 3 + 1]
      const z = positions[i * 3 + 2]
      
      // Calculate distance from mouse
      const dx = x - mousePos.x * 60
      const dy = y + mousePos.y * 60
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // Awaken particles near cursor
      if (distance < mouseInfluenceRadius && states[i] < 1) {
        states[i] = Math.min(states[i] + 0.02, 1)
        
        // Add velocity away from cursor initially, then attraction
        const force = states[i] > 0.5 ? -0.05 : 0.1
        velocities[i * 3] += (x - mousePos.x * 60) * force * 0.001
        velocities[i * 3 + 1] += (y + mousePos.y * 60) * force * 0.001
        velocities[i * 3 + 2] += (Math.random() - 0.5) * 0.01
      }
      
      // Awakened particles seek connections
      if (states[i] >= 0.5) {
        awakenedCount++
        
        // Find nearest awakened particles
        for (let j = i + 1; j < particleCount; j++) {
          if (states[j] >= 0.5) {
            const dx2 = positions[j * 3] - x
            const dy2 = positions[j * 3 + 1] - y
            const dz2 = positions[j * 3 + 2] - z
            const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2 + dz2 * dz2)
            
            if (dist < connectionThreshold) {
              newConnections.push({
                start: [x, y, z],
                end: [positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]],
                strength: 1 - (dist / connectionThreshold)
              })
              
              states[i] = Math.min(states[i] + 0.01, 2)
              states[j] = Math.min(states[j] + 0.01, 2)
            }
            
            // Attraction between awakened particles
            if (dist < connectionThreshold * 2) {
              const attraction = 0.001
              velocities[i * 3] += dx2 * attraction
              velocities[i * 3 + 1] += dy2 * attraction
              velocities[i * 3 + 2] += dz2 * attraction
            }
          }
        }
        
        // Apply velocities with damping
        positions[i * 3] += velocities[i * 3]
        positions[i * 3 + 1] += velocities[i * 3 + 1]
        positions[i * 3 + 2] += velocities[i * 3 + 2]
        
        velocities[i * 3] *= 0.99
        velocities[i * 3 + 1] *= 0.99
        velocities[i * 3 + 2] *= 0.99
        
        // Update colors based on state
        const stateNorm = states[i] / 2
        colors[i * 3] = 0.1 + stateNorm * 0.9     // R
        colors[i * 3 + 1] = 0.1 + stateNorm * 0.9 // G  
        colors[i * 3 + 2] = 0.3 + stateNorm * 0.7 // B
      }
    }
    
    // Update geometry
    if (particlesRef.current.geometry.attributes.position) {
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
    if (particlesRef.current.geometry.attributes.state) {
      particlesRef.current.geometry.attributes.state.needsUpdate = true
    }
    
    // Calculate awakening percentage
    const awakenedPercentage = (awakenedCount / particleCount) * 100
    onAwakening(awakenedPercentage)
    materialRef.current.awakening = awakenedPercentage / 100
    
    // Update phase based on awakening level
    if (awakenedPercentage > 50) {
      onPhaseChange('conscious')
    } else if (awakenedPercentage > 10) {
      onPhaseChange('awakening')
    } else {
      onPhaseChange('dormant')
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
          attach="attributes-state"
          count={particleCount}
          array={states}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <consciousnessMaterial
        ref={materialRef}
        transparent
        blending={THREE.AdditiveBlending}
        vertexColors
      />
    </points>
  )
}

// Neural Connections Component
const NeuralConnections: React.FC<NeuralConnectionsProps> = ({ connections }) => {
  const linesRef = useRef<THREE.LineSegments>(null)
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(connections.length * 6)
    const colors = new Float32Array(connections.length * 6)
    
    connections.forEach((connection, i) => {
      const idx = i * 6
      
      // Start point
      positions[idx] = connection.start[0]
      positions[idx + 1] = connection.start[1]
      positions[idx + 2] = connection.start[2]
      
      // End point
      positions[idx + 3] = connection.end[0]
      positions[idx + 4] = connection.end[1]
      positions[idx + 5] = connection.end[2]
      
      // Colors based on strength
      const intensity = connection.strength
      colors[idx] = 0 * intensity
      colors[idx + 1] = 0.8 * intensity
      colors[idx + 2] = 1 * intensity
      colors[idx + 3] = 0 * intensity
      colors[idx + 4] = 0.8 * intensity
      colors[idx + 5] = 1 * intensity
    })
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    return geo
  }, [connections])
  
  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        vertexColors
      />
    </lineSegments>
  )
}

// Cursor Glow Component
const CursorGlow: React.FC<CursorGlowProps> = ({ position, awakening }) => {
  const glowSize = 60 + awakening * 3
  const glowIntensity = 0.2 + (awakening / 100) * 0.8
  
  return (
    <motion.div
      className="fixed pointer-events-none z-10"
      style={{
        left: position.x - glowSize / 2,
        top: position.y - glowSize / 2,
        width: glowSize,
        height: glowSize,
      }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [glowIntensity, glowIntensity * 1.2, glowIntensity],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `radial-gradient(circle, 
            rgba(0,255,255,${glowIntensity}) 0%, 
            rgba(0,102,255,${glowIntensity * 0.6}) 30%, 
            rgba(139,69,255,${glowIntensity * 0.3}) 60%,
            transparent 80%)`,
          filter: 'blur(3px)',
          mixBlendMode: 'screen',
        }}
      />
    </motion.div>
  )
}

// Main Component
export default function ConsciousnessAwakening() {
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 })
  const [awakening, setAwakening] = useState<number>(0)
  const [connections, setConnections] = useState<Connection[]>([])
  const [phase, setPhase] = useState<string>('dormant')
  const [showText, setShowText] = useState<boolean>(false)
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false)
  
  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePos({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  // Show text when awakening reaches threshold
  useEffect(() => {
    if (awakening > 25 && !showText) {
      setShowText(true)
    }
  }, [awakening, showText])
  
  // Handle phase transitions
  useEffect(() => {
    if (phase === 'conscious' && awakening > 60 && !isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        // Trigger universe transformation
      }, 2000)
    }
  }, [phase, awakening, isTransitioning])
  
  const handleAwakening = useCallback((level: number) => {
    setAwakening(level)
  }, [])
  
  const handleConnectionsFormed = useCallback((newConnections: Connection[]) => {
    setConnections(newConnections.slice(0, 500)) // Limit for performance
  }, [])
  
  const handlePhaseChange = useCallback((newPhase: string) => {
    setPhase(newPhase)
  }, [])
  
  return (
    <div className="fixed inset-0 bg-black overflow-hidden cursor-none">
      {/* 3D Scene */}
      <Canvas 
        camera={{ position: [0, 0, 80], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.05} />
        <pointLight position={[0, 0, 50]} intensity={0.1} color="#00FFFF" />
        
        <ParticleSystem 
          mousePos={mousePos} 
          onAwakening={handleAwakening}
          onConnectionsFormed={handleConnectionsFormed}
          onPhaseChange={handlePhaseChange}
        />
        
        <NeuralConnections connections={connections} />
        
        <Stars 
          radius={300} 
          depth={50} 
          count={1000} 
          factor={2} 
          saturation={0} 
          fade 
          speed={0.5}
        />
        
        <EffectComposer>
          <Bloom 
            intensity={1.8}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            height={300}
          />
        </EffectComposer>
      </Canvas>
      
      {/* Cursor Glow */}
      <CursorGlow position={mousePos} awakening={awakening} />
      
      {/* Text Overlay */}
      <AnimatePresence>
        {showText && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            <div className="text-center">
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-thin text-white mb-4"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1.5 }}
                style={{
                  textShadow: '0 0 20px rgba(0,255,255,0.5)',
                  background: 'linear-gradient(45deg, #00FFFF, #8B45FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                What if your business could think?
              </motion.h1>
              
              {awakening > 40 && (
                <motion.p 
                  className="text-lg md:text-xl text-cyan-300 opacity-80"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 0.8 }}
                  transition={{ delay: 1.5, duration: 1 }}
                >
                  Watch as data awakens into intelligence
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Awakening Progress */}
      <div className="absolute bottom-8 left-8 pointer-events-none z-20">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-cyan-500/20">
          <div className="text-cyan-300 text-sm mb-2">Consciousness Level</div>
          <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-violet-600 via-cyan-600 to-emerald-600"
              initial={{ width: 0 }}
              animate={{ width: `${awakening}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-cyan-300 text-xs mt-1">
            {Math.round(awakening)}% - {phase}
          </div>
        </div>
      </div>
      
      {/* Phase Indicator */}
      <div className="absolute top-8 right-8 pointer-events-none z-20">
        <motion.div 
          className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/20"
          animate={{
            borderColor: phase === 'conscious' ? 'rgba(0,255,255,0.8)' : 
                        phase === 'awakening' ? 'rgba(139,69,255,0.6)' : 
                        'rgba(0,255,255,0.2)'
          }}
        >
          <div className="text-cyan-300 text-sm capitalize">
            {phase} Phase
          </div>
          <div className="text-xs text-cyan-400 mt-1">
            {connections.length} neural pathways
          </div>
        </motion.div>
      </div>
      
      {/* Instructions */}
      {awakening < 5 && (
        <motion.div 
          className="absolute bottom-8 right-8 pointer-events-none z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-cyan-500/20 max-w-xs">
            <div className="text-cyan-300 text-sm">
              Move your cursor to awaken the consciousness
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}