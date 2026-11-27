import { useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'

/*
 * Light/dark theme. index.html sets <html data-theme> before first paint (from localStorage,
 * else the system setting), so this module only reads and changes it. While the visitor has
 * not picked a theme, the page keeps following the system setting.
 */

export type Theme = 'light' | 'dark'

const KEY = 'theme'
const META_COLOR: Record<Theme, string> = { light: '#fafaf8', dark: '#0b0b10' }
const listeners = new Set<() => void>()

function stored(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export const getTheme = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

function apply(t: Theme) {
  document.documentElement.dataset.theme = t
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[t])
  listeners.forEach((fn) => fn())
}

apply(getTheme()) // sync the theme-color meta with what the inline script chose

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!stored()) apply(e.matches ? 'dark' : 'light')
})

/**
 * Switch theme and remember the choice. With an origin point (the toggle's centre) and motion
 * allowed, the new theme grows out of it in a circle.
 */
export function setTheme(t: Theme, origin?: { x: number; y: number }) {
  try {
    localStorage.setItem(KEY, t)
  } catch {
    /* private mode: the choice just isn't remembered */
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!origin || reduced || !document.startViewTransition) return apply(t)

  const r = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y))
  // flushSync: React must render the new icon inside the transition's update callback.
  const vt = document.startViewTransition(() => flushSync(() => apply(t)))
  vt.ready
    .then(() =>
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${r}px at ${origin.x}px ${origin.y}px)`] },
        { duration: 450, easing: 'cubic-bezier(.3,.7,.2,1)', pseudoElement: '::view-transition-new(root)' },
      ),
    )
    .catch(() => {})
}

export const toggleTheme = (origin?: { x: number; y: number }) => setTheme(getTheme() === 'dark' ? 'light' : 'dark', origin)

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/** The current theme; re-renders when it changes. */
export const useTheme = () => useSyncExternalStore(subscribe, getTheme, () => 'light' as Theme)
