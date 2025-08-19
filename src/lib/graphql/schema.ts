/**
 * CoreFlow360 - GraphQL Schema Definition
 * Unified API for all enterprise systems
 */

export const typeDefs = `#graphql
  scalar Date
  scalar JSON

  # ==================== ENUMS ====================
  
  enum MetricCategory {
    REVENUE
    COSTS
    EFFICIENCY
    GROWTH
    RISK
    SATISFACTION
    PERFORMANCE
  }

  enum InsightType {
    OPPORTUNITY
    RISK
    OPTIMIZATION
    TREND
    ANOMALY
    RECOMMENDATION
  }

  enum InsightImpact {
    CRITICAL
    HIGH
    MEDIUM
    LOW
  }

  enum AlertSeverity {
    CRITICAL
    HIGH
    MEDIUM
    LOW
  }

  enum AlertStatus {
    OPEN
    ACKNOWLEDGED
    RESOLVED
    ESCALATED
  }

  enum ModelStatus {
    TRAINING
    READY
    UPDATING
    ERROR
  }

  enum ModelType {
    CLASSIFICATION
    REGRESSION
    GENERATION
    ANALYSIS
    PREDICTION
  }

  enum SystemHealth {
    EXCELLENT
    GOOD
    WARNING
    CRITICAL
  }

  enum TraceStatus {
    SUCCESS
    ERROR
    TIMEOUT
  }

  enum LogLevel {
    DEBUG
    INFO
    WARN
    ERROR
  }

  enum CacheStrategy {
    WRITE_THROUGH
    WRITE_BACK
    READ_THROUGH
    REFRESH_AHEAD
  }

  enum ComplianceFramework {
    SOC2
    GDPR
    HIPAA
    ISO27001
    PCI_DSS
  }

  enum ComplianceStatus {
    COMPLIANT
    NON_COMPLIANT
    PARTIAL
    UNKNOWN
  }

  # ==================== INTERFACES ====================
  
  interface Node {
    id: ID!
    createdAt: Date!
    updatedAt: Date!
  }

  interface Timestamped {
    timestamp: Date!
  }

  # ==================== PERFORMANCE TYPES ====================
  
  type PerformanceMetrics {
    overview: PerformanceOverview!
    database: DatabaseMetrics!
    cache: CacheMetrics!
    system: SystemMetrics!
  }

  type PerformanceOverview {
    totalRequests: Int!
    averageResponseTime: Float!
    p95ResponseTime: Float!
    p99ResponseTime: Float!
    errorRate: Float!
    throughput: Float!
    healthScore: Float!
    status: SystemHealth!
  }

  type DatabaseMetrics {
    totalConnections: Int!
    activeConnections: Int!
    avgQueryTime: Float!
    slowQueries: Int!
    poolUtilization: Float!
    performance: DatabasePerformance!
  }

  type DatabasePerformance {
    status: SystemHealth!
    bottlenecks: [String!]!
    optimizations: [String!]!
  }

  type CacheMetrics {
    hitRatio: Float!
    memoryUsage: Float!
    totalEntries: Int!
    compressionRatio: Float!
    evictions: Int!
    performance: CachePerformance!
  }

  type CachePerformance {
    status: SystemHealth!
    efficiency: Float!
    recommendations: [String!]!
  }

  type SystemMetrics {
    cpuUsage: Float!
    memoryUsage: Float!
    diskUsage: Float!
    networkLatency: Float!
    health: SystemHealthStatus!
  }

  type SystemHealthStatus {
    overall: SystemHealth!
    resources: ResourceHealth!
  }

  type ResourceHealth {
    cpu: String!
    memory: String!
    disk: String!
    network: String!
  }

  type PerformanceAlert implements Node & Timestamped {
    id: ID!
    severity: AlertSeverity!
    type: String!
    message: String!
    metric: String
    currentValue: Float
    threshold: Float
    timestamp: Date!
    tenantId: String
    createdAt: Date!
    updatedAt: Date!
  }

  type OptimizationRecommendation {
    id: ID!
    category: String!
    priority: String!
    title: String!
    description: String!
    expectedImpact: String!
    implementationEffort: String!
    automated: Boolean!
  }

  # ==================== SECURITY TYPES ====================
  
  type SecurityStatus {
    authentication: AuthenticationStatus!
    authorization: AuthorizationStatus!
    encryption: EncryptionStatus!
    compliance: [ComplianceReport!]!
    threats: [SecurityThreat!]!
    auditLogs: [SecurityAuditLog!]!
  }

  type AuthenticationStatus {
    mfaEnabled: Boolean!
    sessionCount: Int!
    failedAttempts: Int!
    lockedAccounts: Int!
  }

  type AuthorizationStatus {
    rbacEnabled: Boolean!
    abacEnabled: Boolean!
    totalPolicies: Int!
    activeRoles: Int!
  }

  type EncryptionStatus {
    algorithm: String!
    keyRotationEnabled: Boolean!
    lastKeyRotation: Date
    encryptedFields: Int!
  }

  type ComplianceReport {
    framework: ComplianceFramework!
    status: ComplianceStatus!
    lastAssessment: Date!
    expiryDate: Date
    score: Float!
    requirements: [ComplianceRequirement!]!
    recommendations: [String!]!
  }

  type ComplianceRequirement {
    id: ID!
    name: String!
    status: String!
    evidence: String
    lastVerified: Date!
  }

  type SecurityThreat {
    id: ID!
    type: String!
    severity: AlertSeverity!
    source: String!
    target: String!
    description: String!
    evidence: JSON!
    mitigated: Boolean!
    timestamp: Date!
    tenantId: String
  }

  type SecurityAuditLog implements Node & Timestamped {
    id: ID!
    userId: String
    tenantId: String!
    action: String!
    resource: String!
    outcome: String!
    ipAddress: String!
    userAgent: String!
    metadata: JSON!
    riskScore: Float!
    classification: String!
    timestamp: Date!
    createdAt: Date!
    updatedAt: Date!
  }

  # ==================== OBSERVABILITY TYPES ====================
  
  type ObservabilityDashboard {
    metrics: [MetricPoint!]!
    logs: [LogEntry!]!
    traces: [TraceSpan!]!
    alerts: [ObservabilityAlert!]!
    businessMetrics: [BusinessMetric!]
    predictions: [Prediction!]
  }

  type MetricPoint implements Timestamped {
    id: ID!
    name: String!
    value: Float!
    unit: String!
    tags: JSON!
    labels: JSON!
    source: String!
    tenantId: String
    timestamp: Date!
  }

  type LogEntry implements Timestamped {
    id: ID!
    level: LogLevel!
    message: String!
    service: String!
    source: String!
    tenantId: String
    userId: String
    traceId: String
    spanId: String
    metadata: JSON!
    structured: JSON!
    timestamp: Date!
  }

  type TraceSpan {
    id: ID!
    traceId: String!
    parentSpanId: String
    operation: String!
    service: String!
    startTime: Date!
    endTime: Date
    duration: Float
    status: TraceStatus!
    tags: JSON!
    logs: [LogEntry!]!
    metadata: JSON!
  }

  type ObservabilityAlert implements Node & Timestamped {
    id: ID!
    severity: AlertSeverity!
    status: AlertStatus!
    type: String!
    title: String!
    description: String!
    source: String!
    metric: String
    currentValue: Float
    threshold: Float
    tenantId: String
    assignee: String
    escalationLevel: Int!
    timestamp: Date!
    createdAt: Date!
    updatedAt: Date!
  }

  # ==================== AI TYPES ====================
  
  type AIModel implements Node {
    id: ID!
    name: String!
    type: ModelType!
    version: String!
    status: ModelStatus!
    accuracy: Float
    lastTrained: Date!
    performance: ModelPerformance!
    metadata: JSON!
    createdAt: Date!
    updatedAt: Date!
  }

  type ModelPerformance {
    inferenceTime: Float!
    accuracy: Float!
    precision: Float
    recall: Float
    f1Score: Float
  }

  type PredictionResult {
    prediction: JSON!
    confidence: Float!
    explanation: String
    alternatives: [Alternative!]
    modelUsed: String!
    processingTime: Float!
    timestamp: Date!
  }

  type Alternative {
    prediction: JSON!
    confidence: Float!
  }

  type AnalysisTask implements Node {
    id: ID!
    type: String!
    status: String!
    result: AnalysisResult
    error: String
    createdAt: Date!
    updatedAt: Date!
    completedAt: Date
    tenantId: String
  }

  type AnalysisResult {
    analysis: JSON!
    insights: [String!]!
    recommendations: [String!]!
    confidence: Float!
  }

  type AIInsight {
    type: String!
    insight: String!
    confidence: Float!
    recommendation: String!
  }

  # ==================== BUSINESS INTELLIGENCE TYPES ====================
  
  type BusinessMetric implements Node & Timestamped {
    id: ID!
    name: String!
    category: MetricCategory!
    value: Float!
    unit: String!
    dimensions: JSON!
    metadata: MetricMetadata!
    trends: MetricTrends!
    targets: MetricTargets
    tenantId: String
    timestamp: Date!
    createdAt: Date!
    updatedAt: Date!
  }

  type MetricMetadata {
    source: String!
    calculation: String!
    quality: String!
    confidence: Float!
  }

  type MetricTrends {
    hourly: Float!
    daily: Float!
    weekly: Float!
    monthly: Float!
  }

  type MetricTargets {
    current: Float!
    target: Float!
    threshold: Float!
  }

  type BusinessInsight implements Node & Timestamped {
    id: ID!
    type: InsightType!
    category: String!
    title: String!
    description: String!
    impact: InsightImpact!
    confidence: Float!
    evidence: [Evidence!]!
    recommendations: [InsightRecommendation!]!
    relatedMetrics: [String!]!
    status: String!
    tenantId: String
    timestamp: Date!
    createdAt: Date!
    updatedAt: Date!
    generatedAt: Date!
    expiresAt: Date!
  }

  type Evidence {
    type: String!
    data: JSON!
    weight: Float!
  }

  type InsightRecommendation {
    action: String!
    priority: Int!
    estimatedImpact: String!
    effort: String!
    timeline: String!
  }

  type PredictiveForecast implements Node {
    id: ID!
    metricId: String!
    horizon: Int!
    predictions: [ForecastPrediction!]!
    methodology: String!
    accuracy: Float!
    factors: [ImpactFactor!]!
    scenarios: [Scenario!]!
    generatedAt: Date!
    validUntil: Date!
    tenantId: String
    createdAt: Date!
    updatedAt: Date!
  }

  type ForecastPrediction implements Timestamped {
    timestamp: Date!
    predictedValue: Float!
    confidence: Float!
    upperBound: Float!
    lowerBound: Float!
  }

  type ImpactFactor {
    name: String!
    impact: Float!
    confidence: Float!
  }

  type Scenario {
    name: String!
    probability: Float!
    predictions: [ScenarioPrediction!]!
  }

  type ScenarioPrediction implements Timestamped {
    timestamp: Date!
    value: Float!
  }

  type BusinessDashboard {
    overview: DashboardOverview!
    analytics: BusinessAnalytics!
    forecasts: [PredictiveForecast!]!
    insights: [BusinessInsight!]!
    recommendations: [DashboardRecommendation!]!
    alerts: [DashboardAlert!]!
  }

  type DashboardOverview {
    kpis: [BusinessMetric!]!
    healthScore: Float!
    trendSummary: TrendSummary!
    criticalInsights: [BusinessInsight!]!
    forecastSummary: ForecastSummary!
  }

  type TrendSummary {
    positive: Int!
    negative: Int!
    neutral: Int!
  }

  type ForecastSummary {
    horizon: Int!
    confidence: Float!
    trendDirection: String!
    keyPredictions: [PredictiveForecast!]!
  }

  type BusinessAnalytics {
    revenueAnalysis: JSON!
    costAnalysis: JSON!
    efficiencyMetrics: JSON!
    riskAssessment: JSON!
    customerAnalysis: JSON!
    operationalMetrics: JSON!
  }

  type DashboardRecommendation {
    category: String!
    priority: Int!
    title: String!
    description: String!
    expectedROI: String!
    implementationTime: String!
    resources: [String!]!
  }

  type DashboardAlert implements Timestamped {
    severity: AlertSeverity!
    type: String!
    message: String!
    timestamp: Date!
    relatedInsight: String
  }

  type Prediction {
    type: String!
    confidence: Float!
    prediction: String!
    timeframe: String!
  }

  # ==================== INPUT TYPES ====================
  
  input MetricInput {
    name: String!
    category: MetricCategory!
    value: Float!
    unit: String!
    dimensions: JSON
    metadata: MetricMetadataInput!
    targets: MetricTargetsInput
  }

  input MetricMetadataInput {
    source: String!
    calculation: String!
    quality: String!
    confidence: Float!
  }

  input MetricTargetsInput {
    current: Float!
    target: Float!
    threshold: Float!
  }

  input PredictionInput {
    modelId: String!
    input: JSON!
    options: PredictionOptionsInput
  }

  input PredictionOptionsInput {
    confidence: Boolean
    explanation: Boolean
    alternatives: Int
    realtime: Boolean
  }

  input AnalysisInput {
    type: String!
    data: [JSON!]!
    parameters: JSON
  }

  input LogInput {
    level: LogLevel!
    message: String!
    service: String!
    metadata: JSON
  }

  input AlertInput {
    severity: AlertSeverity!
    type: String!
    title: String!
    description: String!
    source: String!
    metric: String
    currentValue: Float
    threshold: Float
  }

  input TraceInput {
    operation: String!
    service: String!
    tags: JSON
    metadata: JSON
  }

  input SecurityEventInput {
    action: String!
    resource: String!
    outcome: String!
    metadata: JSON
  }

  input OptimizationInput {
    target: String!
    categories: [String!]
    autoApply: Boolean
  }

  input ForecastInput {
    metricId: String!
    horizon: Int!
    includeScenarios: Boolean
    confidenceLevel: Float
  }

  input ExportInput {
    format: String!
    startDate: Date
    endDate: Date
    includeForecasts: Boolean
    includeInsights: Boolean
  }

  # ==================== QUERIES ====================
  
  type Query {
    # Performance Monitoring
    performanceMetrics(tenantId: String): PerformanceMetrics!
    performanceAlerts(
      tenantId: String
      severity: AlertSeverity
      limit: Int
    ): [PerformanceAlert!]!
    performanceRecommendations(
      tenantId: String
      category: String
    ): [OptimizationRecommendation!]!
    
    # Security
    securityStatus(tenantId: String): SecurityStatus!
    complianceReports(
      tenantId: String
      framework: ComplianceFramework
    ): [ComplianceReport!]!
    securityThreats(
      tenantId: String
      severity: AlertSeverity
      mitigated: Boolean
    ): [SecurityThreat!]!
    auditLogs(
      tenantId: String
      userId: String
      startDate: Date
      endDate: Date
      limit: Int
    ): [SecurityAuditLog!]!
    
    # Observability
    observabilityDashboard(tenantId: String): ObservabilityDashboard!
    metrics(
      tenantId: String
      name: String
      source: String
      limit: Int
    ): [MetricPoint!]!
    logs(
      tenantId: String
      level: LogLevel
      service: String
      limit: Int
    ): [LogEntry!]!
    traces(
      tenantId: String
      service: String
      status: TraceStatus
      limit: Int
    ): [TraceSpan!]!
    observabilityAlerts(
      tenantId: String
      status: AlertStatus
      severity: AlertSeverity
    ): [ObservabilityAlert!]!
    
    # AI & Machine Learning
    aiModels(
      type: ModelType
      status: ModelStatus
    ): [AIModel!]!
    aiModel(id: ID!): AIModel
    analysisTask(id: ID!): AnalysisTask
    aiInsights(tenantId: String): [AIInsight!]!
    
    # Business Intelligence
    businessDashboard(
      tenantId: String
      includeForecasts: Boolean = true
      includeInsights: Boolean = true
    ): BusinessDashboard!
    businessMetrics(
      tenantId: String
      category: MetricCategory
      limit: Int
    ): [BusinessMetric!]!
    businessMetric(id: ID!): BusinessMetric
    businessInsights(
      tenantId: String
      type: InsightType
      impact: InsightImpact
      status: String
    ): [BusinessInsight!]!
    businessInsight(id: ID!): BusinessInsight
    forecasts(
      tenantId: String
      metricId: String
      valid: Boolean = true
    ): [PredictiveForecast!]!
    forecast(id: ID!): PredictiveForecast
    
    # System Status
    systemHealth: SystemHealth!
    systemVersion: String!
  }

  # ==================== MUTATIONS ====================
  
  type Mutation {
    # Performance Optimization
    optimizePerformance(input: OptimizationInput!): OptimizationResult!
    clearCache(pattern: String): ClearCacheResult!
    warmupSystem(tenantId: String!): WarmupResult!
    
    # Security Operations
    rotateEncryptionKeys: RotateKeysResult!
    updateComplianceStatus(
      framework: ComplianceFramework!
      status: ComplianceStatus!
    ): ComplianceReport!
    acknowledgeSecurityThreat(id: ID!): SecurityThreat!
    recordSecurityEvent(input: SecurityEventInput!): SecurityAuditLog!
    
    # Observability
    collectMetric(input: MetricInput!): MetricPoint!
    createLog(input: LogInput!): LogEntry!
    createTrace(input: TraceInput!): TraceSpan!
    generateAlert(input: AlertInput!): ObservabilityAlert!
    acknowledgeAlert(id: ID!): ObservabilityAlert!
    resolveAlert(id: ID!): ObservabilityAlert!
    
    # AI Operations
    predict(input: PredictionInput!): PredictionResult!
    analyze(input: AnalysisInput!): AnalysisTask!
    trainModel(
      name: String!
      architecture: String!
      dataset: String
    ): AIModel!
    optimizeModels: ModelOptimizationResult!
    
    # Business Intelligence
    recordBusinessMetric(input: MetricInput!): BusinessMetric!
    generateForecast(input: ForecastInput!): PredictiveForecast!
    generateBusinessInsights(tenantId: String): [BusinessInsight!]!
    acknowledgeInsight(id: ID!): BusinessInsight!
    dismissInsight(id: ID!): BusinessInsight!
    exportBusinessData(input: ExportInput!): ExportResult!
    runBusinessSimulation(
      scenario: String!
      tenantId: String
    ): SimulationResult!
  }

  # ==================== SUBSCRIPTIONS ====================
  
  type Subscription {
    # Real-time Performance Monitoring
    performanceMetricsUpdated(tenantId: String): PerformanceMetrics!
    performanceAlertTriggered(
      tenantId: String
      severity: AlertSeverity
    ): PerformanceAlert!
    
    # Security Events
    securityThreatDetected(tenantId: String): SecurityThreat!
    complianceStatusChanged(
      tenantId: String
      framework: ComplianceFramework
    ): ComplianceReport!
    auditLogCreated(tenantId: String): SecurityAuditLog!
    
    # Observability Streams
    metricCollected(
      tenantId: String
      name: String
    ): MetricPoint!
    logCreated(
      tenantId: String
      level: LogLevel
      service: String
    ): LogEntry!
    traceCompleted(
      tenantId: String
      service: String
    ): TraceSpan!
    alertTriggered(
      tenantId: String
      severity: AlertSeverity
    ): ObservabilityAlert!
    
    # AI Events
    predictionCompleted(modelId: String): PredictionResult!
    analysisCompleted(taskId: String): AnalysisTask!
    modelTrainingProgress(modelId: String): ModelTrainingUpdate!
    aiInsightGenerated(tenantId: String): AIInsight!
    
    # Business Intelligence Updates
    businessMetricRecorded(
      tenantId: String
      category: MetricCategory
    ): BusinessMetric!
    forecastGenerated(
      tenantId: String
      metricId: String
    ): PredictiveForecast!
    businessInsightGenerated(
      tenantId: String
      type: InsightType
    ): BusinessInsight!
    businessAlertTriggered(
      tenantId: String
      severity: AlertSeverity
    ): DashboardAlert!
  }

  # ==================== RESULT TYPES ====================
  
  type OptimizationResult {
    success: Boolean!
    optimizationsApplied: Int!
    improvements: [OptimizationImprovement!]!
    message: String!
  }

  type OptimizationImprovement {
    category: String!
    action: String!
    impact: String!
    impactScore: Float!
  }

  type ClearCacheResult {
    success: Boolean!
    entriesCleared: Int!
    memoryFreed: Float!
  }

  type WarmupResult {
    success: Boolean!
    componentsWarmed: [String!]!
    timeElapsed: Float!
  }

  type RotateKeysResult {
    success: Boolean!
    keysRotated: Int!
    nextRotation: Date!
  }

  type ModelOptimizationResult {
    success: Boolean!
    modelsOptimized: Int!
    averageImprovement: Float!
    details: [ModelOptimizationDetail!]!
  }

  type ModelOptimizationDetail {
    modelId: String!
    optimization: String!
    improvement: String!
    impactScore: Float!
  }

  type ExportResult {
    success: Boolean!
    format: String!
    size: Int!
    url: String!
    generatedAt: Date!
  }

  type SimulationResult {
    success: Boolean!
    scenario: String!
    metricsGenerated: Int!
    forecastsGenerated: Int!
    insightsGenerated: Int!
    message: String!
  }

  type ModelTrainingUpdate {
    modelId: String!
    epoch: Int!
    totalEpochs: Int!
    metrics: TrainingMetrics!
  }

  type TrainingMetrics {
    accuracy: Float!
    loss: Float!
    validationAccuracy: Float!
    validationLoss: Float!
  }
`
