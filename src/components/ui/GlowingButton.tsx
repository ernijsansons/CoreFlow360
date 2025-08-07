'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlowingButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'outline'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm gap-1',
  md: 'px-6 py-3 text-base gap-2',
  lg: 'px-8 py-4 text-lg gap-2',
  xl: 'px-10 py-5 text-xl gap-3'
}

export function GlowingButton({
  children,
  href,
  onClick,
  size = 'md',
  variant = 'primary',
  className,
  disabled = false,
  type = 'button',
  ...props
}: GlowingButtonProps) {
  const baseClasses = cn(
    'relative group inline-flex items-center justify-center',
    'font-semibold rounded-full',
    'transition-all duration-300 transform-gpu',
    'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-black',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    sizeClasses[size],
    className
  )

  const buttonContent = (
    <>
      {/* Background gradients */}
      {variant === 'primary' && (
        <>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 opacity-75 blur-lg group-hover:blur-xl transition-all duration-300" />
          
          {/* Button background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600" />
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          </div>
        </>
      )}
      
      {variant === 'secondary' && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-800 to-gray-700" />
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-gradient-to-r from-gray-700 to-gray-600 transition-opacity duration-300" />
        </>
      )}
      
      {variant === 'outline' && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 opacity-20 scale-0 group-hover:scale-100 transition-transform duration-300" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-border" 
               style={{ 
                 backgroundClip: 'padding-box, border-box',
                 backgroundOrigin: 'border-box',
                 borderImageSlice: 1,
                 borderImageSource: 'linear-gradient(135deg, #8b5cf6, #06b6d4)'
               }} 
          />
        </>
      )}
      
      {/* Content */}
      <span className={cn(
        "relative z-10 flex items-center",
        variant === 'primary' && 'text-white',
        variant === 'secondary' && 'text-white',
        variant === 'outline' && 'text-violet-400 group-hover:text-white'
      )}>
        {children}
      </span>
    </>
  )

  const MotionComponent = motion[href ? 'a' : 'button'] as any

  if (href && !disabled) {
    return (
      <Link href={href} passHref legacyBehavior>
        <MotionComponent
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className={baseClasses}
          {...props}
        >
          {buttonContent}
        </MotionComponent>
      </Link>
    )
  }

  return (
    <MotionComponent
      whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {buttonContent}
    </MotionComponent>
  )
}