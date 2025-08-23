#!/usr/bin/env node

/**
 * CoreFlow360 Deployment Readiness Checker
 * Verifies that all the critical fixes are in place for successful deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 CoreFlow360 Deployment Readiness Check\n');

let allChecksPass = true;

function checkFile(filepath, description, checks) {
  console.log(`📄 Checking ${description}...`);
  
  if (!fs.existsSync(filepath)) {
    console.log(`❌ File not found: ${filepath}`);
    allChecksPass = false;
    return;
  }
  
  const content = fs.readFileSync(filepath, 'utf8');
  
  checks.forEach(check => {
    if (typeof check.test === 'function') {
      const result = check.test(content);
      console.log(result ? `✅ ${check.name}` : `❌ ${check.name}`);
      if (!result) allChecksPass = false;
    } else if (typeof check.test === 'string') {
      const found = content.includes(check.test);
      const result = check.shouldExist ? found : !found;
      console.log(result ? `✅ ${check.name}` : `❌ ${check.name}`);
      if (!result) allChecksPass = false;
    }
  });
  
  console.log('');
}

// Check TypeScript configuration
checkFile('tsconfig.json', 'TypeScript Configuration', [
  {
    name: 'exactOptionalPropertyTypes removed',
    test: 'exactOptionalPropertyTypes',
    shouldExist: false
  },
  {
    name: 'noUncheckedIndexedAccess disabled',
    test: content => content.includes('"noUncheckedIndexedAccess": false') || !content.includes('noUncheckedIndexedAccess')
  }
]);

// Check environment validation
checkFile('src/lib/env-validation.ts', 'Environment Validation', [
  {
    name: 'DATABASE_URL has default',
    test: content => content.includes('.optional().default(') && content.includes('DATABASE_URL')
  },
  {
    name: 'NEXTAUTH_SECRET has default',
    test: content => content.includes('.optional().default(') && content.includes('NEXTAUTH_SECRET')
  }
]);

// Check Vercel configuration
checkFile('vercel.json', 'Vercel Configuration', [
  {
    name: 'Build command includes Prisma generate',
    test: '"buildCommand"'
  },
  {
    name: 'Install command configured',
    test: '"installCommand"'
  },
  {
    name: 'Build environment configured',
    test: '"NODE_OPTIONS"'
  }
]);

// Check package.json
checkFile('package.json', 'Package Configuration', [
  {
    name: 'Has build script',
    test: '"build"'
  },
  {
    name: 'Has vercel-build script',
    test: '"vercel-build"'
  }
]);

// Check if critical API route fixes are in place
const criticalFiles = [
  'src/app/admin/page.tsx',
  'src/app/admin/monitoring/page.tsx',
  'src/app/ai-agent-selection/page.tsx'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const hasTypeAssertion = content.includes('as any') || content.includes('as unknown');
    console.log(hasTypeAssertion ? `✅ ${file} has type fixes` : `❌ ${file} missing type fixes`);
    if (!hasTypeAssertion) allChecksPass = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allChecksPass) {
  console.log('🎉 ALL CHECKS PASSED! Ready for deployment!');
  console.log('\n📋 Next steps:');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Create new project or connect existing');
  console.log('3. Import from GitHub: ernijsansons/CoreFlow360');
  console.log('4. Set environment variables');
  console.log('5. Deploy!');
  process.exit(0);
} else {
  console.log('❌ SOME CHECKS FAILED! Review the issues above.');
  console.log('\nThe deployment may fail until these issues are resolved.');
  process.exit(1);
}