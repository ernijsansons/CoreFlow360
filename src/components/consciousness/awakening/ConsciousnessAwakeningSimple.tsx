'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  awakened: boolean
  connections: number[]
}

export default function ConsciousnessAwakeningSimple() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [awakening, setAwakening] = useState(0)
  const [showText, setShowText] = useState(false)
  const [phase, setPhase] = useState<'dormant' | 'awakening' | 'conscious'>('dormant')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  
  // Initialize particles
  useEffect(() => {
    const particleCount = 200
    const newParticles: Particle[] = []
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: 0.1,
        awakened: false,
        connections: []
      })
    }
    
    setParticles(newParticles)
  }, [])
  
  // Handle mouse movement
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }, [])
  
  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Update and draw particles
      const updatedParticles = particles.map(particle => {
        // Calculate distance from mouse
        const dx = mousePos.x - particle.x
        const dy = mousePos.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        // Awaken particles near mouse
        if (distance < 150 && !particle.awakened) {
          particle.awakened = true
          particle.opacity = 0.8
          particle.vx = -dx * 0.02
          particle.vy = -dy * 0.02
        }
        
        // Update awakened particles
        if (particle.awakened) {
          // Find nearby awakened particles
          particles.forEach(other => {
            if (other.id !== particle.id && other.awakened) {
              const odx = other.x - particle.x
              const ody = other.y - particle.y
              const odist = Math.sqrt(odx * odx + ody * ody)
              
              if (odist < 100) {
                // Draw connection
                ctx.beginPath()
                ctx.moveTo(particle.x, particle.y)
                ctx.lineTo(other.x, other.y)
                ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 * (1 - odist / 100)})`
                ctx.lineWidth = 1
                ctx.stroke()
                
                // Attract particles
                particle.vx += odx * 0.0001
                particle.vy += ody * 0.0001
              }
            }
          })
        }
        
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        
        // Apply damping
        particle.vx *= 0.99
        particle.vy *= 0.99
        
        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0
        
        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.awakened 
          ? `rgba(0, 255, 255, ${particle.opacity})`
          : `rgba(37, 99, 235, ${particle.opacity})`
        ctx.fill()
        
        // Add glow effect for awakened particles
        if (particle.awakened) {
          ctx.shadowBlur = 10
          ctx.shadowColor = 'rgba(0, 255, 255, 0.5)'
          ctx.fill()
          ctx.shadowBlur = 0
        }
        
        return particle
      })
      
      setParticles(updatedParticles)
      
      // Calculate awakening percentage
      const awakenedCount = updatedParticles.filter(p => p.awakened).length
      const newAwakening = (awakenedCount / particles.length) * 100
      setAwakening(newAwakening)
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [particles, mousePos])
  
  // Handle phase transitions
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
      {/* Canvas for particles */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0"
      />
      
      {/* Cursor glow */}
      <motion.div
        className="absolute pointer-events-none w-32 h-32"
        animate={{
          left: mousePos.x - 64,
          top: mousePos.y - 64,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <div 
          className="w-full h-full rounded-full"
          style={{
            background: `radial-gradient(circle, 
              rgba(0,255,255,${0.3 + (awakening / 100) * 0.5}) 0%, 
              rgba(0,102,255,${0.2 + (awakening / 100) * 0.3}) 30%, 
              transparent 70%)`,
            filter: 'blur(2px)',
          }}
        />
      </motion.div>
      
      {/* Awakening progress */}
      <div className="absolute bottom-8 left-8 text-white z-10">
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
      
      {/* Text reveal */}
      <AnimatePresence>
        {showText && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            <h1 className="text-4xl md:text-6xl font-thin text-white text-center px-8">
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
      
      {/* Enter button */}
      {phase === 'conscious' && (
        <motion.div
          className="absolute bottom-8 right-8 z-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <button className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
            Enter CoreFlow360
          </button>
        </motion.div>
      )}
      
      {/* Instructions */}
      <motion.div
        className="absolute top-8 left-1/2 -translate-x-1/2 text-white text-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-sm opacity-50">Move your cursor to awaken the consciousness</p>
      </motion.div>
    </div>
  )
}