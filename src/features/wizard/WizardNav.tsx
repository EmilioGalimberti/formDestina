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
        className="rounded-xl px-5 py-3 font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
      >
        Atrás
      </button>

      {!isLast && (
        <button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground active:scale-95"
        >
          Siguiente
        </button>
      )}
    </div>
  )
}
