/**
 * CoreFlow360 - SAML 2.0 Strategy
 * 
 * Enterprise SSO authentication with SAML 2.0 protocol support
 * Supports multiple identity providers (IdPs) per tenant
 */

import { Strategy as SamlStrategy } from '@node-saml/passport-saml';
import { Profile } from '@node-saml/passport-saml/lib/types';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { telemetry } from '@/lib/telemetry/opentelemetry';

export interface SAMLConfig {
  tenantId: string;
  idpName: string;
  entryPoint: string;
  issuer: string;
  cert: string;
  privateKey?: string;
  callbackUrl: string;
  signatureAlgorithm?: 'sha1' | 'sha256' | 'sha512';
  identifierFormat?: string;
  acceptedClockSkewMs?: number;
  attributeMapping?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    department?: string;
    title?: string;
    groups?: string;
  };
  allowedDomains?: string[];
  autoProvisionUsers?: boolean;
  defaultRole?: string;
}

export interface SAMLProfile extends Profile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  department?: string;
  title?: string;
  groups?: string[];
  raw?: any;
}

export class SAMLAuthStrategy {
  private strategies: Map<string, SamlStrategy> = new Map();
  private configs: Map<string, SAMLConfig> = new Map();

  /**
   * Initialize SAML strategy for a tenant
   */
  async initializeTenantSAML(config: SAMLConfig): Promise<void> {
    const strategyKey = `${config.tenantId}:${config.idpName}`;
    
    // Create SAML strategy
    const strategy = new SamlStrategy(
      {
        entryPoint: config.entryPoint,
        issuer: config.issuer,
        cert: config.cert,
        privateKey: config.privateKey,
        callbackUrl: config.callbackUrl,
        signatureAlgorithm: config.signatureAlgorithm || 'sha256',
        identifierFormat: config.identifierFormat || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
        acceptedClockSkewMs: config.acceptedClockSkewMs || 180000, // 3 minutes
        passReqToCallback: true,
        validateInResponseTo: true,
        disableRequestedAuthnContext: false,
        forceAuthn: false,
        skipRequestCompression: false,
        authnContext: ['urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport'],
        racComparison: 'exact'
      },
      async (req: any, profile: any, done: any) => {
        try {
          const samlProfile = await this.processSAMLProfile(profile, config);
          const user = await this.findOrCreateUser(samlProfile, config);
          
          // Track successful SAML login
          telemetry.recordEvent('saml_login_success', {
            tenantId: config.tenantId,
            idpName: config.idpName,
            userId: user.id,
            email: user.email
          });

          done(null, user);
        } catch (error) {
          // Track SAML login failure
          telemetry.recordEvent('saml_login_failure', {
            tenantId: config.tenantId,
            idpName: config.idpName,
            error: error.message
          });

          done(error);
        }
      }
    );

    this.strategies.set(strategyKey, strategy);
    this.configs.set(strategyKey, config);

    // Store configuration in database
    await this.storeSAMLConfig(config);
  }

  /**
   * Get SAML strategy for tenant
   */
  getStrategy(tenantId: string, idpName: string): SamlStrategy | undefined {
    return this.strategies.get(`${tenantId}:${idpName}`);
  }

  /**
   * Process SAML profile with attribute mapping
   */
  private async processSAMLProfile(
    profile: any,
    config: SAMLConfig
  ): Promise<SAMLProfile> {
    const mapping = config.attributeMapping || {};
    
    // Extract attributes with custom mapping
    const processedProfile: SAMLProfile = {
      id: profile.nameID || profile.id || uuidv4(),
      email: this.extractAttribute(profile, mapping.email || 'email') || profile.nameID,
      firstName: this.extractAttribute(profile, mapping.firstName || 'firstName'),
      lastName: this.extractAttribute(profile, mapping.lastName || 'lastName'),
      displayName: this.extractAttribute(profile, mapping.displayName || 'displayName'),
      department: this.extractAttribute(profile, mapping.department || 'department'),
      title: this.extractAttribute(profile, mapping.title || 'title'),
      groups: this.extractGroups(profile, mapping.groups || 'groups'),
      raw: profile
    };

    // Validate required fields
    if (!processedProfile.email) {
      throw new Error('Email is required from SAML response');
    }

    // Validate email domain if configured
    if (config.allowedDomains && config.allowedDomains.length > 0) {
      const emailDomain = processedProfile.email.split('@')[1];
      if (!config.allowedDomains.includes(emailDomain)) {
        throw new Error(`Email domain ${emailDomain} is not allowed`);
      }
    }

    return processedProfile;
  }

  /**
   * Extract attribute from SAML profile
   */
  private extractAttribute(profile: any, attributePath: string): string | undefined {
    if (!attributePath) return undefined;

    // Handle nested attributes (e.g., "user.email")
    const parts = attributePath.split('.');
    let value: any = profile;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        // Check direct property
        if (value[part] !== undefined) {
          value = value[part];
        }
        // Check attributes object
        else if (value.attributes && value.attributes[part] !== undefined) {
          value = value.attributes[part];
        }
        // Check claims
        else if (value.claims && value.claims[part] !== undefined) {
          value = value.claims[part];
        }
        else {
          return undefined;
        }
      } else {
        return undefined;
      }
    }

    // Handle array values (take first element)
    if (Array.isArray(value)) {
      value = value[0];
    }

    return typeof value === 'string' ? value : undefined;
  }

  /**
   * Extract groups from SAML profile
   */
  private extractGroups(profile: any, groupsPath: string): string[] {
    const groupsValue = this.extractAttribute(profile, groupsPath);
    
    if (!groupsValue) return [];
    
    // Handle comma-separated groups
    if (typeof groupsValue === 'string' && groupsValue.includes(',')) {
      return groupsValue.split(',').map(g => g.trim()).filter(Boolean);
    }
    
    // Handle array of groups
    if (Array.isArray(groupsValue)) {
      return groupsValue.filter(g => typeof g === 'string');
    }
    
    // Single group
    if (typeof groupsValue === 'string') {
      return [groupsValue];
    }
    
    return [];
  }

  /**
   * Find or create user from SAML profile
   */
  private async findOrCreateUser(
    profile: SAMLProfile,
    config: SAMLConfig
  ): Promise<any> {
    return await telemetry.traceBusinessOperation(
      'saml.findOrCreateUser',
      async () => {
        // Try to find existing user
        let user = await prisma.user.findFirst({
          where: {
            email: profile.email,
            tenantId: config.tenantId
          }
        });

        if (!user && config.autoProvisionUsers) {
          // Create new user
          user = await prisma.user.create({
            data: {
              id: uuidv4(),
              email: profile.email,
              name: profile.displayName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email,
              tenantId: config.tenantId,
              role: config.defaultRole || 'USER',
              authProvider: 'saml',
              authProviderId: profile.id,
              isActive: true,
              emailVerified: new Date(), // SAML users are pre-verified
              metadata: {
                saml: {
                  idpName: config.idpName,
                  nameId: profile.id,
                  firstName: profile.firstName,
                  lastName: profile.lastName,
                  department: profile.department,
                  title: profile.title,
                  groups: profile.groups
                }
              }
            }
          });

          // Create UserProfile
          await prisma.userProfile.create({
            data: {
              id: uuidv4(),
              userId: user.id,
              firstName: profile.firstName,
              lastName: profile.lastName,
              title: profile.title,
              department: profile.department,
              tenantId: config.tenantId
            }
          });

          telemetry.recordEvent('saml_user_provisioned', {
            userId: user.id,
            email: user.email,
            tenantId: config.tenantId,
            idpName: config.idpName
          });

        } else if (user) {
          // Update existing user's SAML metadata
          await prisma.user.update({
            where: { id: user.id },
            data: {
              metadata: {
                ...user.metadata as any,
                saml: {
                  idpName: config.idpName,
                  nameId: profile.id,
                  firstName: profile.firstName,
                  lastName: profile.lastName,
                  department: profile.department,
                  title: profile.title,
                  groups: profile.groups,
                  lastLoginAt: new Date().toISOString()
                }
              }
            }
          });

          // Update UserProfile if exists
          await prisma.userProfile.updateMany({
            where: { userId: user.id },
            data: {
              firstName: profile.firstName || undefined,
              lastName: profile.lastName || undefined,
              title: profile.title || undefined,
              department: profile.department || undefined
            }
          });
        }

        if (!user) {
          throw new Error('User not found and auto-provisioning is disabled');
        }

        return user;
      },
      {
        entityType: 'user',
        operationType: 'saml_auth',
        tenantId: config.tenantId,
        entityId: profile.email
      }
    );
  }

  /**
   * Store SAML configuration in database
   */
  private async storeSAMLConfig(config: SAMLConfig): Promise<void> {
    await prisma.sAMLConfiguration.upsert({
      where: {
        tenantId_idpName: {
          tenantId: config.tenantId,
          idpName: config.idpName
        }
      },
      update: {
        entryPoint: config.entryPoint,
        issuer: config.issuer,
        certificate: config.cert,
        callbackUrl: config.callbackUrl,
        signatureAlgorithm: config.signatureAlgorithm,
        identifierFormat: config.identifierFormat,
        acceptedClockSkewMs: config.acceptedClockSkewMs,
        attributeMapping: config.attributeMapping,
        allowedDomains: config.allowedDomains,
        autoProvisionUsers: config.autoProvisionUsers,
        defaultRole: config.defaultRole,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        id: uuidv4(),
        tenantId: config.tenantId,
        idpName: config.idpName,
        entryPoint: config.entryPoint,
        issuer: config.issuer,
        certificate: config.cert,
        callbackUrl: config.callbackUrl,
        signatureAlgorithm: config.signatureAlgorithm,
        identifierFormat: config.identifierFormat,
        acceptedClockSkewMs: config.acceptedClockSkewMs,
        attributeMapping: config.attributeMapping,
        allowedDomains: config.allowedDomains,
        autoProvisionUsers: config.autoProvisionUsers,
        defaultRole: config.defaultRole,
        isActive: true
      }
    });
  }

  /**
   * Load SAML configurations from database
   */
  async loadConfigurations(): Promise<void> {
    const configs = await prisma.sAMLConfiguration.findMany({
      where: { isActive: true }
    });

    for (const dbConfig of configs) {
      const config: SAMLConfig = {
        tenantId: dbConfig.tenantId,
        idpName: dbConfig.idpName,
        entryPoint: dbConfig.entryPoint,
        issuer: dbConfig.issuer,
        cert: dbConfig.certificate,
        callbackUrl: dbConfig.callbackUrl,
        signatureAlgorithm: dbConfig.signatureAlgorithm as any,
        identifierFormat: dbConfig.identifierFormat || undefined,
        acceptedClockSkewMs: dbConfig.acceptedClockSkewMs || undefined,
        attributeMapping: dbConfig.attributeMapping as any,
        allowedDomains: dbConfig.allowedDomains,
        autoProvisionUsers: dbConfig.autoProvisionUsers,
        defaultRole: dbConfig.defaultRole || undefined
      };

      await this.initializeTenantSAML(config);
    }

    console.log(`📋 Loaded ${configs.length} SAML configurations`);
  }

  /**
   * Generate SAML metadata for Service Provider
   */
  generateSPMetadata(tenantId: string, idpName: string): string | null {
    const config = this.configs.get(`${tenantId}:${idpName}`);
    if (!config) return null;

    const metadata = `<?xml version="1.0"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
                  entityID="${config.issuer}">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"
                   AuthnRequestsSigned="true"
                   WantAssertionsSigned="true">
    <NameIDFormat>${config.identifierFormat || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'}</NameIDFormat>
    <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                              Location="${config.callbackUrl}"
                              index="0"
                              isDefault="true" />
  </SPSSODescriptor>
  <Organization>
    <OrganizationName xml:lang="en">CoreFlow360</OrganizationName>
    <OrganizationDisplayName xml:lang="en">CoreFlow360 - Autonomous Business Operating System</OrganizationDisplayName>
    <OrganizationURL xml:lang="en">https://coreflow360.com</OrganizationURL>
  </Organization>
  <ContactPerson contactType="technical">
    <GivenName>Technical Support</GivenName>
    <EmailAddress>support@coreflow360.com</EmailAddress>
  </ContactPerson>
</EntityDescriptor>`;

    return metadata;
  }

  /**
   * Validate SAML response signature
   */
  async validateResponseSignature(
    samlResponse: string,
    tenantId: string,
    idpName: string
  ): Promise<boolean> {
    const config = this.configs.get(`${tenantId}:${idpName}`);
    if (!config) return false;

    try {
      // This would use a proper SAML library for signature validation
      // For now, returning true as placeholder
      return true;
    } catch (error) {
      telemetry.recordEvent('saml_signature_validation_failed', {
        tenantId,
        idpName,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Handle SAML logout
   */
  async handleLogout(
    user: any,
    tenantId: string,
    idpName: string
  ): Promise<string | null> {
    const strategy = this.getStrategy(tenantId, idpName);
    if (!strategy) return null;

    try {
      const logoutUrl = strategy.getLogoutUrl(user, {});
      
      telemetry.recordEvent('saml_logout_initiated', {
        userId: user.id,
        tenantId,
        idpName
      });

      return logoutUrl;
    } catch (error) {
      console.error('SAML logout error:', error);
      return null;
    }
  }

  /**
   * Get all active SAML configurations for a tenant
   */
  async getTenantSAMLProviders(tenantId: string): Promise<Array<{
    idpName: string;
    displayName: string;
    loginUrl: string;
  }>> {
    const configs = await prisma.sAMLConfiguration.findMany({
      where: {
        tenantId,
        isActive: true
      },
      select: {
        idpName: true,
        displayName: true
      }
    });

    return configs.map(config => ({
      idpName: config.idpName,
      displayName: config.displayName || config.idpName,
      loginUrl: `/api/auth/saml/login/${tenantId}/${config.idpName}`
    }));
  }
}

// Global SAML strategy manager
export const samlAuth = new SAMLAuthStrategy();