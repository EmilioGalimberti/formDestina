import { create } from 'zustand'
import type { AppState, StepId } from '@/state/types'

export const STEP_ORDER: StepId[] = [
  'destination',
  'days',
  'people',
  'category',
  'budget',
  'result',
]

const INITIAL_PEOPLE = 1

const initialState: Omit<
  AppState,
  | 'toggleDestination'
  | 'setDestinationDays'
  | 'setPeople'
  | 'setCategory'
  | 'setBudgetCategory'
  | 'goToStep'
  | 'nextStep'
  | 'previousStep'
  | 'reset'
> = {
  destinations: [],
  daysByDestination: {},
  people: INITIAL_PEOPLE,
  category: null,
  budgetCategory: null,
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
      }
    }),

  setDestinationDays: (destinationId, days) =>
    set((state) => ({
      daysByDestination: {
        ...state.daysByDestination,
        [destinationId]: Math.max(1, days),
      },
    })),

  setPeople: (people) => set({ people: Math.max(1, people) }),

  setCategory: (category) => set({ category }),

  setBudgetCategory: (budgetCategory) => set({ budgetCategory }),

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
