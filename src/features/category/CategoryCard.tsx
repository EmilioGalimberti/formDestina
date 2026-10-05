import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import type { Category } from '@/state/types'

interface CategoryCardProps {
  category: Category
  selected: boolean
  onSelect: (category: Category) => void
}

function CategoryIcon({ id }: { id: string }) {
  const className = 'h-8 w-8 md:h-10 md:w-10'
  const stroke = { strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  switch (id) {
    case 'beach':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" {...stroke} stroke="currentColor">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          <path d="M2 18c4-2 8-1 10 2 2-3 6-4 10-2" />
        </svg>
      )
    case 'party':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" {...stroke} stroke="currentColor">
          <path d="M4 20l4-10 6 6-10 4z" />
          <path d="M14 10l3-3" />
          <path d="M18 6l1-1" />
          <path d="M10 4l1 1" />
          <path d="M20 12l-1 1" />
          <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
          <circle cx="17" cy="4" r="1" fill="currentColor" stroke="none" />
          <circle cx="20" cy="10" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'relax':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" {...stroke} stroke="currentColor">
          <path d="M4 16h16" />
          <path d="M6 16c2-5 6-7 8-7s2 2 4 7" />
          <path d="M8 9V6" />
          <path d="M16 9V6" />
          <circle cx="12" cy="6" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'adventure':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" {...stroke} stroke="currentColor">
          <path d="M4 18l4-6 3 4 5-8 4 6" />
          <path d="M2 20h20" />
          <path d="M10 4l2 2 2-2" />
        </svg>
      )
    case 'nature':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" {...stroke} stroke="currentColor">
          <path d="M12 22V10" />
          <path d="M12 10c-3-2-5-6-3-8 2 2 4 4 3 8z" />
          <path d="M12 10c3-2 5-6 3-8-2 2-4 4-3 8z" />
          <path d="M2 22h20" />
        </svg>
      )
    case 'culture':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" {...stroke} stroke="currentColor">
          <path d="M4 20h16" />
          <path d="M6 20V10h3v10M15 20V10h3v10" />
          <path d="M5 10h14" />
          <circle cx="12" cy="6" r="2" />
        </svg>
      )
    case 'food':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" {...stroke} stroke="currentColor">
          <path d="M5 4v11a3 3 0 0 0 3 3" />
          <path d="M8 4v14" />
          <path d="M15 4a4 4 0 0 1 0 8h-2V4h2z" />
          <path d="M15 12v8" />
        </svg>
      )
    case 'family':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" {...stroke} stroke="currentColor">
          <path d="M3 21h18" />
          <path d="M5 21v-9l7-5 7 5v9" />
          <path d="M9 21v-6h6v6" />
          <circle cx="12" cy="11" r="1.5" fill="currentColor" stroke="none" />
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

export function CategoryCard({ category, selected, onSelect }: CategoryCardProps) {
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
      className={`group relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-4 py-6 text-center transition-colors duration-200 active:scale-95 md:py-8 ${
        selected
          ? 'border-secondary bg-secondary/10'
          : 'border-border bg-card hover:border-secondary/50'
      }`}
    >
      <span className={`transition-transform duration-200 group-hover:scale-110 ${selected ? 'text-secondary' : 'text-muted-foreground'}`}>
        <CategoryIcon id={category.id} />
      </span>
      <span className={`font-semibold ${selected ? 'text-secondary' : 'text-foreground'}`}>
        {category.name}
      </span>
      {selected && (
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
    </button>
  )
}
