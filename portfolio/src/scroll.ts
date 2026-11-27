/** Freeze page scrolling, e.g. while a modal dialog is open. */
export function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}
