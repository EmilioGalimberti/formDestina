import { useEffect, useRef } from 'react'
import { useStore } from '@/state/store'
import { WorldMap } from '@/features/destination/WorldMap'

export function DestinationStep() {
  const { destination, setDestination, nextStep } = useStore()
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (destination) {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [destination])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold">¿A dónde querés viajar?</h2>
        <p className="mt-1 text-muted-foreground">
          Arrastrá para rotar el globo, hacé zoom y tocá un marcador para elegir tu destino.
        </p>
      </div>

      <WorldMap
        selected={destination}
        onSelect={(dest) => {
          setDestination(dest)
        }}
      />

      {destination && (
        <div ref={cardRef} className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">Destino seleccionado</p>
          <p className="text-xl font-semibold text-primary">{destination.name}</p>
          <p className="text-sm text-muted-foreground">
            Presupuesto mínimo sugerido: USD {destination.minBudget}
          </p>
          <button
            type="button"
            onClick={nextStep}
            className="mt-4 w-full rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground active:scale-95"
          >
            Elegir {destination.name}
          </button>
        </div>
      )}
    </div>
  )
}
