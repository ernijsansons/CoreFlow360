/**
 * V0.dev Generated Hero Section
 * Beautiful landing page hero component
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Zap, Shield, Brain } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-gray-700 shadow-lg">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>AI-Powered Business Operating System</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Turn Your Business Into
            <br />
            An Intelligent Empire
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            The world's first Autonomous Business Operating System that doesn't just manage your business — 
            it evolves it into a self-improving, intelligent organization.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8">
            <div className="flex items-center gap-2 text-gray-700">
              <Brain className="w-5 h-5 text-blue-500" />
              <span>AI-First Design</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>247% Revenue Increase</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Shield className="w-5 h-5 text-green-500" />
              <span>Enterprise Security</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            
            <Link href="/demo">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 border border-gray-200"
              >
                Watch Demo
              </motion.button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-12 text-gray-500 text-sm">
            <p>Trusted by 10,000+ businesses worldwide</p>
            <div className="flex justify-center gap-8 mt-4 opacity-50">
              {/* Add company logos here */}
              <div className="w-24 h-8 bg-gray-300 rounded" />
              <div className="w-24 h-8 bg-gray-300 rounded" />
              <div className="w-24 h-8 bg-gray-300 rounded" />
              <div className="w-24 h-8 bg-gray-300 rounded" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection