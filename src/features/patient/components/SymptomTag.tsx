type SymptomTagProps = {
  label: string
  selected: boolean
  onClick: () => void
}

export function SymptomTag({ label, selected, onClick }: SymptomTagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        selected
          ? 'border-blue-600 bg-blue-600 text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
      }`}
    >
      {label}
    </button>
  )
}
