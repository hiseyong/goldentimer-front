import { env } from '../../config/env'
import { createHttpMedicalStaffApi } from './httpMedicalStaffApi'
import { createMockMedicalStaffApi } from './mockMedicalStaffApi'
import type { MedicalStaffDashboard } from './types'

export interface MedicalStaffApi {
  getDashboard(): Promise<MedicalStaffDashboard>
}

export function createMedicalStaffApi(): MedicalStaffApi {
  if (env.useMockApi) {
    return createMockMedicalStaffApi()
  }
  return createHttpMedicalStaffApi(env.apiBaseUrl)
}
