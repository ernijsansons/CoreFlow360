/**
 * A/B Testing Manager
 * Handles experiment assignment, tracking, and variant selection
 */

import {
  Experiment,
  Variant,
  getActiveExperiments,
  userQualifiesForExperiment,
} from './experiments'

export class ABTestManager {
  private assignments: Map<string, string> = new Map()
  private userId: string | null = null
  private userContext: Record<string, unknown> = {}

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadAssignments()
      this.initializeUserId()
      this.initializeUserContext()
    }
  }

  // Initialize or get user ID
  private initializeUserId() {
    let userId = localStorage.getItem('ab_user_id')
    if (!userId) {
      userId = this.generateUserId()
      localStorage.setItem('ab_user_id', userId)
    }
    this.userId = userId
  }

  // Generate unique user ID
  private generateUserId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Initialize user context
  private initializeUserContext() {
    this.userContext = {
      device: this.detectDevice(),
      location: this.detectLocation(),
      isNewUser: this.isNewUser(),
      browser: navigator.userAgent,
      referrer: document.referrer,
      timestamp: Date.now(),
    }
  }

  // Detect device type
  private detectDevice(): string {
    const width = window.innerWidth
    if (width <= 768) return 'mobile'
    if (width <= 1024) return 'tablet'
    return 'desktop'
  }

  // Detect location (simplified - in production use IP-based detection)
  private detectLocation(): string {
    return navigator.language.split('-')[1] || 'US'
  }

  // Check if new user
  private isNewUser(): boolean {
    const firstVisit = localStorage.getItem('first_visit')
    if (!firstVisit) {
      localStorage.setItem('first_visit', Date.now().toString())
      return true
    }
    return Date.now() - parseInt(firstVisit) < 24 * 60 * 60 * 1000 // 24 hours
  }

  // Load saved assignments
  private loadAssignments() {
    const saved = localStorage.getItem('ab_assignments')
    if (saved) {
      try {
        const assignments = JSON.parse(saved)
        this.assignments = new Map(Object.entries(assignments))
      } catch (error) {}
    }
  }

  // Save assignments
  private saveAssignments() {
    const assignments = Object.fromEntries(this.assignments)
    localStorage.setItem('ab_assignments', JSON.stringify(assignments))
  }

  // Get variant for experiment
  getVariant(experimentId: string): Variant | null {
    const experiments = getActiveExperiments()
    const experiment = experiments.find((exp) => exp.id === experimentId)

    if (!experiment) return null

    // Check if user qualifies
    if (!userQualifiesForExperiment(experiment, this.userContext)) {
      return experiment.variants.find((v) => v.id === 'control') || null
    }

    // Check existing assignment
    const existingAssignment = this.assignments.get(experimentId)
    if (existingAssignment) {
      return experiment.variants.find((v) => v.id === existingAssignment) || null
    }

    // Assign variant
    const variant = this.assignVariant(experiment)
    if (variant) {
      this.assignments.set(experimentId, variant.id)
      this.saveAssignments()
      this.trackAssignment(experiment, variant)
    }

    return variant
  }

  // Assign variant based on weights
  private assignVariant(experiment: Experiment): Variant | null {
    const random = Math.random() * 100
    let cumulative = 0

    for (const variant of experiment.variants) {
      cumulative += variant.weight
      if (random <= cumulative) {
        return variant
      }
    }

    return experiment.variants[0] || null
  }

  // Track experiment assignment
  private trackAssignment(experiment: Experiment, variant: Variant) {
    if (typeof window !== 'undefined' && (window as unknown).gtag) {
      ;(window as unknown).gtag('event', 'experiment_assignment', {
        experiment_id: experiment.id,
        experiment_name: experiment.name,
        variant_id: variant.id,
        variant_name: variant.name,
        user_id: this.userId,
      })
    }

    // Also track locally
    this.logEvent('experiment_assignment', {
      experimentId: experiment.id,
      variantId: variant.id,
      userId: this.userId,
      context: this.userContext,
    })
  }

  // Track conversion
  trackConversion(experimentId: string, conversionType: string, value?: number) {
    const variantId = this.assignments.get(experimentId)
    if (!variantId) return

    if (typeof window !== 'undefined' && (window as unknown).gtag) {
      ;(window as unknown).gtag('event', 'experiment_conversion', {
        experiment_id: experimentId,
        variant_id: variantId,
        conversion_type: conversionType,
        conversion_value: value,
        user_id: this.userId,
      })
    }

    this.logEvent('experiment_conversion', {
      experimentId,
      variantId,
      conversionType,
      value,
      userId: this.userId,
    })
  }

  // Track metric
  trackMetric(experimentId: string, metric: string, value: unknown) {
    const variantId = this.assignments.get(experimentId)
    if (!variantId) return

    this.logEvent('experiment_metric', {
      experimentId,
      variantId,
      metric,
      value,
      userId: this.userId,
      timestamp: Date.now(),
    })
  }

  // Log event (for internal analytics)
  private logEvent(eventType: string, data: unknown) {
    const events = this.getStoredEvents()
    events.push({
      type: eventType,
      data,
      timestamp: Date.now(),
    })

    // Keep only last 1000 events
    if (events.length > 1000) {
      events.splice(0, events.length - 1000)
    }

    localStorage.setItem('ab_events', JSON.stringify(events))
  }

  // Get stored events
  private getStoredEvents(): unknown[] {
    try {
      const stored = localStorage.getItem('ab_events')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // Get all active assignments
  getActiveAssignments(): Record<string, string> {
    return Object.fromEntries(this.assignments)
  }

  // Clear specific experiment assignment (for testing)
  clearAssignment(experimentId: string) {
    this.assignments.delete(experimentId)
    this.saveAssignments()
  }

  // Clear all assignments (for testing)
  clearAllAssignments() {
    this.assignments.clear()
    this.saveAssignments()
  }

  // Export analytics data
  exportAnalytics(): unknown {
    return {
      userId: this.userId,
      assignments: Object.fromEntries(this.assignments),
      events: this.getStoredEvents(),
      context: this.userContext,
    }
  }
}

// Singleton instance
export const abTestManager = typeof window !== 'undefined' ? new ABTestManager() : null
