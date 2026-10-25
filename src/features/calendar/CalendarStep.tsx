import { useState } from 'react'
import { useStore } from '@/state/store'
import { Checkbox } from '@/ui/Checkbox'

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const WEEKDAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstWeekday(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseDateKey(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return { year, month: month - 1, day }
}

function getDatesBetween(start: string, end: string) {
  let startDate = new Date(start + 'T00:00:00')
  let endDate = new Date(end + 'T00:00:00')
  if (startDate > endDate) {
    const temp = startDate
    startDate = endDate
    endDate = temp
  }

  const dates: string[] = []
  const current = new Date(startDate)
  while (current <= endDate) {
    dates.push(formatDateKey(current.getFullYear(), current.getMonth(), current.getDate()))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

export function CalendarStep() {
  const {
    destinations,
    daysByDestination,
    selectedDates,
    calendarMonth,
    isFlexible,
    setSelectedDates,
    setCalendarMonth,
    setFlexible,
  } = useStore()

  const [anchorDate, setAnchorDate] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const totalDays = destinations.reduce((sum, destination) => {
    return sum + (daysByDestination[destination.id] ?? 1)
  }, 0)

  const maxSelectableDays = totalDays + 2

  const daysInMonth = getDaysInMonth(calendarMonth.year, calendarMonth.month)
  const startOffset = getFirstWeekday(calendarMonth.year, calendarMonth.month)

  const showError = (message: string) => {
    setError(message)
    window.setTimeout(() => setError(null), 2500)
  }

  const handleDayClick = (day: number) => {
    const key = formatDateKey(calendarMonth.year, calendarMonth.month, day)

    if (selectedDates.includes(key)) {
      setSelectedDates([])
      setAnchorDate(null)
      return
    }

    if (selectedDates.length === 0 || anchorDate === null) {
      setSelectedDates([key])
      setAnchorDate(key)
      return
    }

    const range = getDatesBetween(anchorDate, key)
    if (range.length > maxSelectableDays) {
      showError(`Podés seleccionar hasta ${maxSelectableDays} días (${totalDays} del viaje + 2 por vuelos).`)
      return
    }

    setSelectedDates(range)
    setAnchorDate(null)
  }

  const changeMonth = (delta: number) => {
    const nextMonth = calendarMonth.month + delta
    const year = calendarMonth.year + Math.floor(nextMonth / 12)
    const month = ((nextMonth % 12) + 12) % 12
    setCalendarMonth(year, month)
  }

  const sortedDates = [...selectedDates].sort()
  const formattedRange = (() => {
    if (sortedDates.length === 0) return null
    const first = parseDateKey(sortedDates[0])
    const last = parseDateKey(sortedDates[sortedDates.length - 1])
    const monthName = MONTH_NAMES[first.month].toLowerCase()
    if (sortedDates.length === 1) {
      return `${first.day} de ${monthName}`
    }
    if (first.month === last.month) {
      return `${first.day} al ${last.day} de ${monthName}`
    }
    return `${first.day} de ${MONTH_NAMES[first.month].toLowerCase()} al ${last.day} de ${MONTH_NAMES[last.month].toLowerCase()}`
  })()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">¿Qué días querés viajar?</h2>
        <p className="mt-1 text-muted-foreground">
          Seleccioná el día de inicio y el día de fin. Hasta {maxSelectableDays} días ({totalDays} del viaje + 2 por vuelos).
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg font-semibold text-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Mes anterior"
          >
            ‹
          </button>

          <span className="text-lg font-semibold text-foreground">
            {MONTH_NAMES[calendarMonth.month]} {calendarMonth.year}
          </span>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg font-semibold text-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAY_NAMES.map((name) => (
            <div key={name} className="py-2 text-xs font-semibold text-muted-foreground">
              {name}
            </div>
          ))}

          {Array.from({ length: startOffset }).map((_, index) => (
            <div key={`offset-${index}`} aria-hidden="true" />
          ))}

          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1
            const key = formatDateKey(calendarMonth.year, calendarMonth.month, day)
            const selected = selectedDates.includes(key)
            const isAnchor = anchorDate === key

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleDayClick(day)}
                aria-pressed={selected}
                className={`aspect-square rounded-xl text-sm font-medium outline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selected
                    ? 'bg-primary text-primary-foreground'
                    : isAnchor
                      ? 'bg-primary/20 text-primary'
                      : 'text-foreground hover:bg-muted'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <p className="text-center text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      {formattedRange && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-center">
          <span className="text-sm text-muted-foreground">Fechas seleccionadas</span>
          <p className="text-lg font-semibold text-primary">{formattedRange}</p>
          <p className="text-xs text-muted-foreground">
            {selectedDates.length} {selectedDates.length === 1 ? 'día' : 'días'}
          </p>
        </div>
      )}

      <Checkbox
        label="Soy flexible con los días de viaje"
        checked={isFlexible}
        onChange={(event) => setFlexible(event.target.checked)}
      />
    </div>
  )
}
