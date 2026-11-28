import { useState } from 'react'
import { profile } from '../content'
import { CvLink } from '../Cv'
import { Socials } from '../sections/Hero'
import { cn } from '../lib/utils'

const BASE = import.meta.env.BASE_URL

/**
 * The right-hand margin on wide screens: a small card that keeps the ways to reach me one click
 * away wherever you are on the page. It mirrors the page map on the left.
 */
export default function QuickContact() {
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
    <aside
      aria-label="Quick contact"
      data-xray="QuickContact · sticky in the right margin from 1280 px; same data as the contact section"
      className="fixed right-6 top-1/2 z-30 hidden w-52 -translate-y-1/2 2xl:right-12 xl:block"
    >
      <div className="rounded-2xl border border-line bg-card p-4">
        {profile.status && (
          <p className="flex items-center gap-2 font-mono text-xs">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {profile.status.toLowerCase()}
          </p>
        )}
        <p className="mt-3 text-sm leading-snug">Have a project in mind? Tell me what you need and when.</p>

        {profile.email && (
          <div className="mt-3">
            <a href={`mailto:${profile.email}`} className="block truncate font-mono text-[0.7rem] text-muted underline decoration-line underline-offset-4 hover:text-accent">
              {profile.email}
            </a>
            <button
              type="button"
              onClick={copy}
              className={cn(
                'mt-2 w-full rounded-full px-3 py-1.5 font-mono text-xs transition',
                copied ? 'bg-accent-fill text-on-fill' : 'bg-fg text-bg hover:bg-accent-fill hover:text-on-fill',
              )}
            >
              {copied ? 'copied ✓' : 'copy email'}
            </button>
            <p className="sr-only" aria-live="polite">
              {copied ? 'Email address copied to clipboard' : ''}
            </p>
          </div>
        )}

        {profile.cv && (
          <div className="mt-2 flex gap-2">
            <CvLink className="flex-1 rounded-full border border-line px-3 py-1.5 text-center font-mono text-xs transition hover:border-accent hover:text-accent">
              view CV
            </CvLink>
            <a
              href={BASE + profile.cv.pdf}
              download
              aria-label="Download CV as PDF"
              title="Download CV (PDF)"
              className="rounded-full border border-line px-3 py-1.5 font-mono text-xs transition hover:border-accent hover:text-accent"
            >
              pdf ↓
            </a>
          </div>
        )}

        <div className="mt-3 border-t border-line pt-2">
          <Socials className="-ml-2" />
        </div>
      </div>
    </aside>
  )
}
