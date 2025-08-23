#!/usr/bin/env node

/**
 * CoreFlow360 - Deployment Status Checker
 * Checks if your deployment is live and working
 */

const https = require('https');
const http = require('http');

console.log('🔍 CoreFlow360 Deployment Status Checker\n');

// Possible deployment URLs to check
const URLS_TO_CHECK = [
  'https://coreflow360.com',
  'https://www.coreflow360.com',
  'https://coreflow360.vercel.app',
  'https://core-flow360.vercel.app',
  'https://coreflow-360.vercel.app',
  'http://localhost:3000'
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    console.log(`Checking ${url}...`);
    
    const req = protocol.get(url, { timeout: 5000 }, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ ${url} - Status: ${res.statusCode} (Working!)`);
        resolve({ url, status: 'working', code: res.statusCode });
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        console.log(`↗️  ${url} - Status: ${res.statusCode} (Redirect to: ${res.headers.location})`);
        resolve({ url, status: 'redirect', code: res.statusCode, redirect: res.headers.location });
      } else if (res.statusCode === 404) {
        console.log(`❌ ${url} - Status: ${res.statusCode} (Not Found)`);
        resolve({ url, status: 'not_found', code: res.statusCode });
      } else if (res.statusCode === 500) {
        console.log(`🔥 ${url} - Status: ${res.statusCode} (Server Error - Check logs!)`);
        resolve({ url, status: 'error', code: res.statusCode });
      } else {
        console.log(`⚠️  ${url} - Status: ${res.statusCode}`);
        resolve({ url, status: 'other', code: res.statusCode });
      }
    });
    
    req.on('error', (err) => {
      if (err.code === 'ENOTFOUND') {
        console.log(`🌐 ${url} - Domain not found (not deployed or DNS not configured)`);
      } else if (err.code === 'ECONNREFUSED') {
        console.log(`🚫 ${url} - Connection refused (server not running)`);
      } else if (err.code === 'ETIMEDOUT') {
        console.log(`⏱️  ${url} - Timeout (server not responding)`);
      } else {
        console.log(`❌ ${url} - Error: ${err.message}`);
      }
      resolve({ url, status: 'error', error: err.message });
    });
    
    req.on('timeout', () => {
      console.log(`⏱️  ${url} - Request timeout`);
      req.abort();
      resolve({ url, status: 'timeout' });
    });
  });
}

async function checkAllUrls() {
  console.log('Checking all possible deployment URLs...\n');
  
  const results = [];
  for (const url of URLS_TO_CHECK) {
    const result = await checkUrl(url);
    results.push(result);
    console.log('');
  }
  
  // Summary
  console.log('='.repeat(50));
  console.log('📊 DEPLOYMENT STATUS SUMMARY\n');
  
  const working = results.filter(r => r.status === 'working');
  const errors = results.filter(r => r.status === 'error');
  const notFound = results.filter(r => r.status === 'not_found');
  
  if (working.length > 0) {
    console.log('🎉 DEPLOYMENT IS LIVE!');
    console.log('Working URLs:');
    working.forEach(r => console.log(`  ✅ ${r.url}`));
  } else {
    console.log('⚠️  NO LIVE DEPLOYMENTS FOUND\n');
    
    if (errors.length > 0) {
      console.log('Servers with errors:');
      errors.forEach(r => console.log(`  🔥 ${r.url} - ${r.error || `HTTP ${r.code}`}`));
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Check Vercel Dashboard: https://vercel.com/dashboard');
    console.log('2. Look for build errors in Vercel logs');
    console.log('3. Verify GitHub integration is working');
    console.log('4. Check environment variables are set');
    console.log('5. Run: vercel --prod (if Vercel CLI installed)');
  }
  
  console.log('\n💡 Troubleshooting Tips:');
  console.log('- If all URLs show "Domain not found", the project may not be deployed');
  console.log('- If you see 500 errors, check Vercel function logs');
  console.log('- If you see 404 errors, the deployment may be incomplete');
  console.log('- Run "git push origin main" to trigger a new deployment');
}

// Run the checker
checkAllUrls().catch(console.error);