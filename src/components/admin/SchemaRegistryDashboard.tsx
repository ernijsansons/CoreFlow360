/**
 * CoreFlow360 - API Schema Registry Dashboard
 * Admin interface for managing API schemas and monitoring changes
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, XCircle, Info, TrendingUp, GitBranch, Clock, Shield } from 'lucide-react';

interface APISchema {
  endpoint: string;
  method: string;
  version: string;
  description: string;
  deprecated?: boolean;
  breaking?: boolean;
}

interface SchemaStatistics {
  totalEndpoints: number;
  totalVersions: number;
  deprecatedEndpoints: number;
  breakingChanges: number;
  recentChanges: any[];
}

interface CompatibilityIssue {
  type: 'breaking' | 'warning' | 'info';
  message: string;
  severity: 'critical' | 'major' | 'minor';
  field?: string;
  migration?: string;
}

export default function SchemaRegistryDashboard() {
  const [schemas, setSchemas] = useState<APISchema[]>([]);
  const [statistics, setStatistics] = useState<SchemaStatistics | null>(null);
  const [selectedSchema, setSelectedSchema] = useState<APISchema | null>(null);
  const [compatibility, setCompatibility] = useState<CompatibilityIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchemaData();
  }, []);

  const loadSchemaData = async () => {
    try {
      setLoading(true);
      
      // Load schemas list
      const schemasResponse = await fetch('/api/admin/schemas?action=list');
      const schemasData = await schemasResponse.json();
      
      if (schemasData.success) {
        setSchemas(schemasData.schemas);
      }

      // Load statistics
      const statsResponse = await fetch('/api/admin/schemas?action=stats');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStatistics(statsData.statistics);
      }

    } catch (err) {
      setError('Failed to load schema data');
      console.error('Schema data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkCompatibility = async (schema: APISchema, fromVersion: string, toVersion: string) => {
    try {
      const response = await fetch(
        `/api/admin/schemas?action=compatibility&endpoint=${encodeURIComponent(schema.endpoint)}&method=${schema.method}&from=${fromVersion}&to=${toVersion}`
      );
      const data = await response.json();
      
      if (data.success) {
        setCompatibility(data.issues);
      }
    } catch (err) {
      console.error('Compatibility check error:', err);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'PATCH': return 'bg-orange-100 text-orange-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'major': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'minor': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <Button onClick={loadSchemaData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Schema Registry</h1>
          <p className="text-gray-600">Manage API schemas and track evolution</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSchemaData}>
            <GitBranch className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Register Schema
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalEndpoints}</div>
              <p className="text-xs text-muted-foreground">
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
              <div className="text-2xl font-bold text-yellow-600">{statistics.deprecatedEndpoints}</div>
              <p className="text-xs text-muted-foreground">
                Need migration planning
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Breaking Changes</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.breakingChanges}</div>
              <p className="text-xs text-muted-foreground">
                Require careful handling
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Changes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.recentChanges.length}</div>
              <p className="text-xs text-muted-foreground">
                In the last 30 days
              </p>
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
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedSchema(schema)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={getMethodColor(schema.method)}>
                        {schema.method}
                      </Badge>
                      <div>
                        <div className="font-medium">{schema.endpoint}</div>
                        <div className="text-sm text-gray-500">{schema.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">v{schema.version}</Badge>
                      {schema.deprecated && (
                        <Badge variant="destructive">Deprecated</Badge>
                      )}
                      {schema.breaking && (
                        <Badge variant="destructive">Breaking</Badge>
                      )}
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
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <div className="font-medium">{issue.message}</div>
                        {issue.field && (
                          <div className="text-sm text-gray-600">Field: {issue.field}</div>
                        )}
                        {issue.migration && (
                          <div className="text-sm text-blue-600 mt-1">
                            Migration: {issue.migration}
                          </div>
                        )}
                      </div>
                      <Badge 
                        variant={issue.type === 'breaking' ? 'destructive' : 'outline'}
                      >
                        {issue.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
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
              <div className="text-center py-8">
                <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">Generate OpenAPI spec from registered schemas</p>
                <Button onClick={() => window.open('/api/admin/schemas?action=openapi', '_blank')}>
                  Download Spec
                </Button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
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
  );
}