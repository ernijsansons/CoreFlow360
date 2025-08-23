'use client'

import { useState, useEffect } from 'react'

export default function V0ROICalculator() {
  const [formData, setFormData] = useState({
    businessCount: 2,
    employees: 15,
    monthlyRevenue: 75000,
    currentSoftwareCosts: 800,
    hoursOnAdmin: 25
  })

  const [results, setResults] = useState({
    empireSavings: 0,
    aiEmployeeCost: 0,
    netMonthlySavings: 0,
    annualROI: 0,
    paybackMonths: 0,
    timeRecovered: 0
  })

  const calculateEmpireSavings = () => {
    const { businessCount, employees, monthlyRevenue, currentSoftwareCosts, hoursOnAdmin } = formData

    // Progressive pricing discounts for multiple businesses
    let discountRate = 0
    if (businessCount >= 5) discountRate = 0.25
    else if (businessCount >= 3) discountRate = 0.15
    else if (businessCount >= 2) discountRate = 0.10

    // Base cost per employee (Growth Accelerator tier)
    const baseEmployeeCost = 49
    const discountedCost = baseEmployeeCost * (1 - discountRate)
    const totalAIEmployeeCost = employees * discountedCost

    // Time savings calculations (AI employees work 24/7)
    const hoursPerEmployee = hoursOnAdmin / employees
    const timeSavedPerEmployee = hoursPerEmployee * 0.75 // 75% admin time reduction
    const totalTimeSaved = timeSavedPerEmployee * employees
    const timeSavingsValue = totalTimeSaved * 65 // $65/hour value

    // Revenue increase from AI optimization
    const revenueIncrease = monthlyRevenue * businessCount * 0.18 // 18% boost per business

    // Software consolidation savings
    const softwareConsolidation = currentSoftwareCosts * businessCount * 0.45 // 45% reduction

    // Multi-business efficiency multiplier
    const businessMultiplier = businessCount >= 3 ? 1.2 : 1.1
    const totalMonthlySavings = (timeSavingsValue + revenueIncrease + softwareConsolidation) * businessMultiplier

    const netMonthlySavings = totalMonthlySavings - totalAIEmployeeCost
    const annualROI = ((netMonthlySavings * 12) / (totalAIEmployeeCost * 12)) * 100
    const paybackMonths = totalAIEmployeeCost / netMonthlySavings

    setResults({
      empireSavings: Math.round(totalMonthlySavings),
      aiEmployeeCost: Math.round(totalAIEmployeeCost),
      netMonthlySavings: Math.round(netMonthlySavings),
      annualROI: Math.round(Math.max(0, annualROI)),
      paybackMonths: Math.max(0.1, paybackMonths),
      timeRecovered: Math.round(totalTimeSaved)
    })
  }

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    calculateEmpireSavings()
  }, [formData])

  const getDiscountText = () => {
    if (formData.businessCount >= 5) return "25% Empire Discount"
    if (formData.businessCount >= 3) return "15% Multi-Business Discount" 
    if (formData.businessCount >= 2) return "10% Portfolio Discount"
    return "Standard Pricing"
  }

  return (
    <section id="roi-calculator" className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Calculate Your <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 bg-clip-text text-transparent">Empire Savings</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            See exactly how much you'll save by building your business empire with AI employees. 
            The more businesses you manage, the more you save.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Input Form */}
            <div className="space-y-8">
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-8 text-center">Tell us about your business empire</h3>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Number of Businesses in Your Portfolio
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={formData.businessCount}
                      onChange={(e) => handleInputChange('businessCount', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>1 Business</span>
                      <span className="text-blue-400 font-bold text-lg">{formData.businessCount} Businesses</span>
                      <span>20+ Empire</span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="inline-block px-4 py-2 bg-blue-600/20 text-blue-400 rounded-full text-sm font-semibold">
                        {getDiscountText()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Total Employees Across All Businesses
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="500"
                      value={formData.employees}
                      onChange={(e) => handleInputChange('employees', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>1</span>
                      <span className="text-purple-400 font-bold text-lg">{formData.employees} Employees</span>
                      <span>500+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Combined Monthly Revenue ($)
                    </label>
                    <input
                      type="range"
                      min="10000"
                      max="2000000"
                      step="10000"
                      value={formData.monthlyRevenue}
                      onChange={(e) => handleInputChange('monthlyRevenue', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>$10K</span>
                      <span className="text-pink-400 font-bold text-lg">${formData.monthlyRevenue.toLocaleString()}</span>
                      <span>$2M+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Hours/Week on Admin Tasks (All Businesses)
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={formData.hoursOnAdmin}
                      onChange={(e) => handleInputChange('hoursOnAdmin', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>5h</span>
                      <span className="text-green-400 font-bold text-lg">{formData.hoursOnAdmin}h/week</span>
                      <span>100h+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Current Software Costs Per Business/Month ($)
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
                      <span className="text-yellow-400 font-bold text-lg">${formData.currentSoftwareCosts}/business</span>
                      <span>$5K+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm p-8 rounded-3xl border border-blue-500/20">
                <h3 className="text-2xl font-bold text-white mb-8 text-center">Your Empire Savings Projection</h3>
                
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">💰 Total Empire Savings</span>
                      <span className="text-3xl font-bold text-green-400">${results.empireSavings.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm">Per month across all your businesses</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">⏰ Time Recovered</span>
                      <span className="text-3xl font-bold text-blue-400">{results.timeRecovered}h</span>
                    </div>
                    <p className="text-gray-300 text-sm">Hours per week returned to strategic work</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">📈 Net Monthly Profit</span>
                      <span className="text-3xl font-bold text-purple-400">${results.netMonthlySavings.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm">After AI employee costs</p>
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

              <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm p-8 rounded-3xl border border-blue-500/30">
                <h4 className="text-xl font-bold text-white mb-4 text-center">💸 Your AI Employee Investment</h4>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    ${results.aiEmployeeCost.toLocaleString()}<span className="text-lg text-gray-300">/month</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    {formData.employees} employees × {formData.businessCount} businesses
                  </p>
                  <div className="inline-block px-4 py-2 bg-green-600/20 text-green-400 rounded-full text-sm font-semibold">
                    {getDiscountText()} Applied!
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                    Start Building Your Empire - Free Trial
                  </button>
                  <button className="w-full py-3 border-2 border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-xl font-semibold transition-all duration-300">
                    Schedule Personal Demo
                  </button>
                </div>
                
                <div className="mt-6 text-center text-sm text-gray-400">
                  ✅ 30-day free trial • ✅ No credit card required • ✅ AI Launch Concierge
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Section */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 rounded-3xl bg-gray-800/30 backdrop-blur-sm border border-gray-700 max-w-4xl">
            <h4 className="text-xl font-bold text-white mb-4">
              🏆 Join 2,847+ Business Empire Builders
            </h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">$2.3M+</div>
                <div className="text-gray-400 text-sm">Empire Savings Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">98%</div>
                <div className="text-gray-400 text-sm">Customer Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">45 days</div>
                <div className="text-gray-400 text-sm">Average Payback Period</div>
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
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
          cursor: pointer;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
          border: 2px solid white;
        }

        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
        }
      `}</style>
    </section>
  )
}