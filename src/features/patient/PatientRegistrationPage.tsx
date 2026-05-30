import { Navigate } from 'react-router-dom'
import { HospitalStatusPopup } from './components/HospitalStatusPopup'
import { RegistrationFormFields } from './components/RegistrationFormFields'
import { RegistrationStepper } from './components/RegistrationStepper'
import { usePatientRegistration } from './usePatientRegistration'

export function PatientRegistrationPage() {
  const reg = usePatientRegistration()

  if (!reg.context) {
    return <Navigate to="/patient" replace />
  }

  const footerLabel =
    reg.step === 3
      ? reg.completed
        ? 'Back to home'
        : reg.submitting
          ? 'Submitting…'
          : 'Complete registration'
      : 'Next step'

  const handleFooter = () => {
    if (reg.completed) {
      reg.goBackToSelection()
      return
    }
    if (reg.step === 3) {
      void reg.submitRegistration()
      return
    }
    reg.nextStep()
  }

  return (
    <div className="flex flex-col px-4 py-4 pb-6">
        <button
          type="button"
          onClick={() => void reg.openStatusPopup()}
          className="mb-4 w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
        >
          Check hospital status
        </button>

        <RegistrationStepper currentStep={reg.step} />

        {reg.error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
            {reg.error}
          </p>
        )}

        {reg.step === 1 && (
          <section className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-800">
              Confirm symptoms
            </h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-slate-500">Symptom</dt>
                <dd className="font-medium text-slate-800">
                  {reg.context.symptomLabel}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Hospital</dt>
                <dd className="font-medium text-slate-800">
                  {reg.context.hospitalName}
                </dd>
              </div>
            </dl>
          </section>
        )}

        {reg.step === 2 && (
          <RegistrationFormFields form={reg.form} onChange={reg.updateField} />
        )}

        {reg.step === 3 && !reg.completed && (
          <section className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <h2 className="mb-2 font-semibold text-slate-800">Review</h2>
            <ul className="space-y-1">
              <li>
                <strong>Patient:</strong> {reg.form.patientName} ({reg.form.gender},{' '}
                {reg.form.age})
              </li>
              <li>
                <strong>Complaint:</strong> {reg.form.chiefComplaint}
              </li>
              <li>
                <strong>Onset:</strong> {reg.form.onsetTime}
              </li>
              <li>
                <strong>Hospital:</strong> {reg.context.hospitalName}
              </li>
            </ul>
          </section>
        )}

        {reg.completed && reg.completionMessage && (
          <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {reg.completionMessage}
          </p>
        )}

        <div className="flex gap-2">
          {reg.step > 1 && !reg.completed && (
            <button
              type="button"
              onClick={reg.prevStep}
              className="min-h-12 flex-1 rounded-xl border border-slate-300 text-sm font-medium text-slate-700"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleFooter}
            disabled={reg.submitting}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {footerLabel}
            {!reg.completed && reg.step < 3 && <ArrowRightIcon />}
          </button>
        </div>

      <HospitalStatusPopup
        open={reg.statusPopupOpen}
        detail={reg.statusDetail}
        loading={reg.statusLoading}
        onClose={reg.closeStatusPopup}
      />
    </div>
  )
}

function ArrowRightIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.025 5.025 18 10l-4.975 4.975-1.414-1.414L13.172 11H6v-2h7.172l-1.561-1.561 1.414-1.414Z" />
    </svg>
  )
}
