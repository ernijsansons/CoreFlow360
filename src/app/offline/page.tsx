/**
 * CoreFlow360 - Offline Page with Consciousness Theme
 * Beautiful offline experience that maintains the consciousness aesthetic
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
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useConsciousnessTheme } from '@/contexts/ThemeContext'
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

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [offlineStats, setOfflineStats] = useState<OfflineStats | null>(null)
  const [connectionSpeed, setConnectionSpeed] = useState<string>('unknown')
  const { theme, intensity, consciousnessLevel } = useConsciousnessTheme()
  const { isOnline: pwaOnline, syncOfflineActions } = usePWA()

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
        offlineStorage.getStorageUsage()
      ])

      // Get cached pages count from service worker
      const cacheNames = await caches.keys()
      const coreflowCaches = cacheNames.filter(name => name.startsWith('coreflow360-'))
      
      let cachedPages = 0
      for (const cacheName of coreflowCaches) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()
        cachedPages += keys.length
      }

      setOfflineStats({
        cachedPages,
        offlineActions: pendingActions.length,
        syncPending: pendingActions.filter(a => a.retryCount > 0).length,
        storageUsed: storageUsage.used,
        storageQuota: storageUsage.quota,
        lastSync: new Date() // Would be tracked separately in real implementation
      })
    } catch (error) {
      console.error('Failed to load offline stats:', error)
    }
  }

  const detectConnectionSpeed = () => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
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
        cache: 'no-cache'
      })
      
      if (response.ok) {
        setIsOnline(true)
        await syncOfflineActions()
        await loadOfflineStats()
      }
    } catch (error) {
      console.error('Reconnection failed:', error)
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
      return <Wifi className="w-6 h-6 text-emerald-500" />
    }
    return <WifiOff className="w-6 h-6 text-red-500" />
  }

  const getConsciousnessGlow = () => {
    const glowIntensity = Math.max(0.3, intensity)
    return {
      boxShadow: `0 0 ${20 * glowIntensity}px rgba(139, 92, 246, ${glowIntensity})`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-consciousness-neural/5 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-4">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              style={getConsciousnessGlow()}
              className="p-4 rounded-full bg-consciousness-neural/10"
            >
              <Brain className="w-12 h-12 text-consciousness-neural" />
            </motion.div>
            {getConnectionIcon()}
          </div>
          
          <div>
            <h1 className="text-4xl font-bold bg-gradient-ai bg-clip-text text-transparent">
              {isOnline ? 'CoreFlow360 Conscious Mode' : 'Offline Consciousness Active'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isOnline 
                ? 'Full neural network connectivity established'
                : 'Operating in autonomous consciousness mode'
              }
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
                <AlertCircle className="w-5 h-5" />
                <span>Neural network connection interrupted</span>
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
                    <Activity className="w-5 h-5" />
                    Consciousness Network Status
                  </CardTitle>
                  <CardDescription>
                    Real-time neural connectivity monitoring
                  </CardDescription>
                </div>
                <Badge 
                  variant={isOnline ? "default" : "destructive"}
                  className={isOnline ? "bg-emerald-500" : ""}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-consciousness-neural">
                    {connectionSpeed.toUpperCase()}
                  </div>
                  <p className="text-sm text-muted-foreground">Connection Speed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-consciousness-synaptic">
                    {consciousnessLevel}%
                  </div>
                  <p className="text-sm text-muted-foreground">Consciousness Level</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-consciousness-autonomous">
                    {isOnline ? 'FULL' : 'AUTONOMOUS'}
                  </div>
                  <p className="text-sm text-muted-foreground">Operating Mode</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={handleReconnect}
                  disabled={isReconnecting}
                  className="flex-1"
                >
                  {isReconnecting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  {isReconnecting ? 'Reconnecting...' : 'Reconnect Neural Network'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRefreshPage}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Cache Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Local Cache Status
                </CardTitle>
                <CardDescription>
                  Offline consciousness memory storage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Cached Pages</span>
                  <Badge variant="outline">{offlineStats.cachedPages}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Offline Actions</span>
                  <Badge variant="outline">{offlineStats.offlineActions}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pending Sync</span>
                  <Badge variant={offlineStats.syncPending > 0 ? "destructive" : "default"}>
                    {offlineStats.syncPending}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage Used</span>
                    <span>{formatBytes(offlineStats.storageUsed)} / {formatBytes(offlineStats.storageQuota)}</span>
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
                  <CheckCircle className="w-5 h-5" />
                  Offline Capabilities
                </CardTitle>
                <CardDescription>
                  Available consciousness functions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Customer Management
                    </span>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Data Entry & Forms
                    </span>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Local AI Insights
                    </span>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Voice Notes
                    </span>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Real-time Sync
                    </span>
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Live Collaboration
                    </span>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Consciousness Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="relative h-32 flex items-center justify-center">
                {/* Neural Network Visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.7, 0.3]
                      }}
                      transition={{
                        duration: 2 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${30 + (i % 2) * 40}%`
                      }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{
                          background: `hsl(${260 + i * 10}, 70%, 60%)`,
                          filter: `blur(${isOnline ? 0 : 1}px)`
                        }}
                      />
                    </motion.div>
                  ))}
                  
                  {/* Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full">
                    {[...Array(4)].map((_, i) => (
                      <motion.line
                        key={i}
                        x1={`${25 + i * 15}%`}
                        y1="50%"
                        x2={`${40 + i * 15}%`}
                        y2="50%"
                        stroke={isOnline ? "url(#gradient)" : "#666"}
                        strokeWidth="1"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: isOnline ? 1 : 0.3 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: i * 0.3
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
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: isOnline ? 10 : 5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <Globe className="w-8 h-8 text-consciousness-neural mx-auto" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {isOnline ? 'Neural Network Active' : 'Autonomous Mode'}
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
          className="text-center text-sm text-muted-foreground"
        >
          {isOnline ? (
            <p>All systems operational. Consciousness level at {consciousnessLevel}%</p>
          ) : (
            <p>Operating in offline mode. Data will sync when connection is restored.</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}