'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapIcon,
  StarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
// import OpenStreetMapComponent from './OpenStreetMapComponent' // Disabled - missing dependency
// import GoogleMapsComponent from './GoogleMapsComponent' // Disabled - missing dependency
import { CustomerLocation, TenantMappingConfig } from '@/types/mapping'

interface HybridMapComponentProps {
  locations: CustomerLocation[]
  center?: [number, number] | { lat: number; lng: number }
  zoom?: number
  height?: string
  onLocationClick?: (location: CustomerLocation) => void
  className?: string
  tenantConfig?: TenantMappingConfig
  onUpgrade?: () => void
  showProviderSwitch?: boolean
}

export default function HybridMapComponent({
  locations,
  center,
  zoom = 4,
  height = '400px',
  onLocationClick,
  className = '',
  tenantConfig,
  onUpgrade,
  showProviderSwitch = true,
}: HybridMapComponentProps) {
  const [activeProvider, setActiveProvider] = useState<'openstreetmap' | 'google'>('openstreetmap')
  const [isLoading, setIsLoading] = useState(false)
  const [usageWarning, setUsageWarning] = useState<string | null>(null)

  // Determine available providers based on tenant config
  const isPremium = tenantConfig?.mappingTier === 'premium' && tenantConfig?.googleMapsEnabled
  const hasCreditsRemaining = (tenantConfig?.monthlyMapCredits || 0) > 0

  useEffect(() => {
    // Auto-select best provider based on config
    if (isPremium && hasCreditsRemaining) {
      setActiveProvider('google')
    } else {
      setActiveProvider('openstreetmap')
    }

    // Check usage warnings
    if (isPremium && tenantConfig) {
      const creditsUsed = tenantConfig.monthlyMapCredits || 0
      if (creditsUsed > 800) {
        // 80% of 1000 credit limit
        setUsageWarning('Approaching monthly Google Maps credit limit')
      } else if (creditsUsed >= 1000) {
        setUsageWarning('Monthly Google Maps credit limit exceeded')
        setActiveProvider('openstreetmap') // Fall back to free provider
      }
    }
  }, [tenantConfig, isPremium, hasCreditsRemaining])

  const handleProviderSwitch = async (provider: 'openstreetmap' | 'google') => {
    if (provider === 'google' && !isPremium) {
      if (onUpgrade) {
        onUpgrade()
      }
      return
    }

    if (provider === 'google' && !hasCreditsRemaining) {
      setUsageWarning('No Google Maps credits remaining this month')
      return
    }

    setIsLoading(true)

    // Simulate loading time for provider switch
    setTimeout(() => {
      setActiveProvider(provider)
      setIsLoading(false)
    }, 500)
  }

  const formatCenter = () => {
    if (!center) return undefined

    if (Array.isArray(center)) {
      return activeProvider === 'google'
        ? { lat: center[0], lng: center[1] }
        : (center as [number, number])
    }

    return activeProvider === 'google'
      ? (center as { lat: number; lng: number })
      : ([center.lat, center.lng] as [number, number])
  }

  const getProviderFeatures = (provider: 'openstreetmap' | 'google') => {
    if (provider === 'openstreetmap') {
      return ['Free to use', 'Basic mapping', 'Customer locations', 'Territory visualization']
    } else {
      return [
        'Premium features',
        'Traffic data',
        'Street View',
        'Route optimization',
        'Advanced geocoding',
        'Satellite imagery',
      ]
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Provider Selection & Status */}
      {showProviderSwitch && (
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="flex items-center text-lg font-medium text-gray-900">
                <MapIcon className="mr-2 h-5 w-5 text-blue-600" />
                Map Provider
              </h3>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleProviderSwitch('openstreetmap')}
                  disabled={isLoading}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    activeProvider === 'openstreetmap'
                      ? 'border-2 border-blue-200 bg-blue-100 text-blue-800'
                      : 'border-2 border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  OpenStreetMap (Free)
                </button>

                <button
                  onClick={() => handleProviderSwitch('google')}
                  disabled={isLoading || (!isPremium && !onUpgrade)}
                  className={`relative rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    activeProvider === 'google'
                      ? 'border-2 border-blue-300 bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : isPremium
                        ? 'border-2 border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'cursor-not-allowed bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500'
                  }`}
                >
                  {!isPremium && <StarIcon className="mr-1 inline h-3 w-3" />}
                  Google Maps {!isPremium && '(Premium)'}
                </button>
              </div>
            </div>

            {/* Usage Info */}
            {isPremium && (
              <div className="text-sm text-gray-600">
                Credits: {tenantConfig?.monthlyMapCredits || 0}/1000
              </div>
            )}
          </div>

          {/* Usage Warning */}
          <AnimatePresence>
            {usageWarning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 rounded-md border border-yellow-200 bg-yellow-50 p-3"
              >
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-yellow-600" />
                  <span className="text-sm text-yellow-800">{usageWarning}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upgrade Prompt */}
          {!isPremium && activeProvider === 'openstreetmap' && onUpgrade && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="flex items-center text-sm font-semibold text-gray-900">
                    <StarIcon className="mr-1 h-4 w-4 text-blue-600" />
                    Unlock Premium Mapping Features
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    {getProviderFeatures('google')
                      .slice(1, 4)
                      .map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                          {feature}
                        </li>
                      ))}
                  </ul>
                </div>
                <button
                  onClick={onUpgrade}
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700"
                >
                  <CurrencyDollarIcon className="mr-1 inline h-4 w-4" />
                  Upgrade
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Map Container */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center rounded-lg bg-gray-100"
              style={{ height }}
            >
              <div className="text-center">
                <ArrowPathIcon className="mx-auto mb-2 h-8 w-8 animate-spin text-blue-600" />
                <div className="text-gray-600">Switching map provider...</div>
              </div>
            </motion.div>
          ) : activeProvider === 'openstreetmap' ? (
            <motion.div
              key="osm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {/* <OpenStreetMapComponent
                locations={locations}
                center={formatCenter() as [number, number]}
                zoom={zoom}
                height={height}
                onLocationClick={onLocationClick}
              /> */}
              <div
                className="flex items-center justify-center rounded-lg bg-gray-100 text-gray-500"
                style={{ height }}
              >
                <div className="text-center">
                  <MapIcon className="mx-auto mb-2 h-12 w-12" />
                  <p>OpenStreetMap temporarily disabled</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="google"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {/* <GoogleMapsComponent
                locations={locations}
                center={formatCenter() as { lat: number; lng: number }}
                zoom={zoom}
                height={height}
                onLocationClick={onLocationClick}
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                features={{
                  traffic: isPremium,
                  transit: isPremium,
                  satellite: isPremium,
                  streetView: isPremium
                }}
              /> */}
              <div
                className="flex items-center justify-center rounded-lg bg-gray-100 text-gray-500"
                style={{ height }}
              >
                <div className="text-center">
                  <MapIcon className="mx-auto mb-2 h-12 w-12" />
                  <p>Google Maps temporarily disabled</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feature Comparison */}
      {showProviderSwitch && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow">
            <h4 className="mb-3 flex items-center font-semibold text-gray-900">
              OpenStreetMap Features
              <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                Free
              </span>
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {getProviderFeatures('openstreetmap').map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-3 h-2 w-2 rounded-full bg-green-400"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h4 className="mb-3 flex items-center font-semibold text-gray-900">
              Google Maps Features
              <span className="ml-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-2 py-1 text-xs text-blue-800">
                Premium
              </span>
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {getProviderFeatures('google').map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-3 h-2 w-2 rounded-full bg-blue-400"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
