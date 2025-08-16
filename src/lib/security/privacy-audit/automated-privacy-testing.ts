import { z } from 'zod';
import { 
  ConsentMapper, 
  DataMinimizer, 
  AnonymizationTester, 
  DPIASimulator, 
  CookieTracker, 
  DataExporter 
} from './index';
import { RealTimePrivacyMonitor } from './real-time-privacy-monitor';
import { AIPrivacyRiskEngine } from './ai-privacy-risk-engine';
import { MultiJurisdictionCompliance } from './multi-jurisdiction-compliance';

export interface PrivacyTestCase {
  id: string;
  name: string;
  description: string;
  category: 'consent' | 'data_minimization' | 'anonymization' | 'dpia' | 'cookies' | 'portability' | 'monitoring' | 'risk_assessment' | 'compliance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  automated: boolean;
  testType: 'unit' | 'integration' | 'end_to_end' | 'compliance' | 'security' | 'performance';
  expectedBehavior: string;
  testData: Record<string, any>;
  assertions: PrivacyTestAssertion[];
  regulationScope: ('gdpr' | 'ccpa' | 'lgpd' | 'pipeda')[];
}

export interface PrivacyTestAssertion {
  type: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'exists' | 'not_exists' | 'compliance_threshold';
  field: string;
  expectedValue: any;
  actualValue?: any;
  passed?: boolean;
  message?: string;
}

export interface PrivacyTestResult {
  testId: string;
  passed: boolean;
  duration: number;
  errors: string[];
  warnings: string[];
  assertions: PrivacyTestAssertion[];
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

export interface PrivacyTestSuite {
  id: string;
  name: string;
  description: string;
  testCases: PrivacyTestCase[];
  schedule: {
    frequency: 'manual' | 'daily' | 'weekly' | 'monthly';
    nextRun?: Date;
  };
  notifications: {
    onFailure: boolean;
    onSuccess: boolean;
    recipients: string[];
  };
  thresholds: {
    minComplianceScore: number;
    maxRiskScore: number;
    maxFailures: number;
  };
}

export interface PrivacyTestReport {
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

export class AutomatedPrivacyTesting {
  private testSuites: Map<string, PrivacyTestSuite> = new Map();
  private testResults: Map<string, PrivacyTestResult[]> = new Map();
  
  constructor(private tenantId: string) {
    this.initializeDefaultTestSuites();
  }

  async runTestSuite(suiteId: string): Promise<PrivacyTestReport> {
    const suite = this.testSuites.get(suiteId);
    if (!suite) {
      throw new Error(`Test suite ${suiteId} not found`);
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date();

    console.log(`🧪 Starting privacy test suite: ${suite.name}`);

    const results: PrivacyTestResult[] = [];
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;

    // Execute test cases in parallel where possible
    const testPromises = suite.testCases.map(async (testCase) => {
      try {
        const result = await this.executeTestCase(testCase);
        results.push(result);
        
        if (result.passed) {
          passedTests++;
        } else {
          failedTests++;
        }
        
        return result;
      } catch (error) {
        console.error(`Test case ${testCase.id} failed with error:`, error);
        skippedTests++;
        return null;
      }
    });

    await Promise.all(testPromises);

    const endTime = new Date();
    const overallCompliance = this.calculateOverallCompliance(results);
    const overallRiskScore = this.calculateOverallRiskScore(results);

    const report: PrivacyTestReport = {
      suiteId,
      executionId,
      startTime,
      endTime,
      totalTests: suite.testCases.length,
      passedTests,
      failedTests,
      skippedTests,
      overallCompliance,
      overallRiskScore,
      results: results.filter(r => r !== null) as PrivacyTestResult[],
      summary: this.generateTestSummary(results),
      trends: await this.getComplianceTrends(suiteId)
    };

    // Store results for trending
    this.storeTestResults(suiteId, results.filter(r => r !== null) as PrivacyTestResult[]);

    // Check thresholds and notify if needed
    await this.checkThresholdsAndNotify(suite, report);

    console.log(`✅ Privacy test suite completed: ${passedTests}/${suite.testCases.length} tests passed`);

    return report;
  }

  async runAllTestSuites(): Promise<PrivacyTestReport[]> {
    const reports: PrivacyTestReport[] = [];
    
    for (const [suiteId] of this.testSuites) {
      try {
        const report = await this.runTestSuite(suiteId);
        reports.push(report);
      } catch (error) {
        console.error(`Failed to run test suite ${suiteId}:`, error);
      }
    }

    return reports;
  }

  async scheduleTestSuite(suiteId: string, frequency: 'daily' | 'weekly' | 'monthly'): Promise<void> {
    const suite = this.testSuites.get(suiteId);
    if (!suite) {
      throw new Error(`Test suite ${suiteId} not found`);
    }

    const now = new Date();
    let nextRun: Date;

    switch (frequency) {
      case 'daily':
        nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        nextRun = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        nextRun = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
    }

    suite.schedule.frequency = frequency;
    suite.schedule.nextRun = nextRun;

    console.log(`📅 Scheduled test suite ${suite.name} to run ${frequency} (next: ${nextRun.toISOString()})`);
  }

  async createCustomTestCase(testCase: Omit<PrivacyTestCase, 'id'>): Promise<string> {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullTestCase: PrivacyTestCase = { ...testCase, id };

    // Add to appropriate test suite or create new one
    const suiteName = `custom_${testCase.category}`;
    let suite = this.testSuites.get(suiteName);
    
    if (!suite) {
      suite = {
        id: suiteName,
        name: `Custom ${testCase.category} Tests`,
        description: `Custom privacy tests for ${testCase.category}`,
        testCases: [],
        schedule: { frequency: 'manual' },
        notifications: { onFailure: true, onSuccess: false, recipients: [] },
        thresholds: { minComplianceScore: 80, maxRiskScore: 30, maxFailures: 2 }
      };
      this.testSuites.set(suiteName, suite);
    }

    suite.testCases.push(fullTestCase);
    return id;
  }

  private async executeTestCase(testCase: PrivacyTestCase): Promise<PrivacyTestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    const assertions: PrivacyTestAssertion[] = [];

    console.log(`  🔍 Running test: ${testCase.name}`);

    try {
      // Execute test based on category
      const testData = await this.runCategorySpecificTest(testCase);
      
      // Evaluate assertions
      for (const assertion of testCase.assertions) {
        const evaluatedAssertion = this.evaluateAssertion(assertion, testData);
        assertions.push(evaluatedAssertion);
        
        if (!evaluatedAssertion.passed) {
          errors.push(evaluatedAssertion.message || `Assertion failed: ${assertion.field}`);
        }
      }

      // Calculate compliance scores
      const compliance = await this.calculateTestCompliance(testCase, testData);
      const riskScore = this.calculateTestRiskScore(testCase, testData, assertions);
      const recommendations = this.generateTestRecommendations(testCase, assertions, testData);

      const duration = Date.now() - startTime;
      const passed = assertions.every(a => a.passed) && errors.length === 0;

      return {
        testId: testCase.id,
        passed,
        duration,
        errors,
        warnings,
        assertions,
        compliance,
        riskScore,
        recommendations,
        executedAt: new Date()
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      errors.push(`Test execution failed: ${error.message}`);

      return {
        testId: testCase.id,
        passed: false,
        duration,
        errors,
        warnings,
        assertions,
        compliance: { gdpr: 0, ccpa: 0, lgpd: 0, pipeda: 0 },
        riskScore: 100,
        recommendations: ['Fix test execution errors before proceeding'],
        executedAt: new Date()
      };
    }
  }

  private async runCategorySpecificTest(testCase: PrivacyTestCase): Promise<any> {
    switch (testCase.category) {
      case 'consent':
        return await this.testConsentCompliance(testCase);
      
      case 'data_minimization':
        return await this.testDataMinimization(testCase);
      
      case 'anonymization':
        return await this.testAnonymization(testCase);
      
      case 'dpia':
        return await this.testDPIA(testCase);
      
      case 'cookies':
        return await this.testCookieCompliance(testCase);
      
      case 'portability':
        return await this.testDataPortability(testCase);
      
      case 'monitoring':
        return await this.testPrivacyMonitoring(testCase);
      
      case 'risk_assessment':
        return await this.testRiskAssessment(testCase);
      
      case 'compliance':
        return await this.testMultiJurisdictionCompliance(testCase);
      
      default:
        throw new Error(`Unknown test category: ${testCase.category}`);
    }
  }

  private async testConsentCompliance(testCase: PrivacyTestCase): Promise<any> {
    const consentMapper = new ConsentMapper(this.tenantId);
    const result = await consentMapper.mapConsents();
    
    return {
      totalUsers: result.totalUsers,
      consentedUsers: result.consentedUsers,
      complianceScore: result.complianceScore,
      mismatches: result.mismatches.length,
      consentRate: result.consentedUsers / result.totalUsers
    };
  }

  private async testDataMinimization(testCase: PrivacyTestCase): Promise<any> {
    const dataMinimizer = new DataMinimizer(this.tenantId);
    const result = await dataMinimizer.auditDataMinimization();
    
    return {
      totalFields: result.totalFields,
      overCollectionIssues: result.overCollectionIssues.length,
      potentialSavings: result.potentialSavings,
      minimizationScore: 100 - (result.overCollectionIssues.length / result.totalFields * 100)
    };
  }

  private async testAnonymization(testCase: PrivacyTestCase): Promise<any> {
    const anonymizationTester = new AnonymizationTester(this.tenantId);
    
    // Mock dataset for testing
    const mockDataset = {
      id: 'test_dataset',
      name: 'Test Dataset',
      records: 1000,
      fields: ['id', 'name', 'email', 'age', 'city'],
      anonymizationMethod: 'k_anonymity',
      k: 5
    };
    
    const result = await anonymizationTester.testAnonymization(mockDataset);
    
    return {
      overallRisk: result.overallRisk,
      attacksDetected: result.attacks.length,
      metrics: result.metrics,
      riskScore: result.overallRisk === 'low' ? 10 : result.overallRisk === 'medium' ? 30 : result.overallRisk === 'high' ? 60 : 90
    };
  }

  private async testDPIA(testCase: PrivacyTestCase): Promise<any> {
    const dpiaSimulator = new DPIASimulator(this.tenantId);
    
    // Mock processing activity for testing
    const mockActivity = {
      id: 'test_activity',
      name: 'Test Processing Activity',
      description: 'Testing DPIA requirements',
      dataCategories: ['personal_data', 'sensitive_data'],
      processingPurposes: ['analytics', 'marketing'],
      legalBasis: ['consent', 'legitimate_interest'],
      dataSubjects: ['customers', 'employees'],
      recipients: ['internal_teams', 'third_party_processors'],
      retentionPeriod: 24,
      internationalTransfers: true,
      automatedDecisionMaking: false,
      riskFactors: ['large_scale_processing', 'sensitive_data'],
      safeguards: ['encryption', 'access_controls']
    };
    
    const result = await dpiaSimulator.assessPrivacyImpact(mockActivity);
    
    return {
      requiresFullDPIA: result.requiresFullDPIA,
      riskScore: result.assessment.overallRisk,
      recommendations: result.recommendations.length,
      complianceLevel: result.assessment.overallRisk <= 30 ? 'high' : result.assessment.overallRisk <= 60 ? 'medium' : 'low'
    };
  }

  private async testCookieCompliance(testCase: PrivacyTestCase): Promise<any> {
    const cookieTracker = new CookieTracker(this.tenantId);
    const result = await cookieTracker.auditCookieCompliance();
    
    return {
      totalCookies: result.cookies.length,
      complianceScore: result.overallCompliance,
      consentPatterns: result.patterns.length,
      churnRisk: result.churnPredictions.some(p => p.riskLevel === 'high')
    };
  }

  private async testDataPortability(testCase: PrivacyTestCase): Promise<any> {
    const dataExporter = new DataExporter(this.tenantId);
    const result = await dataExporter.auditDataPortability();
    
    return {
      exportRequests: result.exportRequests.length,
      issues: result.issues.length,
      gdprCompliance: result.gdprCompliance.overallCompliance,
      ccpaCompliance: result.ccpaCompliance.overallCompliance,
      overallScore: result.overallScore
    };
  }

  private async testPrivacyMonitoring(testCase: PrivacyTestCase): Promise<any> {
    const monitor = new RealTimePrivacyMonitor(this.tenantId);
    const metrics = await monitor.getRealtimeMetrics();
    const alerts = await monitor.getActiveAlerts();
    
    return {
      totalEvents: metrics.totalEvents,
      activeAlerts: alerts.length,
      complianceScore: metrics.complianceScore,
      riskLevel: metrics.riskLevel,
      responseTime: metrics.averageResponseTime
    };
  }

  private async testRiskAssessment(testCase: PrivacyTestCase): Promise<any> {
    const riskEngine = new AIPrivacyRiskEngine(this.tenantId);
    const assessment = await riskEngine.assessPrivacyRisks();
    
    return {
      overallRiskScore: assessment.overallRiskScore,
      riskFactors: assessment.riskFactors.length,
      behavioralAnomalies: assessment.behavioralAnomalies.length,
      vendorRisks: assessment.vendorRisks.length,
      complianceGaps: assessment.complianceGaps.length,
      recommendations: assessment.recommendations.length
    };
  }

  private async testMultiJurisdictionCompliance(testCase: PrivacyTestCase): Promise<any> {
    const compliance = new MultiJurisdictionCompliance(this.tenantId);
    
    const assessment = await compliance.assessMultiJurisdictionCompliance(
      ['EU', 'California', 'Brazil'],
      ['United States', 'EU'],
      ['analytics', 'marketing']
    );
    
    return {
      applicableRegulations: assessment.applicableRegulations.length,
      overallCompliance: assessment.overallCompliance,
      prioritizedActions: assessment.prioritizedActions.length,
      complianceComplexity: assessment.crossJurisdictionAnalysis.complianceComplexity
    };
  }

  private evaluateAssertion(assertion: PrivacyTestAssertion, testData: any): PrivacyTestAssertion {
    const actualValue = this.getNestedValue(testData, assertion.field);
    let passed = false;
    let message = '';

    switch (assertion.type) {
      case 'equals':
        passed = actualValue === assertion.expectedValue;
        message = passed ? 'Assertion passed' : `Expected ${assertion.expectedValue}, got ${actualValue}`;
        break;
      
      case 'greater_than':
        passed = actualValue > assertion.expectedValue;
        message = passed ? 'Assertion passed' : `Expected > ${assertion.expectedValue}, got ${actualValue}`;
        break;
      
      case 'less_than':
        passed = actualValue < assertion.expectedValue;
        message = passed ? 'Assertion passed' : `Expected < ${assertion.expectedValue}, got ${actualValue}`;
        break;
      
      case 'contains':
        passed = Array.isArray(actualValue) ? actualValue.includes(assertion.expectedValue) : 
                 typeof actualValue === 'string' ? actualValue.includes(assertion.expectedValue) : false;
        message = passed ? 'Assertion passed' : `Expected to contain ${assertion.expectedValue}`;
        break;
      
      case 'exists':
        passed = actualValue !== undefined && actualValue !== null;
        message = passed ? 'Assertion passed' : `Field ${assertion.field} does not exist`;
        break;
      
      case 'compliance_threshold':
        passed = actualValue >= assertion.expectedValue;
        message = passed ? 'Compliance threshold met' : `Compliance score ${actualValue} below threshold ${assertion.expectedValue}`;
        break;
      
      default:
        passed = false;
        message = `Unknown assertion type: ${assertion.type}`;
    }

    return {
      ...assertion,
      actualValue,
      passed,
      message
    };
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async calculateTestCompliance(testCase: PrivacyTestCase, testData: any): Promise<{
    gdpr: number;
    ccpa: number;
    lgpd: number;
    pipeda: number;
  }> {
    // Mock compliance calculation based on test results
    const baseScore = 85;
    const penalty = testData.issues ? testData.issues * 5 : 0;
    const score = Math.max(0, baseScore - penalty);

    return {
      gdpr: testCase.regulationScope.includes('gdpr') ? score : 100,
      ccpa: testCase.regulationScope.includes('ccpa') ? score : 100,
      lgpd: testCase.regulationScope.includes('lgpd') ? score : 100,
      pipeda: testCase.regulationScope.includes('pipeda') ? score : 100
    };
  }

  private calculateTestRiskScore(testCase: PrivacyTestCase, testData: any, assertions: PrivacyTestAssertion[]): number {
    const failedAssertions = assertions.filter(a => !a.passed).length;
    const baseRisk = failedAssertions * 10;
    const dataRisk = testData.riskScore || 0;
    
    return Math.min(100, baseRisk + dataRisk * 0.3);
  }

  private generateTestRecommendations(testCase: PrivacyTestCase, assertions: PrivacyTestAssertion[], testData: any): string[] {
    const recommendations: string[] = [];

    // Failed assertion recommendations
    assertions.filter(a => !a.passed).forEach(assertion => {
      recommendations.push(`Fix ${assertion.field}: ${assertion.message}`);
    });

    // Category-specific recommendations
    if (testCase.category === 'consent' && testData.consentRate < 0.7) {
      recommendations.push('Improve consent collection user experience');
    }

    if (testCase.category === 'data_minimization' && testData.overCollectionIssues > 5) {
      recommendations.push('Implement data minimization controls');
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  private calculateOverallCompliance(results: PrivacyTestResult[]): number {
    if (results.length === 0) return 0;
    
    const validResults = results.filter(r => r !== null);
    const totalCompliance = validResults.reduce((sum, result) => {
      const avgCompliance = (result.compliance.gdpr + result.compliance.ccpa + result.compliance.lgpd + result.compliance.pipeda) / 4;
      return sum + avgCompliance;
    }, 0);
    
    return Math.round(totalCompliance / validResults.length);
  }

  private calculateOverallRiskScore(results: PrivacyTestResult[]): number {
    if (results.length === 0) return 0;
    
    const validResults = results.filter(r => r !== null);
    const totalRisk = validResults.reduce((sum, result) => sum + result.riskScore, 0);
    
    return Math.round(totalRisk / validResults.length);
  }

  private generateTestSummary(results: PrivacyTestResult[]): {
    criticalIssues: number;
    highPriorityIssues: number;
    complianceGaps: string[];
    recommendedActions: string[];
  } {
    const validResults = results.filter(r => r !== null);
    const criticalIssues = validResults.filter(r => r.riskScore > 80).length;
    const highPriorityIssues = validResults.filter(r => r.riskScore > 60 && r.riskScore <= 80).length;
    
    const complianceGaps: string[] = [];
    const recommendedActions: string[] = [];
    
    validResults.forEach(result => {
      if (!result.passed) {
        complianceGaps.push(`Test ${result.testId}: ${result.errors[0] || 'Test failed'}`);
      }
      recommendedActions.push(...result.recommendations);
    });

    return {
      criticalIssues,
      highPriorityIssues,
      complianceGaps: complianceGaps.slice(0, 10),
      recommendedActions: [...new Set(recommendedActions)].slice(0, 10)
    };
  }

  private async getComplianceTrends(suiteId: string): Promise<{
    complianceScore: Array<{ date: Date; score: number }>;
    riskScore: Array<{ date: Date; score: number }>;
  }> {
    // Mock trend data - in production, this would come from stored historical results
    const now = new Date();
    const trends = {
      complianceScore: [
        { date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), score: 78 },
        { date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), score: 82 },
        { date: now, score: 85 }
      ],
      riskScore: [
        { date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), score: 35 },
        { date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), score: 28 },
        { date: now, score: 22 }
      ]
    };

    return trends;
  }

  private storeTestResults(suiteId: string, results: PrivacyTestResult[]): void {
    if (!this.testResults.has(suiteId)) {
      this.testResults.set(suiteId, []);
    }
    
    const existing = this.testResults.get(suiteId)!;
    existing.push(...results);
    
    // Keep only last 100 results per suite
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }
  }

  private async checkThresholdsAndNotify(suite: PrivacyTestSuite, report: PrivacyTestReport): Promise<void> {
    const issues: string[] = [];

    if (report.overallCompliance < suite.thresholds.minComplianceScore) {
      issues.push(`Compliance score ${report.overallCompliance}% below threshold ${suite.thresholds.minComplianceScore}%`);
    }

    if (report.overallRiskScore > suite.thresholds.maxRiskScore) {
      issues.push(`Risk score ${report.overallRiskScore} above threshold ${suite.thresholds.maxRiskScore}`);
    }

    if (report.failedTests > suite.thresholds.maxFailures) {
      issues.push(`${report.failedTests} failed tests exceed threshold ${suite.thresholds.maxFailures}`);
    }

    if (issues.length > 0 && suite.notifications.onFailure) {
      console.warn(`🚨 Privacy test suite ${suite.name} threshold violations:`, issues);
      // In production, send notifications to suite.notifications.recipients
    }

    if (issues.length === 0 && suite.notifications.onSuccess) {
      console.log(`✅ Privacy test suite ${suite.name} passed all thresholds`);
    }
  }

  private initializeDefaultTestSuites(): void {
    const defaultSuites: PrivacyTestSuite[] = [
      {
        id: 'gdpr_compliance',
        name: 'GDPR Compliance Suite',
        description: 'Comprehensive GDPR compliance testing',
        testCases: [
          {
            id: 'gdpr_consent_test',
            name: 'GDPR Consent Compliance',
            description: 'Test consent collection and management compliance with GDPR',
            category: 'consent',
            priority: 'critical',
            automated: true,
            testType: 'compliance',
            expectedBehavior: 'Consent rate should be > 70% with proper granularity',
            testData: {},
            assertions: [
              { type: 'greater_than', field: 'consentRate', expectedValue: 0.7 },
              { type: 'compliance_threshold', field: 'complianceScore', expectedValue: 80 }
            ],
            regulationScope: ['gdpr']
          },
          {
            id: 'gdpr_data_minimization_test',
            name: 'GDPR Data Minimization',
            description: 'Test data minimization compliance',
            category: 'data_minimization',
            priority: 'high',
            automated: true,
            testType: 'compliance',
            expectedBehavior: 'Minimal over-collection issues',
            testData: {},
            assertions: [
              { type: 'less_than', field: 'overCollectionIssues', expectedValue: 5 },
              { type: 'greater_than', field: 'minimizationScore', expectedValue: 85 }
            ],
            regulationScope: ['gdpr']
          },
          {
            id: 'gdpr_data_portability_test',
            name: 'GDPR Data Portability',
            description: 'Test data portability compliance',
            category: 'portability',
            priority: 'high',
            automated: true,
            testType: 'compliance',
            expectedBehavior: 'Automated data export available',
            testData: {},
            assertions: [
              { type: 'greater_than', field: 'overallScore', expectedValue: 85 },
              { type: 'less_than', field: 'issues', expectedValue: 3 }
            ],
            regulationScope: ['gdpr']
          }
        ],
        schedule: { frequency: 'weekly' },
        notifications: { onFailure: true, onSuccess: false, recipients: ['privacy@company.com'] },
        thresholds: { minComplianceScore: 85, maxRiskScore: 25, maxFailures: 1 }
      },
      {
        id: 'security_privacy_suite',
        name: 'Security & Privacy Suite',
        description: 'Security-focused privacy testing',
        testCases: [
          {
            id: 'anonymization_security_test',
            name: 'Anonymization Security',
            description: 'Test anonymization techniques against re-identification',
            category: 'anonymization',
            priority: 'high',
            automated: true,
            testType: 'security',
            expectedBehavior: 'Low risk of re-identification',
            testData: {},
            assertions: [
              { type: 'equals', field: 'overallRisk', expectedValue: 'low' },
              { type: 'less_than', field: 'attacksDetected', expectedValue: 2 }
            ],
            regulationScope: ['gdpr', 'ccpa']
          },
          {
            id: 'risk_assessment_test',
            name: 'AI Risk Assessment',
            description: 'Test AI-powered privacy risk assessment',
            category: 'risk_assessment',
            priority: 'medium',
            automated: true,
            testType: 'integration',
            expectedBehavior: 'Accurate risk identification and scoring',
            testData: {},
            assertions: [
              { type: 'less_than', field: 'overallRiskScore', expectedValue: 40 },
              { type: 'greater_than', field: 'recommendations', expectedValue: 3 }
            ],
            regulationScope: ['gdpr', 'ccpa', 'lgpd']
          }
        ],
        schedule: { frequency: 'daily' },
        notifications: { onFailure: true, onSuccess: false, recipients: ['security@company.com'] },
        thresholds: { minComplianceScore: 80, maxRiskScore: 30, maxFailures: 2 }
      }
    ];

    defaultSuites.forEach(suite => this.testSuites.set(suite.id, suite));
  }
}