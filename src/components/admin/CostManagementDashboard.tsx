'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Target,
  Settings,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react'
import { CostAuditResult } from '@/lib/audit/cost-management-auditor'

interface CostManagementDashboardProps {
  tenantId: string
}

export default function CostManagementDashboard({ tenantId }: CostManagementDashboardProps) {
  const [auditResults, setAuditResults] = useState<CostAuditResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAudit, setSelectedAudit] = useState<string>('overview')

  useEffect(() => {
    fetchCostAudits()
  }, [tenantId])

  const fetchCostAudits = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/cost-audits?tenantId=${tenantId}`)
      const data = await response.json()
      setAuditResults(data.audits || [])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const runCostAudit = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/cost-audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      })
      const data = await response.json()
      setAuditResults(data.audits || [])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const totalPotentialSavings = auditResults.reduce((sum, audit) => sum + audit.potentialSavings, 0)
  const totalCriticalIssues = auditResults.reduce(
    (sum, audit) => sum + audit.criticalIssues.length,
    0
  )

  const getAuditIcon = (auditType: string) => {
    switch (auditType) {
      case 'UTILITY_OPTIMIZER':
        return <Activity className="h-4 w-4" />
      case 'LOCK_IN_ASSESSOR':
        return <AlertTriangle className="h-4 w-4" />
      case 'PRICING_MODELER':
        return <DollarSign className="h-4 w-4" />
      case 'FINOPS_PROCESSOR':
        return <BarChart3 className="h-4 w-4" />
      case 'TRANSFER_MINIMIZER':
        return <TrendingDown className="h-4 w-4" />
      case 'TCO_AGGREGATOR':
        return <PieChart className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const getSeverityColor = (criticalCount: number) => {
    if (criticalCount >= 5) return 'bg-red-500'
    if (criticalCount >= 3) return 'bg-yellow-500'
    if (criticalCount >= 1) return 'bg-orange-500'
    return 'bg-green-500'
  }

  if (loading && auditResults.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Cost Management Audits</h1>
          <button
            onClick={runCostAudit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Run Cost Audit
          </button>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-8 w-1/2 rounded bg-gray-200"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cost Management Audits</h1>
        <button
          onClick={runCostAudit}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Run Cost Audit'}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalPotentialSavings.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{totalCriticalIssues}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Audits Completed</p>
                <p className="text-2xl font-bold">{auditResults.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Audit</p>
                <p className="text-sm text-gray-500">
                  {auditResults.length > 0
                    ? new Date(auditResults[0].timestamp).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
              <Activity className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Results */}
      <Tabs value={selectedAudit} onValueChange={setSelectedAudit}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="utility">Utility</TabsTrigger>
          <TabsTrigger value="lockin">Lock-in</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="finops">FinOps</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
          <TabsTrigger value="tco">TCO</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6">
            {auditResults.map((audit, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAuditIcon(audit.auditType)}
                      <span>{audit.auditType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        ${audit.potentialSavings.toLocaleString()} savings
                      </Badge>
                      <Badge
                        className={`text-white ${getSeverityColor(audit.criticalIssues.length)}`}
                      >
                        {audit.criticalIssues.length} critical
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 font-semibold">Recommendations</h4>
                      <ul className="space-y-1">
                        {audit.recommendations.slice(0, 3).map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="mt-1 text-blue-500">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {audit.criticalIssues.length > 0 && (
                      <div>
                        <h4 className="mb-2 font-semibold text-red-600">Critical Issues</h4>
                        <ul className="space-y-1">
                          {audit.criticalIssues.map((issue, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-red-600">
                              <AlertTriangle className="mt-1 h-3 w-3" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Individual Audit Tabs */}
        {auditResults.map((audit) => {
          const tabValue = audit.auditType.toLowerCase().split('_')[0]
          return (
            <TabsContent key={audit.auditType} value={tabValue}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getAuditIcon(audit.auditType)}
                    {audit.auditType.replace('_', ' ')} Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-green-50 p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        ${audit.potentialSavings.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Potential Savings</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {audit.recommendations.length}
                      </p>
                      <p className="text-sm text-gray-600">Recommendations</p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-4 text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {audit.criticalIssues.length}
                      </p>
                      <p className="text-sm text-gray-600">Critical Issues</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div>
                      <h4 className="mb-4 font-semibold">Detailed Findings</h4>
                      <div className="rounded-lg bg-gray-50 p-4">
                        <pre className="overflow-auto text-sm">
                          {JSON.stringify(audit.findings, null, 2)}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-4 font-semibold">All Recommendations</h4>
                      <ul className="space-y-2">
                        {audit.recommendations.map((rec, idx) => (
                          <li key={idx} className="rounded-lg bg-blue-50 p-3 text-sm">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {audit.criticalIssues.length > 0 && (
                    <div>
                      <h4 className="mb-4 font-semibold text-red-600">
                        Critical Issues Requiring Immediate Attention
                      </h4>
                      <div className="space-y-2">
                        {audit.criticalIssues.map((issue, idx) => (
                          <div
                            key={idx}
                            className="rounded border-l-4 border-red-500 bg-red-50 p-4"
                          >
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500" />
                              <span className="text-sm text-red-700">{issue}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
