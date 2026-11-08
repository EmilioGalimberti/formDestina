import { useLayoutEffect, useRef } from 'react'
import { useStore } from '@/state/store'
import { gsap } from '@/lib/gsap'
import { WizardNav } from '@/features/wizard/WizardNav'
import { WizardProgress } from '@/features/wizard/WizardProgress'
import { useWizardStep } from '@/features/wizard/useWizardStep'

export function Wizard() {
  const { currentStep, nextStep, previousStep } = useStore()
  const { step, isFirst, isLast, progress } = useWizardStep(currentStep)
  const contentRef = useRef<HTMLDivElement>(null)
  const StepComponent = step.component

  useLayoutEffect(() => {
    const el = contentRef.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    gsap.fromTo(
      el,
      { opacity: 0, x: 24 },
      { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' },
    )
  }, [currentStep])

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 bg-white px-4 py-1 shadow-sm md:px-6 md:py-2">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-2 md:gap-3">
          <img
            src="/images/logo.svg"
            alt="Destina"
            className="h-16 w-auto shrink-0 object-contain md:h-20"
          />
          <div className="flex-1">
            <WizardProgress progress={progress} />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 py-4 pb-[max(6rem,env(safe-area-inset-bottom))] md:px-6 md:py-6 md:pb-[max(7rem,env(safe-area-inset-bottom))]" aria-label={`Paso ${step.title}`}>
        <div className="mx-auto w-full max-w-2xl flex-1">
          <div
            ref={contentRef}
            className="rounded-3xl border border-border bg-card p-6 shadow-sm outline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-10"
            tabIndex={-1}
          >
            <StepComponent />
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-20 bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm md:px-6 md:pb-[max(1rem,env(safe-area-inset-bottom))] md:pt-4">
        <div className="mx-auto w-full max-w-2xl">
          <WizardNav isFirst={isFirst} isLast={isLast} onBack={previousStep} onNext={nextStep} />
        </div>
      </footer>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {step.title}
      </div>
    </div>
  )
}
