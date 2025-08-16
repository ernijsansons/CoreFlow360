#!/usr/bin/env tsx
/**
 * CoreFlow360 Deployment Validation Script
 * Validates production deployment readiness and runs pre-deployment checks
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface ValidationResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message?: string;
  details?: any;
}

class DeploymentValidator {
  private results: ValidationResult[] = [];
  private errors: string[] = [];
  private warnings: string[] = [];

  async validate(): Promise<boolean> {
    console.log(chalk.blue.bold('\n🚀 CoreFlow360 Deployment Validation\n'));

    // Run all validation checks
    await this.checkNodeVersion();
    await this.checkPackageJson();
    await this.checkBuildProcess();
    await this.checkDatabaseMigrations();
    await this.checkEnvironmentVariables();
    await this.checkTypeScript();
    await this.checkDependencies();
    await this.checkSecurityHeaders();
    await this.checkVercelConfig();
    await this.checkStaticAssets();

    // Display results
    this.displayResults();

    return this.errors.length === 0;
  }

  private async checkNodeVersion(): Promise<void> {
    try {
      const { stdout } = await execAsync('node --version');
      const version = stdout.trim();
      const major = parseInt(version.split('.')[0].replace('v', ''));
      
      this.results.push({
        name: 'Node.js Version',
        status: major >= 18 ? 'pass' : 'fail',
        message: `${version} (requires >= 18.x)`,
        details: { version, major }
      });

      if (major < 18) {
        this.errors.push('Node.js version must be 18.x or higher');
      }
    } catch (error) {
      this.results.push({
        name: 'Node.js Version',
        status: 'fail',
        message: 'Failed to check Node.js version'
      });
      this.errors.push('Unable to verify Node.js version');
    }
  }

  private async checkPackageJson(): Promise<void> {
    try {
      const packageJson = JSON.parse(
        await fs.readFile('package.json', 'utf-8')
      );

      // Check required scripts
      const requiredScripts = ['build', 'start', 'db:deploy'];
      const missingScripts = requiredScripts.filter(
        script => !packageJson.scripts?.[script]
      );

      this.results.push({
        name: 'Package.json Scripts',
        status: missingScripts.length === 0 ? 'pass' : 'fail',
        message: missingScripts.length > 0 
          ? `Missing scripts: ${missingScripts.join(', ')}`
          : 'All required scripts present',
        details: { requiredScripts, missingScripts }
      });

      if (missingScripts.length > 0) {
        this.errors.push(`Missing required scripts: ${missingScripts.join(', ')}`);
      }

      // Check engines
      if (!packageJson.engines?.node) {
        this.warnings.push('No Node.js engine version specified in package.json');
      }

    } catch (error) {
      this.results.push({
        name: 'Package.json',
        status: 'fail',
        message: 'Failed to read package.json'
      });
      this.errors.push('Unable to read package.json');
    }
  }

  private async checkBuildProcess(): Promise<void> {
    console.log(chalk.cyan('Running build process...'));
    
    try {
      const startTime = Date.now();
      const { stdout, stderr } = await execAsync('npm run build', {
        env: { ...process.env, NODE_ENV: 'production' }
      });
      const buildTime = Date.now() - startTime;

      // Check for build errors
      const hasErrors = stderr.toLowerCase().includes('error') || 
                       stdout.toLowerCase().includes('error');

      this.results.push({
        name: 'Production Build',
        status: hasErrors ? 'fail' : 'pass',
        message: hasErrors 
          ? 'Build completed with errors'
          : `Build successful (${(buildTime / 1000).toFixed(2)}s)`,
        details: { buildTime, hasErrors }
      });

      if (hasErrors) {
        this.errors.push('Production build contains errors');
      }

      // Check build output
      const buildExists = await this.checkFileExists('.next/BUILD_ID');
      if (!buildExists) {
        this.errors.push('.next build directory not created');
      }

    } catch (error) {
      this.results.push({
        name: 'Production Build',
        status: 'fail',
        message: 'Build process failed'
      });
      this.errors.push('Production build failed to complete');
    }
  }

  private async checkDatabaseMigrations(): Promise<void> {
    try {
      // Check if migrations directory exists
      const migrationsExist = await this.checkFileExists('prisma/migrations');
      
      if (!migrationsExist) {
        this.results.push({
          name: 'Database Migrations',
          status: 'warning',
          message: 'No migrations directory found'
        });
        this.warnings.push('No database migrations found');
        return;
      }

      // Check for pending migrations (dry run)
      const { stdout } = await execAsync('npx prisma migrate status', {
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || '' }
      });

      const hasPending = stdout.includes('Database schema is not up to date');
      
      this.results.push({
        name: 'Database Migrations',
        status: hasPending ? 'warning' : 'pass',
        message: hasPending 
          ? 'Pending migrations detected'
          : 'Database schema up to date',
        details: { hasPending }
      });

      if (hasPending) {
        this.warnings.push('Database has pending migrations');
      }

    } catch (error) {
      this.results.push({
        name: 'Database Migrations',
        status: 'warning',
        message: 'Unable to check migration status'
      });
      this.warnings.push('Could not verify database migration status');
    }
  }

  private async checkEnvironmentVariables(): Promise<void> {
    const requiredVars = [
      'DATABASE_URL',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'API_KEY_SECRET',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'OPENAI_API_KEY',
      'EMAIL_FROM'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    this.results.push({
      name: 'Environment Variables',
      status: missingVars.length === 0 ? 'pass' : 'fail',
      message: missingVars.length > 0
        ? `Missing: ${missingVars.join(', ')}`
        : 'All required variables set',
      details: { requiredVars, missingVars }
    });

    if (missingVars.length > 0) {
      this.errors.push(`Missing environment variables: ${missingVars.join(', ')}`);
    }

    // Check for production values
    if (process.env.NODE_ENV === 'production') {
      if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith('https://')) {
        this.errors.push('NEXTAUTH_URL must use HTTPS in production');
      }
    }
  }

  private async checkTypeScript(): Promise<void> {
    try {
      console.log(chalk.cyan('Running TypeScript checks...'));
      
      const { stdout, stderr } = await execAsync('npx tsc --noEmit --skipLibCheck');
      const hasErrors = stderr.length > 0 || stdout.includes('error');

      this.results.push({
        name: 'TypeScript Compilation',
        status: hasErrors ? 'warning' : 'pass',
        message: hasErrors 
          ? 'TypeScript errors found'
          : 'No TypeScript errors',
        details: { hasErrors }
      });

      if (hasErrors) {
        this.warnings.push('TypeScript compilation warnings');
      }

    } catch (error) {
      this.results.push({
        name: 'TypeScript Compilation',
        status: 'warning',
        message: 'TypeScript check failed'
      });
      this.warnings.push('Could not complete TypeScript validation');
    }
  }

  private async checkDependencies(): Promise<void> {
    try {
      // Check for security vulnerabilities
      const { stdout } = await execAsync('npm audit --json');
      const auditData = JSON.parse(stdout);
      
      const vulnerabilities = auditData.metadata.vulnerabilities;
      const criticalOrHigh = (vulnerabilities.critical || 0) + (vulnerabilities.high || 0);

      this.results.push({
        name: 'Dependency Security',
        status: criticalOrHigh > 0 ? 'warning' : 'pass',
        message: criticalOrHigh > 0
          ? `${criticalOrHigh} high/critical vulnerabilities`
          : 'No critical vulnerabilities',
        details: vulnerabilities
      });

      if (criticalOrHigh > 0) {
        this.warnings.push(`${criticalOrHigh} high/critical dependency vulnerabilities`);
      }

    } catch (error) {
      // npm audit returns non-zero exit code if vulnerabilities found
      this.results.push({
        name: 'Dependency Security',
        status: 'warning',
        message: 'Dependency audit completed with findings'
      });
    }
  }

  private async checkSecurityHeaders(): Promise<void> {
    const vercelConfigExists = await this.checkFileExists('vercel.json');
    
    if (!vercelConfigExists) {
      this.results.push({
        name: 'Security Headers',
        status: 'fail',
        message: 'vercel.json not found'
      });
      this.errors.push('vercel.json configuration missing');
      return;
    }

    try {
      const vercelConfig = JSON.parse(
        await fs.readFile('vercel.json', 'utf-8')
      );

      const hasSecurityHeaders = vercelConfig.headers?.some((rule: any) =>
        rule.headers?.some((header: any) => 
          header.key === 'Strict-Transport-Security' ||
          header.key === 'X-Frame-Options'
        )
      );

      this.results.push({
        name: 'Security Headers',
        status: hasSecurityHeaders ? 'pass' : 'warning',
        message: hasSecurityHeaders
          ? 'Security headers configured'
          : 'Security headers not fully configured'
      });

      if (!hasSecurityHeaders) {
        this.warnings.push('Security headers not fully configured in vercel.json');
      }

    } catch (error) {
      this.results.push({
        name: 'Security Headers',
        status: 'fail',
        message: 'Failed to parse vercel.json'
      });
      this.errors.push('Invalid vercel.json configuration');
    }
  }

  private async checkVercelConfig(): Promise<void> {
    try {
      const vercelConfig = JSON.parse(
        await fs.readFile('vercel.json', 'utf-8')
      );

      // Check critical configurations
      const checks = {
        buildCommand: !!vercelConfig.buildCommand,
        framework: vercelConfig.framework === 'nextjs',
        functions: !!vercelConfig.functions,
        headers: Array.isArray(vercelConfig.headers) && vercelConfig.headers.length > 0
      };

      const failedChecks = Object.entries(checks)
        .filter(([_, passed]) => !passed)
        .map(([check]) => check);

      this.results.push({
        name: 'Vercel Configuration',
        status: failedChecks.length === 0 ? 'pass' : 'warning',
        message: failedChecks.length > 0
          ? `Missing: ${failedChecks.join(', ')}`
          : 'Properly configured',
        details: checks
      });

      if (failedChecks.length > 0) {
        this.warnings.push(`Incomplete Vercel configuration: ${failedChecks.join(', ')}`);
      }

    } catch (error) {
      this.results.push({
        name: 'Vercel Configuration',
        status: 'fail',
        message: 'Failed to read vercel.json'
      });
      this.errors.push('Unable to verify Vercel configuration');
    }
  }

  private async checkStaticAssets(): Promise<void> {
    const requiredAssets = [
      'public/favicon.ico',
      'public/manifest.json'
    ];

    const missingAssets: string[] = [];
    
    for (const asset of requiredAssets) {
      const exists = await this.checkFileExists(asset);
      if (!exists) {
        missingAssets.push(asset);
      }
    }

    this.results.push({
      name: 'Static Assets',
      status: missingAssets.length === 0 ? 'pass' : 'warning',
      message: missingAssets.length > 0
        ? `Missing: ${missingAssets.join(', ')}`
        : 'All required assets present',
      details: { requiredAssets, missingAssets }
    });

    if (missingAssets.length > 0) {
      this.warnings.push(`Missing static assets: ${missingAssets.join(', ')}`);
    }
  }

  private async checkFileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private displayResults(): void {
    console.log(chalk.blue.bold('\n═══════════════════════════════════════════════════════════════'));
    console.log(chalk.blue.bold('DEPLOYMENT VALIDATION RESULTS'));
    console.log(chalk.blue.bold('═══════════════════════════════════════════════════════════════'));

    let passCount = 0;
    let failCount = 0;
    let warningCount = 0;

    // Display each result
    this.results.forEach(result => {
      const icon = result.status === 'pass' ? chalk.green('✓') :
                  result.status === 'fail' ? chalk.red('✗') :
                  chalk.yellow('⚠');
      
      const statusText = result.status === 'pass' ? chalk.green('PASS') :
                        result.status === 'fail' ? chalk.red('FAIL') :
                        chalk.yellow('WARN');

      if (result.status === 'pass') passCount++;
      else if (result.status === 'fail') failCount++;
      else warningCount++;

      console.log(`${icon} ${result.name.padEnd(25)} ${statusText} ${result.message ? chalk.gray(`- ${result.message}`) : ''}`);
    });

    // Summary
    console.log(chalk.blue.bold('\n─────────────────────────────────────────────────────────────'));
    console.log(`Total Checks: ${this.results.length}`);
    console.log(`Passed: ${chalk.green(passCount)}`);
    console.log(`Failed: ${failCount > 0 ? chalk.red(failCount) : chalk.green(0)}`);
    console.log(`Warnings: ${warningCount > 0 ? chalk.yellow(warningCount) : chalk.green(0)}`);

    // Display errors
    if (this.errors.length > 0) {
      console.log(chalk.red.bold('\n❌ DEPLOYMENT BLOCKERS:'));
      this.errors.forEach(error => {
        console.log(chalk.red(`   • ${error}`));
      });
    }

    // Display warnings
    if (this.warnings.length > 0) {
      console.log(chalk.yellow.bold('\n⚠️  WARNINGS:'));
      this.warnings.forEach(warning => {
        console.log(chalk.yellow(`   • ${warning}`));
      });
    }

    // Final verdict
    if (this.errors.length === 0) {
      console.log(chalk.green.bold('\n✅ DEPLOYMENT VALIDATION PASSED!'));
      console.log(chalk.green('The application is ready for production deployment.'));
      
      if (this.warnings.length > 0) {
        console.log(chalk.yellow('\nNote: Address warnings for optimal production performance.'));
      }
    } else {
      console.log(chalk.red.bold('\n❌ DEPLOYMENT VALIDATION FAILED'));
      console.log(chalk.red(`Fix ${this.errors.length} critical issue(s) before deploying.`));
    }

    // Deployment checklist
    console.log(chalk.cyan.bold('\n📋 DEPLOYMENT CHECKLIST:'));
    console.log('1. Run: npm run validate:env');
    console.log('2. Run: npm run db:deploy');
    console.log('3. Run: npm run db:seed:production');
    console.log('4. Configure monitoring and alerts');
    console.log('5. Test all critical user flows');
    console.log('6. Verify backup and recovery procedures');
    console.log('7. Deploy with: vercel --prod');
  }
}

// Run validation
async function main() {
  const validator = new DeploymentValidator();
  const isValid = await validator.validate();
  
  process.exit(isValid ? 0 : 1);
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('Validation failed with error:'), error);
    process.exit(1);
  });
}

export { DeploymentValidator };