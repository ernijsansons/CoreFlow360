/**
 * CoreFlow360 - AI Configuration
 * Your Business's Second Brain
 * 
 * Thinks about your business so you don't have to
 */

export const AI_CONFIG = {
  // Platform Identity
  platform: {
    name: 'CoreFlow360',
    tagline: 'Your Business Partner That Never Sleeps',
    version: '2.0.0',
    type: 'AI Business Partner'
  },

  // What AI Can Do For You
  capabilities: {
    autonomous: 'Works without you telling it what to do',
    multiAgent: 'Like having multiple expert employees',
    selfLearning: 'Gets smarter every day',
    predictive: 'Sees problems before they happen',
    prescriptive: 'Tells you exactly what to do',
    conversational: 'You can talk to it like a person',
    multiModal: 'Understands text, numbers, and images',
    realTime: 'Answers instantly'
  },

  // Your AI Employees
  agents: {
    orchestrator: {
      name: 'Your AI Business Manager',
      role: 'Coordinates all your other AI employees and makes sure everything works together',
      capabilities: [
        'Assigns tasks to the right AI employee',
        'Makes sure departments work together',
        'Plans your business strategy',
        'Manages your resources',
        'Makes important decisions'
      ]
    },
    departmental: {
      crm: {
        name: 'Your AI Sales Expert',
        role: 'Knows your customers better than they know themselves',
        capabilities: [
          'Tells you who to call right now',
          'Warns you before customers leave',
          'Reads customer emotions',
          'Suggests the perfect next step',
          'Calculates customer lifetime value',
          'Personalizes every interaction'
        ]
      },
      sales: {
        name: 'Your AI Revenue Generator',
        role: 'Finds money you\'re leaving on the table',
        capabilities: [
          'Predicts which deals will close',
          'Sets the perfect prices',
          'Plans sales territories',
          'Calculates commissions automatically',
          'Sets realistic quotas',
          'Analyzes your competition'
        ]
      },
      finance: {
        name: 'Your AI Money Detective',
        role: 'Finds hidden cash and prevents financial disasters',
        capabilities: [
          'Predicts cash flow problems',
          'Spots unusual expenses',
          'Cuts unnecessary costs',
          'Keeps you compliant',
          'Forecasts your budget',
          'Assesses financial risks'
        ]
      },
      operations: {
        name: 'Your AI Operations Expert',
        role: 'Makes everything run smoother and faster',
        capabilities: [
          'Optimizes your resources',
          'Automates boring tasks',
          'Predicts when things will break',
          'Optimizes your supply chain',
          'Ensures perfect quality',
          'Monitors performance 24/7'
        ]
      },
      hr: {
        name: 'Your AI People Person',
        role: 'Keeps your best people happy and finds great new ones',
        capabilities: [
          'Matches perfect candidates to jobs',
          'Predicts top performers',
          'Prevents good people from leaving',
          'Sets fair compensation',
          'Identifies skill gaps',
          'Plans leadership succession'
        ]
      },
      analytics: {
        name: 'Your AI Crystal Ball',
        role: 'Shows you the future of your business',
        capabilities: [
          'Spots hidden patterns',
          'Identifies trends before competitors',
          'Builds prediction models',
          'Catches unusual activity',
          'Creates beautiful reports',
          'Optimizes your KPIs'
        ]
      }
    }
  },

  // How Fast and Smart Your AI Is
  performance: {
    responseTime: 'Instant',
    accuracy: '19 out of 20 times',
    availability: 'Never sleeps',
    learningRate: 'Gets smarter every day',
    scalability: 'Grows with you forever'
  },

  // What Powers Your AI
  integrations: {
    models: {
      primary: 'Latest AI brain (GPT-4)',
      backup: 'Backup AI brain (Claude-3)',
      specialized: 'Custom AI for your industry'
    },
    data: {
      sources: ['Your CRM', 'Your books', 'External data', 'Live updates'],
      processing: 'Instant analysis',
      storage: 'Smart memory system'
    }
  },

  // Technical config (preserved for functionality)
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