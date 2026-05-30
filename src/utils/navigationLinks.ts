import type { GeoLocation } from './geolocation'

export type NavigationTarget = {
  name: string
  latitude: number
  longitude: number
  address?: string
}

export type ExternalNavigationApp = 'google' | 'kakao' | 'apple'

export function buildGoogleMapsDirectionsUrl(
  origin: GeoLocation,
  destination: NavigationTarget,
): string {
  const params = new URLSearchParams({
    api: '1',
    origin: `${origin.latitude},${origin.longitude}`,
    destination: `${destination.latitude},${destination.longitude}`,
    travelmode: 'driving',
  })
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

export function buildAppleMapsDirectionsUrl(
  origin: GeoLocation,
  destination: NavigationTarget,
): string {
  const params = new URLSearchParams({
    saddr: `${origin.latitude},${origin.longitude}`,
    daddr: `${destination.latitude},${destination.longitude}`,
    dirflg: 'd',
  })
  return `https://maps.apple.com/?${params.toString()}`
}

/** Opens Kakao Map web directions (works without native app). */
export function buildKakaoMapDirectionsUrl(
  origin: GeoLocation,
  destination: NavigationTarget,
): string {
  return `https://map.kakao.com/link/by/${origin.longitude},${origin.latitude}/${destination.longitude},${destination.latitude}`
}

export function openExternalNavigation(
  app: ExternalNavigationApp,
  origin: GeoLocation,
  destination: NavigationTarget,
): void {
  const url =
    app === 'google'
      ? buildGoogleMapsDirectionsUrl(origin, destination)
      : app === 'apple'
        ? buildAppleMapsDirectionsUrl(origin, destination)
        : buildKakaoMapDirectionsUrl(origin, destination)

  window.open(url, '_blank', 'noopener,noreferrer')
}
