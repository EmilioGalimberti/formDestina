import { useStore } from '@/state/store'
import { CATEGORIES } from '@/data/categories'
import { CategoryCard } from '@/features/category/CategoryCard'

export function CategoryStep() {
  const { category, setCategory } = useStore()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">¿Qué tipo de viaje querés?</h2>
        <p className="mt-1 text-muted-foreground">Elegí la categoría que mejor defina la experiencia.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {CATEGORIES.map((c) => (
          <CategoryCard
            key={c.id}
            category={c}
            selected={category?.id === c.id}
            onSelect={setCategory}
          />
        ))}
      </div>
    </div>
  )
}
