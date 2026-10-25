interface WizardNavProps {
  isFirst: boolean
  isLast: boolean
  onBack: () => void
  onNext: () => void
}

export function WizardNav({ isFirst, isLast, onBack, onNext }: WizardNavProps) {
  return (
    <div className="flex items-center justify-between gap-4 pt-2 md:pt-4">
      <button
        type="button"
        onClick={onBack}
        disabled={isFirst}
        className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground outline-offset-4 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30 md:px-5 md:py-3 md:text-base"
        aria-label="Paso anterior"
      >
        Atrás
      </button>

      {!isLast && (
        <button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground outline-offset-4 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 md:px-6 md:py-3 md:text-base"
          aria-label="Siguiente paso"
        >
          Siguiente
        </button>
      )}
    </div>
  )
}
