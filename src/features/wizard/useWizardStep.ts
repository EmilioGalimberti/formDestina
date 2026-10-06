import type { StepId } from '@/state/types'
import { DestinationStep } from '@/features/destination'
import { DaysStep } from '@/features/days'
import { PeopleStep } from '@/features/people'
import { CategoryStep } from '@/features/category'
import { BudgetStep } from '@/features/budget'
import { ResultStep } from '@/features/result'

export interface StepConfig {
  id: StepId
  title: string
  component: React.ComponentType
}

export const STEPS: StepConfig[] = [
  { id: 'destination', title: 'Destino', component: DestinationStep },
  { id: 'days', title: 'Días', component: DaysStep },
  { id: 'people', title: 'Viajeros', component: PeopleStep },
  { id: 'category', title: 'Estilo', component: CategoryStep },
  { id: 'budget', title: 'Presupuesto', component: BudgetStep },
  { id: 'result', title: 'Resumen', component: ResultStep },
]

export function useWizardStep(currentStep: StepId) {
  const index = STEPS.findIndex((step) => step.id === currentStep)
  const step = STEPS[index]
  const isFirst = index === 0
  const isLast = index === STEPS.length - 1
  const progress = Math.round(((index + 1) / STEPS.length) * 100)

  return {
    step,
    index,
    isFirst,
    isLast,
    progress,
    total: STEPS.length,
  }
}
