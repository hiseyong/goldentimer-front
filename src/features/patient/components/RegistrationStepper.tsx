import type { RegistrationStep } from '../usePatientRegistration'

const STEPS = [
  { step: 1 as const, label: 'Confirm Symptoms' },
  { step: 2 as const, label: 'Patient Info' },
  { step: 3 as const, label: 'Complete' },
]

type RegistrationStepperProps = {
  currentStep: RegistrationStep
}

export function RegistrationStepper({ currentStep }: RegistrationStepperProps) {
  return (
    <ol className="mb-5 flex items-center justify-between">
      {STEPS.map(({ step, label }, index) => {
        const isActive = step === currentStep
        const isDone = step < currentStep

        return (
          <li key={step} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : isDone
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-400'
              }`}
            >
              {isDone ? '✓' : step}
            </span>
            <span
              className={`max-w-[4.5rem] text-center text-[10px] leading-tight ${
                isActive ? 'font-semibold text-blue-600' : 'text-slate-500'
              }`}
            >
              {label}
            </span>
            {index < STEPS.length - 1 && (
              <span className="sr-only">then</span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
