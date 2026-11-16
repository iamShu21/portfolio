import { useEffect, useRef, type ComponentRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState } from '../scroll'
import { CORE_HOVER, CORE_KICK } from '../events'
import { markDirty } from './frame'

const PALETTE = ['#7cf7c8', '#ff5ca8', '#f5b301', '#7cf7c8'].map((c) => new THREE.Color(c))
const { damp } = THREE.MathUtils

/** Target position, size and opacity for the current `data-core` spot, in viewport units. */
function spotTarget(w: number) {
  const wide = w > 7
  // Step aside (fade out) where another 3D visual is the focus, e.g. the campus map.
  if (scrollState.spot === 'away') return { x: wide ? w * 0.3 : 0, y: -0.5, s: 0.5, o: 0 }
  if (scrollState.spot === 'hero') return wide ? { x: w * 0.24, y: 0, s: Math.min(w / 11, 1), o: 1 } : { x: 0, y: 1.55, s: 0.4, o: 1 }
  // Phones/tablets have no free side, so the core sits behind the text: keep it faint.
  if (!wide) return { x: 0, y: 0, s: 0.36, o: 0.3 }
  const side = scrollState.spot === 'left' ? -1 : scrollState.spot === 'right' ? 1 : 0
  return { x: side * w * 0.27, y: 0, s: side ? 0.8 : 0.9, o: 1 }
}

const setOpacity = (mesh: THREE.Mesh | null, o: number) => {
  if (mesh) (mesh.material as THREE.Material).opacity = o
}

type DistortMat = ComponentRef<typeof MeshDistortMaterial>

/**
 * The hero object: a glowing distorted core in a wireframe shell and a ring.
 * Hover charges it up (more distortion, brighter, faster rings); click/tap spins it.
 */
export default function Core({ reduced, detail }: { reduced: boolean; detail: number }) {
  const group = useRef<THREE.Group>(null)
  const body = useRef<THREE.Mesh>(null)
  const mat = useRef<DistortMat>(null)
  const shell = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const color = useRef(new THREE.Color())
  const fade = useRef(1)
  const hovered = useRef(false)
  const energy = useRef(0) // 0 idle → 1 fully charged by hover
  const spin = useRef(0) // extra angular velocity from clicks and page transitions

  useEffect(() => {
    const kick = () => {
      spin.current += 6
    }
    window.addEventListener(CORE_KICK, kick)
    return () => window.removeEventListener(CORE_KICK, kick)
  }, [])

  const setHover = (on: boolean) => {
    if (hovered.current === on) return
    hovered.current = on
    window.dispatchEvent(new CustomEvent(CORE_HOVER, { detail: on }))
    markDirty()
  }
  // Only react while the core is in front (not when it's faded behind text on phones).
  const interactive = () => fade.current > 0.9
  const onOver = (e: ThreeEvent<PointerEvent>) => e.pointerType === 'mouse' && interactive() && setHover(true)
  const onOut = () => setHover(false)
  const onClick = () => {
    if (!interactive()) return
    spin.current += 8
    markDirty()
  }

  useFrame((state, rawDt) => {
    const g = group.current
    if (!g) return
    const dt = Math.min(rawDt, 0.1)
    const p = scrollState.progress
    const t = spotTarget(state.viewport.width)
    // With reduced motion frames only render on change, so snap instead of easing.
    const ease = reduced ? Infinity : 3

    if (!interactive() && hovered.current) setHover(false)
    energy.current = damp(energy.current, hovered.current ? 1 : 0, reduced ? Infinity : 5, dt)
    const en = energy.current

    g.position.x = damp(g.position.x, t.x, ease, dt)
    g.position.y = damp(g.position.y, t.y + (reduced ? 0 : Math.cos(p * Math.PI * 3) * 0.25), ease, dt)

    let s = t.s * (1 + en * 0.08)
    if (!reduced) {
      // Idle spin + scroll + click impulse; the mouse tilts it.
      g.rotation.y += dt * (0.25 + spin.current) + scrollState.velocity * 0.01
      spin.current = damp(spin.current, 0, 1.8, dt)
      g.rotation.x = damp(g.rotation.x, state.pointer.y * 0.4 + p * 3, 3, dt)
      g.rotation.z = damp(g.rotation.z, -state.pointer.x * 0.3, 3, dt)
      s *= 1 + Math.min(Math.abs(scrollState.velocity) * 0.02, 0.35)
      if (shell.current) shell.current.rotation.y -= dt * (0.4 + en * 1.6)
      if (ring.current) ring.current.rotation.x += dt * (0.6 + en * 2.6)
    }
    g.scale.setScalar(damp(g.scale.x, s, reduced ? Infinity : 6, dt))

    if (mat.current) {
      mat.current.distort = 0.4 + en * 0.25
      mat.current.emissiveIntensity = 0.4 + en * 0.9
    }

    fade.current = damp(fade.current, t.o, ease, dt)
    g.visible = fade.current > 0.01 // skip drawing it entirely while it's away
    setOpacity(body.current, fade.current)
    setOpacity(shell.current, fade.current * (0.55 + en * 0.35))
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
          <icosahedronGeometry args={[1, detail]} />
          <MeshDistortMaterial
            ref={mat}
            transparent
            color="#14143a"
            emissive="#2b2bff"
            emissiveIntensity={0.4}
            roughness={0.15}
            metalness={0.9}
            distort={0.4}
            speed={reduced ? 0 : 2}
          />
        </mesh>
        <mesh ref={shell} scale={1.55}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial wireframe transparent opacity={0.55} color="#7cf7c8" />
        </mesh>
        <mesh ref={ring} scale={2.3}>
          <torusGeometry args={[1, 0.008, 8, 128]} />
          <meshBasicMaterial transparent color="#7cf7c8" />
        </mesh>
        {/* Invisible, low-poly hit target: cheaper to raycast than the 12k-triangle body. */}
        <mesh scale={1.35} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </Float>
    </group>
  )
}
