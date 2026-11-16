import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

// Bento grid and spotlight card, in the style of Magic UI's Bento Grid / Magic Card.
// The spotlight follows the pointer through CSS variables, so moving the mouse never re-renders React.

export function BentoGrid({ className, children }: { className?: string; children: ReactNode }) {
  return <ul className={cn('grid gap-4 md:auto-rows-[minmax(14rem,auto)] md:grid-cols-3 md:gap-5', className)}>{children}</ul>
}

const track = (e: React.PointerEvent<HTMLElement>) => {
  if (e.pointerType !== 'mouse') return
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`)
}

export function BentoCard({
  title,
  kicker,
  accent = 'neon',
  className,
  children,
}: {
  title: string
  kicker?: string
  accent?: 'neon' | 'pink' | 'gold'
  className?: string
  children?: ReactNode
}) {
  const glow = { neon: 'rgb(124 247 200 / 0.14)', pink: 'rgb(255 92 168 / 0.14)', gold: 'rgb(245 179 1 / 0.14)' }[accent]
  return (
    <li
      data-reveal
      onPointerMove={track}
      style={{ '--glow': glow } as React.CSSProperties}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-panel/90 p-6 transition-colors md:p-7',
        // spotlight layer
        'before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100',
        'before:bg-[radial-gradient(22rem_circle_at_var(--x,50%)_var(--y,50%),var(--glow),transparent_70%)]',
        accent === 'neon' && 'hover:border-neon/50',
        accent === 'pink' && 'hover:border-pink/50',
        accent === 'gold' && 'hover:border-gold/50',
        className,
      )}
    >
      {kicker && (
        <p
          className={cn(
            'relative font-mono text-xs uppercase tracking-widest',
            accent === 'neon' && 'text-neon',
            accent === 'pink' && 'text-pink',
            accent === 'gold' && 'text-gold',
          )}
        >
          {kicker}
        </p>
      )}
      <h3 className="relative mt-2 text-2xl font-bold tracking-tight md:text-3xl">{title}</h3>
      <div className="relative mt-4 flex flex-1 flex-col">{children}</div>
    </li>
  )
}

export function Chips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((t) => (
        <li key={t} className="rounded-full border border-white/15 bg-ink/40 px-3 py-1 font-mono text-xs text-white/80">
          {t}
        </li>
      ))}
    </ul>
  )
}
