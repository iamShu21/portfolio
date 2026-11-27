import { useEffect, useRef, useState } from 'react'
import { explorendmu as e, type Shot } from './content'
import { Reveal, Section, TextLink } from './ui'
import { lockScroll } from './scroll'
import { useReducedMotion } from './motion'
import RouteMap from './features/RouteMap'
import { OPEN_AR } from './events'
import { button } from './lib/styles'
import { cn } from './lib/utils'

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
      className="m-auto max-h-[94svh] max-w-[min(94vw,60rem)] bg-transparent p-0 text-fg backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {shot && (
        <figure className="relative rounded-2xl border border-line bg-card p-3">
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
            className="mx-auto block h-auto max-h-[78svh] w-auto max-w-full rounded-xl bg-black"
          />
          <figcaption className="flex items-start justify-between gap-4 px-1 pt-3">
            <div>
              <h3 id="clip-title" className="font-medium">
                {shot.title}
              </h3>
              <p className="text-sm text-muted">{shot.caption}</p>
            </div>
            <button
              ref={closeBtn}
              type="button"
              onClick={() => ref.current?.close()}
              className="shrink-0 rounded-full border border-line px-4 py-2 font-mono text-xs transition hover:border-accent hover:text-accent"
            >
              close
            </button>
          </figcaption>
        </figure>
      )}
    </dialog>
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
    <div id="screens" className="mt-12 scroll-mt-20" data-xray="Gallery · CSS scroll-snap, clips load only when opened">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h3 className="font-medium">
          Screens from the app
          <span className="mt-0.5 block font-mono text-xs font-normal text-muted">tap one to play the clip</span>
        </h3>
        <div className="flex gap-1.5">
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => step(d)}
              aria-label={d < 0 ? 'Scroll screenshots left' : 'Scroll screenshots right'}
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-card font-mono text-sm transition hover:border-gold hover:text-gold"
            >
              {d < 0 ? '←' : '→'}
            </button>
          ))}
        </div>
      </div>

      <ul
        ref={track}
        aria-label="ExploreNDMU screenshots"
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-3 [scrollbar-color:var(--line)_transparent] [scrollbar-width:thin] sm:-mx-6 sm:scroll-px-6 sm:px-6"
      >
        {e.shots.map((s) => (
          <li key={s.file} className="shrink-0 snap-start" style={{ width: `min(${s.w > s.h ? 82 : 52}vw, ${(s.w / s.h) * 20}rem)` }}>
            <button type="button" onClick={() => setOpen(s)} className="group block w-full text-left">
              <span className="relative block overflow-hidden rounded-xl border border-line bg-card transition group-hover:border-gold/70">
                <img
                  src={`${MEDIA}${s.file}.webp`}
                  width={s.w}
                  height={s.h}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full transition duration-500 motion-safe:group-hover:scale-[1.03]"
                />
                <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2.5 py-1 font-mono text-[0.7rem] text-[#f5b301]">▶ play</span>
              </span>
              <span className="mt-2 block text-sm font-medium">{s.title}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted">{s.caption}</span>
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
    <Section id="explorendmu" n="03" title="case study" xray="ExploreNDMU · copy and numbers from content.ts">
      <Reveal>
        <p className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Explore<span className="text-gold">NDMU</span>
        </p>
        <p className="mt-4 text-lg leading-relaxed text-pretty">{e.lead}</p>
      </Reveal>

      <Reveal className="mt-6 rounded-2xl border border-line bg-card p-5">
        <p className="font-mono text-xs text-muted">my role</p>
        <p className="mt-1 font-medium">{e.role}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{e.team}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
          {e.links.map((l) => (
            <TextLink key={l.label} href={l.href}>
              {l.label}
            </TextLink>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
          {e.stats.map((s) => (
            <div key={s.k} className="flex flex-col-reverse gap-0.5 bg-card p-4">
              <dt className="text-xs text-muted">{s.k}</dt>
              <dd className="font-mono text-3xl font-medium text-gold">{s.n}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/50 bg-card p-5">
        <div className="max-w-md">
          <p className="font-mono text-xs text-gold">try it yourself</p>
          <p className="mt-1 font-medium">The arrows, in your browser</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Gold arrows on your own floor that point to the real campus from wherever you are, with the app’s voice calling the turns. Best on a phone.
          </p>
        </div>
        <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_AR))}
            className={cn(button.base, 'border border-gold/60 text-gold hover:bg-gold hover:text-bg shrink-0')}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5">
              <path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            open AR
          </button>
      </Reveal>

      <Gallery />

      <div className="mt-12">
        <h3 className="font-medium">What it does</h3>
        <ul className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {e.features.map((f, i) => (
            <Reveal as="li" key={f.title} className="flex gap-3">
                <span aria-hidden className="font-mono text-xs leading-6 text-gold">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="font-medium">{f.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">{f.body}</p>
                </div>
            </Reveal>
          ))}
        </ul>
      </div>

      <div id="how-it-works" className="mt-12 scroll-mt-20">
        <h3 className="font-medium">How it works</h3>
        <p className="mt-1 leading-relaxed text-muted">
          The hard work happens before the app is installed. Routes are built once from real walks, and the phone only follows them, so a walk never needs the internet.
        </p>
        <RouteMap />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {e.how.map((lane) => (
            <Reveal key={lane.title} className="rounded-2xl border border-line bg-card p-5">
              <h4 className="font-mono text-xs text-gold">{lane.title.toLowerCase()}</h4>
              <ol className="mt-3 space-y-4">
                {lane.steps.map((s, i) => (
                  <li key={s.t} className="grid grid-cols-[1.5rem_1fr] gap-3">
                    <span aria-hidden className="grid h-6 w-6 place-items-center rounded-full bg-gold font-mono text-xs text-bg">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{s.t}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          ))}
        </div>
        <ul className="mt-6 grid gap-5 sm:grid-cols-3">
          {e.notes.map((n) => (
            <Reveal as="li" key={n.t} className="border-t border-gold pt-3">
                <p className="text-sm font-medium">{n.t}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{n.d}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  )
}
