#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Pattern to detect module-level process.env access
const MODULE_LEVEL_ENV_PATTERN = /^(?!.*(?:function|=>|async|export\s+const.*=.*function)).*process\.env\./gm;

// Pattern to detect module-level database/Redis initialization
const MODULE_LEVEL_DB_PATTERN = /^(?!.*(?:function|=>|async|export\s+const.*=.*function)).*(new\s+Redis|new\s+PrismaClient|createClient)/gm;

// Files to check
const API_ROUTES_DIR = path.join(__dirname, '../src/app/api');
const LIB_DIR = path.join(__dirname, '../src/lib');
const COMPONENTS_DIR = path.join(__dirname, '../src/components');

function findFilesRecursively(dir, extension) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== '__tests__') {
        traverse(fullPath);
      } else if (stat.isFile() && fullPath.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];
  
  // Check each line
  lines.forEach((line, index) => {
    // Skip if inside a function or async context
    if (line.includes('function') || line.includes('=>') || line.includes('async')) {
      return;
    }
    
    // Check for module-level process.env access
    if (line.includes('process.env.') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
      // Check if it's at module level (not inside a function)
      const lineNum = index + 1;
      const context = getContext(lines, index);
      
      if (isModuleLevel(context)) {
        issues.push({
          type: 'MODULE_ENV_ACCESS',
          line: lineNum,
          content: line.trim(),
          file: filePath
        });
      }
    }
    
    // Check for module-level database initialization
    if ((line.includes('new Redis') || line.includes('new PrismaClient') || line.includes('createClient')) && 
        !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
      const lineNum = index + 1;
      const context = getContext(lines, index);
      
      if (isModuleLevel(context)) {
        issues.push({
          type: 'MODULE_DB_INIT',
          line: lineNum,
          content: line.trim(),
          file: filePath
        });
      }
    }
  });
  
  return issues;
}

function getContext(lines, currentIndex) {
  // Get surrounding lines to determine context
  const start = Math.max(0, currentIndex - 10);
  const end = Math.min(lines.length, currentIndex + 10);
  return lines.slice(start, end);
}

function isModuleLevel(context) {
  // Simple heuristic: if we're not inside a function body
  let braceCount = 0;
  let inFunction = false;
  
  for (const line of context) {
    if (line.includes('function') || line.includes('=>') || line.includes('async function')) {
      inFunction = true;
    }
    if (line.includes('{')) braceCount++;
    if (line.includes('}')) braceCount--;
  }
  
  return !inFunction || braceCount === 0;
}

function main() {
  console.log('🔍 Scanning for module-level environment and database access...\n');
  
  const allIssues = [];
  
  // Check API routes
  console.log('Checking API routes...');
  const apiFiles = findFilesRecursively(API_ROUTES_DIR, '.ts');
  apiFiles.forEach(file => {
    const issues = checkFile(file);
    if (issues.length > 0) {
      allIssues.push(...issues);
    }
  });
  
  // Check lib files
  console.log('Checking lib files...');
  const libFiles = findFilesRecursively(LIB_DIR, '.ts');
  libFiles.forEach(file => {
    const issues = checkFile(file);
    if (issues.length > 0) {
      allIssues.push(...issues);
    }
  });
  
  // Check component files
  console.log('Checking component files...');
  const componentFiles = findFilesRecursively(COMPONENTS_DIR, '.tsx');
  componentFiles.forEach(file => {
    const issues = checkFile(file);
    if (issues.length > 0) {
      allIssues.push(...issues);
    }
  });
  
  // Report findings
  console.log(`\n📊 Found ${allIssues.length} potential issues:\n`);
  
  const byType = {
    MODULE_ENV_ACCESS: [],
    MODULE_DB_INIT: []
  };
  
  allIssues.forEach(issue => {
    byType[issue.type].push(issue);
  });
  
  // Module-level environment access
  if (byType.MODULE_ENV_ACCESS.length > 0) {
    console.log(`\n❌ Module-level environment variable access (${byType.MODULE_ENV_ACCESS.length}):`);
    byType.MODULE_ENV_ACCESS.slice(0, 10).forEach(issue => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    ${issue.content}`);
    });
    if (byType.MODULE_ENV_ACCESS.length > 10) {
      console.log(`  ... and ${byType.MODULE_ENV_ACCESS.length - 10} more`);
    }
  }
  
  // Module-level database initialization
  if (byType.MODULE_DB_INIT.length > 0) {
    console.log(`\n❌ Module-level database/Redis initialization (${byType.MODULE_DB_INIT.length}):`);
    byType.MODULE_DB_INIT.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    ${issue.content}`);
    });
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    totalIssues: allIssues.length,
    issues: allIssues
  };
  
  const reportPath = path.join(__dirname, '../module-level-issues.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return allIssues.length;
}

const issueCount = main();
process.exit(issueCount > 0 ? 1 : 0);