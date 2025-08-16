'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MapIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  BoltIcon,
  ClockIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import { Territory, TerritoryAnalytics, Lead, TerritoryVisit } from '@/types/territory'
import HybridMapComponent from '@/components/maps/HybridMapComponent'
import { CustomerLocation } from '@/types/mapping'
import TerritoryPerformanceAnalytics from './TerritoryPerformanceAnalytics'
import TerritoryIntelligenceBriefing from './TerritoryIntelligenceBriefing'
import MobileTerritoryCommandCenter from '@/components/mobile/MobileTerritoryCommandCenter'
import ManagerEfficiencyDashboard from '@/components/mobile/ManagerEfficiencyDashboard'
import RealTimeTerritoryCoaching from './RealTimeTerritoryCoaching'

interface TerritoryManagementDashboardProps {
  userId?: string
  tenantId: string
}

export default function TerritoryManagementDashboard({
  userId,
  tenantId
}: TerritoryManagementDashboardProps) {
  const [territories, setTerritories] = useState<Territory[]>([])
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null)
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [territoryAnalytics, setTerritoryAnalytics] = useState<TerritoryAnalytics[]>([])
  const [upcomingVisits, setUpcomingVisits] = useState<TerritoryVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'overview' | 'territory' | 'leads' | 'analytics' | 'mobile' | 'manager' | 'coaching'>('overview')

  useEffect(() => {
    loadTerritoryData()
  }, [userId, tenantId])

  const loadTerritoryData = async () => {
    try {
      setLoading(true)
      
      // Mock territory data
      const mockTerritories: Territory[] = [
        {
          id: 'territory-1',
          tenantId,
          name: 'Northeast Hub',
          description: 'High-density metropolitan area with enterprise focus',
          boundaryData: { type: 'Polygon', coordinates: [[[-74, 40], [-73, 41], [-72, 40], [-74, 40]]] },
          visitFrequency: 'weekly',
          optimalDays: ['monday', 'tuesday', 'wednesday'],
          priority: 9,
          leadConversionRate: 0.32,
          avgDealValue: 125000,
          customerSatisfaction: 4.4,
          marketPenetration: 0.25,
          competitiveActivity: 8,
          assignedUserId: userId || 'user-1',
          assignedUser: {
            id: userId || 'user-1',
            name: 'Alex Morgan',
            email: 'alex.morgan@coreflow360.com'
          },
          isActive: true,
          lastVisitDate: '2024-08-09T10:00:00Z',
          nextVisitDate: '2024-08-16T09:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-08-09T10:00:00Z'
        },
        {
          id: 'territory-2',
          tenantId,
          name: 'Tech Corridor',
          description: 'Silicon Valley and surrounding tech companies',
          boundaryData: { type: 'Polygon', coordinates: [[[-122, 37], [-121, 38], [-120, 37], [-122, 37]]] },
          visitFrequency: 'biweekly',
          optimalDays: ['tuesday', 'wednesday', 'thursday'],
          priority: 8,
          leadConversionRate: 0.28,
          avgDealValue: 185000,
          customerSatisfaction: 4.6,
          marketPenetration: 0.18,
          competitiveActivity: 9,
          assignedUserId: 'user-2',
          assignedUser: {
            id: 'user-2',
            name: 'Jordan Lee',
            email: 'jordan.lee@coreflow360.com'
          },
          isActive: true,
          lastVisitDate: '2024-08-05T14:00:00Z',
          nextVisitDate: '2024-08-19T10:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-08-05T14:00:00Z'
        }
      ]

      const mockAnalytics: TerritoryAnalytics[] = [
        {
          id: 'analytics-1',
          territoryId: 'territory-1',
          userId: userId || 'user-1',
          periodStart: '2024-08-01T00:00:00Z',
          periodEnd: '2024-08-31T23:59:59Z',
          periodType: 'month',
          visitsPlanned: 12,
          visitsCompleted: 10,
          totalVisitTime: 2400,
          newLeads: 25,
          qualifiedLeads: 18,
          leadsConverted: 6,
          conversionRate: 0.33,
          pipelineValue: 750000,
          closedRevenue: 375000,
          avgDealSize: 62500,
          milesTravel: 450,
          fuelCost: 85,
          timeUtilization: 0.82,
          newCustomers: 4,
          customerMeetings: 32,
          satisfactionScore: 4.4,
          competitorMentions: 8,
          lostToCompetitors: 2,
          competitiveWins: 4,
          performanceScore: 0.86,
          improvementAreas: ['Follow-up speed', 'Competitive positioning'],
          recommendations: {
            frequency: 'Consider increasing visit frequency to twice weekly',
            focus: 'Target enterprise accounts in Q4',
            efficiency: 'Optimize route to reduce travel time by 15%'
          },
          recordedAt: '2024-08-11T00:00:00Z'
        }
      ]

      const mockRecentLeads: Lead[] = [
        {
          id: 'lead-1',
          tenantId,
          firstName: 'Sarah',
          lastName: 'Chen',
          email: 'sarah.chen@techstartup.com',
          phone: '+1 (555) 234-5678',
          company: 'TechStartup Inc',
          title: 'VP of Operations',
          address: '100 Tech Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'US',
          source: 'website',
          status: 'new',
          qualification: 'mql',
          aiScore: 85,
          buyingIntent: 0.75,
          responseProb: 0.82,
          territoryId: 'territory-1',
          assignedUserId: userId || 'user-1',
          companySize: '51-200',
          annualRevenue: 5000000,
          industry: 'Technology',
          decisionMaker: true,
          timeline: '1-3_months',
          firstTouchDate: '2024-08-10T14:30:00Z',
          touchCount: 1,
          emailOpens: 0,
          emailClicks: 0,
          websiteVisits: 3,
          convertedToDeal: false,
          createdAt: '2024-08-10T14:30:00Z',
          updatedAt: '2024-08-10T14:30:00Z'
        }
      ]

      setTerritories(mockTerritories)
      setTerritoryAnalytics(mockAnalytics)
      setRecentLeads(mockRecentLeads)
      
    } catch (error) {
      console.error('Failed to load territory data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100'
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <MapIcon className="h-8 w-8 mr-3 text-blue-600" />
            Territory Management
          </h1>
          <p className="text-gray-600 mt-1">AI-powered territory optimization and lead routing</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-md shadow-sm">
            {(['overview', 'analytics', 'mobile', 'manager', 'coaching'] as const).map((mode, index, array) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium border ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                } ${index === 0 ? 'rounded-l-md' : index === array.length - 1 ? 'rounded-r-md' : ''}`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          
          <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md shadow-sm hover:from-blue-700 hover:to-purple-700">
            <BoltIcon className="h-4 w-4 mr-2" />
            Optimize Territories
          </button>
        </div>
      </div>

      {/* Overview Dashboard */}
      {viewMode === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MapIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Territories</dt>
                      <dd className="text-lg font-medium text-gray-900">{territories.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">New Leads Today</dt>
                      <dd className="text-lg font-medium text-gray-900">{recentLeads.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrophyIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg Conversion Rate</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {Math.round(territories.reduce((acc, t) => acc + t.leadConversionRate, 0) / territories.length * 100)}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pipeline Value</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(territoryAnalytics.reduce((acc, a) => acc + a.pipelineValue, 0))}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Territory Performance Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Territory Map */}
            <div className="bg-white shadow rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Territory Coverage
                </h3>
                <p className="text-sm text-gray-600 mt-1">Visual territory boundaries and lead distribution</p>
              </div>
              <div className="p-6">
                <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Interactive Territory Map</p>
                    <p className="text-sm text-gray-400">Showing coverage and lead density</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Territory Performance */}
            <div className="bg-white shadow rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-green-600" />
                  Territory Performance
                </h3>
                <p className="text-sm text-gray-600 mt-1">AI-powered performance analytics</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {territories.map((territory) => (
                    <div key={territory.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{territory.name}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>Visits: {territory.visitFrequency}</span>
                          <span>Conv: {Math.round(territory.leadConversionRate * 100)}%</span>
                          <span>Avg Deal: {formatCurrency(territory.avgDealValue)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPerformanceColor(territory.leadConversionRate / 0.4)}`}>
                          {territory.leadConversionRate > 0.3 ? 'Excellent' : territory.leadConversionRate > 0.2 ? 'Good' : 'Needs Focus'}
                        </span>
                        <button
                          onClick={() => setSelectedTerritory(territory)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* New Leads */}
            <div className="bg-white shadow rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Recent Lead Assignments
                </h3>
                <p className="text-sm text-gray-600 mt-1">AI-routed leads by territory</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{lead.firstName} {lead.lastName}</h4>
                        <p className="text-sm text-gray-600">{lead.company} • {lead.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            AI Score: {lead.aiScore}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(lead.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-green-600 hover:text-green-800">
                          <PhoneIcon className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming Visits */}
            <div className="bg-white shadow rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-orange-600" />
                  Upcoming Territory Visits
                </h3>
                <p className="text-sm text-gray-600 mt-1">AI-optimized visit schedule</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {territories.filter(t => t.nextVisitDate).map((territory) => (
                    <div key={territory.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{territory.name}</h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(territory.nextVisitDate!)} • {territory.visitFrequency} frequency
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Priority: {territory.priority}/10
                          </span>
                          <span className="text-xs text-gray-500">
                            {territory.assignedUser?.name}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedTerritory(territory)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200"
                      >
                        Plan Visit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <TerritoryPerformanceAnalytics
          territories={territories}
          userId={userId}
          tenantId={tenantId}
          className=""
        />
      )}

      {/* Mobile Command Center */}
      {viewMode === 'mobile' && (
        <MobileTerritoryCommandCenter
          userId={userId || 'user-1'}
          tenantId={tenantId}
          onLocationUpdate={(location) => {
            console.log('Location updated:', location)
          }}
          className=""
        />
      )}

      {/* Manager Efficiency Dashboard */}
      {viewMode === 'manager' && (
        <ManagerEfficiencyDashboard
          managerId={userId || 'manager-1'}
          tenantId={tenantId}
          teamMembers={['user-1', 'user-2', 'user-3']}
          className=""
        />
      )}

      {/* Real-Time Coaching */}
      {viewMode === 'coaching' && (
        <RealTimeTerritoryCoaching
          userId={userId || 'user-1'}
          managerId="manager-1"
          tenantId={tenantId}
          onCoachingAction={(action) => {
            console.log('Coaching action:', action)
          }}
          className=""
        />
      )}

      {/* Territory Intelligence Briefing Modal */}
      {selectedTerritory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Pre-Visit Intelligence Briefing</h2>
              <button
                onClick={() => setSelectedTerritory(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TerritoryIntelligenceBriefing
              territory={selectedTerritory}
              visitDate={new Date().toISOString()}
              userId={userId || 'user-1'}
              onStartBriefing={(briefing) => {
                console.log('Starting briefing:', briefing)
                setSelectedTerritory(null)
                // Here you could navigate to the visit execution view
              }}
              className=""
            />
          </div>
        </div>
      )}

      {/* AI Optimization Suggestions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BoltIcon className="h-5 w-5 mr-2 text-blue-600" />
              AI Optimization Recommendations
            </h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-700">• Consider increasing Northeast Hub visit frequency to 2x weekly (expected 25% revenue increase)</p>
              <p className="text-sm text-gray-700">• Route optimization could reduce travel time by 18% (saving $450/month in fuel costs)</p>
              <p className="text-sm text-gray-700">• 3 high-value leads await assignment - auto-routing recommended</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
            Apply Suggestions
          </button>
        </div>
      </div>
    </div>
  )
}