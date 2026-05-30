import { env } from '../../config/env'
import { createHttpTriageApi } from './httpTriageApi'
import { createMockTriageApi } from './mockTriageApi'
import type {
  HospitalErDetail,
  PatientRegistrationRequest,
  PatientRegistrationResponse,
  PreTriageRequest,
  PreTriageResponse,
  TriageOverview,
} from './types'

export interface TriageApi {
  getOverview(): Promise<TriageOverview>
  getHospitalDetail(hospitalId: string): Promise<HospitalErDetail>
  submitPreTriage(request: PreTriageRequest): Promise<PreTriageResponse>
  submitRegistration(
    request: PatientRegistrationRequest,
  ): Promise<PatientRegistrationResponse>
}

export function createTriageApi(): TriageApi {
  if (env.useMockApi) {
    return createMockTriageApi()
  }
  return createHttpTriageApi(env.apiBaseUrl)
}
