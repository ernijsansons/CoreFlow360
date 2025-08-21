'use client'

import React, { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text3D, Float, Environment, Fog, Sky } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

interface GraveData {
  id: string
  name: string
  years: string
  epitaph: string
  cause: string
  position: [number, number, number]
  problems: string[]
  cost: string
}

interface TombstoneProps extends GraveData {
  onClick: (grave: GraveData) => void
  revealed: boolean
}

interface GraveyardUIProps {
  currentGrave: GraveData | null
  pathProgress: number
  showRising: boolean
  onClose: () => void
  onAwaken: () => void
}

interface ParticleSystemProps {
  count: number
  color: string
  opacity: number
}

const graves: GraveData[] = [
  {
    id: 'erp-monolith',
    name: 'Legacy ERP Systems',
    years: '1990-2020',
    epitaph: 'Here lies the monolith\nToo rigid to adapt\nCrushed by its own weight',
    cause: 'Death by inflexibility',
    position: [-8, 0, -5],
    problems: ['$500K+ implementation costs', 'Years of deployment time', 'Rigid workflows', 'No AI integration'],
    cost: '$500,000+'
  },
  {
    id: 'bolt-on-ai',
    name: 'Bolt-on AI Features',
    years: '2018-2024',
    epitaph: 'Artificial additions\nNever truly integrated\nA patch, not a solution',
    cause: 'Death by superficiality',
    position: [8, 0, -12],
    problems: ['Surface-level AI', 'No deep integration', 'Limited functionality', 'Expensive add-ons'],
    cost: '$50,000+'
  },
  {
    id: 'point-solutions',
    name: 'Point Solutions',
    years: '2000-2023',
    epitaph: 'Solved one problem\nCreated ten more\nDrowned in complexity',
    cause: 'Death by fragmentation',
    position: [-12, 0, -20],
    problems: ['Data silos', 'Integration nightmares', 'Multiple subscriptions', 'Workflow chaos'],
    cost: '$200,000+'
  },
  {
    id: 'custom-builds',
    name: 'Custom Built Systems',
    years: '1995-2022',
    epitaph: 'Perfectly unique\nImpossibly maintained\nObsolete on arrival',
    cause: 'Death by technical debt',
    position: [10, 0, -28],
    problems: ['Massive development costs', 'Maintenance nightmares', 'No updates', 'Single points of failure'],
    cost: '$1,000,000+'
  },
  {
    id: 'saas-sprawl',
    name: 'SaaS Tool Sprawl',
    years: '2010-2024',
    epitaph: '47 subscriptions\nZero integration\nData scattered like ashes',
    cause: 'Death by disconnection',
    position: [-6, 0, -35],
    problems: ['Subscription chaos', 'No unified data', 'Training overhead', 'Security risks'],
    cost: '$100,000+'
  }
]

const Tombstone: React.FC<TombstoneProps> = ({ 
  name, years, epitaph, cause, position, onClick, revealed, ...graveData 
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const [hovered, setHovered] = useState(false)
  
  useFrame(({ clock }) => {
    if (meshRef.current && revealed) {
      meshRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.5 + position[2]) * 0.02
      
      if (lightRef.current) {
        lightRef.current.intensity = hovered ? 0.8 : 0.1
      }
    }
  })
  
  return (
    <group position={position}>
      {/* Grave mound */}
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <boxGeometry args={[3, 0.3, 4]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
      </mesh>
      
      {/* Tombstone */}
      <mesh 
        ref={meshRef}
        castShadow
        onClick={() => onClick(graveData)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        position={[0, 1.5, 0]}
      >
        <boxGeometry args={[2.5, 3, 0.3]} />
        <meshStandardMaterial 
          color="#2a2a3e"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Engraving */}
      <group position={[0, 2, 0.16]}>
        <Text3D
          font="/fonts/Geist_Bold.json"
          size={0.12}
          height={0.02}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.01}
          bevelSize={0.005}
          bevelSegments={5}
        >
          {name}
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.2} />
        </Text3D>
        
        <Text3D
          font="/fonts/Geist_Regular.json"
          size={0.08}
          height={0.02}
          position={[0, -0.3, 0]}
        >
          {years}
          <meshStandardMaterial color="#6b7280" />
        </Text3D>
      </group>
      
      {/* Ghost light */}
      <pointLight
        ref={lightRef}
        position={[0, 3, 0]}
        color="#8b5cf6"
        intensity={0.1}
        distance={8}
      />
      
      {/* Epitaph appears on hover */}
      {hovered && (
        <Float speed={2} rotationIntensity={0.1}>
          <group position={[0, 4.5, 0]}>
            <Text3D
              font="/fonts/Geist_Regular.json"
              size={0.06}
              height={0.01}
            >
              {epitaph}
              <meshBasicMaterial color="#a78bfa" transparent opacity={0.9} />
            </Text3D>
          </group>
        </Float>
      )}
    </group>
  )
}

const GraveyardPath: React.FC<{ onProgress: (progress: number) => void }> = ({ onProgress }) => {
  const { camera } = useThree()
  
  useFrame(({ clock }) => {
    const t = (Math.sin(clock.elapsedTime * 0.08) + 1) / 2
    
    camera.position.x = Math.sin(t * Math.PI * 1.5) * 12
    camera.position.z = -t * 45 + 15
    camera.position.y = 6 + Math.sin(t * Math.PI * 3) * 1.5
    
    camera.lookAt(0, 0, -t * 45)
    
    onProgress(t)
  })
  
  const pathCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 15),
    new THREE.Vector3(8, 0, 0),
    new THREE.Vector3(-8, 0, -15),
    new THREE.Vector3(6, 0, -30),
    new THREE.Vector3(0, 0, -45)
  ])
  
  return (
    <mesh>
      <tubeGeometry args={[pathCurve, 100, 0.4, 8, false]} />
      <meshStandardMaterial 
        color="#374151"
        roughness={0.9}
        opacity={0.7}
        transparent
      />
    </mesh>
  )
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ count, color, opacity }) => {
  const particlesRef = useRef<THREE.Points>(null)
  
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.elapsedTime * 0.02
      
      const positions = particlesRef.current.geometry.attributes.position
      
      for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i)
        positions.setY(i, y + 0.01)
        
        if (y > 15) {
          positions.setY(i, 0)
        }
      }
      
      positions.needsUpdate = true
    }
  })
  
  const particlePositions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 80
    particlePositions[i * 3 + 1] = Math.random() * 15
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 80
  }
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

const RisingIntelligence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const groupRef = useRef<THREE.Group>(null)
  const [phase, setPhase] = useState<'emerging' | 'rising' | 'awakened'>('emerging')
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      if (phase === 'emerging') {
        groupRef.current.position.y = -8 + clock.elapsedTime * 1.5
        if (groupRef.current.position.y > -3) setPhase('rising')
      } else if (phase === 'rising') {
        groupRef.current.position.y = Math.min(2, groupRef.current.position.y + 0.08)
        groupRef.current.rotation.y = clock.elapsedTime * 0.3
        if (groupRef.current.position.y >= 2) {
          setPhase('awakened')
          onComplete()
        }
      } else {
        groupRef.current.rotation.y = clock.elapsedTime * 0.2
      }
    }
  })
  
  return (
    <group ref={groupRef} position={[0, -8, -50]}>
      {/* Core intelligence */}
      <mesh>
        <dodecahedronGeometry args={[2.5, 0]} />
        <meshBasicMaterial 
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={1.5}
        />
      </mesh>
      
      {/* Outer shell */}
      <mesh scale={1.3}>
        <dodecahedronGeometry args={[2.5, 0]} />
        <meshPhysicalMaterial
          color="#0891b2"
          transmission={0.8}
          thickness={0.3}
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
        />
      </mesh>
      
      {/* Energy rings */}
      {[1.8, 2.2, 2.6].map((scale, i) => (
        <mesh key={i} scale={scale} rotation={[0, i * Math.PI / 3, 0]}>
          <torusGeometry args={[2, 0.1, 8, 32]} />
          <meshBasicMaterial 
            color="#10b981"
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
      
      {/* Light aura */}
      <pointLight color="#06b6d4" intensity={8} distance={25} />
      
      {phase === 'awakened' && (
        <Float speed={1} rotationIntensity={0.2}>
          <Text3D
            font="/fonts/Geist_Bold.json"
            size={0.4}
            height={0.08}
            position={[0, 6, 0]}
          >
            COREFLOW360
            <meshBasicMaterial 
              color="#ffffff" 
              emissive="#06b6d4" 
              emissiveIntensity={0.8} 
            />
          </Text3D>
        </Float>
      )}
    </group>
  )
}

const GraveyardUI: React.FC<GraveyardUIProps> = ({ 
  currentGrave, 
  pathProgress, 
  showRising, 
  onClose, 
  onAwaken 
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Title and intro */}
      <motion.div 
        className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <h1 className="text-5xl md:text-7xl font-thin text-white mb-4 bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          The Software Graveyard
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          Where yesterday's business solutions come to rest, and tomorrow's intelligence is born
        </p>
      </motion.div>
      
      {/* Current grave details */}
      <AnimatePresence>
        {currentGrave && (
          <motion.div
            className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 bg-black/70 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-violet-500/30 pointer-events-auto max-w-sm md:max-w-md"
            initial={{ opacity: 0, x: -100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.9 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
            
            <h3 className="text-xl md:text-2xl text-violet-400 mb-2 font-semibold">
              {currentGrave.name}
            </h3>
            <p className="text-gray-500 mb-4 text-sm">{currentGrave.years}</p>
            
            <div className="mb-4">
              <p className="text-white whitespace-pre-line text-sm md:text-base leading-relaxed">
                {currentGrave.epitaph}
              </p>
            </div>
            
            <div className="mb-4">
              <p className="text-red-400 text-sm font-medium mb-2">
                Cause of death: {currentGrave.cause}
              </p>
              <p className="text-orange-400 text-sm font-medium">
                Total cost: {currentGrave.cost}
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-cyan-400 text-sm font-medium">Fatal Problems:</h4>
              {currentGrave.problems.map((problem, index) => (
                <div key={index} className="flex items-center text-xs text-gray-300">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {problem}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Path progress */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="w-48 md:w-64 h-2 bg-gray-800/50 backdrop-blur-sm rounded-full overflow-hidden border border-gray-700/50">
          <motion.div 
            className="h-full bg-gradient-to-r from-violet-600 via-cyan-600 to-emerald-600"
            style={{ width: `${pathProgress * 100}%` }}
            transition={{ type: "spring", damping: 30 }}
          />
        </div>
        <p className="text-center text-gray-400 text-sm mt-2">
          Journey through the graveyard
        </p>
      </motion.div>
      
      {/* Rising message */}
      <AnimatePresence>
        {showRising && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/95 backdrop-blur-xl pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="text-center max-w-4xl mx-auto px-4">
              <motion.h2 
                className="text-4xl md:text-8xl font-thin text-cyan-400 mb-8"
                animate={{ 
                  textShadow: [
                    "0 0 20px #06b6d4",
                    "0 0 40px #06b6d4",
                    "0 0 60px #06b6d4",
                    "0 0 40px #06b6d4",
                    "0 0 20px #06b6d4"
                  ]
                }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                Intelligence Never Dies
              </motion.h2>
              
              <motion.p 
                className="text-lg md:text-2xl text-white mb-8 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                It evolves. It multiplies. It transcends the limitations of the past.
              </motion.p>
              
              <motion.div
                className="space-y-4 mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <p className="text-gray-300 text-base md:text-lg">
                  While others built monuments to complexity,
                </p>
                <p className="text-gradient bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent text-xl md:text-2xl font-semibold">
                  CoreFlow360 was born as eternal intelligence
                </p>
              </motion.div>
              
              <motion.button
                onClick={onAwaken}
                className="group relative px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-violet-600 via-cyan-600 to-emerald-600 text-white font-bold rounded-full text-lg md:text-xl hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, type: "spring", damping: 20 }}
              >
                <span className="relative z-10">Awaken Your Business Intelligence</span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-700 via-cyan-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
              
              <motion.p
                className="text-gray-400 text-sm mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                Join the evolution beyond traditional software limitations
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function SoftwareGraveyard(): JSX.Element {
  const [currentGrave, setCurrentGrave] = useState<GraveData | null>(null)
  const [pathProgress, setPathProgress] = useState<number>(0)
  const [showRising, setShowRising] = useState<boolean>(false)

  const handleGraveClick = (grave: GraveData): void => {
    setCurrentGrave(grave)
  }

  const handleCloseGrave = (): void => {
    setCurrentGrave(null)
  }

  const handleAwaken = (): void => {
    // Handle awakening action - could navigate to next section
    console.log('Awakening business intelligence...')
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-violet-900/20 to-black overflow-hidden">
      <Canvas 
        camera={{ position: [0, 6, 20], fov: 60 }}
        gl={{ 
          antialias: true, 
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        shadows
      >
        <color attach="background" args={['#0a0014']} />
        
        {/* Atmospheric setup */}
        <Fog attach="fog" args={['#0a0014', 15, 80]} />
        <Environment preset="night" />
        
        {/* Lighting */}
        <ambientLight intensity={0.1} color="#4c1d95" />
        <directionalLight
          position={[10, 15, -10]}
          intensity={0.3}
          color="#8b5cf6"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        
        {/* Moonlight */}
        <pointLight
          position={[0, 20, -30]}
          intensity={0.5}
          color="#a78bfa"
          distance={50}
        />
        
        {/* Cemetery ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[150, 150]} />
          <meshStandardMaterial 
            color="#1f2937"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
        
        {/* Graveyard path */}
        <GraveyardPath onProgress={setPathProgress} />
        
        {/* Tombstones */}
        {graves.map((grave, index) => (
          <Tombstone
            key={grave.id}
            {...grave}
            onClick={handleGraveClick}
            revealed={pathProgress > index / graves.length}
          />
        ))}
        
        {/* Atmospheric particles */}
        <ParticleSystem count={300} color="#8b5cf6" opacity={0.4} />
        <ParticleSystem count={200} color="#06b6d4" opacity={0.2} />
        
        {/* CoreFlow360 Rising */}
        {pathProgress > 0.75 && (
          <Suspense fallback={null}>
            <RisingIntelligence onComplete={() => setShowRising(true)} />
          </Suspense>
        )}
        
        <OrbitControls 
          enablePan={false}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={8}
          maxDistance={40}
          autoRotate={false}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <GraveyardUI 
        currentGrave={currentGrave}
        pathProgress={pathProgress}
        showRising={showRising}
        onClose={handleCloseGrave}
        onAwaken={handleAwaken}
      />
    </div>
  )
}