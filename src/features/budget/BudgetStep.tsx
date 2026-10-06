import { useStore } from '@/state/store'
import { BUDGET_CATEGORIES } from '@/data/budgetCategories'
import { BudgetCategoryCard } from '@/features/budget/BudgetCategoryCard'

export function BudgetStep() {
  const { budgetCategory, setBudgetCategory } = useStore()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">¿Qué tipo de presupuesto manejás?</h2>
        <p className="mt-1 text-muted-foreground">Elegí la categoría que mejor se adapte a lo que buscás.</p>
      </div>

      <div className="flex flex-col gap-3">
        {BUDGET_CATEGORIES.map((category) => (
          <BudgetCategoryCard
            key={category.id}
            category={category}
            selected={budgetCategory?.id === category.id}
            onSelect={setBudgetCategory}
          />
        ))}
      </div>
    </div>
  )
}
