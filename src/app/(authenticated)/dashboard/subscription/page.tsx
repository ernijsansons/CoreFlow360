/**
 * CoreFlow360 - Subscription Management Page
 * Manage your subscription, modules, and usage
 */

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CreditCard,
  Package,
  Activity,
  Settings,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Zap,
  TrendingUp,
} from 'lucide-react'
import { api, ApiError } from '@/lib/api-client'

interface SubscriptionData {
  status: string
  tier: string
  bundle: {
    name: string
    category: string
    basePrice: number
    perUserPrice: number
  }
  users: number
  price: number
  billingCycle: string
  nextBillingDate: string
  activeModules: string[]
  usage: {
    api_calls: { used: number; limit: number }
    storage: { used: number; limit: number }
    users: { used: number; limit: number }
  }
}

interface ModuleInfo {
  id: string
  name: string
  description: string
  category: string
  accessible: boolean
  usage?: {
    used: number
    limit: number
    period: string
  }
}

export default function SubscriptionPage() {
  const { data: session } = useSession()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [modules, setModules] = useState<ModuleInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchSubscriptionData()
    fetchModulesData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      const response = await api.get<SubscriptionData>('/api/subscriptions/current')
      if (response.success && response.data) {
        setSubscription(response.data)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        // Could show error toast here
      }
    }
  }

  const fetchModulesData = async () => {
    try {
      const response = await api.post<{ allModules: ModuleInfo[] }>('/api/modules', {})
      if (response.success && response.data) {
        setModules(response.data.allModules)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        // Could show error toast here
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
      </div>
    )
  }

  const usagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((used / limit) * 100, 100)
  }

  const formatNumber = (num: number) => {
    if (num === -1) return 'Unlimited'
    return num.toLocaleString()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground">
          Manage your CoreFlow360 subscription, modules, and usage
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Current Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </CardHeader>
            <CardContent>
              {subscription && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{subscription.bundle.name}</h3>
                      <p className="text-muted-foreground capitalize">{subscription.tier} Tier</p>
                    </div>
                    <Badge
                      variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className="px-3 py-1"
                    >
                      {subscription.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Monthly Cost</p>
                      <p className="text-2xl font-semibold">${subscription.price}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Users</p>
                      <p className="text-2xl font-semibold">{subscription.users}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Billing Cycle</p>
                      <p className="text-2xl font-semibold capitalize">
                        {subscription.billingCycle}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Upgrade Plan
                    </Button>
                    <Button variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Users
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscription?.activeModules.length || 0}</div>
                <p className="text-muted-foreground text-xs">of {modules.length} available</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">API Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscription?.usage.api_calls.used.toLocaleString() || 0}
                </div>
                <Progress
                  value={usagePercentage(
                    subscription?.usage.api_calls.used || 0,
                    subscription?.usage.api_calls.limit || 1
                  )}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscription?.usage.storage.used || 0} GB</div>
                <Progress
                  value={usagePercentage(
                    subscription?.usage.storage.used || 0,
                    subscription?.usage.storage.limit || 1
                  )}
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Modules</CardTitle>
              <CardDescription>Modules included in your subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-lg p-2 ${
                          module.accessible ? 'bg-primary/10' : 'bg-muted'
                        }`}
                      >
                        <Package
                          className={`h-5 w-5 ${
                            module.accessible ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{module.name}</h4>
                        <p className="text-muted-foreground text-sm">{module.description}</p>
                        <Badge variant="outline" className="mt-1">
                          {module.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {module.accessible ? (
                        <>
                          <Check className="h-5 w-5 text-green-500" />
                          <Button variant="outline" size="sm">
                            Configure
                          </Button>
                        </>
                      ) : (
                        <>
                          <X className="text-muted-foreground h-5 w-5" />
                          <Button variant="outline" size="sm">
                            <Zap className="mr-1 h-3 w-3" />
                            Upgrade
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
              <CardDescription>Monitor your usage across different resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {subscription && (
                <>
                  {/* API Calls */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">API Calls</h4>
                        <p className="text-muted-foreground text-sm">
                          Daily limit resets at midnight
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {formatNumber(subscription.usage.api_calls.used)} /{' '}
                        {formatNumber(subscription.usage.api_calls.limit)}
                      </span>
                    </div>
                    <Progress
                      value={usagePercentage(
                        subscription.usage.api_calls.used,
                        subscription.usage.api_calls.limit
                      )}
                      className="h-2"
                    />
                  </div>

                  {/* Storage */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Storage</h4>
                        <p className="text-muted-foreground text-sm">
                          Total storage used across all modules
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {subscription.usage.storage.used} GB /{' '}
                        {formatNumber(subscription.usage.storage.limit)} GB
                      </span>
                    </div>
                    <Progress
                      value={usagePercentage(
                        subscription.usage.storage.used,
                        subscription.usage.storage.limit
                      )}
                      className="h-2"
                    />
                  </div>

                  {/* Users */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Active Users</h4>
                        <p className="text-muted-foreground text-sm">
                          Number of users in your organization
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {subscription.usage.users.used} /{' '}
                        {formatNumber(subscription.usage.users.limit)}
                      </span>
                    </div>
                    <Progress
                      value={usagePercentage(
                        subscription.usage.users.used,
                        subscription.usage.users.limit
                      )}
                      className="h-2"
                    />
                  </div>
                </>
              )}

              {/* Usage Tips */}
              <div className="bg-muted mt-6 rounded-lg p-4">
                <div className="mb-2 flex gap-2">
                  <AlertCircle className="text-primary h-5 w-5" />
                  <h4 className="font-medium">Usage Tips</h4>
                </div>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• API calls reset daily at midnight UTC</li>
                  <li>• Upgrade to Ultimate tier for unlimited resources</li>
                  <li>• Monitor usage regularly to avoid service interruptions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your payment method and billing details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-muted-foreground text-sm">Expires 12/24</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Next billing date</span>
                    <span className="font-medium">{subscription?.nextBillingDate}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Billing cycle</span>
                    <span className="font-medium capitalize">{subscription?.billingCycle}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Next payment</span>
                    <span className="font-medium">${subscription?.price}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline">Download Invoice</Button>
                  <Button variant="outline">View Billing History</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade CTA */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Ready to grow?</CardTitle>
              <CardDescription>
                Unlock more features and resources with a higher tier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Zap className="mr-2 h-4 w-4" />
                Explore Upgrade Options
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
