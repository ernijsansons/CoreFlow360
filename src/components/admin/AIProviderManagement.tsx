/**
 * CoreFlow360 - AI Provider Management
 * Admin interface for managing multiple AI providers and API keys
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Key, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff, 
  TestTube,
  BarChart3,
  Shield,
  Zap,
  Brain,
  DollarSign
} from 'lucide-react'
import { AI_CONFIG } from '@/config/ai.config'

interface ProviderStatus {
  id: string
  name: string
  description: string
  enabled: boolean
  configured: boolean
  lastTested?: Date
  testResult?: boolean
  models: string[]
  supportedFeatures: string[]
  costPerToken: number
  usageStats?: {
    requests: number
    tokens: number
    cost: number
  }
}

export default function AIProviderManagement() {
  const [providers, setProviders] = useState<Record<string, ProviderStatus>>({})
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [usageStats, setUsageStats] = useState<any>({})

  useEffect(() => {
    loadProviderStatus()
    loadUsageStats()
  }, [])

  const loadProviderStatus = async () => {
    try {
      const response = await fetch('/api/admin/ai-providers/status')
      if (response.ok) {
        const data = await response.json()
        setProviders(data.providers || {})
      }
    } catch (error) {
      console.error('Failed to load provider status:', error)
      // Initialize with config data if API fails
      initializeProvidersFromConfig()
    }
  }

  const initializeProvidersFromConfig = () => {
    const initialProviders: Record<string, ProviderStatus> = {}
    
    Object.entries(AI_CONFIG.providers).forEach(([key, config]) => {
      initialProviders[key] = {
        id: key,
        name: config.name,
        description: config.description,
        enabled: config.enabled,
        configured: false,
        models: config.models,
        supportedFeatures: config.supportedFeatures,
        costPerToken: config.costPerToken,
      }
    })
    
    setProviders(initialProviders)
  }

  const loadUsageStats = async () => {
    try {
      const response = await fetch('/api/admin/ai-providers/usage')
      if (response.ok) {
        const data = await response.json()
        setUsageStats(data.usage || {})
      }
    } catch (error) {
      console.error('Failed to load usage stats:', error)
    }
  }

  const handleSaveApiKey = async () => {
    if (!selectedProvider || !apiKey) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/ai-providers/${selectedProvider}/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      })

      if (response.ok) {
        const updatedProvider = { ...providers[selectedProvider] }
        updatedProvider.configured = true
        updatedProvider.enabled = true
        
        setProviders({
          ...providers,
          [selectedProvider]: updatedProvider
        })
        
        setApiKey('')
        setSelectedProvider('')
      } else {
        const error = await response.json()
        console.error('Failed to save API key:', error)
      }
    } catch (error) {
      console.error('Error saving API key:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleTestProvider = async (providerId: string) => {
    setTesting(true)
    try {
      const response = await fetch(`/api/admin/ai-providers/${providerId}/test`, {
        method: 'POST'
      })

      const result = await response.json()
      
      const updatedProvider = { ...providers[providerId] }
      updatedProvider.lastTested = new Date()
      updatedProvider.testResult = result.success
      
      setProviders({
        ...providers,
        [providerId]: updatedProvider
      })
    } catch (error) {
      console.error('Provider test failed:', error)
    } finally {
      setTesting(false)
    }
  }

  const handleToggleProvider = async (providerId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/ai-providers/${providerId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })

      if (response.ok) {
        const updatedProvider = { ...providers[providerId] }
        updatedProvider.enabled = enabled
        
        setProviders({
          ...providers,
          [providerId]: updatedProvider
        })
      }
    } catch (error) {
      console.error('Failed to toggle provider:', error)
    }
  }

  const handleRemoveProvider = async (providerId: string) => {
    if (!confirm(`Remove ${providers[providerId]?.name} configuration? This will disable the provider.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/ai-providers/${providerId}/remove`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const updatedProvider = { ...providers[providerId] }
        updatedProvider.configured = false
        updatedProvider.enabled = false
        
        setProviders({
          ...providers,
          [providerId]: updatedProvider
        })
      }
    } catch (error) {
      console.error('Failed to remove provider:', error)
    }
  }

  const getProviderIcon = (providerId: string) => {
    const icons: Record<string, React.ReactNode> = {
      openai: <Brain className="w-5 h-5 text-green-600" />,
      anthropic: <Shield className="w-5 h-5 text-orange-600" />,
      google: <Zap className="w-5 h-5 text-blue-600" />,
      cohere: <BarChart3 className="w-5 h-5 text-purple-600" />,
      mistral: <DollarSign className="w-5 h-5 text-indigo-600" />
    }
    return icons[providerId] || <Settings className="w-5 h-5" />
  }

  const getStatusColor = (provider: ProviderStatus) => {
    if (!provider.configured) return 'gray'
    if (!provider.enabled) return 'yellow'
    if (provider.testResult === false) return 'red'
    return 'green'
  }

  const getStatusText = (provider: ProviderStatus) => {
    if (!provider.configured) return 'Not Configured'
    if (!provider.enabled) return 'Disabled'
    if (provider.testResult === false) return 'Connection Failed'
    return 'Active'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Provider Management</h1>
          <p className="text-gray-600">Configure and manage multiple AI providers</p>
        </div>
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          <div className="grid gap-6">
            {Object.entries(providers).map(([providerId, provider]) => (
              <Card key={providerId} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getProviderIcon(providerId)}
                      <div>
                        <CardTitle className="text-xl">{provider.name}</CardTitle>
                        <CardDescription>{provider.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(provider) as any}>
                        {getStatusText(provider)}
                      </Badge>
                      <Switch
                        checked={provider.enabled}
                        onCheckedChange={(enabled) => handleToggleProvider(providerId, enabled)}
                        disabled={!provider.configured}
                      />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Models</h4>
                      <div className="flex flex-wrap gap-1">
                        {provider.models.map(model => (
                          <Badge key={model} variant="outline" className="text-xs">
                            {model}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {provider.supportedFeatures.map(feature => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Cost</h4>
                      <p className="text-sm font-mono">
                        ${provider.costPerToken.toFixed(6)}/token
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4 border-t">
                    {!provider.configured ? (
                      <Button 
                        onClick={() => setSelectedProvider(providerId)}
                        className="flex items-center space-x-2"
                      >
                        <Key className="w-4 h-4" />
                        <span>Configure API Key</span>
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleTestProvider(providerId)}
                          disabled={testing}
                          className="flex items-center space-x-2"
                        >
                          <TestTube className="w-4 h-4" />
                          <span>{testing ? 'Testing...' : 'Test Connection'}</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => setSelectedProvider(providerId)}
                          className="flex items-center space-x-2"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Update Key</span>
                        </Button>
                        
                        <Button
                          variant="destructive"
                          onClick={() => handleRemoveProvider(providerId)}
                          className="flex items-center space-x-2"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Remove</span>
                        </Button>
                      </>
                    )}
                    
                    {provider.lastTested && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500 ml-auto">
                        {provider.testResult ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span>
                          Last tested: {provider.lastTested.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>
                Monitor AI provider usage, costs, and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(usageStats).map(([providerId, stats]: [string, any]) => (
                  <div key={providerId} className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      {getProviderIcon(providerId)}
                      <h4 className="font-medium">{providers[providerId]?.name}</h4>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>Requests: <span className="font-mono">{stats.requests || 0}</span></p>
                      <p>Tokens: <span className="font-mono">{stats.tokens || 0}</span></p>
                      <p>Cost: <span className="font-mono">${(stats.cost || 0).toFixed(4)}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Global AI Settings</CardTitle>
              <CardDescription>
                Configure global AI behavior and fallback strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Provider Strategy</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Configure how providers are selected for different tasks
                  </p>
                  <div className="grid gap-4">
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">Task-Specific Routing</h5>
                      <div className="space-y-2 text-sm">
                        <p><strong>Reasoning:</strong> Anthropic Claude</p>
                        <p><strong>Code Generation:</strong> OpenAI GPT-4</p>
                        <p><strong>Vision:</strong> Google Gemini</p>
                        <p><strong>Embeddings:</strong> Cohere</p>
                        <p><strong>Cost Optimization:</strong> Mistral AI</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Safety Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Cost Monitoring</p>
                        <p className="text-sm text-gray-600">Monitor and limit AI costs</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Fallback Strategy</p>
                        <p className="text-sm text-gray-600">Automatically fallback to available providers</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Load Balancing</p>
                        <p className="text-sm text-gray-600">Distribute requests across providers</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Key Configuration Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Configure {providers[selectedProvider]?.name}</CardTitle>
              <CardDescription>
                Enter the API key for {providers[selectedProvider]?.name}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key</label>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API key..."
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedProvider('')
                    setApiKey('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveApiKey}
                  disabled={!apiKey || saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}