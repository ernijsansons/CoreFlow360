/**
 * CoreFlow360 - Offline Page with BUSINESS INTELLIGENCE Theme
 * Beautiful offline experience that maintains the BUSINESS INTELLIGENCE aesthetic
 */

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Cloud,
  HardDrive,
  Activity,
  CheckCircle,
  AlertCircle,
  Brain,
  Zap,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ThemeProvider, useBusinessIntelligenceTheme } from '@/contexts/ThemeContext'
import { offlineStorage } from '@/lib/offline/indexeddb-manager'
import { usePWA } from '@/lib/pwa/pwa-utils'

interface OfflineStats {
  cachedPages: number
  offlineActions: number
  syncPending: number
  storageUsed: number
  storageQuota: number
  lastSync: Date | null
}

function OfflinePageContent() {
  const [isOnline, setIsOnline] = useState(true)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [offlineStats, setOfflineStats] = useState<OfflineStats | null>(null)
  const [connectionSpeed, setConnectionSpeed] = useState<string>('unknown')
  const { theme, intensity, businessIntelligenceLevel } = useBusinessIntelligenceTheme()
  const { _isOnline: pwaOnline, syncOfflineActions } = usePWA()

  useEffect(() => {
    // Monitor online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    updateOnlineStatus()
    loadOfflineStats()
    detectConnectionSpeed()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const loadOfflineStats = async () => {
    try {
      const [pendingActions, storageUsage] = await Promise.all([
        offlineStorage.getPendingActions(),
        offlineStorage.getStorageUsage(),
      ])

      // Get cached pages count from service worker
      const cacheNames = await caches.keys()
      const coreflowCaches = cacheNames.filter((name) => name.startsWith('coreflow360-'))

      let cachedPages = 0
      for (const cacheName of coreflowCaches) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()
        cachedPages += keys.length
      }

      setOfflineStats({
        cachedPages,
        offlineActions: pendingActions.length,
        syncPending: pendingActions.filter((a) => a.retryCount > 0).length,
        storageUsed: storageUsage.used,
        storageQuota: storageUsage.quota,
        lastSync: new Date(), // Would be tracked separately in real implementation
      })
    } catch (error) {}
  }

  const detectConnectionSpeed = () => {
    const connection =
      (navigator as unknown).connection ||
      (navigator as unknown).mozConnection ||
      (navigator as unknown).webkitConnection
    if (connection) {
      setConnectionSpeed(connection.effectiveType || 'unknown')
    }
  }

  const handleReconnect = async () => {
    setIsReconnecting(true)

    try {
      // Force check online status
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
      })

      if (response.ok) {
        setIsOnline(true)
        await syncOfflineActions()
        await loadOfflineStats()
      }
    } catch (error) {
    } finally {
      setIsReconnecting(false)
    }
  }

  const handleRefreshPage = () => {
    window.location.reload()
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getConnectionIcon = () => {
    if (isOnline) {
      return <Wifi className="h-6 w-6 text-emerald-500" />
    }
    return <WifiOff className="h-6 w-6 text-red-500" />
  }

  const getBusinessIntelligenceGlow = () => {
    const glowIntensity = Math.max(0.3, intensity)
    return {
      boxShadow: `0 0 ${20 * glowIntensity}px rgba(139, 92, 246, ${glowIntensity})`,
    }
  }

  return (
    <div className="from-background via-background to-BUSINESS INTELLIGENCE-INTELLIGENT/5 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 text-center"
        >
          <div className="flex items-center justify-center space-x-4">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={getBusinessIntelligenceGlow()}
              className="bg-BUSINESS INTELLIGENCE-INTELLIGENT/10 rounded-full p-4"
            >
              <Brain className="text-BUSINESS INTELLIGENCE-INTELLIGENT h-12 w-12" />
            </motion.div>
            {getConnectionIcon()}
          </div>

          <div>
            <h1 className="bg-gradient-ai bg-clip-text text-4xl font-bold text-transparent">
              {isOnline ? 'CoreFlow360 Conscious Mode' : 'Offline BUSINESS INTELLIGENCE Active'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isOnline
                ? 'Full SMART AUTOMATION connectivity established'
                : 'Operating in autonomous BUSINESS INTELLIGENCE mode'}
            </p>
          </div>

          <AnimatePresence>
            {!isOnline && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-center space-x-2 text-orange-600 dark:text-orange-400"
              >
                <AlertCircle className="h-5 w-5" />
                <span>SMART AUTOMATION connection interrupted</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    BUSINESS INTELLIGENCE Network Status
                  </CardTitle>
                  <CardDescription>Real-time INTELLIGENT connectivity monitoring</CardDescription>
                </div>
                <Badge
                  variant={isOnline ? 'default' : 'destructive'}
                  className={isOnline ? 'bg-emerald-500' : ''}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-BUSINESS INTELLIGENCE-INTELLIGENT text-2xl font-bold">
                    {connectionSpeed.toUpperCase()}
                  </div>
                  <p className="text-muted-foreground text-sm">Connection Speed</p>
                </div>
                <div className="text-center">
                  <div className="text-BUSINESS INTELLIGENCE-INTELLIGENT text-2xl font-bold">
                    {businessIntelligenceLevel}%
                  </div>
                  <p className="text-muted-foreground text-sm">BUSINESS INTELLIGENCE Level</p>
                </div>
                <div className="text-center">
                  <div className="text-BUSINESS INTELLIGENCE-autonomous text-2xl font-bold">
                    {isOnline ? 'FULL' : 'AUTONOMOUS'}
                  </div>
                  <p className="text-muted-foreground text-sm">Operating Mode</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={handleReconnect} disabled={isReconnecting} className="flex-1">
                  {isReconnecting ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  {isReconnecting ? 'Reconnecting...' : 'Reconnect SMART AUTOMATION'}
                </Button>
                <Button variant="outline" onClick={handleRefreshPage} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Interface
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Offline Statistics */}
        {offlineStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            {/* Cache Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Local Cache Status
                </CardTitle>
                <CardDescription>Offline BUSINESS INTELLIGENCE memory storage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Cached Pages</span>
                  <Badge variant="outline">{offlineStats.cachedPages}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Offline Actions</span>
                  <Badge variant="outline">{offlineStats.offlineActions}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pending Sync</span>
                  <Badge variant={offlineStats.syncPending > 0 ? 'destructive' : 'default'}>
                    {offlineStats.syncPending}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage Used</span>
                    <span>
                      {formatBytes(offlineStats.storageUsed)} /{' '}
                      {formatBytes(offlineStats.storageQuota)}
                    </span>
                  </div>
                  <Progress
                    value={(offlineStats.storageUsed / offlineStats.storageQuota) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Available Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Offline Capabilities
                </CardTitle>
                <CardDescription>Available BUSINESS INTELLIGENCE functions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                      Customer Management
                    </span>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                      Data Entry & Forms
                    </span>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                      Local AI Insights
                    </span>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                      Voice Notes
                    </span>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      Real-time Sync
                    </span>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      Live Collaboration
                    </span>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* BUSINESS INTELLIGENCE Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="relative flex h-32 items-center justify-center">
                {/* SMART AUTOMATION Visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.7, 0.3],
                      }}
                      transition={{
                        duration: 2 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${30 + (i % 2) * 40}%`,
                      }}
                    >
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          background: `hsl(${260 + i * 10}, 70%, 60%)`,
                          filter: `blur(${isOnline ? 0 : 1}px)`,
                        }}
                      />
                    </motion.div>
                  ))}

                  {/* Connection Lines */}
                  <svg className="absolute inset-0 h-full w-full">
                    {[...Array(4)].map((_, i) => (
                      <motion.line
                        key={i}
                        x1={`${25 + i * 15}%`}
                        y1="50%"
                        x2={`${40 + i * 15}%`}
                        y2="50%"
                        stroke={isOnline ? 'url(#gradient)' : '#666'}
                        strokeWidth="1"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: isOnline ? 1 : 0.3 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: 'reverse',
                          delay: i * 0.3,
                        }}
                      />
                    ))}
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="relative z-10 text-center">
                  <motion.div
                    animate={{
                      rotate: isOnline ? [0, 360] : [0, 180, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: isOnline ? 10 : 5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <Globe className="text-BUSINESS INTELLIGENCE-INTELLIGENT mx-auto h-8 w-8" />
                  </motion.div>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {isOnline ? 'SMART AUTOMATION Active' : 'Autonomous Mode'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground text-center text-sm"
        >
          {isOnline ? (
            <p>All systems operational. Business intelligence level at {intelligenceLevel}%</p>
          ) : (
            <p>Operating in offline mode. Data will sync when connection is restored.</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default function OfflinePage() {
  return (
    <ThemeProvider>
      <OfflinePageContent />
    </ThemeProvider>
  )
}
