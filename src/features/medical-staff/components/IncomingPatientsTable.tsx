import type { IncomingPatient } from '../../../api/medical-staff/types'

type IncomingPatientsTableProps = {
  patients: IncomingPatient[]
}

const ktasColors: Record<number, string> = {
  1: 'bg-red-100 text-red-700',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-slate-100 text-slate-600',
  5: 'bg-slate-100 text-slate-500',
}

export function IncomingPatientsTable({ patients }: IncomingPatientsTableProps) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-slate-800">Incoming patients</h2>
      <div className="max-w-full overflow-x-auto rounded-xl border border-slate-200 [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-0 text-left text-xs sm:min-w-[320px]">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-2 py-2 font-medium">Time</th>
              <th className="px-2 py-2 font-medium">Patient</th>
              <th className="px-2 py-2 font-medium">KTAS</th>
              <th className="px-2 py-2 font-medium">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map((p) => (
              <tr key={p.id} className="bg-white">
                <td className="px-2 py-2 text-slate-600">{p.time}</td>
                <td className="px-2 py-2">
                  <p className="font-medium text-slate-800">
                    {p.name} / {p.gender} / {p.age}
                  </p>
                  <p className="text-slate-500">{p.symptoms}</p>
                </td>
                <td className="px-2 py-2">
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 font-bold ${ktasColors[p.ktas]}`}
                  >
                    {p.ktas}
                  </span>
                </td>
                <td className="px-2 py-2 text-slate-600">{p.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
