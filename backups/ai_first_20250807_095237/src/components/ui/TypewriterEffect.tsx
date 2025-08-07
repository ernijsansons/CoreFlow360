'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TypewriterEffectProps {
  words: string[]
  className?: string
  speed?: number
  deleteSpeed?: number
  delayBetweenWords?: number
  loop?: boolean
}

export function TypewriterEffect({
  words,
  className = '',
  speed = 100,
  deleteSpeed = 50,
  delayBetweenWords = 2000,
  loop = true
}: TypewriterEffectProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const currentWord = words[currentWordIndex]
    
    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false)
        setIsDeleting(true)
      }, delayBetweenWords)
      
      return () => clearTimeout(pauseTimer)
    }

    const typeTimer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentWord.length) {
          setCurrentText(currentWord.substring(0, currentText.length + 1))
        } else {
          // Finished typing current word
          if (loop || currentWordIndex < words.length - 1) {
            setIsPaused(true)
          }
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.substring(0, currentText.length - 1))
        } else {
          // Finished deleting
          setIsDeleting(false)
          setCurrentWordIndex((prev) => 
            loop ? (prev + 1) % words.length : Math.min(prev + 1, words.length - 1)
          )
        }
      }
    }, isDeleting ? deleteSpeed : speed)

    return () => clearTimeout(typeTimer)
  }, [currentText, currentWordIndex, isDeleting, isPaused, words, speed, deleteSpeed, delayBetweenWords, loop])

  return (
    <span className={`inline-flex ${className}`}>
      <span className="relative">
        {currentText}
        <motion.span
          className="inline-block w-[3px] h-[1.2em] bg-violet-500 ml-1"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        />
      </span>
    </span>
  )
}