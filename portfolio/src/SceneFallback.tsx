/**
 * Static background glow. Always rendered under the 3D canvas: it shows while the Three.js
 * chunk loads, and stays as the background if WebGL is missing or the scene crashes.
 */
export default function SceneFallback() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-ink" aria-hidden>
      <div className="absolute right-[8%] top-[18%] h-[28rem] w-[28rem] rounded-full bg-[#2b2bff]/25 blur-3xl" />
      <div className="absolute right-[18%] top-[30%] h-64 w-64 rounded-full bg-neon/15 blur-3xl" />
    </div>
  )
}
