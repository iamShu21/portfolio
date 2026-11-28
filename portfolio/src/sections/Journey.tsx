import { earlierSchooling, education, leadership } from '../content'
import { Reveal, Section } from '../ui'
import { cn } from '../lib/utils'

/* ---------- the timeline at a glance ---------- */

const START = 2021
const NOW = __BUILD_DECIMAL_YEAR__
const pct = (y: number) => ((y - START) / (NOW - START)) * 100
const shortRole = (t: string) => t.replace('Representative', 'rep').toLowerCase()

type Bar = { from: number; to: number; label: string; tone: string; ongoing?: boolean }
const lanes: { label: string; bars: Bar[] }[] = [
  {
    label: 'school',
    bars: education
      .filter((e) => e.from >= START)
      .map((e) => ({
        from: e.from,
        to: e.to ?? NOW,
        label: e.to === null ? 'BS IT' : 'STEM SHS',
        tone: 'bg-accent-fill text-on-fill',
        ongoing: e.to === null,
      })),
  },
  ...leadership.map((o, i) => ({
    label: o.short,
    bars: o.roles.map((r) => ({ from: r.from, to: r.to, label: shortRole(r.title), tone: i === 0 ? 'bg-gold text-bg' : 'bg-fg text-bg' })),
  })),
]
const years = Array.from({ length: Math.floor(NOW) - START + 1 }, (_, i) => START + i)

/** School and student-org roles side by side, so the overlap is visible at a glance. */
function Timeline() {
  return (
    // Decorative: the lists below say the same thing in words.
    <div aria-hidden className="rounded-2xl border border-line bg-card px-4 pb-3 pt-4 sm:px-5">
      <div className="grid grid-cols-[3rem_1fr] gap-x-3">
        <div className="space-y-2">
          {lanes.map((l) => (
            <div key={l.label} className="flex h-6 items-center font-mono text-[0.7rem] text-muted">
              {l.label}
            </div>
          ))}
        </div>
        <div className="relative">
          {years.map((y) => (
            <span key={y} className="absolute -bottom-1 top-0 w-px bg-line" style={{ left: `${pct(y)}%` }} />
          ))}
          <div className="relative space-y-2">
            {lanes.map((l) => (
              <div key={l.label} className="relative h-6">
                {l.bars.map((b) => (
                  <span
                    key={b.from + b.label}
                    className={cn('timeline-bar absolute inset-y-0 flex items-center gap-1.5 overflow-hidden rounded-full px-2 font-mono text-[0.65rem]', b.tone)}
                    style={{ left: `calc(${pct(b.from)}% + 2px)`, width: `calc(${pct(b.to) - pct(b.from)}% - 4px)` }}
                  >
                    <span className="hidden truncate sm:inline">{b.label}</span>
                    {b.ongoing && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-on-fill motion-safe:animate-pulse" />}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="relative mt-2 h-4 font-mono text-[0.65rem] text-muted">
            {years.map((y) => (
              <span key={y} className="absolute -translate-x-1/2 pl-px" style={{ left: `${pct(y)}%` }}>
                {/* Two-digit years on phones, full years where there's room. */}
                <span className="sm:hidden">{`'${String(y).slice(2)}`}</span>
                <span className="hidden sm:inline">{y}</span>
              </span>
            ))}
            <span className="absolute right-0 text-fg">now</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- the details ---------- */

const Dot = ({ className }: { className?: string }) => <span aria-hidden className={cn('mt-[0.55rem] h-1 w-1 shrink-0 rounded-full', className)} />

function Education() {
  return (
    <div>
      <h3 className="font-mono text-xs text-muted">education</h3>
      <ol className="mt-3 space-y-3">
        {education.map((e) => (
          <Reveal as="li" key={e.title} className="rounded-2xl border border-line bg-card p-4">
            <p className="flex items-center justify-between gap-3 font-mono text-xs text-muted">
              <span>
                {e.from} – {e.to ?? 'now'}
              </span>
              {e.to === null && <span className="rounded-full bg-accent-fill px-2 py-0.5 text-[0.65rem] text-on-fill">studying now</span>}
            </p>
            <p className="mt-1.5 font-medium">{e.title}</p>
            <p className="text-sm text-muted">
              {e.org}
              {e.detail && ` · ${e.detail}`}
            </p>
            {e.notes && (
              <ul className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
                {e.notes.map((n) => (
                  <li key={n} className="flex gap-2.5">
                    <Dot className="bg-accent" />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        ))}
      </ol>
      <p className="mt-3 px-1 text-xs leading-relaxed text-muted">
        Earlier:{' '}
        {earlierSchooling.map((s, i) => (
          <span key={s.title}>
            {i > 0 && ' · '}
            {s.title}, {s.org} ({s.from}–{s.to})
          </span>
        ))}
      </p>
    </div>
  )
}

function Leadership() {
  return (
    <div>
      <h3 className="font-mono text-xs text-muted">leadership</h3>
      <ol className="mt-3 space-y-3">
        {leadership.map((o) => {
          const from = Math.min(...o.roles.map((r) => r.from))
          const to = Math.max(...o.roles.map((r) => r.to))
          const n = to - from
          return (
            <Reveal as="li" key={o.short} className="rounded-2xl border border-line bg-card p-4">
              <p className="flex items-center justify-between gap-3 font-mono text-xs text-muted">
                <span>
                  {o.short} · {o.where}
                </span>
                <span>
                  {from} – {to}
                  {n > 1 && ` · ${n} years`}
                </span>
              </p>
              <p className="mt-1.5 font-medium">{o.name}</p>
              {/* Newest role on top, so the progression reads upwards. */}
              <ol className="mt-3 space-y-2.5 border-l border-line pl-4">
                {[...o.roles].reverse().map((r, i) => (
                  <li key={r.from} className="relative">
                    <span aria-hidden className={cn('absolute -left-[1.3rem] top-1.5 h-2 w-2 rounded-full ring-4 ring-card', i === 0 ? 'bg-gold' : 'bg-line')} />
                    <p className="text-sm">{r.title}</p>
                    <p className="font-mono text-xs text-muted">
                      {r.from} – {r.to}
                    </p>
                  </li>
                ))}
              </ol>
            </Reveal>
          )
        })}
      </ol>
    </div>
  )
}

export default function Journey() {
  return (
    <Section id="journey" n="04" title="journey" xray="Journey · timeline drawn from content.ts with CSS only; the lists carry the same facts for screen readers">
      <Reveal>
        <Timeline />
      </Reveal>
      <div className="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-5">
        <Education />
        <Leadership />
      </div>
    </Section>
  )
}
