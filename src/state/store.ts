import { create } from 'zustand'
import type { AppState, StepId } from '@/state/types'

export const STEP_ORDER: StepId[] = [
  'destination',
  'transport',
  'people',
  'category',
  'budget',
  'result',
]

const INITIAL_PEOPLE = 1

const initialState: Omit<
  AppState,
  | 'setDestination'
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
  destination: null,
  transport: null,
  people: INITIAL_PEOPLE,
  category: null,
  budget: { min: 0, max: 0 },
  currentStep: 'destination',
}

export const useStore = create<AppState>((set, get) => ({
  ...initialState,

  setDestination: (destination) =>
    set({
      destination,
      budget: destination
        ? { min: destination.minBudget, max: destination.minBudget * 2 }
        : { min: 0, max: 0 },
    }),

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
