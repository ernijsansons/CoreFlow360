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
  Shield
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
  coordinates: { lat: number, lng: number }
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
    available: true
  },
  {
    icon: Calendar,
    title: 'Schedule Demo',
    description: 'Book a personalized demonstration with our AI specialists',
    value: '30-minute sessions',
    action: 'Book Now',
    gradient: 'from-emerald-500 to-green-500',
    available: true
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Speak directly with our technical support team',
    value: '+1 (555) AI-FLOW',
    action: 'Call Now',
    gradient: 'from-blue-500 to-cyan-500',
    available: true
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Send detailed inquiries to our support specialists',
    value: 'support@coreflow360.ai',
    action: 'Send Email',
    gradient: 'from-orange-500 to-red-500',
    available: true
  }
]

const offices: OfficeLocation[] = [
  {
    city: 'San Francisco',
    country: 'USA',
    address: '100 AI Innovation Drive, San Francisco, CA 94105',
    timezone: 'PST (UTC-8)',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    isHeadquarters: true
  },
  {
    city: 'London',
    country: 'UK',
    address: '25 Tech City Road, London, EC1V 2NX',
    timezone: 'GMT (UTC+0)',
    coordinates: { lat: 51.5074, lng: -0.1278 }
  },
  {
    city: 'Singapore',
    country: 'Singapore',
    address: '1 Marina Bay AI Hub, Singapore 018960',
    timezone: 'SGT (UTC+8)',
    coordinates: { lat: 1.3521, lng: 103.8198 }
  },
  {
    city: 'Toronto',
    country: 'Canada',
    address: '200 Innovation Boulevard, Toronto, ON M5V 3C7',
    timezone: 'EST (UTC-5)',
    coordinates: { lat: 43.6532, lng: -79.3832 }
  }
]

const aiResponses = [
  "Hello! I&apos;m CoreFlow360&apos;s AI assistant. I can help you learn about our AI-powered ERP platform, schedule demos, or answer technical questions. What would you like to know?",
  "I can provide information about our pricing tiers, AI capabilities, implementation process, or connect you with a human specialist. How can I assist you today?",
  "Our AI platform serves over 50,000 businesses across HVAC, construction, healthcare, and legal industries. What industry are you in?",
  "Would you like to see a personalized demo of how AI can transform your specific business processes? I can connect you with one of our industry specialists.",
  "I can help you calculate potential ROI, explain our security measures, or schedule a consultation. What's most important for your business right now?"
]

export default function ContactPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      message: "Hello! I&apos;m CoreFlow360&apos;s AI assistant. I&apos;m here to help you discover how artificial intelligence can transform your business operations. What would you like to know?",
      timestamp: new Date()
    }
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
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
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
      <section className="relative min-h-screen flex items-center">
        <NeuralNetworkBackground />
        
        <div className="container-fluid relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="heading-hero gradient-text-ai mb-6">
              Connect with Intelligence
            </h1>
            <p className="text-body-large text-gray-300 mb-12">
              Whether you need instant AI assistance, want to schedule a personalized demo, 
              or have complex questions about AI implementation - we&apos;re here to help you succeed.
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
      <section id="ai-chat" className="py-24 bg-gray-950">
        <div className="container-fluid">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="heading-section text-white mb-6">
              AI-Powered <span className="gradient-text-ai">Support</span>
            </h2>
            <p className="text-body-large text-gray-400 max-w-3xl mx-auto">
              Get instant answers from our AI assistant trained on CoreFlow360&apos;s complete knowledge base. 
              Ask about features, pricing, implementation, or anything else.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card p-6 h-[600px] flex flex-col"
            >
              {/* Chat Header */}
              <div className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">CoreFlow360 AI Assistant</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-sm text-emerald-400">Online</span>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2 text-sm text-gray-400">
                  <Brain className="w-4 h-4" />
                  <span>AI-Powered</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-xs lg:max-w-md ${
                        message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                          message.type === 'user' 
                            ? 'bg-violet-600' 
                            : 'bg-gradient-to-r from-violet-500 to-cyan-500'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className={`px-4 py-3 rounded-2xl ${
                          message.type === 'user' 
                            ? 'bg-violet-600 text-white' 
                            : 'bg-gray-800 text-gray-100'
                        }`}>
                          {message.message}
                          <div className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-violet-200' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-800 px-4 py-3 rounded-2xl">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    rows={1}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                  <GlowingButton onClick={handleSendMessage} size="md" disabled={!inputMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </GlowingButton>
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    'Schedule a demo',
                    'Pricing information',
                    'AI capabilities',
                    'Implementation process',
                    'Security features'
                  ].map((quickAction) => (
                    <button
                      key={quickAction}
                      onClick={() => setInputMessage(quickAction)}
                      className="px-3 py-1 text-xs bg-gray-800 border border-gray-700 rounded-full text-gray-300 hover:text-white hover:border-violet-500 transition-all duration-200"
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
      <section id="contact-methods" className="py-24 bg-black">
        <div className="container-fluid">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="heading-section text-white mb-6">
              Multiple Ways to <span className="gradient-text-ai">Connect</span>
            </h2>
            <p className="text-body-large text-gray-400 max-w-3xl mx-auto">
              Choose the communication method that works best for you. Our team is available 
              across all channels to provide the support you need.
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
                className="glass-card p-6 text-center group cursor-pointer relative"
              >
                {/* Availability Indicator */}
                <div className="absolute top-4 right-4">
                  <div className={`w-3 h-3 rounded-full ${
                    method.available ? 'bg-emerald-400' : 'bg-gray-500'
                  } ${method.available ? 'animate-pulse' : ''}`} />
                </div>

                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-all duration-500 ${method.gradient}`} />
                
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${method.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <method.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">{method.title}</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{method.description}</p>
                
                <div className="font-medium text-white mb-6">{method.value}</div>
                
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
      <section className="py-24 bg-gray-950">
        <div className="container-fluid">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="heading-section text-white mb-6">
              Global <span className="gradient-text-ai">Presence</span>
            </h2>
            <p className="text-body-large text-gray-400 max-w-3xl mx-auto">
              With offices around the world, we provide local support with global expertise. 
              Our teams work around the clock to ensure your AI systems perform perfectly.
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            {/* Office Selector */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {offices.map((office, index) => (
                <motion.button
                  key={`${office.city}-${office.country}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => setSelectedOffice(office)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedOffice.city === office.city
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>{office.city}, {office.country}</span>
                    {office.isHeadquarters && (
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
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
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-2xl font-semibold text-white">
                        {selectedOffice.city}, {selectedOffice.country}
                      </h3>
                      {selectedOffice.isHeadquarters && (
                        <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-emerald-400 text-sm">
                          Headquarters
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-violet-400 mt-0.5" />
                        <div>
                          <div className="text-white font-medium">Address</div>
                          <div className="text-gray-400">{selectedOffice.address}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-cyan-400" />
                        <div>
                          <div className="text-white font-medium">Timezone</div>
                          <div className="text-gray-400">{selectedOffice.timezone}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Headphones className="w-5 h-5 text-emerald-400" />
                        <div>
                          <div className="text-white font-medium">Support Hours</div>
                          <div className="text-gray-400">24/7 AI Support, Business Hours for Human Support</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Office Services */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Available Services</h4>
                    <div className="grid gap-3">
                      {[
                        { icon: Brain, label: 'AI Consultation', available: true },
                        { icon: Users, label: 'Technical Support', available: true },
                        { icon: Calendar, label: 'Demo Scheduling', available: true },
                        { icon: Building, label: 'Enterprise Sales', available: true },
                        { icon: Shield, label: 'Security Consultation', available: selectedOffice.isHeadquarters },
                        { icon: Zap, label: 'Implementation Services', available: true }
                      ].map((service, index) => (
                        <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
                          service.available ? 'bg-gray-800/50' : 'bg-gray-900/50'
                        }`}>
                          <service.icon className={`w-5 h-5 ${
                            service.available ? 'text-emerald-400' : 'text-gray-500'
                          }`} />
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
      <section className="py-24 bg-black">
        <div className="container-fluid">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="heading-section text-white mb-6">
              Send Us a <span className="gradient-text-ai">Message</span>
            </h2>
            <p className="text-body-large text-gray-400 max-w-2xl mx-auto">
              Have specific questions or want to discuss a custom implementation? 
              Send us a detailed message and we&apos;ll get back to you within 24 hours.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8 space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  placeholder="john.doe@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company & Industry
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  placeholder="ACME Corp - HVAC Services"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  How can we help you?
                </label>
                <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500">
                  <option>Schedule a demo</option>
                  <option>Get pricing information</option>
                  <option>Discuss implementation</option>
                  <option>Technical support</option>
                  <option>Partnership opportunities</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  placeholder="Tell us about your business needs, current challenges, or specific questions about our AI platform..."
                />
              </div>

              <GlowingButton type="submit" size="lg" className="w-full">
                Send Message
                <Send className="ml-2 h-5 w-5" />
              </GlowingButton>

              <p className="text-center text-sm text-gray-500">
                We typically respond within 24 hours. For urgent matters, please use our AI chat or call us directly.
              </p>
            </motion.form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-violet-950/30 to-cyan-950/30">
        <div className="container-fluid text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="heading-section text-white mb-6">
              Ready to <span className="gradient-text-ai">Connect</span>?
            </h2>
            <p className="text-body-large text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands of businesses already using AI to transform their operations. 
              Start with a free consultation today.
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