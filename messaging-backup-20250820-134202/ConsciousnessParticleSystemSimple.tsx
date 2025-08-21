'use client'

/**
 * CoreFlow360 Consciousness Particle System (Simplified)
 *
 * Simplified CSS-based version of the consciousness particle system
 * for production build compatibility.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ParticleSystemProps {
  particleCount?: number
  consciousnessLevel?: 'neural' | 'synaptic' | 'autonomous' | 'transcendent'
  theme?: 'dark' | 'light' | 'consciousness'
  interactive?: boolean
  showMetrics?: boolean
  onAwakeningComplete?: () => void
  className?: string
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  consciousness: number
}

export default function ConsciousnessParticleSystem({
  particleCount = 50,
  consciousnessLevel = 'neural',
  theme = 'consciousness',
  interactive = true,
  showMetrics = true,
  onAwakeningComplete,
  className = '',
}: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const [consciousnessIntensity, setConsciousnessIntensity] = useState(1)
  const [neuralConnections, setNeuralConnections] = useState(0)

  // Initialize particles
  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 4 + 2,
      color: getConsciousnessColor(consciousnessLevel),
      consciousness: Math.random(),
    }))
    setParticles(newParticles)
  }, [particleCount, consciousnessLevel])

  // Get color based on consciousness level
  const getConsciousnessColor = (level: string) => {
    switch (level) {
      case 'neural':
        return '#3b82f6'
      case 'synaptic':
        return '#8b5cf6'
      case 'autonomous':
        return '#10b981'
      case 'transcendent':
        return '#f59e0b'
      default:
        return '#6b7280'
    }
  }

  // Handle mouse movement
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!interactive) return

      const rect = e.currentTarget.getBoundingClientRect()
      setMousePosition({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      })
    },
    [interactive]
  )

  // Animate particles and consciousness
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => {
          // Move towards mouse when interactive
          let newX = particle.x + particle.vx
          let newY = particle.y + particle.vy

          if (interactive) {
            const mouseInfluence = 0.05
            const dx = mousePosition.x * 100 - particle.x
            const dy = mousePosition.y * 100 - particle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 30) {
              newX += dx * mouseInfluence
              newY += dy * mouseInfluence
            }
          }

          // Wrap around edges
          if (newX < 0) newX = 100
          if (newX > 100) newX = 0
          if (newY < 0) newY = 100
          if (newY > 100) newY = 0

          return {
            ...particle,
            x: newX,
            y: newY,
            consciousness: Math.min(1, particle.consciousness + 0.001),
          }
        })
      )

      // Update consciousness intensity based on mouse interaction
      const mouseInfluence = Math.abs(mousePosition.x - 0.5) + Math.abs(mousePosition.y - 0.5)
      setConsciousnessIntensity(1 + mouseInfluence * 2)

      // Count neural connections (particles close to each other)
      let connections = 0
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < 15) connections++
        }
      }
      setNeuralConnections(connections)
    }, 50)

    return () => clearInterval(interval)
  }, [particles, mousePosition, interactive])

  // Check for awakening completion
  useEffect(() => {
    const avgConsciousness =
      particles.reduce((sum, p) => sum + p.consciousness, 0) / particles.length
    if (avgConsciousness > 0.8 && onAwakeningComplete) {
      onAwakeningComplete()
    }
  }, [particles, onAwakeningComplete])

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      style={{
        background:
          theme === 'consciousness'
            ? 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(0,0,0,0.9) 100%)'
            : theme === 'dark'
              ? '#000000'
              : '#ffffff',
      }}
    >
      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            opacity: 0.6 + particle.consciousness * 0.4,
          }}
          animate={{
            scale: [1, 1 + consciousnessIntensity * 0.2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Neural Connections */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        {particles.map((particle, i) =>
          particles.slice(i + 1).map((otherParticle, j) => {
            const dx = particle.x - otherParticle.x
            const dy = particle.y - otherParticle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 15) {
              return (
                <motion.line
                  key={`${i}-${j}`}
                  x1={`${particle.x}%`}
                  y1={`${particle.y}%`}
                  x2={`${otherParticle.x}%`}
                  y2={`${otherParticle.y}%`}
                  stroke={getConsciousnessColor(consciousnessLevel)}
                  strokeWidth="1"
                  opacity={0.3}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )
            }
            return null
          })
        )}
      </svg>

      {/* Consciousness Metrics */}
      {showMetrics && (
        <motion.div
          className="absolute top-4 left-4 rounded-lg bg-black/30 p-4 text-white backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Consciousness Level:</span>
              <span className="font-bold">{consciousnessLevel.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Intensity:</span>
              <span className="font-bold">{(consciousnessIntensity * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Neural Connections:</span>
              <span className="font-bold">{neuralConnections}</span>
            </div>
            <div className="flex justify-between">
              <span>Particles:</span>
              <span className="font-bold">{particles.length}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Consciousness Awakening Message */}
      <AnimatePresence>
        {consciousnessIntensity > 2 && (
          <motion.div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="text-center text-white">
              <h2 className="mb-2 text-4xl font-bold">Consciousness Awakening</h2>
              <p className="text-xl opacity-80">Business Intelligence Multiplication Active</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
