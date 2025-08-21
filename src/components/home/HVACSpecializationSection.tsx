'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ThermometerSun, 
  Wrench, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  MapPin,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export function HVACSpecializationSection() {
  const stats = [
    { value: '847+', label: 'HVAC Contractors', icon: Users },
    { value: '25+ hrs', label: 'Saved Per Week', icon: Clock },
    { value: '35%', label: 'Revenue Increase', icon: TrendingUp },
    { value: '40%', label: 'Better Close Rate', icon: CheckCircle }
  ]

  const features = [
    {
      title: 'Service Call Management',
      description: 'Schedule, dispatch, and track technicians in real-time',
      icon: Wrench
    },
    {
      title: 'Maintenance Contracts',
      description: 'Automate recurring service agreements and billing',
      icon: Calendar
    },
    {
      title: 'Parts & Inventory',
      description: 'Track equipment and parts across multiple warehouses',
      icon: ThermometerSun
    },
    {
      title: 'Multi-Location Support',
      description: 'Manage multiple service areas and territories',
      icon: MapPin
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-4">
            <ThermometerSun className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-semibold text-orange-800">Industry Specialized</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built for HVAC Success
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join 847+ HVAC contractors who transformed their business operations with CoreFlow360's 
            industry-specific features and proven workflows
          </p>
        </motion.div>

        {/* Success Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="border-2 border-orange-200 hover:border-orange-400 transition-all">
              <CardContent className="p-6 text-center">
                <stat.icon className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* HVAC-Specific Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <feature.icon className="h-10 w-10 text-orange-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Success Story Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 md:p-12 text-white"
        >
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-xl md:text-2xl font-medium mb-6">
              "CoreFlow360 helped us scale from 1 location to 7 locations in just 18 months. 
              The multi-business pricing saved us over $40,000 per year while giving us the 
              tools to manage everything from one dashboard."
            </blockquote>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="font-semibold text-lg">Michael Rodriguez</div>
                <div className="text-orange-100">Desert Air Solutions - Phoenix, AZ</div>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-3xl font-bold">$3.2M</div>
                  <div className="text-sm text-orange-100">Annual Revenue</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">7</div>
                  <div className="text-sm text-orange-100">Locations</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <h3 className="text-2xl font-bold mb-4">
            Ready to Transform Your HVAC Business?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Get instant access to HVAC-specific templates, workflows, and pricing structures 
            that have helped hundreds of contractors scale their operations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/industries/hvac">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                See HVAC Features
              </Button>
            </Link>
            <Link href="/demo?industry=hvac">
              <Button size="lg" variant="outline">
                Watch HVAC Demo
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}