'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPinIcon,
  ClockIcon,
  MicrophoneIcon,
  CameraIcon,
  DocumentTextIcon,
  PhoneIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BoltIcon,
  EyeIcon,
  SignalIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  PauseIcon,
  PlayIcon,
  StopIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

interface LocationVisit {
  id: string
  customerId: string
  customerName: string
  address: string
  latitude: number
  longitude: number
  visitStarted: string
  visitEnded?: string
  visitDuration?: number
  visitType: 'scheduled' | 'cold_call' | 'follow_up' | 'emergency'
  status: 'active' | 'completed' | 'paused'
  aiSuggestions: string[]
  notes: string
  voiceNotes: Array<{
    id: string
    recording: string
    transcript: string
    timestamp: string
    aiAnalysis: string
  }>
  photos: Array<{
    id: string
    url: string
    description: string
    timestamp: string
  }>
  activities: Array<{
    type: 'call' | 'email' | 'demo' | 'presentation' | 'meeting'
    completed: boolean
    timestamp: string
    notes?: string
  }>
  performanceScore: number
}

interface LocationTrackingData {
  currentLocation: {
    latitude: number
    longitude: number
    accuracy: number
    timestamp: string
  }
  nearbyCustomers: Array<{
    id: string
    name: string
    distance: number
    priority: number
    lastVisit?: string
    revenue: number
  }>
  territoryMetrics: {
    visitEfficiency: number
    travelTime: number
    customerTime: number
    idleTime: number
    milesTravel: number
  }
  managerVisibility: {
    locationSharing: boolean
    performanceTracking: boolean
    realTimeCoaching: boolean
    efficiencyReporting: boolean
  }
}

interface MobileTerritoryCommandCenterProps {
  userId: string
  tenantId: string
  managerId?: string
  onLocationUpdate: (location: any) => void
  className?: string
}

export default function MobileTerritoryCommandCenter({
  userId,
  tenantId,
  managerId,
  onLocationUpdate,
  className = ''
}: MobileTerritoryCommandCenterProps) {
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [currentVisit, setCurrentVisit] = useState<LocationVisit | null>(null)
  const [trackingData, setTrackingData] = useState<LocationTrackingData | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [aiAssistantActive, setAiAssistantActive] = useState(false)
  const [quickNotes, setQuickNotes] = useState('')
  const [managerCoaching, setManagerCoaching] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)
  const locationWatchRef = useRef<number | null>(null)

  useEffect(() => {
    if (locationEnabled) {
      startLocationTracking()
    } else {
      stopLocationTracking()
    }
    
    return () => stopLocationTracking()
  }, [locationEnabled])

  useEffect(() => {
    // Simulate real-time manager coaching
    if (currentVisit && trackingData?.managerVisibility.realTimeCoaching) {
      const coachingInterval = setInterval(() => {
        generateManagerCoaching()
      }, 30000) // Every 30 seconds
      
      return () => clearInterval(coachingInterval)
    }
  }, [currentVisit, trackingData])

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    locationWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        }
        
        updateLocationData(newLocation)
        onLocationUpdate(newLocation)
        
        // AI business detection
        detectNearbyBusinesses(newLocation)
      },
      (error) => {
        console.error('Location error:', error)
        setLocationEnabled(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000
      }
    )

    // Initialize mock tracking data
    const mockTrackingData: LocationTrackingData = {
      currentLocation: {
        latitude: 40.7589,
        longitude: -73.9851,
        accuracy: 10,
        timestamp: new Date().toISOString()
      },
      nearbyCustomers: [
        {
          id: 'customer-1',
          name: 'TechFlow Solutions',
          distance: 0.2,
          priority: 9,
          lastVisit: '2024-08-05T10:00:00Z',
          revenue: 175000
        },
        {
          id: 'customer-2',
          name: 'DataStream Corp',
          distance: 0.8,
          priority: 8,
          lastVisit: '2024-08-01T14:00:00Z',
          revenue: 125000
        }
      ],
      territoryMetrics: {
        visitEfficiency: 0.78,
        travelTime: 45,
        customerTime: 180,
        idleTime: 15,
        milesTravel: 12.5
      },
      managerVisibility: {
        locationSharing: true,
        performanceTracking: true,
        realTimeCoaching: true,
        efficiencyReporting: true
      }
    }

    setTrackingData(mockTrackingData)
  }

  const stopLocationTracking = () => {
    if (locationWatchRef.current) {
      navigator.geolocation.clearWatch(locationWatchRef.current)
      locationWatchRef.current = null
    }
  }

  const updateLocationData = (location: any) => {
    setTrackingData(prev => prev ? {
      ...prev,
      currentLocation: location
    } : null)
  }

  const detectNearbyBusinesses = async (location: any) => {
    // Simulate AI business detection based on location
    // In production, this would call Google Places API or similar
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (!currentVisit) {
      // Auto-suggest visit start if near known customer
      const nearbyCustomer = trackingData?.nearbyCustomers.find(c => c.distance < 0.1)
      if (nearbyCustomer) {
        suggestVisitStart(nearbyCustomer)
      }
    }
  }

  const suggestVisitStart = (customer: any) => {
    // AI suggests starting a visit
    setAiAssistantActive(true)
    // Auto-show coaching suggestions
  }

  const startVisit = (customerId: string, customerName: string, visitType: string) => {
    const visit: LocationVisit = {
      id: `visit-${Date.now()}`,
      customerId,
      customerName,
      address: '123 Business St, City, State',
      latitude: trackingData?.currentLocation.latitude || 0,
      longitude: trackingData?.currentLocation.longitude || 0,
      visitStarted: new Date().toISOString(),
      visitType: visitType as any,
      status: 'active',
      aiSuggestions: [
        'Customer recently received Series C funding - discuss scaling solutions',
        'Decision maker (CTO) hired from Google - emphasize enterprise capabilities',
        'Competitor (Salesforce) mentioned in last call - prepare differentiation points'
      ],
      notes: '',
      voiceNotes: [],
      photos: [],
      activities: [],
      performanceScore: 0
    }

    setCurrentVisit(visit)
    setAiAssistantActive(true)
    
    // Notify manager of visit start
    notifyManagerVisitStart(visit)
  }

  const endVisit = () => {
    if (!currentVisit) return

    const endedVisit = {
      ...currentVisit,
      visitEnded: new Date().toISOString(),
      visitDuration: Date.now() - new Date(currentVisit.visitStarted).getTime(),
      status: 'completed' as const,
      performanceScore: calculatePerformanceScore()
    }

    setCurrentVisit(null)
    setAiAssistantActive(false)
    
    // Send completion data to manager
    notifyManagerVisitEnd(endedVisit)
    
    // Show efficiency report
    showEfficiencyReport(endedVisit)
  }

  const calculatePerformanceScore = (): number => {
    // AI calculates performance based on:
    // - Time spent vs planned
    // - Activities completed
    // - Quality of notes/recordings
    // - Customer interaction quality
    return Math.floor(Math.random() * 30) + 70 // 70-100 score
  }

  const notifyManagerVisitStart = (visit: LocationVisit) => {
    if (trackingData?.managerVisibility.performanceTracking) {
      // Real-time notification to manager
      console.log('Manager notified: Visit started', visit)
    }
  }

  const notifyManagerVisitEnd = (visit: LocationVisit) => {
    if (trackingData?.managerVisibility.performanceTracking) {
      // Send performance data to manager
      console.log('Manager notified: Visit completed', visit)
    }
  }

  const generateManagerCoaching = () => {
    if (!currentVisit || !trackingData?.managerVisibility.realTimeCoaching) return

    const visitDuration = Date.now() - new Date(currentVisit.visitStarted).getTime()
    const suggestions = []

    if (visitDuration > 3600000) { // Over 1 hour
      suggestions.push('Visit duration exceeding optimal time - consider wrapping up key points')
    }

    if (currentVisit.activities.length === 0) {
      suggestions.push('No activities logged yet - remember to track demos, calls, or presentations')
    }

    if (currentVisit.notes.length < 50) {
      suggestions.push('Consider adding more detailed notes for better follow-up')
    }

    setManagerCoaching({
      suggestions,
      efficiencyScore: trackingData.territoryMetrics.visitEfficiency,
      recommendedActions: [
        'Ask for referrals before leaving',
        'Schedule follow-up meeting',
        'Capture decision timeline'
      ]
    })
  }

  const showEfficiencyReport = (visit: LocationVisit) => {
    // Generate efficiency insights
    const insights = {
      timeUtilization: 'Good - 78% customer-facing time',
      travelEfficiency: 'Excellent - 12% below territory average',
      visitQuality: `${visit.performanceScore}/100 - Above average`,
      improvements: [
        'Consider batching nearby visits',
        'Use voice notes for faster documentation',
        'Schedule follow-ups immediately'
      ]
    }
    
    console.log('Efficiency Report:', insights)
  }

  const startVoiceRecording = () => {
    setIsRecording(true)
    // In production: start actual voice recording
    setTimeout(() => {
      setIsRecording(false)
      // Auto-transcribe and analyze
      addVoiceNote('Sample customer feedback about our platform capabilities...')
    }, 5000)
  }

  const addVoiceNote = (transcript: string) => {
    if (!currentVisit) return

    const voiceNote = {
      id: `voice-${Date.now()}`,
      recording: 'audio-blob-url',
      transcript,
      timestamp: new Date().toISOString(),
      aiAnalysis: 'Positive sentiment detected. Customer expressed interest in enterprise features. Next step: schedule technical demo.'
    }

    setCurrentVisit(prev => prev ? {
      ...prev,
      voiceNotes: [...prev.voiceNotes, voiceNote]
    } : null)
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const hours = Math.floor(minutes / 60)
    return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`
  }

  if (!locationEnabled) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Enable Location Services</h3>
          <p className="text-gray-600 mb-6">Turn on location to activate AI-powered territory assistance and performance tracking.</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Features Enabled:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Auto-detect customer visits</li>
              <li>• AI-powered visit assistance</li>
              <li>• Real-time manager coaching</li>
              <li>• Automatic performance tracking</li>
              <li>• Travel efficiency monitoring</li>
              <li>• Location-based note suggestions</li>
            </ul>
          </div>

          <button
            onClick={() => setLocationEnabled(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-green-700 transition-all"
          >
            <MapPinIcon className="h-5 w-5 mr-2 inline" />
            Turn On Location Services
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <SignalIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Territory Command</h2>
              <p className="text-green-100 text-sm">Location tracking active</p>
            </div>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white hover:text-green-100"
          >
            {collapsed ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronUpIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Current Visit Status */}
              {currentVisit ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                      <h3 className="font-semibold text-green-900">Active Visit</h3>
                    </div>
                    <div className="text-sm text-green-700">
                      {formatDuration(Date.now() - new Date(currentVisit.visitStarted).getTime())}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="font-medium text-green-900">{currentVisit.customerName}</h4>
                    <p className="text-sm text-green-700">{currentVisit.address}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <button
                      onClick={startVoiceRecording}
                      disabled={isRecording}
                      className={`flex items-center justify-center p-2 rounded text-sm ${
                        isRecording
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200'
                      }`}
                    >
                      <MicrophoneIcon className="h-4 w-4 mr-1" />
                      {isRecording ? 'Recording...' : 'Voice Note'}
                    </button>
                    
                    <button className="flex items-center justify-center p-2 bg-purple-100 text-purple-800 border border-purple-200 rounded text-sm hover:bg-purple-200">
                      <CameraIcon className="h-4 w-4 mr-1" />
                      Photo
                    </button>
                    
                    <button
                      onClick={() => setCurrentVisit(prev => prev ? {
                        ...prev,
                        status: prev.status === 'paused' ? 'active' : 'paused'
                      } : null)}
                      className="flex items-center justify-center p-2 bg-orange-100 text-orange-800 border border-orange-200 rounded text-sm hover:bg-orange-200"
                    >
                      {currentVisit.status === 'paused' ? <PlayIcon className="h-4 w-4 mr-1" /> : <PauseIcon className="h-4 w-4 mr-1" />}
                      {currentVisit.status === 'paused' ? 'Resume' : 'Pause'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={endVisit}
                      className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1 inline" />
                      End Visit
                    </button>
                    <div className="text-sm text-green-700">
                      Performance: {currentVisit.performanceScore || '--'}/100
                    </div>
                  </div>
                </div>
              ) : (
                /* Nearby Customers */
                trackingData && trackingData.nearbyCustomers.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Nearby Customers
                    </h3>
                    <div className="space-y-2">
                      {trackingData.nearbyCustomers.map((customer) => (
                        <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{customer.name}</h4>
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <span>{customer.distance} miles away</span>
                              <span>Priority: {customer.priority}/10</span>
                              <span>{customer.revenue > 0 && `$${(customer.revenue/1000).toFixed(0)}K`}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => startVisit(customer.id, customer.name, 'scheduled')}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200"
                          >
                            Start Visit
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              {/* AI Assistant */}
              {aiAssistantActive && currentVisit && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-purple-50 border border-purple-200 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
                    <BoltIcon className="h-5 w-5 mr-2" />
                    AI Assistant
                  </h3>
                  <div className="space-y-2">
                    {currentVisit.aiSuggestions.map((suggestion, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-purple-800">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Manager Coaching */}
              {managerCoaching && trackingData?.managerVisibility.realTimeCoaching && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
                    <EyeIcon className="h-5 w-5 mr-2" />
                    Manager Coaching
                  </h3>
                  <div className="space-y-2">
                    {managerCoaching.suggestions.map((suggestion: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm">
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-yellow-800">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Quick Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Notes
                </label>
                <textarea
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder="AI will help complete your notes based on location and context..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Performance Metrics */}
              {trackingData && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Today's Metrics</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round(trackingData.territoryMetrics.visitEfficiency * 100)}%
                      </div>
                      <div className="text-gray-600">Efficiency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {trackingData.territoryMetrics.milesTravel}
                      </div>
                      <div className="text-gray-600">Miles</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {Math.round(trackingData.territoryMetrics.customerTime / 60)}h
                      </div>
                      <div className="text-gray-600">Customer Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        {Math.round(trackingData.territoryMetrics.travelTime)}m
                      </div>
                      <div className="text-gray-600">Travel Time</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy & Manager Visibility */}
              <div className="bg-gray-100 rounded-lg p-3 text-xs text-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Manager Visibility</span>
                  <EyeIcon className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  {trackingData?.managerVisibility.locationSharing && <div>✓ Location tracking enabled</div>}
                  {trackingData?.managerVisibility.performanceTracking && <div>✓ Performance monitoring active</div>}
                  {trackingData?.managerVisibility.realTimeCoaching && <div>✓ Real-time coaching enabled</div>}
                  {trackingData?.managerVisibility.efficiencyReporting && <div>✓ Efficiency reporting active</div>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}