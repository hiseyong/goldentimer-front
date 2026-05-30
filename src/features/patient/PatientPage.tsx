import { RecommendedHospitalCard } from './components/RecommendedHospitalCard'
import { usePatientSelection } from './usePatientSelection'

export function PatientPage() {
  const page = usePatientSelection()

  return (
    <div className="flex flex-col gap-5 px-4 py-4 pb-6">
      {page.step === 'symptoms' ? (
        <>
          <section>
            <h2 className="mb-1 text-sm font-semibold text-slate-800">
              Symptom-based pre-triage
            </h2>
            <p className="mb-3 text-xs text-slate-500">
              Describe your symptoms in Korean or English. We will recommend the best ER for
              your condition.
            </p>
            <label className="sr-only" htmlFor="patient-symptoms">
              Symptoms
            </label>
            <textarea
              id="patient-symptoms"
              value={page.symptomsText}
              onChange={(event) => page.setSymptomsText(event.target.value)}
              placeholder="e.g. 60-year-old male, chest pain and shortness of breath"
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </section>

          {page.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
              {page.error}
            </p>
          )}

          <button
            type="button"
            onClick={() => void page.proceedToRecommendation()}
            disabled={page.proceeding || !page.symptomsText.trim()}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-base font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {page.proceeding ? 'Finding hospital…' : 'Next'}
            <ArrowRightIcon />
          </button>
        </>
      ) : (
        <>
          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-800">
                Recommended emergency room
              </h2>
              <button
                type="button"
                onClick={page.goBackToSymptoms}
                className="shrink-0 text-xs font-medium text-blue-600 hover:underline"
              >
                Edit symptoms
              </button>
            </div>
            {page.recommendation && (
              <RecommendedHospitalCard recommendation={page.recommendation} />
            )}
          </section>

          {page.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
              {page.error}
            </p>
          )}
        </>
      )}
    </div>
  )
}

function ArrowRightIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.025 5.025 18 10l-4.975 4.975-1.414-1.414L13.172 11H6v-2h7.172l-1.561-1.561 1.414-1.414Z" />
    </svg>
  )
}
