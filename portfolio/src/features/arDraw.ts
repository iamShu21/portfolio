/*
 * Draws the AR walk: gold chevrons lying on the floor, the way ExploreNDMU places them on a
 * walkway. A pinhole camera 1.4 m above the ground, tilted down by the phone's pitch, projects
 * points on the floor to the screen. The path starts straight ahead and bends towards the
 * target, so a turn reads as a curve on the ground, exactly like a route in the app.
 */

const GOLD = '#f5b301'
const CAM_H = 1.4 // metres, phone held at chest height
const PATH_LEN = 16 // metres of path drawn ahead
const TURN_LEN = 3.5 // metres over which the path bends to face the target
const STEP = 0.05
const SPACING = 1 // metres between chevrons
const SPEED = 0.8 // metres per second the chevrons flow forward

export type Scene = {
  /** Target direction relative to where the phone faces, degrees, + = right. */
  phi: number
  /** How far the camera looks down, degrees (0 = level, 90 = straight at the floor). */
  lookDown: number
  /** Seconds, for the flow animation (pass 0 to hold still). */
  t: number
  arrived: boolean
  /** No camera feed: draw a floor grid so the arrows have something to lie on. */
  grid: boolean
}

type Pt = { x: number; y: number; z: number }

export function drawScene(ctx: CanvasRenderingContext2D, w: number, h: number, s: Scene) {
  ctx.clearRect(0, 0, w, h)
  const p = (Math.min(80, Math.max(6, s.lookDown)) * Math.PI) / 180
  const sinp = Math.sin(p)
  const cosp = Math.cos(p)
  const F = Math.max(w, h) * 0.85 // focal length in px (~60° field of view on a phone)
  const cx = w / 2
  const cy = h / 2

  /** World point (x right, y up from the floor, d ahead) to screen; null if behind or too close. */
  const project = (x: number, y: number, d: number): Pt | null => {
    const Y = y - CAM_H
    const z = -Y * sinp + d * cosp
    if (z < 0.25) return null
    const yc = Y * cosp + d * sinp
    return { x: cx + (F * x) / z, y: cy - (F * yc) / z, z }
  }

  if (s.grid) drawFloor(ctx, w, h, project, cy - F * Math.tan(p))
  if (s.arrived) return drawPin(ctx, project)

  // The path on the floor: x/d positions and heading psi, every STEP metres.
  const phi = (s.phi * Math.PI) / 180
  const path: { x: number; d: number; psi: number }[] = []
  let x = 0
  let d = 0.6
  for (let a = 0; a <= PATH_LEN; a += STEP) {
    const k = Math.min(1, a / TURN_LEN)
    const psi = phi * k * k * (3 - 2 * k)
    path.push({ x, d, psi })
    x += Math.sin(psi) * STEP
    d += Math.cos(psi) * STEP
  }

  // A faint guide line along the middle of the path.
  ctx.save()
  ctx.strokeStyle = GOLD
  ctx.globalAlpha = 0.35
  ctx.lineWidth = 2
  ctx.beginPath()
  let pen = false
  for (const q of path) {
    const pt = project(q.x, 0, q.d)
    if (!pt) {
      pen = false
      continue
    }
    if (pen) ctx.lineTo(pt.x, pt.y)
    else ctx.moveTo(pt.x, pt.y)
    pen = true
  }
  ctx.stroke()
  ctx.restore()

  // Chevrons, far ones first so near ones draw on top.
  const offset = (s.t * SPEED) % SPACING
  const marks: number[] = []
  for (let a = offset + 0.3; a < PATH_LEN; a += SPACING) marks.push(a)
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const a of marks.reverse()) {
    const q = path[Math.round(a / STEP)]
    if (!q) continue
    const fx = Math.sin(q.psi)
    const fd = Math.cos(q.psi)
    const rx = Math.cos(q.psi)
    const rd = -Math.sin(q.psi)
    const tip = project(q.x + fx * 0.22, 0, q.d + fd * 0.22)
    const l = project(q.x - fx * 0.18 - rx * 0.32, 0, q.d - fd * 0.18 - rd * 0.32)
    const r = project(q.x - fx * 0.18 + rx * 0.32, 0, q.d - fd * 0.18 + rd * 0.32)
    if (!tip || !l || !r) continue
    const fadeIn = Math.min(1, (a - 0.3) / 0.7)
    const fadeOut = Math.max(0, 1 - a / PATH_LEN)
    const lw = Math.max(2, Math.min(40, (F * 0.085) / tip.z))
    ctx.globalAlpha = fadeIn * fadeOut
    ctx.beginPath()
    ctx.moveTo(l.x, l.y)
    ctx.lineTo(tip.x, tip.y)
    ctx.lineTo(r.x, r.y)
    ctx.strokeStyle = 'rgba(0,0,0,0.35)' // a soft edge so gold reads on bright floors
    ctx.lineWidth = lw * 1.5
    ctx.stroke()
    ctx.strokeStyle = GOLD
    ctx.lineWidth = lw
    ctx.stroke()
  }
  ctx.restore()
}

function drawFloor(ctx: CanvasRenderingContext2D, w: number, h: number, project: (x: number, y: number, d: number) => Pt | null, horizon: number) {
  const g = ctx.createLinearGradient(0, Math.max(0, horizon), 0, h)
  g.addColorStop(0, '#0b0b10')
  g.addColorStop(1, '#1b1b25')
  ctx.fillStyle = '#07070b'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = g
  ctx.fillRect(0, Math.max(0, horizon), w, h)
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  const line = (a: Pt | null, b: Pt | null) => {
    if (!a || !b) return
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }
  for (let x = -10; x <= 10; x++) line(project(x, 0, 0.8), project(x, 0, 60))
  for (let d = 1; d <= 40; d++) line(project(-10, 0, d), project(10, 0, d))
  ctx.restore()
}

/** "You have arrived": a gold pin standing on the floor a few metres ahead. */
function drawPin(ctx: CanvasRenderingContext2D, project: (x: number, y: number, d: number) => Pt | null) {
  // Close and knee-high, so it stands mid-screen at a natural phone tilt, clear of the prompt.
  const base = project(0, 0, 2.6)
  const top = project(0, 0.9, 2.6)
  if (!base || !top) return
  const H = base.y - top.y
  const r = H * 0.3
  const headY = top.y + r
  ctx.save()
  // A ring on the floor.
  ctx.strokeStyle = 'rgba(245,179,1,0.6)'
  ctx.lineWidth = Math.max(2, H * 0.03)
  ctx.beginPath()
  ctx.ellipse(base.x, base.y, r * 1.6, r * 0.45, 0, 0, Math.PI * 2)
  ctx.stroke()
  // The pin.
  ctx.fillStyle = GOLD
  ctx.beginPath()
  ctx.moveTo(base.x, base.y)
  ctx.bezierCurveTo(base.x - r * 0.6, base.y - H * 0.35, base.x - r, headY + r * 0.6, base.x - r, headY)
  ctx.arc(base.x, headY, r, Math.PI, 0)
  ctx.bezierCurveTo(base.x + r, headY + r * 0.6, base.x + r * 0.6, base.y - H * 0.35, base.x, base.y)
  ctx.fill()
  ctx.fillStyle = '#0b0b10'
  ctx.beginPath()
  ctx.arc(base.x, headY, r * 0.38, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}
