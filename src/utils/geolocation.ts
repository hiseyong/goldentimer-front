export type GeoLocation = {
  latitude: number
  longitude: number
  address: string
}

export type GeolocationPermissionState =
  | 'granted'
  | 'denied'
  | 'prompt'
  | 'unsupported'
  | 'insecure'

export class GeolocationError extends Error {
  readonly code: 'unsupported' | 'insecure' | 'denied' | 'unavailable' | 'timeout' | 'unknown'

  constructor(
    message: string,
    code: GeolocationError['code'] = 'unknown',
  ) {
    super(message)
    this.name = 'GeolocationError'
    this.code = code
  }
}

export function isGeolocationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator
}

export function isSecureGeolocationContext(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext
}

export function getLocationSettingsHint(): string {
  const ua = navigator.userAgent

  if (/iPhone|iPad|iPod/i.test(ua)) {
    return 'iOS: Settings → Safari → Location → Allow, or tap the "aA" icon in the address bar → Website Settings → Location.'
  }

  if (/Android/i.test(ua)) {
    return 'Android: Tap the lock icon in the address bar → Permissions → Location → Allow.'
  }

  return 'Allow location access in your browser settings for this site.'
}

export async function queryGeolocationPermission(): Promise<GeolocationPermissionState> {
  if (!isSecureGeolocationContext()) return 'insecure'
  if (!isGeolocationSupported()) return 'unsupported'

  if (!navigator.permissions?.query) return 'prompt'

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' })
    return result.state as GeolocationPermissionState
  } catch {
    return 'prompt'
  }
}

function mapPositionError(error: GeolocationPositionError): GeolocationError {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return new GeolocationError(
        `Location access was blocked. ${getLocationSettingsHint()}`,
        'denied',
      )
    case error.POSITION_UNAVAILABLE:
      return new GeolocationError(
        'Location unavailable. Turn on Location Services / GPS and try again.',
        'unavailable',
      )
    case error.TIMEOUT:
      return new GeolocationError(
        'Location request timed out. Move to an open area with better signal and try again.',
        'timeout',
      )
    default:
      return new GeolocationError(
        'Could not determine your current location.',
        'unknown',
      )
  }
}

/**
 * Starts a geolocation request synchronously. Must be called directly from a
 * user gesture handler (e.g. click) so mobile browsers show the permission prompt.
 */
export function beginLocationRequest(): Promise<GeoLocation> {
  if (!isSecureGeolocationContext()) {
    return Promise.reject(
      new GeolocationError(
        'Location requires HTTPS. Open this site with https:// instead of http://.',
        'insecure',
      ),
    )
  }

  if (!isGeolocationSupported()) {
    return Promise.reject(
      new GeolocationError(
        'Geolocation is not supported by this browser.',
        'unsupported',
      ),
    )
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        resolve({
          latitude,
          longitude,
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        })
      },
      (error) => reject(mapPositionError(error)),
      {
        enableHighAccuracy: false,
        timeout: 20_000,
        maximumAge: 60_000,
      },
    )
  })
}

/** Returns the last known position when permission is already granted; otherwise null. */
export function trySilentLocation(): Promise<GeoLocation | null> {
  if (!isSecureGeolocationContext() || !isGeolocationSupported()) {
    return Promise.resolve(null)
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(positionToGeoLocation(position)),
      () => resolve(null),
      {
        enableHighAccuracy: false,
        timeout: 5_000,
        maximumAge: 120_000,
      },
    )
  })
}

/** @deprecated Prefer beginLocationRequest() from user gesture handlers. */
export function getCurrentLocation(): Promise<GeoLocation> {
  return beginLocationRequest()
}

function positionToGeoLocation(position: GeolocationPosition): GeoLocation {
  const { latitude, longitude } = position.coords
  return {
    latitude,
    longitude,
    address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
  }
}

/**
 * Watches the device position for live navigation updates.
 * Returns a cleanup function that stops watching.
 */
export function watchLocation(
  onUpdate: (location: GeoLocation) => void,
  onError?: (error: GeolocationError) => void,
): () => void {
  if (!isGeolocationSupported()) {
    onError?.(
      new GeolocationError(
        'Geolocation is not supported by this browser.',
        'unsupported',
      ),
    )
    return () => {}
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => onUpdate(positionToGeoLocation(position)),
    (error) => onError?.(mapPositionError(error)),
    {
      enableHighAccuracy: true,
      timeout: 20_000,
      maximumAge: 5_000,
    },
  )

  return () => navigator.geolocation.clearWatch(watchId)
}
