import { geoOrthographic } from 'd3-geo'

export const GLOBE_RADIUS = 250
export const GLOBE_CENTER = { x: 250, y: 250 }

export interface Point {
  x: number
  y: number
}

export interface GeoPoint {
  lat: number
  lon: number
}

export interface Rotation {
  lambda: number
  phi: number
}

function createProjection(rotation: Rotation, scale: number) {
  return geoOrthographic()
    .scale(scale * GLOBE_RADIUS)
    .translate([GLOBE_CENTER.x, GLOBE_CENTER.y])
    .rotate([rotation.lambda, rotation.phi, 0])
}

export function project(lat: number, lon: number, rotation: Rotation, scale: number): Point | null {
  const projection = createProjection(rotation, scale)
  const coords = projection([lon, lat])
  if (!coords) return null
  return { x: coords[0], y: coords[1] }
}

export function inverseProject(x: number, y: number, rotation: Rotation, scale: number): GeoPoint | null {
  const projection = createProjection(rotation, scale)
  const coords = projection.invert?.([x, y])
  if (!coords) return null
  return { lat: coords[1], lon: coords[0] }
}

export function isVisible(lat: number, lon: number, rotation: Rotation, scale: number): boolean {
  const projection = createProjection(rotation, scale)
  const coords = projection([lon, lat])
  if (!coords) return false
  const dx = coords[0] - GLOBE_CENTER.x
  const dy = coords[1] - GLOBE_CENTER.y
  return dx * dx + dy * dy <= GLOBE_RADIUS * GLOBE_RADIUS * scale * scale
}
