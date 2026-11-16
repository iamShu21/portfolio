import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Where the 3D core should sit while a section is on screen. Sections declare it with
 * `data-core="..."` so the object never lands on top of that section's text.
 */
export type CoreSpot = 'hero' | 'left' | 'right' | 'center' | 'away'

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

let lenis: Lenis | null = null

/** Freeze page scrolling, e.g. while a modal dialog is open. */
export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop()
  else lenis?.start()
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

/** Height of the fixed header, so anchor jumps don't hide section labels under it. */
export const HEADER_OFFSET = 80

/** Scroll to an element through Lenis (smooth, or instant), with the header offset. */
export function scrollToElement(el: HTMLElement, { immediate = false } = {}) {
  if (lenis) lenis.scrollTo(el, { offset: -HEADER_OFFSET, immediate, force: true })
  else el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' })
}

/**
 * Smooth scrolling (Lenis) wired into GSAP ScrollTrigger. Call once in <App/>.
 * Lenis honours prefers-reduced-motion itself (respectReducedMotion defaults to true):
 * smoothing is off and programmatic scrolls are instant. In-page links are handled by
 * <Transition/>.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const instance = new Lenis({ lerp: 0.09 })
    lenis = instance

    instance.on('scroll', (e: { progress: number; velocity: number }) => {
      scrollState.progress = e.progress
      scrollState.velocity = e.velocity
      ScrollTrigger.update()
      emitScrollChange()
    })

    const tick = (time: number) => instance.raf(time * 1000)
    // Prioritised: the page must move before the 3D canvas draws in the same tick.
    gsap.ticker.add(tick, false, true)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      if (lenis === instance) lenis = null
    }
  }, [])
}

export { gsap, ScrollTrigger }
