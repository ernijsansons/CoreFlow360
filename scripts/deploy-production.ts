#!/usr/bin/env node

/**
 * CoreFlow360 Production Deployment Script
 * 
 * This script handles the complete production deployment process including:
 * - Environment validation
 * - Database migrations
 * - Health checks
 * - Post-deployment verification
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { PrismaClient } from '@prisma/client';

interface DeploymentConfig {
  environment: 'production' | 'staging';
  skipMigrations: boolean;
  skipHealthChecks: boolean;
  vercelProject?: string;
  domain?: string;
}

interface EnvironmentVariable {
  name: string;
  required: boolean;
  description: string;
  example?: string;
}

class ProductionDeployer {
  private config: DeploymentConfig;
  private startTime: Date;

  // Required environment variables for production
  private requiredEnvVars: EnvironmentVariable[] = [
    { name: 'NEXTAUTH_SECRET', required: true, description: 'NextAuth.js secret key' },
    { name: 'DATABASE_URL', required: true, description: 'PostgreSQL connection string' },
    { name: 'STRIPE_SECRET_KEY', required: true, description: 'Stripe secret key for payments' },
    { name: 'STRIPE_WEBHOOK_SECRET', required: true, description: 'Stripe webhook secret' },
    { name: 'EMAIL_PROVIDER', required: false, description: 'Email provider (sendgrid|resend)' },
    { name: 'OPENAI_API_KEY', required: false, description: 'OpenAI API key for AI features' },
    { name: 'NEXT_PUBLIC_APP_URL', required: true, description: 'Public application URL' }
  ];

  constructor(config: DeploymentConfig) {
    this.config = config;
    this.startTime = new Date();
  }

  async deploy(): Promise<void> {
    console.log('🚀 CoreFlow360 Production Deployment Starting...');
    console.log(`📅 Started at: ${this.startTime.toISOString()}`);
    console.log(`🎯 Environment: ${this.config.environment}`);
    console.log('=' .repeat(60));

    try {
      // Phase 1: Pre-deployment validation
      await this.validateEnvironment();
      await this.validateDependencies();
      
      // Phase 2: Build and deploy
      await this.buildApplication();
      await this.deployToVercel();
      
      // Phase 3: Database setup
      if (!this.config.skipMigrations) {
        await this.runDatabaseMigrations();
        await this.seedInitialData();
      }
      
      // Phase 4: Post-deployment verification
      if (!this.config.skipHealthChecks) {
        await this.performHealthChecks();
        await this.validateCriticalPaths();
      }
      
      await this.generateDeploymentReport();
      
      console.log('✅ Production deployment completed successfully!');
      
    } catch (error: unknown) {
      console.error('❌ Deployment failed:', error);
      await this.rollbackIfNeeded();
      process.exit(1);
    }
  }

  private async validateEnvironment(): Promise<void> {
    console.log('🔍 Validating environment configuration...');
    
    // Check if production environment file exists
    const envFile = '.env.production';
    if (!existsSync(envFile)) {
      console.warn(`⚠️  ${envFile} not found. Using system environment variables.`);
    }

    // Validate required environment variables
    const missingVars: string[] = [];
    const warningVars: string[] = [];

    for (const envVar of this.requiredEnvVars) {
      const value = process.env[envVar.name];
      
      if (!value) {
        if (envVar.required) {
          missingVars.push(envVar.name);
        } else {
          warningVars.push(envVar.name);
        }
      } else {
        console.log(`✓ ${envVar.name}: configured`);
      }
    }

    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:');
      missingVars.forEach(name => {
        const envVar = this.requiredEnvVars.find(v => v.name === name)!;
        console.error(`  - ${name}: ${envVar.description}`);
        if (envVar.example) {
          console.error(`    Example: ${envVar.example}`);
        }
      });
      throw new Error('Missing required environment variables');
    }

    if (warningVars.length > 0) {
      console.warn('⚠️  Optional environment variables not set:');
      warningVars.forEach(name => {
        const envVar = this.requiredEnvVars.find(v => v.name === name)!;
        console.warn(`  - ${name}: ${envVar.description}`);
      });
    }

    // Validate environment-specific settings
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  NODE_ENV is not set to "production"');
    }

    console.log('✅ Environment validation completed');
  }

  private async validateDependencies(): Promise<void> {
    console.log('📦 Validating dependencies...');
    
    try {
      // Check if package.json exists
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      console.log(`✓ Package.json found (${packageJson.name} v${packageJson.version})`);
      
      // Validate critical dependencies
      const criticalDeps = [
        'next',
        'react', 
        'prisma',
        '@prisma/client',
        'next-auth',
        'stripe'
      ];

      const missingDeps = criticalDeps.filter(dep => 
        !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
      );

      if (missingDeps.length > 0) {
        throw new Error(`Missing critical dependencies: ${missingDeps.join(', ')}`);
      }

      console.log('✓ All critical dependencies found');
      
    } catch (error: unknown) {
      throw new Error(`Dependency validation failed: ${error.message}`);
    }

    console.log('✅ Dependency validation completed');
  }

  private async buildApplication(): Promise<void> {
    console.log('🔨 Building application...');
    
    try {
      // Install dependencies
      console.log('📦 Installing dependencies...');
      execSync('npm ci --production=false', { stdio: 'inherit' });
      
      // Generate Prisma client
      console.log('🔧 Generating Prisma client...');
      execSync('npx prisma generate', { stdio: 'inherit' });
      
      // Build Next.js application
      console.log('⚡ Building Next.js application...');
      execSync('npm run build', { stdio: 'inherit' });
      
      console.log('✅ Application build completed');
      
    } catch (error: unknown) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  private async deployToVercel(): Promise<void> {
    console.log('🚀 Deploying to Vercel...');
    
    try {
      const deployCommand = this.config.vercelProject 
        ? `vercel --prod --yes --token $VERCEL_TOKEN`
        : 'vercel --prod --yes';
      
      console.log('📤 Uploading to Vercel...');
      execSync(deployCommand, { stdio: 'inherit' });
      
      console.log('✅ Vercel deployment completed');
      
    } catch (error: unknown) {
      throw new Error(`Vercel deployment failed: ${error.message}`);
    }
  }

  private async runDatabaseMigrations(): Promise<void> {
    console.log('💾 Running database migrations...');
    
    try {
      // Deploy Prisma migrations
      console.log('🔄 Deploying Prisma migrations...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      
      console.log('✅ Database migrations completed');
      
    } catch (error: unknown) {
      throw new Error(`Database migration failed: ${error.message}`);
    }
  }

  private async seedInitialData(): Promise<void> {
    console.log('🌱 Seeding initial data...');
    
    try {
      // Check if seed script exists
      if (existsSync('prisma/seed.ts') || existsSync('prisma/seed.js')) {
        console.log('📊 Running database seed...');
        execSync('npx prisma db seed', { stdio: 'inherit' });
        console.log('✅ Database seeding completed');
      } else {
        console.log('ℹ️  No seed script found, skipping...');
      }
      
    } catch (error: unknown) {
      console.warn(`⚠️  Database seeding failed (non-critical): ${error.message}`);
    }
  }

  private async performHealthChecks(): Promise<void> {
    console.log('🩺 Performing health checks...');
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      console.warn('⚠️  NEXT_PUBLIC_APP_URL not set, skipping health checks');
      return;
    }

    try {
      // Wait for deployment to be ready
      console.log('⏳ Waiting for deployment to be ready...');
      await this.sleep(30000); // Wait 30 seconds
      
      // Test health endpoint
      console.log('🔍 Testing health endpoint...');
      const healthResponse = await fetch(`${appUrl}/api/health`);
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }
      console.log('✓ Health endpoint responding');
      
      // Test database connectivity
      console.log('🔍 Testing database connectivity...');
      const dbResponse = await fetch(`${appUrl}/api/health/database`);
      if (!dbResponse.ok) {
        throw new Error(`Database health check failed: ${dbResponse.status}`);
      }
      console.log('✓ Database connectivity confirmed');
      
      console.log('✅ Health checks completed');
      
    } catch (error: unknown) {
      throw new Error(`Health checks failed: ${error.message}`);
    }
  }

  private async validateCriticalPaths(): Promise<void> {
    console.log('🛣️  Validating critical user paths...');
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      console.warn('⚠️  NEXT_PUBLIC_APP_URL not set, skipping path validation');
      return;
    }

    try {
      const criticalPaths = [
        '/',
        '/api/auth/signin',
        '/api/customers',
        '/api/subscriptions/status',
        '/api/privacy/metrics'
      ];

      for (const path of criticalPaths) {
        console.log(`🔍 Testing ${path}...`);
        const response = await fetch(`${appUrl}${path}`, {
          headers: { 'User-Agent': 'CoreFlow360-Deploy-Test' }
        });
        
        if (response.status >= 500) {
          throw new Error(`Critical path ${path} returned ${response.status}`);
        }
        console.log(`✓ ${path} responding (${response.status})`);
      }
      
      console.log('✅ Critical path validation completed');
      
    } catch (error: unknown) {
      throw new Error(`Critical path validation failed: ${error.message}`);
    }
  }

  private async generateDeploymentReport(): Promise<void> {
    const endTime = new Date();
    const duration = endTime.getTime() - this.startTime.getTime();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 DEPLOYMENT REPORT');
    console.log('='.repeat(60));
    console.log(`🎯 Environment: ${this.config.environment}`);
    console.log(`⏱️  Duration: ${Math.round(duration / 1000)}s`);
    console.log(`📅 Started: ${this.startTime.toISOString()}`);
    console.log(`📅 Completed: ${endTime.toISOString()}`);
    
    if (process.env.NEXT_PUBLIC_APP_URL) {
      console.log(`🌐 Application URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
    }
    
    console.log('\n🎉 CoreFlow360 is now live in production!');
    console.log('\n📋 Next Steps:');
    console.log('  1. Test critical user workflows');
    console.log('  2. Monitor application logs');
    console.log('  3. Set up monitoring alerts');
    console.log('  4. Configure backup schedules');
    console.log('  5. Update DNS records if needed');
    console.log('='.repeat(60));
  }

  private async rollbackIfNeeded(): Promise<void> {
    console.log('🔄 Checking if rollback is needed...');
    
    // In a production environment, implement rollback logic here
    // This might include reverting database migrations, 
    // switching back to previous deployment, etc.
    
    console.log('ℹ️  Rollback procedures would be implemented here');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  const config: DeploymentConfig = {
    environment: 'production',
    skipMigrations: args.includes('--skip-migrations'),
    skipHealthChecks: args.includes('--skip-health-checks'),
    vercelProject: args.find(arg => arg.startsWith('--project='))?.split('=')[1],
    domain: args.find(arg => arg.startsWith('--domain='))?.split('=')[1]
  };

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
CoreFlow360 Production Deployment Script

Usage: npm run deploy:production [options]

Options:
  --skip-migrations     Skip database migrations
  --skip-health-checks  Skip post-deployment health checks
  --project=NAME        Specify Vercel project name
  --domain=URL          Specify custom domain
  --help, -h            Show this help message

Environment Variables Required:
  NEXTAUTH_SECRET       NextAuth.js secret key
  DATABASE_URL          PostgreSQL connection string
  STRIPE_SECRET_KEY     Stripe secret key
  NEXT_PUBLIC_APP_URL   Public application URL

Example:
  npm run deploy:production
  npm run deploy:production --skip-migrations
  npm run deploy:production --project=coreflow360-prod
`);
    process.exit(0);
  }

  const deployer = new ProductionDeployer(config);
  await deployer.deploy();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Deployment script failed:', error);
    process.exit(1);
  });
}

export { ProductionDeployer };