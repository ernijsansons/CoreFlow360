'use client'

import { motion } from 'framer-motion'
import { HardHat, Truck, Calendar, DollarSign, Users, MapPin, CheckCircle, AlertTriangle } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function ConstructionPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-16">
        <section className="bg-gradient-to-b from-yellow-950/20 to-black py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-8 text-5xl font-black md:text-7xl">
              Built for Construction
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Project to Profit
              </span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-300">
              Manage multiple job sites, track equipment, optimize crews, and ensure projects finish on time and under budget.
            </p>
            <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="rounded-xl border border-yellow-500/50 bg-yellow-900/30 p-4">
                <div className="text-3xl font-bold text-yellow-400">312</div>
                <div className="text-yellow-300">Construction Firms</div>
              </div>
              <div className="rounded-xl border border-yellow-500/50 bg-yellow-900/30 p-4">
                <div className="text-3xl font-bold text-yellow-400">22%</div>
                <div className="text-yellow-300">Project Margin Increase</div>
              </div>
              <div className="rounded-xl border border-yellow-500/50 bg-yellow-900/30 p-4">
                <div className="text-3xl font-bold text-yellow-400">35%</div>
                <div className="text-yellow-300">Fewer Delays</div>
              </div>
              <div className="rounded-xl border border-yellow-500/50 bg-yellow-900/30 p-4">
                <div className="text-3xl font-bold text-yellow-400">$2.3M</div>
                <div className="text-yellow-300">Average Savings</div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}