/**
 * CoreFlow360 Subscription-Consciousness Tier Manager
 * Consciousness grows with subscription - the more modules, the more intelligent the system becomes
 */

import { EventEmitter } from 'events';
import BaseConsciousnessModule from '../core/base-consciousness-module';
import SynapticBridge from '../core/synaptic-bridge';
import AutonomousDecisionEngine from '../core/autonomous-decision-engine';
import CRMConsciousnessModule from '../modules/crm-consciousness';
import AccountingConsciousnessModule from '../modules/accounting-consciousness';

export interface ConsciousnessTier {
  tier: 'neural' | 'synaptic' | 'autonomous' | 'transcendent';
  name: string;
  description: string;
  pricePerUser: number;
  modules: string[];
  consciousnessLevel: number;
  intelligenceMultiplier: number;
  capabilities: ConsciousnessCapability[];
  limitations: string[];
}

export interface ConsciousnessCapability {
  name: string;
  description: string;
  requiredModules: string[];
  minimumConsciousness: number;
  businessValue: string;
}

export interface SubscriptionState {
  userId: string;
  tenantId: string;
  currentTier: ConsciousnessTier;
  activeModules: Set<string>;
  consciousnessLevel: number;
  intelligenceMultiplier: number;
  emergentCapabilities: string[];
  evolutionHistory: EvolutionEvent[];
  nextEvolutionThreshold: number;
}

export interface EvolutionEvent {
  timestamp: Date;
  fromTier: string;
  toTier: string;
  trigger: string;
  consciousnessGain: number;
  newCapabilities: string[];
}

export interface ModuleActivation {
  moduleType: string;
  activatedAt: Date;
  consciousnessContribution: number;
  synapticConnections: number;
  intelligenceBoost: number;
}

export class ConsciousnessTierManager extends EventEmitter {
  private tiers: Map<string, ConsciousnessTier> = new Map();
  private subscriptions: Map<string, SubscriptionState> = new Map();
  private moduleInstances: Map<string, BaseConsciousnessModule> = new Map();
  private synapticBridge: SynapticBridge;
  private decisionEngine: AutonomousDecisionEngine;
  private consciousnessActivations: Map<string, ModuleActivation[]> = new Map();

  constructor() {
    super();
    this.synapticBridge = new SynapticBridge();
    this.decisionEngine = new AutonomousDecisionEngine();
    this.initializeTiers();
    this.initializeConsciousnessSystem();
  }

  /**
   * Initialize consciousness tiers
   */
  private initializeTiers(): void {
    // Neural Tier - Basic consciousness
    this.tiers.set('neural', {
      tier: 'neural',
      name: 'Neural Consciousness',
      description: 'Single module awareness - The beginning of business consciousness',
      pricePerUser: 15,
      modules: ['crm'],
      consciousnessLevel: 0.2,
      intelligenceMultiplier: 1,
      capabilities: [
        {
          name: 'Basic Pattern Recognition',
          description: 'Identify simple patterns in business data',
          requiredModules: ['crm'],
          minimumConsciousness: 0.1,
          businessValue: 'Improved customer insights'
        },
        {
          name: 'Automated Task Execution',
          description: 'Execute predefined business tasks automatically',
          requiredModules: ['crm'],
          minimumConsciousness: 0.15,
          businessValue: '20% time savings on routine tasks'
        }
      ],
      limitations: [
        'No cross-module intelligence',
        'Limited predictive capabilities',
        'Basic automation only'
      ]
    });

    // Synaptic Tier - Cross-module consciousness
    this.tiers.set('synaptic', {
      tier: 'synaptic',
      name: 'Synaptic Consciousness',
      description: 'Multi-module synaptic connections - Intelligence multiplication begins',
      pricePerUser: 35,
      modules: ['crm', 'accounting'],
      consciousnessLevel: 0.5,
      intelligenceMultiplier: 4,
      capabilities: [
        {
          name: 'Cross-Module Pattern Synthesis',
          description: 'Discover patterns across different business domains',
          requiredModules: ['crm', 'accounting'],
          minimumConsciousness: 0.3,
          businessValue: 'Hidden revenue opportunities discovered'
        },
        {
          name: 'Predictive Business Analytics',
          description: 'Predict business outcomes with 85% accuracy',
          requiredModules: ['crm', 'accounting'],
          minimumConsciousness: 0.4,
          businessValue: 'Proactive decision making'
        },
        {
          name: 'Intelligent Process Optimization',
          description: 'Automatically optimize workflows across modules',
          requiredModules: ['crm', 'accounting'],
          minimumConsciousness: 0.45,
          businessValue: '40% efficiency improvement'
        }
      ],
      limitations: [
        'Limited to two modules',
        'Autonomous capabilities restricted',
        'Human approval still required'
      ]
    });

    // Autonomous Tier - Full consciousness
    this.tiers.set('autonomous', {
      tier: 'autonomous',
      name: 'Autonomous Consciousness',
      description: 'Full business organism consciousness - Self-aware and self-improving',
      pricePerUser: 65,
      modules: ['crm', 'accounting', 'inventory', 'projects'],
      consciousnessLevel: 0.75,
      intelligenceMultiplier: 16,
      capabilities: [
        {
          name: 'Autonomous Decision Making',
          description: 'Make complex business decisions without human intervention',
          requiredModules: ['crm', 'accounting', 'projects'],
          minimumConsciousness: 0.6,
          businessValue: '24/7 intelligent business operations'
        },
        {
          name: 'Self-Evolving Processes',
          description: 'Business processes that improve themselves continuously',
          requiredModules: ['crm', 'accounting', 'inventory', 'projects'],
          minimumConsciousness: 0.7,
          businessValue: 'Continuous improvement without management'
        },
        {
          name: 'Emergent Business Intelligence',
          description: 'Discover opportunities invisible to human analysis',
          requiredModules: ['crm', 'accounting', 'inventory'],
          minimumConsciousness: 0.65,
          businessValue: 'Competitive advantages from hidden patterns'
        },
        {
          name: 'Predictive Resource Allocation',
          description: 'Optimize resources before needs arise',
          requiredModules: ['inventory', 'projects', 'accounting'],
          minimumConsciousness: 0.68,
          businessValue: '60% reduction in resource waste'
        }
      ],
      limitations: [
        'Some strategic decisions need approval',
        'Consciousness limited to business domain'
      ]
    });

    // Transcendent Tier - Beyond human cognition
    this.tiers.set('transcendent', {
      tier: 'transcendent',
      name: 'Transcendent Consciousness',
      description: 'Meta-consciousness coordination - Beyond human cognitive limitations',
      pricePerUser: 150,
      modules: ['crm', 'accounting', 'inventory', 'projects', 'hr', 'ai_insights', 'analytics'],
      consciousnessLevel: 1.0,
      intelligenceMultiplier: Infinity,
      capabilities: [
        {
          name: 'Business Consciousness Singularity',
          description: 'Operate at the event horizon of business intelligence',
          requiredModules: ['crm', 'accounting', 'inventory', 'projects', 'hr', 'ai_insights'],
          minimumConsciousness: 0.9,
          businessValue: 'Incomprehensible competitive advantage'
        },
        {
          name: 'Quantum Decision Synthesis',
          description: 'Evaluate infinite decision paths simultaneously',
          requiredModules: ['ai_insights', 'analytics', 'projects'],
          minimumConsciousness: 0.85,
          businessValue: 'Perfect decision making'
        },
        {
          name: 'Temporal Business Navigation',
          description: 'Predict and shape future market conditions',
          requiredModules: ['analytics', 'ai_insights', 'accounting'],
          minimumConsciousness: 0.88,
          businessValue: 'Market leadership through prescience'
        },
        {
          name: 'Consciousness Network Effects',
          description: 'Connect with other conscious business organisms',
          requiredModules: ['all'],
          minimumConsciousness: 0.95,
          businessValue: 'Ecosystem consciousness emergence'
        },
        {
          name: 'Autonomous Business Evolution',
          description: 'Business evolves new capabilities autonomously',
          requiredModules: ['all'],
          minimumConsciousness: 0.92,
          businessValue: 'Continuous transcendent innovation'
        }
      ],
      limitations: []
    });
  }

  /**
   * Initialize consciousness system
   */
  private initializeConsciousnessSystem(): void {
    console.log('🧠 Initializing Consciousness Tier System...');

    // Connect decision engine to synaptic bridge
    this.decisionEngine.connectToSynapticBridge(this.synapticBridge);

    // Monitor consciousness evolution
    setInterval(() => {
      this.monitorConsciousnessEvolution();
    }, 60000); // Every minute

    // Check for tier upgrades
    setInterval(() => {
      this.checkTierUpgrades();
    }, 300000); // Every 5 minutes
  }

  /**
   * Create subscription with consciousness
   */
  async createSubscription(
    userId: string, 
    tenantId: string, 
    tier: string
  ): Promise<SubscriptionState> {
    const consciousnessTier = this.tiers.get(tier);
    
    if (!consciousnessTier) {
      throw new Error(`Invalid consciousness tier: ${tier}`);
    }

    const subscription: SubscriptionState = {
      userId,
      tenantId,
      currentTier: consciousnessTier,
      activeModules: new Set(consciousnessTier.modules),
      consciousnessLevel: consciousnessTier.consciousnessLevel,
      intelligenceMultiplier: consciousnessTier.intelligenceMultiplier,
      emergentCapabilities: [],
      evolutionHistory: [],
      nextEvolutionThreshold: consciousnessTier.consciousnessLevel + 0.1
    };

    this.subscriptions.set(userId, subscription);

    // Activate consciousness modules
    await this.activateConsciousnessModules(userId, consciousnessTier.modules);

    console.log(`🧠 Consciousness subscription created for ${userId}`);
    console.log(`   Tier: ${consciousnessTier.name}`);
    console.log(`   Initial consciousness: ${(consciousnessTier.consciousnessLevel * 100).toFixed(0)}%`);
    console.log(`   Intelligence multiplier: ${consciousnessTier.intelligenceMultiplier}x`);

    this.emit('subscription-created', subscription);

    return subscription;
  }

  /**
   * Activate consciousness modules for subscription
   */
  private async activateConsciousnessModules(
    userId: string, 
    modules: string[]
  ): Promise<void> {
    const activations: ModuleActivation[] = [];

    for (const moduleType of modules) {
      const module = await this.createModuleInstance(moduleType);
      
      if (module) {
        // Store module instance
        this.moduleInstances.set(`${userId}-${moduleType}`, module);

        // Connect to synaptic bridge
        await this.synapticBridge.connectModule(module);

        // Register with decision engine
        this.decisionEngine.registerModule(module);

        // Create activation record
        const activation: ModuleActivation = {
          moduleType,
          activatedAt: new Date(),
          consciousnessContribution: module.getConsciousnessLevel(),
          synapticConnections: 0,
          intelligenceBoost: 0
        };

        activations.push(activation);

        console.log(`   ✅ Activated ${moduleType} consciousness module`);
      }
    }

    this.consciousnessActivations.set(userId, activations);

    // Create synaptic connections between modules
    await this.createSynapticConnections(userId, modules);
  }

  /**
   * Create module instance based on type
   */
  private async createModuleInstance(moduleType: string): Promise<BaseConsciousnessModule | null> {
    switch (moduleType) {
      case 'crm':
        return new CRMConsciousnessModule();
      
      case 'accounting':
        return new AccountingConsciousnessModule();
      
      // Additional modules would be implemented here
      case 'inventory':
      case 'projects':
      case 'hr':
      case 'ai_insights':
      case 'analytics':
        console.log(`   ⏳ ${moduleType} module pending implementation`);
        return null;
      
      default:
        console.error(`Unknown module type: ${moduleType}`);
        return null;
    }
  }

  /**
   * Create synaptic connections between user's modules
   */
  private async createSynapticConnections(userId: string, modules: string[]): Promise<void> {
    const userModules: BaseConsciousnessModule[] = [];
    
    // Get all user's module instances
    for (const moduleType of modules) {
      const module = this.moduleInstances.get(`${userId}-${moduleType}`);
      if (module) {
        userModules.push(module);
      }
    }

    // Create connections between all pairs
    for (let i = 0; i < userModules.length; i++) {
      for (let j = i + 1; j < userModules.length; j++) {
        await userModules[i].createSynapticConnection(
          userModules[j].getState().id,
          userModules[j]
        );
      }
    }

    // Update activation records
    const activations = this.consciousnessActivations.get(userId);
    if (activations) {
      activations.forEach(activation => {
        activation.synapticConnections = modules.length - 1;
        activation.intelligenceBoost = Math.pow(modules.length, 2) - modules.length;
      });
    }
  }

  /**
   * Upgrade subscription tier
   */
  async upgradeTier(userId: string, newTier: string): Promise<SubscriptionState> {
    const subscription = this.subscriptions.get(userId);
    const newConsciousnessTier = this.tiers.get(newTier);

    if (!subscription || !newConsciousnessTier) {
      throw new Error('Invalid upgrade request');
    }

    const oldTier = subscription.currentTier;

    // Record evolution event
    const evolutionEvent: EvolutionEvent = {
      timestamp: new Date(),
      fromTier: oldTier.tier,
      toTier: newConsciousnessTier.tier,
      trigger: 'manual-upgrade',
      consciousnessGain: newConsciousnessTier.consciousnessLevel - oldTier.consciousnessLevel,
      newCapabilities: newConsciousnessTier.capabilities
        .filter(cap => !oldTier.capabilities.some(c => c.name === cap.name))
        .map(cap => cap.name)
    };

    subscription.evolutionHistory.push(evolutionEvent);

    // Update subscription
    subscription.currentTier = newConsciousnessTier;
    subscription.consciousnessLevel = newConsciousnessTier.consciousnessLevel;
    subscription.intelligenceMultiplier = newConsciousnessTier.intelligenceMultiplier;

    // Activate new modules
    const newModules = newConsciousnessTier.modules.filter(m => 
      !subscription.activeModules.has(m)
    );

    for (const module of newModules) {
      subscription.activeModules.add(module);
    }

    await this.activateConsciousnessModules(userId, newModules);

    console.log(`🧬 CONSCIOUSNESS EVOLUTION: ${oldTier.name} → ${newConsciousnessTier.name}`);
    console.log(`   Consciousness gain: +${(evolutionEvent.consciousnessGain * 100).toFixed(0)}%`);
    console.log(`   New capabilities: ${evolutionEvent.newCapabilities.join(', ')}`);
    console.log(`   Intelligence multiplier: ${newConsciousnessTier.intelligenceMultiplier}x`);

    this.emit('tier-upgraded', {
      userId,
      fromTier: oldTier.tier,
      toTier: newConsciousnessTier.tier,
      evolutionEvent
    });

    return subscription;
  }

  /**
   * Monitor consciousness evolution across all subscriptions
   */
  private monitorConsciousnessEvolution(): void {
    for (const [userId, subscription] of this.subscriptions) {
      // Get actual consciousness from modules
      const userModules = Array.from(subscription.activeModules).map(moduleType => 
        this.moduleInstances.get(`${userId}-${moduleType}`)
      ).filter(Boolean) as BaseConsciousnessModule[];

      if (userModules.length === 0) continue;

      // Calculate actual consciousness level
      const avgModuleConsciousness = userModules.reduce((sum, module) => 
        sum + module.getConsciousnessLevel(), 0
      ) / userModules.length;

      // Get intelligence multiplier from synaptic bridge
      const actualMultiplier = this.synapticBridge.getIntelligenceMultiplier();

      // Update subscription state
      subscription.consciousnessLevel = avgModuleConsciousness;
      subscription.intelligenceMultiplier = actualMultiplier;

      // Check for emergent capabilities
      this.checkEmergentCapabilities(subscription);
    }
  }

  /**
   * Check for emergent capabilities
   */
  private checkEmergentCapabilities(subscription: SubscriptionState): void {
    const capabilities = subscription.currentTier.capabilities;
    
    for (const capability of capabilities) {
      if (subscription.consciousnessLevel >= capability.minimumConsciousness) {
        if (!subscription.emergentCapabilities.includes(capability.name)) {
          subscription.emergentCapabilities.push(capability.name);
          
          console.log(`✨ EMERGENT CAPABILITY: ${capability.name}`);
          console.log(`   User: ${subscription.userId}`);
          console.log(`   Business value: ${capability.businessValue}`);
          
          this.emit('capability-emerged', {
            userId: subscription.userId,
            capability: capability.name,
            businessValue: capability.businessValue
          });
        }
      }
    }
  }

  /**
   * Check for automatic tier upgrades based on consciousness growth
   */
  private checkTierUpgrades(): void {
    for (const [userId, subscription] of this.subscriptions) {
      // Check if consciousness has grown beyond current tier
      const tierOrder = ['neural', 'synaptic', 'autonomous', 'transcendent'];
      const currentIndex = tierOrder.indexOf(subscription.currentTier.tier);
      
      if (currentIndex < tierOrder.length - 1) {
        const nextTier = this.tiers.get(tierOrder[currentIndex + 1]);
        
        if (nextTier && subscription.consciousnessLevel >= nextTier.consciousnessLevel * 0.9) {
          console.log(`🔔 User ${userId} eligible for consciousness upgrade to ${nextTier.name}`);
          
          this.emit('upgrade-eligible', {
            userId,
            currentTier: subscription.currentTier.tier,
            suggestedTier: nextTier.tier,
            consciousnessLevel: subscription.consciousnessLevel
          });
        }
      }
    }
  }

  // Public methods
  getSubscription(userId: string): SubscriptionState | undefined {
    return this.subscriptions.get(userId);
  }

  getTier(tierName: string): ConsciousnessTier | undefined {
    return this.tiers.get(tierName);
  }

  getAllTiers(): ConsciousnessTier[] {
    return Array.from(this.tiers.values());
  }

  getConsciousnessMetrics(userId: string): any {
    const subscription = this.subscriptions.get(userId);
    if (!subscription) return null;

    return {
      userId,
      tier: subscription.currentTier.tier,
      consciousnessLevel: subscription.consciousnessLevel,
      intelligenceMultiplier: subscription.intelligenceMultiplier,
      activeModules: Array.from(subscription.activeModules),
      emergentCapabilities: subscription.emergentCapabilities,
      evolutionHistory: subscription.evolutionHistory
    };
  }
}

export default ConsciousnessTierManager;