import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { onScrollChange, scrollState } from './scroll'
import { useReducedMotion } from './motion'

const PALETTE = ['#7cf7c8', '#ff5ca8', '#f5b301', '#7cf7c8'].map((c) => new THREE.Color(c))

/** Target position and size for each `data-core` spot, in viewport units. */
function spotTarget(w: number) {
  const wide = w > 7
  if (scrollState.spot === 'hero') return wide ? { x: w * 0.24, y: 0, s: Math.min(w / 11, 1), o: 1 } : { x: 0, y: 1.55, s: 0.4, o: 1 }
  // Phones/tablets have no free side, so the core sits behind the text: keep it faint.
  if (!wide) return { x: 0, y: 0, s: 0.36, o: 0.3 }
  const side = scrollState.spot === 'left' ? -1 : scrollState.spot === 'right' ? 1 : 0
  return { x: side * w * 0.27, y: 0, s: side ? 0.8 : 0.9, o: 1 }
}

const setOpacity = (mesh: THREE.Mesh | null, o: number) => {
  if (mesh) (mesh.material as THREE.Material).opacity = o
}

/** The hero object: a glowing distorted core wrapped in a wireframe shell and a ring. */
function Core({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null)
  const body = useRef<THREE.Mesh>(null)
  const shell = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const color = useRef(new THREE.Color())
  const fade = useRef(1)

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const p = scrollState.progress
    const t = spotTarget(state.viewport.width)
    // With reduced motion the frame loop only runs on scroll, so snap instead of easing.
    const ease = reduced ? Infinity : 3

    g.position.x = THREE.MathUtils.damp(g.position.x, t.x, ease, dt)
    g.position.y = THREE.MathUtils.damp(g.position.y, t.y + (reduced ? 0 : Math.cos(p * Math.PI * 3) * 0.25), ease, dt)

    let s = t.s
    if (!reduced) {
      // Scroll spins it; mouse tilts it.
      g.rotation.y += dt * 0.25 + scrollState.velocity * 0.01
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, state.pointer.y * 0.4 + p * 3, 3, dt)
      g.rotation.z = THREE.MathUtils.damp(g.rotation.z, -state.pointer.x * 0.3, 3, dt)
      s *= 1 + Math.min(Math.abs(scrollState.velocity) * 0.02, 0.35)
      if (shell.current) shell.current.rotation.y -= dt * 0.4
      if (ring.current) ring.current.rotation.x += dt * 0.6
    }
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, s, reduced ? Infinity : 6, dt))

    fade.current = THREE.MathUtils.damp(fade.current, t.o, ease, dt)
    setOpacity(body.current, fade.current)
    setOpacity(shell.current, fade.current * 0.55)
    setOpacity(ring.current, fade.current)

    // Blend the accent colour through the page.
    const k = p * (PALETTE.length - 1)
    const i = Math.min(Math.floor(k), PALETTE.length - 2)
    color.current.copy(PALETTE[i]).lerp(PALETTE[i + 1], k - i)
    ;(shell.current?.material as THREE.MeshBasicMaterial | undefined)?.color.copy(color.current)
    ;(ring.current?.material as THREE.MeshBasicMaterial | undefined)?.color.copy(color.current)
  })

  return (
    <group ref={group} rotation={[0.35, 0, 0]}>
      <Float speed={reduced ? 0 : 2} rotationIntensity={0.4} floatIntensity={1.2}>
        <mesh ref={body}>
          <icosahedronGeometry args={[1, 24]} />
          <MeshDistortMaterial transparent color="#1a1a3a" emissive="#2b2bff" emissiveIntensity={0.45} roughness={0.2} metalness={0.8} distort={0.45} speed={reduced ? 0 : 2} />
        </mesh>
        <mesh ref={shell} scale={1.55}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial wireframe transparent opacity={0.55} color="#7cf7c8" />
        </mesh>
        <mesh ref={ring} scale={2.3}>
          <torusGeometry args={[1, 0.008, 8, 128]} />
          <meshBasicMaterial transparent color="#7cf7c8" />
        </mesh>
      </Float>
    </group>
  )
}

/** Gentle camera parallax following the mouse (off with reduced motion). */
function Rig({ reduced }: { reduced: boolean }) {
  useFrame((state, dt) => {
    if (reduced) return
    const { camera, pointer } = state
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.6, 2, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.y * 0.4, 2, dt)
    camera.lookAt(0, 0, 0)
  })
  return null
}

/** In on-demand mode, draw a frame whenever scroll state changes. */
function RedrawOnScroll() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => onScrollChange(() => invalidate()), [invalidate])
  return null
}

/** Static stand-in when WebGL is unavailable or the scene crashes. */
function Fallback() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-ink" aria-hidden>
      <div className="absolute right-[8%] top-[18%] h-[28rem] w-[28rem] rounded-full bg-[#2b2bff]/25 blur-3xl" />
      <div className="absolute right-[18%] top-[30%] h-64 w-64 rounded-full bg-neon/15 blur-3xl" />
    </div>
  )
}

function hasWebGL() {
  if (new URLSearchParams(window.location.search).has('nowebgl')) return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return !!gl
  } catch {
    return false
  }
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <Fallback /> : this.props.children
  }
}

export default function Scene() {
  const reduced = useReducedMotion()
  const [webgl] = useState(hasWebGL)
  if (!webgl) return <Fallback />

  return (
    <SceneBoundary>
      <div className="fixed inset-0 z-0" aria-hidden>
        <Canvas
          frameloop={reduced ? 'demand' : 'always'}
          camera={{ position: [0, 0, 6], fov: 50 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#07070d']} />
          <fog attach="fog" args={['#07070d', 8, 22]} />
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={60} color="#7cf7c8" />
          <pointLight position={[-6, -3, 2]} intensity={40} color="#ff5ca8" />
          <Suspense fallback={null}>
            <Core reduced={reduced} />
            <Stars radius={60} depth={40} count={2500} factor={3} fade speed={reduced ? 0 : 0.6} />
            <Sparkles count={70} scale={[14, 8, 6]} size={2.5} speed={reduced ? 0 : 0.4} color="#7cf7c8" />
          </Suspense>
          <Rig reduced={reduced} />
          {reduced && <RedrawOnScroll />}
        </Canvas>
      </div>
    </SceneBoundary>
  )
}
