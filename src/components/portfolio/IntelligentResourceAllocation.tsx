'use client'

/**
 * Intelligent Resource Allocation
 * 
 * AI-powered resource allocation system for multi-business portfolios,
 * optimizing human resources, budget, equipment, and technology across businesses.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ResourceAllocation {
  id: string
  resourceType: 'EMPLOYEE' | 'BUDGET' | 'EQUIPMENT' | 'TECHNOLOGY' | 'INVENTORY'
  resourceName: string
  resourceId?: string
  sourceBusinessId?: string
  targetBusinessId?: string
  sourceBusinessName?: string
  targetBusinessName?: string
  allocationAmount: number
  allocationUnit: string
  startDate: Date
  endDate?: Date
  isRecurring: boolean
  recurringPattern?: string
  allocationType: 'MANUAL' | 'AUTO_DEMAND' | 'AUTO_EFFICIENCY' | 'AI_OPTIMIZED'
  allocationReason?: string
  expectedBenefit?: string
  estimatedValue: number
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  utilizationRate: number
  actualValue: number
  aiRecommended: boolean
  optimizationScore: number
  alternativeOptions: any[]
}

interface ResourceOptimization {
  id: string
  optimizationType: 'REALLOCATION' | 'CONSOLIDATION' | 'EXPANSION' | 'EFFICIENCY'
  title: string
  description: string
  affectedResources: string[]
  estimatedSavings: number
  implementationCost: number
  netBenefit: number
  confidence: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  timeToImplement: number // days
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  businessImpact: string[]
}

interface ResourceDemand {
  id: string
  businessId: string
  businessName: string
  resourceType: string
  demandType: 'IMMEDIATE' | 'PLANNED' | 'PROJECTED'
  requiredAmount: number
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  justification: string
  requestedBy: string
  requestDate: Date
  neededBy: Date
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED'
  estimatedCost: number
  alternatives: string[]
}

interface ResourceCapacity {
  resourceType: string
  totalCapacity: number
  allocatedCapacity: number
  availableCapacity: number
  utilizationRate: number
  efficiency: number
  costPerUnit: number
  businesses: {
    businessId: string
    businessName: string
    allocation: number
    utilization: number
    performance: number
  }[]
}

interface IntelligentResourceAllocationProps {
  portfolioId?: string
  className?: string
}

const IntelligentResourceAllocation: React.FC<IntelligentResourceAllocationProps> = ({
  portfolioId = 'demo-portfolio',
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'ALLOCATIONS' | 'OPTIMIZATION' | 'DEMAND' | 'CAPACITY'>('ALLOCATIONS')
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([])
  const [optimizations, setOptimizations] = useState<ResourceOptimization[]>([])
  const [demands, setDemands] = useState<ResourceDemand[]>([])
  const [capacities, setCapacities] = useState<ResourceCapacity[]>([])
  const [selectedResource, setSelectedResource] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('ALL')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadResourceData()
  }, [portfolioId])

  const loadResourceData = async () => {
    setIsLoading(true)

    // Mock resource allocation data
    const mockAllocations: ResourceAllocation[] = [
      {
        id: 'alloc-001',
        resourceType: 'EMPLOYEE',
        resourceName: 'Senior Full-Stack Developer',
        resourceId: 'emp-001',
        sourceBusinessId: 'business-001',
        targetBusinessId: 'business-003',
        sourceBusinessName: 'TechFlow Solutions',
        targetBusinessName: 'HVAC Pro Services',
        allocationAmount: 20,
        allocationUnit: 'hours/week',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-06-30'),
        isRecurring: false,
        allocationType: 'AI_OPTIMIZED',
        allocationReason: 'HVAC business needs custom software development for field service optimization',
        expectedBenefit: 'Reduce service time by 25%, increase customer satisfaction',
        estimatedValue: 180000,
        status: 'ACTIVE',
        utilizationRate: 92,
        actualValue: 165000,
        aiRecommended: true,
        optimizationScore: 87,
        alternativeOptions: []
      },
      {
        id: 'alloc-002',
        resourceType: 'BUDGET',
        resourceName: 'Marketing Campaign Fund',
        sourceBusinessId: 'portfolio',
        targetBusinessId: 'all',
        sourceBusinessName: 'Portfolio Fund',
        targetBusinessName: 'All Businesses',
        allocationAmount: 150000,
        allocationUnit: 'USD',
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-09-15'),
        isRecurring: false,
        allocationType: 'MANUAL',
        allocationReason: 'Cross-business marketing campaign to leverage brand synergies',
        expectedBenefit: 'Increase brand awareness across all business verticals',
        estimatedValue: 450000,
        status: 'ACTIVE',
        utilizationRate: 78,
        actualValue: 380000,
        aiRecommended: false,
        optimizationScore: 72,
        alternativeOptions: []
      },
      {
        id: 'alloc-003',
        resourceType: 'EQUIPMENT',
        resourceName: 'Advanced Diagnostic Equipment',
        resourceId: 'eq-001',
        sourceBusinessId: 'business-003',
        targetBusinessId: 'business-004',
        sourceBusinessName: 'HVAC Pro Services',
        targetBusinessName: 'ElectriFlow Systems',
        allocationAmount: 2,
        allocationUnit: 'days/week',
        startDate: new Date('2024-03-20'),
        isRecurring: true,
        recurringPattern: 'WEEKLY',
        allocationType: 'AUTO_EFFICIENCY',
        allocationReason: 'Equipment utilization optimization across related service businesses',
        expectedBenefit: 'Reduce equipment costs, improve service capabilities',
        estimatedValue: 45000,
        status: 'ACTIVE',
        utilizationRate: 85,
        actualValue: 42000,
        aiRecommended: true,
        optimizationScore: 91,
        alternativeOptions: []
      }
    ]

    const mockOptimizations: ResourceOptimization[] = [
      {
        id: 'opt-001',
        optimizationType: 'CONSOLIDATION',
        title: 'Consolidate IT Support Teams',
        description: 'Merge IT support across 3 businesses into a single centralized team. Analysis shows 40% efficiency gain and $240K annual savings.',
        affectedResources: ['IT Support Team', 'Help Desk Systems', 'IT Equipment'],
        estimatedSavings: 240000,
        implementationCost: 45000,
        netBenefit: 195000,
        confidence: 89,
        priority: 'HIGH',
        timeToImplement: 45,
        riskLevel: 'MEDIUM',
        businessImpact: ['business-001', 'business-002', 'business-003']
      },
      {
        id: 'opt-002',
        optimizationType: 'REALLOCATION',
        title: 'Cross-Train Sales Representatives',
        description: 'Enable sales team to sell across all business lines. Projected 35% increase in cross-selling opportunities.',
        affectedResources: ['Sales Team', 'Training Programs', 'CRM Systems'],
        estimatedSavings: 380000,
        implementationCost: 85000,
        netBenefit: 295000,
        confidence: 76,
        priority: 'HIGH',
        timeToImplement: 60,
        riskLevel: 'LOW',
        businessImpact: ['business-001', 'business-002', 'business-003', 'business-004']
      },
      {
        id: 'opt-003',
        optimizationType: 'EFFICIENCY',
        title: 'Shared Inventory Management',
        description: 'Implement shared inventory system for common materials across construction and HVAC businesses.',
        affectedResources: ['Inventory', 'Warehouse Space', 'Logistics Team'],
        estimatedSavings: 120000,
        implementationCost: 35000,
        netBenefit: 85000,
        confidence: 82,
        priority: 'MEDIUM',
        timeToImplement: 30,
        riskLevel: 'LOW',
        businessImpact: ['business-003', 'business-004']
      }
    ]

    const mockDemands: ResourceDemand[] = [
      {
        id: 'demand-001',
        businessId: 'business-002',
        businessName: 'Consulting Excellence',
        resourceType: 'EMPLOYEE',
        demandType: 'IMMEDIATE',
        requiredAmount: 2,
        urgency: 'HIGH',
        justification: 'New client contract requires additional project managers for Q2 delivery',
        requestedBy: 'Sarah Johnson',
        requestDate: new Date('2024-03-18'),
        neededBy: new Date('2024-04-15'),
        status: 'PENDING',
        estimatedCost: 160000,
        alternatives: ['Contract workers', 'Temporary reallocation from other businesses']
      },
      {
        id: 'demand-002',
        businessId: 'business-004',
        businessName: 'ElectriFlow Systems',
        resourceType: 'EQUIPMENT',
        demandType: 'PLANNED',
        requiredAmount: 1,
        urgency: 'MEDIUM',
        justification: 'Expansion into commercial electrical work requires specialized testing equipment',
        requestedBy: 'Mike Chen',
        requestDate: new Date('2024-03-20'),
        neededBy: new Date('2024-05-01'),
        status: 'APPROVED',
        estimatedCost: 75000,
        alternatives: ['Equipment sharing with HVAC business', 'Leasing arrangement']
      }
    ]

    const mockCapacities: ResourceCapacity[] = [
      {
        resourceType: 'EMPLOYEE',
        totalCapacity: 287,
        allocatedCapacity: 251,
        availableCapacity: 36,
        utilizationRate: 87.5,
        efficiency: 82.3,
        costPerUnit: 75000,
        businesses: [
          { businessId: 'business-001', businessName: 'TechFlow Solutions', allocation: 67, utilization: 89, performance: 92 },
          { businessId: 'business-002', businessName: 'Consulting Excellence', allocation: 45, utilization: 91, performance: 88 },
          { businessId: 'business-003', businessName: 'HVAC Pro Services', allocation: 78, utilization: 85, performance: 84 },
          { businessId: 'business-004', businessName: 'ElectriFlow Systems', allocation: 52, utilization: 82, performance: 79 },
          { businessId: 'business-005', businessName: 'Digital Marketing Co', allocation: 9, utilization: 94, performance: 95 }
        ]
      },
      {
        resourceType: 'BUDGET',
        totalCapacity: 2500000,
        allocatedCapacity: 2180000,
        availableCapacity: 320000,
        utilizationRate: 87.2,
        efficiency: 76.8,
        costPerUnit: 1,
        businesses: [
          { businessId: 'business-001', businessName: 'TechFlow Solutions', allocation: 750000, utilization: 88, performance: 85 },
          { businessId: 'business-002', businessName: 'Consulting Excellence', allocation: 520000, utilization: 92, performance: 89 },
          { businessId: 'business-003', businessName: 'HVAC Pro Services', allocation: 480000, utilization: 84, performance: 76 },
          { businessId: 'business-004', businessName: 'ElectriFlow Systems', allocation: 320000, utilization: 79, performance: 71 },
          { businessId: 'business-005', businessName: 'Digital Marketing Co', allocation: 110000, utilization: 95, performance: 92 }
        ]
      }
    ]

    setTimeout(() => {
      setAllocations(mockAllocations)
      setOptimizations(mockOptimizations)
      setDemands(mockDemands)
      setCapacities(mockCapacities)
      setIsLoading(false)
    }, 1000)
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'EMPLOYEE': return '👥'
      case 'BUDGET': return '💰'
      case 'EQUIPMENT': return '🔧'
      case 'TECHNOLOGY': return '💻'
      case 'INVENTORY': return '📦'
      default: return '⚡'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-400 bg-green-500/20'
      case 'PLANNED': return 'text-blue-400 bg-blue-500/20'
      case 'COMPLETED': return 'text-purple-400 bg-purple-500/20'
      case 'CANCELLED': return 'text-red-400 bg-red-500/20'
      case 'PENDING': return 'text-yellow-400 bg-yellow-500/20'
      case 'APPROVED': return 'text-green-400 bg-green-500/20'
      case 'REJECTED': return 'text-red-400 bg-red-500/20'
      case 'FULFILLED': return 'text-purple-400 bg-purple-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'HIGH': return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'LOW': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'CRITICAL': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    } else {
      return `$${amount.toLocaleString()}`
    }
  }

  const filteredAllocations = filterType === 'ALL' 
    ? allocations 
    : allocations.filter(alloc => alloc.resourceType === filterType)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="rounded-2xl border border-gray-700 bg-gradient-to-r from-gray-900 to-black p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">⚡ Intelligent Resource Allocation</h1>
            <p className="text-gray-400">AI-powered resource optimization across business portfolio</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-cyan-500">
              🤖 Optimize All Resources
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-cyan-400">{allocations.length}</div>
            <div className="text-sm text-gray-400">Active Allocations</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {optimizations.reduce((sum, opt) => sum + opt.netBenefit, 0) > 0 
                ? formatCurrency(optimizations.reduce((sum, opt) => sum + opt.netBenefit, 0))
                : '$0'}
            </div>
            <div className="text-sm text-gray-400">Optimization Value</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">
              {capacities.length > 0 ? Math.round(capacities.reduce((sum, cap) => sum + cap.utilizationRate, 0) / capacities.length) : 0}%
            </div>
            <div className="text-sm text-gray-400">Avg Utilization</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">{demands.filter(d => d.status === 'PENDING').length}</div>
            <div className="text-sm text-gray-400">Pending Requests</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mt-6">
          {[
            { key: 'ALLOCATIONS', label: 'Resource Allocations', icon: '⚡' },
            { key: 'OPTIMIZATION', label: 'AI Optimizations', icon: '🤖' },
            { key: 'DEMAND', label: 'Resource Demands', icon: '📋' },
            { key: 'CAPACITY', label: 'Capacity Overview', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Allocations Tab */}
      {activeTab === 'ALLOCATIONS' && (
        <div className="space-y-6">
          {/* Filter */}
          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-400">Filter by type:</label>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="ALL">All Resources</option>
              <option value="EMPLOYEE">Employees</option>
              <option value="BUDGET">Budget</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="TECHNOLOGY">Technology</option>
              <option value="INVENTORY">Inventory</option>
            </select>
          </div>

          {/* Allocations List */}
          <div className="space-y-4">
            {filteredAllocations.map((allocation) => (
              <motion.div
                key={allocation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-gray-700 bg-gray-900 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getResourceIcon(allocation.resourceType)}</span>
                    <div>
                      <h3 className="font-medium text-white">{allocation.resourceName}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(allocation.status)}`}>
                          {allocation.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {allocation.allocationType.replace('_', ' ')}
                        </span>
                        {allocation.aiRecommended && (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                            AI Recommended
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      {formatCurrency(allocation.estimatedValue)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Score: {allocation.optimizationScore}%
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">From → To</div>
                    <div className="text-white">
                      {allocation.sourceBusinessName} → {allocation.targetBusinessName}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Allocation</div>
                    <div className="text-cyan-400">
                      {allocation.allocationAmount} {allocation.allocationUnit}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Duration</div>
                    <div className="text-white">
                      {allocation.startDate.toLocaleDateString()} - {
                        allocation.endDate ? allocation.endDate.toLocaleDateString() : 'Ongoing'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Utilization</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-cyan-500 h-2 rounded-full"
                          style={{ width: `${allocation.utilizationRate}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">{allocation.utilizationRate}%</span>
                    </div>
                  </div>
                </div>

                {allocation.allocationReason && (
                  <div className="bg-black/30 rounded-lg p-3 mb-4">
                    <div className="text-sm text-gray-400 mb-1">Reason & Expected Benefit</div>
                    <div className="text-gray-300 text-sm">{allocation.allocationReason}</div>
                    {allocation.expectedBenefit && (
                      <div className="text-green-400 text-sm mt-1">💡 {allocation.expectedBenefit}</div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                  <div className="text-sm">
                    <span className="text-gray-400">Actual Value: </span>
                    <span className="text-green-400">{formatCurrency(allocation.actualValue)}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-500">
                      Modify
                    </button>
                    <button className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-500">
                      Analyze
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* AI Optimizations Tab */}
      {activeTab === 'OPTIMIZATION' && (
        <div className="space-y-4">
          {optimizations.map((optimization) => (
            <motion.div
              key={optimization.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-purple-600 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{optimization.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-400">{optimization.optimizationType}</span>
                    <span className={`px-2 py-1 rounded border text-xs ${getPriorityColor(optimization.priority)}`}>
                      {optimization.priority}
                    </span>
                    <span className="text-xs text-gray-400">
                      {optimization.confidence}% confidence
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">
                    {formatCurrency(optimization.netBenefit)}
                  </div>
                  <div className="text-xs text-gray-400">Net Benefit</div>
                </div>
              </div>

              <p className="text-gray-300 mb-4">{optimization.description}</p>

              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-sm text-gray-400 mb-1">Estimated Savings</div>
                  <div className="text-green-400 font-medium">
                    {formatCurrency(optimization.estimatedSavings)}
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-sm text-gray-400 mb-1">Implementation Cost</div>
                  <div className="text-red-400 font-medium">
                    {formatCurrency(optimization.implementationCost)}
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-sm text-gray-400 mb-1">Time to Implement</div>
                  <div className="text-cyan-400 font-medium">
                    {optimization.timeToImplement} days
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-sm">
                  <span className="text-gray-400">Risk Level: </span>
                  <span className={`${
                    optimization.riskLevel === 'HIGH' ? 'text-red-400' :
                    optimization.riskLevel === 'MEDIUM' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {optimization.riskLevel}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Affected Resources: </span>
                  <span className="text-cyan-400">{optimization.affectedResources.length}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-600">
                <div className="flex space-x-2">
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500">
                    Implement Optimization
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">
                    Schedule Implementation
                  </button>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Resource Demands Tab */}
      {activeTab === 'DEMAND' && (
        <div className="space-y-4">
          {demands.map((demand) => (
            <motion.div
              key={demand.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-gray-700 bg-gray-900 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-white">{demand.businessName}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-400">{demand.resourceType}</span>
                    <span className={`px-2 py-1 rounded border text-xs ${getPriorityColor(demand.urgency)}`}>
                      {demand.urgency}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(demand.status)}`}>
                      {demand.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-cyan-400">
                    {demand.requiredAmount}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatCurrency(demand.estimatedCost)}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Requested By</div>
                  <div className="text-white">{demand.requestedBy}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Needed By</div>
                  <div className="text-white">{demand.neededBy.toLocaleDateString()}</div>
                </div>
              </div>

              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <div className="text-sm text-gray-400 mb-1">Justification</div>
                <div className="text-gray-300 text-sm">{demand.justification}</div>
              </div>

              {demand.alternatives.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Alternatives</div>
                  <div className="space-y-1">
                    {demand.alternatives.map((alt, index) => (
                      <div key={index} className="text-sm text-gray-300">
                        • {alt}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                {demand.status === 'PENDING' && (
                  <>
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-500">
                      Approve
                    </button>
                    <button className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-500">
                      Reject
                    </button>
                  </>
                )}
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-500">
                  Alternative Solutions
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Capacity Overview Tab */}
      {activeTab === 'CAPACITY' && (
        <div className="space-y-6">
          {capacities.map((capacity) => (
            <motion.div
              key={capacity.resourceType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-gray-700 bg-gray-900 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getResourceIcon(capacity.resourceType)}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{capacity.resourceType}</h3>
                    <div className="text-sm text-gray-400">
                      {capacity.utilizationRate.toFixed(1)}% utilization • {capacity.efficiency.toFixed(1)}% efficiency
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400">{capacity.totalCapacity}</div>
                  <div className="text-xs text-gray-400">Total Capacity</div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-lg font-bold text-green-400">{capacity.allocatedCapacity}</div>
                  <div className="text-sm text-gray-400">Allocated</div>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-lg font-bold text-yellow-400">{capacity.availableCapacity}</div>
                  <div className="text-sm text-gray-400">Available</div>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-lg font-bold text-purple-400">
                    {capacity.resourceType === 'BUDGET' ? formatCurrency(capacity.costPerUnit) : capacity.costPerUnit}
                  </div>
                  <div className="text-sm text-gray-400">Cost per Unit</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">Capacity Utilization</div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-cyan-500 h-3 rounded-full"
                    style={{ width: `${capacity.utilizationRate}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium text-white">Business Allocation Breakdown</div>
                {capacity.businesses.map((business) => (
                  <div key={business.businessId} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-300">{business.businessName}</span>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="text-gray-400">Allocation: </span>
                        <span className="text-cyan-400">{business.allocation}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">Utilization: </span>
                        <span className="text-yellow-400">{business.utilization}%</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">Performance: </span>
                        <span className="text-green-400">{business.performance}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-white">Loading resource allocation data...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default IntelligentResourceAllocation