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
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
