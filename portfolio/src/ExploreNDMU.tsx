import { useEffect, useRef, useState } from 'react'
import { explorendmu as e, type Shot } from './content'
import { SectionLabel, TextLink } from './ui'
import { lockScroll } from './scroll'
import { useReducedMotion } from './motion'
import { viewTargets } from './events'
import { hasWebGL } from './webgl'
import campus from './three/campus.json'

const MEDIA = `${import.meta.env.BASE_URL}projects/explorendmu/`

/** Plays one gallery clip in a native modal <dialog> (focus trap, Esc to close for free). */
function ClipDialog({ shot, onClose }: { shot: Shot | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const d = ref.current
    if (!d || !shot) return
    d.showModal()
    closeBtn.current?.focus() // showModal would otherwise focus the video controls
    lockScroll(true)
    return () => {
      lockScroll(false)
      if (d.open) d.close()
    }
  }, [shot])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // A click that lands on the <dialog> itself (not its content) is a click on the backdrop.
      onClick={(ev) => ev.target === ref.current && ref.current.close()}
      aria-labelledby="clip-title"
      className="m-auto max-h-[94svh] max-w-[min(94vw,60rem)] bg-transparent p-0 text-[#e8e8f2] backdrop:bg-black/80"
    >
      {shot && (
        <figure className="relative rounded-3xl border border-line bg-panel p-3 md:p-4">
          <video
            key={shot.file}
            src={`${MEDIA}${shot.file}.mp4`}
            poster={`${MEDIA}${shot.file}.webp`}
            width={shot.w}
            height={shot.h}
            aria-label={shot.alt}
            autoPlay={!reduced}
            muted
            loop
            playsInline
            controls
            preload="metadata"
            className="mx-auto block h-auto max-h-[78svh] w-auto max-w-full rounded-2xl bg-black"
          />
          <figcaption className="flex items-start justify-between gap-4 px-1 pt-3">
            <div>
              <h3 id="clip-title" className="font-bold">
                {shot.title}
              </h3>
              <p className="text-sm text-white/70">{shot.caption}</p>
            </div>
            <button
              ref={closeBtn}
              type="button"
              onClick={() => ref.current?.close()}
              className="shrink-0 rounded-full border border-white/20 px-4 py-2 font-mono text-xs hover:border-neon hover:text-neon"
            >
              Close
            </button>
          </figcaption>
        </figure>
      )}
    </dialog>
  )
}

const svgPath = (pts: number[][]) => 'M' + pts.map((p) => p.join(' ')).join(' L')

/**
 * Placeholder for the 3D campus map: the shared canvas draws into this element's rect
 * (see three/Campus.tsx). Without WebGL it shows the same routes as a flat SVG.
 */
function CampusMap() {
  const ref = useRef<HTMLDivElement>(null)
  const [webgl] = useState(hasWebGL)

  useEffect(() => {
    if (!webgl) return
    viewTargets.campus = ref.current
    return () => {
      viewTargets.campus = null
    }
  }, [webgl])

  return (
    <figure className="mt-8">
      <div
        ref={ref}
        role="img"
        aria-label={`Map of the campus route network: ${campus.walks.length} walked routes as thin lines, with the ${campus.featured.metres} metre walk from ${campus.featured.from} to the ${campus.featured.to} highlighted in gold and arrows moving along it.`}
        // Small radius on purpose: the WebGL scissor rect underneath is square-cornered.
        className="relative aspect-square w-full overflow-hidden rounded-md border border-line sm:aspect-[16/10] lg:aspect-[21/9]"
      >
        {!webgl && (
          <svg viewBox={`0 0 ${campus.width} ${campus.height}`} className="absolute inset-0 h-full w-full bg-panel p-6" aria-hidden>
            {campus.walks.map((w, i) => (
              <path key={i} d={svgPath(w)} fill="none" stroke="var(--color-neon)" strokeOpacity={0.4} strokeWidth={2} />
            ))}
            <path d={svgPath(campus.featured.pts)} fill="none" stroke="var(--color-gold)" strokeWidth={6} strokeLinecap="round" strokeDasharray="14 12" />
          </svg>
        )}
        <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1 font-mono text-xs md:left-6 md:top-6">
          <span className="text-neon">— {campus.walks.length} walked routes</span>
          <span className="text-gold">
            — {campus.featured.from} → {campus.featured.to}, {campus.featured.metres} m
          </span>
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-white/65">
        The team’s real route network in 3D, from the walks recorded on campus. Gold arrows follow the {campus.featured.metres} m walk from {campus.featured.from} to the {campus.featured.to}, the way they do in the app.
      </figcaption>
    </figure>
  )
}

function Gallery() {
  const track = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState<Shot | null>(null)
  const reduced = useReducedMotion()

  const step = (dir: 1 | -1) => {
    const t = track.current
    if (t) t.scrollBy({ left: dir * t.clientWidth * 0.8, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <div className="mt-20">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h3 data-reveal className="text-2xl font-bold md:text-3xl">
          Screens from the app
          <span className="mt-1 block font-mono text-xs font-normal tracking-widest text-white/60">TAP ONE TO PLAY THE CLIP</span>
        </h3>
        <div className="flex gap-2">
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => step(d)}
              aria-label={d < 0 ? 'Scroll screenshots left' : 'Scroll screenshots right'}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/20 font-mono transition hover:border-gold hover:text-gold"
            >
              {d < 0 ? '←' : '→'}
            </button>
          ))}
        </div>
      </div>

      <ul
        ref={track}
        aria-label="ExploreNDMU screenshots"
        className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-4 [scrollbar-color:var(--color-line)_transparent] [scrollbar-width:thin] md:-mx-12 md:scroll-px-12 md:gap-6 md:px-12"
      >
        {e.shots.map((s) => (
          <li key={s.file} className="shrink-0 snap-start" style={{ width: `min(${s.w > s.h ? 82 : 58}vw, ${(s.w / s.h) * 26}rem)` }}>
            <button type="button" data-hover onClick={() => setOpen(s)} className="group block w-full text-left">
              <span className="relative block overflow-hidden rounded-[1.4rem] border border-line bg-panel transition group-hover:border-gold/70">
                <img
                  src={`${MEDIA}${s.file}.webp`}
                  width={s.w}
                  height={s.h}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full transition duration-500 motion-safe:group-hover:scale-[1.03]"
                />
                <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1.5 font-mono text-xs text-gold">▶ play</span>
              </span>
              <span className="mt-3 block font-bold">{s.title}</span>
              <span className="mt-1 block text-sm text-white/65">{s.caption}</span>
            </button>
          </li>
        ))}
      </ul>

      <ClipDialog shot={open} onClose={() => setOpen(null)} />
    </div>
  )
}

export default function ExploreNDMU() {
  return (
    <section id="explorendmu" data-core="right" aria-labelledby="explorendmu-title" className="px-6 py-32 md:px-12">
      <SectionLabel n="03">Case study</SectionLabel>

      {/* Intro */}
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <h2 id="explorendmu-title" data-reveal className="text-5xl font-bold leading-none tracking-tight sm:text-6xl md:text-8xl">
            Explore<span className="text-gold">NDMU</span>
          </h2>
          <p data-reveal className="mt-6 max-w-2xl text-lg text-white/75 md:text-xl">
            {e.lead}
          </p>
        </div>
        <div data-reveal className="rounded-3xl border border-line bg-panel/90 p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-white/60">My role</p>
          <p className="mt-1 text-lg font-bold">{e.role}</p>
          <p className="mt-3 text-sm text-white/70">{e.team}</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            {e.links.map((l) => (
              <TextLink key={l.label} href={l.href}>
                {l.label}
              </TextLink>
            ))}
          </div>
        </div>
      </div>

      {/* Numbers */}
      <dl data-reveal className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-4">
        {e.stats.map((s) => (
          <div key={s.k} className="flex flex-col-reverse gap-1 bg-ink/95 p-6 md:p-8">
            <dt className="text-sm text-white/70">{s.k}</dt>
            <dd className="font-mono text-5xl font-bold text-gold md:text-6xl">{s.n}</dd>
          </div>
        ))}
      </dl>

      <Gallery />

      {/* Features */}
      <div className="mt-24">
        <h3 data-reveal className="text-2xl font-bold md:text-3xl">
          What it does
        </h3>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {e.features.map((f, i) => (
            <li key={f.title} data-reveal className="rounded-3xl border border-line bg-panel/90 p-6 transition-colors hover:border-gold/60">
              <span className="font-mono text-xs text-gold">{String(i + 1).padStart(2, '0')}</span>
              <h4 className="mt-3 text-lg font-bold">{f.title}</h4>
              <p className="mt-2 text-white/70">{f.body}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* How it works (the core steps aside: the campus map is the 3D here) */}
      <div className="mt-24" data-core="away">
        <h3 data-reveal className="text-2xl font-bold md:text-3xl">
          How it works
        </h3>
        <p data-reveal className="mt-3 max-w-2xl text-white/70">
          The hard work happens before the app is installed. Routes are built once from real walks, and the phone only follows them, so a walk never needs the internet.
        </p>
        <CampusMap />
        <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-6">
          {e.how.map((lane) => (
            <section key={lane.title} data-reveal aria-label={lane.title} className="rounded-3xl border border-line bg-panel/90 p-6 md:p-8">
              <h4 className="font-mono text-sm uppercase tracking-widest text-gold">{lane.title}</h4>
              <ol className="mt-4">
                {lane.steps.map((s, i) => (
                  <li key={s.t} className="grid grid-cols-[2rem_1fr] gap-4 border-t border-line py-4">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-gold font-mono text-sm font-bold text-black" aria-hidden>
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold">{s.t}</p>
                      <p className="mt-1 text-white/70">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {e.notes.map((n) => (
            <li key={n.t} data-reveal className="border-t-2 border-gold pt-4">
              <p className="font-bold">{n.t}</p>
              <p className="mt-1 text-white/70">{n.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
