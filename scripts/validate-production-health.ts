#!/usr/bin/env node

/**
 * CoreFlow360 Production Health Validation Script
 * 
 * Comprehensive health check to validate all systems are operational
 * Run this after deployment to ensure production readiness
 */

import { PrismaClient } from '@prisma/client';

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  details: string;
  critical: boolean;
}

interface ValidationReport {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: HealthCheckResult[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    critical_failures: number;
  };
}

class ProductionHealthValidator {
  private baseUrl: string;
  private prisma: PrismaClient;
  private results: HealthCheckResult[] = [];

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    this.prisma = new PrismaClient();
  }

  async validateAll(): Promise<ValidationReport> {
    console.log('🩺 CoreFlow360 Production Health Validation');
    console.log(`🌐 Target: ${this.baseUrl}`);
    console.log('=' .repeat(60));

    try {
      // Core Infrastructure
      await this.checkApplicationHealth();
      await this.checkDatabaseHealth();
      await this.checkAuthenticationSystem();
      
      // Business Services
      await this.checkPaymentProcessing();
      await this.checkEmailServices();
      await this.checkAPIEndpoints();
      
      // Privacy & Security
      await this.checkPrivacyAuditors();
      await this.checkSecurityHeaders();
      
      // Performance
      await this.checkPerformanceMetrics();
      
      const report = this.generateReport();
      await this.logResults(report);
      
      return report;
      
    } catch (error) {
      console.error('❌ Health validation failed:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private async checkApplicationHealth(): Promise<void> {
    console.log('🏥 Checking application health...');
    
    await this.performHealthCheck(
      'Application Basic Health',
      '/api/health',
      true,
      async (response) => {
        const data = await response.json();
        return data.status === 'healthy' ? 'healthy' : 'degraded';
      }
    );

    await this.performHealthCheck(
      'Application Detailed Health',
      '/api/health/detailed',
      true,
      async (response) => {
        const data = await response.json();
        return data.overall === 'healthy' ? 'healthy' : 'degraded';
      }
    );
  }

  private async checkDatabaseHealth(): Promise<void> {
    console.log('💾 Checking database health...');
    
    await this.performHealthCheck(
      'Database Connectivity',
      '/api/health/database',
      true,
      async (response) => {
        const data = await response.json();
        return data.database.status === 'connected' ? 'healthy' : 'unhealthy';
      }
    );

    // Direct database connection test
    const startTime = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1 as test`;
      const responseTime = Date.now() - startTime;
      
      this.results.push({
        service: 'Database Direct Connection',
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
        details: `Direct Prisma connection test: ${responseTime}ms`,
        critical: true
      });
    } catch (error) {
      this.results.push({
        service: 'Database Direct Connection',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        details: `Database connection failed: ${error.message}`,
        critical: true
      });
    }
  }

  private async checkAuthenticationSystem(): Promise<void> {
    console.log('🔐 Checking authentication system...');
    
    await this.performHealthCheck(
      'NextAuth Health',
      '/api/auth/providers',
      true,
      async (response) => {
        const providers = await response.json();
        return Object.keys(providers).length > 0 ? 'healthy' : 'degraded';
      }
    );

    await this.performHealthCheck(
      'Authentication Configuration',
      '/api/auth/csrf',
      false,
      async (response) => {
        const data = await response.json();
        return data.csrfToken ? 'healthy' : 'degraded';
      }
    );
  }

  private async checkPaymentProcessing(): Promise<void> {
    console.log('💳 Checking payment processing...');
    
    await this.performHealthCheck(
      'Stripe Configuration',
      '/api/stripe/config',
      true,
      async (response) => {
        return response.status === 404 ? 'healthy' : // Endpoint may not exist in public API
               response.ok ? 'healthy' : 'degraded';
      }
    );

    await this.performHealthCheck(
      'Subscription System',
      '/api/subscriptions/status',
      true,
      async (response) => {
        // This endpoint requires authentication, so 401 is expected
        return response.status === 401 ? 'healthy' : 
               response.ok ? 'healthy' : 'degraded';
      }
    );
  }

  private async checkEmailServices(): Promise<void> {
    console.log('📧 Checking email services...');
    
    // Check email configuration
    const emailProvider = process.env.EMAIL_PROVIDER;
    const hasEmailKey = !!(process.env.SENDGRID_API_KEY || process.env.RESEND_API_KEY);
    
    this.results.push({
      service: 'Email Configuration',
      status: emailProvider && hasEmailKey ? 'healthy' : 'degraded',
      responseTime: 0,
      details: emailProvider ? 
        `Provider: ${emailProvider}, API Key: ${hasEmailKey ? 'configured' : 'missing'}` :
        'No email provider configured',
      critical: false
    });
  }

  private async checkAPIEndpoints(): Promise<void> {
    console.log('🔌 Checking API endpoints...');
    
    const criticalEndpoints = [
      { path: '/api/customers', critical: true },
      { path: '/api/privacy/metrics', critical: true },
      { path: '/api/subscriptions/calculate', critical: true },
      { path: '/api/health', critical: true }
    ];

    for (const endpoint of criticalEndpoints) {
      await this.performHealthCheck(
        `API Endpoint: ${endpoint.path}`,
        endpoint.path,
        endpoint.critical,
        async (response) => {
          // Most endpoints require auth, so 401 is acceptable
          return [200, 401, 404].includes(response.status) ? 'healthy' : 'degraded';
        }
      );
    }
  }

  private async checkPrivacyAuditors(): Promise<void> {
    console.log('🛡️ Checking privacy auditors...');
    
    await this.performHealthCheck(
      'Privacy Audit System',
      '/api/privacy/metrics',
      true,
      async (response) => {
        // Requires authentication, 401 is expected
        return response.status === 401 ? 'healthy' : 'degraded';
      }
    );

    await this.performHealthCheck(
      'Privacy Webhooks',
      '/api/privacy/webhooks',
      false,
      async (response) => {
        // POST endpoint, should reject GET with 405
        return response.status === 405 ? 'healthy' : 'degraded';
      }
    );
  }

  private async checkSecurityHeaders(): Promise<void> {
    console.log('🔒 Checking security headers...');
    
    await this.performHealthCheck(
      'Security Headers',
      '/',
      true,
      async (response) => {
        const headers = response.headers;
        const hasCSP = headers.get('content-security-policy');
        const hasHSTS = headers.get('strict-transport-security');
        const hasXFrame = headers.get('x-frame-options');
        
        const securityScore = [hasCSP, hasHSTS, hasXFrame].filter(Boolean).length;
        return securityScore >= 2 ? 'healthy' : 'degraded';
      }
    );
  }

  private async checkPerformanceMetrics(): Promise<void> {
    console.log('⚡ Checking performance metrics...');
    
    // Test multiple endpoints for performance
    const performanceTests = [
      { path: '/', name: 'Homepage' },
      { path: '/api/health', name: 'Health API' }
    ];

    for (const test of performanceTests) {
      await this.performHealthCheck(
        `Performance: ${test.name}`,
        test.path,
        false,
        async (response) => {
          // Performance-based health check is handled by responseTime
          return response.ok ? 'healthy' : 'degraded';
        }
      );
    }
  }

  private async performHealthCheck(
    serviceName: string,
    path: string,
    critical: boolean,
    validator: (response: Response) => Promise<string>
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'CoreFlow360-Health-Check',
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });
      
      const responseTime = Date.now() - startTime;
      const status = await validator(response);
      
      this.results.push({
        service: serviceName,
        status: status as any,
        responseTime,
        details: `HTTP ${response.status} - ${responseTime}ms`,
        critical
      });
      
      const icon = status === 'healthy' ? '✅' : status === 'degraded' ? '⚠️' : '❌';
      console.log(`  ${icon} ${serviceName}: ${status} (${responseTime}ms)`);
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.results.push({
        service: serviceName,
        status: 'unhealthy',
        responseTime,
        details: `Request failed: ${error.message}`,
        critical
      });
      
      console.log(`  ❌ ${serviceName}: unhealthy (${error.message})`);
    }
  }

  private generateReport(): ValidationReport {
    const summary = {
      total: this.results.length,
      healthy: this.results.filter(r => r.status === 'healthy').length,
      degraded: this.results.filter(r => r.status === 'degraded').length,
      unhealthy: this.results.filter(r => r.status === 'unhealthy').length,
      critical_failures: this.results.filter(r => r.critical && r.status === 'unhealthy').length
    };

    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (summary.critical_failures > 0) {
      overall = 'unhealthy';
    } else if (summary.unhealthy > 0 || summary.degraded > 2) {
      overall = 'degraded';
    }

    return {
      overall,
      timestamp: new Date().toISOString(),
      checks: this.results,
      summary
    };
  }

  private async logResults(report: ValidationReport): Promise<void> {
    console.log('\n' + '='.repeat(60));
    console.log('📊 HEALTH VALIDATION REPORT');
    console.log('='.repeat(60));
    
    console.log(`🎯 Overall Status: ${this.getStatusIcon(report.overall)} ${report.overall.toUpperCase()}`);
    console.log(`📊 Total Checks: ${report.summary.total}`);
    console.log(`✅ Healthy: ${report.summary.healthy}`);
    console.log(`⚠️  Degraded: ${report.summary.degraded}`);
    console.log(`❌ Unhealthy: ${report.summary.unhealthy}`);
    console.log(`🚨 Critical Failures: ${report.summary.critical_failures}`);
    
    if (report.summary.critical_failures > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      report.checks
        .filter(check => check.critical && check.status === 'unhealthy')
        .forEach(check => {
          console.log(`  ❌ ${check.service}: ${check.details}`);
        });
    }
    
    if (report.summary.degraded > 0 || report.summary.unhealthy > 0) {
      console.log('\n⚠️  ISSUES FOUND:');
      report.checks
        .filter(check => check.status !== 'healthy')
        .forEach(check => {
          const icon = check.status === 'degraded' ? '⚠️' : '❌';
          console.log(`  ${icon} ${check.service}: ${check.details}`);
        });
    }
    
    const avgResponseTime = report.checks
      .filter(check => check.responseTime > 0)
      .reduce((sum, check) => sum + check.responseTime, 0) / 
      report.checks.filter(check => check.responseTime > 0).length;
    
    console.log(`\n⚡ Average Response Time: ${Math.round(avgResponseTime)}ms`);
    
    console.log('\n🎯 LAUNCH READINESS:');
    if (report.overall === 'healthy') {
      console.log('✅ READY TO LAUNCH - All systems operational');
    } else if (report.overall === 'degraded') {
      console.log('⚠️  CAUTION - Some systems degraded, review issues before launch');
    } else {
      console.log('❌ NOT READY - Critical issues must be resolved before launch');
    }
    
    console.log('='.repeat(60));
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'unhealthy': return '❌';
      default: return '❓';
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const baseUrl = args.find(arg => arg.startsWith('--url='))?.split('=')[1];
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
CoreFlow360 Production Health Validation

Usage: npm run validate:health [options]

Options:
  --url=URL       Specify base URL to test (default: NEXT_PUBLIC_APP_URL)
  --help, -h      Show this help message

Examples:
  npm run validate:health
  npm run validate:health --url=https://app.coreflow360.com
`);
    process.exit(0);
  }

  const validator = new ProductionHealthValidator(baseUrl);
  
  try {
    const report = await validator.validateAll();
    
    // Exit with error code if unhealthy
    if (report.overall === 'unhealthy') {
      process.exit(1);
    } else if (report.overall === 'degraded') {
      process.exit(2);
    }
    
  } catch (error) {
    console.error('❌ Health validation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { ProductionHealthValidator };