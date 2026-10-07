import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { geoGraticule10, geoOrthographic, geoPath } from 'd3-geo'
import { feature, mesh } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import type { FeatureCollection, Geometry } from 'geojson'
import { gsap } from '@/lib/gsap'
import { DESTINATIONS } from '@/data/destinations'
import type { Destination } from '@/state/types'
import { COUNTRY_DESTINATIONS, PLACE_DESTINATIONS, PLACES } from '@/data/places'
import { isVisible, project, type Rotation } from '@/lib/projection'
import { DestinationMarker } from '@/features/destination/DestinationMarker'
import { PlaceMarker } from '@/features/destination/PlaceMarker'
import worldData from 'world-atlas/countries-110m.json'

const MIN_SCALE = 1
const MAX_SCALE = 3.5
const ZOOM_STEP = 0.3
const INITIAL_SCALE = 1.15
const PHI_CLAMP = 80
const DRAG_DEGREES = 120
const TAP_THRESHOLD_PX = 10
const INERTIA_MIN_SPEED = 60
const INERTIA_THROW_SECONDS = 0.35
const MIN_LABEL_GAP = 26
const SELECTABLE_MATCH_DEGREES = 0.6

interface WorldMapProps {
  selected: Destination[]
  onSelect: (destination: Destination) => void
  'aria-label'?: string
}

function useFinePointer() {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia('(pointer: fine)')
      mq.addEventListener('change', callback)
      return () => mq.removeEventListener('change', callback)
    },
    () => window.matchMedia('(pointer: fine)').matches,
    () => false,
  )
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const getDistance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y)

const worldTopology = worldData as unknown as Topology
const countriesObject = (worldData as { objects: { countries: GeometryCollection } }).objects.countries
const landFeature = feature(worldTopology, countriesObject) as FeatureCollection<Geometry>
const borderLines = mesh(worldTopology, countriesObject, (a, b) => a !== b)
const graticule = geoGraticule10()

const COUNTRY_BY_ID = new Map<string, Destination>()
for (const country of COUNTRY_DESTINATIONS) {
  COUNTRY_BY_ID.set(country.id, country)
}

const DESTINATION_BY_ID = new Map<string, Destination>(COUNTRY_BY_ID)
for (const place of PLACE_DESTINATIONS) {
  DESTINATION_BY_ID.set(place.id, place)
}
for (const destination of DESTINATIONS) {
  DESTINATION_BY_ID.set(destination.id, destination)
}

export function WorldMap({ selected, onSelect, 'aria-label': ariaLabel }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState<Rotation>({ lambda: 60, phi: 15 })
  const [scale, setScale] = useState(INITIAL_SCALE)
  const scaleRef = useRef(scale)
  const rotationRef = useRef(rotation)
  const [isDragging, setIsDragging] = useState(false)
  const activePointers = useRef(new Map<number, { x: number; y: number }>())
  const dragStart = useRef({ x: 0, y: 0, lambda: 0, phi: 0, markerId: null as string | null })
  const pinchStart = useRef({ distance: 0, scale: 1 })
  const velocity = useRef({ x: 0, y: 0 })
  const lastMove = useRef({ x: 0, y: 0, t: 0 })
  const motionTween = useRef<gsap.core.Tween | null>(null)
  const isFinePointer = useFinePointer()
  const planeRef = useRef<HTMLDivElement>(null)
  const quickPlaneX = useRef<ReturnType<typeof gsap.quickTo> | null>(null)
  const quickPlaneY = useRef<ReturnType<typeof gsap.quickTo> | null>(null)
  const quickPlaneRot = useRef<ReturnType<typeof gsap.quickTo> | null>(null)
  const lastPlanePos = useRef({ x: 0, y: 0 })
  const selectedCountRef = useRef(selected.length)

  useEffect(() => {
    scaleRef.current = scale
  }, [scale])

  useEffect(() => {
    rotationRef.current = rotation
  }, [rotation])

  useEffect(() => {
    const el = planeRef.current
    if (!el || !isFinePointer) return
    quickPlaneX.current = gsap.quickTo(el, 'x', { duration: 0.25, ease: 'power2.out' })
    quickPlaneY.current = gsap.quickTo(el, 'y', { duration: 0.25, ease: 'power2.out' })
    quickPlaneRot.current = gsap.quickTo(el, 'rotation', { duration: 0.2, ease: 'power2.out' })
  }, [isFinePointer])

  const getContainerWidth = useCallback(() => {
    return containerRef.current?.getBoundingClientRect().width ?? 1
  }, [])

  const animateToDestination = useCallback((destination: Destination) => {
    const currentLambda = rotationRef.current.lambda
    const rawLambda = -destination.lon
    const targetRotation = {
      lambda: rawLambda + 360 * Math.round((currentLambda - rawLambda) / 360),
      phi: clamp(-destination.lat, -PHI_CLAMP, PHI_CLAMP),
    }
    const targetScale = Math.max(scaleRef.current, destination.minZoom + 0.2)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    motionTween.current?.kill()

    if (prefersReducedMotion) {
      setScale(targetScale)
      setRotation(targetRotation)
      return
    }

    const proxy = { scale: scaleRef.current, lambda: currentLambda, phi: rotationRef.current.phi }
    motionTween.current = gsap.to(proxy, {
      scale: targetScale,
      lambda: targetRotation.lambda,
      phi: targetRotation.phi,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => {
        setScale(proxy.scale)
        setRotation({ lambda: proxy.lambda, phi: proxy.phi })
      },
    })
  }, [])

  useLayoutEffect(() => {
    const previousCount = selectedCountRef.current
    selectedCountRef.current = selected.length
    if (selected.length > previousCount && selected.length > 0) {
      animateToDestination(selected[selected.length - 1])
    }
  }, [selected, animateToDestination])

  const handleSelect = useCallback(
    (destination: Destination) => {
      onSelect(destination)
    },
    [onSelect],
  )

  const zoomBy = useCallback((delta: number) => {
    motionTween.current?.kill()
    setScale((prev) => clamp(prev + delta, MIN_SCALE, MAX_SCALE))
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleNativeWheel = (event: WheelEvent) => {
      event.preventDefault()
      zoomBy(event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP)
    }
    el.addEventListener('wheel', handleNativeWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleNativeWheel)
  }, [zoomBy])

  const updatePointer = (pointerId: number, x: number, y: number) => {
    activePointers.current.set(pointerId, { x, y })
  }

  const startInertia = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (performance.now() - lastMove.current.t > 80) return
    const speed = Math.hypot(velocity.current.x, velocity.current.y)
    if (speed < INERTIA_MIN_SPEED) return
    const factor = DRAG_DEGREES / (scaleRef.current * getContainerWidth())
    const proxy = { lambda: rotationRef.current.lambda, phi: rotationRef.current.phi }
    motionTween.current = gsap.to(proxy, {
      lambda: proxy.lambda + velocity.current.x * factor * INERTIA_THROW_SECONDS,
      phi: clamp(proxy.phi - velocity.current.y * factor * INERTIA_THROW_SECONDS, -PHI_CLAMP, PHI_CLAMP),
      duration: 0.8,
      ease: 'power3.out',
      onUpdate: () => setRotation({ lambda: proxy.lambda, phi: proxy.phi }),
    })
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    motionTween.current?.kill()
    updatePointer(e.pointerId, e.clientX, e.clientY)

    if (activePointers.current.size === 1) {
      const target = e.target
      const markerId =
        target instanceof Element
          ? (target.closest('[data-marker-id]')?.getAttribute('data-marker-id') ?? null)
          : null
      setIsDragging(true)
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        lambda: rotationRef.current.lambda,
        phi: rotationRef.current.phi,
        markerId,
      }
      velocity.current = { x: 0, y: 0 }
      lastMove.current = { x: e.clientX, y: e.clientY, t: performance.now() }
    } else if (activePointers.current.size === 2) {
      setIsDragging(false)
      dragStart.current.markerId = null
      const pointers = Array.from(activePointers.current.values())
      pinchStart.current = {
        distance: getDistance(pointers[0], pointers[1]),
        scale: scaleRef.current,
      }
    }

    try {
      containerRef.current?.setPointerCapture(e.pointerId)
    } catch {
      return
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isFinePointer && quickPlaneX.current && quickPlaneY.current && quickPlaneRot.current) {
      const dx = e.clientX - lastPlanePos.current.x
      const dy = e.clientY - lastPlanePos.current.y
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90
      quickPlaneX.current(e.clientX)
      quickPlaneY.current(e.clientY)
      quickPlaneRot.current(Number.isFinite(angle) ? angle : -45)
      lastPlanePos.current = { x: e.clientX, y: e.clientY }
    }

    if (!activePointers.current.has(e.pointerId)) return
    updatePointer(e.pointerId, e.clientX, e.clientY)

    if (activePointers.current.size === 2) {
      const pointers = Array.from(activePointers.current.values())
      const distance = getDistance(pointers[0], pointers[1])
      if (distance > 0 && pinchStart.current.distance > 0) {
        const newScale = pinchStart.current.scale * (distance / pinchStart.current.distance)
        setScale(clamp(newScale, MIN_SCALE, MAX_SCALE))
      }
      return
    }

    if (!isDragging) return

    const now = performance.now()
    const dt = now - lastMove.current.t
    if (dt > 4) {
      const instantX = ((e.clientX - lastMove.current.x) / dt) * 1000
      const instantY = ((e.clientY - lastMove.current.y) / dt) * 1000
      velocity.current = {
        x: velocity.current.x * 0.6 + instantX * 0.4,
        y: velocity.current.y * 0.6 + instantY * 0.4,
      }
    }
    lastMove.current = { x: e.clientX, y: e.clientY, t: now }

    const factor = DRAG_DEGREES / (scaleRef.current * getContainerWidth())
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setRotation({
      lambda: dragStart.current.lambda + dx * factor,
      phi: clamp(dragStart.current.phi - dy * factor, -PHI_CLAMP, PHI_CLAMP),
    })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    const wasSinglePointer = activePointers.current.size === 1
    const start = dragStart.current
    activePointers.current.delete(e.pointerId)

    if (
      wasSinglePointer &&
      start.markerId &&
      Math.hypot(e.clientX - start.x, e.clientY - start.y) < TAP_THRESHOLD_PX
    ) {
      const destination = DESTINATION_BY_ID.get(start.markerId)
      if (destination) handleSelect(destination)
    } else if (wasSinglePointer && isDragging) {
      startInertia()
    }

    if (activePointers.current.size === 0) {
      setIsDragging(false)
    } else if (activePointers.current.size === 1) {
      const [remaining] = Array.from(activePointers.current.values())
      dragStart.current = {
        x: remaining.x,
        y: remaining.y,
        lambda: rotationRef.current.lambda,
        phi: rotationRef.current.phi,
        markerId: null,
      }
      velocity.current = { x: 0, y: 0 }
      lastMove.current = { x: remaining.x, y: remaining.y, t: performance.now() }
      setIsDragging(true)
    }

    if (containerRef.current?.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId)
    }
  }

  const projection = geoOrthographic()
    .scale(scale * 250)
    .translate([250, 250])
    .rotate([rotation.lambda, rotation.phi, 0])

  const pathGenerator = geoPath(projection)
  const landPath = pathGenerator(landFeature)
  const bordersPath = pathGenerator(borderLines)
  const graticulePath = pathGenerator(graticule)
  const globeRadius = scale * 250

  const orderedDestinations = [...DESTINATIONS].sort(
    (a, b) => Number(selected.some((d) => d.id === a.id)) - Number(selected.some((d) => d.id === b.id)),
  )

  const destinationsToRender = orderedDestinations.map((destination) => {
    const coords = project(destination.lat, destination.lon, rotation, scale)
    const isSelected = selected.some((d) => d.id === destination.id)
    const visible =
      coords !== null &&
      isVisible(destination.lat, destination.lon, rotation) &&
      (scale >= destination.minZoom || isSelected)
    return { destination, isSelected, visible, x: coords?.x ?? 0, y: coords?.y ?? 0 }
  })

  const placedLabels = destinationsToRender
    .filter((entry) => entry.visible)
    .map((entry) => ({ x: entry.x, y: entry.y }))

  for (const place of PLACES) {
    const isSelected = selected.some((d) => d.id === place.id)
    if (!isSelected) continue
    if (!isVisible(place.lat, place.lon, rotation)) continue
    const coords = projection([place.lon, place.lat])
    if (!coords) continue
    placedLabels.push({ x: coords[0], y: coords[1] })
  }

  const countryMarkers: { destination: Destination; x: number; y: number; showLabel: boolean }[] = []
  for (const place of PLACES) {
    if (place.kind !== 'country') continue
    const destination = COUNTRY_BY_ID.get(place.id)
    if (!destination) continue
    const isSelected = selected.some((d) => d.id === place.id)
    if (place.maxZoom !== undefined && scale >= place.maxZoom && !isSelected) continue
    if (!isVisible(place.lat, place.lon, rotation)) continue
    const coords = projection([place.lon, place.lat])
    if (!coords) continue
    const x = coords[0]
    const y = coords[1]
    const overlapping =
      !isSelected && placedLabels.some((p) => Math.hypot(p.x - x, p.y - y) < MIN_LABEL_GAP)
    if (overlapping) {
      countryMarkers.push({ destination, x, y, showLabel: false })
    } else {
      placedLabels.push({ x, y })
      countryMarkers.push({ destination, x, y, showLabel: true })
    }
  }

  const placeMarkers: { place: (typeof PLACES)[number]; x: number; y: number; showLabel: boolean }[] = []
  for (const place of PLACES.filter((p) => p.kind !== 'country')) {
    const matchesSelectable = DESTINATIONS.some(
      (d) => Math.hypot(d.lat - place.lat, d.lon - place.lon) < SELECTABLE_MATCH_DEGREES,
    )
    if (matchesSelectable) continue
    const isSelected = selected.some((d) => d.id === place.id)
    if (scale < place.minZoom && !isSelected) continue
    if (!isVisible(place.lat, place.lon, rotation)) continue
    const coords = projection([place.lon, place.lat])
    if (!coords) continue
    const x = coords[0]
    const y = coords[1]
    const overlapping =
      !isSelected && placedLabels.some((p) => Math.hypot(p.x - x, p.y - y) < MIN_LABEL_GAP)
    if (overlapping) {
      placeMarkers.push({ place, x, y, showLabel: false })
    } else {
      placedLabels.push({ x, y })
      placeMarkers.push({ place, x, y, showLabel: true })
    }
  }

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label={ariaLabel}
      className="relative h-80 w-full cursor-grab touch-none overflow-hidden rounded-2xl border border-border bg-[#dff2fd] select-none [-webkit-tap-highlight-color:transparent] active:cursor-grabbing md:h-[28rem]"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <svg className="h-full w-full" viewBox="0 0 500 500">
        <defs>
          <radialGradient id="ocean-gradient" cx="38%" cy="32%" r="80%">
            <stop offset="0%" stopColor="#a3e2ff" />
            <stop offset="55%" stopColor="#57b6f0" />
            <stop offset="100%" stopColor="#1f82cc" />
          </radialGradient>
          <radialGradient id="globe-shade" cx="50%" cy="50%" r="50%">
            <stop offset="72%" stopColor="#0b4a6f" stopOpacity="0" />
            <stop offset="100%" stopColor="#0b4a6f" stopOpacity="0.28" />
          </radialGradient>
        </defs>

        <circle cx={250} cy={250} r={globeRadius + 7} fill="#a8dcf7" opacity={0.6} />
        <circle cx={250} cy={250} r={globeRadius} fill="url(#ocean-gradient)" />
        {graticulePath && (
          <path d={graticulePath} fill="none" stroke="#ffffff" strokeWidth={0.6} opacity={0.3} />
        )}
        {landPath && <path d={landPath} fill="#5ecf7c" stroke="none" />}
        {bordersPath && (
          <path d={bordersPath} fill="none" stroke="#2f9e53" strokeWidth={0.7} opacity={0.65} />
        )}
        <circle cx={250} cy={250} r={globeRadius} fill="url(#globe-shade)" />

        {countryMarkers.map(({ destination, x, y, showLabel }) => (
          <DestinationMarker
            key={destination.id}
            destination={destination}
            selected={selected.some((d) => d.id === destination.id)}
            visible
            x={x}
            y={y}
            onSelect={handleSelect}
            showLabel={showLabel}
          />
        ))}

        {placeMarkers.map(({ place, x, y, showLabel }) => {
          const destination = DESTINATION_BY_ID.get(place.id)
          return (
            <PlaceMarker
              key={place.id}
              id={place.id}
              name={place.name}
              kind={place.kind as 'capital' | 'city'}
              showLabel={showLabel}
              x={x}
              y={y}
              selected={selected.some((d) => d.id === place.id)}
              onSelect={() => {
                if (destination) handleSelect(destination)
              }}
            />
          )
        })}

        {destinationsToRender
          .filter((entry) => entry.visible)
          .map(({ destination, isSelected, x, y }) => (
            <PlaceMarker
              key={destination.id}
              id={destination.id}
              name={destination.name}
              kind="capital"
              showLabel
              x={x}
              y={y}
              selected={isSelected}
              onSelect={() => handleSelect(destination)}
            />
          ))}
      </svg>

      {isFinePointer && (
        <div
          ref={planeRef}
          className="pointer-events-none fixed left-0 top-0 z-20 hidden md:block"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#0d9488">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </div>
      )}

      <div className="absolute bottom-3 right-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => zoomBy(ZOOM_STEP)}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/90 text-lg font-bold shadow-md transition-colors hover:bg-card active:scale-95"
          aria-label="Acercar"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoomBy(-ZOOM_STEP)}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/90 text-lg font-bold shadow-md transition-colors hover:bg-card active:scale-95"
          aria-label="Alejar"
        >
          −
        </button>
      </div>
    </div>
  )
}
