import { useSyncExternalStore } from 'react'

/*
 * X-ray build mode: <html data-xray-on> outlines every element that carries a `data-xray`
 * note and prints the note on it (CSS in index.css). Toggled with X, the footer button or the
 * wayfinder. Not remembered between visits on purpose: it's a peek, not a setting.
 */

const listeners = new Set<() => void>()

export const isXray = () => document.documentElement.hasAttribute('data-xray-on')

export function setXray(on: boolean) {
  document.documentElement.toggleAttribute('data-xray-on', on)
  listeners.forEach((fn) => fn())
}

export const toggleXray = () => setXray(!isXray())

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export const useXray = () => useSyncExternalStore(subscribe, isXray, () => false)
