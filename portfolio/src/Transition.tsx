import { useEffect, useRef } from 'react'
import { gsap, scrollToElement } from './scroll'
import { useReducedMotion } from './motion'
import { CORE_KICK } from './events'

/** Move keyboard focus to the section we jumped to (without scrolling again). */
function focusSection(el: HTMLElement) {
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

/**
 * Handles every in-page link (#about, #work…). Long jumps play a terminal-style wipe:
 * a panel sweeps up, the page jumps behind it, and it sweeps away. Short jumps smooth-scroll.
 * With reduced motion every jump is instant.
 */
export default function Transition() {
  const panel = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const busy = useRef(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]')
      const id = a?.getAttribute('href')?.slice(1)
      const target = id ? document.getElementById(id) : null
      if (!target) return
      e.preventDefault()
      if (busy.current) return

      const land = () => {
        focusSection(target)
        history.replaceState(null, '', `#${id}`)
      }
      // data-instant (e.g. the skip link): jump straight there, no animation.
      const instant = reduced || a?.hasAttribute('data-instant')
      const far = Math.abs(target.getBoundingClientRect().top) > window.innerHeight * 1.5
      if (instant || !far || !panel.current) {
        scrollToElement(target, { immediate: instant })
        land()
        return
      }

      busy.current = true
      if (label.current) label.current.textContent = `cd ~/${id === 'top' ? '' : id}`
      window.dispatchEvent(new Event(CORE_KICK))
      gsap
        .timeline({ onComplete: () => void (busy.current = false) })
        .set(panel.current, { visibility: 'visible' })
        .fromTo(panel.current, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.38, ease: 'power3.in' })
        .add(() => {
          scrollToElement(target, { immediate: true })
          land()
        })
        .to(panel.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.5, ease: 'power3.out', delay: 0.12 })
        .set(panel.current, { visibility: 'hidden' })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [reduced])

  return (
    <div ref={panel} aria-hidden className="pointer-events-none invisible fixed inset-0 z-[65] grid place-items-center bg-ink">
      <div className="absolute inset-x-0 top-0 h-px bg-neon shadow-[0_0_24px_4px_var(--color-neon)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-pink shadow-[0_0_24px_4px_var(--color-pink)]" />
      <p className="font-mono text-sm text-neon md:text-base">
        <span className="text-white/50">$ </span>
        <span ref={label} />
        <span className="motion-safe:animate-pulse">_</span>
      </p>
    </div>
  )
}
