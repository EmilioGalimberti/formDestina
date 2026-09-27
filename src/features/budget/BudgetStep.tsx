import { useStore } from '@/state/store'

export function BudgetStep() {
  const { budget, setBudgetMax } = useStore()

  const max = Math.max(budget.min, budget.max)
  const step = 100
  const maxLimit = budget.min + 5000

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">Presupuesto estimado</h2>
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-center text-3xl font-bold">
          USD {budget.min} - {max}
        </p>
        <input
          type="range"
          min={budget.min}
          max={maxLimit}
          step={step}
          value={max}
          onChange={(e) => setBudgetMax(Number(e.target.value))}
          className="mt-6 w-full accent-primary"
        />
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Mínimo sugerido para el destino: USD {budget.min}
        </p>
      </div>
    </div>
  )
}
