import { useEffect, useRef, useState } from 'react'
import { ar } from '../content'
import { OPEN_AR } from '../events'
import { lockScroll } from '../scroll'
import { prefersReducedMotion } from '../motion'
import { bearingDeg, compassPoint, distanceKm, easeAngle, formatDistance, norm180 } from '../lib/geo'
import { drawScene } from './arDraw'
import { cn } from '../lib/utils'

/*
 * "Walk to NDMU": ExploreNDMU's gold AR arrows in the visitor's own browser. On a phone the
 * rear camera shows the floor, the compass and tilt sensors place chevrons on it, and they
 * bend towards the real campus in Koronadal from wherever the visitor stands, with the app's
 * spoken "turn left / turn right". Without sensors (a laptop) the same scene sits on a floor
 * grid and you turn by dragging or with the arrow keys. Camera, compass and location stay on
 * the device: nothing here makes a network request.
 */

type Sensor = 'pending' | 'ok' | 'denied' | 'unavailable'
type Source = 'compass' | 'absolute' | 'relative' | 'drag'
type Fix = { lat: number; lon: number }
type IOSOrientationEvent = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> }
type OrientationReading = DeviceOrientationEvent & { webkitCompassHeading?: number }

const DRAG_START_OFFSET = 50 // laptop: start turned away, so the first thing you see is a curve

function instructionFor(phi: number | null, arrived: boolean) {
  if (arrived) return 'You have arrived'
  if (phi === null) return 'Follow the arrows'
  const a = Math.abs(phi)
  if (a < 20) return 'Straight ahead'
  if (a > 150) return 'Turn around'
  return phi > 0 ? 'Turn right' : 'Turn left'
}

function say(text: string) {
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  speechSynthesis.speak(u)
}

export default function ArWalk() {
  const dialog = useRef<HTMLDialogElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const cleanups = useRef<(() => void)[]>([])
  const lastSpoken = useRef({ text: '', at: 0 })
  // Live sensor values, read by the render loop every frame without re-rendering React.
  const live = useRef({ heading: 0, pitch: 60, source: null as Source | null, bearing: null as number | null, arrived: false, dragged: false })

  const [open, setOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [touch, setTouch] = useState(false)
  const [cam, setCam] = useState<Sensor>('pending')
  const [loc, setLoc] = useState<Sensor>('pending')
  const [fix, setFix] = useState<Fix | null>(null)
  const [mode, setMode] = useState<'sensors' | 'drag' | null>(null)
  const [hud, setHud] = useState({ instruction: 'Follow the arrows', phi: 0 })
  const [voice, setVoice] = useState(true)

  useEffect(() => {
    const onOpen = () => {
      setTouch(window.matchMedia('(pointer: coarse)').matches)
      setOpen(true)
    }
    window.addEventListener(OPEN_AR, onOpen)
    return () => window.removeEventListener(OPEN_AR, onOpen)
  }, [])

  // Open/close: the modal, the scroll lock, and a full teardown of sensors on close.
  useEffect(() => {
    const d = dialog.current
    if (!d || !open) return
    d.showModal()
    lockScroll(true)
    const L = live.current
    return () => {
      cleanups.current.forEach((fn) => fn())
      cleanups.current = []
      if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
      Object.assign(L, { source: null, bearing: null, arrived: false, dragged: false })
      setRunning(false)
      setCam('pending')
      setLoc('pending')
      setFix(null)
      setMode(null)
      lockScroll(false)
      if (d.open) d.close()
    }
  }, [open])

  // Where the target is from here, and whether we're already there.
  useEffect(() => {
    if (!fix) return
    const L = live.current
    const first = L.bearing === null
    L.bearing = bearingDeg(fix, ar.target)
    L.arrived = distanceKm(fix, ar.target) < ar.arriveKm
    if (first && L.source === 'drag' && !L.dragged) L.heading = (L.bearing - DRAG_START_OFFSET + 360) % 360
  }, [fix])

  useEffect(() => {
    if (cam === 'ok' && video.current && stream.current) {
      video.current.srcObject = stream.current
      void video.current.play().catch(() => {})
    }
  }, [cam])

  /** Everything that needs permission starts here, inside the tap (iOS insists). */
  const start = () => {
    const L = live.current
    const Orientation = (typeof DeviceOrientationEvent !== 'undefined' ? DeviceOrientationEvent : undefined) as IOSOrientationEvent | undefined
    const permission = Orientation?.requestPermission ? Orientation.requestPermission().catch(() => 'denied' as const) : Promise.resolve('granted' as const)
    if (voice) say('Follow the arrows') // also unlocks speech on iOS
    lastSpoken.current = { text: 'Follow the arrows', at: performance.now() }
    setRunning(true)

    void permission.then((p) => {
      if (p !== 'granted') return
      const onOrient = (ev: Event) => {
        const e = ev as OrientationReading
        const angle = screen.orientation?.angle ?? 0
        let heading: number | null = null
        let src: Source | null = null
        if (typeof e.webkitCompassHeading === 'number') {
          heading = e.webkitCompassHeading
          src = 'compass'
        } else if (e.alpha !== null && (e.absolute || ev.type === 'deviceorientationabsolute')) {
          heading = 360 - e.alpha
          src = 'absolute'
        } else if (e.alpha !== null && L.source !== 'compass' && L.source !== 'absolute') {
          heading = 360 - e.alpha
          src = 'relative'
        }
        if (heading !== null && src) {
          heading = (heading + angle) % 360
          const wasDrag = L.source === 'drag' || L.source === null
          L.heading = wasDrag ? heading : easeAngle(L.heading, heading, 0.25)
          L.source = src
          if (wasDrag) setMode('sensors')
        }
        if (e.beta !== null) {
          // Pitch: 90 = phone upright. In landscape the tilt lives in gamma.
          const tilt = angle % 180 === 0 ? e.beta : Math.abs(e.gamma ?? 90)
          L.pitch += (tilt - L.pitch) * 0.25
        }
      }
      window.addEventListener('deviceorientationabsolute', onOrient)
      window.addEventListener('deviceorientation', onOrient)
      cleanups.current.push(() => {
        window.removeEventListener('deviceorientationabsolute', onOrient)
        window.removeEventListener('deviceorientation', onOrient)
      })
    })

    // No compass after a moment (a laptop): turn by dragging instead.
    const t = setTimeout(() => {
      if (L.source) return
      L.source = 'drag'
      L.pitch = 58
      L.heading = ((L.bearing ?? 0) - DRAG_START_OFFSET + 360) % 360
      setMode('drag')
    }, 1200)
    cleanups.current.push(() => clearTimeout(t))

    if ('geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          setFix({ lat: pos.coords.latitude, lon: pos.coords.longitude })
          setLoc('ok')
        },
        (err) => setLoc(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable'),
        { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
      )
      cleanups.current.push(() => navigator.geolocation.clearWatch(id))
    } else setLoc('unavailable')

    // The camera only on touch devices: on a laptop it would film you, not the floor.
    if (touch && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
        .then((s) => {
          stream.current = s
          setCam('ok')
        })
        .catch((e: unknown) => setCam(e instanceof DOMException && e.name === 'NotAllowedError' ? 'denied' : 'unavailable'))
      cleanups.current.push(() => {
        stream.current?.getTracks().forEach((tr) => tr.stop())
        stream.current = null
      })
    } else setCam('unavailable')
  }

  // The render loop.
  useEffect(() => {
    const c = canvas.current
    const ctx = c?.getContext('2d')
    if (!running || !c || !ctx) return
    const reduced = prefersReducedMotion()
    const t0 = performance.now()
    let raf = 0
    let lastKey = ''
    const frame = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = c.clientWidth
      const h = c.clientHeight
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
        c.width = Math.round(w * dpr)
        c.height = Math.round(h * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const L = live.current
      const phi = L.bearing === null ? 0 : norm180(L.bearing - L.heading)
      drawScene(ctx, w, h, { phi, lookDown: 90 - L.pitch, t: reduced ? 0 : (now - t0) / 1000, arrived: L.arrived, grid: cam !== 'ok' })
      const instruction = instructionFor(L.bearing === null ? null : phi, L.arrived)
      const key = `${instruction}|${Math.round(phi / 4)}`
      if (key !== lastKey) {
        lastKey = key
        setHud({ instruction, phi })
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [running, cam])

  // The app's voice: speak an instruction once it has held for a moment.
  useEffect(() => {
    if (!running || !voice) return
    const text = hud.instruction
    const id = setTimeout(() => {
      const last = lastSpoken.current
      if (text === last.text || performance.now() - last.at < 2000) return
      say(text)
      lastSpoken.current = { text, at: performance.now() }
    }, 700)
    return () => clearTimeout(id)
  }, [hud.instruction, voice, running])

  // Laptop turning: drag, or the arrow keys.
  const turn = (deg: number) => {
    const L = live.current
    if (L.source !== 'drag') return
    L.dragged = true
    L.heading = (L.heading + deg + 360) % 360
  }
  const drag = useRef<number | null>(null)

  const km = fix ? distanceKm(fix, ar.target) : null
  const bearing = fix ? bearingDeg(fix, ar.target) : null
  const arrived = km !== null && km < ar.arriveKm
  const detail = arrived
    ? `You're at ${ar.target.name}`
    : loc === 'ok' && km !== null && bearing !== null
      ? `about ${formatDistance(km)} to ${ar.target.short} · ${compassPoint(bearing)}`
      : loc === 'pending'
        ? 'Finding where you are…'
        : `Location is off, so the arrows can't find ${ar.target.short}`

  return (
    <dialog
      ref={dialog}
      onClose={() => setOpen(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault()
          turn(e.key === 'ArrowLeft' ? -10 : 10)
        }
      }}
      aria-label={`Walk to ${ar.target.short} in AR`}
      data-xray="ArWalk · camera + compass + GPS, canvas projection, Web Speech; nothing leaves the device"
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-hidden bg-[#07070b] p-0 text-[#ececf1] backdrop:bg-black"
    >
      {open && !running && (
        <div className="grid h-full place-items-center p-6">
          <div className="max-w-sm text-center">
            <svg aria-hidden viewBox="0 0 24 24" className="mx-auto h-10 w-10 text-[#f5b301]">
              <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" fill="currentColor" />
              <circle cx="12" cy="9.5" r="2.5" fill="#07070b" />
            </svg>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Walk to {ar.target.short}</h2>
            <p className="mt-3 leading-relaxed text-[#c9c9d1]">
              These are the gold arrows from ExploreNDMU. They’ll lie on your floor and point to the real campus in Koronadal, wherever you are in the world.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#a3a3ad]">
              {touch
                ? 'Uses your camera, compass and location. Nothing leaves your phone.'
                : 'On a phone they sit on your floor through the camera. Here, drag or use ← → to turn. Uses your location, which never leaves this browser.'}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                autoFocus
                onClick={start}
                className="rounded-full bg-[#f5b301] px-6 py-2.5 font-mono text-sm text-[#0b0b10] transition hover:bg-[#ffd24d]"
              >
                start walking
              </button>
              <button type="button" onClick={() => dialog.current?.close()} className="rounded-full border border-white/20 px-5 py-2.5 font-mono text-sm transition hover:border-white/50">
                not now
              </button>
            </div>
            <p className="mt-6 font-mono text-xs text-[#8a8a94]">On campus? It will tell you when you’ve arrived.</p>
          </div>
        </div>
      )}

      {open && running && (
        <div className="relative h-full w-full">
          {cam === 'ok' && <video ref={video} muted playsInline autoPlay aria-hidden className="absolute inset-0 h-full w-full object-cover" />}
          <canvas
            ref={canvas}
            aria-hidden
            onPointerDown={(e) => {
              drag.current = e.clientX
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              if (drag.current === null) return
              turn((e.clientX - drag.current) * 0.35)
              drag.current = e.clientX
            }}
            onPointerUp={() => (drag.current = null)}
            className={cn('absolute inset-0 h-full w-full touch-none', mode === 'drag' && 'cursor-grab active:cursor-grabbing')}
          />

          {/* The prompt, like the one at the top of the app screen. */}
          <div className="absolute inset-x-0 top-0 flex justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <div className="flex items-center gap-3 rounded-2xl bg-[#0b0b10]/85 py-2.5 pl-2.5 pr-5 shadow-2xl backdrop-blur">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f5b301] text-[#0b0b10]">
                {arrived ? (
                  <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6">
                    <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 transition-transform duration-150" style={{ transform: `rotate(${loc === 'ok' ? hud.phi : 0}deg)` }}>
                    <path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span aria-live="polite">
                <span className="block font-medium">{loc === 'ok' ? hud.instruction : 'Follow the arrows'}</span>
                <span className="block font-mono text-xs text-[#c9c9d1]">{detail}</span>
              </span>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <p className="max-w-[60%] rounded-xl bg-[#0b0b10]/70 px-3 py-2 font-mono text-[0.7rem] leading-relaxed text-[#c9c9d1] backdrop-blur">
              {mode === 'drag'
                ? 'no compass here · drag or press ← → to turn'
                : mode === 'sensors'
                  ? `compass on · camera ${cam === 'ok' ? 'on' : cam === 'denied' ? 'blocked' : 'off'}`
                  : 'starting sensors…'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                aria-pressed={voice}
                onClick={() => {
                  if (voice && typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
                  setVoice(!voice)
                }}
                className="rounded-full bg-[#0b0b10]/80 px-4 py-2 font-mono text-xs backdrop-blur transition hover:bg-[#0b0b10] aria-pressed:text-[#f5b301]"
              >
                voice
              </button>
              <button type="button" onClick={() => dialog.current?.close()} className="rounded-full bg-[#ececf1] px-4 py-2 font-mono text-xs text-[#0b0b10] transition hover:bg-white">
                close
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}
