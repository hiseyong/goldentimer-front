import type { WaitSeverity } from '../../api/triage/types'

export const waitSeverityStyles: Record<
  WaitSeverity,
  { badge: string; text: string }
> = {
  low: {
    badge: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    text: 'text-emerald-600',
  },
  medium: {
    badge: 'bg-amber-100 text-amber-700 ring-amber-200',
    text: 'text-amber-600',
  },
  high: {
    badge: 'bg-red-100 text-red-700 ring-red-200',
    text: 'text-red-600',
  },
}
