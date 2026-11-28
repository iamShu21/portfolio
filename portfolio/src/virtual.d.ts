/** Year the site was built, for the footer (vite.config.ts `define`). */
declare const __BUILD_YEAR__: number
/** The build date as a decimal year (2026.83), for "now" on the journey timeline. */
declare const __BUILD_DECIMAL_YEAR__: number

/** Your newest public GitHub push, looked up at build time (see latestPush in vite.config.ts). */
declare module 'virtual:latest-push' {
  const push: { repo: string; message: string; url: string; date: string } | null
  export default push
}
