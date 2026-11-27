import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import Root from './Root'

const el = document.getElementById('root')!

// Production HTML is pre-rendered at build time (scripts/prerender.mjs): attach to it instead
// of rebuilding it. The dev server serves an empty #root, so render from scratch there.
if (el.firstElementChild) hydrateRoot(el, <Root />)
else createRoot(el).render(<Root />)
