/**
 * CoreFlow360 - Bayesian A/B Testing Analysis
 * Statistical significance calculation with Bayesian methods
 */

import { z } from 'zod'

// Bayesian analysis schemas
export const BayesianConfigSchema = z.object({
  priorAlpha: z.number().default(1),
  priorBeta: z.number().default(1),
  credibleInterval: z.number().min(0).max(1).default(0.95),
  minimumDetectableEffect: z.number().default(0.05),
  stopEarly: z.boolean().default(true),
  maxSampleSize: z.number().optional(),
  powerThreshold: z.number().default(0.8),
})

export const TestResultSchema = z.object({
  variant: z.string(),
  visitors: z.number(),
  conversions: z.number(),
  conversionRate: z.number(),
  alpha: z.number(), // Posterior alpha
  beta: z.number(), // Posterior beta
})

export const BayesianResultSchema = z.object({
  testId: z.string(),
  results: z.array(TestResultSchema),
  analysis: z.object({
    probabilityToBeatControl: z.record(z.number()),
    expectedLoss: z.record(z.number()),
    credibleIntervals: z.record(
      z.object({
        lower: z.number(),
        upper: z.number(),
        mean: z.number(),
      })
    ),
    recommendedAction: z.enum(['continue', 'stop_winner', 'stop_inconclusive']),
    confidence: z.number(),
    significanceReached: z.boolean(),
    minimumSampleSizeReached: z.boolean(),
  }),
  timestamp: z.date(),
})

export type BayesianConfig = z.infer<typeof BayesianConfigSchema>
export type TestResult = z.infer<typeof TestResultSchema>
export type BayesianResult = z.infer<typeof BayesianResultSchema>

export class BayesianAnalyzer {
  private config: BayesianConfig

  constructor(config: Partial<BayesianConfig> = {}) {
    this.config = BayesianConfigSchema.parse(config)
  }

  /**
   * Perform Bayesian analysis on A/B test results
   */
  analyze(testId: string, results: Omit<TestResult, 'alpha' | 'beta'>[]): BayesianResult {
    // Calculate posterior parameters for each variant
    const posteriorResults = results.map((result) => ({
      ...result,
      conversionRate: result.visitors > 0 ? result.conversions / result.visitors : 0,
      alpha: this.config.priorAlpha + result.conversions,
      beta: this.config.priorBeta + result.visitors - result.conversions,
    }))

    // Find control (first variant) and variations
    const control = posteriorResults[0]
    const variations = posteriorResults.slice(1)

    // Calculate probability to beat control for each variation
    const probabilityToBeatControl: Record<string, number> = {}
    const expectedLoss: Record<string, number> = {}
    const credibleIntervals: Record<string, { lower: number; upper: number; mean: number }> = {}

    // Calculate for control
    credibleIntervals[control.variant] = this.calculateCredibleInterval(control.alpha, control.beta)

    for (const variation of variations) {
      probabilityToBeatControl[variation.variant] = this.calculateProbabilityToBeatControl(
        control.alpha,
        control.beta,
        variation.alpha,
        variation.beta
      )

      expectedLoss[variation.variant] = this.calculateExpectedLoss(
        control.alpha,
        control.beta,
        variation.alpha,
        variation.beta
      )

      credibleIntervals[variation.variant] = this.calculateCredibleInterval(
        variation.alpha,
        variation.beta
      )
    }

    // Determine recommended action
    const analysis = this.determineRecommendedAction(
      posteriorResults,
      probabilityToBeatControl,
      expectedLoss
    )

    return {
      testId,
      results: posteriorResults,
      analysis: {
        probabilityToBeatControl,
        expectedLoss,
        credibleIntervals,
        ...analysis,
      },
      timestamp: new Date(),
    }
  }

  /**
   * Calculate probability that variation beats control using Monte Carlo simulation
   */
  private calculateProbabilityToBeatControl(
    controlAlpha: number,
    controlBeta: number,
    variationAlpha: number,
    variationBeta: number,
    iterations: number = 100000
  ): number {
    let wins = 0

    for (let i = 0; i < iterations; i++) {
      const controlSample = this.betaRandom(controlAlpha, controlBeta)
      const variationSample = this.betaRandom(variationAlpha, variationBeta)

      if (variationSample > controlSample) {
        wins++
      }
    }

    return wins / iterations
  }

  /**
   * Calculate expected loss if we choose variation over control
   */
  private calculateExpectedLoss(
    controlAlpha: number,
    controlBeta: number,
    variationAlpha: number,
    variationBeta: number,
    iterations: number = 100000
  ): number {
    let totalLoss = 0

    for (let i = 0; i < iterations; i++) {
      const controlSample = this.betaRandom(controlAlpha, controlBeta)
      const variationSample = this.betaRandom(variationAlpha, variationBeta)

      if (controlSample > variationSample) {
        totalLoss += controlSample - variationSample
      }
    }

    return totalLoss / iterations
  }

  /**
   * Calculate credible interval for conversion rate
   */
  private calculateCredibleInterval(
    alpha: number,
    beta: number
  ): { lower: number; upper: number; mean: number } {
    const mean = alpha / (alpha + beta)

    // Calculate percentiles for credible interval
    const lowerPercentile = (1 - this.config.credibleInterval) / 2
    const upperPercentile = 1 - lowerPercentile

    const lower = this.betaQuantile(alpha, beta, lowerPercentile)
    const upper = this.betaQuantile(alpha, beta, upperPercentile)

    return { lower, upper, mean }
  }

  /**
   * Determine recommended action based on analysis
   */
  private determineRecommendedAction(
    results: TestResult[],
    probabilityToBeatControl: Record<string, number>,
    expectedLoss: Record<string, number>
  ): {
    recommendedAction: 'continue' | 'stop_winner' | 'stop_inconclusive'
    confidence: number
    significanceReached: boolean
    minimumSampleSizeReached: boolean
  } {
    const totalSampleSize = results.reduce((sum, r) => sum + r.visitors, 0)
    const minimumSampleSizeReached =
      !this.config.maxSampleSize || totalSampleSize >= this.config.maxSampleSize

    // Find best performing variation
    const bestVariation = Object.entries(probabilityToBeatControl).reduce(
      (best, [variant, prob]) => (prob > best.prob ? { variant, prob } : best),
      { variant: '', prob: 0 }
    )

    const maxProbability = bestVariation.prob
    const maxExpectedLoss = Math.max(...Object.values(expectedLoss))

    // Determine if significance is reached
    const significanceThreshold = 0.95 // 95% confidence
    const lossThreshold = 0.01 // 1% acceptable loss

    const significanceReached =
      maxProbability >= significanceThreshold && maxExpectedLoss <= lossThreshold

    let recommendedAction: 'continue' | 'stop_winner' | 'stop_inconclusive' = 'continue'
    let confidence = maxProbability

    if (significanceReached && this.config.stopEarly) {
      recommendedAction = 'stop_winner'
      confidence = maxProbability
    } else if (minimumSampleSizeReached) {
      if (maxProbability >= 0.9) {
        recommendedAction = 'stop_winner'
        confidence = maxProbability
      } else {
        recommendedAction = 'stop_inconclusive'
        confidence = 1 - maxProbability
      }
    }

    return {
      recommendedAction,
      confidence,
      significanceReached,
      minimumSampleSizeReached,
    }
  }

  /**
   * Generate random sample from Beta distribution
   */
  private betaRandom(alpha: number, beta: number): number {
    // Use Gamma distribution to generate Beta samples
    const gamma1 = this.gammaRandom(alpha, 1)
    const gamma2 = this.gammaRandom(beta, 1)
    return gamma1 / (gamma1 + gamma2)
  }

  /**
   * Generate random sample from Gamma distribution
   */
  private gammaRandom(shape: number, scale: number): number {
    // Marsaglia and Tsang's method for Gamma distribution
    if (shape < 1) {
      return this.gammaRandom(shape + 1, scale) * Math.pow(Math.random(), 1 / shape)
    }

    const d = shape - 1 / 3
    const c = 1 / Math.sqrt(9 * d)

    while (true) {
      let x: number
      let v: number

      do {
        x = this.normalRandom()
        v = 1 + c * x
      } while (v <= 0)

      v = v * v * v
      const u = Math.random()

      if (u < 1 - 0.0331 * x * x * x * x) {
        return d * v * scale
      }

      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
        return d * v * scale
      }
    }
  }

  /**
   * Generate random sample from normal distribution using Box-Muller transform
   */
  private normalRandom(): number {
    let u = 0,
      v = 0
    while (u === 0) u = Math.random() // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random()
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }

  /**
   * Calculate Beta distribution quantile (approximate)
   */
  private betaQuantile(alpha: number, beta: number, p: number): number {
    // Using iterative method to find quantile
    let x = alpha / (alpha + beta) // Start with mean
    let iterations = 0
    const maxIterations = 100
    const tolerance = 1e-8

    while (iterations < maxIterations) {
      const cdf = this.betaCDF(x, alpha, beta)
      const pdf = this.betaPDF(x, alpha, beta)

      if (Math.abs(cdf - p) < tolerance) {
        break
      }

      // Newton-Raphson iteration
      x = x - (cdf - p) / pdf
      x = Math.max(0.001, Math.min(0.999, x)) // Keep in bounds

      iterations++
    }

    return x
  }

  /**
   * Beta distribution CDF (approximate using incomplete beta function)
   */
  private betaCDF(x: number, alpha: number, beta: number): number {
    if (x <= 0) return 0
    if (x >= 1) return 1

    return this.incompleteBeta(x, alpha, beta)
  }

  /**
   * Beta distribution PDF
   */
  private betaPDF(x: number, alpha: number, beta: number): number {
    if (x <= 0 || x >= 1) return 0

    return (Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1)) / this.betaFunction(alpha, beta)
  }

  /**
   * Beta function B(a,b) = Γ(a)Γ(b)/Γ(a+b)
   */
  private betaFunction(a: number, b: number): number {
    return (this.gammaFunction(a) * this.gammaFunction(b)) / this.gammaFunction(a + b)
  }

  /**
   * Gamma function approximation using Stirling's approximation
   */
  private gammaFunction(z: number): number {
    if (z < 0.5) {
      return Math.PI / (Math.sin(Math.PI * z) * this.gammaFunction(1 - z))
    }

    // Stirling's approximation
    return Math.sqrt((2 * Math.PI) / z) * Math.pow(z / Math.E, z)
  }

  /**
   * Incomplete beta function approximation
   */
  private incompleteBeta(x: number, a: number, b: number): number {
    // Continued fraction approximation
    if (x === 0) return 0
    if (x === 1) return 1

    // Use series expansion for better accuracy
    let result = 0
    let term = (Math.pow(x, a) * Math.pow(1 - x, b)) / (a * this.betaFunction(a, b))

    for (let n = 0; n < 100; n++) {
      result += term
      term *= ((a + n) * x) / (a + b + n)

      if (Math.abs(term) < 1e-15) break
    }

    return Math.min(1, Math.max(0, result))
  }

  /**
   * Calculate sample size needed for desired power
   */
  calculateSampleSize(
    baselineRate: number,
    minimumDetectableEffect: number,
    power: number = 0.8,
    alpha: number = 0.05
  ): number {
    // Simplified sample size calculation for conversion rate tests
    const p1 = baselineRate
    const p2 = baselineRate * (1 + minimumDetectableEffect)

    // Z-scores for alpha and power
    const zAlpha = this.normalInverse(1 - alpha / 2)
    const zBeta = this.normalInverse(power)

    // Pooled probability
    const pPooled = (p1 + p2) / 2

    // Sample size per group
    const n =
      Math.pow(
        zAlpha * Math.sqrt(2 * pPooled * (1 - pPooled)) +
          zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)),
        2
      ) / Math.pow(p2 - p1, 2)

    return Math.ceil(n)
  }

  /**
   * Normal distribution inverse (approximate)
   */
  private normalInverse(p: number): number {
    // Beasley-Springer-Moro algorithm approximation
    const a = [
      0, -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2,
      -3.066479806614716e1, 2.506628277459239,
    ]

    const b = [
      0, -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
      -1.328068155288572e1,
    ]

    if (p <= 0 || p >= 1) {
      throw new Error('Probability must be between 0 and 1')
    }

    if (p === 0.5) return 0

    const q = p < 0.5 ? p : 1 - p
    const t = Math.sqrt(-2 * Math.log(q))

    let result = (((((a[6] * t + a[5]) * t + a[4]) * t + a[3]) * t + a[2]) * t + a[1]) * t + a[0]
    result /= ((((b[5] * t + b[4]) * t + b[3]) * t + b[2]) * t + b[1]) * t + 1

    return p < 0.5 ? -result : result
  }
}

// Utility functions for common Bayesian operations
export function calculatePosterior(
  priorAlpha: number,
  priorBeta: number,
  conversions: number,
  visitors: number
): { alpha: number; beta: number } {
  return {
    alpha: priorAlpha + conversions,
    beta: priorBeta + visitors - conversions,
  }
}

export function calculateProbabilityOfSuperior(
  alphaA: number,
  betaA: number,
  alphaB: number,
  betaB: number
): number {
  const analyzer = new BayesianAnalyzer()
  return analyzer['calculateProbabilityToBeatControl'](alphaA, betaA, alphaB, betaB)
}

export default BayesianAnalyzer
