'use client'

/**
 * Partner Portal - Training Center
 */

import React from 'react'

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h1 className="text-4xl font-bold text-white mb-6">
            🧠 Training Center
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Partner portal content for training section */}
            <div className="bg-purple-500/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Consciousness Tools
              </h3>
              <p className="text-gray-300">
                Access advanced consciousness transformation resources
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}