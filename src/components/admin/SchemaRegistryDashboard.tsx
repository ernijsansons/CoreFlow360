/**
 * CoreFlow360 - API Schema Registry Dashboard
 * Admin interface for managing API schemas and monitoring changes
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  TrendingUp,
  GitBranch,
  Clock,
  Shield,
} from 'lucide-react'

interface APISchema {
  endpoint: string
  method: string
  version: string
  description: string
  deprecated?: boolean
  breaking?: boolean
}

interface SchemaStatistics {
  totalEndpoints: number
  totalVersions: number
  deprecatedEndpoints: number
  breakingChanges: number
  recentChanges: unknown[]
}

interface CompatibilityIssue {
  type: 'breaking' | 'warning' | 'info'
  message: string
  severity: 'critical' | 'major' | 'minor'
  field?: string
  migration?: string
}

export default function SchemaRegistryDashboard() {
  const [schemas, setSchemas] = useState<APISchema[]>([])
  const [statistics, setStatistics] = useState<SchemaStatistics | null>(null)
  const [selectedSchema, setSelectedSchema] = useState<APISchema | null>(null)
  const [compatibility, setCompatibility] = useState<CompatibilityIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSchemaData()
  }, [])

  const loadSchemaData = async () => {
    try {
      setLoading(true)

      // Load schemas list
      const schemasResponse = await fetch('/api/admin/schemas?action=list')
      const schemasData = await schemasResponse.json()

      if (schemasData.success) {
        setSchemas(schemasData.schemas)
      }

      // Load statistics
      const statsResponse = await fetch('/api/admin/schemas?action=stats')
      const statsData = await statsResponse.json()

      if (statsData.success) {
        setStatistics(statsData.statistics)
      }
    } catch (err) {
      setError('Failed to load schema data')
    } finally {
      setLoading(false)
    }
  }

  const checkCompatibility = async (
    _schema: APISchema,
    _fromVersion: string,
    _toVersion: string
  ) => {
    try {
      const response = await fetch(
        `/api/admin/schemas?action=compatibility&endpoint=${encodeURIComponent(schema.endpoint)}&method=${schema.method}&from=${fromVersion}&to=${toVersion}`
      )
      const data = await response.json()

      if (data.success) {
        setCompatibility(data.issues)
      }
    } catch (err) {}
  }

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-green-100 text-green-800'
      case 'POST':
        return 'bg-blue-100 text-blue-800'
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800'
      case 'PATCH':
        return 'bg-orange-100 text-orange-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'major':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'minor':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <p className="text-red-600">{error}</p>
        <Button onClick={loadSchemaData} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Schema Registry</h1>
          <p className="text-gray-600">Manage API schemas and track evolution</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSchemaData}>
            <GitBranch className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <Shield className="mr-2 h-4 w-4" />
            Register Schema
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalEndpoints}</div>
              <p className="text-muted-foreground text-xs">
                {statistics.totalVersions} total versions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deprecated</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {statistics.deprecatedEndpoints}
              </div>
              <p className="text-muted-foreground text-xs">Need migration planning</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Breaking Changes</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.breakingChanges}</div>
              <p className="text-muted-foreground text-xs">Require careful handling</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Changes</CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.recentChanges.length}</div>
              <p className="text-muted-foreground text-xs">In the last 30 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="schemas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schemas">Schemas</TabsTrigger>
          <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
          <TabsTrigger value="evolution">Evolution</TabsTrigger>
          <TabsTrigger value="openapi">OpenAPI</TabsTrigger>
        </TabsList>

        <TabsContent value="schemas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Schemas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schemas.map((schema, index) => (
                  <div
                    key={index}
                    className="flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                    onClick={() => setSelectedSchema(schema)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={getMethodColor(schema.method)}>{schema.method}</Badge>
                      <div>
                        <div className="font-medium">{schema.endpoint}</div>
                        <div className="text-sm text-gray-500">{schema.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">v{schema.version}</Badge>
                      {schema.deprecated && <Badge variant="destructive">Deprecated</Badge>}
                      {schema.breaking && <Badge variant="destructive">Breaking</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compatibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compatibility Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {compatibility.length > 0 ? (
                <div className="space-y-3">
                  {compatibility.map((issue, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <div className="font-medium">{issue.message}</div>
                        {issue.field && (
                          <div className="text-sm text-gray-600">Field: {issue.field}</div>
                        )}
                        {issue.migration && (
                          <div className="mt-1 text-sm text-blue-600">
                            Migration: {issue.migration}
                          </div>
                        )}
                      </div>
                      <Badge variant={issue.type === 'breaking' ? 'destructive' : 'outline'}>
                        {issue.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                  <p className="text-gray-600">No compatibility issues found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schema Evolution Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <GitBranch className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-600">Evolution timeline coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="openapi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OpenAPI Specification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600">Generate OpenAPI spec from registered schemas</p>
                <Button onClick={() => window.open('/api/admin/schemas?action=openapi', '_blank')}>
                  Download Spec
                </Button>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <pre className="overflow-x-auto text-sm">
                  {`{
  "openapi": "3.0.3",
  "info": {
    "title": "CoreFlow360 API",
    "version": "1.0.0"
  },
  "paths": {
    "/api/customers": {
      "get": { ... },
      "post": { ... }
    }
  }
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
