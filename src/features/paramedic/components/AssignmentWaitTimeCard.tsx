import type { AssignmentWaitTime, WaitLevel } from '../../../api/assignment/types'

type AssignmentWaitTimeCardProps = {
  waitTime: AssignmentWaitTime
  compact?: boolean
}

const waitLevelLabels: Record<WaitLevel, string> = {
  low: 'Smooth',
  moderate: 'Moderate',
  high: 'Busy',
  severe: 'Severe',
}

const waitLevelStyles: Record<WaitLevel, string> = {
  low: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  moderate: 'border-amber-200 bg-amber-50 text-amber-800',
  high: 'border-orange-200 bg-orange-50 text-orange-800',
  severe: 'border-red-200 bg-red-50 text-red-800',
}

const waitLevelBadgeStyles: Record<WaitLevel, string> = {
  low: 'bg-emerald-600 text-white',
  moderate: 'bg-amber-500 text-white',
  high: 'bg-orange-500 text-white',
  severe: 'bg-red-600 text-white',
}

export function AssignmentWaitTimeCard({
  waitTime,
  compact = false,
}: AssignmentWaitTimeCardProps) {
  const { breakdown } = waitTime
  const hasBreakdown =
    breakdown.bed_pressure_minutes > 0 ||
    breakdown.existing_patient_minutes > 0 ||
    breakdown.incoming_queue_minutes > 0

  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white ${
        compact ? 'px-3 py-2.5' : 'px-3 py-3'
      }`}
      aria-label="Wait time and travel estimate"
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Travel & wait estimate
      </p>

      <div className="grid grid-cols-2 gap-2">
        <MetricTile
          label="Travel time"
          value={`${waitTime.travel_minutes} min`}
          compact={compact}
        />
        <MetricTile
          label="Distance"
          value={`${waitTime.distance_km.toFixed(1)} km`}
          compact={compact}
        />
        <MetricTile
          label="Est. wait on arrival"
          value={`${waitTime.estimated_wait_minutes} min`}
          highlight
          compact={compact}
        />
        <div
          className={`rounded-lg border px-2.5 py-2 ${waitLevelStyles[waitTime.wait_level]}`}
        >
          <p className="text-[10px] font-medium uppercase tracking-wide opacity-80">
            Crowd level
          </p>
          <p
            className={`mt-0.5 font-bold ${compact ? 'text-sm' : 'text-base'}`}
          >
            {waitLevelLabels[waitTime.wait_level]}
          </p>
          <span
            className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${waitLevelBadgeStyles[waitTime.wait_level]}`}
          >
            {waitTime.wait_level}
          </span>
        </div>
      </div>

      {hasBreakdown && (
        <div className="mt-2 rounded-lg bg-slate-50 px-2.5 py-2 text-[11px] text-slate-600">
          <p className="mb-1 font-medium text-slate-700">Wait breakdown</p>
          <ul className="space-y-0.5">
            {breakdown.bed_pressure_minutes > 0 && (
              <li>Bed availability: {breakdown.bed_pressure_minutes} min</li>
            )}
            {breakdown.existing_patient_minutes > 0 && (
              <li>
                Existing patients: {breakdown.existing_patient_minutes} min
              </li>
            )}
            {breakdown.incoming_queue_minutes > 0 && (
              <li>
                Incoming queue: {breakdown.incoming_queue_minutes} min
              </li>
            )}
          </ul>
        </div>
      )}
    </section>
  )
}

function MetricTile({
  label,
  value,
  highlight = false,
  compact = false,
}: {
  label: string
  value: string
  highlight?: boolean
  compact?: boolean
}) {
  return (
    <div
      className={`rounded-lg border px-2.5 py-2 ${
        highlight
          ? 'border-blue-200 bg-blue-50 text-blue-900'
          : 'border-slate-200 bg-slate-50 text-slate-800'
      }`}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className={`mt-0.5 font-bold ${compact ? 'text-sm' : 'text-base'}`}>
        {value}
      </p>
    </div>
  )
}
