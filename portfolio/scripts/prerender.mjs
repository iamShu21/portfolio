// Pre-render: put the page's HTML into dist/index.html so search engines, link previews and
// slow phones get real content before any JavaScript runs. React then hydrates it (main.tsx).
// Runs after `vite build` and `vite build --ssr src/entry-server.tsx --outDir dist-ssr`.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const SSR_DIR = path.resolve('dist-ssr')
const PAGE = path.resolve('dist/index.html')
const MARKER = '<div id="root"></div>'

const { render } = await import(pathToFileURL(path.join(SSR_DIR, 'entry-server.js')).href)
const html = fs.readFileSync(PAGE, 'utf8')
if (!html.includes(MARKER)) throw new Error(`prerender: ${MARKER} not found in dist/index.html`)

const app = render()
// A replacer function, so "$&"-style sequences in the page text are never treated as patterns.
fs.writeFileSync(PAGE, html.replace(MARKER, () => `<div id="root">${app}</div>`))
fs.rmSync(SSR_DIR, { recursive: true, force: true })
console.log(`prerender: ${(app.length / 1024).toFixed(1)} kB of HTML written into dist/index.html`)
