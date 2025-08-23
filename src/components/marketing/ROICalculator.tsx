'use client'

import { useState } from 'react'

export default function ROICalculator() {
  const [formData, setFormData] = useState({
    employees: 10,
    monthlyRevenue: 50000,
    hoursSpentOnAdmin: 20,
    currentSoftwareCosts: 500
  })

  const [results, setResults] = useState({
    timeSaved: 0,
    costSavings: 0,
    revenueIncrease: 0,
    netROI: 0,
    paybackPeriod: 0
  })

  const calculateROI = () => {
    const { employees, monthlyRevenue, hoursSpentOnAdmin, currentSoftwareCosts } = formData
    
    // CoreFlow360 pricing (using mid-tier)
    const coreflowCost = employees * 35 // $35/user/month average
    
    // Time savings calculations
    const timeSavedHours = hoursSpentOnAdmin * 0.7 // 70% time reduction
    const timeSavedValue = timeSavedHours * 50 // $50/hour average value
    
    // Revenue increase from efficiency
    const revenueIncrease = monthlyRevenue * 0.15 // 15% efficiency boost
    
    // Cost savings from replacing multiple tools
    const toolConsolidationSavings = currentSoftwareCosts * 0.4 // 40% reduction
    
    // Total monthly savings
    const totalMonthlySavings = timeSavedValue + revenueIncrease + toolConsolidationSavings
    const netMonthlySavings = totalMonthlySavings - coreflowCost
    
    // ROI calculations
    const netROI = ((netMonthlySavings * 12) / (coreflowCost * 12)) * 100
    const paybackPeriod = coreflowCost / netMonthlySavings

    setResults({
      timeSaved: Math.round(timeSavedHours),
      costSavings: Math.round(totalMonthlySavings),
      revenueIncrease: Math.round(revenueIncrease),
      netROI: Math.round(netROI),
      paybackPeriod: Math.max(0.1, paybackPeriod)
    })
  }

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Auto-calculate on input change
    setTimeout(calculateROI, 100)
  }

  // Initial calculation
  useState(() => {
    calculateROI()
  })

  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Calculate Your <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">ROI</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See how much time, money, and efficiency you'll gain with autonomous business intelligence
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Input Form */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-8">Tell us about your business</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Number of Employees
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="500"
                    value={formData.employees}
                    onChange={(e) => handleInputChange('employees', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>1</span>
                    <span className="text-violet-400 font-bold">{formData.employees}</span>
                    <span>500+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-3">
                    Monthly Revenue ($)
                  </label>
                  <input
                    type="range"
                    min="5000"
                    max="1000000"
                    step="5000"
                    value={formData.monthlyRevenue}
                    onChange={(e) => handleInputChange('monthlyRevenue', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>$5K</span>
                    <span className="text-violet-400 font-bold">${formData.monthlyRevenue.toLocaleString()}</span>
                    <span>$1M+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-3">
                    Hours/Week on Admin Tasks
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={formData.hoursSpentOnAdmin}
                    onChange={(e) => handleInputChange('hoursSpentOnAdmin', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>1h</span>
                    <span className="text-violet-400 font-bold">{formData.hoursSpentOnAdmin}h</span>
                    <span>60h+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-3">
                    Current Software Costs/Month ($)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={formData.currentSoftwareCosts}
                    onChange={(e) => handleInputChange('currentSoftwareCosts', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>$0</span>
                    <span className="text-violet-400 font-bold">${formData.currentSoftwareCosts}</span>
                    <span>$5K+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:pl-8">
              <h3 className="text-2xl font-bold text-white mb-8">Your ROI Projection</h3>
              
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Time Saved Per Week</span>
                    <span className="text-2xl font-bold text-green-400">{results.timeSaved}h</span>
                  </div>
                  <p className="text-gray-300 text-sm">70% reduction in administrative overhead</p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Monthly Cost Savings</span>
                    <span className="text-2xl font-bold text-blue-400">${results.costSavings.toLocaleString()}</span>
                  </div>
                  <p className="text-gray-300 text-sm">From efficiency gains and tool consolidation</p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Revenue Increase</span>
                    <span className="text-2xl font-bold text-violet-400">${results.revenueIncrease.toLocaleString()}</span>
                  </div>
                  <p className="text-gray-300 text-sm">15% boost from operational efficiency</p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Annual ROI</span>
                    <span className="text-2xl font-bold text-yellow-400">{results.netROI}%</span>
                  </div>
                  <p className="text-gray-300 text-sm">Payback in {results.paybackPeriod.toFixed(1)} months</p>
                </div>
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/30">
                <h4 className="text-xl font-bold text-white mb-4">Your Intelligence Investment</h4>
                <div className="text-3xl font-bold text-white mb-2">
                  ${(formData.employees * 35).toLocaleString()}<span className="text-lg text-gray-300">/month</span>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Estimated cost for {formData.employees} users on Synaptic plan
                </p>
                <button className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all duration-300">
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(to right, #8b5cf6, #06b6d4);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(to right, #8b5cf6, #06b6d4);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </section>
  )
}