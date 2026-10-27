import { create } from 'zustand'
import type { AppState, Destination, StepId } from '@/state/types'

export const STEP_ORDER: StepId[] = [
  'destination',
  'days',
  'calendar',
  'people',
  'category',
  'budget',
  'result',
]

const INITIAL_PEOPLE = 1
const NOW = new Date()

const initialState: Omit<
  AppState,
  | 'toggleDestination'
  | 'addCustomDestination'
  | 'setDestinationDays'
  | 'setPeople'
  | 'setMinors'
  | 'toggleCategory'
  | 'setBudgetCategory'
  | 'toggleDate'
  | 'setSelectedDates'
  | 'setCalendarMonth'
  | 'setFlexible'
  | 'setOrigin'
  | 'goToStep'
  | 'nextStep'
  | 'previousStep'
  | 'reset'
> = {
  destinations: [],
  daysByDestination: {},
  people: INITIAL_PEOPLE,
  minors: 0,
  categories: [],
  budgetCategory: null,
  selectedDates: [],
  calendarMonth: { year: NOW.getFullYear(), month: NOW.getMonth() },
  isFlexible: false,
  origin: null,
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

  addCustomDestination: (name) =>
    set((state) => {
      const trimmed = name.trim()
      if (trimmed.length === 0) return state
      if (/\d/.test(trimmed)) return state

      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const destination: Destination = {
        id,
        name: trimmed,
        lat: 0,
        lon: 0,
        minBudget: 0,
        minZoom: 0,
        custom: true,
      }

      return {
        destinations: [...state.destinations, destination],
        daysByDestination: { ...state.daysByDestination, [id]: 1 },
      }
    }),

  setDestinationDays: (destinationId, days) =>
    set((state) => ({
      daysByDestination: {
        ...state.daysByDestination,
        [destinationId]: Math.max(1, days),
      },
    })),

  setPeople: (people) =>
    set((state) => {
      const nextPeople = Math.max(1, people)
      return {
        people: nextPeople,
        minors: state.minors,
      }
    }),

  setMinors: (minors) =>
    set({
      minors: Math.max(0, minors),
    }),

  toggleCategory: (category) =>
    set((state) => {
      const exists = state.categories.some((c) => c.id === category.id)
      const categories = exists
        ? state.categories.filter((c) => c.id !== category.id)
        : [...state.categories, category]
      return { categories }
    }),

  setBudgetCategory: (budgetCategory) => set({ budgetCategory }),

  toggleDate: (date) =>
    set((state) => {
      const exists = state.selectedDates.includes(date)
      const selectedDates = exists
        ? state.selectedDates.filter((d) => d !== date)
        : [...state.selectedDates, date].sort()
      return { selectedDates }
    }),

  setSelectedDates: (dates) => set({ selectedDates: dates.sort() }),

  setCalendarMonth: (year, month) => set({ calendarMonth: { year, month } }),

  setFlexible: (isFlexible) => set({ isFlexible }),

  setOrigin: (origin) => set({ origin: origin?.trim() || null }),

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
