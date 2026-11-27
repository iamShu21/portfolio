import { useEffect, useState } from 'react'
import latestPush from 'virtual:latest-push'
import { now } from '../content'

const clock = new Intl.DateTimeFormat('en-US', { timeZone: now.timeZone, hour: 'numeric', minute: '2-digit' })
const hourOf = new Intl.DateTimeFormat('en-US', { timeZone: now.timeZone, hour: 'numeric', hourCycle: 'h23' })
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

function ago(iso: string, at: number) {
  const s = (new Date(iso).getTime() - at) / 1000
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, secs] of steps) if (Math.abs(s) >= secs) return rtf.format(Math.round(s / secs), unit)
  return 'just now'
}

/** Local time where I am, a guess at what I'm doing, what I'm learning, and my last public push. */
export default function NowStrip() {
  const [t, setT] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setT(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const hour = Number(hourOf.format(t))
  const mood = [...now.moods].reverse().find((m) => hour >= m.from)?.text

  return (
    <div
      data-xray="NowStrip · Intl in Asia/Manila; last push fetched at build time, not by your browser"
      className="mt-4 divide-y divide-line rounded-2xl border border-line bg-card font-mono text-xs"
    >
      <p className="flex flex-wrap items-baseline gap-x-2 px-4 py-3">
        <span className="text-muted">now</span>
        <time dateTime={new Date(t).toISOString()} className="text-fg">
          {clock.format(t)}
        </time>
        <span className="text-muted">in {now.city}</span>
        <span className="text-muted">·</span>
        <span className="text-fg">{mood}</span>
      </p>
      <p className="flex flex-wrap items-baseline gap-x-2 px-4 py-3">
        <span className="text-muted">learning</span>
        <span className="text-fg">{now.learning}</span>
      </p>
      {latestPush && (
        <p className="flex min-w-0 items-baseline gap-x-2 px-4 py-3">
          <span className="shrink-0 text-muted">pushed</span>
          <span aria-hidden className="hidden shrink-0 text-muted sm:inline">{latestPush.repo.split('/')[1]}:</span>
          <a
            href={latestPush.url}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 truncate text-fg underline decoration-line underline-offset-4 hover:text-accent hover:decoration-accent"
            title={`${latestPush.repo}: ${latestPush.message}`}
          >
            {latestPush.message}
            <span className="sr-only"> in {latestPush.repo} (opens in a new tab)</span>
          </a>
          <span className="shrink-0 text-muted">{ago(latestPush.date, t)}</span>
        </p>
      )}
    </div>
  )
}
