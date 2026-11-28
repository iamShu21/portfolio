import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'

// '/' for Vercel or a <user>.github.io repo. For a GitHub Pages *project* site
// (https://<user>.github.io/<repo>/) build with BASE_PATH=/<repo>/.
const base = process.env.BASE_PATH || '/'

/**
 * Link-preview tags (Open Graph + Twitter card) built from the page's <title> and
 * description. Previews need absolute URLs, so the public address comes from SITE_URL
 * (full URL of the site root) or, on Vercel, its production domain. Without either,
 * the image URL stays relative: fine locally, but most link previews won't show it.
 */
function socialMeta(): Plugin {
  return {
    name: 'social-meta',
    transformIndexHtml(html) {
      const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
      const site = (process.env.SITE_URL || (vercel ? `https://${vercel}` : '')).replace(/\/$/, '')
      const url = (path = '') => (site ? `${site}/${path}` : `${base}${path}`)
      const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? ''
      const description = html.match(/<meta name="description" content="(.*?)"/)?.[1] ?? ''

      const meta = (key: 'name' | 'property', id: string, content: string): HtmlTagDescriptor => ({
        tag: 'meta',
        attrs: { [key]: id, content },
        injectTo: 'head',
      })
      const tags = [
        meta('property', 'og:type', 'website'),
        meta('property', 'og:title', title),
        meta('property', 'og:description', description),
        meta('property', 'og:image', url('og.jpg')),
        meta('property', 'og:image:width', '1200'),
        meta('property', 'og:image:height', '630'),
        meta('property', 'og:image:alt', 'Shuhari Alaihim Amoran, full-stack developer for web, mobile and AR, next to a map of campus walking routes with one route highlighted in gold'),
        meta('name', 'twitter:card', 'summary_large_image'),
      ]
      if (site) {
        tags.push(meta('property', 'og:url', url()))
        tags.push({ tag: 'link', attrs: { rel: 'canonical', href: url() }, injectTo: 'head' })
      }
      return tags
    },
  }
}

/**
 * `virtual:latest-push`: the newest commit pushed to a public repo of `user`, fetched once per
 * build (or dev-server start) so visitors never call the GitHub API themselves. The events API
 * no longer lists commits in a PushEvent, so the message comes from a second request for the
 * pushed head. Any failure (offline, rate limit) exports null and the page hides the line.
 * Set GITHUB_TOKEN in the build environment to avoid the shared 60 requests/hour limit.
 */
function latestPush(user: string): Plugin {
  const ID = 'virtual:latest-push'
  const headers: Record<string, string> = { 'User-Agent': 'portfolio-build', Accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  const get = async <T,>(path: string): Promise<T> => {
    const res = await fetch(`https://api.github.com${path}`, { headers, signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`)
    return (await res.json()) as T
  }
  let cached: Promise<string> | null = null
  // The pre-render build is a second Vite run in a new process; a short-lived file cache lets
  // both builds (and dev restarts) share one lookup instead of calling GitHub each time.
  const CACHE = 'node_modules/.cache/latest-push.json'
  const fromCache = () => {
    try {
      const c = JSON.parse(fs.readFileSync(CACHE, 'utf8')) as { at: number; user: string; code: string }
      return c.user === user && Date.now() - c.at < 10 * 60_000 ? c.code : null
    } catch {
      return null
    }
  }
  const toCache = (code: string) => {
    try {
      fs.mkdirSync(path.dirname(CACHE), { recursive: true })
      fs.writeFileSync(CACHE, JSON.stringify({ at: Date.now(), user, code }))
    } catch {
      /* caching is best-effort */
    }
  }
  const build = async () => {
    const hit = fromCache()
    if (hit) return hit
    try {
      type PushEvent = { type: string; created_at: string; repo: { name: string }; payload: { head?: string } }
      const events: PushEvent[] = await get(`/users/${user}/events/public?per_page=50`)
      const push = events
        .filter((e) => e.type === 'PushEvent' && e.payload.head)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
      if (!push) return 'export default null'
      const commit = await get<{ html_url: string; commit: { message: string } }>(`/repos/${push.repo.name}/commits/${push.payload.head}`)
      const message: string = commit.commit.message.split('\n')[0]
      const code = `export default ${JSON.stringify({ repo: push.repo.name, message, url: commit.html_url, date: push.created_at })}`
      toCache(code)
      return code
    } catch (err) {
      console.warn(`[latest-push] skipped: ${(err as Error).message}`)
      return 'export default null'
    }
  }
  return {
    name: 'latest-push',
    resolveId: (id) => (id === ID ? '\0' + ID : undefined),
    load(id) {
      if (id !== '\0' + ID) return
      return (cached ??= build())
    },
  }
}

export default defineConfig({
  base,
  define: {
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
    // e.g. 2026.83 in November: where "now" sits on the journey timeline.
    __BUILD_DECIMAL_YEAR__: JSON.stringify(new Date().getFullYear() + new Date().getMonth() / 12),
  },
  // The GitHub account whose public pushes the Now strip shows (same as profile.github).
  plugins: [react(), tailwindcss(), socialMeta(), latestPush('iamShu21')],
})
