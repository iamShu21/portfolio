import { useState } from 'react'
import { journey, type Milestone } from '../content'
import { Reveal, Section } from '../ui'
import { cn } from '../lib/utils'

const FILTERS: { id: 'all' | Milestone['kind']; label: string }[] = [
  { id: 'all', label: 'all' },
  { id: 'education', label: 'education' },
  { id: 'activity', label: 'student orgs' },
]

export default function Journey() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
  const items = journey.filter((m) => filter === 'all' || m.kind === filter)

  return (
    <Section id="journey" n="03" title="journey" xray="Journey · toggle buttons with aria-pressed, data from the CV">
      <div role="group" aria-label="Filter the timeline" className="mb-6 inline-flex rounded-full border border-line bg-card p-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'rounded-full px-3 py-1.5 font-mono text-xs transition',
              filter === f.id ? 'bg-fg text-bg' : 'text-muted hover:text-fg',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ol className="relative">
        {/* The rail. */}
        <span aria-hidden className="absolute bottom-2 left-[5.5px] top-2 w-px bg-line sm:left-[calc(7.5rem+5.5px)]" />
        {items.map((m) => (
          <Reveal as="li" key={m.title + m.years} className="relative grid gap-1 pb-7 pl-7 last:pb-0 sm:grid-cols-[7.5rem_1fr] sm:gap-0 sm:pl-0">
            <span
              aria-hidden
              className={cn(
                'absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 sm:left-[7.5rem]',
                m.current ? 'border-accent bg-accent' : 'border-line bg-bg',
              )}
            >
              {m.current && <span className="absolute inset-0 rounded-full bg-accent opacity-60 motion-safe:animate-ping" />}
            </span>
            <p className="font-mono text-xs leading-6 text-muted">{m.years}</p>
            <div className="sm:pl-7">
              <p className="font-medium">
                {m.title}
                {m.current && <span className="ml-2 rounded-full bg-accent-fill px-2 py-0.5 align-middle font-mono text-[0.65rem] text-on-fill">now</span>}
              </p>
              <p className="text-sm text-muted">
                {m.org}
                <span className="sr-only">, {m.kind === 'education' ? 'education' : 'student organisation'}</span>
              </p>
              {m.note && <p className="mt-1 text-sm leading-relaxed text-muted">{m.note}</p>}
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}
