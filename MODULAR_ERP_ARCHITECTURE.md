# CoreFlow360 - Modular ERP Architecture Specification

## 🎯 Executive Summary

CoreFlow360 implements a subscription-aware, AI-powered modular ERP system with Odoo-competitive pricing ($7-58/user/month). The platform dynamically activates/deactivates modules based on tenant subscriptions and intelligently adapts AI capabilities to provide isolated vs. cross-module orchestration.

---

## 🏗️ Core Architecture Principles

### **1. Subscription-First Design**
- Every component checks subscription status before activation
- AI orchestration adapts based on active modules
- UI dynamically renders features based on subscriptions
- Event bus filters cross-module communications

### **2. Module Independence with Smart Integration**
- Modules operate independently when subscribed alone
- Cross-module intelligence activates only with multiple subscriptions
- Clean separation of concerns with subscription-aware bridges

### **3. AI Orchestration Levels**
- **Single Module**: Isolated AI agents (e.g., CRM-only sales intelligence)
- **Multi-Module**: Cross-departmental AI insights (e.g., CRM + HR = lead-to-hire predictions)
- **Full Suite**: Complete business intelligence orchestration

---

## 📊 Database Schema Architecture

### **Subscription Management Models**

```prisma
model TenantSubscription {
  id                    String   @id @default(cuid())
  tenantId              String   @unique
  subscriptionTier      String   // basic, professional, enterprise
  activeModules         String[] // ["crm", "accounting", "hr", "inventory"]
  pricingPlan           Json     // Flexible pricing structure
  billingCycle          String   // monthly, annual
  discountRate          Decimal? @db.Decimal(5,2)
  status                String   @default("active")
  stripeCustomerId      String?
  stripeSubscriptionId  String?
  
  // Usage tracking
  userCount            Int      @default(1)
  maxUsers             Int?
  usageMetrics         Json     @default("{}")
  
  // Billing
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  nextBillingDate      DateTime
  
  // Relationships
  tenant               Tenant   @relation(fields: [tenantId], references: [id])
  subscriptionUsage    SubscriptionUsage[]
  
  @@map("tenant_subscriptions")
}

model ModuleDefinition {
  id              String  @id @default(cuid())
  moduleKey       String  @unique // "crm", "accounting", "hr"
  name            String
  description     String
  category        String  // "core", "advanced", "industry"
  
  // Pricing
  basePrice       Decimal @db.Decimal(10,2)
  perUserPrice    Decimal @db.Decimal(10,2)
  setupFee        Decimal? @db.Decimal(10,2)
  
  // Dependencies
  dependencies    String[] // Required modules
  conflicts       String[] // Conflicting modules
  
  // Configuration
  defaultEnabled  Boolean @default(false)
  enterpriseOnly  Boolean @default(false)
  minUserCount    Int     @default(1)
  
  // AI Configuration
  aiCapabilities  Json    @default("{}")
  crossModuleEvents String[] // Events this module can trigger/receive
  
  @@map("module_definitions")
}

model SubscriptionUsage {
  id                    String   @id @default(cuid())
  tenantSubscriptionId  String
  moduleKey            String
  usageDate            DateTime @default(now())
  
  // Usage metrics
  userCount            Int
  apiCalls             Int      @default(0)
  dataStorage          BigInt   @default(0) // bytes
  aiTokensUsed         Int      @default(0)
  
  // Performance
  averageResponseTime  Int?     // milliseconds
  errorCount           Int      @default(0)
  
  tenantSubscription   TenantSubscription @relation(fields: [tenantSubscriptionId], references: [id])
  
  @@map("subscription_usage")
}
```

---

## 🤖 AI Orchestration Enhancement

### **Enhanced AI Orchestrator Interface**

```typescript
interface EnhancedAIOrchestrator extends AIAgentOrchestrator {
  // Subscription awareness
  setActiveModules(tenantId: string, modules: string[]): Promise<void>
  getAvailableAgents(tenantId: string): Promise<AIAgent[]>
  
  // Enhanced orchestration
  orchestrateWithModuleConstraints(
    request: OrchestrationRequest, 
    tenantId: string
  ): Promise<OrchestrationResult>
  
  // Dynamic filtering
  filterAgentsBySubscription(
    agents: AIAgent[], 
    activeModules: string[]
  ): AIAgent[]
  
  // Cross-module coordination
  enableCrossModuleWorkflows(
    sourceModule: string, 
    targetModule: string, 
    tenantId: string
  ): Promise<boolean>
}
```

### **Module-Specific Agent Mapping**

```typescript
const MODULE_AGENT_MAPPING = {
  'crm': ['salesAgent', 'leadScoringAgent', 'customerSuccessAgent'],
  'accounting': ['invoiceAgent', 'expenseAgent', 'cashFlowAgent'],
  'hr': ['recruitmentAgent', 'performanceAgent', 'payrollAgent'],
  'inventory': ['stockAgent', 'procurementAgent', 'warehouseAgent'],
  'projects': ['taskAgent', 'resourceAgent', 'timelineAgent']
}

const CROSS_MODULE_AGENTS = {
  'crm+hr': ['leadToHireAgent', 'salesPerformanceAgent'],
  'crm+accounting': ['quoteToInvoiceAgent', 'revenueAnalysisAgent'], 
  'hr+accounting': ['payrollProcessingAgent', 'expenseApprovalAgent'],
  'crm+inventory': ['demandForecastAgent', 'stockOptimizationAgent'],
  'full_suite': ['enterpriseIntelligenceAgent', 'predictiveAnalyticsAgent']
}
```

---

## 💰 Pricing Calculator Architecture

### **API Endpoints**

```typescript
// Pricing Calculator APIs
POST /api/pricing/calculate
GET  /api/pricing/modules
POST /api/pricing/quote
GET  /api/pricing/bundles
POST /api/pricing/upgrade-simulation

// Subscription Management APIs  
POST /api/subscriptions/activate-module
POST /api/subscriptions/deactivate-module
GET  /api/subscriptions/status
POST /api/subscriptions/change-plan
```

### **Pricing Logic Implementation**

```typescript
interface PricingCalculator {
  calculateSubscriptionPrice(
    modules: string[],
    userCount: number,
    billingCycle: 'monthly' | 'annual',
    bundleDiscounts?: BundleDiscount[]
  ): PricingResult

  recommendBundle(
    currentModules: string[],
    usageMetrics: UsageMetrics,
    businessProfile: BusinessProfile
  ): BundleRecommendation[]

  simulateUpgrade(
    currentSubscription: TenantSubscription,
    targetModules: string[]
  ): UpgradeSimulation
}
```

---

## 🎨 Dynamic UI Architecture

### **Subscription-Aware Components**

```tsx
// Module-aware rendering
const ModuleAwareComponent = () => {
  const { activeModules } = useSubscription()
  
  return (
    <>
      {activeModules.includes('crm') && <CRMFeatures />}
      {activeModules.includes('accounting') && <AccountingFeatures />}
      {activeModules.includes('hr') && <HRFeatures />}
      {hasModules(['crm', 'hr']) && <CrossDepartmentInsights />}
      {isFullSuite(activeModules) && <EnterpriseAnalytics />}
    </>
  )
}

// Subscription context hook
const useSubscription = () => {
  const { activeModules, subscriptionTier, upgradeAvailable } = useContext(SubscriptionContext)
  
  return {
    activeModules,
    subscriptionTier,
    upgradeAvailable,
    hasModule: (module: string) => activeModules.includes(module),
    hasModules: (modules: string[]) => modules.every(m => activeModules.includes(m)),
    canUpgrade: () => upgradeAvailable,
    isFullSuite: () => activeModules.length >= 5
  }
}
```

---

## 🔄 Event Bus Subscription Filtering

### **Event Bus Architecture**

```typescript
interface SubscriptionAwareEventBus {
  publishEvent(
    event: ModuleEvent, 
    sourceModule: string,
    tenantId: string
  ): Promise<void>
  
  subscribeToEvents(
    targetModule: string, 
    tenantId: string,
    eventHandler: EventHandler
  ): Promise<void>
  
  filterEventsBySubscription(
    events: ModuleEvent[], 
    activeModules: string[]
  ): ModuleEvent[]
  
  enableCrossModuleEvents(
    sourceModule: string,
    targetModule: string,
    tenantId: string
  ): Promise<void>
}
```

---

## 🔐 Security & Multi-Tenancy

### **Subscription Isolation**
- Every query validates tenant access to requested modules
- AI orchestrator enforces subscription-based agent filtering  
- Event bus respects module subscription boundaries
- UI components conditionally render based on subscriptions

### **Audit & Compliance**
- All subscription changes logged with full audit trail
- Module activation/deactivation triggers compliance checks
- Usage metrics tracked per module per tenant
- Billing events integrated with financial audit logs

---

## 📱 Stripe Integration Architecture

### **Subscription Lifecycle Management**

```typescript
interface StripeSubscriptionManager {
  createSubscription(
    customerId: string,
    modules: string[],
    userCount: number
  ): Promise<Stripe.Subscription>
  
  updateSubscription(
    subscriptionId: string,
    changes: SubscriptionChange
  ): Promise<Stripe.Subscription>
  
  handleWebhook(
    event: Stripe.Event
  ): Promise<void>
  
  calculateProration(
    currentSubscription: TenantSubscription,
    targetModules: string[]
  ): Promise<ProrationResult>
}
```

---

## 🚀 Deployment & Scaling Strategy

### **Module Activation Flow**
1. User selects modules in dashboard
2. Pricing calculated with bundle recommendations  
3. Stripe checkout for payment processing
4. Webhook triggers module activation
5. AI orchestrator updates agent availability
6. UI dynamically shows new features
7. Event bus enables cross-module communication

### **Performance Considerations**
- Module activation/deactivation with zero downtime
- AI orchestrator hot-reloading of agent configurations
- Caching of subscription status for performance
- Async processing of module state changes

---

## 🎯 Success Metrics

### **Technical KPIs**
- ✅ Sub-100ms subscription status lookups
- ✅ Zero-downtime module activation/deactivation
- ✅ 95%+ AI orchestrator uptime with subscription awareness
- ✅ <200ms pricing calculation response times

### **Business KPIs**
- ✅ 40%+ conversion rate from single to multi-module subscriptions
- ✅ 25%+ average revenue per user increase through intelligent upselling
- ✅ <5% monthly churn rate with AI-powered retention
- ✅ 30% cost advantage vs Odoo/NetSuite comparable features

---

This architecture enables CoreFlow360 to compete directly with Odoo and NetSuite while providing superior AI-powered intelligence that adapts to subscription levels, creating a truly differentiated and scalable ERP platform.