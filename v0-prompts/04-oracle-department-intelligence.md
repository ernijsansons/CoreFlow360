# THE ORACLE: Department Intelligence Experiences

Create five revolutionary department-specific intelligence experiences that let business owners physically explore and interact with their future intelligent departments. Each department should be a unique 3D environment that demonstrates its specific intelligence capabilities.

## CORE CONCEPT
Transform abstract department functions into immersive 3D spaces where users can see, touch, and experience how intelligence transforms each aspect of their business. Each department is a room in their future business, alive with data, predictions, and autonomous operations.

## TECHNICAL FOUNDATION
Use React, Three.js, React Three Fiber, and Drei for all 3D experiences. Implement shared navigation between departments with smooth transitions. Each room should feel connected yet distinct.

---

## 1. SALES INTELLIGENCE: The Prediction Chamber

### Visual Design
- **Environment**: Futuristic circular room with floor-to-ceiling screens showing customer data streams
- **Center**: Holographic globe showing real-time customer locations and intent signals
- **Color Scheme**: Deep blues (#001840) with golden opportunity highlights (#FFD700)
- **Ambience**: Subtle hum of data processing, occasional "ping" of new opportunities

### Implementation
```tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, Text3D, MeshTransmissionMaterial } from '@react-three/drei'
import { Suspense, useRef, useMemo } from 'react'
import * as THREE from 'three'

const SalesIntelligenceRoom = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [predictions, setPredictions] = useState([])
  const globeRef = useRef()
  
  // Generate customer particles on globe
  const customerParticles = useMemo(() => {
    const particles = []
    for (let i = 0; i < 1000; i++) {
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      
      particles.push({
        position: [
          Math.sin(phi) * Math.cos(theta) * 5,
          Math.sin(phi) * Math.sin(theta) * 5,
          Math.cos(phi) * 5
        ],
        intent: Math.random(), // 0-1 purchase intent
        value: Math.random() * 100000,
        timeToClose: Math.random() * 90
      })
    }
    return particles
  }, [])
  
  return (
    <div className="h-screen bg-black">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <fog attach="fog" args={['#001840', 10, 50]} />
        <ambientLight intensity={0.1} />
        
        {/* Central Customer Globe */}
        <group ref={globeRef}>
          <mesh>
            <sphereGeometry args={[5, 64, 64]} />
            <MeshTransmissionMaterial
              color="#001840"
              transmission={0.9}
              thickness={1}
              roughness={0.1}
            />
          </mesh>
          
          {/* Customer Particles */}
          {customerParticles.map((customer, i) => (
            <CustomerParticle
              key={i}
              {...customer}
              onClick={() => setSelectedCustomer(customer)}
            />
          ))}
        </group>
        
        {/* Prediction Screens */}
        <CircularScreens predictions={predictions} />
        
        {/* Selected Customer Detail */}
        {selectedCustomer && (
          <CustomerIntelligence customer={selectedCustomer} />
        )}
        
        <OrbitControls 
          enablePan={false}
          minDistance={8}
          maxDistance={20}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <SalesMetricsOverlay />
    </div>
  )
}

// Customer particle component
const CustomerParticle = ({ position, intent, value, onClick }) => {
  const meshRef = useRef()
  const color = new THREE.Color().setHSL(intent * 0.3, 1, 0.5) // Red to green
  
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
```

### Interactive Elements
1. **Customer Globe**: Click particles to see detailed predictions
2. **Intent Heatmap**: Visual representation of purchase probability
3. **Timeline Projections**: Scroll through future to see when customers will buy
4. **Revenue Streams**: Golden flows showing money coming from each customer
5. **AI Coaching Whispers**: Floating text suggestions for each opportunity

### Key Features to Demonstrate
- **Predictive Lead Scoring**: See exactly who will buy and when
- **Lifetime Value Calculation**: Watch customer value grow over time
- **Next Best Action**: AI suggests optimal engagement for each lead
- **Churn Prevention**: Red alerts before customers consider leaving
- **Cross-sell Opportunities**: Golden connections between customers and products

---

## 2. FINANCIAL INTELLIGENCE: The Money Mind Palace

### Visual Design
- **Environment**: Crystal cathedral with flowing streams of money as light
- **Center**: Massive holographic balance sheet that updates in real-time
- **Color Scheme**: Gold (#FFD700) streams, emerald (#50C878) profits, ruby (#DC143C) warnings
- **Ambience**: Gentle chimes for positive cash flow, subtle warnings for risks

### Implementation
```tsx
const FinancialIntelligenceRoom = () => {
  const [cashFlows, setCashFlows] = useState([])
  const [futureProjections, setFutureProjections] = useState({})
  
  return (
    <Canvas camera={{ position: [0, 10, 20] }}>
      <color attach="background" args={['#0a0a0a']} />
      
      {/* Money Flow Streams */}
      <MoneyFlowSystem flows={cashFlows} />
      
      {/* Central Financial Brain */}
      <group position={[0, 0, 0]}>
        <FinancialBrain data={futureProjections} />
        
        {/* Orbiting Metrics */}
        <OrbitingMetrics metrics={[
          { label: 'Cash Runway', value: '18 months', angle: 0 },
          { label: 'Burn Rate', value: '$45K/mo', angle: Math.PI / 3 },
          { label: 'Revenue Growth', value: '+34%', angle: 2 * Math.PI / 3 },
          { label: 'Profit Margin', value: '42%', angle: Math.PI },
        ]} />
      </group>
      
      {/* Future Timeline */}
      <TimelineCorridor position={[0, -5, 0]} />
      
      {/* Risk Alerts */}
      <RiskRadar position={[10, 5, 0]} />
    </Canvas>
  )
}

// Money flow particle system
const MoneyFlowSystem = ({ flows }) => {
  const particlesRef = useRef()
  
  useFrame(({ clock }) => {
    if (!particlesRef.current) return
    
    const positions = particlesRef.current.geometry.attributes.position
    const time = clock.elapsedTime
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const z = positions.getZ(i)
      
      // Create spiraling money flows
      const angle = time + i * 0.1
      const radius = 2 + Math.sin(time + i) * 0.5
      
      positions.setXYZ(
        i,
        Math.cos(angle) * radius,
        y + 0.1,
        Math.sin(angle) * radius
      )
      
      // Reset at top
      if (y > 20) positions.setY(i, -10)
    }
    
    positions.needsUpdate = true
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={5000}
          array={new Float32Array(15000)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#FFD700"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
```

### Interactive Elements
1. **Cash Flow Rivers**: Touch to trace money sources and destinations
2. **Future Timeline**: Scroll through time to see financial projections
3. **Risk Radar**: Real-time alerts for financial dangers
4. **Investment Opportunities**: Glowing orbs showing ROI potential
5. **Expense Optimization**: AI suggestions floating as cost-cutting ideas

---

## 3. OPERATIONS INTELLIGENCE: The Autonomous Factory

### Visual Design
- **Environment**: Vast warehouse with self-organizing processes as mechanical flows
- **Center**: Giant gear system that optimizes itself
- **Color Scheme**: Industrial silver (#C0C0C0), efficiency green (#00FF00), warning orange (#FF8C00)
- **Ambience**: Rhythmic mechanical sounds that sync perfectly

### Implementation
```tsx
const OperationsIntelligenceRoom = () => {
  return (
    <Canvas>
      {/* Self-Organizing Process Flows */}
      <ProcessFlowSystem />
      
      {/* Central Optimization Engine */}
      <group position={[0, 0, 0]}>
        <OptimizationGears />
        <EfficiencyParticles />
      </group>
      
      {/* Bottleneck Detection System */}
      <BottleneckRadar />
      
      {/* Autonomous Robots */}
      <AutonomousAgents />
    </Canvas>
  )
}

// Self-organizing process visualization
const ProcessFlowSystem = () => {
  const processRef = useRef()
  const [processes, setProcesses] = useState(generateProcesses())
  
  useFrame(() => {
    // Processes self-organize into optimal configuration
    processes.forEach(process => {
      process.efficiency += (1 - process.efficiency) * 0.01
      process.position.x += (process.optimalPosition.x - process.position.x) * 0.02
      process.position.y += (process.optimalPosition.y - process.position.y) * 0.02
    })
  })
  
  return (
    <group ref={processRef}>
      {processes.map((process, i) => (
        <ProcessNode key={i} {...process} />
      ))}
    </group>
  )
}
```

### Interactive Elements
1. **Process Nodes**: Drag to reorganize, watch AI optimize automatically
2. **Efficiency Meters**: Real-time efficiency percentages above each process
3. **Bottleneck Highlighter**: Red pulsing on slow processes
4. **Resource Allocation**: Watch resources flow to where needed most
5. **Predictive Maintenance**: Equipment glows before it needs service

---

## 4. HR INTELLIGENCE: The Human Potential Observatory

### Visual Design
- **Environment**: Serene space with constellation of employee connections
- **Center**: Talent tree growing and evolving
- **Color Scheme**: Warm amber (#FFBF00), growth green (#7CFC00), harmony blue (#4169E1)
- **Ambience**: Heartbeat rhythms, occasional inspiration chimes

### Implementation
```tsx
const HRIntelligenceRoom = () => {
  const [employees, setEmployees] = useState([])
  const [connections, setConnections] = useState([])
  
  return (
    <Canvas>
      {/* Employee Constellation */}
      <EmployeeNetwork employees={employees} connections={connections} />
      
      {/* Central Talent Tree */}
      <TalentTree position={[0, -5, 0]} />
      
      {/* Mood & Culture Visualization */}
      <CultureAura />
      
      {/* Performance Predictions */}
      <PerformanceProjections />
    </Canvas>
  )
}

// Employee network visualization
const EmployeeNetwork = ({ employees, connections }) => {
  return (
    <group>
      {employees.map((employee, i) => (
        <EmployeeNode key={i} {...employee} />
      ))}
      {connections.map((connection, i) => (
        <ConnectionLine key={i} {...connection} />
      ))}
    </group>
  )
}
```

### Interactive Elements
1. **Employee Nodes**: Click to see potential, skills, happiness
2. **Team Chemistry**: Glowing connections show strong collaborations
3. **Growth Paths**: Animated career progression possibilities
4. **Culture Pulse**: Real-time organization mood visualization
5. **Talent Magnets**: See what attracts top performers

---

## 5. MARKETING INTELLIGENCE: The Influence Amplifier

### Visual Design
- **Environment**: Stadium-like space with campaign effects rippling outward
- **Center**: Giant sphere showing brand perception in real-time
- **Color Scheme**: Electric purple (#9D00FF), viral pink (#FF1493), impact white (#FFFFFF)
- **Ambience**: Crowd murmurs, viral notification sounds

### Implementation
```tsx
const MarketingIntelligenceRoom = () => {
  return (
    <Canvas>
      {/* Campaign Ripple Effects */}
      <CampaignRipples />
      
      {/* Brand Perception Sphere */}
      <BrandPerceptionCore />
      
      {/* Viral Prediction Paths */}
      <ViralPathways />
      
      {/* ROI Visualization */}
      <ROIFountains />
    </Canvas>
  )
}

// Campaign ripple effect system
const CampaignRipples = () => {
  const ripplesRef = useRef([])
  
  useFrame(({ clock }) => {
    ripplesRef.current.forEach((ripple, i) => {
      if (ripple) {
        ripple.scale.x = ripple.scale.y = 1 + Math.sin(clock.elapsedTime - i) * 5
        ripple.material.opacity = Math.max(0, 1 - ripple.scale.x / 10)
      }
    })
  })
  
  return (
    <group>
      {[...Array(5)].map((_, i) => (
        <mesh key={i} ref={el => ripplesRef.current[i] = el} position={[0, 0.1 * i, 0]}>
          <ringGeometry args={[1, 1.2, 64]} />
          <meshBasicMaterial
            color="#FF1493"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}
```

### Interactive Elements
1. **Campaign Launcher**: Throw campaigns and watch impact ripple
2. **Audience Segments**: 3D clusters showing customer groups
3. **Viral Predictor**: See which content will explode
4. **Sentiment Flows**: Real-time brand perception changes
5. **ROI Fountains**: Money flowing from marketing efforts

---

## SHARED NAVIGATION SYSTEM

### Department Switcher
```tsx
const DepartmentNavigator = ({ currentDepartment, onSwitch }) => {
  const departments = [
    { id: 'sales', name: 'Sales Intelligence', icon: '🎯' },
    { id: 'finance', name: 'Financial Intelligence', icon: '💰' },
    { id: 'operations', name: 'Operations Intelligence', icon: '⚙️' },
    { id: 'hr', name: 'HR Intelligence', icon: '👥' },
    { id: 'marketing', name: 'Marketing Intelligence', icon: '📣' }
  ]
  
  return (
    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex gap-4 bg-black/80 backdrop-blur-xl p-4 rounded-full border border-cyan-500/30">
        {departments.map(dept => (
          <button
            key={dept.id}
            onClick={() => onSwitch(dept.id)}
            className={`
              px-6 py-3 rounded-full transition-all duration-300
              ${currentDepartment === dept.id 
                ? 'bg-cyan-500 text-black' 
                : 'bg-gray-800 text-white hover:bg-gray-700'}
            `}
          >
            <span className="text-2xl mr-2">{dept.icon}</span>
            <span className="text-sm">{dept.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

### Transition Effects
```tsx
const DepartmentTransition = ({ from, to, children }) => {
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        rotateY: from < to ? -90 : 90,
        scale: 0.8
      }}
      animate={{ 
        opacity: 1,
        rotateY: 0,
        scale: 1
      }}
      exit={{ 
        opacity: 0,
        rotateY: from < to ? 90 : -90,
        scale: 0.8
      }}
      transition={{ 
        duration: 0.8,
        ease: [0.43, 0.13, 0.23, 0.96]
      }}
      style={{ perspective: 1000 }}
    >
      {children}
    </motion.div>
  )
}
```

## UNIVERSAL INTERACTIONS

### Voice Commands
```typescript
const voiceCommands = {
  "Show me sales predictions": () => navigateTo('sales'),
  "What's our cash flow": () => navigateTo('finance'),
  "Find bottlenecks": () => navigateTo('operations'),
  "Show team performance": () => navigateTo('hr'),
  "Campaign results": () => navigateTo('marketing')
}
```

### Gesture Controls
- **Pinch**: Zoom in/out of visualizations
- **Swipe**: Navigate between departments
- **Tap and Hold**: Deep dive into specific metrics
- **Two-finger Rotate**: Orbit around 3D visualizations

## SOUND DESIGN

```typescript
const departmentSounds = {
  sales: {
    ambient: 'neural_marketplace.mp3',
    interaction: 'opportunity_ping.mp3',
    success: 'deal_closed.mp3'
  },
  finance: {
    ambient: 'money_flow.mp3',
    interaction: 'coin_clink.mp3',
    success: 'profit_chime.mp3'
  },
  operations: {
    ambient: 'efficient_machinery.mp3',
    interaction: 'gear_click.mp3',
    success: 'optimization_complete.mp3'
  },
  hr: {
    ambient: 'human_harmony.mp3',
    interaction: 'connection_made.mp3',
    success: 'team_celebration.mp3'
  },
  marketing: {
    ambient: 'crowd_energy.mp3',
    interaction: 'viral_burst.mp3',
    success: 'campaign_success.mp3'
  }
}
```

## PERFORMANCE OPTIMIZATION

- Use LOD (Level of Detail) for complex visualizations
- Implement frustum culling for off-screen elements
- Use instanced meshes for repeated elements
- Lazy load department scenes
- Progressive enhancement for mobile devices

## SUCCESS METRICS

- Users explore average of 3.5 departments per session
- 85% interact with at least one predictive element
- Average time in experience: 5+ minutes
- 90% report "feeling the intelligence"
- High social sharing of department screenshots

This Oracle experience transforms abstract business departments into tangible, explorable intelligences that users can see, touch, and command, making the promise of business intelligence viscerally real.