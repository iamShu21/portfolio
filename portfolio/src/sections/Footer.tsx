import { profile } from '../content'

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 px-4 py-8 font-mono text-xs text-muted sm:px-6">
        <p>
          © {YEAR} {profile.name}
        </p>
        <p>built with React + Tailwind</p>
      </div>
    </footer>
  )
}
