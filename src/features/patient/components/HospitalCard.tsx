import type { HospitalWaitTime } from '../../../api/triage/types'
import { waitSeverityStyles } from '../waitSeverityStyles'

type HospitalCardProps = {
  hospital: HospitalWaitTime
  selected: boolean
  onClick: () => void
}

export function HospitalCard({ hospital, selected, onClick }: HospitalCardProps) {
  const styles = waitSeverityStyles[hospital.waitSeverity]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
        selected
          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="min-w-0 flex-1 pr-3">
        <p className="truncate text-sm font-semibold text-slate-800">
          {hospital.hospitalName}
        </p>
        <p className="text-xs text-slate-500">{hospital.distanceKm} km away</p>
      </div>
      <div
        className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full ring-2 ${styles.badge}`}
      >
        <span className={`text-lg font-bold leading-none ${styles.text}`}>
          {hospital.waitMinutes}
        </span>
        <span className="text-[10px] font-medium text-slate-500">min</span>
      </div>
    </button>
  )
}
