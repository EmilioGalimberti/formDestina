import { useStore } from '@/state/store'

const DUMMY_CATEGORIES = [
  { id: 'party', name: 'Fiesta' },
  { id: 'beach', name: 'Playas lindas' },
  { id: 'relax', name: 'Tranquilidad' },
  { id: 'adventure', name: 'Aventura' },
]

export function CategoryStep() {
  const { category, setCategory } = useStore()

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">¿Qué tipo de viaje querés?</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DUMMY_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-2xl border-2 px-4 py-6 text-left transition-colors ${
              category?.id === c.id
                ? 'border-secondary bg-secondary/10'
                : 'border-border bg-card hover:border-secondary/50'
            }`}
          >
            <span className="text-lg font-medium">{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
