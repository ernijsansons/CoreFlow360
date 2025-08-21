'use client'

import { useState } from 'react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building, ChevronDown, Plus, Sparkles, TrendingUp, Users } from 'lucide-react'

interface Business {
  id: string
  name: string
  industry: string
  users: number
  discount: string | null
  revenue: number
  isActive: boolean
}

export function EnhancedBusinessSwitcher() {
  const [selectedBusiness, setSelectedBusiness] = useState('phoenix-hvac')
  
  const businesses: Business[] = [
    { 
      id: 'phoenix-hvac', 
      name: 'Phoenix HVAC Services',
      industry: 'HVAC',
      users: 12,
      discount: null,
      revenue: 125000,
      isActive: true
    },
    { 
      id: 'desert-air', 
      name: 'Desert Air Solutions',
      industry: 'HVAC', 
      users: 8,
      discount: '20% off',
      revenue: 89000,
      isActive: true
    },
    { 
      id: 'valley-maintenance', 
      name: 'Valley Maintenance Co',
      industry: 'Professional Services',
      users: 15,
      discount: '35% off',
      revenue: 156000,
      isActive: true
    }
  ]
  
  const currentBusiness = businesses.find(b => b.id === selectedBusiness)
  const totalSavings = businesses.reduce((sum, b) => {
    if (b.discount === '20% off') return sum + 180
    if (b.discount === '35% off') return sum + 420
    if (b.discount === '50% off') return sum + 600
    return sum
  }, 0)
  
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Building className="h-5 w-5 text-gray-600" />
        <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
          <SelectTrigger className="w-80 bg-white border-gray-200">
            <SelectValue>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{currentBusiness?.name}</span>
                      {currentBusiness?.discount && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                          {currentBusiness.discount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                      <span>{currentBusiness?.industry}</span>
                      <span>•</span>
                      <span>{currentBusiness?.users} users</span>
                      <span>•</span>
                      <span>${(currentBusiness?.revenue || 0) / 1000}K/mo</span>
                    </div>
                  </div>
                </div>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="w-96">
            <SelectGroup>
              <SelectLabel className="flex items-center justify-between px-2 py-1.5">
                <span>Your Businesses</span>
                <Badge variant="outline" className="text-xs">
                  Saving ${totalSavings}/mo
                </Badge>
              </SelectLabel>
              {businesses.map((business, index) => (
                <SelectItem key={business.id} value={business.id}>
                  <div className="flex items-center justify-between w-full py-1">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{business.name}</span>
                        {business.discount && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            {business.discount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1 ml-6">
                        <span>{business.industry}</span>
                        <span>•</span>
                        <span>{business.users} users</span>
                        <span>•</span>
                        <span>${business.revenue / 1000}K/mo</span>
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectSeparator />
            <div className="p-2">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Business (45% off)
              </Button>
            </div>
          </SelectContent>
        </Select>
      </div>
      
      {/* Quick Stats */}
      <div className="hidden xl:flex items-center space-x-4 px-4 py-2 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-green-600" />
          <span className="text-sm text-gray-600">Progressive Savings:</span>
          <span className="text-sm font-semibold text-green-600">${totalSavings}/mo</span>
        </div>
        <div className="w-px h-4 bg-gray-300" />
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-gray-600">Portfolio:</span>
          <span className="text-sm font-semibold">{businesses.length} businesses</span>
        </div>
      </div>
    </div>
  )
}