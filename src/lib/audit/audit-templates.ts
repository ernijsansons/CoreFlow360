/**
 * CoreFlow360 - AI-Powered Audit Templates
 * Comprehensive audit templates with chain-of-thought reasoning
 */

export interface AuditTemplate {
  id: string
  name: string
  category: string
  description: string
  objectives: string[]
  analysis_targets: string[]
  evaluation_criteria: EvaluationCriteria[]
  chain_of_thought_prompts: string[]
  risk_factors: RiskFactor[]
  success_metrics: string[]
  estimated_duration: number
  complexity: 'low' | 'medium' | 'high'
  dependencies: string[]
}

export interface EvaluationCriteria {
  criterion: string
  weight: number
  measurement_method: string
  acceptable_threshold: string
  critical_threshold: string
}

export interface RiskFactor {
  factor: string
  probability: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high' | 'critical'
  mitigation: string
}

export const AUDIT_TEMPLATES: Record<string, AuditTemplate> = {
  
  // === SECURITY AUDITS ===
  
  authentication_audit: {
    id: 'auth_001',
    name: 'Authentication & Authorization Security Audit',
    category: 'security',
    description: 'Comprehensive audit of authentication mechanisms, session management, and authorization controls',
    objectives: [
      'Verify secure authentication implementation',
      'Assess session management security',
      'Validate authorization controls',
      'Check for common auth vulnerabilities'
    ],
    analysis_targets: [
      'Authentication providers configuration',
      'Session storage and management',
      'JWT token handling',
      'Password policies and hashing',
      'Multi-factor authentication setup',
      'OAuth/SSO integrations',
      'API authentication mechanisms',
      'Role-based access controls'
    ],
    evaluation_criteria: [
      {
        criterion: 'Password Security',
        weight: 0.25,
        measurement_method: 'Static analysis of password hashing and policies',
        acceptable_threshold: 'bcrypt/argon2 with salt, min 12 chars',
        critical_threshold: 'Plain text or weak hashing detected'
      },
      {
        criterion: 'Session Security',
        weight: 0.30,
        measurement_method: 'Configuration analysis of session storage',
        acceptable_threshold: 'Secure cookies, HttpOnly, SameSite',
        critical_threshold: 'Insecure session storage or no expiry'
      },
      {
        criterion: 'Authorization Completeness',
        weight: 0.25,
        measurement_method: 'Route protection coverage analysis',
        acceptable_threshold: '95% of protected routes have auth checks',
        critical_threshold: 'Admin routes without authorization'
      },
      {
        criterion: 'Token Security',
        weight: 0.20,
        measurement_method: 'JWT/token configuration review',
        acceptable_threshold: 'Secure signing, reasonable expiry',
        critical_threshold: 'Weak signing or no expiry'
      }
    ],
    chain_of_thought_prompts: [
      'First, analyze the authentication configuration to understand the auth strategy',
      'Check NextAuth.js or custom auth implementation for security best practices',
      'Examine session storage mechanism - database vs JWT vs memory',
      'Verify password hashing strength and salt usage',
      'Review JWT token signing and expiry policies',
      'Check for secure cookie configuration (HttpOnly, Secure, SameSite)',
      'Validate authorization middleware on protected routes',
      'Look for common vulnerabilities: session fixation, CSRF, timing attacks',
      'Assess multi-factor authentication implementation if present',
      'Review OAuth provider configurations for security',
      'Check for proper logout and session invalidation'
    ],
    risk_factors: [
      {
        factor: 'Weak password policies',
        probability: 'medium',
        impact: 'high',
        mitigation: 'Implement strong password requirements and validation'
      },
      {
        factor: 'Insecure session management',
        probability: 'high',
        impact: 'critical',
        mitigation: 'Use secure session storage with proper expiry and invalidation'
      },
      {
        factor: 'Missing authorization checks',
        probability: 'medium',
        impact: 'critical',
        mitigation: 'Implement comprehensive route protection middleware'
      }
    ],
    success_metrics: [
      'Zero critical authentication vulnerabilities',
      'All admin routes properly protected',
      'Secure session configuration verified',
      'Strong password policies enforced'
    ],
    estimated_duration: 90,
    complexity: 'high',
    dependencies: ['codebase_structure_audit']
  },

  input_validation_audit: {
    id: 'sec_002',
    name: 'Input Validation & Sanitization Audit',
    category: 'security',
    description: 'Audit of input validation, sanitization, and protection against injection attacks',
    objectives: [
      'Verify comprehensive input validation',
      'Check for injection vulnerabilities',
      'Assess data sanitization practices',
      'Validate API input handling'
    ],
    analysis_targets: [
      'API route input validation',
      'Form validation schemas',
      'Database query construction',
      'File upload handling',
      'User-generated content processing',
      'URL parameter validation',
      'Request body sanitization'
    ],
    evaluation_criteria: [
      {
        criterion: 'Input Validation Coverage',
        weight: 0.35,
        measurement_method: 'Analysis of validation library usage across API routes',
        acceptable_threshold: '90% of API routes have input validation',
        critical_threshold: 'Critical endpoints without validation'
      },
      {
        criterion: 'SQL Injection Prevention',
        weight: 0.25,
        measurement_method: 'Static analysis for dynamic query construction',
        acceptable_threshold: 'All queries use parameterized statements',
        critical_threshold: 'Dynamic SQL construction detected'
      },
      {
        criterion: 'XSS Prevention',
        weight: 0.25,
        measurement_method: 'Analysis of user input rendering',
        acceptable_threshold: 'All user input properly escaped',
        critical_threshold: 'Direct innerHTML usage without sanitization'
      },
      {
        criterion: 'File Upload Security',
        weight: 0.15,
        measurement_method: 'File upload validation and storage analysis',
        acceptable_threshold: 'File type validation and secure storage',
        critical_threshold: 'Unrestricted file uploads'
      }
    ],
    chain_of_thought_prompts: [
      'Start by identifying all API endpoints that accept user input',
      'Check each endpoint for input validation schema (Zod, Joi, Yup)',
      'Analyze database queries for parameterization vs string concatenation',
      'Look for potential SQL injection points in dynamic queries',
      'Examine form handling and client-side validation',
      'Check for XSS vulnerabilities in user content rendering',
      'Review file upload endpoints for security controls',
      'Validate URL parameter sanitization',
      'Check for LDAP, NoSQL, and command injection vulnerabilities',
      'Assess error messages for information disclosure'
    ],
    risk_factors: [
      {
        factor: 'SQL injection vulnerabilities',
        probability: 'medium',
        impact: 'critical',
        mitigation: 'Use ORM/query builder with parameterized queries'
      },
      {
        factor: 'XSS vulnerabilities',
        probability: 'high',
        impact: 'high',
        mitigation: 'Implement proper output encoding and CSP headers'
      }
    ],
    success_metrics: [
      'All API endpoints have input validation',
      'Zero SQL injection vulnerabilities',
      'XSS prevention verified',
      'Secure file upload handling'
    ],
    estimated_duration: 75,
    complexity: 'medium',
    dependencies: ['codebase_structure_audit']
  },

  // === PERFORMANCE AUDITS ===

  database_performance_audit: {
    id: 'perf_001',
    name: 'Database Performance & Query Optimization Audit',
    category: 'performance',
    description: 'Comprehensive analysis of database performance, query efficiency, and scaling patterns',
    objectives: [
      'Identify N+1 query problems',
      'Assess database indexing strategy',
      'Evaluate query performance',
      'Check connection pooling configuration'
    ],
    analysis_targets: [
      'Prisma query patterns',
      'Database schema design',
      'Index utilization',
      'Connection pool configuration',
      'Query complexity analysis',
      'Transaction usage patterns',
      'Caching strategy implementation'
    ],
    evaluation_criteria: [
      {
        criterion: 'Query Efficiency',
        weight: 0.30,
        measurement_method: 'Static analysis of query patterns and complexity',
        acceptable_threshold: 'No N+1 patterns, optimized joins',
        critical_threshold: 'Multiple N+1 patterns detected'
      },
      {
        criterion: 'Index Coverage',
        weight: 0.25,
        measurement_method: 'Database schema analysis for proper indexing',
        acceptable_threshold: 'All frequently queried columns indexed',
        critical_threshold: 'Missing indexes on primary query paths'
      },
      {
        criterion: 'Connection Management',
        weight: 0.20,
        measurement_method: 'Connection pool configuration review',
        acceptable_threshold: 'Proper pool sizing and timeout configuration',
        critical_threshold: 'No connection pooling or poor configuration'
      },
      {
        criterion: 'Transaction Efficiency',
        weight: 0.25,
        measurement_method: 'Transaction scope and rollback analysis',
        acceptable_threshold: 'Appropriate transaction boundaries',
        critical_threshold: 'Long-running or missing transactions'
      }
    ],
    chain_of_thought_prompts: [
      'Begin by analyzing the Prisma schema for relationship definitions',
      'Identify all database queries in the codebase',
      'Look for N+1 patterns: queries inside loops or map functions',
      'Check for proper use of include/select for eager loading',
      'Analyze indexes defined in the schema vs actual query patterns',
      'Review connection pool settings in database configuration',
      'Examine transaction boundaries for business operations',
      'Look for missing pagination on large dataset queries',
      'Check for proper error handling in database operations',
      'Assess caching layer usage for expensive queries'
    ],
    risk_factors: [
      {
        factor: 'N+1 query patterns',
        probability: 'high',
        impact: 'high',
        mitigation: 'Implement eager loading and query optimization'
      },
      {
        factor: 'Missing database indexes',
        probability: 'medium',
        impact: 'high',
        mitigation: 'Add indexes based on query analysis'
      }
    ],
    success_metrics: [
      'Zero N+1 query patterns',
      'All critical queries properly indexed',
      'Connection pooling optimally configured',
      'Transaction boundaries properly defined'
    ],
    estimated_duration: 60,
    complexity: 'medium',
    dependencies: ['codebase_structure_audit']
  },

  api_performance_audit: {
    id: 'perf_002',
    name: 'API Performance & Response Optimization Audit',
    category: 'performance',
    description: 'Analysis of API endpoint performance, caching strategies, and response optimization',
    objectives: [
      'Measure API response times',
      'Assess caching implementation',
      'Identify performance bottlenecks',
      'Validate pagination strategies'
    ],
    analysis_targets: [
      'API route implementations',
      'Response caching headers',
      'Payload size optimization',
      'Middleware performance impact',
      'Rate limiting configuration',
      'Compression implementation',
      'CDN utilization'
    ],
    evaluation_criteria: [
      {
        criterion: 'Response Time',
        weight: 0.35,
        measurement_method: 'Static analysis of potential bottlenecks',
        acceptable_threshold: 'Simple endpoints <200ms complexity',
        critical_threshold: 'Multiple slow operations in single endpoint'
      },
      {
        criterion: 'Caching Strategy',
        weight: 0.30,
        measurement_method: 'Cache headers and implementation analysis',
        acceptable_threshold: 'Appropriate caching for static/semi-static data',
        critical_threshold: 'No caching on expensive operations'
      },
      {
        criterion: 'Payload Optimization',
        weight: 0.20,
        measurement_method: 'Response size and field selection analysis',
        acceptable_threshold: 'Selective field returns, compressed responses',
        critical_threshold: 'Large payloads without optimization'
      },
      {
        criterion: 'Pagination Implementation',
        weight: 0.15,
        measurement_method: 'Large dataset endpoint analysis',
        acceptable_threshold: 'All list endpoints properly paginated',
        critical_threshold: 'Unbounded list queries'
      }
    ],
    chain_of_thought_prompts: [
      'Identify all API routes and their complexity',
      'Analyze each endpoint for potential performance bottlenecks',
      'Check for caching headers and cache-control directives',
      'Look for expensive operations: complex calculations, external API calls',
      'Examine response payloads for unnecessary data inclusion',
      'Verify pagination implementation on list endpoints',
      'Check for proper error handling that could cause timeouts',
      'Analyze middleware chain for performance impact',
      'Look for opportunities to parallelize operations',
      'Assess rate limiting and throttling configurations'
    ],
    risk_factors: [
      {
        factor: 'Slow API endpoints',
        probability: 'medium',
        impact: 'high',
        mitigation: 'Optimize queries and implement caching'
      },
      {
        factor: 'Large response payloads',
        probability: 'high',
        impact: 'medium',
        mitigation: 'Implement field selection and pagination'
      }
    ],
    success_metrics: [
      'All endpoints respond within performance thresholds',
      'Appropriate caching implemented',
      'Response payloads optimized',
      'Pagination implemented on all list endpoints'
    ],
    estimated_duration: 45,
    complexity: 'medium',
    dependencies: ['codebase_structure_audit', 'database_performance_audit']
  },

  // === ARCHITECTURE AUDITS ===

  architecture_patterns_audit: {
    id: 'arch_001',
    name: 'Software Architecture Patterns & Design Audit',
    category: 'architecture',
    description: 'Evaluation of architectural patterns, design principles, and code organization',
    objectives: [
      'Assess architectural pattern consistency',
      'Evaluate separation of concerns',
      'Check dependency management',
      'Validate design principles adherence'
    ],
    analysis_targets: [
      'Project structure organization',
      'Dependency injection patterns',
      'Layer separation and boundaries',
      'Component coupling analysis',
      'Design pattern usage',
      'Code reusability patterns',
      'Configuration management'
    ],
    evaluation_criteria: [
      {
        criterion: 'Architectural Consistency',
        weight: 0.30,
        measurement_method: 'Pattern adherence analysis across codebase',
        acceptable_threshold: 'Consistent patterns throughout application',
        critical_threshold: 'Mixed patterns causing confusion'
      },
      {
        criterion: 'Separation of Concerns',
        weight: 0.25,
        measurement_method: 'Layer boundary analysis',
        acceptable_threshold: 'Clear separation between UI, business, data layers',
        critical_threshold: 'Business logic mixed with UI components'
      },
      {
        criterion: 'Dependency Management',
        weight: 0.25,
        measurement_method: 'Dependency graph analysis',
        acceptable_threshold: 'Clean dependencies, no circular references',
        critical_threshold: 'Circular dependencies or tight coupling'
      },
      {
        criterion: 'Code Reusability',
        weight: 0.20,
        measurement_method: 'Code duplication and abstraction analysis',
        acceptable_threshold: 'Common functionality properly abstracted',
        critical_threshold: 'Significant code duplication'
      }
    ],
    chain_of_thought_prompts: [
      'Start by analyzing the overall project structure and organization',
      'Identify the primary architectural pattern (layered, MVC, component-based)',
      'Check for consistent application of the chosen pattern',
      'Analyze component boundaries and responsibilities',
      'Look for proper separation between UI, business logic, and data access',
      'Identify circular dependencies or inappropriate coupling',
      'Examine code reuse patterns and abstractions',
      'Check for proper configuration management and environment handling',
      'Assess error handling consistency across layers',
      'Look for opportunities to improve maintainability'
    ],
    risk_factors: [
      {
        factor: 'Inconsistent architectural patterns',
        probability: 'medium',
        impact: 'medium',
        mitigation: 'Establish clear architectural guidelines and refactor inconsistencies'
      },
      {
        factor: 'Tight coupling between components',
        probability: 'high',
        impact: 'high',
        mitigation: 'Implement dependency injection and interface-based design'
      }
    ],
    success_metrics: [
      'Consistent architectural pattern throughout',
      'Clear separation of concerns',
      'No circular dependencies',
      'Minimal code duplication'
    ],
    estimated_duration: 75,
    complexity: 'high',
    dependencies: []
  },

  // === BUSINESS LOGIC AUDITS ===

  business_rules_audit: {
    id: 'biz_001',
    name: 'Business Rules & Logic Integrity Audit',
    category: 'business_logic',
    description: 'Comprehensive audit of business rule implementation, data integrity, and workflow consistency',
    objectives: [
      'Validate business rule implementation',
      'Check data integrity constraints',
      'Assess workflow consistency',
      'Verify transaction boundaries'
    ],
    analysis_targets: [
      'Business rule implementations',
      'Data validation rules',
      'Workflow state transitions',
      'Transaction boundaries',
      'Business calculation accuracy',
      'Audit trail implementation',
      'Data consistency checks'
    ],
    evaluation_criteria: [
      {
        criterion: 'Business Rule Completeness',
        weight: 0.30,
        measurement_method: 'Business logic coverage analysis',
        acceptable_threshold: 'All business rules properly implemented',
        critical_threshold: 'Critical business rules missing or incorrect'
      },
      {
        criterion: 'Data Integrity',
        weight: 0.25,
        measurement_method: 'Database constraints and validation analysis',
        acceptable_threshold: 'Proper constraints and validation at all levels',
        critical_threshold: 'Missing data integrity constraints'
      },
      {
        criterion: 'Transaction Consistency',
        weight: 0.25,
        measurement_method: 'Transaction boundary and rollback analysis',
        acceptable_threshold: 'Proper transaction boundaries for business operations',
        critical_threshold: 'Missing transactions for critical operations'
      },
      {
        criterion: 'Audit Trail Coverage',
        weight: 0.20,
        measurement_method: 'Change tracking and logging analysis',
        acceptable_threshold: 'All critical changes tracked and logged',
        critical_threshold: 'No audit trail for sensitive operations'
      }
    ],
    chain_of_thought_prompts: [
      'Identify all business rule implementations in the codebase',
      'Check for hardcoded business values that should be configurable',
      'Analyze data validation rules at database and application levels',
      'Verify transaction boundaries for multi-step business operations',
      'Check for proper error handling in business logic',
      'Look for audit trail implementation for sensitive operations',
      'Validate workflow state transitions and business process flows',
      'Check for proper authorization on business operations',
      'Analyze business calculations for accuracy and precision',
      'Look for compliance with regulatory requirements'
    ],
    risk_factors: [
      {
        factor: 'Incorrect business rule implementation',
        probability: 'medium',
        impact: 'critical',
        mitigation: 'Implement comprehensive business rule testing'
      },
      {
        factor: 'Missing data integrity constraints',
        probability: 'high',
        impact: 'high',
        mitigation: 'Add database and application-level validation'
      }
    ],
    success_metrics: [
      'All business rules properly implemented',
      'Data integrity constraints in place',
      'Transaction boundaries correctly defined',
      'Audit trail implemented for critical operations'
    ],
    estimated_duration: 90,
    complexity: 'high',
    dependencies: ['codebase_structure_audit', 'database_performance_audit']
  },

  // === USER EXPERIENCE AUDITS ===

  accessibility_audit: {
    id: 'ux_001',
    name: 'Web Accessibility & Inclusive Design Audit',
    category: 'user_experience',
    description: 'Comprehensive accessibility audit following WCAG 2.1 guidelines',
    objectives: [
      'Ensure WCAG 2.1 AA compliance',
      'Validate keyboard navigation',
      'Check screen reader compatibility',
      'Assess color contrast and visual accessibility'
    ],
    analysis_targets: [
      'HTML semantic structure',
      'ARIA labels and roles',
      'Keyboard navigation paths',
      'Color contrast ratios',
      'Focus management',
      'Screen reader compatibility',
      'Form accessibility'
    ],
    evaluation_criteria: [
      {
        criterion: 'WCAG 2.1 Compliance',
        weight: 0.35,
        measurement_method: 'Automated accessibility testing and code analysis',
        acceptable_threshold: 'WCAG 2.1 AA compliance',
        critical_threshold: 'WCAG 2.1 A level failures'
      },
      {
        criterion: 'Keyboard Navigation',
        weight: 0.25,
        measurement_method: 'Tab order and keyboard interaction analysis',
        acceptable_threshold: 'All interactive elements keyboard accessible',
        critical_threshold: 'Critical functions not keyboard accessible'
      },
      {
        criterion: 'Screen Reader Support',
        weight: 0.25,
        measurement_method: 'ARIA implementation and semantic HTML analysis',
        acceptable_threshold: 'Proper ARIA labels and semantic structure',
        critical_threshold: 'Missing ARIA labels on critical elements'
      },
      {
        criterion: 'Visual Accessibility',
        weight: 0.15,
        measurement_method: 'Color contrast and visual design analysis',
        acceptable_threshold: 'WCAG AA color contrast ratios',
        critical_threshold: 'Insufficient color contrast'
      }
    ],
    chain_of_thought_prompts: [
      'Start by analyzing the HTML structure for semantic correctness',
      'Check for proper heading hierarchy (h1, h2, h3, etc.)',
      'Verify ARIA labels and roles on interactive elements',
      'Test keyboard navigation paths through the application',
      'Analyze color contrast ratios for text and background',
      'Check for alternative text on images and media',
      'Verify form accessibility with proper labels and error messages',
      'Test focus management and visual focus indicators',
      'Check for screen reader announcements on dynamic content',
      'Validate that all functionality is available via keyboard'
    ],
    risk_factors: [
      {
        factor: 'Non-compliant accessibility implementation',
        probability: 'high',
        impact: 'high',
        mitigation: 'Implement WCAG 2.1 guidelines and automated testing'
      },
      {
        factor: 'Poor keyboard navigation',
        probability: 'medium',
        impact: 'high',
        mitigation: 'Implement proper tab order and keyboard shortcuts'
      }
    ],
    success_metrics: [
      'WCAG 2.1 AA compliance achieved',
      'Full keyboard accessibility',
      'Screen reader compatibility verified',
      'Proper color contrast throughout'
    ],
    estimated_duration: 60,
    complexity: 'medium',
    dependencies: ['codebase_structure_audit']
  }
}

export function getAuditTemplate(templateId: string): AuditTemplate | undefined {
  return AUDIT_TEMPLATES[templateId]
}

export function getAuditTemplatesByCategory(category: string): AuditTemplate[] {
  return Object.values(AUDIT_TEMPLATES).filter(template => template.category === category)
}

export function getAllAuditTemplates(): AuditTemplate[] {
  return Object.values(AUDIT_TEMPLATES)
}

export function getAuditDependencyOrder(): string[] {
  const templates = getAllAuditTemplates()
  const resolved: string[] = []
  const resolving: Set<string> = new Set()
  
  function resolve(templateId: string) {
    if (resolved.includes(templateId)) return
    if (resolving.has(templateId)) {
      throw new Error(`Circular dependency detected involving ${templateId}`)
    }
    
    resolving.add(templateId)
    const template = templates.find(t => t.id === templateId)
    
    if (template) {
      template.dependencies.forEach(dep => resolve(dep))
    }
    
    resolving.delete(templateId)
    resolved.push(templateId)
  }
  
  templates.forEach(template => resolve(template.id))
  return resolved
}