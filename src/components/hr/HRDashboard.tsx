'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Clock, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Building,
  Settings,
  Plus,
  UserCheck,
  AlertCircle,
  BarChart3,
  FileText
} from 'lucide-react'
import { CrossBusinessEmployeeManager } from '@/components/cross-business/CrossBusinessEmployeeManager'
import { CrossBusinessTimeTracker } from '@/components/cross-business/CrossBusinessTimeTracker'

interface HRMetrics {
  totalEmployees: number
  activeEmployees: number
  totalHours: number
  avgUtilization: number
  totalPayroll: number
  departmentCount: number
}

export default function HRDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'timetracking' | 'payroll'>('overview')
  
  // Mock HR metrics - in production, fetch from API
  const metrics: HRMetrics = {
    totalEmployees: 24,
    activeEmployees: 22,
    totalHours: 1680, // This week
    avgUtilization: 87,
    totalPayroll: 45200, // Monthly
    departmentCount: 5
  }

  const departments = [
    { name: 'HVAC Operations', employees: 12, utilization: 94 },
    { name: 'Sales & Marketing', employees: 4, utilization: 82 },
    { name: 'Customer Service', employees: 3, utilization: 88 },
    { name: 'Administration', employees: 3, utilization: 75 },
    { name: 'Management', employees: 2, utilization: 92 }
  ]

  const recentActivities = [
    { type: 'hire', message: 'John Smith started as Senior Technician', time: '2 hours ago' },
    { type: 'leave', message: 'Sarah Wilson requested 3 days vacation', time: '4 hours ago' },
    { type: 'overtime', message: 'Mike Johnson worked 4 hours overtime', time: '1 day ago' },
    { type: 'review', message: 'Quarterly reviews due for 8 employees', time: '2 days ago' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Human Resources</h1>
          <p className="text-gray-600">Manage employees, time tracking, and payroll</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Reports
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'employees', name: 'Employee Management', icon: Users },
            { id: 'timetracking', name: 'Time Tracking', icon: Clock },
            { id: 'payroll', name: 'Payroll', icon: DollarSign }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 inline mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Employees</p>
                    <p className="text-2xl font-bold">{metrics.totalEmployees}</p>
                    <p className="text-xs text-green-600">+2 this month</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active This Week</p>
                    <p className="text-2xl font-bold">{metrics.activeEmployees}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round((metrics.activeEmployees / metrics.totalEmployees) * 100)}% utilization
                    </p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Hours This Week</p>
                    <p className="text-2xl font-bold">{metrics.totalHours.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+120 vs last week</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Payroll</p>
                    <p className="text-2xl font-bold">${metrics.totalPayroll.toLocaleString()}</p>
                    <p className="text-xs text-blue-600">On budget</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Department Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {departments.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{dept.name}</p>
                          <p className="text-sm text-gray-600">{dept.employees} employees</p>
                        </div>
                      </div>
                      <Badge 
                        className={
                          dept.utilization >= 90 ? 'bg-green-100 text-green-800' :
                          dept.utilization >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {dept.utilization}% util.
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'hire' ? 'bg-green-500' :
                        activity.type === 'leave' ? 'bg-blue-500' :
                        activity.type === 'overtime' ? 'bg-yellow-500' :
                        'bg-purple-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Plus className="w-5 h-5" />
                  Add Employee
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule Review
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Clock className="w-5 h-5" />
                  Time Reports
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <DollarSign className="w-5 h-5" />
                  Run Payroll
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'employees' && (
        <div>
          <CrossBusinessEmployeeManager />
        </div>
      )}

      {activeTab === 'timetracking' && (
        <div>
          <CrossBusinessTimeTracker />
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4">
                  <div className="text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold">${metrics.totalPayroll.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Monthly Payroll</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold">{metrics.activeEmployees}</p>
                    <p className="text-sm text-gray-600">Employees Paid</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-2xl font-bold">15th</p>
                    <p className="text-sm text-gray-600">Next Payday</p>
                  </div>
                </Card>
              </div>

              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">Payroll calculator coming soon</p>
                <Button>
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Payroll
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}