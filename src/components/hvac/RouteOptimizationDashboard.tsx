'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, Navigation, Clock, Fuel, DollarSign, Users, 
  AlertCircle, CheckCircle, TrendingUp, Calendar 
} from 'lucide-react'
import { motion } from 'framer-motion'

interface ServiceStop {
  id: string
  ticketNumber: string
  customerName: string
  address: string
  priority: 'EMERGENCY' | 'HIGH' | 'NORMAL' | 'LOW'
  estimatedDuration: number
  timeWindow?: string
  equipment: string
  distance?: number
}

interface TechnicianRoute {
  id: string
  technicianName: string
  technicianId: string
  date: string
  stops: ServiceStop[]
  totalDistance: number
  totalDuration: number
  fuelCost: number
  optimizationScore: number
  status: 'PLANNING' | 'OPTIMIZED' | 'IN_PROGRESS' | 'COMPLETED'
}

export function RouteOptimizationDashboard() {
  const [selectedDate] = useState(new Date().toISOString().split('T')[0])
  const [routes] = useState<TechnicianRoute[]>([
    {
      id: 'route-1',
      technicianName: 'John Martinez',
      technicianId: 'tech-1',
      date: selectedDate,
      stops: [
        {
          id: 'stop-1',
          ticketNumber: 'SVC-2024-001',
          customerName: 'Desert Oasis Resort',
          address: '123 Main St, Phoenix, AZ',
          priority: 'HIGH',
          estimatedDuration: 90,
          timeWindow: '9:00 AM - 11:00 AM',
          equipment: 'Rooftop AC Unit',
          distance: 5.2
        },
        {
          id: 'stop-2',
          ticketNumber: 'SVC-2024-002',
          customerName: 'Valley Tech Center',
          address: '456 Tech Blvd, Scottsdale, AZ',
          priority: 'NORMAL',
          estimatedDuration: 60,
          timeWindow: '1:00 PM - 3:00 PM',
          equipment: 'Split System',
          distance: 8.7
        },
        {
          id: 'stop-3',
          ticketNumber: 'SVC-2024-003',
          customerName: 'Sunrise Medical',
          address: '789 Health Way, Tempe, AZ',
          priority: 'EMERGENCY',
          estimatedDuration: 120,
          equipment: 'Chiller System',
          distance: 12.3
        }
      ],
      totalDistance: 26.2,
      totalDuration: 330,
      fuelCost: 18.45,
      optimizationScore: 92,
      status: 'OPTIMIZED'
    },
    {
      id: 'route-2',
      technicianName: 'Sarah Chen',
      technicianId: 'tech-2',
      date: selectedDate,
      stops: [
        {
          id: 'stop-4',
          ticketNumber: 'SVC-2024-004',
          customerName: 'Canyon View Mall',
          address: '321 Shopping Dr, Mesa, AZ',
          priority: 'HIGH',
          estimatedDuration: 180,
          equipment: 'Central HVAC System',
          distance: 7.1
        },
        {
          id: 'stop-5',
          ticketNumber: 'SVC-2024-005',
          customerName: 'Pine Ridge Apartments',
          address: '654 Residential Ave, Gilbert, AZ',
          priority: 'NORMAL',
          estimatedDuration: 45,
          timeWindow: '2:00 PM - 4:00 PM',
          equipment: 'Window Units',
          distance: 9.8
        }
      ],
      totalDistance: 16.9,
      totalDuration: 270,
      fuelCost: 12.30,
      optimizationScore: 88,
      status: 'IN_PROGRESS'
    }
  ])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'EMERGENCY': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'NORMAL': return 'bg-blue-100 text-blue-800'
      case 'LOW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'IN_PROGRESS': return <Navigation className="h-5 w-5 text-blue-600" />
      case 'OPTIMIZED': return <TrendingUp className="h-5 w-5 text-purple-600" />
      default: return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const optimizeAllRoutes = () => {
    console.log('Optimizing all routes with AI...')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Route Optimization</h1>
          <p className="text-gray-600">AI-powered multi-location service routing</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            {new Date(selectedDate).toLocaleDateString()}
          </Button>
          <Button onClick={optimizeAllRoutes} className="bg-purple-600 hover:bg-purple-700">
            <TrendingUp className="h-4 w-4 mr-2" />
            Optimize All Routes
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Technicians</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{routes.length}</p>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Stops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">
                {routes.reduce((acc, route) => acc + route.stops.length, 0)}
              </p>
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Distance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">
                {routes.reduce((acc, route) => acc + route.totalDistance, 0).toFixed(1)} mi
              </p>
              <Navigation className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Est. Fuel Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">
                ${routes.reduce((acc, route) => acc + route.fuelCost, 0).toFixed(2)}
              </p>
              <Fuel className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Optimization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">
                {(routes.reduce((acc, route) => acc + route.optimizationScore, 0) / routes.length).toFixed(0)}%
              </p>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Cards */}
      <div className="space-y-6">
        {routes.map((route, routeIndex) => (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: routeIndex * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>{route.technicianName}</CardTitle>
                    {getStatusIcon(route.status)}
                    <Badge variant={route.status === 'IN_PROGRESS' ? 'default' : 'secondary'}>
                      {route.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Navigation className="h-4 w-4" />
                      {route.totalDistance} mi
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.floor(route.totalDuration / 60)}h {route.totalDuration % 60}m
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      ${route.fuelCost.toFixed(2)}
                    </span>
                    <Badge className="bg-purple-100 text-purple-800">
                      {route.optimizationScore}% Optimized
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {route.stops.map((stop, stopIndex) => (
                    <div
                      key={stop.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full border-2 border-gray-300 font-semibold">
                          {stopIndex + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{stop.customerName}</p>
                            <Badge className={getPriorityColor(stop.priority)}>
                              {stop.priority}
                            </Badge>
                            {stop.priority === 'EMERGENCY' && (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{stop.address}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>Ticket: {stop.ticketNumber}</span>
                            <span>{stop.equipment}</span>
                            {stop.timeWindow && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {stop.timeWindow}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{stop.estimatedDuration} min</p>
                        {stop.distance && (
                          <p className="text-xs text-gray-500">{stop.distance} mi</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Route Actions */}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    View Map
                  </Button>
                  <Button variant="outline" size="sm">
                    Reoptimize
                  </Button>
                  <Button variant="outline" size="sm">
                    Send to Mobile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}