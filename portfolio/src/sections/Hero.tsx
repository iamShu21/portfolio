import { heroStats, profile } from '../content'
import { CvLink } from '../Cv'
import { FacebookIcon, GitHubIcon, LinkedInIcon, MailIcon, PinIcon } from '../icons'
import { Rise } from '../ui'
import { button } from '../lib/styles'
import { cn } from '../lib/utils'
import NowStrip from '../features/NowStrip'
import { OPEN_AR } from '../events'

const BASE = import.meta.env.BASE_URL

function Avatar() {
  if (profile.photo) {
    return <img src={BASE + profile.photo} alt="" width={80} height={80} className="h-20 w-20 rounded-full border border-line object-cover" />
  }
  const letters = profile.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
  return (
    <span
      aria-hidden
      className="grid h-20 w-20 place-items-center rounded-full border border-line bg-card font-mono text-2xl text-fg shadow-[inset_0_0_0_6px_var(--bg)]"
    >
      {letters}
    </span>
  )
}

export function Socials({ className }: { className?: string }) {
  const links = [
    { href: profile.github, label: 'GitHub', Icon: GitHubIcon },
    { href: profile.linkedin, label: 'LinkedIn', Icon: LinkedInIcon },
    { href: profile.facebook, label: 'Facebook', Icon: FacebookIcon },
  ].filter((l) => l.href)
  return (
    <ul className={cn('flex items-center gap-1', className)}>
      {links.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={`${label} (opens in a new tab)`}
            title={label}
            className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-card hover:text-accent"
          >
            <Icon />
          </a>
        </li>
      ))}
      {profile.email && (
        <li>
          <a
            href={`mailto:${profile.email}`}
            aria-label={`Email ${profile.email}`}
            title="Email"
            className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-card hover:text-accent"
          >
            <MailIcon />
          </a>
        </li>
      )}
    </ul>
  )
}

export default function Hero() {
  return (
    <section id="top" aria-labelledby="top-h" data-xray="Hero · content from content.ts" className="pb-6 pt-14 sm:pt-20">
      <Rise>
        <div className="flex items-center gap-5">
          <Avatar />
          <div>
            <h1 id="top-h" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {profile.name}
            </h1>
            <p className="mt-1 text-muted">{profile.role}</p>
            <p className="mt-1 flex items-center gap-1 font-mono text-xs text-muted">
              <PinIcon className="h-3.5 w-3.5" />
              {profile.location}
            </p>
          </div>
        </div>
      </Rise>

      <Rise step={1}>
        <p className="mt-8 text-lg leading-relaxed text-pretty sm:text-xl">{profile.tagline}</p>
        <p className="mt-3 leading-relaxed text-muted text-pretty">{profile.bio}</p>
      </Rise>

      <Rise step={2} className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
        {profile.status && (
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 font-mono text-xs">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {profile.status}
          </span>
        )}
        {profile.cv && (
          <CvLink className={cn(button.base, button.solid)}>
            View CV <span aria-hidden>→</span>
          </CvLink>
        )}
        <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_AR))}
            className={cn(button.base, 'border border-gold/60 text-gold hover:bg-gold hover:text-bg')}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5">
              <path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            try my AR arrows
          </button>
        <Socials />
      </Rise>

      <Rise step={3}>
        <dl data-xray="Stats · counted from content.ts at build time, never typed by hand" className="mt-10 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-card">
          {heroStats.map((s) => (
            <div key={s.k} className="flex flex-col-reverse gap-0.5 px-3 py-4 sm:px-5">
              <dt className="text-xs text-muted sm:text-sm">{s.k}</dt>
              <dd className="font-mono text-2xl font-medium sm:text-3xl">{s.n}</dd>
            </div>
          ))}
        </dl>
        <NowStrip />
      </Rise>
    </section>
  )
}
