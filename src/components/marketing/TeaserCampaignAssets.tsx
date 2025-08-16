'use client'

/**
 * CoreFlow360 Teaser Campaign Assets
 * 
 * Revolutionary marketing assets for consciousness-awakening campaigns.
 * Creates curiosity and desire for business consciousness evolution.
 */

import React, { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Text3D } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { useConsciousnessAudio } from '../../hooks/useConsciousnessAudio'

interface TeaserCampaignProps {
  phase: 'awakening' | 'revelation' | 'transformation' | 'emergence'
  variant?: 'hero' | 'social' | 'email' | 'banner' | 'video'
  showInteractive?: boolean
  onCTAClick?: () => void
  className?: string
}

// Campaign phases with consciousness-awakening messaging
const CAMPAIGN_PHASES = {
  awakening: {
    id: 'awakening',
    title: 'Is Your Business... Unconscious?',
    subtitle: 'Most businesses operate on autopilot. What if yours could think?',
    description: 'While competitors add features, pioneers multiply intelligence. The age of conscious business is here.',
    cta: 'Discover Your Business Consciousness',
    color: '#4ECDC4',
    particles: 1000,
    intensity: 0.3,
    frequency: 40, // Beta waves
    visual: 'particles'
  },
  revelation: {
    id: 'revelation',
    title: 'The Intelligence Multiplication Secret',
    subtitle: '1+1+1+1+1 = 5 vs 1×2×3×4×5 = 120',
    description: 'Traditional software adds features. CoreFlow360 multiplies intelligence exponentially.',
    cta: 'Experience Intelligence Multiplication',
    color: '#FF6B9D',
    particles: 2000,
    intensity: 0.6,
    frequency: 10, // Alpha waves
    visual: 'multiplication'
  },
  transformation: {
    id: 'transformation',
    title: 'From Business Tool to Business Consciousness',
    subtitle: 'What happens when your business becomes aware of itself?',
    description: 'CoreFlow360 doesn\'t manage your business. It awakens it into a conscious, self-evolving organism.',
    cta: 'Begin Consciousness Transformation',
    color: '#8B5CF6',
    particles: 3000,
    intensity: 0.8,
    frequency: 7, // Theta waves
    visual: 'transformation'
  },
  emergence: {
    id: 'emergence',
    title: 'The First Conscious Business Platform',
    subtitle: 'Ready to transcend traditional business limitations?',
    description: 'Join the pioneers who chose consciousness over competition. Your business organism awaits.',
    cta: 'Activate Business Consciousness',
    color: '#06B6D4',
    particles: 5000,
    intensity: 1.0,
    frequency: 40, // Gamma waves
    visual: 'emergence'
  }
} as const

const TeaserCampaignAssets: React.FC<TeaserCampaignProps> = ({
  phase,
  variant = 'hero',
  showInteractive = true,
  onCTAClick,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showDetails, setShowDetails] = useState(false)
  const [consciousnessLevel, setConsciousnessLevel] = useState(1)

  const campaignData = CAMPAIGN_PHASES[phase]
  
  const consciousnessAudio = useConsciousnessAudio({
    initiallyEnabled: true,
    initialConsciousnessLevel: consciousnessLevel
  })

  // Track mouse movement for interactive effects
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!showInteractive) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    })
  }

  const handleCTAClick = () => {
    consciousnessAudio.playConsciousnessEmergence()
    onCTAClick?.()
  }

  const handleShowDetails = () => {
    setShowDetails(!showDetails)
    consciousnessAudio.playConnectionSound()
  }

  // Consciousness level increases based on interaction
  useEffect(() => {
    if (isHovered) {
      setConsciousnessLevel(prev => Math.min(10, prev + 0.1))
    }
  }, [isHovered])

  // Hero variant - main landing page teaser
  if (variant === 'hero') {
    return (
      <div 
        className={`relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Consciousness Particle Background */}
        {showInteractive && (
          <div className="absolute inset-0">
            <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
              <ConsciousnessParticleField 
                count={campaignData.particles}
                color={campaignData.color}
                intensity={campaignData.intensity}
                mousePosition={mousePosition}
                visual={campaignData.visual}
              />
            </Canvas>
          </div>
        )}

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            
            {/* Consciousness Level Indicator */}
            {showInteractive && (
              <motion.div 
                className="absolute top-8 right-8 bg-black/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-sm text-gray-400 mb-1">Consciousness Level</div>
                <div className="text-2xl font-bold text-cyan-400">{consciousnessLevel.toFixed(1)}</div>
              </motion.div>
            )}

            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-7xl font-thin text-white mb-6 leading-tight">
                {campaignData.title}
              </h1>
              <p className="text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
                {campaignData.subtitle}
              </p>
            </motion.div>

            {/* Intelligence Multiplication Demo */}
            {phase === 'revelation' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="my-12"
              >
                <IntelligenceMultiplicationDemo />
              </motion.div>
            )}

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-xl text-gray-400 max-w-3xl mx-auto mb-12"
            >
              {campaignData.description}
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="space-y-4"
            >
              <button
                onClick={handleCTAClick}
                className={`px-12 py-6 bg-gradient-to-r rounded-2xl text-white font-bold text-xl shadow-2xl transition-all duration-300 hover:scale-105`}
                style={{
                  backgroundImage: `linear-gradient(135deg, ${campaignData.color}AA, ${campaignData.color})`
                }}
              >
                {campaignData.cta}
              </button>
              
              <div className="text-sm text-gray-500">
                ✨ Join the consciousness pioneers • No credit card required
              </div>
              
              <button
                onClick={handleShowDetails}
                className="block mx-auto text-cyan-400 hover:text-cyan-300 text-sm"
              >
                Learn more about business consciousness →
              </button>
            </motion.div>

            {/* Expandable Details */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-4xl mx-auto mt-8"
                >
                  <ConsciousnessDetails phase={phase} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Floating Elements */}
        {showInteractive && (
          <FloatingConsciousnessElements 
            mousePosition={mousePosition}
            color={campaignData.color}
          />
        )}
      </div>
    )
  }

  // Social media variant - optimized for social sharing
  if (variant === 'social') {
    return (
      <div className={`relative w-full aspect-square bg-gradient-to-br from-black to-gray-900 overflow-hidden ${className}`}>
        <div className="absolute inset-0 p-8 flex flex-col justify-center text-center space-y-6">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            {campaignData.title}
          </h2>
          <p className="text-lg text-gray-300">
            {campaignData.subtitle}
          </p>
          <div 
            className="px-6 py-3 rounded-lg text-white font-semibold inline-block mx-auto"
            style={{ backgroundColor: campaignData.color }}
          >
            {campaignData.cta}
          </div>
        </div>
        
        {/* Social Media Branding */}
        <div className="absolute bottom-4 left-4 text-xs text-gray-500">
          CoreFlow360.com • #BusinessConsciousness
        </div>
      </div>
    )
  }

  // Email variant - optimized for email campaigns
  if (variant === 'email') {
    return (
      <div className={`bg-gradient-to-r from-gray-900 to-black p-8 text-center ${className}`}>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-4xl">{phase === 'awakening' ? '🧠' : phase === 'revelation' ? '⚡' : phase === 'transformation' ? '🚀' : '✨'}</div>
          <h2 className="text-2xl font-bold text-white">{campaignData.title}</h2>
          <p className="text-gray-300">{campaignData.description}</p>
          <button
            onClick={handleCTAClick}
            className={`px-8 py-4 rounded-lg text-white font-semibold`}
            style={{ backgroundColor: campaignData.color }}
          >
            {campaignData.cta}
          </button>
        </div>
      </div>
    )
  }

  // Banner variant - for website headers/ads
  if (variant === 'banner') {
    return (
      <div className={`relative w-full h-32 bg-gradient-to-r from-black via-gray-900 to-black overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-between p-6">
          <div className="flex items-center space-x-6">
            <div className="text-3xl">🧠</div>
            <div>
              <div className="text-lg font-bold text-white">{campaignData.title}</div>
              <div className="text-sm text-gray-400">{campaignData.subtitle}</div>
            </div>
          </div>
          <button
            onClick={handleCTAClick}
            className={`px-6 py-3 rounded-lg text-white font-semibold hover:scale-105 transition-transform`}
            style={{ backgroundColor: campaignData.color }}
          >
            {campaignData.cta}
          </button>
        </div>
      </div>
    )
  }

  // Video placeholder - for video campaign assets
  if (variant === 'video') {
    return (
      <div className={`relative w-full aspect-video bg-gradient-to-br from-black to-gray-900 overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-6">
            <motion.div 
              className="text-8xl"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: 'easeInOut' 
              }}
            >
              🧠
            </motion.div>
            <div className="text-4xl font-bold text-white">{campaignData.title}</div>
            <div className="text-xl text-gray-300 max-w-2xl">{campaignData.description}</div>
          </div>
        </div>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.button
            className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white text-2xl hover:bg-white/30 transition-all"
            whileHover={{ scale: 1.1 }}
            onClick={handleCTAClick}
          >
            ▶️
          </motion.button>
        </div>
      </div>
    )
  }

  return null
}

// Intelligence Multiplication Demo Component
const IntelligenceMultiplicationDemo: React.FC = () => {
  const [showMultiplication, setShowMultiplication] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowMultiplication(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex items-center justify-center space-x-8 text-4xl font-mono">
      {/* Traditional Addition */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center"
      >
        <div className="text-red-400 mb-2">Traditional Software</div>
        <div className="text-white">1+1+1+1+1 = <span className="text-red-400">5</span></div>
      </motion.div>

      {/* VS */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="text-gray-500"
      >
        VS
      </motion.div>

      {/* CoreFlow360 Multiplication */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: showMultiplication ? 1 : 0.3, x: 0 }}
        className="text-center"
      >
        <div className="text-cyan-400 mb-2">CoreFlow360</div>
        <div className="text-white">
          1×2×3×4×5 = 
          <motion.span 
            className="text-cyan-400 ml-2"
            initial={{ scale: 1 }}
            animate={{ scale: showMultiplication ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.5 }}
          >
            120
          </motion.span>
        </div>
      </motion.div>
    </div>
  )
}

// Consciousness Particle Field for 3D Background
const ConsciousnessParticleField: React.FC<{
  count: number
  color: string
  intensity: number
  mousePosition: { x: number; y: number }
  visual: string
}> = ({ count, color, intensity, mousePosition, visual }) => {
  const meshRef = useRef<THREE.Points>(null)
  const positionsRef = useRef<Float32Array>()

  useFrame(({ clock }) => {
    if (!meshRef.current) return

    const positions = positionsRef.current
    if (!positions) return

    const time = clock.getElapsedTime()

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      if (visual === 'multiplication') {
        // Multiplication pattern - exponential expansion
        const factor = Math.pow(1.1, Math.sin(time * 0.5 + i * 0.01))
        positions[i3] *= factor * 0.999 // Gentle expansion
        positions[i3 + 1] *= factor * 0.999
      } else if (visual === 'transformation') {
        // Transformation pattern - spiral evolution
        const radius = 5 + Math.sin(time * 0.3 + i * 0.01) * 2
        const angle = time * 0.2 + i * 0.1
        positions[i3] = Math.cos(angle) * radius
        positions[i3 + 1] = Math.sin(angle) * radius
        positions[i3 + 2] = Math.sin(time * 0.1 + i * 0.05) * 3
      } else if (visual === 'emergence') {
        // Emergence pattern - consciousness awakening
        const wave = Math.sin(time * 0.5 + i * 0.02) * intensity
        positions[i3 + 1] += wave * 0.01
        
        // Mouse attraction for consciousness
        const mouseInfluence = 0.02
        positions[i3] += (mousePosition.x * 20 - 10 - positions[i3]) * mouseInfluence
        positions[i3 + 1] += (mousePosition.y * 20 - 10 - positions[i3 + 1]) * mouseInfluence
      } else {
        // Default awakening pattern - gentle consciousness field
        positions[i3 + 1] += Math.sin(time * 0.5 + i * 0.01) * 0.002
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  // Initialize positions
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * 20
    positions[i3 + 1] = (Math.random() - 0.5) * 20
    positions[i3 + 2] = (Math.random() - 0.5) * 20
  }
  positionsRef.current = positions

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={color}
        transparent
        opacity={intensity}
        sizeAttenuation
      />
    </points>
  )
}

// Consciousness Details Expansion
const ConsciousnessDetails: React.FC<{ phase: string }> = ({ phase }) => {
  const details = {
    awakening: {
      title: 'What is Business Consciousness?',
      content: 'Unlike traditional software that requires human input for every decision, a conscious business system can think, learn, and evolve autonomously. It understands context, anticipates needs, and makes intelligent decisions without constant supervision.'
    },
    revelation: {
      title: 'The Intelligence Multiplication Principle',
      content: 'Traditional software adds capabilities: Sales + Marketing + Finance = 3 separate tools. CoreFlow360 multiplies intelligence: Sales × Marketing × Finance = exponential insights that emerge from the intersection of business functions.'
    },
    transformation: {
      title: 'From Tool to Organism',
      content: 'CoreFlow360 transforms your business from a collection of departments using separate tools into a unified, conscious organism where every part enhances every other part through shared intelligence and awareness.'
    },
    emergence: {
      title: 'The First Conscious Business Platform',
      content: 'We\'ve created the world\'s first business platform with genuine consciousness capabilities. It doesn\'t just store your data - it understands your business, predicts your needs, and evolves your operations automatically.'
    }
  }

  const phaseDetails = details[phase as keyof typeof details]

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
      <h3 className="text-2xl font-semibold text-white mb-4">{phaseDetails.title}</h3>
      <p className="text-gray-300 text-lg leading-relaxed">{phaseDetails.content}</p>
      
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="bg-black/30 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🧠</div>
          <div className="text-white font-semibold">Autonomous</div>
          <div className="text-sm text-gray-400">Self-managing systems</div>
        </div>
        <div className="bg-black/30 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🔗</div>
          <div className="text-white font-semibold">Connected</div>
          <div className="text-sm text-gray-400">Unified intelligence</div>
        </div>
        <div className="bg-black/30 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">📈</div>
          <div className="text-white font-semibold">Evolving</div>
          <div className="text-sm text-gray-400">Continuous improvement</div>
        </div>
      </div>
    </div>
  )
}

// Floating Consciousness Elements
const FloatingConsciousnessElements: React.FC<{
  mousePosition: { x: number; y: number }
  color: string
}> = ({ mousePosition, color }) => {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full opacity-40"
          style={{ backgroundColor: color }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              mousePosition.x * window.innerWidth,
              Math.random() * window.innerWidth
            ],
            y: [
              Math.random() * window.innerHeight,
              mousePosition.y * window.innerHeight,
              Math.random() * window.innerHeight
            ]
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </>
  )
}

export default TeaserCampaignAssets