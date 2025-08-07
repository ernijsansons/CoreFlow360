'use client'

import { motion } from 'framer-motion'
import { 
  Brain, 
  Cpu, 
  Users, 
  Wrench, 
  Sparkles, 
  ArrowRight, 
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { TypewriterEffect } from '@/components/ui/TypewriterEffect'
import { NeuralNetworkBackground } from '@/components/ui/NeuralNetworkBackground'
import { FeatureCard } from '@/components/ui/FeatureCard'
import { MetricCard } from '@/components/ui/MetricCard'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section - The Awakening */}
      <section className="relative min-h-screen flex items-center justify-center">
        <NeuralNetworkBackground />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto text-center"
          >
            <motion.h1 
              className="heading-hero gradient-text-ai mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Your Business.
              <br />
              <TypewriterEffect
                words={[
                  'Powered by AI.',
                  'Automated Forever.',
                  'Scaling Infinitely.',
                  'Thinking Autonomously.'
                ]}
                className="gradient-text-ai"
              />
            </motion.h1>
            
            <motion.p 
              className="text-body-large text-gray-300 mb-12 max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              The world&apos;s first AI-central-nervous-system ERP. Every department thinking. 
              Every process learning. Every decision optimizing. Welcome to tomorrow.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-6 mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <GlowingButton href="/demo" size="xl">
                Experience the Future
                <Sparkles className="ml-2 h-5 w-5" />
              </GlowingButton>
              
              <GlowingButton href="/contact" size="xl" variant="outline">
                Join the Revolution
                <ArrowRight className="ml-2 h-5 w-5" />
              </GlowingButton>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Performance Metrics */}
        <FloatingMetrics />
      </section>

      {/* Features Grid - The Capabilities Showcase */}
      <section className="relative py-24 bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="heading-section text-white mb-6">
              Every Department. <span className="gradient-text-ai">Thinking.</span>
            </h2>
            <p className="text-body-large text-gray-400 max-w-3xl mx-auto">
              Traditional ERPs store data. CoreFlow360 thinks with it. Watch AI transform 
              every aspect of your business operations.
            </p>
          </motion.div>

          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Brain}
              title="AI-Powered CRM"
              description="Autonomous lead scoring, churn prediction, and deal forecasting with 94% accuracy"
              stats="94% accuracy"
              gradient="violet"
              delay={0.1}
              features={[
                'Autonomous Lead Scoring',
                'Churn Prediction Engine',
                'Deal Velocity Optimization'
              ]}
            />
            
            <FeatureCard
              icon={Cpu}
              title="Intelligent Accounting"
              description="Real-time fraud detection and automated reconciliation in 0.001s"
              stats="0.001s processing"
              gradient="blue"
              delay={0.2}
              features={[
                'Real-time Fraud Detection',
                'Cash Flow Forecasting',
                'Automated Reconciliation'
              ]}
            />
            
            <FeatureCard
              icon={Users}
              title="Predictive HR"
              description="AI-driven hiring and performance optimization boosting retention by 87%"
              stats="87% retention boost"
              gradient="emerald"
              delay={0.3}
              features={[
                'Retention AI',
                'Hiring Optimization',
                'Performance Projection'
              ]}
            />
            
            <FeatureCard
              icon={Wrench}
              title="Smart Field Service"
              description="Route optimization and failure prediction for HVAC with 43% efficiency gain"
              stats="43% efficiency gain"
              gradient="orange"
              delay={0.4}
              features={[
                'Route Optimization',
                'Failure Prediction',
                'Smart Scheduling'
              ]}
            />
          </div>
        </div>
      </section>

      {/* Industry Showcase */}
      <section className="py-24 bg-gradient-to-b from-gray-950 to-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="heading-section text-white mb-6">
              One Platform. <span className="gradient-text-ai">Every Industry.</span>
            </h2>
            <p className="text-body-large text-gray-400 max-w-3xl mx-auto">
              From HVAC to Healthcare, Construction to Legal - CoreFlow360 adapts to your industry&apos;s unique needs.
            </p>
          </motion.div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <IndustryCard
              icon="❄️"
              title="HVAC Services"
              description="Equipment tracking, predictive maintenance, emergency dispatch"
              delay={0.1}
            />
            <IndustryCard
              icon="🏗️"
              title="Construction"
              description="Project management, resource optimization, safety monitoring"
              delay={0.2}
            />
            <IndustryCard
              icon="🏥"
              title="Healthcare"
              description="Patient management, compliance tracking, outcome analytics"
              delay={0.3}
            />
            <IndustryCard
              icon="⚖️"
              title="Legal Services"
              description="Case management, time tracking, document automation"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="heading-section text-white mb-6">
              Performance That <span className="gradient-text-ai">Defies Logic.</span>
            </h2>
            <p className="text-body-large text-gray-400">
              Numbers that speak louder than words. Results that redefine possible.
            </p>
          </motion.div>

          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              value="0.1s"
              label="Average AI Response Time"
              icon={Zap}
              gradient="violet"
              delay={0.1}
            />
            <MetricCard
              value="94%"
              label="Prediction Accuracy"
              icon={TrendingUp}
              trend={12}
              gradient="emerald"
              delay={0.2}
            />
            <MetricCard
              value="∞"
              label="Scaling Potential"
              icon={Brain}
              gradient="cyan"
              delay={0.3}
            />
            <MetricCard
              value="99.99%"
              label="Uptime Guarantee"
              icon={Shield}
              gradient="orange"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-violet-950/50 to-cyan-950/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="heading-section text-white mb-6">
              Ready to <span className="gradient-text-ai">Revolutionize</span> Your Business?
            </h2>
            <p className="text-body-large text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands of businesses already using AI to think, learn, and grow faster than ever before.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <GlowingButton href="/auth/signup" size="xl">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </GlowingButton>
              
              <GlowingButton href="/demo" size="xl" variant="outline">
                Watch Demo
                <Sparkles className="ml-2 h-5 w-5" />
              </GlowingButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

// Floating Metrics Component
function FloatingMetrics() {
  return (
    <div className="absolute top-32 right-8 space-y-4 hidden xl:block z-30">
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4 text-center"
      >
        <div className="text-2xl font-bold gradient-text-ai">94%</div>
        <div className="text-xs text-gray-400">AI Accuracy</div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4 text-center"
      >
        <div className="text-2xl font-bold gradient-text-ai">0.1s</div>
        <div className="text-xs text-gray-400">Response Time</div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4 text-center"
      >
        <div className="text-2xl font-bold gradient-text-ai">10K+</div>
        <div className="text-xs text-gray-400">Active Users</div>
      </motion.div>
    </div>
  )
}

// Industry Card Component
function IndustryCard({ icon, title, description, delay = 0 }: {
  icon: string
  title: string
  description: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative group cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 rounded-2xl blur-xl transition-all duration-500" />
      
      <div className="relative bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 text-center group-hover:border-gray-700/50 transition-all duration-300">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </motion.div>
  )
}