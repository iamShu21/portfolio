import { about } from '../content'
import { Reveal, Section } from '../ui'

export default function About() {
  return (
    <Section id="about" n="01" title="about" xray="About · drafted from the CV and the repos; edit it in content.ts">
      <Reveal className="space-y-4 text-lg leading-relaxed text-pretty">
        {about.paragraphs.map((p, i) => (
          <p key={i} className={i === 0 ? '' : 'text-muted'}>
            {p}
          </p>
        ))}
      </Reveal>
      <Reveal>
        <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {about.facts.map((f) => (
            <div key={f.k} className="bg-card px-4 py-3">
              <dt className="font-mono text-xs text-muted">{f.k}</dt>
              <dd className="mt-0.5 text-sm">{f.v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </Section>
  )
}
