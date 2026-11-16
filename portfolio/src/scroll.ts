import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Where the 3D core should sit while a section is on screen. Sections declare it with
 * `data-core="..."` so the object never lands on top of that section's text.
 */
export type CoreSpot = 'hero' | 'left' | 'right' | 'center'

/** Shared, mutable scroll state read by the 3D scene every frame (no re-renders). */
export const scrollState = { progress: 0, velocity: 0, spot: 'hero' as CoreSpot }

const listeners = new Set<() => void>()
/** Subscribe to scroll-state changes (used to redraw an on-demand canvas). */
export function onScrollChange(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
export function emitScrollChange() {
  listeners.forEach((fn) => fn())
}

/** Height of the fixed header, so anchor jumps don't hide section labels under it. */
export const HEADER_OFFSET = 80

/**
 * Smooth scrolling (Lenis) wired into GSAP ScrollTrigger. Call once in <App/>.
 * Lenis honours prefers-reduced-motion itself (respectReducedMotion defaults to true):
 * smoothing is off and anchor jumps are instant.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, anchors: { offset: -HEADER_OFFSET } })

    lenis.on('scroll', (e: { progress: number; velocity: number }) => {
      scrollState.progress = e.progress
      scrollState.velocity = e.velocity
      ScrollTrigger.update()
      emitScrollChange()
    })

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])
}

export { gsap, ScrollTrigger }
