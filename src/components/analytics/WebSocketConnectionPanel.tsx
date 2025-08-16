/**
 * CoreFlow360 - WebSocket Connection Panel
 * Debug and monitoring panel for WebSocket connections
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Wifi,
  WifiOff,
  Activity,
  Signal,
  MessageSquare,
  Clock,
  Users,
  Server,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Eye,
  Send
} from 'lucide-react'
import useWebSocketAnalytics from '@/hooks/useWebSocketAnalytics'

interface ConnectionMetrics {
  latency: number
  messagesPerSecond: number
  uptime: number
  reconnects: number
}

export default function WebSocketConnectionPanel() {
  const {
    isConnected,
    isConnecting,
    error,
    metrics,
    connect,
    disconnect,
    reconnect,
    subscribe,
    unsubscribe,
    trackEvent
  } = useWebSocketAnalytics({
    autoConnect: false // Manual control for debug panel
  })

  const [selectedSubscription, setSelectedSubscription] = useState('')
  const [connectionLog, setConnectionLog] = useState<string[]>([])
  const [testMessage, setTestMessage] = useState('')

  const availableChannels = [
    'analytics:revenue',
    'analytics:users',
    'analytics:performance',
    'analytics:anomalies',
    'analytics:conversions',
    'dashboard:metrics',
    'dashboard:alerts',
    'events:realtime'
  ]

  // Log connection events
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString()
    
    if (isConnected) {
      setConnectionLog(prev => [...prev, `${timestamp} - Connected (${metrics.connectionId})`])
    } else if (error) {
      setConnectionLog(prev => [...prev, `${timestamp} - Error: ${error}`])
    } else if (isConnecting) {
      setConnectionLog(prev => [...prev, `${timestamp} - Connecting...`])
    }
  }, [isConnected, isConnecting, error, metrics.connectionId])

  const handleSubscribe = async () => {
    if (selectedSubscription) {
      await subscribe(selectedSubscription)
      setConnectionLog(prev => [...prev, `${new Date().toLocaleTimeString()} - Subscribed to ${selectedSubscription}`])
    }
  }

  const handleUnsubscribe = async (channel: string) => {
    await unsubscribe(channel)
    setConnectionLog(prev => [...prev, `${new Date().toLocaleTimeString()} - Unsubscribed from ${channel}`])
  }

  const handleSendTestMessage = () => {
    if (testMessage.trim()) {
      trackEvent('test_message', { message: testMessage, timestamp: new Date() })
      setConnectionLog(prev => [...prev, `${new Date().toLocaleTimeString()} - Sent test message: ${testMessage}`])
      setTestMessage('')
    }
  }

  const clearLog = () => {
    setConnectionLog([])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Server className="w-6 h-6 text-violet-400" />
          <h2 className="text-xl font-bold text-white">WebSocket Connection</h2>
        </div>
        
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
          isConnected ? 'bg-green-600/20 text-green-400' :
          isConnecting ? 'bg-yellow-600/20 text-yellow-400' :
          'bg-red-600/20 text-red-400'
        }`}>
          {isConnected ? (
            <Wifi className="w-4 h-4" />
          ) : isConnecting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {isConnected ? 'Connected' : isConnecting ? 'Connecting' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Connection Control */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Connection Control</h3>
            
            <div className="space-y-4">
              {/* Connection Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={connect}
                  disabled={isConnected || isConnecting}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Connect
                </button>
                <button
                  onClick={disconnect}
                  disabled={!isConnected}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>

              <button
                onClick={reconnect}
                disabled={!isConnected && !error}
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Reconnect
              </button>

              {/* Connection Metrics */}
              <div className="space-y-3 pt-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Latency</span>
                  <div className="flex items-center space-x-1">
                    <Signal className="w-4 h-4 text-green-400" />
                    <span className="text-white font-mono">{metrics.latency || 0}ms</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Messages</span>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-mono">{metrics.messagesReceived}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Reconnects</span>
                  <div className="flex items-center space-x-1">
                    <RefreshCw className="w-4 h-4 text-orange-400" />
                    <span className="text-white font-mono">{metrics.reconnectAttempts}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Last Update</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-mono text-xs">
                      {metrics.lastUpdate ? metrics.lastUpdate.toLocaleTimeString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-400 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subscriptions & Testing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscriptions */}
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Channel Subscriptions</h3>
            
            <div className="space-y-4">
              {/* Subscribe to new channel */}
              <div className="flex space-x-2">
                <select
                  value={selectedSubscription}
                  onChange={(e) => setSelectedSubscription(e.target.value)}
                  className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Select channel...</option>
                  {availableChannels.map(channel => (
                    <option key={channel} value={channel}>{channel}</option>
                  ))}
                </select>
                <button
                  onClick={handleSubscribe}
                  disabled={!selectedSubscription || !isConnected}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  Subscribe
                </button>
              </div>

              {/* Active subscriptions */}
              <div className="space-y-2">
                <h4 className="text-white font-medium">Active Subscriptions ({metrics.subscriptions.length})</h4>
                {metrics.subscriptions.length === 0 ? (
                  <p className="text-gray-400 text-sm">No active subscriptions</p>
                ) : (
                  <div className="space-y-1">
                    {metrics.subscriptions.map(subscription => (
                      <div key={subscription} className="flex items-center justify-between p-2 bg-gray-700/20 rounded-lg">
                        <span className="text-white text-sm font-mono">{subscription}</span>
                        <button
                          onClick={() => handleUnsubscribe(subscription)}
                          className="px-2 py-1 text-xs bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
                        >
                          Unsubscribe
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Test Message */}
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Send Test Message</h3>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter test message..."
                className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handleSendTestMessage()}
              />
              <button
                onClick={handleSendTestMessage}
                disabled={!testMessage.trim() || !isConnected}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Log */}
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Connection Log</h3>
          <button
            onClick={clearLog}
            className="px-3 py-1 text-sm bg-gray-600/20 text-gray-400 rounded hover:bg-gray-600/30 transition-colors"
          >
            Clear
          </button>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4 h-48 overflow-y-auto">
          {connectionLog.length === 0 ? (
            <p className="text-gray-500 text-sm">No log entries yet...</p>
          ) : (
            <div className="space-y-1">
              {connectionLog.map((entry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-mono text-gray-300"
                >
                  {entry}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}