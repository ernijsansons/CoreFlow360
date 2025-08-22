'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Building,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Target,
  Star,
  Zap,
  Eye,
  UserPlus,
  BarChart3,
  Network,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { CustomerAnalyticsDashboard } from './CustomerAnalyticsDashboard'

interface UnifiedCustomer {
  id: string
  masterEmail: string
  fullName: string
  customerType: 'INDIVIDUAL' | 'BUSINESS' | 'ENTERPRISE'
  totalLifetimeValue: number
  businessCount: number
  portfolioScore: number
  crossSellPotential: number
  retentionRisk: number
  aiLifecycleStage: string
  status: string
  isVip: boolean
  businessRelationships: BusinessRelationship[]
  crossSellOpportunities: CrossSellOpportunity[]
  recentActivities: CustomerActivity[]
}

interface BusinessRelationship {
  id: string
  businessId: string
  businessName: string
  relationshipStrength: number
  businessValue: number
  relationshipStatus: string
  relationshipType: string
  primaryContact: boolean
  lastInteraction: string
  aiCrossSellReadiness: number
  contactDetails: {
    email: string
    phone?: string
    title?: string
  }
}

interface CrossSellOpportunity {
  id: string
  targetBusinessName: string
  serviceCategory: string
  aiOpportunityScore: number
  aiRevenueProjection: number
  status: string
  priority: string
  triggers: string[]
}

interface CustomerActivity {
  id: string
  businessName: string
  activityType: string
  title: string
  activityDate: string
  impactScore: number
  sentimentScore: number
}

export function UnifiedCustomerManager() {
  const [customers, setCustomers] = useState<UnifiedCustomer[]>([])
  const [selectedTab, setSelectedTab] = useState<'overview' | 'cross-sell' | 'analytics'>('overview')
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data - in production, this would fetch from API
    const mockCustomers: UnifiedCustomer[] = [
      {
        id: '1',
        masterEmail: 'john.smith@phoenixtech.com',
        fullName: 'John Smith',
        customerType: 'BUSINESS',
        totalLifetimeValue: 125000,
        businessCount: 3,
        portfolioScore: 92,
        crossSellPotential: 85,
        retentionRisk: 15,
        aiLifecycleStage: 'ADVOCATE',
        status: 'ACTIVE',
        isVip: true,
        businessRelationships: [
          {
            id: '1',
            businessId: 'phoenix-hvac',
            businessName: 'Phoenix HVAC Services',
            relationshipStrength: 95,
            businessValue: 75000,
            relationshipStatus: 'ACTIVE',
            relationshipType: 'CUSTOMER',
            primaryContact: true,
            lastInteraction: '2024-08-20',
            aiCrossSellReadiness: 88,
            contactDetails: {
              email: 'john.smith@phoenixtech.com',
              phone: '+1-555-0123',
              title: 'Facilities Manager'
            }
          },
          {
            id: '2',
            businessId: 'valley-maintenance',
            businessName: 'Valley Maintenance Co',
            relationshipStrength: 78,
            businessValue: 35000,
            relationshipStatus: 'ACTIVE',
            relationshipType: 'CUSTOMER',
            primaryContact: false,
            lastInteraction: '2024-08-18',
            aiCrossSellReadiness: 72,
            contactDetails: {
              email: 'j.smith@phoenixtech.com',
              phone: '+1-555-0123',
              title: 'Operations Director'
            }
          },
          {
            id: '3',
            businessId: 'desert-air',
            businessName: 'Desert Air Solutions',
            relationshipStrength: 65,
            businessValue: 15000,
            relationshipStatus: 'PROSPECT',
            relationshipType: 'PROSPECT',
            primaryContact: false,
            lastInteraction: '2024-08-15',
            aiCrossSellReadiness: 91,
            contactDetails: {
              email: 'john.smith@phoenixtech.com',
              title: 'Decision Maker'
            }
          }
        ],
        crossSellOpportunities: [
          {
            id: '1',
            targetBusinessName: 'Desert Air Solutions',
            serviceCategory: 'Residential HVAC',
            aiOpportunityScore: 91,
            aiRevenueProjection: 25000,
            status: 'QUALIFIED',
            priority: 'HIGH',
            triggers: ['Executive office HVAC inquiry', 'Energy efficiency interest', 'Budget approved Q4']
          },
          {
            id: '2',
            targetBusinessName: 'Valley Maintenance Co',
            serviceCategory: 'Facility Expansion',
            aiOpportunityScore: 76,
            aiRevenueProjection: 18000,
            status: 'IDENTIFIED',
            priority: 'MEDIUM',
            triggers: ['New facility announced', 'Maintenance contract renewal due']
          }
        ],
        recentActivities: [
          {
            id: '1',
            businessName: 'Phoenix HVAC Services',
            activityType: 'SERVICE_COMPLETION',
            title: 'Annual HVAC maintenance completed',
            activityDate: '2024-08-20',
            impactScore: 85,
            sentimentScore: 0.8
          },
          {
            id: '2',
            businessName: 'Valley Maintenance Co',
            activityType: 'QUOTE_REQUEST',
            title: 'Requested quote for facility expansion maintenance',
            activityDate: '2024-08-18',
            impactScore: 70,
            sentimentScore: 0.6
          }
        ]
      },
      {
        id: '2',
        masterEmail: 'sarah.johnson@retailcorp.com',
        fullName: 'Sarah Johnson',
        customerType: 'ENTERPRISE',
        totalLifetimeValue: 350000,
        businessCount: 2,
        portfolioScore: 96,
        crossSellPotential: 78,
        retentionRisk: 8,
        aiLifecycleStage: 'CUSTOMER',
        status: 'ACTIVE',
        isVip: true,
        businessRelationships: [
          {
            id: '4',
            businessId: 'phoenix-hvac',
            businessName: 'Phoenix HVAC Services',
            relationshipStrength: 98,
            businessValue: 280000,
            relationshipStatus: 'ACTIVE',
            relationshipType: 'CUSTOMER',
            primaryContact: true,
            lastInteraction: '2024-08-21',
            aiCrossSellReadiness: 65,
            contactDetails: {
              email: 'sarah.johnson@retailcorp.com',
              phone: '+1-555-0567',
              title: 'VP Operations'
            }
          },
          {
            id: '5',
            businessId: 'desert-air',
            businessName: 'Desert Air Solutions',
            relationshipStrength: 82,
            businessValue: 70000,
            relationshipStatus: 'ACTIVE',
            relationshipType: 'CUSTOMER',
            primaryContact: false,
            lastInteraction: '2024-08-19',
            aiCrossSellReadiness: 58,
            contactDetails: {
              email: 's.johnson@retailcorp.com',
              phone: '+1-555-0567',
              title: 'Regional Manager'
            }
          }
        ],
        crossSellOpportunities: [
          {
            id: '3',
            targetBusinessName: 'Valley Maintenance Co',
            serviceCategory: 'Multi-Location Maintenance',
            aiOpportunityScore: 83,
            aiRevenueProjection: 45000,
            status: 'IDENTIFIED',
            priority: 'HIGH',
            triggers: ['15 store locations', 'Centralized maintenance preferred', 'Cost optimization focus']
          }
        ],
        recentActivities: [
          {
            id: '3',
            businessName: 'Phoenix HVAC Services',
            activityType: 'CONTRACT_RENEWAL',
            title: 'Renewed enterprise maintenance contract',
            activityDate: '2024-08-21',
            impactScore: 95,
            sentimentScore: 0.9
          }
        ]
      }
    ]
    
    setCustomers(mockCustomers)
    setIsLoading(false)
  }, [])

  const getTotalPortfolioValue = () => {
    return customers.reduce((sum, customer) => sum + customer.totalLifetimeValue, 0)
  }

  const getAverageCrossSellPotential = () => {
    return customers.length > 0 
      ? customers.reduce((sum, customer) => sum + customer.crossSellPotential, 0) / customers.length
      : 0
  }

  const getMultiBusinessCustomers = () => {
    return customers.filter(customer => customer.businessCount > 1)
  }

  const getTotalCrossSellOpportunities = () => {
    return customers.reduce((sum, customer) => sum + customer.crossSellOpportunities.length, 0)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Unified Customer Intelligence</h1>
          <p className="text-gray-600">Cross-business customer relationships and opportunities</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Link Customer
        </Button>
      </motion.div>

      {/* Portfolio Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-4 gap-4 mb-8"
      >
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Portfolio Value</p>
                <p className="text-2xl font-bold text-green-900">${getTotalPortfolioValue().toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">Total lifetime value</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Multi-Business Customers</p>
                <p className="text-2xl font-bold text-purple-900">{getMultiBusinessCustomers().length}</p>
                <p className="text-xs text-purple-600 mt-1">of {customers.length} total customers</p>
              </div>
              <Network className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Cross-Sell Potential</p>
                <p className="text-2xl font-bold text-blue-900">{getAverageCrossSellPotential().toFixed(0)}%</p>
                <p className="text-xs text-blue-600 mt-1">Average across portfolio</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Active Opportunities</p>
                <p className="text-2xl font-bold text-orange-900">{getTotalCrossSellOpportunities()}</p>
                <p className="text-xs text-orange-600 mt-1">Cross-sell opportunities</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {[
          { id: 'overview', label: 'Customer Overview', count: customers.length },
          { id: 'cross-sell', label: 'Cross-Sell Opportunities', count: getTotalCrossSellOpportunities() },
          { id: 'analytics', label: 'Portfolio Analytics', count: getMultiBusinessCustomers().length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            <Badge variant="secondary" className="ml-2">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Customer List */}
      {selectedTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {customers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{customer.fullName}</h3>
                          {customer.isVip && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              <Star className="h-3 w-3 mr-1" />
                              VIP
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {customer.customerType}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {customer.masterEmail}
                          </span>
                          <span className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {customer.businessCount} businesses
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Portfolio Score</div>
                        <div className="font-semibold text-lg">{customer.portfolioScore}</div>
                        <div className="text-xs text-blue-600">AI-calculated</div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-gray-600">Lifetime Value</div>
                        <div className="font-semibold text-lg">${customer.totalLifetimeValue.toLocaleString()}</div>
                        <div className="text-xs text-green-600">Across portfolio</div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-gray-600">Cross-Sell Potential</div>
                        <div className="font-semibold text-lg">{customer.crossSellPotential}%</div>
                        <div className="text-xs text-orange-600">
                          {customer.crossSellOpportunities.length} opportunities
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedCustomer(selectedCustomer === customer.id ? null : customer.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Business Relationships */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Business Relationships</h4>
                    <div className="grid md:grid-cols-3 gap-3">
                      {customer.businessRelationships.map((relationship) => (
                        <div
                          key={relationship.id}
                          className="p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{relationship.businessName}</span>
                            <div className="flex items-center space-x-1">
                              {relationship.primaryContact && (
                                <Badge variant="default" className="text-xs">Primary</Badge>
                              )}
                              <Badge
                                variant={relationship.relationshipStatus === 'ACTIVE' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {relationship.relationshipStatus}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between">
                              <span>Strength:</span>
                              <span className="text-blue-600 font-medium">{relationship.relationshipStrength}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Value:</span>
                              <span className="text-green-600 font-medium">${relationship.businessValue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cross-Sell Ready:</span>
                              <span className="text-orange-600 font-medium">{relationship.aiCrossSellReadiness}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedCustomer === customer.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t pt-4 mt-4"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Cross-Sell Opportunities */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Target className="h-4 w-4 mr-2" />
                            Cross-Sell Opportunities
                          </h4>
                          <div className="space-y-3">
                            {customer.crossSellOpportunities.map((opportunity) => (
                              <div key={opportunity.id} className="p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm">{opportunity.targetBusinessName}</span>
                                  <Badge className={`text-xs ${
                                    opportunity.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                    opportunity.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {opportunity.priority}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-700 mb-2">{opportunity.serviceCategory}</div>
                                <div className="flex justify-between text-xs">
                                  <span>Score: {opportunity.aiOpportunityScore}%</span>
                                  <span>Projected: ${opportunity.aiRevenueProjection.toLocaleString()}</span>
                                </div>
                                <div className="mt-2">
                                  {opportunity.triggers.slice(0, 2).map((trigger, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs mr-1">
                                      {trigger}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recent Activities */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Recent Activities
                          </h4>
                          <div className="space-y-3">
                            {customer.recentActivities.map((activity) => (
                              <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{activity.businessName}</span>
                                  <span className="text-xs text-gray-500">{activity.activityDate}</span>
                                </div>
                                <div className="text-sm text-gray-700 mb-2">{activity.title}</div>
                                <div className="flex justify-between text-xs">
                                  <span>Impact: {activity.impactScore}%</span>
                                  <span className={`${activity.sentimentScore > 0.5 ? 'text-green-600' : 'text-gray-600'}`}>
                                    Sentiment: {(activity.sentimentScore * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Cross-Sell Opportunities Tab */}
      {selectedTab === 'cross-sell' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Cross-Sell Opportunities</span>
                <Badge variant="outline">
                  ${customers.reduce((sum, c) => 
                    sum + c.crossSellOpportunities.reduce((oSum, o) => oSum + o.aiRevenueProjection, 0), 0
                  ).toLocaleString()} potential revenue
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.flatMap(customer => 
                  customer.crossSellOpportunities.map(opportunity => ({
                    ...opportunity,
                    customerName: customer.fullName,
                    customerId: customer.id
                  }))
                ).sort((a, b) => b.aiOpportunityScore - a.aiOpportunityScore).map((opportunity, index) => (
                  <motion.div
                    key={opportunity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{opportunity.customerName}</h4>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <span className="text-blue-600 font-medium">{opportunity.targetBusinessName}</span>
                          <Badge className={`text-xs ${
                            opportunity.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                            opportunity.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {opportunity.priority}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{opportunity.serviceCategory}</div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center">
                            <Target className="h-4 w-4 mr-1 text-blue-500" />
                            {opportunity.aiOpportunityScore}% confidence
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                            ${opportunity.aiRevenueProjection.toLocaleString()} projected
                          </span>
                          <span className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1 text-orange-500" />
                            {opportunity.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Take Action
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && <CustomerAnalyticsDashboard />}
    </div>
  )
}