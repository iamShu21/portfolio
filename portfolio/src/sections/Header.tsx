import { profile } from '../content'
import ThemeToggle from '../features/ThemeToggle'
import { OPEN_WAYFINDER } from '../events'
import { useIsMac } from '../lib/platform'

const NAV = [
  { id: 'about', label: 'about' },
  { id: 'projects', label: 'projects' },
  { id: 'journey', label: 'journey' },
  { id: 'stack', label: 'stack' },
  { id: 'contact', label: 'contact' },
]

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')

export default function Header() {
  const mac = useIsMac()
  return (
    <header
      data-xray="Header · sticky, backdrop-blur only where supported"
      className="sticky top-0 z-40 border-b border-line/70 bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70"
    >
      <a
        href="#main"
        className="sr-only rounded-full bg-accent-fill px-4 py-2 font-mono text-sm text-on-fill focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2 py-2 font-mono text-sm" aria-label={`${profile.name}, back to top`}>
          <span aria-hidden className="grid h-7 w-7 place-items-center rounded-full bg-fg text-[0.65rem] font-medium text-bg">
            {initials(profile.name)}
          </span>
          <span className="hidden sm:inline">{profile.name.split(' ')[0].toLowerCase()}</span>
        </a>
        <div className="flex items-center gap-1 sm:gap-2">
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex whitespace-nowrap font-mono text-xs text-muted">
              {NAV.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} className="inline-block px-2 py-2 transition hover:text-fg">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_WAYFINDER))}
            aria-keyshortcuts={mac ? 'Meta+K' : 'Control+K'}
            className="flex h-9 items-center gap-2 whitespace-nowrap rounded-full border border-line bg-card pl-3 pr-2 font-mono text-xs text-muted transition hover:border-gold hover:text-fg"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 text-gold">
              <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" fill="none" stroke="currentColor" strokeWidth={2.2} />
            </svg>
            where to?
            <kbd className="hidden rounded border border-line px-1 text-[0.65rem] sm:inline">{mac ? '⌘K' : 'Ctrl K'}</kbd>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
