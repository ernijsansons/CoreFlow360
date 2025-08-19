/**
 * CoreFlow360 - Accessible UI Components
 * WCAG 2.1 AAA compliant components with i18n support
 */

'use client'

import { useState, useRef, useEffect, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  ChevronDown,
  Eye,
  EyeOff,
  Search,
  Calendar,
  Clock,
} from 'lucide-react'
import {
  useFocusManagement,
  useAriaLiveRegion,
  announceToScreenReader,
  KeyboardCodes,
  handleArrowKeyNavigation,
} from '@/lib/accessibility/accessibility-utils'
import { useI18n, TranslationKey } from '@/lib/i18n/i18n-system'

// Accessible Button Component
interface AccessibleButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  loadingText?: TranslationKey
  ariaLabel?: string
  ariaDescribedBy?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      loadingText = 'common.loading',
      ariaLabel,
      ariaDescribedBy,
      onClick,
      type = 'button',
      className = '',
    },
    ref
  ) => {
    const { t, languageConfig } = useI18n()

    const variants = {
      primary: 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white',
      danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
      ghost: 'bg-transparent hover:bg-gray-700 focus:ring-gray-500 text-gray-300',
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm min-h-[44px]',
      md: 'px-4 py-2 text-base min-h-[44px]',
      lg: 'px-6 py-3 text-lg min-h-[48px]',
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={loading}
        className={` ${variants[variant]} ${sizes[size]} inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${languageConfig.direction === 'rtl' ? 'flex-row-reverse' : ''} ${className} `}
      >
        {loading ? (
          <>
            <div
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
            <span className="sr-only">{t(loadingText)}</span>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
AccessibleButton.displayName = 'AccessibleButton'

// Accessible Input Component
interface AccessibleInputProps {
  label: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
  autoComplete?: string
  maxLength?: number
  pattern?: string
  id?: string
  className?: string
}

export function AccessibleInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  autoComplete,
  maxLength,
  pattern,
  id: providedId,
  className = '',
}: AccessibleInputProps) {
  const { t, languageConfig } = useI18n()
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputId = providedId || `input-${Math.random().toString(36).substr(2, 9)}`
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label
        htmlFor={inputId}
        className={`block text-sm font-medium text-white ${
          required ? "after:ml-1 after:text-red-400 after:content-['*']" : ''
        }`}
      >
        {label}
      </label>

      {/* Input Container */}
      <div className="relative">
        <input
          id={inputId}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          pattern={pattern}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            [error ? errorId : null, helperText ? helperId : null].filter(Boolean).join(' ') ||
            undefined
          }
          className={`w-full rounded-lg border bg-gray-800 px-4 py-3 text-white placeholder-gray-400 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-violet-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : isFocused
                ? 'border-violet-500'
                : 'border-gray-700 hover:border-gray-600'
          } ${type === 'password' ? (languageConfig.direction === 'rtl' ? 'pl-12' : 'pr-12') : ''} `}
        />

        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute top-1/2 -translate-y-1/2 ${
              languageConfig.direction === 'rtl' ? 'left-3' : 'right-3'
            } rounded p-1 text-gray-400 transition-colors hover:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none`}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>

      {/* Helper Text */}
      {helperText && (
        <p id={helperId} className="text-sm text-gray-400">
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <div
          id={errorId}
          className="flex items-center gap-2 text-sm text-red-400"
          role="alert"
          aria-live="polite"
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}
    </div>
  )
}

// Accessible Select Component
interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface AccessibleSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  id?: string
  className?: string
}

export function AccessibleSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required = false,
  disabled = false,
  id: providedId,
  className = '',
}: AccessibleSelectProps) {
  const { t, languageConfig } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const { trapFocus, restoreFocus } = useFocusManagement()

  const selectId = providedId || `select-${Math.random().toString(36).substr(2, 9)}`
  const listboxId = `${selectId}-listbox`
  const errorId = `${selectId}-error`

  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    if (isOpen && listboxRef.current) {
      const cleanup = trapFocus(listboxRef.current)
      return cleanup
    }
  }, [isOpen, trapFocus])

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === KeyboardCodes.ENTER || event.key === KeyboardCodes.SPACE) {
        event.preventDefault()
        setIsOpen(true)
      }
      return
    }

    const enabledOptions = options.filter((option) => !option.disabled)

    switch (event.key) {
      case KeyboardCodes.ESCAPE:
        event.preventDefault()
        setIsOpen(false)
        buttonRef.current?.focus()
        break
      case KeyboardCodes.ENTER:
        event.preventDefault()
        if (activeIndex >= 0 && enabledOptions[activeIndex]) {
          onChange(enabledOptions[activeIndex].value)
          setIsOpen(false)
          buttonRef.current?.focus()
        }
        break
      default:
        const newIndex = handleArrowKeyNavigation(
          event,
          enabledOptions.map(() => document.createElement('div')), // Mock elements
          activeIndex,
          {
            loop: true,
            orientation: 'vertical',
            onSelect: (index) => {
              onChange(enabledOptions[index].value)
              setIsOpen(false)
              buttonRef.current?.focus()
            },
          }
        )
        setActiveIndex(newIndex)
    }
  }

  return (
    <div className={`relative space-y-2 ${className}`}>
      {/* Label */}
      <label
        htmlFor={selectId}
        className={`block text-sm font-medium text-white ${
          required ? "after:ml-1 after:text-red-400 after:content-['*']" : ''
        }`}
      >
        {label}
      </label>

      {/* Select Button */}
      <button
        ref={buttonRef}
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={selectId}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className={`flex w-full items-center justify-between rounded-lg border bg-gray-800 px-4 py-3 text-left text-white transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-violet-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 hover:border-gray-600'
        } `}
      >
        <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
          {selectedOption?.label || placeholder || 'Select an option'}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Listbox */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={selectId}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-700 bg-gray-800 shadow-2xl"
          >
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                disabled={option.disabled}
                onClick={() => {
                  if (!option.disabled) {
                    onChange(option.value)
                    setIsOpen(false)
                    buttonRef.current?.focus()
                  }
                }}
                className={`w-full px-4 py-3 text-left transition-colors ${
                  option.value === value
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                } ${activeIndex === index ? 'bg-gray-700' : ''} ${option.disabled ? 'cursor-not-allowed opacity-50' : ''} first:rounded-t-lg last:rounded-b-lg`}
              >
                {option.label}
                {option.value === value && <span className="sr-only"> (selected)</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <div
          id={errorId}
          className="flex items-center gap-2 text-sm text-red-400"
          role="alert"
          aria-live="polite"
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}
    </div>
  )
}

// Accessible Modal Component
interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlayClick?: boolean
  className?: string
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  className = '',
}: AccessibleModalProps) {
  const { t, languageConfig } = useI18n()
  const { saveFocus, restoreFocus, trapFocus } = useFocusManagement()
  const modalRef = useRef<HTMLDivElement>(null)
  const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`
  const descriptionId = description
    ? `modal-description-${Math.random().toString(36).substr(2, 9)}`
    : undefined

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  useEffect(() => {
    if (isOpen) {
      saveFocus()
      document.body.style.overflow = 'hidden'

      if (modalRef.current) {
        const cleanup = trapFocus(modalRef.current)
        return () => {
          cleanup()
          document.body.style.overflow = ''
          restoreFocus()
        }
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen, saveFocus, restoreFocus, trapFocus])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === KeyboardCodes.ESCAPE) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`relative w-full rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl ${sizes[size]} max-h-[90vh] overflow-hidden ${className} `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 p-6">
          <div>
            <h2 id={titleId} className="text-xl font-bold text-white">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-gray-400">
                {description}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
            aria-label={t('a11y.close_dialog')}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-6">{children}</div>
      </motion.div>
    </div>
  )
}

// Accessible Alert Component
interface AccessibleAlertProps {
  type: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  onClose?: () => void
  className?: string
}

export function AccessibleAlert({
  type,
  title,
  children,
  onClose,
  className = '',
}: AccessibleAlertProps) {
  const { t } = useI18n()

  const alertConfig = {
    info: {
      icon: Info,
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-300',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400',
      titleColor: 'text-green-300',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-300',
    },
    error: {
      icon: AlertTriangle,
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-400',
      titleColor: 'text-red-300',
    },
  }

  const config = alertConfig[type]
  const Icon = config.icon

  return (
    <div
      className={` ${config.bgColor} ${config.borderColor} rounded-xl border p-4 ${className} `}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start gap-3">
        <Icon className={`${config.iconColor} mt-0.5 h-5 w-5 flex-shrink-0`} aria-hidden="true" />

        <div className="flex-1">
          {title && <h3 className={`${config.titleColor} mb-2 font-semibold`}>{title}</h3>}
          <div className="text-gray-300">{children}</div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 transition-colors hover:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
            aria-label={t('common.close')}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// Accessible Progress Bar
interface AccessibleProgressProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'violet' | 'blue' | 'green' | 'red' | 'yellow'
  className?: string
}

export function AccessibleProgress({
  value,
  max = 100,
  label,
  showValue = true,
  size = 'md',
  color = 'violet',
  className = '',
}: AccessibleProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }

  const colors = {
    violet: 'bg-gradient-to-r from-violet-500 to-purple-600',
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-600',
    green: 'bg-gradient-to-r from-green-500 to-emerald-600',
    red: 'bg-gradient-to-r from-red-500 to-pink-600',
    yellow: 'bg-gradient-to-r from-yellow-500 to-orange-600',
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-sm font-medium text-white">{label}</span>}
          {showValue && <span className="text-sm text-gray-400">{Math.round(percentage)}%</span>}
        </div>
      )}

      <div
        className={`w-full rounded-full bg-gray-800 ${sizes[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={`${colors[color]} ${sizes[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
