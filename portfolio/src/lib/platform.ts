import { useSyncExternalStore } from 'react'

const never = () => () => {}

/** Apple keyboards show ⌘ where others show Ctrl. */
export const isMac = () => /Mac|iPhone|iPad/.test(navigator.userAgent)

/**
 * isMac as a hook that is safe to pre-render: the server (and hydration) assume "not a Mac",
 * then React re-renders with the real answer, without a hydration mismatch.
 */
export const useIsMac = () => useSyncExternalStore(never, isMac, () => false)
