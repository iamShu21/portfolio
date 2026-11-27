import { useEffect, useState } from 'react'
import { setXray, toggleXray, useXray } from '../xray'
import { useTheme } from '../theme'
import { useReducedMotion } from '../motion'

const kB = (bytes: number) => `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} kB`

/** Bytes, plus files whose size the browser won't reveal (cross-origin, e.g. Google Fonts). */
type Size = { bytes: number; hidden: number }
type Stats = { js: Size; css: Size; fonts: Size; media: Size; total: Size; requests: number; nodes: number; dcl: number; lcp: number | null }

function show({ bytes, hidden }: Size) {
  if (!hidden) return kB(bytes)
  const files = `${hidden} cross-origin file${hidden > 1 ? 's' : ''}`
  return bytes ? `${kB(bytes)} + ${files}` : files
}

/** What this page actually cost the visitor's browser, measured live with the Performance API. */
function measure(lcp: number | null): Stats {
  const res = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  // transferSize is 0 for cached files; the encoded (compressed) size is what was sent originally.
  const size = (r: PerformanceResourceTiming) => r.transferSize || r.encodedBodySize
  const sum = (test: (r: PerformanceResourceTiming) => boolean): Size => {
    const picked = res.filter(test)
    return { bytes: picked.reduce((n, r) => n + size(r), 0), hidden: picked.filter((r) => !size(r)).length }
  }
  const ext = (r: PerformanceResourceTiming, re: RegExp) => re.test(new URL(r.name).pathname)
  const js = sum((r) => r.initiatorType === 'script' || ext(r, /\.[mc]?[jt]sx?$/))
  const css = sum((r) => ext(r, /\.css$/) || r.name.includes('fonts.googleapis.com'))
  const fonts = sum((r) => ext(r, /\.(woff2?|ttf|otf)$/))
  const media = sum((r) => ext(r, /\.(webp|png|jpe?g|svg|gif|avif|mp4|webm)$/))
  const all = sum(() => true)
  const total = { ...all, bytes: all.bytes + (nav ? size(nav) : 0) }
  return {
    js,
    css,
    fonts,
    media,
    total,
    requests: res.length + 1,
    nodes: document.getElementsByTagName('*').length,
    dcl: nav ? Math.round(nav.domContentLoadedEventEnd) : 0,
    lcp,
  }
}

/** The X key, plus a small panel of live numbers while X-ray mode is on. */
export default function Xray() {
  const on = useXray()
  const theme = useTheme()
  const reduced = useReducedMotion()
  const [lcp, setLcp] = useState<number | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'x' || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return
      if (document.querySelector('dialog[open]')) return
      toggleXray()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Largest Contentful Paint, from the buffer, so it works even when X-ray opens later.
  useEffect(() => {
    if (!PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')) return
    const po = new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1)
      if (last) setLcp(Math.round(last.startTime))
    })
    po.observe({ type: 'largest-contentful-paint', buffered: true })
    return () => po.disconnect()
  }, [])

  useEffect(() => {
    if (!on) return
    const update = () => setStats(measure(lcp))
    update()
    const id = setInterval(update, 2000)
    return () => clearInterval(id)
  }, [on, lcp])

  if (!on || !stats) return null
  const rows: [string, string][] = [
    ['JavaScript', show(stats.js)],
    ['CSS', show(stats.css)],
    ['fonts', show(stats.fonts)],
    ['images + video', show(stats.media)],
    ['total so far', `${kB(stats.total.bytes)} · ${stats.requests} requests`],
    ['DOM elements', String(stats.nodes)],
    ['DOM ready', `${stats.dcl} ms`],
    ['largest paint', stats.lcp === null ? 'n/a' : `${stats.lcp} ms`],
    ['theme', theme],
    ['reduced motion', reduced ? 'on' : 'off'],
  ]

  return (
    <aside
      aria-label="X-ray build mode"
      className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl border border-accent bg-card/95 p-4 font-mono text-xs shadow-2xl backdrop-blur sm:left-auto sm:w-72"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-accent">x-ray · measured live</p>
        <button type="button" onClick={() => setXray(false)} className="rounded-full border border-line px-2.5 py-1 text-muted transition hover:border-accent hover:text-fg">
          close
        </button>
      </div>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted">{k}</dt>
            <dd className="text-right">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 leading-relaxed text-muted">Sizes are compressed bytes over the wire. Dashed boxes say how each part is built. Press X to close.</p>
    </aside>
  )
}
