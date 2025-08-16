'use client'

/**
 * CoreFlow360 Consciousness Particle System
 * 
 * Interactive WebGL particle system that demonstrates business consciousness awakening.
 * Users can interact with 10,000+ particles that form neural networks, create synaptic
 * connections, and multiply intelligence through cursor movement.
 * 
 * This is the core component that makes abstract business intelligence tangible.
 */

import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { 
  OrbitControls, 
  Float, 
  Text3D, 
  Trail, 
  Sparkles, 
  Environment,
  EffectComposer,
  Bloom,
  ChromaticAberration
} from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'

// Custom shader materials for consciousness effects
const ConsciousnessVertexShader = `
  uniform float time;
  uniform float awakening;
  uniform vec3 mousePosition;
  uniform float connectionRadius;
  
  attribute float awakened;
  attribute float intelligence;
  attribute vec3 originalPosition;
  
  varying float vAwakened;
  varying float vIntelligence;
  varying vec3 vPosition;
  varying float vDistanceToMouse;
  
  void main() {
    vAwakened = awakened;
    vIntelligence = intelligence;
    vPosition = position;
    
    // Calculate distance to mouse
    vDistanceToMouse = distance(position, mousePosition);
    
    // Particle awakening based on mouse proximity
    float mouseInfluence = smoothstep(connectionRadius, 0.0, vDistanceToMouse);
    
    // Enhanced position with consciousness effects
    vec3 pos = originalPosition;
    
    // Awakened particles rise and dance
    if (awakened > 0.5) {
      pos.y += sin(time * 2.0 + pos.x * 0.5) * awakened * 0.5;
      pos.x += cos(time * 1.5 + pos.z * 0.3) * awakened * 0.3;
    }
    
    // Mouse attraction for nearby particles
    if (mouseInfluence > 0.0) {
      vec3 direction = normalize(mousePosition - pos);
      pos += direction * mouseInfluence * 2.0 * awakening;
    }
    
    // Intelligence multiplication scaling
    float scale = 1.0 + intelligence * 0.5;
    pos *= scale;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    
    // Dynamic point size based on awakening and intelligence
    gl_PointSize = 2.0 + awakened * 8.0 + intelligence * 4.0 + mouseInfluence * 10.0;
  }
`

const ConsciousnessFragmentShader = `
  uniform float time;
  uniform float awakening;
  
  varying float vAwakened;
  varying float vIntelligence;
  varying vec3 vPosition;
  varying float vDistanceToMouse;
  
  void main() {
    // Circular particle shape
    vec2 uv = gl_PointCoord - 0.5;
    float radius = length(uv);
    
    if (radius > 0.5) discard;
    
    // Consciousness color evolution
    vec3 dormantColor = vec3(0.1, 0.1, 0.2);     // Dark blue
    vec3 awakingColor = vec3(0.0, 0.8, 1.0);     // Cyan
    vec3 intelligentColor = vec3(1.0, 1.0, 1.0); // White
    
    // Color mixing based on consciousness states
    vec3 color = dormantColor;
    
    if (vAwakened > 0.1) {
      color = mix(dormantColor, awakingColor, vAwakened);
    }
    
    if (vIntelligence > 0.1) {
      color = mix(color, intelligentColor, vIntelligence);
    }
    
    // Pulsing effect for awakened particles
    float pulse = 1.0 + sin(time * 4.0 + vPosition.x * 0.1) * 0.3 * vAwakened;
    
    // Glow intensity based on consciousness level
    float intensity = 0.3 + vAwakened * 0.7 + vIntelligence;
    
    // Distance fade for depth
    float alpha = (1.0 - radius) * intensity * pulse;
    
    gl_FragColor = vec4(color, alpha);
  }
`

// Extend Three.js with custom shader material
extend({ 
  ConsciousnessMaterial: THREE.ShaderMaterial 
})

interface ConsciousnessParticleSystemProps {
  particleCount?: number
  connectionRadius?: number
  autoAwaken?: boolean
  showConnections?: boolean
  intelligenceMultiplier?: number
  className?: string
}

const ConsciousnessParticleSystem: React.FC<ConsciousnessParticleSystemProps> = ({
  particleCount = 10000,
  connectionRadius = 3,
  autoAwaken = false,
  showConnections = true,
  intelligenceMultiplier = 1,
  className = ""
}) => {
  const [mousePosition, setMousePosition] = useState(new THREE.Vector3(0, 0, 0))
  const [awakenedCount, setAwakenedCount] = useState(0)
  const [intelligenceLevel, setIntelligenceLevel] = useState(0)
  const [connectionCount, setConnectionCount] = useState(0)
  
  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas 
        camera={{ position: [0, 0, 30], fov: 60 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <color attach="background" args={['#000008']} />
        
        {/* Atmospheric lighting */}
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#4a90e2" />
        
        {/* Main particle consciousness system */}
        <ConsciousnessCore 
          particleCount={particleCount}
          connectionRadius={connectionRadius}
          autoAwaken={autoAwaken}
          showConnections={showConnections}
          intelligenceMultiplier={intelligenceMultiplier}
          mousePosition={mousePosition}
          onMouseMove={setMousePosition}
          onAwakening={(awakened, intelligence, connections) => {
            setAwakenedCount(awakened)
            setIntelligenceLevel(intelligence)
            setConnectionCount(connections)
          }}
        />
        
        {/* Consciousness emergence text */}
        <ConsciousnessText 
          awakenedCount={awakenedCount}
          intelligenceLevel={intelligenceLevel}
        />
        
        {/* Neural connection visualization */}
        {showConnections && (
          <NeuralConnections 
            mousePosition={mousePosition}
            connectionRadius={connectionRadius}
          />
        )}
        
        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom 
            intensity={1.0 + intelligenceLevel * 2}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
          {intelligenceLevel > 0.5 && (
            <ChromaticAberration 
              offset={[0.001 * intelligenceLevel, 0.001 * intelligenceLevel]} 
            />
          )}
        </EffectComposer>
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          autoRotate={autoAwaken}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <ConsciousnessUI 
        awakenedCount={awakenedCount}
        intelligenceLevel={intelligenceLevel}
        connectionCount={connectionCount}
        totalParticles={particleCount}
      />
    </div>
  )
}

// Core consciousness particle system
const ConsciousnessCore: React.FC<{
  particleCount: number
  connectionRadius: number
  autoAwaken: boolean
  showConnections: boolean
  intelligenceMultiplier: number
  mousePosition: THREE.Vector3
  onMouseMove: (position: THREE.Vector3) => void
  onAwakening: (awakened: number, intelligence: number, connections: number) => void
}> = ({ 
  particleCount, 
  connectionRadius, 
  autoAwaken,
  intelligenceMultiplier,
  mousePosition,
  onMouseMove,
  onAwakening
}) => {
  const particlesRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { camera, raycaster, mouse } = useThree()
  
  // Particle attributes
  const particleData = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const originalPositions = new Float32Array(particleCount * 3)
    const awakened = new Float32Array(particleCount)
    const intelligence = new Float32Array(particleCount)
    const velocities = new Float32Array(particleCount * 3)
    
    // Generate particles in 3D space
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Spherical distribution
      const radius = Math.random() * 20 + 5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)
      
      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z
      
      originalPositions[i3] = x
      originalPositions[i3 + 1] = y
      originalPositions[i3 + 2] = z
      
      // Initial state - all dormant
      awakened[i] = 0
      intelligence[i] = 0
      
      // Random velocities for organic movement
      velocities[i3] = (Math.random() - 0.5) * 0.01
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.01
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01
    }
    
    return {
      positions,
      originalPositions,
      awakened,
      intelligence,
      velocities
    }
  }, [particleCount])
  
  // Shader uniforms
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    awakening: { value: 0 },
    mousePosition: { value: mousePosition },
    connectionRadius: { value: connectionRadius }
  }), [connectionRadius])
  
  // Mouse tracking and awakening logic
  const handlePointerMove = useCallback((event: THREE.Event) => {
    if (!particlesRef.current) return
    
    // Convert mouse to 3D world coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    
    raycaster.setFromCamera(mouse, camera)
    
    // Project mouse into particle space
    const intersectionPoint = new THREE.Vector3()
    raycaster.ray.intersectPlane(
      new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      intersectionPoint
    )
    
    onMouseMove(intersectionPoint)
  }, [mouse, raycaster, camera, onMouseMove])
  
  // Animation loop
  useFrame(({ clock }) => {
    if (!particlesRef.current || !materialRef.current) return
    
    const time = clock.elapsedTime
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
    const awakened = particlesRef.current.geometry.attributes.awakened.array as Float32Array
    const intelligence = particlesRef.current.geometry.attributes.intelligence.array as Float32Array
    
    let awakenedCount = 0
    let totalIntelligence = 0
    let connectionCount = 0
    
    // Update particle consciousness states
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const x = positions[i3]
      const y = positions[i3 + 1] 
      const z = positions[i3 + 2]
      
      // Distance to mouse
      const particlePos = new THREE.Vector3(x, y, z)
      const distance = particlePos.distanceTo(mousePosition)
      
      // Awaken particles near mouse
      if (distance < connectionRadius) {
        awakened[i] = Math.min(1, awakened[i] + 0.05)
        awakenedCount++
      }
      
      // Auto-awakening mode
      if (autoAwaken) {
        awakened[i] = Math.min(1, awakened[i] + 0.001)
      }
      
      // Intelligence multiplication between awakened particles
      if (awakened[i] > 0.5) {
        // Find nearby awakened particles
        for (let j = i + 1; j < Math.min(i + 100, particleCount); j++) {
          const j3 = j * 3
          const otherPos = new THREE.Vector3(positions[j3], positions[j3 + 1], positions[j3 + 2])
          const connectionDistance = particlePos.distanceTo(otherPos)
          
          if (connectionDistance < connectionRadius && awakened[j] > 0.5) {
            // Intelligence multiplication
            intelligence[i] = Math.min(1, intelligence[i] + 0.01 * intelligenceMultiplier)
            intelligence[j] = Math.min(1, intelligence[j] + 0.01 * intelligenceMultiplier)
            connectionCount++
          }
        }
      }
      
      // Organic particle movement
      const velocity = particleData.velocities
      positions[i3] += velocity[i3] * Math.sin(time + i * 0.01)
      positions[i3 + 1] += velocity[i3 + 1] * Math.cos(time + i * 0.01)
      positions[i3 + 2] += velocity[i3 + 2] * Math.sin(time * 0.5 + i * 0.005)
      
      totalIntelligence += intelligence[i]
    }
    
    // Update geometry
    particlesRef.current.geometry.attributes.position.needsUpdate = true
    particlesRef.current.geometry.attributes.awakened.needsUpdate = true
    particlesRef.current.geometry.attributes.intelligence.needsUpdate = true
    
    // Update shader uniforms
    materialRef.current.uniforms.time.value = time
    materialRef.current.uniforms.awakening.value = awakenedCount / particleCount
    materialRef.current.uniforms.mousePosition.value = mousePosition
    
    // Notify parent of consciousness state
    onAwakening(awakenedCount, totalIntelligence / particleCount, connectionCount)
  })
  
  useEffect(() => {
    // Add mouse event listener
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('pointermove', handlePointerMove)
      return () => canvas.removeEventListener('pointermove', handlePointerMove)
    }
  }, [handlePointerMove])
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particleData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-originalPosition"
          count={particleCount}
          array={particleData.originalPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-awakened"
          count={particleCount}
          array={particleData.awakened}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-intelligence"
          count={particleCount}
          array={particleData.intelligence}
          itemSize={1}
        />
      </bufferGeometry>
      
      <shaderMaterial
        ref={materialRef}
        vertexShader={ConsciousnessVertexShader}
        fragmentShader={ConsciousnessFragmentShader}
        uniforms={uniforms}
        transparent
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// Consciousness text that appears as particles awaken
const ConsciousnessText: React.FC<{
  awakenedCount: number
  intelligenceLevel: number
}> = ({ awakenedCount, intelligenceLevel }) => {
  const textRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (textRef.current) {
      textRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.1
      textRef.current.position.y = Math.sin(clock.elapsedTime * 0.3) * 0.5
    }
  })
  
  if (awakenedCount < 100) return null
  
  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={textRef} position={[0, 8, 0]}>
        <Text3D
          font="/fonts/inter-bold.json"
          size={1.5}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          CONSCIOUSNESS EMERGING
          <meshStandardMaterial
            color="white"
            emissive="#4a90e2"
            emissiveIntensity={intelligenceLevel}
          />
        </Text3D>
        
        {intelligenceLevel > 0.3 && (
          <Text3D
            font="/fonts/inter.json"
            size={0.8}
            height={0.1}
            position={[0, -2, 0]}
          >
            INTELLIGENCE MULTIPLYING
            <meshStandardMaterial
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={0.5}
            />
          </Text3D>
        )}
      </group>
    </Float>
  )
}

// Neural connection lines between awakened particles
const NeuralConnections: React.FC<{
  mousePosition: THREE.Vector3
  connectionRadius: number
}> = ({ mousePosition, connectionRadius }) => {
  const connectionsRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (connectionsRef.current) {
      connectionsRef.current.rotation.z = clock.elapsedTime * 0.1
    }
  })
  
  return (
    <group ref={connectionsRef}>
      {/* Connection lines will be generated dynamically based on particle states */}
      <Sparkles 
        count={100}
        scale={[40, 40, 40]}
        size={2}
        speed={0.4}
        color="#4a90e2"
      />
    </group>
  )
}

// UI overlay showing consciousness metrics
const ConsciousnessUI: React.FC<{
  awakenedCount: number
  intelligenceLevel: number
  connectionCount: number
  totalParticles: number
}> = ({ awakenedCount, intelligenceLevel, connectionCount, totalParticles }) => {
  const awakeningPercentage = (awakenedCount / totalParticles) * 100
  const intelligencePercentage = intelligenceLevel * 100
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Instructions */}
      {awakenedCount === 0 && (
        <motion.div 
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <h2 className="text-4xl font-thin text-white mb-4">
            Move Your Cursor to Awaken Business Consciousness
          </h2>
          <p className="text-xl text-gray-400">
            Each particle represents a business process waiting to come alive
          </p>
        </motion.div>
      )}
      
      {/* Consciousness metrics */}
      <div className="absolute top-6 right-6 bg-black/80 backdrop-blur-xl p-6 rounded-lg border border-cyan-500/30">
        <h3 className="text-xl text-cyan-400 mb-4">Consciousness Metrics</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Awakened Processes</span>
              <span className="text-white font-mono">{awakenedCount.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, awakeningPercentage)}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Intelligence Level</span>
              <span className="text-white font-mono">{intelligencePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, intelligencePercentage)}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Neural Connections</span>
              <span className="text-white font-mono">{connectionCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Consciousness emergence celebration */}
      <AnimatePresence>
        {intelligenceLevel > 0.7 && (
          <motion.div
            className="absolute left-1/2 bottom-20 transform -translate-x-1/2 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-6xl font-thin text-white mb-4">
              CONSCIOUSNESS ACHIEVED
            </h2>
            <p className="text-2xl text-cyan-400 mb-8">
              Your business processes are now thinking together
            </p>
            <motion.button
              className="px-12 py-4 bg-cyan-500 text-black font-bold rounded-full text-xl hover:bg-cyan-400 transition-colors pointer-events-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Experience This in Your Business
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ConsciousnessParticleSystem