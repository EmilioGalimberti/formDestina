import { useRef } from 'react'
import { useStore } from '@/state/store'
import { Checkbox } from '@/ui/Checkbox'
import { gsap } from '@/lib/gsap'

function animateValue(element: HTMLElement | null) {
  if (!element) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  gsap.fromTo(
    element,
    { scale: 0.75, opacity: 0.6 },
    { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.7)' },
  )
}

interface StepperProps {
  value: number
  onChange: (next: number) => void
  label: string
  valueRef?: React.RefObject<HTMLSpanElement | null>
  min?: number
  max?: number
}

function Stepper({ value, onChange, label, valueRef, min = 0, max }: StepperProps) {
  const canDecrease = value > min
  const canIncrease = max === undefined || value < max

  return (
    <div className="flex items-center gap-6">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={!canDecrease}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-2xl font-semibold text-foreground outline-offset-4 transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 disabled:opacity-40"
        aria-label={`Disminuir cantidad de ${label}`}
      >
        −
      </button>

      <div className="flex min-w-[7rem] flex-col items-center" aria-live="polite" aria-atomic="true">
        <span ref={valueRef} className="text-6xl font-bold text-primary md:text-7xl">
          {value}
        </span>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>

      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={!canIncrease}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground outline-offset-4 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 disabled:opacity-40"
        aria-label={`Aumentar cantidad de ${label}`}
      >
        +
      </button>
    </div>
  )
}

export function PeopleStep() {
  const { people, minors, minorAges, setPeople, setMinors, setMinorAge, setStepError } = useStore()
  const adultValueRef = useRef<HTMLSpanElement>(null)
  const minorValueRef = useRef<HTMLSpanElement>(null)

  const travelingWithMinors = minors > 0

  const updatePeople = (next: number) => {
    const nextPeople = Math.max(1, next)
    setPeople(nextPeople)
    animateValue(adultValueRef.current)
  }

  const updateMinors = (next: number) => {
    setMinors(next)
    animateValue(minorValueRef.current)
  }

  const toggleMinors = (checked: boolean) => {
    if (!checked) {
      setMinors(0)
      return
    }
    setMinors(1)
    animateValue(minorValueRef.current)
  }

  const handleAgeChange = (index: number, value: string) => {
    setStepError(null)
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      setMinorAge(index, null)
      return
    }
    const age = Number(trimmed)
    if (Number.isNaN(age) || age < 0 || age > 17 || !/^\d+$/.test(trimmed)) {
      return
    }
    setMinorAge(index, age)
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">¿Cuántos viajan?</h2>
        <p className="mt-1 text-muted-foreground">Incluí a todos los pasajeros.</p>
      </div>

      <Stepper
        value={people}
        onChange={updatePeople}
        label={people === 1 ? 'adulto' : 'adultos'}
        valueRef={adultValueRef}
        min={1}
      />

      <Checkbox
        label="Viajo con menores de edad"
        checked={travelingWithMinors}
        onChange={(event) => toggleMinors(event.target.checked)}
      />

      {travelingWithMinors && (
        <div className="flex w-full flex-col items-center gap-6">
          <Stepper
            value={minors}
            onChange={updateMinors}
            label={minors === 1 ? 'menor' : 'menores'}
            valueRef={minorValueRef}
            min={1}
          />

          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-foreground">
              Edades al momento del viaje
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tené en cuenta la edad que tendrán hasta el vuelo de vuelta.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {Array.from({ length: minors }, (_, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <label
                    htmlFor={`minor-age-${index}`}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Menor {index + 1}
                  </label>
                  <input
                    id={`minor-age-${index}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={17}
                    value={minorAges[index] ?? ''}
                    onChange={(event) => handleAgeChange(index, event.target.value)}
                    placeholder="Edad"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-center text-sm text-foreground outline-offset-4 transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
