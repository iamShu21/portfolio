import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* Vercel Web Analytics (cookie-free page views) and Speed Insights (real-visitor Core Web
        Vitals). Each loads a small script from the site's own /_vercel path once enabled in the
        Vercel dashboard. */}
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
)
