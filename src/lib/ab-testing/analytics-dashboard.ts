/**
 * A/B Testing Analytics Dashboard
 * Analyze experiment results and statistical significance
 */

export interface ExperimentResult {
  experimentId: string
  experimentName: string
  startDate: Date
  endDate?: Date
  variants: VariantResult[]
  winner?: string
  confidence?: number
  uplift?: number
}

export interface VariantResult {
  variantId: string
  variantName: string
  participants: number
  conversions: number
  conversionRate: number
  revenue?: number
  averageOrderValue?: number
  bounceRate?: number
  timeOnPage?: number
  confidence?: number
}

export class ABTestAnalytics {
  // Calculate conversion rate
  static calculateConversionRate(conversions: number, participants: number): number {
    if (participants === 0) return 0
    return (conversions / participants) * 100
  }

  // Calculate statistical significance using Z-test
  static calculateSignificance(
    controlConversions: number,
    controlParticipants: number,
    variantConversions: number,
    variantParticipants: number
  ): number {
    const p1 = controlConversions / controlParticipants
    const p2 = variantConversions / variantParticipants
    const p = (controlConversions + variantConversions) / (controlParticipants + variantParticipants)
    
    const se = Math.sqrt(p * (1 - p) * (1 / controlParticipants + 1 / variantParticipants))
    const z = (p2 - p1) / se
    
    // Convert Z-score to confidence level
    const confidence = this.zScoreToConfidence(Math.abs(z))
    return confidence
  }

  // Convert Z-score to confidence percentage
  static zScoreToConfidence(z: number): number {
    // Simplified conversion (in production, use a proper stats library)
    if (z >= 2.58) return 99 // 99% confidence
    if (z >= 1.96) return 95 // 95% confidence
    if (z >= 1.64) return 90 // 90% confidence
    if (z >= 1.28) return 80 // 80% confidence
    return Math.min(z * 40, 79) // Below 80%
  }

  // Calculate uplift percentage
  static calculateUplift(control: number, variant: number): number {
    if (control === 0) return 0
    return ((variant - control) / control) * 100
  }

  // Determine winning variant
  static determineWinner(results: VariantResult[], minConfidence: number = 95): string | null {
    if (results.length < 2) return null

    const control = results.find(r => r.variantId === 'control')
    if (!control) return null

    let winner: VariantResult | null = null
    let highestUplift = 0

    for (const variant of results) {
      if (variant.variantId === 'control') continue

      const confidence = this.calculateSignificance(
        control.conversions,
        control.participants,
        variant.conversions,
        variant.participants
      )

      if (confidence >= minConfidence) {
        const uplift = this.calculateUplift(control.conversionRate, variant.conversionRate)
        if (uplift > highestUplift) {
          highestUplift = uplift
          winner = variant
        }
      }
    }

    return winner?.variantId || null
  }

  // Calculate sample size needed
  static calculateSampleSize(
    baselineConversionRate: number,
    minimumDetectableEffect: number,
    confidence: number = 95,
    power: number = 80
  ): number {
    const alpha = (100 - confidence) / 100
    const beta = (100 - power) / 100
    
    // Z-scores for alpha and beta
    const zAlpha = 1.96 // 95% confidence
    const zBeta = 0.84 // 80% power
    
    const p1 = baselineConversionRate / 100
    const p2 = p1 * (1 + minimumDetectableEffect / 100)
    const p = (p1 + p2) / 2
    
    const sampleSize = 2 * p * (1 - p) * Math.pow(zAlpha + zBeta, 2) / Math.pow(p2 - p1, 2)
    
    return Math.ceil(sampleSize)
  }

  // Analyze experiment results
  static analyzeExperiment(
    experimentId: string,
    events: any[]
  ): ExperimentResult {
    const variantData = new Map<string, {
      participants: Set<string>
      conversions: Set<string>
      revenue: number
      timeOnPage: number[]
      bounces: number
    }>()

    // Process events
    events.forEach(event => {
      if (event.data.experimentId !== experimentId) return

      const variantId = event.data.variantId
      if (!variantData.has(variantId)) {
        variantData.set(variantId, {
          participants: new Set(),
          conversions: new Set(),
          revenue: 0,
          timeOnPage: [],
          bounces: 0
        })
      }

      const variant = variantData.get(variantId)!

      switch (event.type) {
        case 'experiment_assignment':
          variant.participants.add(event.data.userId)
          break
        case 'experiment_conversion':
          variant.conversions.add(event.data.userId)
          if (event.data.value) {
            variant.revenue += event.data.value
          }
          break
        case 'experiment_metric':
          if (event.data.metric === 'time_on_page') {
            variant.timeOnPage.push(event.data.value)
          } else if (event.data.metric === 'bounce') {
            variant.bounces++
          }
          break
      }
    })

    // Calculate results
    const results: VariantResult[] = Array.from(variantData.entries()).map(([variantId, data]) => {
      const participants = data.participants.size
      const conversions = data.conversions.size
      const conversionRate = this.calculateConversionRate(conversions, participants)
      const averageOrderValue = conversions > 0 ? data.revenue / conversions : 0
      const avgTimeOnPage = data.timeOnPage.length > 0 
        ? data.timeOnPage.reduce((a, b) => a + b, 0) / data.timeOnPage.length 
        : 0
      const bounceRate = participants > 0 ? (data.bounces / participants) * 100 : 0

      return {
        variantId,
        variantName: variantId, // In production, map to actual names
        participants,
        conversions,
        conversionRate,
        revenue: data.revenue,
        averageOrderValue,
        bounceRate,
        timeOnPage: avgTimeOnPage
      }
    })

    // Determine winner
    const winner = this.determineWinner(results)
    const control = results.find(r => r.variantId === 'control')
    const winnerResult = results.find(r => r.variantId === winner)
    
    let uplift = 0
    let confidence = 0
    
    if (control && winnerResult) {
      uplift = this.calculateUplift(control.conversionRate, winnerResult.conversionRate)
      confidence = this.calculateSignificance(
        control.conversions,
        control.participants,
        winnerResult.conversions,
        winnerResult.participants
      )
    }

    return {
      experimentId,
      experimentName: experimentId, // In production, map to actual name
      startDate: new Date(), // In production, track actual dates
      variants: results,
      winner,
      confidence,
      uplift
    }
  }

  // Generate recommendations
  static generateRecommendations(result: ExperimentResult): string[] {
    const recommendations: string[] = []

    if (result.winner) {
      recommendations.push(`Implement ${result.winner} as the new default (${result.uplift?.toFixed(2)}% uplift)`)
    }

    if (result.confidence && result.confidence < 95) {
      const control = result.variants.find(v => v.variantId === 'control')
      if (control) {
        const additionalSample = this.calculateSampleSize(
          control.conversionRate,
          20, // 20% minimum detectable effect
          95,
          80
        ) - control.participants
        
        if (additionalSample > 0) {
          recommendations.push(`Continue testing for ${Math.ceil(additionalSample / 100)} more days to reach statistical significance`)
        }
      }
    }

    // Analyze secondary metrics
    result.variants.forEach(variant => {
      if (variant.bounceRate && variant.bounceRate > 70) {
        recommendations.push(`High bounce rate (${variant.bounceRate.toFixed(1)}%) for ${variant.variantName} - consider improving page load time or content relevance`)
      }
      
      if (variant.timeOnPage && variant.timeOnPage < 30) {
        recommendations.push(`Low engagement time (${variant.timeOnPage.toFixed(0)}s) for ${variant.variantName} - consider improving content quality`)
      }
    })

    return recommendations
  }
}