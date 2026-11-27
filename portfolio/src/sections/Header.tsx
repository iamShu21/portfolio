import { profile } from '../content'
import ThemeToggle from '../features/ThemeToggle'

const NAV = [
  { id: 'projects', label: 'projects' },
  { id: 'explorendmu', label: 'case study' },
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
            <ul className="flex font-mono text-xs text-muted">
              {NAV.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} className="inline-block px-2 py-2 transition hover:text-fg">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
