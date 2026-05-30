import type { StatusTag as StatusTagType } from '../../api/hospital/types'

const variantStyles: Record<StatusTagType['variant'], string> = {
  normal: 'border border-slate-200 bg-white text-slate-700',
  crowded: 'border border-amber-200 bg-amber-50 text-amber-900',
  positive: 'border border-emerald-200 bg-emerald-100 text-emerald-900',
  warning: 'border border-orange-200 bg-orange-50 text-orange-900',
  neutral: 'border border-slate-200 bg-slate-100 text-slate-700',
}

export function StatusTag({ label, variant }: StatusTagType) {
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {label}
    </span>
  )
}
