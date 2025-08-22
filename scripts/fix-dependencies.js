#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing dependencies for Vercel deployment...\n');

// Clean up corrupted files
console.log('1. Cleaning up corrupted files...');
try {
  if (fs.existsSync('node_modules')) {
    console.log('   Removing node_modules...');
    fs.rmSync('node_modules', { recursive: true, force: true });
  }
  if (fs.existsSync('package-lock.json')) {
    console.log('   Removing package-lock.json...');
    fs.unlinkSync('package-lock.json');
  }
  console.log('   ✅ Cleanup complete\n');
} catch (error) {
  console.error('   ⚠️ Cleanup warning:', error.message);
}

// Clear npm cache
console.log('2. Clearing npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('   ✅ Cache cleared\n');
} catch (error) {
  console.error('   ⚠️ Cache clear warning:', error.message);
}

// Install critical missing dependencies
console.log('3. Installing critical dependencies...');
const criticalDeps = [
  '@tailwindcss/postcss@^4',
  '@heroicons/react@^2.2.0',
  'framer-motion@^12.23.12',
  'next-auth@^5.0.0-beta.29'
];

try {
  console.log('   Installing:', criticalDeps.join(', '));
  execSync(`npm install ${criticalDeps.join(' ')} --legacy-peer-deps`, { stdio: 'inherit' });
  console.log('   ✅ Critical dependencies installed\n');
} catch (error) {
  console.error('   ❌ Failed to install critical dependencies:', error.message);
  process.exit(1);
}

// Install all dependencies
console.log('4. Installing all dependencies...');
try {
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('   ✅ All dependencies installed\n');
} catch (error) {
  console.error('   ❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Generate Prisma client
console.log('5. Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('   ✅ Prisma client generated\n');
} catch (error) {
  console.error('   ⚠️ Prisma generation warning:', error.message);
}

// Test build
console.log('6. Testing build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n✅ Build successful! Ready for deployment.');
} catch (error) {
  console.error('\n❌ Build failed. Please check the errors above.');
  process.exit(1);
}