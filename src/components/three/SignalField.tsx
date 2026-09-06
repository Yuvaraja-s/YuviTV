import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const COUNT = 900
const COLORS = ['#e4123a', '#1f6fff', '#4de3ff']

function Field() {
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const col = new Float32Array(COUNT * 3)
    const color = new THREE.Color()
    for (let i = 0; i < COUNT; i++) {
      // Points on a large sphere shell, so rotation reads as depth rather than random drift.
      const radius = 6 + Math.random() * 6
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = radius * Math.cos(phi)

      color.set(COLORS[i % COLORS.length])
      col[i * 3] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
    }
    return [pos, col]
  }, [])

  useFrame((_state, delta) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y += delta * 0.025
    pointsRef.current.rotation.x += delta * 0.008
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} vertexColors transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  )
}

/** Ambient WebGL backdrop — a slow-drifting field of broadcast-colored
 * points, evoking signal/static rather than the portfolio's web-mesh.
 * Lazy-loaded and only ever mounted outside `prefers-reduced-motion`. */
export function SignalField() {
  return (
    <Canvas
      className="!absolute !inset-0"
      camera={{ position: [0, 0, 9], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <Field />
    </Canvas>
  )
}

export default SignalField
