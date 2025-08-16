'use client'

import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Float, Text3D, Center, Environment, Html } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'

interface Department {
  id: string
  name: string
  color: string
  position: [number, number, number]
  addedTime?: number
}

interface Connection {
  start: string
  end: string
  strength: number
}

interface ExplosionMoment {
  id: string
  time: number
  position: [number, number, number]
}

const MultiplicationChamber: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [intelligenceLevel, setIntelligenceLevel] = useState<number>(0)
  const [explosionMoments, setExplosionMoments] = useState<ExplosionMoment[]>([])
  
  const availableDepartments: Department[] = [
    { id: 'sales', name: 'Sales Intelligence', color: '#00D9FF', position: [-8, 6, 0] },
    { id: 'finance', name: 'Financial Intelligence', color: '#FFD700', position: [-4, 6, 0] },
    { id: 'operations', name: 'Operations Intelligence', color: '#00FF88', position: [0, 6, 0] },
    { id: 'hr', name: 'HR Intelligence', color: '#FF1493', position: [4, 6, 0] },
    { id: 'marketing', name: 'Marketing Intelligence', color: '#9D00FF', position: [8, 6, 0] }
  ]
  
  useEffect(() => {
    const n = departments.length
    const potentialConnections = (n * (n - 1)) / 2
    const exponentialValue = Math.pow(2, potentialConnections)
    setIntelligenceLevel(exponentialValue)
    
    const newConnections: Connection[] = []
    for (let i = 0; i < departments.length; i++) {
      for (let j = i + 1; j < departments.length; j++) {
        newConnections.push({
          start: departments[i].id,
          end: departments[j].id,
          strength: Math.random() * 0.5 + 0.5
        })
      }
    }
    setConnections(newConnections)
  }, [departments])
  
  const addDepartment = (dept: Department) => {
    if (!departments.find(d => d.id === dept.id)) {
      const newDept = { ...dept, addedTime: Date.now() }
      setDepartments([...departments, newDept])
      setExplosionMoments([...explosionMoments, {
        id: `explosion-${Date.now()}`,
        time: Date.now(),
        position: [0, 0, 0]
      }])
    }
  }
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900">
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <color attach="background" args={['#0f0f23']} />
        
        <Suspense fallback={null}>
          <ambientLight intensity={0.05 + intelligenceLevel * 0.001} />
          <Stars 
            radius={100} 
            depth={50} 
            count={5000} 
            factor={4} 
            saturation={0} 
            fade 
            speed={intelligenceLevel > 1 ? 1 : 0}
          />
          
          <Environment preset="night" />
          
          <ChamberWalls intelligenceLevel={intelligenceLevel} />
          
          {departments.map((dept, index) => (
            <DepartmentOrb 
              key={dept.id} 
              department={dept}
              index={index}
              totalDepartments={departments.length}
              connections={connections.filter(c => c.start === dept.id || c.end === dept.id)}
            />
          ))}
          
          {availableDepartments
            .filter(dept => !departments.find(d => d.id === dept.id))
            .map(dept => (
              <FloatingDepartment 
                key={dept.id} 
                department={dept}
                onClick={() => addDepartment(dept)}
              />
            ))}
          
          <ConnectionNetwork connections={connections} departments={departments} />
          
          {explosionMoments.map((explosion) => (
            <ExplosionEffect key={explosion.id} explosion={explosion} />
          ))}
          
          <EffectComposer>
            <Bloom 
              intensity={0.5 + intelligenceLevel * 0.01} 
              luminanceThreshold={0.2} 
              luminanceSmoothing={0.9} 
            />
            {intelligenceLevel > 8 && (
              <ChromaticAberration offset={[0.001 * intelligenceLevel, 0.001 * intelligenceLevel]} />
            )}
          </EffectComposer>
          
          <OrbitControls 
            enablePan={false} 
            enableZoom={true}
            minDistance={10}
            maxDistance={50}
            autoRotate={intelligenceLevel > 1}
            autoRotateSpeed={intelligenceLevel * 0.1}
          />
        </Suspense>
      </Canvas>
      
      <MultiplicationUI 
        departments={departments}
        intelligenceLevel={intelligenceLevel}
        connections={connections}
      />
    </div>
  )
}

interface DepartmentOrbProps {
  department: Department
  index: number
  totalDepartments: number
  connections: Connection[]
}

const DepartmentOrb: React.FC<DepartmentOrbProps> = ({ 
  department, 
  index, 
  totalDepartments, 
  connections 
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(clock.elapsedTime * 2 + index) * 0.1
      meshRef.current.scale.setScalar(scale)
      meshRef.current.rotation.y += connections.length * 0.001
    }
    
    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(clock.elapsedTime * 3 + index) * 0.5
    }
    
    if (groupRef.current && totalDepartments > 1) {
      const angle = clock.elapsedTime * 0.2 + index * Math.PI * 2 / totalDepartments
      const radius = 5
      groupRef.current.position.x = Math.cos(angle) * radius
      groupRef.current.position.z = Math.sin(angle) * radius
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.5 + index) * 0.5
    }
  })
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color={department.color}
          emissive={department.color}
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      <pointLight 
        ref={lightRef}
        color={department.color} 
        intensity={2} 
        distance={10}
      />
      
      <Html position={[0, 2, 0]} center>
        <div className="text-white text-sm font-medium whitespace-nowrap pointer-events-none">
          {department.name}
        </div>
      </Html>
      
      <mesh scale={1.5}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={department.color}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

interface ConnectionNetworkProps {
  connections: Connection[]
  departments: Department[]
}

const ConnectionNetwork: React.FC<ConnectionNetworkProps> = ({ connections, departments }) => {
  return (
    <group>
      {connections.map((connection, i) => (
        <ConnectionLine 
          key={`${connection.start}-${connection.end}`}
          connection={connection}
          departments={departments}
          index={i}
        />
      ))}
    </group>
  )
}

interface ConnectionLineProps {
  connection: Connection
  departments: Department[]
  index: number
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({ connection, departments, index }) => {
  const lineRef = useRef<THREE.Line>(null)
  
  useFrame(({ clock }) => {
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial
      material.opacity = 0.3 + Math.sin(clock.elapsedTime * 2 + index) * 0.2
    }
  })
  
  const startDept = departments.find(d => d.id === connection.start)
  const endDept = departments.find(d => d.id === connection.end)
  
  if (!startDept || !endDept) return null
  
  const points = []
  const startVec = new THREE.Vector3(0, 0, 0)
  const endVec = new THREE.Vector3(5, 0, 5)
  
  const mid = startVec.clone().add(endVec).multiplyScalar(0.5)
  mid.y += 2
  
  const curve = new THREE.QuadraticBezierCurve3(startVec, mid, endVec)
  points.push(...curve.getPoints(50))
  
  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#00FFFF"
        transparent
        opacity={0.3}
      />
    </line>
  )
}

interface ExplosionEffectProps {
  explosion: ExplosionMoment
}

const ExplosionEffect: React.FC<ExplosionEffectProps> = ({ explosion }) => {
  const groupRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Mesh[]>([])
  const startTime = useRef(explosion.time)
  
  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000
    
    if (groupRef.current) {
      groupRef.current.scale.setScalar(1 + elapsed * 10)
      
      if (elapsed > 2) {
        groupRef.current.visible = false
      }
    }
    
    particlesRef.current.forEach((particle, i) => {
      if (particle) {
        const speed = 5 + i * 0.5
        particle.position.x += Math.sin(i) * speed * 0.01
        particle.position.y += Math.cos(i) * speed * 0.01
        particle.position.z += Math.sin(i * 0.5) * speed * 0.01
        particle.scale.setScalar(Math.max(0, 1 - elapsed))
      }
    })
  })
  
  const particles = useMemo(() => {
    const parts = []
    for (let i = 0; i < 50; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      parts.push({
        position: [0, 0, 0] as [number, number, number],
        velocity: {
          x: Math.sin(phi) * Math.cos(theta),
          y: Math.sin(phi) * Math.sin(theta),
          z: Math.cos(phi)
        }
      })
    }
    return parts
  }, [])
  
  return (
    <group ref={groupRef} position={explosion.position}>
      <mesh>
        <ringGeometry args={[0, 1, 64]} />
        <meshBasicMaterial
          color="#00FFFF"
          transparent
          opacity={1}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {particles.map((particle, i) => (
        <mesh
          key={i}
          ref={el => { if (el) particlesRef.current[i] = el }}
          position={particle.position}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" emissive="#00FFFF" emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  )
}

interface ChamberWallsProps {
  intelligenceLevel: number
}

const ChamberWalls: React.FC<ChamberWallsProps> = ({ intelligenceLevel }) => {
  const wallsRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (wallsRef.current) {
      const material = wallsRef.current.material as THREE.MeshPhysicalMaterial
      material.opacity = Math.max(0.1, 1 - intelligenceLevel * 0.01)
      
      const pulse = Math.sin(clock.elapsedTime) * 0.02
      wallsRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse)
    }
  })
  
  return (
    <mesh ref={wallsRef}>
      <boxGeometry args={[30, 30, 30]} />
      <meshPhysicalMaterial
        color="#001840"
        transparent
        opacity={0.3}
        side={THREE.BackSide}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  )
}

interface FloatingDepartmentProps {
  department: Department
  onClick: () => void
}

const FloatingDepartment: React.FC<FloatingDepartmentProps> = ({ department, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = department.position[1] + Math.sin(clock.elapsedTime + department.position[0]) * 0.2
      meshRef.current.rotation.y = clock.elapsedTime * 0.5
      
      const scale = hovered ? 1.2 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
    }
  })
  
  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        position={department.position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshPhysicalMaterial
          color={department.color}
          emissive={department.color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          roughness={0.3}
          metalness={0.7}
          clearcoat={1}
        />
      </mesh>
      
      <Html position={[0, 1.5, 0]} center>
        <div className="text-white text-xs font-medium whitespace-nowrap pointer-events-none">
          Click to add
        </div>
      </Html>
    </Float>
  )
}

interface MultiplicationUIProps {
  departments: Department[]
  intelligenceLevel: number
  connections: Connection[]
}

const MultiplicationUI: React.FC<MultiplicationUIProps> = ({ 
  departments, 
  intelligenceLevel, 
  connections 
}) => {
  const formulaSteps = useMemo(() => {
    const steps = []
    for (let i = 1; i <= departments.length; i++) {
      const linearValue = i
      const connectionCount = (i * (i - 1)) / 2
      const exponentialValue = Math.pow(2, connectionCount)
      steps.push({ 
        count: i, 
        linear: linearValue, 
        exponential: exponentialValue,
        connections: connectionCount
      })
    }
    return steps
  }, [departments.length])
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20">
          <h2 className="text-4xl font-thin text-white text-center mb-4">
            The Multiplication Chamber
          </h2>
          <p className="text-xl text-gray-300 text-center">
            Add departments and witness exponential intelligence growth
          </p>
        </div>
      </div>
      
      <div className="absolute left-10 top-1/2 transform -translate-y-1/2 text-white">
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20">
          <h3 className="text-2xl mb-4 text-cyan-400">The Mathematics of Intelligence</h3>
          <div className="space-y-3">
            {formulaSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: i < departments.length ? 1 : 0.3,
                  x: 0,
                  scale: i === departments.length - 1 ? 1.1 : 1
                }}
                className={`
                  ${i < departments.length ? 'text-white' : 'text-gray-600'}
                  ${i === departments.length - 1 ? 'text-cyan-400 font-bold' : ''}
                `}
              >
                <div className="font-mono text-sm">
                  {step.count} {step.count === 1 ? 'dept' : 'depts'}: 
                  Linear = {step.linear} | 
                  Connections = {step.connections} | 
                  Exponential = {step.exponential.toLocaleString()}x
                </div>
              </motion.div>
            ))}
          </div>
          
          {departments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-4 border border-cyan-500 rounded-lg bg-cyan-500/10"
            >
              <p className="text-sm text-gray-400">Current Intelligence Multiplier</p>
              <p className="text-4xl font-bold text-cyan-400">
                {intelligenceLevel.toLocaleString()}x
              </p>
              <p className="text-sm text-gray-400 mt-2">
                vs. {departments.length}x with traditional software
              </p>
            </motion.div>
          )}
        </div>
      </div>
      
      <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-white">
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20">
          <h3 className="text-2xl mb-4 text-emerald-400">Active Synapses</h3>
          <AnimatePresence>
            {connections.map((connection, i) => (
              <motion.div
                key={`${connection.start}-${connection.end}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center mb-2"
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ 
                    backgroundColor: departments.find(d => d.id === connection.start)?.color 
                  }}
                />
                <span className="text-sm">↔</span>
                <div 
                  className="w-3 h-3 rounded-full ml-2 mr-4"
                  style={{ 
                    backgroundColor: departments.find(d => d.id === connection.end)?.color 
                  }}
                />
                <span className="text-cyan-400 text-sm">
                  {Math.round(connection.strength * 100)}% synergy
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {connections.length > 0 && (
            <div className="mt-4 text-sm text-gray-400">
              Total connections: {connections.length}
            </div>
          )}
        </div>
      </div>
      
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center"
        animate={{ 
          opacity: departments.length > 2 ? 1 : 0,
          y: departments.length > 2 ? 0 : 20
        }}
      >
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20">
          <p className="text-2xl text-white mb-2">
            Your business is now {intelligenceLevel.toLocaleString()}x more intelligent
          </p>
          <p className="text-lg text-gray-300">
            This isn't addition. This is multiplication. This is consciousness.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default MultiplicationChamber