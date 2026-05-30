import type { LoadStatus, ResourceCounts } from '../../../api/medical-staff/types'

type ResourceStatusProps = {
  resources: ResourceCounts
  loadStatus: LoadStatus
  loadPercent: number
}

const loadLabels: Record<LoadStatus, string> = {
  overload: 'Overload',
  caution: 'Caution',
  stable: 'Stable',
}

const loadColors: Record<LoadStatus, string> = {
  overload: 'bg-red-500',
  caution: 'bg-amber-500',
  stable: 'bg-emerald-500',
}

export function ResourceStatus({
  resources,
  loadStatus,
  loadPercent,
}: ResourceStatusProps) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-slate-800">Resource status</h2>
      <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <Stat label="Specialists" value={resources.specialists} />
        <Stat label="Residents" value={resources.residents} />
        <Stat label="Nurses" value={resources.nurses} />
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs">
          <span className="font-medium text-slate-700">Load status</span>
          <span className={`font-semibold text-slate-800`}>
            {loadLabels[loadStatus]} ({loadPercent}%)
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-all ${loadColors[loadStatus]}`}
            style={{ width: `${loadPercent}%` }}
          />
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  )
}
