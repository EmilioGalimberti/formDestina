interface WizardNavProps {
  isFirst: boolean
  isLast: boolean
  onBack: () => void
  onNext: () => void
}

export function WizardNav({ isFirst, isLast, onBack, onNext }: WizardNavProps) {
  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      <button
        type="button"
        onClick={onBack}
        disabled={isFirst}
        className="rounded-xl px-5 py-3 font-medium text-muted-foreground outline-offset-4 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30"
        aria-label="Paso anterior"
      >
        Atrás
      </button>

      {!isLast && (
        <button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground outline-offset-4 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
          aria-label="Siguiente paso"
        >
          Siguiente
        </button>
      )}
    </div>
  )
}
