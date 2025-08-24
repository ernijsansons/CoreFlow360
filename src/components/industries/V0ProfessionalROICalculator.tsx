'use client'

import { useState, useEffect } from 'react'

export default function V0ProfessionalROICalculator() {
  const [formData, setFormData] = useState({
    clientAccounts: 5,
    teamSize: 12,
    avgProjectValue: 25000,
    projectsPerMonth: 8,
    currentSoftwareCosts: 800,
    adminHoursWeekly: 35
  })

  const [results, setResults] = useState({
    professionalSavings: 0,
    revenueIncrease: 0,
    netMonthlySavings: 0,
    annualROI: 0,
    paybackMonths: 0,
    billableHoursRecovered: 0,
    aiEmployeeCost: 0
  })

  const calculateProfessionalSavings = () => {
    const { clientAccounts, teamSize, avgProjectValue, projectsPerMonth, currentSoftwareCosts, adminHoursWeekly } = formData

    // Progressive Professional pricing discounts
    let discountRate = 0
    if (clientAccounts >= 10) discountRate = 0.25
    else if (clientAccounts >= 5) discountRate = 0.15
    else if (clientAccounts >= 3) discountRate = 0.10

    // Base cost per team member (Professional-specific pricing)
    const baseTeamCost = 65
    const discountedCost = baseTeamCost * (1 - discountRate)
    const totalAIEmployeeCost = teamSize * discountedCost

    // Professional-specific revenue increases
    const monthlyProjectRevenue = (avgProjectValue * projectsPerMonth)
    const utilization = monthlyProjectRevenue * 0.31 // 31% utilization improvement
    const fasterCollections = monthlyProjectRevenue * 0.12 // 12% from faster payments
    const upsellRevenue = monthlyProjectRevenue * 0.28 // 28% from upsells/cross-sells
    
    // Time and efficiency savings
    const billableHoursValue = (adminHoursWeekly * 4.33) * 150 // Billable hours at $150/hour
    const productivityGain = monthlyProjectRevenue * 0.24 // 24% productivity improvement
    
    // Software and operational savings
    const softwareConsolidation = currentSoftwareCosts * clientAccounts * 0.45 // 45% reduction
    const operationalEfficiency = (teamSize * 200) * clientAccounts // Operational efficiency savings
    
    // Multi-client Professional efficiency multiplier
    const clientMultiplier = clientAccounts >= 5 ? 1.45 : 1.25
    const totalMonthlySavings = (utilization + fasterCollections + upsellRevenue + billableHoursValue + productivityGain + softwareConsolidation + operationalEfficiency) * clientMultiplier

    const netMonthlySavings = totalMonthlySavings - totalAIEmployeeCost
    const annualROI = ((netMonthlySavings * 12) / (totalAIEmployeeCost * 12)) * 100
    const paybackMonths = totalAIEmployeeCost / netMonthlySavings

    setResults({
      professionalSavings: Math.round(totalMonthlySavings),
      revenueIncrease: Math.round(utilization + upsellRevenue + fasterCollections),
      netMonthlySavings: Math.round(netMonthlySavings),
      annualROI: Math.round(Math.max(0, annualROI)),
      paybackMonths: Math.max(0.1, paybackMonths),
      billableHoursRecovered: Math.round(adminHoursWeekly * 0.85), // 85% admin time converted to billable
      aiEmployeeCost: Math.round(totalAIEmployeeCost)
    })
  }

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    calculateProfessionalSavings()
  }, [formData])

  const getProfessionalDiscountText = () => {
    if (formData.clientAccounts >= 10) return "25% Professional Empire Discount"
    if (formData.clientAccounts >= 5) return "15% Multi-Client Discount" 
    if (formData.clientAccounts >= 3) return "10% Professional Portfolio Discount"
    return "Standard Professional Pricing"
  }

  return (
    <section id="professional-roi-calculator" className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Calculate Your <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 bg-clip-text text-transparent">Professional Savings</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            See exactly how much your professional firm will save and earn with AI employees. 
            Real professional metrics, real revenue improvements, real empire growth potential.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Professional Input Form */}
            <div className="space-y-8">
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
                  <span className="text-2xl">💼</span>
                  Tell us about your professional firm
                </h3>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Number of Client Accounts
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="25"
                      value={formData.clientAccounts}
                      onChange={(e) => handleInputChange('clientAccounts', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>1 Client</span>
                      <span className="text-green-400 font-bold text-lg">{formData.clientAccounts} Clients</span>
                      <span>25+ Empire</span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="inline-block px-4 py-2 bg-green-600/20 text-green-400 rounded-full text-sm font-semibold">
                        {getProfessionalDiscountText()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Total Team Size
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="100"
                      value={formData.teamSize}
                      onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>3</span>
                      <span className="text-emerald-400 font-bold text-lg">{formData.teamSize} Team</span>
                      <span>100+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Average Project Value ($)
                    </label>
                    <input
                      type="range"
                      min="5000"
                      max="200000"
                      step="5000"
                      value={formData.avgProjectValue}
                      onChange={(e) => handleInputChange('avgProjectValue', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>$5K</span>
                      <span className="text-teal-400 font-bold text-lg">${(formData.avgProjectValue / 1000).toFixed(0)}K</span>
                      <span>$200K+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Projects Per Month
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="50"
                      value={formData.projectsPerMonth}
                      onChange={(e) => handleInputChange('projectsPerMonth', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>2</span>
                      <span className="text-cyan-400 font-bold text-lg">{formData.projectsPerMonth} projects</span>
                      <span>50+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Weekly Admin Hours (All Team)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={formData.adminHoursWeekly}
                      onChange={(e) => handleInputChange('adminHoursWeekly', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>10h</span>
                      <span className="text-blue-400 font-bold text-lg">{formData.adminHoursWeekly}h/week</span>
                      <span>100h+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Current Software Costs Per Month ($)
                    </label>
                    <input
                      type="range"
                      min="200"
                      max="5000"
                      step="100"
                      value={formData.currentSoftwareCosts}
                      onChange={(e) => handleInputChange('currentSoftwareCosts', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>$200</span>
                      <span className="text-indigo-400 font-bold text-lg">${formData.currentSoftwareCosts}/month</span>
                      <span>$5K+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Results */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-600/10 via-emerald-600/10 to-teal-600/10 backdrop-blur-sm p-8 rounded-3xl border border-green-500/20">
                <h3 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
                  <span className="text-2xl">💰</span>
                  Your Professional Empire Savings
                </h3>
                
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">💰 Total Professional Savings</span>
                      <span className="text-3xl font-bold text-green-400">${results.professionalSavings.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm">Per month across all clients</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">📈 Revenue Increase</span>
                      <span className="text-3xl font-bold text-emerald-400">${results.revenueIncrease.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm">From utilization and upsells</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">⏰ Billable Hours Recovered</span>
                      <span className="text-3xl font-bold text-teal-400">{results.billableHoursRecovered}h</span>
                    </div>
                    <p className="text-gray-300 text-sm">Hours per week for revenue</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">💼 Net Professional Profit</span>
                      <span className="text-3xl font-bold text-cyan-400">${results.netMonthlySavings.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm">Monthly profit after AI costs</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">🚀 Annual ROI</span>
                      <span className="text-3xl font-bold text-indigo-400">{results.annualROI}%</span>
                    </div>
                    <p className="text-gray-300 text-sm">Payback in {results.paybackMonths.toFixed(1)} months</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-teal-600/20 backdrop-blur-sm p-8 rounded-3xl border border-green-500/30">
                <h4 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
                  <span>💼</span> Your Professional AI Investment
                </h4>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    ${results.aiEmployeeCost.toLocaleString()}<span className="text-lg text-gray-300">/month</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    {formData.teamSize} team × {formData.clientAccounts} clients
                  </p>
                  <div className="inline-block px-4 py-2 bg-green-600/20 text-green-400 rounded-full text-sm font-semibold">
                    {getProfessionalDiscountText()} Applied!
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button className="w-full py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-500 hover:via-emerald-500 hover:to-teal-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                    Start Professional Empire - Free Trial
                  </button>
                  <button className="w-full py-3 border-2 border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-xl font-semibold transition-all duration-300">
                    Schedule Professional Demo
                  </button>
                </div>
                
                <div className="mt-6 text-center text-sm text-gray-400">
                  ✅ 30-day professional trial • ✅ No credit card • ✅ Professional expert setup
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Trust Section */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 rounded-3xl bg-gray-800/30 backdrop-blur-sm border border-gray-700 max-w-4xl">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <span>💼</span> Join 923+ Professional Empire Builders
            </h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">$8.2M+</div>
                <div className="text-gray-400 text-sm">Professional Revenue Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">97%</div>
                <div className="text-gray-400 text-sm">Client Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-400">28 days</div>
                <div className="text-gray-400 text-sm">Avg Payback Period</div>
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
          background: linear-gradient(135deg, #10b981, #059669, #14b8a6);
          cursor: pointer;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
          border: 2px solid white;
        }

        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669, #14b8a6);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
        }
      `}</style>
    </section>
  )
}