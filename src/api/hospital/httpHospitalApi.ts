import { apiRequest } from '../client'
import { env } from '../../config/env'
import { HOSPITAL_API_PATHS } from './endpoints'
import type { HospitalApi } from './hospitalApi'
import type {
  BackendWaitLevel,
  ErMetricStatus,
  ErStatusItem,
  HospitalRecommendRequest,
  HospitalRecommendResponse,
  HospitalRecommendationsRequest,
  HospitalRecommendationsResponse,
  HospitalWaitTimeResponse,
  NearbyHospitalDetail,
  NearbyHospitalsResponse,
  NearbyLocationParams,
} from './types'

const WAIT_LEVEL_LABELS: Record<BackendWaitLevel, string> = {
  low: 'Smooth',
  moderate: 'Moderate',
  high: 'Busy',
  severe: 'Severe',
}

function waitLevelToMetricStatus(level: BackendWaitLevel): ErMetricStatus {
  if (level === 'low') return 'available'
  if (level === 'moderate') return 'normal'
  return 'crowded'
}

function erMetricStatus(
  bedsAvailable: boolean,
  totalBeds: number,
  waitLevel?: BackendWaitLevel,
): ErMetricStatus {
  if (!bedsAvailable || totalBeds <= 0) return 'crowded'
  if (waitLevel) return waitLevelToMetricStatus(waitLevel)
  if (totalBeds <= 4) return 'crowded'
  if (totalBeds <= 10) return 'normal'
  return 'available'
}

function mapNearbyToErStatus(hospitals: NearbyHospitalDetail[]): ErStatusItem[] {
  return hospitals.map((hospital) => {
    const status = erMetricStatus(
      hospital.er_beds_available,
      hospital.total_er_beds,
      hospital.wait_level,
    )
    const waitLabel = hospital.wait_level
      ? WAIT_LEVEL_LABELS[hospital.wait_level]
      : 'Unknown'

    const metrics = [
      {
        label: 'Est. wait',
        value: `${hospital.estimated_wait_minutes} min (${waitLabel})`,
        status,
      },
      {
        label: 'General ER',
        value: hospital.er_beds_available
          ? `Available (${hospital.total_er_beds} beds)`
          : `Full (${hospital.total_er_beds} beds)`,
        status: erMetricStatus(hospital.er_beds_available, hospital.total_er_beds),
      },
      {
        label: 'Distance',
        value: `${hospital.distance_km.toFixed(1)} km`,
        status: 'normal' as const,
      },
    ]

    if (hospital.trauma_center) {
      metrics.push({ label: 'Trauma', value: 'Center', status: 'available' as const })
    }
    if (hospital.stroke_center) {
      metrics.push({ label: 'Stroke', value: 'Center', status: 'available' as const })
    }
    if (hospital.cardiac_center) {
      metrics.push({ label: 'Cardiac', value: 'Center', status: 'available' as const })
    }

    return {
      hospitalId: hospital.hospital_id,
      hospitalName: hospital.hospital_name,
      metrics,
    }
  })
}

function defaultNearbyParams(params?: NearbyLocationParams): NearbyLocationParams {
  return {
    latitude: params?.latitude ?? env.defaultLatitude,
    longitude: params?.longitude ?? env.defaultLongitude,
    limit: params?.limit ?? 5,
  }
}

export function createHttpHospitalApi(baseUrl: string): HospitalApi {
  const normalizedBase = baseUrl.replace(/\/$/, '')

  return {
    recommendHospital(request: HospitalRecommendRequest) {
      return apiRequest<HospitalRecommendResponse>(
        `${normalizedBase}${HOSPITAL_API_PATHS.recommend}`,
        { method: 'POST', body: request },
      )
    },

    getRecommendations(request: HospitalRecommendationsRequest) {
      const params = new URLSearchParams({ transcript: request.transcript })
      return apiRequest<HospitalRecommendationsResponse>(
        `${normalizedBase}${HOSPITAL_API_PATHS.recommendations}?${params}`,
      )
    },

    getNearbyHospitals(params: NearbyLocationParams) {
      const resolved = defaultNearbyParams(params)
      const search = new URLSearchParams({
        latitude: String(resolved.latitude),
        longitude: String(resolved.longitude),
        limit: String(resolved.limit ?? 5),
      })

      return apiRequest<NearbyHospitalsResponse>(
        `${normalizedBase}${HOSPITAL_API_PATHS.nearby}?${search}`,
      )
    },

    getWaitTime(hospitalId: string) {
      return apiRequest<HospitalWaitTimeResponse>(
        `${normalizedBase}${HOSPITAL_API_PATHS.waitTime(hospitalId)}`,
      )
    },

    getErStatus(params?: NearbyLocationParams) {
      return this.getNearbyHospitals(defaultNearbyParams(params)).then((response) =>
        mapNearbyToErStatus(response.hospitals),
      )
    },
  }
}
