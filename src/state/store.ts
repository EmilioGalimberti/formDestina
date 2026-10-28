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
  | 'setMinorAges'
  | 'setMinorAge'
  | 'toggleCategory'
  | 'setBudgetCategory'
  | 'toggleDate'
  | 'setSelectedDates'
  | 'setCalendarMonth'
  | 'setFlexible'
  | 'setOrigin'
  | 'setStepError'
  | 'goToStep'
  | 'nextStep'
  | 'previousStep'
  | 'reset'
> = {
  destinations: [],
  daysByDestination: {},
  people: INITIAL_PEOPLE,
  minors: 0,
  minorAges: [],
  categories: [],
  budgetCategory: null,
  selectedDates: [],
  calendarMonth: { year: NOW.getFullYear(), month: NOW.getMonth() },
  isFlexible: false,
  origin: null,
  currentStep: 'destination',
  stepError: null,
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
    set((state) => {
      const nextMinors = Math.max(0, minors)
      const minorAges = state.minorAges.slice(0, nextMinors)
      while (minorAges.length < nextMinors) {
        minorAges.push(null)
      }
      return {
        minors: nextMinors,
        minorAges,
      }
    }),

  setMinorAges: (minorAges) => set({ minorAges }),

  setMinorAge: (index, age) =>
    set((state) => {
      const minorAges = [...state.minorAges]
      if (index >= 0 && index < minorAges.length) {
        minorAges[index] = age
      }
      return { minorAges }
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

  setOrigin: (origin) => set({ origin: origin || null }),

  setStepError: (stepError) => set({ stepError }),

  goToStep: (step) => set({ currentStep: step, stepError: null }),

  nextStep: () => {
    const state = get()
    const index = STEP_ORDER.indexOf(state.currentStep)
    if (index < 0 || index >= STEP_ORDER.length - 1) return

    switch (state.currentStep) {
      case 'destination':
        if (state.destinations.length === 0) {
          set({ stepError: 'Seleccioná al menos un destino para continuar.' })
          return
        }
        break
      case 'calendar':
        if (state.selectedDates.length === 0) {
          set({ stepError: 'Seleccioná al menos un día para continuar.' })
          return
        }
        break
      case 'people':
        if (state.minors > 0) {
          const allAgesValid =
            state.minorAges.length === state.minors &&
            state.minorAges.every((age) => age !== null && age >= 1 && age <= 17)
          if (!allAgesValid) {
            const hasEmptyAge = state.minorAges.some((age) => age === null)
            const message = hasEmptyAge
              ? 'Ingresá la edad de todos los menores para continuar.'
              : 'La edad de los menores debe estar entre 1 y 17 años.'
            window.alert(message)
            set({ stepError: message })
            return
          }
        }
        break
      case 'category':
        if (state.categories.length === 0) {
          set({ stepError: 'Seleccioná al menos una categoría para continuar.' })
          return
        }
        break
      case 'budget':
        if (state.budgetCategory === null) {
          set({ stepError: 'Seleccioná una opción de presupuesto para continuar.' })
          return
        }
        break
    }

    set({ currentStep: STEP_ORDER[index + 1], stepError: null })
  },

  previousStep: () => {
    const { currentStep } = get()
    const index = STEP_ORDER.indexOf(currentStep)
    if (index > 0) {
      set({ currentStep: STEP_ORDER[index - 1], stepError: null })
    }
  },

  reset: () => set(initialState),
}))
