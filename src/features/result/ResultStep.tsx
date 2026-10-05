import { useStore } from '@/state/store'
import { buildMessage, buildWaLink } from '@/lib/whatsapp'

interface ResultItemProps {
  label: string
  value: string
}

function ResultItem({ label, value }: ResultItemProps) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}

export function ResultStep() {
  const state = useStore()
  const { destination, transport, people, category, budget } = state

  const message = buildMessage(state)
  const waLink = buildWaLink(state)

  const budgetLabel = `${new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(budget.min)} - ${new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(budget.max)}`

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Resumen de tu viaje</h2>
        <p className="mt-1 text-muted-foreground">Revisá que todo esté bien antes de enviarle el mensaje a Martina.</p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <dl>
          <ResultItem label="Destino" value={destination?.name ?? '—'} />
          <ResultItem label="Transporte" value={transport?.name ?? '—'} />
          <ResultItem label="Viajeros" value={String(people)} />
          <ResultItem label="Estilo" value={category?.name ?? '—'} />
          <ResultItem label="Presupuesto" value={budgetLabel} />
        </dl>
      </div>

      <div className="rounded-2xl bg-muted p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Así se verá el mensaje</p>
        <pre className="whitespace-pre-wrap rounded-xl bg-card p-4 text-sm leading-relaxed text-foreground shadow-sm">
          {message}
        </pre>
      </div>

      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95"
      >
        ¡A viajar!
      </a>
    </div>
  )
}
