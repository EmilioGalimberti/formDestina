import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import type { BudgetCategory } from '@/state/types'

interface BudgetCategoryCardProps {
  category: BudgetCategory
  selected: boolean
  onSelect: (category: BudgetCategory) => void
}

function BudgetIcon({ id }: { id: string }) {
  const className = 'h-8 w-8 md:h-10 md:w-10'
  const stroke = { strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  switch (id) {
    case 'low-cost':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" {...stroke} stroke="currentColor">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" />
        </svg>
      )
    case 'quality-price':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" {...stroke} stroke="currentColor">
          <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
        </svg>
      )
    case 'luxury':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" {...stroke} stroke="currentColor">
          <path d="M12 2l2.5 5.5L20 8.5l-4 4 1 6-5-2.5-5 2.5 1-6-4-4 5.5-1z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" {...stroke} stroke="currentColor">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      )
  }
}

export function BudgetCategoryCard({ category, selected, onSelect }: BudgetCategoryCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    onSelect(category)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const card = cardRef.current
    if (!card) return

    gsap.fromTo(
      card,
      { scale: 0.94 },
      { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.6)' },
    )
  }

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      className={`group relative flex flex-col items-start gap-3 rounded-2xl border-2 px-5 py-5 text-left outline-offset-4 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 md:px-6 md:py-6 ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-border bg-card hover:border-primary/50'
      }`}
    >
      <span className={`transition-transform duration-200 group-hover:scale-110 ${selected ? 'text-primary' : 'text-muted-foreground'}`}>
        <BudgetIcon id={category.id} />
      </span>
      <span className={`text-lg font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}>
        {category.name}
      </span>
      <span className="text-sm leading-relaxed text-muted-foreground">
        {category.description}
      </span>
      {selected && (
        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
    </button>
  )
}
