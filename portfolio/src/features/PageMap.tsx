import { useEffect, useRef, useState } from 'react'
import { WAYFINDER_GO } from '../events'
import { cn } from '../lib/utils'

/*
 * "You are here": the page drawn as a campus route in the left margin of wide screens. Sections
 * are places on the route, a gold walker follows your scroll position along it, and the path
 * you've covered turns gold. Clicking a place hands the trip to the wayfinder's guided walk.
 */

const PLACES = [
  { id: 'top', label: 'home' },
  { id: 'projects', label: 'projects' },
  { id: 'explorendmu', label: 'case study' },
  { id: 'journey', label: 'journey' },
  { id: 'stack', label: 'stack' },
  { id: 'contact', label: 'contact' },
]

// A meandering route through the places (x, y in the SVG's 70 × 330 box).
const PTS: [number, number][] = [
  [14, 12],
  [52, 72],
  [20, 136],
  [56, 200],
  [22, 262],
  [46, 320],
]

/** A smooth path through the points (Catmull-Rom turned into cubic Béziers). */
function smoothPath(p: [number, number][]) {
  let d = `M${p[0][0]} ${p[0][1]}`
  for (let i = 0; i < p.length - 1; i++) {
    const [x0, y0] = p[Math.max(0, i - 1)]
    const [x1, y1] = p[i]
    const [x2, y2] = p[i + 1]
    const [x3, y3] = p[Math.min(p.length - 1, i + 2)]
    d += ` C${x1 + (x2 - x0) / 6} ${y1 + (y2 - y0) / 6} ${x2 - (x3 - x1) / 6} ${y2 - (y3 - y1) / 6} ${x2} ${y2}`
  }
  return d
}
const ROUTE = smoothPath(PTS)

export default function PageMap() {
  const path = useRef<SVGPathElement>(null)
  const [walked, setWalked] = useState({ len: 0, total: 1, x: PTS[0][0], y: PTS[0][1], active: 0 })

  useEffect(() => {
    const p = path.current
    if (!p) return
    const total = p.getTotalLength()
    // Path length at each place: the sample nearest to it.
    const at = PTS.map(([px, py]) => {
      let best = 0
      let bestD = Infinity
      for (let l = 0; l <= total; l += total / 600) {
        const q = p.getPointAtLength(l)
        const d = (q.x - px) ** 2 + (q.y - py) ** 2
        if (d < bestD) {
          bestD = d
          best = l
        }
      }
      return best
    })

    let raf = 0
    const update = () => {
      raf = 0
      const mid = window.scrollY + window.innerHeight * 0.35
      const tops = PLACES.map(({ id }) => {
        const el = document.getElementById(id)
        return el ? el.getBoundingClientRect().top + window.scrollY : 0
      })
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      let i = 0
      while (i < tops.length - 1 && mid >= tops[i + 1]) i++
      const frac = i < tops.length - 1 ? Math.min(1, Math.max(0, (mid - tops[i]) / (tops[i + 1] - tops[i]))) : 0
      const len = atEnd ? total : at[i] + frac * ((at[i + 1] ?? at[i]) - at[i])
      const q = p.getPointAtLength(len)
      setWalked({ len, total, x: q.x, y: q.y, active: atEnd ? PLACES.length - 1 : frac > 0.6 && i < PLACES.length - 1 ? i + 1 : i })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <nav
      aria-label="Page map"
      data-xray="PageMap · scroll position → SVG path length; click to be walked there"
      className="fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 2xl:left-12 xl:block"
    >
      <div className="relative h-[332px] w-[170px]">
        <svg viewBox="0 0 70 332" width={70} height={332} aria-hidden className="absolute left-0 top-0 overflow-visible">
          <path ref={path} d={ROUTE} fill="none" stroke="var(--line)" strokeWidth={2.5} strokeLinecap="round" />
          <path
            d={ROUTE}
            fill="none"
            stroke="var(--gold)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray={`${walked.len} ${walked.total}`}
          />
          <circle cx={walked.x} cy={walked.y} r={9} fill="var(--gold)" opacity={0.2} />
          <circle cx={walked.x} cy={walked.y} r={4.5} fill="var(--gold)" stroke="var(--bg)" strokeWidth={2} />
        </svg>
        <ul>
          {PLACES.map((pl, i) => {
            const [x, y] = PTS[i]
            const here = walked.active === i
            return (
              <li key={pl.id} className="absolute" style={{ left: x - 6, top: y - 12 }}>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent(WAYFINDER_GO, { detail: { id: pl.id, label: pl.label } }))}
                  aria-current={here ? 'location' : undefined}
                  className="group flex h-6 items-center gap-2 font-mono text-[0.7rem]"
                >
                  <span
                    aria-hidden
                    className={cn('h-3 w-3 rounded-full border-2 bg-bg transition', i <= walked.active ? 'border-gold' : 'border-line group-hover:border-muted')}
                  />
                  <span className={cn('transition', here ? 'text-fg' : 'text-muted group-hover:text-fg')}>
                    {here && <span className="sr-only">You are here: </span>}
                    {pl.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
