import { profile } from '../content'
import { useIsMac } from '../lib/platform'
import { toggleXray, useXray } from '../xray'

// The build year (set in vite.config.ts): identical in the pre-rendered HTML and in the browser.
const YEAR = __BUILD_YEAR__

export default function Footer() {
  const xray = useXray()
  const mac = useIsMac()
  return (
    <footer className="border-t border-line" data-xray="Footer · X-ray state lives on <html data-xray-on>">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-8 font-mono text-xs text-muted sm:px-6">
        <p>
          © {YEAR} {profile.name}
        </p>
        <div className="flex items-center gap-4">
          <p className="hidden sm:block">
            <kbd>{mac ? '⌘K' : 'Ctrl K'}</kbd> where to · <kbd>X</kbd> x-ray
          </p>
          <button
            type="button"
            aria-pressed={xray}
            onClick={toggleXray}
            aria-keyshortcuts="X"
            className="group flex items-center gap-2 rounded-full border border-line px-3 py-1.5 transition hover:border-accent hover:text-fg aria-pressed:border-accent aria-pressed:text-accent"
          >
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-line group-aria-pressed:bg-accent" />
            x-ray
          </button>
        </div>
      </div>
    </footer>
  )
}
