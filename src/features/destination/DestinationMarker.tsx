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
  dragging?: boolean
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
  dragging = false,
}: DestinationMarkerProps) {
  const innerRef = useRef<SVGGElement>(null)
  const prevVisibleRef = useRef<boolean | null>(null)

  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    if (prevVisibleRef.current === visible) return
    prevVisibleRef.current = visible
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || dragging) {
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
  }, [visible, dragging])

  const zoomFactor = Math.max(1, 1 + (scale - 1) * 0.12)

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
        {selected && (
          <g className="marker-pulse">
            <circle
              r={12 * zoomFactor}
              fill="none"
              stroke="#6e1f3c"
              strokeWidth={3 * zoomFactor}
            />
          </g>
        )}
        <circle
          r={(selected ? 11 : 9) * zoomFactor}
          fill={selected ? '#6e1f3c' : '#f59e0b'}
          stroke="#ffffff"
          strokeWidth={3 * zoomFactor}
        />
        <circle cx={-3 * zoomFactor} cy={-3 * zoomFactor} r={2.5 * zoomFactor} fill="#ffffff" opacity={0.85} />
        {showLabel && !dragging && (
          <text
            y={(selected ? -20 : -17) * zoomFactor}
            textAnchor="middle"
            fill="#1c1917"
            fontSize={(selected ? 15 : 13) * Math.max(1, 1 + (scale - 1) * 0.06)}
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
