# THE FACTORY: Intelligence Manufacturing Experience

Create an immersive 3D factory where users witness raw business data being transformed into pure intelligence. This experience demonstrates how CoreFlow360 doesn't just process information—it manufactures consciousness at industrial scale.

## CORE CONCEPT
Users explore a massive, beautiful factory where conveyor belts carry raw data through various intelligence-enhancement stations. They see the transformation from chaos to consciousness, from information to insight, from data to decisions. The factory never stops, never tires—it's the eternal intelligence production line.

## VISUAL DESIGN LANGUAGE
- **Environment**: Gleaming steel and glass factory with impossible architecture
- **Machinery**: Elegant, purpose-built intelligence processors
- **Flow**: Visible streams of data transforming through each stage
- **Lighting**: Clean industrial lighting with intelligence-glow accents

## TECHNICAL IMPLEMENTATION

### Main Factory Component
```tsx
import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Text3D, Instances, Instance } from '@react-three/drei'
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'

const IntelligenceFactory = () => {
  const [currentStation, setCurrentStation] = useState(null)
  const [productionRate, setProductionRate] = useState(1)
  const [factoryStats, setFactoryStats] = useState({
    dataProcessed: 0,
    insightsGenerated: 0,
    decisionsAutomated: 0,
    intelligenceMultiplier: 1
  })
  
  const productionStations = [
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
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black">
      <Canvas 
        camera={{ position: [0, 15, 40], fov: 60 }}
        shadows
      >
        <color attach="background" args={['#0a0a0f']} />
        
        {/* Lighting setup */}
        <Environment preset="warehouse" />
        <directionalLight 
          position={[10, 20, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <ambientLight intensity={0.2} />
        
        {/* Factory floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
          <planeGeometry args={[100, 40]} />
          <meshStandardMaterial 
            color="#1a1a2e"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        
        {/* Production stations */}
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
        
        {/* Conveyor belt system */}
        <ConveyorBeltNetwork stations={productionStations} />
        
        {/* Data flow visualization */}
        <DataFlowSystem 
          stations={productionStations}
          productionRate={productionRate}
        />
        
        {/* Overhead gantries */}
        <FactoryInfrastructure />
        
        {/* Quality control drones */}
        <QualityControlDrones />
        
        {/* Post-processing effects */}
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
      </Canvas>
      
      {/* Factory Control UI */}
      <FactoryControlUI 
        currentStation={currentStation}
        productionRate={productionRate}
        onProductionRateChange={setProductionRate}
        factoryStats={factoryStats}
      />
    </div>
  )
}

// Individual production station
const ProductionStation = ({ 
  id, name, position, description, process, inputType, outputType, efficiency, 
  stationIndex, totalStations, onClick, productionRate 
}) => {
  const groupRef = useRef()
  const machineRef = useRef()
  const glowRef = useRef()
  const [active, setActive] = useState(false)
  
  useFrame(({ clock }) => {
    if (machineRef.current) {
      // Station operation animation
      const speed = productionRate * 2
      machineRef.current.rotation.y = clock.elapsedTime * speed
      
      // Pulsing glow based on efficiency
      if (glowRef.current) {
        const intensity = (efficiency / 100) * (1 + Math.sin(clock.elapsedTime * 3) * 0.3)
        glowRef.current.intensity = intensity * 2
      }
    }
  })
  
  // Station color based on type
  const stationColor = useMemo(() => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6']
    return colors[stationIndex % colors.length]
  }, [stationIndex])
  
  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      {/* Station base platform */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[4, 4, 1, 16]} />
        <meshStandardMaterial 
          color="#2c3e50"
          roughness={0.7}
          metalness={0.8}
        />
      </mesh>
      
      {/* Main processing unit */}
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
      
      {/* Processing chamber */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[2, 2, 2, 16]} />
        <meshPhysicalMaterial
          color="#34495e"
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      
      {/* Glow effect */}
      <pointLight
        ref={glowRef}
        position={[0, 2, 0]}
        color={stationColor}
        intensity={2}
        distance={8}
      />
      
      {/* Station label */}
      <Text3D
        font="/fonts/inter-bold.json"
        size={0.3}
        height={0.05}
        position={[0, 4, 0]}
        textAlign="center"
      >
        {name}
        <meshStandardMaterial color="white" />
      </Text3D>
      
      {/* Efficiency indicator */}
      <EfficiencyDisplay 
        efficiency={efficiency}
        position={[0, -1, 2]}
        color={stationColor}
      />
      
      {/* Input/Output ports */}
      <InputOutputPorts 
        inputType={inputType}
        outputType={outputType}
        stationIndex={stationIndex}
        totalStations={totalStations}
      />
    </group>
  )
}

// Conveyor belt network
const ConveyorBeltNetwork = ({ stations }) => {
  const beltRef = useRef()
  
  useFrame(({ clock }) => {
    if (beltRef.current) {
      beltRef.current.children.forEach((belt, i) => {
        // Animate belt surface texture
        if (belt.material.map) {
          belt.material.map.offset.x = (clock.elapsedTime * 0.5) % 1
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
              color="#34495e"
              roughness={0.8}
              metalness={0.3"
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Data flow visualization
const DataFlowSystem = ({ stations, productionRate }) => {
  const dataParticlesRef = useRef([])
  
  useFrame(({ clock }) => {
    dataParticlesRef.current.forEach((particle, i) => {
      if (particle) {
        // Move particles along the production line
        const speed = productionRate * 2
        particle.position.x += speed * 0.1
        
        // Reset at end of line
        if (particle.position.x > 25) {
          particle.position.x = -25
          particle.position.y = Math.random() * 3
          particle.position.z = (Math.random() - 0.5) * 4
        }
        
        // Color transformation along the line
        const progress = (particle.position.x + 25) / 50
        const hue = progress * 0.6 // Red to cyan
        particle.material.color.setHSL(hue, 1, 0.5)
      }
    })
  })
  
  return (
    <group>
      <Instances limit={100}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial />
        
        {[...Array(100)].map((_, i) => (
          <Instance
            key={i}
            ref={el => dataParticlesRef.current[i] = el}
            position={[
              -25 + (i / 100) * 50,
              Math.random() * 3,
              (Math.random() - 0.5) * 4
            ]}
            color={new THREE.Color().setHSL(0, 1, 0.5)}
          />
        ))}
      </Instances>
    </group>
  )
}

// Factory infrastructure (gantries, pipes, etc.)
const FactoryInfrastructure = () => {
  return (
    <group>
      {/* Overhead gantry system */}
      {[-15, -5, 5, 15].map((x, i) => (
        <group key={i}>
          {/* Vertical supports */}
          <mesh position={[x, 5, -8]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 10]} />
            <meshStandardMaterial color="#34495e" />
          </mesh>
          <mesh position={[x, 5, 8]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 10]} />
            <meshStandardMaterial color="#34495e" />
          </mesh>
          
          {/* Horizontal beam */}
          <mesh position={[x, 10, 0]} castShadow>
            <boxGeometry args={[1, 0.5, 16]} />
            <meshStandardMaterial color="#34495e" />
          </mesh>
        </group>
      ))}
      
      {/* Connecting pipes */}
      {[-10, 0, 10].map((x, i) => (
        <mesh key={i} position={[x, 8, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 8]} />
          <meshStandardMaterial color="#7f8c8d" />
        </mesh>
      ))}
    </group>
  )
}

// Quality control drones
const QualityControlDrones = () => {
  const dronesRef = useRef([])
  
  useFrame(({ clock }) => {
    dronesRef.current.forEach((drone, i) => {
      if (drone) {
        // Patrol patterns
        const angle = clock.elapsedTime * 0.5 + i * Math.PI * 2 / 3
        drone.position.x = Math.cos(angle) * 15
        drone.position.y = 12 + Math.sin(clock.elapsedTime * 2 + i) * 2
        drone.position.z = Math.sin(angle) * 8
        
        // Rotation
        drone.rotation.y = angle + Math.PI / 2
      }
    })
  })
  
  return (
    <group>
      {[...Array(3)].map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={0.2}>
          <mesh ref={el => dronesRef.current[i] = el}>
            <octahedronGeometry args={[0.5]} />
            <meshPhysicalMaterial
              color="#e74c3c"
              emissive="#e74c3c"
              emissiveIntensity={0.2}
              roughness={0.1}
              metalness={0.8"
            />
            <pointLight color="#e74c3c" intensity={1} distance={5} />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

// Efficiency display component
const EfficiencyDisplay = ({ efficiency, position, color }) => {
  return (
    <group position={position}>
      {/* Background circle */}
      <mesh>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial color="#2c3e50" />
      </mesh>
      
      {/* Efficiency arc */}
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <ringGeometry args={[0.8, 1, 32, 1, 0, (efficiency / 100) * Math.PI * 2]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      {/* Efficiency text */}
      <Text3D
        font="/fonts/inter-bold.json"
        size={0.2}
        height={0.01}
        position={[0, 0, 0.1]}
        textAlign="center"
      >
        {efficiency.toFixed(1)}%
        <meshBasicMaterial color="white" />
      </Text3D>
    </group>
  )
}

// Input/Output ports
const InputOutputPorts = ({ inputType, outputType, stationIndex, totalStations }) => {
  return (
    <group>
      {/* Input port (left side) */}
      {stationIndex > 0 && (
        <group position={[-3, 1, 0]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 1]} />
            <meshStandardMaterial color="#27ae60" />
          </mesh>
          <Text3D
            font="/fonts/inter.json"
            size={0.1}
            height={0.01}
            position={[0, -1, 0]}
            textAlign="center"
          >
            INPUT
            <meshBasicMaterial color="#27ae60" />
          </Text3D>
        </group>
      )}
      
      {/* Output port (right side) */}
      {stationIndex < totalStations - 1 && (
        <group position={[3, 1, 0]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 1]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
          <Text3D
            font="/fonts/inter.json"
            size={0.1}
            height={0.01}
            position={[0, -1, 0]}
            textAlign="center"
          >
            OUTPUT
            <meshBasicMaterial color="#e74c3c" />
          </Text3D>
        </group>
      )}
    </group>
  )
}
```

### Factory Control UI
```tsx
const FactoryControlUI = ({ 
  currentStation, 
  productionRate, 
  onProductionRateChange, 
  factoryStats 
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Factory title */}
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center">
        <h1 className="text-6xl font-thin text-white mb-4">
          Intelligence Manufacturing
        </h1>
        <p className="text-xl text-gray-400">
          Where data becomes consciousness at industrial scale
        </p>
      </div>
      
      {/* Production controls */}
      <div className="absolute top-10 right-10 bg-black/80 backdrop-blur-xl p-6 rounded-lg border border-cyan-500/30 pointer-events-auto">
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
              className="w-full"
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
      
      {/* Station details panel */}
      <AnimatePresence>
        {currentStation && (
          <motion.div
            className="absolute left-10 bottom-10 bg-black/90 backdrop-blur-xl p-8 rounded-lg border border-purple-500/30 pointer-events-auto max-w-md"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <h3 className="text-2xl text-purple-400 mb-4">{currentStation.name}</h3>
            <p className="text-white mb-4">{currentStation.description}</p>
            
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Process: </span>
                <span className="text-white">{currentStation.process}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-green-400 text-sm">INPUT</div>
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
                    className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${currentStation.efficiency}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Factory overview stats */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-xl px-8 py-4 rounded-full border border-cyan-500/20">
        <div className="flex items-center gap-8 text-sm">
          <div>
            <span className="text-gray-400">Status: </span>
            <span className="text-green-400">OPERATIONAL</span>
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
```

## INTERACTION PATTERNS

### Factory Tour Flow
1. **Overview**: User sees entire factory from above
2. **Station Focus**: Click any station to zoom in and see details
3. **Production Control**: Adjust speed and watch effects
4. **Data Tracking**: Follow individual data particles through transformation
5. **Quality Inspection**: Drone's-eye view of the entire operation

### Interactive Elements
- **Production Rate Control**: Real-time speed adjustment
- **Station Deep Dive**: Click for technical specifications
- **Data Particle Tracking**: Follow transformation journey
- **Efficiency Optimization**: Interactive station tuning
- **Emergency Shutdown**: See what happens when intelligence stops

## SOUND DESIGN

```typescript
const factorySounds = {
  ambient: {
    file: 'factory_ambience.mp3',
    volume: 0.4,
    loop: true,
    layers: [
      'mechanical_hum.mp3',
      'data_processing.mp3',
      'intelligence_synthesis.mp3'
    ]
  },
  productionLine: {
    file: 'conveyor_belt.mp3',
    volume: (rate) => 0.3 * rate,
    pitchShift: (rate) => 0.8 + (rate * 0.4),
    loop: true
  },
  stationOperations: {
    dataIntake: 'data_suction.mp3',
    patternRecognition: 'neural_processing.mp3',
    intelligenceSynthesis: 'consciousness_formation.mp3',
    decisionAutomation: 'automated_clicking.mp3',
    consciousnessEmergence: 'awareness_birth.mp3'
  },
  qualityControl: {
    file: 'drone_scan.mp3',
    spatialized: true,
    volume: 0.2
  }
}
```

## SUCCESS METRICS

- 90% interact with production rate control
- 75% click on at least 3 stations for details
- Average session time: 6+ minutes
- High comprehension of "intelligence manufacturing" concept
- 85% report understanding the automation value proposition

This factory experience transforms the abstract concept of AI processing into a tangible, industrial-scale operation that users can see, control, and understand, making CoreFlow360's intelligence capabilities feel real and powerful.