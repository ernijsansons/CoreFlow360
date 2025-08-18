#!/usr/bin/env node

/**
 * Pre-deployment validation script
 * Ensures all requirements are met before deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running pre-deployment checks...\n');

const errors = [];
const warnings = [];

// Check 1: Verify critical environment variables
console.log('1️⃣ Checking environment variables...');
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'API_KEY_SECRET',
  'ENCRYPTION_KEY'
];

const envExample = fs.readFileSync('.env.example', 'utf8');
requiredEnvVars.forEach(varName => {
  if (!process.env[varName] && !envExample.includes(varName)) {
    errors.push(`Missing required environment variable: ${varName}`);
  }
});

// Check 2: Verify no module-level database access
console.log('2️⃣ Checking for module-level database access...');
const sourceFiles = [
  'src/lib/auth.ts',
  'src/lib/db.ts',
  'src/app/layout.tsx',
  'src/middleware.ts'
];

sourceFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for problematic patterns
    if (content.includes('prisma.') && !content.includes('function') && !content.includes('async')) {
      warnings.push(`Potential module-level database access in ${file}`);
    }
    
    if (content.includes('new PrismaClient()') && !content.includes('function')) {
      errors.push(`Module-level PrismaClient instantiation in ${file}`);
    }
  }
});

// Check 3: Verify TypeScript configuration
console.log('3️⃣ Checking TypeScript configuration...');
const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
if (tsConfig.compilerOptions?.skipLibCheck === false) {
  warnings.push('TypeScript skipLibCheck should be true for faster builds');
}

// Check 4: Verify build command
console.log('4️⃣ Checking build configuration...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!packageJson.scripts.build.includes('prisma generate')) {
  errors.push('Build script must include "prisma generate"');
}

// Check 5: Verify Next.js configuration
console.log('5️⃣ Checking Next.js configuration...');
if (fs.existsSync('next.config.js')) {
  warnings.push('Using next.config.js instead of next.config.ts may cause issues');
}

const nextConfig = fs.existsSync('next.config.ts') 
  ? fs.readFileSync('next.config.ts', 'utf8')
  : fs.readFileSync('next.config.js', 'utf8');

if (!nextConfig.includes('serverExternalPackages')) {
  warnings.push('Consider adding serverExternalPackages: ["prisma"] to next.config');
}

// Results
console.log('\n📊 Pre-deployment Check Results:\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All checks passed! Ready to deploy.');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log('❌ ERRORS (must fix):');
    errors.forEach(err => console.log(`   - ${err}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (should fix):');
    warnings.forEach(warn => console.log(`   - ${warn}`));
  }
  
  console.log('\n🔧 Fix these issues before deploying to prevent failures.');
  process.exit(errors.length > 0 ? 1 : 0);
}