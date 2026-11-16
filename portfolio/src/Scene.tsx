import { Component, Suspense, useEffect, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor, Sparkles, Stars, Stats } from '@react-three/drei'
import { MathUtils } from 'three'
import { gsap, onScrollChange } from './scroll'
import { useReducedMotion } from './motion'
import { viewTargets } from './events'
import { hasWebGL, isCoarsePointer } from './webgl'
import { consumeDirty, markDirty } from './three/frame'
import Core from './three/Core'
import Campus from './three/Campus'
import { campusCamera, campusScene } from './three/campusView'

/** Gentle camera parallax following the mouse (off with reduced motion). */
function Rig({ reduced }: { reduced: boolean }) {
  useFrame((state, dt) => {
    if (reduced) return
    const { camera, pointer } = state
    camera.position.x = MathUtils.damp(camera.position.x, pointer.x * 0.6, 2, dt)
    camera.position.y = MathUtils.damp(camera.position.y, pointer.y * 0.4, 2, dt)
    camera.lookAt(0, 0, 0)
  })
  return null
}

/**
 * Draws the main scene full-screen, then the campus scene scissored into the rect of its
 * placeholder element. One WebGL context for the whole page.
 */
function Renderer() {
  useFrame(({ gl, scene, camera, size }) => {
    gl.setScissorTest(false)
    gl.setViewport(0, 0, size.width, size.height)
    gl.autoClear = true
    gl.render(scene, camera)

    const el = viewTargets.campus
    if (!el) return
    const b = el.getBoundingClientRect()
    if (b.bottom <= 0 || b.top >= size.height || b.width < 4 || b.height < 4) return
    const r = { left: b.left + 1, width: b.width - 2, height: b.height - 2 } // stay inside the 1px border
    const bottom = size.height - b.bottom + 1
    gl.setViewport(r.left, bottom, r.width, r.height)
    gl.setScissor(r.left, bottom, r.width, r.height)
    gl.setScissorTest(true)
    gl.autoClear = false
    gl.clearDepth() // keep the starfield behind the map, but draw the map over everything else
    if (campusCamera.aspect !== r.width / r.height) {
      campusCamera.aspect = r.width / r.height
      campusCamera.updateProjectionMatrix()
    }
    gl.render(campusScene, campusCamera)
    gl.setScissorTest(false)
    gl.setViewport(0, 0, size.width, size.height)
  }, 1)
  return null
}

/**
 * Advances the canvas from GSAP's ticker, right after Lenis has moved the page, so the
 * scissored campus view stays glued to its element while smooth-scrolling.
 * With reduced motion it only draws when something changed.
 */
function FrameDriver({ reduced }: { reduced: boolean }) {
  const advance = useThree((s) => s.advance)
  useEffect(() => {
    let warmup = 20 // let async bits (environment map, fonts, layout) settle
    markDirty()
    const offScroll = onScrollChange(markDirty)
    window.addEventListener('resize', markDirty)
    const tick = (time: number) => {
      if (reduced && warmup <= 0 && !consumeDirty()) return
      warmup--
      advance(time, true)
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      offScroll()
      window.removeEventListener('resize', markDirty)
    }
  }, [advance, reduced])
  return null
}

/** If the scene throws, drop it: <SceneFallback/> underneath (rendered by App) stays visible. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function Scene() {
  const reduced = useReducedMotion()
  const [webgl] = useState(hasWebGL)
  const [coarse] = useState(isCoarsePointer)
  const [showStats] = useState(() => new URLSearchParams(window.location.search).has('stats'))
  // Phones get a lower pixel-ratio ceiling; the performance monitor drops to 1 if frames suffer.
  const maxDpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 1.75)
  const [dpr, setDpr] = useState(maxDpr)
  const [ready, setReady] = useState(false)

  if (!webgl) return null

  return (
    <SceneBoundary>
      {/* Fades in over the static fallback once the first frame is drawn. */}
      <div className={`fixed inset-0 z-0 motion-safe:transition-opacity motion-safe:duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`} aria-hidden>
        <Canvas
          onCreated={() => requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)))}
          frameloop="never"
          // Listen on the page root: the canvas sits under the content, so it would never see the pointer.
          eventSource={document.getElementById('root')!}
          eventPrefix="client"
          camera={{ position: [0, 0, 6], fov: 50 }}
          dpr={dpr}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <FrameDriver reduced={reduced} />
          {!reduced && (
            <PerformanceMonitor flipflops={3} onDecline={() => setDpr(1)} onIncline={() => setDpr(maxDpr)} onFallback={() => setDpr(1)} />
          )}
          <color attach="background" args={['#07070d']} />
          <fog attach="fog" args={['#07070d', 8, 22]} />
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={60} color="#7cf7c8" />
          <pointLight position={[-6, -3, 2]} intensity={40} color="#ff5ca8" />
          {/* Procedural reflections for the metallic core: rendered once, nothing downloaded. */}
          <Environment resolution={64} frames={1}>
            <Lightformer form="ring" color="#7cf7c8" intensity={3} position={[3, 2, 4]} scale={3} />
            <Lightformer form="rect" color="#ff5ca8" intensity={2} position={[-4, -1, 2]} scale={[4, 1, 1]} />
            <Lightformer form="rect" color="#ffffff" intensity={1.5} position={[0, 5, -3]} scale={[8, 1, 1]} />
          </Environment>
          <Suspense fallback={null}>
            <Core reduced={reduced} detail={coarse ? 12 : 24} />
            <Stars radius={60} depth={40} count={coarse ? 1200 : 2500} factor={3} fade speed={reduced ? 0 : 0.6} />
            <Sparkles count={coarse ? 35 : 70} scale={[14, 8, 6]} size={2.5} speed={reduced ? 0 : 0.4} color="#7cf7c8" />
          </Suspense>
          <Campus reduced={reduced} />
          <Rig reduced={reduced} />
          <Renderer />
          {showStats && <Stats />}
        </Canvas>
      </div>
    </SceneBoundary>
  )
}
