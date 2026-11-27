// Window events shared between components that don't otherwise know about each other.

/** Event: open the CV dialog. */
export const OPEN_CV = 'cv:open'

/** Event: open the "Where to?" wayfinder (⌘K). */
export const OPEN_WAYFINDER = 'wayfinder:open'

/** Event: open the AR walk ("Walk to NDMU"). */
export const OPEN_AR = 'ar:open'

/** CustomEvent<{ id: string; label: string }>: walk to a section with the wayfinder's guide. */
export const WAYFINDER_GO = 'wayfinder:go'
