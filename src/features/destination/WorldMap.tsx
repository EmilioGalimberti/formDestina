import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { gsap } from '@/lib/gsap'
import { DESTINATIONS } from '@/data/destinations'
import type { Destination } from '@/state/types'
import { DestinationMarker } from '@/features/destination/DestinationMarker'
import { Plane } from '@/features/destination/Plane'

const MIN_SCALE = 1
const MAX_SCALE = 5
const ZOOM_STEP = 0.6
const DEFAULT_SCALE = 2.2

interface Transform {
  x: number
  y: number
  scale: number
}

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

export function WorldMap({ selected, onSelect }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 })
  const transformRef = useRef(transform)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, transformX: 0, transformY: 0 })
  const [plane, setPlane] = useState({ x: 0, y: 0, rotation: -45 })
  const lastPlanePos = useRef({ x: 0, y: 0 })
  const isFinePointer = useFinePointer()

  useEffect(() => {
    transformRef.current = transform
  }, [transform])

  const getContainerSize = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect()
    return { width: rect?.width ?? 0, height: rect?.height ?? 0 }
  }, [])

  const getTargetTransformForDestination = useCallback(
    (destination: Destination, scale = DEFAULT_SCALE) => {
      const { width, height } = getContainerSize()
      const markerX = (destination.lon + 180) / 360
      const markerY = (90 - destination.lat) / 180
      const pixelX = markerX * width
      const pixelY = markerY * height
      return {
        x: width / 2 - pixelX * scale,
        y: height / 2 - pixelY * scale,
        scale,
      }
    },
    [getContainerSize],
  )

  const applyTransform = useCallback((target: Transform, immediate: boolean) => {
    const el = wrapperRef.current
    if (!el) return

    if (immediate) {
      setTransform(target)
      return
    }

    const proxy = { ...transformRef.current }
    gsap.to(proxy, {
      x: target.x,
      y: target.y,
      scale: target.scale,
      duration: 0.7,
      ease: 'power2.out',
      onUpdate: () => {
        setTransform({ x: proxy.x, y: proxy.y, scale: proxy.scale })
      },
    })
  }, [])

  useLayoutEffect(() => {
    if (!containerRef.current) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (selected) {
      applyTransform(getTargetTransformForDestination(selected), prefersReducedMotion)
    } else {
      const { width, height } = getContainerSize()
      applyTransform({ x: 0, y: 0, scale: Math.min(width / 1000, height / 500, 1) }, prefersReducedMotion)
    }
  }, [selected, applyTransform, getTargetTransformForDestination, getContainerSize])

  const handleSelect = useCallback(
    (destination: Destination) => {
      onSelect(destination)
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      applyTransform(getTargetTransformForDestination(destination), prefersReducedMotion)
    },
    [onSelect, applyTransform, getTargetTransformForDestination],
  )

  const zoomBy = useCallback(
    (delta: number) => {
      const { width, height } = getContainerSize()
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, transform.scale + delta))
      const centerX = width / 2
      const centerY = height / 2
      const newX = centerX - (centerX - transform.x) * (newScale / transform.scale)
      const newY = centerY - (centerY - transform.y) * (newScale / transform.scale)
      applyTransform({ x: newX, y: newY, scale: newScale }, false)
    },
    [applyTransform, getContainerSize, transform.scale, transform.x, transform.y],
  )

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      transformX: transform.x,
      transformY: transform.y,
    }
    containerRef.current?.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isFinePointer) {
      const dx = e.clientX - lastPlanePos.current.x
      const dy = e.clientY - lastPlanePos.current.y
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90
      setPlane((prev) => ({
        x: e.clientX,
        y: e.clientY,
        rotation: Number.isFinite(angle) ? angle : prev.rotation,
      }))
      lastPlanePos.current = { x: e.clientX, y: e.clientY }
    }

    if (!isDragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setTransform({
      ...transform,
      x: dragStart.current.transformX + dx,
      y: dragStart.current.transformY + dy,
    })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    containerRef.current?.releasePointerCapture(e.pointerId)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
    zoomBy(delta)
  }

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
      <div
        ref={wrapperRef}
        className="absolute inset-0 origin-top-left will-change-transform"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        }}
      >
        <img
          src="/maps/world.svg"
          alt="Mapa del mundo"
          className="h-full w-full"
          draggable={false}
        />
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1000 500"
          preserveAspectRatio="xMidYMid meet"
        >
          {DESTINATIONS.map((destination) => (
            <DestinationMarker
              key={destination.id}
              destination={destination}
              selected={selected?.id === destination.id}
              onSelect={handleSelect}
            />
          ))}
        </svg>
      </div>

      {isFinePointer && <Plane x={plane.x} y={plane.y} rotation={plane.rotation} />}

      <div className="absolute bottom-3 right-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => zoomBy(ZOOM_STEP)}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-lg font-bold shadow-md active:scale-95"
          aria-label="Acercar"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoomBy(-ZOOM_STEP)}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-lg font-bold shadow-md active:scale-95"
          aria-label="Alejar"
        >
          −
        </button>
      </div>
    </div>
  )
}
