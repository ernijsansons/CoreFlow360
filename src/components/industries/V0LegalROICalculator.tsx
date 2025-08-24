'use client'

import { useState, useEffect } from 'react'

export default function V0LegalROICalculator() {
  const [formData, setFormData] = useState({
    legalOffices: 2,
    attorneys: 6,
    avgHourlyRate: 350,
    monthlyBillableHours: 1200,
    currentLegalSoftwareCosts: 800,
    researchHoursWeekly: 30
  })

  const [results, setResults] = useState({
    legalSavings: 0,
    revenueIncrease: 0,
    netMonthlySavings: 0,
    annualROI: 0,
    paybackMonths: 0,
    timeRecovered: 0,
    aiEmployeeCost: 0
  })

  const calculateLegalSavings = () => {
    const { legalOffices, attorneys, avgHourlyRate, monthlyBillableHours, currentLegalSoftwareCosts, researchHoursWeekly } = formData

    // Progressive Legal pricing discounts
    let discountRate = 0
    if (legalOffices >= 5) discountRate = 0.25
    else if (legalOffices >= 3) discountRate = 0.15
    else if (legalOffices >= 2) discountRate = 0.10

    // Base cost per attorney (Legal-specific pricing)
    const baseAttorneyCost = 49
    const discountedCost = baseAttorneyCost * (1 - discountRate)
    const totalAIEmployeeCost = attorneys * discountedCost

    // Legal-specific revenue increases
    const researchEfficiency = (researchHoursWeekly * 4.33) * 0.75 * avgHourlyRate // 75% research time saved becomes billable
    const documentEfficiency = monthlyBillableHours * 0.25 * avgHourlyRate // 25% more billable hours from automation
    const clientIntake = monthlyBillableHours * 0.20 * avgHourlyRate // 20% more clients from better intake
    
    // Time savings (Legal admin and research work)
    const timeSavingsValue = (researchHoursWeekly * 4.33) * 0.8 * (avgHourlyRate * 0.3) // Research time at paralegal rates
    
    // Software consolidation
    const softwareConsolidation = currentLegalSoftwareCosts * legalOffices * 0.40 // 40% reduction

    // Multi-office Legal efficiency multiplier
    const officeMultiplier = legalOffices >= 3 ? 1.25 : 1.15
    const totalMonthlySavings = (researchEfficiency + documentEfficiency + clientIntake + timeSavingsValue + softwareConsolidation) * officeMultiplier

    const netMonthlySavings = totalMonthlySavings - totalAIEmployeeCost
    const annualROI = ((netMonthlySavings * 12) / (totalAIEmployeeCost * 12)) * 100
    const paybackMonths = totalAIEmployeeCost / netMonthlySavings

    setResults({
      legalSavings: Math.round(totalMonthlySavings),
      revenueIncrease: Math.round(researchEfficiency + documentEfficiency + clientIntake),
      netMonthlySavings: Math.round(netMonthlySavings),
      annualROI: Math.round(Math.max(0, annualROI)),
      paybackMonths: Math.max(0.1, paybackMonths),
      timeRecovered: Math.round((researchHoursWeekly * 0.75) + 15), // Research time saved + admin efficiency
      aiEmployeeCost: Math.round(totalAIEmployeeCost)
    })
  }

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    calculateLegalSavings()
  }, [formData])

  const getLegalDiscountText = () => {
    if (formData.legalOffices >= 5) return "25% Legal Empire Discount"
    if (formData.legalOffices >= 3) return "15% Multi-Office Discount" 
    if (formData.legalOffices >= 2) return "10% Legal Portfolio Discount"
    return "Standard Legal Pricing"
  }

  return (
    <section id="legal-roi-calculator" className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Calculate Your <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">Legal Savings</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            See exactly how much your law firm will save and earn with AI employees. 
            Real legal metrics, real billable hour increases, real empire growth potential.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Legal Input Form */}
            <div className="space-y-8">
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
                  <span className="text-2xl">⚖️</span>
                  Tell us about your legal practice
                </h3>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Number of Legal Offices
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={formData.legalOffices}
                      onChange={(e) => handleInputChange('legalOffices', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>1 Office</span>
                      <span className="text-purple-400 font-bold text-lg">{formData.legalOffices} Offices</span>
                      <span>20+ Empire</span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="inline-block px-4 py-2 bg-purple-600/20 text-purple-400 rounded-full text-sm font-semibold">
                        {getLegalDiscountText()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Total Attorneys
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={formData.attorneys}
                      onChange={(e) => handleInputChange('attorneys', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>1</span>
                      <span className="text-blue-400 font-bold text-lg">{formData.attorneys} Attorneys</span>
                      <span>100+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Average Hourly Rate ($)
                    </label>
                    <input
                      type="range"
                      min="150"
                      max="1000"
                      step="25"
                      value={formData.avgHourlyRate}
                      onChange={(e) => handleInputChange('avgHourlyRate', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>$150</span>
                      <span className="text-indigo-400 font-bold text-lg">${formData.avgHourlyRate}/hour</span>
                      <span>$1,000+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Monthly Billable Hours (All Attorneys)
                    </label>
                    <input
                      type="range"
                      min="200"
                      max="5000"
                      step="50"
                      value={formData.monthlyBillableHours}
                      onChange={(e) => handleInputChange('monthlyBillableHours', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>200h</span>
                      <span className="text-pink-400 font-bold text-lg">{formData.monthlyBillableHours}h</span>
                      <span>5,000h+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Weekly Research Hours (All Offices)
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={formData.researchHoursWeekly}
                      onChange={(e) => handleInputChange('researchHoursWeekly', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>5h</span>
                      <span className="text-green-400 font-bold text-lg">{formData.researchHoursWeekly}h/week</span>
                      <span>100h+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Current Legal Software Costs Per Office/Month ($)
                    </label>
                    <input
                      type="range"
                      min="300"
                      max="3000"
                      step="100"
                      value={formData.currentLegalSoftwareCosts}
                      onChange={(e) => handleInputChange('currentLegalSoftwareCosts', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>$300</span>
                      <span className="text-yellow-400 font-bold text-lg">${formData.currentLegalSoftwareCosts}/office</span>
                      <span>$3K+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Results */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-indigo-600/10 backdrop-blur-sm p-8 rounded-3xl border border-purple-500/20">
                <h3 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
                  <span className="text-2xl">⚖️</span>
                  Your Legal Empire Savings
                </h3>
                
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">💰 Total Legal Savings</span>
                      <span className="text-3xl font-bold text-green-400">${results.legalSavings.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm">Per month across all legal offices</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">📈 Revenue Increase</span>
                      <span className="text-3xl font-bold text-purple-400">${results.revenueIncrease.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm">From more billable hours and efficiency</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">⏰ Time Recovered</span>
                      <span className="text-3xl font-bold text-blue-400">{results.timeRecovered}h</span>
                    </div>
                    <p className="text-gray-300 text-sm">Hours per week returned to legal strategy</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">🏛️ Net Legal Profit</span>
                      <span className="text-3xl font-bold text-indigo-400">${results.netMonthlySavings.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm">Monthly profit after AI employee costs</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">🚀 Annual ROI</span>
                      <span className="text-3xl font-bold text-yellow-400">{results.annualROI}%</span>
                    </div>
                    <p className="text-gray-300 text-sm">Payback in {results.paybackMonths.toFixed(1)} months</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 backdrop-blur-sm p-8 rounded-3xl border border-purple-500/30">
                <h4 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
                  <span>⚖️</span> Your Legal AI Investment
                </h4>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    ${results.aiEmployeeCost.toLocaleString()}<span className="text-lg text-gray-300">/month</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    {formData.attorneys} attorneys × {formData.legalOffices} offices
                  </p>
                  <div className="inline-block px-4 py-2 bg-green-600/20 text-green-400 rounded-full text-sm font-semibold">
                    {getLegalDiscountText()} Applied!
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button className="w-full py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:via-blue-500 hover:to-indigo-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                    Start Legal Empire - Free Trial
                  </button>
                  <button className="w-full py-3 border-2 border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-xl font-semibold transition-all duration-300">
                    Schedule Legal Demo
                  </button>
                </div>
                
                <div className="mt-6 text-center text-sm text-gray-400">
                  ✅ 30-day legal trial • ✅ Bar compliant • ✅ Legal expert setup
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Trust Section */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 rounded-3xl bg-gray-800/30 backdrop-blur-sm border border-gray-700 max-w-4xl">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <span>⚖️</span> Join 423+ Legal Empire Builders
            </h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">$3.2M+</div>
                <div className="text-gray-400 text-sm">Legal Revenue Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">67%</div>
                <div className="text-gray-400 text-sm">More Billable Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-400">32 days</div>
                <div className="text-gray-400 text-sm">Avg Legal Payback Period</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #3b82f6, #6366f1);
          cursor: pointer;
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.6);
          border: 2px solid white;
        }

        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #3b82f6, #6366f1);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.6);
        }
      `}</style>
    </section>
  )
}