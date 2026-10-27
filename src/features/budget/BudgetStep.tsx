import { useStore } from '@/state/store'
import { BUDGET_CATEGORIES } from '@/data/budgetCategories'
import { BudgetCategoryCard } from '@/features/budget/BudgetCategoryCard'

export function BudgetStep() {
  const { budgetCategory, setBudgetCategory, stepError, setStepError } = useStore()

  const handleSelect = (category: Parameters<typeof setBudgetCategory>[0]) => {
    setStepError(null)
    setBudgetCategory(category)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">¿Qué presupuesto tenés en mente?</h2>
        <p className="mt-1 text-muted-foreground">Es una referencia: cada viaje se diseña a medida, con acompañamiento y asesoramiento especializado de principio a fin.</p>
        <p className="mt-1 text-muted-foreground">Elegí la categoría que mejor se ajuste:</p>

      </div>

      {stepError && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {stepError}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {BUDGET_CATEGORIES.map((category) => (
          <BudgetCategoryCard
            key={category.id}
            category={category}
            selected={budgetCategory?.id === category.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  )
}
