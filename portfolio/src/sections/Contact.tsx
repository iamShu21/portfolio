import { useState } from 'react'
import { profile } from '../content'
import { CvLink } from '../Cv'
import { Reveal, Section } from '../ui'
import { button } from '../lib/styles'
import { cn } from '../lib/utils'
import { Socials } from './Hero'

export default function Contact() {
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
    <Section id="contact" n="06" title="contact" xray="Contact · clipboard API, mailto fallback, aria-live">
      <Reveal>
        <p className="text-3xl font-semibold tracking-tight sm:text-4xl">say hello.</p>
        <p className="mt-3 max-w-lg leading-relaxed text-muted">
          Internships, freelance work, a project that needs a map and a phone, or just a question about ExploreNDMU. I read everything.
        </p>
      </Reveal>
      <Reveal className="mt-6">
        {profile.email ? (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-card p-2 pl-4">
            <span className="mr-auto break-all py-1 font-mono text-sm">{profile.email}</span>
            <button type="button" onClick={copy} className={cn(button.base, button.ghost)}>
              {copied ? 'copied ✓' : 'copy'}
            </button>
            <a href={`mailto:${profile.email}`} className={cn(button.base, button.solid)}>
              open mail app
            </a>
            <p className="sr-only" aria-live="polite">
              {copied ? 'Email address copied to clipboard' : ''}
            </p>
          </div>
        ) : (
          <a href={profile.github} target="_blank" rel="noreferrer" className={cn(button.base, button.solid)}>
            Find me on GitHub ↗<span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Socials className="-ml-2" />
          <CvLink className="font-mono text-xs text-muted underline decoration-line underline-offset-4 hover:text-accent">view CV</CvLink>
        </div>
      </Reveal>
    </Section>
  )
}
