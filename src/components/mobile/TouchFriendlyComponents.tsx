/**
 * CoreFlow360 - Touch-Friendly Mobile Components
 * Optimized UI components for mobile devices with touch interactions
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { 
  ChevronRight,
  X,
  Check,
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  MoreVertical,
  Star,
  Heart,
  Share,
  ArrowLeft,
  Plus,
  Minus
} from 'lucide-react'

// Mobile Card Component
interface MobileCardProps {
  children: React.ReactNode
  className?: string
  onTap?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  swipeActions?: {
    left?: { icon: any; color: string; action: () => void }
    right?: { icon: any; color: string; action: () => void }
  }
}

export function MobileCard({ 
  children, 
  className = '', 
  onTap, 
  onSwipeLeft, 
  onSwipeRight,
  swipeActions 
}: MobileCardProps) {
  const [isPressed, setIsPressed] = useState(false)
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5])
  const scale = useTransform(x, [-150, 0, 150], [0.9, 1, 0.9])

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 100
    
    if (info.offset.x > threshold && onSwipeRight) {
      onSwipeRight()
    } else if (info.offset.x < -threshold && onSwipeLeft) {
      onSwipeLeft()
    }
    
    x.set(0)
  }

  return (
    <motion.div
      className={`relative bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-4 ${className}`}
      style={{ x, opacity, scale }}
      drag="x"
      dragConstraints={{ left: -150, right: 150 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      onTapStart={() => setIsPressed(true)}
      onTap={() => {
        setIsPressed(false)
        onTap?.()
      }}
      onTapCancel={() => setIsPressed(false)}
      whileTap={{ scale: 0.98 }}
      animate={{ 
        backgroundColor: isPressed ? 'rgba(17, 24, 39, 0.8)' : 'rgba(17, 24, 39, 0.6)' 
      }}
    >
      {/* Swipe Actions Background */}
      {swipeActions && (
        <>
          {swipeActions.left && (
            <motion.div 
              className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full ${swipeActions.left.color}`}
              style={{ 
                opacity: useTransform(x, [0, 100], [0, 1]),
                scale: useTransform(x, [0, 100], [0.5, 1])
              }}
            >
              <swipeActions.left.icon className="w-5 h-5 text-white" />
            </motion.div>
          )}
          
          {swipeActions.right && (
            <motion.div 
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full ${swipeActions.right.color}`}
              style={{ 
                opacity: useTransform(x, [-100, 0], [1, 0]),
                scale: useTransform(x, [-100, 0], [1, 0.5])
              }}
            >
              <swipeActions.right.icon className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </>
      )}
      
      {children}
    </motion.div>
  )
}

// Touch-Friendly Button
interface TouchButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export function TouchButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  className = ''
}: TouchButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white',
    secondary: 'bg-gray-800 border border-gray-700 text-white',
    ghost: 'bg-transparent text-gray-300 hover:bg-gray-800',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[44px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]'
  }

  return (
    <motion.button
      className={`
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        rounded-xl font-semibold transition-all duration-200 
        active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  )
}

// Bottom Sheet Component
interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  snapPoints?: number[]
}

export function BottomSheet({ 
  isOpen, 
  onClose, 
  children, 
  title,
  snapPoints = [0.5, 0.9] 
}: BottomSheetProps) {
  const [snapPoint, setSnapPoint] = useState(snapPoints[0])
  const y = useMotionValue(0)

  const handleDragEnd = (event: any, info: any) => {
    const velocity = info.velocity.y
    const offset = info.offset.y
    
    if (velocity > 500 || offset > 200) {
      onClose()
    } else {
      // Snap to closest snap point
      const targetSnap = snapPoints.reduce((prev, curr) => {
        return Math.abs(curr - (1 - offset / window.innerHeight)) < Math.abs(prev - (1 - offset / window.innerHeight)) 
          ? curr 
          : prev
      })
      setSnapPoint(targetSnap)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: `${(1 - snapPoint) * 100}%` }}
            exit={{ y: '100%' }}
            style={{ y }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 rounded-t-3xl shadow-2xl"
            style={{ height: '100vh' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1 bg-gray-600 rounded-full" />
            </div>
            
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Mobile Search Bar
interface MobileSearchBarProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  showFilter?: boolean
  onFilterClick?: () => void
}

export function MobileSearchBar({
  placeholder = 'Search...',
  value,
  onChange,
  onFocus,
  onBlur,
  showFilter = false,
  onFilterClick
}: MobileSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="relative">
      <motion.div
        animate={{
          scale: isFocused ? 1.02 : 1,
          borderColor: isFocused ? '#8b5cf6' : '#374151'
        }}
        className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-2xl"
      >
        <Search className={`w-5 h-5 transition-colors ${isFocused ? 'text-violet-400' : 'text-gray-400'}`} />
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true)
            onFocus?.()
          }}
          onBlur={() => {
            setIsFocused(false)
            onBlur?.()
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-base"
        />
        
        {value && (
          <button
            onClick={() => onChange('')}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {showFilter && (
          <button
            onClick={onFilterClick}
            className="p-1 text-gray-400 hover:text-violet-400 transition-colors"
          >
            <Filter className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </div>
  )
}

// Expandable List Item
interface ExpandableListItemProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  defaultExpanded?: boolean
  icon?: any
}

export function ExpandableListItem({
  title,
  subtitle,
  children,
  defaultExpanded = false,
  icon: Icon
}: ExpandableListItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="border border-gray-800 rounded-2xl overflow-hidden bg-gray-900/60 backdrop-blur-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/50 transition-colors min-h-[64px]"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-gray-800 rounded-lg">
              <Icon className="w-5 h-5 text-gray-300" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-gray-800">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Touch-Friendly Toggle Switch
interface TouchToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export function TouchToggle({ checked, onChange, label, disabled = false }: TouchToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <motion.div
        className={`relative w-14 h-8 rounded-full transition-colors ${
          checked ? 'bg-gradient-to-r from-violet-500 to-cyan-500' : 'bg-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        <motion.div
          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
          animate={{
            x: checked ? 28 : 4
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.div>
      
      {label && (
        <span className={`text-white ${disabled ? 'opacity-50' : ''}`}>
          {label}
        </span>
      )}
    </label>
  )
}

// Mobile Counter Component
interface MobileCounterProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
}

export function MobileCounter({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label
}: MobileCounterProps) {
  const increment = () => {
    const newValue = Math.min(value + step, max)
    onChange(newValue)
  }

  const decrement = () => {
    const newValue = Math.max(value - step, min)
    onChange(newValue)
  }

  return (
    <div className="flex items-center gap-4">
      {label && <span className="text-white font-medium">{label}</span>}
      
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={decrement}
          disabled={value <= min}
          className="w-12 h-12 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="w-5 h-5 text-white" />
        </motion.button>
        
        <div className="min-w-[3rem] text-center">
          <span className="text-xl font-bold text-white">{value}</span>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={increment}
          disabled={value >= max}
          className="w-12 h-12 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5 text-white" />
        </motion.button>
      </div>
    </div>
  )
}

// Pull to Refresh Component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const y = useMotionValue(0)
  
  const handleDrag = (event: any, info: any) => {
    if (info.offset.y > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(info.offset.y, 100))
    }
  }

  const handleDragEnd = async (event: any, info: any) => {
    if (info.offset.y > 80 && window.scrollY === 0) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{ y }}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 60 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center bg-gray-900/60 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              {isRefreshing ? (
                <>
                  <div className="w-5 h-5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                  <span className="text-violet-400 text-sm">Refreshing...</span>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ rotate: pullDistance > 80 ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-violet-400" />
                  </motion.div>
                  <span className="text-violet-400 text-sm">
                    {pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {children}
    </motion.div>
  )
}