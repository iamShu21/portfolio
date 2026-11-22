// Framer Motion's animation features, loaded lazily by <LazyMotion> in App.tsx so they stay
// out of the main bundle. The page only animates style motion values (springs), which `m`
// components handle without these.
import { domAnimation } from 'framer-motion'

export default domAnimation
