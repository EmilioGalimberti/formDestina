import type { FormState } from '@/state/types'

const WHATSAPP_NUMBER = '543804624385'

function formatDestinationName(destination: FormState['destinations'][number], days: number | undefined) {
  if (!days || days <= 0) return destination.name
  return `${destination.name} (${days} ${days === 1 ? 'día' : 'días'})`
}

function formatDestinations(destinations: FormState['destinations'], daysByDestination: FormState['daysByDestination']) {
  if (destinations.length === 0) return 'No seleccionado'
  return destinations.map((d) => formatDestinationName(d, daysByDestination[d.id])).join(', ')
}

export function buildMessage(state: FormState): string {
  const destinationLabel = state.destinations.length > 1 ? 'Destinos' : 'Destino'
  const lines = [
    'Hola Martina, quiero armar un viaje con Destina.',
    '',
    `${destinationLabel}: ${formatDestinations(state.destinations, state.daysByDestination)}`,
    `Viajeros: ${state.people}`,
    `Estilo: ${state.category?.name ?? 'No seleccionado'}`,
    `Categoría: ${state.budgetCategory?.name ?? 'No seleccionado'}`,
    '',
    '¡A viajar!',
  ]

  return lines.join('\n')
}

export function buildWaLink(state: FormState): string {
  const text = encodeURIComponent(buildMessage(state))
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
}
