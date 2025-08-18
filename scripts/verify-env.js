#!/usr/bin/env node

/**
 * Environment validation for Vercel deployment
 * Run this to verify all env vars are properly set
 */

const crypto = require('crypto');

console.log('🔐 Verifying environment configuration...\n');

const required = {
  DATABASE_URL: {
    pattern: /^postgres(ql)?:\/\/.+/,
    description: 'PostgreSQL connection string'
  },
  NEXTAUTH_SECRET: {
    minLength: 32,
    description: 'Authentication secret (min 32 chars)'
  },
  NEXTAUTH_URL: {
    pattern: /^https?:\/\/.+/,
    description: 'Application URL'
  },
  API_KEY_SECRET: {
    minLength: 32,
    description: 'API key encryption secret'
  },
  ENCRYPTION_KEY: {
    length: 64,
    pattern: /^[0-9a-f]{64}$/,
    description: '64-character hex string'
  }
};

const results = [];
let hasErrors = false;

// Check each required variable
for (const [key, config] of Object.entries(required)) {
  const value = process.env[key];
  
  if (!value) {
    results.push({
      key,
      status: '❌',
      message: `Missing - ${config.description}`
    });
    hasErrors = true;
    continue;
  }
  
  // Validate pattern
  if (config.pattern && !config.pattern.test(value)) {
    results.push({
      key,
      status: '❌',
      message: `Invalid format - expected ${config.description}`
    });
    hasErrors = true;
    continue;
  }
  
  // Validate length
  if (config.minLength && value.length < config.minLength) {
    results.push({
      key,
      status: '❌',
      message: `Too short - minimum ${config.minLength} characters`
    });
    hasErrors = true;
    continue;
  }
  
  if (config.length && value.length !== config.length) {
    results.push({
      key,
      status: '❌',
      message: `Wrong length - must be exactly ${config.length} characters`
    });
    hasErrors = true;
    continue;
  }
  
  results.push({
    key,
    status: '✅',
    message: 'Valid'
  });
}

// Display results
console.log('Environment Variable Status:');
console.log('─'.repeat(50));
results.forEach(({ key, status, message }) => {
  console.log(`${status} ${key.padEnd(20)} ${message}`);
});

// Generate missing values if needed
if (hasErrors) {
  console.log('\n🔧 Generate missing values with these commands:');
  console.log('─'.repeat(50));
  
  if (!process.env.NEXTAUTH_SECRET) {
    const secret = crypto.randomBytes(32).toString('base64');
    console.log(`NEXTAUTH_SECRET="${secret}"`);
  }
  
  if (!process.env.API_KEY_SECRET) {
    const apiSecret = crypto.randomBytes(32).toString('hex');
    console.log(`API_KEY_SECRET="${apiSecret}"`);
  }
  
  if (!process.env.ENCRYPTION_KEY) {
    const encKey = crypto.randomBytes(32).toString('hex');
    console.log(`ENCRYPTION_KEY="${encKey}"`);
  }
  
  console.log('\n❗ Add these to your Vercel environment variables');
  process.exit(1);
} else {
  console.log('\n✅ All environment variables are properly configured!');
  process.exit(0);
}