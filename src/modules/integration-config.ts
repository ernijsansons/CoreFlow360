/**
 * CoreFlow360 - External Module Integration Configuration
 * Defines connection settings and capabilities for each external module
 */

export interface ModuleIntegrationConfig {
  id: string
  name: string
  description: string
  category: 'accounting' | 'crm' | 'erp' | 'ai' | 'operations' | 'platform'
  connectionType: 'rest' | 'graphql' | 'grpc' | 'subprocess'
  deploymentType: 'docker' | 'cloud' | 'self-hosted' | 'embedded'
  authMethod: 'api-key' | 'oauth2' | 'jwt' | 'basic' | 'none'
  healthCheckEndpoint?: string
  capabilities: string[]
  requiredEnvVars: string[]
  optionalEnvVars?: string[]
  documentation: string
  officialWebsite: string
  dockerImage?: string
  minVersion?: string
}

export const MODULE_INTEGRATIONS: Record<string, ModuleIntegrationConfig> = {
  bigcapital: {
    id: 'bigcapital',
    name: 'Bigcapital',
    description: 'Open-source accounting and bookkeeping software',
    category: 'accounting',
    connectionType: 'rest',
    deploymentType: 'docker',
    authMethod: 'jwt',
    healthCheckEndpoint: '/api/health',
    capabilities: [
      'invoicing',
      'expenses',
      'banking',
      'financial_reports',
      'inventory_accounting',
      'multi_currency'
    ],
    requiredEnvVars: [
      'BIGCAPITAL_API_URL',
      'BIGCAPITAL_TENANT_ID',
      'BIGCAPITAL_AUTH_TOKEN'
    ],
    optionalEnvVars: [
      'BIGCAPITAL_WEBHOOK_SECRET'
    ],
    documentation: 'https://docs.bigcapital.app',
    officialWebsite: 'https://bigcapital.app',
    dockerImage: 'bigcapital/bigcapital:latest',
    minVersion: '0.8.0'
  },

  twenty: {
    id: 'twenty',
    name: 'Twenty',
    description: 'Modern open-source CRM',
    category: 'crm',
    connectionType: 'graphql',
    deploymentType: 'docker',
    authMethod: 'jwt',
    healthCheckEndpoint: '/healthz',
    capabilities: [
      'contact_management',
      'deal_pipeline',
      'activity_tracking',
      'email_integration',
      'custom_fields',
      'api_webhooks'
    ],
    requiredEnvVars: [
      'TWENTY_API_URL',
      'TWENTY_API_TOKEN'
    ],
    optionalEnvVars: [
      'TWENTY_WORKSPACE_ID',
      'TWENTY_WEBHOOK_URL'
    ],
    documentation: 'https://docs.twenty.com',
    officialWebsite: 'https://twenty.com',
    dockerImage: 'twentycrm/twenty:latest',
    minVersion: '0.2.0'
  },

  fingpt: {
    id: 'fingpt',
    name: 'FinGPT',
    description: 'Open-source financial AI for sentiment analysis',
    category: 'ai',
    connectionType: 'subprocess',
    deploymentType: 'docker',
    authMethod: 'none',
    capabilities: [
      'sentiment_analysis',
      'financial_nlp',
      'market_prediction',
      'news_analysis',
      'earning_calls_analysis'
    ],
    requiredEnvVars: [
      'FINGPT_MODEL_PATH',
      'FINGPT_PYTHON_PATH'
    ],
    optionalEnvVars: [
      'FINGPT_GPU_ENABLED',
      'FINGPT_MAX_TOKENS'
    ],
    documentation: 'https://github.com/AI4Finance-Foundation/FinGPT',
    officialWebsite: 'https://github.com/AI4Finance-Foundation/FinGPT',
    dockerImage: 'coreflow360/fingpt-service:latest'
  },

  finrobot: {
    id: 'finrobot',
    name: 'FinRobot',
    description: 'AI-powered financial analysis and forecasting',
    category: 'ai',
    connectionType: 'rest',
    deploymentType: 'docker',
    authMethod: 'api-key',
    healthCheckEndpoint: '/health',
    capabilities: [
      'financial_forecasting',
      'risk_assessment',
      'portfolio_optimization',
      'market_analysis',
      'automated_trading_signals'
    ],
    requiredEnvVars: [
      'FINROBOT_API_URL',
      'FINROBOT_API_KEY'
    ],
    optionalEnvVars: [
      'FINROBOT_MODEL_VERSION',
      'FINROBOT_RISK_THRESHOLD'
    ],
    documentation: 'https://github.com/AI4Finance-Foundation/FinRobot',
    officialWebsite: 'https://github.com/AI4Finance-Foundation/FinRobot',
    dockerImage: 'coreflow360/finrobot-service:latest'
  },

  dolibarr: {
    id: 'dolibarr',
    name: 'Dolibarr',
    description: 'Open-source ERP & CRM',
    category: 'erp',
    connectionType: 'rest',
    deploymentType: 'self-hosted',
    authMethod: 'api-key',
    healthCheckEndpoint: '/api/index.php/status',
    capabilities: [
      'crm',
      'invoicing',
      'inventory',
      'project_management',
      'hr',
      'pos'
    ],
    requiredEnvVars: [
      'DOLIBARR_API_URL',
      'DOLIBARR_API_KEY'
    ],
    optionalEnvVars: [
      'DOLIBARR_ENTITY',
      'DOLIBARR_LANG'
    ],
    documentation: 'https://docs.dolibarr.org',
    officialWebsite: 'https://www.dolibarr.org',
    dockerImage: 'dolibarr/dolibarr:latest',
    minVersion: '17.0'
  },

  erpnext: {
    id: 'erpnext',
    name: 'ERPNext',
    description: 'Full-featured open-source ERP',
    category: 'erp',
    connectionType: 'rest',
    deploymentType: 'cloud',
    authMethod: 'oauth2',
    healthCheckEndpoint: '/api/method/ping',
    capabilities: [
      'accounting',
      'inventory',
      'manufacturing',
      'crm',
      'hr',
      'project_management',
      'asset_management'
    ],
    requiredEnvVars: [
      'ERPNEXT_API_URL',
      'ERPNEXT_API_KEY',
      'ERPNEXT_API_SECRET'
    ],
    documentation: 'https://docs.erpnext.com',
    officialWebsite: 'https://erpnext.com',
    minVersion: '14.0'
  },

  idurar: {
    id: 'idurar',
    name: 'IDURAR',
    description: 'Open-source ERP/CRM solution',
    category: 'erp',
    connectionType: 'rest',
    deploymentType: 'docker',
    authMethod: 'jwt',
    healthCheckEndpoint: '/api/health',
    capabilities: [
      'crm',
      'invoicing',
      'quotes',
      'payments',
      'expenses',
      'inventory_basic'
    ],
    requiredEnvVars: [
      'IDURAR_API_URL',
      'IDURAR_JWT_TOKEN'
    ],
    documentation: 'https://github.com/idurar/idurar-erp-crm',
    officialWebsite: 'https://idurarapp.com',
    dockerImage: 'idurar/idurar-erp-crm:latest'
  },

  plane: {
    id: 'plane',
    name: 'Plane',
    description: 'Open-source project management',
    category: 'operations',
    connectionType: 'rest',
    deploymentType: 'docker',
    authMethod: 'jwt',
    healthCheckEndpoint: '/api/health',
    capabilities: [
      'issue_tracking',
      'project_planning',
      'sprints',
      'kanban_boards',
      'roadmaps',
      'time_tracking'
    ],
    requiredEnvVars: [
      'PLANE_API_URL',
      'PLANE_API_TOKEN'
    ],
    optionalEnvVars: [
      'PLANE_WORKSPACE_SLUG'
    ],
    documentation: 'https://docs.plane.so',
    officialWebsite: 'https://plane.so',
    dockerImage: 'makeplane/plane:latest'
  },

  inventory: {
    id: 'inventory',
    name: 'Inventory Management',
    description: 'Simple inventory management system',
    category: 'operations',
    connectionType: 'rest',
    deploymentType: 'embedded',
    authMethod: 'basic',
    capabilities: [
      'stock_tracking',
      'warehouse_management',
      'purchase_orders',
      'stock_alerts',
      'barcode_scanning'
    ],
    requiredEnvVars: [
      'INVENTORY_DB_URL'
    ],
    documentation: '/docs/inventory',
    officialWebsite: 'https://coreflow360.com'
  },

  nocobase: {
    id: 'nocobase',
    name: 'NocoBase',
    description: 'No-code development platform',
    category: 'platform',
    connectionType: 'rest',
    deploymentType: 'docker',
    authMethod: 'jwt',
    healthCheckEndpoint: '/api/health',
    capabilities: [
      'custom_apps',
      'workflow_automation',
      'data_modeling',
      'plugin_system',
      'multi_tenant'
    ],
    requiredEnvVars: [
      'NOCOBASE_API_URL',
      'NOCOBASE_API_TOKEN'
    ],
    documentation: 'https://docs.nocobase.com',
    officialWebsite: 'https://www.nocobase.com',
    dockerImage: 'nocobase/nocobase:latest'
  }
}

// Helper functions for module integration
export function getModuleConfig(moduleId: string): ModuleIntegrationConfig | undefined {
  return MODULE_INTEGRATIONS[moduleId]
}

export function getModulesByCategory(category: ModuleIntegrationConfig['category']): ModuleIntegrationConfig[] {
  return Object.values(MODULE_INTEGRATIONS).filter(module => module.category === category)
}

export function validateModuleEnvVars(moduleId: string): { valid: boolean; missing: string[] } {
  const config = getModuleConfig(moduleId)
  if (!config) return { valid: false, missing: ['Module not found'] }

  const missing = config.requiredEnvVars.filter(envVar => !process.env[envVar])
  return { valid: missing.length === 0, missing }
}

export function getModuleHealthEndpoint(moduleId: string): string | null {
  const config = getModuleConfig(moduleId)
  if (!config || !config.healthCheckEndpoint) return null

  const baseUrl = process.env[`${moduleId.toUpperCase()}_API_URL`]
  if (!baseUrl) return null

  return `${baseUrl}${config.healthCheckEndpoint}`
}