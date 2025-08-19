/**
 * Product Launch Landing Page
 * Professional launch page template with countdown and social proof
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Rocket,
  Calendar,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Twitter,
  Linkedin,
  Share2,
  Bell,
} from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BetaCTA } from '@/components/marketing/BetaCTA'

// Launch date - set to 30 days from now for demo
const LAUNCH_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

interface CountdownProps {
  targetDate: Date
}

function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  return (
    <div className="mx-auto grid max-w-md grid-cols-4 gap-4">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <motion.div
          key={unit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gray-800/50 bg-gray-900/60 p-4 text-center backdrop-blur-sm"
        >
          <div className="gradient-text-ai text-3xl font-bold">
            {value.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-400 capitalize">{unit}</div>
        </motion.div>
      ))}
    </div>
  )
}

export default function LaunchPage() {
  const { trackEvent } = useTrackEvent()
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleNotifyMe = async () => {
    if (!email) return

    trackEvent('launch_notify_signup', {
      email: email,
      source: 'launch_page',
    })

    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true)
    }, 1000)
  }

  const handleShare = (platform: string) => {
    trackEvent('launch_page_shared', { platform })

    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(
      "🚀 CoreFlow360 is launching soon! The world's first AI-orchestrated ERP platform. Join the waitlist!"
    )

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      generic: navigator.share ? null : `mailto:?subject=CoreFlow360 Launch&body=${text} ${url}`,
    }

    if (platform === 'generic' && navigator.share) {
      navigator.share({
        title: 'CoreFlow360 Launch',
        text: "The world's first AI-orchestrated ERP platform is launching soon!",
        url: window.location.href,
      })
    } else if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls]!, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              {/* Launch Badge */}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/50 bg-violet-900/30 px-6 py-3">
                <Rocket className="h-5 w-5 text-violet-400" />
                <span className="font-semibold text-violet-300">Official Launch Coming Soon</span>
              </div>

              <h1 className="heading-hero gradient-text-ai mb-6">
                The Future of Business
                <br />
                Automation is Almost Here
              </h1>

              <p className="text-body-large mx-auto mb-12 max-w-3xl text-gray-300">
                After months of development and successful beta testing with 150+ companies,
                CoreFlow360 is ready to revolutionize how businesses operate. Get ready for
                AI-orchestrated workflows that think, predict, and act autonomously.
              </p>

              {/* Countdown */}
              <div className="mb-12">
                <h2 className="mb-6 text-2xl font-bold text-white">Official Launch In:</h2>
                <Countdown targetDate={LAUNCH_DATE} />
              </div>

              {/* Notify Me Form */}
              {!isSubscribed ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-auto mb-8 max-w-md"
                >
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email for launch updates"
                      className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-400 transition-colors focus:border-violet-500 focus:outline-none"
                    />
                    <button
                      onClick={handleNotifyMe}
                      disabled={!email}
                      className="flex items-center rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-violet-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Notify Me
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mx-auto mb-8 max-w-md rounded-lg border border-green-500/30 bg-green-900/20 p-6"
                >
                  <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-400" />
                  <p className="font-semibold text-green-300">You're on the list!</p>
                  <p className="text-sm text-gray-300">
                    We'll notify you as soon as CoreFlow360 launches.
                  </p>
                </motion.div>
              )}

              {/* Social Share */}
              <div className="mb-12 flex items-center justify-center gap-4">
                <span className="text-sm text-gray-400">Share the excitement:</span>
                <button
                  onClick={() => handleShare('twitter')}
                  className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
                >
                  <Twitter className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="rounded-lg bg-blue-800 p-2 text-white transition-colors hover:bg-blue-900"
                >
                  <Linkedin className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleShare('generic')}
                  className="rounded-lg bg-gray-700 p-2 text-white transition-colors hover:bg-gray-600"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What to Expect */}
        <section className="bg-gray-950 py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="heading-section mb-6 text-white">
                What to Expect at <span className="gradient-text-ai">Launch</span>
              </h2>
              <p className="text-body-large mx-auto max-w-3xl text-gray-400">
                Based on feedback from our 150+ beta companies, we're launching with features that
                deliver immediate value and long-term transformation.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <LaunchFeature
                icon="🎯"
                title="Production-Ready AI"
                description="Fully trained AI agents for CRM, accounting, HR, and project management"
                status="Ready"
              />
              <LaunchFeature
                icon="⚡"
                title="Sub-50ms Response"
                description="Lightning-fast AI responses optimized for real-time business operations"
                status="Optimized"
              />
              <LaunchFeature
                icon="🔗"
                title="8 ERP Integrations"
                description="Pre-built connections to Twenty, Bigcapital, Ever Gauzy, and 5 others"
                status="Integrated"
              />
              <LaunchFeature
                icon="🛡️"
                title="Enterprise Security"
                description="SOC 2 compliance, tenant isolation, and comprehensive audit logging"
                status="Certified"
              />
              <LaunchFeature
                icon="📊"
                title="Advanced Analytics"
                description="Real-time dashboards with predictive insights across all modules"
                status="Enhanced"
              />
              <LaunchFeature
                icon="🚀"
                title="Mobile Apps"
                description="Native iOS and Android apps for on-the-go business management"
                status="Coming Soon"
              />
            </div>
          </div>
        </section>

        {/* Beta Success Stories */}
        <section className="bg-black py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="heading-section mb-6 text-white">
                Proven Results from <span className="gradient-text-ai">Beta Testing</span>
              </h2>
              <p className="text-body-large text-gray-400">
                Real metrics from real companies during our 6-month beta program
              </p>
            </motion.div>

            <div className="mb-16 grid gap-8 md:grid-cols-4">
              <BetaMetric
                value="78%"
                label="Average Efficiency Gain"
                description="Across all beta companies"
              />
              <BetaMetric
                value="156%"
                label="Sales Conversion Increase"
                description="With AI lead scoring"
              />
              <BetaMetric
                value="$2.1M"
                label="Total Savings Generated"
                description="For beta participants"
              />
              <BetaMetric
                value="4.9/5"
                label="Average Rating"
                description="From beta participants"
              />
            </div>

            {/* Quick testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto max-w-3xl rounded-xl border border-gray-800/50 bg-gray-900/60 p-8 text-center"
            >
              <div className="mb-4 flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                ))}
              </div>
              <blockquote className="mb-6 text-xl text-gray-300">
                "CoreFlow360 didn't just improve our processes—it transformed our entire business
                model. The AI orchestration is like having a team of consultants working 24/7."
              </blockquote>
              <div className="text-gray-400">
                <strong className="text-white">Sarah Chen</strong>, Operations Director at TechFlow
                HVAC
              </div>
            </motion.div>
          </div>
        </section>

        {/* Launch Pricing Preview */}
        <section className="bg-gray-950 py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="heading-section mb-6 text-white">
                <span className="gradient-text-ai">Launch Pricing</span>
              </h2>
              <p className="text-body-large text-gray-400">
                Special launch pricing for early adopters
              </p>
            </motion.div>

            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              <PricingCard
                title="Starter"
                price="$12"
                originalPrice="$24"
                features={[
                  '2 modules included',
                  'Basic AI capabilities',
                  'Email support',
                  '5GB storage',
                ]}
                popular={false}
              />
              <PricingCard
                title="Professional"
                price="$42"
                originalPrice="$85"
                features={[
                  '5 modules included',
                  'Advanced AI orchestration',
                  'Priority support',
                  '50GB storage',
                  'Custom workflows',
                ]}
                popular={true}
              />
              <PricingCard
                title="Enterprise"
                price="$75"
                originalPrice="$150"
                features={[
                  'All modules included',
                  'Full AI orchestration',
                  'Dedicated support',
                  'Unlimited storage',
                  'White-label options',
                ]}
                popular={false}
              />
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                ✓ 50% launch discount for first 1000 customers • ✓ 30-day free trial • ✓ No setup
                fees
              </p>
            </div>
          </div>
        </section>

        {/* Still Want Beta Access */}
        <section className="bg-black py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <BetaCTA showBenefits={true} />
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}

function LaunchFeature({
  icon,
  title,
  description,
  status,
}: {
  icon: string
  title: string
  description: string
  status: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-xl border border-gray-800/50 bg-gray-900/60 p-6"
    >
      <div className="mb-4 text-3xl">{icon}</div>
      <h3 className="mb-2 font-semibold text-white">{title}</h3>
      <p className="mb-4 text-sm text-gray-400">{description}</p>
      <div
        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
          status === 'Ready'
            ? 'border border-green-500/30 bg-green-900/30 text-green-400'
            : status === 'Coming Soon'
              ? 'border border-yellow-500/30 bg-yellow-900/30 text-yellow-400'
              : 'border border-violet-500/30 bg-violet-900/30 text-violet-400'
        }`}
      >
        {status}
      </div>
    </motion.div>
  )
}

function BetaMetric({
  value,
  label,
  description,
}: {
  value: string
  label: string
  description: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="gradient-text-ai mb-2 text-4xl font-bold">{value}</div>
      <div className="mb-1 font-semibold text-white">{label}</div>
      <div className="text-sm text-gray-400">{description}</div>
    </motion.div>
  )
}

function PricingCard({
  title,
  price,
  originalPrice,
  features,
  popular,
}: {
  title: string
  price: string
  originalPrice: string
  features: string[]
  popular: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative rounded-xl border bg-gray-900/60 p-6 ${
        popular ? 'border-violet-500/50' : 'border-gray-800/50'
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
          <span className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-1 text-sm font-semibold text-white">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6 text-center">
        <h3 className="mb-2 font-bold text-white">{title}</h3>
        <div className="mb-2">
          <span className="gradient-text-ai text-3xl font-bold">${price}</span>
          <span className="text-gray-400">/user/month</span>
        </div>
        <div className="text-sm text-gray-400">
          <span className="line-through">${originalPrice}</span> regular price
        </div>
      </div>

      <ul className="mb-6 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-300">
            <CheckCircle className="mr-2 h-4 w-4 flex-shrink-0 text-green-400" />
            {feature}
          </li>
        ))}
      </ul>

      <button
        className={`w-full rounded-lg py-3 font-semibold transition-all duration-200 ${
          popular
            ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:from-violet-600 hover:to-cyan-600'
            : 'border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'
        }`}
      >
        Reserve at Launch Price
      </button>
    </motion.div>
  )
}
