import { useStore } from '@/state/store'

export function ResultStep() {
  const { destination, transport, people, category, budget } = useStore()

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">Resumen de tu viaje</h2>
      <div className="rounded-2xl border border-border bg-card p-6 text-left">
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Destino</dt>
            <dd className="font-medium">{destination?.name ?? '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Transporte</dt>
            <dd className="font-medium">{transport?.name ?? '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Viajeros</dt>
            <dd className="font-medium">{people}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Estilo</dt>
            <dd className="font-medium">{category?.name ?? '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Presupuesto</dt>
            <dd className="font-medium">
              USD {budget.min} - {budget.max}
            </dd>
          </div>
        </dl>
      </div>
      <button
        type="button"
        className="w-full rounded-2xl bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground active:scale-95"
      >
        ¡A viajar!
      </button>
    </div>
  )
}
