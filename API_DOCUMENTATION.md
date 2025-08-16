# CoreFlow360 API Documentation

## Overview

CoreFlow360 provides a comprehensive RESTful API for managing modular ERP subscriptions, AI orchestration, and business operations.

**Base URL**: `https://yourdomain.com/api`

## Authentication

All API requests require authentication via:

1. **Session Authentication** (Web UI)
2. **API Key Authentication** (External integrations)

### API Key Format
```
Authorization: Bearer cf360_<tenantId>_<random>_<signature>
```

## Core Endpoints

### Health & Monitoring

#### GET /health
Basic health check

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-08T12:00:00Z",
  "version": "2.0.0",
  "environment": "production",
  "uptime": 86400
}
```

#### GET /health?detailed=true
Detailed health check with service status

**Response**:
```json
{
  "status": "healthy",
  "services": {
    "database": { "status": "healthy", "responseTime": 15 },
    "redis": { "status": "healthy", "responseTime": 2 },
    "ai": { "status": "configured" }
  },
  "performance": {
    "memory": { "used": 128000000, "total": 512000000, "percentage": 25 },
    "cpu": { "usage": 15 },
    "requests": { "total": 1000, "averageResponseTime": 120, "errorRate": 0.1 }
  }
}
```

## Subscription Management

### POST /pricing/calculate
Calculate pricing for module selection

**Request**:
```json
{
  "modules": ["crm", "accounting", "inventory"],
  "users": 10,
  "billingCycle": "monthly",
  "tenantId": "tenant-123"
}
```

**Response**:
```json
{
  "success": true,
  "pricing": {
    "subtotal": 450.00,
    "discounts": {
      "bundle": 45.00,
      "volume": 22.50
    },
    "total": 382.50,
    "currency": "USD",
    "billingCycle": "monthly"
  },
  "recommendations": {
    "suggestedBundle": "business-suite",
    "potentialSavings": 67.50,
    "additionalModules": ["project-management"]
  }
}
```

### GET /subscription/modules
List available modules and pricing

**Response**:
```json
{
  "modules": [
    {
      "id": "crm",
      "name": "Customer Relationship Management",
      "description": "Complete CRM solution",
      "category": "sales",
      "basePrice": 25.00,
      "features": ["contact-management", "deal-tracking", "email-integration"],
      "dependencies": [],
      "aiCapabilities": ["customer-intelligence", "sales-prediction"]
    }
  ],
  "bundles": [
    {
      "id": "business-suite",
      "name": "Business Suite",
      "modules": ["crm", "accounting", "inventory"],
      "discount": 0.10,
      "description": "Complete business management solution"
    }
  ]
}
```

### POST /subscription/activate
Activate modules for tenant

**Request**:
```json
{
  "tenantId": "tenant-123",
  "modules": ["crm", "accounting"],
  "subscriptionTier": "professional",
  "billingCycle": "monthly"
}
```

**Response**:
```json
{
  "success": true,
  "subscription": {
    "id": "sub-123",
    "tenantId": "tenant-123",
    "activeModules": ["crm", "accounting"],
    "subscriptionTier": "professional",
    "status": "active",
    "nextBillingDate": "2025-09-08T00:00:00Z"
  },
  "aiCapabilities": {
    "availableAgents": ["customer-intelligence", "financial-analysis"],
    "orchestrationLevel": "cross-module"
  }
}
```

## AI Orchestration

### POST /ai/orchestrate
Execute AI-powered business operations

**Request**:
```json
{
  "task": "analyze customer churn risk",
  "context": {
    "customerId": "cust-456",
    "timeframe": "30d"
  },
  "tenantId": "tenant-123",
  "modules": ["crm", "analytics"],
  "preferredModel": "gpt-4"
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "analysis": {
      "churnRisk": 0.15,
      "confidence": 0.87,
      "factors": [
        { "factor": "decreased_engagement", "impact": 0.6 },
        { "factor": "payment_delays", "impact": 0.4 }
      ]
    },
    "recommendations": [
      {
        "action": "schedule_call",
        "priority": "high",
        "reason": "Proactive engagement needed"
      }
    ]
  },
  "metadata": {
    "executionTime": 2300,
    "tokensUsed": 1500,
    "model": "gpt-4",
    "cost": 0.045
  }
}
```

### GET /ai/agents
List available AI agents by subscription

**Response**:
```json
{
  "agents": [
    {
      "id": "customer-intelligence",
      "name": "Customer Intelligence Agent",
      "description": "Advanced customer analysis and predictions",
      "requiredModules": ["crm"],
      "capabilities": ["churn-prediction", "lifetime-value", "segmentation"],
      "model": "gpt-4"
    },
    {
      "id": "financial-analyst",
      "name": "Financial Analysis Agent",
      "description": "Comprehensive financial insights",
      "requiredModules": ["accounting", "crm"],
      "capabilities": ["revenue-forecasting", "cost-analysis", "profitability"],
      "model": "claude-3-sonnet"
    }
  ],
  "orchestrationCapabilities": {
    "crossModuleWorkflows": true,
    "multiAgentCollaboration": true,
    "conditionalLogic": true
  }
}
```

## Stripe Integration

### POST /stripe/create-checkout
Create Stripe checkout session

**Request**:
```json
{
  "tenantId": "tenant-123",
  "modules": ["crm", "accounting"],
  "users": 5,
  "billingCycle": "monthly",
  "successUrl": "https://app.coreflow360.com/success",
  "cancelUrl": "https://app.coreflow360.com/cancel"
}
```

**Response**:
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_...",
  "sessionId": "cs_test_123456789"
}
```

### POST /stripe/webhook
Stripe webhook handler (internal use)

Handles subscription lifecycle events:
- `subscription.created`
- `invoice.payment_succeeded`
- `subscription.updated`
- `subscription.deleted`

### POST /stripe/customer-portal
Create customer portal session

**Request**:
```json
{
  "tenantId": "tenant-123",
  "returnUrl": "https://app.coreflow360.com/settings"
}
```

**Response**:
```json
{
  "success": true,
  "portalUrl": "https://billing.stripe.com/p/session/..."
}
```

## Module Access Control

### GET /modules/access
Check module access for tenant

**Request Parameters**:
- `tenantId`: Tenant identifier
- `module`: Module to check (optional)

**Response**:
```json
{
  "tenantId": "tenant-123",
  "activeModules": ["crm", "accounting"],
  "accessLevel": "professional",
  "moduleAccess": {
    "crm": {
      "active": true,
      "features": ["all"],
      "aiCapabilities": true
    },
    "accounting": {
      "active": true,
      "features": ["all"],
      "aiCapabilities": true
    },
    "inventory": {
      "active": false,
      "reason": "not_subscribed"
    }
  }
}
```

## Workflow Automation

### POST /workflows/cross-module
Execute cross-module workflows

**Request**:
```json
{
  "workflowType": "deal-to-invoice",
  "triggerData": {
    "dealId": "deal-789",
    "customerId": "cust-456"
  },
  "tenantId": "tenant-123"
}
```

**Response**:
```json
{
  "success": true,
  "workflowId": "workflow-123",
  "steps": [
    {
      "step": "create_project",
      "module": "project-management",
      "status": "completed",
      "result": { "projectId": "proj-111" }
    },
    {
      "step": "generate_invoice",
      "module": "accounting",
      "status": "completed",
      "result": { "invoiceId": "inv-222" }
    }
  ],
  "executionTime": 1500
}
```

## Event System

### POST /events/publish
Publish module event

**Request**:
```json
{
  "eventType": "deal.won",
  "sourceModule": "crm",
  "data": {
    "dealId": "deal-789",
    "amount": 50000,
    "customerId": "cust-456"
  },
  "tenantId": "tenant-123"
}
```

**Response**:
```json
{
  "success": true,
  "eventId": "event-123",
  "deliveredTo": ["accounting", "project-management"],
  "subscriptionFiltered": true
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Module 'advanced-analytics' not available in current subscription",
    "details": {
      "requiredTier": "enterprise",
      "currentTier": "professional",
      "upgradeUrl": "/api/stripe/create-checkout?upgrade=enterprise"
    }
  }
}
```

### Common Error Codes

- `INVALID_SUBSCRIPTION` - Module not active in subscription
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `VALIDATION_ERROR` - Invalid request data
- `AI_SERVICE_UNAVAILABLE` - AI service temporarily unavailable
- `PAYMENT_REQUIRED` - Subscription payment needed

## Rate Limits

- **General API**: 100 requests/minute
- **AI Orchestration**: 20 requests/minute
- **Authentication**: 5 requests/15 minutes
- **Stripe Operations**: 10 requests/minute

Headers returned:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Window reset time

## Response Headers

All responses include:
- `X-Request-ID`: Unique request identifier
- `X-Response-Time`: Response time in milliseconds
- `X-API-Version`: API version
- Security headers (CSP, HSTS, etc.)

## SDKs and Examples

### JavaScript/Node.js
```javascript
const coreflow = new CoreFlow360({
  baseURL: 'https://yourdomain.com/api',
  apiKey: 'cf360_tenant_random_signature'
});

// Check subscription status
const subscription = await coreflow.subscription.getStatus();

// Execute AI analysis
const analysis = await coreflow.ai.orchestrate({
  task: 'analyze customer data',
  context: { customerId: 'cust-123' }
});
```

### Python
```python
import coreflow360

client = coreflow360.Client(
    base_url="https://yourdomain.com/api",
    api_key="cf360_tenant_random_signature"
)

# Calculate pricing
pricing = client.pricing.calculate(
    modules=["crm", "accounting"],
    users=10
)
```

## Webhooks

CoreFlow360 can send webhooks for key events:

### Subscription Events
- `subscription.activated`
- `subscription.updated`
- `subscription.cancelled`
- `module.activated`
- `module.deactivated`

### AI Events
- `ai.analysis.completed`
- `ai.prediction.generated`
- `workflow.executed`

### Webhook Format
```json
{
  "id": "evt_123",
  "type": "subscription.updated",
  "created": 1691500800,
  "data": {
    "tenantId": "tenant-123",
    "subscription": {
      "activeModules": ["crm", "accounting", "inventory"],
      "tier": "professional"
    }
  }
}
```

---

**CoreFlow360 v2.0.0 API Documentation**
For support: api-support@coreflow360.com