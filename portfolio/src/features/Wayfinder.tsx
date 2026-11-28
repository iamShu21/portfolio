import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { answers, profile } from '../content'
import { OPEN_AR, OPEN_CV, OPEN_WAYFINDER, WAYFINDER_GO } from '../events'
import { lockScroll } from '../scroll'
import { getTheme, toggleTheme } from '../theme'
import { isXray, toggleXray } from '../xray'
import { prefersReducedMotion } from '../motion'
import { cn } from '../lib/utils'
import { useIsMac } from '../lib/platform'

/*
 * "Where to?" — a command palette framed like ExploreNDMU's "Navigate here". Pick a destination
 * and the page walks you there: gold chevrons point the way, a prompt counts down the metres
 * (100 px = 1 m) while the page scrolls, and "You have arrived" greets you at the section.
 * Also runs a few actions and answers common questions, all without a backend.
 */

type Item =
  | { kind: 'go'; id: string; label: string; keywords?: string; target: string }
  /** An action; a returned message (or a promise of one) is shown as a notice. */
  | { kind: 'do'; id: string; label: string; keywords?: string; run: () => void | string | Promise<string> }
  | { kind: 'ask'; id: string; label: string; keywords?: string; answer: string }

const GROUPS: { kind: Item['kind']; title: string }[] = [
  { kind: 'go', title: 'navigate here' },
  { kind: 'do', title: 'actions' },
  { kind: 'ask', title: 'ask' },
]

const HEADER = 64 // sticky header height + a little air
const PX_PER_M = 100

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))

function buildItems(): Item[] {
  const go = (target: string, label: string, keywords = ''): Item => ({ kind: 'go', id: 'go-' + target, label, keywords, target })
  const link = (href: string) => () => void window.open(href, '_blank', 'noopener')
  const items: Item[] = [
    go('top', 'home', 'top start hero intro'),
    go('about', 'about me', 'who bio background story'),
    go('projects', 'projects', 'work portfolio ssg payment pos point of sale'),
    go('explorendmu', 'ExploreNDMU case study', 'ar app capstone'),
    go('screens', 'ExploreNDMU screens', 'gallery video clips screenshots'),
    go('how-it-works', 'how ExploreNDMU works', 'map routes dijkstra gps arcore'),
    go('journey', 'journey', 'education school timeline experience leadership orgs psits mso'),
    go('stack', 'stack', 'skills tech tools languages'),
    go('contact', 'contact', 'email hire say hello'),
  ]
  if (profile.email)
    items.push({
      kind: 'do',
      id: 'do-copy',
      label: 'copy email address',
      keywords: 'mail contact clipboard',
      run: () => navigator.clipboard.writeText(profile.email).then(() => 'Email copied'),
    })
  items.push({
    kind: 'do',
    id: 'do-ar',
    label: 'walk to NDMU in AR',
    keywords: 'try arrows camera compass demo explorendmu augmented reality',
    run: () => void window.dispatchEvent(new Event(OPEN_AR)),
  })
  if (profile.cv) items.push({ kind: 'do', id: 'do-cv', label: 'open CV', keywords: 'resume curriculum vitae pdf', run: () => void window.dispatchEvent(new Event(OPEN_CV)) })
  if (profile.github) items.push({ kind: 'do', id: 'do-gh', label: 'open GitHub', keywords: 'code repos', run: link(profile.github) })
  if (profile.linkedin) items.push({ kind: 'do', id: 'do-li', label: 'open LinkedIn', keywords: 'social', run: link(profile.linkedin) })
  if (profile.facebook) items.push({ kind: 'do', id: 'do-fb', label: 'open Facebook', keywords: 'social', run: link(profile.facebook) })
  items.push({
    kind: 'do',
    id: 'do-theme',
    label: `switch to ${getTheme() === 'dark' ? 'light' : 'dark'} theme`,
    keywords: 'theme dark light mode colour color',
    run: () => toggleTheme(),
  })
  items.push({
    kind: 'do',
    id: 'do-xray',
    label: `${isXray() ? 'turn off' : 'turn on'} x-ray build mode`,
    keywords: 'xray how built inspect performance debug',
    run: () => toggleXray(),
  })
  answers.forEach((a, i) => items.push({ kind: 'ask', id: 'ask-' + i, label: a.q, keywords: a.keywords, answer: a.a }))
  return items
}

/**
 * How well an item fits the query: 0 = no match. Every word must appear in the label or the
 * keywords; matches in the label itself rank above keyword-only matches, so typing "about me"
 * picks "about me", not an item that merely lists "about" as a keyword.
 */
function score(it: Item, q: string) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return 1
  const label = it.label.toLowerCase()
  const hay = `${label} ${it.keywords ?? ''}`.toLowerCase()
  if (!words.every((w) => hay.includes(w))) return 0
  const phrase = words.join(' ')
  const labelWords = label.split(/[^a-z0-9]+/)
  if (label === phrase) return 5
  // Whole words beat word starts: "ar" means the AR walk, not "Are you…".
  if (words.every((w) => labelWords.includes(w))) return 4
  if (label.startsWith(phrase)) return 3
  if (words.every((w) => label.includes(w))) return 2
  return 1
}

/* ---------- the walk ---------- */

type Walk = { label: string; metres: number; dir: 1 | -1 }

/** Scroll to `el` and report progress; resolves when the page has stopped moving. */
function walkTo(el: HTMLElement, onStep: (remainingPx: number) => void) {
  const goal = () => Math.max(0, Math.min(el.getBoundingClientRect().top + scrollY - HEADER, document.documentElement.scrollHeight - innerHeight))
  window.scrollTo({ top: goal(), behavior: 'smooth' })
  return new Promise<void>((done) => {
    let last = scrollY
    let still = 0
    const started = performance.now()
    const tick = () => {
      const remaining = Math.abs(goal() - scrollY)
      onStep(remaining)
      still = Math.abs(scrollY - last) < 0.5 ? still + 1 : 0
      last = scrollY
      // Arrived, stopped (the visitor took over the wheel), or taking too long.
      if (remaining < 2 || still > 8 || performance.now() - started > 4000) return done()
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

function Guide({ walk }: { walk: Walk | null }) {
  if (!walk) return null
  const chevron = walk.dir > 0 ? 'M5 9l7 7 7-7' : 'M5 15l7-7 7 7'
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50">
      {/* A column of chevrons down the middle of the screen, lighting up in the walking direction. */}
      <div className={cn('absolute inset-y-[18%] left-1/2 flex -translate-x-1/2 flex-col justify-between', walk.dir < 0 && 'flex-col-reverse')}>
        {Array.from({ length: 6 }, (_, i) => (
          <svg key={i} viewBox="0 0 24 24" className="wayfinder-chevron h-8 w-8 text-gold" style={{ animationDelay: `${i * 110}ms` }}>
            <path d={chevron} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ))}
      </div>
      {/* The prompt, like the one at the top of the app screen. */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-line bg-card/95 py-2.5 pl-2.5 pr-5 shadow-lg backdrop-blur">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-bg">
          <svg viewBox="0 0 24 24" className="h-5 w-5">
            <path d={walk.dir > 0 ? 'M12 5v14M6 13l6 6 6-6' : 'M12 19V5M6 11l6-6 6 6'} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span>
          <span className="block text-sm font-medium">Follow the arrows</span>
          <span className="block font-mono text-xs text-muted">
            about {walk.metres} m to {walk.label}
          </span>
        </span>
      </div>
    </div>
  )
}

/* ---------- the palette ---------- */

export default function Wayfinder() {
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [answer, setAnswer] = useState<{ q: string; a: string } | null>(null)
  const [walk, setWalk] = useState<Walk | null>(null)
  const [notice, setNotice] = useState<{ text: string; sub: string; pin?: boolean } | null>(null)
  const uid = useId()
  const mac = useIsMac()
  const goRef = useRef<(id: string, label: string) => Promise<void>>(async () => {})

  // Rebuilt on every open, so labels like "switch to dark theme" are current.
  const items = useMemo(() => (open ? buildItems() : []), [open])
  // Groups keep their kind, but the best-matching group comes first and items within a group
  // are ranked, so the highlighted first option is always the best match. `shown` is the same
  // order as on screen, which keeps the arrow keys in step with what you see.
  const scored = items.map((it) => ({ it, s: score(it, query) })).filter((x) => x.s > 0)
  const groups = GROUPS.map((g) => ({ ...g, list: scored.filter((x) => x.it.kind === g.kind).sort((a, b) => b.s - a.s) })).filter((g) => g.list.length)
  if (query.trim()) groups.sort((a, b) => b.list[0].s - a.list[0].s)
  const shown = groups.flatMap((g) => g.list.map((x) => x.it))
  const current = shown[Math.min(active, shown.length - 1)]

  // Open on ⌘K / Ctrl+K anywhere, "/" when not typing, or the header button's event.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping(e.target) && !document.querySelector('dialog[open]')) {
        e.preventDefault()
        setOpen(true)
      }
    }
    const onOpen = () => setOpen(true)
    // Other parts of the page (the page map) can ask for a guided walk too.
    const onGo = (e: Event) => {
      const { id, label } = (e as CustomEvent<{ id: string; label: string }>).detail
      void goRef.current(id, label)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_WAYFINDER, onOpen)
    window.addEventListener(WAYFINDER_GO, onGo)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_WAYFINDER, onOpen)
      window.removeEventListener(WAYFINDER_GO, onGo)
    }
  }, [])

  useEffect(() => {
    const d = dialog.current
    if (!d || !open) return
    setQuery('')
    setActive(0)
    setAnswer(null)
    d.showModal()
    input.current?.focus()
    lockScroll(true)
    return () => {
      lockScroll(false)
      if (d.open) d.close()
    }
  }, [open])

  // Keep the highlighted option in view.
  useEffect(() => {
    if (current) document.getElementById(`${uid}-${current.id}`)?.scrollIntoView({ block: 'nearest' })
  }, [current, uid])

  const go = async (targetId: string, label: string) => {
    setOpen(false) // closing restores focus to the opener; we move it on arrival
    const el = document.getElementById(targetId)
    if (!el) return
    // Let the dialog close and the scroll lock lift before measuring.
    await new Promise((r) => requestAnimationFrame(r))
    const dist = el.getBoundingClientRect().top - HEADER
    if (prefersReducedMotion() || Math.abs(dist) < 8) {
      window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - HEADER, behavior: 'instant' })
    } else {
      const dir = dist > 0 ? 1 : -1
      await walkTo(el, (px) => setWalk({ label, dir, metres: Math.max(1, Math.round(px / PX_PER_M)) }))
      setWalk(null)
    }
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
    el.focus({ preventScroll: true })
    el.classList.remove('arrived')
    void el.offsetWidth // restart the highlight animation
    el.classList.add('arrived')
    setNotice({ text: 'You have arrived', sub: label, pin: true })
  }

  useEffect(() => {
    goRef.current = go
  })

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 2600)
    return () => clearTimeout(t)
  }, [notice])

  const choose = (it: Item | undefined) => {
    if (!it) return
    if (it.kind === 'go') void go(it.target, it.label)
    else if (it.kind === 'do') {
      setOpen(false)
      Promise.resolve(it.run())
        .then((msg) => msg && setNotice({ text: msg, sub: it.label }))
        .catch(() => setNotice({ text: 'Could not do that here', sub: it.label }))
    } else setAnswer({ q: it.label, a: it.answer })
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!shown.length) return
      const n = shown.length
      setActive((a) => (Math.min(a, n - 1) + (e.key === 'ArrowDown' ? 1 : -1) + n) % n)
      setAnswer(null)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(current)
    }
  }

  const mod = mac ? '⌘' : 'Ctrl '

  return (
    <>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(ev) => ev.target === dialog.current && dialog.current.close()}
        aria-label="Where to?"
        data-xray="Wayfinder · native <dialog> + ARIA combobox, zero deps"
        className="mx-auto mt-[12vh] w-[min(92vw,34rem)] max-w-none overflow-hidden rounded-2xl border border-line bg-card p-0 text-fg shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-[2px]"
      >
        {open && (
          <div onKeyDown={onKeyDown}>
            <div className="flex items-center gap-3 border-b border-line px-4">
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-gold">
                <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" fill="none" stroke="currentColor" strokeWidth={1.8} />
                <circle cx="12" cy="9.5" r="2.5" fill="currentColor" />
              </svg>
              <input
                ref={input}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActive(0)
                  setAnswer(null)
                }}
                placeholder="Where to? Search, run or ask…"
                role="combobox"
                aria-expanded
                aria-controls={`${uid}-list`}
                aria-activedescendant={current && !answer ? `${uid}-${current.id}` : undefined}
                aria-autocomplete="list"
                autoComplete="off"
                spellCheck={false}
                className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
              />
              <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[0.65rem] text-muted sm:block">esc</kbd>
            </div>

            {answer ? (
              <div className="px-5 py-5" aria-live="polite">
                <p className="font-mono text-xs text-gold">{answer.q}</p>
                <p className="mt-2 leading-relaxed">{answer.a}</p>
                <p className="mt-4 font-mono text-xs text-muted">↑↓ to keep browsing · esc to close</p>
              </div>
            ) : (
              <div id={`${uid}-list`} role="listbox" aria-label="Destinations, actions and questions" className="max-h-[min(55vh,26rem)] overflow-y-auto p-2">
                {shown.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted">No match. Try “contact”, “cv” or “commission”.</p>}
                {groups.map((g) => {
                  const group = g.list.map((x) => x.it)
                  return (
                    <div key={g.kind} role="group" aria-labelledby={`${uid}-g-${g.kind}`} className="mb-1 last:mb-0">
                      <p id={`${uid}-g-${g.kind}`} className="px-3 pb-1 pt-2 font-mono text-[0.7rem] text-muted">
                        {g.title}
                      </p>
                      {group.map((it) => {
                        const selected = it === current
                        return (
                          <div
                            key={it.id}
                            id={`${uid}-${it.id}`}
                            role="option"
                            aria-selected={selected}
                            onClick={() => choose(it)}
                            onMouseMove={() => setActive(shown.indexOf(it))}
                            className={cn('flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm', selected && 'bg-bg')}
                          >
                            <span className="truncate">{it.label}</span>
                            {selected && (
                              <span aria-hidden className="shrink-0 font-mono text-[0.7rem] text-gold">
                                {it.kind === 'go' ? 'navigate here ↵' : it.kind === 'do' ? 'run ↵' : 'answer ↵'}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex justify-between gap-3 border-t border-line px-4 py-2 font-mono text-[0.7rem] text-muted">
              <span>↑↓ choose · ↵ go</span>
              <span>{mod}K to open anywhere</span>
            </div>
          </div>
        )}
      </dialog>

      <Guide walk={walk} />

      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-4">
        {notice && (
          <p className="arrival-toast flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm shadow-lg">
            {notice.pin ? (
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 text-gold">
                <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" fill="currentColor" />
                <circle cx="12" cy="9.5" r="2.5" fill="var(--card)" />
              </svg>
            ) : (
              <span aria-hidden className="text-accent">✓</span>
            )}
            {notice.text} <span className="font-mono text-xs text-muted">· {notice.sub}</span>
          </p>
        )}
      </div>
    </>
  )
}
