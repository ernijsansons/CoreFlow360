'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ConsentMapper, 
  DataMinimizer, 
  AnonymizationTester, 
  DPIASimulator, 
  CookieTracker, 
  DataExporter,
  type ConsentMismatch,
  type OverCollectionIssue,
  type ReIdentificationAttack,
  type PrivacyRisk,
  type ConsentPattern,
  type ExportIssue
} from '@/lib/security/privacy-audit';

interface AuditSummary {
  consentCompliance: number;
  dataMinimization: number;
  anonymizationSecurity: number;
  dpiaCoverage: number;
  cookieCompliance: number;
  dataPortability: number;
  overallScore: number;
}

interface AuditResults {
  consent: {
    totalUsers: number;
    consentedUsers: number;
    mismatches: ConsentMismatch[];
    complianceScore: number;
  };
  minimization: {
    totalFields: number;
    issues: OverCollectionIssue[];
    potentialSavings: { storage: number; cost: number; riskReduction: number };
  };
  anonymization: {
    attacks: ReIdentificationAttack[];
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
  };
  dpia: {
    requiresFullDPIA: boolean;
    risks: PrivacyRisk[];
    residualRisk: 'low' | 'medium' | 'high' | 'very_high';
  };
  cookies: {
    patterns: ConsentPattern[];
    overallCompliance: number;
    avgChurnPrediction: number;
  };
  portability: {
    issues: ExportIssue[];
    overallScore: number;
  };
}

export default function PrivacyAuditDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [auditResults, setAuditResults] = useState<AuditResults | null>(null);
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  const [selectedTab, setSelectedTab] = useState('summary');

  const runPrivacyAudit = async () => {
    setIsLoading(true);
    
    try {
      // Initialize audit tools
      const consentMapper = new ConsentMapper('tenant-1');
      const dataMinimizer = new DataMinimizer('tenant-1');
      const anonymizationTester = new AnonymizationTester('tenant-1');
      const dpiaSimulator = new DPIASimulator('tenant-1');
      const cookieTracker = new CookieTracker('tenant-1');
      const dataExporter = new DataExporter('tenant-1');

      // Run all audits in parallel
      const [
        consentResults,
        minimizationResults,
        anonymizationResults,
        dpiaResults,
        cookieResults,
        portabilityResults
      ] = await Promise.all([
        consentMapper.mapConsents(),
        dataMinimizer.auditDataMinimization(),
        anonymizationTester.testAnonymization({
          originalRecords: 10000,
          anonymizedRecords: 10000,
          technique: 'k_anonymity',
          parameters: { k: 3 },
          quasiIdentifiers: ['age', 'zip_code', 'gender'],
          sensitiveAttributes: ['salary', 'health_condition']
        }),
        dpiaSimulator.assessPrivacyImpact({
          id: 'proc-001',
          name: 'Customer Analytics Processing',
          description: 'Processing customer data for business analytics',
          dataController: 'CoreFlow360',
          purposes: ['analytics', 'business_intelligence'],
          dataCategories: ['personal_identifiers', 'usage_data', 'preferences'],
          dataSubjects: ['customers'],
          recipients: ['internal_teams'],
          thirdCountryTransfers: false,
          retentionPeriod: 365,
          dataVolume: 'large',
          technologyUsed: ['ai', 'ml'],
          automatedDecisionMaking: true,
          profiling: true,
          vulnerableSubjects: false
        }),
        cookieTracker.auditCookieCompliance(),
        dataExporter.auditDataPortability()
      ]);

      const results: AuditResults = {
        consent: consentResults,
        minimization: minimizationResults,
        anonymization: anonymizationResults,
        dpia: dpiaResults.assessment,
        cookies: cookieResults,
        portability: portabilityResults
      };

      const summary: AuditSummary = {
        consentCompliance: consentResults.complianceScore,
        dataMinimization: Math.max(0, 100 - minimizationResults.issues.length * 10),
        anonymizationSecurity: anonymizationResults.overallRisk === 'low' ? 90 : 
                             anonymizationResults.overallRisk === 'medium' ? 70 :
                             anonymizationResults.overallRisk === 'high' ? 40 : 20,
        dpiaCoverage: dpiaResults.assessment.residualRisk === 'low' ? 90 :
                     dpiaResults.assessment.residualRisk === 'medium' ? 70 :
                     dpiaResults.assessment.residualRisk === 'high' ? 40 : 20,
        cookieCompliance: cookieResults.overallCompliance,
        dataPortability: portabilityResults.overallScore,
        overallScore: 0
      };

      summary.overallScore = Math.round(
        (summary.consentCompliance + 
         summary.dataMinimization + 
         summary.anonymizationSecurity + 
         summary.dpiaCoverage + 
         summary.cookieCompliance + 
         summary.dataPortability) / 6
      );

      setAuditResults(results);
      setAuditSummary(summary);
    } catch (error) {
      console.error('Privacy audit failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'very_high': case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Privacy Audit Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive privacy compliance auditing system
          </p>
        </div>
        <Button 
          onClick={runPrivacyAudit} 
          disabled={isLoading}
          className="min-w-[140px]"
        >
          {isLoading ? 'Running Audit...' : 'Run Privacy Audit'}
        </Button>
      </div>

      {auditSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditSummary.overallScore}%</div>
              <Progress value={auditSummary.overallScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Consent Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditSummary.consentCompliance}%</div>
              <Progress value={auditSummary.consentCompliance} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cookie Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditSummary.cookieCompliance}%</div>
              <Progress value={auditSummary.cookieCompliance} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Data Portability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditSummary.dataPortability}%</div>
              <Progress value={auditSummary.dataPortability} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {auditResults && (
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="consent">Consent</TabsTrigger>
            <TabsTrigger value="minimization">Data Min.</TabsTrigger>
            <TabsTrigger value="anonymization">Anonymization</TabsTrigger>
            <TabsTrigger value="cookies">Cookies</TabsTrigger>
            <TabsTrigger value="portability">Portability</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Audit Summary</CardTitle>
                  <CardDescription>Overall privacy compliance status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Consent Compliance</span>
                      <span className={getRiskColor(auditSummary!.consentCompliance < 70 ? 'high' : 'low')}>
                        {auditSummary!.consentCompliance}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Minimization</span>
                      <span className={getRiskColor(auditSummary!.dataMinimization < 70 ? 'high' : 'low')}>
                        {auditSummary!.dataMinimization}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Anonymization Security</span>
                      <span className={getRiskColor(auditSummary!.anonymizationSecurity < 70 ? 'high' : 'low')}>
                        {auditSummary!.anonymizationSecurity}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Critical Issues</CardTitle>
                  <CardDescription>High-priority privacy risks requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {auditResults.consent.mismatches.filter(m => m.severity === 'critical').length > 0 && (
                      <Alert className="border-red-200">
                        <AlertDescription>
                          {auditResults.consent.mismatches.filter(m => m.severity === 'critical').length} critical consent violations detected
                        </AlertDescription>
                      </Alert>
                    )}
                    {auditResults.anonymization.overallRisk === 'critical' && (
                      <Alert className="border-red-200">
                        <AlertDescription>
                          Critical re-identification risk in anonymized data
                        </AlertDescription>
                      </Alert>
                    )}
                    {auditResults.portability.issues.filter(i => i.severity === 'critical').length > 0 && (
                      <Alert className="border-red-200">
                        <AlertDescription>
                          Critical data portability compliance failures
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="consent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Consent Mapper Results</CardTitle>
                <CardDescription>GDPR/CCPA consent compliance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{auditResults.consent.totalUsers}</div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{auditResults.consent.consentedUsers}</div>
                    <div className="text-sm text-muted-foreground">Consented</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{auditResults.consent.mismatches.length}</div>
                    <div className="text-sm text-muted-foreground">Violations</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Consent Mismatches</h4>
                  {auditResults.consent.mismatches.map((mismatch, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{mismatch.description}</div>
                        <div className="text-sm text-muted-foreground">User: {mismatch.userId}</div>
                      </div>
                      <Badge className={getSeverityColor(mismatch.severity)}>
                        {mismatch.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="minimization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Minimization Analysis</CardTitle>
                <CardDescription>Identify over-collection and suggest data purges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{auditResults.minimization.totalFields}</div>
                    <div className="text-sm text-muted-foreground">Data Fields</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{auditResults.minimization.issues.length}</div>
                    <div className="text-sm text-muted-foreground">Issues Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">${Math.round(auditResults.minimization.potentialSavings.cost)}</div>
                    <div className="text-sm text-muted-foreground">Monthly Savings</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Over-Collection Issues</h4>
                  {auditResults.minimization.issues.slice(0, 5).map((issue, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{issue.fieldName}</div>
                        <div className="text-sm text-muted-foreground">{issue.description}</div>
                      </div>
                      <div className="text-right">
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {issue.recommendedAction}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anonymization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Anonymization Testing</CardTitle>
                <CardDescription>Re-identification attack simulation and risk assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Risk Level</span>
                    <Badge className={`${getRiskColor(auditResults.anonymization.overallRisk)} border`}>
                      {auditResults.anonymization.overallRisk.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Attack Simulations</h4>
                  {auditResults.anonymization.attacks.map((attack, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{attack.attackType.replace('_', ' ').toUpperCase()}</div>
                        <Badge className={getSeverityColor(attack.severity)}>
                          {attack.severity}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{attack.description}</div>
                      <div className="flex justify-between text-sm">
                        <span>Success Rate: {attack.successRate}%</span>
                        <span>Records at Risk: {attack.recordsCompromised}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Mitigation: {attack.mitigationStrategy}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cookies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cookie Compliance Tracker</CardTitle>
                <CardDescription>ePrivacy compliance and churn prediction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{auditResults.cookies.overallCompliance}%</div>
                    <div className="text-sm text-muted-foreground">Compliance Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{auditResults.cookies.avgChurnPrediction}%</div>
                    <div className="text-sm text-muted-foreground">Predicted Churn</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Consent Patterns</h4>
                  {auditResults.cookies.patterns.map((pattern, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{pattern.url}</div>
                        <div className="text-sm">Score: {pattern.complianceScore}%</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Consent Banner: {pattern.consentBannerPresent ? '✅' : '❌'}</div>
                        <div>Granular Choices: {pattern.granularChoices ? '✅' : '❌'}</div>
                        <div>Mechanism: {pattern.consentMechanism}</div>
                        <div>Withdrawal: {pattern.withdrawalAvailable ? '✅' : '❌'}</div>
                      </div>
                      {pattern.cookiesSetBeforeConsent.length > 1 && (
                        <div className="text-xs text-red-600 mt-1">
                          ⚠️ Non-essential cookies set before consent: {pattern.cookiesSetBeforeConsent.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portability" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Portability Auditor</CardTitle>
                <CardDescription>GDPR/CCPA data export compliance testing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{auditResults.portability.overallScore}%</div>
                    <div className="text-sm text-muted-foreground">Portability Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{auditResults.portability.issues.length}</div>
                    <div className="text-sm text-muted-foreground">Export Issues</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Export Issues</h4>
                  {auditResults.portability.issues.map((issue, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{issue.description}</div>
                        <div className="text-sm text-muted-foreground">
                          Category: {issue.dataCategory} | Records: {issue.affectedRecords}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {issue.recommendation}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          Impact: {issue.complianceImpact}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}