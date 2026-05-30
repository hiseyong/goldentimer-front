import type { ErStatusItem } from '../../../api/hospital/types'
import { LoadingBlock } from '../../../components/ui/LoadingBlock'

type ErStatusListProps = {
  items: ErStatusItem[]
  loading: boolean
}

const metricColors: Record<string, string> = {
  crowded: 'text-amber-600',
  normal: 'text-emerald-600',
  available: 'text-blue-600',
}

export function ErStatusList({ items, loading }: ErStatusListProps) {
  if (loading) {
    return <LoadingBlock label="Loading ER status…" />
  }

  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-slate-800">
        National Emergency Room real-time status
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.hospitalId}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <p className="mb-2 text-sm font-semibold text-slate-800">
              {item.hospitalName}
            </p>
            <ul className="space-y-1">
              {item.metrics.map((metric) => (
                <li
                  key={metric.label}
                  className="flex justify-between text-xs text-slate-600"
                >
                  <span>{metric.label}</span>
                  <span className={`font-medium ${metricColors[metric.status]}`}>
                    {metric.value}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  )
}
