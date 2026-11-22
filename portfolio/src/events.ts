// Window events shared between the DOM and the 3D scene. Kept tiny and three-free so the
// DOM side can use them without pulling the Three.js chunk into the main bundle.

/** CustomEvent<boolean>: the pointer started (true) or stopped (false) hovering the 3D core. */
export const CORE_HOVER = 'core:hover'
/** Event: give the 3D core a spin (fired by page transitions). */
export const CORE_KICK = 'core:kick'

/** Event: open the CV dialog. */
export const OPEN_CV = 'cv:open'

/** DOM elements the 3D canvas draws extra scenes into (scissored to their on-screen rect). */
export const viewTargets: { campus: HTMLElement | null } = { campus: null }
