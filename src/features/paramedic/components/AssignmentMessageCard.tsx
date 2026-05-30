type AssignmentMessageCardProps = {
  message: string
  compact?: boolean
  onSpeak?: () => void
  speaking?: boolean
  ttsSupported?: boolean
}

export function AssignmentMessageCard({
  message,
  compact = false,
  onSpeak,
  speaking = false,
  ttsSupported = false,
}: AssignmentMessageCardProps) {
  return (
    <section
      className={`rounded-xl border border-blue-200 bg-blue-50/80 ${
        compact ? 'px-3 py-2.5' : 'px-3 py-3'
      }`}
      aria-label="Hospital recommendation summary"
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          Recommendation summary
        </p>
        {ttsSupported && onSpeak && (
          <button
            type="button"
            onClick={onSpeak}
            disabled={speaking}
            className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-blue-500 disabled:opacity-60"
            aria-label={speaking ? 'Reading recommendation aloud' : 'Read recommendation aloud'}
          >
            <SpeakerIcon />
            {speaking ? 'Reading…' : 'Listen'}
          </button>
        )}
      </div>
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

function SpeakerIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  )
}
