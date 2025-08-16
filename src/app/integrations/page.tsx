'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  Plug,
  Settings,
  BarChart3,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  Activity
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  provider: string
  category: string
  description: string
  icon: string
  status: 'active' | 'beta' | 'deprecated' | 'coming-soon'
  popularity: number
  authType: 'oauth2' | 'api-key' | 'basic' | 'certificate' | 'webhook'
  connected: boolean
  lastSync?: Date
  syncStatus?: 'syncing' | 'success' | 'error'
  recordCount?: number
  pricing: {
    model: 'free' | 'usage' | 'subscription'
    freeLimit?: number
  }
}

interface ActiveIntegration {
  id: string
  name: string
  provider: string
  status: 'connected' | 'error' | 'syncing' | 'paused'
  lastSync: Date
  recordCount: number
  errorCount: number
  syncFrequency: string
}

export default function IntegrationsFortress() {
  const [view, setView] = useState<'browse' | 'connected' | 'analytics'>('browse')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [activeIntegrations, setActiveIntegrations] = useState<ActiveIntegration[]>([])
  const [loading, setLoading] = useState(false)

  const categories = [
    { name: 'All', count: 500, icon: '🔗' },
    { name: 'CRM', count: 85, icon: '👥' },
    { name: 'Accounting', count: 67, icon: '💰' },
    { name: 'E-commerce', count: 92, icon: '🛒' },
    { name: 'Marketing', count: 78, icon: '📢' },
    { name: 'Communication', count: 45, icon: '💬' },
    { name: 'HR', count: 34, icon: '🧑‍💼' },
    { name: 'Project Management', count: 56, icon: '📊' },
    { name: 'Storage', count: 29, icon: '📁' },
    { name: 'Analytics', count: 41, icon: '📈' }
  ]

  const mockIntegrations: Integration[] = [
    {
      id: 'salesforce-crm',
      name: 'Salesforce CRM',
      provider: 'Salesforce',
      category: 'CRM',
      description: 'Complete Salesforce CRM integration with leads, opportunities, and accounts',
      icon: '/integrations/salesforce.svg',
      status: 'active',
      popularity: 95,
      authType: 'oauth2',
      connected: true,
      lastSync: new Date('2024-01-10T14:30:00Z'),
      syncStatus: 'success',
      recordCount: 15847,
      pricing: { model: 'free', freeLimit: 10000 }
    },
    {
      id: 'quickbooks-online',
      name: 'QuickBooks Online',
      provider: 'Intuit',
      category: 'Accounting',
      description: 'Full QuickBooks integration for invoices, expenses, and financial data',
      icon: '/integrations/quickbooks.svg',
      status: 'active',
      popularity: 88,
      authType: 'oauth2',
      connected: false,
      pricing: { model: 'free', freeLimit: 5000 }
    },
    {
      id: 'shopify-store',
      name: 'Shopify Store',
      provider: 'Shopify Inc.',
      category: 'E-commerce',
      description: 'Complete Shopify integration for orders, customers, and inventory',
      icon: '/integrations/shopify.svg',
      status: 'active',
      popularity: 85,
      authType: 'api-key',
      connected: true,
      lastSync: new Date('2024-01-10T13:45:00Z'),
      syncStatus: 'syncing',
      recordCount: 8934,
      pricing: { model: 'free', freeLimit: 2500 }
    },
    {
      id: 'slack-workspace',
      name: 'Slack Workspace',
      provider: 'Slack Technologies',
      category: 'Communication',
      description: 'Slack integration for notifications, channels, and team communication',
      icon: '/integrations/slack.svg',
      status: 'active',
      popularity: 92,
      authType: 'oauth2',
      connected: true,
      lastSync: new Date('2024-01-10T14:25:00Z'),
      syncStatus: 'error',
      recordCount: 2341,
      pricing: { model: 'free', freeLimit: 10000 }
    },
    {
      id: 'hubspot-crm',
      name: 'HubSpot CRM',
      provider: 'HubSpot',
      category: 'CRM',
      description: 'HubSpot CRM and marketing automation platform integration',
      icon: '/integrations/hubspot.svg',
      status: 'active',
      popularity: 83,
      authType: 'oauth2',
      connected: false,
      pricing: { model: 'free', freeLimit: 7500 }
    },
    {
      id: 'stripe-payments',
      name: 'Stripe Payments',
      provider: 'Stripe',
      category: 'Accounting',
      description: 'Stripe payment processing and subscription management',
      icon: '/integrations/stripe.svg',
      status: 'active',
      popularity: 91,
      authType: 'api-key',
      connected: false,
      pricing: { model: 'usage' }
    }
  ]

  const mockActiveIntegrations: ActiveIntegration[] = [
    {
      id: 'salesforce-crm-001',
      name: 'Salesforce CRM',
      provider: 'Salesforce',
      status: 'connected',
      lastSync: new Date('2024-01-10T14:30:00Z'),
      recordCount: 15847,
      errorCount: 0,
      syncFrequency: 'Real-time'
    },
    {
      id: 'shopify-store-001',
      name: 'Shopify Store',
      provider: 'Shopify',
      status: 'syncing',
      lastSync: new Date('2024-01-10T13:45:00Z'),
      recordCount: 8934,
      errorCount: 0,
      syncFrequency: 'Hourly'
    },
    {
      id: 'slack-workspace-001',
      name: 'Slack Workspace',
      provider: 'Slack',
      status: 'error',
      lastSync: new Date('2024-01-10T12:15:00Z'),
      recordCount: 2341,
      errorCount: 5,
      syncFrequency: 'Real-time'
    }
  ]

  useEffect(() => {
    setIntegrations(mockIntegrations)
    setActiveIntegrations(mockActiveIntegrations)
  }, [])

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.provider.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === '' || selectedCategory === 'All' || 
                           integration.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const connectIntegration = async (integrationId: string) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const integration = integrations.find(i => i.id === integrationId)
      if (integration) {
        integration.connected = true
        integration.lastSync = new Date()
        integration.syncStatus = 'success'
        integration.recordCount = Math.floor(Math.random() * 10000) + 1000
        
        setIntegrations([...integrations])
      }
    } catch (error) {
      console.error('Failed to connect integration:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'success':
        return 'text-green-400'
      case 'syncing':
        return 'text-blue-400'
      case 'error':
        return 'text-red-400'
      case 'paused':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'success':
        return CheckCircle
      case 'syncing':
        return RefreshCw
      case 'error':
        return AlertCircle
      case 'paused':
        return Clock
      default:
        return Activity
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold mb-2"
              >
                Integration <span className="gradient-text-ai">Fortress</span>
              </motion.h1>
              <p className="text-xl text-gray-300">
                500+ pre-built integrations with enterprise-grade security
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl px-6 py-3"
              >
                <div className="text-2xl font-bold text-green-400">
                  {activeIntegrations.length}
                </div>
                <div className="text-gray-300 text-sm">Connected</div>
              </motion.div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-8">
            {[
              { id: 'browse', label: 'Browse Integrations', icon: Grid },
              { id: 'connected', label: 'Connected', icon: Plug },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id as any)}
                  className={`flex items-center px-4 py-2 rounded-xl transition-all ${
                    view === tab.id
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {view === 'browse' && (
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="lg:w-80 space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search integrations..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/40 border border-gray-700/50 rounded-xl text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>

                  {/* Categories */}
                  <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category.name}
                          onClick={() => setSelectedCategory(category.name === 'All' ? '' : category.name)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                            selectedCategory === category.name || (selectedCategory === '' && category.name === 'All')
                              ? 'bg-violet-600/20 text-violet-300'
                              : 'text-gray-300 hover:bg-gray-700/30'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="mr-3 text-lg">{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                          <span className="text-gray-400 text-sm">{category.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Popular Integrations */}
                  <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Most Popular</h3>
                    <div className="space-y-3">
                      {integrations
                        .filter(i => i.popularity >= 90)
                        .slice(0, 3)
                        .map((integration) => (
                          <div key={integration.id} className="flex items-center">
                            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                              <Plug className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <div className="text-white text-sm font-medium">{integration.name}</div>
                              <div className="flex items-center">
                                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                                <span className="text-gray-400 text-xs">{integration.popularity}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                  {/* Controls */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-gray-300">
                      {filteredIntegrations.length} of {integrations.length} integrations
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center bg-gray-800/40 border border-gray-700/50 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded ${viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-gray-400'}`}
                        >
                          <Grid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-gray-400'}`}
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Integrations Grid/List */}
                  <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                    {filteredIntegrations.map((integration, index) => (
                      <motion.div
                        key={integration.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 ${
                          viewMode === 'list' ? 'flex items-center' : ''
                        }`}
                      >
                        <div className={viewMode === 'list' ? 'flex items-center flex-1' : ''}>
                          {/* Icon & Status */}
                          <div className={`${viewMode === 'list' ? 'mr-4' : 'mb-4'} relative`}>
                            <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center">
                              <Plug className="w-6 h-6 text-gray-400" />
                            </div>
                            {integration.connected && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                            <div className={`${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                              <div>
                                <h3 className="text-lg font-semibold text-white mb-1">{integration.name}</h3>
                                <p className="text-gray-400 text-sm mb-2">{integration.provider}</p>
                                {viewMode === 'grid' && (
                                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{integration.description}</p>
                                )}
                              </div>

                              {viewMode === 'list' && (
                                <div className="text-right">
                                  <div className="flex items-center mb-2">
                                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                    <span className="text-gray-400 text-sm">{integration.popularity}%</span>
                                  </div>
                                  <div className={`px-2 py-1 rounded text-xs ${
                                    integration.status === 'active' 
                                      ? 'bg-green-600/20 text-green-400'
                                      : 'bg-gray-600/20 text-gray-400'
                                  }`}>
                                    {integration.status}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Status & Stats */}
                            {integration.connected && (
                              <div className={`${viewMode === 'list' ? 'flex items-center space-x-4 mt-2' : 'mb-4'}`}>
                                <div className="flex items-center text-sm text-gray-400">
                                  <Activity className="w-4 h-4 mr-1" />
                                  {integration.recordCount?.toLocaleString()} records
                                </div>
                                <div className={`flex items-center text-sm ${getStatusColor(integration.syncStatus || 'connected')}`}>
                                  {(() => {
                                    const Icon = getStatusIcon(integration.syncStatus || 'connected')
                                    return <Icon className="w-4 h-4 mr-1" />
                                  })()}
                                  Last sync: {integration.lastSync?.toLocaleTimeString()}
                                </div>
                              </div>
                            )}

                            {viewMode === 'grid' && (
                              <>
                                {/* Tags */}
                                <div className="flex items-center justify-between mb-4">
                                  <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">
                                    {integration.category}
                                  </span>
                                  <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                    <span className="text-gray-400 text-sm">{integration.popularity}%</span>
                                  </div>
                                </div>

                                {/* Action Button */}
                                <button
                                  onClick={() => !integration.connected && connectIntegration(integration.id)}
                                  disabled={integration.connected || loading}
                                  className={`w-full py-2 px-4 rounded-xl font-medium transition-all ${
                                    integration.connected
                                      ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                                      : 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 text-white'
                                  } disabled:opacity-50`}
                                >
                                  {integration.connected ? 'Connected' : 'Connect'}
                                </button>
                              </>
                            )}
                          </div>

                          {viewMode === 'list' && (
                            <div className="ml-4">
                              <button
                                onClick={() => !integration.connected && connectIntegration(integration.id)}
                                disabled={integration.connected || loading}
                                className={`py-2 px-6 rounded-xl font-medium transition-all ${
                                  integration.connected
                                    ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                                    : 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 text-white'
                                } disabled:opacity-50`}
                              >
                                {integration.connected ? 'Connected' : 'Connect'}
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'connected' && (
            <motion.div
              key="connected"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Connected Integrations</h2>
                <p className="text-gray-300">Manage your active integrations and sync settings</p>
              </div>

              <div className="space-y-6">
                {activeIntegrations.map((integration, index) => (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center mr-4">
                          <Plug className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                          <p className="text-gray-400">{integration.provider}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center px-3 py-1 rounded-lg ${
                          integration.status === 'connected' ? 'bg-green-600/20 text-green-400' :
                          integration.status === 'syncing' ? 'bg-blue-600/20 text-blue-400' :
                          integration.status === 'error' ? 'bg-red-600/20 text-red-400' :
                          'bg-yellow-600/20 text-yellow-400'
                        }`}>
                          {(() => {
                            const Icon = getStatusIcon(integration.status)
                            return <Icon className={`w-4 h-4 mr-2 ${integration.status === 'syncing' ? 'animate-spin' : ''}`} />
                          })()}
                          {integration.status}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-white transition-colors">
                            <Settings className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-white transition-colors">
                            <RefreshCw className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                      <div>
                        <div className="text-2xl font-bold text-white">{integration.recordCount.toLocaleString()}</div>
                        <div className="text-gray-400 text-sm">Records Synced</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-300">{integration.syncFrequency}</div>
                        <div className="text-gray-400 text-sm">Sync Frequency</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-300">{integration.lastSync.toLocaleDateString()}</div>
                        <div className="text-gray-400 text-sm">Last Sync</div>
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${integration.errorCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {integration.errorCount}
                        </div>
                        <div className="text-gray-400 text-sm">Errors</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Integration Analytics</h2>
                <p className="text-gray-300">Monitor performance and usage across all integrations</p>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-violet-400 mb-2">500+</div>
                  <div className="text-gray-300">Available Integrations</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-green-400 mb-2">{activeIntegrations.length}</div>
                  <div className="text-gray-300">Connected</div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {activeIntegrations.reduce((sum, i) => sum + i.recordCount, 0).toLocaleString()}
                  </div>
                  <div className="text-gray-300">Records Synced</div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-orange-400 mb-2">99.8%</div>
                  <div className="text-gray-300">Uptime</div>
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-white mb-6">Sync Performance</h3>
                <div className="text-gray-300 text-center py-12">
                  📊 Interactive analytics dashboard would be implemented here with charts showing:
                  <br />• Sync frequency and success rates
                  <br />• Data volume trends over time
                  <br />• Integration performance metrics
                  <br />• Error tracking and resolution
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}