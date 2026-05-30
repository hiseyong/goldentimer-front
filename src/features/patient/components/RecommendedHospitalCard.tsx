import type { HospitalRecommendResponse } from '../../../api/hospital/types'
import { waitLevelLabel, waitLevelToSeverity, waitSeverityStyles } from '../waitLevelUtils'

type RecommendedHospitalCardProps = {
  recommendation: HospitalRecommendResponse
}

export function RecommendedHospitalCard({ recommendation }: RecommendedHospitalCardProps) {
  const { hospital } = recommendation
  const severity = waitLevelToSeverity(hospital.wait_level)
  const styles = waitSeverityStyles[severity]

  const centers = (
    [
      hospital.trauma_center ? 'Trauma' : null,
      hospital.stroke_center ? 'Stroke' : null,
      hospital.cardiac_center ? 'Cardiac' : null,
    ] as const
  ).filter((center): center is 'Trauma' | 'Stroke' | 'Cardiac' => center !== null)

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Recommended hospital
        </p>
        <h3 className="mt-1 text-base font-bold text-slate-900">
          {hospital.hospital_name}
        </h3>
      </div>

      <div className="flex items-center gap-4 px-4 py-4">
        <div
          className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full ring-2 ${styles.badge}`}
        >
          <span className={`text-xl font-bold leading-none ${styles.text}`}>
            {hospital.total_eta_minutes}
          </span>
          <span className="text-[10px] font-medium text-slate-500">min ETA</span>
        </div>

        <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-3 gap-y-2 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Distance</dt>
            <dd className="font-medium text-slate-800">{hospital.distance_km} km</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Travel</dt>
            <dd className="font-medium text-slate-800">
              {hospital.estimated_travel_minutes} min
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">ER wait</dt>
            <dd className="font-medium text-slate-800">
              {hospital.estimated_wait_minutes} min
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Wait level</dt>
            <dd className="font-medium text-slate-800">
              {waitLevelLabel(hospital.wait_level)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-3">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          KTAS {recommendation.ktas_level}
        </span>
        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
          {recommendation.inferred_capabilities}
        </span>
        {centers.map((center) => (
          <span
            key={center}
            className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
          >
            {center} center
          </span>
        ))}
      </div>

      {recommendation.message && (
        <p className="whitespace-pre-line border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-600">
          {recommendation.message}
        </p>
      )}
    </article>
  )
}
