/**
 * CoreFlow360 - Tax Calculation Engine
 * Handles multi-jurisdiction tax calculations for invoices and transactions
 */

export interface TaxJurisdiction {
  id: string
  name: string
  country: string
  state?: string
  city?: string
  taxRates: TaxRate[]
}

export interface TaxRate {
  type: 'SALES' | 'VAT' | 'GST' | 'PST' | 'HST' | 'SERVICE' | 'DIGITAL'
  rate: number
  name: string
  description?: string
  effectiveDate: Date
  expiryDate?: Date
  thresholds?: TaxThreshold[]
  exemptions?: TaxExemption[]
}

export interface TaxThreshold {
  minAmount: number
  maxAmount?: number
  rate: number
}

export interface TaxExemption {
  category: string
  description: string
  certificateRequired: boolean
}

export interface TaxCalculationRequest {
  amount: number
  jurisdictionId: string
  itemCategory?: string
  customerType?: 'INDIVIDUAL' | 'BUSINESS' | 'NON_PROFIT' | 'GOVERNMENT'
  date?: Date
  exemptionCertificate?: string
}

export interface TaxCalculationResult {
  subtotal: number
  taxBreakdown: TaxLineItem[]
  totalTax: number
  total: number
  effectiveRate: number
  jurisdiction: string
}

export interface TaxLineItem {
  type: string
  name: string
  rate: number
  amount: number
  taxableAmount: number
}

export class TaxCalculator {
  private jurisdictions: Map<string, TaxJurisdiction>

  constructor() {
    this.jurisdictions = new Map()
    this.loadDefaultJurisdictions()
  }

  /**
   * Load default tax jurisdictions
   */
  private loadDefaultJurisdictions() {
    // US - California
    this.jurisdictions.set('US-CA', {
      id: 'US-CA',
      name: 'California',
      country: 'US',
      state: 'CA',
      taxRates: [
        {
          type: 'SALES',
          rate: 0.0725,
          name: 'California State Sales Tax',
          description: 'Base state sales tax',
          effectiveDate: new Date('2024-01-01'),
        },
        {
          type: 'SALES',
          rate: 0.01,
          name: 'District Tax',
          description: 'Local district tax',
          effectiveDate: new Date('2024-01-01'),
        }
      ]
    })

    // US - New York
    this.jurisdictions.set('US-NY', {
      id: 'US-NY',
      name: 'New York',
      country: 'US',
      state: 'NY',
      taxRates: [
        {
          type: 'SALES',
          rate: 0.04,
          name: 'New York State Sales Tax',
          effectiveDate: new Date('2024-01-01'),
        },
        {
          type: 'SALES',
          rate: 0.04875,
          name: 'NYC Sales Tax',
          description: 'New York City local tax',
          effectiveDate: new Date('2024-01-01'),
        }
      ]
    })

    // US - Texas (No state income tax)
    this.jurisdictions.set('US-TX', {
      id: 'US-TX',
      name: 'Texas',
      country: 'US',
      state: 'TX',
      taxRates: [
        {
          type: 'SALES',
          rate: 0.0625,
          name: 'Texas State Sales Tax',
          effectiveDate: new Date('2024-01-01'),
        },
        {
          type: 'SALES',
          rate: 0.02,
          name: 'Local Sales Tax',
          description: 'Combined local taxes',
          effectiveDate: new Date('2024-01-01'),
        }
      ]
    })

    // Canada - Ontario
    this.jurisdictions.set('CA-ON', {
      id: 'CA-ON',
      name: 'Ontario',
      country: 'CA',
      state: 'ON',
      taxRates: [
        {
          type: 'HST',
          rate: 0.13,
          name: 'Harmonized Sales Tax',
          description: 'Combined federal and provincial tax',
          effectiveDate: new Date('2024-01-01'),
        }
      ]
    })

    // UK - Standard VAT
    this.jurisdictions.set('UK', {
      id: 'UK',
      name: 'United Kingdom',
      country: 'UK',
      taxRates: [
        {
          type: 'VAT',
          rate: 0.20,
          name: 'Value Added Tax',
          description: 'Standard VAT rate',
          effectiveDate: new Date('2024-01-01'),
          thresholds: [
            { minAmount: 0, maxAmount: 85000, rate: 0 }, // VAT registration threshold
            { minAmount: 85000, rate: 0.20 }
          ]
        }
      ]
    })

    // EU - Germany
    this.jurisdictions.set('DE', {
      id: 'DE',
      name: 'Germany',
      country: 'DE',
      taxRates: [
        {
          type: 'VAT',
          rate: 0.19,
          name: 'Mehrwertsteuer',
          description: 'Standard VAT rate',
          effectiveDate: new Date('2024-01-01'),
        },
        {
          type: 'VAT',
          rate: 0.07,
          name: 'Reduced VAT',
          description: 'Reduced rate for essential goods',
          effectiveDate: new Date('2024-01-01'),
          exemptions: [
            {
              category: 'FOOD',
              description: 'Basic food items',
              certificateRequired: false
            },
            {
              category: 'BOOKS',
              description: 'Books and printed materials',
              certificateRequired: false
            }
          ]
        }
      ]
    })

    // Australia - GST
    this.jurisdictions.set('AU', {
      id: 'AU',
      name: 'Australia',
      country: 'AU',
      taxRates: [
        {
          type: 'GST',
          rate: 0.10,
          name: 'Goods and Services Tax',
          description: 'Federal GST',
          effectiveDate: new Date('2024-01-01'),
        }
      ]
    })
  }

  /**
   * Calculate tax for a given amount and jurisdiction
   */
  calculateTax(request: TaxCalculationRequest): TaxCalculationResult {
    const jurisdiction = this.jurisdictions.get(request.jurisdictionId)
    
    if (!jurisdiction) {
      throw new Error(`Unknown jurisdiction: ${request.jurisdictionId}`)
    }

    const effectiveDate = request.date || new Date()
    const taxBreakdown: TaxLineItem[] = []
    let totalTax = 0

    // Apply each tax rate
    for (const taxRate of jurisdiction.taxRates) {
      // Check if tax rate is effective
      if (taxRate.effectiveDate > effectiveDate) {
        continue
      }
      if (taxRate.expiryDate && taxRate.expiryDate < effectiveDate) {
        continue
      }

      // Check for exemptions
      if (request.exemptionCertificate && this.isExempt(taxRate, request)) {
        continue
      }

      // Calculate tax based on thresholds if applicable
      let applicableRate = taxRate.rate
      let taxableAmount = request.amount

      if (taxRate.thresholds && taxRate.thresholds.length > 0) {
        const threshold = taxRate.thresholds.find(t => 
          request.amount >= t.minAmount && 
          (!t.maxAmount || request.amount <= t.maxAmount)
        )
        if (threshold) {
          applicableRate = threshold.rate
        }
      }

      const taxAmount = taxableAmount * applicableRate

      taxBreakdown.push({
        type: taxRate.type,
        name: taxRate.name,
        rate: applicableRate,
        amount: taxAmount,
        taxableAmount: taxableAmount
      })

      totalTax += taxAmount
    }

    const total = request.amount + totalTax
    const effectiveRate = request.amount > 0 ? totalTax / request.amount : 0

    return {
      subtotal: request.amount,
      taxBreakdown,
      totalTax,
      total,
      effectiveRate,
      jurisdiction: jurisdiction.name
    }
  }

  /**
   * Check if a transaction is exempt from a specific tax
   */
  private isExempt(taxRate: TaxRate, request: TaxCalculationRequest): boolean {
    if (!taxRate.exemptions || !request.itemCategory) {
      return false
    }

    const exemption = taxRate.exemptions.find(e => 
      e.category === request.itemCategory
    )

    if (exemption) {
      // If certificate is required, check if one is provided
      if (exemption.certificateRequired && !request.exemptionCertificate) {
        return false
      }
      return true
    }

    // Check for customer type exemptions
    if (request.customerType === 'NON_PROFIT' || request.customerType === 'GOVERNMENT') {
      return request.exemptionCertificate !== undefined
    }

    return false
  }

  /**
   * Calculate reverse tax (extract tax from total)
   */
  calculateReverseTax(total: number, jurisdictionId: string): TaxCalculationResult {
    const jurisdiction = this.jurisdictions.get(jurisdictionId)
    
    if (!jurisdiction) {
      throw new Error(`Unknown jurisdiction: ${jurisdictionId}`)
    }

    // Calculate combined tax rate
    const combinedRate = jurisdiction.taxRates.reduce((sum, rate) => sum + rate.rate, 0)
    
    // Extract base amount
    const subtotal = total / (1 + combinedRate)
    const totalTax = total - subtotal

    // Break down tax by component
    const taxBreakdown: TaxLineItem[] = jurisdiction.taxRates.map(rate => ({
      type: rate.type,
      name: rate.name,
      rate: rate.rate,
      amount: subtotal * rate.rate,
      taxableAmount: subtotal
    }))

    return {
      subtotal,
      taxBreakdown,
      totalTax,
      total,
      effectiveRate: combinedRate,
      jurisdiction: jurisdiction.name
    }
  }

  /**
   * Get tax summary for a jurisdiction
   */
  getJurisdictionSummary(jurisdictionId: string): {
    jurisdiction: string
    country: string
    totalRate: number
    components: Array<{ name: string; rate: number }>
  } {
    const jurisdiction = this.jurisdictions.get(jurisdictionId)
    
    if (!jurisdiction) {
      throw new Error(`Unknown jurisdiction: ${jurisdictionId}`)
    }

    const totalRate = jurisdiction.taxRates.reduce((sum, rate) => sum + rate.rate, 0)
    const components = jurisdiction.taxRates.map(rate => ({
      name: rate.name,
      rate: rate.rate
    }))

    return {
      jurisdiction: jurisdiction.name,
      country: jurisdiction.country,
      totalRate,
      components
    }
  }

  /**
   * Validate tax number (VAT, GST, etc.)
   */
  validateTaxNumber(taxNumber: string, country: string): boolean {
    // Simplified validation - in production, use proper validation services
    const patterns: Record<string, RegExp> = {
      'US': /^\d{2}-\d{7}$/, // EIN format
      'CA': /^[0-9]{9}(RT)?[0-9]{4}$/, // Canadian BN
      'UK': /^GB[0-9]{9}$/, // UK VAT
      'DE': /^DE[0-9]{9}$/, // German VAT
      'AU': /^[0-9]{11}$/, // Australian ABN
    }

    const pattern = patterns[country]
    if (!pattern) {
      return false
    }

    return pattern.test(taxNumber.replace(/\s/g, ''))
  }

  /**
   * Calculate tax for multiple line items
   */
  calculateInvoiceTax(
    lineItems: Array<{ amount: number; category?: string }>,
    jurisdictionId: string,
    customerType?: TaxCalculationRequest['customerType']
  ): {
    lineItemTaxes: TaxCalculationResult[]
    totalSubtotal: number
    totalTax: number
    grandTotal: number
  } {
    const lineItemTaxes = lineItems.map(item => 
      this.calculateTax({
        amount: item.amount,
        jurisdictionId,
        itemCategory: item.category,
        customerType
      })
    )

    const totalSubtotal = lineItemTaxes.reduce((sum, item) => sum + item.subtotal, 0)
    const totalTax = lineItemTaxes.reduce((sum, item) => sum + item.totalTax, 0)
    const grandTotal = totalSubtotal + totalTax

    return {
      lineItemTaxes,
      totalSubtotal,
      totalTax,
      grandTotal
    }
  }

  /**
   * Get available jurisdictions
   */
  getAvailableJurisdictions(): Array<{
    id: string
    name: string
    country: string
    rate: number
  }> {
    return Array.from(this.jurisdictions.values()).map(j => ({
      id: j.id,
      name: j.name,
      country: j.country,
      rate: j.taxRates.reduce((sum, r) => sum + r.rate, 0)
    }))
  }
}

// Export singleton instance
export const taxCalculator = new TaxCalculator()