'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  pulseOffset: number
}

export function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()

    // Initialize particles with better distribution
    const particleCount = Math.min(
      100,
      Math.floor((window.innerWidth * window.innerHeight) / 12000)
    )
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 2.5 + 1.5,
      opacity: 0.6 + Math.random() * 0.4,
      pulseOffset: Math.random() * Math.PI * 2,
    }))

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    const animate = () => {
      // Semi-transparent background for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const time = Date.now() * 0.001

      particlesRef.current.forEach((particle, i) => {
        // Update position with slight mouse influence
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 200) {
          particle.vx += dx * 0.00002
          particle.vy += dy * 0.00002
        }

        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around edges instead of bouncing
        if (particle.x < -10) particle.x = canvas.width + 10
        if (particle.x > canvas.width + 10) particle.x = -10
        if (particle.y < -10) particle.y = canvas.height + 10
        if (particle.y > canvas.height + 10) particle.y = -10

        // Slow down particles
        particle.vx *= 0.999
        particle.vy *= 0.999

        // Dynamic opacity with pulsing
        const pulseOpacity = particle.opacity + Math.sin(time + particle.pulseOffset) * 0.2

        // Draw particle with enhanced glow
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 4
        )
        gradient.addColorStop(0, `rgba(139, 92, 246, ${pulseOpacity})`)
        gradient.addColorStop(0.3, `rgba(59, 130, 246, ${pulseOpacity * 0.8})`)
        gradient.addColorStop(0.6, `rgba(6, 182, 212, ${pulseOpacity * 0.5})`)
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0)')

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Enhanced glowing core
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius * 0.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${pulseOpacity * 0.6})`
        ctx.fill()

        // Draw connections with gradient
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 180) {
            const connectionOpacity = (1 - distance / 180) * 0.4

            const connectionGradient = ctx.createLinearGradient(
              particle.x,
              particle.y,
              otherParticle.x,
              otherParticle.y
            )
            connectionGradient.addColorStop(0, `rgba(139, 92, 246, ${connectionOpacity})`)
            connectionGradient.addColorStop(0.5, `rgba(59, 130, 246, ${connectionOpacity * 0.9})`)
            connectionGradient.addColorStop(1, `rgba(6, 182, 212, ${connectionOpacity * 0.8})`)

            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = connectionGradient
            ctx.lineWidth = 1.5
            ctx.stroke()
          }
        })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />

      {/* Canvas for neural network */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10"
        style={{
          mixBlendMode: 'screen',
          opacity: 0.8,
        }}
      />

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 z-20">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-cyan-950/20 opacity-40" />
      </div>

      {/* Floating orbs with better visibility */}
      <div className="absolute inset-0 z-5">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-20 left-10 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 5,
          }}
          className="absolute right-10 bottom-20 h-80 w-80 rounded-full bg-cyan-600/30 blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/30 blur-2xl"
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 z-25 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Animated data streams */}
      <div className="absolute inset-0 z-15 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px w-96"
            style={{
              background: `linear-gradient(90deg, transparent, ${i % 2 ? '#8b5cf6' : '#06b6d4'}, transparent)`,
              top: `${20 + i * 15}%`,
              left: '-384px',
              opacity: 0.6,
            }}
            animate={{
              x: [0, typeof window !== 'undefined' ? window.innerWidth + 768 : 2000],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 2,
            }}
          />
        ))}
      </div>
    </div>
  )
}
