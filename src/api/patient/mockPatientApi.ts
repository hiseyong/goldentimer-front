import type { PatientApi } from './patientApi'
import type {
  HospitalAssignment,
  SubmitPatientReportRequest,
  SubmitPatientReportResponse,
} from './types'

const MOCK_HOSPITALS: HospitalAssignment[] = [
  {
    hospitalId: 'hosp-001',
    hospitalName: 'Metro General Hospital',
    address: '100 University Ave, Downtown',
    etaMinutes: 12,
    specialty: 'Regional trauma center',
    notes: 'Stroke team available',
  },
  {
    hospitalId: 'hosp-002',
    hospitalName: 'Central Medical Center',
    address: '73 North Main St',
    etaMinutes: 8,
    specialty: 'Emergency care facility',
    notes: 'Trauma bay capacity available',
  },
  {
    hospitalId: 'hosp-003',
    hospitalName: 'National University Hospital',
    address: '245 Eulji-ro, Jung District',
    etaMinutes: 15,
    specialty: 'Regional emergency center',
    notes: 'Severe burn specialty',
  },
]

function pickHospital(transcript: string): HospitalAssignment {
  const lower = transcript.toLowerCase()
  if (lower.includes('stroke') || lower.includes('brain')) {
    return MOCK_HOSPITALS[0]
  }
  if (lower.includes('trauma') || lower.includes('injury')) {
    return MOCK_HOSPITALS[1]
  }
  if (lower.includes('burn')) {
    return MOCK_HOSPITALS[2]
  }
  return MOCK_HOSPITALS[Math.floor(Math.random() * MOCK_HOSPITALS.length)]
}

function formatAnnouncement(assignment: HospitalAssignment): string {
  const eta = assignment.etaMinutes
    ? ` Estimated arrival in ${assignment.etaMinutes} minutes.`
    : ''
  return `Recommended destination is ${assignment.hospitalName} emergency department.${eta}`
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function createMockPatientApi(): PatientApi {
  return {
    async submitReport(
      request: SubmitPatientReportRequest,
    ): Promise<SubmitPatientReportResponse> {
      await delay(1200 + Math.random() * 800)

      const assignment = pickHospital(request.transcript)
      const patientId = `patient-${Date.now()}`

      return {
        patientId,
        assignment,
        announcementText: formatAnnouncement(assignment),
      }
    },
  }
}
