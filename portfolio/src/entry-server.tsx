import { renderToString } from 'react-dom/server'
import Root from './Root'

/** Build-time only: the page as HTML, injected into dist/index.html by scripts/prerender.mjs. */
export function render() {
  return renderToString(<Root />)
}
