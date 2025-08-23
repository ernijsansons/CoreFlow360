'use client'

import { useState } from 'react'

export default function Hero() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-black via-gray-950 to-violet-950 overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="text-center max-w-5xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="text-white">Build Your</span>{' '}
            <span className="bg-gradient-to-r from-violet-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              Business Empire
            </span>{' '}
            <span className="text-white">With Intelligence That</span>{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Grows With You
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            The world's first <span className="text-violet-400 font-semibold">Autonomous Business Operating System</span> that transforms your business into an intelligent, self-improving organization. Stop managing - start evolving.
          </p>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-4 text-violet-400">∞</div>
              <h3 className="text-lg font-semibold text-white mb-2">Intelligence Multiplication</h3>
              <p className="text-gray-400">Modules work together exponentially: 1×2×3×4×5^∞</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4 text-cyan-400">⚡</div>
              <h3 className="text-lg font-semibold text-white mb-2">Autonomous Operations</h3>
              <p className="text-gray-400">Self-improving processes that exceed human limitations</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4 text-blue-400">🧠</div>
              <h3 className="text-lg font-semibold text-white mb-2">Business Consciousness</h3>
              <p className="text-gray-400">Your business becomes aware, adaptive, and intelligent</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/25"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="relative z-10">Start Your Evolution</span>
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-violet-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
            </button>
            
            <button className="group px-8 py-4 border-2 border-gray-600 hover:border-violet-400 text-white text-lg font-semibold rounded-xl transition-all duration-300 hover:bg-violet-400/10">
              Watch Demo
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-16 text-center">
            <p className="text-gray-400 mb-6">Trusted by businesses transforming their operations</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-2xl font-bold text-white">1000+</div>
              <div className="text-gray-500">|</div>
              <div className="text-white">Autonomous Businesses</div>
              <div className="text-gray-500">|</div>
              <div className="text-2xl font-bold text-white">5x</div>
              <div className="text-white">Avg ROI Increase</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-violet-400 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  )
}