'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BoltIcon,
  SpeakerWaveIcon,
  MicrophoneIcon,
  EyeIcon,
  ClockIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PhoneIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  FireIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  HandRaisedIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline'

interface CoachingTrigger {
  id: string
  type: 'performance' | 'behavior' | 'opportunity' | 'objection' | 'closing' | 'compliance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  condition: string
  message: string
  actionRequired: boolean
  autoTrigger: boolean
}

interface RealTimeCoachingSession {
  id: string
  repId: string
  repName: string
  customerId: string
  customerName: string
  sessionStart: string
  sessionDuration: number
  triggers: CoachingTrigger[]
  interventions: Array<{
    id: string
    timestamp: string
    type: 'audio_coaching' | 'text_prompt' | 'manager_alert' | 'live_assistance'
    content: string
    repResponse: 'acknowledged' | 'dismissed' | 'requested_help' | 'pending'
    effectiveness: number // 0-100
  }>
  performanceMetrics: {
    talkTime: number
    listeningTime: number
    objectionHandling: number
    closingAttempts: number
    buyingSignals: number
    sentiment: 'positive' | 'neutral' | 'negative'
    engagementScore: number
  }
  aiAnalysis: {
    conversationFlow: string
    keyMoments: Array<{
      timestamp: string
      moment: string
      significance: 'high' | 'medium' | 'low'
      coaching: string
    }>
    predictedOutcome: 'likely_close' | 'follow_up_needed' | 'at_risk' | 'lost'
    recommendedActions: string[]
  }
}

interface RealTimeTerritoryCoachingProps {
  userId: string
  managerId?: string
  tenantId: string
  currentSession?: RealTimeCoachingSession
  onCoachingAction: (action: any) => void
  className?: string
}

export default function RealTimeTerritoryCoaching({
  userId,
  managerId,
  tenantId,
  currentSession,
  onCoachingAction,
  className = ''
}: RealTimeTerritoryCoachingProps) {
  const [coachingActive, setCoachingActive] = useState(false)
  const [activeSession, setActiveSession] = useState<RealTimeCoachingSession | null>(currentSession || null)
  const [voiceCoachingEnabled, setVoiceCoachingEnabled] = useState(true)
  const [managerOverride, setManagerOverride] = useState(false)
  const [aiListening, setAiListening] = useState(false)
  const [coachingQueue, setCoachingQueue] = useState<CoachingTrigger[]>([])
  const [emergencyIntervention, setEmergencyIntervention] = useState<any>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (coachingActive && activeSession) {
      startRealTimeMonitoring()
    } else {
      stopRealTimeMonitoring()
    }
  }, [coachingActive, activeSession])

  useEffect(() => {
    // Simulate real-time coaching triggers
    if (activeSession) {
      const triggerInterval = setInterval(() => {
        generateCoachingTrigger()
      }, 15000) // Every 15 seconds
      
      return () => clearInterval(triggerInterval)
    }
  }, [activeSession])

  const startRealTimeMonitoring = () => {
    setAiListening(true)
    
    // Initialize mock session if none provided
    if (!activeSession) {
      const mockSession: RealTimeCoachingSession = {
        id: `session-${Date.now()}`,
        repId: userId,
        repName: 'Alex Morgan',
        customerId: 'customer-1',
        customerName: 'TechFlow Solutions',
        sessionStart: new Date().toISOString(),
        sessionDuration: 0,
        triggers: [],
        interventions: [],
        performanceMetrics: {
          talkTime: 0,
          listeningTime: 0,
          objectionHandling: 0,
          closingAttempts: 0,
          buyingSignals: 0,
          sentiment: 'neutral',
          engagementScore: 75
        },
        aiAnalysis: {
          conversationFlow: 'opening',
          keyMoments: [],
          predictedOutcome: 'follow_up_needed',
          recommendedActions: ['Build rapport', 'Identify decision makers', 'Understand timeline']
        }
      }
      setActiveSession(mockSession)
    }
  }

  const stopRealTimeMonitoring = () => {
    setAiListening(false)
    setCoachingQueue([])
  }

  const generateCoachingTrigger = () => {
    if (!activeSession) return

    const triggers: CoachingTrigger[] = [
      {
        id: `trigger-${Date.now()}-1`,
        type: 'performance',
        severity: 'medium',
        condition: 'Talk time exceeding 70% - customer not engaged',
        message: 'You\'ve been talking for 3+ minutes. Ask an open-ended question to re-engage.',
        actionRequired: true,
        autoTrigger: true
      },
      {
        id: `trigger-${Date.now()}-2`,
        type: 'opportunity',
        severity: 'high',
        condition: 'Customer mentioned budget approval process',
        message: 'OPPORTUNITY: Customer discussed budget - ask about timeline and decision process.',
        actionRequired: true,
        autoTrigger: true
      },
      {
        id: `trigger-${Date.now()}-3`,
        type: 'objection',
        severity: 'high',
        condition: 'Price objection detected',
        message: 'Price concern raised. Focus on ROI and value rather than defending price.',
        actionRequired: true,
        autoTrigger: true
      },
      {
        id: `trigger-${Date.now()}-4`,
        type: 'closing',
        severity: 'critical',
        condition: 'Strong buying signals detected',
        message: 'CLOSE NOW: Customer showing strong interest. Ask for the business.',
        actionRequired: true,
        autoTrigger: true
      },
      {
        id: `trigger-${Date.now()}-5`,
        type: 'behavior',
        severity: 'low',
        condition: 'Missed follow-up opportunity',
        message: 'Consider scheduling next meeting before ending this call.',
        actionRequired: false,
        autoTrigger: true
      }
    ]

    const randomTrigger = triggers[Math.floor(Math.random() * triggers.length)]
    
    // Add to coaching queue
    setCoachingQueue(prev => [...prev, randomTrigger])
    
    // Update session
    setActiveSession(prev => prev ? {
      ...prev,
      triggers: [...prev.triggers, randomTrigger],
      sessionDuration: Math.floor((Date.now() - new Date(prev.sessionStart).getTime()) / 1000),
      performanceMetrics: {
        ...prev.performanceMetrics,
        talkTime: Math.floor(Math.random() * 60) + 120, // 2-3 minutes
        listeningTime: Math.floor(Math.random() * 30) + 60, // 1-1.5 minutes
        objectionHandling: Math.floor(Math.random() * 3) + 1,
        closingAttempts: Math.floor(Math.random() * 2),
        buyingSignals: Math.floor(Math.random() * 5) + 2,
        sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as any,
        engagementScore: Math.floor(Math.random() * 40) + 60 // 60-100
      }
    } : null)

    // Trigger appropriate intervention
    handleCoachingIntervention(randomTrigger)
  }

  const handleCoachingIntervention = (trigger: CoachingTrigger) => {
    const intervention = {
      id: `intervention-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'text_prompt' as const,
      content: trigger.message,
      repResponse: 'pending' as const,
      effectiveness: 0
    }

    // Critical interventions require immediate attention
    if (trigger.severity === 'critical') {
      setEmergencyIntervention({
        trigger,
        intervention,
        managerAlert: true
      })
      
      if (managerId) {
        // Notify manager immediately
        onCoachingAction({
          type: 'manager_alert',
          trigger,
          session: activeSession
        })
      }
    }

    // Voice coaching for high-priority items
    if (trigger.severity === 'high' && voiceCoachingEnabled) {
      playVoiceCoaching(trigger.message)
    }

    // Update session with intervention
    setActiveSession(prev => prev ? {
      ...prev,
      interventions: [...prev.interventions, intervention]
    } : null)
  }

  const playVoiceCoaching = (message: string) => {
    // In production, this would use text-to-speech
    if (audioRef.current) {
      // Simulate audio coaching with notification sound
      audioRef.current.play().catch(console.error)
    }
    console.log('Voice coaching:', message)
  }

  const acknowledgeCoaching = (triggerId: string) => {
    setCoachingQueue(prev => prev.filter(t => t.id !== triggerId))
    setEmergencyIntervention(null)
    
    // Update intervention response
    setActiveSession(prev => prev ? {
      ...prev,
      interventions: prev.interventions.map(i => 
        i.timestamp === new Date().toISOString().substring(0, 16) ? 
        { ...i, repResponse: 'acknowledged', effectiveness: 85 } : i
      )
    } : null)

    onCoachingAction({
      type: 'coaching_acknowledged',
      triggerId,
      effectiveness: 85
    })
  }

  const dismissCoaching = (triggerId: string) => {
    setCoachingQueue(prev => prev.filter(t => t.id !== triggerId))
    setEmergencyIntervention(null)
    
    // Update intervention response
    setActiveSession(prev => prev ? {
      ...prev,
      interventions: prev.interventions.map(i => 
        i.timestamp === new Date().toISOString().substring(0, 16) ? 
        { ...i, repResponse: 'dismissed', effectiveness: 0 } : i
      )
    } : null)
  }

  const requestManagerHelp = (triggerId: string) => {
    if (managerId) {
      onCoachingAction({
        type: 'manager_assistance_requested',
        triggerId,
        session: activeSession,
        urgent: true
      })
    }
    
    setCoachingQueue(prev => prev.filter(t => t.id !== triggerId))
    setEmergencyIntervention(null)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <ChartBarIcon className="h-5 w-5" />
      case 'behavior': return <UserGroupIcon className="h-5 w-5" />
      case 'opportunity': return <TrophyIcon className="h-5 w-5" />
      case 'objection': return <ShieldCheckIcon className="h-5 w-5" />
      case 'closing': return <CurrencyDollarIcon className="h-5 w-5" />
      case 'compliance': return <ExclamationTriangleIcon className="h-5 w-5" />
      default: return <LightBulbIcon className="h-5 w-5" />
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Coaching Control Panel */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center">
                <BoltIcon className="h-6 w-6 mr-3" />
                Real-Time Territory Coaching
              </h2>
              <p className="text-purple-100 mt-1">AI-powered live sales coaching and intervention</p>
            </div>
            <div className="flex items-center space-x-4">
              {aiListening && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm">AI Listening</span>
                </div>
              )}
              <button
                onClick={() => setCoachingActive(!coachingActive)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  coachingActive 
                    ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {coachingActive ? (
                  <>
                    <PauseIcon className="h-4 w-4 mr-2 inline" />
                    Stop Coaching
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-2 inline" />
                    Start Coaching
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {coachingActive && activeSession && (
          <div className="p-6 space-y-6">
            {/* Session Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">{activeSession.customerName}</h4>
                  <p className="text-sm text-gray-600">Active session</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatDuration(activeSession.sessionDuration)}
                  </div>
                  <div className="text-xs text-gray-600">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {activeSession.performanceMetrics.engagementScore}
                  </div>
                  <div className="text-xs text-gray-600">Engagement</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    activeSession.performanceMetrics.sentiment === 'positive' ? 'text-green-600' :
                    activeSession.performanceMetrics.sentiment === 'negative' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {activeSession.performanceMetrics.sentiment.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-600">Sentiment</div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={voiceCoachingEnabled}
                    onChange={(e) => setVoiceCoachingEnabled(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Voice Coaching</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={managerOverride}
                    onChange={(e) => setManagerOverride(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Manager Override Mode</span>
                </label>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <EyeIcon className="h-4 w-4" />
                <span>Manager monitoring: {managerId ? 'Active' : 'Disabled'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Intervention Modal */}
      <AnimatePresence>
        {emergencyIntervention && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            >
              <div className="bg-red-600 px-6 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <FireIcon className="h-6 w-6 mr-2" />
                    CRITICAL COACHING ALERT
                  </h3>
                  <button
                    onClick={() => setEmergencyIntervention(null)}
                    className="text-white hover:text-gray-200"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {getTypeIcon(emergencyIntervention.trigger.type)}
                    <span className="font-medium text-gray-900">
                      {emergencyIntervention.trigger.type.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(emergencyIntervention.trigger.severity)}`}>
                      {emergencyIntervention.trigger.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium mb-2">{emergencyIntervention.trigger.message}</p>
                  <p className="text-sm text-gray-600">{emergencyIntervention.trigger.condition}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => acknowledgeCoaching(emergencyIntervention.trigger.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2 inline" />
                    Got It
                  </button>
                  <button
                    onClick={() => requestManagerHelp(emergencyIntervention.trigger.id)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <HandRaisedIcon className="h-4 w-4 mr-2 inline" />
                    Need Help
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Coaching Queue */}
      <AnimatePresence>
        {coachingQueue.length > 0 && !emergencyIntervention && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {coachingQueue.slice(0, 3).map((trigger, index) => (
              <motion.div
                key={trigger.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-lg shadow-lg border-l-4 ${
                  trigger.severity === 'critical' ? 'border-red-500' :
                  trigger.severity === 'high' ? 'border-orange-500' :
                  trigger.severity === 'medium' ? 'border-yellow-500' :
                  'border-blue-500'
                } overflow-hidden`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`p-1 rounded ${
                          trigger.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          trigger.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                          trigger.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {getTypeIcon(trigger.type)}
                        </div>
                        <span className="font-medium text-gray-900">
                          {trigger.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(trigger.severity)}`}>
                          {trigger.severity.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-gray-800 font-medium mb-1">{trigger.message}</p>
                      <p className="text-sm text-gray-600">{trigger.condition}</p>
                    </div>

                    <div className="ml-4 flex items-center space-x-2">
                      <button
                        onClick={() => acknowledgeCoaching(trigger.id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded"
                        title="Acknowledge"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => dismissCoaching(trigger.id)}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded"
                        title="Dismiss"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                      {managerId && (
                        <button
                          onClick={() => requestManagerHelp(trigger.id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                          title="Request Help"
                        >
                          <HandRaisedIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Analytics */}
      {activeSession && coachingActive && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrophyIcon className="h-5 w-5 mr-2 text-purple-600" />
            Live Performance Analytics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{formatDuration(activeSession.performanceMetrics.talkTime)}</div>
              <div className="text-sm text-gray-600">Talk Time</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">{formatDuration(activeSession.performanceMetrics.listeningTime)}</div>
              <div className="text-sm text-gray-600">Listen Time</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="text-2xl font-bold text-purple-600">{activeSession.performanceMetrics.buyingSignals}</div>
              <div className="text-sm text-gray-600">Buying Signals</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded">
              <div className="text-2xl font-bold text-orange-600">{activeSession.performanceMetrics.objectionHandling}</div>
              <div className="text-sm text-gray-600">Objections Handled</div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-3">AI Recommendations</h4>
            <div className="space-y-2">
              {activeSession.aiAnalysis.recommendedActions.map((action, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-sm">
                  <ArrowRightIcon className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span className="text-purple-800">{action}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-sm">
              <span className="font-medium text-purple-900">Predicted Outcome: </span>
              <span className={`px-2 py-1 rounded text-xs ${
                activeSession.aiAnalysis.predictedOutcome === 'likely_close' ? 'bg-green-100 text-green-800' :
                activeSession.aiAnalysis.predictedOutcome === 'at_risk' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {activeSession.aiAnalysis.predictedOutcome.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Audio element for voice coaching */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/coaching-alert.mp3" type="audio/mpeg" />
      </audio>
    </div>
  )
}