import { cn } from './lib/utils'

/** Small presentational pieces shared by the page sections. */

/**
 * A numbered page section: "01 — projects" followed by a hairline. The number is hidden from
 * screen readers so the heading reads as "projects". `xray` labels the section in X-ray mode.
 */
export function Section({
  id,
  n,
  title,
  xray,
  className,
  children,
}: {
  id: string
  n: string
  title: string
  xray?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} data-xray={xray} className={cn('relative py-14 sm:py-16', className)}>
      <h2 id={`${id}-h`} className="mb-8 flex items-center gap-3 font-mono text-xs font-normal text-muted">
        <span>
          <span aria-hidden>{n} — </span>
          {title}
        </span>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </h2>
      {children}
    </section>
  )
}

/**
 * Fades and lifts its children in as they scroll into view. Pure CSS (scroll-driven animation,
 * see index.css): no JS, and browsers without support or with reduced motion just show it.
 */
export function Reveal({ children, className, as: Tag = 'div' }: { children: React.ReactNode; className?: string; as?: 'div' | 'li' }) {
  return <Tag className={cn('reveal', className)}>{children}</Tag>
}

/** Like Reveal, but plays once on page load, `step` × 60 ms after the first. For the hero. */
export function Rise({ children, className, step = 0 }: { children: React.ReactNode; className?: string; step?: number }) {
  return (
    <div className={cn('rise', className)} style={{ animationDelay: `${step * 60}ms` }}>
      {children}
    </div>
  )
}

/** A pill-shaped tag. */
export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('inline-block rounded-full border border-line bg-card px-2.5 py-1 font-mono text-xs text-muted', className)}>{children}</span>
}

/**
 * Opens in a new tab unless it's an in-page #anchor. A bare "#" is a placeholder and
 * renders as disabled text instead of a link that goes nowhere.
 */
export function TextLink({ href, children, className = '' }: { href: string; children: string; className?: string }) {
  if (href === '#') {
    return (
      <span aria-disabled className="font-mono text-sm text-muted">
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
      className={cn('inline-block py-1 font-mono text-sm underline decoration-line decoration-1 underline-offset-4 transition hover:text-accent hover:decoration-accent', className)}
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

