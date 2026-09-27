const VIEWBOX_WIDTH = 1000
const VIEWBOX_HEIGHT = 500

export interface Point {
  x: number
  y: number
}

export interface GeoPoint {
  lat: number
  lon: number
}

export function project(lat: number, lon: number): Point {
  const x = ((lon + 180) / 360) * VIEWBOX_WIDTH
  const y = ((90 - lat) / 180) * VIEWBOX_HEIGHT
  return { x, y }
}

export function inverseProject(x: number, y: number): GeoPoint {
  const lon = (x / VIEWBOX_WIDTH) * 360 - 180
  const lat = 90 - (y / VIEWBOX_HEIGHT) * 180
  return { lat, lon }
}
