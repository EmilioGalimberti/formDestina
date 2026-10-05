import { useRef } from 'react'
import { useStore } from '@/state/store'
import { gsap } from '@/lib/gsap'

export function PeopleStep() {
  const { people, setPeople } = useStore()
  const valueRef = useRef<HTMLSpanElement>(null)

  const updatePeople = (next: number) => {
    setPeople(next)

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

  const label = people === 1 ? 'persona' : 'personas'

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">¿Cuántos viajan?</h2>
        <p className="mt-1 text-muted-foreground">Incluí a todos los pasajeros.</p>
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => updatePeople(people - 1)}
          disabled={people <= 1}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-2xl font-semibold text-foreground outline-offset-4 transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 disabled:opacity-40"
          aria-label="Disminuir cantidad"
        >
          −
        </button>

        <div className="flex min-w-[7rem] flex-col items-center" aria-live="polite" aria-atomic="true">
          <span ref={valueRef} className="text-6xl font-bold text-primary md:text-7xl">
            {people}
          </span>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>

        <button
          type="button"
          onClick={() => updatePeople(people + 1)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground outline-offset-4 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>
    </div>
  )
}
