/**
 * CoreFlow360 - API Key Management Types
 * TypeScript definitions for secure API key management
 */

export interface APIKey {
  id: string
  service: string
  name: string
  description?: string
  keyPreview: string // First 8 and last 4 characters
  status: APIKeyStatus
  lastUsed?: Date
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
  rotationDays: number
  usage: APIKeyUsage
  securityScore: SecurityScore
  vendor: APIKeyVendor
}

export type APIKeyStatus = 
  | 'ACTIVE'
  | 'INACTIVE' 
  | 'EXPIRED'
  | 'ROTATION_REQUIRED'
  | 'COMPROMISED'
  | 'PENDING_VALIDATION'

export interface APIKeyVendor {
  id: string
  name: string
  logoUrl?: string
  category: VendorCategory
  documentationUrl?: string
  supportedKeyFormats: string[]
  requiredPermissions: string[]
}

export type VendorCategory = 
  | 'AI_ML'
  | 'PAYMENT'
  | 'COMMUNICATION'
  | 'ANALYTICS'
  | 'STORAGE'
  | 'SECURITY'
  | 'INTEGRATION'
  | 'OTHER'

export interface APIKeyUsage {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  lastRequestAt?: Date
  rateLimit?: {
    limit: number
    remaining: number
    resetAt: Date
  }
  costTracking?: {
    totalCost: number
    currency: string
    billingPeriod: string
  }
}

export interface SecurityScore {
  score: number // 0-100
  level: SecurityLevel
  factors: SecurityFactor[]
  lastAssessment: Date
  recommendations: string[]
}

export type SecurityLevel = 'CRITICAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'EXCELLENT'

export interface SecurityFactor {
  type: SecurityFactorType
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  weight: number
  description: string
}

export type SecurityFactorType = 
  | 'KEY_AGE'
  | 'ROTATION_FREQUENCY'
  | 'USAGE_PATTERNS'
  | 'ERROR_RATE'
  | 'LAST_ROTATION'
  | 'PERMISSIONS_SCOPE'
  | 'ENCRYPTION_STRENGTH'
  | 'ACCESS_FREQUENCY'

export interface CreateAPIKeyRequest {
  service: string
  name: string
  description?: string
  key: string
  rotationDays?: number
  expiresAt?: Date
  vendorId: string
}

export interface UpdateAPIKeyRequest {
  name?: string
  description?: string
  key?: string
  rotationDays?: number
  expiresAt?: Date
  status?: APIKeyStatus
}

export interface RotateAPIKeyRequest {
  newKey: string
  reason?: string
  scheduleRotation?: boolean
  rotationDate?: Date
}

export interface APIKeyValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: string[]
}

export interface ValidationError {
  field: string
  code: string
  message: string
  severity: 'ERROR' | 'WARNING'
}

export interface ValidationWarning {
  field: string
  code: string
  message: string
  recommendation: string
}

export interface APIKeyAuditEvent {
  id: string
  keyId: string
  action: AuditAction
  userId: string
  timestamp: Date
  metadata: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export type AuditAction = 
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'ROTATED'
  | 'ACTIVATED'
  | 'DEACTIVATED'
  | 'USED'
  | 'FAILED_REQUEST'
  | 'COMPROMISED'
  | 'VALIDATED'

export interface AISecurityAssessment {
  keyId: string
  assessment: {
    riskLevel: SecurityLevel
    confidence: number
    anomalies: SecurityAnomaly[]
    recommendations: AIRecommendation[]
    predictedIssues: PredictedIssue[]
  }
  analyzedAt: Date
  modelVersion: string
}

export interface SecurityAnomaly {
  type: AnomalyType
  severity: SecurityLevel
  description: string
  detectedAt: Date
  pattern: string
  confidence: number
}

export type AnomalyType = 
  | 'UNUSUAL_USAGE_PATTERN'
  | 'GEOGRAPHIC_ANOMALY'
  | 'RATE_LIMIT_BREACH'
  | 'ERROR_SPIKE'
  | 'DORMANT_KEY_ACTIVITY'
  | 'PRIVILEGE_ESCALATION'

export interface AIRecommendation {
  type: RecommendationType
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  actionRequired: boolean
  estimatedImpact: string
  implementationGuide?: string
}

export type RecommendationType = 
  | 'ROTATE_KEY'
  | 'REDUCE_PERMISSIONS'
  | 'INCREASE_MONITORING'
  | 'UPDATE_ROTATION_POLICY'
  | 'REVIEW_ACCESS_PATTERNS'
  | 'IMPLEMENT_RATE_LIMITING'

export interface PredictedIssue {
  type: PredictedIssueType
  probability: number
  timeframe: string
  impact: SecurityLevel
  description: string
  preventionSteps: string[]
}

export type PredictedIssueType = 
  | 'KEY_COMPROMISE'
  | 'SERVICE_DEGRADATION'
  | 'RATE_LIMIT_HIT'
  | 'COST_OVERRUN'
  | 'ROTATION_FAILURE'

export interface APIKeyMetrics {
  total: number
  byStatus: Record<APIKeyStatus, number>
  byVendor: Record<string, number>
  securityDistribution: Record<SecurityLevel, number>
  rotationHealth: {
    onSchedule: number
    overdue: number
    critical: number
  }
  usageMetrics: {
    activeKeys: number
    totalRequests: number
    errorRate: number
    avgSecurityScore: number
  }
}

export interface APIKeyFilter {
  status?: APIKeyStatus[]
  vendor?: string[]
  securityLevel?: SecurityLevel[]
  lastUsedSince?: Date
  expiringBefore?: Date
  searchTerm?: string
  sortBy?: APIKeySortField
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export type APIKeySortField = 
  | 'name'
  | 'service'
  | 'status'
  | 'lastUsed'
  | 'createdAt'
  | 'updatedAt'
  | 'securityScore'
  | 'expiresAt'

export interface APIKeyBulkOperation {
  operation: BulkOperationType
  keyIds: string[]
  parameters?: Record<string, any>
}

export type BulkOperationType = 
  | 'ROTATE'
  | 'DEACTIVATE'
  | 'DELETE'
  | 'UPDATE_ROTATION_POLICY'
  | 'REFRESH_SECURITY_SCORE'

export interface APIKeyExportOptions {
  format: 'JSON' | 'CSV' | 'YAML'
  includeKeys: boolean
  includeMetrics: boolean
  includeAuditLog: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  filter?: APIKeyFilter
}

// Response types for API endpoints
export interface APIKeyListResponse {
  keys: APIKey[]
  total: number
  pagination: {
    page: number
    limit: number
    totalPages: number
  }
  metrics: APIKeyMetrics
}

export interface APIKeyResponse {
  key: APIKey
  auditLog: APIKeyAuditEvent[]
  securityAssessment?: AISecurityAssessment
}

export interface APIKeyOperationResponse {
  success: boolean
  message: string
  data?: any
  errors?: ValidationError[]
  warnings?: ValidationWarning[]
}

// Error types
export class APIKeyError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'APIKeyError'
  }
}

export class APIKeyValidationError extends APIKeyError {
  constructor(
    message: string,
    public validationErrors: ValidationError[]
  ) {
    super(message, 'VALIDATION_ERROR', 400, { validationErrors })
    this.name = 'APIKeyValidationError'
  }
}

export class APIKeyNotFoundError extends APIKeyError {
  constructor(keyId: string) {
    super(`API key not found: ${keyId}`, 'NOT_FOUND', 404)
    this.name = 'APIKeyNotFoundError'
  }
}

export class APIKeyPermissionError extends APIKeyError {
  constructor(action: string) {
    super(`Insufficient permissions for action: ${action}`, 'FORBIDDEN', 403)
    this.name = 'APIKeyPermissionError'
  }
}