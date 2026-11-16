import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Scene from './Scene'
import Cursor from './Cursor'
import { gsap, useSmoothScroll } from './scroll'
import { facts, profile, projects, stack, type Project } from './content'

/* ---------- small pieces ---------- */

function SplitWords({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom" aria-hidden>
          <span data-word className="inline-block will-change-transform">
            {w}&nbsp;
          </span>
        </span>
      ))}
    </span>
  )
}

function SectionLabel({ n, children }: { n: string; children: string }) {
  return (
    <p data-reveal className="mb-6 font-mono text-sm tracking-widest text-neon">
      <span className="text-white/40">{n} /</span> {children.toUpperCase()}
    </p>
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
    <section id="top" className="relative flex min-h-screen flex-col justify-center px-6 md:px-12">
      <p data-hero className="mb-4 font-mono text-sm text-neon">
        {'>'} hello, world<span className="animate-pulse">_</span>
      </p>
      <h1 className="max-w-4xl text-6xl font-bold leading-[0.95] tracking-tight md:text-8xl">
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
    <section id="about" className="px-6 py-32 md:px-12">
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
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -10, y: ((e.clientX - r.left) / r.width - 0.5) * 10 })
  }

  return (
    <motion.div
      ref={ref}
      data-reveal
      data-hover
      onPointerMove={onMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{ transformPerspective: 900 }}
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
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="font-mono text-sm underline decoration-neon underline-offset-4 hover:text-neon">
            {l.label} ↗
          </a>
        ))}
      </div>
    </motion.div>
  )
}

function Work() {
  return (
    <section id="work" className="px-6 py-32 md:px-12">
      <SectionLabel n="02">Selected work</SectionLabel>
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((p, i) => (
          <ProjectCard key={p.title} p={p} i={i} />
        ))}
      </div>
    </section>
  )
}

function Stack() {
  const items = [...stack, ...stack]
  return (
    <section id="stack" className="py-32">
      <div className="px-6 md:px-12">
        <SectionLabel n="03">Stack</SectionLabel>
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
    <section id="contact" className="flex min-h-screen flex-col justify-center px-6 py-32 md:px-12">
      <SectionLabel n="04">Contact</SectionLabel>
      <h2 data-reveal className="max-w-4xl text-5xl font-bold leading-none tracking-tight md:text-8xl">
        Let&apos;s build something <span className="text-neon">weird</span> and good.
      </h2>
      <button data-reveal onClick={copy} className="mt-10 w-fit rounded-full border border-neon px-8 py-4 font-mono text-sm text-neon transition hover:bg-neon hover:text-black">
        {copied ? 'copied ✓' : profile.email}
      </button>
      <div data-reveal className="mt-8 flex gap-6 font-mono text-sm">
        <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-neon">
          GitHub ↗
        </a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-neon">
          LinkedIn ↗
        </a>
      </div>
      <p className="mt-24 font-mono text-xs text-white/30">
        © {new Date().getFullYear()} {profile.name} · built with React, Three.js, GSAP &amp; Lenis
      </p>
    </section>
  )
}

/* ---------- app ---------- */

export default function App() {
  useSmoothScroll()
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const ctx = gsap.context(() => {
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
  }, [])

  return (
    <div ref={root} className="grain relative">
      <Scene />
      <Cursor />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <About />
        <Work />
        <Stack />
        <Contact />
      </main>
    </div>
  )
}
