#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read package.json
const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Remove Three.js dependencies
delete packageJson.dependencies['@react-three/fiber'];
delete packageJson.dependencies['@react-three/drei'];
delete packageJson.dependencies['three'];

// Downgrade React to version 18 to fix compatibility
packageJson.dependencies['react'] = '^18.3.1';
packageJson.dependencies['react-dom'] = '^18.3.1';
packageJson.devDependencies['@types/react'] = '^18.3.3';
packageJson.devDependencies['@types/react-dom'] = '^18.3.0';

// Write updated package.json
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('✅ Fixed dependencies:');
console.log('- Removed @react-three/fiber, @react-three/drei, three');
console.log('- Downgraded React to version 18.3.1');
console.log('- Updated React type definitions');
console.log('\nNow run: rm -rf node_modules package-lock.json && npm install');