'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Play,
  Pause,
  Square,
  Building,
  DollarSign,
  Calendar,
  BarChart3,
  Timer,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react'

interface BusinessAllocation {
  id: string
  businessId: string
  businessName: string
  role: string
  hourlyRate: number
  hoursAllocated: number
  hoursWorked: number
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
}

interface TimeEntry {
  id: string
  date: string
  startTime: string
  endTime?: string
  duration: number // minutes
  businessId: string
  businessName: string
  description: string
  rate: number
  isRunning: boolean
  projectId?: string
  taskId?: string
}

interface WeeklyStats {
  businessId: string
  businessName: string
  totalHours: number
  totalRevenue: number
  utilizationRate: number
  targetHours: number
}

export function CrossBusinessTimeTracker() {
  const [currentEmployee] = useState({
    id: '1',
    name: 'Sarah Mitchell',
    primaryBusiness: 'Phoenix HVAC Services'
  })

  const [allocations, setAllocations] = useState<BusinessAllocation[]>([
    {
      id: '1',
      businessId: 'phoenix-hvac',
      businessName: 'Phoenix HVAC Services',
      role: 'Senior Technician',
      hourlyRate: 65,
      hoursAllocated: 32,
      hoursWorked: 28.5,
      status: 'ACTIVE'
    },
    {
      id: '2',
      businessId: 'desert-air',
      businessName: 'Desert Air Solutions',
      role: 'Technical Consultant',
      hourlyRate: 85,
      hoursAllocated: 8,
      hoursWorked: 7.2,
      status: 'ACTIVE'
    }
  ])

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      id: '1',
      date: '2024-08-21',
      startTime: '09:00',
      endTime: '12:30',
      duration: 210,
      businessId: 'phoenix-hvac',
      businessName: 'Phoenix HVAC Services',
      description: 'Commercial HVAC maintenance - Office building downtown',
      rate: 65,
      isRunning: false
    },
    {
      id: '2',
      date: '2024-08-21',
      startTime: '14:00',
      endTime: '16:00',
      duration: 120,
      businessId: 'desert-air',
      businessName: 'Desert Air Solutions',
      description: 'Remote consultation - Residential system troubleshooting',
      rate: 85,
      isRunning: false
    },
    {
      id: '3',
      date: '2024-08-21',
      startTime: '16:30',
      duration: 45,
      businessId: 'phoenix-hvac',
      businessName: 'Phoenix HVAC Services',
      description: 'Emergency service call - Restaurant cooling system',
      rate: 65,
      isRunning: true
    }
  ])

  const [activeTimer, setActiveTimer] = useState<string | null>('3')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedWeek, setSelectedWeek] = useState('current')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const startTimer = (businessId: string, description: string = '') => {
    const allocation = allocations.find(a => a.businessId === businessId)
    if (!allocation) return

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toTimeString().slice(0, 5),
      duration: 0,
      businessId,
      businessName: allocation.businessName,
      description,
      rate: allocation.hourlyRate,
      isRunning: true
    }

    setTimeEntries([...timeEntries, newEntry])
    setActiveTimer(newEntry.id)
  }

  const stopTimer = (entryId: string) => {
    setTimeEntries(entries => 
      entries.map(entry => 
        entry.id === entryId 
          ? { 
              ...entry, 
              endTime: new Date().toTimeString().slice(0, 5),
              isRunning: false 
            }
          : entry
      )
    )
    setActiveTimer(null)
  }

  const getRunningDuration = (entry: TimeEntry) => {
    if (!entry.isRunning) return entry.duration
    
    const start = new Date()
    const [hours, minutes] = entry.startTime.split(':').map(Number)
    start.setHours(hours, minutes, 0, 0)
    
    const diff = currentTime.getTime() - start.getTime()
    return Math.max(0, Math.floor(diff / 1000 / 60))
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getWeeklyStats = (): WeeklyStats[] => {
    return allocations.map(allocation => {
      const businessEntries = timeEntries.filter(entry => 
        entry.businessId === allocation.businessId &&
        !entry.isRunning
      )
      
      const totalMinutes = businessEntries.reduce((sum, entry) => sum + entry.duration, 0)
      const totalHours = totalMinutes / 60
      const totalRevenue = totalHours * allocation.hourlyRate
      const utilizationRate = (totalHours / allocation.hoursAllocated) * 100

      return {
        businessId: allocation.businessId,
        businessName: allocation.businessName,
        totalHours,
        totalRevenue,
        utilizationRate,
        targetHours: allocation.hoursAllocated
      }
    })
  }

  const weeklyStats = getWeeklyStats()
  const totalWeeklyRevenue = weeklyStats.reduce((sum, stat) => sum + stat.totalRevenue, 0)
  const totalWeeklyHours = weeklyStats.reduce((sum, stat) => sum + stat.totalHours, 0)
  const overallUtilization = weeklyStats.length > 0 
    ? weeklyStats.reduce((sum, stat) => sum + stat.utilizationRate, 0) / weeklyStats.length
    : 0

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Cross-Business Time Tracking</h1>
          <p className="text-gray-600">Track time across your business allocations - {currentEmployee.name}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-sm">
            Week of Aug 19-25, 2024
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </motion.div>

      {/* Weekly Summary Cards */}
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
                <p className="text-sm text-green-700 font-medium">Weekly Revenue</p>
                <p className="text-2xl font-bold text-green-900">${totalWeeklyRevenue.toFixed(0)}</p>
                <p className="text-xs text-green-600 mt-1">{totalWeeklyHours.toFixed(1)} hours logged</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Utilization Rate</p>
                <p className="text-2xl font-bold text-blue-900">{overallUtilization.toFixed(0)}%</p>
                <p className="text-xs text-blue-600 mt-1">Across all businesses</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Active Businesses</p>
                <p className="text-2xl font-bold text-purple-900">{allocations.length}</p>
                <p className="text-xs text-purple-600 mt-1">Current allocations</p>
              </div>
              <Building className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Avg Hourly Rate</p>
                <p className="text-2xl font-bold text-orange-900">
                  ${((totalWeeklyRevenue / totalWeeklyHours) || 0).toFixed(0)}
                </p>
                <p className="text-xs text-orange-600 mt-1">Weighted average</p>
              </div>
              <Timer className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Timer */}
      {activeTimer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card className="border-blue-500 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Timer Running</h3>
                    <p className="text-blue-700">
                      {timeEntries.find(e => e.id === activeTimer)?.businessName}
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-900">
                    {formatDuration(getRunningDuration(timeEntries.find(e => e.id === activeTimer)!))}
                  </div>
                  <div className="text-sm text-blue-600">
                    Since {timeEntries.find(e => e.id === activeTimer)?.startTime}
                  </div>
                </div>

                <Button 
                  onClick={() => stopTimer(activeTimer)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Timer
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Business Allocations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Business Allocations</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {allocations.map((allocation, index) => {
            const stats = weeklyStats.find(s => s.businessId === allocation.businessId)!
            const isOnTarget = stats.utilizationRate >= 90 && stats.utilizationRate <= 110
            
            return (
              <motion.div
                key={allocation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{allocation.businessName}</CardTitle>
                      <Badge 
                        variant={isOnTarget ? 'default' : stats.utilizationRate > 110 ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {stats.utilizationRate.toFixed(0)}% utilization
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Role:</span>
                          <div className="font-medium">{allocation.role}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Hourly Rate:</span>
                          <div className="font-medium">${allocation.hourlyRate}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Allocated Hours:</span>
                          <div className="font-medium">{allocation.hoursAllocated}h/week</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Worked This Week:</span>
                          <div className="font-medium">{stats.totalHours.toFixed(1)}h</div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Weekly Progress</span>
                          <span className="text-sm font-medium">
                            ${stats.totalRevenue.toFixed(0)} earned
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              stats.utilizationRate > 110 ? 'bg-red-500' :
                              stats.utilizationRate >= 90 ? 'bg-green-500' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(100, stats.utilizationRate)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          {isOnTarget ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="text-xs text-gray-600">
                            {isOnTarget ? 'On target' : 
                             stats.utilizationRate > 110 ? 'Over allocated' : 'Under utilized'}
                          </span>
                        </div>
                        
                        <Button 
                          size="sm" 
                          onClick={() => startTimer(allocation.businessId)}
                          disabled={!!activeTimer}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start Timer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Recent Time Entries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Time Entries</span>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeEntries.slice().reverse().slice(0, 5).map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      entry.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <div className="font-medium">{entry.businessName}</div>
                      <div className="text-sm text-gray-600">{entry.description}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">
                      {entry.isRunning ? 
                        formatDuration(getRunningDuration(entry)) :
                        formatDuration(entry.duration)
                      }
                    </div>
                    <div className="text-sm text-gray-600">
                      {entry.startTime} - {entry.endTime || 'Running'}
                    </div>
                    <div className="text-xs text-green-600">
                      ${((entry.isRunning ? getRunningDuration(entry) : entry.duration) / 60 * entry.rate).toFixed(2)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}