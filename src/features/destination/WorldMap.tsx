import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { geoGraticule10, geoOrthographic, geoPath } from 'd3-geo'
import { feature, mesh } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import type { FeatureCollection, Geometry } from 'geojson'
import { gsap } from '@/lib/gsap'
import { DESTINATIONS } from '@/data/destinations'
import type { Destination } from '@/state/types'
import { useStore } from '@/state/store'
import { COUNTRY_DESTINATIONS, PLACE_DESTINATIONS, PLACES } from '@/data/places'
import { isVisible, project, type Rotation } from '@/lib/projection'
import { DestinationMarker } from '@/features/destination/DestinationMarker'
import { PlaceMarker } from '@/features/destination/PlaceMarker'
import worldData from 'world-atlas/countries-110m.json'

const MIN_SCALE = 1
const MAX_SCALE = 13.31
const ZOOM_STEP = 0.3
const INITIAL_SCALE = 1.15
const INTRO_ZOOM_IN_SCALE = 3.5
const INTRO_DELAY_MS = 500
const INTRO_ZOOM_IN_DURATION = 2.5
const INTRO_ZOOM_OUT_DURATION = 2.5
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

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const getDistance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y)

const worldTopology = worldData as unknown as Topology
const countriesObject = (worldData as { objects: { countries: GeometryCollection } }).objects.countries
const landFeature = feature(worldTopology, countriesObject) as FeatureCollection<Geometry>
const borderLines = mesh(worldTopology, countriesObject, (a, b) => a !== b)
const graticule = geoGraticule10()

function createGlobeProjection(rotation: Rotation, scale: number) {
  return geoOrthographic().scale(scale * 250).translate([250, 250]).rotate([rotation.lambda, rotation.phi, 0])
}

function drawGlobe(ctx: CanvasRenderingContext2D, rotation: Rotation, scale: number, simplified = false) {
  const projection = createGlobeProjection(rotation, scale)
  const pathGenerator = geoPath(projection, ctx)
  const globeRadius = scale * 250

  ctx.clearRect(0, 0, 500, 500)

  ctx.beginPath()
  ctx.arc(250, 250, globeRadius + 7, 0, Math.PI * 2)
  ctx.fillStyle = '#a8dcf7'
  ctx.globalAlpha = 0.6
  ctx.fill()
  ctx.globalAlpha = 1

  const oceanGradient = ctx.createRadialGradient(
    250 - globeRadius * 0.12,
    250 - globeRadius * 0.18,
    0,
    250,
    250,
    globeRadius,
  )
  oceanGradient.addColorStop(0, '#a3e2ff')
  oceanGradient.addColorStop(0.55, '#57b6f0')
  oceanGradient.addColorStop(1, '#1f82cc')
  ctx.beginPath()
  ctx.arc(250, 250, globeRadius, 0, Math.PI * 2)
  ctx.fillStyle = oceanGradient
  ctx.fill()

  if (!simplified) {
    ctx.beginPath()
    pathGenerator(graticule)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 0.6
    ctx.globalAlpha = 0.3
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  ctx.beginPath()
  pathGenerator(landFeature)
  ctx.fillStyle = '#5ecf7c'
  ctx.fill()

  if (!simplified) {
    ctx.beginPath()
    pathGenerator(borderLines)
    ctx.strokeStyle = '#2f9e53'
    ctx.lineWidth = 0.7
    ctx.globalAlpha = 0.65
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  const shadeGradient = ctx.createRadialGradient(
    250,
    250,
    globeRadius * 0.72,
    250,
    250,
    globeRadius,
  )
  shadeGradient.addColorStop(0, 'rgba(11, 74, 111, 0)')
  shadeGradient.addColorStop(1, 'rgba(11, 74, 111, 0.28)')
  ctx.beginPath()
  ctx.arc(250, 250, globeRadius, 0, Math.PI * 2)
  ctx.fillStyle = shadeGradient
  ctx.fill()
}

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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState<Rotation>({ lambda: 60, phi: 15 })
  const [scale, setScale] = useState(INITIAL_SCALE)
  const scaleRef = useRef(scale)
  const rotationRef = useRef(rotation)
  const [isDragging, setIsDragging] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)
  const activePointers = useRef(new Map<number, { x: number; y: number }>())
  const dragStart = useRef({ x: 0, y: 0, lambda: 0, phi: 0, markerId: null as string | null })
  const pinchStart = useRef({ distance: 0, scale: 1 })
  const velocity = useRef({ x: 0, y: 0 })
  const lastMove = useRef({ x: 0, y: 0, t: 0 })
  const motionTween = useRef<gsap.core.Animation | null>(null)
  const skipIntroRef = useRef(false)
  const introStartedRef = useRef(false)
  const mountedRef = useRef(false)
  const selectedCountRef = useRef(selected.length)
  const rafRef = useRef<number | null>(null)
  const draggingRef = useRef(false)
  const gestureActiveRef = useRef(false)
  const gestureStartScale = useRef(1)
  const { hasSeenMapIntro, setHasSeenMapIntro } = useStore()

  const commitFrame = useCallback(() => {
    rafRef.current = null
    if (!mountedRef.current) return
    setRotation({ lambda: rotationRef.current.lambda, phi: rotationRef.current.phi })
    setScale(scaleRef.current)
  }, [])

  const scheduleFrame = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(commitFrame)
  }, [commitFrame])

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    scaleRef.current = scale
  }, [scale])

  useEffect(() => {
    rotationRef.current = rotation
  }, [rotation])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawGlobe(ctx, rotation, scale, isInteracting)
  }, [rotation, scale, isInteracting])

  useEffect(() => {
    if (hasSeenMapIntro || introStartedRef.current) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setHasSeenMapIntro(true)
      return
    }

    let introTween: gsap.core.Timeline | null = null
    const timeout = setTimeout(() => {
      setHasSeenMapIntro(true)
      if (skipIntroRef.current || introStartedRef.current) return
      introStartedRef.current = true
      const proxy = { scale: scaleRef.current }
      motionTween.current?.kill()
      introTween = gsap
        .timeline({
          onComplete: () => {
            if (mountedRef.current) {
              motionTween.current = null
            }
          },
        })
        .to(proxy, {
          scale: INTRO_ZOOM_IN_SCALE,
          duration: INTRO_ZOOM_IN_DURATION,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (mountedRef.current) {
              setScale(proxy.scale)
            }
          },
        })
        .to(proxy, {
          scale: INITIAL_SCALE,
          duration: INTRO_ZOOM_OUT_DURATION,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (mountedRef.current) {
              setScale(proxy.scale)
            }
          },
        })
      motionTween.current = introTween
    }, INTRO_DELAY_MS)

    return () => {
      clearTimeout(timeout)
    }
  }, [hasSeenMapIntro, setHasSeenMapIntro])

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
      const last = selected[selected.length - 1]
      if (!last.custom) {
        animateToDestination(last)
      }
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

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleGestureStart = (event: Event) => {
      event.preventDefault()
      gestureActiveRef.current = true
      gestureStartScale.current = scaleRef.current
    }
    const handleGestureChange = (event: Event) => {
      event.preventDefault()
      const gestureEvent = event as unknown as { scale: number }
      const newScale = clamp(gestureStartScale.current * gestureEvent.scale, MIN_SCALE, MAX_SCALE)
      if (newScale !== scaleRef.current) {
        scaleRef.current = newScale
        scheduleFrame()
      }
    }
    const handleGestureEnd = (event: Event) => {
      event.preventDefault()
      gestureActiveRef.current = false
    }
    el.addEventListener('gesturestart', handleGestureStart)
    el.addEventListener('gesturechange', handleGestureChange)
    el.addEventListener('gestureend', handleGestureEnd)
    return () => {
      el.removeEventListener('gesturestart', handleGestureStart)
      el.removeEventListener('gesturechange', handleGestureChange)
      el.removeEventListener('gestureend', handleGestureEnd)
    }
  }, [scheduleFrame])

  const startInertia = useCallback(() => {
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
  }, [getContainerWidth])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const getMarkerIdFromElement = (element: Element | null) =>
      element?.closest('[data-marker-id]')?.getAttribute('data-marker-id') ?? null

    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault()
      const target = event.target as Element | null
      if (target?.closest('button')) return

      const touches = event.touches
      if (touches.length === 1) {
        skipIntroRef.current = true
        motionTween.current?.kill()
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = null
        }
        draggingRef.current = true
        setIsInteracting(true)
        setIsDragging(true)

        const touch = touches[0]
        const markerId = getMarkerIdFromElement(target)
        dragStart.current = {
          x: touch.clientX,
          y: touch.clientY,
          lambda: rotationRef.current.lambda,
          phi: rotationRef.current.phi,
          markerId,
        }
        velocity.current = { x: 0, y: 0 }
        lastMove.current = { x: touch.clientX, y: touch.clientY, t: performance.now() }
      } else if (touches.length === 2) {
        setIsDragging(false)
        draggingRef.current = true
        setIsInteracting(true)
        dragStart.current.markerId = null
        const t1 = touches[0]
        const t2 = touches[1]
        pinchStart.current = {
          distance: Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY),
          scale: scaleRef.current,
        }
      }
    }

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault()
      if (!draggingRef.current) return
      const touches = event.touches
      if (touches.length === 2) {
        if (gestureActiveRef.current) return
        const t1 = touches[0]
        const t2 = touches[1]
        const distance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
        if (distance > 0 && pinchStart.current.distance > 0) {
          const newScale = clamp(
            pinchStart.current.scale * (distance / pinchStart.current.distance),
            MIN_SCALE,
            MAX_SCALE,
          )
          if (newScale !== scaleRef.current) {
            scaleRef.current = newScale
            scheduleFrame()
          }
        }
        return
      }
      if (touches.length !== 1) return

      const touch = touches[0]
      const now = performance.now()
      const dt = now - lastMove.current.t
      if (dt > 4) {
        const instantX = ((touch.clientX - lastMove.current.x) / dt) * 1000
        const instantY = ((touch.clientY - lastMove.current.y) / dt) * 1000
        velocity.current = {
          x: velocity.current.x * 0.6 + instantX * 0.4,
          y: velocity.current.y * 0.6 + instantY * 0.4,
        }
      }
      lastMove.current = { x: touch.clientX, y: touch.clientY, t: now }

      const factor = DRAG_DEGREES / (scaleRef.current * getContainerWidth())
      const dx = touch.clientX - dragStart.current.x
      const dy = touch.clientY - dragStart.current.y
      rotationRef.current = {
        lambda: dragStart.current.lambda + dx * factor,
        phi: clamp(dragStart.current.phi - dy * factor, -PHI_CLAMP, PHI_CLAMP),
      }
      scheduleFrame()
    }

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault()
      const touches = event.touches
      const changed = event.changedTouches[0]

      if (touches.length === 0) {
        const wasDragging = draggingRef.current
        draggingRef.current = false
        const start = dragStart.current
        const isTap =
          start.markerId &&
          changed &&
          Math.hypot(changed.clientX - start.x, changed.clientY - start.y) < TAP_THRESHOLD_PX
        if (isTap) {
          const destination = DESTINATION_BY_ID.get(start.markerId as string)
          if (destination) handleSelect(destination)
        } else if (wasDragging) {
          startInertia()
        }
        setIsDragging(false)
        setIsInteracting(false)
      } else if (touches.length === 1) {
        const touch = touches[0]
        dragStart.current = {
          x: touch.clientX,
          y: touch.clientY,
          lambda: rotationRef.current.lambda,
          phi: rotationRef.current.phi,
          markerId: null,
        }
        velocity.current = { x: 0, y: 0 }
        lastMove.current = { x: touch.clientX, y: touch.clientY, t: performance.now() }
        setIsDragging(true)
      }
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: false })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd, { passive: false })
    el.addEventListener('touchcancel', handleTouchEnd, { passive: false })
    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
      el.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [scheduleFrame, getContainerWidth, startInertia, handleSelect])

  const updatePointer = (pointerId: number, x: number, y: number) => {
    activePointers.current.set(pointerId, { x, y })
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return
    if (e.button !== 0) return
    skipIntroRef.current = true
    motionTween.current?.kill()
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    draggingRef.current = true
    setIsInteracting(true)
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
    if (e.pointerType === 'touch') return
    if (!activePointers.current.has(e.pointerId)) return
    updatePointer(e.pointerId, e.clientX, e.clientY)

    if (activePointers.current.size === 2) {
      if (gestureActiveRef.current) return
      const pointers = Array.from(activePointers.current.values())
      const distance = getDistance(pointers[0], pointers[1])
      if (distance > 0 && pinchStart.current.distance > 0) {
        const newScale = clamp(
          pinchStart.current.scale * (distance / pinchStart.current.distance),
          MIN_SCALE,
          MAX_SCALE,
        )
        if (newScale !== scaleRef.current) {
          scaleRef.current = newScale
          scheduleFrame()
        }
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
    rotationRef.current = {
      lambda: dragStart.current.lambda + dx * factor,
      phi: clamp(dragStart.current.phi - dy * factor, -PHI_CLAMP, PHI_CLAMP),
    }
    scheduleFrame()
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return
    const wasSinglePointer = activePointers.current.size === 1
    const start = dragStart.current
    activePointers.current.delete(e.pointerId)

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    commitFrame()
    draggingRef.current = false

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
      setIsInteracting(false)
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

  const projection = createGlobeProjection(rotation, scale)

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
      className="relative aspect-square w-full max-w-full cursor-grab touch-none overflow-hidden rounded-2xl border border-border bg-[#dff2fd] select-none [-webkit-tap-highlight-color:transparent] active:cursor-grabbing max-h-[24rem] md:max-h-[33rem]"
      style={{ touchAction: 'none', WebkitUserSelect: 'none', willChange: 'transform' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 500">

        {countryMarkers.map(({ destination, x, y, showLabel }) => (
          <DestinationMarker
            key={destination.id}
            destination={destination}
            selected={selected.some((d) => d.id === destination.id)}
            visible
            x={x}
            y={y}
            scale={scale}
            onSelect={handleSelect}
            showLabel={showLabel}
            dragging={isInteracting}
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
              scale={scale}
              dragging={isInteracting}
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
              scale={scale}
              dragging={isInteracting}
              onSelect={() => handleSelect(destination)}
            />
          ))}
      </svg>

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
