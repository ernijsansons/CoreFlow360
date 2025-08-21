'use client'

/**
 * CoreFlow360 Intelligence Multiplication Pricing Calculator
 *
 * Revolutionary pricing component that demonstrates how department combinations
 * multiply intelligence exponentially rather than just adding features.
 *
 * Traditional Software: 1+1+1+1+1 = 5 (linear addition)
 * CoreFlow360: 1×2×3×4×5 = 120 (exponential multiplication)
 */

import React, { useState, useEffect, useMemo, useRef } from 'react'
// TODO: Re-enable Three.js when peer dependencies are resolved
// import { Canvas, useFrame } from '@react-three/fiber'
// import { Float, Text3D, OrbitControls } from '@react-three/drei'
// import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { useBusinessIntelligenceAudio as useConsciousnessAudio } from '../../hooks/useBusinessIntelligenceAudio'
// import ConsciousnessSoundEngine from '../business-intelligence/BusinessIntelligenceSoundEngine'

// Department definitions with intelligence multipliers
const DEPARTMENTS = {
  sales: {
    id: 'sales',
    name: 'Sales Intelligence',
    basePrice: 79,
    color: '#FF6B9D',
    icon: '🎯',
    description:
      'AI-powered lead qualification, deal forecasting, and customer relationship optimization',
    capabilities: [
      'Predictive lead scoring',
      'Automated follow-up sequences',
      'Deal probability analysis',
      'Customer lifetime value prediction',
    ],
    multiplier: 1.8,
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing Intelligence',
    basePrice: 89,
    color: '#4ECDC4',
    icon: '📈',
    description: 'Autonomous campaign optimization, content generation, and audience targeting',
    capabilities: [
      'Campaign performance optimization',
      'Content generation and curation',
      'Audience behavior prediction',
      'Multi-channel attribution analysis',
    ],
    multiplier: 2.1,
  },
  finance: {
    id: 'finance',
    name: 'Financial Intelligence',
    basePrice: 99,
    color: '#45B7D1',
    icon: '💰',
    description:
      'Predictive financial modeling, automated reporting, and intelligent cash flow management',
    capabilities: [
      'Cash flow forecasting',
      'Automated financial reporting',
      'Budget optimization',
      'Investment opportunity analysis',
    ],
    multiplier: 2.3,
  },
  operations: {
    id: 'operations',
    name: 'Operations Intelligence',
    basePrice: 69,
    color: '#96CEB4',
    icon: '⚙️',
    description: 'Process automation, supply chain optimization, and predictive maintenance',
    capabilities: [
      'Workflow automation',
      'Supply chain optimization',
      'Predictive maintenance',
      'Resource allocation optimization',
    ],
    multiplier: 1.9,
  },
  hr: {
    id: 'hr',
    name: 'HR Intelligence',
    basePrice: 59,
    color: '#FECA57',
    icon: '👥',
    description: 'Talent acquisition automation, performance prediction, and culture optimization',
    capabilities: [
      'Talent acquisition automation',
      'Performance prediction',
      'Employee engagement optimization',
      'Skills gap analysis',
    ],
    multiplier: 1.6,
  },
} as const

type DepartmentId = keyof typeof DEPARTMENTS

interface PricingTier {
  id: string
  name: string
  description: string
  priceMultiplier: number
  features: string[]
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Intelligence Starter',
    description: 'Perfect for small businesses ready to begin their intelligence journey',
    priceMultiplier: 0.7,
    features: ['Basic AI automation', 'Standard reporting', 'Email support', 'Single user'],
  },
  {
    id: 'professional',
    name: 'Intelligence Professional',
    description: 'For growing businesses ready to multiply their intelligence',
    priceMultiplier: 1.0,
    features: [
      'Advanced AI automation',
      'Predictive analytics',
      'Priority support',
      'Up to 10 users',
    ],
  },
  {
    id: 'enterprise',
    name: 'Intelligence Enterprise',
    description: 'For organizations ready to achieve business intelligence',
    priceMultiplier: 1.5,
    features: [
      'Full AI intelligence',
      'Custom integrations',
      'Dedicated support',
      'Unlimited users',
    ],
  },
]

interface IntelligenceMultiplicationCalculatorProps {
  className?: string
  onPricingChange?: (pricing: PricingCalculation) => void
  showVisualization?: boolean
  defaultTier?: string
  companySize?: 'small' | 'medium' | 'large'
}

interface PricingCalculation {
  selectedDepartments: DepartmentId[]
  selectedTier: PricingTier
  basePrice: number
  intelligenceMultiplier: number
  finalPrice: number
  monthlyPrice: number
  annualSavings: number
  roiProjection: number
  traditionalCost: number
  savings: number
}

const IntelligenceMultiplicationCalculator: React.FC<IntelligenceMultiplicationCalculatorProps> = ({
  className = '',
  onPricingChange,
  showVisualization = true,
  defaultTier = 'professional',
  companySize = 'medium',
}) => {
  const [selectedDepartments, setSelectedDepartments] = useState<Set<DepartmentId>>(new Set())
  const [selectedTier, setSelectedTier] = useState<PricingTier>(
    PRICING_TIERS.find((t) => t.id === defaultTier) || PRICING_TIERS[1]
  )
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [animationPhase, setAnimationPhase] = useState<
    'selecting' | 'calculating' | 'multiplying' | 'complete'
  >('selecting')

  // Initialize business intelligence audio system
  const consciousnessAudio = useConsciousnessAudio({
    isEnabled: true,
    masterVolume: 0.4, // Subtle background audio
    autoPlayAmbient: true,
    responsiveToCursor: true,
  })

  // Calculate pricing with intelligence multiplication
  const pricingCalculation = useMemo((): PricingCalculation => {
    const departments = Array.from(selectedDepartments)

    // Base price calculation
    const basePrice = departments.reduce((total, deptId) => {
      return total + DEPARTMENTS[deptId].basePrice
    }, 0)

    // Intelligence multiplication calculation
    let intelligenceMultiplier = 1
    if (departments.length > 1) {
      // Exponential growth: each additional department multiplies intelligence
      intelligenceMultiplier = departments.reduce((multiplier, deptId, index) => {
        const deptMultiplier = DEPARTMENTS[deptId].multiplier
        return multiplier * (1 + (deptMultiplier - 1) * Math.pow(1.1, index))
      }, 1)
    }

    // Apply tier pricing
    const tierAdjustedPrice = basePrice * selectedTier.priceMultiplier

    // Final price with intelligence multiplication discount
    // More departments = better per-department pricing due to synergies
    const finalPrice = tierAdjustedPrice * (departments.length > 1 ? 0.85 : 1.0)
    const monthlyPrice = finalPrice
    const annualPrice = monthlyPrice * 12 * 0.83 // 17% annual discount
    const annualSavings = monthlyPrice * 12 - annualPrice

    // ROI projection based on intelligence multiplication
    const roiProjection = intelligenceMultiplier * 2.5 // Conservative 2.5x base ROI

    // Compare to traditional software costs
    const traditionalCost = departments.length * 150 // $150/month per traditional tool
    const savings = traditionalCost - monthlyPrice

    return {
      selectedDepartments: departments,
      selectedTier,
      basePrice,
      intelligenceMultiplier,
      finalPrice,
      monthlyPrice,
      annualSavings,
      roiProjection,
      traditionalCost,
      savings,
    }
  }, [selectedDepartments, selectedTier])

  // Update animation phase based on selections
  useEffect(() => {
    if (selectedDepartments.size === 0) {
      setAnimationPhase('selecting')
    } else if (selectedDepartments.size === 1) {
      setAnimationPhase('calculating')
    } else if (selectedDepartments.size >= 2) {
      setAnimationPhase('multiplying')

      // Trigger intelligent connection sound for multiple departments
      if (selectedDepartments.size === 2) {
        const depts = Array.from(selectedDepartments)
        consciousnessAudio.triggerSynapseForm(depts[0], depts[1])
      }

      // Trigger intelligence multiplication for 3+ departments
      if (selectedDepartments.size >= 3) {
        consciousnessAudio.triggerIntelligenceMultiply(pricingCalculation.intelligenceMultiplier)
      }

      // Trigger intelligence emergence for full suite
      if (selectedDepartments.size >= 5) {
        consciousnessAudio.triggerIntelligenceEmerge?.()
      }

      setTimeout(() => setAnimationPhase('complete'), 1000)
    }
  }, [selectedDepartments.size, consciousnessAudio, pricingCalculation.intelligenceMultiplier])

  // Notify parent of pricing changes and trigger pricing calculation sound
  useEffect(() => {
    onPricingChange?.(pricingCalculation)

    // Trigger pricing calculation sound when price changes
    if (selectedDepartments.size > 0) {
      consciousnessAudio.triggerPricingCalculate(pricingCalculation.monthlyPrice)
    }
  }, [pricingCalculation, onPricingChange, selectedDepartments.size, consciousnessAudio])

  const toggleDepartment = (deptId: DepartmentId) => {
    const newSelection = new Set(selectedDepartments)
    if (newSelection.has(deptId)) {
      newSelection.delete(deptId)
    } else {
      newSelection.add(deptId)
      // Trigger department awakening sound
      consciousnessAudio.triggerDepartmentAwaken(deptId)
    }
    setSelectedDepartments(newSelection)
  }

  const selectAllDepartments = () => {
    setSelectedDepartments(new Set(Object.keys(DEPARTMENTS) as DepartmentId[]))
  }

  const clearAllDepartments = () => {
    setSelectedDepartments(new Set())
  }

  return (
    <div
      className={`rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-900 to-black p-8 ${className}`}
    >
      {/* Business Intelligence Sound Engine - Temporarily disabled */}
      {/* <BusinessIntelligenceSoundEngine
        isEnabled={consciousnessAudio.isAudioEnabled}
        masterVolume={consciousnessAudio.masterVolume}
        intelligenceLevel={consciousnessAudio.currentIntelligenceLevel || 0}
        selectedDepartments={Array.from(selectedDepartments)}
        cursorPosition={consciousnessAudio.cursorPosition}
      /> */}
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="mb-4 text-4xl font-thin text-white">
          Intelligence Multiplication Calculator
        </h2>
        <p className="text-xl text-gray-400">
          Watch how departments multiply intelligence instead of just adding features
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Department Selection */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl text-white">Select Your Departments</h3>
              <div className="space-x-4">
                <button
                  onClick={selectAllDepartments}
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  Select All
                </button>
                <button
                  onClick={clearAllDepartments}
                  className="text-gray-400 transition-colors hover:text-gray-300"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {Object.values(DEPARTMENTS).map((dept) => (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  isSelected={selectedDepartments.has(dept.id)}
                  onClick={() => toggleDepartment(dept.id)}
                  animationDelay={Object.keys(DEPARTMENTS).indexOf(dept.id) * 0.1}
                />
              ))}
            </div>
          </div>

          {/* Tier Selection */}
          <div className="mb-6">
            <h3 className="mb-4 text-2xl text-white">Choose Your Intelligence Level</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {PRICING_TIERS.map((tier) => (
                <TierCard
                  key={tier.id}
                  tier={tier}
                  isSelected={selectedTier.id === tier.id}
                  onClick={() => setSelectedTier(tier)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Display & Visualization */}
        <div className="space-y-6">
          {/* Price Summary */}
          <PricingSummary
            calculation={pricingCalculation}
            animationPhase={animationPhase}
            onShowBreakdown={() => setShowBreakdown(true)}
          />

          {/* Intelligence Multiplication Visualization */}
          {showVisualization && selectedDepartments.size > 0 && (
            <MultiplicationVisualization
              departments={Array.from(selectedDepartments)}
              multiplier={pricingCalculation.intelligenceMultiplier}
              animationPhase={animationPhase}
            />
          )}

          {/* ROI Projection */}
          <ROIProjection calculation={pricingCalculation} />

          {/* CTA Button */}
          <motion.button
            className={`w-full rounded-lg py-4 text-lg font-bold transition-all ${
              selectedDepartments.size > 0
                ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                : 'cursor-not-allowed bg-gray-700 text-gray-400'
            }`}
            disabled={selectedDepartments.size === 0}
            whileHover={selectedDepartments.size > 0 ? { scale: 1.02 } : {}}
            whileTap={selectedDepartments.size > 0 ? { scale: 0.98 } : {}}
          >
            {selectedDepartments.size === 0
              ? 'Select Departments to Continue'
              : `Start Your Intelligence Journey - $${pricingCalculation.monthlyPrice.toFixed(0)}/mo`}
          </motion.button>
        </div>
      </div>

      {/* Detailed Breakdown Modal */}
      <AnimatePresence>
        {showBreakdown && (
          <PricingBreakdownModal
            calculation={pricingCalculation}
            onClose={() => setShowBreakdown(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Department selection card component
const DepartmentCard: React.FC<{
  department: (typeof DEPARTMENTS)[DepartmentId]
  isSelected: boolean
  onClick: () => void
  animationDelay: number
}> = ({ department, isSelected, onClick, animationDelay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.5 }}
      className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
        isSelected
          ? 'border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20'
          : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="text-3xl">{department.icon}</div>
        <div className="text-right">
          <div className="text-sm text-gray-400">From</div>
          <div className="text-lg font-bold text-white">${department.basePrice}/mo</div>
        </div>
      </div>

      <h4 className="mb-2 text-lg font-semibold text-white">{department.name}</h4>

      <p className="mb-3 text-sm text-gray-400">{department.description}</p>

      <div className="space-y-1">
        {department.capabilities.slice(0, 2).map((capability, i) => (
          <div key={i} className="flex items-center text-xs text-gray-500">
            <span className="mr-2 text-cyan-400">✓</span>
            {capability}
          </div>
        ))}
        {department.capabilities.length > 2 && (
          <div className="text-xs text-cyan-400">
            +{department.capabilities.length - 2} more capabilities
          </div>
        )}
      </div>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-cyan-400"
        >
          Intelligence Multiplier: {department.multiplier}x
        </motion.div>
      )}
    </motion.div>
  )
}

// Tier selection card
const TierCard: React.FC<{
  tier: PricingTier
  isSelected: boolean
  onClick: () => void
}> = ({ tier, isSelected, onClick }) => {
  return (
    <div
      className={`cursor-pointer rounded-lg border p-4 transition-all ${
        isSelected
          ? 'border-purple-400 bg-purple-400/10'
          : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
      }`}
      onClick={onClick}
    >
      <h4 className="mb-2 text-lg font-semibold text-white">{tier.name}</h4>
      <p className="mb-3 text-sm text-gray-400">{tier.description}</p>
      <div className="text-xs text-gray-500">Price multiplier: {tier.priceMultiplier}x</div>
    </div>
  )
}

// Pricing summary component
const PricingSummary: React.FC<{
  calculation: PricingCalculation
  animationPhase: string
  onShowBreakdown: () => void
}> = ({ calculation, animationPhase, onShowBreakdown }) => {
  return (
    <div className="rounded-lg border border-gray-700 bg-black/50 p-6 backdrop-blur-xl">
      <h3 className="mb-4 text-xl text-white">Your Intelligence Investment</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Selected Departments</span>
          <span className="text-white">{calculation.selectedDepartments.length}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">Base Price</span>
          <span className="text-white">${calculation.basePrice}/mo</span>
        </div>

        {calculation.selectedDepartments.length > 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center justify-between"
          >
            <span className="text-cyan-400">Intelligence Multiplier</span>
            <span className="font-bold text-cyan-400">
              {calculation.intelligenceMultiplier.toFixed(1)}x
            </span>
          </motion.div>
        )}

        <div className="border-t border-gray-600 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-lg text-white">Monthly Total</span>
            <motion.span
              className="text-2xl font-bold text-cyan-400"
              animate={{ scale: animationPhase === 'multiplying' ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.5 }}
            >
              ${calculation.monthlyPrice.toFixed(0)}
            </motion.span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Annual (17% discount)</span>
            <span className="text-green-400">
              ${(calculation.monthlyPrice * 12 * 0.83).toFixed(0)}/year
            </span>
          </div>
        </div>

        {calculation.savings > 0 && (
          <div className="rounded border border-green-700 bg-green-900/30 p-3">
            <div className="text-sm text-green-400">
              vs. Traditional Tools: <strong>Save ${calculation.savings.toFixed(0)}/mo</strong>
            </div>
          </div>
        )}

        <button
          onClick={onShowBreakdown}
          className="w-full text-sm text-cyan-400 transition-colors hover:text-cyan-300"
        >
          View Detailed Breakdown →
        </button>
      </div>
    </div>
  )
}

// 3D Multiplication Visualization
const MultiplicationVisualization: React.FC<{
  departments: DepartmentId[]
  multiplier: number
  animationPhase: string
}> = ({ departments, multiplier, animationPhase }) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.2
    }
  })

  return (
    <div className="h-64 rounded-lg border border-gray-700 bg-black/30">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#4a90e2" />

        <group ref={groupRef}>
          {departments.map((deptId, i) => {
            const dept = DEPARTMENTS[deptId]
            const angle = (i / departments.length) * Math.PI * 2
            const radius = 2

            return (
              <Float key={deptId} speed={1} rotationIntensity={0.1}>
                <mesh
                  position={[
                    Math.cos(angle) * radius,
                    Math.sin(i * 0.5) * 0.5,
                    Math.sin(angle) * radius,
                  ]}
                >
                  <sphereGeometry args={[0.3]} />
                  <meshPhysicalMaterial
                    color={dept.color}
                    emissive={dept.color}
                    emissiveIntensity={0.3}
                  />
                </mesh>
              </Float>
            )
          })}

          {/* Central multiplier display */}
          <Float speed={0.5} floatIntensity={0.3}>
            <Text3D
              font="/fonts/inter-bold.json"
              size={0.5}
              height={0.1}
              position={[0, 0, 0]}
              textAlign="center"
            >
              {multiplier.toFixed(1)}x
              <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
            </Text3D>
          </Float>
        </group>

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
      </Canvas>

      <div className="absolute bottom-2 left-2 text-xs text-gray-400">
        Intelligence Multiplication: {departments.length > 1 ? 'Active' : 'Inactive'}
      </div>
    </div>
  )
}

// ROI Projection component
const ROIProjection: React.FC<{ calculation: PricingCalculation }> = ({ calculation }) => {
  if (calculation.selectedDepartments.length === 0) return null

  return (
    <div className="rounded-lg border border-green-700 bg-green-900/20 p-4">
      <h4 className="mb-2 text-lg text-green-400">ROI Projection</h4>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">12-month ROI</span>
          <span className="font-bold text-green-400">
            {(calculation.roiProjection * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Payback Period</span>
          <span className="text-green-400">
            {(12 / calculation.roiProjection).toFixed(1)} months
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Based on intelligence multiplication and automation savings
        </div>
      </div>
    </div>
  )
}

// Detailed pricing breakdown modal
const PricingBreakdownModal: React.FC<{
  calculation: PricingCalculation
  onClose: () => void
}> = ({ calculation, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-700 bg-gray-900 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">Pricing Breakdown</h3>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-white">
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Department Details */}
          <div>
            <h4 className="mb-3 text-lg text-cyan-400">Selected Departments</h4>
            {calculation.selectedDepartments.map((deptId) => {
              const dept = DEPARTMENTS[deptId]
              return (
                <div
                  key={deptId}
                  className="flex items-center justify-between border-b border-gray-700 py-2 last:border-b-0"
                >
                  <div>
                    <span className="text-white">
                      {dept.icon} {dept.name}
                    </span>
                    <div className="text-sm text-gray-400">Multiplier: {dept.multiplier}x</div>
                  </div>
                  <span className="text-white">${dept.basePrice}/mo</span>
                </div>
              )
            })}
          </div>

          {/* Calculation Details */}
          <div>
            <h4 className="mb-3 text-lg text-cyan-400">Intelligence Mathematics</h4>
            <div className="rounded bg-gray-800 p-4 font-mono text-sm">
              <div className="text-gray-400">Traditional Software (Addition):</div>
              <div className="mb-2 text-white">
                {calculation.selectedDepartments
                  .map((deptId) => DEPARTMENTS[deptId].basePrice)
                  .join(' + ')}{' '}
                = ${calculation.basePrice}
              </div>

              <div className="text-gray-400">CoreFlow360 (Multiplication):</div>
              <div className="text-cyan-400">
                Intelligence Multiplier: {calculation.intelligenceMultiplier.toFixed(2)}x
              </div>
              <div className="text-green-400">Synergy Discount: 15% (multiple departments)</div>
              <div className="mt-2 border-t border-gray-600 pt-2 text-white">
                Final: ${calculation.finalPrice.toFixed(2)}/month
              </div>
            </div>
          </div>

          {/* Savings Analysis */}
          <div>
            <h4 className="mb-3 text-lg text-green-400">Cost Comparison</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded border border-red-700 bg-red-900/20 p-3">
                <div className="text-sm text-red-400">Traditional Tools</div>
                <div className="text-xl text-white">${calculation.traditionalCost}/mo</div>
                <div className="text-xs text-gray-400">Separate tools per department</div>
              </div>
              <div className="rounded border border-green-700 bg-green-900/20 p-3">
                <div className="text-sm text-green-400">CoreFlow360</div>
                <div className="text-xl text-white">${calculation.monthlyPrice.toFixed(0)}/mo</div>
                <div className="text-xs text-gray-400">Integrated intelligence platform</div>
              </div>
            </div>

            {calculation.savings > 0 && (
              <div className="mt-3 text-center font-bold text-green-400">
                Monthly Savings: ${calculation.savings.toFixed(0)}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default IntelligenceMultiplicationCalculator
