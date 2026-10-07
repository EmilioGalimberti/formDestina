import type { Destination } from '@/state/types'

export type PlaceKind = 'country' | 'capital' | 'city'

export interface Place {
  id: string
  name: string
  lat: number
  lon: number
  country: string
  kind: PlaceKind
  minZoom: number
  maxZoom?: number
  minBudget?: number
}

const COUNTRY_MAX_ZOOM = 2.0
const CITY_MIN_ZOOM = 2.3

export const PLACES: Place[] = [
  { id: 'argentina', name: 'Argentina', lat: -34, lon: -64, country: 'Argentina', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 400 },
  { id: 'brasil', name: 'Brasil', lat: -11, lon: -53, country: 'Brasil', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 500 },
  { id: 'chile', name: 'Chile', lat: -35, lon: -71, country: 'Chile', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 600 },
  { id: 'uruguay', name: 'Uruguay', lat: -33, lon: -56, country: 'Uruguay', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 550 },
  { id: 'paraguay', name: 'Paraguay', lat: -23, lon: -58, country: 'Paraguay', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 450 },
  { id: 'bolivia', name: 'Bolivia', lat: -17, lon: -64, country: 'Bolivia', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 450 },
  { id: 'peru', name: 'Perú', lat: -9, lon: -75, country: 'Perú', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 600 },
  { id: 'ecuador', name: 'Ecuador', lat: -1.5, lon: -78.5, country: 'Ecuador', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 600 },
  { id: 'colombia', name: 'Colombia', lat: 4.5, lon: -73.5, country: 'Colombia', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 550 },
  { id: 'venezuela', name: 'Venezuela', lat: 8, lon: -66, country: 'Venezuela', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 450 },
  { id: 'estados-unidos', name: 'Estados Unidos', lat: 39, lon: -98, country: 'Estados Unidos', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 900 },
  { id: 'canada', name: 'Canadá', lat: 56, lon: -106, country: 'Canadá', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 900 },
  { id: 'mexico', name: 'México', lat: 24, lon: -102, country: 'México', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 500 },
  { id: 'espana', name: 'España', lat: 40, lon: -3.5, country: 'España', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 800 },
  { id: 'francia', name: 'Francia', lat: 47, lon: 2.5, country: 'Francia', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 850 },
  { id: 'italia', name: 'Italia', lat: 42.5, lon: 12.5, country: 'Italia', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 850 },
  { id: 'alemania', name: 'Alemania', lat: 51.2, lon: 10.5, country: 'Alemania', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 850 },
  { id: 'reino-unido', name: 'Reino Unido', lat: 53.5, lon: -2.5, country: 'Reino Unido', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 900 },
  { id: 'portugal', name: 'Portugal', lat: 39.5, lon: -8, country: 'Portugal', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 750 },
  { id: 'paises-bajos', name: 'Países Bajos', lat: 52.4, lon: 5.3, country: 'Países Bajos', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 850 },
  { id: 'hungria', name: 'Hungría', lat: 47.2, lon: 19.5, country: 'Hungría', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 700 },
  { id: 'austria', name: 'Austria', lat: 47.6, lon: 14.1, country: 'Austria', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 800 },
  { id: 'checa', name: 'República Checa', lat: 49.8, lon: 15.5, country: 'República Checa', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 700 },
  { id: 'aruba', name: 'Aruba', lat: 12.52, lon: -70.03, country: 'Aruba', kind: 'country', minZoom: 0, maxZoom: COUNTRY_MAX_ZOOM, minBudget: 800 },

  { id: 'buenos-aires', name: 'Buenos Aires', lat: -34.6, lon: -58.38, country: 'Argentina', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 400 },
  { id: 'brasilia', name: 'Brasilia', lat: -15.79, lon: -47.88, country: 'Brasil', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 600 },
  { id: 'santiago', name: 'Santiago', lat: -33.45, lon: -70.67, country: 'Chile', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 600 },
  { id: 'montevideo', name: 'Montevideo', lat: -34.9, lon: -56.16, country: 'Uruguay', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 550 },
  { id: 'asuncion', name: 'Asunción', lat: -25.26, lon: -57.58, country: 'Paraguay', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 450 },
  { id: 'la-paz', name: 'La Paz', lat: -16.49, lon: -68.15, country: 'Bolivia', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 450 },
  { id: 'lima', name: 'Lima', lat: -12.05, lon: -77.04, country: 'Perú', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 600 },
  { id: 'quito', name: 'Quito', lat: -0.18, lon: -78.47, country: 'Ecuador', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 600 },
  { id: 'bogota', name: 'Bogotá', lat: 4.71, lon: -74.07, country: 'Colombia', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 550 },
  { id: 'caracas', name: 'Caracas', lat: 10.48, lon: -66.9, country: 'Venezuela', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 450 },
  { id: 'washington-dc', name: 'Washington D.C.', lat: 38.9, lon: -77.04, country: 'Estados Unidos', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 900 },
  { id: 'ottawa', name: 'Ottawa', lat: 45.42, lon: -75.7, country: 'Canadá', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 900 },
  { id: 'ciudad-de-mexico', name: 'Ciudad de México', lat: 19.43, lon: -99.13, country: 'México', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 500 },
  { id: 'madrid', name: 'Madrid', lat: 40.42, lon: -3.7, country: 'España', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 800 },
  { id: 'paris', name: 'París', lat: 48.86, lon: 2.35, country: 'Francia', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 850 },
  { id: 'roma', name: 'Roma', lat: 41.9, lon: 12.5, country: 'Italia', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 850 },
  { id: 'berlin', name: 'Berlín', lat: 52.52, lon: 13.4, country: 'Alemania', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 850 },
  { id: 'londres', name: 'Londres', lat: 51.5, lon: -0.13, country: 'Reino Unido', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 900 },
  { id: 'lisboa', name: 'Lisboa', lat: 38.72, lon: -9.14, country: 'Portugal', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 750 },
  { id: 'amsterdam', name: 'Ámsterdam', lat: 52.37, lon: 4.9, country: 'Países Bajos', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 850 },
  { id: 'budapest', name: 'Budapest', lat: 47.5, lon: 19.04, country: 'Hungría', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 700 },
  { id: 'viena', name: 'Viena', lat: 48.21, lon: 16.37, country: 'Austria', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 800 },
  { id: 'praga', name: 'Praga', lat: 50.08, lon: 14.44, country: 'República Checa', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 700 },
  { id: 'oranjestad', name: 'Oranjestad', lat: 12.52, lon: -70.03, country: 'Aruba', kind: 'capital', minZoom: CITY_MIN_ZOOM, minBudget: 800 },

  { id: 'cordoba', name: 'Córdoba', lat: -31.42, lon: -64.18, country: 'Argentina', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 400 },
  { id: 'mendoza', name: 'Mendoza', lat: -32.89, lon: -68.84, country: 'Argentina', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 450 },
  { id: 'salta', name: 'Salta', lat: -24.78, lon: -65.41, country: 'Argentina', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 400 },
  { id: 'tucuman', name: 'Tucumán', lat: -26.82, lon: -65.22, country: 'Argentina', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 400 },
  { id: 'bariloche', name: 'Bariloche', lat: -41.13, lon: -71.31, country: 'Argentina', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 700 },
  { id: 'cataratas', name: 'Cataratas', lat: -25.6, lon: -54.58, country: 'Argentina', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 500 },
  { id: 'ushuaia', name: 'Ushuaia', lat: -54.8, lon: -68.3, country: 'Argentina', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 700 },

  { id: 'rio-de-janeiro', name: 'Río de Janeiro', lat: -22.91, lon: -43.17, country: 'Brasil', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 600 },
  { id: 'sao-paulo', name: 'São Paulo', lat: -23.55, lon: -46.63, country: 'Brasil', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 600 },
  { id: 'maceio', name: 'Maceió', lat: -9.67, lon: -35.74, country: 'Brasil', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 500 },
  { id: 'natal', name: 'Natal', lat: -5.79, lon: -35.21, country: 'Brasil', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 500 },
  { id: 'florianopolis', name: 'Florianópolis', lat: -27.6, lon: -48.55, country: 'Brasil', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 550 },
  { id: 'recife', name: 'Recife', lat: -8.05, lon: -34.9, country: 'Brasil', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 500 },

  { id: 'cartagena', name: 'Cartagena de Indias', lat: 10.4, lon: -75.51, country: 'Colombia', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 600 },

  { id: 'los-angeles', name: 'Los Ángeles', lat: 34.05, lon: -118.24, country: 'Estados Unidos', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 900 },
  { id: 'miami', name: 'Miami', lat: 25.76, lon: -80.19, country: 'Estados Unidos', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 900 },
  { id: 'nueva-york', name: 'Nueva York', lat: 40.71, lon: -74.01, country: 'Estados Unidos', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 900 },

  { id: 'cancun', name: 'Cancún', lat: 21.17, lon: -86.85, country: 'México', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 700 },

  { id: 'barcelona', name: 'Barcelona', lat: 41.39, lon: 2.17, country: 'España', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 800 },
  { id: 'malaga', name: 'Málaga', lat: 36.72, lon: -4.42, country: 'España', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 750 },
  { id: 'valencia', name: 'Valencia', lat: 39.47, lon: -0.38, country: 'España', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 750 },
  { id: 'sevilla', name: 'Sevilla', lat: 37.39, lon: -5.98, country: 'España', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 750 },

  { id: 'venecia', name: 'Venecia', lat: 45.44, lon: 12.32, country: 'Italia', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 850 },
  { id: 'florencia', name: 'Florencia', lat: 43.77, lon: 11.26, country: 'Italia', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 850 },
  { id: 'milan', name: 'Milán', lat: 45.46, lon: 9.19, country: 'Italia', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 850 },
  { id: 'napoles', name: 'Nápoles', lat: 40.85, lon: 14.27, country: 'Italia', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 800 },

  { id: 'manchester', name: 'Manchester', lat: 53.48, lon: -2.24, country: 'Reino Unido', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 800 },
  { id: 'birmingham', name: 'Birmingham', lat: 52.49, lon: -1.89, country: 'Reino Unido', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 800 },

  { id: 'porto', name: 'Porto', lat: 41.15, lon: -8.61, country: 'Portugal', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 700 },

  { id: 'rotterdam', name: 'Róterdam', lat: 51.92, lon: 4.48, country: 'Países Bajos', kind: 'city', minZoom: CITY_MIN_ZOOM, minBudget: 850 },
]

export const COUNTRY_DESTINATIONS: Destination[] = PLACES.filter(
  (place) => place.kind === 'country',
).map((place) => ({
  id: place.id,
  name: place.name,
  lat: place.lat,
  lon: place.lon,
  minBudget: place.minBudget ?? 0,
  minZoom: 0,
}))

export const PLACE_DESTINATIONS: Destination[] = PLACES.filter(
  (place) => place.kind !== 'country',
).map((place) => ({
  id: place.id,
  name: place.name,
  lat: place.lat,
  lon: place.lon,
  minBudget: place.minBudget ?? 0,
  minZoom: CITY_MIN_ZOOM,
}))
