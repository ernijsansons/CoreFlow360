/**
 * CoreFlow360 - Subscription Upgrade Modal
 * Interactive upgrade flow with pricing calculator
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Check, Zap, TrendingUp, Users, Package, CreditCard, Loader2 } from 'lucide-react'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  currentTier: string
  currentUsers: number
  currentBundles: string[]
}

interface PricingOption {
  tier: string
  name: string
  description: string
  basePrice: number
  perUserPrice: number
  features: string[]
  highlighted?: boolean
}

const PRICING_TIERS: PricingOption[] = [
  {
    tier: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams',
    basePrice: 0,
    perUserPrice: 7.25,
    features: [
      'Up to 5 users',
      'Core CRM & Sales',
      'Basic Finance',
      '100 AI credits/month',
      '10GB storage',
    ],
  },
  {
    tier: 'professional',
    name: 'Professional',
    description: 'For growing businesses',
    basePrice: 0,
    perUserPrice: 18,
    features: [
      'Up to 50 users',
      'Advanced CRM & Automation',
      'Full Finance Suite',
      'HR Basics',
      '1,000 AI credits/month',
      '100GB storage',
    ],
    highlighted: true,
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'Advanced features & support',
    basePrice: 0,
    perUserPrice: 36,
    features: [
      'Unlimited users',
      'All features',
      'Custom workflows',
      'API access',
      '10,000 AI credits/month',
      '1TB storage',
      'Priority support',
    ],
  },
  {
    tier: 'ultimate',
    name: 'Ultimate AI-First',
    description: 'Unlimited everything',
    basePrice: 0,
    perUserPrice: 58,
    features: [
      'Unlimited users',
      'All features',
      'Custom AI agents',
      'White labeling',
      'Unlimited AI credits',
      'Unlimited storage',
      'Dedicated support',
      'Custom integrations',
    ],
  },
]

const BUNDLE_OPTIONS = [
  { id: 'finance', name: 'Finance', description: 'Accounting, invoicing, expenses' },
  { id: 'hr', name: 'Human Resources', description: 'Employees, payroll, time tracking' },
  { id: 'sales', name: 'Sales & Marketing', description: 'CRM, campaigns, automation' },
  { id: 'operations', name: 'Operations', description: 'Inventory, manufacturing, quality' },
  { id: 'ai_enhancement', name: 'AI Enhancement', description: 'Advanced AI capabilities' },
]

export function UpgradeModal({
  open,
  onClose,
  currentTier,
  currentUsers,
  currentBundles,
}: UpgradeModalProps) {
  const [selectedTier, setSelectedTier] = useState(currentTier)
  const [userCount, setUserCount] = useState(currentUsers)
  const [selectedBundles, setSelectedBundles] = useState<string[]>(currentBundles)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [pricing, setPricing] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      calculatePricing()
    }
  }, [selectedTier, userCount, selectedBundles, billingCycle])

  const calculatePricing = async () => {
    try {
      const response = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          users: userCount,
          bundles: selectedBundles,
          billingCycle: billingCycle === 'annual' ? 'ANNUAL' : 'MONTHLY',
        }),
      })

      const data = await response.json()
      if (data.success) {
        setPricing(data.data.pricing)
      }
    } catch (error) {}
  }

  const handleBundleToggle = (bundleId: string) => {
    setSelectedBundles((prev) =>
      prev.includes(bundleId) ? prev.filter((id) => id !== bundleId) : [...prev, bundleId]
    )
  }

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      // This would integrate with Stripe checkout
      console.log('Upgrading to:', {
        tier: selectedTier,
        users: userCount,
        bundles: selectedBundles,
        billingCycle,
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      onClose()
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const isDowngrade =
    PRICING_TIERS.findIndex((t) => t.tier === selectedTier) <
    PRICING_TIERS.findIndex((t) => t.tier === currentTier)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upgrade Your Subscription</DialogTitle>
          <DialogDescription>Choose the perfect plan for your growing business</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-6">
          {/* Tier Selection */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Select Your Plan</h3>
            <RadioGroup value={selectedTier} onValueChange={setSelectedTier}>
              <div className="grid grid-cols-2 gap-4">
                {PRICING_TIERS.map((tier) => (
                  <label
                    key={tier.tier}
                    htmlFor={tier.tier}
                    className={`hover:bg-accent relative cursor-pointer rounded-lg border p-4 ${
                      selectedTier === tier.tier ? 'border-primary bg-primary/5' : ''
                    } ${tier.highlighted ? 'ring-primary ring-2' : ''}`}
                  >
                    <RadioGroupItem value={tier.tier} id={tier.tier} className="sr-only" />
                    {tier.highlighted && (
                      <Badge className="absolute -top-2 right-4">Most Popular</Badge>
                    )}
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-semibold">{tier.name}</h4>
                        <p className="text-muted-foreground text-sm">{tier.description}</p>
                      </div>
                      <div className="text-2xl font-bold">
                        ${tier.perUserPrice}
                        <span className="text-muted-foreground text-sm font-normal">
                          /user/month
                        </span>
                      </div>
                      <ul className="space-y-1 text-sm">
                        {tier.features.slice(0, 3).map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="text-primary h-4 w-4" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* User Count */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Number of Users</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Users</span>
                <span className="font-semibold">{userCount}</span>
              </div>
              <Slider
                value={[userCount]}
                onValueChange={(value) => setUserCount(value[0])}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Bundle Selection */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Select Bundles</h3>
            <div className="grid grid-cols-2 gap-3">
              {BUNDLE_OPTIONS.map((bundle) => (
                <div
                  key={bundle.id}
                  className={`hover:bg-accent flex cursor-pointer items-center justify-between rounded-lg border p-3 ${
                    selectedBundles.includes(bundle.id) ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleBundleToggle(bundle.id)}
                >
                  <div className="flex items-center gap-3">
                    <Package
                      className={`h-5 w-5 ${
                        selectedBundles.includes(bundle.id)
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                    <div>
                      <p className="font-medium">{bundle.name}</p>
                      <p className="text-muted-foreground text-xs">{bundle.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={selectedBundles.includes(bundle.id)}
                    onCheckedChange={() => handleBundleToggle(bundle.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Billing Cycle */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Billing Cycle</h3>
            <RadioGroup value={billingCycle} onValueChange={(v: unknown) => setBillingCycle(v)}>
              <div className="grid grid-cols-2 gap-4">
                <label
                  htmlFor="monthly"
                  className={`cursor-pointer rounded-lg border p-4 ${
                    billingCycle === 'monthly' ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <RadioGroupItem value="monthly" id="monthly" className="sr-only" />
                  <div>
                    <h4 className="font-semibold">Monthly</h4>
                    <p className="text-muted-foreground text-sm">Pay as you go</p>
                  </div>
                </label>
                <label
                  htmlFor="annual"
                  className={`cursor-pointer rounded-lg border p-4 ${
                    billingCycle === 'annual' ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <RadioGroupItem value="annual" id="annual" className="sr-only" />
                  <div>
                    <h4 className="font-semibold">Annual</h4>
                    <p className="text-muted-foreground text-sm">Save 20%</p>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Pricing Summary */}
          {pricing && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-semibold">Pricing Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base price</span>
                    <span>${pricing.basePrice}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User licenses ({userCount})</span>
                    <span>${pricing.userPrice}/month</span>
                  </div>
                  {pricing.appliedDiscounts?.map((discount: string, i: number) => (
                    <div key={i} className="flex justify-between text-green-600">
                      <span>{discount}</span>
                      <span>-${Math.round(pricing.savings / 12)}/month</span>
                    </div>
                  ))}
                  <div className="mt-2 border-t pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <div className="text-right">
                        <div>${pricing.totalMonthly}/month</div>
                        {billingCycle === 'annual' && (
                          <div className="text-muted-foreground text-sm font-normal">
                            ${pricing.totalAnnual} billed annually
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpgrade} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                {isDowngrade ? 'Downgrade' : 'Upgrade'} Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
