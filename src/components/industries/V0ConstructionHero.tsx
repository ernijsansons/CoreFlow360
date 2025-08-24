'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function V0ConstructionHero() {
  const [constructionFirmsCount, setConstructionFirmsCount] = useState(612)
  const [avgEfficiency, setAvgEfficiency] = useState(89)

  useEffect(() => {
    const interval = setInterval(() => {
      setConstructionFirmsCount(prev => prev + Math.floor(Math.random() * 3))
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Construction-specific Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(251,146,60,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(245,158,11,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-6xl mx-auto">
          
          {/* Industry Badge */}
          <div className="inline-block p-1 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-2xl mb-8">
            <div className="bg-black px-8 py-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏗️</span>
                <span className="text-lg font-semibold text-white">Construction Empire Builder</span>
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            <span className="text-white">Build Your</span>{' '}
            <span className="bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-600 bg-clip-text text-transparent">
              Construction Empire
            </span>{' '}
            <br className="hidden md:block" />
            <span className="text-white">With AI That</span>{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
              Never Stops Building
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Stop losing money to project delays and cost overruns. 
            <strong className="text-white"> Scale your construction empire</strong> with 
            AI employees that handle project management, crew coordination, safety compliance, and client updates 
            <strong className="text-orange-400"> 24/7 across unlimited job sites</strong>.
          </p>

          {/* Construction-Specific Stats */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400">{constructionFirmsCount.toLocaleString()}</div>
              <div className="text-gray-400">Construction Firms Automated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400">{avgEfficiency}%</div>
              <div className="text-gray-400">On-Time Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-400">35+ hrs</div>
              <div className="text-gray-400">Saved Per Week</div>
            </div>
          </div>

          {/* Construction Benefits */}
          <div className="mb-12">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                <div className="text-orange-400 text-2xl mb-2">📊</div>
                <h3 className="text-white font-semibold mb-2">Project Coordination</h3>
                <p className="text-gray-400 text-sm">AI coordinates crews, equipment, and materials across all sites. 91% fewer delays, zero double-booking.</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                <div className="text-yellow-400 text-2xl mb-2">💰</div>
                <h3 className="text-white font-semibold mb-2">Cost Control</h3>
                <p className="text-gray-400 text-sm">Real-time budget tracking, instant change orders, automated bids. 22% higher profit margins guaranteed.</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                <div className="text-amber-400 text-2xl mb-2">🏢</div>
                <h3 className="text-white font-semibold mb-2">Multi-Site Management</h3>
                <p className="text-gray-400 text-sm">Manage unlimited construction sites from one dashboard with progressive empire discounts</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/auth/signup"
                className="group relative px-8 py-4 bg-gradient-to-r from-orange-600 via-yellow-600 to-amber-600 hover:from-orange-500 hover:via-yellow-500 hover:to-amber-500 text-white text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <span className="relative z-10">Start Construction Empire Trial</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-400 via-yellow-400 to-amber-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </Link>
              
              <Link 
                href="#construction-roi-calculator"
                className="group px-8 py-4 border-2 border-orange-500 hover:border-orange-400 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:bg-orange-500/10"
              >
                Calculate Construction Savings
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>

            {/* Construction Trust Indicators */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Construction-specific setup</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>30-day contractor guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Construction expert support</span>
              </div>
            </div>
          </div>

          {/* Live Construction Activity Ticker */}
          <div className="mt-16 p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 max-w-4xl mx-auto">
            <div className="text-green-400 text-sm font-medium mb-2 flex items-center justify-center">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
              Live Construction Empire Activity
            </div>
            <div className="text-gray-300 text-sm">
              <span className="text-orange-400">BuildRight Group</span> just automated 7 job sites • 
              <span className="text-yellow-400 ml-2">Premier Construction</span> saved $142K in project costs • 
              <span className="text-amber-400 ml-2">Metro Builders</span> completed projects 35% faster
            </div>
          </div>
        </div>
      </div>

      {/* Construction Floating Elements */}
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-xl animate-pulse hidden lg:block" />
      <div className="absolute top-32 right-10 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl animate-pulse delay-1000 hidden lg:block" />
    </section>
  )
}