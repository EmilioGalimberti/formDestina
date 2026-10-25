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
      <header className="sticky top-0 z-10 bg-white px-4 py-2 shadow-sm md:px-6 md:py-4">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 md:gap-4">
          <img
            src="/images/logo.png"
            alt="Destina"
            className="h-10 w-10 shrink-0 rounded-full object-cover md:h-14 md:w-14"
            width="512"
            height="512"
          />
          <div className="flex-1">
            <WizardProgress progress={progress} />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 py-4 md:px-6 md:py-6" aria-label={`Paso ${step.title}`}>
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

      <footer className="sticky bottom-0 bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm md:px-6 md:pb-[max(1rem,env(safe-area-inset-bottom))] md:pt-4">
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
