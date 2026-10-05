import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

interface BudgetDisplayProps {
  min: number
  max: number
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function BudgetDisplay({ min, max }: BudgetDisplayProps) {
  const displayRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = displayRef.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    gsap.fromTo(
      el,
      { scale: 0.96, opacity: 0.7 },
      { scale: 1, opacity: 1, duration: 0.25, ease: 'power2.out' },
    )
  }, [max])

  return (
    <p
      ref={displayRef}
      className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl"
    >
      {formatMoney(min)} — {formatMoney(max)}
    </p>
  )
}
