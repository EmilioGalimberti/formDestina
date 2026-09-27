export interface Destination {
  id: string
  name: string
  lat: number
  lon: number
  minBudget: number
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

export interface BudgetRange {
  min: number
  max: number
}

export interface FormState {
  destination: Destination | null
  transport: Transport | null
  people: number
  category: Category | null
  budget: BudgetRange
}

export type StepId =
  | 'destination'
  | 'transport'
  | 'people'
  | 'category'
  | 'budget'
  | 'result'

export interface WizardState {
  currentStep: StepId
}

export interface AppState extends FormState, WizardState {
  setDestination: (destination: Destination | null) => void
  setTransport: (transport: Transport | null) => void
  setPeople: (people: number) => void
  setCategory: (category: Category | null) => void
  setBudget: (budget: BudgetRange) => void
  setBudgetMax: (max: number) => void
  goToStep: (step: StepId) => void
  nextStep: () => void
  previousStep: () => void
  reset: () => void
}
