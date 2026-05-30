import type { GeolocationPermissionState } from '../../../utils/geolocation'
import { getLocationSettingsHint, isSecureGeolocationContext } from '../../../utils/geolocation'

type LocationAccessBannerProps = {
  permission: GeolocationPermissionState | 'unknown'
  onRetry?: () => void
}

export function LocationAccessBanner({ permission, onRetry }: LocationAccessBannerProps) {
  if (!isSecureGeolocationContext()) {
    return (
      <div
        className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900"
        role="alert"
      >
        <p className="font-semibold">HTTPS required for location</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-800">
          Mobile browsers block location on insecure (http://) pages. Use https:// to
          access this site.
        </p>
      </div>
    )
  }

  if (permission === 'granted') return null

  if (permission === 'prompt' || permission === 'unknown') {
    return (
      <div
        className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-sm text-blue-900"
        role="status"
      >
        <p className="font-semibold">Location access needed</p>
        <p className="mt-1 text-xs leading-relaxed text-blue-800">
          Tap &quot;Get AI Hospital Recommendation&quot; and allow location when your
          browser prompts you.
        </p>
      </div>
    )
  }

  if (permission === 'unsupported') {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800"
        role="alert"
      >
        <p className="font-semibold">Location not supported</p>
        <p className="mt-1 text-xs leading-relaxed">
          This browser does not support geolocation. Try Safari or Chrome.
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800"
      role="alert"
    >
      <p className="font-semibold">Location access blocked</p>
      <p className="mt-1 text-xs leading-relaxed">{getLocationSettingsHint()}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-200"
        >
          Check again
        </button>
      )}
    </div>
  )
}
