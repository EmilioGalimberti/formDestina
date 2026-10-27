import type { BudgetCategory } from '@/state/types'

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    id: 'low-cost',
    name: 'Low-cost',
    description: 'Alojamientos simples. Viajes eficientes, pensados para optimizar cada gasto.',
  },
  {
    id: 'quality-price',
    name: 'Calidad-precio',
    description: 'Hoteles cómodos y bien ubicados. Experiencias completas con equilibrio entre confort y costo.',
  },
  {
    id: 'luxury',
    name: 'Premium',
    description: 'Hoteles de diseño o boutique. Experiencias exclusivas y mayor nivel de detalle.',
  },
]
