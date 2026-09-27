import { project } from '@/lib/projection'
import type { Destination } from '@/state/types'

interface DestinationMarkerProps {
  destination: Destination
  selected: boolean
  onSelect: (destination: Destination) => void
}

export function DestinationMarker({ destination, selected, onSelect }: DestinationMarkerProps) {
  const { x, y } = project(destination.lat, destination.lon)

  return (
    <g
      role="button"
      tabIndex={0}
      onClick={() => onSelect(destination)}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(destination)
        }
      }}
      className="cursor-pointer"
      transform={`translate(${x}, ${y})`}
    >
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
