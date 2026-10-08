import { useRef } from 'react'
import { useStore } from '@/state/store'
import { gsap } from '@/lib/gsap'
import type { Destination } from '@/state/types'

const MAX_DAYS = 30

interface DaysSelectorProps {
  destination: Destination
  days: number
  onChange: (days: number) => void
}

function DaysSelector({ destination, days, onChange }: DaysSelectorProps) {
  const valueRef = useRef<HTMLSpanElement>(null)

  const updateDays = (next: number) => {
    onChange(next)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const el = valueRef.current
    if (!el) return

    gsap.fromTo(
      el,
      { scale: 0.75, opacity: 0.6 },
      { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.7)' },
    )
  }

  const label = days === 1 ? 'día' : 'días'

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span className="font-semibold text-foreground">{destination.name}</span>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => updateDays(days - 1)}
          disabled={days <= 1}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-xl font-semibold text-foreground outline-offset-4 transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 disabled:opacity-40"
          aria-label={`Disminuir días en ${destination.name}`}
        >
          −
        </button>

        <div className="flex min-w-[5rem] flex-col items-center" aria-live="polite" aria-atomic="true">
          <span ref={valueRef} className="text-3xl font-bold text-primary">
            {days}
          </span>
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>

        <button
          type="button"
          onClick={() => updateDays(days + 1)}
          disabled={days >= MAX_DAYS}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground outline-offset-4 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 disabled:opacity-40"
          aria-label={`Aumentar días en ${destination.name}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

export function DaysStep() {
  const { destinations, daysByDestination, setDestinationDays } = useStore()

  const totalDays = destinations.reduce((sum, destination) => {
    return sum + (daysByDestination[destination.id] ?? 1)
  }, 0)

  if (destinations.length === 0) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-2xl font-semibold">¿Cuántos días en cada destino?</h2>
        <p className="text-muted-foreground">Primero elegí al menos un destino para definir la duración del viaje.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">¿Cuántos días en cada destino?</h2>
        <p className="mt-1 text-muted-foreground">Ajustá la duración de tu estadía en cada lugar.</p>
      </div>

      <div className="flex flex-col gap-3">
        {destinations.map((destination) => (
          <DaysSelector
            key={destination.id}
            destination={destination}
            days={daysByDestination[destination.id] ?? 1}
            onChange={(days) => setDestinationDays(destination.id, days)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <span className="font-semibold text-foreground">Total de días</span>
        <span className="text-2xl font-bold text-primary">
          {totalDays} {totalDays === 1 ? 'día' : 'días'}
        </span>
      </div>
    </div>
  )
}
