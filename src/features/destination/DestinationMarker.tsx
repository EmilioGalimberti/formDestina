import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import type { Destination } from '@/state/types'

interface DestinationMarkerProps {
  destination: Destination
  selected: boolean
  visible: boolean
  x: number
  y: number
  scale: number
  onSelect: (destination: Destination) => void
  showLabel?: boolean
}

export function DestinationMarker({
  destination,
  selected,
  visible,
  x,
  y,
  scale,
  onSelect,
  showLabel = true,
}: DestinationMarkerProps) {
  const innerRef = useRef<SVGGElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)

  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      gsap.set(el, { opacity: visible ? 1 : 0, scale: visible ? 1 : 0.4 })
      return
    }
    gsap.to(el, {
      opacity: visible ? 1 : 0,
      scale: visible ? 1 : 0.4,
      duration: visible ? 0.4 : 0.2,
      ease: visible ? 'back.out(2.2)' : 'power2.in',
      overwrite: 'auto',
    })
  }, [visible])

  useLayoutEffect(() => {
    const ring = ringRef.current
    if (!ring) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!selected || prefersReducedMotion) {
      gsap.killTweensOf(ring)
      gsap.set(ring, { opacity: 0 })
      return
    }
    const tween = gsap.fromTo(
      ring,
      { scale: 0.7, opacity: 0.8 },
      { scale: 2.4, opacity: 0, duration: 1.2, repeat: -1, ease: 'power1.out' },
    )
    return () => {
      tween.kill()
    }
  }, [selected])

  const zoomFactor = Math.max(1, 1 + (scale - 1) * 0.08)

  return (
    <g
      transform={`translate(${x}, ${y})`}
      data-marker-id={destination.id}
      role="button"
      tabIndex={visible ? 0 : -1}
      aria-label={destination.name}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && visible) {
          e.preventDefault()
          onSelect(destination)
        }
      }}
      className="cursor-pointer outline-none"
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <g ref={innerRef} opacity={0}>
        <circle r={26 * zoomFactor} fill="transparent" />
        <circle
          ref={ringRef}
          r={12 * zoomFactor}
          fill="none"
          stroke="#6e1f3c"
          strokeWidth={3 * zoomFactor}
          opacity={0}
        />
        <circle
          r={(selected ? 11 : 9) * zoomFactor}
          fill={selected ? '#6e1f3c' : '#f59e0b'}
          stroke="#ffffff"
          strokeWidth={3 * zoomFactor}
        />
        <circle cx={-3 * zoomFactor} cy={-3 * zoomFactor} r={2.5 * zoomFactor} fill="#ffffff" opacity={0.85} />
        {showLabel && (
          <text
            y={(selected ? -20 : -17) * zoomFactor}
            textAnchor="middle"
            fill="#1c1917"
            fontSize={(selected ? 15 : 13) * Math.max(1, 1 + (scale - 1) * 0.04)}
            fontWeight={700}
            stroke="#ffffff"
            strokeWidth={4}
            strokeLinejoin="round"
            paintOrder="stroke"
            style={{ pointerEvents: 'none' }}
          >
            {destination.name}
          </text>
        )}
      </g>
    </g>
  )
}
