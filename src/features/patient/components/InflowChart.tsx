type InflowChartProps = {
  values: number[]
}

export function InflowChart({ values }: InflowChartProps) {
  const max = Math.max(...values, 1)

  return (
    <div className="flex h-12 items-end gap-1" aria-hidden>
      {values.map((value, index) => (
        <div
          key={index}
          className="flex-1 rounded-t bg-blue-400"
          style={{ height: `${(value / max) * 100}%`, minHeight: '4px' }}
        />
      ))}
    </div>
  )
}
