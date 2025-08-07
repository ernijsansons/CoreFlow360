/**
 * CoreFlow360 - AI Configuration
 * WORLD'S #1 AI-FIRST ERP PLATFORM
 * 
 * Central nervous system for ALL business operations
 */

export const AI_CONFIG = {
  // Platform Identity
  platform: {
    name: 'CoreFlow360',
    tagline: 'The Future of Enterprise Software',
    version: '2.0.0',
    type: 'World\'s #1 AI-First ERP'
  },

  // AI Capabilities
  capabilities: {
    autonomous: true,
    multiAgent: true,
    selfLearning: true,
    predictive: true,
    prescriptive: true,
    conversational: true,
    multiModal: true,
    realTime: true
  },

  // Agent Architecture
  agents: {
    orchestrator: {
      name: 'Central AI Orchestrator',
      role: 'Master coordinator of all AI agents and business processes',
      capabilities: [
        'task-delegation', 
        'cross-department-optimization', 
        'strategic-planning',
        'resource-allocation',
        'decision-making'
      ]
    },
    departmental: {
      crm: {
        name: 'CRM AI Agent',
        role: 'Customer relationship optimization and intelligence',
        capabilities: [
          'lead-scoring', 
          'churn-prediction', 
          'sentiment-analysis', 
          'next-best-action',
          'customer-lifetime-value',
          'personalization'
        ]
      },
      sales: {
        name: 'Sales AI Agent',
        role: 'Revenue optimization and forecasting',
        capabilities: [
          'deal-prediction', 
          'price-optimization', 
          'territory-planning', 
          'commission-calculation',
          'quota-planning',
          'competitive-analysis'
        ]
      },
      finance: {
        name: 'Finance AI Agent',
        role: 'Financial intelligence and automation',
        capabilities: [
          'cashflow-prediction', 
          'anomaly-detection', 
          'expense-optimization', 
          'compliance-monitoring',
          'budget-forecasting',
          'risk-assessment'
        ]
      },
      operations: {
        name: 'Operations AI Agent',
        role: 'Operational excellence and efficiency',
        capabilities: [
          'resource-optimization', 
          'workflow-automation', 
          'predictive-maintenance', 
          'supply-chain-optimization',
          'quality-assurance',
          'performance-monitoring'
        ]
      },
      hr: {
        name: 'HR AI Agent',
        role: 'Human capital optimization',
        capabilities: [
          'talent-matching', 
          'performance-prediction', 
          'retention-analysis', 
          'compensation-optimization',
          'skill-gap-analysis',
          'succession-planning'
        ]
      },
      analytics: {
        name: 'Analytics AI Agent',
        role: 'Business intelligence and insights generation',
        capabilities: [
          'pattern-recognition',
          'trend-analysis',
          'predictive-modeling',
          'anomaly-detection',
          'report-generation',
          'kpi-optimization'
        ]
      }
    }
  },

  // AI Performance Metrics
  performance: {
    responseTime: '< 100ms',
    accuracy: '> 94%',
    availability: '99.99%',
    learningRate: 'Continuous',
    scalability: 'Infinite'
  },

  // Integration Points
  integrations: {
    models: {
      primary: 'GPT-4 Turbo',
      backup: 'Claude-3 Opus',
      specialized: 'Custom Domain Models'
    },
    data: {
      sources: ['CRM', 'ERP', 'External APIs', 'Real-time Feeds'],
      processing: 'Real-time + Batch',
      storage: 'Vector Database + Traditional'
    }
  },

  // Original provider config (preserved)
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY!,
      defaultModel: 'gpt-4-turbo-preview',
      temperature: 0.7,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY!,
      defaultModel: 'claude-3-opus-20240229',
    },
  },
  features: {
    streaming: true,
    tokenTracking: true,
    costMonitoring: true,
    crossDeptCorrelation: true,
  },
  limits: {
    maxTokensPerRequest: 4000,
    maxRequestsPerMinute: 60,
    maxCostPerDay: 100,
  },
};

export default AI_CONFIG;