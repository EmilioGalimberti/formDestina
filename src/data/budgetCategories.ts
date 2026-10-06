import type { BudgetCategory } from '@/state/types'

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    id: 'low-cost',
    name: 'Low-cost',
    description: 'Alojamientos económicos, vuelos low-cost y experiencias simples para ahorrar sin dejar de disfrutar.',
  },
  {
    id: 'quality-price',
    name: 'Calidad-precio',
    description: 'La mejor relación costo-beneficio: opciones cómodas, buena ubicación y experiencias completas.',
  },
  {
    id: 'luxury',
    name: 'Lujo',
    description: 'Hoteles premium, experiencias exclusivas y todos los detalles para un viaje inolvidable.',
  },
]
