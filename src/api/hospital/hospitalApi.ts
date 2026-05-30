import { env } from '../../config/env'
import { createHttpHospitalApi } from './httpHospitalApi'
import { createMockHospitalApi } from './mockHospitalApi'
import type {
  ErStatusItem,
  HospitalRecommendationsRequest,
  HospitalRecommendationsResponse,
  HospitalWaitTimeResponse,
  NearbyHospitalsResponse,
  NearbyLocationParams,
} from './types'

export interface HospitalApi {
  getRecommendations(
    request: HospitalRecommendationsRequest,
  ): Promise<HospitalRecommendationsResponse>
  getErStatus(params?: NearbyLocationParams): Promise<ErStatusItem[]>
  getNearbyHospitals(params: NearbyLocationParams): Promise<NearbyHospitalsResponse>
  getWaitTime(hospitalId: string): Promise<HospitalWaitTimeResponse>
}

export function createHospitalApi(): HospitalApi {
  if (env.useMockApi) {
    return createMockHospitalApi()
  }
  return createHttpHospitalApi(env.apiBaseUrl)
}
