// With reduced motion the canvas only draws when something changed. Anything that changes
// what's on screen (scroll, resize, hover) calls markDirty().
let dirty = true

export function markDirty() {
  dirty = true
}

export function consumeDirty() {
  const was = dirty
  dirty = false
  return was
}
