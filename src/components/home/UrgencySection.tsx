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
    seconds: 23,
  })
  const [spotsRemaining, setSpotsRemaining] = useState(47)
  const [recentSignups, setRecentSignups] = useState([
    { name: 'TechFlow Solutions', industry: 'Technology', timeAgo: '2 minutes ago' },
    { name: 'Premier HVAC', industry: 'HVAC', timeAgo: '5 minutes ago' },
    { name: 'BuildCorp', industry: 'Construction', timeAgo: '8 minutes ago' },
  ])

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
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
        setSpotsRemaining((prev) => prev - 1)
      }
    }, 30000) // Reduce every 30 seconds occasionally

    return () => clearInterval(interval)
  }, [spotsRemaining])

  // Simulate new signups
  useEffect(() => {
    const companies = [
      { name: 'DataFlow Systems', industry: 'Technology' },
      { name: 'Elite HVAC', industry: 'HVAC' },
      { name: 'LegalPro Partners', industry: 'Legal' },
      { name: 'Manufacturing Plus', industry: 'Manufacturing' },
      { name: 'ServiceTech', industry: 'Professional Services' },
      { name: 'ConstructCorp', industry: 'Construction' },
    ]

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newCompany = companies[Math.floor(Math.random() * companies.length)]
        setRecentSignups((prev) => [
          { ...newCompany, timeAgo: 'Just now' },
          ...prev.slice(0, 2).map((signup) => ({
            ...signup,
            timeAgo:
              signup.timeAgo === 'Just now'
                ? '2 minutes ago'
                : signup.timeAgo === '2 minutes ago'
                  ? '5 minutes ago'
                  : '8 minutes ago',
          })),
        ])
      }
    }, 45000) // New signup every 45 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="border-y border-red-500/20 bg-gradient-to-r from-red-950/20 to-orange-950/20 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Main Urgency Banner */}
          <motion.div
            className="mb-8 rounded-2xl border border-red-500/50 bg-gradient-to-r from-red-900/40 to-orange-900/40 p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <div className="mb-4 flex items-center justify-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-400" />
                <span className="text-lg font-bold text-red-400">LIMITED TIME OFFER</span>
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>

              <h3 className="mb-4 text-3xl font-black text-white md:text-4xl">
                Early Access Pricing Ends In:
              </h3>

              {/* Countdown Timer */}
              <div className="mb-6 flex justify-center gap-4">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div
                    key={unit}
                    className="min-w-[80px] rounded-xl border border-red-500/50 bg-black/50 p-4"
                  >
                    <div className="text-3xl font-bold text-red-400">
                      {value.toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-red-300 uppercase">{unit}</div>
                  </div>
                ))}
              </div>

              <div className="mb-2 text-xl text-white">
                Save <span className="font-bold text-yellow-400">$6,000/year</span> • Lock in{' '}
                <span className="font-bold text-emerald-400">50% OFF</span> forever
              </div>

              <div className="text-red-300">
                Only <span className="font-bold text-red-400">{spotsRemaining} spots</span>{' '}
                remaining
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Live Activity Feed */}
            <motion.div
              className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-400"></div>
                <span className="font-semibold text-white">Live Activity</span>
              </div>

              <div className="space-y-3">
                {recentSignups.map((signup, index) => (
                  <motion.div
                    key={`${signup.name}-${index}`}
                    className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400">
                        <Users className="h-4 w-4 text-emerald-900" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{signup.name}</div>
                        <div className="text-xs text-emerald-300">{signup.industry}</div>
                      </div>
                    </div>
                    <div className="text-xs text-emerald-400">{signup.timeAgo}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 text-center text-sm text-gray-400">
                <Users className="mr-1 inline h-4 w-4" />
                2,847+ businesses already transformed
              </div>
            </motion.div>

            {/* Urgency Benefits */}
            <motion.div
              className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold text-white">Why Act Now?</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400">
                    <span className="text-sm font-bold text-emerald-900">1</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">Lock In 50% Savings</div>
                    <div className="text-sm text-gray-400">
                      Price increases to full rate after promotion ends
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan-400">
                    <span className="text-sm font-bold text-cyan-900">2</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">Priority Implementation</div>
                    <div className="text-sm text-gray-400">
                      Early access members get expedited setup
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-400">
                    <span className="text-sm font-bold text-violet-900">3</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">Exclusive Features</div>
                    <div className="text-sm text-gray-400">
                      Beta access to new features before general release
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-400">
                    <span className="text-sm font-bold text-orange-900">4</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">Extended Support</div>
                    <div className="text-sm text-gray-400">
                      6 months of premium support included
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Final Urgency CTA */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <button
              className="transform animate-pulse rounded-xl bg-gradient-to-r from-red-600 to-orange-600 px-12 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-red-700 hover:to-orange-700"
              onClick={() =>
                trackEvent('urgency_cta_clicked', {
                  spotsRemaining,
                  timeLeft: `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`,
                })
              }
            >
              <span className="flex items-center justify-center gap-2">
                <Zap className="h-5 w-5" />
                Secure My 50% Discount Now
                <Timer className="h-5 w-5" />
              </span>
            </button>

            <p className="mt-4 text-sm text-gray-400">
              No credit card required • Start immediately • Cancel anytime
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
