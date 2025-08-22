/**
 * CoreFlow360 - Payroll Calculator
 * Handles basic payroll calculations including taxes, deductions, and benefits
 */

export interface PayrollConfig {
  payPeriod: 'WEEKLY' | 'BIWEEKLY' | 'SEMIMONTHLY' | 'MONTHLY'
  federalTaxRate: number
  stateTaxRate: number
  socialSecurityRate: number
  medicareRate: number
  stateDisabilityRate?: number
  unemploymentRate?: number
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  annualSalary?: number
  hourlyRate?: number
  employmentType: 'SALARIED' | 'HOURLY' | 'CONTRACT'
  taxWithholdings: number // W-4 withholdings
  exemptions: number
  additionalWithholding: number
  benefits: EmployeeBenefits
}

export interface EmployeeBenefits {
  healthInsurance: number
  dentalInsurance: number
  visionInsurance: number
  retirement401k: number // percentage
  retirementRoth: number // percentage
  lifeInsurance: number
  otherDeductions: number
}

export interface PayPeriod {
  startDate: Date
  endDate: Date
  regularHours: number
  overtimeHours: number
  doubleTimeHours?: number
  vacationHours: number
  sickHours: number
  personalHours: number
  holidayHours: number
}

export interface PayrollCalculation {
  employee: Employee
  payPeriod: PayPeriod
  grossPay: {
    regularPay: number
    overtimePay: number
    doubleTimePay: number
    vacationPay: number
    sickPay: number
    personalPay: number
    holidayPay: number
    bonuses: number
    total: number
  }
  taxes: {
    federalIncome: number
    stateIncome: number
    socialSecurity: number
    medicare: number
    stateDisability: number
    unemployment: number
    total: number
  }
  deductions: {
    healthInsurance: number
    dentalInsurance: number
    visionInsurance: number
    retirement401k: number
    retirementRoth: number
    lifeInsurance: number
    otherDeductions: number
    total: number
  }
  netPay: number
  yearToDate: {
    grossPay: number
    taxes: number
    deductions: number
    netPay: number
  }
}

export class PayrollCalculator {
  private config: PayrollConfig

  constructor(config: PayrollConfig) {
    this.config = config
  }

  /**
   * Calculate payroll for an employee for a specific pay period
   */
  calculatePayroll(
    employee: Employee,
    payPeriod: PayPeriod,
    yearToDateTotals?: PayrollCalculation['yearToDate']
  ): PayrollCalculation {
    // Calculate gross pay
    const grossPay = this.calculateGrossPay(employee, payPeriod)
    
    // Calculate taxes
    const taxes = this.calculateTaxes(employee, grossPay.total, yearToDateTotals?.grossPay || 0)
    
    // Calculate deductions
    const deductions = this.calculateDeductions(employee, grossPay.total)
    
    // Calculate net pay
    const netPay = grossPay.total - taxes.total - deductions.total
    
    return {
      employee,
      payPeriod,
      grossPay,
      taxes,
      deductions,
      netPay,
      yearToDate: yearToDateTotals || {
        grossPay: grossPay.total,
        taxes: taxes.total,
        deductions: deductions.total,
        netPay: netPay
      }
    }
  }

  /**
   * Calculate gross pay for the pay period
   */
  private calculateGrossPay(employee: Employee, payPeriod: PayPeriod) {
    let regularPay = 0
    let overtimePay = 0
    let doubleTimePay = 0

    if (employee.employmentType === 'HOURLY') {
      const hourlyRate = employee.hourlyRate || 0
      regularPay = payPeriod.regularHours * hourlyRate
      overtimePay = payPeriod.overtimeHours * (hourlyRate * 1.5) // Time and a half
      doubleTimePay = (payPeriod.doubleTimeHours || 0) * (hourlyRate * 2)
    } else if (employee.employmentType === 'SALARIED') {
      // Calculate based on pay periods per year
      const periodsPerYear = this.getPeriodsPerYear()
      regularPay = (employee.annualSalary || 0) / periodsPerYear
    }

    // Calculate other pay types (using regular rate)
    const baseRate = employee.hourlyRate || (employee.annualSalary || 0) / (this.getPeriodsPerYear() * 40)
    const vacationPay = payPeriod.vacationHours * baseRate
    const sickPay = payPeriod.sickHours * baseRate
    const personalPay = payPeriod.personalHours * baseRate
    const holidayPay = payPeriod.holidayHours * baseRate
    const bonuses = 0 // Would come from additional parameter

    const total = regularPay + overtimePay + doubleTimePay + vacationPay + sickPay + personalPay + holidayPay + bonuses

    return {
      regularPay,
      overtimePay,
      doubleTimePay,
      vacationPay,
      sickPay,
      personalPay,
      holidayPay,
      bonuses,
      total
    }
  }

  /**
   * Calculate tax withholdings
   */
  private calculateTaxes(employee: Employee, grossPay: number, ytdGrossPay: number) {
    // Federal Income Tax (simplified calculation)
    const federalIncome = this.calculateFederalTax(grossPay, employee.taxWithholdings, employee.exemptions)
    
    // State Income Tax
    const stateIncome = grossPay * this.config.stateTaxRate
    
    // Social Security (6.2% up to wage base limit)
    const socialSecurityWageBase = 160200 // 2023 limit
    const socialSecurityTaxableWages = Math.min(grossPay, Math.max(0, socialSecurityWageBase - ytdGrossPay))
    const socialSecurity = socialSecurityTaxableWages * this.config.socialSecurityRate
    
    // Medicare (1.45% no limit, additional 0.9% for high earners)
    const medicareBase = grossPay * this.config.medicareRate
    const additionalMedicare = this.calculateAdditionalMedicare(grossPay, ytdGrossPay, employee)
    const medicare = medicareBase + additionalMedicare
    
    // State Disability Insurance (varies by state)
    const stateDisability = grossPay * (this.config.stateDisabilityRate || 0)
    
    // State Unemployment (typically employer-paid, but some states require employee contribution)
    const unemployment = grossPay * (this.config.unemploymentRate || 0)
    
    const total = federalIncome + stateIncome + socialSecurity + medicare + stateDisability + unemployment

    return {
      federalIncome,
      stateIncome,
      socialSecurity,
      medicare,
      stateDisability,
      unemployment,
      total
    }
  }

  /**
   * Simplified federal tax calculation using withholding tables
   */
  private calculateFederalTax(grossPay: number, withholdings: number, exemptions: number): number {
    // This is a simplified calculation
    // In production, use actual IRS withholding tables
    const exemptionAmount = exemptions * 4050 // Approximate exemption value
    const taxableIncome = Math.max(0, grossPay - exemptionAmount / this.getPeriodsPerYear())
    
    // Progressive tax brackets (simplified)
    let tax = 0
    if (taxableIncome > 0) {
      tax = taxableIncome * 0.12 // Simplified rate
    }

    return Math.max(0, tax + withholdings)
  }

  /**
   * Calculate additional Medicare tax for high earners
   */
  private calculateAdditionalMedicare(grossPay: number, ytdGrossPay: number, employee: Employee): number {
    const threshold = 200000 // Single filer threshold
    const additionalRate = 0.009 // 0.9% additional
    
    if (ytdGrossPay + grossPay > threshold) {
      const taxableAmount = Math.max(0, ytdGrossPay + grossPay - threshold)
      return Math.min(taxableAmount, grossPay) * additionalRate
    }
    
    return 0
  }

  /**
   * Calculate employee deductions
   */
  private calculateDeductions(employee: Employee, grossPay: number) {
    const benefits = employee.benefits
    
    // Calculate retirement contributions
    const retirement401k = grossPay * (benefits.retirement401k / 100)
    const retirementRoth = grossPay * (benefits.retirementRoth / 100)
    
    const total = 
      benefits.healthInsurance +
      benefits.dentalInsurance +
      benefits.visionInsurance +
      retirement401k +
      retirementRoth +
      benefits.lifeInsurance +
      benefits.otherDeductions

    return {
      healthInsurance: benefits.healthInsurance,
      dentalInsurance: benefits.dentalInsurance,
      visionInsurance: benefits.visionInsurance,
      retirement401k,
      retirementRoth,
      lifeInsurance: benefits.lifeInsurance,
      otherDeductions: benefits.otherDeductions,
      total
    }
  }

  /**
   * Get number of pay periods per year
   */
  private getPeriodsPerYear(): number {
    switch (this.config.payPeriod) {
      case 'WEEKLY': return 52
      case 'BIWEEKLY': return 26
      case 'SEMIMONTHLY': return 24
      case 'MONTHLY': return 12
      default: return 26
    }
  }

  /**
   * Calculate year-to-date totals
   */
  calculateYearToDate(payrollHistory: PayrollCalculation[]): PayrollCalculation['yearToDate'] {
    return payrollHistory.reduce(
      (totals, payroll) => ({
        grossPay: totals.grossPay + payroll.grossPay.total,
        taxes: totals.taxes + payroll.taxes.total,
        deductions: totals.deductions + payroll.deductions.total,
        netPay: totals.netPay + payroll.netPay
      }),
      { grossPay: 0, taxes: 0, deductions: 0, netPay: 0 }
    )
  }

  /**
   * Generate pay stub data
   */
  generatePayStub(calculation: PayrollCalculation): {
    earnings: Array<{ description: string; hours?: number; rate?: number; amount: number }>
    taxes: Array<{ description: string; amount: number }>
    deductions: Array<{ description: string; amount: number }>
    summary: { grossPay: number; totalTaxes: number; totalDeductions: number; netPay: number }
  } {
    const earnings = [
      { description: 'Regular Pay', hours: calculation.payPeriod.regularHours, rate: calculation.employee.hourlyRate, amount: calculation.grossPay.regularPay },
      { description: 'Overtime Pay', hours: calculation.payPeriod.overtimeHours, rate: (calculation.employee.hourlyRate || 0) * 1.5, amount: calculation.grossPay.overtimePay },
      { description: 'Vacation Pay', hours: calculation.payPeriod.vacationHours, amount: calculation.grossPay.vacationPay },
      { description: 'Sick Pay', hours: calculation.payPeriod.sickHours, amount: calculation.grossPay.sickPay },
      { description: 'Holiday Pay', hours: calculation.payPeriod.holidayHours, amount: calculation.grossPay.holidayPay }
    ].filter(item => item.amount > 0)

    const taxes = [
      { description: 'Federal Income Tax', amount: calculation.taxes.federalIncome },
      { description: 'State Income Tax', amount: calculation.taxes.stateIncome },
      { description: 'Social Security', amount: calculation.taxes.socialSecurity },
      { description: 'Medicare', amount: calculation.taxes.medicare },
      { description: 'State Disability', amount: calculation.taxes.stateDisability }
    ].filter(item => item.amount > 0)

    const deductions = [
      { description: 'Health Insurance', amount: calculation.deductions.healthInsurance },
      { description: 'Dental Insurance', amount: calculation.deductions.dentalInsurance },
      { description: '401(k)', amount: calculation.deductions.retirement401k },
      { description: 'Roth 401(k)', amount: calculation.deductions.retirementRoth },
      { description: 'Life Insurance', amount: calculation.deductions.lifeInsurance },
      { description: 'Other Deductions', amount: calculation.deductions.otherDeductions }
    ].filter(item => item.amount > 0)

    return {
      earnings,
      taxes,
      deductions,
      summary: {
        grossPay: calculation.grossPay.total,
        totalTaxes: calculation.taxes.total,
        totalDeductions: calculation.deductions.total,
        netPay: calculation.netPay
      }
    }
  }
}

// Default US payroll configuration
export const defaultPayrollConfig: PayrollConfig = {
  payPeriod: 'BIWEEKLY',
  federalTaxRate: 0.12,
  stateTaxRate: 0.05,
  socialSecurityRate: 0.062,
  medicareRate: 0.0145,
  stateDisabilityRate: 0.01,
  unemploymentRate: 0
}

// Export singleton calculator with default config
export const payrollCalculator = new PayrollCalculator(defaultPayrollConfig)