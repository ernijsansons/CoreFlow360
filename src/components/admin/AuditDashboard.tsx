/**
 * CoreFlow360 - Master Audit Dashboard
 * Real-time audit management and visualization interface
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  Zap, 
  Code, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Download,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

interface AuditMetrics {
  total_findings: number
  critical_issues: number
  high_issues: number
  medium_issues: number
  low_issues: number
  security_score: number
  performance_score: number
  architecture_score: number
  business_logic_score: number
}

interface AuditExecution {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  current_batch?: string
  start_time: string
  estimated_completion?: string
  scope: string[]
}

interface AuditFinding {
  id: string
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  description: string
  location: string
  business_value: number
  implementation_cost: number
  status: 'new' | 'in_progress' | 'resolved' | 'dismissed'
}

const AUDIT_CATEGORIES = [
  { key: 'security', label: 'Security', icon: Shield, color: 'bg-red-500' },
  { key: 'performance', label: 'Performance', icon: Zap, color: 'bg-yellow-500' },
  { key: 'architecture', label: 'Architecture', icon: Code, color: 'bg-blue-500' },
  { key: 'business', label: 'Business Logic', icon: Users, color: 'bg-green-500' }
]

export default function AuditDashboard() {
  const [metrics, setMetrics] = useState<AuditMetrics | null>(null)
  const [execution, setExecution] = useState<AuditExecution | null>(null)
  const [findings, setFindings] = useState<AuditFinding[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadAuditData()
    const interval = setInterval(loadAuditData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const loadAuditData = async () => {
    try {
      // Simulate API calls - replace with actual API endpoints
      const mockMetrics: AuditMetrics = {
        total_findings: 47,
        critical_issues: 3,
        high_issues: 12,
        medium_issues: 18,
        low_issues: 14,
        security_score: 75,
        performance_score: 85,
        architecture_score: 90,
        business_logic_score: 80
      }

      const mockExecution: AuditExecution = {
        id: 'audit_12345',
        status: 'running',
        progress: 65,
        current_batch: 'Security & Authentication',
        start_time: new Date().toISOString(),
        estimated_completion: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        scope: ['security', 'performance', 'architecture']
      }

      const mockFindings: AuditFinding[] = [
        {
          id: 'finding_001',
          title: 'Hardcoded Secrets in Configuration',
          severity: 'critical',
          category: 'security',
          description: 'API keys and database passwords found in configuration files',
          location: 'src/config/database.ts:15',
          business_value: 95,
          implementation_cost: 4,
          status: 'new'
        },
        {
          id: 'finding_002', 
          title: 'N+1 Query Pattern in User Dashboard',
          severity: 'high',
          category: 'performance',
          description: 'Database queries executed inside loops causing performance degradation',
          location: 'src/app/dashboard/page.tsx:45',
          business_value: 70,
          implementation_cost: 12,
          status: 'in_progress'
        },
        {
          id: 'finding_003',
          title: 'Missing Input Validation on API Routes',
          severity: 'high',
          category: 'security', 
          description: 'User input not validated on critical API endpoints',
          location: 'src/app/api/users/route.ts',
          business_value: 85,
          implementation_cost: 16,
          status: 'new'
        }
      ]

      setMetrics(mockMetrics)
      setExecution(mockExecution)
      setFindings(mockFindings)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load audit data:', error)
      setLoading(false)
    }
  }

  const startNewAudit = async (scope: string[]) => {
    // Implement audit start logic
    console.log('Starting new audit with scope:', scope)
  }

  const pauseAudit = async () => {
    // Implement audit pause logic
    console.log('Pausing current audit')
  }

  const downloadReport = (format: 'json' | 'html' | 'pdf') => {
    // Implement report download logic
    console.log('Downloading report in format:', format)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Audit Dashboard</h1>
          <p className="text-gray-600">Comprehensive SaaS architecture and security analysis</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => startNewAudit(['all'])} className="bg-blue-600 hover:bg-blue-700">
            <Play className="w-4 h-4 mr-2" />
            Start New Audit
          </Button>
          <Button variant="outline" onClick={() => downloadReport('html')}>
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Current Execution Status */}
      {execution && execution.status === 'running' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Audit in Progress
              </div>
              <Button variant="outline" size="sm" onClick={pauseAudit}>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </Button>
            </CardTitle>
            <CardDescription>
              Current batch: {execution.current_batch} | Started: {new Date(execution.start_time).toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{execution.progress}%</span>
              </div>
              <Progress value={execution.progress} className="w-full" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Scope: {execution.scope.join(', ')}</span>
                {execution.estimated_completion && (
                  <span>ETA: {new Date(execution.estimated_completion).toLocaleTimeString()}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Findings</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.total_findings}</div>
                <div className="flex space-x-2 text-xs text-gray-500 mt-1">
                  <span className="text-red-600">{metrics?.critical_issues} Critical</span>
                  <span className="text-orange-600">{metrics?.high_issues} High</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                <Shield className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.security_score}%</div>
                <Progress value={metrics?.security_score} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                <Zap className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.performance_score}%</div>
                <Progress value={metrics?.performance_score} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Architecture Score</CardTitle>
                <Code className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.architecture_score}%</div>
                <Progress value={metrics?.architecture_score} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Recent Findings Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Findings</CardTitle>
              <CardDescription>Critical and high-priority issues requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {findings
                  .filter(f => f.severity === 'critical' || f.severity === 'high')
                  .slice(0, 5)
                  .map((finding) => (
                    <div key={finding.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant={finding.severity === 'critical' ? 'destructive' : 'default'}>
                            {finding.severity}
                          </Badge>
                          <Badge variant="outline">{finding.category}</Badge>
                          <span className="font-medium">{finding.title}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{finding.description}</p>
                        <p className="text-xs text-gray-500 mt-1">📍 {finding.location}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">ROI: {Math.round(finding.business_value / finding.implementation_cost)}x</div>
                        <div className="text-xs text-gray-500">{finding.implementation_cost}h cost</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="findings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Findings</CardTitle>
              <CardDescription>Complete list of audit findings across all categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {findings.map((finding) => (
                  <div key={finding.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge 
                            variant={
                              finding.severity === 'critical' ? 'destructive' :
                              finding.severity === 'high' ? 'default' : 'secondary'
                            }
                          >
                            {finding.severity}
                          </Badge>
                          <Badge variant="outline">{finding.category}</Badge>
                          <Badge variant={finding.status === 'resolved' ? 'default' : 'secondary'}>
                            {finding.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h3 className="font-medium mb-1">{finding.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{finding.description}</p>
                        <p className="text-xs text-gray-500">📍 {finding.location}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm font-medium mb-1">
                          Value: {finding.business_value}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          Cost: {finding.implementation_cost}h
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          ROI: {Math.round(finding.business_value / finding.implementation_cost)}x
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {AUDIT_CATEGORIES.map((category) => {
              const categoryFindings = findings.filter(f => f.category === category.key)
              const Icon = category.icon
              
              return (
                <Card key={category.key}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center mr-3`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      {category.label}
                    </CardTitle>
                    <CardDescription>
                      {categoryFindings.length} findings in this category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Critical: {categoryFindings.filter(f => f.severity === 'critical').length}</span>
                        <span>High: {categoryFindings.filter(f => f.severity === 'high').length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Medium: {categoryFindings.filter(f => f.severity === 'medium').length}</span>
                        <span>Low: {categoryFindings.filter(f => f.severity === 'low').length}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={() => startNewAudit([category.key])}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Re-audit {category.label}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Audit Trends & Progress
              </CardTitle>
              <CardDescription>Historical view of audit results and improvements over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Score Trends */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Security Score Trend</h4>
                    <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">Chart placeholder - Security trend</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Performance Score Trend</h4>
                    <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">Chart placeholder - Performance trend</span>
                    </div>
                  </div>
                </div>

                {/* Issue Resolution Rate */}
                <div>
                  <h4 className="font-medium mb-3">Issue Resolution Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Resolved Issues</span>
                      <span>12 / 47 (26%)</span>
                    </div>
                    <Progress value={26} />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Target: 80% by end of month</span>
                      <span>On track</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className="font-medium mb-3">Recent Audit Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>Security audit completed</span>
                      <span className="text-gray-500">2 hours ago</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>3 critical issues resolved</span>
                      <span className="text-gray-500">1 day ago</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>Performance audit started</span>
                      <span className="text-gray-500">2 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}