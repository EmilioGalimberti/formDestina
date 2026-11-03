import type { FormState } from '@/state/types'

const WHATSAPP_NUMBER = '543513213398'

function formatDestinationName(destination: FormState['destinations'][number], nights: number | undefined) {
  if (!nights || nights <= 0) return destination.name
  return `${destination.name} (${nights} ${nights === 1 ? 'noche' : 'noches'})`
}

function formatDestinations(destinations: FormState['destinations'], daysByDestination: FormState['daysByDestination']) {
  if (destinations.length === 0) return 'No seleccionado'
  return destinations.map((d) => formatDestinationName(d, daysByDestination[d.id])).join('\n- ')
}

function formatCategories(categories: FormState['categories']) {
  if (categories.length === 0) return 'No seleccionado'
  return categories.map((c) => c.name).join(', ')
}

function formatTravelers(
  people: number,
  minors: number,
  minorAges: FormState['minorAges'],
) {
  if (minors > 0) {
    const agesLabel = minorAges
      .filter((age): age is number => age !== null)
      .map((age) => `${age} ${age === 1 ? 'año' : 'años'}`)
      .join(', ')
    return `${people} ${people === 1 ? 'adulto' : 'adultos'} y ${minors} ${minors === 1 ? 'menor' : 'menores'}${agesLabel ? ` (${agesLabel})` : ''}`
  }
  return `${people} ${people === 1 ? 'adulto' : 'adultos'}`
}

function formatDates(selectedDates: string[]) {
  if (selectedDates.length === 0) return 'No seleccionado'
  const sorted = [...selectedDates].sort()
  const first = new Date(sorted[0] + 'T00:00:00')
  const last = new Date(sorted[sorted.length - 1] + 'T00:00:00')
  const monthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long' })
  const dayFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric' })
  const firstMonth = monthFormatter.format(first)
  const lastMonth = monthFormatter.format(last)
  if (sorted.length === 1) {
    return `${dayFormatter.format(first)} de ${firstMonth}`
  }
  if (firstMonth === lastMonth) {
    return `${dayFormatter.format(first)} al ${dayFormatter.format(last)} de ${firstMonth}`
  }
  return `${dayFormatter.format(first)} de ${firstMonth} al ${dayFormatter.format(last)} de ${lastMonth}`
}

export function buildMessage(state: FormState): string {
  const lines = [
    '*Hola Destina!* Quiero armar un viaje con ustedes.',
    '',
    `*Desde:* ${state.origin?.trim() || 'No indicado'}`,
    '',
    '*Destinos y noches*',
    `- ${formatDestinations(state.destinations, state.daysByDestination)}`,
    '',
    `*Fechas:* ${formatDates(state.selectedDates)}`,
    `*Viajeros:* ${formatTravelers(state.people, state.minors, state.minorAges)}`,
    `*Estilo:* ${formatCategories(state.categories)}`,
    `*Categoría:* ${state.budgetCategory?.name ?? 'No seleccionado'}`,
  ]

  if (state.isFlexible) {
    lines.push('*Flexibilidad:* soy flexible con los días de viaje.')
  }

  lines.push(
    '',
    '¡Gracias! Quedo atento/a para que me contacten.',
  )

  return lines.join('\n')
}

export function buildWaLink(state: FormState): string {
  const text = encodeURIComponent(buildMessage(state))
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
}
