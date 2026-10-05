import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import type { Transport } from '@/state/types'

interface TransportCardProps {
  transport: Transport
  selected: boolean
  onSelect: (transport: Transport) => void
}

export function TransportCard({ transport, selected, onSelect }: TransportCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    onSelect(transport)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const card = cardRef.current
    if (!card) return

    gsap.fromTo(
      card,
      { scale: 0.92 },
      { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.6)' },
    )
  }

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      className={`group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 px-4 py-8 text-center outline-offset-4 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 md:py-10 ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-border bg-card hover:border-primary/50'
      }`}
    >
      <img
        src={transport.image}
        alt=""
        className="h-12 w-12 transition-transform duration-200 group-hover:scale-110 md:h-16 md:w-16"
      />
      <span className={`font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}>
        {transport.name}
      </span>
      {selected && (
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
    </button>
  )
}
