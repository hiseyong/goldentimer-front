import type { KtasSummaryItem } from '../../../api/medical-staff/types'

const toneStyles: Record<KtasSummaryItem['tone'], string> = {
  red: 'bg-red-500 text-white',
  amber: 'bg-amber-500 text-white',
  slate: 'bg-slate-500 text-white',
}

type KtasSummaryProps = {
  items: KtasSummaryItem[]
}

export function KtasSummary({ items }: KtasSummaryProps) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-slate-800">Triage status (KTAS)</h2>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-slate-200 bg-white p-3 text-center"
          >
            <p
              className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${toneStyles[item.tone]}`}
            >
              {item.count}
            </p>
            <p className="text-[10px] font-medium leading-tight text-slate-600">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
