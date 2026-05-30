import type { HospitalErDetail } from '../../../api/triage/types'
import { waitSeverityStyles } from '../waitSeverityStyles'

type HospitalStatusPopupProps = {
  open: boolean
  detail: HospitalErDetail | null
  loading: boolean
  onClose: () => void
}

export function HospitalStatusPopup({
  open,
  detail,
  loading,
  onClose,
}: HospitalStatusPopupProps) {
  if (!open) return null

  const severity = detail ? waitSeverityStyles[detail.waitSeverity] : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6"
      role="dialog"
      aria-modal
      aria-label="Hospital status"
    >
      <div className="w-full max-w-xs rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Hospital status</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {loading && <p className="text-center text-sm text-slate-500">Loading…</p>}

        {detail && !loading && (
          <>
            <p className="text-xs text-slate-500">{detail.erName}</p>
            <p className="mt-1 text-sm text-slate-600">Current wait</p>
            <p className={`text-2xl font-bold ${severity?.text}`}>
              {detail.estimatedWaitMinutes} min
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Updated {detail.lastUpdated}
            </p>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 min-h-10 w-full rounded-lg border border-slate-200 text-sm font-medium text-slate-700"
        >
          Close
        </button>
      </div>
    </div>
  )
}
