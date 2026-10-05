import { useEffect, useRef } from 'react'
import { useStore } from '@/state/store'
import { WorldMap } from '@/features/destination/WorldMap'

export function DestinationStep() {
  const { destinations, toggleDestination, nextStep } = useStore()
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (destinations.length > 0) {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [destinations])

  const totalMinBudget = destinations.reduce((sum, d) => sum + d.minBudget, 0)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold">¿A dónde querés viajar?</h2>
        <p className="mt-1 text-muted-foreground">
          Arrastrá para rotar el globo, hacé zoom y tocá los marcadores para elegir uno o más destinos.
        </p>
      </div>

      <WorldMap
        selected={destinations}
        onSelect={toggleDestination}
        aria-label="Mapa mundi interactivo: arrastrá para rotar, hacé zoom y tocá un marcador para elegir o quitar destinos"
      />

      {destinations.length > 0 && (
        <div ref={cardRef} className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">
            {destinations.length === 1 ? 'Destino seleccionado' : 'Destinos seleccionados'}
          </p>
          <ul className="mt-2 space-y-2">
            {destinations.map((destination) => (
              <li key={destination.id} className="flex items-center justify-between gap-3">
                <span className="font-semibold text-primary">{destination.name}</span>
                <button
                  type="button"
                  onClick={() => toggleDestination(destination)}
                  className="rounded-lg px-3 py-1 text-sm font-medium text-muted-foreground outline-offset-4 transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Quitar ${destination.name}`}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            Presupuesto mínimo sugerido: USD {totalMinBudget}
          </p>
          <button
            type="button"
            onClick={nextStep}
            className="mt-4 w-full rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground outline-offset-4 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  )
}
