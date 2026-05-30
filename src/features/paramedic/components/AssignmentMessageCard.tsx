type AssignmentMessageCardProps = {
  message: string
  compact?: boolean
}

export function AssignmentMessageCard({
  message,
  compact = false,
}: AssignmentMessageCardProps) {
  return (
    <section
      className={`rounded-xl border border-blue-200 bg-blue-50/80 ${
        compact ? 'px-3 py-2.5' : 'px-3 py-3'
      }`}
      aria-label="Hospital recommendation summary"
    >
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
        Recommendation summary
      </p>
      <p
        className={`whitespace-pre-line leading-relaxed text-slate-800 ${
          compact ? 'text-xs' : 'text-sm'
        }`}
      >
        {message}
      </p>
    </section>
  )
}
