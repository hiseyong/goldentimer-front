export type RouteCoordinate = {
  latitude: number
  longitude: number
}

export type RouteSummary = {
  coordinates: RouteCoordinate[]
  distanceMeters: number
  durationSeconds: number
}

type OsrmRouteResponse = {
  routes?: Array<{
    distance: number
    duration: number
    geometry?: {
      coordinates: [number, number][]
    }
  }>
}

export async function fetchDrivingRoute(
  origin: RouteCoordinate,
  destination: RouteCoordinate,
): Promise<RouteSummary | null> {
  const path = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`
  const url = `https://router.project-osrm.org/route/v1/driving/${path}?overview=full&geometries=geojson`

  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const data = (await response.json()) as OsrmRouteResponse
    const route = data.routes?.[0]
    if (!route?.geometry?.coordinates?.length) return null

    return {
      coordinates: route.geometry.coordinates.map(([longitude, latitude]) => ({
        latitude,
        longitude,
      })),
      distanceMeters: route.distance,
      durationSeconds: route.duration,
    }
  } catch {
    return null
  }
}

export function formatRouteDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`
  }
  return `${Math.round(meters)} m`
}

export function formatRouteDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60))
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
  }
  return `${minutes} min`
}
