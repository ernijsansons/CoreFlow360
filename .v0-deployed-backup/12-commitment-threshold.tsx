'use client'

import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Text, Html, Sphere, Ring, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'

interface CommitmentQuestion {
  id: string
  question: string
  weight: number
  type: 'boolean' | 'choice'
  options?: string[]
}

interface UserResponses {
  [key: string]: boolean | string | undefined
}

type Stage = 'approach' | 'contemplation' | 'commitment' | 'transformation' | 'welcome'

const CommitmentThreshold: React.FC = () => {
  const [stage, setStage] = useState<Stage>('approach')
  const [commitmentLevel, setCommitmentLevel] = useState<number>(0)
  const [userResponses, setUserResponses] = useState<UserResponses>({})
  const [portalEnergy, setPortalEnergy] = useState<number>(0)
  const [transformationProgress, setTransformationProgress] = useState<number>(0)
  
  const commitmentQuestions: CommitmentQuestion[] = [
    {
      id: 'readiness',
      question: 'Are you ready to stop managing your business manually?',
      weight: 20,
      type: 'boolean'
    },
    {
      id: 'time',
      question: 'How many hours per week do you currently spend on tasks that could be automated?',
      options: ['<10 hours', '10-20 hours', '20-40 hours', '40+ hours'],
      weight: 15,
      type: 'choice'
    },
    {
      id: 'growth',
      question: 'What revenue growth would justify transforming your business?',
      options: ['50% increase', '100% increase', '200% increase', '500%+ increase'],
      weight: 25,
      type: 'choice'
    },
    {
      id: 'lifestyle',
      question: 'Do you dream of working less while earning more?',
      weight: 20,
      type: 'boolean'
    },
    {
      id: 'legacy',
      question: 'Do you want to build a business that works without you?',
      weight: 20,
      type: 'boolean'
    }
  ]
  
  const calculateCommitmentLevel = (): number => {
    let total = 0
    commitmentQuestions.forEach(q => {
      const response = userResponses[q.id]
      if (response !== undefined) {
        if (q.type === 'boolean') {
          total += response ? q.weight : 0
        } else if (q.type === 'choice' && q.options) {
          const choiceValue = q.options.indexOf(response as string) / (q.options.length - 1)
          total += choiceValue * q.weight
        }
      }
    })
    return Math.min(100, total)
  }
  
  useEffect(() => {
    const newLevel = calculateCommitmentLevel()
    setCommitmentLevel(newLevel)
    setPortalEnergy(newLevel / 100)
  }, [userResponses])

  useEffect(() => {
    if (stage === 'approach') {
      const timer = setTimeout(() => setStage('contemplation'), 5000)
      return () => clearTimeout(timer)
    }
  }, [stage])

  useEffect(() => {
    if (stage === 'contemplation' && commitmentLevel >= 80) {
      const timer = setTimeout(() => setStage('commitment'), 2000)
      return () => clearTimeout(timer)
    }
  }, [stage, commitmentLevel])
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-violet-900 to-slate-900">
      <Canvas 
        camera={{ position: [0, 5, 15], fov: 70 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={['#0f0f23']} />
        
        <Environment preset="night" />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <CommitmentPortal 
            energy={portalEnergy}
            stage={stage}
            commitmentLevel={commitmentLevel}
          />
          
          {stage === 'approach' && <ApproachScene />}
          {stage === 'contemplation' && <ContemplationScene commitmentLevel={commitmentLevel} />}
          {stage === 'commitment' && <CommitmentScene portalEnergy={portalEnergy} />}
          {stage === 'transformation' && <TransformationScene />}
          {stage === 'welcome' && <WelcomeScene />}
          
          <ParticleField energy={portalEnergy} stage={stage} />
        </Suspense>
        
        <OrbitControls 
          enabled={stage !== 'transformation'}
          autoRotate={stage === 'welcome'}
          autoRotateSpeed={0.5}
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
      
      <CommitmentUI 
        stage={stage}
        commitmentLevel={commitmentLevel}
        questions={commitmentQuestions}
        userResponses={userResponses}
        onResponseChange={setUserResponses}
        onStageChange={setStage}
        portalEnergy={portalEnergy}
      />
    </div>
  )
}

const CommitmentPortal: React.FC<{
  energy: number
  stage: Stage
  commitmentLevel: number
}> = ({ energy, stage, commitmentLevel }) => {
  const portalRef = useRef<THREE.Group>(null)
  const ringsRef = useRef<(THREE.Mesh | null)[]>([])
  
  useFrame(({ clock }) => {
    if (portalRef.current) {
      const scale = 1 + energy * 2
      portalRef.current.scale.setScalar(scale)
      portalRef.current.rotation.z = clock.elapsedTime * (0.5 + energy)
    }
    
    ringsRef.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.z = clock.elapsedTime * (1 + i * 0.3) * (energy + 0.1)
        ring.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2 + i) * energy * 0.2)
      }
    })
  })
  
  return (
    <group ref={portalRef} position={[0, 0, -5]}>
      {[...Array(5)].map((_, i) => (
        <Ring 
          key={i}
          ref={(el) => { ringsRef.current[i] = el }}
          args={[2 + i * 0.4, 2.2 + i * 0.4, 64]}
        >
          <meshBasicMaterial 
            color={new THREE.Color().setHSL(0.6 + energy * 0.2, 1, 0.5)}
            emissive={new THREE.Color().setHSL(0.6 + energy * 0.2, 1, 0.3)}
            emissiveIntensity={energy * 3}
            transparent
            opacity={energy * 0.8}
          />
        </Ring>
      ))}
      
      <Sphere args={[1.5, 32, 32]}>
        <meshBasicMaterial 
          color={new THREE.Color().setHSL(0.7, 1, 0.6)}
          transparent
          opacity={stage === 'commitment' ? energy * 0.8 : energy * 0.3}
        />
      </Sphere>
      
      {stage === 'commitment' && (
        <PortalEnergyField energy={energy} />
      )}
    </group>
  )
}

const PortalEnergyField: React.FC<{ energy: number }> = ({ energy }) => {
  const fieldRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (fieldRef.current) {
      fieldRef.current.scale.setScalar(3 + Math.sin(clock.elapsedTime * 2) * energy)
      fieldRef.current.rotation.y = clock.elapsedTime * energy
    }
  })
  
  return (
    <mesh ref={fieldRef}>
      <sphereGeometry args={[3, 16, 16]} />
      <meshBasicMaterial 
        color="#4a90e2"
        transparent
        opacity={energy * 0.1}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

const ApproachScene: React.FC = () => {
  return (
    <group>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <Text
          position={[0, 3, 0]}
          fontSize={1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Geist-Bold.ttf"
        >
          THE THRESHOLD AWAITS
        </Text>
      </Float>
    </group>
  )
}

const ContemplationScene: React.FC<{ commitmentLevel: number }> = ({ commitmentLevel }) => {
  const sceneRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (sceneRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 2) * (commitmentLevel / 1000)
      sceneRef.current.scale.setScalar(pulse)
    }
  })
  
  return (
    <group ref={sceneRef}>
      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[6, 64]} />
          <meshStandardMaterial 
            color="#1a1a2e"
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.6}
          />
        </mesh>
      </Float>
    </group>
  )
}

const CommitmentScene: React.FC<{ portalEnergy: number }> = ({ portalEnergy }) => {
  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Text
          position={[0, 4, 0]}
          fontSize={0.8}
          color="#4a90e2"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Geist-Bold.ttf"
        >
          STEP THROUGH
        </Text>
      </Float>
    </group>
  )
}

const TransformationScene: React.FC = () => {
  const transformRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (transformRef.current) {
      transformRef.current.rotation.y = clock.elapsedTime * 2
      transformRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 3) * 0.5)
    }
  })
  
  return (
    <group ref={transformRef}>
      <Float speed={3} rotationIntensity={1} floatIntensity={2}>
        <Text
          position={[0, 0, 0]}
          fontSize={1.2}
          color="#00ff88"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Geist-Bold.ttf"
        >
          TRANSFORMING
        </Text>
      </Float>
    </group>
  )
}

const WelcomeScene: React.FC = () => {
  return (
    <group>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <Text
          position={[0, 2, 0]}
          fontSize={1.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Geist-Bold.ttf"
        >
          WELCOME
        </Text>
        <Text
          position={[0, 0, 0]}
          fontSize={0.8}
          color="#4a90e2"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Geist-Regular.ttf"
        >
          Intelligence Commander
        </Text>
      </Float>
    </group>
  )
}

const ParticleField: React.FC<{ energy: number; stage: Stage }> = ({ energy, stage }) => {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particleCount = 1000
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50
    }
    return pos
  }, [])
  
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.elapsedTime * 0.1
      const material = particlesRef.current.material as THREE.PointsMaterial
      material.opacity = energy * 0.6
    }
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#4a90e2"
        transparent
        opacity={energy * 0.6}
      />
    </points>
  )
}

const CommitmentUI: React.FC<{
  stage: Stage
  commitmentLevel: number
  questions: CommitmentQuestion[]
  userResponses: UserResponses
  onResponseChange: (responses: UserResponses) => void
  onStageChange: (stage: Stage) => void
  portalEnergy: number
}> = ({ 
  stage, 
  commitmentLevel, 
  questions, 
  userResponses, 
  onResponseChange,
  onStageChange,
  portalEnergy 
}) => {
  const handleResponseChange = (questionId: string, response: boolean | string) => {
    onResponseChange({
      ...userResponses,
      [questionId]: response
    })
  }

  const handleCrossThreshold = () => {
    onStageChange('transformation')
    setTimeout(() => onStageChange('welcome'), 4000)
  }
  
  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      <AnimatePresence mode="wait">
        {stage === 'approach' && (
          <motion.div 
            key="approach"
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-6xl font-thin text-white mb-8 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              The Commitment Threshold
            </h1>
            <p className="text-2xl text-slate-300">
              Prepare yourself for transformation...
            </p>
          </motion.div>
        )}
        
        {stage === 'contemplation' && (
          <motion.div 
            key="contemplation"
            className="absolute inset-0 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-2xl border border-violet-500/30 max-w-3xl w-full pointer-events-auto shadow-2xl">
              <h2 className="text-4xl font-thin text-white mb-8 text-center bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Before You Enter Your New Reality
              </h2>
              <p className="text-xl text-slate-300 mb-8 text-center">
                Answer honestly. Your responses determine the portal's power.
              </p>
              
              <div className="space-y-6">
                {questions.map(question => (
                  <CommitmentQuestion
                    key={question.id}
                    question={question}
                    response={userResponses[question.id]}
                    onResponse={(response) => handleResponseChange(question.id, response)}
                  />
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-400 text-lg">Commitment Level</span>
                  <span className="text-white font-bold text-xl">{commitmentLevel}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-violet-600 via-cyan-600 to-emerald-600 h-4 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${commitmentLevel}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                {commitmentLevel >= 80 && (
                  <motion.p 
                    className="text-emerald-400 text-center mt-4 text-lg font-medium"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    ✨ The portal recognizes your commitment. You may proceed.
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        {stage === 'commitment' && (
          <motion.div 
            key="commitment"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <motion.h2 
                className="text-6xl font-thin text-white mb-8"
                animate={{ 
                  textShadow: [
                    '0 0 20px rgba(255,255,255,0.5)',
                    '0 0 40px rgba(74,144,226,1)',
                    '0 0 20px rgba(255,255,255,0.5)'
                  ]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                Step Through the Portal
              </motion.h2>
              <p className="text-2xl text-slate-300 mb-12">
                Cross the threshold. Enter your new reality.
              </p>
              <motion.button
                onClick={handleCrossThreshold}
                className="px-16 py-6 bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold rounded-full text-2xl hover:from-violet-500 hover:to-cyan-500 transition-all pointer-events-auto shadow-2xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(139,92,246,0.5)',
                    '0 0 40px rgba(139,92,246,1)',
                    '0 0 20px rgba(139,92,246,0.5)'
                  ]
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                I Commit to Transformation
              </motion.button>
            </div>
          </motion.div>
        )}
        
        {stage === 'transformation' && (
          <motion.div 
            key="transformation"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="text-center"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <h2 className="text-6xl font-thin text-white mb-8 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                TRANSFORMATION IN PROGRESS
              </h2>
              <p className="text-2xl text-cyan-400">
                You are becoming something new...
              </p>
            </motion.div>
          </motion.div>
        )}
        
        {stage === 'welcome' && (
          <motion.div 
            key="welcome"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <motion.h1 
                className="text-8xl font-thin text-white mb-8"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
              >
                WELCOME
              </motion.h1>
              <motion.h2 
                className="text-4xl text-cyan-400 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
              >
                Intelligence Commander
              </motion.h2>
              <motion.p 
                className="text-2xl text-slate-300 mb-12 max-w-4xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
              >
                You are no longer just a business owner. You are an architect of autonomous intelligence.
              </motion.p>
              <motion.button
                className="px-12 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold rounded-full text-xl hover:from-emerald-500 hover:to-cyan-500 transition-colors pointer-events-auto shadow-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3, duration: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Begin Your New Journey
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const CommitmentQuestion: React.FC<{
  question: CommitmentQuestion
  response: boolean | string | undefined
  onResponse: (response: boolean | string) => void
}> = ({ question, response, onResponse }) => {
  if (question.type === 'boolean') {
    return (
      <div className="p-6 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50">
        <h3 className="text-xl text-white mb-4 font-medium">{question.question}</h3>
        <div className="flex gap-4">
          {[true, false].map(option => (
            <button
              key={option.toString()}
              onClick={() => onResponse(option)}
              className={`px-8 py-3 rounded-full transition-all font-medium ${
                response === option 
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg' 
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600'
              }`}
            >
              {option ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
      </div>
    )
  }
  
  if (question.type === 'choice' && question.options) {
    return (
      <div className="p-6 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50">
        <h3 className="text-xl text-white mb-4 font-medium">{question.question}</h3>
        <div className="grid grid-cols-2 gap-3">
          {question.options.map(option => (
            <button
              key={option}
              onClick={() => onResponse(option)}
              className={`p-4 rounded-lg transition-all text-left font-medium ${
                response === option 
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg' 
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    )
  }
  
  return null
}

export default CommitmentThreshold