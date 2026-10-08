import { useStore } from '@/state/store'
import { CATEGORIES } from '@/data/categories'
import { CategoryCard } from '@/features/category/CategoryCard'

export function CategoryStep() {
  const { categories, toggleCategory } = useStore()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">¿Qué tipo de viaje querés?</h2>
        <p className="mt-1 text-muted-foreground">Elegí una o varias categorías que definan la experiencia.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {CATEGORIES.map((c) => (
          <CategoryCard
            key={c.id}
            category={c}
            selected={categories.some((category) => category.id === c.id)}
            onSelect={toggleCategory}
          />
        ))}
      </div>
    </div>
  )
}
