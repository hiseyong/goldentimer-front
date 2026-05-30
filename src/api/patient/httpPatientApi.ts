import { apiRequest } from '../client'
import { PATIENT_API_PATHS } from './endpoints'
import type { PatientApi } from './patientApi'
import type {
  SubmitPatientReportRequest,
  SubmitPatientReportResponse,
} from './types'

export function createHttpPatientApi(baseUrl: string): PatientApi {
  const normalizedBase = baseUrl.replace(/\/$/, '')

  return {
    submitReport(request: SubmitPatientReportRequest) {
      return apiRequest<SubmitPatientReportResponse>(
        `${normalizedBase}${PATIENT_API_PATHS.submitReport}`,
        {
          method: 'POST',
          body: request,
        },
      )
    },
  }
}
