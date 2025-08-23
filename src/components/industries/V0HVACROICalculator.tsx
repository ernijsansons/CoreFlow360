'use client'

import { useState, useEffect } from 'react'

export default function V0HVACROICalculator() {
  const [formData, setFormData] = useState({
    hvacLocations: 2,
    technicians: 8,
    avgTicket: 450,
    monthlyServiceCalls: 280,
    currentSoftwareCosts: 600,
    adminHoursWeekly: 35
  })

  const [results, setResults] = useState({
    hvacSavings: 0,
    revenueIncrease: 0,
    netMonthlySavings: 0,
    annualROI: 0,
    paybackMonths: 0,
    timeRecovered: 0,
    aiEmployeeCost: 0
  })

  const calculateHVACSavings = () => {
    const { hvacLocations, technicians, avgTicket, monthlyServiceCalls, currentSoftwareCosts, adminHoursWeekly } = formData

    // Progressive HVAC pricing discounts
    let discountRate = 0
    if (hvacLocations >= 5) discountRate = 0.25
    else if (hvacLocations >= 3) discountRate = 0.15
    else if (hvacLocations >= 2) discountRate = 0.10

    // Base cost per technician (HVAC-specific pricing)
    const baseTechnicianCost = 49
    const discountedCost = baseTechnicianCost * (1 - discountRate)
    const totalAIEmployeeCost = technicians * discountedCost

    // HVAC-specific revenue increases
    const schedulingEfficiency = monthlyServiceCalls * 0.25 * avgTicket // 25% more calls from better scheduling
    const closeRateImprovement = monthlyServiceCalls * 0.31 * avgTicket // 31% better close rate from AI estimates
    const emergencyPremium = monthlyServiceCalls * 0.15 * 150 // 15% of calls become premium emergency calls
    
    // Time savings (HVAC admin work)
    const timeSavingsValue = (adminHoursWeekly * 4.33) * 45 // Admin time saved at $45/hour
    
    // Software consolidation
    const softwareConsolidation = currentSoftwareCosts * hvacLocations * 0.45 // 45% reduction

    // Multi-location HVAC efficiency multiplier
    const locationMultiplier = hvacLocations >= 3 ? 1.3 : 1.15
    const totalMonthlySavings = (schedulingEfficiency + closeRateImprovement + emergencyPremium + timeSavingsValue + softwareConsolidation) * locationMultiplier

    const netMonthlySavings = totalMonthlySavings - totalAIEmployeeCost
    const annualROI = ((netMonthlySavings * 12) / (totalAIEmployeeCost * 12)) * 100
    const paybackMonths = totalAIEmployeeCost / netMonthlySavings

    setResults({
      hvacSavings: Math.round(totalMonthlySavings),
      revenueIncrease: Math.round(schedulingEfficiency + closeRateImprovement + emergencyPremium),
      netMonthlySavings: Math.round(netMonthlySavings),
      annualROI: Math.round(Math.max(0, annualROI)),
      paybackMonths: Math.max(0.1, paybackMonths),
      timeRecovered: Math.round(adminHoursWeekly * 0.8), // 80% admin time reduction
      aiEmployeeCost: Math.round(totalAIEmployeeCost)
    })
  }

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    calculateHVACSavings()
  }, [formData])

  const getHVACDiscountText = () => {
    if (formData.hvacLocations >= 5) return "25% HVAC Empire Discount"
    if (formData.hvacLocations >= 3) return "15% Multi-Location Discount" 
    if (formData.hvacLocations >= 2) return "10% HVAC Portfolio Discount"
    return "Standard HVAC Pricing"
  }

  return (
    <section id="hvac-roi-calculator" className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Calculate Your <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 bg-clip-text text-transparent">HVAC Savings</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            See exactly how much your HVAC business will save and earn with AI employees. 
            Real HVAC metrics, real savings, real empire growth potential.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* HVAC Input Form */}
            <div className="space-y-8">
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
                  <span className="text-2xl">🔧</span>
                  Tell us about your HVAC business
                </h3>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Number of HVAC Locations
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={formData.hvacLocations}
                      onChange={(e) => handleInputChange('hvacLocations', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>1 Location</span>
                      <span className="text-orange-400 font-bold text-lg">{formData.hvacLocations} Locations</span>
                      <span>15+ Empire</span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="inline-block px-4 py-2 bg-orange-600/20 text-orange-400 rounded-full text-sm font-semibold">
                        {getHVACDiscountText()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Total HVAC Technicians
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="100"
                      value={formData.technicians}
                      onChange={(e) => handleInputChange('technicians', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>2</span>
                      <span className="text-red-400 font-bold text-lg">{formData.technicians} Techs</span>
                      <span>100+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Average Service Ticket ($)
                    </label>
                    <input
                      type="range"
                      min="150"
                      max="1500"
                      step="25"
                      value={formData.avgTicket}
                      onChange={(e) => handleInputChange('avgTicket', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>$150</span>
                      <span className="text-pink-400 font-bold text-lg">${formData.avgTicket}</span>
                      <span>$1,500+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Monthly Service Calls
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      step="10"
                      value={formData.monthlyServiceCalls}
                      onChange={(e) => handleInputChange('monthlyServiceCalls', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>50</span>
                      <span className="text-blue-400 font-bold text-lg">{formData.monthlyServiceCalls} calls</span>
                      <span>1,000+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Weekly Admin Hours (All Locations)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={formData.adminHoursWeekly}
                      onChange={(e) => handleInputChange('adminHoursWeekly', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>10h</span>
                      <span className="text-green-400 font-bold text-lg">{formData.adminHoursWeekly}h/week</span>
                      <span>80h+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Current HVAC Software Costs Per Location/Month ($)
                    </label>
                    <input
                      type="range"
                      min="200"
                      max="2000"
                      step="50"
                      value={formData.currentSoftwareCosts}
                      onChange={(e) => handleInputChange('currentSoftwareCosts', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>$200</span>
                      <span className="text-yellow-400 font-bold text-lg">${formData.currentSoftwareCosts}/location</span>
                      <span>$2K+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* HVAC Results */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-orange-600/10 via-red-600/10 to-pink-600/10 backdrop-blur-sm p-8 rounded-3xl border border-orange-500/20">
                <h3 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
                  <span className="text-2xl">🚀</span>
                  Your HVAC Empire Savings
                </h3>
                
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">💰 Total HVAC Savings</span>
                      <span className="text-3xl font-bold text-green-400">${results.hvacSavings.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm">Per month across all HVAC locations</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">📈 Revenue Increase</span>
                      <span className="text-3xl font-bold text-orange-400">${results.revenueIncrease.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm">From better scheduling and estimates</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">⏰ Time Recovered</span>
                      <span className="text-3xl font-bold text-blue-400">{results.timeRecovered}h</span>
                    </div>
                    <p className="text-gray-300 text-sm">Hours per week returned to HVAC growth</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">🏆 Net HVAC Profit</span>
                      <span className="text-3xl font-bold text-purple-400">${results.netMonthlySavings.toLocaleString()}</span>
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

              <div className="bg-gradient-to-r from-orange-600/20 via-red-600/20 to-pink-600/20 backdrop-blur-sm p-8 rounded-3xl border border-orange-500/30">
                <h4 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
                  <span>🔧</span> Your HVAC AI Investment
                </h4>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    ${results.aiEmployeeCost.toLocaleString()}<span className="text-lg text-gray-300">/month</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    {formData.technicians} technicians × {formData.hvacLocations} locations
                  </p>
                  <div className="inline-block px-4 py-2 bg-green-600/20 text-green-400 rounded-full text-sm font-semibold">
                    {getHVACDiscountText()} Applied!
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button className="w-full py-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-500 hover:via-red-500 hover:to-pink-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                    Start HVAC Empire - Free Trial
                  </button>
                  <button className="w-full py-3 border-2 border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-xl font-semibold transition-all duration-300">
                    Schedule HVAC Demo
                  </button>
                </div>
                
                <div className="mt-6 text-center text-sm text-gray-400">
                  ✅ 30-day HVAC trial • ✅ No credit card • ✅ HVAC expert setup
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HVAC Trust Section */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 rounded-3xl bg-gray-800/30 backdrop-blur-sm border border-gray-700 max-w-4xl">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <span>🔧</span> Join 847+ HVAC Empire Builders
            </h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">$1.8M+</div>
                <div className="text-gray-400 text-sm">HVAC Revenue Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">52%</div>
                <div className="text-gray-400 text-sm">Avg HVAC Growth Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">38 days</div>
                <div className="text-gray-400 text-sm">Avg HVAC Payback Period</div>
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
          background: linear-gradient(135deg, #ea580c, #dc2626, #ec4899);
          cursor: pointer;
          box-shadow: 0 0 15px rgba(234, 88, 12, 0.6);
          border: 2px solid white;
        }

        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ea580c, #dc2626, #ec4899);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 15px rgba(234, 88, 12, 0.6);
        }
      `}</style>
    </section>
  )
}