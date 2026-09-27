interface PlaneProps {
  x: number
  y: number
  rotation: number
}

export function Plane({ x, y, rotation }: PlaneProps) {
  return (
    <div
      className="pointer-events-none fixed z-20 hidden md:block"
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        transition: 'transform 0.08s linear',
      }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#0d9488">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
      </svg>
    </div>
  )
}
