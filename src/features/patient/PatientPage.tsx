import { LoadingBlock } from '../../components/ui/LoadingBlock'
import { HospitalCard } from './components/HospitalCard'
import { HospitalDetailModal } from './components/HospitalDetailModal'
import { SymptomTag } from './components/SymptomTag'
import { usePatientSelection } from './usePatientSelection'

export function PatientPage() {
  const page = usePatientSelection()

  return (
    <div className="flex flex-col gap-5 px-4 py-4 pb-6">
      <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-800">
            Symptom-based pre-triage
          </h2>
          {page.loading ? (
            <LoadingBlock />
          ) : (
            <div className="flex flex-wrap gap-2">
              {page.symptoms.map((symptom) => (
                <SymptomTag
                  key={symptom.id}
                  label={symptom.label}
                  selected={page.selectedSymptomId === symptom.id}
                  onClick={() => page.selectSymptom(symptom.id)}
                />
              ))}
            </div>
          )}
      </section>

      <section>
          <h2 className="mb-1 text-sm font-semibold text-slate-800">
            Real-time estimated wait time
          </h2>
          {page.recommendationNote && (
            <p className="mb-3 text-xs text-slate-500">{page.recommendationNote}</p>
          )}
          {page.loading ? (
            <LoadingBlock label="Loading hospitals…" />
          ) : (
            <ul className="space-y-2">
              {page.waitTimes.map((hospital) => (
                <li key={hospital.hospitalId}>
                  <HospitalCard
                    hospital={hospital}
                    selected={page.selectedHospitalId === hospital.hospitalId}
                    onClick={() => void page.openHospitalDetail(hospital.hospitalId)}
                  />
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
          onClick={() => void page.startRegistration()}
          disabled={page.starting || page.loading}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-base font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {page.starting ? 'Starting…' : 'Start Registration'}
          <ArrowRightIcon />
      </button>

      <HospitalDetailModal
        open={page.isDetailOpen}
        detail={page.hospitalDetail}
        loading={page.detailLoading}
        registering={page.starting}
        onClose={page.closeHospitalDetail}
        onRefresh={() => void page.refreshHospitalDetail()}
        onRegister={() => void page.registerAtDetailHospital()}
      />
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
