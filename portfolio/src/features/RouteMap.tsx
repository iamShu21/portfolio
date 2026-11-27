import { useEffect, useRef } from 'react'
import campus from '../data/campus.json'
import { useReducedMotion } from '../motion'

type Pt = number[]
const svgPath = (pts: Pt[]) => 'M' + pts.map((p) => p.join(' ')).join(' L')

const CHEVRONS = 9
const LOOP_S = 9 // seconds for one chevron to walk the featured route

/** Ends of every walk (doors and junctions), merged when closer than a few pixels. */
function placePoints(): Pt[] {
  const out: Pt[] = []
  for (const w of campus.walks) {
    for (const p of [w[0], w[w.length - 1]]) {
      if (!out.some((o) => Math.hypot(o[0] - p[0], o[1] - p[1]) < 10)) out.push(p)
    }
  }
  return out
}

// Static data: computed once when the module loads.
const network = campus.walks.map(svgPath).join(' ')
const places = placePoints()

/**
 * The team's real route network, drawn from the walks recorded on campus, with gold chevrons
 * walking the featured route the way the AR arrows do in the app. SVG + SMIL: no canvas, no
 * library. The animation pauses off screen, and with reduced motion the chevrons stand still,
 * spread along the route.
 */
export default function RouteMap() {
  const svg = useRef<SVGSVGElement>(null)
  const reduced = useReducedMotion()
  const f = campus.featured
  const route = svgPath(f.pts)
  const start = f.pts[0]
  const end = f.pts[f.pts.length - 1]

  useEffect(() => {
    const el = svg.current
    if (!el) return
    if (reduced) {
      el.pauseAnimations()
      return
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? el.unpauseAnimations() : el.pauseAnimations()))
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  return (
    <figure data-xray="RouteMap · SVG + SMIL, 60 walks in one <path>, paused off screen" className="mt-8">
      <div className="overflow-hidden rounded-2xl border border-line bg-card [--grid:color-mix(in_oklab,var(--line)_60%,transparent)] bg-[linear-gradient(var(--grid)_1px,transparent_1px),linear-gradient(90deg,var(--grid)_1px,transparent_1px)] bg-[size:28px_28px]">
        <svg
          ref={svg}
          viewBox="15 15 1050 664"
          role="img"
          aria-label={`Map of the campus route network: ${campus.walks.length} walked routes as thin lines and ${places.length} doors and junctions as dots. The ${f.metres} metre walk from ${f.from} to the ${f.to} is highlighted in gold, with arrows moving along it.`}
          className="block h-auto w-full"
        >
          <path d={network} fill="none" stroke="var(--muted)" strokeOpacity={0.45} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          {places.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={4} fill="var(--card)" stroke="var(--muted)" strokeWidth={1.6} />
          ))}

          {/* Featured route: a soft band, then the line the chevrons walk. */}
          <path d={route} fill="none" stroke="var(--gold)" strokeOpacity={0.18} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
          <path id="featured-route" d={route} fill="none" stroke="var(--gold)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          {Array.from({ length: CHEVRONS }, (_, i) => (
            <path key={i} d="M-7 -8 L4 0 L-7 8" fill="none" stroke="var(--gold)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
              <animateMotion dur={`${LOOP_S}s`} repeatCount="indefinite" rotate="auto" begin={`${(-i * LOOP_S) / CHEVRONS}s`}>
                <mpath href="#featured-route" />
              </animateMotion>
            </path>
          ))}

          {/* Start and destination. */}
          <circle cx={start[0]} cy={start[1]} r={8} fill="var(--card)" stroke="var(--gold)" strokeWidth={3} />
          <g transform={`translate(${end[0]} ${end[1]})`}>
            <path d="M0 0 C-9 -12 -14 -18 -14 -26 A14 14 0 1 1 14 -26 C14 -18 9 -12 0 0 Z" fill="var(--gold)" />
            <circle cy={-26} r={5} fill="var(--card)" />
          </g>
          <g className="font-mono" fontSize={26} fill="var(--fg)" stroke="var(--card)" strokeWidth={8} paintOrder="stroke" strokeLinejoin="round">
            <text x={start[0] - 18} y={start[1] + 40} textAnchor="end">
              {f.from}
            </text>
            <text x={end[0] - 24} y={end[1] - 52} textAnchor="end">
              {f.to}
            </text>
          </g>
        </svg>
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-muted">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-4 bg-muted/60" /> {campus.walks.length} walked routes
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-4 bg-gold" /> {f.from} → {f.to}, {f.metres} m
        </span>
      </figcaption>
    </figure>
  )
}
