import type { FormState } from '@/state/types'

const WHATSAPP_NUMBER = '543804624385'

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function buildMessage(state: FormState): string {
  const lines = [
    'Hola Martina, quiero armar un viaje con Destina.',
    '',
    `Destino: ${state.destination?.name ?? 'No seleccionado'}`,
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
