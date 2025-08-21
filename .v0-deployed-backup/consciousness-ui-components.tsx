'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Text, Html, Environment } from '@react-three/drei'
import { motion } from 'framer-motion'
import { useState, useRef, useMemo, useCallback } from 'react'
import * as THREE from 'three'

interface BusinessMetric {
  id: string
  name: string
  value: number
  category: 'revenue' | 'customers' | 'operations' | 'growth'
  position: [number, number, number]
  connections: string[]
  consciousness: 'neural' | 'synaptic' | 'autonomous' | 'transcendent'
  trend: 'up' | 'down' | 'stable'
}

interface AIPathway {
  from: string
  to: string
  strength: number
  type: 'correlation' | 'causation' | 'prediction'
}

const businessMetrics: BusinessMetric[] = [
  {
    id: 'revenue',
    name: 'Revenue',
    value: 2.4,
    category: 'revenue',
    position: [0, 2, 0],
    connections: ['customers', 'deals'],
    consciousness: 'transcendent',
    trend: 'up'
  },
  {
    id: 'customers',
    name: 'Active Customers',
    value: 1.8,
    category: 'customers',
    position: [-3, 1, 2],
    connections: ['revenue', 'satisfaction'],
    consciousness: 'autonomous',
    trend: 'up'
  },
  {
    id: 'deals',
    name: 'Pipeline Deals',
    value: 1.2,
    category: 'revenue',
    position: [3, 0, -1],
    connections: ['revenue', 'conversion'],
    consciousness: 'synaptic',
    trend: 'stable'
  },
  {
    id: 'satisfaction',
    name: 'Customer Satisfaction',
    value: 2.1,
    category: 'customers',
    position: [-2, -1, 3],
    connections: ['customers', 'retention'],
    consciousness: 'autonomous',
    trend: 'up'
  },
  {
    id: 'conversion',
    name: 'Conversion Rate',
    value: 1.5,
    category: 'operations',
    position: [2, -2, 1],
    connections: ['deals', 'efficiency'],
    consciousness: 'neural',
    trend: 'down'
  },
  {
    id: 'retention',
    name: 'Customer Retention',
    value: 1.9,
    category: 'customers',
    position: [-1, 2, -2],
    connections: ['satisfaction', 'growth'],
    consciousness: 'synaptic',
    trend: 'stable'
  },
  {
    id: 'efficiency',
    name: 'Operational Efficiency',
    value: 1.6,
    category: 'operations',
    position: [1, -1, -3],
    connections: ['conversion', 'costs'],
    consciousness: 'neural',
    trend: 'up'
  },
  {
    id: 'growth',
    name: 'Growth Rate',
    value: 2.2,
    category: 'growth',
    position: [0, -3, 2],
    connections: ['retention', 'revenue'],
    consciousness: 'transcendent',
    trend: 'up'
  },
  {
    id: 'costs',
    name: 'Operating Costs',
    value: 1.1,
    category: 'operations',
    position: [4, 1, 0],
    connections: ['efficiency'],
    consciousness: 'neural',
    trend: 'down'
  }
]

const aiPathways: AIPathway[] = [
  { from: 'revenue', to: 'customers', strength: 0.8, type: 'correlation' },
  { from: 'customers', to: 'satisfaction', strength: 0.9, type: 'causation' },
  { from: 'deals', to: 'revenue', strength: 0.7, type: 'prediction' },
  { from: 'satisfaction', to: 'retention', strength: 0.85, type: 'causation' },
  { from: 'conversion', to: 'deals', strength: 0.6, type: 'correlation' },
  { from: 'retention', to: 'growth', strength: 0.75, type: 'prediction' },
  { from: 'efficiency', to: 'costs', strength: 0.8, type: 'causation' }
]

const consciousnessColors = {
  neural: '#2563eb',
  synaptic: '#7c3aed',
  autonomous: '#f59e0b',
  transcendent: '#ffffff'
}

const categoryColors = {
  revenue: '#10b981',
  customers: '#3b82f6',
  operations: '#f59e0b',
  growth: '#8b5cf6'
}

function IntelligenceStar({ metric, onClick, isSelected }: {
  metric: BusinessMetric
  onClick: (metric: BusinessMetric) => void
  isSelected: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
      
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1
      meshRef.current.scale.setScalar(metric.value * pulse * (isSelected ? 1.5 : 1))
    }
    
    if (glowRef.current) {
      const glowPulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 0.8
      glowRef.current.scale.setScalar(metric.value * 2 * glowPulse)
    }
  })

  const handleClick = useCallback(() => {
    onClick(metric)
  }, [metric, onClick])

  return (
    <group position={metric.position}>
      {/* Glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={consciousnessColors[metric.consciousness]}
          transparent
          opacity={0.2}
        />
      </mesh>
      
      {/* Main star */}
      <mesh ref={meshRef} onClick={handleClick}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color={categoryColors[metric.category]}
          emissive={consciousnessColors[metric.consciousness]}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Label */}
      <Html distanceFactor={10}>
        <div className="pointer-events-none text-white text-xs font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
          {metric.name}
        </div>
      </Html>
    </group>
  )
}

function AIPathway({ pathway, metrics }: {
  pathway: AIPathway
  metrics: BusinessMetric[]
}) {
  const lineRef = useRef<THREE.BufferGeometry>(null)
  
  const fromMetric = metrics.find(m => m.id === pathway.from)
  const toMetric = metrics.find(m => m.id === pathway.to)
  
  if (!fromMetric || !toMetric) return null
  
  const points = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...fromMetric.position),
      new THREE.Vector3(
        (fromMetric.position[0] + toMetric.position[0]) / 2,
        (fromMetric.position[1] + toMetric.position[1]) / 2 + 1,
        (fromMetric.position[2] + toMetric.position[2]) / 2
      ),
      new THREE.Vector3(...toMetric.position)
    ])
    return curve.getPoints(50)
  }, [fromMetric.position, toMetric.position])
  
  useFrame((state) => {
    if (lineRef.current) {
      const positions = lineRef.current.attributes.position.array as Float32Array
      const time = state.clock.elapsedTime
      
      for (let i = 0; i < positions.length; i += 3) {
        const wave = Math.sin(time * 2 + i * 0.1) * 0.1
        positions[i + 1] += wave * 0.01
      }
      
      lineRef.current.attributes.position.needsUpdate = true
    }
  })
  
  const pathwayColor = pathway.type === 'correlation' ? '#3b82f6' : 
                      pathway.type === 'causation' ? '#10b981' : '#f59e0b'
  
  return (
    <line>
      <bufferGeometry ref={lineRef}>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={pathwayColor}
        transparent
        opacity={pathway.strength * 0.6}
        linewidth={2}
      />
    </line>
  )
}

function ConsciousnessNebula() {
  const nebulaRef = useRef<THREE.Points>(null)
  
  const particles = useMemo(() => {
    const positions = new Float32Array(1000 * 3)
    const colors = new Float32Array(1000 * 3)
    
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      
      const color = new THREE.Color()
      color.setHSL(Math.random() * 0.3 + 0.6, 0.8, 0.5)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    return { positions, colors }
  }, [])
  
  useFrame((state) => {
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })
  
  return (
    <points ref={nebulaRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={1000}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={1000}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        transparent
        opacity={0.6}
        vertexColors
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function ConstellationScene() {
  const [selectedMetric, setSelectedMetric] = useState<BusinessMetric | null>(null)
  const [consciousnessLevel, setConsciousnessLevel] = useState<'neural' | 'synaptic' | 'autonomous' | 'transcendent'>('autonomous')
  
  const filteredMetrics = useMemo(() => {
    const levels = ['neural', 'synaptic', 'autonomous', 'transcendent']
    const currentLevelIndex = levels.indexOf(consciousnessLevel)
    return businessMetrics.filter(metric => 
      levels.indexOf(metric.consciousness) <= currentLevelIndex
    )
  }, [consciousnessLevel])
  
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#7c3aed" />
      
      <ConsciousnessNebula />
      
      {filteredMetrics.map(metric => (
        <IntelligenceStar
          key={metric.id}
          metric={metric}
          onClick={setSelectedMetric}
          isSelected={selectedMetric?.id === metric.id}
        />
      ))}
      
      {aiPathways.map((pathway, index) => (
        <AIPathway
          key={index}
          pathway={pathway}
          metrics={filteredMetrics}
        />
      ))}
      
      <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade />
      <Environment preset="night" />
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
      />
    </>
  )
}

export default function LivingBusinessIntelligenceConstellation() {
  const [consciousnessLevel, setConsciousnessLevel] = useState<'neural' | 'synaptic' | 'autonomous' | 'transcendent'>('autonomous')
  const [selectedMetric, setSelectedMetric] = useState<BusinessMetric | null>(null)
  
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent" />
      
      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 z-10"
      >
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 min-w-80">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-violet-400 to-cyan-400 rounded-full animate-pulse" />
            Intelligence Constellation
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Consciousness Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['neural', 'synaptic', 'autonomous', 'transcendent'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setConsciousnessLevel(level)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      consciousnessLevel === level
                        ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Legend</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span className="text-gray-400">Revenue Metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-gray-400">Customer Metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full" />
                  <span className="text-gray-400">Operations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-violet-500 rounded-full" />
                  <span className="text-gray-400">Growth</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Metric Details Panel */}
      {selectedMetric && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-6 right-6 z-10"
        >
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 min-w-72">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{selectedMetric.name}</h3>
              <button
                onClick={() => setSelectedMetric(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Value</span>
                <span className="text-white font-mono">{selectedMetric.value.toFixed(1)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Consciousness</span>
                <span 
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: consciousnessColors[selectedMetric.consciousness] + '20',
                    color: consciousnessColors[selectedMetric.consciousness]
                  }}
                >
                  {selectedMetric.consciousness}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Trend</span>
                <span className={`text-sm font-medium ${
                  selectedMetric.trend === 'up' ? 'text-emerald-400' :
                  selectedMetric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {selectedMetric.trend === 'up' ? '↗' : selectedMetric.trend === 'down' ? '↘' : '→'} {selectedMetric.trend}
                </span>
              </div>
              
              <div className="border-t border-white/10 pt-3">
                <span className="text-gray-400 text-sm block mb-2">Connected to:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedMetric.connections.map(connectionId => {
                    const connectedMetric = businessMetrics.find(m => m.id === connectionId)
                    return connectedMetric ? (
                      <span
                        key={connectionId}
                        className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300"
                      >
                        {connectedMetric.name}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        className="w-full h-full"
      >
        <ConstellationScene />
      </Canvas>
      
      {/* Navigation Hints */}
      <div className="absolute bottom-6 left-6 text-gray-400 text-sm space-y-1">
        <div>Click and drag to rotate</div>
        <div>Scroll to zoom</div>
        <div>Click stars for details</div>
      </div>
    </div>
  )
}