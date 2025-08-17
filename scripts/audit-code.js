#!/usr/bin/env node

/**
 * CoreFlow360 Code Audit Script
 * Comprehensive security, quality, and dependency auditing
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class CodeAuditor {
  constructor() {
    this.results = {
      security: { issues: [], score: 0 },
      dependencies: { issues: [], score: 0 },
      quality: { issues: [], score: 0 },
      compliance: { issues: [], score: 0 },
      secrets: { issues: [], score: 0 }
    };
    this.reportsDir = 'reports/audit';
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logSection(title) {
    console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan} ${title}${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
  }

  async runCommand(command, description) {
    try {
      this.log(`🔍 ${description}...`, 'blue');
      const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
      this.log(`✅ ${description} completed`, 'green');
      return { success: true, output: result };
    } catch (error) {
      this.log(`❌ ${description} failed: ${error.message}`, 'red');
      return { success: false, output: error.stdout || error.message };
    }
  }

  // Windows-compatible file finder
  findFiles(pattern) {
    try {
      return glob.sync(pattern, { 
        ignore: ['node_modules/**', '.next/**', '.git/**', 'dist/**', 'build/**'],
        nodir: true 
      });
    } catch (error) {
      this.log(`⚠️ Error finding files with pattern ${pattern}: ${error.message}`, 'yellow');
      return [];
    }
  }

  async auditDependencies() {
    this.logSection('DEPENDENCY SECURITY AUDIT');

    // npm audit
    const npmAudit = await this.runCommand('npm audit --json', 'Running npm security audit');
    if (npmAudit.success) {
      try {
        const auditData = JSON.parse(npmAudit.output);
        const vulnerabilities = auditData.vulnerabilities || {};
        const totalVulns = Object.keys(vulnerabilities).length;
        
        this.log(`📦 Found ${totalVulns} vulnerable dependencies`, totalVulns > 0 ? 'yellow' : 'green');
        
        Object.entries(vulnerabilities).forEach(([pkg, vuln]) => {
          this.results.dependencies.issues.push({
            type: 'vulnerability',
            package: pkg,
            severity: vuln.severity,
            title: vuln.title,
            description: vuln.description
          });
        });
      } catch (e) {
        this.log('⚠️ Could not parse npm audit results', 'yellow');
      }
    }

    // Check for outdated packages
    const outdated = await this.runCommand('npm outdated --json', 'Checking for outdated packages');
    if (outdated.success) {
      try {
        const outdatedData = JSON.parse(outdated.output);
        const outdatedCount = Object.keys(outdatedData).length;
        this.log(`📦 Found ${outdatedCount} outdated packages`, outdatedCount > 0 ? 'yellow' : 'green');
        
        Object.entries(outdatedData).forEach(([pkg, info]) => {
          this.results.dependencies.issues.push({
            type: 'outdated',
            package: pkg,
            current: info.current,
            wanted: info.wanted,
            latest: info.latest
          });
        });
      } catch (e) {
        // npm outdated returns empty object when no outdated packages
      }
    }

    // Check package.json for suspicious packages
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const suspiciousPackages = [
      'left-pad', 'event-stream', 'flatmap-stream', 'eslint-scope'
    ];
    
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    suspiciousPackages.forEach(pkg => {
      if (allDeps[pkg]) {
        this.results.dependencies.issues.push({
          type: 'suspicious',
          package: pkg,
          description: 'Known malicious or deprecated package'
        });
      }
    });
  }

  async auditCodeQuality() {
    this.logSection('CODE QUALITY AUDIT');

    // ESLint - skip if there are configuration issues
    try {
      const eslint = await this.runCommand('npx eslint src --ext .ts,.tsx,.js,.jsx --format json', 'Running ESLint');
      if (eslint.success) {
        try {
          const eslintData = JSON.parse(eslint.output);
          const totalIssues = eslintData.reduce((sum, file) => sum + file.messages.length, 0);
          this.log(`🔍 Found ${totalIssues} ESLint issues`, totalIssues > 0 ? 'yellow' : 'green');
          
          eslintData.forEach(file => {
            file.messages.forEach(msg => {
              this.results.quality.issues.push({
                type: 'eslint',
                file: file.filePath,
                line: msg.line,
                severity: msg.severity,
                message: msg.message,
                rule: msg.ruleId
              });
            });
          });
        } catch (e) {
          this.log('⚠️ Could not parse ESLint results', 'yellow');
        }
      }
    } catch (error) {
      this.log('⚠️ ESLint configuration issue - skipping ESLint audit', 'yellow');
    }

    // TypeScript check
    const tsc = await this.runCommand('npx tsc --noEmit --pretty false', 'Running TypeScript check');
    if (!tsc.success) {
      const lines = tsc.output.split('\n').filter(line => line.includes('error TS'));
      this.log(`🔍 Found ${lines.length} TypeScript errors`, lines.length > 0 ? 'red' : 'green');
      
      lines.forEach(line => {
        this.results.quality.issues.push({
          type: 'typescript',
          message: line.trim()
        });
      });
    } else {
      this.log('✅ No TypeScript errors found', 'green');
    }
  }

  async auditSecrets() {
    this.logSection('SECRETS AUDIT');

    const secretPatterns = [
      { pattern: /(api[_-]?key|apikey)\s*[:=]\s*['"][^'"]{10,}['"]/gi, name: 'API Keys' },
      { pattern: /(password|passwd|pwd)\s*[:=]\s*['"][^'"]{6,}['"]/gi, name: 'Passwords' },
      { pattern: /(secret|token)\s*[:=]\s*['"][^'"]{10,}['"]/gi, name: 'Secrets/Tokens' },
      { pattern: /(private[_-]?key|privatekey)\s*[:=]\s*['"][^'"]{10,}['"]/gi, name: 'Private Keys' },
      { pattern: /(access[_-]?token|accesstoken)\s*[:=]\s*['"][^'"]{10,}['"]/gi, name: 'Access Tokens' }
    ];

    const filePatterns = [
      'src/**/*.{ts,tsx,js,jsx}',
      'scripts/**/*.{ts,js}',
      '*.{json,env,config}'
    ];

    let totalSecrets = 0;

    for (const filePattern of filePatterns) {
      const files = this.findFiles(filePattern);
      
      for (const file of files) {
        if (fs.existsSync(file)) {
          try {
            const content = fs.readFileSync(file, 'utf8');
            
            secretPatterns.forEach(({ pattern, name }) => {
              const matches = content.match(pattern);
              if (matches) {
                matches.forEach(match => {
                  this.results.secrets.issues.push({
                    type: 'hardcoded_secret',
                    file: file,
                    pattern: name,
                    match: match.substring(0, 50) + '...'
                  });
                  totalSecrets++;
                });
              }
            });
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    }

    this.log(`🔐 Found ${totalSecrets} potential secrets`, totalSecrets > 0 ? 'red' : 'green');
  }

  async auditSecurity() {
    this.logSection('SECURITY AUDIT');

    // Check for common security issues
    const securityChecks = [
      {
        name: 'SQL Injection Patterns',
        pattern: /(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE)\s+.*\$\{.*\}/gi,
        severity: 'high'
      },
      {
        name: 'XSS Vulnerabilities',
        pattern: /dangerouslySetInnerHTML|innerHTML\s*=\s*[^;]*\$\{/gi,
        severity: 'high'
      },
      {
        name: 'CSRF Vulnerabilities',
        pattern: /csrf|csrf-token|xsrf/gi,
        severity: 'medium'
      },
      {
        name: 'Insecure HTTP',
        pattern: /http:\/\/(?!localhost|127\.0\.0\.1)/gi,
        severity: 'medium'
      }
    ];

    const srcFiles = this.findFiles('src/**/*.{ts,tsx,js,jsx}');
    
    let securityIssues = 0;
    
    for (const file of srcFiles) {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          securityChecks.forEach(check => {
            const matches = content.match(check.pattern);
            if (matches) {
              matches.forEach(match => {
                this.results.security.issues.push({
                  type: check.name,
                  file: file,
                  severity: check.severity,
                  pattern: match.substring(0, 50) + '...'
                });
                securityIssues++;
              });
            }
          });
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }

    this.log(`🛡️ Found ${securityIssues} security issues`, securityIssues > 0 ? 'red' : 'green');
  }

  async auditCompliance() {
    this.logSection('COMPLIANCE AUDIT');

    const complianceChecks = [
      {
        name: 'GDPR Compliance',
        checks: [
          { pattern: /personal[_-]?data|pii|gdpr/gi, description: 'Personal data handling' },
          { pattern: /consent|opt[_-]?in|opt[_-]?out/gi, description: 'User consent mechanisms' }
        ]
      },
      {
        name: 'Accessibility',
        checks: [
          { pattern: /aria[_-]?label|alt=|role=/gi, description: 'ARIA attributes' },
          { pattern: /tabindex|focus/gi, description: 'Keyboard navigation' }
        ]
      },
      {
        name: 'Error Handling',
        checks: [
          { pattern: /try\s*\{|catch\s*\(|\.catch\(/gi, description: 'Error handling patterns' },
          { pattern: /throw\s+new\s+Error/gi, description: 'Error throwing' }
        ]
      }
    ];

    const srcFiles = this.findFiles('src/**/*.{ts,tsx,js,jsx}');
    
    let complianceIssues = 0;
    
    for (const file of srcFiles) {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          complianceChecks.forEach(category => {
            category.checks.forEach(check => {
              const matches = content.match(check.pattern);
              if (matches) {
                this.results.compliance.issues.push({
                  type: category.name,
                  file: file,
                  description: check.description,
                  count: matches.length
                });
                complianceIssues += matches.length;
              }
            });
          });
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }

    this.log(`📋 Found ${complianceIssues} compliance-related patterns`, 'blue');
  }

  generateReport() {
    this.logSection('AUDIT SUMMARY');

    // Create reports directory
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }

    const summary = {
      timestamp: new Date().toISOString(),
      totalIssues: 0,
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 0,
      lowIssues: 0,
      categories: this.results
    };

    // Calculate totals
    Object.values(this.results).forEach(category => {
      summary.totalIssues += category.issues.length;
      category.issues.forEach(issue => {
        if (issue.severity === 'critical') summary.criticalIssues++;
        else if (issue.severity === 'high') summary.highIssues++;
        else if (issue.severity === 'medium') summary.mediumIssues++;
        else summary.lowIssues++;
      });
    });

    // Display summary
    this.log(`📊 Total Issues: ${summary.totalIssues}`, 'bold');
    this.log(`🔴 Critical: ${summary.criticalIssues}`, summary.criticalIssues > 0 ? 'red' : 'green');
    this.log(`🟠 High: ${summary.highIssues}`, summary.highIssues > 0 ? 'yellow' : 'green');
    this.log(`🟡 Medium: ${summary.mediumIssues}`, 'blue');
    this.log(`🟢 Low: ${summary.lowIssues}`, 'blue');

    // Save detailed report
    const reportPath = path.join(this.reportsDir, 'audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
    this.log(`📄 Detailed report saved to: ${reportPath}`, 'green');

    // Generate markdown summary
    const markdownReport = this.generateMarkdownReport(summary);
    const markdownPath = path.join(this.reportsDir, 'audit-summary.md');
    fs.writeFileSync(markdownPath, markdownReport);
    this.log(`📝 Markdown summary saved to: ${markdownPath}`, 'green');

    return summary;
  }

  generateMarkdownReport(summary) {
    let report = `# CoreFlow360 Code Audit Report\n\n`;
    report += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    
    report += `## 📊 Executive Summary\n\n`;
    report += `- **Total Issues:** ${summary.totalIssues}\n`;
    report += `- **Critical Issues:** ${summary.criticalIssues} 🔴\n`;
    report += `- **High Issues:** ${summary.highIssues} 🟠\n`;
    report += `- **Medium Issues:** ${summary.mediumIssues} 🟡\n`;
    report += `- **Low Issues:** ${summary.lowIssues} 🟢\n\n`;

    Object.entries(summary.categories).forEach(([category, data]) => {
      if (data.issues.length > 0) {
        report += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Issues\n\n`;
        report += `**Total:** ${data.issues.length}\n\n`;
        
        data.issues.slice(0, 10).forEach(issue => {
          report += `- **${issue.type || 'Issue'}**: ${issue.message || issue.description || 'No description'}\n`;
          if (issue.file) report += `  - File: \`${issue.file}\`\n`;
          if (issue.severity) report += `  - Severity: ${issue.severity}\n`;
          report += `\n`;
        });
        
        if (data.issues.length > 10) {
          report += `*... and ${data.issues.length - 10} more issues*\n\n`;
        }
      }
    });

    report += `## 🚀 Recommendations\n\n`;
    
    if (summary.criticalIssues > 0) {
      report += `🔴 **Critical Priority:** Fix all critical issues immediately before deployment.\n\n`;
    }
    
    if (summary.highIssues > 0) {
      report += `🟠 **High Priority:** Address high-severity issues within the next sprint.\n\n`;
    }
    
    if (summary.mediumIssues > 0) {
      report += `🟡 **Medium Priority:** Plan to address medium-severity issues in upcoming releases.\n\n`;
    }

    report += `## 📋 Next Steps\n\n`;
    report += `1. Review the detailed JSON report for specific issue locations\n`;
    report += `2. Prioritize fixes based on severity and business impact\n`;
    report += `3. Run this audit again after implementing fixes\n`;
    report += `4. Consider integrating this audit into your CI/CD pipeline\n\n`;

    return report;
  }

  async runFullAudit() {
    this.log(`${colors.bold}${colors.cyan}🔍 CoreFlow360 Code Audit${colors.reset}\n`, 'bold');
    
    await this.auditDependencies();
    await this.auditCodeQuality();
    await this.auditSecrets();
    await this.auditSecurity();
    await this.auditCompliance();
    
    const summary = this.generateReport();
    
    this.log(`\n${colors.bold}${colors.green}✅ Audit completed successfully!${colors.reset}\n`);
    
    return summary;
  }
}

// Run the audit
async function main() {
  const auditor = new CodeAuditor();
  
  try {
    await auditor.runFullAudit();
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CodeAuditor;
