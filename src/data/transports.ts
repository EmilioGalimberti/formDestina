import type { Transport } from '@/state/types'

export const TRANSPORTS: Transport[] = [
  {
    id: 'plane',
    name: 'Avión',
    image: '/images/transport/avion.svg',
  },
  {
    id: 'bus',
    name: 'Bus',
    image: '/images/transport/bus.svg',
  },
  {
    id: 'car',
    name: 'Auto',
    image: '/images/transport/auto.svg',
  },
  {
    id: 'train',
    name: 'Tren',
    image: '/images/transport/tren.svg',
  },
]
