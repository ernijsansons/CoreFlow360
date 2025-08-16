'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

interface ConsentPreference {
  id: string;
  category: 'strictly_necessary' | 'performance' | 'functional' | 'targeting' | 'marketing';
  name: string;
  description: string;
  purpose: string;
  required: boolean;
  enabled: boolean;
  lastUpdated: Date;
  expires?: Date;
}

interface DataCategory {
  category: string;
  description: string;
  dataTypes: string[];
  purpose: string[];
  retention: string;
  thirdParties: string[];
  canExport: boolean;
  canDelete: boolean;
}

interface PrivacyRequest {
  id: string;
  type: 'access' | 'export' | 'delete' | 'correction' | 'restrict';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestDate: Date;
  completedDate?: Date;
  description: string;
  downloadUrl?: string;
}

interface PrivacyDashboardData {
  consentPreferences: ConsentPreference[];
  dataCategories: DataCategory[];
  recentRequests: PrivacyRequest[];
  privacyScore: number;
  dataRetentionSummary: {
    totalCategories: number;
    dataVolume: string;
    oldestData: Date;
    nextDeletion: Date;
  };
}

export default function PrivacyPortal() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<PrivacyDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestInProgress, setRequestInProgress] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadPrivacyDashboard();
  }, []);

  const loadPrivacyDashboard = async () => {
    setIsLoading(true);
    try {
      // Mock data - in real implementation, fetch from API
      const mockData: PrivacyDashboardData = {
        consentPreferences: [
          {
            id: 'strictly_necessary',
            category: 'strictly_necessary',
            name: 'Strictly Necessary Cookies',
            description: 'Essential for the website to function properly',
            purpose: 'Authentication, security, and core functionality',
            required: true,
            enabled: true,
            lastUpdated: new Date('2024-01-01')
          },
          {
            id: 'performance',
            category: 'performance',
            name: 'Performance Analytics',
            description: 'Help us understand how you use our website',
            purpose: 'Website optimization and performance monitoring',
            required: false,
            enabled: true,
            lastUpdated: new Date('2024-06-01'),
            expires: new Date('2025-06-01')
          },
          {
            id: 'functional',
            category: 'functional',
            name: 'Functional Preferences',
            description: 'Remember your preferences and settings',
            purpose: 'User experience personalization',
            required: false,
            enabled: false,
            lastUpdated: new Date('2024-03-15')
          },
          {
            id: 'marketing',
            category: 'marketing',
            name: 'Marketing Communications',
            description: 'Send you relevant marketing content',
            purpose: 'Email marketing and promotional content',
            required: false,
            enabled: true,
            lastUpdated: new Date('2024-07-01'),
            expires: new Date('2025-07-01')
          },
          {
            id: 'targeting',
            category: 'targeting',
            name: 'Targeted Advertising',
            description: 'Show you personalized advertisements',
            purpose: 'Advertising personalization and tracking',
            required: false,
            enabled: false,
            lastUpdated: new Date('2024-02-01')
          }
        ],
        dataCategories: [
          {
            category: 'Account Information',
            description: 'Basic account details and profile information',
            dataTypes: ['Name', 'Email', 'Profile Picture', 'Account Settings'],
            purpose: ['Account Management', 'Authentication'],
            retention: '7 years after account closure',
            thirdParties: ['Authentication Provider'],
            canExport: true,
            canDelete: true
          },
          {
            category: 'Usage Analytics',
            description: 'How you interact with our platform',
            dataTypes: ['Page Views', 'Click Events', 'Session Duration', 'Feature Usage'],
            purpose: ['Product Improvement', 'Analytics'],
            retention: '2 years',
            thirdParties: ['Google Analytics', 'Mixpanel'],
            canExport: true,
            canDelete: true
          },
          {
            category: 'Communication Data',
            description: 'Messages and communication history',
            dataTypes: ['Chat Messages', 'Support Tickets', 'Email Communications'],
            purpose: ['Customer Support', 'Service Delivery'],
            retention: '3 years',
            thirdParties: ['Support Platform'],
            canExport: true,
            canDelete: false
          },
          {
            category: 'Voice Data',
            description: 'Voice recordings and transcripts',
            dataTypes: ['Voice Recordings', 'Transcripts', 'Voice Commands'],
            purpose: ['Voice Feature Operation', 'Quality Improvement'],
            retention: '30 days',
            thirdParties: ['Twilio', 'Speech Processing Service'],
            canExport: true,
            canDelete: true
          }
        ],
        recentRequests: [
          {
            id: 'req_001',
            type: 'export',
            status: 'completed',
            requestDate: new Date('2024-08-10'),
            completedDate: new Date('2024-08-12'),
            description: 'Data export request for all personal information',
            downloadUrl: '/api/privacy/downloads/user_data_20240812.zip'
          },
          {
            id: 'req_002',
            type: 'delete',
            status: 'processing',
            requestDate: new Date('2024-08-14'),
            description: 'Delete voice recording data older than 30 days'
          }
        ],
        privacyScore: 85,
        dataRetentionSummary: {
          totalCategories: 4,
          dataVolume: '2.3 MB',
          oldestData: new Date('2023-01-15'),
          nextDeletion: new Date('2024-09-01')
        }
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Failed to load privacy dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConsentPreference = async (preferenceId: string, enabled: boolean) => {
    if (!dashboardData) return;

    try {
      // Update local state immediately for better UX
      const updatedPreferences = dashboardData.consentPreferences.map(pref =>
        pref.id === preferenceId 
          ? { ...pref, enabled, lastUpdated: new Date() }
          : pref
      );

      setDashboardData({
        ...dashboardData,
        consentPreferences: updatedPreferences
      });

      // API call to update consent
      await fetch('/api/privacy/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferenceId, enabled })
      });

    } catch (error) {
      console.error('Failed to update consent preference:', error);
      // Revert on error
      loadPrivacyDashboard();
    }
  };

  const requestDataAccess = async (type: 'access' | 'export' | 'delete' | 'correction') => {
    setRequestInProgress(type);
    try {
      const response = await fetch('/api/privacy/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        await loadPrivacyDashboard(); // Refresh to show new request
      }
    } catch (error) {
      console.error(`Failed to submit ${type} request:`, error);
    } finally {
      setRequestInProgress(null);
    }
  };

  const downloadData = (downloadUrl: string) => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getConsentStatusColor = (enabled: boolean, required: boolean) => {
    if (required) return 'bg-gray-500';
    return enabled ? 'bg-green-500' : 'bg-red-500';
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading privacy dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Privacy Control Center</h1>
        <p className="text-muted-foreground">
          Manage your privacy preferences and data rights
        </p>
      </div>

      {/* Privacy Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Your Privacy Score
            <Badge variant="outline" className="text-lg px-3 py-1">
              {dashboardData.privacyScore}%
            </Badge>
          </CardTitle>
          <CardDescription>
            Based on your current privacy settings and data handling preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={dashboardData.privacyScore} className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{dashboardData.dataRetentionSummary.totalCategories}</div>
              <div className="text-sm text-muted-foreground">Data Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{dashboardData.dataRetentionSummary.dataVolume}</div>
              <div className="text-sm text-muted-foreground">Total Data</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{dashboardData.consentPreferences.filter(p => p.enabled).length}</div>
              <div className="text-sm text-muted-foreground">Active Consents</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{dashboardData.recentRequests.length}</div>
              <div className="text-sm text-muted-foreground">Privacy Requests</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="consent">Consent</TabsTrigger>
          <TabsTrigger value="data">My Data</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.recentRequests.slice(0, 3).map(request => (
                  <div key={request.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium capitalize">{request.type} Request</div>
                      <div className="text-sm text-muted-foreground">
                        {request.requestDate.toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className={getRequestStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Alert>
                  <AlertDescription>
                    Consider disabling targeted advertising for enhanced privacy
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertDescription>
                    Review your data retention settings - some data can be safely deleted
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertDescription>
                    Your voice data will be automatically deleted in 15 days
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="consent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consent Management</CardTitle>
              <CardDescription>
                Control how your data is used across different purposes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.consentPreferences.map(preference => (
                <div key={preference.id} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{preference.name}</h4>
                      {preference.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                      {preference.expires && (
                        <Badge variant="outline" className="text-xs">
                          Expires {preference.expires.toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{preference.description}</p>
                    <p className="text-xs text-muted-foreground">Purpose: {preference.purpose}</p>
                    <p className="text-xs text-muted-foreground">
                      Last updated: {preference.lastUpdated.toLocaleDateString()}
                    </p>
                  </div>
                  <Switch
                    checked={preference.enabled}
                    disabled={preference.required}
                    onCheckedChange={(enabled) => updateConsentPreference(preference.id, enabled)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Data Categories</CardTitle>
              <CardDescription>
                Overview of the personal data we collect and how we use it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.dataCategories.map((category, index) => (
                <div key={index} className="p-4 border rounded">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{category.category}</h4>
                    <div className="flex gap-2">
                      {category.canExport && (
                        <Badge variant="outline" className="text-xs bg-blue-50">Exportable</Badge>
                      )}
                      {category.canDelete && (
                        <Badge variant="outline" className="text-xs bg-red-50">Deletable</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <strong>Data Types:</strong>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {category.dataTypes.map((type, idx) => (
                          <li key={idx}>{type}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Purpose:</strong>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {category.purpose.map((purpose, idx) => (
                          <li key={idx}>{purpose}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm">
                    <strong>Retention:</strong> <span className="text-muted-foreground">{category.retention}</span>
                  </div>
                  
                  {category.thirdParties.length > 0 && (
                    <div className="mt-2 text-sm">
                      <strong>Third Parties:</strong>{' '}
                      <span className="text-muted-foreground">{category.thirdParties.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Subject Requests</CardTitle>
              <CardDescription>
                Exercise your privacy rights under GDPR, CCPA, and other privacy laws
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Request Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  disabled={requestInProgress === 'access'}
                  onClick={() => requestDataAccess('access')}
                  className="h-20 flex-col"
                >
                  {requestInProgress === 'access' ? 'Processing...' : 'Access My Data'}
                  <span className="text-xs text-muted-foreground mt-1">
                    View what data we have about you
                  </span>
                </Button>

                <Button
                  variant="outline"
                  disabled={requestInProgress === 'export'}
                  onClick={() => requestDataAccess('export')}
                  className="h-20 flex-col"
                >
                  {requestInProgress === 'export' ? 'Processing...' : 'Export My Data'}
                  <span className="text-xs text-muted-foreground mt-1">
                    Download all your data
                  </span>
                </Button>

                <Button
                  variant="outline"
                  disabled={requestInProgress === 'correction'}
                  onClick={() => requestDataAccess('correction')}
                  className="h-20 flex-col"
                >
                  {requestInProgress === 'correction' ? 'Processing...' : 'Correct My Data'}
                  <span className="text-xs text-muted-foreground mt-1">
                    Request data corrections
                  </span>
                </Button>

                <Button
                  variant="outline"
                  disabled={requestInProgress === 'delete'}
                  onClick={() => requestDataAccess('delete')}
                  className="h-20 flex-col border-red-200 text-red-600 hover:bg-red-50"
                >
                  {requestInProgress === 'delete' ? 'Processing...' : 'Delete My Data'}
                  <span className="text-xs text-muted-foreground mt-1">
                    Permanently delete your data
                  </span>
                </Button>
              </div>

              {/* Request History */}
              <div>
                <h4 className="font-medium mb-3">Request History</h4>
                <div className="space-y-3">
                  {dashboardData.recentRequests.map(request => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium capitalize">{request.type} Request</div>
                        <div className="text-sm text-muted-foreground">{request.description}</div>
                        <div className="text-xs text-muted-foreground">
                          Requested: {request.requestDate.toLocaleDateString()}
                          {request.completedDate && (
                            <span> | Completed: {request.completedDate.toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRequestStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                        {request.downloadUrl && request.status === 'completed' && (
                          <Button 
                            size="sm" 
                            onClick={() => downloadData(request.downloadUrl!)}
                          >
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}