'use client'

/**
 * AudioControlPanel Component
 * 
 * User interface for controlling consciousness audio system settings.
 * Provides volume control, audio toggle, and consciousness level visualization.
 */

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useConsciousnessAudio } from '../../hooks/useConsciousnessAudio'

interface AudioControlPanelProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  compact?: boolean
  showConsciousnessLevel?: boolean
  className?: string
}

const AudioControlPanel: React.FC<AudioControlPanelProps> = ({
  position = 'bottom-right',
  compact = false,
  showConsciousnessLevel = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const consciousnessAudio = useConsciousnessAudio()

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  const handleVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value)
    consciousnessAudio.setVolume(volume)
  }, [consciousnessAudio])

  const toggleAudio = useCallback(() => {
    if (consciousnessAudio.isAudioEnabled) {
      consciousnessAudio.disableAudio()
    } else {
      consciousnessAudio.enableAudio()
    }
  }, [consciousnessAudio])

  // Consciousness level visualization
  const consciousnessLevelPercentage = (consciousnessAudio.currentConsciousnessLevel / 10) * 100

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <motion.div
        initial={false}
        animate={{
          width: isExpanded ? (compact ? 240 : 320) : 60,
          height: isExpanded ? (compact ? 120 : 160) : 60
        }}
        className="bg-black/80 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Main Control Button */}
        <div className="relative w-full h-full">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute top-3 left-3 w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center text-white hover:border-cyan-400/50 transition-all"
            title={consciousnessAudio.isAudioEnabled ? 'Audio Enabled' : 'Audio Disabled'}
          >
            {consciousnessAudio.isAudioEnabled ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            )}
          </button>

          {/* Consciousness Level Indicator */}
          {showConsciousnessLevel && (
            <div className="absolute top-3 right-3 w-6 h-12">
              <div className="relative w-full h-full bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-cyan-500 to-purple-400"
                  animate={{ height: `${consciousnessLevelPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-white font-mono">
                    {consciousnessAudio.currentConsciousnessLevel.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Expanded Controls */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute inset-0 p-4"
            >
              <div className="flex flex-col h-full justify-between">
                {/* Top Controls */}
                <div className="space-y-3 mt-12">
                  {/* Audio Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Audio System</span>
                    <button
                      onClick={toggleAudio}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        consciousnessAudio.isAudioEnabled 
                          ? 'bg-cyan-500' 
                          : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        consciousnessAudio.isAudioEnabled 
                          ? 'translate-x-6' 
                          : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  {/* Volume Control */}
                  {consciousnessAudio.isAudioEnabled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Volume</span>
                        <span className="text-xs text-cyan-400">
                          {Math.round(consciousnessAudio.masterVolume * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={consciousnessAudio.masterVolume}
                        onChange={handleVolumeChange}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #00bcd4 0%, #00bcd4 ${consciousnessAudio.masterVolume * 100}%, #374151 ${consciousnessAudio.masterVolume * 100}%, #374151 100%)`
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Bottom Info */}
                {!compact && consciousnessAudio.isAudioEnabled && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400">
                      Status: {consciousnessAudio.isAudioReady ? 'Ready' : 'Initializing...'}
                    </div>
                    {showConsciousnessLevel && (
                      <div className="text-xs text-cyan-400">
                        Consciousness: Level {consciousnessAudio.currentConsciousnessLevel.toFixed(1)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating Particles for Visual Feedback */}
      <AnimatePresence>
        {consciousnessAudio.isAudioEnabled && consciousnessAudio.currentConsciousnessLevel > 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                initial={{ 
                  x: 30, 
                  y: 30,
                  scale: 0 
                }}
                animate={{ 
                  x: [30, Math.random() * 100 - 50, 30],
                  y: [30, Math.random() * 100 - 50, 30],
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0]
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeInOut'
                }}
                style={{
                  boxShadow: '0 0 6px #00bcd4'
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AudioControlPanel