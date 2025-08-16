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
  Bell
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
    seconds: 0
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
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  return (
    <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <motion.div
          key={unit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4 text-center"
        >
          <div className="text-3xl font-bold gradient-text-ai">
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
      source: 'launch_page'
    })
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true)
    }, 1000)
  }

  const handleShare = (platform: string) => {
    trackEvent('launch_page_shared', { platform })
    
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent('🚀 CoreFlow360 is launching soon! The world\'s first AI-orchestrated ERP platform. Join the waitlist!')
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      generic: navigator.share ? null : `mailto:?subject=CoreFlow360 Launch&body=${text} ${url}`
    }
    
    if (platform === 'generic' && navigator.share) {
      navigator.share({
        title: 'CoreFlow360 Launch',
        text: 'The world\'s first AI-orchestrated ERP platform is launching soon!',
        url: window.location.href
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
              <div className="inline-flex items-center gap-2 bg-violet-900/30 border border-violet-500/50 px-6 py-3 rounded-full mb-8">
                <Rocket className="w-5 h-5 text-violet-400" />
                <span className="text-violet-300 font-semibold">Official Launch Coming Soon</span>
              </div>
              
              <h1 className="heading-hero gradient-text-ai mb-6">
                The Future of Business
                <br />
                Automation is Almost Here
              </h1>
              
              <p className="text-body-large text-gray-300 mb-12 max-w-3xl mx-auto">
                After months of development and successful beta testing with 150+ companies, 
                CoreFlow360 is ready to revolutionize how businesses operate. Get ready for 
                AI-orchestrated workflows that think, predict, and act autonomously.
              </p>

              {/* Countdown */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Official Launch In:</h2>
                <Countdown targetDate={LAUNCH_DATE} />
              </div>

              {/* Notify Me Form */}
              {!isSubscribed ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-md mx-auto mb-8"
                >
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email for launch updates"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                    <button
                      onClick={handleNotifyMe}
                      disabled={!email}
                      className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-violet-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Notify Me
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 max-w-md mx-auto mb-8"
                >
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-300 font-semibold">You're on the list!</p>
                  <p className="text-gray-300 text-sm">We'll notify you as soon as CoreFlow360 launches.</p>
                </motion.div>
              )}

              {/* Social Share */}
              <div className="flex justify-center items-center gap-4 mb-12">
                <span className="text-gray-400 text-sm">Share the excitement:</span>
                <button
                  onClick={() => handleShare('twitter')}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="bg-blue-800 hover:bg-blue-900 text-white p-2 rounded-lg transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare('generic')}
                  className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What to Expect */}
        <section className="py-24 bg-gray-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="heading-section text-white mb-6">
                What to Expect at <span className="gradient-text-ai">Launch</span>
              </h2>
              <p className="text-body-large text-gray-400 max-w-3xl mx-auto">
                Based on feedback from our 150+ beta companies, we're launching with features 
                that deliver immediate value and long-term transformation.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <section className="py-24 bg-black">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="heading-section text-white mb-6">
                Proven Results from <span className="gradient-text-ai">Beta Testing</span>
              </h2>
              <p className="text-body-large text-gray-400">
                Real metrics from real companies during our 6-month beta program
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8 mb-16">
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
              className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-8 max-w-3xl mx-auto text-center"
            >
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-xl text-gray-300 mb-6">
                "CoreFlow360 didn't just improve our processes—it transformed our entire business model. 
                The AI orchestration is like having a team of consultants working 24/7."
              </blockquote>
              <div className="text-gray-400">
                <strong className="text-white">Sarah Chen</strong>, Operations Director at TechFlow HVAC
              </div>
            </motion.div>
          </div>
        </section>

        {/* Launch Pricing Preview */}
        <section className="py-24 bg-gray-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="heading-section text-white mb-6">
                <span className="gradient-text-ai">Launch Pricing</span>
              </h2>
              <p className="text-body-large text-gray-400">
                Special launch pricing for early adopters
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <PricingCard
                title="Starter"
                price="$12"
                originalPrice="$24"
                features={[
                  '2 modules included',
                  'Basic AI capabilities',
                  'Email support',
                  '5GB storage'
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
                  'Custom workflows'
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
                  'White-label options'
                ]}
                popular={false}
              />
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-400">
                ✓ 50% launch discount for first 1000 customers • ✓ 30-day free trial • ✓ No setup fees
              </p>
            </div>
          </div>
        </section>

        {/* Still Want Beta Access */}
        <section className="py-24 bg-black">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
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
  status 
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
      className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-6"
    >
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
        status === 'Ready' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
        status === 'Coming Soon' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' :
        'bg-violet-900/30 text-violet-400 border border-violet-500/30'
      }`}>
        {status}
      </div>
    </motion.div>
  )
}

function BetaMetric({ 
  value, 
  label, 
  description 
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
      <div className="text-4xl font-bold gradient-text-ai mb-2">{value}</div>
      <div className="font-semibold text-white mb-1">{label}</div>
      <div className="text-sm text-gray-400">{description}</div>
    </motion.div>
  )
}

function PricingCard({ 
  title, 
  price, 
  originalPrice, 
  features, 
  popular 
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
      className={`bg-gray-900/60 border rounded-xl p-6 relative ${
        popular ? 'border-violet-500/50' : 'border-gray-800/50'
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-6 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="font-bold text-white mb-2">{title}</h3>
        <div className="mb-2">
          <span className="text-3xl font-bold gradient-text-ai">${price}</span>
          <span className="text-gray-400">/user/month</span>
        </div>
        <div className="text-sm text-gray-400">
          <span className="line-through">${originalPrice}</span> regular price
        </div>
      </div>
      
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-300">
            <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      
      <button className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
        popular
          ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:from-violet-600 hover:to-cyan-600'
          : 'border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'
      }`}>
        Reserve at Launch Price
      </button>
    </motion.div>
  )
}