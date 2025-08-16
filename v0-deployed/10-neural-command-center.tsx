'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Float, Text3D, Line, Sphere, Html, MeshDistortMaterial, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'

interface BusinessSystem {
  id: string
  name: string
  position: [number, number, number]
  color: string
  description: string
  neuralFunction: string
  connections: string[]
}

interface NeuralSignal {
  id: number
  from: string
  to: string
  startTime: number
  duration: number
}

const NeuralCommandCenter: React.FC = () => {
  const [activeConnection, setActiveConnection] = useState<string | null>(null)
  const [brainActivity, setBrainActivity] = useState<number>(0.3)
  const [connectedSystems, setConnectedSystems] = useState<string[]>([])
  const [neuralSignals, setNeuralSignals] = useState<NeuralSignal[]>([])
  const [consciousnessLevel, setConsciousnessLevel] = useState<number>(1)
  
  const businessSystems: BusinessSystem[] = [
    {
      id: 'sales',
      name: 'Sales Cortex',
      position: [-8, 4, 2],
      color: '#ff6b9d',
      description: 'Customer relationship neural pathways',
      neuralFunction: 'Pattern recognition for lead conversion',
      connections: ['marketing', 'finance']
    },
    {
      id: 'marketing',
      name: 'Marketing Lobe',
      position: [8, 4, 2],
      color: '#4ecdc4',
      description: 'Brand perception and campaign neural networks',
      neuralFunction: 'Creative synthesis and audience targeting',
      connections: ['sales', 'analytics']
    },
    {
      id: 'finance',
      name: 'Financial Stem',
      position: [0, -2, 6],
      color: '#45b7d1',
      description: 'Resource allocation and profit optimization',
      neuralFunction: 'Predictive financial modeling',
      connections: ['sales', 'operations']
    },
    {
      id: 'operations',
      name: 'Operations Center',
      position: [0, 0, -6],
      color: '#96ceb4',
      description: 'Process automation and efficiency neural nets',
      neuralFunction: 'Workflow optimization and bottleneck detection',
      connections: ['finance', 'hr']
    },
    {
      id: 'hr',
      name: 'Human Resources Network',
      position: [-6, -2, -2],
      color: '#feca57',
      description: 'Talent management and culture neural pathways',
      neuralFunction: 'Team harmony and performance optimization',
      connections: ['operations', 'analytics']
    },
    {
      id: 'analytics',
      name: 'Analytics Processor',
      position: [6, -2, -2],
      color: '#ff9ff3',
      description: 'Data processing and insight generation',
      neuralFunction: 'Business intelligence synthesis',
      connections: ['marketing', 'hr']
    }
  ]

  useEffect(() => {
    setConsciousnessLevel(Math.max(1, connectedSystems.length))
  }, [connectedSystems])
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-violet-900 via-purple-900 to-black">
      <Canvas 
        camera={{ position: [0, 8, 25], fov: 60 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0a0015']} />
        
        <Environment preset="night" />
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 10, 0]} color="#4a90e2" intensity={2} />
        
        <BrainCore 
          activityLevel={brainActivity}
          consciousnessLevel={consciousnessLevel}
        />
        
        {businessSystems.map((system) => (
          <BusinessSystemNode
            key={system.id}
            {...system}
            isActive={activeConnection === system.id}
            isConnected={connectedSystems.includes(system.id)}
            onClick={() => setActiveConnection(system.id)}
            onConnect={() => {
              if (!connectedSystems.includes(system.id)) {
                setConnectedSystems([...connectedSystems, system.id])
              }
            }}
          />
        ))}
        
        <NeuralPathways 
          systems={businessSystems}
          connectedSystems={connectedSystems}
          signals={neuralSignals}
        />
        
        <ThoughtInterfaces 
          activeSystem={businessSystems.find(s => s.id === activeConnection)}
        />
        
        <NeuralSignalSystem 
          systems={businessSystems}
          connectedSystems={connectedSystems}
          onSignal={(signal) => setNeuralSignals(prev => [...prev, signal])}
        />
        
        <ConsciousnessVisualization 
          level={consciousnessLevel}
          connectedCount={connectedSystems.length}
        />
        
        <EffectComposer>
          <Bloom 
            intensity={1.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
          <SSAO samples={31} radius={0.4} intensity={1} />
        </EffectComposer>
        
        <OrbitControls 
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.5}
          minDistance={15}
          maxDistance={50}
        />
      </Canvas>
      
      <NeuralCommandUI 
        activeConnection={activeConnection}
        connectedSystems={connectedSystems}
        brainActivity={brainActivity}
        consciousnessLevel={consciousnessLevel}
        businessSystems={businessSystems}
        onBrainActivityChange={setBrainActivity}
      />
    </div>
  )
}

interface BrainCoreProps {
  activityLevel: number
  consciousnessLevel: number
}

const BrainCore: React.FC<BrainCoreProps> = ({ activityLevel, consciousnessLevel }) => {
  const brainRef = useRef<THREE.Mesh>(null)
  const pulseRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (brainRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 2) * (activityLevel * 0.3)
      brainRef.current.scale.setScalar(pulse)
      brainRef.current.rotation.y = clock.elapsedTime * (consciousnessLevel * 0.1)
    }
    
    if (pulseRef.current) {
      pulseRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 3) * 0.5)
      const material = pulseRef.current.material as THREE.MeshBasicMaterial
      material.opacity = activityLevel * Math.abs(Math.sin(clock.elapsedTime * 3))
    }
  })
  
  return (
    <group>
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh ref={brainRef}>
          <sphereGeometry args={[4, 64, 64]} />
          <MeshDistortMaterial
            color="#4a90e2"
            emissive="#1a4f8a"
            emissiveIntensity={activityLevel}
            distort={0.3 * activityLevel}
            speed={2}
            roughness={0.4}
            metalness={0.8}
          />
        </mesh>
      </Float>
      
      <group>
        <mesh position={[-1.5, 0, 0]}>
          <sphereGeometry args={[2.5, 32, 32, 0, Math.PI]} />
          <meshPhysicalMaterial
            color="#2196f3"
            emissive="#1976d2"
            emissiveIntensity={activityLevel * 0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
        
        <mesh position={[1.5, 0, 0]}>
          <sphereGeometry args={[2.5, 32, 32, Math.PI, Math.PI]} />
          <meshPhysicalMaterial
            color="#9c27b0"
            emissive="#7b1fa2"
            emissiveIntensity={activityLevel * 0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>
      
      <mesh ref={pulseRef} scale={1}>
        <ringGeometry args={[6, 7, 64]} />
        <meshBasicMaterial 
          color="#4a90e2"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <mesh position={[0, -6, 0]}>
        <cylinderGeometry args={[1, 2, 4, 16]} />
        <meshPhysicalMaterial
          color="#673ab7"
          emissive="#512da8"
          emissiveIntensity={activityLevel}
        />
      </mesh>
    </group>
  )
}

interface BusinessSystemNodeProps extends BusinessSystem {
  isActive: boolean
  isConnected: boolean
  onClick: () => void
  onConnect: () => void
}

const BusinessSystemNode: React.FC<BusinessSystemNodeProps> = ({ 
  id, name, position, color, description, neuralFunction, 
  isActive, isConnected, onClick, onConnect 
}) => {
  const nodeRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState<boolean>(false)
  
  useFrame(({ clock }) => {
    if (nodeRef.current) {
      if (isActive) {
        const pulse = 1.2 + Math.sin(clock.elapsedTime * 5) * 0.3
        nodeRef.current.scale.setScalar(pulse)
      } else if (hovered) {
        nodeRef.current.scale.setScalar(1.1)
      } else {
        nodeRef.current.scale.setScalar(1)
      }
      
      if (isConnected) {
        nodeRef.current.rotation.y = clock.elapsedTime * 2
      }
    }
  })
  
  return (
    <group position={position}>
      <Float speed={1.5} rotationIntensity={0.2}>
        <mesh
          ref={nodeRef}
          onClick={() => {
            onClick()
            if (!isConnected) onConnect()
          }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <dodecahedronGeometry args={[1.2]} />
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isActive ? 0.8 : 0.3}
            roughness={0.2}
            metalness={0.8}
            clearcoat={1}
          />
        </mesh>
      </Float>
      
      {isConnected && <NodeActivity color={color} />}
      
      <Text3D
        font="/fonts/Inter_Regular.json"
        size={0.3}
        position={[0, -2, 0]}
        anchorX="center"
        anchorY="middle"
      >
        {name}
        <meshBasicMaterial color="white" />
      </Text3D>
      
      {isConnected && (
        <mesh position={[0, 1.8, 0]} scale={0.3}>
          <sphereGeometry args={[1]} />
          <meshBasicMaterial 
            color="#00ff00"
            emissive="#00ff00"
            emissiveIntensity={1}
          />
        </mesh>
      )}
    </group>
  )
}

interface NeuralPathwaysProps {
  systems: BusinessSystem[]
  connectedSystems: string[]
  signals: NeuralSignal[]
}

const NeuralPathways: React.FC<NeuralPathwaysProps> = ({ systems, connectedSystems, signals }) => {
  const getConnectedPairs = (): [string, string][] => {
    const pairs: [string, string][] = []
    connectedSystems.forEach(systemId => {
      const system = systems.find(s => s.id === systemId)
      if (system && system.connections) {
        system.connections.forEach(connectionId => {
          if (connectedSystems.includes(connectionId)) {
            pairs.push([systemId, connectionId])
          }
        })
      }
    })
    return pairs
  }
  
  const connectedPairs = getConnectedPairs()
  
  return (
    <group>
      {connectedPairs.map(([fromId, toId], index) => {
        const fromSystem = systems.find(s => s.id === fromId)
        const toSystem = systems.find(s => s.id === toId)
        
        if (!fromSystem || !toSystem) return null
        
        return (
          <NeuralConnection
            key={`${fromId}-${toId}`}
            from={fromSystem.position}
            to={toSystem.position}
            fromColor={fromSystem.color}
            toColor={toSystem.color}
            signal={signals.find(s => 
              (s.from === fromId && s.to === toId) || 
              (s.from === toId && s.to === fromId)
            )}
          />
        )
      })}
    </group>
  )
}

interface NeuralConnectionProps {
  from: [number, number, number]
  to: [number, number, number]
  fromColor: string
  toColor: string
  signal?: NeuralSignal
}

const NeuralConnection: React.FC<NeuralConnectionProps> = ({ from, to, fromColor, toColor, signal }) => {
  const connectionRef = useRef<THREE.Line>(null)
  const signalRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (connectionRef.current) {
      const material = connectionRef.current.material as THREE.LineBasicMaterial
      material.opacity = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.3
    }
    
    if (signalRef.current && signal) {
      const progress = (clock.elapsedTime - signal.startTime) / signal.duration
      if (progress < 1 && progress > 0) {
        const position = new THREE.Vector3().lerpVectors(
          new THREE.Vector3(...from),
          new THREE.Vector3(...to),
          progress
        )
        signalRef.current.position.copy(position)
        signalRef.current.visible = true
      } else {
        signalRef.current.visible = false
      }
    }
  })
  
  const curve = useMemo(() => {
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(
        (from[0] + to[0]) / 2,
        Math.max(from[1], to[1]) + 3,
        (from[2] + to[2]) / 2
      ),
      new THREE.Vector3(...to)
    )
  }, [from, to])
  
  const points = useMemo(() => curve.getPoints(50), [curve])
  
  return (
    <group>
      <Line
        ref={connectionRef}
        points={points}
        color={fromColor}
        lineWidth={3}
        transparent
        opacity={0.5}
      />
      
      {signal && (
        <mesh ref={signalRef}>
          <sphereGeometry args={[0.2]} />
          <meshBasicMaterial 
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={2}
          />
        </mesh>
      )}
    </group>
  )
}

interface NodeActivityProps {
  color: string
}

const NodeActivity: React.FC<NodeActivityProps> = ({ color }) => {
  const activityRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (activityRef.current) {
      activityRef.current.children.forEach((particle, i) => {
        const angle = clock.elapsedTime * 2 + i * (Math.PI / 4)
        particle.position.x = Math.cos(angle) * 2
        particle.position.y = Math.sin(angle * 1.5) * 0.5
        particle.position.z = Math.sin(angle) * 2
      })
    }
  })
  
  return (
    <group ref={activityRef}>
      {[...Array(8)].map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={1}
          />
        </mesh>
      ))}
    </group>
  )
}

interface ThoughtInterfacesProps {
  activeSystem?: BusinessSystem
}

const ThoughtInterfaces: React.FC<ThoughtInterfacesProps> = ({ activeSystem }) => {
  if (!activeSystem) return null
  
  return (
    <group>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <Html
          position={[0, 8, 0]}
          distanceFactor={10}
          transform
          occlude
        >
          <div className="bg-black/80 backdrop-blur-xl p-4 rounded-lg border border-cyan-500/30 min-w-[300px]">
            <h3 className="text-xl text-cyan-400 mb-2">{activeSystem.name}</h3>
            <p className="text-white text-sm mb-2">{activeSystem.description}</p>
            <p className="text-gray-400 text-xs">{activeSystem.neuralFunction}</p>
          </div>
        </Html>
      </Float>
    </group>
  )
}

interface NeuralSignalSystemProps {
  systems: BusinessSystem[]
  connectedSystems: string[]
  onSignal: (signal: NeuralSignal) => void
}

const NeuralSignalSystem: React.FC<NeuralSignalSystemProps> = ({ systems, connectedSystems, onSignal }) => {
  useEffect(() => {
    if (connectedSystems.length < 2) return
    
    const interval = setInterval(() => {
      const connectedSystemsData = systems.filter(s => connectedSystems.includes(s.id))
      const fromSystem = connectedSystemsData[Math.floor(Math.random() * connectedSystemsData.length)]
      const possibleConnections = fromSystem.connections.filter(id => connectedSystems.includes(id))
      
      if (possibleConnections.length > 0) {
        const toSystemId = possibleConnections[Math.floor(Math.random() * possibleConnections.length)]
        
        const signal: NeuralSignal = {
          id: Date.now(),
          from: fromSystem.id,
          to: toSystemId,
          startTime: Date.now() / 1000,
          duration: 2 + Math.random() * 3
        }
        onSignal(signal)
      }
    }, 1000 + Math.random() * 2000)
    
    return () => clearInterval(interval)
  }, [systems, connectedSystems, onSignal])
  
  return null
}

interface ConsciousnessVisualizationProps {
  level: number
  connectedCount: number
}

const ConsciousnessVisualization: React.FC<ConsciousnessVisualizationProps> = ({ level, connectedCount }) => {
  const consciousnessRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (consciousnessRef.current) {
      const evolution = connectedCount / 6
      consciousnessRef.current.scale.setScalar(1 + evolution * 2)
      consciousnessRef.current.rotation.y = clock.elapsedTime * evolution
    }
  })
  
  return (
    <group ref={consciousnessRef} position={[0, 15, 0]}>
      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={1}>
        <Text3D
          font="/fonts/Inter_Bold.json"
          size={1 + (connectedCount * 0.2)}
          anchorX="center"
          anchorY="middle"
        >
          CONSCIOUSNESS LEVEL: {connectedCount}
          <meshBasicMaterial 
            color="white"
            emissive="#4a90e2"
            emissiveIntensity={connectedCount * 0.2}
          />
        </Text3D>
      </Float>
    </group>
  )
}

interface NeuralCommandUIProps {
  activeConnection: string | null
  connectedSystems: string[]
  brainActivity: number
  consciousnessLevel: number
  businessSystems: BusinessSystem[]
  onBrainActivityChange: (value: number) => void
}

const NeuralCommandUI: React.FC<NeuralCommandUIProps> = ({ 
  activeConnection, 
  connectedSystems, 
  brainActivity, 
  consciousnessLevel,
  businessSystems,
  onBrainActivityChange 
}) => {
  const activeSystem = businessSystems.find(s => s.id === activeConnection)
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center">
        <h1 className="text-6xl font-thin text-white mb-4">
          Neural Command Center
        </h1>
        <p className="text-xl text-purple-300">
          Plug into your business consciousness
        </p>
      </div>
      
      <div className="absolute top-10 left-10 bg-black/80 backdrop-blur-xl p-6 rounded-lg border border-purple-500/30 pointer-events-auto">
        <h3 className="text-xl text-purple-400 mb-4">Brain Activity</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-white text-sm block mb-2">Neural Intensity</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={brainActivity}
              onChange={(e) => onBrainActivityChange(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
            <span className="text-purple-300 text-sm">{(brainActivity * 100).toFixed(0)}%</span>
          </div>
          
          <div className="text-sm">
            <div className="text-gray-400">Connected Systems</div>
            <div className="text-white font-mono text-2xl">{connectedSystems.length}/6</div>
          </div>
          
          <div className="text-sm">
            <div className="text-gray-400">Consciousness Level</div>
            <div className="text-purple-400 font-mono text-xl">{consciousnessLevel}</div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-10 right-10 bg-black/80 backdrop-blur-xl p-6 rounded-lg border border-cyan-500/30 pointer-events-auto max-w-sm">
        <h3 className="text-xl text-cyan-400 mb-4">System Status</h3>
        
        <div className="space-y-3">
          {businessSystems.map(system => (
            <div key={system.id} className="flex items-center justify-between">
              <span className="text-white text-sm">{system.name}</span>
              <div className={`w-3 h-3 rounded-full ${
                connectedSystems.includes(system.id) ? 'bg-emerald-400' : 'bg-gray-600'
              }`} />
            </div>
          ))}
        </div>
        
        {connectedSystems.length < 6 && (
          <p className="text-gray-400 text-xs mt-4">
            Click systems to establish neural connections
          </p>
        )}
      </div>
      
      <AnimatePresence>
        {activeSystem && (
          <motion.div
            className="absolute left-10 bottom-10 bg-black/90 backdrop-blur-xl p-8 rounded-lg border border-emerald-500/30 pointer-events-auto max-w-md"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <h3 className="text-2xl text-emerald-400 mb-4">{activeSystem.name}</h3>
            <p className="text-white mb-4">{activeSystem.description}</p>
            
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Neural Function:</span>
                <p className="text-white">{activeSystem.neuralFunction}</p>
              </div>
              
              <div>
                <span className="text-gray-400 text-sm">Connections:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {activeSystem.connections.map(connectionId => {
                    const connectedSystem = businessSystems.find(s => s.id === connectionId)
                    return (
                      <span 
                        key={connectionId}
                        className="px-2 py-1 bg-gray-700 rounded-full text-xs text-white"
                      >
                        {connectedSystem?.name}
                      </span>
                    )
                  })}
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-gray-400 text-sm">Status</div>
                <div className={`font-bold ${
                  connectedSystems.includes(activeSystem.id) ? 'text-emerald-400' : 'text-yellow-400'
                }`}>
                  {connectedSystems.includes(activeSystem.id) ? 'CONNECTED' : 'STANDBY'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {connectedSystems.length === 6 && (
        <motion.div
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-xl p-12 rounded-lg text-center pointer-events-auto"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className="text-6xl font-thin text-violet-600 mb-8">
            CONSCIOUSNESS ACHIEVED
          </h2>
          <p className="text-2xl text-gray-700 mb-8">
            Your business now has a fully integrated neural network
          </p>
          <p className="text-lg text-gray-600 mb-12">
            All systems are thinking together as one unified intelligence
          </p>
          <motion.button
            className="px-12 py-4 bg-violet-600 text-white font-bold rounded-full text-xl hover:bg-violet-500 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Activate Full Business Consciousness
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}

export default NeuralCommandCenter