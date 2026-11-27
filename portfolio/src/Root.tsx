import { StrictMode } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import App from './App'

/**
 * The whole tree, shared by the browser entry (main.tsx) and the build-time pre-render
 * (entry-server.tsx), so the HTML React hydrates is exactly what it would render.
 */
export default function Root() {
  return (
    <StrictMode>
      <App />
      {/* Vercel Web Analytics (cookie-free page views) and Speed Insights (real-visitor Core Web
          Vitals). Each loads a small script from the site's own /_vercel path once enabled in the
          Vercel dashboard. They render nothing, so they're safe to pre-render. */}
      <Analytics />
      <SpeedInsights />
    </StrictMode>
  )
}
