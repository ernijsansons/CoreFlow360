'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MapPin, Truck, Package, Sun, Calendar, BarChart3, 
  Settings, AlertCircle, TrendingUp, Users, Clock
} from 'lucide-react'
import { RouteOptimizationDashboard } from './RouteOptimizationDashboard'
import { SharedInventoryManager } from './SharedInventoryManager'
import { SeasonalPlanningDashboard } from './SeasonalPlanningDashboard'
import { motion } from 'framer-motion'

interface BusinessLocation {
  id: string
  name: string
  address: string
  type: 'MAIN' | 'BRANCH' | 'SATELLITE'
  technicians: number
  activeTickets: number
  inventoryValue: number
  performance: number
}

export function HVACMultiLocationDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [locations] = useState<BusinessLocation[]>([
    {
      id: 'loc-1',
      name: 'Phoenix Main',
      address: '123 Main St, Phoenix, AZ 85001',
      type: 'MAIN',
      technicians: 8,
      activeTickets: 24,
      inventoryValue: 125000,
      performance: 94
    },
    {
      id: 'loc-2',
      name: 'Scottsdale Branch',
      address: '456 Desert Rd, Scottsdale, AZ 85251',
      type: 'BRANCH',
      technicians: 5,
      activeTickets: 18,
      inventoryValue: 85000,
      performance: 88
    },
    {
      id: 'loc-3',
      name: 'Mesa Service Center',
      address: '789 Valley Ave, Mesa, AZ 85201',
      type: 'SATELLITE',
      technicians: 3,
      activeTickets: 12,
      inventoryValue: 45000,
      performance: 91
    }
  ])

  const totalMetrics = {
    locations: locations.length,
    technicians: locations.reduce((acc, loc) => acc + loc.technicians, 0),
    activeTickets: locations.reduce((acc, loc) => acc + loc.activeTickets, 0),
    inventoryValue: locations.reduce((acc, loc) => acc + loc.inventoryValue, 0),
    avgPerformance: Math.round(locations.reduce((acc, loc) => acc + loc.performance, 0) / locations.length)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MAIN': return 'bg-purple-100 text-purple-800'
      case 'BRANCH': return 'bg-blue-100 text-blue-800'
      case 'SATELLITE': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">HVAC Multi-Location Management</h1>
          <p className="text-gray-600">Centralized control for your HVAC service empire</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <MapPin className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{totalMetrics.locations}</p>
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Active service areas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Technicians</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{totalMetrics.technicians}</p>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-green-600 mt-1">+3 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{totalMetrics.activeTickets}</p>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-orange-600 mt-1">8 emergency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">${(totalMetrics.inventoryValue / 1000).toFixed(0)}K</p>
              <Package className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Across all locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{totalMetrics.avgPerformance}%</p>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs text-green-600 mt-1">Above target</p>
          </CardContent>
        </Card>
      </div>

      {/* Location Cards */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {locations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{location.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{location.address}</p>
                    </div>
                    <Badge className={getTypeColor(location.type)}>
                      {location.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Technicians</span>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{location.technicians}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Tickets</span>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{location.activeTickets}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Inventory</span>
                      <span className="font-medium">${(location.inventoryValue / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Performance</span>
                        <span className="text-sm font-medium">{location.performance}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                          style={{ width: `${location.performance}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Feature Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <MapPin className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="routes">
            <Truck className="h-4 w-4 mr-2" />
            Routes
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="h-4 w-4 mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="seasonal">
            <Sun className="h-4 w-4 mr-2" />
            Seasonal
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Overview content is rendered above */}
          <Card>
            <CardHeader>
              <CardTitle>Cross-Location Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">Inventory Imbalance Detected</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Phoenix Main has excess AC compressors while Scottsdale Branch is running low. 
                      Consider transferring 3 units to optimize distribution.
                    </p>
                    <Button size="sm" className="mt-2" variant="outline">
                      Initiate Transfer
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Route Optimization Opportunity</p>
                    <p className="text-sm text-green-700 mt-1">
                      Combining Mesa and Scottsdale morning routes could save 45 miles and 2 hours daily.
                      AI suggests reassigning 2 technicians for optimal coverage.
                    </p>
                    <Button size="sm" className="mt-2" variant="outline">
                      View Optimization
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg flex items-start gap-3">
                  <Sun className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Seasonal Preparation Alert</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Summer peak season begins in 3 weeks. Based on last year&apos;s data, 
                      you&apos;ll need 3 additional technicians and 40% more refrigerant inventory.
                    </p>
                    <Button size="sm" className="mt-2" variant="outline">
                      View Plan
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes">
          <RouteOptimizationDashboard />
        </TabsContent>

        <TabsContent value="inventory">
          <SharedInventoryManager />
        </TabsContent>

        <TabsContent value="seasonal">
          <SeasonalPlanningDashboard />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Location Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Service Efficiency by Location</h3>
                  <div className="space-y-2">
                    {locations.map((loc) => (
                      <div key={loc.id} className="flex items-center justify-between">
                        <span className="text-sm">{loc.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${loc.performance}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{loc.performance}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Revenue Distribution</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Phoenix Main</span>
                      <span className="font-medium">$385K (52%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Scottsdale Branch</span>
                      <span className="font-medium">$245K (33%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mesa Service Center</span>
                      <span className="font-medium">$110K (15%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}