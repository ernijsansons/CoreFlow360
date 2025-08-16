'use client'

import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Text3D, Instances, Instance, Html, Sky } from '@react-three/drei'
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductionStation {
  id: string
  name: string
  position: [number, number, number]
  description: string
  process: string
  inputType: string
  outputType: string
  efficiency: number
}

interface FactoryStats {
  dataProcessed: number
  insightsGenerated: number
  decisionsAutomated: number
  intelligenceMultiplier: number
}

interface StationProps extends ProductionStation {
  stationIndex: number
  totalStations: number
  onClick: () => void
  productionRate: number
}

interface EfficiencyDisplayProps {
  efficiency: number
  position: [number, number, number]
  color: string
}

interface InputOutputPortsProps {
  inputType: string
  outputType: string
  stationIndex: number
  totalStations: number
}

interface ConveyorBeltNetworkProps {
  stations: ProductionStation[]
}

interface DataFlowSystemProps {
  stations: ProductionStation[]
  productionRate: number
}

interface FactoryControlUIProps {
  currentStation: ProductionStation | null
  productionRate: number
  onProductionRateChange: (rate: number) => void
  factoryStats: FactoryStats
  onCloseStation: () => void
}

const ProductionStation: React.FC<StationProps> = ({ 
  id, name, position, description, process, inputType, outputType, efficiency, 
  stationIndex, totalStations, onClick, productionRate 
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const machineRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    if (machineRef.current) {
      const speed = productionRate * 2
      machineRef.current.rotation.y = clock.elapsedTime * speed
      
      if (glowRef.current) {
        const intensity = (efficiency / 100) * (1 + Math.sin(clock.elapsedTime * 3) * 0.3)
        glowRef.current.intensity = intensity * 2
      }
    }
  })

  const stationColor = useMemo(() => {
    const colors = ['#ef4444', '#06b6d4', '#3b82f6', '#f59e0b', '#8b5cf6']
    return colors[stationIndex % colors.length]
  }, [stationIndex])

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[4, 4, 1, 16]} />
        <meshStandardMaterial 
          color="#1e293b"
          roughness={0.7}
          metalness={0.8}
        />
      </mesh>
      
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh ref={machineRef} position={[0, 2, 0]} castShadow>
          <dodecahedronGeometry args={[1.5, 0]} />
          <meshPhysicalMaterial
            color={stationColor}
            roughness={0.2}
            metalness={0.8}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive={stationColor}
            emissiveIntensity={0.1}
          />
        </mesh>
      </Float>
      
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[2, 2, 2, 16]} />
        <meshPhysicalMaterial
          color="#334155"
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      
      <pointLight
        ref={glowRef}
        position={[0, 2, 0]}
        color={stationColor}
        intensity={2}
        distance={8}
      />
      
      <Text3D
        font="/fonts/Inter_Bold.json"
        size={0.3}
        height={0.05}
        position={[-name.length * 0.15, 4, 0]}
      >
        {name}
        <meshStandardMaterial color="white" />
      </Text3D>
      
      <EfficiencyDisplay 
        efficiency={efficiency}
        position={[0, -1, 2]}
        color={stationColor}
      />
      
      <InputOutputPorts 
        inputType={inputType}
        outputType={outputType}
        stationIndex={stationIndex}
        totalStations={totalStations}
      />
    </group>
  )
}

const ConveyorBeltNetwork: React.FC<ConveyorBeltNetworkProps> = ({ stations }) => {
  const beltRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (beltRef.current) {
      beltRef.current.children.forEach((belt) => {
        const mesh = belt as THREE.Mesh
        if (mesh.material && 'map' in mesh.material && mesh.material.map) {
          mesh.material.map.offset.x = (clock.elapsedTime * 0.5) % 1
        }
      })
    }
  })
  
  return (
    <group ref={beltRef}>
      {stations.slice(0, -1).map((station, i) => {
        const nextStation = stations[i + 1]
        const distance = new THREE.Vector3().subVectors(
          new THREE.Vector3(...nextStation.position),
          new THREE.Vector3(...station.position)
        ).length()
        
        const midpoint = new THREE.Vector3()
          .addVectors(
            new THREE.Vector3(...station.position),
            new THREE.Vector3(...nextStation.position)
          )
          .multiplyScalar(0.5)
        
        return (
          <mesh
            key={i}
            position={[midpoint.x, -3, midpoint.z]}
            rotation={[0, Math.atan2(nextStation.position[2] - station.position[2], nextStation.position[0] - station.position[0]), 0]}
          >
            <boxGeometry args={[distance, 0.5, 2]} />
            <meshStandardMaterial 
              color="#334155"
              roughness={0.8}
              metalness={0.3}
            />
          </mesh>
        )
      })}
    </group>
  )
}

const DataFlowSystem: React.FC<DataFlowSystemProps> = ({ stations, productionRate }) => {
  const dataParticlesRef = useRef<(THREE.InstancedMesh | null)[]>([])
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
  
  useFrame(({ clock }) => {
    if (instancedMeshRef.current) {
      const dummy = new THREE.Object3D()
      const color = new THREE.Color()
      
      for (let i = 0; i < 100; i++) {
        const speed = productionRate * 2
        const x = -25 + (clock.elapsedTime * speed + i * 0.5) % 50
        const y = Math.sin(clock.elapsedTime + i) * 0.5 + 1
        const z = (Math.sin(i) * 4)
        
        dummy.position.set(x, y, z)
        dummy.updateMatrix()
        instancedMeshRef.current.setMatrixAt(i, dummy.matrix)
        
        const progress = (x + 25) / 50
        const hue = progress * 0.6
        color.setHSL(hue, 1, 0.5)
        instancedMeshRef.current.setColorAt(i, color)
      }
      
      instancedMeshRef.current.instanceMatrix.needsUpdate = true
      if (instancedMeshRef.current.instanceColor) {
        instancedMeshRef.current.instanceColor.needsUpdate = true
      }
    }
  })
  
  return (
    <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, 100]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial />
    </instancedMesh>
  )
}

const FactoryInfrastructure: React.FC = () => {
  return (
    <group>
      {[-15, -5, 5, 15].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 5, -8]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 10]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[x, 5, 8]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 10]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          
          <mesh position={[x, 10, 0]} castShadow>
            <boxGeometry args={[1, 0.5, 16]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        </group>
      ))}
      
      {[-10, 0, 10].map((x, i) => (
        <mesh key={i} position={[x, 8, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      ))}
    </group>
  )
}

const QualityControlDrones: React.FC = () => {
  const dronesRef = useRef<(THREE.Group | null)[]>([])
  
  useFrame(({ clock }) => {
    dronesRef.current.forEach((drone, i) => {
      if (drone) {
        const angle = clock.elapsedTime * 0.5 + i * Math.PI * 2 / 3
        drone.position.x = Math.cos(angle) * 15
        drone.position.y = 12 + Math.sin(clock.elapsedTime * 2 + i) * 2
        drone.position.z = Math.sin(angle) * 8
        
        drone.rotation.y = angle + Math.PI / 2
      }
    })
  })
  
  return (
    <group>
      {[...Array(3)].map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={0.2}>
          <group ref={el => dronesRef.current[i] = el}>
            <mesh>
              <octahedronGeometry args={[0.5]} />
              <meshPhysicalMaterial
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={0.2}
                roughness={0.1}
                metalness={0.8}
              />
            </mesh>
            <pointLight color="#ef4444" intensity={1} distance={5} />
          </group>
        </Float>
      ))}
    </group>
  )
}

const EfficiencyDisplay: React.FC<EfficiencyDisplayProps> = ({ efficiency, position, color }) => {
  return (
    <group position={position}>
      <mesh>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>
      
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <ringGeometry args={[0.8, 1, 32, 1, 0, (efficiency / 100) * Math.PI * 2]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      <Text3D
        font="/fonts/Inter_Bold.json"
        size={0.2}
        height={0.01}
        position={[-0.3, -0.1, 0.1]}
      >
        {efficiency.toFixed(1)}%
        <meshBasicMaterial color="white" />
      </Text3D>
    </group>
  )
}

const InputOutputPorts: React.FC<InputOutputPortsProps> = ({ inputType, outputType, stationIndex, totalStations }) => {
  return (
    <group>
      {stationIndex > 0 && (
        <group position={[-3, 1, 0]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 1]} />
            <meshStandardMaterial color="#10b981" />
          </mesh>
          <Text3D
            font="/fonts/Inter_Regular.json"
            size={0.1}
            height={0.01}
            position={[-0.2, -1, 0]}
          >
            INPUT
            <meshBasicMaterial color="#10b981" />
          </Text3D>
        </group>
      )}
      
      {stationIndex < totalStations - 1 && (
        <group position={[3, 1, 0]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 1]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <Text3D
            font="/fonts/Inter_Regular.json"
            size={0.1}
            height={0.01}
            position={[-0.3, -1, 0]}
          >
            OUTPUT
            <meshBasicMaterial color="#ef4444" />
          </Text3D>
        </group>
      )}
    </group>
  )
}

const FactoryControlUI: React.FC<FactoryControlUIProps> = ({ 
  currentStation, 
  productionRate, 
  onProductionRateChange, 
  factoryStats,
  onCloseStation
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center">
        <h1 className="text-6xl font-thin text-white mb-4 bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Intelligence Manufacturing
        </h1>
        <p className="text-xl text-gray-400">
          Where data becomes consciousness at industrial scale
        </p>
      </div>
      
      <div className="absolute top-10 right-10 bg-black/20 backdrop-blur-xl p-6 rounded-lg border border-cyan-500/30 pointer-events-auto">
        <h3 className="text-xl text-cyan-400 mb-4">Production Control</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-white text-sm block mb-2">Production Rate</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={productionRate}
              onChange={(e) => onProductionRateChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <span className="text-gray-400 text-sm">{productionRate}x speed</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Data Processed</div>
              <div className="text-white font-mono">{factoryStats.dataProcessed.toLocaleString()}/hr</div>
            </div>
            <div>
              <div className="text-gray-400">Insights Generated</div>
              <div className="text-white font-mono">{factoryStats.insightsGenerated.toLocaleString()}/hr</div>
            </div>
            <div>
              <div className="text-gray-400">Decisions Automated</div>
              <div className="text-white font-mono">{factoryStats.decisionsAutomated.toLocaleString()}/hr</div>
            </div>
            <div>
              <div className="text-gray-400">Intelligence Multiplier</div>
              <div className="text-cyan-400 font-mono">{factoryStats.intelligenceMultiplier}x</div>
            </div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {currentStation && (
          <motion.div
            className="absolute left-10 bottom-10 bg-black/20 backdrop-blur-xl p-8 rounded-lg border border-violet-500/30 pointer-events-auto max-w-md"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl text-violet-400">{currentStation.name}</h3>
              <button 
                onClick={onCloseStation}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-white mb-4">{currentStation.description}</p>
            
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Process: </span>
                <span className="text-white">{currentStation.process}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-emerald-400 text-sm">INPUT</div>
                  <div className="text-white text-sm">{currentStation.inputType}</div>
                </div>
                <div>
                  <div className="text-red-400 text-sm">OUTPUT</div>
                  <div className="text-white text-sm">{currentStation.outputType}</div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Efficiency</span>
                  <span className="text-cyan-400 font-mono">{currentStation.efficiency}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${currentStation.efficiency}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black/20 backdrop-blur-xl px-8 py-4 rounded-full border border-cyan-500/20">
        <div className="flex items-center gap-8 text-sm">
          <div>
            <span className="text-gray-400">Status: </span>
            <span className="text-emerald-400">OPERATIONAL</span>
          </div>
          <div>
            <span className="text-gray-400">Uptime: </span>
            <span className="text-white">99.97%</span>
          </div>
          <div>
            <span className="text-gray-400">Intelligence Output: </span>
            <span className="text-cyan-400">∞ Consciousness/second</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function IntelligenceFactory(): JSX.Element {
  const [currentStation, setCurrentStation] = useState<ProductionStation | null>(null)
  const [productionRate, setProductionRate] = useState<number>(1)
  const [factoryStats, setFactoryStats] = useState<FactoryStats>({
    dataProcessed: 1250000,
    insightsGenerated: 85000,
    decisionsAutomated: 12500,
    intelligenceMultiplier: 1
  })

  const productionStations: ProductionStation[] = [
    {
      id: 'data-intake',
      name: 'Data Ingestion Center',
      position: [-20, 0, 0],
      description: 'Raw business data enters the intelligence pipeline',
      process: 'Converting chaos into structured information',
      inputType: 'Raw Data Streams',
      outputType: 'Structured Information',
      efficiency: 99.8
    },
    {
      id: 'pattern-recognition',
      name: 'Pattern Recognition Matrix',
      position: [-10, 0, 0],
      description: 'AI identifies hidden patterns and correlations',
      process: 'Deep pattern analysis across all business dimensions',
      inputType: 'Structured Information',
      outputType: 'Recognized Patterns',
      efficiency: 97.2
    },
    {
      id: 'intelligence-synthesis',
      name: 'Intelligence Synthesis Chamber',
      position: [0, 0, 0],
      description: 'Patterns become predictive intelligence',
      process: 'Synthesizing insights from pattern recognition',
      inputType: 'Recognized Patterns',
      outputType: 'Predictive Intelligence',
      efficiency: 95.5
    },
    {
      id: 'decision-automation',
      name: 'Decision Automation Engine',
      position: [10, 0, 0],
      description: 'Intelligence becomes autonomous action',
      process: 'Converting insights into automated decisions',
      inputType: 'Predictive Intelligence',
      outputType: 'Automated Decisions',
      efficiency: 93.1
    },
    {
      id: 'consciousness-emergence',
      name: 'Consciousness Emergence Core',
      position: [20, 0, 0],
      description: 'Decisions evolve into business consciousness',
      process: 'Emergence of self-aware business operations',
      inputType: 'Automated Decisions',
      outputType: 'Business Consciousness',
      efficiency: 100.0
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setFactoryStats(prev => ({
        dataProcessed: Math.floor(prev.dataProcessed * (1 + productionRate * 0.1)),
        insightsGenerated: Math.floor(prev.insightsGenerated * (1 + productionRate * 0.08)),
        decisionsAutomated: Math.floor(prev.decisionsAutomated * (1 + productionRate * 0.12)),
        intelligenceMultiplier: Number((prev.intelligenceMultiplier * (1 + productionRate * 0.05)).toFixed(1))
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [productionRate])

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-black">
      <Canvas 
        camera={{ position: [0, 15, 40], fov: 60 }}
        shadows
      >
        <color attach="background" args={['#0f0f23']} />
        
        <Suspense fallback={null}>
          <Environment preset="warehouse" />
          <Sky />
          
          <directionalLight 
            position={[10, 20, 5]} 
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <ambientLight intensity={0.2} />
          
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
            <planeGeometry args={[100, 40]} />
            <meshStandardMaterial 
              color="#1e293b"
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
          
          {productionStations.map((station, index) => (
            <ProductionStation
              key={station.id}
              {...station}
              stationIndex={index}
              totalStations={productionStations.length}
              onClick={() => setCurrentStation(station)}
              productionRate={productionRate}
            />
          ))}
          
          <ConveyorBeltNetwork stations={productionStations} />
          <DataFlowSystem 
            stations={productionStations}
            productionRate={productionRate}
          />
          <FactoryInfrastructure />
          <QualityControlDrones />
          
          <EffectComposer>
            <Bloom 
              intensity={0.8}
              luminanceThreshold={0.4}
              luminanceSmoothing={0.9}
            />
            <SSAO samples={31} radius={0.4} intensity={1} />
          </EffectComposer>
          
          <OrbitControls 
            enablePan={true}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={15}
            maxDistance={80}
          />
        </Suspense>
      </Canvas>
      
      <FactoryControlUI 
        currentStation={currentStation}
        productionRate={productionRate}
        onProductionRateChange={setProductionRate}
        factoryStats={factoryStats}
        onCloseStation={() => setCurrentStation(null)}
      />
    </div>
  )
}