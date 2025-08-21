'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingDown, 
  Building, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  Calculator,
  ChartBar
} from 'lucide-react'

export function ProgressivePricingShowcase() {
  const pricingTiers = [
    { 
      businesses: 1, 
      discount: 0, 
      label: 'First Business',
      monthlyPrice: 179,
      totalSavings: 0,
      color: 'bg-gray-100 text-gray-700'
    },
    { 
      businesses: 2, 
      discount: 20, 
      label: '2nd Business',
      monthlyPrice: 143,
      totalSavings: 36,
      color: 'bg-green-100 text-green-700'
    },
    { 
      businesses: 3, 
      discount: 35, 
      label: '3rd Business',
      monthlyPrice: 116,
      totalSavings: 99,
      color: 'bg-green-200 text-green-800'
    },
    { 
      businesses: 4, 
      discount: 45, 
      label: '4th Business',
      monthlyPrice: 98,
      totalSavings: 180,
      color: 'bg-emerald-200 text-emerald-800'
    },
    { 
      businesses: 5, 
      discount: 50, 
      label: '5th+ Business',
      monthlyPrice: 89,
      totalSavings: 275,
      color: 'bg-emerald-300 text-emerald-900'
    }
  ]
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">Progressive Multi-Business Pricing</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          The revolutionary pricing model that grows with your business empire. 
          Add more businesses, unlock deeper discounts.
        </p>
      </div>
      
      {/* Visual Pricing Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingDown className="h-5 w-5 mr-2 text-green-600" />
            Your Discount Increases With Each Business
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Discount progression bars */}
            <div className="space-y-4">
              {pricingTiers.map((tier, index) => (
                <div key={tier.businesses} className="relative">
                  <div className="flex items-center mb-2">
                    <div className="w-32 text-sm font-medium">
                      {tier.label}
                    </div>
                    <div className="flex-1 relative">
                      <div className="h-12 bg-gray-100 rounded-lg overflow-hidden">
                        <div 
                          className={`h-full ${tier.color} flex items-center justify-between px-4 transition-all duration-500`}
                          style={{ width: `${100 - tier.discount}%` }}
                        >
                          <span className="text-sm font-semibold">
                            ${tier.monthlyPrice}/mo
                          </span>
                          {tier.discount > 0 && (
                            <Badge variant="secondary" className="bg-white/80">
                              {tier.discount}% OFF
                            </Badge>
                          )}
                        </div>
                      </div>
                      {tier.totalSavings > 0 && (
                        <div className="absolute right-0 top-0 -mt-1 text-xs text-green-600 font-medium">
                          Save ${tier.totalSavings}/mo
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Cumulative savings indicator */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">With 5 businesses, you save:</p>
                  <p className="text-2xl font-bold text-green-700">$275/month • $3,300/year</p>
                </div>
                <Sparkles className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Example Scenario */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Traditional Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Business 1</span>
                <span>$179/mo</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Business 2</span>
                <span>$179/mo</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Business 3</span>
                <span>$179/mo</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-red-600">$537/mo</span>
              </div>
              <div className="text-center text-sm text-gray-500">
                $6,444/year
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              CoreFlow360 Progressive
              <Badge className="ml-2 bg-green-600 text-white">SAVE 44%</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Business 1</span>
                <span>$179/mo</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Business 2 (20% off)</span>
                <span className="text-green-600">$143/mo</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Business 3 (35% off)</span>
                <span className="text-green-600">$116/mo</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-green-600">$438/mo</span>
              </div>
              <div className="text-center">
                <Badge className="bg-green-100 text-green-800">
                  Saving $99/mo • $1,188/year
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-3">Ready to Build Your Business Empire?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Start with one business, then expand at your own pace. 
              Each new business unlocks greater savings automatically.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate My Savings
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}