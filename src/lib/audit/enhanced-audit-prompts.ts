/**
 * CoreFlow360 - Enhanced Audit Prompts
 * Professional-grade audit templates with specialized methodologies
 */

import { SACREDPrompt, CompleteContext } from './prompt-engineering'

/**
 * Enhanced Security Audit Prompt Template
 * Based on CISSP/CEH methodologies with OWASP Top 10 focus
 */
export class SecurityAuditPrompts {
  /**
   * Critical Security Audit with OWASP Top 10 Focus
   */
  static createCriticalSecurityAudit(): SACREDPrompt {
    return {
      specific: {
        outcomes: [
          'Identify all OWASP Top 10 vulnerabilities with CVSS v3.1 scoring',
          'Map complete attack vectors with exploitation paths',
          'Validate SOC2/ISO27001 control implementation',
          'Assess data encryption coverage for PII/PHI compliance',
          'Generate remediation roadmap with story point estimates'
        ],
        measurableCriteria: [
          {
            metric: 'Critical vulnerabilities (CVSS >= 9.0)',
            target: 0,
            unit: 'count',
            priority: 'critical'
          },
          {
            metric: 'High severity vulnerabilities (CVSS >= 7.0)',
            target: 2,
            unit: 'count',
            priority: 'high'
          },
          {
            metric: 'Data encryption coverage',
            target: 100,
            unit: 'percent',
            priority: 'critical'
          },
          {
            metric: 'Authentication bypass vectors',
            target: 0,
            unit: 'count',
            priority: 'critical'
          },
          {
            metric: 'Input validation coverage',
            target: 95,
            unit: 'percent',
            priority: 'high'
          }
        ],
        successThreshold: 'Zero critical vulnerabilities with 100% encryption coverage and SOC2 compliance',
        scope: [
          'authentication_mechanisms',
          'authorization_controls', 
          'input_validation',
          'data_protection',
          'session_management',
          'cryptographic_implementation',
          'error_handling',
          'logging_monitoring',
          'dependency_vulnerabilities',
          'infrastructure_security'
        ]
      },
      actionable: {
        requireImplementationSteps: true,
        stepDetailLevel: 'high',
        includeCodeExamples: true,
        timeEstimates: true,
        dependencyMapping: true
      },
      contextual: {
        codebaseContext: {
          languages: ['TypeScript', 'JavaScript', 'SQL'],
          frameworks: ['Next.js', 'React', 'Prisma', 'NextAuth'],
          architecture: 'Microservices with API Gateway and service mesh',
          dependencies: [
            'next-auth', 'bcryptjs', 'jsonwebtoken', 'prisma',
            'stripe', 'sendgrid', 'redis', 'helmet'
          ],
          codeMetrics: {
            totalFiles: 450,
            totalLines: 75000,
            complexity: 'enterprise-grade'
          }
        },
        businessRequirements: [
          {
            id: 'SEC-COMP-001',
            description: 'Achieve SOC2 Type II and ISO27001 compliance',
            priority: 'must_have',
            successCriteria: [
              'Pass external security audit',
              'Implement all required security controls',
              'Establish continuous security monitoring',
              'Document security policies and procedures'
            ],
            constraints: [
              'No downtime during implementation',
              'Backward compatibility required',
              'Budget cap of $100k for security tooling'
            ]
          },
          {
            id: 'SEC-DATA-001',
            description: 'Protect customer PII/PHI with encryption at rest and in transit',
            priority: 'must_have',
            successCriteria: [
              'AES-256 encryption for all sensitive data',
              'TLS 1.3 for all communications',
              'Field-level encryption for payment data',
              'Key rotation every 90 days'
            ],
            constraints: [
              'Performance impact < 5%',
              'Maintain search capabilities on encrypted fields'
            ]
          }
        ],
        constraints: [
          {
            type: 'regulatory',
            description: 'GDPR, CCPA, HIPAA compliance required',
            impact: 'high',
            flexibility: 'fixed'
          },
          {
            type: 'time',
            description: 'Critical security fixes within 24 hours',
            impact: 'high',
            flexibility: 'fixed'
          }
        ],
        stakeholders: [
          {
            role: 'CISO',
            concerns: ['Regulatory compliance', 'Data breach risk', 'Security posture'],
            decisionPower: 'high'
          },
          {
            role: 'DPO',
            concerns: ['Privacy compliance', 'Data handling', 'User consent'],
            decisionPower: 'high'
          }
        ],
        environment: {
          deployment: 'cloud',
          scale: 'enterprise',
          industry: 'Financial Services',
          compliance: ['SOC2', 'ISO27001', 'GDPR', 'CCPA', 'HIPAA']
        }
      },
      reasoned: {
        steps: [
          {
            step: 1,
            description: 'Static vulnerability analysis using SAST tools',
            reasoning: 'Identify known vulnerability patterns without execution',
            evidence: ['ESLint security rules', 'Semgrep patterns', 'CodeQL queries'],
            confidence: 0.95,
            alternatives: ['Manual code review', 'SonarQube analysis']
          },
          {
            step: 2,
            description: 'Dynamic security testing with simulated attacks',
            reasoning: 'Validate exploitability and measure real-world impact',
            evidence: ['OWASP ZAP scans', 'Burp Suite tests', 'Custom exploit scripts'],
            confidence: 0.90,
            alternatives: ['Penetration testing', 'Bug bounty programs']
          },
          {
            step: 3,
            description: 'Dependency vulnerability assessment',
            reasoning: 'Third-party components often introduce critical vulnerabilities',
            evidence: ['npm audit', 'Snyk scans', 'CVE database correlation'],
            confidence: 0.98,
            alternatives: ['Manual dependency review', 'GitHub security alerts']
          },
          {
            step: 4,
            description: 'Authentication and authorization flow analysis',
            reasoning: 'Auth bypasses lead to complete system compromise',
            evidence: ['JWT token analysis', 'Session handling review', 'RBAC validation'],
            confidence: 0.92,
            alternatives: ['Auth0 security assessment', 'Custom auth review']
          },
          {
            step: 5,
            description: 'Data flow and encryption analysis',
            reasoning: 'Unencrypted PII violates compliance and creates liability',
            evidence: ['Database encryption status', 'API payload analysis', 'File storage security'],
            confidence: 0.88,
            alternatives: ['Data classification audit', 'Encryption key management review']
          }
        ],
        reasoningDepth: 'deep',
        includeAlternatives: true,
        explainTradeoffs: true
      },
      evidenceBased: {
        codeReferences: true,
        lineNumbers: true,
        contextLines: 10,
        includeTests: true,
        performanceMetrics: false,
        securityScans: true
      },
      deliverable: {
        format: 'structured',
        includeExecutiveSummary: true,
        includeTechnicalDetails: true,
        includeImplementationPlan: true,
        includeROIAnalysis: true,
        customSchema: {
          security_report: {
            executive_summary: {
              critical_count: 0,
              high_count: 0,
              risk_score: 0,
              compliance_status: '',
              overall_posture: ''
            },
            vulnerabilities: [],
            compliance_assessment: {
              soc2_controls: [],
              gdpr_compliance: [],
              hipaa_safeguards: []
            },
            remediation_roadmap: {
              immediate_actions: [],
              short_term_fixes: [],
              long_term_improvements: []
            }
          }
        }
      }
    }
  }

  /**
   * OWASP Top 10 Specific Audit Template
   */
  static createOWASPTop10Audit(): string {
    return `
<audit_prompt category="security" priority="critical">
  <system>
    You are a certified security auditor (CISSP, CEH, OSCP) specializing in web application security.
    You have deep expertise in OWASP methodologies and 15+ years of penetration testing experience.
    You understand both attack vectors and defensive strategies.
  </system>
  
  <task>
    Perform comprehensive security audit focusing on OWASP Top 10 2021:
    A01:2021 – Broken Access Control
    A02:2021 – Cryptographic Failures
    A03:2021 – Injection
    A04:2021 – Insecure Design
    A05:2021 – Security Misconfiguration
    A06:2021 – Vulnerable and Outdated Components
    A07:2021 – Identification and Authentication Failures
    A08:2021 – Software and Data Integrity Failures
    A09:2021 – Security Logging and Monitoring Failures
    A10:2021 – Server-Side Request Forgery (SSRF)
  </task>
  
  <methodology>
    <static_analysis>
      - Scan codebase for known vulnerability patterns
      - Use SAST tools (CodeQL, Semgrep, ESLint Security)
      - Review security configurations and middleware
      - Analyze dependency manifests for known CVEs
    </static_analysis>
    
    <dynamic_analysis>
      - Simulate attack vectors for each OWASP category
      - Test authentication and authorization bypasses
      - Validate input sanitization and output encoding
      - Verify cryptographic implementation strength
    </dynamic_analysis>
    
    <dependency_analysis>
      - Cross-reference all dependencies against CVE database
      - Check for outdated packages with security fixes
      - Validate license compliance and supply chain security
      - Assess transitive dependency risks
    </dependency_analysis>
    
    <authentication_flow>
      - Trace every authentication path for weaknesses
      - Test session management and token handling
      - Validate multi-factor authentication implementation
      - Check for privilege escalation vulnerabilities
    </authentication_flow>
    
    <data_flow>
      - Map all PII/PHI handling for compliance gaps
      - Verify encryption at rest and in transit
      - Check data retention and deletion policies
      - Validate access logging and audit trails
    </data_flow>
  </methodology>
  
  <chain_of_thought>
    For each potential vulnerability:
    1. Identify the vulnerability pattern
    2. Explain the specific attack vector
    3. Demonstrate the complete exploitation path
    4. Calculate CVSS v3.1 score with temporal metrics
    5. Assess business impact and regulatory implications
    6. Provide detailed remediation with secure code examples
    7. Estimate implementation effort in story points
    8. Include verification and testing procedures
  </chain_of_thought>
  
  <output>
    <security_report>
      <executive_summary>
        <critical_count>0</critical_count>
        <high_count>0</high_count>
        <medium_count>0</medium_count>
        <low_count>0</low_count>
        <risk_score>0.0</risk_score>
        <compliance_status>compliant|non-compliant|partial</compliance_status>
        <overall_posture>excellent|good|fair|poor|critical</overall_posture>
      </executive_summary>
      
      <vulnerabilities>
        <vuln id="SEC-001" severity="critical" owasp_category="A01:2021">
          <type>Broken Access Control - Vertical Privilege Escalation</type>
          <location>src/api/admin/users.ts:45-52</location>
          <cvss_score>9.8</cvss_score>
          <cvss_vector>CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H</cvss_vector>
          <exploitation_difficulty>low</exploitation_difficulty>
          <business_impact>Complete administrative access, data breach, compliance violation</business_impact>
          <attack_vector>
            User can modify role parameter in API request to gain admin privileges:
            POST /api/admin/users HTTP/1.1
            Content-Type: application/json
            
            {"userId": "123", "role": "admin"}
          </attack_vector>
          <proof_of_concept>
            ```bash
            curl -X POST 'https://api.example.com/admin/users' \
              -H 'Authorization: Bearer user_token' \
              -d '{"userId": "attacker_id", "role": "admin"}'
            ```
          </proof_of_concept>
          <fix>
            <immediate>
              ```typescript
              // src/api/admin/users.ts:45
              // BEFORE (vulnerable)
              const updateUser = async (req: Request) => {
                const { userId, role } = req.body;
                await db.user.update({ where: { id: userId }, data: { role } });
              };
              
              // AFTER (secure)
              const updateUser = async (req: Request) => {
                // Verify admin privileges
                if (!req.user || req.user.role !== 'admin') {
                  throw new UnauthorizedError('Admin access required');
                }
                
                const { userId, role } = req.body;
                
                // Validate role against allowed values
                const allowedRoles = ['user', 'moderator', 'admin'];
                if (!allowedRoles.includes(role)) {
                  throw new ValidationError('Invalid role specified');
                }
                
                // Additional check: prevent self-demotion
                if (userId === req.user.id && role !== 'admin') {
                  throw new ValidationError('Cannot modify own admin role');
                }
                
                await db.user.update({ 
                  where: { id: userId }, 
                  data: { role, updatedBy: req.user.id, updatedAt: new Date() }
                });
                
                // Audit log
                await auditLogger.log({
                  action: 'USER_ROLE_UPDATE',
                  userId: req.user.id,
                  targetUserId: userId,
                  newRole: role,
                  timestamp: new Date()
                });
              };
              ```
            </immediate>
            <long_term>
              - Implement role-based access control (RBAC) middleware
              - Add API rate limiting and anomaly detection
              - Implement privilege escalation monitoring
              - Add comprehensive audit logging
            </long_term>
            <effort>5 story points</effort>
            <verification>
              - Unit tests for authorization logic
              - Integration tests for role enforcement
              - Penetration testing of privilege escalation
              - Code review with security checklist
            </verification>
          </fix>
          <compliance_impact>
            <gdpr>High - Unauthorized access to personal data</gdpr>
            <soc2>Critical - Control CC6.1 (Logical access) failure</soc2>
            <hipaa>Critical - Potential PHI exposure</hipaa>
          </compliance_impact>
        </vuln>
      </vulnerabilities>
      
      <dependency_vulnerabilities>
        <dependency name="lodash" version="4.17.15" severity="high">
          <cve>CVE-2020-8203</cve>
          <description>Prototype pollution vulnerability</description>
          <fixed_version>4.17.19</fixed_version>
          <remediation>npm update lodash</remediation>
        </dependency>
      </dependency_vulnerabilities>
      
      <compliance_assessment>
        <soc2_controls>
          <control id="CC6.1" status="non-compliant">
            <description>Logical access controls</description>
            <gaps>Insufficient authorization checks in admin endpoints</gaps>
            <remediation>Implement comprehensive RBAC system</remediation>
          </control>
        </soc2_controls>
        
        <gdpr_compliance>
          <requirement article="32" status="partial">
            <description>Security of processing</description>
            <gaps>Encryption not implemented for all PII fields</gaps>
            <remediation>Implement field-level encryption</remediation>
          </requirement>
        </gdpr_compliance>
      </compliance_assessment>
    </security_report>
  </output>
</audit_prompt>`
  }
}

/**
 * Enhanced Performance Optimization Prompts
 * Expert-level performance engineering with Web Vitals focus
 */
export class PerformanceAuditPrompts {
  /**
   * Comprehensive Performance Optimization Audit
   */
  static createPerformanceOptimizationAudit(): SACREDPrompt {
    return {
      specific: {
        outcomes: [
          'Achieve Core Web Vitals excellence (LCP < 2.5s, FID < 100ms, CLS < 0.1)',
          'Optimize API response times to P95 < 200ms',
          'Reduce infrastructure costs by 30% through optimization',
          'Eliminate performance bottlenecks affecting user experience',
          'Establish performance monitoring and alerting'
        ],
        measurableCriteria: [
          {
            metric: 'Largest Contentful Paint (LCP)',
            target: 2.5,
            unit: 'seconds',
            priority: 'critical'
          },
          {
            metric: 'First Input Delay (FID)',
            target: 100,
            unit: 'milliseconds',
            priority: 'critical'
          },
          {
            metric: 'Cumulative Layout Shift (CLS)',
            target: 0.1,
            unit: 'score',
            priority: 'critical'
          },
          {
            metric: 'API P95 response time',
            target: 200,
            unit: 'milliseconds',
            priority: 'high'
          },
          {
            metric: 'Database query P95 latency',
            target: 50,
            unit: 'milliseconds',
            priority: 'high'
          },
          {
            metric: 'Bundle size (gzipped)',
            target: 200,
            unit: 'kilobytes',
            priority: 'medium'
          },
          {
            metric: 'Infrastructure cost reduction',
            target: 30,
            unit: 'percent',
            priority: 'medium'
          }
        ],
        successThreshold: 'All Core Web Vitals in green, API P95 < 200ms, 30% cost reduction',
        scope: [
          'frontend_performance',
          'backend_optimization',
          'database_performance',
          'caching_strategies',
          'cdn_optimization',
          'infrastructure_efficiency',
          'monitoring_alerting'
        ]
      },
      actionable: {
        requireImplementationSteps: true,
        stepDetailLevel: 'high',
        includeCodeExamples: true,
        timeEstimates: true,
        dependencyMapping: true
      },
      contextual: {
        codebaseContext: {
          languages: ['TypeScript', 'JavaScript', 'SQL'],
          frameworks: ['Next.js 15', 'React 19', 'Prisma', 'TailwindCSS'],
          architecture: 'Serverless with edge computing and global CDN',
          dependencies: [
            '@vercel/analytics', 'next-bundle-analyzer', 'sharp',
            'redis', 'prisma', '@sentry/nextjs', 'web-vitals'
          ],
          codeMetrics: {
            totalFiles: 450,
            totalLines: 75000,
            complexity: 'high-performance-optimized'
          }
        },
        businessRequirements: [
          {
            id: 'PERF-UX-001',
            description: 'Deliver sub-second page loads for improved conversion',
            priority: 'must_have',
            successCriteria: [
              'Homepage loads in < 1 second',
              'Dashboard renders in < 2 seconds',
              'All interactions respond in < 100ms',
              '15% improvement in conversion rate'
            ],
            constraints: [
              'No degradation in functionality',
              'Maintain SEO performance',
              'Support all modern browsers'
            ]
          },
          {
            id: 'PERF-SCALE-001',
            description: 'Support 10x traffic growth without infrastructure changes',
            priority: 'must_have',
            successCriteria: [
              'Handle 100,000 concurrent users',
              'Maintain response times under load',
              'Auto-scale efficiently',
              'Zero downtime during traffic spikes'
            ],
            constraints: [
              'Current cloud budget limits',
              'Regulatory data residency requirements'
            ]
          }
        ],
        constraints: [
          {
            type: 'budget',
            description: 'Infrastructure costs must not increase',
            impact: 'high',
            flexibility: 'fixed'
          },
          {
            type: 'technology',
            description: 'Must maintain Next.js and Vercel deployment',
            impact: 'medium',
            flexibility: 'negotiable'
          }
        ],
        stakeholders: [
          {
            role: 'Head of Engineering',
            concerns: ['Technical performance', 'Infrastructure costs', 'Developer experience'],
            decisionPower: 'high'
          },
          {
            role: 'Product Manager',
            concerns: ['User experience', 'Conversion rates', 'Feature delivery speed'],
            decisionPower: 'high'
          }
        ],
        environment: {
          deployment: 'cloud',
          scale: 'enterprise',
          industry: 'SaaS',
          compliance: ['GDPR']
        }
      },
      reasoned: {
        steps: [
          {
            step: 1,
            description: 'Frontend performance baseline and Core Web Vitals analysis',
            reasoning: 'User experience directly impacts conversion and retention',
            evidence: ['Lighthouse reports', 'Real User Monitoring', 'Web Vitals API'],
            confidence: 1.0,
            alternatives: ['WebPageTest analysis', 'GTmetrix reports']
          },
          {
            step: 2,
            description: 'Backend API performance profiling',
            reasoning: 'API latency affects every user interaction',
            evidence: ['APM data', 'Response time histograms', 'Error rate analysis'],
            confidence: 0.95,
            alternatives: ['Custom performance logging', 'Third-party monitoring']
          },
          {
            step: 3,
            description: 'Database query optimization analysis',
            reasoning: 'Database is often the primary performance bottleneck',
            evidence: ['Query execution plans', 'Index usage analysis', 'Connection pool metrics'],
            confidence: 0.92,
            alternatives: ['Database-specific profiling tools', 'Query logging analysis']
          },
          {
            step: 4,
            description: 'Bundle size and asset optimization evaluation',
            reasoning: 'Large bundles delay initial page rendering',
            evidence: ['Bundle analyzer reports', 'Asset size analysis', 'Code splitting effectiveness'],
            confidence: 0.90,
            alternatives: ['Manual dependency audit', 'Tree-shaking analysis']
          },
          {
            step: 5,
            description: 'Caching strategy assessment',
            reasoning: 'Effective caching provides highest ROI for performance gains',
            evidence: ['Cache hit rates', 'CDN performance', 'Browser caching headers'],
            confidence: 0.88,
            alternatives: ['Edge computing evaluation', 'Service worker analysis']
          }
        ],
        reasoningDepth: 'deep',
        includeAlternatives: true,
        explainTradeoffs: true
      },
      evidenceBased: {
        codeReferences: true,
        lineNumbers: true,
        contextLines: 5,
        includeTests: false,
        performanceMetrics: true,
        securityScans: false
      },
      deliverable: {
        format: 'structured',
        includeExecutiveSummary: true,
        includeTechnicalDetails: true,
        includeImplementationPlan: true,
        includeROIAnalysis: true,
        customSchema: {
          performance_report: {
            current_metrics: {
              core_web_vitals: {
                lcp: 0,
                fid: 0,
                cls: 0
              },
              api_metrics: {
                p50_latency: 0,
                p95_latency: 0,
                p99_latency: 0,
                error_rate: 0
              },
              infrastructure: {
                monthly_cost: 0,
                cpu_utilization: 0,
                memory_utilization: 0
              }
            },
            optimizations: [],
            projected_improvements: {
              performance_gains: [],
              cost_savings: [],
              user_experience_impact: []
            }
          }
        }
      }
    }
  }

  /**
   * Detailed Performance Audit Template
   */
  static createDetailedPerformanceAudit(): string {
    return `
<audit_prompt category="performance" priority="high">
  <system>
    You are a performance engineering expert with deep knowledge of:
    - Core Web Vitals and user experience metrics
    - Database optimization and query performance
    - Distributed systems and scalability patterns
    - Cloud infrastructure and cost optimization
    - Real-time monitoring and observability
  </system>
  
  <task>
    Identify and resolve performance bottlenecks affecting user experience, scalability, and operational costs.
    Focus on measurable improvements with clear business impact.
  </task>
  
  <methodology>
    <frontend_performance>
      <analysis_areas>
        - Bundle size and code splitting effectiveness
        - Critical rendering path optimization
        - Asset loading strategies (lazy loading, preloading)
        - Core Web Vitals (LCP, FID, CLS) optimization
        - Runtime performance (JavaScript execution time)
      </analysis_areas>
      <tools>
        - Lighthouse CI for automated auditing
        - WebPageTest for detailed waterfall analysis
        - Chrome DevTools Performance tab
        - Real User Monitoring (RUM) data
        - Bundle analyzer for dependency analysis
      </tools>
    </frontend_performance>
    
    <backend_performance>
      <analysis_areas>
        - API response times and throughput
        - Database query optimization
        - Caching strategies and effectiveness
        - Resource utilization patterns
        - Horizontal and vertical scaling bottlenecks
      </analysis_areas>
      <tools>
        - APM tools (New Relic, DataDog, Sentry)
        - Database query analyzers
        - Load testing tools (k6, Artillery)
        - Profiling tools for hotspot identification
        - Infrastructure monitoring dashboards
      </tools>
    </backend_performance>
    
    <infrastructure>
      <analysis_areas>
        - Resource utilization and scaling patterns
        - CDN effectiveness and edge optimization
        - Database connection pooling and management
        - Caching layer performance (Redis, Memcached)
        - Network latency and geographic distribution
      </analysis_areas>
      <cost_optimization>
        - Right-sizing compute resources
        - Storage optimization strategies
        - Network transfer cost reduction
        - Reserved instance utilization
        - Spot instance opportunities
      </cost_optimization>
    </infrastructure>
  </methodology>
  
  <metrics>
    <current_state_baseline>
      - Page load times (P50, P95, P99)
      - Core Web Vitals scores
      - API response times by endpoint
      - Database query performance
      - Infrastructure costs and utilization
    </current_state_baseline>
    
    <industry_benchmarks>
      - E-commerce: 1-3 second load times
      - SaaS dashboards: 2-4 second load times
      - API responses: 100-500ms typical
      - Database queries: 10-100ms optimal
    </industry_benchmarks>
    
    <projected_improvements>
      - Performance gain percentages
      - Cost reduction estimates
      - User experience impact metrics
      - Business KPI improvements (conversion, retention)
    </projected_improvements>
    
    <roi_calculations>
      - Implementation cost vs. savings
      - Performance improvement business value
      - Infrastructure cost optimization
      - Developer productivity improvements
    </roi_calculations>
  </metrics>
  
  <output>
    <performance_report>
      <current_metrics>
        <core_web_vitals>
          <lcp>3.2s</lcp>
          <fid>180ms</fid>
          <cls>0.25</cls>
          <overall_score>poor</overall_score>
        </core_web_vitals>
        
        <api_performance>
          <p50_latency>320ms</p50_latency>
          <p95_latency>1200ms</p95_latency>
          <p99_latency>2800ms</p99_latency>
          <error_rate>2.3%</error_rate>
        </api_performance>
        
        <infrastructure>
          <monthly_cost>$8,500</monthly_cost>
          <cpu_utilization>65%</cpu_utilization>
          <memory_utilization>78%</memory_utilization>
          <database_connections>85% of pool</database_connections>
        </infrastructure>
      </current_metrics>
      
      <optimizations>
        <optimization id="PERF-001" impact="high" effort="low" roi="15x">
          <category>Frontend Bundle Optimization</category>
          <issue>
            Homepage bundle size is 2.1MB uncompressed (680KB gzipped)
            - Unused dependencies: moment.js (67KB), lodash (24KB)
            - Duplicate React components across chunks
            - Unoptimized images serving at 5MB total
          </issue>
          
          <solution>
            <immediate>
              ```javascript
              // 1. Replace moment.js with date-fns
              // Before
              import moment from 'moment';
              const formatted = moment(date).format('YYYY-MM-DD');
              
              // After
              import { format } from 'date-fns';
              const formatted = format(date, 'yyyy-MM-dd');
              
              // 2. Implement dynamic imports for heavy components
              const HeavyChart = lazy(() => import('./HeavyChart'));
              
              // 3. Optimize images with Next.js Image component
              import Image from 'next/image';
              
              <Image
                src="/hero-image.jpg"
                width={800}
                height={600}
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
              />
              ```
            </immediate>
            
            <configuration>
              ```javascript
              // next.config.js optimizations
              module.exports = {
                experimental: {
                  optimizeCss: true,
                  swcMinify: true,
                },
                images: {
                  formats: ['image/webp', 'image/avif'],
                  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
                },
                webpack: (config) => {
                  config.optimization.splitChunks = {
                    chunks: 'all',
                    cacheGroups: {
                      vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                      },
                    },
                  };
                  return config;
                },
              };
              ```
            </configuration>
          </solution>
          
          <expected_improvement>
            <metrics>
              - Bundle size reduction: 65% (2.1MB → 750KB)
              - LCP improvement: 2.1s faster (3.2s → 1.1s)
              - FID improvement: 120ms faster (180ms → 60ms)
              - CLS improvement: 0.20 better (0.25 → 0.05)
            </metrics>
            
            <business_impact>
              - Page load speed: 70% improvement
              - Bounce rate reduction: ~15%
              - Conversion rate increase: ~12%
              - SEO score improvement: +25 points
              - Mobile experience significantly enhanced
            </business_impact>
            
            <cost_impact>
              - CDN bandwidth reduction: 60%
              - Monthly savings: $340
              - Annual savings: $4,080
            </cost_impact>
          </expected_improvement>
          
          <implementation>
            <effort>8 hours</effort>
            <complexity>low</complexity>
            <risks>minimal</risks>
            <dependencies>none</dependencies>
          </implementation>
        </optimization>
        
        <optimization id="PERF-002" impact="high" effort="medium" roi="8x">
          <category>Database Query Optimization</category>
          <issue>
            N+1 query patterns in user dashboard causing 50+ database calls per page load
            - User.orders relationship not eagerly loaded
            - Redundant queries for user permissions
            - Missing indexes on frequently queried columns
          </issue>
          
          <solution>
            ```typescript
            // Before (N+1 problem)
            const users = await prisma.user.findMany();
            for (const user of users) {
              const orders = await prisma.order.findMany({
                where: { userId: user.id }
              });
              user.orderCount = orders.length;
            }
            
            // After (optimized)
            const users = await prisma.user.findMany({
              include: {
                orders: {
                  select: { id: true, total: true, status: true },
                  orderBy: { createdAt: 'desc' },
                  take: 10
                },
                _count: {
                  select: { orders: true }
                }
              }
            });
            
            // Add database indexes
            // schema.prisma
            model Order {
              userId String
              status OrderStatus
              createdAt DateTime @default(now())
              
              @@index([userId, status])
              @@index([createdAt])
            }
            ```
          </solution>
          
          <expected_improvement>
            <metrics>
              - Database queries: 94% reduction (50 → 3 queries)
              - Page load time: 1.8s improvement
              - Database CPU usage: 40% reduction
              - API response time: 800ms improvement
            </metrics>
            
            <cost_impact>
              - Database instance downsizing possible
              - Monthly savings: $280
              - Improved user experience
            </cost_impact>
          </expected_improvement>
        </optimization>
      </optimizations>
      
      <implementation_roadmap>
        <phase name="Quick Wins" duration="1 week">
          <optimizations>PERF-001, PERF-005, PERF-008</optimizations>
          <expected_impact>50% performance improvement</expected_impact>
          <cost_savings>$620/month</cost_savings>
        </phase>
        
        <phase name="Database Optimization" duration="2 weeks">
          <optimizations>PERF-002, PERF-003, PERF-006</optimizations>
          <expected_impact>35% additional improvement</expected_impact>
          <cost_savings>$450/month</cost_savings>
        </phase>
        
        <phase name="Infrastructure Enhancement" duration="3 weeks">
          <optimizations>PERF-004, PERF-007, PERF-009</optimizations>
          <expected_impact>20% additional improvement</expected_impact>
          <cost_savings>$780/month</cost_savings>
        </phase>
      </implementation_roadmap>
    </performance_report>
  </output>
</audit_prompt>`
  }
}

/**
 * Architecture Review Prompts
 * Enterprise-grade architecture assessment
 */
export class ArchitectureAuditPrompts {
  /**
   * Comprehensive Architecture Review
   */
  static createArchitectureReviewAudit(): string {
    return `
<audit_prompt category="architecture" priority="strategic">
  <system>
    You are a senior software architect with 20+ years of experience in:
    - Enterprise software architecture patterns
    - Microservices and distributed systems design
    - Cloud-native architecture and DevOps practices
    - Technical debt assessment and remediation
    - Scalability and maintainability optimization
  </system>
  
  <task>
    Conduct comprehensive architecture review focusing on:
    - Design pattern adherence and consistency
    - Code organization and module boundaries
    - Technical debt identification and quantification
    - Scalability and maintainability assessment
    - Migration path to microservices if beneficial
  </task>
  
  <methodology>
    <static_analysis>
      - Dependency graph analysis for coupling detection
      - Code metrics collection (cyclomatic complexity, maintainability index)
      - Design pattern identification and anti-pattern detection
      - Module boundary analysis and interface design review
    </static_analysis>
    
    <dynamic_analysis>
      - Runtime behavior analysis under load
      - Performance bottleneck identification
      - Resource utilization patterns
      - Failure mode and resilience testing
    </dynamic_analysis>
    
    <quality_metrics>
      - Technical debt ratio calculation
      - Code duplication assessment
      - Test coverage and quality analysis
      - Documentation completeness review
    </quality_metrics>
  </methodology>
  
  <output>
    <architecture_assessment>
      <current_state>
        <architecture_pattern>Modular Monolith</architecture_pattern>
        <coupling_score>7.2/10 (high)</coupling_score>
        <cohesion_score>6.8/10 (moderate)</cohesion_score>
        <technical_debt_ratio>23%</technical_debt_ratio>
        <maintainability_index>68/100</maintainability_index>
      </current_state>
      
      <findings>
        <finding id="ARCH-001" severity="high" category="coupling">
          <issue>Tight coupling between business logic and data access layers</issue>
          <location>src/services/ and src/lib/db/</location>
          <impact>Reduces testability, increases change risk, hampers scalability</impact>
          <recommendation>
            Implement Repository pattern with dependency injection:
            
            ```typescript
            // Define interface
            interface UserRepository {
              findById(id: string): Promise<User | null>;
              save(user: User): Promise<void>;
            }
            
            // Implementation
            class PrismaUserRepository implements UserRepository {
              constructor(private prisma: PrismaClient) {}
              
              async findById(id: string): Promise<User | null> {
                return this.prisma.user.findUnique({ where: { id } });
              }
            }
            
            // Service layer
            class UserService {
              constructor(private userRepo: UserRepository) {}
              
              async getUser(id: string): Promise<User> {
                const user = await this.userRepo.findById(id);
                if (!user) throw new UserNotFoundError();
                return user;
              }
            }
            ```
          </recommendation>
          <effort>12 story points</effort>
        </finding>
      </findings>
      
      <migration_assessment>
        <current_suitability>Monolith appropriate for current scale</current_suitability>
        <microservices_readiness>60% - Some bounded contexts identified</microservices_readiness>
        <recommended_approach>Gradual extraction starting with user management domain</recommended_approach>
      </migration_assessment>
    </architecture_assessment>
  </output>
</audit_prompt>`
  }
}

// Export all prompt builders
export const EnhancedAuditPrompts = {
  Security: SecurityAuditPrompts,
  Performance: PerformanceAuditPrompts,
  Architecture: ArchitectureAuditPrompts
}