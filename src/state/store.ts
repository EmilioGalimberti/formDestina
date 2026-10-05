import { create } from 'zustand'
import type { AppState, BudgetRange, Destination, StepId } from '@/state/types'

export const STEP_ORDER: StepId[] = [
  'destination',
  'days',
  'transport',
  'people',
  'category',
  'budget',
  'result',
]

const INITIAL_PEOPLE = 1

function calculateBudgetFromDestinations(destinations: Destination[]): BudgetRange {
  if (destinations.length === 0) return { min: 0, max: 0 }
  const min = destinations.reduce((sum, d) => sum + d.minBudget, 0)
  return { min, max: min * 2 }
}

const initialState: Omit<
  AppState,
  | 'toggleDestination'
  | 'setDestinationDays'
  | 'setTransport'
  | 'setPeople'
  | 'setCategory'
  | 'setBudget'
  | 'setBudgetMax'
  | 'goToStep'
  | 'nextStep'
  | 'previousStep'
  | 'reset'
> = {
  destinations: [],
  daysByDestination: {},
  transport: null,
  people: INITIAL_PEOPLE,
  category: null,
  budget: { min: 0, max: 0 },
  currentStep: 'destination',
}

export const useStore = create<AppState>((set, get) => ({
  ...initialState,

  toggleDestination: (destination) =>
    set((state) => {
      const exists = state.destinations.some((d) => d.id === destination.id)
      const destinations = exists
        ? state.destinations.filter((d) => d.id !== destination.id)
        : [...state.destinations, destination]

      const daysByDestination = { ...state.daysByDestination }
      if (exists) {
        delete daysByDestination[destination.id]
      } else {
        daysByDestination[destination.id] = 1
      }

      return {
        destinations,
        daysByDestination,
        budget: calculateBudgetFromDestinations(destinations),
      }
    }),

  setDestinationDays: (destinationId, days) =>
    set((state) => ({
      daysByDestination: {
        ...state.daysByDestination,
        [destinationId]: Math.max(1, days),
      },
    })),

  setTransport: (transport) => set({ transport }),

  setPeople: (people) => set({ people: Math.max(1, people) }),

  setCategory: (category) => set({ category }),

  setBudget: (budget) => set({ budget }),

  setBudgetMax: (max) =>
    set((state) => ({
      budget: { min: state.budget.min, max: Math.max(state.budget.min, max) },
    })),

  goToStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep } = get()
    const index = STEP_ORDER.indexOf(currentStep)
    if (index >= 0 && index < STEP_ORDER.length - 1) {
      set({ currentStep: STEP_ORDER[index + 1] })
    }
  },

  previousStep: () => {
    const { currentStep } = get()
    const index = STEP_ORDER.indexOf(currentStep)
    if (index > 0) {
      set({ currentStep: STEP_ORDER[index - 1] })
    }
  },

  reset: () => set(initialState),
}))
