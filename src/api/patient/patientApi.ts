import { env } from '../../config/env'
import type {
  SubmitPatientReportRequest,
  SubmitPatientReportResponse,
} from './types'
import { createHttpPatientApi } from './httpPatientApi'
import { createMockPatientApi } from './mockPatientApi'

export interface PatientApi {
  submitReport(
    request: SubmitPatientReportRequest,
  ): Promise<SubmitPatientReportResponse>
}

export function createPatientApi(): PatientApi {
  if (env.useMockApi) {
    return createMockPatientApi()
  }
  return createHttpPatientApi(env.apiBaseUrl)
}
