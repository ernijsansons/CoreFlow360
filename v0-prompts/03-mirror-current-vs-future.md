# THE MIRROR: Current vs. Future You

Create a haunting and transformative WebGL mirror experience that shows business owners two reflections of themselves - their current stressed, overworked self versus their future free, empowered self with CoreFlow360. The mirror morphs between these realities based on user interaction.

## CORE CONCEPT
An interactive mirror that doesn't reflect the present, but reveals two possible futures. On the left, the viewer sees themselves as they are now - stressed, chained to their desk, aging rapidly from overwork. On the right, they see who they could become - relaxed, free, building empires while living life. The mirror responds to movement, showing how their choices today determine their tomorrow.

## VISUAL DESIGN LANGUAGE
- **Mirror Frame**: Elegant black with subtle neural network patterns etched in the frame
- **Left Reflection**: Desaturated, harsh lighting, stress indicators (#FF6B6B highlights)
- **Right Reflection**: Vibrant, soft lighting, success aura (#00D9FF, #FFD700)
- **Transition Zone**: Particle effects showing transformation possibility
- **Typography**: Time/date stamps showing aging differential

## TECHNICAL IMPLEMENTATION

### Main Mirror Component
```tsx
import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture, Text, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, ChromaticAberration, Glitch, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { motion, useMotionValue, useTransform } from 'framer-motion'

const MirrorExperience = () => {
  const [webcamStream, setWebcamStream] = useState(null)
  const [morphPosition, setMorphPosition] = useState(0.5) // 0 = current, 1 = future
  const [userAge, setUserAge] = useState(35)
  const [stressLevel, setStressLevel] = useState(85)
  const [freedomLevel, setFreedomLevel] = useState(15)
  const mouseX = useMotionValue(0.5)
  
  // Initialize webcam for realistic reflection base
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        setWebcamStream(stream)
      })
      .catch(err => console.log('Webcam not available, using avatar'))
  }, [])
  
  // Update morph based on mouse position
  useEffect(() => {
    const unsubscribe = mouseX.onChange(latest => {
      setMorphPosition(latest)
    })
    return unsubscribe
  }, [mouseX])
  
  return (
    <div 
      className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black overflow-hidden cursor-none"
      onMouseMove={(e) => {
        const x = e.clientX / window.innerWidth
        mouseX.set(x)
      }}
    >
      {/* Mirror Frame */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[90vw] h-[80vh] max-w-7xl">
          {/* Ornate Frame */}
          <div className="absolute inset-0 border-8 border-gray-800 rounded-lg shadow-2xl">
            <NeuralFramePattern />
          </div>
          
          {/* Mirror Surface */}
          <div className="absolute inset-8 bg-black rounded">
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 0, 5]} />
              <ambientLight intensity={0.2} />
              
              <MirrorReflections 
                webcamStream={webcamStream}
                morphPosition={morphPosition}
                userAge={userAge}
              />
              
              <EffectComposer>
                <Bloom intensity={0.5} luminanceThreshold={0.8} />
                {morphPosition < 0.3 && <ChromaticAberration offset={[0.002, 0.002]} />}
                {morphPosition < 0.2 && <Glitch delay={[1, 3]} duration={[0.2, 0.5]} />}
              </EffectComposer>
            </Canvas>
          </div>
          
          {/* Time Displays */}
          <TimelineDisplay 
            currentAge={userAge}
            projectedAge={userAge + 10}
            morphPosition={morphPosition}
          />
          
          {/* Stress/Freedom Meters */}
          <StatusMeters 
            stressLevel={stressLevel}
            freedomLevel={freedomLevel}
            morphPosition={morphPosition}
          />
        </div>
      </div>
      
      {/* Instructions */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-xl mb-2">Move your mouse to see your future</p>
        <p className="text-sm opacity-70">Left: Your current path | Right: Your CoreFlow360 future</p>
      </motion.div>
      
      {/* Custom Cursor */}
      <CustomCursor x={mouseX} />
    </div>
  )
}
```

### Mirror Reflections Component
```tsx
const MirrorReflections = ({ webcamStream, morphPosition, userAge }) => {
  const currentRef = useRef()
  const futureRef = useRef()
  const particlesRef = useRef()
  
  // Shader for aging/stress effects
  const stressShader = {
    uniforms: {
      tDiffuse: { value: null },
      stressLevel: { value: 0 },
      time: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float stressLevel;
      uniform float time;
      varying vec2 vUv;
      
      void main() {
        vec2 uv = vUv;
        
        // Add stress distortion
        uv.x += sin(uv.y * 20.0 + time) * stressLevel * 0.01;
        
        vec4 color = texture2D(tDiffuse, uv);
        
        // Desaturate based on stress
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = mix(color.rgb, vec3(gray), stressLevel);
        
        // Add dark circles under eyes
        float eyeArea = smoothstep(0.4, 0.6, uv.y) * (1.0 - smoothstep(0.6, 0.8, uv.y));
        float eyeShadow = smoothstep(0.3, 0.7, abs(uv.x - 0.3)) * smoothstep(0.3, 0.7, abs(uv.x - 0.7));
        color.rgb *= 1.0 - (eyeArea * eyeShadow * stressLevel * 0.5);
        
        // Add worry lines
        float lines = sin(uv.y * 50.0) * 0.1 * stressLevel;
        color.rgb *= 1.0 - lines;
        
        // Tired red tint to eyes
        if (eyeArea > 0.5) {
          color.r += stressLevel * 0.2;
        }
        
        gl_FragColor = color;
      }
    `
  }
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    
    // Update current self (stressed)
    if (currentRef.current) {
      currentRef.current.material.uniforms.time.value = time
      currentRef.current.material.uniforms.stressLevel.value = 1 - morphPosition
      
      // Slight shake when highly stressed
      if (morphPosition < 0.3) {
        currentRef.current.position.x = Math.sin(time * 10) * 0.02 * (1 - morphPosition)
      }
    }
    
    // Update future self (free)
    if (futureRef.current) {
      // Gentle floating animation
      futureRef.current.position.y = Math.sin(time * 0.5) * 0.05
      futureRef.current.material.opacity = morphPosition
    }
    
    // Update transformation particles
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        const z = positions.getZ(i)
        
        // Particles flow from left to right based on morph
        const newX = x + (morphPosition - 0.5) * 0.02
        const newY = y + Math.sin(time + i) * 0.01
        
        positions.setXYZ(i, newX, newY, z)
      }
      positions.needsUpdate = true
    }
  })
  
  return (
    <group>
      {/* Current Self (Stressed) */}
      <mesh ref={currentRef} position={[-2, 0, 0]}>
        <planeGeometry args={[3, 4]} />
        <shaderMaterial 
          attach="material"
          args={[stressShader]}
          transparent
        />
      </mesh>
      
      {/* Future Self (Free) */}
      <mesh ref={futureRef} position={[2, 0, 0]}>
        <planeGeometry args={[3, 4]} />
        <meshBasicMaterial 
          map={webcamStream ? videoTexture : avatarTexture}
          transparent
          opacity={0}
        />
      </mesh>
      
      {/* Transformation Particles */}
      <TransformationParticles ref={particlesRef} morphPosition={morphPosition} />
      
      {/* Environment Details */}
      <CurrentEnvironment position={[-2, 0, -1]} intensity={1 - morphPosition} />
      <FutureEnvironment position={[2, 0, -1]} intensity={morphPosition} />
    </group>
  )
}
```

### Environmental Storytelling
```tsx
const CurrentEnvironment = ({ position, intensity }) => {
  return (
    <group position={position} scale={intensity}>
      {/* Desk Prison */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[2, 0.1, 1]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      
      {/* Stacks of Papers */}
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[Math.random() - 0.5, i * 0.1, Math.random() - 0.5]}>
          <boxGeometry args={[0.3, 0.02, 0.4]} />
          <meshStandardMaterial color="#ddd" />
        </mesh>
      ))}
      
      {/* Coffee Cups (Multiple) */}
      {[...Array(3)].map((_, i) => (
        <mesh key={i} position={[i * 0.3 - 0.3, 0, 0.3]}>
          <cylinderGeometry args={[0.05, 0.04, 0.1]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      ))}
      
      {/* Clock Showing Late Hour */}
      <Text
        position={[0, 1, 0]}
        fontSize={0.3}
        color="#ff6b6b"
        anchorX="center"
        anchorY="middle"
      >
        11:47 PM
      </Text>
      
      {/* Stress Indicators */}
      <FloatingText 
        position={[-1, 0.5, 0]}
        text="Email: 847 unread"
        color="#ff4444"
        size={0.15}
      />
      <FloatingText 
        position={[-1, 0.3, 0]}
        text="Missed calls: 23"
        color="#ff4444"
        size={0.15}
      />
      <FloatingText 
        position={[-1, 0.1, 0]}
        text="Overdue tasks: 47"
        color="#ff4444"
        size={0.15}
      />
    </group>
  )
}

const FutureEnvironment = ({ position, intensity }) => {
  return (
    <group position={position} scale={intensity}>
      {/* Beach/Mountain Scene */}
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[5, 3]} />
        <meshBasicMaterial map={paradiseTexture} transparent opacity={intensity} />
      </mesh>
      
      {/* Laptop Closed */}
      <mesh position={[0, -0.5, 0]} rotation={[0, 0, -Math.PI / 12]}>
        <boxGeometry args={[0.4, 0.02, 0.3]} />
        <meshStandardMaterial color="#silver" metalness={0.8} />
      </mesh>
      
      {/* Success Metrics Floating */}
      <FloatingText 
        position={[1, 0.5, 0]}
        text="Revenue: +427%"
        color="#00ff88"
        size={0.2}
      />
      <FloatingText 
        position={[1, 0.3, 0]}
        text="Working hours: 10/week"
        color="#00ff88"
        size={0.2}
      />
      <FloatingText 
        position={[1, 0.1, 0]}
        text="Stress level: Minimal"
        color="#00ff88"
        size={0.2}
      />
      
      {/* Time Showing Reasonable Hour */}
      <Text
        position={[0, 1, 0]}
        fontSize={0.3}
        color="#00d9ff"
        anchorX="center"
        anchorY="middle"
      >
        10:30 AM
      </Text>
    </group>
  )
}
```

### Transformation Particles
```tsx
const TransformationParticles = React.forwardRef(({ morphPosition }, ref) => {
  const particleCount = 2000
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      // Create particles in a human silhouette shape
      const angle = (i / particleCount) * Math.PI * 2
      const radius = 1 + Math.random() * 0.5
      const height = (Math.random() - 0.5) * 4
      
      pos[i * 3] = Math.cos(angle) * radius * (0.5 + Math.abs(height) * 0.1)
      pos[i * 3 + 1] = height
      pos[i * 3 + 2] = Math.sin(angle) * radius * 0.3
    }
    return pos
  }, [])
  
  const colors = useMemo(() => {
    const col = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      // Gradient from stress red to success blue/gold
      const stressColor = new THREE.Color('#ff6b6b')
      const successColor = new THREE.Color('#00d9ff')
      const color = stressColor.lerp(successColor, morphPosition)
      
      col[i * 3] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
    }
    return col
  }, [morphPosition])
  
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
})
```

### Timeline and Aging Display
```tsx
const TimelineDisplay = ({ currentAge, projectedAge, morphPosition }) => {
  const displayAge = currentAge + (projectedAge - currentAge) * (1 - morphPosition)
  const yearsReclaimed = Math.floor(morphPosition * 15) // Up to 15 years of life reclaimed
  
  return (
    <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
      <motion.div className="text-center">
        {/* Current Path Timeline */}
        <div className={`transition-opacity ${morphPosition < 0.5 ? 'opacity-100' : 'opacity-30'}`}>
          <h3 className="text-red-400 text-sm mb-2">Current Path</h3>
          <div className="flex items-center gap-4">
            <div className="text-white">
              <span className="text-2xl font-bold">{currentAge}</span>
              <span className="text-sm block">Today</span>
            </div>
            <div className="flex-1 h-1 bg-red-600 relative">
              <div className="absolute -top-1 -bottom-1 left-1/4 w-px bg-red-400" />
              <div className="absolute -top-1 -bottom-1 left-1/2 w-px bg-red-400" />
              <div className="absolute -top-1 -bottom-1 left-3/4 w-px bg-red-400" />
            </div>
            <div className="text-red-300">
              <span className="text-2xl font-bold">{currentAge + 10}</span>
              <span className="text-sm block">+10 years</span>
            </div>
          </div>
          <p className="text-xs text-red-300 mt-2">Aging accelerated by stress</p>
        </div>
        
        {/* Future Path Timeline */}
        <div className={`mt-8 transition-opacity ${morphPosition > 0.5 ? 'opacity-100' : 'opacity-30'}`}>
          <h3 className="text-cyan-400 text-sm mb-2">CoreFlow360 Path</h3>
          <div className="flex items-center gap-4">
            <div className="text-white">
              <span className="text-2xl font-bold">{currentAge}</span>
              <span className="text-sm block">Today</span>
            </div>
            <div className="flex-1 h-1 bg-cyan-600 relative">
              <div className="absolute -top-1 -bottom-1 left-1/4 w-px bg-cyan-400" />
              <div className="absolute -top-1 -bottom-1 left-1/2 w-px bg-cyan-400" />
              <div className="absolute -top-1 -bottom-1 left-3/4 w-px bg-cyan-400" />
            </div>
            <div className="text-cyan-300">
              <span className="text-2xl font-bold">{currentAge + 10}</span>
              <span className="text-sm block">+10 years</span>
            </div>
          </div>
          <p className="text-xs text-cyan-300 mt-2">
            {yearsReclaimed} years of life reclaimed
          </p>
        </div>
      </motion.div>
    </div>
  )
}
```

### Stress and Freedom Meters
```tsx
const StatusMeters = ({ stressLevel, freedomLevel, morphPosition }) => {
  const currentStress = stressLevel * (1 - morphPosition) + 10 * morphPosition
  const currentFreedom = freedomLevel * (1 - morphPosition) + 95 * morphPosition
  
  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-96">
      <div className="grid grid-cols-2 gap-8">
        {/* Stress Meter */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">Stress Level</span>
            <span className={`text-sm font-bold ${currentStress > 50 ? 'text-red-400' : 'text-green-400'}`}>
              {Math.round(currentStress)}%
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${currentStress > 50 ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-green-600 to-green-400'}`}
              animate={{ width: `${currentStress}%` }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </div>
        </div>
        
        {/* Freedom Meter */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">Life Freedom</span>
            <span className="text-sm font-bold text-cyan-400">
              {Math.round(currentFreedom)}%
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400"
              animate={{ width: `${currentFreedom}%` }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </div>
        </div>
      </div>
      
      {/* Life Quality Indicators */}
      <div className="mt-6 flex justify-around text-sm">
        <div className={`transition-opacity ${morphPosition < 0.5 ? 'opacity-100' : 'opacity-30'}`}>
          <p className="text-red-400">Current Reality:</p>
          <ul className="text-gray-400 text-xs mt-1">
            <li>• 80+ hour weeks</li>
            <li>• Missing family time</li>
            <li>• Health declining</li>
            <li>• Always worried</li>
          </ul>
        </div>
        <div className={`transition-opacity ${morphPosition > 0.5 ? 'opacity-100' : 'opacity-30'}`}>
          <p className="text-cyan-400">Future Reality:</p>
          <ul className="text-gray-400 text-xs mt-1">
            <li>• 10 hour weeks</li>
            <li>• Present for everything</li>
            <li>• Vitality restored</li>
            <li>• Peace of mind</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
```

### Neural Frame Pattern
```tsx
const NeuralFramePattern = () => {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-20">
      <defs>
        <pattern id="neural" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="1" fill="#444" />
          <circle cx="25" cy="15" r="1" fill="#444" />
          <circle cx="45" cy="5" r="1" fill="#444" />
          <line x1="5" y1="5" x2="25" y2="15" stroke="#444" strokeWidth="0.5" />
          <line x1="25" y1="15" x2="45" y2="5" stroke="#444" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#neural)" />
    </svg>
  )
}
```

### Custom Cursor
```tsx
const CustomCursor = ({ x }) => {
  const transform = useTransform(x, [0, 1], [-100, 100])
  
  return (
    <motion.div 
      className="fixed pointer-events-none z-50"
      style={{
        left: '50%',
        top: '50%',
        x: transform,
        y: '-50%'
      }}
    >
      <div className="relative">
        <div className="w-16 h-16 border-2 border-cyan-400 rounded-full animate-pulse" />
        <div className="absolute inset-2 bg-cyan-400 rounded-full opacity-20" />
        <motion.div 
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-cyan-400 text-xs whitespace-nowrap"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Slide to transform
        </motion.div>
      </div>
    </motion.div>
  )
}
```

## INTERACTION FLOW

1. **Entry State**
   - Mirror shows split reality immediately
   - Mouse in center shows 50/50 blend
   - Gentle pulse draws attention to interaction

2. **Left Side Focus (Current Reality)**
   - Stress visualization intensifies
   - Aging accelerates visually
   - Work environment becomes more chaotic
   - Health indicators decline

3. **Right Side Focus (CoreFlow360 Future)**
   - Stress melts away with particle effects
   - Aging reverses/slows dramatically
   - Environment transforms to freedom
   - Success metrics appear and grow

4. **Full Transformation**
   - At far right, full future vision
   - Invitation to "Step through the mirror"
   - CTA: "Choose your reflection"

## SOUND DESIGN

```typescript
const soundscape = {
  current_side: {
    stress: 'heartbeat_racing.mp3',
    notifications: 'endless_pings.mp3',
    typing: 'frantic_keyboard.mp3',
    exhaustion: 'heavy_breathing.mp3'
  },
  future_side: {
    peace: 'ocean_waves.mp3',
    success: 'gentle_chimes.mp3',
    freedom: 'birds_chirping.mp3',
    achievement: 'subtle_celebration.mp3'
  },
  transformation: {
    particles: 'magical_transformation.mp3',
    reality_shift: 'dimensional_change.mp3'
  }
}
```

## RESPONSIVE CONSIDERATIONS

- Desktop: Full mirror experience with mouse interaction
- Tablet: Touch-based sliding between realities
- Mobile: Swipe between current/future views
- All maintain the core transformation message

## SUCCESS METRICS

- Average interaction time > 90 seconds
- 80%+ users explore both extremes
- 90%+ reach full future transformation
- High emotional response in feedback
- Strong "mirror" metaphor recall

This experience creates a visceral, unforgettable moment where business owners literally see their two possible futures and feel the power to choose their path with CoreFlow360.