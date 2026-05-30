import { apiRequest } from '../client'
import { env } from '../../config/env'
import { createHttpHospitalApi } from '../hospital/httpHospitalApi'
import { HOSPITAL_API_PATHS } from '../hospital/endpoints'
import type { BackendWaitLevel } from '../hospital/types'
import type { TriageApi } from './triageApi'
import type {
  HospitalErDetail,
  HospitalWaitTime,
  KtasChange,
  PatientRegistrationRequest,
  PatientRegistrationResponse,
  PreTriageRequest,
  PreTriageResponse,
  TriageOverview,
  WaitSeverity,
} from './types'

const STATIC_SYMPTOMS = [
  { id: 'abdominal', label: 'Abdominal Pain' },
  { id: 'breathing', label: 'Dyspnea' },
  { id: 'fever', label: 'Fever' },
  { id: 'dizziness', label: 'Dizziness' },
  { id: 'chest-pain', label: 'Chest Pain' },
  { id: 'trauma', label: 'Trauma / Injury' },
] as const

type BackendIncomingPatient = {
  assignment_id: string
  case_id: string
  patient_id: string
  patient_name: string | null
  chief_complaint: string | null
  ktas_level: number | null
  transport_status: string | null
  case_status: string | null
  acceptance_status: string | null
  estimated_arrival_minutes: number | null
  assigned_at: string
}

type HospitalPatientsResponse = {
  hospital_id: string
  hospital_name: string
  total_er_beds: number
  active_incoming_count: number
  summary: string
  patients: BackendIncomingPatient[]
}

function waitLevelToSeverity(level: BackendWaitLevel): WaitSeverity {
  if (level === 'low') return 'low'
  if (level === 'moderate') return 'medium'
  return 'high'
}

function formatDataAsOf(iso: string | null | undefined): string {
  if (!iso) return '--:--'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function buildKtasChanges(patients: BackendIncomingPatient[]): KtasChange[] {
  const ktas1 = patients.filter((p) => p.ktas_level === 1).length
  const ktas2 = patients.filter((p) => p.ktas_level === 2).length

  return [
    { level: 1, delta: ktas1, period: 'active incoming' },
    { level: 2, delta: ktas2, period: 'active incoming' },
  ]
}

function buildInflowTrend(activeCount: number): number[] {
  if (activeCount <= 0) return [0]
  return Array.from({ length: Math.min(activeCount, 5) }, (_, index) => index + 1)
}

function mapToHospitalWaitTime(
  hospital: Awaited<
    ReturnType<ReturnType<typeof createHttpHospitalApi>['getNearbyHospitals']>
  >['hospitals'][number],
): HospitalWaitTime {
  return {
    hospitalId: hospital.hospital_id,
    hospitalName: hospital.hospital_name,
    distanceKm: hospital.distance_km,
    waitMinutes: hospital.estimated_wait_minutes,
    waitSeverity: waitLevelToSeverity(hospital.wait_level),
  }
}

function mapToHospitalErDetail(
  waitTime: Awaited<ReturnType<ReturnType<typeof createHttpHospitalApi>['getWaitTime']>>,
  patientsResponse: HospitalPatientsResponse | null,
): HospitalErDetail {
  const patients = patientsResponse?.patients ?? []
  const activeCount =
    patientsResponse?.active_incoming_count ?? waitTime.active_incoming_count

  return {
    hospitalId: waitTime.hospital_id,
    hospitalName: waitTime.hospital_name,
    erName: `${waitTime.hospital_name} ER`,
    estimatedWaitMinutes: waitTime.estimated_wait_minutes,
    waitSeverity: waitLevelToSeverity(waitTime.wait_level),
    lastUpdated: formatDataAsOf(waitTime.data_as_of),
    ktasChanges: buildKtasChanges(patients),
    recentInflow: {
      count: activeCount,
      period: 'currently in transit',
      trend: buildInflowTrend(activeCount),
    },
    warningText: waitTime.guidance,
  }
}

export function createHttpTriageApi(baseUrl: string): TriageApi {
  const normalizedBase = baseUrl.replace(/\/$/, '')
  const hospitalApi = createHttpHospitalApi(baseUrl)

  return {
    async getOverview(): Promise<TriageOverview> {
      const nearby = await hospitalApi.getNearbyHospitals({
        latitude: env.defaultLatitude,
        longitude: env.defaultLongitude,
        limit: 5,
      })

      return {
        symptoms: [...STATIC_SYMPTOMS],
        recommendationNote:
          'Sorted by bed availability, estimated wait time, and distance from your area.',
        waitTimes: nearby.hospitals.map(mapToHospitalWaitTime),
      }
    },

    async getHospitalDetail(hospitalId: string): Promise<HospitalErDetail> {
      const [waitTime, patientsResponse] = await Promise.all([
        hospitalApi.getWaitTime(hospitalId),
        apiRequest<HospitalPatientsResponse>(
          `${normalizedBase}${HOSPITAL_API_PATHS.patients(hospitalId)}`,
        ).catch(() => null),
      ])

      return mapToHospitalErDetail(waitTime, patientsResponse)
    },

    async submitPreTriage(request: PreTriageRequest): Promise<PreTriageResponse> {
      const symptom = STATIC_SYMPTOMS.find((item) => item.id === request.symptomId)
      return {
        sessionId: `session-${Date.now()}`,
        message: symptom
          ? `Pre-triage started for ${symptom.label}.`
          : 'Pre-triage session started.',
      }
    },

    async submitRegistration(
      request: PatientRegistrationRequest,
    ): Promise<PatientRegistrationResponse> {
      if (!request.consentAccepted) {
        throw new Error('Consent required')
      }

      return {
        registrationId: `local-${Date.now()}`,
        message: `Registration details saved for ${request.patientName.trim()}. Please proceed to the selected hospital ER.`,
      }
    },
  }
}
