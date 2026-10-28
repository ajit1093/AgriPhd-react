type StepStatus = 'complete' | 'active' | 'incomplete'

interface WizardStep {
  number: number
  label: string
  status: StepStatus
}

interface WizardStepIndicatorProps {
  steps: WizardStep[]
  /** Fires when user clicks a completed step to navigate directly */
  onStepClick?: (stepNumber: number) => void
}

const statusStyles: Record<StepStatus, { circle: string; label: string }> = {
  complete:   { circle: 'bg-agriculture text-white border-agriculture shadow-xs', label: 'text-neutral-800 font-medium' },
  active:     { circle: 'bg-academic-navy text-white border-academic-navy ring-4 ring-primary-100 shadow-xs', label: 'text-academic-navy font-bold' },
  incomplete: { circle: 'bg-white text-neutral-400 border-neutral-300', label: 'text-neutral-400' },
}

/**
 * P1-UI-11 / P6-THEME-13 — Modern Academic PhD Application Wizard Stepper.
 * Shows application wizard steps with complete / active / incomplete states.
 */
export function WizardStepIndicator({ steps, onStepClick }: WizardStepIndicatorProps) {
  const currentStep = steps.find(s => s.status === 'active')

  return (
    <nav aria-label="Application form steps" className="w-full bg-white border border-neutral-200 rounded-xl p-3 sm:p-4 mb-6 shadow-2xs">
      <div className="overflow-x-auto pb-1.5 sm:pb-0 -mx-1 px-1">
        <ol className="flex items-center justify-between min-w-[480px] sm:min-w-0">
        {steps.map((step, idx) => {
          const styles = statusStyles[step.status]
          const isClickable = step.status === 'complete' && !!onStepClick
          const isLast = idx === steps.length - 1

          return (
            <li key={step.number} className="flex items-center flex-1 last:flex-initial">
              {/* Step indicator */}
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                {isClickable ? (
                  <button
                    type="button"
                    onClick={() => onStepClick(step.number)}
                    className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all hover:scale-105 cursor-pointer focus-visible:outline-2 focus-visible:outline-academic-accent ${styles.circle}`}
                    aria-label={`Go to step ${step.number}: ${step.label}`}
                    aria-current={step.status === 'active' ? 'step' : undefined}
                  >
                    {step.status === 'complete' ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : step.number}
                  </button>
                ) : (
                  <span
                    className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${styles.circle}`}
                    aria-current={step.status === 'active' ? 'step' : undefined}
                    aria-label={`Step ${step.number}: ${step.label} — ${step.status}`}
                  >
                    {step.status === 'complete' ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : step.number}
                  </span>
                )}
                <span className={`text-2xs sm:text-xs hidden lg:block ${styles.label}`}>
                  {step.label}
                </span>
              </div>

              {/* Connector line between steps */}
              {!isLast && (
                <div
                  className={`hidden sm:block h-0.5 flex-1 mx-2 ${step.status === 'complete' ? 'bg-agriculture' : 'bg-neutral-200'}`}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
      </div>

      {/* Mobile & Tablet Step label view */}
      {currentStep && (
        <div className="lg:hidden mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs">
          <span className="text-neutral-500 font-medium">
            Step {currentStep.number} of {steps.length}:
          </span>
          <span className="font-bold text-academic-navy">
            {currentStep.label}
          </span>
        </div>
      )}
    </nav>
  )
}
