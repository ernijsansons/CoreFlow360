# RepoAudit Security & Compliance Setup

This guide will help you set up RepoAudit for comprehensive security and compliance auditing of the CoreFlow360 project.

## What is RepoAudit?

RepoAudit is a comprehensive security and compliance auditing tool that automatically analyzes your repository for:

- **Security Vulnerabilities**: Code injection, authentication issues, data exposure
- **Compliance Standards**: OWASP Top 10, NIST, GDPR, SOC 2, HIPAA, PCI DSS
- **Code Quality**: Static analysis, complexity, maintainability
- **Dependencies**: Vulnerable packages, outdated versions, license compliance
- **Secrets**: Hardcoded API keys, passwords, tokens
- **Infrastructure**: Cloud security, CI/CD pipeline analysis
- **Documentation**: Coverage analysis, quality assessment

## Installation & Setup

### 1. Install RepoAudit CLI

```bash
# Install globally
npm install -g @repoaudit/cli

# Or install locally as dev dependency
npm install --save-dev @repoaudit/cli
```

### 2. Verify Installation

```bash
# Check if RepoAudit is installed
repoaudit --version

# Show available commands
repoaudit --help
```

### 3. Configuration

The repository is already configured with:
- `.repoaudit.yaml` - Main configuration file
- `.github/workflows/repoaudit.yml` - GitHub Actions workflow
- `scripts/repoaudit.sh` - Local audit script

## Usage

### Local Auditing

#### Run All Audits
```bash
# Using the local script
chmod +x scripts/repoaudit.sh
./scripts/repoaudit.sh

# Or using RepoAudit CLI directly
repoaudit audit --config .repoaudit.yaml
```

#### Run Specific Audits
```bash
# Security audit only
./scripts/repoaudit.sh -s

# Compliance audit only
./scripts/repoaudit.sh -c

# Dependencies audit only
./scripts/repoaudit.sh -d

# Secrets audit only
./scripts/repoaudit.sh -e

# Code quality audit only
./scripts/repoaudit.sh -q

# Infrastructure audit only
./scripts/repoaudit.sh -i
```

#### Show Summary Only
```bash
./scripts/repoaudit.sh --summary-only
```

### GitHub Actions Integration

The workflow automatically runs:
- **On every push** to main/develop branches
- **On pull requests** to main branch
- **Daily at 2 AM UTC** (scheduled)
- **Manually** via workflow dispatch

### Manual Workflow Trigger

1. Go to GitHub Actions tab
2. Select "RepoAudit Security & Compliance"
3. Click "Run workflow"
4. Choose audit type (full, security, compliance, etc.)
5. Click "Run workflow"

## Audit Types

### 🔒 Security Audit
- **Vulnerability scanning**: SQL injection, XSS, CSRF
- **Authentication & Authorization**: Session management, access controls
- **Data Protection**: Encryption, PII detection, data flow analysis
- **API Security**: Input validation, output encoding, rate limiting
- **Infrastructure Security**: Cloud security, network configuration

### 📋 Compliance Audit
- **OWASP Top 10**: Web application security risks
- **NIST Cybersecurity Framework**: Security standards
- **GDPR/CCPA**: Data privacy regulations
- **SOC 2**: Security controls and procedures
- **HIPAA**: Healthcare data protection
- **PCI DSS**: Payment card security

### 📦 Dependencies Audit
- **Vulnerability scanning**: Known security issues
- **License compliance**: Open source license validation
- **Version analysis**: Outdated packages, security updates
- **Dependency graph**: Circular dependencies, unused packages

### 🔐 Secrets Audit
- **Secret detection**: API keys, passwords, tokens
- **Hardcoded secrets**: Credentials in source code
- **Environment variables**: Sensitive configuration
- **Secret management**: Rotation, storage, access controls

### 🎯 Code Quality Audit
- **Static analysis**: Code patterns, best practices
- **Complexity analysis**: Cyclomatic complexity, maintainability
- **Performance analysis**: Memory leaks, resource usage
- **Testing coverage**: Test quality, integration tests

### 🏗️ Infrastructure Audit
- **Cloud security**: IAM analysis, network configuration
- **Container security**: Image scanning, runtime security
- **CI/CD security**: Pipeline analysis, deployment security

## Custom Rules

### AI-Specific Rules
- **Model Safety**: AI model security and bias detection
- **Prompt Injection**: Protection against malicious prompts
- **Data Privacy**: AI data handling compliance

### ERP-Specific Rules
- **Business Logic Security**: Data integrity, audit trails
- **Access Controls**: Role-based permissions, business rules
- **Financial Data**: Payment processing, accounting security

### Database Security
- **SQL Injection**: Query parameter validation
- **Data Validation**: Input sanitization, schema validation
- **Migration Security**: Database change management

### API Security
- **Input Validation**: Request parameter validation
- **Authentication**: API key validation, OAuth flows
- **Rate Limiting**: Request throttling, abuse prevention

## Reports & Output

### Report Formats
- **JSON**: Machine-readable detailed reports
- **HTML**: Interactive web-based reports
- **Markdown**: Human-readable summaries
- **SARIF**: Standard format for security tools

### Report Location
All reports are saved to `reports/audit/`:
```
reports/audit/
├── security-report.json
├── compliance-report.json
├── dependencies-report.json
├── secrets-report.json
├── quality-report.json
├── infrastructure-report.json
├── audit-report.html
└── audit-summary.md
```

### GitHub Integration
- **PR Comments**: Automatic comments on pull requests
- **Status Checks**: Build status based on audit results
- **Issue Creation**: Automatic issue creation for critical findings
- **Artifacts**: Report uploads as workflow artifacts

## Thresholds & Limits

### Security Thresholds
- **Critical Vulnerabilities**: 0 (fail on any)
- **High Vulnerabilities**: 2 (warn if exceeded)
- **Medium Vulnerabilities**: 10 (warn if exceeded)
- **Low Vulnerabilities**: 50 (warn if exceeded)

### Quality Thresholds
- **Test Coverage**: 80% minimum
- **Maintainability Index**: 70 minimum
- **Complexity Score**: 10 maximum

### Compliance Thresholds
- **GDPR Compliance**: 100% required
- **Security Standards**: 95% minimum
- **Documentation Coverage**: 90% minimum

## Remediation

### Auto-Fix Capabilities
RepoAudit can automatically fix some issues:
- **Package updates**: Outdated dependencies
- **Documentation**: Missing documentation files
- **Configuration**: Security misconfigurations

### Manual Remediation
For issues requiring manual intervention:
1. **Review the report**: Understand the issue details
2. **Follow guidance**: Check remediation recommendations
3. **Implement fixes**: Make necessary code changes
4. **Re-run audit**: Verify issues are resolved

### Issue Tracking
- **GitHub Issues**: Automatic issue creation
- **Remediation deadlines**: Track fix timelines
- **Progress monitoring**: Track resolution status

## Best Practices

### For Developers
1. **Run audits locally** before pushing code
2. **Review security findings** immediately
3. **Fix critical issues** before merging PRs
4. **Monitor compliance** regularly

### For Teams
1. **Set up automated scanning** in CI/CD
2. **Review reports regularly** (weekly/monthly)
3. **Train team members** on security best practices
4. **Maintain security standards** across the project

### For Compliance
1. **Document audit results** for compliance reports
2. **Track remediation progress** for auditors
3. **Maintain audit trails** for regulatory requirements
4. **Regular compliance reviews** (quarterly/annually)

## Troubleshooting

### Common Issues

#### RepoAudit Not Found
```bash
# Install RepoAudit CLI
npm install -g @repoaudit/cli

# Verify installation
repoaudit --version
```

#### Configuration Errors
```bash
# Validate configuration
repoaudit validate --config .repoaudit.yaml

# Check configuration syntax
yamllint .repoaudit.yaml
```

#### Permission Issues
```bash
# Make script executable
chmod +x scripts/repoaudit.sh

# Check file permissions
ls -la scripts/repoaudit.sh
```

#### Report Generation Failures
```bash
# Check reports directory
mkdir -p reports/audit

# Verify write permissions
ls -la reports/audit/
```

### Performance Issues

#### Slow Scans
- **Reduce file patterns**: Exclude unnecessary files
- **Increase timeout**: Adjust max scan time in config
- **Parallel scanning**: Enable parallel processing

#### Memory Issues
- **Reduce batch size**: Process fewer files at once
- **Increase memory limit**: Adjust Node.js memory settings
- **Optimize patterns**: Use more specific file patterns

## Integration with Other Tools

### Existing Security Tools
- **Dependabot**: Dependency vulnerability alerts
- **CodeQL**: GitHub's semantic code analysis
- **SonarQube**: Code quality and security
- **Snyk**: Vulnerability scanning

### CI/CD Integration
- **GitHub Actions**: Automated scanning workflow
- **Vercel**: Deployment security checks
- **CircleCI**: Build-time security validation
- **Jenkins**: Pipeline security integration

## Support & Resources

### Documentation
- [RepoAudit Documentation](https://docs.repoaudit.com)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)
- [Compliance Standards](https://www.nist.gov/cyberframework)

### Community
- [GitHub Issues](https://github.com/repoaudit/repoaudit/issues)
- [Discord Community](https://discord.gg/repoaudit)
- [Security Forums](https://security.stackexchange.com)

### Training
- [Security Training](https://owasp.org/www-project-web-security-testing-guide/)
- [Compliance Training](https://www.nist.gov/cyberframework/training)
- [Best Practices](https://github.com/shieldfy/API-Security-Checklist)

---

**Need help?** Check the troubleshooting section above or reach out to the RepoAudit community for support.
