import { MoonIcon, SunIcon } from '../icons'
import { toggleTheme, useTheme } from '../theme'

/** Light/dark switch. The new theme grows out of the button (see theme.ts). */
export default function ThemeToggle() {
  const theme = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
      }}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="grid h-9 w-9 place-items-center rounded-full border border-line bg-card text-muted transition hover:border-accent hover:text-accent"
    >
      {/* Both icons are in the HTML; CSS shows the right one, even before React has loaded. */}
      <SunIcon className="hidden h-4 w-4 dark:block" />
      <MoonIcon className="h-4 w-4 dark:hidden" />
    </button>
  )
}
