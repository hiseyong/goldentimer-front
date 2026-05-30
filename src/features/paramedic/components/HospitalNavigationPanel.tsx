import { useCallback, useState } from 'react'
import type { AssignmentHospital } from '../../../api/assignment/types'
import type { GeoLocation } from '../../../utils/geolocation'
import {
  openExternalNavigation,
  type ExternalNavigationApp,
} from '../../../utils/navigationLinks'
import type { RouteSummary } from '../../../utils/routeService'
import { formatRouteDistance, formatRouteDuration } from '../../../utils/routeService'
import { HospitalNavigationMap } from './HospitalNavigationMap'

type HospitalNavigationPanelProps = {
  origin: GeoLocation
  hospital: AssignmentHospital
  compact?: boolean
}

export function HospitalNavigationPanel({
  origin,
  hospital,
  compact = false,
}: HospitalNavigationPanelProps) {
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null)

  const handleRouteSummary = useCallback((summary: RouteSummary | null) => {
    setRouteSummary(summary)
  }, [])

  const openNavigation = (app: ExternalNavigationApp) => {
    openExternalNavigation(app, origin, {
      name: hospital.hospital_name,
      latitude: hospital.latitude,
      longitude: hospital.longitude,
      address: hospital.address,
    })
  }

  return (
    <section
      className={`rounded-xl border border-blue-200 bg-blue-50/60 ${compact ? 'p-3' : 'p-4'}`}
      aria-label="Hospital navigation"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Navigation
          </p>
          <p className="truncate text-sm font-semibold text-slate-900">
            {hospital.hospital_name}
          </p>
          <p className="text-xs text-slate-500">{hospital.address}</p>
        </div>
        {routeSummary && (
          <div className="shrink-0 rounded-lg bg-white px-2 py-1 text-right text-xs">
            <p className="font-semibold text-slate-800">
              {formatRouteDistance(routeSummary.distanceMeters)}
            </p>
            <p className="text-slate-500">
              {formatRouteDuration(routeSummary.durationSeconds)}
            </p>
          </div>
        )}
      </div>

      <HospitalNavigationMap
        origin={origin}
        destination={{
          name: hospital.hospital_name,
          latitude: hospital.latitude,
          longitude: hospital.longitude,
        }}
        className={compact ? 'h-44 w-full rounded-xl' : 'h-56 w-full rounded-xl'}
        onRouteSummary={handleRouteSummary}
      />

      <div className={`grid grid-cols-3 gap-2 ${compact ? 'mt-2' : 'mt-3'}`}>
        <ExternalNavButton label="Kakao Map" onClick={() => openNavigation('kakao')} />
        <ExternalNavButton label="Google Maps" onClick={() => openNavigation('google')} />
        <ExternalNavButton label="Apple Maps" onClick={() => openNavigation('apple')} />
      </div>
    </section>
  )
}

function ExternalNavButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-9 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
    >
      {label}
    </button>
  )
}
