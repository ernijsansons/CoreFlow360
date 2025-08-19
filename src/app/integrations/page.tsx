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
  Activity,
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
    { name: 'Analytics', count: 41, icon: '📈' },
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
      pricing: { model: 'free', freeLimit: 10000 },
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
      pricing: { model: 'free', freeLimit: 5000 },
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
      pricing: { model: 'free', freeLimit: 2500 },
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
      pricing: { model: 'free', freeLimit: 10000 },
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
      pricing: { model: 'free', freeLimit: 7500 },
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
      pricing: { model: 'usage' },
    },
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
      syncFrequency: 'Real-time',
    },
    {
      id: 'shopify-store-001',
      name: 'Shopify Store',
      provider: 'Shopify',
      status: 'syncing',
      lastSync: new Date('2024-01-10T13:45:00Z'),
      recordCount: 8934,
      errorCount: 0,
      syncFrequency: 'Hourly',
    },
    {
      id: 'slack-workspace-001',
      name: 'Slack Workspace',
      provider: 'Slack',
      status: 'error',
      lastSync: new Date('2024-01-10T12:15:00Z'),
      recordCount: 2341,
      errorCount: 5,
      syncFrequency: 'Real-time',
    },
  ]

  useEffect(() => {
    setIntegrations(mockIntegrations)
    setActiveIntegrations(mockActiveIntegrations)
  }, [])

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.provider.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === '' ||
      selectedCategory === 'All' ||
      integration.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const connectIntegration = async (integrationId: string) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const integration = integrations.find((i) => i.id === integrationId)
      if (integration) {
        integration.connected = true
        integration.lastSync = new Date()
        integration.syncStatus = 'success'
        integration.recordCount = Math.floor(Math.random() * 10000) + 1000

        setIntegrations([...integrations])
      }
    } catch (error) {
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2 text-4xl font-bold"
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
                className="rounded-xl border border-green-500/30 bg-gradient-to-r from-green-600/20 to-emerald-600/20 px-6 py-3"
              >
                <div className="text-2xl font-bold text-green-400">{activeIntegrations.length}</div>
                <div className="text-sm text-gray-300">Connected</div>
              </motion.div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-8">
            {[
              { id: 'browse', label: 'Browse Integrations', icon: Grid },
              { id: 'connected', label: 'Connected', icon: Plug },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id as unknown)}
                  className={`flex items-center rounded-xl px-4 py-2 transition-all ${
                    view === tab.id
                      ? 'border border-violet-500/30 bg-violet-600/20 text-violet-300'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className="mr-2 h-5 w-5" />
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
              <div className="flex flex-col gap-8 lg:flex-row">
                {/* Sidebar */}
                <div className="space-y-6 lg:w-80">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search integrations..."
                      className="w-full rounded-xl border border-gray-700/50 bg-gray-800/40 py-3 pr-4 pl-10 text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>

                  {/* Categories */}
                  <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
                    <h3 className="mb-4 text-lg font-semibold text-white">Categories</h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category.name}
                          onClick={() =>
                            setSelectedCategory(category.name === 'All' ? '' : category.name)
                          }
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                            selectedCategory === category.name ||
                            (selectedCategory === '' && category.name === 'All')
                              ? 'bg-violet-600/20 text-violet-300'
                              : 'text-gray-300 hover:bg-gray-700/30'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="mr-3 text-lg">{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                          <span className="text-sm text-gray-400">{category.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Popular Integrations */}
                  <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm">
                    <h3 className="mb-4 text-lg font-semibold text-white">Most Popular</h3>
                    <div className="space-y-3">
                      {integrations
                        .filter((i) => i.popularity >= 90)
                        .slice(0, 3)
                        .map((integration) => (
                          <div key={integration.id} className="flex items-center">
                            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700">
                              <Plug className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">
                                {integration.name}
                              </div>
                              <div className="flex items-center">
                                <Star className="mr-1 h-3 w-3 text-yellow-400" />
                                <span className="text-xs text-gray-400">
                                  {integration.popularity}%
                                </span>
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
                  <div className="mb-6 flex items-center justify-between">
                    <div className="text-gray-300">
                      {filteredIntegrations.length} of {integrations.length} integrations
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center rounded-lg border border-gray-700/50 bg-gray-800/40 p-1">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`rounded p-2 ${viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-gray-400'}`}
                        >
                          <Grid className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`rounded p-2 ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-gray-400'}`}
                        >
                          <List className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Integrations Grid/List */}
                  <div
                    className={
                      viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 xl:grid-cols-3' : 'space-y-4'
                    }
                  >
                    {filteredIntegrations.map((integration, index) => (
                      <motion.div
                        key={integration.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm ${
                          viewMode === 'list' ? 'flex items-center' : ''
                        }`}
                      >
                        <div className={viewMode === 'list' ? 'flex flex-1 items-center' : ''}>
                          {/* Icon & Status */}
                          <div className={`${viewMode === 'list' ? 'mr-4' : 'mb-4'} relative`}>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-700">
                              <Plug className="h-6 w-6 text-gray-400" />
                            </div>
                            {integration.connected && (
                              <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                            <div
                              className={`${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}
                            >
                              <div>
                                <h3 className="mb-1 text-lg font-semibold text-white">
                                  {integration.name}
                                </h3>
                                <p className="mb-2 text-sm text-gray-400">{integration.provider}</p>
                                {viewMode === 'grid' && (
                                  <p className="mb-4 line-clamp-2 text-sm text-gray-300">
                                    {integration.description}
                                  </p>
                                )}
                              </div>

                              {viewMode === 'list' && (
                                <div className="text-right">
                                  <div className="mb-2 flex items-center">
                                    <Star className="mr-1 h-4 w-4 text-yellow-400" />
                                    <span className="text-sm text-gray-400">
                                      {integration.popularity}%
                                    </span>
                                  </div>
                                  <div
                                    className={`rounded px-2 py-1 text-xs ${
                                      integration.status === 'active'
                                        ? 'bg-green-600/20 text-green-400'
                                        : 'bg-gray-600/20 text-gray-400'
                                    }`}
                                  >
                                    {integration.status}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Status & Stats */}
                            {integration.connected && (
                              <div
                                className={`${viewMode === 'list' ? 'mt-2 flex items-center space-x-4' : 'mb-4'}`}
                              >
                                <div className="flex items-center text-sm text-gray-400">
                                  <Activity className="mr-1 h-4 w-4" />
                                  {integration.recordCount?.toLocaleString()} records
                                </div>
                                <div
                                  className={`flex items-center text-sm ${getStatusColor(integration.syncStatus || 'connected')}`}
                                >
                                  {(() => {
                                    const Icon = getStatusIcon(
                                      integration.syncStatus || 'connected'
                                    )
                                    return <Icon className="mr-1 h-4 w-4" />
                                  })()}
                                  Last sync: {integration.lastSync?.toLocaleTimeString()}
                                </div>
                              </div>
                            )}

                            {viewMode === 'grid' && (
                              <>
                                {/* Tags */}
                                <div className="mb-4 flex items-center justify-between">
                                  <span className="rounded bg-gray-700/50 px-2 py-1 text-xs text-gray-300">
                                    {integration.category}
                                  </span>
                                  <div className="flex items-center">
                                    <Star className="mr-1 h-4 w-4 text-yellow-400" />
                                    <span className="text-sm text-gray-400">
                                      {integration.popularity}%
                                    </span>
                                  </div>
                                </div>

                                {/* Action Button */}
                                <button
                                  onClick={() =>
                                    !integration.connected && connectIntegration(integration.id)
                                  }
                                  disabled={integration.connected || loading}
                                  className={`w-full rounded-xl px-4 py-2 font-medium transition-all ${
                                    integration.connected
                                      ? 'border border-green-500/30 bg-green-600/20 text-green-400'
                                      : 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white hover:opacity-90'
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
                                onClick={() =>
                                  !integration.connected && connectIntegration(integration.id)
                                }
                                disabled={integration.connected || loading}
                                className={`rounded-xl px-6 py-2 font-medium transition-all ${
                                  integration.connected
                                    ? 'border border-green-500/30 bg-green-600/20 text-green-400'
                                    : 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white hover:opacity-90'
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
                <h2 className="mb-4 text-2xl font-bold text-white">Connected Integrations</h2>
                <p className="text-gray-300">Manage your active integrations and sync settings</p>
              </div>

              <div className="space-y-6">
                {activeIntegrations.map((integration, index) => (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-6 backdrop-blur-sm"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-700">
                          <Plug className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                          <p className="text-gray-400">{integration.provider}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div
                          className={`flex items-center rounded-lg px-3 py-1 ${
                            integration.status === 'connected'
                              ? 'bg-green-600/20 text-green-400'
                              : integration.status === 'syncing'
                                ? 'bg-blue-600/20 text-blue-400'
                                : integration.status === 'error'
                                  ? 'bg-red-600/20 text-red-400'
                                  : 'bg-yellow-600/20 text-yellow-400'
                          }`}
                        >
                          {(() => {
                            const Icon = getStatusIcon(integration.status)
                            return (
                              <Icon
                                className={`mr-2 h-4 w-4 ${integration.status === 'syncing' ? 'animate-spin' : ''}`}
                              />
                            )
                          })()}
                          {integration.status}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 transition-colors hover:text-white">
                            <Settings className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-gray-400 transition-colors hover:text-white">
                            <RefreshCw className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-4">
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {integration.recordCount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">Records Synced</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-300">
                          {integration.syncFrequency}
                        </div>
                        <div className="text-sm text-gray-400">Sync Frequency</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-300">
                          {integration.lastSync.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-400">Last Sync</div>
                      </div>
                      <div>
                        <div
                          className={`text-2xl font-bold ${integration.errorCount > 0 ? 'text-red-400' : 'text-green-400'}`}
                        >
                          {integration.errorCount}
                        </div>
                        <div className="text-sm text-gray-400">Errors</div>
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
                <h2 className="mb-4 text-2xl font-bold text-white">Integration Analytics</h2>
                <p className="text-gray-300">
                  Monitor performance and usage across all integrations
                </p>
              </div>

              <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 to-purple-600/20 p-6">
                  <div className="mb-2 text-3xl font-bold text-violet-400">500+</div>
                  <div className="text-gray-300">Available Integrations</div>
                </div>

                <div className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-600/20 to-emerald-600/20 p-6">
                  <div className="mb-2 text-3xl font-bold text-green-400">
                    {activeIntegrations.length}
                  </div>
                  <div className="text-gray-300">Connected</div>
                </div>

                <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 p-6">
                  <div className="mb-2 text-3xl font-bold text-blue-400">
                    {activeIntegrations.reduce((sum, i) => sum + i.recordCount, 0).toLocaleString()}
                  </div>
                  <div className="text-gray-300">Records Synced</div>
                </div>

                <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-600/20 to-red-600/20 p-6">
                  <div className="mb-2 text-3xl font-bold text-orange-400">99.8%</div>
                  <div className="text-gray-300">Uptime</div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-8 backdrop-blur-sm">
                <h3 className="mb-6 text-xl font-semibold text-white">Sync Performance</h3>
                <div className="py-12 text-center text-gray-300">
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
