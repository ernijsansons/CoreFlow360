'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-white text-xl font-bold">CoreFlow360</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#industries" className="text-gray-300 hover:text-white transition-colors">
              Industries
            </Link>
            <Link href="#testimonials" className="text-gray-300 hover:text-white transition-colors">
              Case Studies
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/auth/signin" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup" 
              className="px-6 py-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
            >
              Free Trial
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
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
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col space-y-4">
              <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="#industries" className="text-gray-300 hover:text-white transition-colors">
                Industries
              </Link>
              <Link href="#testimonials" className="text-gray-300 hover:text-white transition-colors">
                Case Studies
              </Link>
              <div className="pt-4 border-t border-gray-800">
                <Link 
                  href="/auth/signin" 
                  className="block text-gray-300 hover:text-white transition-colors mb-4"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="block w-full text-center px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-lg font-semibold"
                >
                  Free Trial
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}