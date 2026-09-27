import { useStore } from '@/state/store'

export function PeopleStep() {
  const { people, setPeople } = useStore()

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-semibold">¿Cuántos viajan?</h2>
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => setPeople(people - 1)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-2xl font-semibold active:scale-95"
          aria-label="Disminuir cantidad"
        >
          −
        </button>
        <span className="min-w-[3ch] text-center text-4xl font-bold">{people}</span>
        <button
          type="button"
          onClick={() => setPeople(people + 1)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-2xl font-semibold active:scale-95"
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>
    </div>
  )
}
