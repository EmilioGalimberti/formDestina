export interface Destination {
  id: string
  name: string
  lat: number
  lon: number
  minBudget: number
  minZoom: number
  custom?: boolean
}

export interface Transport {
  id: string
  name: string
  image: string
}

export interface Category {
  id: string
  name: string
}

export interface BudgetCategory {
  id: string
  name: string
  description: string
}

export interface FormState {
  destinations: Destination[]
  daysByDestination: Record<string, number>
  people: number
  categories: Category[]
  budgetCategory: BudgetCategory | null
}

export type StepId =
  | 'destination'
  | 'days'
  | 'people'
  | 'category'
  | 'budget'
  | 'result'

export interface WizardState {
  currentStep: StepId
}

export interface AppState extends FormState, WizardState {
  toggleDestination: (destination: Destination) => void
  addCustomDestination: (name: string) => void
  setDestinationDays: (destinationId: string, days: number) => void
  setPeople: (people: number) => void
  toggleCategory: (category: Category) => void
  setBudgetCategory: (budgetCategory: BudgetCategory | null) => void
  goToStep: (step: StepId) => void
  nextStep: () => void
  previousStep: () => void
  reset: () => void
}
