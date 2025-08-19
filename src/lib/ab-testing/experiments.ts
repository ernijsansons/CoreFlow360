/**
 * A/B Testing Experiments Configuration
 * Define all active experiments and their variants
 */

export interface Variant {
  id: string
  name: string
  weight: number // 0-100 percentage
  config: Record<string, unknown>
}

export interface Experiment {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  startDate: Date
  endDate?: Date
  variants: Variant[]
  metrics: string[]
  targetAudience?: {
    device?: 'mobile' | 'desktop' | 'all'
    location?: string[]
    newUsers?: boolean
  }
}

export const experiments: Experiment[] = [
  {
    id: 'hero-headline-test',
    name: 'Hero Headline Copy Test',
    description: 'Test different headline variations for conversion impact',
    status: 'active',
    startDate: new Date('2024-01-01'),
    variants: [
      {
        id: 'control',
        name: 'Control - Revenue Machine',
        weight: 50,
        config: {
          headline: 'Turn Your Business Into a Revenue Machine',
          subheadline: 'That Runs Itself',
        },
      },
      {
        id: 'variant-a',
        name: 'Variant A - 10X Growth',
        weight: 50,
        config: {
          headline: 'Achieve 10X Business Growth',
          subheadline: 'With Autonomous Operations',
        },
      },
    ],
    metrics: ['conversion_rate', 'bounce_rate', 'time_on_page'],
  },
  {
    id: 'cta-button-test',
    name: 'CTA Button Text Test',
    description: 'Test different CTA button text for click-through rate',
    status: 'active',
    startDate: new Date('2024-01-01'),
    variants: [
      {
        id: 'control',
        name: 'Control - Start Free Trial',
        weight: 33,
        config: {
          primaryCTA: 'Start Free 30-Day Trial',
          secondaryCTA: 'Watch 3-Min Demo',
        },
      },
      {
        id: 'variant-a',
        name: 'Variant A - Get Started',
        weight: 33,
        config: {
          primaryCTA: 'Get Started Free',
          secondaryCTA: 'See How It Works',
        },
      },
      {
        id: 'variant-b',
        name: 'Variant B - Claim Offer',
        weight: 34,
        config: {
          primaryCTA: 'Claim Your $500 Discount',
          secondaryCTA: 'Schedule Demo',
        },
      },
    ],
    metrics: ['cta_click_rate', 'form_submission_rate'],
  },
  {
    id: 'social-proof-test',
    name: 'Social Proof Display Test',
    description: 'Test different social proof presentation styles',
    status: 'active',
    startDate: new Date('2024-01-01'),
    variants: [
      {
        id: 'control',
        name: 'Control - User Count',
        weight: 50,
        config: {
          type: 'user_count',
          display: '2,847+ businesses transformed',
        },
      },
      {
        id: 'variant-a',
        name: 'Variant A - Revenue Stats',
        weight: 50,
        config: {
          type: 'revenue_stats',
          display: '$127M+ revenue generated',
        },
      },
    ],
    metrics: ['trust_indicator_impact', 'conversion_rate'],
  },
  {
    id: 'pricing-display-test',
    name: 'Pricing Display Format',
    description: 'Test different ways of presenting pricing',
    status: 'active',
    startDate: new Date('2024-01-01'),
    variants: [
      {
        id: 'control',
        name: 'Control - Module Selection',
        weight: 50,
        config: {
          type: 'interactive',
          showCalculator: true,
        },
      },
      {
        id: 'variant-a',
        name: 'Variant A - Simple Tiers',
        weight: 50,
        config: {
          type: 'simple_tiers',
          tiers: ['Starter', 'Professional', 'Enterprise'],
        },
      },
    ],
    metrics: ['pricing_engagement', 'checkout_initiation'],
  },
  {
    id: 'urgency-element-test',
    name: 'Urgency Element Test',
    description: 'Test different urgency/scarcity tactics',
    status: 'active',
    startDate: new Date('2024-01-01'),
    targetAudience: {
      newUsers: true,
    },
    variants: [
      {
        id: 'control',
        name: 'Control - Countdown Timer',
        weight: 33,
        config: {
          type: 'countdown',
          message: 'Limited Time: Early Access Pricing',
        },
      },
      {
        id: 'variant-a',
        name: 'Variant A - Spots Remaining',
        weight: 33,
        config: {
          type: 'spots',
          message: 'Only 47 spots remaining',
        },
      },
      {
        id: 'variant-b',
        name: 'Variant B - No Urgency',
        weight: 34,
        config: {
          type: 'none',
          message: null,
        },
      },
    ],
    metrics: ['urgency_impact', 'conversion_rate', 'anxiety_metrics'],
  },
]

// Get active experiments
export function getActiveExperiments(): Experiment[] {
  return experiments.filter((exp) => exp.status === 'active')
}

// Get experiment by ID
export function getExperiment(id: string): Experiment | undefined {
  return experiments.find((exp) => exp.id === id)
}

// Check if user qualifies for experiment
export function userQualifiesForExperiment(
  experiment: Experiment,
  userContext: {
    device?: string
    location?: string
    isNewUser?: boolean
  }
): boolean {
  if (!experiment.targetAudience) return true

  const { device, location, newUsers } = experiment.targetAudience

  if (device && device !== 'all' && userContext.device !== device) {
    return false
  }

  if (location && location.length > 0 && !location.includes(userContext.location || '')) {
    return false
  }

  if (newUsers !== undefined && userContext.isNewUser !== newUsers) {
    return false
  }

  return true
}
