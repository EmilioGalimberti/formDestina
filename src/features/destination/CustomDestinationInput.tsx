import { useState } from 'react'

interface CustomDestinationInputProps {
  onAdd: (name: string) => void
}

const DIGIT_REGEX = /\d/

function normalizeName(value: string) {
  return value.replace(/\d/g, '')
}

export function CustomDestinationInput({ onAdd }: CustomDestinationInputProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value
    const hasDigit = DIGIT_REGEX.test(next)
    if (hasDigit) {
      setError('El destino no puede contener números')
    } else {
      setError(null)
    }
    setValue(normalizeName(next))
  }

  const submit = () => {
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      setError('Ingresá un destino')
      return
    }
    if (DIGIT_REGEX.test(trimmed)) {
      setError('El destino no puede contener números')
      return
    }
    onAdd(trimmed)
    setValue('')
    setError(null)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      submit()
      return
    }
    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault()
      setError('El destino no puede contener números')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="custom-destination" className="text-sm font-medium text-muted-foreground">
        ¿No encontrás tu destino?
      </label>
      <div className="flex gap-2">
        <input
          id="custom-destination"
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Escribí tu destino"
          className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-offset-4 transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'custom-destination-error' : undefined}
        />
        <button
          type="button"
          onClick={submit}
          className="shrink-0 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground outline-offset-4 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
        >
          Agregar destino
        </button>
      </div>
      {error && (
        <p id="custom-destination-error" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
