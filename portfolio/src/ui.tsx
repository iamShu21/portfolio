import { cn } from './lib/utils'

/** Small presentational pieces shared by the page sections. */

export function SectionLabel({ n, children }: { n: string; children: string }) {
  return (
    <p data-reveal className="mb-6 font-mono text-sm tracking-widest text-neon">
      <span className="text-white/50">{n} /</span> {children.toUpperCase()}
    </p>
  )
}

/** Opens in a new tab unless it's an in-page #anchor. */
export function TextLink({ href, children, className = '' }: { href: string; children: string; className?: string }) {
  const external = !href.startsWith('#')
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={cn('font-mono text-sm underline decoration-neon underline-offset-4 hover:text-neon', className)}
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
