import { useEffect, useState } from 'react'
import { projects } from '../content'
import { cn } from '../lib/utils'

/*
 * "Stack in view": the right margin of wide screens lists the technologies from my projects.
 * Anything on the page can declare what it uses with data-tech="React|MySQL|…" (and a name in
 * data-tech-label); whatever sits in the middle of the screen lights its tools up here.
 */

/** "Express.js", "Express" and "express" are the same tool; so are "Unity 6" and "Unity". */
const techKey = (t: string) =>
  t
    .toLowerCase()
    .replace(/\.js$/, '')
    .replace(/ css$/, '')
    .replace(/ \d+$/, '')
    .trim()

// Every tool used by a shown project, in first-seen order, without duplicates.
const TOOLS = (() => {
  const seen = new Map<string, string>()
  for (const p of projects.filter((p) => !p.draft)) for (const t of p.tags) if (!seen.has(techKey(t))) seen.set(techKey(t), t)
  return [...seen.entries()].map(([key, label]) => ({ key, label }))
})()

export default function TechInView() {
  const [lit, setLit] = useState<{ keys: Set<string>; label: string | null }>({ keys: new Set(), label: null })

  useEffect(() => {
    const visible = new Set<Element>()
    const update = () => {
      // Page order, so the label names the first thing in the reading band.
      const els = [...visible].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
      const keys = new Set(els.flatMap((el) => (el.getAttribute('data-tech') ?? '').split('|').filter(Boolean).map(techKey)))
      const first = els[0]?.getAttribute('data-tech-label') ?? null
      setLit({ keys, label: first && els.length > 1 ? `${first} +${els.length - 1}` : first })
    }
    // Only the middle band of the screen counts as "what you're reading".
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target)
          else visible.delete(e.target)
        }
        update()
      },
      { rootMargin: '-40% 0px -40% 0px' },
    )
    document.querySelectorAll('[data-tech]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const any = lit.keys.size > 0
  return (
    <aside
      aria-hidden
      data-xray="TechInView · IntersectionObserver on [data-tech] in the middle band of the screen"
      className="fixed right-6 top-1/2 z-30 hidden w-44 -translate-y-1/2 2xl:right-12 xl:block"
    >
      <p className="font-mono text-[0.7rem] text-muted">stack in view</p>
      <p className={cn('mt-0.5 h-5 truncate text-sm transition-opacity', any ? 'opacity-100' : 'opacity-0')}>{lit.label}</p>
      <ul className="mt-3 space-y-1.5 border-l border-line pl-3 font-mono text-[0.72rem]">
        {TOOLS.map((t) => {
          const on = lit.keys.has(t.key)
          return (
            <li key={t.key} className={cn('relative flex items-center gap-2 transition-colors duration-300', on ? 'text-fg' : 'text-muted/60')}>
              <span
                className={cn(
                  'absolute -left-[calc(0.75rem+3.5px)] h-1.5 w-1.5 rounded-full transition-all duration-300',
                  on ? 'scale-100 bg-accent' : 'scale-75 bg-line',
                )}
              />
              {t.label}
            </li>
          )
        })}
      </ul>
      <p className={cn('mt-3 font-mono text-[0.65rem] text-muted transition-opacity', any ? 'opacity-0' : 'opacity-100')}>scroll to the projects</p>
    </aside>
  )
}
