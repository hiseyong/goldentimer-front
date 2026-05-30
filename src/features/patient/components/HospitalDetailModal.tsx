import type { HospitalErDetail } from '../../../api/triage/types'
import { waitSeverityStyles } from '../waitSeverityStyles'
import { InflowChart } from './InflowChart'

type HospitalDetailModalProps = {
  open: boolean
  detail: HospitalErDetail | null
  loading: boolean
  registering: boolean
  onClose: () => void
  onRefresh: () => void
  onRegister: () => void
}

export function HospitalDetailModal({
  open,
  detail,
  loading,
  registering,
  onClose,
  onRefresh,
  onRegister,
}: HospitalDetailModalProps) {
  if (!open) return null

  const severity = detail ? waitSeverityStyles[detail.waitSeverity] : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal
      aria-labelledby="hospital-detail-title"
    >
      <div className="max-h-[90svh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-2">
          <h2
            id="hospital-detail-title"
            className="text-base font-bold text-slate-900"
          >
            {detail ? `${detail.erName}` : 'Emergency Room'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {loading && (
          <p className="py-8 text-center text-sm text-slate-500">Loading…</p>
        )}

        {detail && !loading && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Estimated wait</p>
                <p className={`text-3xl font-bold ${severity?.text}`}>
                  {detail.estimatedWaitMinutes}{' '}
                  <span className="text-lg font-semibold">min</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">
                  Last updated: {detail.lastUpdated}
                </p>
                <button
                  type="button"
                  onClick={onRefresh}
                  className="mt-1 text-xs font-medium text-blue-600 hover:underline"
                >
                  Refresh
                </button>
              </div>
            </div>

            <section className="mb-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-800">
                Current critical patient status changes
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                {detail.ktasChanges.map((change) => (
                  <li key={change.level} className="flex justify-between">
                    <span>KTAS {change.level}</span>
                    <span className="font-medium text-red-600">
                      +{change.delta} ({change.period})
                    </span>
                  </li>
                ))}
                <li className="flex items-center justify-between">
                  <span>Recent inflow</span>
                  <span className="font-medium">
                    {detail.recentInflow.count} people ({detail.recentInflow.period})
                  </span>
                </li>
              </ul>
              <div className="mt-2">
                <InflowChart values={detail.recentInflow.trend} />
              </div>
            </section>

            <p className="mb-4 text-xs leading-relaxed text-slate-500">
              {detail.warningText}
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onRegister}
                disabled={registering}
                className="min-h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {registering ? 'Starting…' : 'Register at this Hospital'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 w-full rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
