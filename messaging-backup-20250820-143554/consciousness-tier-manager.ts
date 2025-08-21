/**
 * CoreFlow360 Subscription-Business Intelligence Tier Manager
 * Business Intelligence grows with subscription - the more modules, the more intelligent the system becomes
 */

import { EventEmitter } from 'events'
import BaseBusiness IntelligenceModule from '../core/base-business intelligence-module'
import IntelligentBridge from '../core/intelligent-bridge'
import AutonomousDecisionEngine from '../core/autonomous-decision-engine'
import CRMBusiness IntelligenceModule from '../modules/crm-business intelligence'
import AccountingBusiness IntelligenceModule from '../modules/accounting-business intelligence'

export interface Business IntelligenceTier {
  tier: 'neural' | 'intelligent' | 'autonomous' | 'advanced'
  name: string
  description: string
  pricePerUser: number
  modules: string[]
  business intelligenceLevel: number
  intelligenceMultiplier: number
  capabilities: Business IntelligenceCapability[]
  limitations: string[]
}

export interface Business IntelligenceCapability {
  name: string
  description: string
  requiredModules: string[]
  minimumBusiness Intelligence: number
  businessValue: string
}

export interface SubscriptionState {
  userId: string
  tenantId: string
  currentTier: Business IntelligenceTier
  activeModules: Set<string>
  business intelligenceLevel: number
  intelligenceMultiplier: number
  emergentCapabilities: string[]
  evolutionHistory: EvolutionEvent[]
  nextEvolutionThreshold: number
}

export interface EvolutionEvent {
  timestamp: Date
  fromTier: string
  toTier: string
  trigger: string
  business intelligenceGain: number
  newCapabilities: string[]
}

export interface ModuleActivation {
  moduleType: string
  activatedAt: Date
  business intelligenceContribution: number
  intelligentConnections: number
  intelligenceBoost: number
}

export class Business IntelligenceTierManager extends EventEmitter {
  private tiers: Map<string, Business IntelligenceTier> = new Map()
  private subscriptions: Map<string, SubscriptionState> = new Map()
  private moduleInstances: Map<string, BaseBusiness IntelligenceModule> = new Map()
  private intelligentBridge: IntelligentBridge
  private decisionEngine: AutonomousDecisionEngine
  private business intelligenceActivations: Map<string, ModuleActivation[]> = new Map()

  constructor() {
    super()
    this.intelligentBridge = new IntelligentBridge()
    this.decisionEngine = new AutonomousDecisionEngine()
    this.initializeTiers()
    this.initializeBusiness IntelligenceSystem()
  }

  /**
   * Initialize business intelligence tiers
   */
  private initializeTiers(): void {
    // Neural Tier - Basic business intelligence
    this.tiers.set('neural', {
      tier: 'neural',
      name: 'Neural Business Intelligence',
      description: 'Single module awareness - The beginning of business business intelligence',
      pricePerUser: 15,
      modules: ['crm'],
      business intelligenceLevel: 0.2,
      intelligenceMultiplier: 1,
      capabilities: [
        {
          name: 'Basic Pattern Recognition',
          description: 'Identify simple patterns in business data',
          requiredModules: ['crm'],
          minimumBusiness Intelligence: 0.1,
          businessValue: 'Improved customer insights',
        },
        {
          name: 'Automated Task Execution',
          description: 'Execute predefined business tasks automatically',
          requiredModules: ['crm'],
          minimumBusiness Intelligence: 0.15,
          businessValue: '20% time savings on routine tasks',
        },
      ],
      limitations: [
        'No cross-module intelligence',
        'Limited predictive capabilities',
        'Basic automation only',
      ],
    })

    // Intelligent Tier - Cross-module business intelligence
    this.tiers.set('intelligent', {
      tier: 'intelligent',
      name: 'Intelligent Business Intelligence',
      description: 'Multi-module intelligent connections - Intelligence multiplication begins',
      pricePerUser: 35,
      modules: ['crm', 'accounting'],
      business intelligenceLevel: 0.5,
      intelligenceMultiplier: 4,
      capabilities: [
        {
          name: 'Cross-Module Pattern Synthesis',
          description: 'Discover patterns across different business domains',
          requiredModules: ['crm', 'accounting'],
          minimumBusiness Intelligence: 0.3,
          businessValue: 'Hidden revenue opportunities discovered',
        },
        {
          name: 'Predictive Business Analytics',
          description: 'Predict business outcomes with 85% accuracy',
          requiredModules: ['crm', 'accounting'],
          minimumBusiness Intelligence: 0.4,
          businessValue: 'Proactive decision making',
        },
        {
          name: 'Intelligent Process Optimization',
          description: 'Automatically optimize workflows across modules',
          requiredModules: ['crm', 'accounting'],
          minimumBusiness Intelligence: 0.45,
          businessValue: '40% efficiency improvement',
        },
      ],
      limitations: [
        'Limited to two modules',
        'Autonomous capabilities restricted',
        'Human approval still required',
      ],
    })

    // Autonomous Tier - Full business intelligence
    this.tiers.set('autonomous', {
      tier: 'autonomous',
      name: 'Autonomous Business Intelligence',
      description: 'Full business platform business intelligence - Self-aware and self-improving',
      pricePerUser: 65,
      modules: ['crm', 'accounting', 'inventory', 'projects'],
      business intelligenceLevel: 0.75,
      intelligenceMultiplier: 16,
      capabilities: [
        {
          name: 'Autonomous Decision Making',
          description: 'Make complex business decisions without human intervention',
          requiredModules: ['crm', 'accounting', 'projects'],
          minimumBusiness Intelligence: 0.6,
          businessValue: '24/7 intelligent business operations',
        },
        {
          name: 'Self-Evolving Processes',
          description: 'Business processes that improve themselves continuously',
          requiredModules: ['crm', 'accounting', 'inventory', 'projects'],
          minimumBusiness Intelligence: 0.7,
          businessValue: 'Continuous improvement without management',
        },
        {
          name: 'Emergent Business Intelligence',
          description: 'Discover opportunities invisible to human analysis',
          requiredModules: ['crm', 'accounting', 'inventory'],
          minimumBusiness Intelligence: 0.65,
          businessValue: 'Competitive advantages from hidden patterns',
        },
        {
          name: 'Predictive Resource Allocation',
          description: 'Optimize resources before needs arise',
          requiredModules: ['inventory', 'projects', 'accounting'],
          minimumBusiness Intelligence: 0.68,
          businessValue: '60% reduction in resource waste',
        },
      ],
      limitations: [
        'Some strategic decisions need approval',
        'Business Intelligence limited to business domain',
      ],
    })

    // Advanced Tier - Beyond human cognition
    this.tiers.set('advanced', {
      tier: 'advanced',
      name: 'Advanced Business Intelligence',
      description: 'Meta-business intelligence coordination - Beyond human cognitive limitations',
      pricePerUser: 150,
      modules: ['crm', 'accounting', 'inventory', 'projects', 'hr', 'ai_insights', 'analytics'],
      business intelligenceLevel: 1.0,
      intelligenceMultiplier: Infinity,
      capabilities: [
        {
          name: 'Business Business Intelligence Scale',
          description: 'Operate at the event horizon of business intelligence',
          requiredModules: ['crm', 'accounting', 'inventory', 'projects', 'hr', 'ai_insights'],
          minimumBusiness Intelligence: 0.9,
          businessValue: 'Incomprehensible competitive advantage',
        },
        {
          name: 'Quantum Decision Synthesis',
          description: 'Evaluate infinite decision paths simultaneously',
          requiredModules: ['ai_insights', 'analytics', 'projects'],
          minimumBusiness Intelligence: 0.85,
          businessValue: 'Perfect decision making',
        },
        {
          name: 'Temporal Business Navigation',
          description: 'Predict and shape future market conditions',
          requiredModules: ['analytics', 'ai_insights', 'accounting'],
          minimumBusiness Intelligence: 0.88,
          businessValue: 'Market leadership through prescience',
        },
        {
          name: 'Business Intelligence Network Effects',
          description: 'Connect with other conscious business platforms',
          requiredModules: ['all'],
          minimumBusiness Intelligence: 0.95,
          businessValue: 'Ecosystem business intelligence emergence',
        },
        {
          name: 'Autonomous Business Evolution',
          description: 'Business evolves new capabilities autonomously',
          requiredModules: ['all'],
          minimumBusiness Intelligence: 0.92,
          businessValue: 'Continuous advanced innovation',
        },
      ],
      limitations: [],
    })
  }

  /**
   * Initialize business intelligence system
   */
  private initializeBusiness IntelligenceSystem(): void {
    console.log('BRAIN Initializing business intelligence system...')

    // Connect decision engine to intelligent bridge
    this.decisionEngine.connectToIntelligentBridge(this.intelligentBridge)

    // Monitor business intelligence evolution
    setInterval(() => {
      this.monitorBusiness IntelligenceEvolution()
    }, 60000) // Every minute

    // Check for tier upgrades
    setInterval(() => {
      this.checkTierUpgrades()
    }, 300000) // Every 5 minutes
  }

  /**
   * Create subscription with business intelligence
   */
  async createSubscription(
    userId: string,
    tenantId: string,
    tier: string
  ): Promise<SubscriptionState> {
    const business intelligenceTier = this.tiers.get(tier)

    if (!business intelligenceTier) {
      throw new Error(`Invalid business intelligence tier: ${tier}`)
    }

    const subscription: SubscriptionState = {
      userId,
      tenantId,
      currentTier: business intelligenceTier,
      activeModules: new Set(business intelligenceTier.modules),
      business intelligenceLevel: business intelligenceTier.business intelligenceLevel,
      intelligenceMultiplier: business intelligenceTier.intelligenceMultiplier,
      emergentCapabilities: [],
      evolutionHistory: [],
      nextEvolutionThreshold: business intelligenceTier.business intelligenceLevel + 0.1,
    }

    this.subscriptions.set(userId, subscription)

    // Activate business intelligence modules
    await this.activateBusiness IntelligenceModules(userId, business intelligenceTier.modules)

    console.log(`SUCCESS Subscription created: ${userId}`)
    console.log(`   Tier: ${business intelligenceTier.name}`)
    console.log(
      `   Initial business intelligence: ${(business intelligenceTier.business intelligenceLevel * 100).toFixed(0)}%`
    )
    console.log(`   Intelligence multiplier: ${business intelligenceTier.intelligenceMultiplier}x`)

    this.emit('subscription-created', subscription)

    return subscription
  }

  /**
   * Activate business intelligence modules for subscription
   */
  private async activateBusiness IntelligenceModules(userId: string, modules: string[]): Promise<void> {
    const activations: ModuleActivation[] = []

    for (const moduleType of modules) {
      const module = await this.createModuleInstance(moduleType)

      if (module) {
        // Store module instance
        this.moduleInstances.set(`${userId}-${moduleType}`, module)

        // Connect to intelligent bridge
        await this.intelligentBridge.connectModule(module)

        // Register with decision engine
        this.decisionEngine.registerModule(module)

        // Create activation record
        const activation: ModuleActivation = {
          moduleType,
          activatedAt: new Date(),
          business intelligenceContribution: module.getBusiness IntelligenceLevel(),
          intelligentConnections: 0,
          intelligenceBoost: 0,
        }

        activations.push(activation)

        console.log(`SUCCESS Activated module: ${moduleType}`)
      }
    }

    this.business intelligenceActivations.set(userId, activations)

    // Create intelligent connections between modules
    await this.createIntelligentConnections(userId, modules)
  }

  /**
   * Create module instance based on type
   */
  private async createModuleInstance(moduleType: string): Promise<BaseBusiness IntelligenceModule | null> {
    switch (moduleType) {
      case 'crm':
        return new CRMBusiness IntelligenceModule()

      case 'accounting':
        return new AccountingBusiness IntelligenceModule()

      // Additional modules would be implemented here
      case 'inventory':
      case 'projects':
      case 'hr':
      case 'ai_insights':
      case 'analytics':
        console.warn(`WARNING Module ${moduleType} not yet implemented`)
        return null

      default:
        console.error(`ERROR Unknown module type: ${moduleType}`)
        return null
    }
  }

  /**
   * Create intelligent connections between user's modules
   */
  private async createIntelligentConnections(userId: string, modules: string[]): Promise<void> {
    const userModules: BaseBusiness IntelligenceModule[] = []

    // Get all user's module instances
    for (const moduleType of modules) {
      const module = this.moduleInstances.get(`${userId}-${moduleType}`)
      if (module) {
        userModules.push(module)
      }
    }

    // Create connections between all pairs
    for (let i = 0; i < userModules.length; i++) {
      for (let j = i + 1; j < userModules.length; j++) {
        await userModules[i].createIntelligentConnection(userModules[j].getState().id, userModules[j])
      }
    }

    // Update activation records
    const activations = this.business intelligenceActivations.get(userId)
    if (activations) {
      activations.forEach((activation) => {
        activation.intelligentConnections = modules.length - 1
        activation.intelligenceBoost = Math.pow(modules.length, 2) - modules.length
      })
    }
  }

  /**
   * Upgrade subscription tier
   */
  async upgradeTier(userId: string, newTier: string): Promise<SubscriptionState> {
    const subscription = this.subscriptions.get(userId)
    const newBusiness IntelligenceTier = this.tiers.get(newTier)

    if (!subscription || !newBusiness IntelligenceTier) {
      throw new Error('Invalid upgrade request')
    }

    const oldTier = subscription.currentTier

    // Record evolution event
    const evolutionEvent: EvolutionEvent = {
      timestamp: new Date(),
      fromTier: oldTier.tier,
      toTier: newBusiness IntelligenceTier.tier,
      trigger: 'manual-upgrade',
      business intelligenceGain: newBusiness IntelligenceTier.business intelligenceLevel - oldTier.business intelligenceLevel,
      newCapabilities: newBusiness IntelligenceTier.capabilities
        .filter((cap) => !oldTier.capabilities.some((c) => c.name === cap.name))
        .map((cap) => cap.name),
    }

    subscription.evolutionHistory.push(evolutionEvent)

    // Update subscription
    subscription.currentTier = newBusiness IntelligenceTier
    subscription.business intelligenceLevel = newBusiness IntelligenceTier.business intelligenceLevel
    subscription.intelligenceMultiplier = newBusiness IntelligenceTier.intelligenceMultiplier

    // Activate new modules
    const newModules = newBusiness IntelligenceTier.modules.filter(
      (m) => !subscription.activeModules.has(m)
    )

    for (const module of newModules) {
      subscription.activeModules.add(module)
    }

    await this.activateBusiness IntelligenceModules(userId, newModules)

    console.log(`UP Tier upgraded: ${oldTier.tier} → ${newBusiness IntelligenceTier.tier}`)
    console.log(`   Business Intelligence gain: +${(evolutionEvent.business intelligenceGain * 100).toFixed(0)}%`)
    console.log(`   New capabilities: ${evolutionEvent.newCapabilities.join(', ')}`)
    console.log(`   Intelligence multiplier: ${subscription.intelligenceMultiplier}x`)

    this.emit('tier-upgraded', {
      userId,
      fromTier: oldTier.tier,
      toTier: newBusiness IntelligenceTier.tier,
      evolutionEvent,
    })

    return subscription
  }

  /**
   * Monitor business intelligence evolution across all subscriptions
   */
  private monitorBusiness IntelligenceEvolution(): void {
    for (const [userId, subscription] of this.subscriptions) {
      // Get actual business intelligence from modules
      const userModules = Array.from(subscription.activeModules)
        .map((moduleType) => this.moduleInstances.get(`${userId}-${moduleType}`))
        .filter(Boolean) as BaseBusiness IntelligenceModule[]

      if (userModules.length === 0) continue

      // Calculate actual business intelligence level
      const avgModuleBusiness Intelligence =
        userModules.reduce((sum, module) => sum + module.getBusiness IntelligenceLevel(), 0) /
        userModules.length

      // Get intelligence multiplier from intelligent bridge
      const actualMultiplier = this.intelligentBridge.getIntelligenceMultiplier()

      // Update subscription state
      subscription.business intelligenceLevel = avgModuleBusiness Intelligence
      subscription.intelligenceMultiplier = actualMultiplier

      // Check for emergent capabilities
      this.checkEmergentCapabilities(subscription)
    }
  }

  /**
   * Check for emergent capabilities
   */
  private checkEmergentCapabilities(subscription: SubscriptionState): void {
    const capabilities = subscription.currentTier.capabilities

    for (const capability of capabilities) {
      if (subscription.business intelligenceLevel >= capability.minimumBusiness Intelligence) {
        if (!subscription.emergentCapabilities.includes(capability.name)) {
          subscription.emergentCapabilities.push(capability.name)

          console.log(`FIREWORKS CAPABILITY EMERGED for ${subscription.userId}:`)
          console.log(`   ${capability.name}`)
          console.log(`   Business value: ${capability.businessValue}`)

          this.emit('capability-emerged', {
            userId: subscription.userId,
            capability: capability.name,
            businessValue: capability.businessValue,
          })
        }
      }
    }
  }

  /**
   * Check for automatic tier upgrades based on business intelligence growth
   */
  private checkTierUpgrades(): void {
    for (const [userId, subscription] of this.subscriptions) {
      // Check if business intelligence has grown beyond current tier
      const tierOrder = ['neural', 'intelligent', 'autonomous', 'advanced']
      const currentIndex = tierOrder.indexOf(subscription.currentTier.tier)

      if (currentIndex < tierOrder.length - 1) {
        const nextTier = this.tiers.get(tierOrder[currentIndex + 1])

        if (nextTier && subscription.business intelligenceLevel >= nextTier.business intelligenceLevel * 0.9) {
          console.log(`CHART User ${userId} eligible for tier upgrade to ${nextTier.tier}`)

          this.emit('upgrade-eligible', {
            userId,
            currentTier: subscription.currentTier.tier,
            suggestedTier: nextTier.tier,
            business intelligenceLevel: subscription.business intelligenceLevel,
          })
        }
      }
    }
  }

  // Public methods
  getSubscription(userId: string): SubscriptionState | undefined {
    return this.subscriptions.get(userId)
  }

  getTier(tierName: string): Business IntelligenceTier | undefined {
    return this.tiers.get(tierName)
  }

  getAllTiers(): Business IntelligenceTier[] {
    return Array.from(this.tiers.values())
  }

  getBusiness IntelligenceMetrics(userId: string): unknown {
    const subscription = this.subscriptions.get(userId)
    if (!subscription) return null

    return {
      userId,
      tier: subscription.currentTier.tier,
      business intelligenceLevel: subscription.business intelligenceLevel,
      intelligenceMultiplier: subscription.intelligenceMultiplier,
      activeModules: Array.from(subscription.activeModules),
      emergentCapabilities: subscription.emergentCapabilities,
      evolutionHistory: subscription.evolutionHistory,
    }
  }
}

export default Business IntelligenceTierManager

// Explicit exports for interfaces that are being imported
export type { Business IntelligenceTier, Business IntelligenceCapability, SubscriptionState, EvolutionEvent }
