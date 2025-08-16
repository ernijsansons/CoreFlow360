'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Timer, Users, TrendingUp, AlertCircle, Zap, Star } from 'lucide-react'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'

export function UrgencySection() {
  const { trackEvent } = useTrackEvent()
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 23,
    minutes: 47,
    seconds: 23
  })
  const [spotsRemaining, setSpotsRemaining] = useState(47)
  const [recentSignups, setRecentSignups] = useState([
    { name: "TechFlow Solutions", industry: "Technology", timeAgo: "2 minutes ago" },
    { name: "Premier HVAC", industry: "HVAC", timeAgo: "5 minutes ago" },
    { name: "BuildCorp", industry: "Construction", timeAgo: "8 minutes ago" }
  ])

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev
        
        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        } else if (days > 0) {
          days--
          hours = 23
          minutes = 59
          seconds = 59
        }
        
        return { days, hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Simulate spot reduction
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85 && spotsRemaining > 5) {
        setSpotsRemaining(prev => prev - 1)
      }
    }, 30000) // Reduce every 30 seconds occasionally

    return () => clearInterval(interval)
  }, [spotsRemaining])

  // Simulate new signups
  useEffect(() => {
    const companies = [
      { name: "DataFlow Systems", industry: "Technology" },
      { name: "Elite HVAC", industry: "HVAC" },
      { name: "LegalPro Partners", industry: "Legal" },
      { name: "Manufacturing Plus", industry: "Manufacturing" },
      { name: "ServiceTech", industry: "Professional Services" },
      { name: "ConstructCorp", industry: "Construction" }
    ]

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newCompany = companies[Math.floor(Math.random() * companies.length)]
        setRecentSignups(prev => [
          { ...newCompany, timeAgo: "Just now" },
          ...prev.slice(0, 2).map(signup => ({
            ...signup,
            timeAgo: signup.timeAgo === "Just now" ? "2 minutes ago" : 
                    signup.timeAgo === "2 minutes ago" ? "5 minutes ago" : "8 minutes ago"
          }))
        ])
      }
    }, 45000) // New signup every 45 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-16 bg-gradient-to-r from-red-950/20 to-orange-950/20 border-y border-red-500/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Main Urgency Banner */}
          <motion.div
            className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/50 rounded-2xl p-8 mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <span className="text-red-400 font-bold text-lg">LIMITED TIME OFFER</span>
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                Early Access Pricing Ends In:
              </h3>
              
              {/* Countdown Timer */}
              <div className="flex justify-center gap-4 mb-6">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className="bg-black/50 border border-red-500/50 rounded-xl p-4 min-w-[80px]">
                    <div className="text-3xl font-bold text-red-400">
                      {value.toString().padStart(2, '0')}
                    </div>
                    <div className="text-red-300 text-sm uppercase">
                      {unit}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-xl text-white mb-2">
                Save <span className="text-yellow-400 font-bold">$6,000/year</span> • 
                Lock in <span className="text-emerald-400 font-bold">50% OFF</span> forever
              </div>
              
              <div className="text-red-300">
                Only <span className="text-red-400 font-bold">{spotsRemaining} spots</span> remaining
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Live Activity Feed */}
            <motion.div
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold">Live Activity</span>
              </div>
              
              <div className="space-y-3">
                {recentSignups.map((signup, index) => (
                  <motion.div
                    key={`${signup.name}-${index}`}
                    className="flex items-center justify-between p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-emerald-900" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{signup.name}</div>
                        <div className="text-emerald-300 text-xs">{signup.industry}</div>
                      </div>
                    </div>
                    <div className="text-emerald-400 text-xs">{signup.timeAgo}</div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-4 text-center text-gray-400 text-sm">
                <Users className="w-4 h-4 inline mr-1" />
                2,847+ businesses already transformed
              </div>
            </motion.div>

            {/* Urgency Benefits */}
            <motion.div
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">Why Act Now?</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-emerald-900 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Lock In 50% Savings</div>
                    <div className="text-gray-400 text-sm">Price increases to full rate after promotion ends</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-cyan-900 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Priority Implementation</div>
                    <div className="text-gray-400 text-sm">Early access members get expedited setup</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-violet-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-violet-900 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Exclusive Features</div>
                    <div className="text-gray-400 text-sm">Beta access to new features before general release</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-900 text-sm font-bold">4</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Extended Support</div>
                    <div className="text-gray-400 text-sm">6 months of premium support included</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Final Urgency CTA */}
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <button 
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg animate-pulse"
              onClick={() => trackEvent('urgency_cta_clicked', {
                spotsRemaining,
                timeLeft: `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`
              })}
            >
              <span className="flex items-center gap-2 justify-center">
                <Zap className="w-5 h-5" />
                Secure My 50% Discount Now
                <Timer className="w-5 h-5" />
              </span>
            </button>
            
            <p className="text-sm text-gray-400 mt-4">
              No credit card required • Start immediately • Cancel anytime
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}