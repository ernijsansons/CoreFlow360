'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function V0Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <div>
              <span className="text-white text-xl font-bold">CoreFlow360</span>
              <div className="text-xs text-gray-400 -mt-1">AI Business Empire</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link 
              href="#portfolio-management" 
              className="text-gray-300 hover:text-white transition-colors relative group"
            >
              Portfolio Management
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            <div className="relative group">
              <button className="text-gray-300 hover:text-white transition-colors flex items-center">
                Progressive Pricing
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {/* Dropdown would go here */}
            </div>
            
            <Link 
              href="#success-stories" 
              className="text-gray-300 hover:text-white transition-colors relative group"
            >
              Success Stories
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            <div className="relative group">
              <button className="text-gray-300 hover:text-white transition-colors flex items-center">
                Industries
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="p-4 space-y-3">
                  <Link href="#hvac" className="block text-gray-300 hover:text-blue-400 transition-colors">
                    <div className="font-semibold">🔧 HVAC</div>
                    <div className="text-sm text-gray-500">Heating, ventilation & air conditioning</div>
                  </Link>
                  <Link href="#legal" className="block text-gray-300 hover:text-purple-400 transition-colors">
                    <div className="font-semibold">⚖️ Legal Services</div>
                    <div className="text-sm text-gray-500">Law firms and legal practices</div>
                  </Link>
                  <Link href="#construction" className="block text-gray-300 hover:text-orange-400 transition-colors">
                    <div className="font-semibold">🏗️ Construction</div>
                    <div className="text-sm text-gray-500">General contractors and builders</div>
                  </Link>
                  <Link href="#professional" className="block text-gray-300 hover:text-green-400 transition-colors">
                    <div className="font-semibold">💼 Professional Services</div>
                    <div className="text-sm text-gray-500">Consulting and business services</div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link 
              href="/auth/signin" 
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup" 
              className="relative px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg group"
            >
              <span className="relative z-10">Try Free Demo</span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-gray-800">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col space-y-6">
                <Link 
                  href="#portfolio-management" 
                  className="text-gray-300 hover:text-white transition-colors text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Portfolio Management
                </Link>
                
                <div className="space-y-3">
                  <div className="text-gray-400 text-sm font-medium">Progressive Pricing</div>
                  <Link 
                    href="#pricing" 
                    className="text-gray-300 hover:text-white transition-colors ml-4"
                    onClick={() => setIsOpen(false)}
                  >
                    View Pricing Tiers
                  </Link>
                </div>
                
                <Link 
                  href="#success-stories" 
                  className="text-gray-300 hover:text-white transition-colors text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Success Stories
                </Link>
                
                <div className="space-y-3">
                  <div className="text-gray-400 text-sm font-medium">Industries</div>
                  <div className="ml-4 space-y-2">
                    <Link href="#hvac" className="block text-gray-300 hover:text-blue-400 transition-colors">
                      🔧 HVAC
                    </Link>
                    <Link href="#legal" className="block text-gray-300 hover:text-purple-400 transition-colors">
                      ⚖️ Legal Services
                    </Link>
                    <Link href="#construction" className="block text-gray-300 hover:text-orange-400 transition-colors">
                      🏗️ Construction
                    </Link>
                    <Link href="#professional" className="block text-gray-300 hover:text-green-400 transition-colors">
                      💼 Professional Services
                    </Link>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-800 space-y-4">
                  <Link 
                    href="/auth/signin" 
                    className="block text-gray-300 hover:text-white transition-colors text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold"
                    onClick={() => setIsOpen(false)}
                  >
                    Try Free Demo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Indicator for Multi-Business Setup */}
      <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-30 animate-pulse"></div>
      </div>
    </nav>
  )
}