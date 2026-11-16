import { useLayoutEffect, useMemo, useRef } from 'react'
import { createPortal, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import campus from './campus.json'
import { viewTargets } from '../events'
import { campusCamera, campusScene } from './campusView'

const UNIT = 1 / 100 // plane pixels → world units (the plane is 10.8 × 6.94)
type Pt = number[]
const toV = ([x, y]: Pt) => new THREE.Vector3((x - campus.width / 2) * UNIT, 0, (y - campus.height / 2) * UNIT)

const GOLD = '#f5b301'
const NEON = '#7cf7c8'
const SPACING = 0.3 // world units between arrows
const SPEED = 0.45 // world units per second

/** All walked routes as one LineSegments draw call. */
function networkGeometry() {
  const pos: number[] = []
  for (const walk of campus.walks) {
    for (let i = 1; i < walk.length; i++) {
      const a = toV(walk[i - 1])
      const b = toV(walk[i])
      pos.push(a.x, 0, a.z, b.x, 0, b.z)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  return g
}

/** Ends of every walk (doors and junctions), merged when closer than a few pixels. */
function placePoints() {
  const out: THREE.Vector3[] = []
  for (const w of campus.walks) {
    for (const p of [w[0], w[w.length - 1]]) {
      const v = toV(p)
      if (!out.some((o) => o.distanceTo(v) < 0.08)) out.push(v)
    }
  }
  return out
}

/** Polyline with arc-length lookup, for moving arrows along the featured route. */
function routePath() {
  const pts = campus.featured.pts.map(toV)
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]))
  const length = cum[cum.length - 1]
  const at = (d: number, pos: THREE.Vector3, dir: THREE.Vector3) => {
    let i = 1
    while (i < cum.length - 1 && cum[i] < d) i++
    const t = (d - cum[i - 1]) / (cum[i] - cum[i - 1] || 1)
    pos.lerpVectors(pts[i - 1], pts[i], THREE.MathUtils.clamp(t, 0, 1))
    dir.subVectors(pts[i], pts[i - 1]).normalize()
  }
  return { pts, length, at }
}

/** A flat chevron lying on the ground, pointing along -Z. */
function chevronGeometry() {
  const s = new THREE.Shape()
  s.moveTo(-0.5, 0)
  s.lineTo(0, 0.5)
  s.lineTo(0.5, 0)
  s.lineTo(0.5, -0.24)
  s.lineTo(0, 0.26)
  s.lineTo(-0.5, -0.24)
  s.closePath()
  const g = new THREE.ShapeGeometry(s)
  g.rotateX(-Math.PI / 2)
  return g
}

function CampusContent({ reduced }: { reduced: boolean }) {
  const network = useMemo(() => networkGeometry(), [])
  const places = useMemo(() => placePoints(), [])
  const route = useMemo(() => routePath(), [])
  const chevron = useMemo(() => chevronGeometry(), [])
  const count = Math.floor(route.length / SPACING)

  const pins = useRef<THREE.InstancedMesh>(null)
  const arrows = useRef<THREE.InstancedMesh>(null)
  const goal = useRef<THREE.Mesh>(null)
  const pulse = useRef<THREE.Mesh>(null)
  const tilt = useRef(new THREE.Vector2())

  const centre = useMemo(() => route.pts.reduce((a, p) => a.add(p), new THREE.Vector3()).divideScalar(route.pts.length).lerp(new THREE.Vector3(), 0.4), [route])
  const end = route.pts[route.pts.length - 1]

  // Place pins once.
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    places.forEach((p, i) => pins.current?.setMatrixAt(i, m.makeTranslation(p.x, 0.07, p.z)))
    if (pins.current) pins.current.instanceMatrix.needsUpdate = true
  }, [places])

  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), dir: new THREE.Vector3(), obj: new THREE.Object3D() }), [])

  useFrame((state, dt) => {
    const time = state.clock.elapsedTime

    // Arrows flow toward the Library (static and evenly spaced with reduced motion).
    const shift = reduced ? 0 : (time * SPEED) % SPACING
    for (let i = 0; i < count; i++) {
      const d = i * SPACING + shift
      route.at(d, tmp.pos, tmp.dir)
      tmp.obj.position.set(tmp.pos.x, 0.02, tmp.pos.z)
      tmp.obj.rotation.set(0, Math.atan2(-tmp.dir.x, -tmp.dir.z), 0)
      // Shrink in at the start and out at the end of the route.
      const edge = Math.min(d, route.length - d)
      tmp.obj.scale.setScalar(0.16 * THREE.MathUtils.clamp(edge / 0.4, 0, 1))
      tmp.obj.updateMatrix()
      arrows.current?.setMatrixAt(i, tmp.obj.matrix)
    }
    if (arrows.current) arrows.current.instanceMatrix.needsUpdate = true

    // Destination pin bobs; its ring pulses outward.
    if (goal.current) goal.current.position.y = 0.32 + (reduced ? 0 : Math.sin(time * 2.4) * 0.05)
    if (pulse.current) {
      const k = reduced ? 0.5 : (time * 0.7) % 1
      pulse.current.scale.setScalar(0.15 + k * 0.45)
      ;(pulse.current.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - k)
    }

    // Camera: slow orbit, tilted by the pointer while it's over the map.
    const el = viewTargets.campus
    let nx = 0
    let ny = 0
    if (el && !reduced) {
      const r = el.getBoundingClientRect()
      const cx = ((state.pointer.x + 1) / 2) * state.size.width
      const cy = ((1 - state.pointer.y) / 2) * state.size.height
      if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
        nx = ((cx - r.left) / r.width) * 2 - 1
        ny = ((cy - r.top) / r.height) * 2 - 1
      }
    }
    tilt.current.x = THREE.MathUtils.damp(tilt.current.x, nx, 3, dt)
    tilt.current.y = THREE.MathUtils.damp(tilt.current.y, ny, 3, dt)
    const aspect = campusCamera.aspect || 1
    // Square/tall (phone) boxes look along the campus's long side so it fills the frame.
    const tall = aspect < 1.3
    const angle = (tall ? Math.PI / 2 : 0) + (reduced ? 0 : Math.sin(time * 0.12) * 0.35) + tilt.current.x * 0.35
    const dist = tall ? 7.5 : aspect < 1.8 ? 10.5 : 9
    const height = (tall ? 8.5 : 6.5) + tilt.current.y * 1.5
    campusCamera.position.set(centre.x + Math.sin(angle) * dist, height, centre.z + Math.cos(angle) * dist)
    campusCamera.lookAt(centre)
  })

  return (
    <>
      <ambientLight intensity={1} />
      {/* ground */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
        <planeGeometry args={[campus.width * UNIT + 0.8, campus.height * UNIT + 0.8]} />
        <meshBasicMaterial color="#0b0b17" />
      </mesh>
      <gridHelper args={[11.6, 29, '#1d1d33', '#16162a']} position-y={-0.005} scale={[1, 1, 0.66]} />
      {/* every walked route */}
      <lineSegments geometry={network}>
        <lineBasicMaterial color={NEON} transparent opacity={0.4} />
      </lineSegments>
      {/* doors and junctions */}
      <instancedMesh ref={pins} args={[undefined, undefined, places.length]}>
        <cylinderGeometry args={[0.025, 0.025, 0.14, 6]} />
        <meshBasicMaterial color={NEON} />
      </instancedMesh>
      {/* the featured walk and its AR arrows */}
      <Line points={route.pts} color={GOLD} lineWidth={2} transparent opacity={0.35} />
      <instancedMesh ref={arrows} args={[chevron, undefined, count]}>
        <meshBasicMaterial color={GOLD} toneMapped={false} side={THREE.DoubleSide} />
      </instancedMesh>
      {/* destination: the Library */}
      <mesh ref={goal} position={[end.x, 0.32, end.z]} rotation-x={Math.PI}>
        <coneGeometry args={[0.09, 0.26, 16]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>
      <mesh ref={pulse} position={[end.x, 0.01, end.z]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.8, 1, 48]} />
        <meshBasicMaterial color={GOLD} transparent toneMapped={false} />
      </mesh>
    </>
  )
}

/** Mounts the campus into its own scene (rendered by Scene.tsx's scissor pass). */
export default function Campus({ reduced }: { reduced: boolean }) {
  return createPortal(<CampusContent reduced={reduced} />, campusScene)
}
