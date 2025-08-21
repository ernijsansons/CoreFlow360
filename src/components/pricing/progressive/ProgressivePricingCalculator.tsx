'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, TrendingDown, Building, Users, Calculator, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function ProgressivePricingCalculator() {
  const [businessCount, setBusinessCount] = useState([2])
  const [usersPerBusiness, setUsersPerBusiness] = useState([15])
  const [selectedTier, setSelectedTier] = useState('professional')
  const [isCalculating, setIsCalculating] = useState(false)
  const [showLeadCapture, setShowLeadCapture] = useState(false)
  const { toast } = useToast()
  
  const tiers = {
    starter: { name: 'Smart Start', basePrice: 29, perUserPrice: 7 },
    professional: { name: 'Business Growth', basePrice: 59, perUserPrice: 12 },
    enterprise: { name: 'Business Empire', basePrice: 99, perUserPrice: 18 }
  }
  
  const calculateSavings = () => {
    const businesses = businessCount[0]
    const users = usersPerBusiness[0]
    const tier = tiers[selectedTier as keyof typeof tiers]
    
    const monthlyPerBusiness = tier.basePrice + (users * tier.perUserPrice)
    
    let totalCost = 0
    let totalSavings = 0
    
    for (let i = 1; i <= businesses; i++) {
      let businessCost = monthlyPerBusiness
      
      // Apply progressive discounts
      if (i === 2) businessCost *= 0.8  // 20% discount
      if (i === 3) businessCost *= 0.65 // 35% discount  
      if (i === 4) businessCost *= 0.55 // 45% discount
      if (i >= 5) businessCost *= 0.5  // 50% discount
      
      totalCost += businessCost
      
      // Calculate savings vs full price
      if (i > 1) {
        totalSavings += (monthlyPerBusiness - businessCost)
      }
    }
    
    return {
      totalMonthlyCost: Math.round(totalCost),
      monthlySavings: Math.round(totalSavings),
      annualSavings: Math.round(totalSavings * 12),
      traditionalCost: Math.round(monthlyPerBusiness * businesses),
      perBusinessCost: Math.round(totalCost / businesses)
    }
  }
  
  const results = calculateSavings()
  const savingsPercentage = Math.round((results.monthlySavings / results.traditionalCost) * 100)
  
  // Fetch pricing from API (optional enhancement)
  const fetchPricingFromAPI = useCallback(async () => {
    setIsCalculating(true)
    try {
      const response = await fetch('/api/pricing/progressive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessCount: businessCount[0],
          usersPerBusiness: usersPerBusiness[0],
          tier: selectedTier
        })
      })
      
      if (!response.ok) throw new Error('Failed to calculate pricing')
      
      const data = await response.json()
      
      toast({
        title: 'Pricing Calculated',
        description: `Your custom quote has been prepared. Total savings: $${data.pricing.annualSavings.toLocaleString()}/year`,
      })
      
      return data.pricing
    } catch (error) {
      toast({
        title: 'Calculation Error',
        description: 'Unable to calculate pricing. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsCalculating(false)
    }
  }, [businessCount, usersPerBusiness, selectedTier, toast])
  
  const handleGetQuote = async () => {
    await fetchPricingFromAPI()
    setShowLeadCapture(true)
  }
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Progressive Pricing Calculator
        </h2>
        <p className="text-xl text-gray-600">
          See how much you save as you grow your business empire
        </p>
      </motion.div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Settings Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Portfolio Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tier Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Subscription Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(tiers).map(([key, tier]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTier(key)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedTier === key
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">{tier.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        ${tier.basePrice} + ${tier.perUserPrice}/user
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Business Count Slider */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  <Building className="inline h-4 w-4 mr-1" />
                  Number of Businesses: <span className="text-blue-600 font-bold">{businessCount[0]}</span>
                </label>
                <Slider
                  value={businessCount}
                  onValueChange={setBusinessCount}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>1 business</span>
                  <span>10 businesses</span>
                </div>
              </div>
              
              {/* Users Slider */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  <Users className="inline h-4 w-4 mr-1" />
                  Average Users per Business: <span className="text-blue-600 font-bold">{usersPerBusiness[0]}</span>
                </label>
                <Slider
                  value={usersPerBusiness}
                  onValueChange={setUsersPerBusiness}
                  max={50}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>5 users</span>
                  <span>50 users</span>
                </div>
              </div>

              {/* Discount Breakdown */}
              {businessCount[0] > 1 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-sm">Progressive Discounts Applied:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Business #1:</span>
                      <span className="font-medium">Full Price</span>
                    </div>
                    {businessCount[0] >= 2 && (
                      <div className="flex justify-between text-green-600">
                        <span>Business #2:</span>
                        <span className="font-medium">20% off</span>
                      </div>
                    )}
                    {businessCount[0] >= 3 && (
                      <div className="flex justify-between text-green-600">
                        <span>Business #3:</span>
                        <span className="font-medium">35% off</span>
                      </div>
                    )}
                    {businessCount[0] === 4 && (
                      <div className="flex justify-between text-green-600">
                        <span>Business #4:</span>
                        <span className="font-medium">45% off</span>
                      </div>
                    )}
                    {businessCount[0] >= 5 && (
                      <div className="flex justify-between text-green-600">
                        <span>Business #5+:</span>
                        <span className="font-medium">50% off each</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Results Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Your Investment & Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Traditional vs Progressive */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Traditional Cost (per business)</span>
                    <span className="text-xl line-through text-gray-400">
                      ${results.traditionalCost.toLocaleString()}/mo
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="font-medium">CoreFlow360 Progressive Cost</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${results.totalMonthlyCost.toLocaleString()}/mo
                    </span>
                  </div>

                  {businessCount[0] > 1 && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Average per business</span>
                      <span className="text-lg text-gray-700">
                        ${results.perBusinessCost.toLocaleString()}/mo
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Savings Display */}
                {businessCount[0] > 1 && (
                  <div className="border-t pt-4">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-5 w-5 text-green-600" />
                          <span className="font-medium">Monthly Savings</span>
                        </div>
                        <span className="text-xl font-bold text-green-600">
                          ${results.monthlySavings.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Annual Savings</span>
                        <span className="text-2xl font-bold text-green-600">
                          ${results.annualSavings.toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-3 text-center">
                        <span className="inline-block px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
                          {savingsPercentage}% Total Savings
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ROI Message */}
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-700">
                    {businessCount[0] === 1 
                      ? "Add more businesses to unlock progressive discounts!"
                      : `You're saving enough to hire ${Math.floor(results.annualSavings / 30000)} additional employees!`
                    }
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={handleGetQuote}
                    disabled={isCalculating}
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      'Get Custom Quote'
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.location.href = '/demo'}
                  >
                    See Demo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center text-sm text-gray-500"
      >
        <p>
          * All prices shown are monthly. Annual billing provides an additional 20% discount.
          Progressive discounts stack with annual billing for maximum savings.
        </p>
      </motion.div>
    </div>
  )
}