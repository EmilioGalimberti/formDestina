import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '@/state/store'
import { buildWaLink } from '@/lib/whatsapp'

interface ReverseGeocodeResponse {
  city?: string
  locality?: string
  principalSubdivision?: string
  countryName?: string
}

interface TicketRowProps {
  label: string
  value: React.ReactNode
  emphasis?: boolean
}

function TicketRow({ label, value, emphasis }: TicketRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:text-xs">
        {label}
      </span>
      <span
        className={`text-sm font-medium text-foreground md:text-base ${emphasis ? 'font-bold' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}

function TicketDivider() {
  return (
    <div className="relative my-1 flex items-center">
      <div className="absolute -left-5 h-6 w-6 rounded-full bg-background md:-left-7" />
      <div className="flex-1 border-t-2 border-dashed border-border" />
      <div className="absolute -right-5 h-6 w-6 rounded-full bg-background md:-right-7" />
    </div>
  )
}

function Barcode() {
  return (
    <div className="flex h-10 items-end justify-between gap-0.5 px-2 opacity-70">
      {Array.from({ length: 28 }).map((_, index) => {
        const width = index % 3 === 0 ? 'w-1' : index % 2 === 0 ? 'w-0.5' : 'w-1.5'
        return <div key={index} className={`${width} h-full bg-foreground`} />
      })}
    </div>
  )
}

function LocationSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export function ResultStep() {
  const state = useStore()
  const {
    destinations,
    daysByDestination,
    people,
    minors,
    categories,
    budgetCategory,
    selectedDates,
    isFlexible,
    origin,
    setOrigin,
  } = state

  const [isLocating, setIsLocating] = useState(() => {
    if (origin) return false
    return typeof navigator !== 'undefined' && !!navigator.geolocation
  })
  const [showError, setShowError] = useState(false)
  const autoRequestedRef = useRef(false)

  const waLink = buildWaLink(state)

  const resolveLocation = useCallback(async (position: GeolocationPosition) => {
    try {
      const { latitude, longitude } = position.coords
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`,
      )

      if (!response.ok) {
        setIsLocating(false)
        return
      }

      const data: ReverseGeocodeResponse = await response.json()
      const city = data.locality || data.city || data.principalSubdivision
      const country = data.countryName

      if (!city && !country) {
        setIsLocating(false)
        return
      }

      const location = [city, country].filter(Boolean).join(', ')
      setOrigin(location)
      setIsLocating(false)
    } catch {
      setIsLocating(false)
    }
  }, [setOrigin])

  useEffect(() => {
    if (origin) return
    if (autoRequestedRef.current) return
    if (typeof navigator === 'undefined' || !navigator.geolocation) return

    autoRequestedRef.current = true
    navigator.geolocation.getCurrentPosition(
      resolveLocation,
      () => setIsLocating(false),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    )
  }, [origin, setOrigin, resolveLocation])

  const handleOriginChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOrigin(event.target.value)
    if (showError && event.target.value.trim()) {
      setShowError(false)
    }
  }

  const handleRequestLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setIsLocating(false)
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      resolveLocation,
      () => setIsLocating(false),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    )
  }

  const handleSendClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!origin?.trim()) {
      event.preventDefault()
      setShowError(true)
    }
  }

  const formatDestination = (destination: (typeof destinations)[number]) => {
    const days = daysByDestination[destination.id] ?? 1
    return `${destination.name} (${days} ${days === 1 ? 'día' : 'días'})`
  }

  const destinationLabel = destinations.map(formatDestination).join(', ') || '—'

  const datesLabel = (() => {
    if (selectedDates.length === 0) return '—'
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
  })()

  const travelersLabel = (() => {
    if (minors > 0) {
      return `${people} ${people === 1 ? 'adulto' : 'adultos'} + ${minors} ${minors === 1 ? 'menor' : 'menores'}`
    }
    return `${people} ${people === 1 ? 'adulto' : 'adultos'}`
  })()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Tu pasaje está listo</h2>
        <p className="mt-1 text-muted-foreground">Revisá los datos y enviale el mensaje a Martina.</p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="bg-primary px-5 py-4 text-primary-foreground md:px-6 md:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 md:h-6 md:w-6"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-widest md:text-sm">Pasaje armado</span>
            </div>
            <span className="text-[10px] font-semibold opacity-80 md:text-xs">DESTINA</span>
          </div>
        </div>

        <div className="px-5 py-5 md:px-6 md:py-6">
          <div className="mb-5 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="origin-input" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:text-xs">
                Desde
              </label>
              <div className="relative">
                <input
                  id="origin-input"
                  type="text"
                  value={origin ?? ''}
                  onChange={handleOriginChange}
                  placeholder="Ej: Buenos Aires, Argentina"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {isLocating && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <LocationSpinner />
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleRequestLocation}
                className="self-start text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                Usar mi ubicación actual
              </button>
              {showError && !origin?.trim() && (
                <p className="text-sm font-medium text-red-600" role="alert">
                  Ingresá desde dónde querés armar el viaje.
                </p>
              )}
            </div>
            <TicketRow label="Hacia" value={destinations.map((d) => d.name).join(', ') || '—'} emphasis />
          </div>

          <TicketDivider />

          <div className="grid grid-cols-2 gap-y-5 gap-x-4 py-5">
            <TicketRow label="Pasajeros" value={travelersLabel} />
            <TicketRow label="Fechas" value={datesLabel} />
            <TicketRow label="Estilo" value={categories.map((c) => c.name).join(', ') || '—'} />
            <TicketRow label="Categoría" value={budgetCategory?.name ?? '—'} />
            {isFlexible && <TicketRow label="Flexibilidad" value="Sí" />}
          </div>

          <TicketDivider />

          <div className="pt-4">
            <TicketRow label="Destinos y días" value={destinationLabel} />
          </div>

          <div className="mt-6 rounded-xl bg-muted p-3">
            <Barcode />
          </div>
        </div>
      </div>

      <a
        href={origin?.trim() ? waLink : undefined}
        onClick={handleSendClick}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!origin?.trim()}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-lg font-semibold outline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 ${
          origin?.trim()
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'cursor-not-allowed bg-muted text-muted-foreground'
        }`}
        aria-label="Enviar resumen del viaje a Martina por WhatsApp"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
        ¡A viajar!
      </a>
    </div>
  )
}
