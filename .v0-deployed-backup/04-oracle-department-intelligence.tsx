'use client'

import React, { useState, useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Float, 
  Text3D, 
  MeshTransmissionMaterial, 
  Html,
  Environment,
  Points,
  PointMaterial,
  Sphere,
  Box,
  Cylinder,
  Ring
} from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

interface CustomerData {
  position: [number, number, number]
  intent: number
  value: number
  timeToClose: number
  id: string
}

interface EmployeeData {
  id: string
  name: string
  position: [number, number, number]
  performance: number
  satisfaction: number
  skills: string[]
}

interface ProcessData {
  id: string
  name: string
  efficiency: number
  position: THREE.Vector3
  optimalPosition: THREE.Vector3
  bottleneck: boolean
}

interface CampaignData {
  id: string
  name: string
  roi: number
  reach: number
  engagement: number
  position: [number, number, number]
}

type DepartmentId = 'sales' | 'finance' | 'operations' | 'hr' | 'marketing'

interface Department {
  id: DepartmentId
  name: string
  icon: string
  color: string
  bgColor: string
}

const departments: Department[] = [
  { id: 'sales', name: 'Sales Intelligence', icon: '📊', color: '#22c55e', bgColor: '#1a365d' },
  { id: 'finance', name: 'Financial Intelligence', icon: '💰', color: '#16a34a', bgColor: '#374151' },
  { id: 'operations', name: 'Operations Intelligence', icon: '⚙️', color: '#059669', bgColor: '#475569' },
  { id: 'hr', name: 'HR Intelligence', icon: '👥', color: '#16a34a', bgColor: '#581c87' },
  { id: 'marketing', name: 'Marketing Intelligence', icon: '📈', color: '#10b981', bgColor: '#134e4a' }
]

// Customer Particle Component for Sales
const CustomerParticle: React.FC<{
  position: [number, number, number]
  intent: number
  value: number
  onClick: () => void
}> = ({ position, intent, value, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const color = useMemo(() => new THREE.Color().setHSL(intent * 0.3, 1, 0.5), [intent])
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2) * 0.1)
    }
  })
  
  return (
    <Float speed={1} rotationIntensity={0.1}>
      <mesh
        ref={meshRef}
        position={position}
        onClick={onClick}
      >
        <sphereGeometry args={[0.05 + value / 100000, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intent}
        />
      </mesh>
    </Float>
  )
}

// Sales Intelligence Room
const SalesIntelligenceRoom: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null)
  const globeRef = useRef<THREE.Group>(null)
  
  const customerParticles = useMemo<CustomerData[]>(() => {
    const particles: CustomerData[] = []
    for (let i = 0; i < 500; i++) {
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      
      particles.push({
        position: [
          Math.sin(phi) * Math.cos(theta) * 5,
          Math.sin(phi) * Math.sin(theta) * 5,
          Math.cos(phi) * 5
        ],
        intent: Math.random(),
        value: Math.random() * 100000,
        timeToClose: Math.random() * 90,
        id: `customer-${i}`
      })
    }
    return particles
  }, [])
  
  return (
    <>
      <fog attach="fog" args={['#1a365d', 10, 50]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <group ref={globeRef}>
        <mesh>
          <sphereGeometry args={[5, 64, 64]} />
          <MeshTransmissionMaterial
            color="#1a365d"
            transmission={0.9}
            thickness={1}
            roughness={0.1}
          />
        </mesh>
        
        {customerParticles.map((customer) => (
          <CustomerParticle
            key={customer.id}
            {...customer}
            onClick={() => setSelectedCustomer(customer)}
          />
        ))}
      </group>
      
      {selectedCustomer && (
        <Html position={[8, 4, 0]}>
          <div className="bg-black/80 backdrop-blur-xl p-4 rounded-lg border border-green-500/30 text-white">
            <h3 className="text-lg font-bold text-green-400">Customer Intelligence</h3>
            <p>Purchase Intent: {Math.round(selectedCustomer.intent * 100)}%</p>
            <p>Value: ${Math.round(selectedCustomer.value).toLocaleString()}</p>
            <p>Time to Close: {Math.round(selectedCustomer.timeToClose)} days</p>
          </div>
        </Html>
      )}
    </>
  )
}

// Money Flow System for Finance
const MoneyFlowSystem: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 2000
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = Math.random() * 20 - 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return pos
  }, [])
  
  useFrame(({ clock }) => {
    if (!particlesRef.current) return
    
    const positions = particlesRef.current.geometry.attributes.position
    const time = clock.elapsedTime
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const x = positions.array[i3]
      const y = positions.array[i3 + 1]
      const z = positions.array[i3 + 2]
      
      const angle = time + i * 0.01
      const radius = 2 + Math.sin(time + i * 0.1) * 0.5
      
      positions.array[i3] = Math.cos(angle) * radius
      positions.array[i3 + 1] = y + 0.05
      positions.array[i3 + 2] = Math.sin(angle) * radius
      
      if (y > 15) positions.array[i3 + 1] = -15
    }
    
    positions.needsUpdate = true
  })
  
  return (
    <Points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        size={0.1}
        color="#FFD700"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

// Financial Intelligence Room
const FinancialIntelligenceRoom: React.FC = () => {
  const metrics = [
    { label: 'Cash Runway', value: '18 months', angle: 0, color: '#16a34a' },
    { label: 'Burn Rate', value: '$45K/mo', angle: Math.PI / 2, color: '#dc2626' },
    { label: 'Revenue Growth', value: '+34%', angle: Math.PI, color: '#16a34a' },
    { label: 'Profit Margin', value: '42%', angle: 3 * Math.PI / 2, color: '#16a34a' },
  ]
  
  return (
    <>
      <fog attach="fog" args={['#374151', 10, 50]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <MoneyFlowSystem />
      
      <group position={[0, 0, 0]}>
        <Sphere args={[2, 32, 32]}>
          <meshStandardMaterial
            color="#374151"
            emissive="#16a34a"
            emissiveIntensity={0.2}
            transparent
            opacity={0.8}
          />
        </Sphere>
        
        {metrics.map((metric, i) => (
          <group key={i} rotation={[0, metric.angle, 0]}>
            <Html position={[6, 0, 0]}>
              <div className="bg-black/80 backdrop-blur-xl p-3 rounded-lg border border-green-500/30 text-white text-center">
                <div className="text-sm text-gray-300">{metric.label}</div>
                <div className="text-lg font-bold" style={{ color: metric.color }}>
                  {metric.value}
                </div>
              </div>
            </Html>
          </group>
        ))}
      </group>
    </>
  )
}

// Process Node for Operations
const ProcessNode: React.FC<{
  position: [number, number, number]
  efficiency: number
  name: string
  bottleneck: boolean
}> = ({ position, efficiency, name, bottleneck }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const color = bottleneck ? '#ea580c' : '#059669'
  
  useFrame(({ clock }) => {
    if (meshRef.current && bottleneck) {
      meshRef.current.material.emissiveIntensity = 0.5 + Math.sin(clock.elapsedTime * 4) * 0.3
    }
  })
  
  return (
    <group position={position}>
      <Box ref={meshRef} args={[1, 1, 1]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={bottleneck ? 0.5 : 0.2}
        />
      </Box>
      <Html position={[0, 1.5, 0]}>
        <div className="bg-black/80 backdrop-blur-xl p-2 rounded text-white text-center text-xs">
          <div>{name}</div>
          <div className="text-green-400">{Math.round(efficiency * 100)}%</div>
        </div>
      </Html>
    </group>
  )
}

// Operations Intelligence Room
const OperationsIntelligenceRoom: React.FC = () => {
  const processes = useMemo(() => [
    { id: '1', name: 'Order Processing', efficiency: 0.95, position: [-4, 2, 0] as [number, number, number], bottleneck: false },
    { id: '2', name: 'Inventory', efficiency: 0.67, position: [0, 2, 0] as [number, number, number], bottleneck: true },
    { id: '3', name: 'Shipping', efficiency: 0.89, position: [4, 2, 0] as [number, number, number], bottleneck: false },
    { id: '4', name: 'Quality Control', efficiency: 0.92, position: [-2, -2, 0] as [number, number, number], bottleneck: false },
    { id: '5', name: 'Customer Service', efficiency: 0.78, position: [2, -2, 0] as [number, number, number], bottleneck: false },
  ], [])
  
  return (
    <>
      <fog attach="fog" args={['#475569', 10, 50]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {processes.map((process) => (
        <ProcessNode
          key={process.id}
          position={process.position}
          efficiency={process.efficiency}
          name={process.name}
          bottleneck={process.bottleneck}
        />
      ))}
      
      <group position={[0, 0, 0]}>
        <Cylinder args={[3, 3, 0.5, 32]}>
          <meshStandardMaterial
            color="#475569"
            emissive="#059669"
            emissiveIntensity={0.1}
            transparent
            opacity={0.3}
          />
        </Cylinder>
      </group>
    </>
  )
}

// Employee Node for HR
const EmployeeNode: React.FC<{
  position: [number, number, number]
  performance: number
  satisfaction: number
  name: string
}> = ({ position, performance, satisfaction, name }) => {
  const color = performance > 0.8 ? '#16a34a' : performance > 0.6 ? '#ca8a04' : '#dc2626'
  
  return (
    <group position={position}>
      <Sphere args={[0.3, 16, 16]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </Sphere>
      <Html position={[0, 0.8, 0]}>
        <div className="bg-black/80 backdrop-blur-xl p-2 rounded text-white text-center text-xs">
          <div>{name}</div>
          <div className="text-green-400">Perf: {Math.round(performance * 100)}%</div>
          <div className="text-blue-400">Sat: {Math.round(satisfaction * 100)}%</div>
        </div>
      </Html>
    </group>
  )
}

// HR Intelligence Room
const HRIntelligenceRoom: React.FC = () => {
  const employees = useMemo<EmployeeData[]>(() => [
    { id: '1', name: 'Alice Johnson', position: [-3, 2, 1], performance: 0.92, satisfaction: 0.88, skills: ['Leadership', 'Strategy'] },
    { id: '2', name: 'Bob Smith', position: [2, 1, -2], performance: 0.78, satisfaction: 0.75, skills: ['Development', 'Analytics'] },
    { id: '3', name: 'Carol Davis', position: [0, -1, 3], performance: 0.85, satisfaction: 0.90, skills: ['Design', 'UX'] },
    { id: '4', name: 'David Wilson', position: [-2, 0, -1], performance: 0.65, satisfaction: 0.60, skills: ['Sales', 'Communication'] },
    { id: '5', name: 'Eva Brown', position: [3, -2, 0], performance: 0.95, satisfaction: 0.92, skills: ['Engineering', 'Innovation'] },
  ], [])
  
  return (
    <>
      <fog attach="fog" args={['#581c87', 10, 50]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {employees.map((employee) => (
        <EmployeeNode
          key={employee.id}
          position={employee.position}
          performance={employee.performance}
          satisfaction={employee.satisfaction}
          name={employee.name}
        />
      ))}
      
      <group position={[0, -3, 0]}>
        <Cylinder args={[4, 1, 6, 8]}>
          <meshStandardMaterial
            color="#581c87"
            emissive="#16a34a"
            emissiveIntensity={0.1}
            transparent
            opacity={0.4}
          />
        </Cylinder>
      </group>
    </>
  )
}

// Campaign Ripples for Marketing
const CampaignRipples: React.FC = () => {
  const ripplesRef = useRef<(THREE.Mesh | null)[]>([])
  
  useFrame(({ clock }) => {
    ripplesRef.current.forEach((ripple, i) => {
      if (ripple) {
        const scale = 1 + Math.sin(clock.elapsedTime - i * 0.5) * 3
        ripple.scale.x = ripple.scale.z = Math.max(0.1, scale)
        if (ripple.material instanceof THREE.MeshBasicMaterial) {
          ripple.material.opacity = Math.max(0, 1 - scale / 4)
        }
      }
    })
  })
  
  return (
    <group>
      {[...Array(5)].map((_, i) => (
        <mesh 
          key={i} 
          ref={el => { ripplesRef.current[i] = el }}
          position={[0, 0.1 * i, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[1, 1.2, 64]} />
          <meshBasicMaterial
            color="#10b981"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

// Marketing Intelligence Room
const MarketingIntelligenceRoom: React.FC = () => {
  const campaigns = useMemo<CampaignData[]>(() => [
    { id: '1', name: 'Social Media Blast', roi: 3.2, reach: 50000, engagement: 0.08, position: [-4, 2, 0] },
    { id: '2', name: 'Email Campaign', roi: 4.1, reach: 25000, engagement: 0.12, position: [0, 3, 2] },
    { id: '3', name: 'Influencer Collab', roi: 2.8, reach: 75000, engagement: 0.06, position: [4, 1, -2] },
    { id: '4', name: 'Content Marketing', roi: 5.2, reach: 30000, engagement: 0.15, position: [-2, -1, 3] },
  ], [])
  
  return (
    <>
      <fog attach="fog" args={['#134e4a', 10, 50]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <CampaignRipples />
      
      <Sphere args={[3, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#134e4a"
          emissive="#10b981"
          emissiveIntensity={0.2}
          transparent
          opacity={0.6}
        />
      </Sphere>
      
      {campaigns.map((campaign, i) => (
        <group key={campaign.id} position={campaign.position}>
          <Box args={[0.8, 0.8, 0.8]}>
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={campaign.roi / 10}
            />
          </Box>
          <Html position={[0, 1.2, 0]}>
            <div className="bg-black/80 backdrop-blur-xl p-2 rounded text-white text-center text-xs">
              <div>{campaign.name}</div>
              <div className="text-green-400">ROI: {campaign.roi}x</div>
              <div className="text-blue-400">Reach: {campaign.reach.toLocaleString()}</div>
            </div>
          </Html>
        </group>
      ))}
    </>
  )
}

// Department Navigator
const DepartmentNavigator: React.FC<{
  currentDepartment: DepartmentId
  onSwitch: (dept: DepartmentId) => void
}> = ({ currentDepartment, onSwitch }) => {
  return (
    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex gap-2 bg-black/80 backdrop-blur-xl p-4 rounded-full border border-cyan-500/30">
        {departments.map(dept => (
          <button
            key={dept.id}
            onClick={() => onSwitch(dept.id)}
            className={`
              px-4 py-2 rounded-full transition-all duration-300 text-sm
              ${currentDepartment === dept.id 
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg' 
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'}
            `}
          >
            <span className="text-lg mr-2">{dept.icon}</span>
            <span className="hidden sm:inline">{dept.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Metrics Overlay
const MetricsOverlay: React.FC<{ department: DepartmentId }> = ({ department }) => {
  const metrics = {
    sales: [
      { label: 'Pipeline Value', value: '$2.4M', change: '+12%' },
      { label: 'Conversion Rate', value: '34%', change: '+8%' },
      { label: 'Avg Deal Size', value: '$45K', change: '+15%' },
    ],
    finance: [
      { label: 'Monthly Revenue', value: '$890K', change: '+23%' },
      { label: 'Operating Margin', value: '42%', change: '+5%' },
      { label: 'Cash Flow', value: '$156K', change: '+18%' },
    ],
    operations: [
      { label: 'Efficiency Score', value: '87%', change: '+11%' },
      { label: 'Cost Reduction', value: '$234K', change: '+28%' },
      { label: 'Process Speed', value: '2.3x', change: '+45%' },
    ],
    hr: [
      { label: 'Employee Satisfaction', value: '4.6/5', change: '+0.3' },
      { label: 'Retention Rate', value: '94%', change: '+7%' },
      { label: 'Productivity Index', value: '112', change: '+19%' },
    ],
    marketing: [
      { label: 'Campaign ROI', value: '4.2x', change: '+31%' },
      { label: 'Lead Quality', value: '78%', change: '+14%' },
      { label: 'Brand Awareness', value: '67%', change: '+22%' },
    ],
  }
  
  return (
    <div className="fixed top-6 left-6 z-40">
      <div className="bg-black/80 backdrop-blur-xl p-6 rounded-xl border border-cyan-500/30">
        <h2 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          {departments.find(d => d.id === department)?.name}
        </h2>
        <div className="space-y-3">
          {metrics[department].map((metric, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">{metric.label}</span>
              <div className="text-right">
                <div className="text-white font-semibold">{metric.value}</div>
                <div className="text-green-400 text-xs">{metric.change}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Loading Component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
  </div>
)

// Main Component
export default function DepartmentIntelligence(): JSX.Element {
  const [currentDepartment, setCurrentDepartment] = useState<DepartmentId>('sales')
  
  const renderDepartment = () => {
    switch (currentDepartment) {
      case 'sales':
        return <SalesIntelligenceRoom />
      case 'finance':
        return <FinancialIntelligenceRoom />
      case 'operations':
        return <OperationsIntelligenceRoom />
      case 'hr':
        return <HRIntelligenceRoom />
      case 'marketing':
        return <MarketingIntelligenceRoom />
      default:
        return <SalesIntelligenceRoom />
    }
  }
  
  const currentDept = departments.find(d => d.id === currentDepartment)
  
  return (
    <div className="h-screen w-full relative overflow-hidden">
      <div 
        className="absolute inset-0 transition-colors duration-1000"
        style={{ backgroundColor: currentDept?.bgColor || '#1a365d' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDepartment}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="h-full w-full"
          >
            <Canvas
              camera={{ position: [0, 5, 15], fov: 60 }}
              gl={{ antialias: true, alpha: false }}
            >
              <Suspense fallback={null}>
                {renderDepartment()}
                <OrbitControls 
                  enablePan={false}
                  minDistance={8}
                  maxDistance={25}
                  maxPolarAngle={Math.PI / 1.5}
                />
                <Environment preset="night" />
              </Suspense>
            </Canvas>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <MetricsOverlay department={currentDepartment} />
      <DepartmentNavigator 
        currentDepartment={currentDepartment} 
        onSwitch={setCurrentDepartment} 
      />
      
      {/* Header */}
      <div className="fixed top-6 right-6 z-40">
        <div className="bg-black/80 backdrop-blur-xl p-4 rounded-xl border border-cyan-500/30">
          <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            The Oracle
          </h1>
          <p className="text-gray-300 text-sm">Department Intelligence</p>
        </div>
      </div>
    </div>
  )
}