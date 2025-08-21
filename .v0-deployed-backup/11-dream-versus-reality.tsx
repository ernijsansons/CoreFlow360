'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Text3D, Html, Sky } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'

interface Metrics {
  [key: string]: number
}

interface ScenarioData {
  title: string
  environment: string
  owner: string
  metrics: Metrics
}

interface Scenario {
  current: ScenarioData
  dream: ScenarioData
}

interface Scenarios {
  [key: string]: Scenario
}

const scenarios: Scenarios = {
  office: {
    current: {
      title: 'Your Current Office',
      environment: 'Cluttered, stressful, overwhelming',
      owner: 'Exhausted, multitasking, reactive',
      metrics: {
        stress: 95,
        efficiency: 25,
        satisfaction: 15,
        control: 20
      }
    },
    dream: {
      title: 'Your Dream Office',
      environment: 'Clean, automated, intelligent',
      owner: 'Calm, strategic, proactive',
      metrics: {
        stress: 5,
        efficiency: 95,
        satisfaction: 95,
        control: 100
      }
    }
  },
  day: {
    current: {
      title: 'Your Current Day',
      environment: '14-hour workdays, constant interruptions',
      owner: 'Fighting fires, reactive decisions',
      metrics: {
        workHours: 14,
        interruptions: 47,
        personalTime: 0,
        sleepQuality: 20
      }
    },
    dream: {
      title: 'Your Dream Day',
      environment: '6-hour strategic work, automated operations',
      owner: 'Focused thinking, system oversight',
      metrics: {
        workHours: 6,
        interruptions: 2,
        personalTime: 8,
        sleepQuality: 95
      }
    }
  },
  week: {
    current: {
      title: 'Your Current Week',
      environment: '7-day grind, no breaks, declining health',
      owner: 'Burning out, relationships suffering',
      metrics: {
        workDays: 7,
        familyTime: 5,
        exerciseHours: 0,
        vacationDays: 0
      }
    },
    dream: {
      title: 'Your Dream Week',
      environment: '4-day work week, automated weekends',
      owner: 'Balanced, energized, growing',
      metrics: {
        workDays: 4,
        familyTime: 25,
        exerciseHours: 6,
        vacationDays: 52
      }
    }
  }
}

interface CoffeeCupProps {
  position: [number, number, number]
  opacity: number
  empty?: boolean
  perfect?: boolean
}

const CoffeeCup: React.FC<CoffeeCupProps> = ({ position, opacity, empty = false, perfect = false }) => {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.1, 0.1, 0.2]} />
        <meshStandardMaterial 
          color={perfect ? "#ffffff" : "#8B4513"}
          transparent 
          opacity={opacity}
        />
      </mesh>
      
      {!empty && (
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.02]} />
          <meshStandardMaterial 
            color={perfect ? "#4a90e2" : "#3e2723"}
            emissive={perfect ? "#4a90e2" : "#000000"}
            emissiveIntensity={perfect ? 0.3 : 0}
            transparent 
            opacity={opacity}
          />
        </mesh>
      )}
    </group>
  )
}

interface ClutteredOfficeProps {
  opacity: number
}

const ClutteredOffice: React.FC<ClutteredOfficeProps> = ({ opacity }) => {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6, 0.2, 3]} />
        <meshStandardMaterial 
          color="#8B4513" 
          transparent 
          opacity={opacity} 
        />
      </mesh>
      
      {[...Array(12)].map((_, i) => (
        <Float key={i} speed={1} rotationIntensity={0.2}>
          <mesh position={[
            -2.5 + (i % 5) * 1.2,
            0.5 + Math.random() * 1,
            -1 + Math.floor(i / 5) * 1
          ]}>
            <boxGeometry args={[0.3, Math.random() * 0.8 + 0.2, 0.2]} />
            <meshStandardMaterial 
              color="#f5f5dc" 
              transparent 
              opacity={opacity}
            />
          </mesh>
        </Float>
      ))}
      
      {[...Array(4)].map((_, i) => (
        <mesh key={i} position={[i * 0.8 - 1.2, 1, 0]}>
          <boxGeometry args={[0.6, 0.4, 0.05]} />
          <meshStandardMaterial 
            color="#333" 
            emissive="#ff0000" 
            emissiveIntensity={0.2}
            transparent 
            opacity={opacity}
          />
        </mesh>
      ))}
      
      {[...Array(8)].map((_, i) => (
        <CoffeeCup 
          key={i}
          position={[
            -2.5 + Math.random() * 5,
            0.3,
            -1 + Math.random() * 2
          ]}
          opacity={opacity}
          empty={Math.random() > 0.7}
        />
      ))}
    </group>
  )
}

interface AutomatedOfficeProps {
  opacity: number
}

const AutomatedOffice: React.FC<AutomatedOfficeProps> = ({ opacity }) => {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={opacity}
        />
      </mesh>
      
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.02]} />
        <meshStandardMaterial 
          color="#333" 
          emissive="#00ff88" 
          emissiveIntensity={0.3}
          transparent 
          opacity={opacity}
        />
      </mesh>
      
      {[...Array(3)].map((_, i) => (
        <Float key={i} speed={0.5} rotationIntensity={0.1}>
          <mesh position={[
            Math.cos(i * Math.PI * 2 / 3) * 3,
            2 + Math.sin(i) * 0.5,
            Math.sin(i * Math.PI * 2 / 3) * 3
          ]}>
            <planeGeometry args={[1, 0.8]} />
            <meshStandardMaterial 
              color="#4a90e2"
              emissive="#4a90e2"
              emissiveIntensity={0.5}
              transparent 
              opacity={opacity * 0.7}
            />
          </mesh>
        </Float>
      ))}
      
      <CoffeeCup 
        position={[1.5, 0.15, 0.5]}
        opacity={opacity}
        perfect={true}
      />
    </group>
  )
}

interface StressedOwnerFigureProps {
  position: [number, number, number]
  opacity: number
}

const StressedOwnerFigure: React.FC<StressedOwnerFigureProps> = ({ position, opacity }) => {
  const figureRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (figureRef.current) {
      figureRef.current.rotation.x = Math.sin(clock.elapsedTime * 10) * 0.2
      figureRef.current.position.x = Math.sin(clock.elapsedTime * 8) * 0.1
    }
  })
  
  return (
    <group ref={figureRef} position={position}>
      <mesh position={[0, 0, 0]} rotation={[0.2, 0, 0]}>
        <capsuleGeometry args={[0.3, 1]} />
        <meshStandardMaterial 
          color="#ff6b6b" 
          transparent 
          opacity={opacity}
        />
      </mesh>
      
      <mesh position={[0, 1.2, 0]} rotation={[0.1, 0, 0.1]}>
        <sphereGeometry args={[0.25]} />
        <meshStandardMaterial 
          color="#ff6b6b" 
          transparent 
          opacity={opacity}
        />
      </mesh>
      
      <mesh scale={2}>
        <sphereGeometry args={[1]} />
        <meshBasicMaterial 
          color="#ff0000"
          transparent
          opacity={opacity * 0.2}
        />
      </mesh>
    </group>
  )
}

interface PeacefulOwnerFigureProps {
  position: [number, number, number]
  opacity: number
}

const PeacefulOwnerFigure: React.FC<PeacefulOwnerFigureProps> = ({ position, opacity }) => {
  const figureRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (figureRef.current) {
      figureRef.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.05
      figureRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.1
    }
  })
  
  return (
    <group ref={figureRef} position={position}>
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.3, 1]} />
        <meshStandardMaterial 
          color="#4ecdc4" 
          transparent 
          opacity={opacity}
        />
      </mesh>
      
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.25]} />
        <meshStandardMaterial 
          color="#4ecdc4" 
          transparent 
          opacity={opacity}
        />
      </mesh>
      
      <mesh scale={1.5}>
        <sphereGeometry args={[1]} />
        <meshBasicMaterial 
          color="#00ff88"
          transparent
          opacity={opacity * 0.15}
        />
      </mesh>
    </group>
  )
}

interface ChaosParticlesProps {
  opacity: number
}

const ChaosParticles: React.FC<ChaosParticlesProps> = ({ opacity }) => {
  const particlesRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.elapsedTime * 0.5
    }
  })
  
  return (
    <group ref={particlesRef}>
      {[...Array(20)].map((_, i) => (
        <Float key={i} speed={2 + Math.random()} rotationIntensity={1}>
          <mesh position={[
            (Math.random() - 0.5) * 10,
            Math.random() * 5,
            (Math.random() - 0.5) * 10
          ]}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial 
              color="#ff0000"
              transparent
              opacity={opacity * 0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

interface SuccessParticlesProps {
  opacity: number
}

const SuccessParticles: React.FC<SuccessParticlesProps> = ({ opacity }) => {
  const particlesRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.elapsedTime * 0.2
    }
  })
  
  return (
    <group ref={particlesRef}>
      {[...Array(15)].map((_, i) => (
        <Float key={i} speed={0.5 + Math.random() * 0.5} rotationIntensity={0.3}>
          <mesh position={[
            (Math.random() - 0.5) * 8,
            Math.random() * 4 + 1,
            (Math.random() - 0.5) * 8
          ]}>
            <sphereGeometry args={[0.08]} />
            <meshBasicMaterial 
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={0.5}
              transparent
              opacity={opacity * 0.9}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

interface CurrentRealityProps {
  scenario: ScenarioData
  opacity: number
}

const CurrentReality: React.FC<CurrentRealityProps> = ({ scenario, opacity }) => {
  const sceneRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (sceneRef.current) {
      sceneRef.current.rotation.x = Math.sin(clock.elapsedTime * 3) * 0.1
      sceneRef.current.rotation.z = Math.sin(clock.elapsedTime * 2.5) * 0.05
      sceneRef.current.position.y = Math.sin(clock.elapsedTime * 4) * 0.2
    }
  })
  
  return (
    <group ref={sceneRef}>
      <ClutteredOffice opacity={opacity} />
      <StressedOwnerFigure position={[0, 0, 2]} opacity={opacity} />
      <ChaosParticles opacity={opacity} />
    </group>
  )
}

interface DreamRealityProps {
  scenario: ScenarioData
  opacity: number
}

const DreamReality: React.FC<DreamRealityProps> = ({ scenario, opacity }) => {
  const sceneRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (sceneRef.current) {
      sceneRef.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.1
      sceneRef.current.rotation.y = clock.elapsedTime * 0.1
    }
  })
  
  return (
    <group ref={sceneRef}>
      <AutomatedOffice opacity={opacity} />
      <PeacefulOwnerFigure position={[0, 0, 2]} opacity={opacity} />
      <SuccessParticles opacity={opacity} />
    </group>
  )
}

interface RealityDividerProps {
  position: number
  splitPosition: number
}

const RealityDivider: React.FC<RealityDividerProps> = ({ position, splitPosition }) => {
  const dividerRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (dividerRef.current) {
      dividerRef.current.scale.y = 1 + Math.sin(clock.elapsedTime * 2) * 0.1
      dividerRef.current.position.x = position
    }
  })
  
  return (
    <group ref={dividerRef}>
      <mesh>
        <boxGeometry args={[0.1, 20, 0.1]} />
        <meshBasicMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1}
        />
      </mesh>
      
      <mesh>
        <planeGeometry args={[2, 20]} />
        <meshBasicMaterial 
          color="#ffffff"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

interface MetricsComparisonProps {
  current: Metrics
  dream: Metrics
  splitPosition: number
}

const MetricsComparison: React.FC<MetricsComparisonProps> = ({ current, dream, splitPosition }) => {
  return (
    <group position={[0, 8, 0]}>
      <Float speed={0.5} floatIntensity={0.3}>
        <Html
          distanceFactor={15}
          transform
          occlude
        >
          <div className="bg-black/80 backdrop-blur-xl p-6 rounded-lg border border-white/30 min-w-[400px]">
            <h3 className="text-xl text-white mb-4 text-center">Reality Comparison</h3>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div></div>
              <div className="text-red-400 text-center font-bold">CURRENT</div>
              <div className="text-green-400 text-center font-bold">DREAM</div>
              
              {Object.keys(current).map(key => (
                <React.Fragment key={key}>
                  <div className="text-gray-300 capitalize">{key}:</div>
                  <div className="text-red-400 text-center font-mono">
                    {current[key]}
                  </div>
                  <div className="text-green-400 text-center font-mono">
                    {dream[key]}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </Html>
      </Float>
    </group>
  )
}

interface SplitControlUIProps {
  splitPosition: number
  onSplitChange: (position: number) => void
  scenarios: Scenarios
  currentScenario: string
  onScenarioChange: (scenario: string) => void
  isDragging: boolean
  onDraggingChange: (dragging: boolean) => void
}

const SplitControlUI: React.FC<SplitControlUIProps> = ({ 
  splitPosition, 
  onSplitChange, 
  scenarios, 
  currentScenario, 
  onScenarioChange,
  isDragging,
  onDraggingChange
}) => {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const rect = e.currentTarget.getBoundingClientRect()
      const newPosition = (e.clientX - rect.left) / rect.width
      onSplitChange(Math.max(0, Math.min(1, newPosition)))
    }
  }
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center">
        <h1 className="text-6xl font-thin text-white mb-4">
          Dream Versus Reality
        </h1>
        <p className="text-xl text-gray-300">
          Drag the divider to compare your current life with your future dream
        </p>
      </div>
      
      <div className="absolute top-10 left-10 bg-black/80 backdrop-blur-xl p-6 rounded-lg border border-violet-500/30 pointer-events-auto">
        <h3 className="text-xl text-violet-400 mb-4">Comparison View</h3>
        
        <div className="space-y-3">
          {Object.keys(scenarios).map(key => (
            <button
              key={key}
              onClick={() => onScenarioChange(key)}
              className={`w-full px-4 py-2 rounded transition-all ${
                currentScenario === key 
                  ? 'bg-violet-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)} View
            </button>
          ))}
        </div>
      </div>
      
      <div 
        className="absolute inset-0 cursor-ew-resize pointer-events-auto"
        onMouseDown={() => onDraggingChange(true)}
        onMouseUp={() => onDraggingChange(false)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => onDraggingChange(false)}
      >
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg shadow-white/50"
          style={{ left: `${splitPosition * 100}%` }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-black font-bold">⟷</span>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-20 left-10">
        <div className={`bg-red-900/80 backdrop-blur-xl p-4 rounded-lg border border-red-500/30 transition-opacity ${
          splitPosition > 0.8 ? 'opacity-30' : 'opacity-100'
        }`}>
          <h3 className="text-2xl text-red-400 mb-2">Current Reality</h3>
          <p className="text-white">{scenarios[currentScenario].current.title}</p>
          <p className="text-gray-300 text-sm">{scenarios[currentScenario].current.environment}</p>
        </div>
      </div>
      
      <div className="absolute bottom-20 right-10">
        <div className={`bg-emerald-900/80 backdrop-blur-xl p-4 rounded-lg border border-emerald-500/30 transition-opacity ${
          splitPosition < 0.2 ? 'opacity-30' : 'opacity-100'
        }`}>
          <h3 className="text-2xl text-emerald-400 mb-2">Dream Reality</h3>
          <p className="text-white">{scenarios[currentScenario].dream.title}</p>
          <p className="text-gray-300 text-sm">{scenarios[currentScenario].dream.environment}</p>
        </div>
      </div>
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="bg-black/90 backdrop-blur-xl px-6 py-3 rounded-full border border-white/30">
          <div className="flex items-center gap-4 text-lg font-mono">
            <span className={`${splitPosition < 0.5 ? 'text-red-400' : 'text-red-400/50'}`}>
              {Math.round((1 - splitPosition) * 100)}% Reality
            </span>
            <span className="text-white">|</span>
            <span className={`${splitPosition > 0.5 ? 'text-emerald-400' : 'text-emerald-400/50'}`}>
              {Math.round(splitPosition * 100)}% Dream
            </span>
          </div>
        </div>
      </div>
      
      {splitPosition > 0.9 && (
        <motion.div
          className="absolute left-1/2 bottom-20 transform -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl text-emerald-400 mb-4">This Dream Can Be Reality</h2>
          <p className="text-xl text-white mb-8">
            CoreFlow360 makes this transformation inevitable
          </p>
          <motion.button
            className="px-12 py-4 bg-emerald-500 text-black font-bold rounded-full text-xl hover:bg-emerald-400 transition-colors pointer-events-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Living the Dream
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}

export default function DreamVersusReality() {
  const [splitPosition, setSplitPosition] = useState<number>(0.5)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [currentScenario, setCurrentScenario] = useState<string>('office')
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-violet-900 via-gray-900 to-emerald-900">
      <Canvas 
        camera={{ position: [0, 5, 20], fov: 60 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={[
          THREE.MathUtils.lerp(0.05, 0.2, splitPosition),
          THREE.MathUtils.lerp(0.05, 0.3, splitPosition),
          THREE.MathUtils.lerp(0.1, 0.4, splitPosition)
        ]} />
        
        <ambientLight intensity={THREE.MathUtils.lerp(0.2, 1.2, splitPosition)} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={THREE.MathUtils.lerp(0.5, 2, splitPosition)}
        />
        
        <group position={[-20 * (1 - splitPosition), 0, 0]}>
          <CurrentReality 
            scenario={scenarios[currentScenario].current}
            opacity={1 - splitPosition + 0.5}
          />
        </group>
        
        <group position={[20 * splitPosition, 0, 0]}>
          <DreamReality 
            scenario={scenarios[currentScenario].dream}
            opacity={splitPosition + 0.5}
          />
        </group>
        
        <RealityDivider 
          position={THREE.MathUtils.lerp(-10, 10, splitPosition)}
          splitPosition={splitPosition}
        />
        
        <MetricsComparison 
          current={scenarios[currentScenario].current.metrics}
          dream={scenarios[currentScenario].dream.metrics}
          splitPosition={splitPosition}
        />
        
        <OrbitControls 
          enabled={!isDragging}
          autoRotate={splitPosition > 0.7}
          autoRotateSpeed={1}
        />
      </Canvas>
      
      <SplitControlUI 
        splitPosition={splitPosition}
        onSplitChange={setSplitPosition}
        scenarios={scenarios}
        currentScenario={currentScenario}
        onScenarioChange={setCurrentScenario}
        isDragging={isDragging}
        onDraggingChange={setIsDragging}
      />
    </div>
  )
}