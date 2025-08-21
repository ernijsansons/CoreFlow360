'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text3D, Line, Float, Stars, Sphere, Html } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'

interface ROIData {
  investment: number
  returns: number
  multiplier: number
  timeElapsed: number
}

interface DimensionalBreak {
  id: number
  position: [number, number, number]
  size: number
  age: number
}

interface Crack {
  id: number
  position: [number, number, number]
  size: number
  age: number
}

interface TraditionalROIProps {
  investment: number
  returns: number
  time: number
}

interface ExponentialGrowthProps {
  investment: number
  returns: number
  multiplier: number
  time: number
}

interface DimensionalBreakProps {
  investment: number
  returns: number
  multiplier: number
  onBreak: (breakData: DimensionalBreak) => void
}

interface SingularityProps {
  investment: number
  dimensionalBreaks: DimensionalBreak[]
}

interface EnergyProps {
  multiplier: number
  height: number
}

interface CrackProps {
  position: [number, number, number]
  size: number
  age: number
}

interface StreamProps {
  angle: number
}

interface UIProps {
  phase: number
  investment: number
  returns: number
  multiplier: number
  timeElapsed: number
  onInvestmentChange: (value: number) => void
}

const TraditionalROIVisualization: React.FC<TraditionalROIProps> = ({ investment, returns, time }) => {
  const chartRef = useRef<THREE.Group>(null)
  
  const dataPoints = useMemo(() => {
    const points: [number, number, number][] = []
    for (let t = 0; t <= time; t += 0.5) {
      points.push([
        t * 5 - 15,
        (investment * (1 + 0.2 * t) / 10000),
        0
      ])
    }
    return points
  }, [investment, returns, time])
  
  return (
    <group ref={chartRef}>
      <Line
        points={[[-15, 0, 0], [15, 0, 0]]}
        color="gray"
        lineWidth={2}
      />
      <Line
        points={[[0, 0, 0], [0, 20, 0]]}
        color="gray"
        lineWidth={2}
      />
      
      {dataPoints.length > 1 && (
        <Line
          points={dataPoints}
          color="#4a90ff"
          lineWidth={3}
        />
      )}
      
      <Float speed={2}>
        <mesh position={dataPoints[dataPoints.length - 1] || [0, 0, 0]}>
          <sphereGeometry args={[0.3]} />
          <meshBasicMaterial color="#4a90ff" />
        </mesh>
      </Float>
      
      <Html position={[0, -3, 0]} center>
        <div className="text-white text-sm font-mono">Time (Months)</div>
      </Html>
      
      <Html position={[-18, 10, 0]} center>
        <div className="text-white text-sm font-mono transform rotate-90">Returns ($)</div>
      </Html>
    </group>
  )
}

const ExponentialGrowthVisualization: React.FC<ExponentialGrowthProps> = ({ 
  investment, 
  returns, 
  multiplier, 
  time 
}) => {
  const towerRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (towerRef.current) {
      const scale = Math.min(multiplier / 10, 5)
      towerRef.current.scale.y = scale * (1 + Math.sin(clock.elapsedTime * 2) * 0.1)
    }
  })
  
  const towerHeight = Math.min(multiplier, 50)
  const segments = Math.floor(towerHeight / 2)
  
  return (
    <group ref={towerRef}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[3, 3, 1]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      
      {[...Array(segments)].map((_, i) => {
        const segmentHeight = 2
        const segmentY = segmentHeight * i + 1
        const segmentScale = 1 - (i * 0.1)
        
        return (
          <Float key={i} speed={1 + i * 0.1} rotationIntensity={0.1}>
            <mesh position={[0, segmentY, 0]}>
              <boxGeometry args={[segmentScale * 2, segmentHeight, segmentScale * 2]} />
              <meshPhysicalMaterial
                color={new THREE.Color().setHSL(i * 0.02, 1, 0.5)}
                emissive={new THREE.Color().setHSL(i * 0.02, 1, 0.3)}
                emissiveIntensity={0.5}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
          </Float>
        )
      })}
      
      <EnergySpiral multiplier={multiplier} height={towerHeight} />
      
      <Float speed={1} floatIntensity={0.5}>
        <Html position={[0, towerHeight + 2, 0]} center>
          <div className="text-white text-4xl font-bold text-center">
            {multiplier.toFixed(1)}x
          </div>
        </Html>
      </Float>
    </group>
  )
}

const DimensionalBreakVisualization: React.FC<DimensionalBreakProps> = ({ 
  investment, 
  returns, 
  multiplier, 
  onBreak 
}) => {
  const breakRef = useRef<THREE.Group>(null)
  const [cracks, setCracks] = useState<Crack[]>([])
  
  useFrame(({ clock }) => {
    if (clock.elapsedTime % 2 < 0.1 && Math.random() < 0.3) {
      const newCrack: Crack = {
        id: Date.now(),
        position: [
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40
        ],
        size: Math.random() * 3 + 1,
        age: 0
      }
      setCracks(prev => [...prev, newCrack])
      onBreak(newCrack)
    }
    
    setCracks(prev => 
      prev.map(crack => ({ ...crack, age: crack.age + 0.1 }))
        .filter(crack => crack.age < 10)
    )
  })
  
  return (
    <group ref={breakRef}>
      {cracks.map(crack => (
        <RealityCrack key={crack.id} {...crack} />
      ))}
      
      <Float speed={2} rotationIntensity={0.3}>
        <Html position={[0, 20, 0]} center>
          <div className="text-red-500 text-6xl font-bold text-center animate-pulse">
            ROI LIMITS EXCEEDED
          </div>
        </Html>
      </Float>
    </group>
  )
}

const SingularityVisualization: React.FC<SingularityProps> = ({ investment, dimensionalBreaks }) => {
  const singularityRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (singularityRef.current) {
      singularityRef.current.rotation.y = clock.elapsedTime * 2
      singularityRef.current.rotation.z = Math.sin(clock.elapsedTime) * 0.5
    }
  })
  
  return (
    <group ref={singularityRef}>
      <Sphere args={[0.1]} position={[0, 0, 0]}>
        <meshBasicMaterial color="white" />
      </Sphere>
      
      {[...Array(50)].map((_, i) => (
        <InfiniteROIStream key={i} angle={i * 7.2} />
      ))}
      
      <Float speed={1} floatIntensity={2}>
        <Html position={[0, 0, 0]} center>
          <div className="text-white text-8xl font-thin text-center">
            ∞
          </div>
        </Html>
      </Float>
      
      {dimensionalBreaks.map(breakData => (
        <RealityFragment key={breakData.id} {...breakData} />
      ))}
    </group>
  )
}

const EnergySpiral: React.FC<EnergyProps> = ({ multiplier, height }) => {
  const particlesRef = useRef<THREE.Points>(null)
  
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position
      
      for (let i = 0; i < positions.count; i++) {
        const t = (clock.elapsedTime + i * 0.1) % 10
        const angle = t * Math.PI * 2
        const radius = 2 * Math.sin(t * Math.PI / 10)
        const y = (t / 10) * height
        
        positions.setXYZ(
          i,
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        )
      }
      
      positions.needsUpdate = true
    }
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={100}
          array={new Float32Array(300)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#4a90ff"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

const RealityCrack: React.FC<CrackProps> = ({ position, size, age }) => {
  const opacity = Math.max(0, 1 - age / 10)
  
  return (
    <mesh 
      position={position} 
      rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
    >
      <planeGeometry args={[size, 0.1]} />
      <meshBasicMaterial 
        color="white"
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

const InfiniteROIStream: React.FC<StreamProps> = ({ angle }) => {
  const streamRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (streamRef.current) {
      streamRef.current.position.x = Math.cos((angle * Math.PI / 180) + clock.elapsedTime) * 5
      streamRef.current.position.z = Math.sin((angle * Math.PI / 180) + clock.elapsedTime) * 5
      streamRef.current.position.y = Math.sin(clock.elapsedTime * 2) * 3
    }
  })
  
  return (
    <Float speed={3} rotationIntensity={0.5}>
      <group ref={streamRef}>
        <Html center>
          <div className="text-cyan-400 text-2xl font-bold">∞%</div>
        </Html>
      </group>
    </Float>
  )
}

const RealityFragment: React.FC<DimensionalBreak> = ({ position, size, age }) => {
  return (
    <Float speed={1} rotationIntensity={0.2}>
      <mesh position={position}>
        <boxGeometry args={[size * 0.5, size * 0.5, size * 0.5]} />
        <meshBasicMaterial 
          color="white" 
          transparent 
          opacity={0.3}
          wireframe
        />
      </mesh>
    </Float>
  )
}

const ROISingularityUI: React.FC<UIProps> = ({ 
  phase, 
  investment, 
  returns, 
  multiplier, 
  timeElapsed, 
  onInvestmentChange 
}) => {
  const phaseNames = ['Traditional ROI', 'Exponential Growth', 'Reality Breaking', 'Singularity Achieved']
  const phaseDescriptions = [
    'Linear returns following traditional business models',
    'Intelligence multiplication creates exponential growth',
    'Returns exceed mathematical limits, reality warps',
    'Infinite returns achieved, normal economics transcended'
  ]
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center">
        <motion.h1 
          className="text-6xl font-thin text-white mb-4"
          animate={{ 
            color: phase > 2 ? '#000000' : '#ffffff',
            textShadow: phase > 2 ? 'none' : '0 0 20px rgba(255,255,255,0.5)'
          }}
        >
          The ROI Singularity
        </motion.h1>
        <motion.p 
          className="text-xl"
          animate={{ 
            color: phase > 2 ? '#333333' : '#9CA3AF'
          }}
        >
          {phaseDescriptions[phase]}
        </motion.p>
      </div>
      
      {phase < 3 && (
        <div className="absolute top-10 left-10 bg-black/80 backdrop-blur-xl p-6 rounded-lg border border-cyan-500/30 pointer-events-auto">
          <h3 className="text-xl text-cyan-400 mb-4">Initial Investment</h3>
          <input
            type="range"
            min="10000"
            max="500000"
            step="10000"
            value={investment}
            onChange={(e) => onInvestmentChange(parseInt(e.target.value))}
            className="w-full mb-2 accent-cyan-500"
          />
          <div className="text-white font-mono text-lg">
            ${investment.toLocaleString()}
          </div>
        </div>
      )}
      
      <div className="absolute top-10 right-10 bg-black/80 backdrop-blur-xl p-6 rounded-lg border border-purple-500/30">
        <h3 className="text-xl text-purple-400 mb-4">ROI Metrics</h3>
        
        <div className="space-y-3">
          <div>
            <div className="text-gray-400 text-sm">Current Phase</div>
            <div className="text-white font-bold">{phaseNames[phase]}</div>
          </div>
          
          <div>
            <div className="text-gray-400 text-sm">Time Elapsed</div>
            <div className="text-white font-mono">{timeElapsed.toFixed(1)} months</div>
          </div>
          
          <div>
            <div className="text-gray-400 text-sm">Current Returns</div>
            <motion.div 
              className="font-mono text-xl"
              animate={{
                color: phase > 2 ? '#ffffff' : multiplier > 100 ? '#ff0000' : multiplier > 10 ? '#ffff00' : '#00ff00',
                scale: phase > 2 ? [1, 1.2, 1] : 1
              }}
              transition={{ repeat: phase > 2 ? Infinity : 0, duration: 0.5 }}
            >
              {phase > 2 ? '∞' : `$${returns.toLocaleString()}`}
            </motion.div>
          </div>
          
          <div>
            <div className="text-gray-400 text-sm">ROI Multiplier</div>
            <motion.div 
              className="font-mono text-2xl"
              animate={{
                color: phase > 2 ? '#ffffff' : multiplier > 100 ? '#ff0000' : multiplier > 10 ? '#ffff00' : '#00ff00',
                textShadow: phase > 2 ? '0 0 10px white' : 'none'
              }}
            >
              {phase > 2 ? '∞x' : `${multiplier.toFixed(1)}x`}
            </motion.div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {phase === 1 && multiplier > 50 && (
          <motion.div
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500/90 text-black p-8 rounded-lg text-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <h3 className="text-2xl font-bold mb-4">WARNING</h3>
            <p className="text-lg">ROI approaching mathematical limits</p>
            <p>Reality distortion imminent</p>
          </motion.div>
        )}
        
        {phase === 2 && (
          <motion.div
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/90 text-white p-8 rounded-lg text-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-3xl font-bold mb-4">REALITY BREACH</h3>
            <p className="text-xl">Returns exceeding physical laws</p>
            <p>Dimensional barriers compromised</p>
          </motion.div>
        )}
        
        {phase === 3 && (
          <motion.div
            className="absolute left-1/2 bottom-20 transform -translate-x-1/2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.h2 
              className="text-6xl font-thin mb-8"
              animate={{ 
                color: ['#ffffff', '#000000', '#ffffff'],
                textShadow: ['0 0 20px white', '0 0 40px black', '0 0 20px white']
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              SINGULARITY ACHIEVED
            </motion.h2>
            <motion.p 
              className="text-2xl mb-12"
              animate={{ color: ['#666666', '#333333', '#666666'] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              Your business has transcended traditional economics
            </motion.p>
            <motion.button
              className="px-12 py-4 bg-white text-black font-bold rounded-full text-xl hover:bg-gray-200 transition-colors pointer-events-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Enter the Singularity
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ROISingularity() {
  const [phase, setPhase] = useState<number>(0)
  const [investmentAmount, setInvestmentAmount] = useState<number>(50000)
  const [timeElapsed, setTimeElapsed] = useState<number>(0)
  const [dimensionalBreaks, setDimensionalBreaks] = useState<DimensionalBreak[]>([])
  
  const calculateROI = (time: number, currentPhase: number): number => {
    if (currentPhase === 0) return investmentAmount * (1 + 0.2 * time)
    if (currentPhase === 1) return investmentAmount * Math.pow(1.5, time)
    if (currentPhase === 2) return investmentAmount * Math.pow(2.5, time * 2)
    if (currentPhase === 3) return Infinity
    return investmentAmount
  }
  
  const currentROI = calculateROI(timeElapsed, phase)
  const roiMultiplier = currentROI === Infinity ? Infinity : currentROI / investmentAmount
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(t => t + 0.1)
      
      if (roiMultiplier !== Infinity) {
        if (roiMultiplier > 1000 && phase < 3) setPhase(3)
        else if (roiMultiplier > 100 && phase < 2) setPhase(2)
        else if (roiMultiplier > 10 && phase < 1) setPhase(1)
      }
    }, 100)
    
    return () => clearInterval(timer)
  }, [roiMultiplier, phase])
  
  const handleBreak = (breakData: DimensionalBreak) => {
    setDimensionalBreaks(prev => [...prev, breakData])
  }
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-violet-900 via-black to-cyan-900">
      <Canvas 
        camera={{ position: [0, 10, 30], fov: 60 }}
        gl={{ 
          antialias: true, 
          toneMapping: phase > 2 ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping,
          toneMappingExposure: phase > 2 ? 2 : 1
        }}
      >
        <color attach="background" args={phase > 2 ? ['white'] : ['#000012']} />
        
        <ambientLight intensity={phase > 2 ? 2 : 0.1} />
        {phase < 3 && <pointLight position={[10, 10, 10]} intensity={1} />}
        
        {phase < 2 && (
          <Stars 
            radius={100} 
            depth={50} 
            count={5000} 
            factor={4} 
            saturation={0} 
            fade 
            speed={phase * 2}
          />
        )}
        
        {phase === 0 && (
          <TraditionalROIVisualization 
            investment={investmentAmount}
            returns={currentROI}
            time={timeElapsed}
          />
        )}
        
        {phase === 1 && (
          <ExponentialGrowthVisualization
            investment={investmentAmount}
            returns={currentROI}
            multiplier={roiMultiplier as number}
            time={timeElapsed}
          />
        )}
        
        {phase === 2 && (
          <DimensionalBreakVisualization
            investment={investmentAmount}
            returns={currentROI}
            multiplier={roiMultiplier as number}
            onBreak={handleBreak}
          />
        )}
        
        {phase === 3 && (
          <SingularityVisualization
            investment={investmentAmount}
            dimensionalBreaks={dimensionalBreaks}
          />
        )}
        
        <OrbitControls 
          enabled={phase < 3}
          autoRotate={phase >= 1}
          autoRotateSpeed={phase * 2}
        />
      </Canvas>
      
      <ROISingularityUI 
        phase={phase}
        investment={investmentAmount}
        returns={currentROI}
        multiplier={roiMultiplier as number}
        timeElapsed={timeElapsed}
        onInvestmentChange={setInvestmentAmount}
      />
    </div>
  )
}