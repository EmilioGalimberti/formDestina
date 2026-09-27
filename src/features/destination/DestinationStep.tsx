import { useStore } from '@/state/store'

const DUMMY_DESTINATIONS = [
  { id: 'mexico', name: 'México', lat: 23.6, lon: -102.5, minBudget: 500 },
  { id: 'brasil', name: 'Brasil', lat: -14.2, lon: -51.9, minBudget: 600 },
  { id: 'espana', name: 'España', lat: 40.4, lon: -3.7, minBudget: 800 },
  { id: 'argentina', name: 'Argentina', lat: -38.4, lon: -63.6, minBudget: 400 },
]

export function DestinationStep() {
  const { destination, setDestination, nextStep } = useStore()

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">¿A dónde querés viajar?</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DUMMY_DESTINATIONS.map((dest) => (
          <button
            key={dest.id}
            type="button"
            onClick={() => {
              setDestination(dest)
              nextStep()
            }}
            className={`rounded-2xl border-2 px-4 py-6 text-left transition-colors ${
              destination?.id === dest.id
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <span className="text-lg font-medium">{dest.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
