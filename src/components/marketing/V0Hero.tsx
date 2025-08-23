'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function V0Hero() {
  const [businessCount, setBusinessCount] = useState(2847)
  const [satisfactionRate, setSatisfactionRate] = useState(98)

  useEffect(() => {
    // Animate the numbers
    const interval = setInterval(() => {
      setBusinessCount(prev => prev + Math.floor(Math.random() * 3))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(139,92,246,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-6xl mx-auto">
          
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            <span className="text-white">Build Your</span>{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
              Business Empire
            </span>{' '}
            <br className="hidden md:block" />
            <span className="text-white">With Intelligence That</span>{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Grows With You
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            The only platform that scales your <strong className="text-white">multi-location business</strong> with 
            AI employees that get smarter as you grow. Save more, earn more, scale infinitely.
          </p>

          {/* Key Stats */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">{businessCount.toLocaleString()}</div>
              <div className="text-gray-400">Businesses Transformed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400">{satisfactionRate}%</div>
              <div className="text-gray-400">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-400">5x</div>
              <div className="text-gray-400">Average ROI Increase</div>
            </div>
          </div>

          {/* Multi-Business Advantage */}
          <div className="mb-12">
            <div className="inline-block p-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
              <div className="bg-black px-6 py-3 rounded-2xl">
                <span className="text-lg font-semibold text-white">Multi-Business Portfolio Management</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                <div className="text-blue-400 text-2xl mb-2">🏢</div>
                <h3 className="text-white font-semibold mb-2">Portfolio Dashboard</h3>
                <p className="text-gray-400 text-sm">Manage unlimited businesses from one intelligent command center</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                <div className="text-purple-400 text-2xl mb-2">📊</div>
                <h3 className="text-white font-semibold mb-2">Progressive Savings</h3>
                <p className="text-gray-400 text-sm">The more businesses you add, the more you save per location</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                <div className="text-pink-400 text-2xl mb-2">🤖</div>
                <h3 className="text-white font-semibold mb-2">AI Employee Scaling</h3>
                <p className="text-gray-400 text-sm">AI employees learn from all your businesses and get exponentially smarter</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/auth/signup"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <span className="relative z-10">Start Free Trial</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </Link>
              
              <Link 
                href="#roi-calculator"
                className="group px-8 py-4 border-2 border-purple-500 hover:border-purple-400 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:bg-purple-500/10"
              >
                Calculate Your Empire Savings
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free 30-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>AI Launch Concierge included</span>
              </div>
            </div>
          </div>

          {/* Live Activity Ticker */}
          <div className="mt-16 p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 max-w-4xl mx-auto">
            <div className="text-green-400 text-sm font-medium mb-2 flex items-center justify-center">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
              Live Business Activity
            </div>
            <div className="text-gray-300 text-sm">
              <span className="text-blue-400">Phoenix HVAC</span> just automated their scheduling system • 
              <span className="text-purple-400 ml-2">Metro Dental</span> generated $15K in new leads • 
              <span className="text-pink-400 ml-2">TechFlow Solutions</span> optimized 3 locations
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse hidden lg:block" />
      <div className="absolute top-32 right-10 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000 hidden lg:block" />
    </section>
  )
}