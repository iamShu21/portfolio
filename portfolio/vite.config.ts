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
        meta('property', 'og:image:alt', 'Shuhari Alaihim Amoran, Full-Stack Developer, next to a glowing 3D orb'),
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

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), socialMeta()],
})
