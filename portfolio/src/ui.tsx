import { cn } from './lib/utils'

/** Small presentational pieces shared by the page sections. */

/**
 * "01 / ABOUT" label. It's the section's heading (h2) unless the section has its own
 * h2, then pass as="p". The number is hidden from screen readers and the capitals come
 * from CSS, so it's read as "About", not spelled out.
 */
export function SectionLabel({ n, children, as: Tag = 'h2' }: { n: string; children: string; as?: 'h2' | 'p' }) {
  return (
    <Tag data-reveal className="mb-6 font-mono text-sm font-normal uppercase tracking-widest text-neon">
      <span aria-hidden className="text-white/50">
        {n} /{' '}
      </span>
      {children}
    </Tag>
  )
}

/**
 * Opens in a new tab unless it's an in-page #anchor. A bare "#" is a placeholder and
 * renders as disabled text instead of a link that goes nowhere.
 */
export function TextLink({ href, children, className = '' }: { href: string; children: string; className?: string }) {
  if (href === '#') {
    return (
      <span aria-disabled className="font-mono text-sm text-white/50">
        {children} <span className="text-xs">(soon)</span>
      </span>
    )
  }
  const external = !href.startsWith('#')
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      // inline-block + py-1: standalone links get a tap target of at least 24px.
      className={cn('inline-block py-1 font-mono text-sm underline decoration-neon underline-offset-4 hover:text-neon', className)}
    >
      {children}
      {external && (
        <>
          {' ↗'}
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      )}
    </a>
  )
}
