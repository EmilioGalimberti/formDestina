import type { FormState } from '@/state/types'

const WHATSAPP_NUMBER = '543804624385'

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDestinations(destinations: FormState['destinations']) {
  if (destinations.length === 0) return 'No seleccionado'
  if (destinations.length === 1) return destinations[0].name
  return destinations.map((d) => d.name).join(', ')
}

export function buildMessage(state: FormState): string {
  const destinationLabel = state.destinations.length > 1 ? 'Destinos' : 'Destino'
  const lines = [
    'Hola Martina, quiero armar un viaje con Destina.',
    '',
    `${destinationLabel}: ${formatDestinations(state.destinations)}`,
    `Transporte: ${state.transport?.name ?? 'No seleccionado'}`,
    `Viajeros: ${state.people}`,
    `Estilo: ${state.category?.name ?? 'No seleccionado'}`,
    `Presupuesto estimado: ${formatMoney(state.budget.min)} - ${formatMoney(state.budget.max)}`,
    '',
    '¡A viajar!',
  ]

  return lines.join('\n')
}

export function buildWaLink(state: FormState): string {
  const text = encodeURIComponent(buildMessage(state))
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
}
