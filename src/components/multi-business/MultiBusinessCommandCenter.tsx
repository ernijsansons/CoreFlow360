'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Plus,
  ChartBar,
  Settings,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'

interface Business {
  id: number
  name: string
  industry: string
  revenue: number
  growth: number
  users: number
  status: 'healthy' | 'growing' | 'stable' | 'attention'
  savingsFromProgressive: number
  locations?: number
}

export function MultiBusinessCommandCenter() {
  const [businesses] = useState<Business[]>([
    {
      id: 1,
      name: 'Phoenix HVAC Services',
      industry: 'HVAC',
      revenue: 125000,
      growth: 15,
      users: 12,
      status: 'healthy',
      savingsFromProgressive: 0,
      locations: 3
    },
    {
      id: 2, 
      name: 'Desert Air Solutions',
      industry: 'HVAC',
      revenue: 89000,
      growth: 22,
      users: 8,
      status: 'growing',
      savingsFromProgressive: 180,
      locations: 2
    },
    {
      id: 3,
      name: 'Valley Maintenance Co',
      industry: 'Professional Services', 
      revenue: 156000,
      growth: 8,
      users: 15,
      status: 'stable',
      savingsFromProgressive: 420,
      locations: 4
    }
  ])
  
  const totalSavings = businesses.reduce((sum, business) => sum + business.savingsFromProgressive, 0)
  const totalRevenue = businesses.reduce((sum, business) => sum + business.revenue, 0)
  const totalUsers = businesses.reduce((sum, business) => sum + business.users, 0)
  const totalLocations = businesses.reduce((sum, business) => sum + (business.locations || 1), 0)
  const avgGrowth = Math.round(businesses.reduce((sum, business) => sum + business.growth, 0) / businesses.length)
  
  const getStatusColor = (status: Business['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'growing': return 'bg-blue-100 text-blue-800'
      case 'stable': return 'bg-gray-100 text-gray-800'
      case 'attention': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDiscountBadge = (index: number) => {
    if (index === 0) return null
    if (index === 1) return '20% discount'
    if (index === 2) return '35% discount'
    return '50% discount'
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Business Portfolio Command Center</h1>
          <p className="text-gray-600">Manage your business empire from one intelligent platform</p>
        </div>
        <Link href="/add-business">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Business
          </Button>
        </Link>
      </motion.div>
      
      {/* Enhanced Portfolio Performance Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Portfolio Health</p>
                <p className="text-2xl font-bold text-blue-900">{businesses.length}</p>
                <p className="text-xs text-blue-600 mt-1">{totalLocations} locations</p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-xs text-green-700">All systems operational</span>
                </div>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Total Portfolio Revenue</p>
                <p className="text-2xl font-bold text-green-900">${(totalRevenue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {avgGrowth}% portfolio growth
                </p>
                <div className="text-xs text-green-600 mt-1">
                  ${Math.round(totalRevenue / businesses.length / 1000)}K avg per business
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Progressive Savings</p>
                <p className="text-2xl font-bold text-orange-900">${totalSavings}</p>
                <p className="text-xs text-orange-600 mt-1">${totalSavings * 12}/year saved</p>
                <div className="text-xs text-orange-600 mt-1">
                  {Math.round((totalSavings * 12) / totalRevenue * 100)}% cost reduction
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Unified Team</p>
                <p className="text-2xl font-bold text-purple-900">{totalUsers}</p>
                <p className="text-xs text-purple-600 mt-1">Active across portfolio</p>
                <div className="text-xs text-purple-600 mt-1">
                  {Math.round(totalUsers / businesses.length)} avg per business
                </div>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-700 font-medium">Next Business</p>
                <p className="text-2xl font-bold text-indigo-900">{businesses.length >= 4 ? '50%' : '45%'} off</p>
                <p className="text-xs text-indigo-600 mt-1">Progressive discount</p>
                <div className="text-xs text-indigo-600 mt-1">
                  Add business #{businesses.length + 1}
                </div>
              </div>
              <ChartBar className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Business Portfolio List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Your Business Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {businesses.map((business, index) => (
                <motion.div 
                  key={business.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Building className="h-8 w-8 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{business.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">{business.industry}</Badge>
                        <Badge className={getStatusColor(business.status)}>
                          {business.status}
                        </Badge>
                        {getDiscountBadge(index) && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            {getDiscountBadge(index)}
                          </Badge>
                        )}
                        {business.locations && business.locations > 1 && (
                          <Badge variant="outline">
                            {business.locations} locations
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-8">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Revenue</div>
                      <div className="font-semibold">${(business.revenue / 1000).toFixed(0)}K/mo</div>
                      <div className="text-xs flex items-center justify-end mt-1">
                        {business.growth > 0 ? (
                          <span className="text-green-600 flex items-center">
                            <ArrowUpRight className="h-3 w-3" />
                            {business.growth}%
                          </span>
                        ) : (
                          <span className="text-gray-600 flex items-center">
                            <ArrowDownRight className="h-3 w-3" />
                            {Math.abs(business.growth)}%
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Team</div>
                      <div className="font-semibold">{business.users} users</div>
                      {business.savingsFromProgressive > 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          Saving ${business.savingsFromProgressive}/mo
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Link href={`/business/${business.id}/dashboard`}>
                        <Button variant="outline" size="sm">
                          View Dashboard
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Cross-Business Opportunities Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-8 grid lg:grid-cols-2 gap-6"
      >
        <Card className="bg-gradient-to-r from-cyan-50 to-cyan-100 border-cyan-200">
          <CardHeader>
            <CardTitle className="text-cyan-900">Cross-Business Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-white/70 rounded-lg">
                <h4 className="font-medium text-cyan-900 mb-1">Resource Sharing</h4>
                <p className="text-sm text-cyan-700">Valley Maintenance can share 2 technicians with Phoenix HVAC during peak season</p>
                <div className="text-xs text-cyan-600 mt-1">Potential: $8,500/month savings</div>
              </div>
              <div className="p-3 bg-white/70 rounded-lg">
                <h4 className="font-medium text-cyan-900 mb-1">Cross-Selling Opportunity</h4>
                <p className="text-sm text-cyan-700">15 Phoenix HVAC customers need maintenance services</p>
                <div className="text-xs text-cyan-600 mt-1">Potential: $12,000/month revenue</div>
              </div>
              <div className="p-3 bg-white/70 rounded-lg">
                <h4 className="font-medium text-cyan-900 mb-1">Bulk Purchasing</h4>
                <p className="text-sm text-cyan-700">Combine HVAC parts orders for 25% discount</p>
                <div className="text-xs text-cyan-600 mt-1">Potential: $3,200/month savings</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">Consolidated KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-700">Portfolio Efficiency Score</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-amber-900">87%</span>
                  <div className="text-xs text-green-600">+5% vs last month</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-700">Customer Satisfaction</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-amber-900">4.7/5</span>
                  <div className="text-xs text-green-600">+0.2 vs individual</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-700">Resource Utilization</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-amber-900">94%</span>
                  <div className="text-xs text-green-600">+12% improvement</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-700">Cross-Business Revenue</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-amber-900">$24K</span>
                  <div className="text-xs text-green-600">18% of portfolio</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Progressive Savings Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-3">Progressive Pricing Saves You Money</h3>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                The more businesses you add, the more you save. Your current portfolio saves 
                <span className="font-bold text-green-600"> ${totalSavings * 12}/year</span> compared 
                to individual subscriptions.
              </p>
              
              <div className="grid md:grid-cols-4 gap-4 mb-6 max-w-3xl mx-auto">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-sm text-gray-600">Business #1</div>
                  <div className="font-bold">Full Price</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-sm text-gray-600">Business #2</div>
                  <div className="font-bold text-green-600">20% off</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-sm text-gray-600">Business #3</div>
                  <div className="font-bold text-green-600">35% off</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-sm text-gray-600">Business #4+</div>
                  <div className="font-bold text-green-600">50% off</div>
                </div>
              </div>
              
              <Link href="/add-business">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Add Your 4th Business & Save 50%
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}