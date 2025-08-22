'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sun, Cloud, Snowflake, Leaf, TrendingUp, Users, 
  Package, Calendar, AlertCircle, Target, Zap, DollarSign
} from 'lucide-react'
import { motion } from 'framer-motion'

interface SeasonMetrics {
  season: string
  icon: React.ReactNode
  color: string
  expectedCalls: number
  actualCalls?: number
  peakDays: string[]
  requiredTechs: number
  criticalParts: { name: string; quantity: number; stockLevel: string }[]
  revenue: number
  promotions: string[]
}

interface DemandForecast {
  month: string
  predicted: number
  actual?: number
  confidence: number
}

export function SeasonalPlanningDashboard() {
  const currentSeason = 'SUMMER'
  const [selectedYear] = useState(2024)
  
  const [seasonalData] = useState<SeasonMetrics[]>([
    {
      season: 'SPRING',
      icon: <Leaf className="h-5 w-5" />,
      color: 'bg-green-100 text-green-800',
      expectedCalls: 285,
      actualCalls: 292,
      peakDays: ['March 15-20', 'April 1-5'],
      requiredTechs: 8,
      criticalParts: [
        { name: 'AC Filters', quantity: 450, stockLevel: 'ADEQUATE' },
        { name: 'Capacitors', quantity: 85, stockLevel: 'LOW' },
        { name: 'Refrigerant R-410A', quantity: 120, stockLevel: 'GOOD' }
      ],
      revenue: 142500,
      promotions: ['Spring Tune-Up Special', 'Early Bird AC Check']
    },
    {
      season: 'SUMMER',
      icon: <Sun className="h-5 w-5" />,
      color: 'bg-yellow-100 text-yellow-800',
      expectedCalls: 520,
      peakDays: ['June 20-30', 'July 15-25', 'August 1-10'],
      requiredTechs: 15,
      criticalParts: [
        { name: 'Compressors', quantity: 45, stockLevel: 'CRITICAL' },
        { name: 'Condensers', quantity: 30, stockLevel: 'LOW' },
        { name: 'Refrigerant R-410A', quantity: 250, stockLevel: 'ADEQUATE' }
      ],
      revenue: 385000,
      promotions: ['Emergency AC Repair', '24/7 Summer Support', 'Beat the Heat Package']
    },
    {
      season: 'FALL',
      icon: <Cloud className="h-5 w-5" />,
      color: 'bg-orange-100 text-orange-800',
      expectedCalls: 180,
      actualCalls: 175,
      peakDays: ['October 10-15', 'November 1-5'],
      requiredTechs: 6,
      criticalParts: [
        { name: 'Heating Elements', quantity: 65, stockLevel: 'GOOD' },
        { name: 'Thermostats', quantity: 120, stockLevel: 'ADEQUATE' },
        { name: 'Heat Exchangers', quantity: 25, stockLevel: 'ADEQUATE' }
      ],
      revenue: 98500,
      promotions: ['Heating System Check', 'Winter Prep Special']
    },
    {
      season: 'WINTER',
      icon: <Snowflake className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-800',
      expectedCalls: 340,
      peakDays: ['December 15-25', 'January 5-15', 'February 1-10'],
      requiredTechs: 10,
      criticalParts: [
        { name: 'Ignitors', quantity: 95, stockLevel: 'LOW' },
        { name: 'Blower Motors', quantity: 40, stockLevel: 'ADEQUATE' },
        { name: 'Gas Valves', quantity: 35, stockLevel: 'GOOD' }
      ],
      revenue: 215000,
      promotions: ['Emergency Heating', 'Annual Maintenance Plans', 'Holiday Special']
    }
  ])

  const [demandForecast] = useState<DemandForecast[]>([
    { month: 'Jan', predicted: 110, actual: 105, confidence: 88 },
    { month: 'Feb', predicted: 95, actual: 98, confidence: 85 },
    { month: 'Mar', predicted: 125, actual: 130, confidence: 82 },
    { month: 'Apr', predicted: 140, actual: 138, confidence: 90 },
    { month: 'May', predicted: 165, confidence: 87 },
    { month: 'Jun', predicted: 185, confidence: 92 },
    { month: 'Jul', predicted: 210, confidence: 94 },
    { month: 'Aug', predicted: 195, confidence: 91 },
    { month: 'Sep', predicted: 150, confidence: 86 },
    { month: 'Oct', predicted: 90, confidence: 83 },
    { month: 'Nov', predicted: 85, confidence: 81 },
    { month: 'Dec', predicted: 120, confidence: 88 }
  ])

  const getStockLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-600 bg-red-50'
      case 'LOW': return 'text-orange-600 bg-orange-50'
      case 'ADEQUATE': return 'text-blue-600 bg-blue-50'
      case 'GOOD': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const currentSeasonData = seasonalData.find(s => s.season === currentSeason)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Seasonal Planning & Forecasting</h1>
          <p className="text-gray-600">AI-powered demand prediction and resource optimization</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            {selectedYear}
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Zap className="h-4 w-4 mr-2" />
            Generate AI Forecast
          </Button>
        </div>
      </div>

      {/* Current Season Alert */}
      {currentSeasonData && (
        <Card className="mb-6 border-2 border-yellow-400 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  {currentSeasonData.icon}
                </div>
                <div>
                  <CardTitle>Current Season: {currentSeasonData.season}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Peak demand period active</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Expected Calls</p>
                  <p className="text-2xl font-bold">{currentSeasonData.expectedCalls}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Required Techs</p>
                  <p className="text-2xl font-bold">{currentSeasonData.requiredTechs}</p>
                </div>
                <Badge className="bg-yellow-200 text-yellow-900">
                  PEAK SEASON
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Critical Parts Status:</p>
                <div className="space-y-2">
                  {currentSeasonData.criticalParts.map((part, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{part.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Qty: {part.quantity}</span>
                        <Badge className={getStockLevelColor(part.stockLevel)}>
                          {part.stockLevel}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Active Promotions:</p>
                <div className="space-y-2">
                  {currentSeasonData.promotions.map((promo, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Target className="h-3 w-3 text-yellow-600" />
                      <span className="text-sm">{promo}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seasonal Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {seasonalData.map((season, index) => (
          <motion.div
            key={season.season}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={season.season === currentSeason ? 'ring-2 ring-yellow-400' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{season.season}</CardTitle>
                  <div className={`p-1.5 rounded-lg ${season.color}`}>
                    {season.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Service Calls</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold">{season.expectedCalls}</p>
                      {season.actualCalls && (
                        <span className={`text-xs ${season.actualCalls > season.expectedCalls ? 'text-green-600' : 'text-red-600'}`}>
                          {season.actualCalls > season.expectedCalls ? '+' : ''}{season.actualCalls - season.expectedCalls}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Revenue Target</p>
                    <p className="text-lg font-semibold">${(season.revenue / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tech Requirement</p>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span className="text-sm font-medium">{season.requiredTechs} technicians</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Demand Forecast Chart */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Monthly Demand Forecast</CardTitle>
            <Badge className="bg-purple-100 text-purple-800">
              AI Confidence: 88%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {demandForecast.map((month, index) => (
              <div key={month.month} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center mb-2">
                  {month.actual && (
                    <span className="text-xs text-gray-500 mb-1">{month.actual}</span>
                  )}
                  <div 
                    className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg relative"
                    style={{ height: `${(month.predicted / 210) * 200}px` }}
                  >
                    {month.actual && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-green-500 opacity-50 rounded-t-lg"
                        style={{ height: `${(month.actual / month.predicted) * 100}%` }}
                      />
                    )}
                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                      {month.predicted}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-600">{month.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded" />
              <span className="text-xs">Predicted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-xs">Actual</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Planning */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Staffing Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">Current Staff</p>
                    <p className="text-sm text-gray-500">Full-time technicians</p>
                  </div>
                </div>
                <p className="text-xl font-bold">12</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Peak Season Need</p>
                    <p className="text-sm text-gray-500">Additional required</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-yellow-600">+3</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Overtime Hours</p>
                    <p className="text-sm text-gray-500">Projected for season</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-blue-600">280</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Planning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">Order Schedule</p>
                    <p className="text-sm text-gray-500">Next bulk order</p>
                  </div>
                </div>
                <Badge>May 15</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium">Critical Parts</p>
                    <p className="text-sm text-gray-500">Below safety stock</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-red-600">4</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Buffer Budget</p>
                    <p className="text-sm text-gray-500">Emergency parts fund</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-green-600">$25K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}