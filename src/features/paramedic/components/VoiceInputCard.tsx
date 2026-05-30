type VoiceInputCardProps = {
  active: boolean
  transcript: string
  speechSupported: boolean
  speechHint?: string | null
  onStart: () => void
  onStop: () => void
  onTranscriptChange: (value: string) => void
}

export function VoiceInputCard({
  active,
  transcript,
  speechSupported,
  speechHint,
  onStart,
  onStop,
  onTranscriptChange,
}: VoiceInputCardProps) {
  return (
    <div
      className={`rounded-xl border px-3 py-3 ${
        active
          ? 'border-blue-400 bg-blue-50'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          onClick={active ? onStop : onStart}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            active ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
          }`}
          aria-label={active ? 'Stop voice input' : 'Start voice input'}
        >
          <MicIcon active={active} />
        </button>
        <span className="text-xs font-semibold text-blue-600">
          {active ? 'Voice Input Active' : 'Voice Input'}
        </span>
        {active && (
          <span className="ml-auto flex gap-0.5" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="inline-block w-0.5 animate-pulse rounded-full bg-blue-500"
                style={{
                  height: `${8 + (i % 3) * 6}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </span>
        )}
      </div>

      {speechHint && (
        <p
          className={`mb-2 text-xs ${
            speechSupported ? 'text-slate-600' : 'text-amber-700'
          }`}
        >
          {speechHint}
        </p>
      )}

      <textarea
        value={transcript}
        onChange={(e) => onTranscriptChange(e.target.value)}
        rows={3}
        className="w-full resize-none border-0 bg-transparent text-sm text-slate-800 focus:outline-none"
        placeholder="Describe patient condition…"
      />
    </div>
  )
}

function MicIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {active ? (
        <rect x="6" y="6" width="12" height="12" rx="1.5" />
      ) : (
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" />
      )}
    </svg>
  )
}
