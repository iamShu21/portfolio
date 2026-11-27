/** Small spherical-earth helpers for the AR walk. Degrees in, degrees out. */

export type LatLon = { lat: number; lon: number }

const R_KM = 6371
const rad = (d: number) => (d * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI

/** Great-circle distance (haversine). */
export function distanceKm(a: LatLon, b: LatLon) {
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Initial compass bearing from a to b, 0 = north, clockwise. */
export function bearingDeg(a: LatLon, b: LatLon) {
  const φ1 = rad(a.lat)
  const φ2 = rad(b.lat)
  const Δλ = rad(b.lon - a.lon)
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return (deg(Math.atan2(y, x)) + 360) % 360
}

/** Any angle folded into (-180, 180]. Positive = to the right. */
export const norm180 = (d: number) => {
  const a = ((((d + 180) % 360) + 360) % 360) - 180
  return a === -180 ? 180 : a
}

/** Ease an angle towards a target the short way round (for smoothing compass jitter). */
export const easeAngle = (from: number, to: number, k: number) => (from + norm180(to - from) * k + 360) % 360

const POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
export const compassPoint = (d: number) => POINTS[Math.round((((d % 360) + 360) % 360) / 45) % 8]

export function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km).toLocaleString('en-US')} km`
}
