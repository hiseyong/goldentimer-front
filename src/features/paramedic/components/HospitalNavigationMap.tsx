import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  useMap,
} from 'react-leaflet'
import type { GeoLocation } from '../../../utils/geolocation'
import { watchLocation } from '../../../utils/geolocation'
import {
  fetchDrivingRoute,
  formatRouteDistance,
  formatRouteDuration,
  type RouteSummary,
} from '../../../utils/routeService'
import 'leaflet/dist/leaflet.css'

type HospitalNavigationMapProps = {
  origin: GeoLocation
  destination: {
    name: string
    latitude: number
    longitude: number
  }
  liveTracking?: boolean
  className?: string
  onRouteSummary?: (summary: RouteSummary | null) => void
}

function FitRouteBounds({
  origin,
  destination,
  route,
}: {
  origin: GeoLocation
  destination: HospitalNavigationMapProps['destination']
  route: RouteSummary | null
}) {
  const map = useMap()

  useEffect(() => {
    const points = route?.coordinates.length
      ? route.coordinates.map((point) => [point.latitude, point.longitude] as [number, number])
      : [
          [origin.latitude, origin.longitude] as [number, number],
          [destination.latitude, destination.longitude] as [number, number],
        ]

    map.fitBounds(points, { padding: [36, 36], maxZoom: 15 })
  }, [destination.latitude, destination.longitude, map, origin.latitude, origin.longitude, route])

  return null
}

function LiveOriginTracker({
  enabled,
  onUpdate,
}: {
  enabled: boolean
  onUpdate: (location: GeoLocation) => void
}) {
  useEffect(() => {
    if (!enabled) return
    return watchLocation(onUpdate)
  }, [enabled, onUpdate])

  return null
}

export function HospitalNavigationMap({
  origin,
  destination,
  liveTracking = true,
  className = 'h-52 w-full rounded-xl',
  onRouteSummary,
}: HospitalNavigationMapProps) {
  const routeRequestKey = `${origin.latitude},${origin.longitude}|${destination.latitude},${destination.longitude}`

  const [routeByKey, setRouteByKey] = useState<Record<string, RouteSummary | null>>({})
  const [trackedOrigin, setTrackedOrigin] = useState<GeoLocation | null>(null)

  const effectiveOrigin = trackedOrigin ?? origin
  const effectiveRequestKey = `${effectiveOrigin.latitude},${effectiveOrigin.longitude}|${destination.latitude},${destination.longitude}`

  const route = routeByKey[effectiveRequestKey] ?? null
  const routeLoading = !(effectiveRequestKey in routeByKey)

  const handleOriginUpdate = useCallback((location: GeoLocation) => {
    setTrackedOrigin(location)
  }, [])

  useEffect(() => {
    let cancelled = false

    void fetchDrivingRoute(effectiveOrigin, destination).then((summary) => {
      if (cancelled) return
      setRouteByKey((prev) => ({ ...prev, [effectiveRequestKey]: summary }))
      onRouteSummary?.(summary)
    })

    return () => {
      cancelled = true
    }
  }, [destination, effectiveOrigin, effectiveRequestKey, onRouteSummary])

  const polylinePositions = useMemo(() => {
    if (route?.coordinates.length) {
      return route.coordinates.map(
        (point) => [point.latitude, point.longitude] as [number, number],
      )
    }
    return [
      [effectiveOrigin.latitude, effectiveOrigin.longitude] as [number, number],
      [destination.latitude, destination.longitude] as [number, number],
    ]
  }, [destination, effectiveOrigin, route])

  const mapCenter = useMemo(
    () =>
      [
        (effectiveOrigin.latitude + destination.latitude) / 2,
        (effectiveOrigin.longitude + destination.longitude) / 2,
      ] as [number, number],
    [destination, effectiveOrigin],
  )

  return (
    <div className={`relative overflow-hidden border border-slate-200 ${className}`}>
      <MapContainer
        key={routeRequestKey}
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LiveOriginTracker enabled={liveTracking} onUpdate={handleOriginUpdate} />
        <FitRouteBounds origin={effectiveOrigin} destination={destination} route={route} />
        <Polyline
          positions={polylinePositions}
          pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.85 }}
        />
        <CircleMarker
          center={[effectiveOrigin.latitude, effectiveOrigin.longitude]}
          radius={8}
          pathOptions={{ color: '#ffffff', fillColor: '#2563eb', fillOpacity: 1, weight: 2 }}
        />
        <CircleMarker
          center={[destination.latitude, destination.longitude]}
          radius={9}
          pathOptions={{ color: '#ffffff', fillColor: '#059669', fillOpacity: 1, weight: 2 }}
        />
      </MapContainer>

      <div className="pointer-events-none absolute left-2 top-2 rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-700 shadow-sm">
        {routeLoading
          ? 'Calculating route…'
          : route
            ? `${formatRouteDistance(route.distanceMeters)} · ${formatRouteDuration(route.durationSeconds)}`
            : 'Direct route'}
      </div>

      <div className="pointer-events-none absolute bottom-2 left-2 flex gap-2 text-[10px] font-medium">
        <span className="rounded-md bg-blue-600/90 px-2 py-0.5 text-white">You</span>
        <span className="rounded-md bg-emerald-600/90 px-2 py-0.5 text-white">Hospital</span>
      </div>
    </div>
  )
}
