'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function V0HVACHero() {
  const [hvacBusinessCount, setHvacBusinessCount] = useState(847)
  const [avgGrowth, setAvgGrowth] = useState(52)

  useEffect(() => {
    const interval = setInterval(() => {
      setHvacBusinessCount(prev => prev + Math.floor(Math.random() * 2))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* HVAC-specific Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(234,88,12,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(220,38,127,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-6xl mx-auto">
          
          {/* Industry Badge */}
          <div className="inline-block p-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl mb-8">
            <div className="bg-black px-8 py-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔧</span>
                <span className="text-lg font-semibold text-white">HVAC Empire Builder</span>
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            <span className="text-white">Build Your</span>{' '}
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent">
              HVAC Empire
            </span>{' '}
            <br className="hidden md:block" />
            <span className="text-white">With AI Employees That</span>{' '}
            <span className="bg-gradient-to-r from-red-400 to-pink-600 bg-clip-text text-transparent">
              Never Sleep
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Stop losing money to scheduling chaos and paperwork nightmares. 
            <strong className="text-white"> Scale your HVAC business</strong> with 
            AI employees that handle calls, scheduling, estimates, and follow-ups 
            <strong className="text-orange-400"> 24/7 across multiple locations</strong>.
          </p>

          {/* HVAC-Specific Stats */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400">{hvacBusinessCount.toLocaleString()}</div>
              <div className="text-gray-400">HVAC Businesses Automated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-400">{avgGrowth}%</div>
              <div className="text-gray-400">Average Revenue Growth</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-400">25+ hrs</div>
              <div className="text-gray-400">Saved Per Week</div>
            </div>
          </div>

          {/* HVAC Benefits */}
          <div className="mb-12">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                <div className="text-orange-400 text-2xl mb-2">📱</div>
                <h3 className="text-white font-semibold mb-2">Smart Dispatch</h3>
                <p className="text-gray-400 text-sm">AI routing saves 3+ hours daily, prevents double bookings, sends automated customer updates</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                <div className="text-red-400 text-2xl mb-2">💰</div>
                <h3 className="text-white font-semibold mb-2">Instant Estimates</h3>
                <p className="text-gray-400 text-sm">AI generates accurate quotes from photos, increases close rate by 40%, eliminates callbacks</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                <div className="text-pink-400 text-2xl mb-2">🏢</div>
                <h3 className="text-white font-semibold mb-2">Multi-Location Control</h3>
                <p className="text-gray-400 text-sm">Manage unlimited HVAC locations from one dashboard with progressive empire discounts</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/auth/signup"
                className="group relative px-8 py-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-500 hover:via-red-500 hover:to-pink-500 text-white text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <span className="relative z-10">Start HVAC Empire Trial</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </Link>
              
              <Link 
                href="#hvac-roi-calculator"
                className="group px-8 py-4 border-2 border-orange-500 hover:border-orange-400 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:bg-orange-500/10"
              >
                Calculate HVAC Savings
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>

            {/* HVAC Trust Indicators */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>HVAC-specific setup</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>30-day HVAC guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>HVAC expert support</span>
              </div>
            </div>
          </div>

          {/* Live HVAC Activity Ticker */}
          <div className="mt-16 p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 max-w-4xl mx-auto">
            <div className="text-green-400 text-sm font-medium mb-2 flex items-center justify-center">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
              Live HVAC Empire Activity
            </div>
            <div className="text-gray-300 text-sm">
              <span className="text-orange-400">Phoenix HVAC Empire</span> just automated 5 locations • 
              <span className="text-red-400 ml-2">CoolAir Systems</span> generated $23K in estimates • 
              <span className="text-pink-400 ml-2">Elite HVAC Group</span> eliminated scheduling chaos
            </div>
          </div>
        </div>
      </div>

      {/* HVAC Floating Elements */}
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-xl animate-pulse hidden lg:block" />
      <div className="absolute top-32 right-10 w-24 h-24 bg-red-500/10 rounded-full blur-xl animate-pulse delay-1000 hidden lg:block" />
    </section>
  )
}