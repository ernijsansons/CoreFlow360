'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Building, 
  Clock, 
  TrendingUp, 
  Plus,
  ArrowRight,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Settings,
  Share
} from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  primaryBusinessId: string
  primaryBusinessName: string
  availableForSharing: boolean
  maxHoursPerWeek: number
  crossBusinessRate?: number
  skills: string[]
  currentAllocations: BusinessAllocation[]
  aiEfficiencyScore: number
  utilizationRate: number
}

interface BusinessAllocation {
  id: string
  businessId: string
  businessName: string
  hoursPerWeek: number
  role: string
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED'
  startDate: string
  endDate?: string
  hourlyRate?: number
  productivityScore: number
}

export function CrossBusinessEmployeeManager() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedTab, setSelectedTab] = useState<'available' | 'allocated' | 'optimization'>('available')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data - in production, this would fetch from API
    const mockEmployees: Employee[] = [
      {
        id: '1',
        firstName: 'Sarah',
        lastName: 'Mitchell',
        email: 'sarah@phoenixhvac.com',
        jobTitle: 'Senior HVAC Technician',
        primaryBusinessId: 'phoenix-hvac',
        primaryBusinessName: 'Phoenix HVAC Services',
        availableForSharing: true,
        maxHoursPerWeek: 40,
        crossBusinessRate: 75,
        skills: ['Commercial HVAC', 'Troubleshooting', 'Preventive Maintenance'],
        currentAllocations: [
          {
            id: '1',
            businessId: 'phoenix-hvac',
            businessName: 'Phoenix HVAC Services',
            hoursPerWeek: 32,
            role: 'Senior Technician',
            status: 'ACTIVE',
            startDate: '2024-01-01',
            productivityScore: 94
          },
          {
            id: '2',
            businessId: 'desert-air',
            businessName: 'Desert Air Solutions',
            hoursPerWeek: 8,
            role: 'Consultant',
            status: 'ACTIVE',
            startDate: '2024-08-01',
            hourlyRate: 85,
            productivityScore: 88
          }
        ],
        aiEfficiencyScore: 92,
        utilizationRate: 100
      },
      {
        id: '2',
        firstName: 'Mike',
        lastName: 'Rodriguez',
        email: 'mike@valleymaintenance.com',
        jobTitle: 'Maintenance Supervisor',
        primaryBusinessId: 'valley-maintenance',
        primaryBusinessName: 'Valley Maintenance Co',
        availableForSharing: true,
        maxHoursPerWeek: 40,
        crossBusinessRate: 68,
        skills: ['Team Leadership', 'Equipment Repair', 'Project Management'],
        currentAllocations: [
          {
            id: '3',
            businessId: 'valley-maintenance',
            businessName: 'Valley Maintenance Co',
            hoursPerWeek: 35,
            role: 'Supervisor',
            status: 'ACTIVE',
            startDate: '2024-01-01',
            productivityScore: 89
          }
        ],
        aiEfficiencyScore: 87,
        utilizationRate: 87.5
      },
      {
        id: '3',
        firstName: 'Jessica',
        lastName: 'Chen',
        email: 'jessica@phoenixhvac.com',
        jobTitle: 'Customer Success Manager',
        primaryBusinessId: 'phoenix-hvac',
        primaryBusinessName: 'Phoenix HVAC Services',
        availableForSharing: false,
        maxHoursPerWeek: 40,
        skills: ['Customer Relations', 'Sales Support', 'Account Management'],
        currentAllocations: [
          {
            id: '4',
            businessId: 'phoenix-hvac',
            businessName: 'Phoenix HVAC Services',
            hoursPerWeek: 40,
            role: 'Customer Success Manager',
            status: 'ACTIVE',
            startDate: '2024-01-01',
            productivityScore: 96
          }
        ],
        aiEfficiencyScore: 96,
        utilizationRate: 100
      }
    ]
    
    setEmployees(mockEmployees)
    setIsLoading(false)
  }, [])

  const availableEmployees = employees.filter(emp => emp.availableForSharing && emp.utilizationRate < 100)
  const fullyAllocatedEmployees = employees.filter(emp => emp.utilizationRate >= 100)
  const underutilizedEmployees = employees.filter(emp => emp.utilizationRate < 85)

  const getTotalSavings = () => {
    return employees.reduce((total, emp) => {
      const crossBusinessAllocations = emp.currentAllocations.filter(
        alloc => alloc.businessId !== emp.primaryBusinessId
      )
      return total + crossBusinessAllocations.reduce((sum, alloc) => 
        sum + (alloc.hourlyRate || 0) * alloc.hoursPerWeek * 4, 0
      )
    }, 0)
  }

  const getAvailableHours = () => {
    return availableEmployees.reduce((total, emp) => {
      const currentHours = emp.currentAllocations.reduce((sum, alloc) => sum + alloc.hoursPerWeek, 0)
      return total + (emp.maxHoursPerWeek - currentHours)
    }, 0)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
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
          <h1 className="text-3xl font-bold mb-2">Cross-Business Employee Management</h1>
          <p className="text-gray-600">Optimize talent allocation across your business portfolio</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Request Employee Share
        </Button>
      </motion.div>

      {/* Key Metrics */}
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
                <p className="text-sm text-green-700 font-medium">Cross-Business Revenue</p>
                <p className="text-2xl font-bold text-green-900">${getTotalSavings().toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">Monthly from shared talent</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Available Capacity</p>
                <p className="text-2xl font-bold text-blue-900">{getAvailableHours()}h</p>
                <p className="text-xs text-blue-600 mt-1">Per week across portfolio</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Shared Employees</p>
                <p className="text-2xl font-bold text-purple-900">
                  {employees.filter(emp => emp.currentAllocations.length > 1).length}
                </p>
                <p className="text-xs text-purple-600 mt-1">Active cross-business</p>
              </div>
              <Share className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Avg Efficiency</p>
                <p className="text-2xl font-bold text-orange-900">
                  {Math.round(employees.reduce((sum, emp) => sum + emp.aiEfficiencyScore, 0) / employees.length)}%
                </p>
                <p className="text-xs text-orange-600 mt-1">AI-calculated score</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {[
          { id: 'available', label: 'Available for Sharing', count: availableEmployees.length },
          { id: 'allocated', label: 'Currently Shared', count: fullyAllocatedEmployees.length },
          { id: 'optimization', label: 'Optimization Opportunities', count: underutilizedEmployees.length }
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

      {/* Employee List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {(selectedTab === 'available' ? availableEmployees :
          selectedTab === 'allocated' ? fullyAllocatedEmployees :
          underutilizedEmployees).map((employee, index) => (
          <motion.div
            key={employee.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <p className="text-gray-600">{employee.jobTitle}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{employee.primaryBusinessName}</span>
                        {employee.availableForSharing && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Available for sharing
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Utilization</div>
                      <div className="font-semibold">{employee.utilizationRate}%</div>
                      <div className="text-xs text-gray-500">
                        {employee.currentAllocations.reduce((sum, alloc) => sum + alloc.hoursPerWeek, 0)}h/week
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-gray-600">AI Efficiency</div>
                      <div className="font-semibold">{employee.aiEfficiencyScore}%</div>
                      <div className="text-xs text-green-600">Optimized</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-gray-600">Cross-Business Rate</div>
                      <div className="font-semibold">
                        {employee.crossBusinessRate ? `$${employee.crossBusinessRate}` : 'Not set'}
                      </div>
                      <div className="text-xs text-gray-500">Per hour</div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Current Allocations */}
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Current Allocations</h4>
                    <div className="flex items-center space-x-2">
                      {employee.skills.slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {employee.currentAllocations.map((allocation) => (
                      <div
                        key={allocation.id}
                        className="p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{allocation.businessName}</span>
                          <Badge
                            variant={allocation.status === 'ACTIVE' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {allocation.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Role:</span>
                            <span>{allocation.role}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Hours/week:</span>
                            <span>{allocation.hoursPerWeek}h</span>
                          </div>
                          {allocation.hourlyRate && (
                            <div className="flex justify-between">
                              <span>Rate:</span>
                              <span>${allocation.hourlyRate}/hr</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Performance:</span>
                            <span className="text-green-600">{allocation.productivityScore}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {selectedTab === 'optimization' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                AI Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white/70 rounded-lg">
                  <h4 className="font-medium text-amber-900 mb-2">Resource Reallocation Opportunity</h4>
                  <p className="text-sm text-amber-700 mb-3">
                    Mike Rodriguez (Valley Maintenance) has 5 available hours/week that could be allocated to Desert Air Solutions for equipment maintenance projects.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-600">Potential revenue: $340/week</span>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                      Implement Suggestion
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-white/70 rounded-lg">
                  <h4 className="font-medium text-amber-900 mb-2">Cross-Training Opportunity</h4>
                  <p className="text-sm text-amber-700 mb-3">
                    Training Jessica Chen in basic HVAC customer support could enable 10 hours/week cross-business allocation, improving customer response times across the portfolio.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-600">Training cost: $2,400 | ROI: 340%</span>
                    <Button size="sm" variant="outline" className="border-amber-600 text-amber-600">
                      Schedule Training
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}