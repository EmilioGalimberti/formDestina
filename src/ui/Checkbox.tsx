import { forwardRef, type InputHTMLAttributes } from 'react'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <label
        className={`inline-flex cursor-pointer items-center gap-3 select-none ${className}`}
      >
        <span className="relative flex h-6 w-6 items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            className="peer sr-only"
            {...props}
          />
          <span
            className="h-6 w-6 rounded-md border-2 border-border bg-card transition-colors peer-checked:border-primary peer-checked:bg-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-40"
            aria-hidden="true"
          />
          <svg
            className="pointer-events-none absolute h-4 w-4 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <span className="text-foreground">{label}</span>
      </label>
    )
  },
)

Checkbox.displayName = 'Checkbox'
