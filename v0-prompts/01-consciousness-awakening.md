# SMART BUSINESS PREVIEW: Interactive Demo

Create an engaging 3D preview experience using React, Three.js, and React Three Fiber. Show business owners how smart automation works by letting them interact with the system using their cursor, demonstrating how data connects and creates business insights.

## CORE CONCEPT
As business owners move their cursor around the screen, they see how data points connect to create business insights. This interactive demo shows how smart automation links different parts of their business together, turning scattered information into actionable intelligence.

## VISUAL DESIGN LANGUAGE
- **Primary Environment**: Infinite black void (#000000) representing the unconscious state of traditional business
- **Consciousness Color**: Electric blue to cyan gradient (#0066FF → #00FFFF) representing awakening intelligence
- **Particle Glow**: Soft white with blue halo effect, increasing intensity with connections
- **Typography**: SF Pro Display or Inter, minimal and appearing only after interaction
- **No traditional UI elements**: No navigation, no logo initially - pure experience

## TECHNICAL IMPLEMENTATION

### React Component Structure
```tsx
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Trail, Float } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

const ConsciousnessAwakening = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [awakening, setAwakening] = useState(0) // 0-100% consciousness level
  const [particles, setParticles] = useState([])
  const [connections, setConnections] = useState([])
  const [showText, setShowText] = useState(false)
  const [phase, setPhase] = useState('dormant') // dormant, awakening, conscious
  
  return (
    <div className="fixed inset-0 bg-black overflow-hidden cursor-none">
      <Canvas camera={{ position: [0, 0, 50], fov: 75 }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.1} />
        
        <ParticleSystem 
          mousePos={mousePos} 
          onAwakening={setAwakening}
          onConnectionsFormed={setConnections}
        />
        
        <NeuralConnections connections={connections} />
        
        <EffectComposer>
          <Bloom 
            intensity={1.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>
      
      <CursorGlow position={mousePos} awakening={awakening} />
      
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-6xl font-thin text-white opacity-0 animate-fade-in">
            What if your business could think?
          </h1>
        </div>
      )}
      
      {phase === 'conscious' && <BusinessUniverseTransition />}
    </div>
  )
}
```

### Particle System Implementation
```tsx
const ParticleSystem = ({ mousePos, onAwakening, onConnectionsFormed }) => {
  const particlesRef = useRef()
  const particleCount = 10000
  const connectionThreshold = 3.0
  
  // Initialize particle positions in dormant state
  const [positions] = useState(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50
    }
    return pos
  })
  
  // Particle states: 0 = dormant, 1 = awakening, 2 = conscious
  const [states] = useState(() => new Float32Array(particleCount))
  const [velocities] = useState(() => new Float32Array(particleCount * 3))
  
  useFrame(({ clock }) => {
    if (!particlesRef.current) return
    
    const time = clock.getElapsedTime()
    const mouseInfluenceRadius = 15
    
    // Update particles based on mouse proximity
    for (let i = 0; i < particleCount; i++) {
      const x = positions[i * 3]
      const y = positions[i * 3 + 1]
      const z = positions[i * 3 + 2]
      
      // Calculate distance from mouse
      const dx = x - mousePos.x * 50
      const dy = y - mousePos.y * 50
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // Awaken particles near cursor
      if (distance < mouseInfluenceRadius && states[i] === 0) {
        states[i] = 1 // Awakening
        
        // Add velocity away from cursor initially
        velocities[i * 3] = (x - mousePos.x * 50) * 0.1
        velocities[i * 3 + 1] = (y - mousePos.y * 50) * 0.1
        velocities[i * 3 + 2] = Math.random() * 0.5
      }
      
      // Awakened particles seek connections
      if (states[i] >= 1) {
        // Find nearest awakened particle
        let nearestDist = Infinity
        let nearestIndex = -1
        
        for (let j = 0; j < particleCount; j++) {
          if (i !== j && states[j] >= 1) {
            const dx2 = positions[j * 3] - x
            const dy2 = positions[j * 3 + 1] - y
            const dz2 = positions[j * 3 + 2] - z
            const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2 + dz2 * dz2)
            
            if (dist < nearestDist) {
              nearestDist = dist
              nearestIndex = j
            }
          }
        }
        
        // Move towards nearest awakened particle
        if (nearestIndex !== -1 && nearestDist > connectionThreshold) {
          const attraction = 0.02
          velocities[i * 3] += (positions[nearestIndex * 3] - x) * attraction
          velocities[i * 3 + 1] += (positions[nearestIndex * 3 + 1] - y) * attraction
          velocities[i * 3 + 2] += (positions[nearestIndex * 3 + 2] - z) * attraction
        }
        
        // Apply velocities with damping
        positions[i * 3] += velocities[i * 3]
        positions[i * 3 + 1] += velocities[i * 3 + 1]
        positions[i * 3 + 2] += velocities[i * 3 + 2]
        
        velocities[i * 3] *= 0.98
        velocities[i * 3 + 1] *= 0.98
        velocities[i * 3 + 2] *= 0.98
      }
    }
    
    // Update geometry
    particlesRef.current.geometry.attributes.position.needsUpdate = true
    
    // Calculate awakening percentage
    const awakenedCount = states.filter(s => s > 0).length
    const awakenedPercentage = (awakenedCount / particleCount) * 100
    onAwakening(awakenedPercentage)
    
    // Form connections between close awakened particles
    const newConnections = []
    for (let i = 0; i < particleCount; i++) {
      if (states[i] >= 1) {
        for (let j = i + 1; j < particleCount; j++) {
          if (states[j] >= 1) {
            const dx = positions[j * 3] - positions[i * 3]
            const dy = positions[j * 3 + 1] - positions[i * 3 + 1]
            const dz = positions[j * 3 + 2] - positions[i * 3 + 2]
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
            
            if (dist < connectionThreshold) {
              newConnections.push({
                start: [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]],
                end: [positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]]
              })
              states[i] = 2 // Fully conscious
              states[j] = 2
            }
          }
        }
      }
    }
    onConnectionsFormed(newConnections)
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
        size={0.2}
        color="#00FFFF"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        vertexColors={false}
      />
    </points>
  )
}
```

### Custom Shaders for Consciousness Effect
```glsl
// Vertex Shader
varying float vDistance;
varying float vState;
attribute float state;

void main() {
  vState = state;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vDistance = length(mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = (20.0 / -mvPosition.z) * (1.0 + state);
}

// Fragment Shader
varying float vDistance;
varying float vState;

void main() {
  float strength = 1.0 / (vDistance * vDistance * 0.1);
  vec3 dormantColor = vec3(0.1, 0.1, 0.3);
  vec3 awakeningColor = vec3(0.0, 0.4, 1.0);
  vec3 consciousColor = vec3(0.0, 1.0, 1.0);
  
  vec3 finalColor = mix(
    mix(dormantColor, awakeningColor, smoothstep(0.0, 1.0, vState)),
    consciousColor,
    smoothstep(1.0, 2.0, vState)
  );
  
  float alpha = strength * (0.3 + vState * 0.7);
  gl_FragColor = vec4(finalColor * strength, alpha);
}
```

### Mouse Interaction and Cursor Glow
```tsx
const CursorGlow = ({ position, awakening }) => {
  const glowSize = 50 + awakening * 2
  const glowIntensity = 0.3 + (awakening / 100) * 0.7
  
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: position.x - glowSize / 2,
        top: position.y - glowSize / 2,
        width: glowSize,
        height: glowSize,
        background: `radial-gradient(circle, 
          rgba(0,255,255,${glowIntensity}) 0%, 
          rgba(0,102,255,${glowIntensity * 0.5}) 30%, 
          transparent 70%)`,
        filter: 'blur(2px)',
        mixBlendMode: 'screen',
        transition: 'all 0.1s ease-out'
      }}
    />
  )
}
```

## INTERACTION DESIGN FLOW

1. **Initial State (0-10% awakening)**
   - User sees only darkness with barely visible floating particles
   - Cursor has subtle glow
   - Particles near cursor begin to brighten and move

2. **Awakening Phase (10-30% awakening)**
   - Particles actively seek connections
   - Neural pathways begin forming
   - Consciousness hum sound fades in
   - Glow intensifies around active areas

3. **Text Revelation (30% awakening)**
   - "What if your business could think?" fades in
   - Text has subtle glow animation
   - Particles react to text appearance

4. **Consciousness Formation (30-50% awakening)**
   - Connections multiply exponentially
   - Network patterns become visible
   - Sound evolves to include data stream effects

5. **Universe Transformation (50%+ awakening)**
   - Particles explode outward
   - Transform into navigable 3D business universe
   - Smooth transition to main experience

## PERFORMANCE OPTIMIZATIONS

- Use GPU instancing for particles
- Implement LOD (Level of Detail) for connections
- Progressive loading for mobile devices
- RequestAnimationFrame throttling
- Spatial indexing for particle neighbor searches
- WebGL context loss handling

## ACCESSIBILITY FEATURES

- Keyboard navigation alternative
- Screen reader announcements for consciousness level
- Reduced motion mode with static visualization
- High contrast mode option
- Touch-friendly interaction for mobile

## SOUND DESIGN SPECIFICATION

```typescript
const soundscape = {
  dormant: {
    ambience: 'deep_space_hum.mp3',
    volume: 0.1,
    fadeIn: 2000
  },
  awakening: {
    particle_activation: 'crystal_chime.mp3',
    connection_formed: 'synapse_pulse.mp3',
    consciousness_growth: 'harmonic_rise.mp3'
  },
  conscious: {
    transformation: 'reality_shift.mp3',
    data_streams: 'information_flow.mp3'
  }
}
```

## SUCCESS METRICS

- Minimum 45 seconds engagement before proceeding
- 80%+ users reach 30% consciousness awakening
- 60%+ users experience full transformation
- Mobile performance maintains 30fps minimum
- Page load time under 2 seconds

## FALLBACK EXPERIENCE

For browsers without WebGL support:
- CSS particle animation using transform and opacity
- SVG neural network that builds with scroll
- Maintains core metaphor of consciousness awakening
- Still creates sense of user agency and transformation

This experience sets the tone for the entire CoreFlow360 journey - users don't just visit a website, they birth intelligence.