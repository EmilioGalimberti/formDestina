import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import type { Destination } from '@/state/types'

interface DestinationMarkerProps {
  destination: Destination
  selected: boolean
  visible: boolean
  x: number
  y: number
  onSelect: (destination: Destination) => void
}

export function DestinationMarker({
  destination,
  selected,
  visible,
  x,
  y,
  onSelect,
}: DestinationMarkerProps) {
  const groupRef = useRef<SVGGElement>(null)

  useLayoutEffect(() => {
    const el = groupRef.current
    if (!el) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      gsap.set(el, { opacity: visible ? 1 : 0, scale: visible ? 1 : 0.6 })
    } else {
      gsap.to(el, {
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.6,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }, [visible])

  return (
    <g
      ref={groupRef}
      role="button"
      tabIndex={visible ? 0 : -1}
      onClick={() => onSelect(destination)}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && visible) {
          e.preventDefault()
          onSelect(destination)
        }
      }}
      className="cursor-pointer"
      transform={`translate(${x}, ${y})`}
      opacity={visible ? 1 : 0}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <circle r={40} fill="transparent" />
      <circle
        r={selected ? 14 : 10}
        fill={selected ? '#0d9488' : '#f59e0b'}
        stroke="#ffffff"
        strokeWidth={3}
      />
      <text
        y={selected ? -22 : -18}
        textAnchor="middle"
        fill="#1c1917"
        fontSize={selected ? 16 : 14}
        fontWeight={600}
        style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
      >
        {destination.name}
      </text>
    </g>
  )
}
