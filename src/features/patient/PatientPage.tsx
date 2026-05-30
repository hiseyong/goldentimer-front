import { HospitalCard } from './components/HospitalCard'
import { RecommendedHospitalCard } from './components/RecommendedHospitalCard'
import { SymptomTag } from './components/SymptomTag'
import { PATIENT_SYMPTOM_OPTIONS } from './symptomOptions'
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
              Select your main symptom. We will recommend the best ER for your condition on the
              next step.
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Symptoms">
              {PATIENT_SYMPTOM_OPTIONS.map((symptom) => (
                <SymptomTag
                  key={symptom.id}
                  label={symptom.label}
                  selected={page.selectedSymptomId === symptom.id}
                  onClick={() => page.selectSymptom(symptom.id)}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Nearby emergency rooms</h2>
            {page.loadingNearby ? (
              <p className="text-sm text-slate-500">Loading nearby hospitals…</p>
            ) : page.nearbyHospitals.length === 0 ? (
              <p className="text-sm text-slate-500">No nearby hospitals found.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {page.nearbyHospitals.map((hospital) => (
                  <li key={hospital.hospitalId}>
                    <HospitalCard hospital={hospital} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {page.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
              {page.error}
            </p>
          )}

          <button
            type="button"
            onClick={() => void page.proceedToRecommendation()}
            disabled={page.proceeding || !page.selectedSymptomId}
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
