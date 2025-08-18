#!/usr/bin/env node

/**
 * Environment verification script
 * Checks that all required environment variables are set
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'API_KEY_SECRET',
  'ENCRYPTION_KEY'
];

const optionalEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'REDIS_URL',
  'OPENAI_API_KEY'
];

console.log('🔍 Verifying environment variables...\n');

// Check if we're in build phase
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' ||
                     process.env.BUILDING_FOR_VERCEL === '1' ||
                     process.env.CI === 'true';

if (isBuildPhase) {
  console.log('📦 Build phase detected - skipping runtime checks\n');
  process.exit(0);
}

// Check required variables
let hasErrors = false;
console.log('Required variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: NOT SET`);
    hasErrors = true;
  } else {
    const displayValue = varName.includes('SECRET') || varName.includes('KEY') 
      ? '***' + value.slice(-4) 
      : value.slice(0, 20) + '...';
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

console.log('\nOptional variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: not set`);
  } else {
    const displayValue = varName.includes('SECRET') || varName.includes('KEY') 
      ? '***' + value.slice(-4) 
      : value.slice(0, 20) + '...';
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

// Special checks
console.log('\nSpecial checks:');

// Check NEXTAUTH_SECRET length
if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
  console.log('❌ NEXTAUTH_SECRET must be at least 32 characters');
  hasErrors = true;
} else if (process.env.NEXTAUTH_SECRET) {
  console.log('✅ NEXTAUTH_SECRET length: OK');
}

// Check ENCRYPTION_KEY format
if (process.env.ENCRYPTION_KEY && !/^[0-9a-f]{64}$/i.test(process.env.ENCRYPTION_KEY)) {
  console.log('❌ ENCRYPTION_KEY must be exactly 64 hex characters');
  hasErrors = true;
} else if (process.env.ENCRYPTION_KEY) {
  console.log('✅ ENCRYPTION_KEY format: OK');
}

// Check DATABASE_URL format
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
  console.log('⚠️  DATABASE_URL should start with postgresql://');
}

console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Environment validation failed!');
  console.log('Please set all required environment variables.');
  process.exit(1);
} else {
  console.log('✅ Environment validation passed!');
  process.exit(0);
}