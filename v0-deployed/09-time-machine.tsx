```tsx
'use client'

import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Text3D, Html, Sphere, Trail, Text, Box, Cylinder } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'

interface Scenario {
  title: string
  businessState: string
  ownerState: string
  revenueGrowth: string
  details: string[]
}

interface TimeMachineCockpitProps {
  visible: boolean
  timeDestination: number
  onDestinationChange: (value: number) => void
  onTravel: () => void
  traveling: boolean
}

interface TimeStreamVisualizationProps {
  progress: number
  destination: number
}

interface FutureOfficeSceneProps {
  scenario: Scenario
}

interface OwnerFigureProps {
  position: [number, number, number]
  state: 'stressed' | 'peaceful'
  animation: 'typing' | 'reading'
}

interface TimeSelectorProps {
  value: number
  onChange: (value: number) => void
  position: [number, number, number]
  onHover: (value: string | null) => void
}

interface TravelButtonProps {
  position: [number, number, number]
  onClick: () => void
  disabled: boolean
  glowing: boolean
}

interface StatusDisplayProps {
  position: [number, number, number]
  label: string
  value: string
  color: string
}

interface ComputerProps {
  position: [number, number, number]
  screenContent: 'stress' | 'dashboard'
  glowing?: boolean
}

interface CoffeeCupProps {
  position: [number, number, number]
  empty: boolean
}

interface TimeMachineUIProps {
  currentState: 'present' | 'traveling' | 'future'
  timeDestination: number
  scenario: Scenario | null
  onReset: () => void
}

interface TimeRippleProps {
  delay: number
}

interface BusinessGrowthVisualizationProps {
  growth: string
}

interface AchievementBadgesProps {
  achievements: string[]
}

const scenarios: Record<number, Scenario> = {
  1: {
    title: '1 Year Later: Intelligence Emergence',
    businessState: 'Automated processes running smoothly',
    ownerState: 'Working 4 days/week, stress reduced by 60%',
    revenueGrowth: '150%',
    details: [
      'AI handles 80% of customer inquiries',
      'Predictive maintenance prevents 95% of issues',
      'Automated invoicing and follow-ups',
      'First vacation in 3 years without checking phone'
    ]
  },
  2: {
    title: '2 Years Later: Multiplication Mastery',
    businessState: 'Self-improving business organism',
    ownerState: 'Working 3 days/week, traveling monthly',
    revenueGrowth: '400%',
    details: [
      'Business makes decisions without owner input',
      'AI predicts market changes 6 months ahead',
      'Automated expansion into 3 new markets',
      'Second business launched with zero manual setup'
    ]
  },
  3: {
    title: '3 Years Later: Consciousness Achieved',
    businessState: 'Autonomous business consciousness',
    ownerState: 'Passive income, pursuing passions full-time',
    revenueGrowth: '1000%+',
    details: [
      'Business teaches itself new capabilities',
      'AI creates and launches new products autonomously',
      'Customers report "magical" experiences',
      'Owner becomes an investor in other businesses'
    ]
  }
}

const StressParticles: React.FC = () => {
  const particlesRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, i) => {
        particle.position.y += Math.sin(clock.elapsedTime + i) * 0.01
        particle.rotation.z = clock.elapsedTime + i
      })
    }
  })
  
  return (
    <group ref={particlesRef}>
      {[...Array(20)].map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 10,
            2 + Math.random() * 3,
            (Math.random() - 0.5) * 10
          ]}
        >
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="#ff6b6b" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

const Computer: React.FC<ComputerProps> = ({ position, screenContent, glowing = false }) => {
  const screenRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (screenRef.current && glowing) {
      const intensity = 0.5 + Math.sin(clock.elapsedTime * 2) * 0.3
      ;(screenRef.current.material as THREE.MeshBasicMaterial).emissiveIntensity = intensity
    }
  })
  
  return (
    <group position={position}>
      {/* Laptop base */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[1.5, 0.1, 1]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Screen */}
      <mesh ref={screenRef} position={[0, 0.4, -0.4]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[1.4, 0.9, 0.05]} />
        <meshBasicMaterial 
          color={screenContent === 'stress' ? '#ff4444' : '#00ff88'}
          emissive={screenContent === 'stress' ? '#ff0000' : '#00ff00'}
          emissiveIntensity={glowing ? 0.5 : 0.2}
        />
      </mesh>
    </group>
  )
}

const CoffeeCup: React.FC<CoffeeCupProps> = ({ position, empty }) => {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.1, 0.08, 0.15]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {!empty && (
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.02]} />
          <meshStandardMaterial color="#3e2723" />
        </mesh>
      )}
    </group>
  )
}

const OwnerFigure: React.FC<OwnerFigureProps> = ({ position, state, animation }) => {
  const figureRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (figureRef.current) {
      if (animation === 'typing') {
        figureRef.current.rotation.x = Math.sin(clock.elapsedTime * 10) * 0.1
      } else if (animation === 'reading') {
        figureRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.5) * 0.02
      }
    }
  })
  
  const figureColor = state === 'stressed' ? '#ff6b6b' : '#4ecdc4'
  
  return (
    <group ref={figureRef} position={position}>
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.3, 1]} />
        <meshStandardMaterial color={figureColor} />
      </mesh>
      
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.25]} />
        <meshStandardMaterial color={figureColor} />
      </mesh>
      
      <mesh scale={state === 'stressed' ? 1.5 : 1.2}>
        <sphereGeometry args={[1]} />
        <meshBasicMaterial 
          color={figureColor}
          transparent
          opacity={state === 'stressed' ? 0.3 : 0.1}
        />
      </mesh>
    </group>
  )
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ value, onChange, position, onHover }) => {
  const selectorRef = useRef<THREE.Mesh>(null)
  const [localHovered, setLocalHovered] = useState(false)
  
  useFrame(({ clock }) => {
    if (selectorRef.current && localHovered) {
      selectorRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 5) * 0.1)
    }
  })
  
  return (
    <group position={position}>
      {[1, 2, 3].map((year) => (
        <group key={year} position={[(year - 2) * 1.2, 0, 0]}>
          <mesh
            ref={value === year ? selectorRef : null}
            onClick={() => onChange(year)}
            onPointerOver={() => {
              setLocalHovered(value === year)
              onHover(`${year} year${year > 1 ? 's' : ''}`)
            }}
            onPointerOut={() => {
              setLocalHovered(false)
              onHover(null)
            }}
          >
            <cylinderGeometry args={[0.3, 0.3, 0.1]} />
            <meshPhysicalMaterial
              color={value === year ? "#00ffff" : "#333333"}
              emissive={value === year ? "#00ffff" : "#000000"}
              emissiveIntensity={value === year ? 0.5 : 0}
            />
          </mesh>
          
          <Text
            font="/fonts/Inter-Bold.ttf"
            fontSize={0.2}
            position={[0, 0, 0.1]}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {year}Y
          </Text>
        </group>
      ))}
    </group>
  )
}

const TravelButton: React.FC<TravelButtonProps> = ({ position, onClick, disabled, glowing }) => {
  const buttonRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (buttonRef.current && glowing && !disabled) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 3) * 0.2
      buttonRef.current.scale.setScalar(pulse)
    }
  })
  
  return (
    <group position={position}>
      <mesh
        ref={buttonRef}
        onClick={disabled ? undefined : onClick}
        onPointerOver={() => !disabled && document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'default'}
      >
        <sphereGeometry args={[0.4]} />
        <meshPhysicalMaterial
          color={disabled ? "#666666" : "#ff4444"}
          emissive={disabled ? "#000000" : "#ff0000"}
          emissiveIntensity={glowing && !disabled ? 1 : 0}
        />
      </mesh>
      
      <Text
        font="/fonts/Inter-Bold.ttf"
        fontSize={0.15}
        position={[0, 0, 0.41]}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {disabled ? 'TRAVELING' : 'TRAVEL'}
      </Text>
    </group>
  )
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ position, label, value, color }) => {
  return (
    <group position={position}>
      <Text
        font="/fonts/Inter-Regular.ttf"
        fontSize={0.1}
        position={[0, 0.2, 0]}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      
      <Text
        font="/fonts/Inter-Bold.ttf"
        fontSize={0.15}
        position={[0, 0, 0]}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>
    </group>
  )
}

const TimeRipple: React.FC<TimeRippleProps> = ({ delay }) => {
  const rippleRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (rippleRef.current) {
      const time = clock.elapsedTime - delay
      if (time > 0) {
        const scale = 1 + (time % 2) * 5
        const opacity = Math.max(0, 1 - (time % 2) / 2)
        rippleRef.current.scale.setScalar(scale)
        ;(rippleRef.current.material as THREE.MeshBasicMaterial).opacity = opacity
      }
    }
  })
  
  return (
    <mesh ref={rippleRef}>
      <ringGeometry args={[1, 1.2, 32]} />
      <meshBasicMaterial color="#4a90e2" transparent />
    </mesh>
  )
}

const ProfitStreamVisualization: React.FC = () => {
  const streamRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (streamRef.current) {
      streamRef.current.children.forEach((stream, i) => {
        stream.position.y = 3 + Math.sin(clock.elapsedTime + i) * 0.5
        stream.rotation.z = clock.elapsedTime * 0.5
      })
    }
  })
  
  return (
    <group ref={streamRef}>
      {[...Array(6)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * Math.PI / 3) * 4,
            3,
            Math.sin(i * Math.PI / 3) * 4
          ]}
        >
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
      ))}
    </group>
  )
}

const AIAssistants: React.FC = () => {
  const assistantsRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (assistantsRef.current) {
      assistantsRef.current.children.forEach((assistant, i) => {
        assistant.position.y = 1 + Math.sin(clock.elapsedTime + i * 2) * 0.3
        assistant.rotation.y = clock.elapsedTime * 0.5 + i
      })
    }
  })
  
  return (
    <group ref={assistantsRef}>
      {[...Array(4)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * Math.PI / 2) * 6,
            1,
            Math.sin(i * Math.PI / 2) * 6
          ]}
        >
          <octahedronGeometry args={[0.3]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

const CustomerSatisfactionIndicators: React.FC = () => {
  return (
    <group>
      {[...Array(8)].map((_, i) => (
        <Float key={i} speed={2} floatIntensity={1}>
          <mesh
            position={[
              (Math.random() - 0.5) * 15,
              4 + Math.random() * 2,
              (Math.random() - 0.5) * 15
            ]}
          >
            <sphereGeometry args={[0.15]} />
            <meshBasicMaterial color="#ffff00" />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

const BusinessGrowthVisualization: React.FC<BusinessGrowthVisualizationProps> = ({ growth }) => {
  const growthRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (growthRef.current) {
      growthRef.current.rotation.y = clock.elapsedTime * 0.2
    }
  })
  
  const growthValue = parseInt(growth.replace(/[^\d]/g, '')) || 100
  const bars = Math.min(10, Math.floor(growthValue / 100))
  
  return (
    <group ref={growthRef} position={[8, 0, 0]}>
      {[...Array(bars)].map((_, i) => (
        <mesh key={i} position={[0, i * 0.5, 0]}>
          <boxGeometry args={[0.5, 0.4, 0.5]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
      ))}
    </group>
  )
}

const AchievementBadges: React.FC<AchievementBadgesProps> = ({ achievements }) => {
  return (
    <group>
      {achievements.map((_, i) => (
        <Float key={i} speed={1} floatIntensity={0.5}>
          <mesh
            position={[
              Math.cos(i * Math.PI / 2) * 8,
              5 + i * 0.5,
              Math.sin(i * Math.PI / 2) * 8
            ]}
          >
            <cylinderGeometry args={[0.3, 0.3, 0.1]} />
            <meshBasicMaterial color="#ffd700" />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

const PresentOfficeScene: React.FC = () => {
  const sceneRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (sceneRef.current) {
      sceneRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.2) * 0.02
    }
  })
  
  return (
    <group ref={sceneRef}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6, 0.2, 3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {[...Array(8)].map((_, i) => (
        <mesh 
          key={i}
          position={[
            -2 + (i % 4) * 1.3,
            0.5 + Math.random() * 0.5,
            -1 + Math.floor(i / 4) * 2
          ]}
        >
          <boxGeometry args={[0.3, Math.random() * 0.8, 0.2]} />
          <meshStandardMaterial color="#f5f5dc" />
        </mesh>
      ))}
      
      <Computer position={[0, 1, 0]} screenContent="stress" />
      
      {[...Array(5)].map((_, i) => (
        <CoffeeCup 
          key={i}
          position={[
            -2.5 + i * 1.2,
            0.3,
            1
          ]}
          empty={Math.random() > 0.3}
        />
      ))}
      
      <StressParticles />
      
      <OwnerFigure 
        position={[0, 2, 3]}
        state="stressed"
        animation="typing"
      />
    </group>
  )
}

const TimeMachineCockpit: React.FC<TimeMachineCockpitProps> = ({ 
  visible, 
  timeDestination, 
  onDestinationChange, 
  onTravel, 
  traveling 
}) => {
  const cockpitRef = useRef<THREE.Group>(null)
  const [hoveredControl, setHoveredControl] = useState<string | null>(null)
  
  useFrame(({ clock }) => {
    if (cockpitRef.current && traveling) {
      cockpitRef.current.position.x = Math.sin(clock.elapsedTime * 20) * 0.1
      cockpitRef.current.position.y = Math.sin(clock.elapsedTime * 25) * 0.1
      cockpitRef.current.position.z = Math.sin(clock.elapsedTime * 15) * 0.1
    }
  })
  
  if (!visible) return null
  
  return (
    <group ref={cockpitRef} position={[0, 0, 5]}>
      <mesh>
        <sphereGeometry args={[3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#1a1a2e"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      <group position={[0, -1, 2]}>
        <TimeSelector
          value={timeDestination}
          onChange={onDestinationChange}
          position={[0, 0, 0]}
          onHover={setHoveredControl}
        />
        
        <TravelButton
          position={[0, -0.8, 0]}
          onClick={onTravel}
          disabled={traveling}
          glowing={!traveling}
        />
        
        <StatusDisplay
          position={[-2, 0, 0]}
          label="TEMPORAL FLUX"
          value={traveling ? "ACTIVE" : "STABLE"}
          color={traveling ? "#ff0000" : "#00ff00"}
        />
        
        <StatusDisplay
          position={[2, 0, 0]}
          label="CONSCIOUSNESS"
          value="READY"
          color="#00ffff"
        />
      </group>
      
      {[...Array(8)].map((_, i) => (
        <pointLight
          key={i}
          position={[
            Math.cos(i * Math.PI / 4) * 2.5,
            -0.5,
            Math.sin(i * Math.PI / 4) * 2.5
          ]}
          color="#00ffff"
          intensity={traveling ? 2 : 0.5}
          distance={3}
        />
      ))}
    </group>
  )
}

const TimeStreamVisualization: React.FC<TimeStreamVisualizationProps> = ({ progress, destination }) => {
  const streamRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<(THREE.Mesh | null)[]>([])
  
  useFrame(({ clock }) => {
    if (streamRef.current) {
      streamRef.current.rotation.z = clock.elapsedTime * 2
    }
    
    particlesRef.current.forEach((particle, i) => {
      if (particle) {
        const speed = 10 + i * 0.5
        particle.position.z += speed * 0.1
        
        if (particle.position.z > 50) {
          particle.position.z = -50
          particle.position.x = (Math.random() - 0.5) * 20
          particle.position.y = (Math.random() - 0.5) * 20
        }
        
        const hue = destination * 0.1
        ;(particle.material as THREE.MeshBasicMaterial).color.setHSL(hue, 1, 0.5)
      }
    })
  })
  
  return (
    <group ref={streamRef}>
      <mesh>
        <cylinderGeometry args={[10, 1, 100, 32]} />
        <meshBasicMaterial 
          color="#4a90e2"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {[...Array(200)].map((_, i) => (
        <mesh
          key={i}
          ref={el => particlesRef.current[i] = el}
          position={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            -50 + (i / 200) * 100
          ]}
        >
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial 
            color={new THREE.Color().setHSL(destination * 0.1, 1, 0.5)}
          />
        </mesh>
      ))}
      
      {[...Array(5)].map((_, i) => (
        <TimeRipple key={i} delay={i * 0.5} />
      ))}
      
      <Float speed={2} floatIntensity={2}>
        <Text
          font="/fonts/Inter-Bold.ttf"
          fontSize={2}
          position={[0, 0, 20]}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {destination} YEAR{destination > 1 ? 'S' : ''} LATER
        </Text>
      </Float>
    </group>
  )
}

const FutureOfficeScene: React.FC<FutureOfficeSceneProps> = ({ scenario }) => {
  const sceneRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (sceneRef.current) {
      sceneRef.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.1
    }
  })
  
  return (
    <group ref={sceneRef}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 0.1, 2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      <Computer 
        position={[0, 0.5, 0]} 
        screenContent="dashboard"
        glowing={true}
      />
      
      <OwnerFigure 
        position={[-3, 2, 2]}
        state="peaceful"
        animation="reading"
      />
      
      <ProfitStreamVisualization />
      <AIAssistants />
      <CustomerSatisfactionIndicators />
      <BusinessGrowthVisualization growth={scenario.revenueGrowth} />
      <AchievementBadges achievements={scenario.details} />
    </group>
  )
}

const TimeMachineUI: React.FC<TimeMachineUIProps> = ({ currentState, timeDestination, scenario, onReset }) => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center">
        <h1 className="text-6xl font-thin text-white mb-4 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          Business Time Machine
        </h1>
        <p className="text-xl text-gray-400">
          Witness your future self living the dream
        </p>
      </div>
      
      {currentState === 'present' && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-lg text-white mb-4">
            Select your destination and witness your transformed future
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <span>🕐 1 Year: Intelligence Emergence</span>
            <span>🕑 2 Years: Multiplication Mastery</span>
            <span>🕒 3 Years: Consciousness Achieved</span>
          </div>
        </div>
      )}
      
      {currentState === 'traveling' && (
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <motion.div
            className="text-4xl text-white mb-8"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            TRAVELING THROUGH TIME...
          </motion.div>
          <div className="text-xl text-cyan-400">
            Destination: {timeDestination} year{timeDestination > 1 ? 's' : ''} in the future
          </div>
        </div>
      )}
      
      {currentState === 'future' && scenario && (
        <>
          <div className="absolute top-10 right-10 bg-white/10 backdrop-blur-xl p-6 rounded-lg border border-emerald-500/30 max-w-md">
            <h3 className="text