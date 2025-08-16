#!/usr/bin/env ts-node

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface AuditResult {
  id: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  findings: string[];
  recommendations: string[];
  xml: string;
}

interface AuditDefinition {
  id: string;
  category: string;
  description: string;
  execute: () => Promise<AuditResult>;
}

class ThermonuclearAuditOrchestrator {
  private results: AuditResult[] = [];
  private startTime: number = Date.now();
  
  constructor(private outputDir: string = './audit-reports') {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  // Core Alignment Audits
  private async auditFrontendBackendSync(): Promise<AuditResult> {
    console.log('🔍 Auditing Frontend-Backend Sync...');
    
    const findings: string[] = [];
    const recommendations: string[] = [];
    
    // Analyze API routes
    const apiRoutes = execSync('find src/app/api -name "*.ts" -o -name "*.js"', { encoding: 'utf8' });
    const apiFiles = apiRoutes.split('\n').filter(Boolean);
    
    // Check for mismatches
    findings.push(`Found ${apiFiles.length} API endpoints`);
    
    // Analyze frontend API calls
    const frontendCalls = execSync('grep -r "fetch\\|axios" src/app src/components --include="*.tsx" --include="*.ts" || true', { encoding: 'utf8' });
    
    if (frontendCalls.includes('/api/')) {
      findings.push('Frontend makes direct API calls');
      recommendations.push('Consider implementing API client abstraction layer');
    }
    
    return {
      id: 'frontend-backend-sync',
      category: 'Core Alignment',
      severity: 'medium',
      findings,
      recommendations,
      xml: `<report>
        <discrepancies>${findings.join('; ')}</discrepancies>
        <fixes>${recommendations.join('; ')}</fixes>
      </report>`
    };
  }

  private async auditDataFlow(): Promise<AuditResult> {
    console.log('🔍 Auditing Data Flow...');
    
    const findings: string[] = [];
    const recommendations: string[] = [];
    
    // Check for state management patterns
    const statePatterns = execSync('grep -r "useState\\|useReducer\\|Redux" src/ --include="*.tsx" --include="*.ts" || true', { encoding: 'utf8' });
    
    if (statePatterns.includes('useState')) {
      findings.push('Local state management detected');
    }
    
    // Check for data fetching patterns
    const fetchPatterns = execSync('grep -r "useEffect.*fetch\\|useSWR\\|useQuery" src/ --include="*.tsx" || true', { encoding: 'utf8' });
    
    if (fetchPatterns) {
      findings.push('Client-side data fetching patterns detected');
      recommendations.push('Consider implementing proper data caching strategy');
    }
    
    return {
      id: 'data-flow',
      category: 'Core Alignment',
      severity: 'medium',
      findings,
      recommendations,
      xml: `<flowchart>
        <issues>${findings.join('; ')}</issues>
      </flowchart>`
    };
  }

  // Security Audits
  private async auditAuthentication(): Promise<AuditResult> {
    console.log('🔍 Auditing Authentication Flows...');
    
    const findings: string[] = [];
    const recommendations: string[] = [];
    
    // Check NextAuth configuration
    const authConfig = execSync('grep -r "NextAuth\\|authOptions" src/ --include="*.ts" || true', { encoding: 'utf8' });
    
    if (authConfig) {
      findings.push('NextAuth.js authentication detected');
      
      // Check for secure session handling
      if (!authConfig.includes('secure: true')) {
        findings.push('CRITICAL: Secure session flag may not be set');
        recommendations.push('Enable secure cookies in production');
      }
    }
    
    // Check for JWT usage
    const jwtUsage = execSync('grep -r "jwt\\|JWT" src/ --include="*.ts" || true', { encoding: 'utf8' });
    
    if (jwtUsage) {
      findings.push('JWT token usage detected');
      recommendations.push('Ensure JWT secrets are properly rotated');
    }
    
    return {
      id: 'auth-flow',
      category: 'Security',
      severity: 'high',
      findings,
      recommendations,
      xml: `<auth>
        <vulns>${findings.filter(f => f.includes('CRITICAL')).join('; ')}</vulns>
        <fixes>${recommendations.join('; ')}</fixes>
      </auth>`
    };
  }

  private async auditDependencies(): Promise<AuditResult> {
    console.log('🔍 Auditing Dependencies...');
    
    const findings: string[] = [];
    const recommendations: string[] = [];
    
    try {
      // Run npm audit
      const auditResult = execSync('npm audit --json || true', { encoding: 'utf8' });
      const audit = JSON.parse(auditResult);
      
      if (audit.metadata) {
        findings.push(`${audit.metadata.vulnerabilities.total} total vulnerabilities`);
        findings.push(`Critical: ${audit.metadata.vulnerabilities.critical}`);
        findings.push(`High: ${audit.metadata.vulnerabilities.high}`);
        
        if (audit.metadata.vulnerabilities.critical > 0) {
          recommendations.push('URGENT: Fix critical vulnerabilities immediately');
        }
      }
    } catch (e) {
      findings.push('Unable to run dependency audit');
    }
    
    return {
      id: 'dependencies',
      category: 'Security',
      severity: 'critical',
      findings,
      recommendations,
      xml: `<deps>
        <vulns>${findings.join('; ')}</vulns>
        <patches>${recommendations.join('; ')}</patches>
      </deps>`
    };
  }

  // Performance Audits
  private async auditPerformanceBottlenecks(): Promise<AuditResult> {
    console.log('🔍 Auditing Performance Bottlenecks...');
    
    const findings: string[] = [];
    const recommendations: string[] = [];
    
    // Check for large components
    const componentSizes = execSync('find src/components -name "*.tsx" -exec wc -l {} + | sort -rn | head -10', { encoding: 'utf8' });
    
    findings.push('Largest components identified');
    recommendations.push('Consider splitting components > 300 lines');
    
    // Check for N+1 query patterns
    const dbQueries = execSync('grep -r "prisma\\." src/ --include="*.ts" || true', { encoding: 'utf8' });
    
    if (dbQueries.includes('findMany')) {
      findings.push('Multiple database queries detected');
      recommendations.push('Review for N+1 query patterns');
    }
    
    return {
      id: 'performance-bottlenecks',
      category: 'Performance',
      severity: 'medium',
      findings,
      recommendations,
      xml: `<perf>
        <bottlenecks>${findings.join('; ')}</bottlenecks>
        <optimizations>${recommendations.join('; ')}</optimizations>
      </perf>`
    };
  }

  // Execute all audits
  async executeAudits(): Promise<void> {
    console.log('🚀 Starting Thermonuclear Audit System...');
    console.log('━'.repeat(50));
    
    const audits: AuditDefinition[] = [
      {
        id: 'frontend-backend-sync',
        category: 'Core Alignment',
        description: 'Frontend-Backend Synchronization Audit',
        execute: () => this.auditFrontendBackendSync()
      },
      {
        id: 'data-flow',
        category: 'Core Alignment',
        description: 'Data Flow Integrity Audit',
        execute: () => this.auditDataFlow()
      },
      {
        id: 'auth-flow',
        category: 'Security',
        description: 'Authentication Flow Security Audit',
        execute: () => this.auditAuthentication()
      },
      {
        id: 'dependencies',
        category: 'Security',
        description: 'Dependency Vulnerability Audit',
        execute: () => this.auditDependencies()
      },
      {
        id: 'performance',
        category: 'Performance',
        description: 'Performance Bottleneck Audit',
        execute: () => this.auditPerformanceBottlenecks()
      }
    ];
    
    // Execute audits in batches
    for (const audit of audits) {
      try {
        console.log(`\n📋 ${audit.description}`);
        const result = await audit.execute();
        this.results.push(result);
        console.log(`✅ Completed: ${audit.id}`);
      } catch (error) {
        console.error(`❌ Failed: ${audit.id}`, error);
        this.results.push({
          id: audit.id,
          category: audit.category,
          severity: 'critical',
          findings: [`Audit failed: ${error}`],
          recommendations: ['Fix audit execution errors'],
          xml: `<error>${error}</error>`
        });
      }
    }
    
    this.generateReport();
  }

  private generateReport(): void {
    const duration = Date.now() - this.startTime;
    const timestamp = new Date().toISOString();
    
    // Generate summary
    const criticalCount = this.results.filter(r => r.severity === 'critical').length;
    const highCount = this.results.filter(r => r.severity === 'high').length;
    const mediumCount = this.results.filter(r => r.severity === 'medium').length;
    const lowCount = this.results.filter(r => r.severity === 'low').length;
    
    // XML Report
    const xmlReport = `<?xml version="1.0" encoding="UTF-8"?>
<thermonuclear-audit-report>
  <metadata>
    <timestamp>${timestamp}</timestamp>
    <duration>${duration}ms</duration>
    <total-audits>${this.results.length}</total-audits>
  </metadata>
  <summary>
    <critical>${criticalCount}</critical>
    <high>${highCount}</high>
    <medium>${mediumCount}</medium>
    <low>${lowCount}</low>
  </summary>
  <audits>
    ${this.results.map(r => `
    <audit id="${r.id}" category="${r.category}" severity="${r.severity}">
      ${r.xml}
    </audit>`).join('')}
  </audits>
</thermonuclear-audit-report>`;
    
    // Markdown Report
    const mdReport = `# Thermonuclear Audit Report

**Generated:** ${timestamp}  
**Duration:** ${duration}ms  
**Total Audits:** ${this.results.length}

## Summary

- 🔴 Critical: ${criticalCount}
- 🟠 High: ${highCount}
- 🟡 Medium: ${mediumCount}
- 🟢 Low: ${lowCount}

## Detailed Findings

${this.results.map(r => `
### ${r.id} (${r.category})
**Severity:** ${r.severity}

**Findings:**
${r.findings.map(f => `- ${f}`).join('\n')}

**Recommendations:**
${r.recommendations.map(rec => `- ${rec}`).join('\n')}
`).join('\n---\n')}

## Next Steps

1. Address all critical findings immediately
2. Create remediation plan for high-severity issues
3. Schedule fixes for medium/low findings
4. Re-run audit after fixes
`;
    
    // Save reports
    const reportPath = join(this.outputDir, `audit-${Date.now()}`);
    writeFileSync(`${reportPath}.xml`, xmlReport);
    writeFileSync(`${reportPath}.md`, mdReport);
    
    console.log('\n' + '━'.repeat(50));
    console.log('📊 Audit Complete!');
    console.log(`📁 Reports saved to: ${reportPath}`);
    console.log('━'.repeat(50));
  }
}

// Execute if run directly
if (require.main === module) {
  const orchestrator = new ThermonuclearAuditOrchestrator();
  orchestrator.executeAudits().catch(console.error);
}

export { ThermonuclearAuditOrchestrator };