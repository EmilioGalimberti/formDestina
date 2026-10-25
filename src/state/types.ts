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
  minors: number
  categories: Category[]
  budgetCategory: BudgetCategory | null
  selectedDates: string[]
  calendarMonth: { year: number; month: number }
  isFlexible: boolean
}

export type StepId =
  | 'destination'
  | 'days'
  | 'calendar'
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
  setMinors: (minors: number) => void
  toggleCategory: (category: Category) => void
  setBudgetCategory: (budgetCategory: BudgetCategory | null) => void
  toggleDate: (date: string) => void
  setSelectedDates: (dates: string[]) => void
  setCalendarMonth: (year: number, month: number) => void
  setFlexible: (flexible: boolean) => void
  goToStep: (step: StepId) => void
  nextStep: () => void
  previousStep: () => void
  reset: () => void
}
