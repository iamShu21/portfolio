import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/** Playful trailing cursor. Hidden on touch devices. */
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
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const hot = (e.target as HTMLElement | null)?.closest('a, button, [data-hover]')
      scale.set(hot ? 2.4 : 1)
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [x, y, scale])

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] hidden [@media(hover:hover)_and_(pointer:fine)]:block">
      <motion.div className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon/70" style={{ left: bx, top: by, scale: sScale }} />
      <motion.div className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon" style={{ left: sx, top: sy }} />
    </div>
  )
}
