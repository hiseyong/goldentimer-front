import type { AiRecommendation } from '../../../api/medical-staff/types'

type AiRecommendationsProps = {
  items: AiRecommendation[]
}

export function AiRecommendations({ items }: AiRecommendationsProps) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-slate-800">AI recommended actions</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-slate-800"
          >
            <span className="shrink-0 text-blue-600" aria-hidden>
              ✦
            </span>
            {item.text}
          </li>
        ))}
      </ul>
    </section>
  )
}
