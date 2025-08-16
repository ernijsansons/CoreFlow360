#!/usr/bin/env tsx

/**
 * CoreFlow360 - SAML SSO Setup Script
 * 
 * Automated setup for SAML 2.0 enterprise SSO integration
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { samlAuth } from '../src/lib/auth/saml/saml-strategy';

interface SAMLSetupConfig {
  provider: 'okta' | 'azure' | 'google' | 'adfs' | 'onelogin' | 'ping' | 'custom';
  tenantId: string;
  baseUrl: string;
  environment: 'development' | 'staging' | 'production';
}

class SAMLSetup {
  private config: SAMLSetupConfig;

  constructor(config: SAMLSetupConfig) {
    this.config = config;
  }

  async setup(): Promise<void> {
    console.log('🔐 Setting up CoreFlow360 SAML SSO integration...\n');

    try {
      await this.validateDependencies();
      await this.generateCertificates();
      await this.createConfigurationTemplates();
      await this.setupNginxConfig();
      await this.createDocumentation();
      await this.initializeSAMLStrategy();

      console.log('\n✅ SAML SSO setup completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Review the generated configuration templates');
      console.log('2. Configure your Identity Provider using the metadata');
      console.log('3. Update your IdP settings in the admin panel');
      console.log('4. Test the SAML connection');

    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  private async validateDependencies(): Promise<void> {
    console.log('🔍 Validating SAML dependencies...');

    const requiredPackages = [
      '@node-saml/passport-saml',
      '@node-saml/node-saml',
      'passport',
      'passport-strategy'
    ];

    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const installedPackages = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    const missingPackages = requiredPackages.filter(pkg => !installedPackages[pkg]);

    if (missingPackages.length > 0) {
      console.log('📦 Installing missing SAML packages...');
      execSync(`npm install ${missingPackages.join(' ')}`, { stdio: 'inherit' });
    }

    console.log('✅ SAML dependencies validated');
  }

  private async generateCertificates(): Promise<void> {
    console.log('🔑 Generating SAML certificates...');

    const certDir = path.join(process.cwd(), 'certificates', 'saml');
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    const keyPath = path.join(certDir, 'sp-private-key.pem');
    const certPath = path.join(certDir, 'sp-certificate.pem');

    // Generate private key
    execSync(`openssl genrsa -out ${keyPath} 2048`, { stdio: 'inherit' });

    // Generate certificate
    const subject = `/C=US/ST=State/L=City/O=CoreFlow360/OU=IT/CN=${this.config.baseUrl}`;
    execSync(`openssl req -new -x509 -key ${keyPath} -out ${certPath} -days 365 -subj "${subject}"`, { 
      stdio: 'inherit' 
    });

    console.log('✅ SAML certificates generated');
  }

  private async createConfigurationTemplates(): Promise<void> {
    console.log('⚙️ Creating configuration templates...');

    const templatesDir = path.join(process.cwd(), 'saml-templates');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    // Create provider-specific templates
    const templates = this.getProviderTemplates();
    
    for (const [provider, template] of Object.entries(templates)) {
      fs.writeFileSync(
        path.join(templatesDir, `${provider}-config.json`),
        JSON.stringify(template, null, 2)
      );
    }

    // Create integration guide
    const integrationGuide = this.generateIntegrationGuide();
    fs.writeFileSync(
      path.join(templatesDir, 'SAML_INTEGRATION_GUIDE.md'),
      integrationGuide
    );

    console.log('✅ Configuration templates created');
  }

  private getProviderTemplates(): Record<string, any> {
    const baseCallbackUrl = `${this.config.baseUrl}/api/auth/saml/callback`;
    const metadataUrl = `${this.config.baseUrl}/api/auth/saml/metadata/${this.config.tenantId}`;

    return {
      okta: {
        idpName: 'okta',
        displayName: 'Okta SSO',
        entryPoint: 'https://your-company.okta.com/app/your-app-id/sso/saml',
        certificate: 'REPLACE_WITH_OKTA_CERTIFICATE',
        signatureAlgorithm: 'sha256',
        identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
        attributeMapping: {
          email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
          firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
          lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
          displayName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
          groups: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/groups'
        },
        callbackUrl: baseCallbackUrl,
        metadataUrl: `${metadataUrl}/okta`
      },
      azure: {
        idpName: 'azure',
        displayName: 'Azure AD SSO',
        entryPoint: 'https://login.microsoftonline.com/your-tenant-id/saml2',
        certificate: 'REPLACE_WITH_AZURE_CERTIFICATE',
        signatureAlgorithm: 'sha256',
        identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
        attributeMapping: {
          email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
          firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
          lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
          displayName: 'http://schemas.microsoft.com/identity/claims/displayname',
          groups: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups'
        },
        callbackUrl: baseCallbackUrl,
        metadataUrl: `${metadataUrl}/azure`
      },
      google: {
        idpName: 'google',
        displayName: 'Google Workspace SSO',
        entryPoint: 'https://accounts.google.com/o/saml2/idp?idpid=your-idp-id',
        certificate: 'REPLACE_WITH_GOOGLE_CERTIFICATE',
        signatureAlgorithm: 'sha256',
        identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
        attributeMapping: {
          email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
          firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
          lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
          displayName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
        },
        callbackUrl: baseCallbackUrl,
        metadataUrl: `${metadataUrl}/google`
      }
    };
  }

  private generateIntegrationGuide(): string {
    return `# CoreFlow360 SAML SSO Integration Guide

## Overview
This guide walks you through setting up SAML 2.0 Single Sign-On (SSO) with various identity providers.

## Prerequisites
- Admin access to your Identity Provider (IdP)
- CoreFlow360 tenant admin privileges
- SSL certificate for your domain

## General Setup Steps

### 1. Configure Service Provider (CoreFlow360)
1. Access the admin panel at \`${this.config.baseUrl}/admin\`
2. Navigate to "SAML Configuration"
3. Click "Add SAML Provider"
4. Fill in the configuration details for your IdP

### 2. Configure Identity Provider
Use the metadata URL provided after creating the configuration:
\`${this.config.baseUrl}/api/auth/saml/metadata/${this.config.tenantId}/[idp-name]\`

### 3. Test the Integration
1. Use the "Test Connection" button in the admin panel
2. Try logging in via the SAML login URL
3. Verify user provisioning and attribute mapping

## Provider-Specific Instructions

### Okta Configuration
1. In Okta Admin Console, create a new SAML app
2. Use the SP metadata URL from CoreFlow360
3. Configure attribute mappings:
   - \`user.email\` → \`email\`
   - \`user.firstName\` → \`firstName\`
   - \`user.lastName\` → \`lastName\`
4. Download the Okta certificate and paste into CoreFlow360

### Azure AD Configuration
1. In Azure AD, create a new Enterprise Application
2. Select "SAML" as the single sign-on method
3. Upload the SP metadata XML
4. Configure user attributes and claims
5. Download the Azure AD certificate

### Google Workspace Configuration
1. In Google Admin Console, go to Apps > SAML apps
2. Create a new SAML app using metadata upload
3. Configure attribute mapping in Google
4. Download the Google certificate

## Security Considerations

### Certificate Management
- Rotate certificates annually
- Store private keys securely
- Use strong signature algorithms (SHA-256 or higher)

### Network Security
- Use HTTPS for all SAML endpoints
- Implement proper firewall rules
- Monitor SAML authentication logs

### User Provisioning
- Enable auto-provisioning carefully
- Review default role assignments
- Implement domain restrictions as needed

## Troubleshooting

### Common Issues
1. **Clock Skew**: Adjust \`acceptedClockSkewMs\` setting
2. **Certificate Mismatch**: Verify certificate format and validity
3. **Attribute Mapping**: Check SAML assertion attributes
4. **Signature Validation**: Ensure signature algorithm matches

### Debug Steps
1. Check the SAML audit logs in the admin panel
2. Use browser developer tools to inspect SAML responses
3. Verify IdP configuration matches SP metadata
4. Test with multiple users to verify provisioning

## Support
For additional support, contact the CoreFlow360 team or refer to the full documentation.

Generated on: ${new Date().toISOString()}
Environment: ${this.config.environment}
Base URL: ${this.config.baseUrl}
`;
  }

  private async setupNginxConfig(): Promise<void> {
    console.log('🌐 Creating Nginx configuration...');

    const nginxConfig = `# CoreFlow360 SAML SSO Nginx Configuration
# Add this to your main nginx configuration

server {
    listen 443 ssl;
    server_name ${this.config.baseUrl.replace('https://', '')};

    # SSL configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # SAML-specific headers
    location /api/auth/saml/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SAML response can be large
        client_max_body_size 10M;
        proxy_read_timeout 60s;
    }

    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name ${this.config.baseUrl.replace('https://', '')};
    return 301 https://$server_name$request_uri;
}`;

    fs.writeFileSync('nginx-saml.conf', nginxConfig);
    console.log('✅ Nginx configuration created');
  }

  private async createDocumentation(): Promise<void> {
    console.log('📚 Creating SAML documentation...');

    const docsDir = path.join(process.cwd(), 'docs', 'saml');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Create API documentation
    const apiDocs = `# SAML SSO API Documentation

## Endpoints

### Authentication Flow
- \`GET /api/auth/saml/login/{tenantId}/{idpName}\` - Initiate SAML login
- \`POST /api/auth/saml/callback\` - Handle SAML response
- \`GET /api/auth/saml/metadata/{tenantId}/{idpName}\` - Get SP metadata

### Configuration Management
- \`GET /api/admin/saml\` - List SAML configurations
- \`POST /api/admin/saml\` - Create SAML configuration
- \`PATCH /api/admin/saml\` - Update SAML configuration
- \`DELETE /api/admin/saml\` - Delete SAML configuration
- \`POST /api/admin/saml/test\` - Test SAML connection

## Authentication Flow

1. User clicks SSO login button
2. Redirect to \`/api/auth/saml/login/{tenantId}/{idpName}\`
3. User is redirected to IdP for authentication
4. IdP sends SAML response to \`/api/auth/saml/callback\`
5. CoreFlow360 validates response and creates user session
6. User is redirected to dashboard

## Error Handling

The system handles various SAML errors:
- Invalid signatures
- Clock skew issues
- Missing attributes
- Domain restrictions
- Auto-provisioning failures

All errors are logged for audit purposes.
`;

    fs.writeFileSync(path.join(docsDir, 'api-documentation.md'), apiDocs);

    // Create deployment guide
    const deploymentGuide = `# SAML SSO Deployment Guide

## Production Deployment Checklist

### Security
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure proper CORS headers
- [ ] Set up certificate rotation schedule
- [ ] Enable SAML audit logging
- [ ] Configure session security settings

### Infrastructure
- [ ] Set up load balancer health checks
- [ ] Configure monitoring and alerting
- [ ] Set up log aggregation
- [ ] Configure backup procedures
- [ ] Test disaster recovery

### Identity Provider
- [ ] Configure production IdP settings
- [ ] Set up user provisioning rules
- [ ] Configure attribute mappings
- [ ] Test with multiple user types
- [ ] Set up admin notifications

### Monitoring
- [ ] Monitor SAML authentication success rates
- [ ] Set up alerts for failed authentications
- [ ] Monitor certificate expiration
- [ ] Track user provisioning metrics
- [ ] Monitor session security

## Environment Variables

\`\`\`env
# SAML Configuration
SAML_ENABLED=true
SAML_CERT_PATH=/path/to/certificates/saml/
SAML_AUDIT_ENABLED=true

# Session Configuration
SESSION_SECRET=your-secure-session-secret
SESSION_TIMEOUT=3600000

# Security
ENFORCE_HTTPS=true
CSRF_PROTECTION=true
\`\`\`
`;

    fs.writeFileSync(path.join(docsDir, 'deployment-guide.md'), deploymentGuide);
    console.log('✅ SAML documentation created');
  }

  private async initializeSAMLStrategy(): Promise<void> {
    console.log('🚀 Initializing SAML strategy...');

    try {
      // Load any existing configurations
      await samlAuth.loadConfigurations();
      console.log('✅ SAML strategy initialized');
    } catch (error) {
      console.error('Warning: Could not initialize SAML strategy:', error.message);
      console.log('This is expected if the database is not yet set up');
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
CoreFlow360 SAML SSO Setup

Usage: tsx scripts/setup-saml.ts [options]

Options:
  --provider <provider>     IdP provider (okta, azure, google, adfs, onelogin, ping, custom)
  --tenant-id <id>         Tenant ID for SAML configuration
  --base-url <url>         Base URL of your CoreFlow360 instance
  --environment <env>      Environment (development, staging, production)
  --help, -h               Show this help message

Examples:
  tsx scripts/setup-saml.ts --provider okta --tenant-id tenant-123 --base-url https://app.company.com
  tsx scripts/setup-saml.ts --provider azure --tenant-id tenant-456 --environment production
`);
    process.exit(0);
  }

  const config: SAMLSetupConfig = {
    provider: (args[args.indexOf('--provider') + 1] as any) || 'okta',
    tenantId: args[args.indexOf('--tenant-id') + 1] || 'default-tenant',
    baseUrl: args[args.indexOf('--base-url') + 1] || 'http://localhost:3000',
    environment: (args[args.indexOf('--environment') + 1] as any) || 'development'
  };

  const setup = new SAMLSetup(config);
  await setup.setup();
}

if (require.main === module) {
  main().catch(console.error);
}

export { SAMLSetup };