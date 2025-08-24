'use client'

import { useState, useEffect } from 'react'

export default function V0ConstructionROICalculator() {
  const [formData, setFormData] = useState({
    constructionSites: 3,
    crewSize: 25,
    avgProjectValue: 750000,
    projectsPerYear: 12,
    currentSoftwareCosts: 1200,
    adminHoursWeekly: 45
  })

  const [results, setResults] = useState({
    constructionSavings: 0,
    revenueIncrease: 0,
    netMonthlySavings: 0,
    annualROI: 0,
    paybackMonths: 0,
    timeRecovered: 0,
    aiEmployeeCost: 0
  })

  const calculateConstructionSavings = () => {
    const { constructionSites, crewSize, avgProjectValue, projectsPerYear, currentSoftwareCosts, adminHoursWeekly } = formData

    // Progressive Construction pricing discounts
    let discountRate = 0
    if (constructionSites >= 7) discountRate = 0.25
    else if (constructionSites >= 4) discountRate = 0.15
    else if (constructionSites >= 2) discountRate = 0.10

    // Base cost per crew member (Construction-specific pricing)
    const baseCrewCost = 49
    const discountedCost = baseCrewCost * (1 - discountRate)
    const totalAIEmployeeCost = crewSize * discountedCost

    // Construction-specific revenue increases
    const monthlyProjectValue = (avgProjectValue * projectsPerYear) / 12
    const onTimeBonus = monthlyProjectValue * 0.08 // 8% bonus for on-time completion
    const marginImprovement = monthlyProjectValue * 0.22 // 22% margin improvement
    const changeOrderRevenue = monthlyProjectValue * 0.15 // 15% from better change order management
    
    // Time and efficiency savings
    const timeSavingsValue = (adminHoursWeekly * 4.33) * 55 // Admin time at $55/hour
    const delayPrevention = monthlyProjectValue * 0.12 // 12% saved from preventing delays
    
    // Software and safety savings
    const softwareConsolidation = currentSoftwareCosts * constructionSites * 0.35 // 35% reduction
    const safetySavings = (crewSize * 100) * constructionSites // Safety incident prevention savings
    
    // Multi-site Construction efficiency multiplier
    const siteMultiplier = constructionSites >= 4 ? 1.35 : 1.20
    const totalMonthlySavings = (onTimeBonus + marginImprovement + changeOrderRevenue + timeSavingsValue + delayPrevention + softwareConsolidation + safetySavings) * siteMultiplier

    const netMonthlySavings = totalMonthlySavings - totalAIEmployeeCost
    const annualROI = ((netMonthlySavings * 12) / (totalAIEmployeeCost * 12)) * 100
    const paybackMonths = totalAIEmployeeCost / netMonthlySavings

    setResults({
      constructionSavings: Math.round(totalMonthlySavings),
      revenueIncrease: Math.round(onTimeBonus + marginImprovement + changeOrderRevenue),
      netMonthlySavings: Math.round(netMonthlySavings),
      annualROI: Math.round(Math.max(0, annualROI)),
      paybackMonths: Math.max(0.1, paybackMonths),
      timeRecovered: Math.round(adminHoursWeekly * 0.75), // 75% admin time reduction
      aiEmployeeCost: Math.round(totalAIEmployeeCost)
    })
  }

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    calculateConstructionSavings()
  }, [formData])

  const getConstructionDiscountText = () => {
    if (formData.constructionSites >= 7) return "25% Construction Empire Discount"
    if (formData.constructionSites >= 4) return "15% Multi-Site Discount" 
    if (formData.constructionSites >= 2) return "10% Contractor Portfolio Discount"
    return "Standard Construction Pricing"
  }

  return (
    <section id="construction-roi-calculator" className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Calculate Your <span className="bg-gradient-to-r from-orange-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">Construction Savings</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            See exactly how much your construction business will save and earn with AI employees. 
            Real construction metrics, real project improvements, real empire growth potential.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Construction Input Form */}
            <div className="space-y-8">
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
                  <span className="text-2xl">🏗️</span>
                  Tell us about your construction business
                </h3>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Number of Active Job Sites
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={formData.constructionSites}
                      onChange={(e) => handleInputChange('constructionSites', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>1 Site</span>
                      <span className="text-orange-400 font-bold text-lg">{formData.constructionSites} Sites</span>
                      <span>20+ Empire</span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="inline-block px-4 py-2 bg-orange-600/20 text-orange-400 rounded-full text-sm font-semibold">
                        {getConstructionDiscountText()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Total Crew Size (All Sites)
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="200"
                      value={formData.crewSize}
                      onChange={(e) => handleInputChange('crewSize', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>5</span>
                      <span className="text-yellow-400 font-bold text-lg">{formData.crewSize} Crew</span>
                      <span>200+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Average Project Value ($)
                    </label>
                    <input
                      type="range"
                      min="50000"
                      max="5000000"
                      step="50000"
                      value={formData.avgProjectValue}
                      onChange={(e) => handleInputChange('avgProjectValue', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>$50K</span>
                      <span className="text-amber-400 font-bold text-lg">${(formData.avgProjectValue / 1000).toFixed(0)}K</span>
                      <span>$5M+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Projects Per Year
                    </label>
                    <input
                      type="range"
                      min="4"
                      max="100"
                      value={formData.projectsPerYear}
                      onChange={(e) => handleInputChange('projectsPerYear', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>4</span>
                      <span className="text-green-400 font-bold text-lg">{formData.projectsPerYear} projects</span>
                      <span>100+</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-4 text-lg">
                      Weekly Admin Hours (All Sites)
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
                      Current Software Costs Per Site/Month ($)
                    </label>
                    <input
                      type="range"
                      min="300"
                      max="5000"
                      step="100"
                      value={formData.currentSoftwareCosts}
                      onChange={(e) => handleInputChange('currentSoftwareCosts', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>$300</span>
                      <span className="text-pink-400 font-bold text-lg">${formData.currentSoftwareCosts}/site</span>
                      <span>$5K+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Construction Results */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-orange-600/10 via-yellow-600/10 to-amber-600/10 backdrop-blur-sm p-8 rounded-3xl border border-orange-500/20">
                <h3 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
                  <span className="text-2xl">💰</span>
                  Your Construction Empire Savings
                </h3>
                
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">💰 Total Construction Savings</span>
                      <span className="text-3xl font-bold text-green-400">${results.constructionSavings.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm">Per month across all job sites</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">📈 Revenue Increase</span>
                      <span className="text-3xl font-bold text-orange-400">${results.revenueIncrease.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm">From on-time bonuses and margins</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">⏰ Time Recovered</span>
                      <span className="text-3xl font-bold text-yellow-400">{results.timeRecovered}h</span>
                    </div>
                    <p className="text-gray-300 text-sm">Hours per week for project growth</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">🏗️ Net Construction Profit</span>
                      <span className="text-3xl font-bold text-amber-400">${results.netMonthlySavings.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm">Monthly profit after AI costs</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg">🚀 Annual ROI</span>
                      <span className="text-3xl font-bold text-red-400">{results.annualROI}%</span>
                    </div>
                    <p className="text-gray-300 text-sm">Payback in {results.paybackMonths.toFixed(1)} months</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-600/20 via-yellow-600/20 to-amber-600/20 backdrop-blur-sm p-8 rounded-3xl border border-orange-500/30">
                <h4 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
                  <span>🏗️</span> Your Construction AI Investment
                </h4>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    ${results.aiEmployeeCost.toLocaleString()}<span className="text-lg text-gray-300">/month</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    {formData.crewSize} crew × {formData.constructionSites} sites
                  </p>
                  <div className="inline-block px-4 py-2 bg-green-600/20 text-green-400 rounded-full text-sm font-semibold">
                    {getConstructionDiscountText()} Applied!
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button className="w-full py-4 bg-gradient-to-r from-orange-600 via-yellow-600 to-amber-600 hover:from-orange-500 hover:via-yellow-500 hover:to-amber-500 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-lg">
                    Start Construction Empire - Free Trial
                  </button>
                  <button className="w-full py-3 border-2 border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-xl font-semibold transition-all duration-300">
                    Schedule Construction Demo
                  </button>
                </div>
                
                <div className="mt-6 text-center text-sm text-gray-400">
                  ✅ 30-day contractor trial • ✅ No credit card • ✅ Construction expert setup
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Construction Trust Section */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 rounded-3xl bg-gray-800/30 backdrop-blur-sm border border-gray-700 max-w-4xl">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <span>🏗️</span> Join 612+ Construction Empire Builders
            </h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">$4.7M+</div>
                <div className="text-gray-400 text-sm">Construction Savings Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">89%</div>
                <div className="text-gray-400 text-sm">On-Time Completion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">41 days</div>
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
          background: linear-gradient(135deg, #ea580c, #eab308, #f59e0b);
          cursor: pointer;
          box-shadow: 0 0 15px rgba(234, 88, 12, 0.6);
          border: 2px solid white;
        }

        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ea580c, #eab308, #f59e0b);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 15px rgba(234, 88, 12, 0.6);
        }
      `}</style>
    </section>
  )
}