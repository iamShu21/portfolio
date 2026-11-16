import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

/** One-off read, for code outside React. */
export const prefersReducedMotion = () => window.matchMedia(QUERY).matches

/** Live `prefers-reduced-motion` value; re-renders if the OS setting changes. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false)
}
