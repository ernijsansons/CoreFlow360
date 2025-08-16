'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Clock, TrendingUp, Calculator, Zap, Target } from 'lucide-react'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

export function InteractiveROICalculator() {
  const { trackEvent } = useTrackEvent()
  const [employees, setEmployees] = useState([25])
  const [currentSoftwareCost, setCurrentSoftwareCost] = useState([2500])
  const [hoursLostPerWeek, setHoursLostPerWeek] = useState([15])
  const [animatedResults, setAnimatedResults] = useState({
    timeSavings: 0,
    softwareSavings: 0,
    productivityGains: 0,
    totalSavings: 0,
    coreflowCost: 0,
    netSavings: 0,
    roi: 0
  })

  // Calculate results
  const calculateResults = () => {
    const emp = employees[0]
    const currentCost = currentSoftwareCost[0]
    const hoursLost = hoursLostPerWeek[0]

    // Calculations
    const timeSavingsAnnual = hoursLost * 52 * 75 // $75/hour value
    const softwareSavingsAnnual = currentCost * 12 * 0.6 // 60% reduction
    const productivityGainsAnnual = emp * 3500 // $3500 per employee annually
    const totalSavings = timeSavingsAnnual + softwareSavingsAnnual + productivityGainsAnnual
    
    // CoreFlow360 cost (average $85/user/month)
    const coreflowAnnualCost = emp * 85 * 12
    
    const netSavings = totalSavings - coreflowAnnualCost
    const roi = ((netSavings / coreflowAnnualCost) * 100)

    return {
      timeSavings: timeSavingsAnnual,
      softwareSavings: softwareSavingsAnnual,
      productivityGains: productivityGainsAnnual,
      totalSavings,
      coreflowCost: coreflowAnnualCost,
      netSavings: Math.max(0, netSavings),
      roi: Math.max(0, roi)
    }
  }

  // Animate numbers
  useEffect(() => {
    const results = calculateResults()
    const duration = 1000 // 1 second
    const steps = 60
    const increment = duration / steps

    let step = 0
    const interval = setInterval(() => {
      if (step >= steps) {
        clearInterval(interval)
        setAnimatedResults(results)
        return
      }

      const progress = step / steps
      setAnimatedResults({
        timeSavings: Math.round(results.timeSavings * progress),
        softwareSavings: Math.round(results.softwareSavings * progress),
        productivityGains: Math.round(results.productivityGains * progress),
        totalSavings: Math.round(results.totalSavings * progress),
        coreflowCost: Math.round(results.coreflowCost * progress),
        netSavings: Math.round(results.netSavings * progress),
        roi: Math.round(results.roi * progress)
      })

      step++
    }, increment)

    return () => clearInterval(interval)
  }, [employees, currentSoftwareCost, hoursLostPerWeek])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-500/50 px-6 py-3 rounded-full mb-6">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300 font-semibold">Interactive ROI Calculator</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Calculate Your <span className="text-emerald-400">Exact Savings</span>
            <br />With CoreFlow360
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            See your potential ROI in real-time. Adjust the sliders below to match your business 
            and discover how much you could save with intelligent automation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Controls */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-violet-400" />
                  Your Business Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Employees */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-gray-300 font-medium">Number of Employees</label>
                    <span className="text-2xl font-bold text-violet-400">{employees[0]}</span>
                  </div>
                  <Slider
                    value={employees}
                    onValueChange={setEmployees}
                    max={500}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>1</span>
                    <span>500+</span>
                  </div>
                </div>

                {/* Current Software Cost */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-gray-300 font-medium">Current Software Costs/Month</label>
                    <span className="text-2xl font-bold text-cyan-400">
                      {formatCurrency(currentSoftwareCost[0])}
                    </span>
                  </div>
                  <Slider
                    value={currentSoftwareCost}
                    onValueChange={setCurrentSoftwareCost}
                    max={25000}
                    min={500}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>$500</span>
                    <span>$25,000+</span>
                  </div>
                </div>

                {/* Hours Lost Per Week */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-gray-300 font-medium">Hours Lost to Manual Tasks/Week</label>
                    <span className="text-2xl font-bold text-orange-400">{hoursLostPerWeek[0]}h</span>
                  </div>
                  <Slider
                    value={hoursLostPerWeek}
                    onValueChange={setHoursLostPerWeek}
                    max={80}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>1h</span>
                    <span>80h+</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {/* ROI Highlight */}
            <Card className="bg-gradient-to-br from-emerald-900/50 to-green-900/50 border-emerald-500/50">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">Your Annual ROI</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl md:text-7xl font-black text-emerald-400 mb-4">
                  {animatedResults.roi.toLocaleString()}%
                </div>
                <div className="text-emerald-300 text-lg">
                  Return on Investment
                </div>
              </CardContent>
            </Card>

            {/* Savings Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-cyan-900/30 border-cyan-500/50">
                <CardContent className="p-4 text-center">
                  <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-cyan-400">
                    {formatCurrency(animatedResults.timeSavings)}
                  </div>
                  <div className="text-cyan-300 text-sm">Time Savings</div>
                </CardContent>
              </Card>

              <Card className="bg-violet-900/30 border-violet-500/50">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-violet-400">
                    {formatCurrency(animatedResults.softwareSavings)}
                  </div>
                  <div className="text-violet-300 text-sm">Software Savings</div>
                </CardContent>
              </Card>

              <Card className="bg-orange-900/30 border-orange-500/50">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-400">
                    {formatCurrency(animatedResults.productivityGains)}
                  </div>
                  <div className="text-orange-300 text-sm">Productivity Gains</div>
                </CardContent>
              </Card>

              <Card className="bg-emerald-900/30 border-emerald-500/50">
                <CardContent className="p-4 text-center">
                  <Zap className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(animatedResults.netSavings)}
                  </div>
                  <div className="text-emerald-300 text-sm">Net Annual Savings</div>
                </CardContent>
              </Card>
            </div>

            {/* Cost Comparison */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-300">Total Annual Savings</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(animatedResults.totalSavings)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-300">CoreFlow360 Annual Cost</span>
                  <span className="text-xl font-semibold text-gray-400">
                    -{formatCurrency(animatedResults.coreflowCost)}
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold text-lg">Net Profit</span>
                    <span className="text-3xl font-bold text-emerald-400">
                      {formatCurrency(animatedResults.netSavings)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <button 
              className="w-full bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              onClick={() => trackEvent('roi_calculator_cta_clicked', {
                employees: employees[0],
                currentCost: currentSoftwareCost[0],
                hoursLost: hoursLostPerWeek[0],
                roi: animatedResults.roi
              })}
            >
              Lock In These Savings - Start Free Trial
            </button>
          </motion.div>
        </div>

        {/* Bottom Disclaimer */}
        <motion.div
          className="mt-16 text-center text-xs text-gray-500 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          *Calculations are estimates based on industry averages and customer data. 
          Actual results may vary depending on business model, implementation, and market conditions. 
          ROI projections are examples and not guarantees of future performance. 
          Consult with our team for personalized analysis.
        </motion.div>
      </div>
    </section>
  )
}