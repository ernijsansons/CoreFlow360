// CoreFlow360 Environment Validation Script
const fs = require('fs');
const path = require('path');

console.log('🧪 Validating CoreFlow360 Environment Configuration...');

// Load environment variables
require('dotenv').config();

const requiredVariables = [
    'DATABASE_URL',
    'REDIS_URL', 
    'NEXTAUTH_SECRET',
    'ENCRYPTION_KEY',
    'NODE_ENV'
];

const optionalVariables = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GOOGLE_AI_API_KEY',
    'SENTRY_DSN'
];

let errors = 0;
let warnings = 0;

console.log('\n📋 Checking Required Variables:');
requiredVariables.forEach(variable => {
    if (!process.env[variable]) {
        console.log(`  ❌ Missing: ${variable}`);
        errors++;
    } else {
        console.log(`  ✅ Found: ${variable}`);
    }
});

console.log('\n📋 Checking Optional Variables:');
optionalVariables.forEach(variable => {
    if (!process.env[variable]) {
        console.log(`  ⚠️  Missing: ${variable} (optional)`);
        warnings++;
    } else {
        console.log(`  ✅ Found: ${variable}`);
    }
});

console.log(`\n📊 Validation Summary:`);
console.log(`  ✅ Required variables: ${requiredVariables.length - errors}/${requiredVariables.length}`);
console.log(`  ⚠️  Optional variables: ${optionalVariables.length - warnings}/${optionalVariables.length}`);
console.log(`  ❌ Errors: ${errors}`);
console.log(`  ⚠️  Warnings: ${warnings}`);

if (errors === 0) {
    console.log('\n🎉 Environment validation passed!');
    process.exit(0);
} else {
    console.log(`\n🚨 Environment validation failed with ${errors} error(s)`);
    console.log('👉 Please check your .env file and add the missing variables');
    process.exit(1);
}
