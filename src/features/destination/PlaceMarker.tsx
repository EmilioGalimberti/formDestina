import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import type { PlaceKind } from '@/data/places'

type MarkerKind = Exclude<PlaceKind, 'country'>

interface PlaceMarkerProps {
  id: string
  name: string
  kind: MarkerKind
  showLabel: boolean
  x: number
  y: number
  selected: boolean
  onSelect: () => void
}

const KIND_STYLE: Record<
  MarkerKind,
  { r: number; fill: string; strokeWidth: number; fontSize: number; fontWeight: number; labelY: number }
> = {
  capital: { r: 5, fill: '#0ea5e9', strokeWidth: 2.5, fontSize: 11, fontWeight: 600, labelY: -13 },
  city: { r: 4, fill: '#64748b', strokeWidth: 2, fontSize: 10, fontWeight: 500, labelY: -12 },
}

export function PlaceMarker({ id, name, kind, showLabel, x, y, selected, onSelect }: PlaceMarkerProps) {
  const innerRef = useRef<SVGGElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)
  const style = KIND_STYLE[kind]

  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1 })
      return
    }
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' })
  }, [])

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
      { scale: 2.6, opacity: 0, duration: 1.2, repeat: -1, ease: 'power1.out' },
    )
    return () => {
      tween.kill()
    }
  }, [selected])

  return (
    <g
      transform={`translate(${x}, ${y})`}
      data-marker-id={id}
      role="button"
      tabIndex={0}
      aria-label={name}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className="cursor-pointer outline-none"
    >
      <g ref={innerRef} opacity={0}>
        <circle r={style.r + 12} fill="transparent" />
        <circle
          ref={ringRef}
          r={style.r + 2}
          fill="none"
          stroke="#0d9488"
          strokeWidth={2.5}
          opacity={0}
        />
        <circle
          r={selected ? style.r + 1 : style.r}
          fill={selected ? '#0d9488' : style.fill}
          stroke="#ffffff"
          strokeWidth={selected ? 2.5 : style.strokeWidth}
        />
        <circle
          cx={-style.r * 0.35}
          cy={-style.r * 0.35}
          r={style.r * 0.3}
          fill="#ffffff"
          opacity={0.85}
        />
        {showLabel && (
          <text
            y={style.labelY}
            textAnchor="middle"
            fill="#1c1917"
            fontSize={style.fontSize}
            fontWeight={style.fontWeight}
            stroke="#ffffff"
            strokeWidth={4}
            strokeLinejoin="round"
            paintOrder="stroke"
            style={{ pointerEvents: 'none' }}
          >
            {name}
          </text>
        )}
      </g>
    </g>
  )
}
