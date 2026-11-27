import { skills } from '../content'
import { Pill, Reveal, Section } from '../ui'

const GROUPS = [skills.frontend, skills.xr, skills.backend, skills.shipping]

export default function Stack() {
  return (
    <Section id="stack" n="04" title="stack" xray="Stack · plain lists, no marquee to wait for">
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
        {GROUPS.map((g) => (
          <Reveal key={g.title} className="bg-card p-5">
            <h3 className="font-medium">{g.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{g.blurb}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {g.items.map((t) => (
                <li key={t}>
                  <Pill>{t}</Pill>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <p className="mt-5 flex gap-3 text-sm text-muted">
          <span className="font-mono text-xs leading-5 text-accent">now</span>
          <span>
            <span className="text-fg">{skills.learning.title}:</span> {skills.learning.blurb}
          </span>
        </p>
      </Reveal>
    </Section>
  )
}
