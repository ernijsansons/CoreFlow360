# CoreFlow360 API Endpoints Reference

Complete documentation for all 96 API endpoints in the CoreFlow360 platform.

## Table of Contents

- [Authentication](#authentication)
- [Admin](#admin)
- [AI & Consciousness](#ai--consciousness)
- [CRM](#crm)
- [Subscriptions](#subscriptions)
- [Intelligence](#intelligence)
- [Voice](#voice)
- [Webhooks](#webhooks)
- [Metrics & Monitoring](#metrics--monitoring)

---

## Authentication

### POST /api/auth/register
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "company": "Acme Corp"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "userId": "user-123"
}
```

**Error Codes:**
- `400` - Invalid input or email already exists
- `500` - Server error

---

## Admin

### GET /api/admin/users
Get all users in the system (admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search by name or email

**Response:**
```json
{
  "users": [
    {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "tenantId": "tenant-123",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 8
}
```

### GET /api/admin/tenants
Get all tenants (super admin only).

**Response:**
```json
{
  "tenants": [
    {
      "id": "tenant-123",
      "name": "Acme Corp",
      "plan": "synaptic",
      "users": 25,
      "status": "active"
    }
  ]
}
```

### POST /api/admin/cache
Manage cache operations.

**Request Body:**
```json
{
  "action": "clear", // clear, warm, stats
  "target": "all" // all, user, subscription, ai
}
```

### GET /api/admin/performance-metrics
Get system performance metrics.

**Response:**
```json
{
  "metrics": {
    "avgResponseTime": 45,
    "requestsPerSecond": 150,
    "errorRate": 0.02,
    "activeUsers": 523,
    "cpuUsage": 0.35,
    "memoryUsage": 0.62
  }
}
```

### GET /api/admin/security-metrics
Get security metrics and alerts.

**Response:**
```json
{
  "metrics": {
    "failedLoginAttempts": 12,
    "blockedIPs": 3,
    "suspiciousActivities": 0,
    "lastSecurityScan": "2024-01-15T10:00:00Z"
  }
}
```

### GET /api/admin/lead-pipeline
Get lead pipeline analytics (admin only).

**Response:**
```json
{
  "pipeline": {
    "new": 45,
    "qualified": 23,
    "proposal": 12,
    "negotiation": 8,
    "closed": 15
  },
  "conversion": {
    "rate": 0.33,
    "avgDealSize": 25000,
    "avgClosingTime": 21
  }
}
```

---

## AI & Consciousness

### GET /api/consciousness/status
Get current consciousness system status.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": "active",
  "consciousness": {
    "level": 0.45,
    "tier": "synaptic",
    "isActive": true,
    "modules": ["crm", "accounting"],
    "intelligenceMultiplier": 2.83
  },
  "evolution": {
    "currentProgress": 0.65,
    "nextMilestone": {
      "level": 0.5,
      "capabilities": ["Autonomous Decision Making"]
    }
  }
}
```

### PUT /api/consciousness/status
Update consciousness settings.

**Request Body:**
```json
{
  "autoEvolution": true,
  "goals": ["maximize_efficiency", "customer_retention"]
}
```

### GET /api/consciousness/insights
Get AI-generated business insights.

**Query Parameters:**
- `limit` (number): Number of insights (default: 10)
- `type` (string): Filter by type (pattern, anomaly, opportunity)

**Response:**
```json
{
  "insights": [
    {
      "id": "insight-123",
      "type": "customer_pattern",
      "description": "Customers who use CRM + Accounting have 40% higher retention",
      "confidence": 0.88,
      "actionable": true,
      "suggestedActions": ["Bundle promotion", "Cross-sell campaign"]
    }
  ]
}
```

### GET /api/consciousness/modules
Get consciousness module status.

**Response:**
```json
{
  "modules": [
    {
      "id": "crm",
      "name": "CRM Consciousness",
      "status": "active",
      "intelligenceContribution": 0.15,
      "synapticConnections": 3
    }
  ]
}
```

### GET /api/consciousness/health
Check consciousness system health.

**Response:**
```json
{
  "health": "healthy",
  "components": {
    "decisionEngine": "operational",
    "synapticBridge": "active",
    "evolutionProcessor": "running"
  }
}
```

### GET /api/consciousness/tiers
Get available consciousness tiers.

**Response:**
```json
{
  "tiers": [
    {
      "id": "neural",
      "name": "Neural",
      "capabilities": ["Basic Pattern Recognition"],
      "pricePerUser": 15
    },
    {
      "id": "synaptic",
      "name": "Synaptic",
      "capabilities": ["Cross-Module Intelligence"],
      "pricePerUser": 35
    }
  ]
}
```

### POST /api/ai/orchestrate
Execute AI orchestration request.

**Request Body:**
```json
{
  "type": "customer_analysis",
  "data": {
    "customerId": "cust-123",
    "depth": "comprehensive"
  },
  "constraints": {
    "maxProcessingTime": 5000,
    "confidenceThreshold": 0.7
  }
}
```

**Response:**
```json
{
  "result": {
    "analysis": {
      "churnRisk": 0.23,
      "lifetimeValue": 45000,
      "recommendations": ["Increase engagement", "Offer loyalty discount"]
    },
    "confidence": 0.89,
    "processingTime": 2340
  }
}
```

### POST /api/ai/intelligence
Generate business intelligence report.

**Request Body:**
```json
{
  "reportType": "executive_summary",
  "period": "last_quarter",
  "focus": ["revenue", "customer_satisfaction", "efficiency"]
}
```

---

## CRM

### GET /api/crm/buying-signals
Detect customer buying signals.

**Response:**
```json
{
  "signals": [
    {
      "customerId": "cust-123",
      "signal": "increased_engagement",
      "strength": 0.78,
      "recommendedAction": "Schedule demo"
    }
  ]
}
```

### GET /api/crm/decision-makers
Identify decision makers in customer organizations.

**Query Parameters:**
- `customerId` (string): Filter by customer

**Response:**
```json
{
  "decisionMakers": [
    {
      "id": "contact-123",
      "name": "Jane Smith",
      "title": "CFO",
      "influence": 0.9,
      "engagement": 0.65
    }
  ]
}
```

### POST /api/crm/engagement/start
Start multi-channel engagement campaign.

**Request Body:**
```json
{
  "customerId": "cust-123",
  "campaign": "retention",
  "channels": ["email", "linkedin", "phone"],
  "personalization": {
    "tone": "professional",
    "focus": "roi"
  }
}
```

### POST /api/crm/proposals/generate
Generate AI-powered proposal.

**Request Body:**
```json
{
  "customerId": "cust-123",
  "products": ["crm", "accounting"],
  "customization": {
    "industry": "manufacturing",
    "size": "mid-market",
    "painPoints": ["efficiency", "visibility"]
  }
}
```

**Response:**
```json
{
  "proposalId": "prop-123",
  "downloadUrl": "/api/proposals/prop-123/download",
  "preview": {
    "executiveSummary": "...",
    "pricing": 45000,
    "roi": "245% over 3 years"
  }
}
```

### GET /api/crm/value-propositions
Get customized value propositions.

**Query Parameters:**
- `industry` (string): Target industry
- `size` (string): Company size (small, mid, enterprise)

**Response:**
```json
{
  "propositions": [
    {
      "id": "vp-123",
      "headline": "Reduce operational costs by 40%",
      "details": "Our AI-driven automation...",
      "proofPoints": ["Case study: Acme Corp", "Industry benchmark data"]
    }
  ]
}
```

### GET /api/crm/job-changes
Track job changes for contacts.

**Response:**
```json
{
  "changes": [
    {
      "contactId": "contact-123",
      "previousCompany": "Old Corp",
      "newCompany": "New Corp",
      "detectedAt": "2024-01-15T10:00:00Z",
      "recommendedAction": "Reach out to establish relationship"
    }
  ]
}
```

### POST /api/crm/video/generate
Generate personalized video content.

**Request Body:**
```json
{
  "customerId": "cust-123",
  "type": "product_demo",
  "personalization": {
    "contactName": "John",
    "companyName": "Acme Corp",
    "focusFeatures": ["automation", "reporting"]
  }
}
```

### POST /api/crm/infographics/generate
Generate custom infographics.

**Request Body:**
```json
{
  "type": "roi_comparison",
  "data": {
    "current": { "cost": 100000, "efficiency": 0.6 },
    "projected": { "cost": 60000, "efficiency": 0.9 }
  },
  "branding": {
    "colors": ["#1e40af", "#10b981"],
    "logo": true
  }
}
```

### POST /api/crm/outreach/generate
Generate outreach content.

**Request Body:**
```json
{
  "contactId": "contact-123",
  "channel": "email",
  "purpose": "follow_up",
  "context": {
    "lastInteraction": "product_demo",
    "interests": ["automation", "cost_reduction"]
  }
}
```

### POST /api/crm/outreach/launch
Launch outreach campaign.

**Request Body:**
```json
{
  "campaignId": "camp-123",
  "targets": ["contact-123", "contact-456"],
  "schedule": {
    "startDate": "2024-01-20",
    "sequence": ["email", "wait:3d", "linkedin", "wait:2d", "call"]
  }
}
```

### POST /api/crm/templates/customize
Customize communication templates.

**Request Body:**
```json
{
  "templateId": "tmpl-123",
  "customization": {
    "industry": "healthcare",
    "tone": "consultative",
    "variables": {
      "painPoint": "patient data management",
      "benefit": "30% reduction in administrative time"
    }
  }
}
```

### GET /api/crm/templates/download
Download template library.

**Query Parameters:**
- `category` (string): email, proposal, presentation
- `format` (string): docx, pdf, html

---

## Subscriptions

### GET /api/subscriptions/current
Get current subscription details.

**Response:**
```json
{
  "subscription": {
    "id": "sub-123",
    "tier": "synaptic",
    "status": "active",
    "modules": ["crm", "accounting"],
    "users": 25,
    "currentPeriodEnd": "2024-02-15T00:00:00Z",
    "pricing": {
      "monthly": 875,
      "currency": "USD"
    }
  }
}
```

### POST /api/subscriptions/calculate
Calculate subscription pricing.

**Request Body:**
```json
{
  "tier": "autonomous",
  "modules": ["crm", "accounting", "hr", "inventory"],
  "users": 50,
  "billingPeriod": "monthly"
}
```

**Response:**
```json
{
  "pricing": {
    "basePrice": 3250,
    "modulePrice": 0,
    "userPrice": 0,
    "total": 3250,
    "currency": "USD",
    "breakdown": {
      "perUser": 65,
      "savings": 15,
      "intelligenceMultiplier": 16
    }
  }
}
```

### POST /api/subscriptions/checkout
Create checkout session for subscription.

**Request Body:**
```json
{
  "tier": "synaptic",
  "modules": ["crm", "accounting"],
  "successUrl": "https://app.coreflow360.com/subscription/success",
  "cancelUrl": "https://app.coreflow360.com/subscription"
}
```

### GET /api/subscriptions/status
Check subscription status and limits.

**Response:**
```json
{
  "status": "active",
  "usage": {
    "users": { "current": 23, "limit": 25 },
    "storage": { "current": 45, "limit": 100, "unit": "GB" },
    "apiCalls": { "current": 125000, "limit": 500000 }
  }
}
```

### POST /api/subscriptions/modules/activate
Activate additional modules.

**Request Body:**
```json
{
  "modules": ["hr", "inventory"]
}
```

### POST /api/subscriptions/modules/deactivate
Deactivate modules.

**Request Body:**
```json
{
  "modules": ["inventory"]
}
```

---

## Intelligence

### POST /api/intelligence/analytics/predict
Generate predictive analytics.

**Request Body:**
```json
{
  "metric": "revenue",
  "horizon": "3months",
  "factors": ["seasonality", "market_trends", "historical_data"]
}
```

**Response:**
```json
{
  "prediction": {
    "values": [125000, 132000, 140000],
    "confidence": 0.82,
    "factors": {
      "seasonality": 0.3,
      "growth_trend": 0.5,
      "market": 0.2
    }
  }
}
```

### GET /api/intelligence/business
Get business intelligence overview.

**Response:**
```json
{
  "intelligence": {
    "healthScore": 0.85,
    "opportunities": [
      {
        "type": "cross_sell",
        "potential": 50000,
        "confidence": 0.78
      }
    ],
    "risks": [
      {
        "type": "customer_churn",
        "impact": 25000,
        "probability": 0.23
      }
    ]
  }
}
```

### POST /api/intelligence/companies/monitor
Monitor target companies.

**Request Body:**
```json
{
  "companies": ["competitor-1", "prospect-1"],
  "signals": ["funding", "leadership_change", "product_launch"]
}
```

### POST /api/intelligence/problems/detect
Detect business problems.

**Request Body:**
```json
{
  "scope": "operations",
  "depth": "comprehensive",
  "timeframe": "last_month"
}
```

**Response:**
```json
{
  "problems": [
    {
      "id": "prob-123",
      "type": "process_inefficiency",
      "description": "Order processing time increased 35%",
      "impact": "high",
      "rootCause": "Manual approval bottleneck",
      "recommendations": ["Automate approval workflow", "Set threshold rules"]
    }
  ]
}
```

### GET /api/intelligence/ingestion/sources
Get data ingestion sources.

**Response:**
```json
{
  "sources": [
    {
      "id": "src-123",
      "type": "crm",
      "status": "active",
      "lastSync": "2024-01-15T10:00:00Z",
      "recordsProcessed": 15000
    }
  ]
}
```

### POST /api/intelligence/ingestion/webhook
Receive webhook data for intelligence processing.

**Request Body:**
```json
{
  "source": "external_crm",
  "event": "customer_update",
  "data": {
    "customerId": "ext-123",
    "changes": ["status", "value"]
  }
}
```

---

## Voice

### POST /api/voice
Initialize voice call.

**Request Body:**
```json
{
  "to": "+1234567890",
  "purpose": "customer_support",
  "context": {
    "customerId": "cust-123",
    "issue": "billing_inquiry"
  }
}
```

### POST /api/voice/stream
Handle voice streaming (WebSocket upgrade required).

**Headers:**
- `Upgrade: websocket`
- `Connection: Upgrade`

### POST /api/voice/webhook
Handle voice provider webhooks.

**Request Body:**
```json
{
  "CallSid": "CA123",
  "CallStatus": "in-progress",
  "From": "+1234567890",
  "To": "+0987654321"
}
```

### GET /api/voice-notes
Get voice notes for user.

**Response:**
```json
{
  "notes": [
    {
      "id": "note-123",
      "title": "Customer meeting notes",
      "duration": 180,
      "createdAt": "2024-01-15T10:00:00Z",
      "transcript": "Discussion about Q1 targets..."
    }
  ]
}
```

### POST /api/voice-notes
Create new voice note.

**Request Body:**
```json
{
  "title": "Sales call summary",
  "audioData": "base64_encoded_audio",
  "duration": 240
}
```

### GET /api/voice-notes/[id]/audio
Get audio file for voice note.

**Response:**
- Binary audio data
- Content-Type: audio/webm

---

## Webhooks

### POST /api/stripe/webhook
Handle Stripe payment webhooks.

**Headers:**
- `stripe-signature: <signature>`

**Request Body:**
Stripe webhook event object

### POST /api/voice-webhook
Handle voice provider webhooks.

**Request Body:**
Voice provider specific webhook payload

### POST /api/leads/webhook
Handle lead generation webhooks.

**Request Body:**
```json
{
  "source": "website",
  "lead": {
    "email": "lead@example.com",
    "company": "New Corp",
    "interest": "enterprise_plan"
  }
}
```

---

## Metrics & Monitoring

### GET /api/metrics
Get application metrics.

**Response:**
```json
{
  "metrics": {
    "activeUsers": 523,
    "requestsPerMinute": 1250,
    "avgResponseTime": 45,
    "errorRate": 0.002
  }
}
```

### GET /api/metrics/live
Get real-time metrics (WebSocket).

**Response:** Server-Sent Events stream

### GET /api/metrics/system
Get system-level metrics.

**Response:**
```json
{
  "system": {
    "cpu": {
      "usage": 0.35,
      "cores": 8,
      "temperature": 45
    },
    "memory": {
      "used": 4.2,
      "total": 8,
      "percentage": 0.525
    },
    "disk": {
      "used": 120,
      "total": 500,
      "percentage": 0.24
    }
  }
}
```

### GET /api/performance/analytics
Get performance analytics.

**Query Parameters:**
- `period` (string): hour, day, week, month
- `metric` (string): response_time, throughput, error_rate

**Response:**
```json
{
  "analytics": {
    "period": "day",
    "dataPoints": [
      { "time": "00:00", "value": 42 },
      { "time": "01:00", "value": 38 }
    ],
    "average": 45,
    "peak": 125,
    "percentile95": 89
  }
}
```

### GET /api/performance/metrics
Get detailed performance metrics.

**Response:**
```json
{
  "performance": {
    "database": {
      "queryTime": { "avg": 12, "p95": 45, "p99": 120 },
      "connectionPool": { "active": 15, "idle": 10, "waiting": 0 }
    },
    "cache": {
      "hitRate": 0.92,
      "evictions": 125,
      "memory": { "used": 256, "limit": 512 }
    }
  }
}
```

### GET /api/observability/analytics
Get observability analytics.

**Response:**
```json
{
  "observability": {
    "traces": {
      "total": 125000,
      "errors": 250,
      "slowest": [
        { "operation": "database.query", "duration": 1250 }
      ]
    },
    "logs": {
      "total": 1500000,
      "errors": 1200,
      "warnings": 5400
    }
  }
}
```

### GET /api/ws
WebSocket endpoint for real-time updates.

**Query Parameters:**
- `subscribe` (string): metrics, alerts, consciousness

### GET /api/ws/performance
WebSocket endpoint for performance monitoring.

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {} // Optional additional details
}
```

Common error codes:
- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `RATE_LIMITED` - Too many requests
- `INTERNAL_ERROR` - Server error

## Rate Limiting

All API endpoints are rate limited:
- **Default**: 100 requests per minute
- **Authenticated**: 1000 requests per minute
- **Premium**: 5000 requests per minute

Rate limit headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

## Authentication

Most endpoints require authentication via Bearer token:

```
Authorization: Bearer <your-api-token>
```

Tokens are obtained through the authentication flow and are valid for 8 hours.