'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function ConsciousnessLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="relative">
        {/* Neural network loader animation */}
        <svg width="200" height="200" viewBox="0 0 200 200" className="animate-pulse">
          {/* Central node */}
          <motion.circle
            cx="100"
            cy="100"
            r="8"
            fill="#7c3aed"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Orbital nodes */}
          {[0, 72, 144, 216, 288].map((angle, i) => {
            const x = 100 + 50 * Math.cos((angle * Math.PI) / 180)
            const y = 100 + 50 * Math.sin((angle * Math.PI) / 180)
            return (
              <g key={angle}>
                <motion.line
                  x1="100"
                  y1="100"
                  x2={x}
                  y2={y}
                  stroke="#2563eb"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity, repeatDelay: 1 }}
                />
                <motion.circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="#2563eb"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.2 + 0.5,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                  }}
                />
              </g>
            )
          })}
        </svg>

        {/* Loading text */}
        <motion.div
          className="absolute inset-x-0 -bottom-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-consciousness-neural text-sm">Awakening consciousness...</p>
        </motion.div>
      </div>
    </div>
  )
}
