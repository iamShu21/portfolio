import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { MotionConfig, motion, useMotionValue, useSpring } from 'framer-motion'
import SceneFallback from './SceneFallback'
import { hasWebGL } from './webgl'
import Cursor from './Cursor'
import { emitScrollChange, gsap, scrollState, ScrollTrigger, useSmoothScroll, type CoreSpot } from './scroll'
import { useReducedMotion } from './motion'
import { explorendmu, facts, profile, projects, skills, stack, type Project } from './content'
import { BentoCard, BentoGrid, Chips } from './components/Bento'
import { SectionLabel, TextLink } from './ui'
import ExploreNDMU from './ExploreNDMU'
import Transition from './Transition'

const YEAR = new Date().getFullYear()

// Three.js + R3F + drei live in their own chunk, fetched once the page has painted.
const Scene = lazy(() => import('./Scene'))

/** Static glow first; the 3D scene loads when the browser is idle (never without WebGL). */
function Background() {
  const [load, setLoad] = useState(false)
  useEffect(() => {
    if (!hasWebGL()) return
    const start = () => setLoad(true)
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(start, { timeout: 1500 })
      return () => cancelIdleCallback(id)
    }
    const t = setTimeout(start, 300)
    return () => clearTimeout(t)
  }, [])
  return (
    <>
      <SceneFallback />
      {load && (
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      )}
    </>
  )
}

/* ---------- small pieces ---------- */

/** Words that slide up one by one. Screen readers get the plain sentence instead. */
function SplitWords({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.split(' ').map((w, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <span data-word className="inline-block will-change-transform">
              {w}&nbsp;
            </span>
          </span>
        ))}
      </span>
    </span>
  )
}

function Nav() {
  const links = ['about', 'work', 'stack', 'contact']
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 mix-blend-difference md:px-12">
      <a href="#top" className="font-mono text-sm font-bold">
        {'<'}dev{'/>'}
      </a>
      <nav className="flex gap-6 font-mono text-xs uppercase tracking-widest">
        {links.map((l) => (
          <a key={l} href={`#${l}`} className="transition hover:text-neon">
            {l}
          </a>
        ))}
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" data-core="hero" className="relative flex min-h-svh flex-col justify-end px-6 pb-28 pt-24 md:justify-center md:px-12 md:pb-0">
      <p data-hero className="mb-4 font-mono text-sm text-neon">
        {'>'} hello, world<span className="motion-safe:animate-pulse">_</span>
      </p>
      <h1 className="max-w-4xl text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl md:text-8xl">
        <SplitWords text={`I'm ${profile.name}.`} />
        <br />
        <SplitWords text={profile.role + '.'} className="text-white/40" />
      </h1>
      <p data-hero className="mt-8 max-w-xl text-lg text-white/70 md:text-xl">
        {profile.tagline}
      </p>
      <div data-hero className="mt-10 flex flex-wrap gap-4">
        <a href="#work" className="rounded-full bg-neon px-6 py-3 font-mono text-sm font-bold text-black transition hover:bg-pink hover:text-white">
          See my work
        </a>
        <a href="#contact" className="rounded-full border border-white/20 px-6 py-3 font-mono text-sm transition hover:border-neon hover:text-neon">
          Say hi
        </a>
      </div>
      <p className="absolute bottom-8 left-6 font-mono text-xs text-white/40 md:left-12">scroll ↓ · move your mouse · break stuff</p>
    </section>
  )
}

function About() {
  return (
    <section id="about" data-core="left" className="px-6 py-32 md:px-12">
      <div className="max-w-2xl rounded-3xl border border-line bg-panel/70 p-8 backdrop-blur-md md:ml-auto md:p-12">
        <SectionLabel n="01">About</SectionLabel>
        <p data-reveal className="text-2xl leading-snug md:text-3xl">
          {profile.bio}
        </p>
        <dl className="mt-10 grid grid-cols-2 gap-6">
          {facts.map((f) => (
            <div key={f.k} data-reveal>
              <dt className="font-mono text-xs uppercase tracking-widest text-white/40">{f.k}</dt>
              <dd className="mt-1 text-base">{f.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function ProjectCard({ p, i }: { p: Project; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  // Motion values update the transform directly, without re-rendering React on every mouse move.
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const rotateX = useSpring(rx, { stiffness: 200, damping: 20 })
  const rotateY = useSpring(ry, { stiffness: 200, damping: 20 })

  const onMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== 'mouse') return
    const r = ref.current!.getBoundingClientRect()
    rx.set(((e.clientY - r.top) / r.height - 0.5) * -10)
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 10)
  }
  const reset = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.div
      ref={ref}
      data-reveal
      data-hover
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ transformPerspective: 900, rotateX, rotateY }}
      className={`group relative overflow-hidden rounded-3xl border border-line bg-panel/80 p-8 backdrop-blur-md transition-colors hover:border-neon/60 md:p-10 ${
        p.featured ? 'md:col-span-2' : ''
      }`}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-neon/10 blur-3xl transition group-hover:bg-pink/20" />
      <div className="flex items-start justify-between">
        <p className="font-mono text-xs uppercase tracking-widest text-neon">{p.kind}</p>
        <span className="font-mono text-sm text-white/30">0{i + 1}</span>
      </div>
      <h3 className={`mt-6 font-bold tracking-tight ${p.featured ? 'text-5xl md:text-6xl' : 'text-3xl'}`}>{p.title}</h3>
      <p className="mt-4 max-w-2xl text-white/70">{p.blurb}</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {p.tags.map((t) => (
          <li key={t} className="rounded-full border border-white/15 px-3 py-1 font-mono text-xs text-white/70">
            {t}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex gap-5">
        {p.links.map((l) => (
          <TextLink key={l.label} href={l.href}>
            {l.label}
          </TextLink>
        ))}
      </div>
    </motion.div>
  )
}

function Work() {
  return (
    <section id="work" data-core="center" className="px-6 py-32 md:px-12">
      <SectionLabel n="02">Selected work</SectionLabel>
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((p, i) => (
          <ProjectCard key={p.title} p={p} i={i} />
        ))}
      </div>
    </section>
  )
}

function Skills() {
  const s = skills
  return (
    // Two bento rows, then the "learning" strip sized to its content.
    <BentoGrid className="mt-12 px-6 md:grid-rows-[repeat(2,minmax(14rem,auto))_auto] md:px-12">
      <BentoCard kicker="01" title={s.frontend.title} className="md:col-span-2">
        <p className="max-w-md text-white/70">{s.frontend.blurb}</p>
        <div className="mt-5 flex flex-1 flex-col justify-end gap-5 md:flex-row md:items-end md:justify-between">
          <Chips items={s.frontend.items} />
          <pre aria-hidden className="hidden rounded-2xl border border-line bg-ink/70 p-4 font-mono text-xs leading-relaxed text-neon/90 lg:block">
            {s.frontend.snippet.join('\n')}
          </pre>
        </div>
      </BentoCard>
      <BentoCard kicker="02" title={s.xr.title} accent="gold" className="md:row-span-2">
        <p className="text-white/70">{s.xr.blurb}</p>
        <div className="mt-5">
          <Chips items={s.xr.items} />
        </div>
        <dl className="mt-auto grid grid-cols-2 gap-4 pt-8">
          {[explorendmu.stats[0], explorendmu.stats[3]].map((st) => (
            <div key={st.k} className="flex flex-col-reverse">
              <dt className="text-sm text-white/70">{st.k}</dt>
              <dd className="font-mono text-4xl font-bold text-gold">{st.n}</dd>
            </div>
          ))}
        </dl>
        <div className="pt-6">
          <TextLink href={s.xr.link.href} className="decoration-gold hover:text-gold">
            {s.xr.link.label}
          </TextLink>
        </div>
      </BentoCard>
      <BentoCard kicker="03" title={s.backend.title} accent="pink">
        <p className="text-white/70">{s.backend.blurb}</p>
        <div className="mt-auto pt-5">
          <Chips items={s.backend.items} />
        </div>
      </BentoCard>
      <BentoCard kicker="04" title={s.shipping.title}>
        <p className="text-white/70">{s.shipping.blurb}</p>
        <div className="mt-auto pt-5">
          <Chips items={s.shipping.items} />
        </div>
      </BentoCard>
      <BentoCard kicker="now" title={s.learning.title} accent="pink" className="md:col-span-3">
        <p className="text-white/70">{s.learning.blurb}</p>
      </BentoCard>
    </BentoGrid>
  )
}

function Stack() {
  const items = [...stack, ...stack]
  return (
    <section id="stack" data-core="away" className="py-32">
      <div className="px-6 md:px-12">
        <SectionLabel n="04">Stack</SectionLabel>
      </div>
      <div className="overflow-hidden border-y border-line bg-ink/60 py-6 backdrop-blur-sm" aria-label={stack.join(', ')}>
        <div className="marquee-track" aria-hidden>
          {items.map((s, i) => (
            <span key={i} className="mx-8 whitespace-nowrap text-5xl font-bold text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.35)] hover:text-neon md:text-7xl">
              {s}
            </span>
          ))}
        </div>
      </div>
      <Skills />
    </section>
  )
}

function Contact() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }
  return (
    <section id="contact" data-core="right" className="flex min-h-svh flex-col justify-center px-6 py-32 md:px-12">
      <SectionLabel n="05">Contact</SectionLabel>
      <h2 data-reveal className="max-w-4xl text-5xl font-bold leading-none tracking-tight md:text-8xl">
        Let&apos;s build something <span className="text-neon">weird</span> and good.
      </h2>
      <button data-reveal onClick={copy} className="mt-10 w-fit rounded-full border border-neon px-8 py-4 font-mono text-sm text-neon transition hover:bg-neon hover:text-black">
        {copied ? 'copied ✓' : profile.email}
      </button>
      <p className="sr-only" aria-live="polite">
        {copied ? 'Email address copied to clipboard' : ''}
      </p>
      <div data-reveal className="mt-8 flex gap-6 font-mono text-sm">
        <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-neon">
          GitHub ↗
        </a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-neon">
          LinkedIn ↗
        </a>
      </div>
      <p className="mt-24 font-mono text-xs text-white/30">
        © {YEAR} {profile.name} · built with React, Three.js, GSAP &amp; Lenis
      </p>
    </section>
  )
}

/* ---------- app ---------- */

export default function App() {
  useSmoothScroll()
  const reduced = useReducedMotion()
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Tell the 3D core where to sit for the section in the middle of the screen. Blocks can
      // nest (a block inside a section), so the innermost active one (last in DOM order) wins.
      const triggers: ScrollTrigger[] = []
      const pickSpot = () => {
        const active = triggers.filter((t) => t.isActive).pop()
        const spot = (active?.trigger as HTMLElement | undefined)?.dataset.core as CoreSpot | undefined
        if (spot && spot !== scrollState.spot) {
          scrollState.spot = spot
          emitScrollChange()
        }
      }
      gsap.utils.toArray<HTMLElement>('[data-core]').forEach((el) => {
        triggers.push(ScrollTrigger.create({ trigger: el, start: 'top center', end: 'bottom center', onToggle: pickSpot }))
      })

      if (reduced) return
      gsap.from('[data-word]', { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.08, delay: 0.2 })
      gsap.from('[data-hero]', { y: 24, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.6 })

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [reduced])

  return (
    <MotionConfig reducedMotion="user">
      <div ref={root} className="grain relative">
        <Background />
        <Cursor />
        <Transition />
        <Nav />
        <main className="relative z-10">
          <Hero />
          <About />
          <Work />
          <ExploreNDMU />
          <Stack />
          <Contact />
        </main>
      </div>
    </MotionConfig>
  )
}
