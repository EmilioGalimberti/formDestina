import { useStore } from '@/state/store'

const DUMMY_TRANSPORTS = [
  { id: 'plane', name: 'Avión' },
  { id: 'bus', name: 'Bus' },
  { id: 'car', name: 'Auto' },
  { id: 'train', name: 'Tren' },
]

export function TransportStep() {
  const { transport, setTransport } = useStore()

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">¿Cómo querés viajar?</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {DUMMY_TRANSPORTS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTransport(t)}
            className={`rounded-2xl border-2 px-4 py-8 text-center transition-colors ${
              transport?.id === t.id
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <span className="font-medium">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
