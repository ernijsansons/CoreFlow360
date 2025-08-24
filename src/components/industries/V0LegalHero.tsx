'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function V0LegalHero() {
  const [legalFirmsCount, setLegalFirmsCount] = useState(423)
  const [avgCaseLoad, setAvgCaseLoad] = useState(67)

  useEffect(() => {
    const interval = setInterval(() => {
      setLegalFirmsCount(prev => prev + Math.floor(Math.random() * 2))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Legal-specific Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(124,58,237,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-6xl mx-auto">
          
          {/* Industry Badge */}
          <div className="inline-block p-1 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl mb-8">
            <div className="bg-black px-8 py-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚖️</span>
                <span className="text-lg font-semibold text-white">Legal Empire Builder</span>
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            <span className="text-white">Build Your</span>{' '}
            <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Legal Empire
            </span>{' '}
            <br className="hidden md:block" />
            <span className="text-white">With AI That</span>{' '}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
              Never Sleeps
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Stop drowning in paperwork and missed deadlines. 
            <strong className="text-white"> Scale your law firm</strong> with 
            AI employees that handle research, document drafting, client intake, and case management 
            <strong className="text-purple-400"> 24/7 across multiple offices</strong>.
          </p>

          {/* Legal-Specific Stats */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400">{legalFirmsCount.toLocaleString()}</div>
              <div className="text-gray-400">Law Firms Automated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">{avgCaseLoad}%</div>
              <div className="text-gray-400">More Cases Handled</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-400">40+ hrs</div>
              <div className="text-gray-400">Saved Per Week</div>
            </div>
          </div>

          {/* Legal Benefits */}
          <div className="mb-12">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                <div className="text-purple-400 text-2xl mb-2">📚</div>
                <h3 className="text-white font-semibold mb-2">AI Legal Research</h3>
                <p className="text-gray-400 text-sm">AI researches cases, statutes, and precedents in minutes, not hours. 75% faster case prep.</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                <div className="text-blue-400 text-2xl mb-2">📄</div>
                <h3 className="text-white font-semibold mb-2">Document Automation</h3>
                <p className="text-gray-400 text-sm">Generate contracts, pleadings, and briefs instantly. 90% reduction in drafting time.</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                <div className="text-indigo-400 text-2xl mb-2">🏢</div>
                <h3 className="text-white font-semibold mb-2">Multi-Office Management</h3>
                <p className="text-gray-400 text-sm">Manage unlimited law offices from one dashboard with progressive empire discounts</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/auth/signup"
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:via-blue-500 hover:to-indigo-500 text-white text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <span className="relative z-10">Start Legal Empire Trial</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </Link>
              
              <Link 
                href="#legal-roi-calculator"
                className="group px-8 py-4 border-2 border-purple-500 hover:border-purple-400 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:bg-purple-500/10"
              >
                Calculate Legal Savings
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>

            {/* Legal Trust Indicators */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Bar-compliant setup</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>30-day legal guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Legal expert support</span>
              </div>
            </div>
          </div>

          {/* Live Legal Activity Ticker */}
          <div className="mt-16 p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 max-w-4xl mx-auto">
            <div className="text-green-400 text-sm font-medium mb-2 flex items-center justify-center">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
              Live Legal Empire Activity
            </div>
            <div className="text-gray-300 text-sm">
              <span className="text-purple-400">Metro Legal Network</span> just automated case research • 
              <span className="text-blue-400 ml-2">Elite Law Group</span> drafted 47 contracts automatically • 
              <span className="text-indigo-400 ml-2">Justice Partners</span> expanded to 4 offices
            </div>
          </div>
        </div>
      </div>

      {/* Legal Floating Elements */}
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse hidden lg:block" />
      <div className="absolute top-32 right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-1000 hidden lg:block" />
    </section>
  )
}