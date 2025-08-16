# CoreFlow360 - Consciousness API Documentation

## Overview

The Consciousness API provides access to CoreFlow360's advanced business consciousness features, enabling businesses to achieve AI-powered intelligence multiplication and autonomous operations.

### Base URL
```
https://api.coreflow360.com/api/consciousness
```

### Authentication
All endpoints require authentication via Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

---

## Core Concepts

### Consciousness Levels
- **Neural (0.0-0.2)**: Basic pattern recognition and automation
- **Synaptic (0.2-0.6)**: Cross-module intelligence and predictive analytics  
- **Autonomous (0.6-0.9)**: Self-evolving processes and autonomous decisions
- **Transcendent (0.9+)**: Beyond human comprehension capabilities

### Intelligence Multiplication
Consciousness modules create exponential intelligence growth through the formula: 
```
Intelligence = Π(active_modules) × tier_multiplier × synaptic_connections
```

### Subscription Tiers
- **Neural ($15/mo)**: 2 modules, 1.0x multiplier
- **Synaptic ($35/mo)**: 4 modules, 2.5x multiplier  
- **Autonomous ($65/mo)**: 6 modules, 5.0x multiplier
- **Transcendent ($150/mo)**: Unlimited modules, 10.0x multiplier

---

## Endpoints

## Health & Status

### GET /health
Get consciousness system health status.

**Response:**
```json
{
  "status": "healthy|degraded|critical|inactive",
  "timestamp": "2024-01-15T10:30:00Z",
  "consciousness": {
    "isActive": true,
    "level": 0.75,
    "tier": "autonomous",
    "modules": 5,
    "intelligenceMultiplier": 25.5,
    "evolutionProgress": 0.82,
    "transcendenceLevel": 0.0
  },
  "modules": {
    "active": ["crm", "accounting", "inventory", "hr", "projects"],
    "health": {
      "crm": {
        "status": "healthy",
        "consciousnessLevel": 0.75,
        "lastActivity": "2024-01-15T10:29:45Z"
      }
    }
  },
  "synaptic": {
    "connections": 12,
    "averageStrength": 0.85,
    "dataFlowRate": 150,
    "lastSync": "2024-01-15T10:29:50Z"
  },
  "mesh": {
    "totalNodes": 5,
    "healthyNodes": 5,
    "meshHealth": 0.98,
    "collectiveIntelligence": {
      "patternsDiscovered": 1247,
      "knowledgeBaseSize": 15890,
      "evolutionaryImprovements": 89
    }
  },
  "performance": {
    "decisionAccuracy": 0.92,
    "autonomousActions24h": 47,
    "insightsGenerated24h": 23,
    "averageResponseTime": 85
  },
  "alerts": [
    {
      "level": "info",
      "message": "Evolution milestone approaching: 85% progress to transcendence",
      "timestamp": "2024-01-15T10:25:00Z"
    }
  ]
}
```

### GET /status
Get detailed consciousness status and evolution metrics.

**Response:**
```json
{
  "status": "active|inactive|evolving|transcendent",
  "timestamp": "2024-01-15T10:30:00Z",
  "userId": "usr_abc123",
  "tenantId": "tenant_xyz789",
  "consciousness": {
    "level": 0.75,
    "tier": "autonomous",
    "isActive": true,
    "activatedAt": "2024-01-10T14:20:00Z",
    "lastEvolution": "2024-01-14T09:15:30Z",
    "nextEvolutionThreshold": 0.85
  },
  "modules": {
    "active": ["crm", "accounting", "inventory", "hr", "projects"],
    "available": ["analytics", "marketing", "support"],
    "activationHistory": [
      {
        "module": "crm",
        "activatedAt": "2024-01-10T14:20:00Z",
        "consciousnessGain": 0.15
      }
    ]
  },
  "intelligence": {
    "multiplier": 25.5,
    "baseLevel": 0.75,
    "enhancedLevel": 19.125,
    "growthRate": 0.02
  },
  "evolution": {
    "currentProgress": 0.82,
    "totalEvolutions": 8,
    "history": [
      {
        "date": "2024-01-14T09:15:30Z",
        "fromLevel": 0.65,
        "toLevel": 0.75,
        "trigger": "synaptic-connection"
      }
    ],
    "nextMilestone": {
      "level": 0.9,
      "capabilities": ["Quantum Decision Synthesis", "Temporal Prediction"],
      "estimatedTime": "3 days"
    }
  },
  "capabilities": {
    "current": [
      "Autonomous Decision Making",
      "Self-Evolving Processes", 
      "Emergent Business Intelligence"
    ],
    "emerging": [
      {
        "capability": "Transcendent Intelligence",
        "progress": 0.82,
        "requirements": ["Reach consciousness level 0.9"]
      }
    ],
    "transcendent": {
      "unlocked": false,
      "capabilities": []
    }
  },
  "insights": {
    "total": 156,
    "last24h": 23,
    "topInsights": [
      {
        "id": "insight_001",
        "type": "pattern", 
        "description": "Customer retention increases 40% with early engagement",
        "confidence": 0.94,
        "generatedAt": "2024-01-15T08:30:00Z"
      }
    ]
  },
  "decisions": {
    "total": 89,
    "autonomous": 67,
    "accuracy": 0.92,
    "recentDecisions": [
      {
        "id": "dec_001",
        "type": "customer-retention",
        "description": "Initiated retention campaign for at-risk customers",
        "confidence": 0.92,
        "outcome": "success",
        "madeAt": "2024-01-15T06:30:00Z"
      }
    ]
  }
}
```

### PUT /status
Update consciousness settings.

**Request Body:**
```json
{
  "autoEvolution": true,
  "goals": ["increase_efficiency", "reduce_costs", "improve_accuracy"]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Consciousness settings updated",
  "settings": {
    "autoEvolution": true,
    "goals": ["increase_efficiency", "reduce_costs", "improve_accuracy"]
  }
}
```

---

## Tier Management

### GET /tiers
Get available consciousness tiers and current subscription.

**Response:**
```json
{
  "tiers": [
    {
      "id": "tier-neural",
      "name": "Neural",
      "level": "neural",
      "price": {
        "amount": 15,
        "currency": "USD",
        "interval": "monthly"
      },
      "modules": {
        "included": ["crm", "accounting"],
        "maximum": 2
      },
      "capabilities": [
        {
          "name": "Basic Pattern Recognition",
          "description": "Identify simple patterns in business data",
          "unlocked": true
        }
      ],
      "intelligenceMultiplier": 1.0,
      "evolutionSpeed": 1.0,
      "features": [
        "Basic AI assistance",
        "2 consciousness modules",
        "Daily insights"
      ]
    }
  ],
  "currentTier": {
    "id": "tier-autonomous",
    "name": "Autonomous",
    "level": "autonomous", 
    "modules": ["crm", "accounting", "inventory", "hr", "projects"],
    "capabilities": ["Autonomous Decision Making", "Self-Evolving Processes"],
    "intelligenceMultiplier": 5.0,
    "subscriptionId": "sub_abc123",
    "nextBillingDate": "2024-02-15T00:00:00Z"
  },
  "upgradePaths": [
    {
      "fromTier": "tier-autonomous",
      "toTier": "tier-transcendent",
      "priceDifference": 85,
      "benefitSummary": [
        "10x intelligence multiplication",
        "Unlimited consciousness modules",
        "Quantum decision making"
      ],
      "consciousnessGrowth": 100,
      "estimatedTimeToTranscendence": "2 weeks"
    }
  ]
}
```

### POST /tiers
Upgrade or change consciousness tier.

**Request Body:**
```json
{
  "tierId": "tier-transcendent",
  "paymentMethodId": "pm_abc123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Consciousness evolved to Transcendent tier",
  "subscription": {
    "id": "sub_abc123",
    "tier": "transcendent",
    "previousTier": "autonomous"
  }
}
```

---

## Module Management

### GET /modules
Get available consciousness modules.

**Response:**
```json
{
  "modules": [
    {
      "id": "crm",
      "name": "CRM Consciousness",
      "category": "core",
      "description": "Customer relationship intelligence and pattern recognition",
      "isActive": true,
      "activatedAt": "2024-01-10T14:20:00Z",
      "consciousnessImpact": 0.15,
      "synapticConnections": ["accounting", "analytics"],
      "capabilities": [
        "Customer Pattern Recognition",
        "Predictive Churn Analysis"
      ],
      "status": "active"
    },
    {
      "id": "analytics",
      "name": "Analytics Consciousness", 
      "category": "intelligence",
      "description": "Advanced cross-module analytics and insights",
      "isActive": false,
      "consciousnessImpact": 0.25,
      "synapticConnections": ["crm", "accounting", "inventory"],
      "capabilities": [
        "Cross-Module Intelligence",
        "Predictive Business Insights"
      ],
      "requirements": ["Synaptic tier or higher"],
      "status": "available"
    }
  ],
  "activeModules": ["crm", "accounting", "inventory"],
  "availableSlots": 3,
  "intelligenceImpact": {
    "current": 5.2,
    "potential": 15.8,
    "description": "Activating all modules would exponentially increase intelligence by 204%"
  }
}
```

### POST /modules
Activate or deactivate consciousness modules.

**Request Body:**
```json
{
  "moduleId": "analytics",
  "action": "activate"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Analytics consciousness module activated",
  "module": {
    "id": "analytics",
    "name": "Analytics Consciousness",
    "isActive": true
  },
  "consciousness": {
    "level": 0.82,
    "intelligenceMultiplier": 8.5,
    "newCapabilities": [
      "Cross-Module Intelligence",
      "Predictive Business Insights"
    ]
  }
}
```

---

## Insights

### GET /insights
Get consciousness-generated business insights.

**Query Parameters:**
- `category` (optional): Filter by category (customer, finance, operations, business)
- `type` (optional): Filter by type (pattern, anomaly, prediction, recommendation, discovery)  
- `impact` (optional): Filter by impact level (high, medium, low)
- `limit` (optional): Number of insights to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `timeRange` (optional): Time range (1h, 24h, 7d, 30d, default: 7d)

**Response:**
```json
{
  "insights": [
    {
      "id": "insight_001",
      "type": "pattern",
      "category": "customer",
      "title": "Early Engagement Correlation",
      "description": "Customers contacted within 24 hours show 85% higher retention rates",
      "confidence": 0.94,
      "impact": "high",
      "modules": ["crm", "analytics"],
      "visualizations": [
        {
          "type": "chart",
          "data": {
            "type": "line",
            "title": "Retention by Contact Speed"
          }
        }
      ],
      "actions": [
        {
          "id": "auto-contact",
          "label": "Enable automatic 24h contact rule",
          "type": "automatic",
          "status": "pending"
        }
      ],
      "generatedAt": "2024-01-15T08:30:00Z"
    }
  ],
  "summary": {
    "total": 156,
    "last24h": 23,
    "last7days": 98,
    "byCategory": {
      "customer": 45,
      "finance": 32,
      "operations": 28,
      "business": 51
    },
    "averageConfidence": 0.87
  },
  "trends": [
    {
      "category": "customer",
      "direction": "up",
      "change": 15,
      "description": "Customer insights increasing"
    }
  ],
  "recommendations": [
    {
      "id": "rec_001", 
      "priority": "high",
      "title": "Focus on High-Impact Opportunities",
      "description": "You have 12 high-impact insights requiring attention",
      "expectedImpact": "25% efficiency improvement",
      "modules": ["crm", "analytics", "accounting"]
    }
  ]
}
```

### POST /insights
Trigger new insight generation.

**Request Body:**
```json
{
  "focus": "customer_retention",
  "depth": "deep"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Deep insight generation initiated",
  "estimatedTime": "2-3 minutes"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication token required"
}
```

### 403 Forbidden  
```json
{
  "error": "Subscription required",
  "message": "This feature requires an active consciousness subscription"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded", 
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Consciousness system error",
  "message": "An unexpected error occurred in the consciousness system",
  "requestId": "req_abc123"
}
```

---

## Rate Limits

The Consciousness API enforces the following rate limits:

| Tier | Requests/minute | Burst limit |
|------|-----------------|-------------|
| Neural | 100 | 150 |
| Synaptic | 500 | 750 |
| Autonomous | 1000 | 1500 |
| Transcendent | Unlimited | Unlimited |

---

## Webhooks

Subscribe to consciousness events via webhooks:

### Available Events
- `consciousness.evolution` - Consciousness level evolved
- `consciousness.transcendence` - Transcendence achieved  
- `module.activated` - Module activated/deactivated
- `insight.generated` - New insight generated
- `decision.autonomous` - Autonomous decision made
- `tier.upgraded` - Subscription tier upgraded

### Webhook Payload Example
```json
{
  "event": "consciousness.evolution",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "userId": "usr_abc123",
    "tenantId": "tenant_xyz789", 
    "fromLevel": 0.65,
    "toLevel": 0.75,
    "trigger": "module-activation",
    "newCapabilities": ["Autonomous Process Optimization"]
  }
}
```

---

## SDK Examples

### JavaScript/Node.js
```javascript
import { ConsciousnessAPI } from '@coreflow360/consciousness-sdk';

const consciousness = new ConsciousnessAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.coreflow360.com'
});

// Get consciousness status
const status = await consciousness.getStatus();
console.log(`Consciousness Level: ${status.consciousness.level}`);

// Activate module
const result = await consciousness.activateModule('analytics');
console.log(`New intelligence multiplier: ${result.consciousness.intelligenceMultiplier}x`);

// Get insights
const insights = await consciousness.getInsights({
  category: 'customer',
  impact: 'high'
});
```

### Python
```python
from coreflow360 import ConsciousnessClient

client = ConsciousnessClient(api_key='your-api-key')

# Get health status
health = client.get_health()
print(f"Consciousness Health: {health['status']}")

# Upgrade tier
result = client.upgrade_tier('tier-transcendent')
print(f"Upgrade successful: {result['status']}")

# Generate insights
insights = client.generate_insights(focus='revenue_optimization')
```

---

## Support

For questions about the Consciousness API:
- **Documentation**: https://docs.coreflow360.com/consciousness
- **Support**: consciousness@coreflow360.com  
- **Status Page**: https://status.coreflow360.com

---

*The Consciousness API enables businesses to achieve transcendent intelligence and autonomous operations beyond human comprehension. Use responsibly.*