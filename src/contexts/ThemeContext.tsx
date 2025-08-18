/**
 * CoreFlow360 - Theme Context with Consciousness Awareness
 * Advanced theme management with user preferences and system detection
 */

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ConsciousnessTheme = 'neural' | 'synaptic' | 'autonomous' | 'transcendent'
export type AccessibilityMode = 'standard' | 'high-contrast' | 'reduced-motion' | 'enhanced-focus'

export interface ThemePreferences {
  mode: ThemeMode
  consciousnessTheme: ConsciousnessTheme
  accessibilityMode: AccessibilityMode
  customColors?: {
    primary?: string
    secondary?: string
    accent?: string
  }
  animations: boolean
  autoThemeSwitch: boolean
  scheduleStart?: string // HH:mm format for dark mode start
  scheduleEnd?: string   // HH:mm format for dark mode end
  respectSystemPreference: boolean
  contrastRatio: number  // 1.0 to 3.0 for accessibility
}

export interface ThemeState {
  currentTheme: 'light' | 'dark'
  preferences: ThemePreferences
  isSystemDark: boolean
  isLoading: boolean
  consciousnessLevel: number // 0-100 based on subscription tier
}

interface ThemeContextValue extends ThemeState {
  setThemeMode: (mode: ThemeMode) => void
  setConsciousnessTheme: (theme: ConsciousnessTheme) => void
  setAccessibilityMode: (mode: AccessibilityMode) => void
  updatePreferences: (prefs: Partial<ThemePreferences>) => void
  resetToDefaults: () => void
  exportTheme: () => string
  importTheme: (themeData: string) => boolean
}

const defaultPreferences: ThemePreferences = {
  mode: 'system',
  consciousnessTheme: 'neural',
  accessibilityMode: 'standard',
  animations: true,
  autoThemeSwitch: false,
  respectSystemPreference: true,
  contrastRatio: 1.0
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  userId?: string
  initialConsciousnessLevel?: number
}

export function ThemeProvider({ 
  children, 
  userId, 
  initialConsciousnessLevel = 0 
}: ThemeProviderProps) {
  const [state, setState] = useState<ThemeState>({
    currentTheme: 'light',
    preferences: defaultPreferences,
    isSystemDark: false,
    isLoading: true,
    consciousnessLevel: initialConsciousnessLevel
  })

  // System theme detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateSystemTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      setState(prev => ({
        ...prev,
        isSystemDark: e.matches,
        currentTheme: prev.preferences.mode === 'system' 
          ? (e.matches ? 'dark' : 'light')
          : prev.currentTheme
      }))
    }

    updateSystemTheme(mediaQuery)
    mediaQuery.addEventListener('change', updateSystemTheme)

    return () => mediaQuery.removeEventListener('change', updateSystemTheme)
  }, [])

  // Reduced motion detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches && state.preferences.respectSystemPreference) {
        setState(prev => ({
          ...prev,
          preferences: {
            ...prev.preferences,
            animations: false,
            accessibilityMode: 'reduced-motion'
          }
        }))
      }
    }

    updateMotionPreference(mediaQuery)
    mediaQuery.addEventListener('change', updateMotionPreference)

    return () => mediaQuery.removeEventListener('change', updateMotionPreference)
  }, [state.preferences.respectSystemPreference])

  // High contrast detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    const updateContrastPreference = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches && state.preferences.respectSystemPreference) {
        setState(prev => ({
          ...prev,
          preferences: {
            ...prev.preferences,
            accessibilityMode: 'high-contrast',
            contrastRatio: 2.5
          }
        }))
      }
    }

    updateContrastPreference(mediaQuery)
    mediaQuery.addEventListener('change', updateContrastPreference)

    return () => mediaQuery.removeEventListener('change', updateContrastPreference)
  }, [state.preferences.respectSystemPreference])

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load from localStorage first (immediate)
        const localPrefs = localStorage.getItem('coreflow360-theme-preferences')
        if (localPrefs) {
          const preferences = JSON.parse(localPrefs) as ThemePreferences
          setState(prev => ({
            ...prev,
            preferences,
            currentTheme: calculateCurrentTheme(preferences, prev.isSystemDark),
            isLoading: false
          }))
        }

        // Load from database if user is logged in
        if (userId) {
          const userPrefs = await fetchUserThemePreferences(userId)
          if (userPrefs) {
            setState(prev => ({
              ...prev,
              preferences: userPrefs,
              currentTheme: calculateCurrentTheme(userPrefs, prev.isSystemDark),
              isLoading: false
            }))
          }
        }
      } catch (error) {
        console.error('[Theme] Failed to load preferences:', error)
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }

    loadPreferences()
  }, [userId])

  // Auto theme switching based on schedule
  useEffect(() => {
    if (!state.preferences.autoThemeSwitch || !state.preferences.scheduleStart || !state.preferences.scheduleEnd) {
      return
    }

    const checkSchedule = () => {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      const start = state.preferences.scheduleStart!
      const end = state.preferences.scheduleEnd!
      
      let shouldBeDark = false
      
      if (start <= end) {
        // Normal case: 08:00 to 20:00
        shouldBeDark = currentTime >= start && currentTime < end
      } else {
        // Overnight case: 20:00 to 08:00
        shouldBeDark = currentTime >= start || currentTime < end
      }

      if (state.preferences.mode === 'system' && shouldBeDark !== (state.currentTheme === 'dark')) {
        setState(prev => ({
          ...prev,
          currentTheme: shouldBeDark ? 'dark' : 'light'
        }))
      }
    }

    checkSchedule()
    const interval = setInterval(checkSchedule, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [state.preferences.autoThemeSwitch, state.preferences.scheduleStart, state.preferences.scheduleEnd, state.preferences.mode])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    
    // Apply theme class
    root.className = root.className.replace(/\b(light|dark)\b/g, '')
    root.classList.add(state.currentTheme)
    
    // Apply consciousness theme
    root.className = root.className.replace(/\btheme-(neural|synaptic|autonomous|transcendent)\b/g, '')
    root.classList.add(`theme-${state.preferences.consciousnessTheme}`)
    
    // Apply accessibility mode
    root.className = root.className.replace(/\ba11y-(standard|high-contrast|reduced-motion|enhanced-focus)\b/g, '')
    root.classList.add(`a11y-${state.preferences.accessibilityMode}`)
    
    // Apply custom CSS properties
    root.style.setProperty('--theme-mode', state.currentTheme)
    root.style.setProperty('--consciousness-level', `${state.consciousnessLevel}%`)
    root.style.setProperty('--contrast-ratio', state.preferences.contrastRatio.toString())
    
    if (state.preferences.customColors?.primary) {
      root.style.setProperty('--color-primary-custom', state.preferences.customColors.primary)
    }
    if (state.preferences.customColors?.secondary) {
      root.style.setProperty('--color-secondary-custom', state.preferences.customColors.secondary)
    }
    if (state.preferences.customColors?.accent) {
      root.style.setProperty('--color-accent-custom', state.preferences.customColors.accent)
    }
    
    // Disable animations if needed
    if (!state.preferences.animations) {
      root.style.setProperty('--animation-duration', '0s')
      root.style.setProperty('--transition-duration', '0s')
    } else {
      root.style.removeProperty('--animation-duration')
      root.style.removeProperty('--transition-duration')
    }
  }, [state.currentTheme, state.preferences, state.consciousnessLevel])

  const setThemeMode = async (mode: ThemeMode) => {
    const newPreferences = { ...state.preferences, mode }
    const newTheme = calculateCurrentTheme(newPreferences, state.isSystemDark)
    
    setState(prev => ({
      ...prev,
      preferences: newPreferences,
      currentTheme: newTheme
    }))

    await savePreferences(newPreferences)
  }

  const setConsciousnessTheme = async (consciousnessTheme: ConsciousnessTheme) => {
    const newPreferences = { ...state.preferences, consciousnessTheme }
    
    setState(prev => ({
      ...prev,
      preferences: newPreferences
    }))

    await savePreferences(newPreferences)
  }

  const setAccessibilityMode = async (accessibilityMode: AccessibilityMode) => {
    const newPreferences = { ...state.preferences, accessibilityMode }
    
    setState(prev => ({
      ...prev,
      preferences: newPreferences
    }))

    await savePreferences(newPreferences)
  }

  const updatePreferences = async (prefs: Partial<ThemePreferences>) => {
    const newPreferences = { ...state.preferences, ...prefs }
    const newTheme = calculateCurrentTheme(newPreferences, state.isSystemDark)
    
    setState(prev => ({
      ...prev,
      preferences: newPreferences,
      currentTheme: newTheme
    }))

    await savePreferences(newPreferences)
  }

  const resetToDefaults = async () => {
    setState(prev => ({
      ...prev,
      preferences: defaultPreferences,
      currentTheme: calculateCurrentTheme(defaultPreferences, prev.isSystemDark)
    }))

    await savePreferences(defaultPreferences)
  }

  const exportTheme = (): string => {
    return JSON.stringify({
      preferences: state.preferences,
      consciousnessLevel: state.consciousnessLevel,
      version: '1.0',
      exported: new Date().toISOString()
    }, null, 2)
  }

  const importTheme = (themeData: string): boolean => {
    try {
      const data = JSON.parse(themeData)
      if (data.preferences && data.version === '1.0') {
        updatePreferences(data.preferences)
        if (data.consciousnessLevel) {
          setState(prev => ({ ...prev, consciousnessLevel: data.consciousnessLevel }))
        }
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const savePreferences = async (preferences: ThemePreferences) => {
    // Save to localStorage
    localStorage.setItem('coreflow360-theme-preferences', JSON.stringify(preferences))
    
    // Save to database if user is logged in
    if (userId) {
      try {
        await saveUserThemePreferences(userId, preferences)
      } catch (error) {
        console.error('[Theme] Failed to save preferences to database:', error)
      }
    }
  }

  const value: ThemeContextValue = {
    ...state,
    setThemeMode,
    setConsciousnessTheme,
    setAccessibilityMode,
    updatePreferences,
    resetToDefaults,
    exportTheme,
    importTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Utility functions
function calculateCurrentTheme(preferences: ThemePreferences, isSystemDark: boolean): 'light' | 'dark' {
  switch (preferences.mode) {
    case 'light':
      return 'light'
    case 'dark':
      return 'dark'
    case 'system':
      return isSystemDark ? 'dark' : 'light'
    default:
      return 'light'
  }
}

async function fetchUserThemePreferences(userId: string): Promise<ThemePreferences | null> {
  try {
    const response = await fetch(`/api/user/theme-preferences?userId=${userId}`)
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('[Theme] Failed to fetch user preferences:', error)
  }
  return null
}

async function saveUserThemePreferences(userId: string, preferences: ThemePreferences): Promise<void> {
  try {
    await fetch('/api/user/theme-preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        preferences
      })
    })
  } catch (error) {
    console.error('[Theme] Failed to save user preferences:', error)
    throw error
  }
}

// Hook for consciousness-aware theming
export function useConsciousnessTheme() {
  const { preferences, consciousnessLevel } = useTheme()
  
  const getThemeIntensity = () => {
    const baseIntensity = {
      neural: 0.3,
      synaptic: 0.5,
      autonomous: 0.7,
      transcendent: 1.0
    }
    
    return baseIntensity[preferences.consciousnessTheme] * (consciousnessLevel / 100)
  }
  
  const getAnimationComplexity = () => {
    if (!preferences.animations) return 'none'
    if (consciousnessLevel < 25) return 'simple'
    if (consciousnessLevel < 50) return 'medium'
    if (consciousnessLevel < 75) return 'complex'
    return 'transcendent'
  }
  
  return {
    theme: preferences.consciousnessTheme,
    intensity: getThemeIntensity(),
    animationComplexity: getAnimationComplexity(),
    consciousnessLevel
  }
}

// Hook for accessibility features
export function useAccessibility() {
  const { preferences, updatePreferences } = useTheme()
  
  const enableHighContrast = () => updatePreferences({
    accessibilityMode: 'high-contrast',
    contrastRatio: 2.5
  })
  
  const enableReducedMotion = () => updatePreferences({
    accessibilityMode: 'reduced-motion',
    animations: false
  })
  
  const enableEnhancedFocus = () => updatePreferences({
    accessibilityMode: 'enhanced-focus'
  })
  
  return {
    mode: preferences.accessibilityMode,
    contrastRatio: preferences.contrastRatio,
    animations: preferences.animations,
    enableHighContrast,
    enableReducedMotion,
    enableEnhancedFocus
  }
}