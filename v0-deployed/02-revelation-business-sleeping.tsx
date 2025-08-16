'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, DollarSign, Users, TrendingUp, Brain, Sparkles } from 'lucide-react'
import * as THREE from 'three'

interface BusinessMetrics {
  revenue: number
  customers: number
  decisions: number
  optimizations: number
}

interface BusinessDecision {
  id: string
  type: string
  description: string
  impact: number
  timestamp: Date
}

interface SleepVisualizationProps {
  currentTime: Date
}

interface BusinessVisualizationProps {
  metrics: BusinessMetrics
  decisions: BusinessDecision[]
  businessTime: Date
}

interface BusinessBrainProps {
  decisions: BusinessDecision[]
}

interface ParticleBridgeProps {
  decisions: BusinessDecision[]
}

interface MetricsOverlayProps {
  metrics: BusinessMetrics
}

const generateBusinessDecision = (): BusinessDecision => {
  const decisionTypes = [
    {
      type: 'Customer Retention',
      descriptions: [
        'Identified at-risk customer, sent personalized retention offer',
        'Triggered win-back campaign for dormant accounts',
        'Upgraded loyal customer to VIP status automatically'
      ],
      impactRange: [5000, 25000]
    },
    {
      type: 'Inventory Optimization',
      descriptions: [
        'Reordered trending items before stockout',
        'Adjusted pricing on slow-moving inventory',
        'Predicted seasonal demand spike, increased orders'
      ],
      impactRange: [3000, 15000]
    },
    {
      type: 'Revenue Maximization',
      descriptions: [
        'Identified upsell opportunity and executed campaign',
        'Optimized pricing based on demand patterns',
        'Cross-sold complementary products to recent buyers'
      ],
      impactRange: [8000, 35000]
    },
    {
      type: 'Cost Reduction',
      descriptions: [
        'Negotiated better supplier rates automatically',
        'Optimized shipping routes for efficiency',
        'Reduced energy consumption during off-hours'
      ],
      impactRange: [2000, 12000]
    },
    {
      type: 'Risk Prevention',
      descriptions: [
        'Blocked fraudulent transaction attempt',
        'Identified and resolved system vulnerability',
        'Prevented customer churn through early intervention'
      ],
      impactRange: [10000, 50000]
    }
  ]
  
  const decision = decisionTypes[Math.floor(Math.random() * decisionTypes.length)]
  const description = decision.descriptions[Math.floor(Math.random() * decision.descriptions.length)]
  const impact = Math.random() * (decision.impactRange[1] - decision.impactRange[0]) + decision.impactRange[0]
  
  return {
    id: Date.now() + Math.random().toString(),
    type: decision.type,
    description,
    impact: Math.round(impact),
    timestamp: new Date()
  }
}

const SleepVisualization: React.FC<SleepVisualizationProps> = ({ currentTime }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    
    let animationId: number
    
    const drawSleepingPerson = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Dreamy background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#1a1a2e')
      gradient.addColorStop(1, '#16213e')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Sleeping figure silhouette
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      
      // Breathing animation
      const breathScale = 1 + Math.sin(time * 0.001) * 0.02
      ctx.scale(breathScale, breathScale)
      
      // Draw peaceful sleeping figure
      ctx.beginPath()
      ctx.fillStyle = '#0f3460'
      ctx.ellipse(0, 0, 150, 60, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Z's floating up (sleep indicator)
      for (let i = 0; i < 3; i++) {
        const offset = (time * 0.05 + i * 100) % 300
        const opacity = 1 - offset / 300
        ctx.fillStyle = `rgba(100, 149, 237, ${opacity})`
        ctx.font = `${20 + i * 5}px serif`
        ctx.fillText('Z', 100, -offset)
      }
      
      ctx.restore()
      
      // Dream particles
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(time * 0.0001 * i) + 1) * canvas.width / 2
        const y = (Math.cos(time * 0.0001 * i) + 1) * canvas.height / 2
        const size = Math.sin(time * 0.001 + i) * 2 + 3
        
        ctx.beginPath()
        ctx.fillStyle = `rgba(147, 197, 253, ${0.3 + Math.sin(time * 0.001 + i) * 0.2})`
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
      
      animationId = requestAnimationFrame(() => drawSleepingPerson(Date.now()))
    }
    
    drawSleepingPerson(Date.now())
    
    return () => cancelAnimationFrame(animationId)
  }, [])
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

const BusinessBrain: React.FC<BusinessBrainProps> = ({ decisions }) => {
  const brainRef = useRef<THREE.Group>(null)
  const neuronsRef = useRef<(THREE.Mesh | null)[]>([])
  
  useFrame(({ clock }) => {
    if (brainRef.current) {
      brainRef.current.rotation.y = clock.getElapsedTime() * 0.1
      
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05
      brainRef.current.scale.setScalar(scale)
    }
    
    neuronsRef.current.forEach((neuron, i) => {
      if (neuron) {
        const offset = i * 0.5
        neuron.position.x = Math.sin(clock.getElapsedTime() + offset) * 5
        neuron.position.y = Math.cos(clock.getElapsedTime() + offset) * 5
      }
    })
  })
  
  return (
    <group ref={brainRef}>
      <mesh>
        <icosahedronGeometry args={[3, 2]} />
        <meshStandardMaterial 
          color="#00FFFF" 
          emissive="#00FFFF"
          emissiveIntensity={0.5}
          wireframe
        />
      </mesh>
      
      {[...Array(8)].map((_, i) => (
        <mesh
          key={i}
          ref={el => neuronsRef.current[i] = el}
          position={[
            Math.cos(i * Math.PI / 4) * 8,
            Math.sin(i * Math.PI / 4) * 8,
            0
          ]}
        >
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial 
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

const ParticleBridge: React.FC<ParticleBridgeProps> = ({ decisions }) => {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 1000
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return pos
  }, [])
  
  useFrame(({ clock }) => {
    if (!particlesRef.current) return
    
    const time = clock.getElapsedTime()
    const positionAttribute = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute
    
    for (let i = 0; i < particleCount; i++) {
      const x = positionAttribute.getX(i)
      const y = positionAttribute.getY(i)
      
      const flowSpeed = 0.5 + Math.sin(time + i * 0.1) * 0.2
      let newX = x + flowSpeed
      
      if (newX > 50) newX = -50
      
      const waveY = y + Math.sin(time * 2 + x * 0.1) * 0.5
      
      positionAttribute.setXYZ(i, newX, waveY, positionAttribute.getZ(i))
    }
    
    positionAttribute.needsUpdate = true
  })
  
  return (
    <div className="absolute left-1/2 top-0 w-px h-full transform -translate-x-1/2 z-10">
      <Canvas camera={{ position: [0, 0, 50] }}>
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={2}
            color="#00FFFF"
            transparent
            opacity={0.6}
          />
        </points>
      </Canvas>
    </div>
  )
}

const BusinessVisualization: React.FC<BusinessVisualizationProps> = ({ 
  metrics, 
  decisions, 
  businessTime 
}) => {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-violet-900/20 to-cyan-900/20">
      <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
        <color attach="background" args={['#0a0a0a']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <BusinessBrain decisions={decisions} />
      </Canvas>
      
      <div className="absolute top-10 right-10 w-96 max-h-96 overflow-y-auto">
        <h3 className="text-cyan-400 text-xl mb-4 flex items-center">
          <Brain className="mr-2" />
          Autonomous Decisions
        </h3>
        <AnimatePresence>
          {decisions.slice(-5).map((decision) => (
            <motion.div
              key={decision.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="mb-3 p-3 bg-black/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-cyan-300 font-medium">{decision.type}</span>
                <span className="text-xs text-gray-400">
                  {decision.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-white text-sm mt-1">{decision.description}</p>
              <p className="text-emerald-400 text-xs mt-1 font-semibold">
                Impact: +${decision.impact.toLocaleString()}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

const MetricsOverlay: React.FC<MetricsOverlayProps> = ({ metrics }) => {
  return (
    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-20">
      <motion.div 
        className="bg-black/80 backdrop-blur-md border border-cyan-400/30 rounded-lg p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-2xl text-white text-center mb-4 flex items-center justify-center">
          <Sparkles className="mr-2 text-cyan-400" />
          While You Slept (Last 8 Hours)
        </h3>
        <div className="grid grid-cols-4 gap-8">
          <div className="text-center">
            <DollarSign className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">
              ${(metrics.revenue - 487000).toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">Revenue Generated</p>
          </div>
          <div className="text-center">
            <Users className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">
              {metrics.customers - 1247}
            </p>
            <p className="text-sm text-gray-400">New Customers</p>
          </div>
          <div className="text-center">
            <Brain className="w-8 h-8 text-violet-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">
              {metrics.decisions}
            </p>
            <p className="text-sm text-gray-400">Decisions Made</p>
          </div>
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">
              {metrics.optimizations}
            </p>
            <p className="text-sm text-gray-400">Optimizations</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function BusinessSleepingExperience() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [businessTime, setBusinessTime] = useState(new Date())
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    revenue: 487000,
    customers: 1247,
    decisions: 0,
    optimizations: 0
  })
  const [activeDecisions, setActiveDecisions] = useState<BusinessDecision[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    if (!isPlaying) return
    
    const interval = setInterval(() => {
      setBusinessTime(prev => {
        const next = new Date(prev)
        next.setMinutes(next.getMinutes() + 15)
        return next
      })
      
      if (Math.random() > 0.7) {
        const newDecision = generateBusinessDecision()
        setActiveDecisions(prev => [...prev.slice(-5), newDecision])
        
        setMetrics(prev => ({
          revenue: prev.revenue + newDecision.impact,
          customers: prev.customers + Math.floor(Math.random() * 5),
          decisions: prev.decisions + 1,
          optimizations: prev.optimizations + (Math.random() > 0.5 ? 1 : 0)
        }))
      }
    }, 100)
    
    return () => clearInterval(interval)
  }, [isPlaying])
  
  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Sleep Side */}
      <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-br from-violet-900/30 to-indigo-900/30">
        <SleepVisualization currentTime={currentTime} />
        <div className="absolute bottom-10 left-10 text-white z-10">
          <h2 className="text-4xl font-thin mb-2">You</h2>
          <p className="text-xl opacity-70">Peacefully sleeping</p>
          <div className="flex items-center mt-4 text-3xl">
            <Clock className="mr-3" />
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </div>
      
      {/* Particle Bridge */}
      <ParticleBridge decisions={activeDecisions} />
      
      {/* Business Side */}
      <div className="absolute right-0 top-0 w-1/2 h-full">
        <BusinessVisualization 
          metrics={metrics} 
          decisions={activeDecisions}
          businessTime={businessTime}
        />
        <div className="absolute bottom-10 right-10 text-white text-right z-10">
          <h2 className="text-4xl font-thin mb-2">Your Business</h2>
          <p className="text-xl text-cyan-400">Thinking & Growing</p>
          <div className="flex items-center justify-end mt-4 text-3xl">
            <Clock className="mr-3" />
            {businessTime.toLocaleTimeString()}
          </div>
        </div>
      </div>
      
      {/* Metrics Overlay */}
      {isPlaying && <MetricsOverlay metrics={metrics} />}
      
      {/* Start Experience Button */}
      {!isPlaying && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={() => setIsPlaying(true)}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     px-12 py-6 text-2xl text-white border-2 border-cyan-400 
                     hover:bg-cyan-400 hover:text-black transition-all duration-300
                     backdrop-blur-sm bg-black/20 rounded-lg z-30"
        >
          Watch Your Night Unfold
        </motion.button>
      )}
    </div>
  )
}