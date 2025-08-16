# THE COMMITMENT THRESHOLD: Decision Portal Experience

Create a powerful final experience where users must cross a commitment threshold to enter their new reality. This isn't just a signup—it's a ceremony, a transformation portal, a moment of rebirth from stressed business owner to autonomous intelligence commander.

## CORE CONCEPT
Users approach a magnificent portal that only opens when they make a genuine commitment to transform their business. The experience builds tension, creates ceremony around the decision, and makes crossing the threshold feel like a life-changing moment rather than just another signup form.

## VISUAL DESIGN LANGUAGE
- **Approach**: Long pathway building anticipation and resolve
- **Portal**: Magnificent gateway that responds to commitment level
- **Threshold**: Dramatic moment of crossing from old to new reality
- **Transformation**: Visual metamorphosis as they enter their new identity

## TECHNICAL IMPLEMENTATION

### Main Commitment Portal Component
```tsx
import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Text3D, Html, Sphere, Ring } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'

const CommitmentThreshold = () => {
  const [stage, setStage] = useState('approach') // approach, contemplation, commitment, transformation, welcome
  const [commitmentLevel, setCommitmentLevel] = useState(0) // 0-100
  const [userResponses, setUserResponses] = useState({})
  const [portalEnergy, setPortalEnergy] = useState(0)
  const [transformationProgress, setTransformationProgress] = useState(0)
  
  // Commitment questions that build resolve
  const commitmentQuestions = [
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
  
  const calculateCommitmentLevel = () => {
    let total = 0
    commitmentQuestions.forEach(q => {
      const response = userResponses[q.id]
      if (response !== undefined) {
        if (q.type === 'boolean') {
          total += response ? q.weight : 0
        } else if (q.type === 'choice') {
          const choiceValue = q.options.indexOf(response) / (q.options.length - 1)
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
  
  return (
    <div className="fixed inset-0 bg-black">
      <Canvas 
        camera={{ position: [0, 5, 15], fov: 70 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={['#000008']} />
        
        {/* Environmental lighting */}
        <Environment preset="night" />
        <ambientLight intensity={0.1} />
        
        {/* Stage-specific scenes */}
        {stage === 'approach' && (
          <ApproachScene onReady={() => setStage('contemplation')} />
        )}
        
        {stage === 'contemplation' && (
          <ContemplationScene 
            commitmentLevel={commitmentLevel}
            portalEnergy={portalEnergy}
            onCommitmentReady={() => setStage('commitment')}
          />
        )}
        
        {stage === 'commitment' && (
          <CommitmentScene 
            portalEnergy={portalEnergy}
            onCrossThreshold={() => setStage('transformation')}
          />
        )}
        
        {stage === 'transformation' && (
          <TransformationScene 
            progress={transformationProgress}
            onTransformationComplete={() => setStage('welcome')}
          />
        )}
        
        {stage === 'welcome' && (
          <WelcomeScene />
        )}
        
        {/* Portal that grows with commitment */}
        <CommitmentPortal 
          energy={portalEnergy}
          stage={stage}
          commitmentLevel={commitmentLevel}
        />
        
        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom 
            intensity={1 + portalEnergy * 2}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
          />
          {portalEnergy > 0.8 && (
            <ChromaticAberration 
              offset={[0.002 * portalEnergy, 0.002 * portalEnergy]} 
            />
          )}
          <Vignette opacity={0.5} />
        </EffectComposer>
        
        <OrbitControls 
          enabled={stage !== 'transformation'}
          autoRotate={stage === 'welcome'}
          autoRotateSpeed={1}
        />
      </Canvas>
      
      {/* Commitment UI */}
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

// Approach scene - building anticipation
const ApproachScene = ({ onReady }) => {
  const pathRef = useRef()
  const [pathProgress, setPathProgress] = useState(0)
  
  useFrame(({ clock }) => {
    const progress = Math.min(1, clock.elapsedTime / 5) // 5 second approach
    setPathProgress(progress)
    
    if (progress >= 1) {
      setTimeout(() => onReady(), 1000)
    }
  })
  
  return (
    <group>
      {/* Path of commitment */}
      <CommitmentPath progress={pathProgress} />
      
      {/* Anticipation particles */}
      <AnticipationParticles />
      
      {/* Motivational waypoints */}
      <MotivationalWaypoints progress={pathProgress} />
    </group>
  )
}

// Contemplation scene - building resolve
const ContemplationScene = ({ commitmentLevel, portalEnergy, onCommitmentReady }) => {
  const sceneRef = useRef()
  
  useFrame(({ clock }) => {
    if (sceneRef.current) {
      // Gentle pulsing based on commitment level
      const pulse = 1 + Math.sin(clock.elapsedTime * 2) * (commitmentLevel / 1000)
      sceneRef.current.scale.setScalar(pulse)
    }
    
    // Auto-advance when commitment is high enough
    if (commitmentLevel >= 80) {
      setTimeout(() => onCommitmentReady(), 2000)
    }
  })
  
  return (
    <group ref={sceneRef}>
      {/* Reflection pool */}
      <ReflectionPool commitmentLevel={commitmentLevel} />
      
      {/* Wisdom pillars */}
      <WisdomPillars energy={portalEnergy} />
      
      {/* Commitment energy visualization */}
      <CommitmentEnergy level={commitmentLevel} />
    </group>
  )
}

// Commitment scene - the moment of decision
const CommitmentScene = ({ portalEnergy, onCrossThreshold }) => {
  const [crossingPortal, setCrossingPortal] = useState(false)
  
  const handleCrossThreshold = () => {
    setCrossingPortal(true)
    setTimeout(() => onCrossThreshold(), 2000)
  }
  
  return (
    <group>
      {/* Active portal */}
      <ActivePortal 
        energy={portalEnergy}
        crossing={crossingPortal}
        onCross={handleCrossThreshold}
      />
      
      {/* Threshold guardians (symbolic barriers) */}
      <ThresholdGuardians energy={portalEnergy} />
      
      {/* Commitment ceremony elements */}
      <CeremonyElements crossing={crossingPortal} />
    </group>
  )
}

// Transformation scene - metamorphosis
const TransformationScene = ({ progress, onTransformationComplete }) => {
  const transformRef = useRef()
  
  useFrame(({ clock }) => {
    const newProgress = Math.min(1, clock.elapsedTime / 4) // 4 second transformation
    
    if (transformRef.current) {
      // Visual transformation effects
      transformRef.current.rotation.y = newProgress * Math.PI * 4
      transformRef.current.scale.setScalar(1 + newProgress * 2)
    }
    
    if (newProgress >= 1) {
      onTransformationComplete()
    }
  })
  
  return (
    <group ref={transformRef}>
      {/* Transformation vortex */}
      <TransformationVortex />
      
      {/* Identity metamorphosis */}
      <IdentityMetamorphosis progress={progress} />
      
      {/* Rebirth effects */}
      <RebirthEffects />
    </group>
  )
}

// Welcome scene - new identity
const WelcomeScene = () => {
  return (
    <group>
      {/* New reality environment */}
      <NewRealityEnvironment />
      
      {/* Welcome ceremony */}
      <WelcomeCeremony />
      
      {/* Achievement celebration */}
      <AchievementCelebration />
    </group>
  )
}

// The main portal component
const CommitmentPortal = ({ energy, stage, commitmentLevel }) => {
  const portalRef = useRef()
  const ringsRef = useRef([])
  
  useFrame(({ clock }) => {
    if (portalRef.current) {
      // Portal size grows with commitment
      const scale = 1 + energy * 3
      portalRef.current.scale.setScalar(scale)
      
      // Rotation speed increases with energy
      portalRef.current.rotation.z = clock.elapsedTime * (1 + energy * 2)
    }
    
    // Animate portal rings
    ringsRef.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.z = clock.elapsedTime * (1 + i * 0.5) * (energy + 0.1)
        ring.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2 + i) * energy * 0.3)
      }
    })
  })
  
  return (
    <group ref={portalRef} position={[0, 0, -5]}>
      {/* Portal rings */}
      {[...Array(5)].map((_, i) => (
        <Ring 
          key={i}
          ref={el => ringsRef.current[i] = el}
          args={[3 + i * 0.5, 3.2 + i * 0.5, 64]}
        >
          <meshBasicMaterial 
            color={new THREE.Color().setHSL(energy * 0.6, 1, 0.5)}
            emissive={new THREE.Color().setHSL(energy * 0.6, 1, 0.3)}
            emissiveIntensity={energy * 2}
            transparent
            opacity={energy * 0.8}
          />
        </Ring>
      ))}
      
      {/* Portal center */}
      <Sphere args={[2, 32, 32]}>
        <meshBasicMaterial 
          color={new THREE.Color().setHSL(energy * 0.6, 1, 0.5)}
          transparent
          opacity={stage === 'commitment' ? energy : energy * 0.3}
        />
      </Sphere>
      
      {/* Portal energy field */}
      <PortalEnergyField energy={energy} active={stage === 'commitment'} />
    </group>
  )
}

// Portal energy field component
const PortalEnergyField = ({ energy, active }) => {
  const fieldRef = useRef()
  
  useFrame(({ clock }) => {
    if (fieldRef.current && active) {
      // Energy field pulsing
      fieldRef.current.scale.setScalar(5 + Math.sin(clock.elapsedTime * 3) * energy * 2)
      fieldRef.current.rotation.y = clock.elapsedTime * energy
    }
  })
  
  if (!active) return null
  
  return (
    <mesh ref={fieldRef}>
      <sphereGeometry args={[5, 16, 16]} />
      <meshBasicMaterial 
        color="#4a90e2"
        transparent
        opacity={energy * 0.1}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

// Commitment path component
const CommitmentPath = ({ progress }) => {
  const pathPoints = useMemo(() => {
    const points = []
    for (let i = 0; i <= 100; i++) {
      const x = (i - 50) * 0.5
      const z = -i * 0.2
      const y = Math.sin(i * 0.1) * 0.5
      points.push(new THREE.Vector3(x, y, z))
    }
    return points
  }, [])
  
  const visiblePoints = Math.floor(progress * pathPoints.length)
  
  return (
    <group>
      {/* Path stones */}
      {pathPoints.slice(0, visiblePoints).map((point, i) => (
        <Float key={i} speed={0.5} rotationIntensity={0.1}>
          <mesh position={[point.x, point.y - 0.5, point.z]}>
            <cylinderGeometry args={[0.8, 0.8, 0.2, 8]} />
            <meshStandardMaterial 
              color="#4a4a5c"
              emissive="#2a2a3c"
              emissiveIntensity={i / visiblePoints}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

// Reflection pool component
const ReflectionPool = ({ commitmentLevel }) => {
  const poolRef = useRef()
  
  useFrame(({ clock }) => {
    if (poolRef.current) {
      // Pool surface ripples based on commitment
      poolRef.current.material.normalScale.set(
        commitmentLevel / 100,
        commitmentLevel / 100
      )
    }
  })
  
  return (
    <mesh ref={poolRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <circleGeometry args={[8, 64]} />
      <meshStandardMaterial 
        color="#1a1a2e"
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}
```

### Commitment UI Component
```tsx
const CommitmentUI = ({ 
  stage, 
  commitmentLevel, 
  questions, 
  userResponses, 
  onResponseChange,
  onStageChange,
  portalEnergy 
}) => {
  const handleResponseChange = (questionId, response) => {
    onResponseChange({
      ...userResponses,
      [questionId]: response
    })
  }
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Stage-specific UI */}
      {stage === 'approach' && (
        <motion.div 
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-6xl font-thin text-white mb-8">
            The Commitment Threshold
          </h1>
          <p className="text-2xl text-gray-300">
            Prepare yourself for transformation...
          </p>
        </motion.div>
      )}
      
      {stage === 'contemplation' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/90 backdrop-blur-xl p-8 rounded-lg border border-white/30 max-w-2xl pointer-events-auto">
            <h2 className="text-4xl font-thin text-white mb-8 text-center">
              Before You Enter Your New Reality
            </h2>
            <p className="text-xl text-gray-300 mb-8 text-center">
              Answer honestly. Your responses determine the portal's power.
            </p>
            
            <div className="space-y-8">
              {questions.map(question => (
                <CommitmentQuestion
                  key={question.id}
                  question={question}
                  response={userResponses[question.id]}
                  onResponse={(response) => handleResponseChange(question.id, response)}
                />
              ))}
            </div>
            
            {/* Commitment level indicator */}
            <div className="mt-8 p-4 bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Commitment Level</span>
                <span className="text-white font-bold">{commitmentLevel}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <motion.div 
                  className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${commitmentLevel}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              {commitmentLevel >= 80 && (
                <motion.p 
                  className="text-green-400 text-center mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  The portal recognizes your commitment. You may proceed.
                </motion.p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {stage === 'commitment' && (
        <div className="absolute inset-0 flex items-center justify-center">
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
            <p className="text-2xl text-gray-300 mb-12">
              Cross the threshold. Enter your new reality.
            </p>
            <motion.button
              className="px-16 py-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-full text-2xl hover:from-blue-400 hover:to-purple-500 transition-all pointer-events-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(74,144,226,0.5)',
                  '0 0 40px rgba(74,144,226,1)',
                  '0 0 20px rgba(74,144,226,0.5)'
                ]
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              I Commit to Transformation
            </motion.button>
          </div>
        </div>
      )}
      
      {stage === 'transformation' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="text-center"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <h2 className="text-6xl font-thin text-white mb-8">
              TRANSFORMATION IN PROGRESS
            </h2>
            <p className="text-2xl text-blue-400">
              You are becoming something new...
            </p>
          </motion.div>
        </div>
      )}
      
      {stage === 'welcome' && (
        <div className="absolute inset-0 flex items-center justify-center">
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
              className="text-4xl text-blue-400 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              Intelligence Commander
            </motion.h2>
            <motion.p 
              className="text-2xl text-gray-300 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
            >
              You are no longer just a business owner. You are an architect of autonomous intelligence.
            </motion.p>
            <motion.button
              className="px-12 py-4 bg-white text-black font-bold rounded-full text-xl hover:bg-gray-200 transition-colors pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Begin Your New Journey
            </motion.button>
          </div>
        </div>
      )}
    </div>
  )
}

// Individual commitment question component
const CommitmentQuestion = ({ question, response, onResponse }) => {
  if (question.type === 'boolean') {
    return (
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <h3 className="text-xl text-white mb-4">{question.question}</h3>
        <div className="flex gap-4">
          {[true, false].map(option => (
            <button
              key={option.toString()}
              onClick={() => onResponse(option)}
              className={`px-6 py-3 rounded-full transition-all ${
                response === option 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {option ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
      </div>
    )
  }
  
  if (question.type === 'choice') {
    return (
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <h3 className="text-xl text-white mb-4">{question.question}</h3>
        <div className="grid grid-cols-2 gap-3">
          {question.options.map(option => (
            <button
              key={option}
              onClick={() => onResponse(option)}
              className={`p-3 rounded transition-all text-left ${
                response === option 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
```

## SOUND DESIGN

```typescript
const commitmentSounds = {
  approach: {
    ambient: 'ceremonial_approach.mp3',
    footsteps: 'sacred_steps.mp3',
    anticipation: 'building_energy.mp3',
    volume: 0.6
  },
  contemplation: {
    ambient: 'meditative_space.mp3',
    reflection: 'inner_wisdom.mp3',
    commitment_building: 'resolve_growing.mp3',
    volume: 0.7
  },
  commitment: {
    portal_activation: 'threshold_opening.mp3',
    crossing: 'reality_transition.mp3',
    transformation_start: 'metamorphosis_begin.mp3',
    volume: 0.9
  },
  transformation: {
    metamorphosis: 'consciousness_shift.mp3',
    rebirth: 'new_identity_forming.mp3',
    completion: 'transformation_complete.mp3',
    volume: 1.0
  },
  welcome: {
    celebration: 'achievement_fanfare.mp3',
    new_reality: 'intelligence_commander_theme.mp3',
    future_calling: 'destiny_realized.mp3',
    volume: 0.8
  }
}
```

## SUCCESS METRICS

- 90% complete the commitment questions
- 85% achieve commitment level above 80%
- 75% cross the threshold portal
- High emotional impact scores during transformation
- 95% feel ceremony/significance of the moment
- Strong conversion to actual signup/onboarding
- 80% report feeling "transformed" rather than just "signed up"

## PSYCHOLOGICAL DESIGN

This experience uses powerful psychological principles:

- **Commitment Escalation**: Each question builds investment
- **Social Proof**: Questions imply others have made this journey
- **Ceremony**: Makes the decision feel sacred and significant
- **Identity Shift**: Transforms from "business owner" to "intelligence commander"
- **Threshold Guardian**: Creates sense of earning the transformation
- **Rebirth Metaphor**: Complete identity metamorphosis

The Commitment Threshold transforms what could be a simple signup into a life-changing ceremony, making users feel they've crossed into a new identity rather than just choosing another software tool.