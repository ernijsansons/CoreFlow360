'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  Globe,
  Sparkles,
  ArrowRight,
  Brain,
  Headphones,
  Users,
  Building,
  Zap,
  Shield,
} from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { NeuralNetworkBackground } from '@/components/ui/NeuralNetworkBackground'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  message: string
  timestamp: Date
  typing?: boolean
}

interface ContactMethod {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  value: string
  action: string
  gradient: string
  available: boolean
}

interface OfficeLocation {
  city: string
  country: string
  address: string
  timezone: string
  coordinates: { lat: number; lng: number }
  isHeadquarters?: boolean
}

const contactMethods: ContactMethod[] = [
  {
    icon: MessageSquare,
    title: 'AI Assistant',
    description: 'Get instant answers from our AI-powered support system',
    value: 'Available 24/7',
    action: 'Start Chat',
    gradient: 'from-violet-500 to-purple-500',
    available: true,
  },
  {
    icon: Calendar,
    title: 'Schedule Demo',
    description: 'Book a personalized demonstration with our AI specialists',
    value: '30-minute sessions',
    action: 'Book Now',
    gradient: 'from-emerald-500 to-green-500',
    available: true,
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Speak directly with our technical support team',
    value: '+1 (555) AI-FLOW',
    action: 'Call Now',
    gradient: 'from-blue-500 to-cyan-500',
    available: true,
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Send detailed inquiries to our support specialists',
    value: 'support@coreflow360.ai',
    action: 'Send Email',
    gradient: 'from-orange-500 to-red-500',
    available: true,
  },
]

const offices: OfficeLocation[] = [
  {
    city: 'San Francisco',
    country: 'USA',
    address: '100 AI Innovation Drive, San Francisco, CA 94105',
    timezone: 'PST (UTC-8)',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    isHeadquarters: true,
  },
  {
    city: 'London',
    country: 'UK',
    address: '25 Tech City Road, London, EC1V 2NX',
    timezone: 'GMT (UTC+0)',
    coordinates: { lat: 51.5074, lng: -0.1278 },
  },
  {
    city: 'Singapore',
    country: 'Singapore',
    address: '1 Marina Bay AI Hub, Singapore 018960',
    timezone: 'SGT (UTC+8)',
    coordinates: { lat: 1.3521, lng: 103.8198 },
  },
  {
    city: 'Toronto',
    country: 'Canada',
    address: '200 Innovation Boulevard, Toronto, ON M5V 3C7',
    timezone: 'EST (UTC-5)',
    coordinates: { lat: 43.6532, lng: -79.3832 },
  },
]

const aiResponses = [
  'Hello! I&apos;m CoreFlow360&apos;s AI assistant. I can help you learn about our AI-powered ERP platform, schedule demos, or answer technical questions. What would you like to know?',
  'I can provide information about our pricing tiers, AI capabilities, implementation process, or connect you with a human specialist. How can I assist you today?',
  'Our AI platform serves over 50,000 businesses across HVAC, construction, healthcare, and legal industries. What industry are you in?',
  'Would you like to see a personalized demo of how AI can transform your specific business processes? I can connect you with one of our industry specialists.',
  "I can help you calculate potential ROI, explain our security measures, or schedule a consultation. What's most important for your business right now?",
]

export default function ContactPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      message:
        'Hello! I&apos;m CoreFlow360&apos;s AI assistant. I&apos;m here to help you discover how artificial intelligence can transform your business operations. What would you like to know?',
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedOffice, setSelectedOffice] = useState(offices[0])

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center">
        <NeuralNetworkBackground />

        <div className="container-fluid relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl text-center"
          >
            <h1 className="heading-hero gradient-text-ai mb-6">Connect with Intelligence</h1>
            <p className="text-body-large mb-12 text-gray-300">
              Whether you need instant AI assistance, want to schedule a personalized demo, or have
              complex questions about AI implementation - we&apos;re here to help you succeed.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <GlowingButton href="#ai-chat" size="xl">
                Talk to AI Assistant
                <Bot className="ml-2 h-5 w-5" />
              </GlowingButton>

              <GlowingButton href="#contact-methods" size="xl" variant="outline">
                View All Options
                <ArrowRight className="ml-2 h-5 w-5" />
              </GlowingButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Chat Interface */}
      <section id="ai-chat" className="bg-gray-950 py-24">
        <div className="container-fluid">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <h2 className="heading-section mb-6 text-white">
              AI-Powered <span className="gradient-text-ai">Support</span>
            </h2>
            <p className="text-body-large mx-auto max-w-3xl text-gray-400">
              Get instant answers from our AI assistant trained on CoreFlow360&apos;s complete
              knowledge base. Ask about features, pricing, implementation, or anything else.
            </p>
          </motion.div>

          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card flex h-[600px] flex-col p-6"
            >
              {/* Chat Header */}
              <div className="mb-4 flex items-center gap-3 border-b border-gray-800 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-500">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">CoreFlow360 AI Assistant</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    <span className="text-sm text-emerald-400">Online</span>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2 text-sm text-gray-400">
                  <Brain className="h-4 w-4" />
                  <span>AI-Powered</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="mb-4 flex-1 space-y-4 overflow-y-auto">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex max-w-xs gap-3 lg:max-w-md ${
                          message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                            message.type === 'user'
                              ? 'bg-violet-600'
                              : 'bg-gradient-to-r from-violet-500 to-cyan-500'
                          }`}
                        >
                          {message.type === 'user' ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            message.type === 'user'
                              ? 'bg-violet-600 text-white'
                              : 'bg-gray-800 text-gray-100'
                          }`}
                        >
                          {message.message}
                          <div
                            className={`mt-1 text-xs ${
                              message.type === 'user' ? 'text-violet-200' : 'text-gray-500'
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-500">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="rounded-2xl bg-gray-800 px-4 py-3">
                        <div className="flex gap-1">
                          <div
                            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                            style={{ animationDelay: '0ms' }}
                          />
                          <div
                            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                            style={{ animationDelay: '150ms' }}
                          />
                          <div
                            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-800 pt-4">
                <div className="flex gap-3">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about AI features, pricing, implementation..."
                    className="flex-1 resize-none rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none"
                    rows={1}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                  <GlowingButton
                    onClick={handleSendMessage}
                    size="md"
                    disabled={!inputMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </GlowingButton>
                </div>

                {/* Quick Actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    'Schedule a demo',
                    'Pricing information',
                    'AI capabilities',
                    'Implementation process',
                    'Security features',
                  ].map((quickAction) => (
                    <button
                      key={quickAction}
                      onClick={() => setInputMessage(quickAction)}
                      className="rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-xs text-gray-300 transition-all duration-200 hover:border-violet-500 hover:text-white"
                    >
                      {quickAction}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section id="contact-methods" className="bg-black py-24">
        <div className="container-fluid">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <h2 className="heading-section mb-6 text-white">
              Multiple Ways to <span className="gradient-text-ai">Connect</span>
            </h2>
            <p className="text-body-large mx-auto max-w-3xl text-gray-400">
              Choose the communication method that works best for you. Our team is available across
              all channels to provide the support you need.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-card group relative cursor-pointer p-6 text-center"
              >
                {/* Availability Indicator */}
                <div className="absolute top-4 right-4">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      method.available ? 'bg-emerald-400' : 'bg-gray-500'
                    } ${method.available ? 'animate-pulse' : ''}`}
                  />
                </div>

                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 blur-xl transition-all duration-500 group-hover:opacity-20 ${method.gradient}`}
                />

                <div
                  className={`h-16 w-16 rounded-2xl bg-gradient-to-r ${method.gradient} mx-auto mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                >
                  <method.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="mb-3 text-xl font-semibold text-white">{method.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-400">{method.description}</p>

                <div className="mb-6 font-medium text-white">{method.value}</div>

                <GlowingButton size="sm" className="w-full">
                  {method.action}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </GlowingButton>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Offices */}
      <section className="bg-gray-950 py-24">
        <div className="container-fluid">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <h2 className="heading-section mb-6 text-white">
              Global <span className="gradient-text-ai">Presence</span>
            </h2>
            <p className="text-body-large mx-auto max-w-3xl text-gray-400">
              With offices around the world, we provide local support with global expertise. Our
              teams work around the clock to ensure your AI systems perform perfectly.
            </p>
          </motion.div>

          <div className="mx-auto max-w-6xl">
            {/* Office Selector */}
            <div className="mb-12 flex flex-wrap justify-center gap-4">
              {offices.map((office, index) => (
                <motion.button
                  key={`${office.city}-${office.country}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => setSelectedOffice(office)}
                  className={`rounded-xl px-6 py-3 font-medium transition-all duration-300 ${
                    selectedOffice.city === office.city
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>
                      {office.city}, {office.country}
                    </span>
                    {office.isHeadquarters && (
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Selected Office Details */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedOffice.city}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="glass-card p-8"
              >
                <div className="grid gap-8 lg:grid-cols-2">
                  {/* Office Info */}
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <h3 className="text-2xl font-semibold text-white">
                        {selectedOffice.city}, {selectedOffice.country}
                      </h3>
                      {selectedOffice.isHeadquarters && (
                        <span className="rounded-full border border-emerald-500/50 bg-emerald-500/20 px-3 py-1 text-sm text-emerald-400">
                          Headquarters
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 text-violet-400" />
                        <div>
                          <div className="font-medium text-white">Address</div>
                          <div className="text-gray-400">{selectedOffice.address}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-cyan-400" />
                        <div>
                          <div className="font-medium text-white">Timezone</div>
                          <div className="text-gray-400">{selectedOffice.timezone}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Headphones className="h-5 w-5 text-emerald-400" />
                        <div>
                          <div className="font-medium text-white">Support Hours</div>
                          <div className="text-gray-400">
                            24/7 AI Support, Business Hours for Human Support
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Office Services */}
                  <div>
                    <h4 className="mb-4 text-lg font-semibold text-white">Available Services</h4>
                    <div className="grid gap-3">
                      {[
                        { icon: Brain, label: 'AI Consultation', available: true },
                        { icon: Users, label: 'Technical Support', available: true },
                        { icon: Calendar, label: 'Demo Scheduling', available: true },
                        { icon: Building, label: 'Enterprise Sales', available: true },
                        {
                          icon: Shield,
                          label: 'Security Consultation',
                          available: selectedOffice.isHeadquarters,
                        },
                        { icon: Zap, label: 'Implementation Services', available: true },
                      ].map((service, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-3 rounded-lg p-3 ${
                            service.available ? 'bg-gray-800/50' : 'bg-gray-900/50'
                          }`}
                        >
                          <service.icon
                            className={`h-5 w-5 ${
                              service.available ? 'text-emerald-400' : 'text-gray-500'
                            }`}
                          />
                          <span className={service.available ? 'text-white' : 'text-gray-500'}>
                            {service.label}
                          </span>
                          {service.available && (
                            <span className="ml-auto text-xs text-emerald-400">Available</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-black py-24">
        <div className="container-fluid">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <h2 className="heading-section mb-6 text-white">
              Send Us a <span className="gradient-text-ai">Message</span>
            </h2>
            <p className="text-body-large mx-auto max-w-2xl text-gray-400">
              Have specific questions or want to discuss a custom implementation? Send us a detailed
              message and we&apos;ll get back to you within 24 hours.
            </p>
          </motion.div>

          <div className="mx-auto max-w-2xl">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card space-y-6 p-8"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">First Name</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Last Name</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  placeholder="john.doe@company.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Company & Industry
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  placeholder="ACME Corp - HVAC Services"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  How can we help you?
                </label>
                <select className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none">
                  <option>Schedule a demo</option>
                  <option>Get pricing information</option>
                  <option>Discuss implementation</option>
                  <option>Technical support</option>
                  <option>Partnership opportunities</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Message</label>
                <textarea
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  placeholder="Tell us about your business needs, current challenges, or specific questions about our AI platform..."
                />
              </div>

              <GlowingButton type="submit" size="lg" className="w-full">
                Send Message
                <Send className="ml-2 h-5 w-5" />
              </GlowingButton>

              <p className="text-center text-sm text-gray-500">
                We typically respond within 24 hours. For urgent matters, please use our AI chat or
                call us directly.
              </p>
            </motion.form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-violet-950/30 to-cyan-950/30 py-24">
        <div className="container-fluid text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="heading-section mb-6 text-white">
              Ready to <span className="gradient-text-ai">Connect</span>?
            </h2>
            <p className="text-body-large mx-auto mb-12 max-w-2xl text-gray-300">
              Join thousands of businesses already using AI to transform their operations. Start
              with a free consultation today.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <GlowingButton href="/demo" size="xl">
                Try AI Demo
                <Sparkles className="ml-2 h-5 w-5" />
              </GlowingButton>

              <GlowingButton href="/auth/signup" size="xl" variant="outline">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </GlowingButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
