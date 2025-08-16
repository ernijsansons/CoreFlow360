'use client'

import { motion } from 'framer-motion'
import { OrchestratorCard } from './OrchestratorCard'

export function IndustryShowcase() {
  return (
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
            8 ERP Systems. <span className="gradient-text-ai">One AI Mind.</span>
          </h2>
          <p className="text-body-large text-gray-400 max-w-3xl mx-auto">
            We've integrated the world's leading open-source ERP systems into a single AI-orchestrated platform. 
            NocoBase coordinates everything while specialized AI agents run each module autonomously.
          </p>
        </motion.div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-16">
          <OrchestratorCard
            icon="🎭"
            title="NocoBase Central"
            description="Plugin orchestrator managing all ERP modules with AI coordination"
            delay={0.1}
          />
          <OrchestratorCard
            icon="💼"
            title="Twenty CRM"
            description="Advanced CRM with agentic lead scoring and customer intelligence"
            delay={0.2}
          />
          <OrchestratorCard
            icon="💰"
            title="Bigcapital Finance"
            description="AI-enhanced accounting with predictive financial analytics"
            delay={0.3}
          />
          <OrchestratorCard
            icon="👥"
            title="Ever Gauzy HR"
            description="Workforce management with attrition prediction and talent optimization"
            delay={0.4}
          />
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <OrchestratorCard
            icon="📋"
            title="Plane Projects"
            description="Industry-specific project management with AI workflow optimization"
            delay={0.5}
          />
          <OrchestratorCard
            icon="🏭"
            title="Carbon Manufacturing"
            description="HVAC-focused manufacturing with predictive maintenance AI"
            delay={0.6}
          />
          <OrchestratorCard
            icon="⚖️"
            title="Worklenz Legal"
            description="Legal case management with AI document analysis and strategy"
            delay={0.7}
          />
          <OrchestratorCard
            icon="📦"
            title="Inventory System"
            description="Smart inventory with demand forecasting and cross-module integration"
            delay={0.8}
          />
        </div>
      </div>
    </section>
  )
}