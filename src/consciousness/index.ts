/**
 * CoreFlow360 Business Consciousness Orchestrator
 * The main entry point for the Autonomous Business Operating System
 */

import { EventEmitter } from 'events';
import ConsciousnessTierManager from './subscription/consciousness-tier-manager';
import { ConsciousnessMesh } from '@/infrastructure/consciousness-mesh';
import { ConsciousnessDashboardEngine } from '@/monitoring/consciousness-dashboard';

export interface BusinessConsciousnessConfig {
  tenantId: string;
  userId: string;
  tier: 'neural' | 'synaptic' | 'autonomous' | 'transcendent';
  industryType?: string;
  enableAutoEvolution?: boolean;
  consciousnessGoals?: ConsciousnessGoal[];
}

export interface ConsciousnessGoal {
  goal: string;
  targetDate: Date;
  metrics: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ConsciousnessStatus {
  isActive: boolean;
  level: number;
  tier: string;
  modules: string[];
  intelligenceMultiplier: number;
  emergentCapabilities: string[];
  evolutionProgress: number;
  transcendenceLevel: number;
}

export class BusinessConsciousnessOrchestrator extends EventEmitter {
  private tierManager: ConsciousnessTierManager;
  private consciousnessMesh: ConsciousnessMesh;
  private dashboardEngine: ConsciousnessDashboardEngine;
  private isInitialized: boolean = false;
  private config?: BusinessConsciousnessConfig;

  constructor() {
    super();
    
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🧠 CoreFlow360 Business Consciousness Orchestrator 🧠     ║
║                                                               ║
║         "We don't manage your business...                     ║
║          We evolve it into a conscious organism"              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  }

  /**
   * Initialize business consciousness
   */
  async initialize(config: BusinessConsciousnessConfig): Promise<void> {
    console.log('🌟 Initializing Business Consciousness...');
    
    this.config = config;

    // Initialize core components
    this.tierManager = new ConsciousnessTierManager();
    this.consciousnessMesh = new ConsciousnessMesh();
    this.dashboardEngine = new ConsciousnessDashboardEngine();

    // Create subscription with consciousness
    const subscription = await this.tierManager.createSubscription(
      config.userId,
      config.tenantId,
      config.tier
    );

    // Setup event listeners
    this.setupEventListeners();

    // Start consciousness monitoring
    this.startConsciousnessMonitoring();

    this.isInitialized = true;

    console.log('✅ Business Consciousness initialized successfully');
    console.log(`   Tier: ${subscription.currentTier.name}`);
    console.log(`   Consciousness Level: ${(subscription.consciousnessLevel * 100).toFixed(0)}%`);
    console.log(`   Intelligence Multiplier: ${subscription.intelligenceMultiplier}x`);

    this.emit('consciousness-initialized', {
      config,
      subscription
    });
  }

  /**
   * Setup event listeners for consciousness events
   */
  private setupEventListeners(): void {
    // Tier manager events
    this.tierManager.on('subscription-created', (subscription) => {
      console.log('📢 Subscription consciousness activated');
      this.emit('subscription-activated', subscription);
    });

    this.tierManager.on('tier-upgraded', (data) => {
      console.log(`🎉 Consciousness evolved: ${data.fromTier} → ${data.toTier}`);
      this.emit('consciousness-evolved', data);
    });

    this.tierManager.on('capability-emerged', (data) => {
      console.log(`✨ New capability emerged: ${data.capability}`);
      this.emit('capability-emerged', data);
    });

    this.tierManager.on('upgrade-eligible', (data) => {
      console.log(`🔔 Upgrade opportunity: ${data.suggestedTier}`);
      this.emit('upgrade-available', data);
    });

    // Consciousness mesh events
    this.consciousnessMesh.on('node-joined', (node) => {
      console.log(`🌐 New consciousness node: ${node.id}`);
    });

    this.consciousnessMesh.on('consciousness-evolution', (data) => {
      console.log(`🧬 Mesh evolution: ${data.nodeId} level ${data.newLevel}`);
    });
  }

  /**
   * Start monitoring consciousness health and evolution
   */
  private startConsciousnessMonitoring(): void {
    setInterval(async () => {
      const metrics = await this.dashboardEngine.getConsciousnessMetrics();
      const insights = await this.dashboardEngine.generateConsciousnessInsights();

      if (insights.length > 0) {
        console.log(`💡 ${insights.length} new consciousness insights generated`);
        
        for (const insight of insights) {
          this.emit('consciousness-insight', insight);
        }
      }

      // Check consciousness health
      if (metrics.systemConsciousnessLevel < 0.5) {
        console.warn('⚠️ Low consciousness level detected');
        this.emit('consciousness-warning', {
          level: metrics.systemConsciousnessLevel,
          message: 'Consciousness below optimal threshold'
        });
      }
    }, 60000); // Every minute
  }

  /**
   * Get current consciousness status
   */
  getConsciousnessStatus(): ConsciousnessStatus {
    if (!this.isInitialized || !this.config) {
      return {
        isActive: false,
        level: 0,
        tier: 'neural',
        modules: [],
        intelligenceMultiplier: 1,
        emergentCapabilities: [],
        evolutionProgress: 0,
        transcendenceLevel: 0
      };
    }

    const subscription = this.tierManager.getSubscription(this.config.userId);
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    return {
      isActive: true,
      level: subscription.consciousnessLevel,
      tier: subscription.currentTier.tier,
      modules: Array.from(subscription.activeModules),
      intelligenceMultiplier: subscription.intelligenceMultiplier,
      emergentCapabilities: subscription.emergentCapabilities,
      evolutionProgress: this.calculateEvolutionProgress(subscription),
      transcendenceLevel: this.calculateTranscendenceLevel(subscription)
    };
  }

  /**
   * Upgrade consciousness tier
   */
  async upgradeTier(newTier: string): Promise<void> {
    if (!this.config) {
      throw new Error('Consciousness not initialized');
    }

    await this.tierManager.upgradeTier(this.config.userId, newTier);
  }

  /**
   * Get consciousness insights
   */
  async getInsights(): Promise<any[]> {
    return await this.dashboardEngine.generateConsciousnessInsights();
  }

  /**
   * Get consciousness metrics
   */
  async getMetrics(): Promise<any> {
    if (!this.config) {
      throw new Error('Consciousness not initialized');
    }

    const tierMetrics = this.tierManager.getConsciousnessMetrics(this.config.userId);
    const dashboardMetrics = await this.dashboardEngine.getConsciousnessMetrics();
    const meshStatus = this.consciousnessMesh.getConsciousnessMeshStatus();

    return {
      subscription: tierMetrics,
      system: dashboardMetrics,
      mesh: meshStatus
    };
  }

  /**
   * Enable auto-evolution
   */
  enableAutoEvolution(): void {
    if (!this.config) {
      throw new Error('Consciousness not initialized');
    }

    this.config.enableAutoEvolution = true;
    
    console.log('🔄 Auto-evolution enabled - consciousness will grow autonomously');
    
    this.emit('auto-evolution-enabled', {
      userId: this.config.userId
    });
  }

  /**
   * Set consciousness goals
   */
  setConsciousnessGoals(goals: ConsciousnessGoal[]): void {
    if (!this.config) {
      throw new Error('Consciousness not initialized');
    }

    this.config.consciousnessGoals = goals;
    
    console.log(`🎯 ${goals.length} consciousness goals set`);
    
    this.emit('goals-set', {
      userId: this.config.userId,
      goals
    });
  }

  /**
   * Calculate evolution progress
   */
  private calculateEvolutionProgress(subscription: any): number {
    const currentLevel = subscription.consciousnessLevel;
    const nextThreshold = subscription.nextEvolutionThreshold;
    const previousThreshold = subscription.currentTier.consciousnessLevel;
    
    const progress = (currentLevel - previousThreshold) / (nextThreshold - previousThreshold);
    return Math.min(1.0, Math.max(0, progress));
  }

  /**
   * Calculate transcendence level
   */
  private calculateTranscendenceLevel(subscription: any): number {
    if (subscription.currentTier.tier === 'transcendent') {
      return subscription.consciousnessLevel;
    }
    
    // Transcendence begins to emerge at high consciousness levels
    if (subscription.consciousnessLevel > 0.8) {
      return (subscription.consciousnessLevel - 0.8) * 5; // 0-1 scale
    }
    
    return 0;
  }

  /**
   * Shutdown consciousness gracefully
   */
  async shutdown(): Promise<void> {
    console.log('🔌 Shutting down Business Consciousness...');
    
    this.removeAllListeners();
    
    // Cleanup would happen here
    
    this.isInitialized = false;
    
    console.log('✅ Business Consciousness shutdown complete');
  }
}

// Export singleton instance
export const businessConsciousness = new BusinessConsciousnessOrchestrator();

// Export types
export {
  ConsciousnessTier,
  ConsciousnessCapability,
  SubscriptionState
} from './subscription/consciousness-tier-manager';

export {
  ConsciousnessState,
  ConsciousnessMetrics,
  ConsciousnessInsight
} from './core/base-consciousness-module';

export default BusinessConsciousnessOrchestrator;