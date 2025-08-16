'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Shield,
  Zap,
  Clock,
  Target,
  Settings
} from 'lucide-react';

interface PrivacyTestResult {
  testId: string;
  passed: boolean;
  duration: number;
  errors: string[];
  warnings: string[];
  compliance: {
    gdpr: number;
    ccpa: number;
    lgpd: number;
    pipeda: number;
  };
  riskScore: number;
  recommendations: string[];
  executedAt: Date;
}

interface PrivacyTestReport {
  suiteId: string;
  executionId: string;
  startTime: Date;
  endTime: Date;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  overallCompliance: number;
  overallRiskScore: number;
  results: PrivacyTestResult[];
  summary: {
    criticalIssues: number;
    highPriorityIssues: number;
    complianceGaps: string[];
    recommendedActions: string[];
  };
  trends: {
    complianceScore: Array<{ date: Date; score: number }>;
    riskScore: Array<{ date: Date; score: number }>;
  };
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  schedule: {
    frequency: 'manual' | 'daily' | 'weekly' | 'monthly';
    nextRun?: Date;
  };
  thresholds: {
    minComplianceScore: number;
    maxRiskScore: number;
    maxFailures: number;
  };
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun?: Date;
  lastReport?: PrivacyTestReport;
}

export function PrivacyTestingDashboard() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [activeReport, setActiveReport] = useState<PrivacyTestReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string>('gdpr_compliance');

  useEffect(() => {
    loadTestSuites();
  }, []);

  const loadTestSuites = async () => {
    // Mock data - in production, fetch from API
    const mockSuites: TestSuite[] = [
      {
        id: 'gdpr_compliance',
        name: 'GDPR Compliance Suite',
        description: 'Comprehensive GDPR compliance testing including consent, data rights, and breach procedures',
        schedule: { frequency: 'weekly', nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
        thresholds: { minComplianceScore: 85, maxRiskScore: 25, maxFailures: 1 },
        status: 'completed',
        lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        lastReport: {
          suiteId: 'gdpr_compliance',
          executionId: 'exec_123',
          startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
          totalTests: 8,
          passedTests: 7,
          failedTests: 1,
          skippedTests: 0,
          overallCompliance: 87,
          overallRiskScore: 23,
          results: [],
          summary: {
            criticalIssues: 0,
            highPriorityIssues: 1,
            complianceGaps: ['Consent granularity needs improvement'],
            recommendedActions: ['Implement preference center', 'Update consent flows']
          },
          trends: {
            complianceScore: [
              { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), score: 83 },
              { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), score: 85 },
              { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), score: 87 }
            ],
            riskScore: [
              { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), score: 28 },
              { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), score: 25 },
              { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), score: 23 }
            ]
          }
        }
      },
      {
        id: 'security_privacy_suite',
        name: 'Security & Privacy Suite',
        description: 'Security-focused privacy testing including anonymization and risk assessment',
        schedule: { frequency: 'daily', nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000) },
        thresholds: { minComplianceScore: 80, maxRiskScore: 30, maxFailures: 2 },
        status: 'idle',
        lastRun: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'multi_jurisdiction',
        name: 'Multi-Jurisdiction Suite',
        description: 'Cross-jurisdiction compliance testing for GDPR, CCPA, LGPD, and PIPEDA',
        schedule: { frequency: 'monthly', nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
        thresholds: { minComplianceScore: 85, maxRiskScore: 20, maxFailures: 0 },
        status: 'idle'
      }
    ];

    setTestSuites(mockSuites);
    setActiveReport(mockSuites[0].lastReport || null);
  };

  const runTestSuite = async (suiteId: string) => {
    setIsRunning(true);
    
    // Update suite status
    setTestSuites(prev => prev.map(suite => 
      suite.id === suiteId ? { ...suite, status: 'running' } : suite
    ));

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock successful result
      const mockReport: PrivacyTestReport = {
        suiteId,
        executionId: `exec_${Date.now()}`,
        startTime: new Date(Date.now() - 3000),
        endTime: new Date(),
        totalTests: 6,
        passedTests: 5,
        failedTests: 1,
        skippedTests: 0,
        overallCompliance: 85,
        overallRiskScore: 28,
        results: [],
        summary: {
          criticalIssues: 0,
          highPriorityIssues: 1,
          complianceGaps: ['Data retention policy needs update'],
          recommendedActions: ['Update retention policies', 'Implement automated deletion']
        },
        trends: {
          complianceScore: [{ date: new Date(), score: 85 }],
          riskScore: [{ date: new Date(), score: 28 }]
        }
      };

      // Update suite with results
      setTestSuites(prev => prev.map(suite => 
        suite.id === suiteId ? { 
          ...suite, 
          status: 'completed', 
          lastRun: new Date(),
          lastReport: mockReport 
        } : suite
      ));

      setActiveReport(mockReport);
      
    } catch (error) {
      setTestSuites(prev => prev.map(suite => 
        suite.id === suiteId ? { ...suite, status: 'failed' } : suite
      ));
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Pause className="h-4 w-4 text-gray-400" />;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (score: number) => {
    if (score <= 20) return 'text-green-600';
    if (score <= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Privacy Testing Dashboard</h1>
          <p className="text-gray-600 mt-2">Automated privacy compliance testing and monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => runTestSuite(selectedSuite)}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Running...' : 'Run Selected Suite'}
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Test Suites</p>
                <p className="text-2xl font-bold">{testSuites.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Overall Compliance</p>
                <p className={`text-2xl font-bold ${getComplianceColor(activeReport?.overallCompliance || 0)}`}>
                  {activeReport?.overallCompliance || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Risk Score</p>
                <p className={`text-2xl font-bold ${getRiskColor(activeReport?.overallRiskScore || 0)}`}>
                  {activeReport?.overallRiskScore || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Active Issues</p>
                <p className="text-2xl font-bold text-red-600">
                  {(activeReport?.summary.criticalIssues || 0) + (activeReport?.summary.highPriorityIssues || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="results">Latest Results</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="suites" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testSuites.map((suite) => (
              <Card 
                key={suite.id} 
                className={`cursor-pointer transition-all ${selectedSuite === suite.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedSuite(suite.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{suite.name}</CardTitle>
                    {getStatusIcon(suite.status)}
                  </div>
                  <p className="text-sm text-gray-600">{suite.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Schedule:</span>
                      <Badge variant="outline">{suite.schedule.frequency}</Badge>
                    </div>
                    
                    {suite.schedule.nextRun && (
                      <div className="flex justify-between text-sm">
                        <span>Next Run:</span>
                        <span>{suite.schedule.nextRun.toLocaleDateString()}</span>
                      </div>
                    )}

                    {suite.lastReport && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Compliance:</span>
                          <span className={getComplianceColor(suite.lastReport.overallCompliance)}>
                            {suite.lastReport.overallCompliance}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>Risk Score:</span>
                          <span className={getRiskColor(suite.lastReport.overallRiskScore)}>
                            {suite.lastReport.overallRiskScore}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span>Tests:</span>
                          <span>
                            {suite.lastReport.passedTests}/{suite.lastReport.totalTests} passed
                          </span>
                        </div>
                      </>
                    )}

                    <Button 
                      className="w-full mt-3" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        runTestSuite(suite.id);
                      }}
                      disabled={isRunning || suite.status === 'running'}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Run Suite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {activeReport && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Execution Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{activeReport.passedTests}</p>
                      <p className="text-sm text-green-600">Passed</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{activeReport.failedTests}</p>
                      <p className="text-sm text-red-600">Failed</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{activeReport.passedTests}/{activeReport.totalTests}</span>
                    </div>
                    <Progress value={(activeReport.passedTests / activeReport.totalTests) * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Execution Time:</span>
                      <span>{Math.round((activeReport.endTime.getTime() - activeReport.startTime.getTime()) / 1000)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Started:</span>
                      <span>{activeReport.startTime.toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span>{activeReport.endTime.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Scores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Compliance</span>
                        <span className={getComplianceColor(activeReport.overallCompliance)}>
                          {activeReport.overallCompliance}%
                        </span>
                      </div>
                      <Progress value={activeReport.overallCompliance} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Risk Score</span>
                        <span className={getRiskColor(activeReport.overallRiskScore)}>
                          {activeReport.overallRiskScore}/100
                        </span>
                      </div>
                      <Progress value={activeReport.overallRiskScore} className="[&>div]:bg-red-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <p className="text-lg font-bold text-orange-600">{activeReport.summary.criticalIssues}</p>
                      <p className="text-xs text-orange-600">Critical</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <p className="text-lg font-bold text-yellow-600">{activeReport.summary.highPriorityIssues}</p>
                      <p className="text-xs text-yellow-600">High Priority</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {activeReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Compliance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Recent Compliance Scores</h4>
                    <div className="space-y-2">
                      {activeReport.trends.complianceScore.map((trend, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{trend.date.toLocaleDateString()}</span>
                          <span className={getComplianceColor(trend.score)}>{trend.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Risk Score Trends</h4>
                    <div className="space-y-2">
                      {activeReport.trends.riskScore.map((trend, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{trend.date.toLocaleDateString()}</span>
                          <span className={getRiskColor(trend.score)}>{trend.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {activeReport && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Gaps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeReport.summary.complianceGaps.length > 0 ? (
                      activeReport.summary.complianceGaps.map((gap, index) => (
                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                            <p className="text-sm text-red-700">{gap}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-green-600 text-sm">No compliance gaps detected</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommended Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeReport.summary.recommendedActions.map((action, index) => (
                      <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                          <p className="text-sm text-blue-700">{action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}