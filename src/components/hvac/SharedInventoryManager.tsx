'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Package, Truck, Building, AlertTriangle, Search, 
  ArrowRight, Share2, MapPin, BarChart3, Settings
} from 'lucide-react'
import { motion } from 'framer-motion'

interface InventoryItem {
  id: string
  partNumber: string
  name: string
  category: string
  totalQuantity: number
  availableQuantity: number
  reservedQuantity: number
  minStock: number
  maxStock: number
  unitCost: number
  locations: LocationStock[]
}

interface LocationStock {
  locationId: string
  locationName: string
  locationType: 'WAREHOUSE' | 'BRANCH' | 'TRUCK'
  quantity: number
  reserved: number
  available: number
  distance?: number
  technicianName?: string
}

interface TransferRequest {
  id: string
  fromLocation: string
  toLocation: string
  item: string
  quantity: number
  status: 'PENDING' | 'APPROVED' | 'IN_TRANSIT' | 'COMPLETED'
  requestedBy: string
  requestedAt: string
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'
}

export function SharedInventoryManager() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [inventoryItems] = useState<InventoryItem[]>([
    {
      id: 'item-1',
      partNumber: 'AC-COMP-3T',
      name: '3-Ton AC Compressor',
      category: 'Compressors',
      totalQuantity: 24,
      availableQuantity: 18,
      reservedQuantity: 6,
      minStock: 10,
      maxStock: 50,
      unitCost: 485.00,
      locations: [
        { 
          locationId: 'loc-1', 
          locationName: 'Phoenix Main Warehouse', 
          locationType: 'WAREHOUSE',
          quantity: 12, 
          reserved: 3, 
          available: 9 
        },
        { 
          locationId: 'loc-2', 
          locationName: 'Scottsdale Branch', 
          locationType: 'BRANCH',
          quantity: 8, 
          reserved: 2, 
          available: 6, 
          distance: 15.2 
        },
        { 
          locationId: 'loc-3', 
          locationName: 'Tech Van - John M.', 
          locationType: 'TRUCK',
          quantity: 4, 
          reserved: 1, 
          available: 3, 
          distance: 8.5,
          technicianName: 'John Martinez'
        }
      ]
    },
    {
      id: 'item-2',
      partNumber: 'FILT-20X25',
      name: 'Air Filter 20x25x1',
      category: 'Filters',
      totalQuantity: 150,
      availableQuantity: 142,
      reservedQuantity: 8,
      minStock: 50,
      maxStock: 200,
      unitCost: 12.50,
      locations: [
        { 
          locationId: 'loc-1', 
          locationName: 'Phoenix Main Warehouse', 
          locationType: 'WAREHOUSE',
          quantity: 85, 
          reserved: 5, 
          available: 80 
        },
        { 
          locationId: 'loc-2', 
          locationName: 'Scottsdale Branch', 
          locationType: 'BRANCH',
          quantity: 45, 
          reserved: 2, 
          available: 43, 
          distance: 15.2 
        },
        { 
          locationId: 'loc-4', 
          locationName: 'Tech Van - Sarah C.', 
          locationType: 'TRUCK',
          quantity: 20, 
          reserved: 1, 
          available: 19, 
          distance: 12.3,
          technicianName: 'Sarah Chen'
        }
      ]
    },
    {
      id: 'item-3',
      partNumber: 'REFR-R410A',
      name: 'R-410A Refrigerant (25lb)',
      category: 'Refrigerants',
      totalQuantity: 45,
      availableQuantity: 38,
      reservedQuantity: 7,
      minStock: 20,
      maxStock: 80,
      unitCost: 185.00,
      locations: [
        { 
          locationId: 'loc-1', 
          locationName: 'Phoenix Main Warehouse', 
          locationType: 'WAREHOUSE',
          quantity: 30, 
          reserved: 5, 
          available: 25 
        },
        { 
          locationId: 'loc-2', 
          locationName: 'Scottsdale Branch', 
          locationType: 'BRANCH',
          quantity: 15, 
          reserved: 2, 
          available: 13, 
          distance: 15.2 
        }
      ]
    }
  ])

  const [transferRequests] = useState<TransferRequest[]>([
    {
      id: 'tr-1',
      fromLocation: 'Phoenix Main Warehouse',
      toLocation: 'Tech Van - John M.',
      item: '3-Ton AC Compressor',
      quantity: 2,
      status: 'PENDING',
      requestedBy: 'John Martinez',
      requestedAt: '2024-01-15T10:30:00',
      urgency: 'HIGH'
    },
    {
      id: 'tr-2',
      fromLocation: 'Scottsdale Branch',
      toLocation: 'Phoenix Main Warehouse',
      item: 'Air Filter 20x25x1',
      quantity: 20,
      status: 'IN_TRANSIT',
      requestedBy: 'Warehouse Manager',
      requestedAt: '2024-01-15T09:15:00',
      urgency: 'NORMAL'
    }
  ])

  const getStockStatus = (available: number, min: number, max: number) => {
    const percentage = (available / max) * 100
    if (available <= min) return { color: 'bg-red-100 text-red-800', label: 'LOW STOCK' }
    if (percentage > 80) return { color: 'bg-green-100 text-green-800', label: 'WELL STOCKED' }
    return { color: 'bg-yellow-100 text-yellow-800', label: 'ADEQUATE' }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'NORMAL': return 'bg-blue-100 text-blue-800'
      case 'LOW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'WAREHOUSE': return <Building className="h-4 w-4" />
      case 'BRANCH': return <MapPin className="h-4 w-4" />
      case 'TRUCK': return <Truck className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Shared Inventory Management</h1>
          <p className="text-gray-600">Multi-location inventory sharing and optimization</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Sharing Rules
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Share2 className="h-4 w-4 mr-2" />
            Request Transfer
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">5</p>
            <p className="text-xs text-gray-500">3 Fixed, 2 Mobile</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$48,750</p>
            <p className="text-xs text-green-600">+12% vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">3</p>
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-xs text-gray-500">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2</p>
            <p className="text-xs text-gray-500">1 pending approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search parts by name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="ALL">All Categories</option>
          <option value="Compressors">Compressors</option>
          <option value="Filters">Filters</option>
          <option value="Refrigerants">Refrigerants</option>
          <option value="Controls">Controls</option>
        </select>
      </div>

      {/* Inventory Items */}
      <div className="space-y-4 mb-8">
        {inventoryItems
          .filter(item => 
            (selectedCategory === 'ALL' || item.category === selectedCategory) &&
            (searchTerm === '' || 
             item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()))
          )
          .map((item, index) => {
            const stockStatus = getStockStatus(item.availableQuantity, item.minStock, item.maxStock)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-gray-600" />
                        <div>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <p className="text-sm text-gray-500">Part #{item.partNumber} • {item.category}</p>
                        </div>
                        <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <p className="text-gray-500">Total Stock</p>
                          <p className="font-semibold">{item.totalQuantity} units</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Available</p>
                          <p className="font-semibold text-green-600">{item.availableQuantity} units</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Reserved</p>
                          <p className="font-semibold text-orange-600">{item.reservedQuantity} units</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Unit Cost</p>
                          <p className="font-semibold">${item.unitCost.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Location Distribution:</p>
                      {item.locations.map((location) => (
                        <div key={location.locationId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getLocationIcon(location.locationType)}
                            <div>
                              <p className="font-medium">{location.locationName}</p>
                              {location.technicianName && (
                                <p className="text-xs text-gray-500">Assigned to: {location.technicianName}</p>
                              )}
                            </div>
                            {location.distance && (
                              <Badge variant="outline" className="text-xs">
                                {location.distance} mi away
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm">
                                <span className="text-gray-500">Available:</span>{' '}
                                <span className="font-semibold text-green-600">{location.available}</span>
                              </p>
                              {location.reserved > 0 && (
                                <p className="text-xs text-gray-500">
                                  {location.reserved} reserved
                                </p>
                              )}
                            </div>
                            <Button size="sm" variant="outline">
                              Request
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Stock Level Indicator */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Min: {item.minStock}</span>
                        <span>Current: {item.availableQuantity}</span>
                        <span>Max: {item.maxStock}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full relative"
                          style={{ width: `${(item.availableQuantity / item.maxStock) * 100}%` }}
                        >
                          <div
                            className="absolute top-0 left-0 h-full bg-red-500 rounded-l-full"
                            style={{ width: `${(item.minStock / item.availableQuantity) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
      </div>

      {/* Transfer Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transfer Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transferRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{request.fromLocation}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{request.toLocation}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{request.item}</p>
                    <p className="text-xs text-gray-500">Qty: {request.quantity}</p>
                  </div>
                  <Badge className={getUrgencyColor(request.urgency)}>
                    {request.urgency}
                  </Badge>
                  <Badge variant={request.status === 'PENDING' ? 'secondary' : 'default'}>
                    {request.status.replace('_', ' ')}
                  </Badge>
                  {request.status === 'PENDING' && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Approve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}