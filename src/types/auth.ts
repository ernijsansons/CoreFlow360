/**
 * CoreFlow360 - Authentication Types
 * Comprehensive role-based authentication system
 */

// User roles hierarchy
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  DEPARTMENT_MANAGER = 'DEPARTMENT_MANAGER',
  TEAM_LEAD = 'TEAM_LEAD',
  USER = 'USER',
  GUEST = 'GUEST'
}

// Role hierarchy for permission inheritance
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ORG_ADMIN]: 80,
  [UserRole.DEPARTMENT_MANAGER]: 60,
  [UserRole.TEAM_LEAD]: 40,
  [UserRole.USER]: 20,
  [UserRole.GUEST]: 10
}

// Granular permissions
export enum Permission {
  // User Management
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  MANAGE_ROLES = 'manage_roles',
  
  // Module Management
  VIEW_MODULES = 'view_modules',
  ACTIVATE_MODULES = 'activate_modules',
  DEACTIVATE_MODULES = 'deactivate_modules',
  CONFIGURE_MODULES = 'configure_modules',
  
  // Financial
  VIEW_FINANCIAL_REPORTS = 'view_financial_reports',
  EDIT_FINANCIAL_DATA = 'edit_financial_data',
  APPROVE_EXPENSES = 'approve_expenses',
  MANAGE_BUDGETS = 'manage_budgets',
  
  // CRM
  VIEW_CUSTOMERS = 'view_customers',
  EDIT_CUSTOMERS = 'edit_customers',
  DELETE_CUSTOMERS = 'delete_customers',
  VIEW_DEALS = 'view_deals',
  MANAGE_DEALS = 'manage_deals',
  
  // Projects
  VIEW_PROJECTS = 'view_projects',
  CREATE_PROJECTS = 'create_projects',
  EDIT_PROJECTS = 'edit_projects',
  DELETE_PROJECTS = 'delete_projects',
  ASSIGN_RESOURCES = 'assign_resources',
  
  // AI & Analytics
  VIEW_AI_INSIGHTS = 'view_ai_insights',
  CONFIGURE_AI = 'configure_ai',
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_REPORTS = 'export_reports',
  
  // System
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  MANAGE_INTEGRATIONS = 'manage_integrations',
  CONFIGURE_WEBHOOKS = 'configure_webhooks',
  MANAGE_API_KEYS = 'manage_api_keys',
  
  // IoT
  VIEW_IOT_DEVICES = 'view_iot_devices',
  MANAGE_IOT_DEVICES = 'manage_iot_devices',
  VIEW_SENSOR_DATA = 'view_sensor_data',
  CONFIGURE_ALERTS = 'configure_alerts',
  
  // Super Admin Only
  MANAGE_TENANTS = 'manage_tenants',
  VIEW_SYSTEM_HEALTH = 'view_system_health',
  CONFIGURE_GLOBAL_SETTINGS = 'configure_global_settings',
  MANAGE_FEATURE_FLAGS = 'manage_feature_flags',
  VIEW_REVENUE_METRICS = 'view_revenue_metrics'
}

// Role-based permission mappings
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission), // All permissions
  
  [UserRole.ORG_ADMIN]: [
    // User Management
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.EDIT_USERS,
    Permission.DELETE_USERS,
    Permission.MANAGE_ROLES,
    // Module Management
    Permission.VIEW_MODULES,
    Permission.ACTIVATE_MODULES,
    Permission.DEACTIVATE_MODULES,
    Permission.CONFIGURE_MODULES,
    // Financial
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.EDIT_FINANCIAL_DATA,
    Permission.APPROVE_EXPENSES,
    Permission.MANAGE_BUDGETS,
    // All other org-level permissions
    Permission.VIEW_CUSTOMERS,
    Permission.EDIT_CUSTOMERS,
    Permission.DELETE_CUSTOMERS,
    Permission.VIEW_DEALS,
    Permission.MANAGE_DEALS,
    Permission.VIEW_PROJECTS,
    Permission.CREATE_PROJECTS,
    Permission.EDIT_PROJECTS,
    Permission.DELETE_PROJECTS,
    Permission.ASSIGN_RESOURCES,
    Permission.VIEW_AI_INSIGHTS,
    Permission.CONFIGURE_AI,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.MANAGE_INTEGRATIONS,
    Permission.CONFIGURE_WEBHOOKS,
    Permission.MANAGE_API_KEYS,
    Permission.VIEW_IOT_DEVICES,
    Permission.MANAGE_IOT_DEVICES,
    Permission.VIEW_SENSOR_DATA,
    Permission.CONFIGURE_ALERTS
  ],
  
  [UserRole.DEPARTMENT_MANAGER]: [
    Permission.VIEW_USERS,
    Permission.VIEW_MODULES,
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.APPROVE_EXPENSES,
    Permission.VIEW_CUSTOMERS,
    Permission.EDIT_CUSTOMERS,
    Permission.VIEW_DEALS,
    Permission.MANAGE_DEALS,
    Permission.VIEW_PROJECTS,
    Permission.CREATE_PROJECTS,
    Permission.EDIT_PROJECTS,
    Permission.ASSIGN_RESOURCES,
    Permission.VIEW_AI_INSIGHTS,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_IOT_DEVICES,
    Permission.VIEW_SENSOR_DATA
  ],
  
  [UserRole.TEAM_LEAD]: [
    Permission.VIEW_USERS,
    Permission.VIEW_MODULES,
    Permission.VIEW_CUSTOMERS,
    Permission.EDIT_CUSTOMERS,
    Permission.VIEW_DEALS,
    Permission.VIEW_PROJECTS,
    Permission.EDIT_PROJECTS,
    Permission.VIEW_AI_INSIGHTS,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_IOT_DEVICES,
    Permission.VIEW_SENSOR_DATA
  ],
  
  [UserRole.USER]: [
    Permission.VIEW_MODULES,
    Permission.VIEW_CUSTOMERS,
    Permission.VIEW_DEALS,
    Permission.VIEW_PROJECTS,
    Permission.VIEW_AI_INSIGHTS,
    Permission.VIEW_IOT_DEVICES,
    Permission.VIEW_SENSOR_DATA
  ],
  
  [UserRole.GUEST]: [
    Permission.VIEW_MODULES
  ]
}

// Multi-business context
export interface BusinessContext {
  id: string
  name: string
  slug: string
  domain: string
  industryType: string
  isActive: boolean
  healthScore: number
  monthlyRevenue: number
  userCount: number
  ownershipType: 'PRIMARY' | 'SECONDARY' | 'PARTNER'
  accessLevel: 'FULL' | 'LIMITED' | 'VIEW_ONLY'
  discountRate: number
  billingOrder: number
}

// User session interface with multi-business support
export interface UserSession {
  id: string
  email: string
  name: string
  role: UserRole
  permissions: Permission[]
  tenantId: string
  departmentId?: string
  activeModules: string[]
  avatar?: string
  preferences: UserPreferences
  mfaEnabled: boolean
  lastActivity: Date
  
  // Multi-business management
  ownedBusinesses: BusinessContext[]
  currentBusiness: BusinessContext
  portfolioAccess: boolean
  executiveDashboardAccess: boolean
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: NotificationPreferences
  dashboard: DashboardPreferences
  aiAssistant: AIPreferences
}

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  inApp: boolean
  desktop: boolean
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
  categories: string[]
}

export interface DashboardPreferences {
  layout: 'grid' | 'list' | 'kanban'
  widgets: string[]
  customWidgets: CustomWidget[]
  refreshInterval: number // seconds
  
  // KPI Dashboard specific
  dashboardType?: 'EXECUTIVE' | 'OPERATIONAL' | 'DEPARTMENTAL'
  selectedKPIs?: string[]
  kpiLayout?: Record<string, any>
  defaultTimeRange?: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
  autoRefresh?: boolean
  alertThresholds?: Record<string, any>
  emailReports?: boolean
  reportFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY'
}

export interface AIPreferences {
  enabled: boolean
  automationLevel: 'low' | 'medium' | 'high'
  suggestions: boolean
  voiceCommands: boolean
  naturalLanguageSearch: boolean
}

export interface CustomWidget {
  id: string
  type: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  config: Record<string, any>
}

// Permission check utilities
export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  return userPermissions.includes(requiredPermission)
}

export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some(permission => 
    userPermissions.includes(permission)
  )
}

export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  )
}

export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY[role] || 0
}

export function canAccessRole(userRole: UserRole, targetRole: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(targetRole)
}

// Role templates for quick assignment
export const ROLE_TEMPLATES = {
  CFO: {
    role: UserRole.DEPARTMENT_MANAGER,
    additionalPermissions: [
      Permission.VIEW_FINANCIAL_REPORTS,
      Permission.EDIT_FINANCIAL_DATA,
      Permission.MANAGE_BUDGETS,
      Permission.VIEW_REVENUE_METRICS
    ]
  },
  SALES_MANAGER: {
    role: UserRole.DEPARTMENT_MANAGER,
    additionalPermissions: [
      Permission.MANAGE_DEALS,
      Permission.VIEW_FINANCIAL_REPORTS,
      Permission.CONFIGURE_AI
    ]
  },
  HR_DIRECTOR: {
    role: UserRole.DEPARTMENT_MANAGER,
    additionalPermissions: [
      Permission.CREATE_USERS,
      Permission.EDIT_USERS,
      Permission.VIEW_ANALYTICS
    ]
  },
  IT_ADMIN: {
    role: UserRole.ORG_ADMIN,
    additionalPermissions: [
      Permission.MANAGE_INTEGRATIONS,
      Permission.CONFIGURE_WEBHOOKS,
      Permission.MANAGE_API_KEYS
    ]
  },
  FACILITY_MANAGER: {
    role: UserRole.DEPARTMENT_MANAGER,
    additionalPermissions: [
      Permission.MANAGE_IOT_DEVICES,
      Permission.CONFIGURE_ALERTS,
      Permission.VIEW_SENSOR_DATA
    ]
  }
}

// ============================================================================
// KPI AND ANALYTICS TYPES
// ============================================================================

export interface KPIMetric {
  key: string
  name: string
  value: number
  displayValue: string
  previousValue?: number
  change?: number
  changePercent?: number
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'critical'
  target?: number
  benchmark?: number
  unit: string
  format: 'number' | 'currency' | 'percentage' | 'ratio'
}

export interface BusinessPortfolioKPI {
  ownerId: string
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  periodStart: Date
  periodEnd: Date
  
  // Financial KPIs
  totalRevenue: number
  totalExpenses: number
  totalProfit: number
  avgProfitMargin: number
  
  // Operational KPIs
  totalCustomers: number
  totalActiveUsers: number
  totalDeals: number
  totalProjects: number
  
  // Growth Metrics
  revenueGrowthRate: number
  customerGrowthRate: number
  userGrowthRate: number
  
  // Performance Metrics
  avgCustomerSatisfaction: number
  avgProjectSuccess: number
  avgDealCloseRate: number
  
  // Business Health
  portfolioHealthScore: number
  riskScore: number
  diversificationScore: number
  
  // Industry Comparison
  industryRankPercentile: number
  competitorComparison: Record<string, any>
  
  // AI Insights
  aiInsights: Record<string, any>
  aiRecommendations: Record<string, any>
  aiPredictions: Record<string, any>
}

export interface BusinessComparison {
  id: string
  ownerId: string
  businessIds: string[]
  comparisonType: 'PERFORMANCE' | 'GROWTH' | 'PROFITABILITY' | 'EFFICIENCY'
  periodStart: Date
  periodEnd: Date
  topPerformer?: string
  underperformer?: string
  averages: Record<string, number>
  rankings: Record<string, number>
  keyInsights: Record<string, any>
  recommendations: Record<string, any>
  opportunityScore: number
}

export interface KPIDefinition {
  kpiKey: string
  name: string
  description?: string
  category: 'FINANCIAL' | 'OPERATIONAL' | 'GROWTH' | 'CUSTOMER'
  calculationMethod: Record<string, any>
  dataSource: Record<string, any>
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
  displayFormat: 'NUMBER' | 'PERCENTAGE' | 'CURRENCY' | 'RATIO'
  chartType?: 'LINE' | 'BAR' | 'PIE' | 'GAUGE' | 'SCORECARD'
  colorThreshold?: Record<string, any>
  industryBenchmark?: number
  targetValue?: number
  thresholds?: Record<string, any>
  isActive: boolean
  isPredictive: boolean
  requiresAI: boolean
}

