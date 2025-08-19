'use client'

/**
 * Partner Portal - Partner Support
 */

import React from 'react'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-8 backdrop-blur-xl">
          <h1 className="mb-6 text-4xl font-bold text-white">🧠 Partner Support</h1>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Partner portal content for support section */}
            <div className="rounded-lg bg-purple-500/20 p-6">
              <h3 className="mb-4 text-xl font-semibold text-white">Consciousness Tools</h3>
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
