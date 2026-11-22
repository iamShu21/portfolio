import { useEffect } from 'react'
import { m, useMotionValue, useSpring } from 'framer-motion'
import { CORE_HOVER } from './events'

/** Playful trailing cursor. Hidden on touch devices and with reduced motion (native cursor instead). */
export default function Cursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 500, damping: 40 })
  const sy = useSpring(y, { stiffness: 500, damping: 40 })
  const bx = useSpring(x, { stiffness: 120, damping: 18 })
  const by = useSpring(y, { stiffness: 120, damping: 18 })
  const scale = useMotionValue(1)
  const sScale = useSpring(scale, { stiffness: 300, damping: 20 })

  useEffect(() => {
    let overCore = false
    let overLink = false
    const update = () => scale.set(overLink ? 2.4 : overCore ? 3.2 : 1)
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      overLink = !!(e.target as HTMLElement | null)?.closest('a, button, [data-hover]')
      update()
    }
    // The 3D core reports hover itself (it lives in the canvas, not the DOM).
    const core = (e: Event) => {
      overCore = (e as CustomEvent<boolean>).detail
      update()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener(CORE_HOVER, core)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener(CORE_HOVER, core)
    }
  }, [x, y, scale])

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] hidden [@media(hover:hover)_and_(pointer:fine)_and_(prefers-reduced-motion:no-preference)]:block" aria-hidden>
      <m.div className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon/70" style={{ left: bx, top: by, scale: sScale }} />
      <m.div className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon" style={{ left: sx, top: sy }} />
    </div>
  )
}
