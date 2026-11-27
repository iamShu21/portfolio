import { projects, type Project } from '../content'
import { Pill, Reveal, Section, TextLink } from '../ui'

const BASE = import.meta.env.BASE_URL

function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-line bg-card transition-colors hover:border-accent/50">
      {p.image && (
        <div className="overflow-hidden border-b border-line">
          <img
            src={BASE + p.image.src}
            width={p.image.w}
            height={p.image.h}
            alt={p.image.alt}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full transition duration-700 motion-safe:group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="p-5 sm:p-6">
        <p className="font-mono text-xs text-accent">{p.kind}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight">{p.title}</h3>
        <p className="mt-2 leading-relaxed text-muted">{p.blurb}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {p.tags.map((t) => (
            <li key={t}>
              <Pill>{t}</Pill>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1">
          {p.links.map((l) => (
            <TextLink key={l.label} href={l.href}>
              {l.label}
            </TextLink>
          ))}
        </div>
      </div>
    </article>
  )
}

export default function Projects() {
  return (
    <Section id="projects" n="01" title="projects" xray="Projects · drafts in content.ts stay hidden">
      <div className="grid gap-5">
        {projects
          .filter((p) => !p.draft)
          .map((p) => (
            <Reveal key={p.title}>
              <ProjectCard p={p} />
            </Reveal>
          ))}
      </div>
    </Section>
  )
}
