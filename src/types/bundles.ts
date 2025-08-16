/**
 * CoreFlow360 - Bundle Architecture Types
 * Mathematical perfection for AI-first multi-industry ERP bundles
 * FORTRESS-LEVEL SECURITY: Zero-trust bundle isolation
 * HYPERSCALE PERFORMANCE: Sub-100ms bundle operations
 */

import { z } from 'zod'

// ============================================================================
// CORE BUNDLE INTERFACES
// ============================================================================

export interface SecurityContext {
  tenantId: string
  userId: string
  roles: string[]
  permissions: string[]
  sessionId: string
  ipAddress: string
  bundleAccess: string[]
  rateLimit: {
    remaining: number
    resetTime: number
  }
}

export interface PerformanceBudgets {
  API_RESPONSE_TIME: number // milliseconds, 99th percentile
  CACHE_HIT_RATIO: number   // 0-1, minimum acceptable
  MEMORY_USAGE: number      // MB, maximum per operation  
  CPU_USAGE: number         // %, maximum per operation
  NETWORK_LATENCY: number   // milliseconds for external calls
  DATABASE_QUERIES: number  // maximum per request
}

export const DEFAULT_PERFORMANCE_BUDGETS: PerformanceBudgets = {
  API_RESPONSE_TIME: 100,
  CACHE_HIT_RATIO: 0.99,
  MEMORY_USAGE: 256,
  CPU_USAGE: 80,
  NETWORK_LATENCY: 50,
  DATABASE_QUERIES: 5
} as const

// ============================================================================
// AI CAPABILITIES & MODELS
// ============================================================================

export interface AICapability {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly model: 'fingpt' | 'finrobot' | 'langchain' | 'custom'
  readonly category: 'sentiment' | 'forecasting' | 'analysis' | 'automation' | 'optimization'
  readonly confidence: number // 0-1, minimum confidence threshold
  readonly crossDeptImpact: boolean
  readonly requiredPermissions: string[]
  readonly performanceBudget: Partial<PerformanceBudgets>
  readonly fallbackStrategy: 'basic_llm' | 'cached_result' | 'user_prompt' | 'skip'
}

export interface AIModelGovernance {
  readonly modelId: string
  readonly version: string
  readonly accuracy: number // >0.95 required
  readonly precision: number // >0.95 required  
  readonly recall: number // >0.95 required
  readonly f1Score: number // >0.95 required
  readonly hallucinationRate: number // <0.01 required
  readonly biasScore: number // <0.05 required
  readonly lastValidated: Date
  readonly complianceStatus: 'approved' | 'under_review' | 'deprecated'
  readonly trainingData: {
    sources: string[]
    lastUpdated: Date
    recordCount: number
  }
}

// ============================================================================
// EXTERNAL SERVICE DEFINITIONS
// ============================================================================

export interface ExternalServiceConfig {
  readonly service: 'python-docker' | 'node-express' | 'python-rest' | 'php-proxy' | 'microservice'
  readonly dockerImage?: string
  readonly baseUrl?: string
  readonly apiEndpoints: readonly string[]
  readonly authentication: {
    type: 'api_key' | 'oauth2' | 'jwt' | 'mutual_tls'
    config: Record<string, string>
  }
  readonly rateLimit: {
    requestsPerSecond: number
    burstSize: number
  }
  readonly healthCheck: {
    endpoint: string
    intervalSeconds: number
    timeoutMs: number
  }
  readonly encryption: {
    algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305'
    keyRotationDays: number
  }
}

// ============================================================================
// BUNDLE DEFINITIONS
// ============================================================================

export interface BundleDefinition {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly version: string
  readonly category: 'finance' | 'hr' | 'legal' | 'manufacturing' | 'erp' | 'ai_enhancement'
  readonly tier: 'free' | 'basic' | 'professional' | 'enterprise'
  readonly pricing: {
    basePrice: number // monthly USD
    perUserPrice: number // monthly USD per user
    minimumUsers: number
    maximumUsers?: number
    setupFee?: number
    annualDiscount: number // percentage
  }
  readonly aiCapabilities: readonly AICapability[]
  readonly dependencies: readonly string[] // other bundle IDs required
  readonly conflicts: readonly string[] // mutually exclusive bundle IDs
  readonly enabledFeatures: readonly string[]
  readonly requiredPermissions: readonly string[]
  readonly external?: ExternalServiceConfig
  readonly compliance: {
    standards: readonly string[] // e.g., ['SOC2', 'GDPR', 'HIPAA']
    certifications: readonly string[]
    dataRetention: number // days
    dataLocation: readonly string[] // allowed regions
  }
  readonly metadata: {
    createdAt: Date
    updatedAt: Date
    maintainer: string
    supportLevel: 'community' | 'standard' | 'premium'
    documentation: string
    changelog: string
  }
}

// ============================================================================
// PREDEFINED BUNDLE CONFIGURATIONS
// ============================================================================

export const AI_CAPABILITIES: Record<string, AICapability> = {
  FINGPT_SENTIMENT: {
    id: 'fingpt_sentiment',
    name: 'Financial Sentiment Analysis',
    description: 'RLHF-tuned sentiment analysis for financial documents and communications',
    model: 'fingpt',
    category: 'sentiment',
    confidence: 0.95,
    crossDeptImpact: true,
    requiredPermissions: ['financeAI:sentiment', 'accounting:read'],
    performanceBudget: { API_RESPONSE_TIME: 200, NETWORK_LATENCY: 100 },
    fallbackStrategy: 'basic_llm'
  },
  FINGPT_ANOMALY: {
    id: 'fingpt_anomaly',
    name: 'Financial Anomaly Detection',
    description: 'Advanced anomaly detection in financial transactions and patterns',
    model: 'fingpt',
    category: 'analysis',
    confidence: 0.93,
    crossDeptImpact: false,
    requiredPermissions: ['financeAI:anomaly', 'accounting:read'],
    performanceBudget: { API_RESPONSE_TIME: 500, DATABASE_QUERIES: 10 },
    fallbackStrategy: 'cached_result'
  },
  FINROBOT_FORECAST: {
    id: 'finrobot_forecast',
    name: 'Autonomous Financial Forecasting',
    description: 'AI agent-driven financial forecasting with chain-of-thought reasoning',
    model: 'finrobot',
    category: 'forecasting',
    confidence: 0.91,
    crossDeptImpact: true,
    requiredPermissions: ['financeAI:forecast', 'accounting:read', 'crm:read'],
    performanceBudget: { API_RESPONSE_TIME: 1000, MEMORY_USAGE: 512 },
    fallbackStrategy: 'basic_llm'
  },
  FINROBOT_STRATEGY: {
    id: 'finrobot_strategy',
    name: 'Strategic Financial Planning',
    description: 'Multi-agent strategic analysis with cross-departmental impact assessment',
    model: 'finrobot',
    category: 'analysis',
    confidence: 0.89,
    crossDeptImpact: true,
    requiredPermissions: ['financeAI:strategy', 'admin:read'],
    performanceBudget: { API_RESPONSE_TIME: 2000, CPU_USAGE: 90 },
    fallbackStrategy: 'user_prompt'
  },
  IDURAR_INVOICING: {
    id: 'idurar_invoicing',
    name: 'Advanced Invoicing System',
    description: 'Multi-currency invoicing with dynamic reporting capabilities',
    model: 'custom',
    category: 'automation',
    confidence: 0.99,
    crossDeptImpact: false,
    requiredPermissions: ['invoicing:manage'],
    performanceBudget: { API_RESPONSE_TIME: 150 },
    fallbackStrategy: 'cached_result'
  },
  ERPNEXT_PAYROLL: {
    id: 'erpnext_payroll',
    name: 'Compliance-First Payroll',
    description: 'Multi-jurisdiction payroll processing with tax compliance',
    model: 'custom',
    category: 'automation',
    confidence: 0.98,
    crossDeptImpact: true,
    requiredPermissions: ['hr:payroll', 'compliance:manage'],
    performanceBudget: { API_RESPONSE_TIME: 300 },
    fallbackStrategy: 'user_prompt'
  },
  ERPNEXT_BOM: {
    id: 'erpnext_bom',
    name: 'Bill of Materials Optimization',
    description: 'AI-enhanced BOM management with cost optimization',
    model: 'custom',
    category: 'optimization',
    confidence: 0.94,
    crossDeptImpact: true,
    requiredPermissions: ['manufacturing:bom', 'inventory:read'],
    performanceBudget: { API_RESPONSE_TIME: 400 },
    fallbackStrategy: 'basic_llm'
  },
  DOLIBARR_LEGAL: {
    id: 'dolibarr_legal',
    name: 'Legal Case Management',
    description: 'Comprehensive legal case tracking with conflict checking',
    model: 'custom',
    category: 'automation',
    confidence: 0.97,
    crossDeptImpact: false,
    requiredPermissions: ['legal:cases', 'documents:manage'],
    performanceBudget: { API_RESPONSE_TIME: 250 },
    fallbackStrategy: 'cached_result'
  },
  DOLIBARR_TIME: {
    id: 'dolibarr_time',
    name: 'Professional Time Tracking',
    description: 'Billable time tracking with AI-powered categorization',
    model: 'custom',
    category: 'automation',
    confidence: 0.92,
    crossDeptImpact: true,
    requiredPermissions: ['time:track', 'billing:manage'],
    performanceBudget: { API_RESPONSE_TIME: 100 },
    fallbackStrategy: 'basic_llm'
  }
} as const

export const BUNDLES: readonly BundleDefinition[] = [
  // FinGPT Bundle
  {
    id: 'finance_ai_fingpt',
    name: 'AI Finance Intelligence (FinGPT)',
    description: 'Advanced financial AI with sentiment analysis and anomaly detection',
    version: '1.0.0',
    category: 'ai_enhancement',
    tier: 'professional',
    pricing: {
      basePrice: 0,
      perUserPrice: 15,
      minimumUsers: 1,
      maximumUsers: undefined,
      setupFee: 50,
      annualDiscount: 15
    },
    aiCapabilities: [AI_CAPABILITIES.FINGPT_SENTIMENT, AI_CAPABILITIES.FINGPT_ANOMALY],
    dependencies: [],
    conflicts: [],
    enabledFeatures: [
      'financial_sentiment_analysis',
      'anomaly_detection',
      'risk_scoring',
      'document_analysis'
    ],
    requiredPermissions: ['financeAI:access', 'accounting:read'],
    external: {
      service: 'python-docker',
      dockerImage: 'fingpt:latest',
      baseUrl: 'http://fingpt-service:8000',
      apiEndpoints: ['/sentiment', '/anomaly', '/forecast', '/health'],
      authentication: {
        type: 'api_key',
        config: { headerName: 'X-API-Key' }
      },
      rateLimit: {
        requestsPerSecond: 100,
        burstSize: 200
      },
      healthCheck: {
        endpoint: '/health',
        intervalSeconds: 30,
        timeoutMs: 5000
      },
      encryption: {
        algorithm: 'AES-256-GCM',
        keyRotationDays: 30
      }
    },
    compliance: {
      standards: ['SOC2', 'GDPR'],
      certifications: ['ISO27001'],
      dataRetention: 2555, // 7 years
      dataLocation: ['US', 'EU']
    },
    metadata: {
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      maintainer: 'AI4Finance-Foundation',
      supportLevel: 'premium',
      documentation: 'https://docs.coreflow360.com/bundles/fingpt',
      changelog: 'https://github.com/AI4Finance-Foundation/FinGPT/releases'
    }
  },

  // FinRobot Bundle  
  {
    id: 'finance_ai_finrobot',
    name: 'AI Finance Agents (FinRobot)',
    description: 'Autonomous financial agents with multi-modal analysis and strategic planning',
    version: '1.0.0',
    category: 'ai_enhancement',
    tier: 'enterprise',
    pricing: {
      basePrice: 25,
      perUserPrice: 20,
      minimumUsers: 2,
      maximumUsers: undefined,
      setupFee: 100,
      annualDiscount: 20
    },
    aiCapabilities: [AI_CAPABILITIES.FINROBOT_FORECAST, AI_CAPABILITIES.FINROBOT_STRATEGY],
    dependencies: ['finance_ai_fingpt'],
    conflicts: [],
    enabledFeatures: [
      'autonomous_forecasting',
      'strategic_planning',
      'multi_agent_analysis',
      'cross_dept_impact'
    ],
    requiredPermissions: ['financeAI:agents', 'accounting:read', 'crm:read'],
    external: {
      service: 'python-docker',
      dockerImage: 'finrobot:latest',
      baseUrl: 'http://finrobot-service:8001',
      apiEndpoints: ['/forecast', '/strategy', '/analyze', '/agents', '/health'],
      authentication: {
        type: 'jwt',
        config: { algorithm: 'RS256', issuer: 'coreflow360.com' }
      },
      rateLimit: {
        requestsPerSecond: 50,
        burstSize: 100
      },
      healthCheck: {
        endpoint: '/health',
        intervalSeconds: 60,
        timeoutMs: 10000
      },
      encryption: {
        algorithm: 'ChaCha20-Poly1305',
        keyRotationDays: 30
      }
    },
    compliance: {
      standards: ['SOC2', 'GDPR', 'CCPA'],
      certifications: ['ISO27001', 'FedRAMP'],
      dataRetention: 2555,
      dataLocation: ['US', 'EU', 'APAC']
    },
    metadata: {
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      maintainer: 'AI4Finance-Foundation',
      supportLevel: 'premium',
      documentation: 'https://docs.coreflow360.com/bundles/finrobot',
      changelog: 'https://github.com/AI4Finance-Foundation/FinRobot/releases'
    }
  },

  // IDURAR Bundle
  {
    id: 'erp_advanced_idurar',
    name: 'Advanced ERP Suite (IDURAR)',
    description: 'MERN-based ERP with advanced invoicing and dynamic dashboards',
    version: '1.0.0',
    category: 'erp',
    tier: 'professional',
    pricing: {
      basePrice: 15,
      perUserPrice: 10,
      minimumUsers: 1,
      maximumUsers: 500,
      setupFee: 25,
      annualDiscount: 12
    },
    aiCapabilities: [AI_CAPABILITIES.IDURAR_INVOICING],
    dependencies: [],
    conflicts: [],
    enabledFeatures: [
      'advanced_invoicing',
      'multi_currency',
      'dynamic_reports',
      'quote_management',
      'dashboard_customization'
    ],
    requiredPermissions: ['invoicing:manage', 'reports:view'],
    external: {
      service: 'node-express',
      baseUrl: 'http://idurar-service:3001',
      apiEndpoints: ['/invoices', '/quotes', '/reports', '/dashboards', '/currencies', '/health'],
      authentication: {
        type: 'oauth2',
        config: { grantType: 'client_credentials', scope: 'erp:full' }
      },
      rateLimit: {
        requestsPerSecond: 200,
        burstSize: 500
      },
      healthCheck: {
        endpoint: '/health',
        intervalSeconds: 30,
        timeoutMs: 3000
      },
      encryption: {
        algorithm: 'AES-256-GCM',
        keyRotationDays: 30
      }
    },
    compliance: {
      standards: ['SOC2'],
      certifications: [],
      dataRetention: 2555,
      dataLocation: ['US', 'EU']
    },
    metadata: {
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      maintainer: 'IDURAR',
      supportLevel: 'standard',
      documentation: 'https://docs.coreflow360.com/bundles/idurar',
      changelog: 'https://github.com/idurar/idurar-erp-crm/releases'
    }
  },

  // ERPNext HR & Manufacturing Bundle
  {
    id: 'erpnext_hr_manufacturing',
    name: 'Enterprise HR & Manufacturing (ERPNext)',
    description: 'Advanced payroll compliance and BOM optimization from ERPNext',
    version: '1.0.0',
    category: 'hr',
    tier: 'enterprise',
    pricing: {
      basePrice: 30,
      perUserPrice: 18,
      minimumUsers: 5,
      maximumUsers: undefined,
      setupFee: 200,
      annualDiscount: 18
    },
    aiCapabilities: [AI_CAPABILITIES.ERPNEXT_PAYROLL, AI_CAPABILITIES.ERPNEXT_BOM],
    dependencies: [],
    conflicts: [],
    enabledFeatures: [
      'advanced_payroll',
      'tax_compliance',
      'bom_optimization',
      'manufacturing_workflows',
      'skill_gap_analysis',
      'route_optimization'
    ],
    requiredPermissions: ['hr:payroll', 'manufacturing:bom', 'compliance:manage'],
    external: {
      service: 'python-rest',
      baseUrl: 'http://erpnext-service:8002',
      apiEndpoints: ['/hr/payroll', '/hr/employees', '/manufacturing/bom', '/manufacturing/workorders', '/health'],
      authentication: {
        type: 'api_key',
        config: { headerName: 'Authorization', prefix: 'token ' }
      },
      rateLimit: {
        requestsPerSecond: 150,
        burstSize: 300
      },
      healthCheck: {
        endpoint: '/health',
        intervalSeconds: 45,
        timeoutMs: 8000
      },
      encryption: {
        algorithm: 'AES-256-GCM',
        keyRotationDays: 30
      }
    },
    compliance: {
      standards: ['SOC2', 'GDPR', 'CCPA'],
      certifications: ['ISO27001'],
      dataRetention: 2555,
      dataLocation: ['US', 'EU', 'IN']
    },
    metadata: {
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      maintainer: 'Frappe Technologies',
      supportLevel: 'premium',
      documentation: 'https://docs.coreflow360.com/bundles/erpnext',
      changelog: 'https://github.com/frappe/erpnext/releases'
    }
  },

  // Dolibarr Legal Bundle
  {
    id: 'legal_professional_dolibarr',
    name: 'Professional Legal Suite (Dolibarr)',
    description: 'Comprehensive legal case management with time tracking and conflict checking',
    version: '1.0.0',
    category: 'legal',
    tier: 'professional',
    pricing: {
      basePrice: 20,
      perUserPrice: 12,
      minimumUsers: 1,
      maximumUsers: 200,
      setupFee: 75,
      annualDiscount: 15
    },
    aiCapabilities: [AI_CAPABILITIES.DOLIBARR_LEGAL, AI_CAPABILITIES.DOLIBARR_TIME],
    dependencies: [],
    conflicts: [],
    enabledFeatures: [
      'case_management',
      'conflict_checking',
      'time_tracking',
      'trust_accounting',
      'document_management',
      'billing_integration'
    ],
    requiredPermissions: ['legal:cases', 'time:track', 'documents:manage', 'billing:manage'],
    external: {
      service: 'php-proxy',
      baseUrl: 'http://dolibarr-service:8003',
      apiEndpoints: ['/cases', '/time-tracking', '/conflicts', '/documents', '/billing', '/health'],
      authentication: {
        type: 'api_key',
        config: { headerName: 'DOLAPIKEY' }
      },
      rateLimit: {
        requestsPerSecond: 100,
        burstSize: 200
      },
      healthCheck: {
        endpoint: '/health',
        intervalSeconds: 30,
        timeoutMs: 5000
      },
      encryption: {
        algorithm: 'AES-256-GCM',
        keyRotationDays: 30
      }
    },
    compliance: {
      standards: ['SOC2', 'GDPR'],
      certifications: [],
      dataRetention: 3650, // 10 years for legal
      dataLocation: ['US', 'EU']
    },
    metadata: {
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      maintainer: 'Dolibarr Foundation',
      supportLevel: 'standard',
      documentation: 'https://docs.coreflow360.com/bundles/dolibarr',
      changelog: 'https://github.com/Dolibarr/dolibarr/releases'
    }
  }
] as const

// ============================================================================
// BUNDLE VALIDATION & UTILITIES
// ============================================================================

export const BundleDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(10),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  category: z.enum(['finance', 'hr', 'legal', 'manufacturing', 'erp', 'ai_enhancement']),
  tier: z.enum(['free', 'basic', 'professional', 'enterprise']),
  pricing: z.object({
    basePrice: z.number().min(0),
    perUserPrice: z.number().min(0),
    minimumUsers: z.number().int().min(1),
    maximumUsers: z.number().int().positive().optional(),
    setupFee: z.number().min(0).optional(),
    annualDiscount: z.number().min(0).max(50)
  }),
  aiCapabilities: z.array(z.any()),
  dependencies: z.array(z.string()),
  conflicts: z.array(z.string()),
  enabledFeatures: z.array(z.string()),
  requiredPermissions: z.array(z.string())
})

export type ValidatedBundleDefinition = z.infer<typeof BundleDefinitionSchema>

export function validateBundle(bundle: BundleDefinition): bundle is ValidatedBundleDefinition {
  try {
    BundleDefinitionSchema.parse(bundle)
    return true
  } catch (error) {
    console.error(`Bundle validation failed for ${bundle.id}:`, error)
    return false
  }
}

export function getBundleById(bundleId: string): BundleDefinition | undefined {
  return BUNDLES.find(bundle => bundle.id === bundleId)
}

export function getBundlesByCategory(category: BundleDefinition['category']): readonly BundleDefinition[] {
  return BUNDLES.filter(bundle => bundle.category === category)
}

export function getBundleDependencies(bundleId: string): readonly BundleDefinition[] {
  const bundle = getBundleById(bundleId)
  if (!bundle) return []
  
  return bundle.dependencies
    .map(depId => getBundleById(depId))
    .filter((dep): dep is BundleDefinition => dep !== undefined)
}

export function validateBundleCompatibility(bundleIds: string[]): {
  valid: boolean
  conflicts: string[]
  missingDependencies: string[]
} {
  const conflicts: string[] = []
  const missingDependencies: string[] = []
  const bundleSet = new Set(bundleIds)
  
  for (const bundleId of bundleIds) {
    const bundle = getBundleById(bundleId)
    if (!bundle) continue
    
    // Check conflicts
    for (const conflictId of bundle.conflicts) {
      if (bundleSet.has(conflictId)) {
        conflicts.push(`${bundleId} conflicts with ${conflictId}`)
      }
    }
    
    // Check dependencies
    for (const depId of bundle.dependencies) {
      if (!bundleSet.has(depId)) {
        missingDependencies.push(`${bundleId} requires ${depId}`)
      }
    }
  }
  
  return {
    valid: conflicts.length === 0 && missingDependencies.length === 0,
    conflicts,
    missingDependencies
  }
}

// ============================================================================
// TYPE GUARDS & RUNTIME VALIDATION
// ============================================================================

export function isSecurityContext(obj: any): obj is SecurityContext {
  return obj &&
    typeof obj.tenantId === 'string' &&
    typeof obj.userId === 'string' &&
    Array.isArray(obj.roles) &&
    Array.isArray(obj.permissions) &&
    Array.isArray(obj.bundleAccess)
}

export function isPerformanceBudgets(obj: any): obj is PerformanceBudgets {
  return obj &&
    typeof obj.API_RESPONSE_TIME === 'number' &&
    typeof obj.CACHE_HIT_RATIO === 'number' &&
    typeof obj.MEMORY_USAGE === 'number' &&
    typeof obj.CPU_USAGE === 'number' &&
    typeof obj.NETWORK_LATENCY === 'number' &&
    typeof obj.DATABASE_QUERIES === 'number'
}

// ============================================================================
// EXPORT VALIDATION
// ============================================================================

// Validate all bundles at compile time
const BUNDLE_VALIDATION_RESULTS = BUNDLES.map(bundle => ({
  id: bundle.id,
  valid: validateBundle(bundle)
}))

const INVALID_BUNDLES = BUNDLE_VALIDATION_RESULTS.filter(result => !result.valid)

if (INVALID_BUNDLES.length > 0) {
  throw new Error(
    `Bundle validation failed for: ${INVALID_BUNDLES.map(b => b.id).join(', ')}`
  )
}

export { BUNDLE_VALIDATION_RESULTS }

// Compile-time bundle ID validation
export type BundleId = typeof BUNDLES[number]['id']
export type BundleCategory = typeof BUNDLES[number]['category']
export type BundleTier = typeof BUNDLES[number]['tier']