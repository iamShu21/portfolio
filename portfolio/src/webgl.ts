let cached: boolean | undefined

/** True when WebGL is available. `?nowebgl` in the URL forces the fallbacks, for testing. */
export function hasWebGL() {
  if (cached !== undefined) return cached
  if (new URLSearchParams(window.location.search).has('nowebgl')) return (cached = false)
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    cached = !!gl
  } catch {
    cached = false
  }
  return cached
}

/** Touch-first device: used to pick lighter 3D settings. */
export const isCoarsePointer = () => window.matchMedia('(pointer: coarse)').matches
