import { useStore } from '@/state/store'
import { TRANSPORTS } from '@/data/transports'
import { TransportCard } from '@/features/transport/TransportCard'

export function TransportStep() {
  const { transport, setTransport } = useStore()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">¿Cómo querés viajar?</h2>
        <p className="mt-1 text-muted-foreground">Elegí el transporte para tu viaje.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TRANSPORTS.map((t) => (
          <TransportCard
            key={t.id}
            transport={t}
            selected={transport?.id === t.id}
            onSelect={setTransport}
          />
        ))}
      </div>
    </div>
  )
}
