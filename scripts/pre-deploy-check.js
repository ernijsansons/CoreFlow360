#!/usr/bin/env node

/**
 * Pre-deployment check script
 * Verifies all critical configurations before deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 CoreFlow360 Pre-Deployment Check\n');

// Check for build-time indicators
const buildIndicators = {
  'NEXT_PHASE': process.env.NEXT_PHASE,
  'BUILDING_FOR_VERCEL': process.env.BUILDING_FOR_VERCEL,
  'CI': process.env.CI,
  'VERCEL_ENV': process.env.VERCEL_ENV,
  'NODE_ENV': process.env.NODE_ENV
};

console.log('📋 Environment Status:');
Object.entries(buildIndicators).forEach(([key, value]) => {
  console.log(`   ${key}: ${value || 'not set'}`);
});

// Check critical files exist
console.log('\n📁 Critical Files:');
const criticalFiles = [
  'src/lib/auth.ts',
  'src/lib/auth-config.ts',
  'src/lib/auth-wrapper.ts',
  'src/lib/db.ts',
  'src/lib/config/build-safe.ts',
  'src/providers/SessionProvider.tsx',
  'src/app/api/auth/[...nextauth]/route.ts'
];

let allFilesExist = true;
criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check for known issues
console.log('\n🔍 Known Issues Check:');

// Check if old auth file exists
const oldAuthPath = path.join(process.cwd(), 'src/lib/auth-old.ts');
if (fs.existsSync(oldAuthPath)) {
  console.log('   ⚠️  Old auth file exists - consider removing');
}

// Check package.json scripts
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['build', 'dev', 'start'];
console.log('\n📜 Package Scripts:');
requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`   ✅ ${script}: ${packageJson.scripts[script]}`);
  } else {
    console.log(`   ❌ ${script}: MISSING`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('✅ All critical files present');
  console.log('✅ Ready for deployment!');
  console.log('\nNext steps:');
  console.log('1. Ensure environment variables are set in Vercel');
  console.log('2. Run: git add -A && git commit -m "fix: Ultimate auth fix"');
  console.log('3. Run: git push');
  console.log('4. Monitor deployment in Vercel dashboard');
} else {
  console.log('❌ Missing critical files - fix before deploying');
  process.exit(1);
}