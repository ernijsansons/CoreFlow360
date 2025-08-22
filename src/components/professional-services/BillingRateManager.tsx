'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  DollarSign, TrendingUp, Building, Percent, Calendar,
  Users, Zap, AlertCircle, Settings, FileText
} from 'lucide-react'
import { motion } from 'framer-motion'

interface RateCard {
  id: string
  rateName: string
  businessUnit: string
  serviceType: string
  rateType: 'HOURLY' | 'DAILY' | 'FIXED' | 'RETAINER' | 'VALUE_BASED'
  standardRate: number
  seniorRate: number
  juniorRate: number
  rushMultiplier: number
  weekendMultiplier: number
  internalRate: number
  partnerRate: number
  effectiveDate: string
  expiryDate?: string
  isActive: boolean
  clientOverrides: ClientRate[]
  volumeDiscounts: VolumeDiscount[]
}

interface ClientRate {
  clientId: string
  clientName: string
  negotiatedRate: number
  discountPercentage: number
  validUntil: string
}

interface VolumeDiscount {
  minHours: number
  maxHours?: number
  discountPercentage: number
}

interface RevenueAnalytics {
  businessUnit: string
  totalRevenue: number
  avgHourlyRate: number
  utilizationRate: number
  profitMargin: number
  topClients: { name: string; revenue: number }[]
}

export function BillingRateManager() {
  const [selectedBusiness, setSelectedBusiness] = useState('ALL')
  const [rateCards] = useState<RateCard[]>([
    {
      id: 'rate-1',
      rateName: 'Strategic Consulting - Standard',
      businessUnit: 'Strategic Consulting Group',
      serviceType: 'CONSULTING',
      rateType: 'HOURLY',
      standardRate: 250,
      seniorRate: 350,
      juniorRate: 150,
      rushMultiplier: 1.5,
      weekendMultiplier: 1.25,
      internalRate: 125,
      partnerRate: 200,
      effectiveDate: '2024-01-01',
      isActive: true,
      clientOverrides: [
        {
          clientId: 'client-1',
          clientName: 'TechCorp Industries',
          negotiatedRate: 285,
          discountPercentage: 0,
          validUntil: '2024-12-31'
        },
        {
          clientId: 'client-2',
          clientName: 'Global Ventures',
          negotiatedRate: 225,
          discountPercentage: 10,
          validUntil: '2024-06-30'
        }
      ],
      volumeDiscounts: [
        { minHours: 100, maxHours: 500, discountPercentage: 5 },
        { minHours: 500, maxHours: 1000, discountPercentage: 10 },
        { minHours: 1000, discountPercentage: 15 }
      ]
    },
    {
      id: 'rate-2',
      rateName: 'Corporate Legal Services',
      businessUnit: 'Corporate Law Partners',
      serviceType: 'LEGAL',
      rateType: 'HOURLY',
      standardRate: 425,
      seniorRate: 550,
      juniorRate: 275,
      rushMultiplier: 1.75,
      weekendMultiplier: 1.5,
      internalRate: 200,
      partnerRate: 350,
      effectiveDate: '2024-01-01',
      isActive: true,
      clientOverrides: [
        {
          clientId: 'client-2',
          clientName: 'Global Ventures',
          negotiatedRate: 450,
          discountPercentage: 0,
          validUntil: '2024-12-31'
        }
      ],
      volumeDiscounts: [
        { minHours: 50, maxHours: 200, discountPercentage: 5 },
        { minHours: 200, maxHours: 500, discountPercentage: 8 },
        { minHours: 500, discountPercentage: 12 }
      ]
    },
    {
      id: 'rate-3',
      rateName: 'Accounting & Audit Services',
      businessUnit: 'Premier Accounting Services',
      serviceType: 'ACCOUNTING',
      rateType: 'HOURLY',
      standardRate: 185,
      seniorRate: 250,
      juniorRate: 125,
      rushMultiplier: 1.4,
      weekendMultiplier: 1.2,
      internalRate: 95,
      partnerRate: 150,
      effectiveDate: '2024-01-01',
      isActive: true,
      clientOverrides: [],
      volumeDiscounts: [
        { minHours: 80, maxHours: 300, discountPercentage: 7 },
        { minHours: 300, discountPercentage: 12 }
      ]
    },
    {
      id: 'rate-4',
      rateName: 'Marketing Strategy - Retainer',
      businessUnit: 'Creative Marketing Studio',
      serviceType: 'MARKETING',
      rateType: 'RETAINER',
      standardRate: 15000, // Monthly retainer
      seniorRate: 20000,
      juniorRate: 10000,
      rushMultiplier: 1.3,
      weekendMultiplier: 1.0,
      internalRate: 8000,
      partnerRate: 12000,
      effectiveDate: '2024-02-01',
      isActive: true,
      clientOverrides: [],
      volumeDiscounts: [
        { minHours: 3, maxHours: 6, discountPercentage: 10 }, // Months
        { minHours: 6, maxHours: 12, discountPercentage: 15 },
        { minHours: 12, discountPercentage: 20 }
      ]
    }
  ])

  const [revenueAnalytics] = useState<RevenueAnalytics[]>([
    {
      businessUnit: 'Strategic Consulting Group',
      totalRevenue: 2850000,
      avgHourlyRate: 268,
      utilizationRate: 78,
      profitMargin: 42,
      topClients: [
        { name: 'TechCorp', revenue: 485000 },
        { name: 'Global Ventures', revenue: 325000 },
        { name: 'StartupCo', revenue: 220000 }
      ]
    },
    {
      businessUnit: 'Corporate Law Partners',
      totalRevenue: 3200000,
      avgHourlyRate: 445,
      utilizationRate: 92,
      profitMargin: 48,
      topClients: [
        { name: 'Global Ventures', revenue: 780000 },
        { name: 'MegaCorp', revenue: 620000 },
        { name: 'Finance Plus', revenue: 450000 }
      ]
    }
  ])

  const getRateTypeColor = (type: string) => {
    switch (type) {
      case 'HOURLY': return 'bg-blue-100 text-blue-800'
      case 'DAILY': return 'bg-green-100 text-green-800'
      case 'FIXED': return 'bg-purple-100 text-purple-800'
      case 'RETAINER': return 'bg-orange-100 text-orange-800'
      case 'VALUE_BASED': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateEffectiveRate = (baseRate: number, multipliers: { rush?: boolean, weekend?: boolean }) => {
    let rate = baseRate
    if (multipliers.rush) rate *= 1.5
    if (multipliers.weekend) rate *= 1.25
    return rate
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Billing Rate Management</h1>
          <p className="text-gray-600">Multi-business rate cards and pricing optimization</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="ALL">All Businesses</option>
            <option value="CONSULTING">Consulting</option>
            <option value="LEGAL">Legal</option>
            <option value="ACCOUNTING">Accounting</option>
            <option value="MARKETING">Marketing</option>
          </select>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Rate Report
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <DollarSign className="h-4 w-4 mr-2" />
            New Rate Card
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Rate Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{rateCards.filter(r => r.isActive).length}</p>
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Across 4 businesses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Hourly Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">
                ${Math.round(rateCards.filter(r => r.rateType === 'HOURLY').reduce((acc, r) => acc + r.standardRate, 0) / rateCards.filter(r => r.rateType === 'HOURLY').length)}
              </p>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-green-600 mt-1">+12% vs last year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Client Overrides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">
                {rateCards.reduce((acc, r) => acc + r.clientOverrides.length, 0)}
              </p>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Custom rates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">43%</p>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs text-green-600 mt-1">+3% improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Rate Cards */}
      <div className="space-y-4">
        {rateCards
          .filter(card => selectedBusiness === 'ALL' || card.serviceType === selectedBusiness)
          .map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-gray-600" />
                      <div>
                        <CardTitle className="text-lg">{card.rateName}</CardTitle>
                        <p className="text-sm text-gray-600">{card.businessUnit}</p>
                      </div>
                      <Badge className={getRateTypeColor(card.rateType)}>
                        {card.rateType}
                      </Badge>
                      {card.isActive ? (
                        <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">INACTIVE</Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Effective Date</p>
                      <p className="text-sm font-medium">{new Date(card.effectiveDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Rate Tiers */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Junior Rate</span>
                        <Badge variant="outline" className="text-xs">Entry Level</Badge>
                      </div>
                      <p className="text-2xl font-bold">
                        ${card.rateType === 'RETAINER' ? (card.juniorRate / 1000).toFixed(0) + 'K' : card.juniorRate}
                        {card.rateType === 'HOURLY' && '/hr'}
                        {card.rateType === 'RETAINER' && '/mo'}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">Standard Rate</span>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Most Common</Badge>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        ${card.rateType === 'RETAINER' ? (card.standardRate / 1000).toFixed(0) + 'K' : card.standardRate}
                        {card.rateType === 'HOURLY' && '/hr'}
                        {card.rateType === 'RETAINER' && '/mo'}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-900">Senior Rate</span>
                        <Badge variant="outline" className="text-xs">Expert Level</Badge>
                      </div>
                      <p className="text-2xl font-bold text-purple-900">
                        ${card.rateType === 'RETAINER' ? (card.seniorRate / 1000).toFixed(0) + 'K' : card.seniorRate}
                        {card.rateType === 'HOURLY' && '/hr'}
                        {card.rateType === 'RETAINER' && '/mo'}
                      </p>
                    </div>
                  </div>

                  {/* Multipliers and Special Rates */}
                  <div className="grid md:grid-cols-4 gap-3 mb-4">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-xs text-gray-600">Rush</span>
                      <span className="text-sm font-medium">×{card.rushMultiplier}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-xs text-gray-600">Weekend</span>
                      <span className="text-sm font-medium">×{card.weekendMultiplier}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-xs text-gray-600">Internal</span>
                      <span className="text-sm font-medium">${card.internalRate}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-xs text-gray-600">Partner</span>
                      <span className="text-sm font-medium">${card.partnerRate}</span>
                    </div>
                  </div>

                  {/* Volume Discounts */}
                  {card.volumeDiscounts.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Volume Discounts:</p>
                      <div className="flex gap-2">
                        {card.volumeDiscounts.map((discount, dIndex) => (
                          <div key={dIndex} className="flex items-center gap-1 px-3 py-1 bg-green-50 rounded-lg">
                            <span className="text-xs text-green-700">
                              {discount.minHours}+ {card.rateType === 'RETAINER' ? 'months' : 'hours'}
                            </span>
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              -{discount.discountPercentage}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Client Overrides */}
                  {card.clientOverrides.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Client-Specific Rates:</p>
                      <div className="space-y-2">
                        {card.clientOverrides.map((override, oIndex) => (
                          <div key={oIndex} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3 text-yellow-600" />
                              <span className="text-sm font-medium">{override.clientName}</span>
                              {override.discountPercentage > 0 && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                  -{override.discountPercentage}%
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold">${override.negotiatedRate}/hr</span>
                              <span className="text-xs text-gray-500">
                                Until {new Date(override.validUntil).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Rates
                    </Button>
                    <Button size="sm" variant="outline">
                      <Percent className="h-4 w-4 mr-2" />
                      Add Discount
                    </Button>
                    <Button size="sm" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Client Override
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
      </div>

      {/* Rate Optimization Insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pricing Optimization Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-green-50 rounded-lg flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Rate Increase Opportunity</p>
                <p className="text-sm text-green-700 mt-1">
                  Strategic Consulting utilization at 78% with strong demand. Market analysis suggests 
                  rates could increase 8-12% without impacting client retention. Potential revenue gain: $228K/year.
                </p>
                <Button size="sm" className="mt-2" variant="outline">
                  Review Analysis
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Bundle Opportunity</p>
                <p className="text-sm text-blue-700 mt-1">
                  Clients using both Legal and Accounting services. Create bundled rate card with 
                  15% discount to increase cross-selling. Expected uptake: 35% of eligible clients.
                </p>
                <Button size="sm" className="mt-2" variant="outline">
                  Create Bundle
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Rate Parity Alert</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Marketing Studio rates 22% below market average for similar services. 
                  Consider gradual increase over next 2 quarters to align with market rates.
                </p>
                <Button size="sm" className="mt-2" variant="outline">
                  View Market Data
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}