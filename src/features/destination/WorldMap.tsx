import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { geoOrthographic, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { FeatureCollection, Geometry } from 'geojson'
import { gsap } from '@/lib/gsap'
import { DESTINATIONS } from '@/data/destinations'
import type { Destination } from '@/state/types'
import { project, isVisible, type Rotation } from '@/lib/projection'
import { DestinationMarker } from '@/features/destination/DestinationMarker'
import worldData from 'world-atlas/countries-110m.json'

const MIN_SCALE = 1
const MAX_SCALE = 3.5
const ZOOM_STEP = 0.3
const INITIAL_SCALE = 1.1
const PHI_CLAMP = 80

interface WorldMapProps {
  selected: Destination | null
  onSelect: (destination: Destination) => void
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

const worldFeature = feature(
  worldData as unknown as Topology,
  (worldData as { objects: { countries: GeometryCollection } }).objects.countries,
) as FeatureCollection<Geometry>

export function WorldMap({ selected, onSelect }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState<Rotation>({ lambda: -40, phi: -20 })
  const [scale, setScale] = useState(INITIAL_SCALE)
  const scaleRef = useRef(scale)
  const rotationRef = useRef(rotation)
  const [isDragging, setIsDragging] = useState(false)
  const activePointers = useRef(new Map<number, { x: number; y: number }>())
  const dragStart = useRef({ x: 0, y: 0, lambda: 0, phi: 0 })
  const pinchStart = useRef({ distance: 0, scale: 1 })
  const isFinePointer = useFinePointer()
  const planeRef = useRef<HTMLDivElement>(null)
  const quickPlaneX = useRef<ReturnType<typeof gsap.quickTo> | null>(null)
  const quickPlaneY = useRef<ReturnType<typeof gsap.quickTo> | null>(null)
  const quickPlaneRot = useRef<ReturnType<typeof gsap.quickTo> | null>(null)
  const lastPlanePos = useRef({ x: 0, y: 0 })

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

  const animateToDestination = useCallback(
    (destination: Destination) => {
      const targetScale = Math.max(scaleRef.current, destination.minZoom + 0.2)
      const targetRotation = { lambda: -destination.lon, phi: clamp(-destination.lat, -PHI_CLAMP, PHI_CLAMP) }
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (prefersReducedMotion) {
        setScale(targetScale)
        setRotation(targetRotation)
        return
      }

      const proxy = { scale: scaleRef.current, lambda: rotationRef.current.lambda, phi: rotationRef.current.phi }
      gsap.to(proxy, {
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
    },
    [],
  )

  useLayoutEffect(() => {
    if (selected) {
      animateToDestination(selected)
    }
  }, [selected, animateToDestination])

  const handleSelect = useCallback(
    (destination: Destination) => {
      onSelect(destination)
      animateToDestination(destination)
    },
    [onSelect, animateToDestination],
  )

  const zoomBy = useCallback((delta: number) => {
    setScale((prev) => clamp(prev + delta, MIN_SCALE, MAX_SCALE))
  }, [])

  const updatePointer = (pointerId: number, x: number, y: number) => {
    activePointers.current.set(pointerId, { x, y })
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    updatePointer(e.pointerId, e.clientX, e.clientY)

    if (activePointers.current.size === 1) {
      setIsDragging(true)
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        lambda: rotation.lambda,
        phi: rotation.phi,
      }
    } else if (activePointers.current.size === 2) {
      setIsDragging(false)
      const pointers = Array.from(activePointers.current.values())
      pinchStart.current = {
        distance: getDistance(pointers[0], pointers[1]),
        scale: scaleRef.current,
      }
    }

    containerRef.current?.setPointerCapture(e.pointerId)
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
    const factor = 140 / getContainerWidth()
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setRotation({
      lambda: dragStart.current.lambda - dx * factor,
      phi: clamp(dragStart.current.phi + dy * factor, -PHI_CLAMP, PHI_CLAMP),
    })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId)
    if (activePointers.current.size === 0) {
      setIsDragging(false)
    }
    containerRef.current?.releasePointerCapture(e.pointerId)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    zoomBy(e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP)
  }

  const projection = geoOrthographic()
    .scale(scale * 250)
    .translate([250, 250])
    .rotate([rotation.lambda, rotation.phi, 0])

  const pathGenerator = geoPath(projection)
  const coastline = pathGenerator(worldFeature)

  return (
    <div
      ref={containerRef}
      className="relative h-80 w-full cursor-grab overflow-hidden rounded-2xl border border-border bg-card active:cursor-grabbing md:h-[28rem]"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      <svg className="h-full w-full" viewBox="0 0 500 500">
        <circle cx="250" cy="250" r={scale * 250} fill="#dbeafe" stroke="#d6d3d1" strokeWidth={2} />
        {coastline && (
          <path d={coastline} fill="#f5f5f4" stroke="#d6d3d1" strokeWidth={1} />
        )}
        {DESTINATIONS.map((destination) => {
          const coords = project(destination.lat, destination.lon, rotation, scale)
          const visible =
            coords !== null &&
            isVisible(destination.lat, destination.lon, rotation) &&
            scale >= destination.minZoom
          return (
            <DestinationMarker
              key={destination.id}
              destination={destination}
              selected={selected?.id === destination.id}
              visible={visible}
              x={coords?.x ?? 0}
              y={coords?.y ?? 0}
              onSelect={handleSelect}
            />
          )
        })}
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
          className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-lg font-bold shadow-md active:scale-95"
          aria-label="Acercar"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoomBy(-ZOOM_STEP)}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-lg font-bold shadow-md active:scale-95"
          aria-label="Alejar"
        >
          −
        </button>
      </div>
    </div>
  )
}
