import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState } from './scroll'

/** The hero object: a glowing distorted core wrapped in a wireframe shell and a ring. */
function Core() {
  const group = useRef<THREE.Group>(null)
  const shell = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const color = useRef(new THREE.Color())

  const palette = [new THREE.Color('#7cf7c8'), new THREE.Color('#ff5ca8'), new THREE.Color('#f5b301'), new THREE.Color('#7cf7c8')]

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const p = scrollState.progress

    // Drift across the screen as you scroll: right -> left -> right -> centre.
    const w = state.viewport.width
    const wide = w > 7
    const heroBias = (1 - THREE.MathUtils.smoothstep(p, 0, 0.08)) * w * 0.24
    const targetX = Math.sin(p * Math.PI * 2) * w * 0.22 + heroBias
    const targetY = wide ? Math.cos(p * Math.PI * 3) * 0.5 : 1.4 + Math.cos(p * Math.PI * 3) * 0.3
    g.position.x = THREE.MathUtils.damp(g.position.x, wide ? targetX : 0, 3, dt)
    g.position.y = THREE.MathUtils.damp(g.position.y, targetY, 3, dt)
    const fit = THREE.MathUtils.clamp(w / 11, 0.45, 1)

    // Scroll spins it; mouse tilts it.
    g.rotation.y += dt * 0.25 + scrollState.velocity * 0.01
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, state.pointer.y * 0.4 + p * 3, 3, dt)
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, -state.pointer.x * 0.3, 3, dt)

    const s = fit * (1 + Math.min(Math.abs(scrollState.velocity) * 0.02, 0.35))
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, s, 6, dt))

    if (shell.current) shell.current.rotation.y -= dt * 0.4
    if (ring.current) ring.current.rotation.x += dt * 0.6

    // Blend the accent colour through the page.
    const t = p * (palette.length - 1)
    const i = Math.min(Math.floor(t), palette.length - 2)
    color.current.copy(palette[i]).lerp(palette[i + 1], t - i)
    ;(shell.current?.material as THREE.MeshBasicMaterial | undefined)?.color.copy(color.current)
    ;(ring.current?.material as THREE.MeshBasicMaterial | undefined)?.color.copy(color.current)
  })

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.4} floatIntensity={1.2}>
        <mesh>
          <icosahedronGeometry args={[1, 24]} />
          <MeshDistortMaterial color="#1a1a3a" emissive="#2b2bff" emissiveIntensity={0.45} roughness={0.2} metalness={0.8} distort={0.45} speed={2} />
        </mesh>
        <mesh ref={shell} scale={1.55}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial wireframe transparent opacity={0.55} color="#7cf7c8" />
        </mesh>
        <mesh ref={ring} scale={2.3}>
          <torusGeometry args={[1, 0.008, 8, 128]} />
          <meshBasicMaterial color="#7cf7c8" />
        </mesh>
      </Float>
    </group>
  )
}

/** Gentle camera parallax following the mouse. */
function Rig() {
  useFrame((state, dt) => {
    const { camera, pointer } = state
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.6, 2, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.y * 0.4, 2, dt)
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function Scene() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.75]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <color attach="background" args={['#07070d']} />
        <fog attach="fog" args={['#07070d', 8, 22]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={60} color="#7cf7c8" />
        <pointLight position={[-6, -3, 2]} intensity={40} color="#ff5ca8" />
        <Suspense fallback={null}>
          <Core />
          <Stars radius={60} depth={40} count={2500} factor={3} fade speed={0.6} />
          <Sparkles count={70} scale={[14, 8, 6]} size={2.5} speed={0.4} color="#7cf7c8" />
        </Suspense>
        <Rig />
      </Canvas>
    </div>
  )
}
