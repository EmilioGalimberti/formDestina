import { useStore } from '@/state/store'
import { BudgetDisplay } from '@/features/budget/BudgetDisplay'

const PRESETS = [100, 500, 1000]

export function BudgetStep() {
  const { destination, budget, setBudgetMax } = useStore()

  if (!destination) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-2xl font-semibold">Presupuesto estimado</h2>
        <p className="text-muted-foreground">Primero elegí un destino para calcular el presupuesto mínimo sugerido.</p>
      </div>
    )
  }

  const min = destination.minBudget
  const max = Math.max(min, budget.max)
  const step = 100
  const maxLimit = min + 5000

  const adjustMax = (amount: number) => {
    setBudgetMax(max + amount)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-semibold">Presupuesto estimado</h2>
        <p className="mt-1 text-muted-foreground">
          Para {destination.name}, el presupuesto mínimo sugerido es {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(min)}.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-10">
        <BudgetDisplay min={min} max={max} />

        <input
          type="range"
          min={min}
          max={maxLimit}
          step={step}
          value={max}
          onChange={(e) => setBudgetMax(Number(e.target.value))}
          className="mt-8 w-full accent-primary"
          aria-label="Ajustar presupuesto máximo"
        />

        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Mínimo</span>
          <span>Máximo</span>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {PRESETS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => adjustMax(amount)}
              disabled={max + amount > maxLimit}
              className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 disabled:opacity-40 active:scale-95"
            >
              + USD {amount}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
