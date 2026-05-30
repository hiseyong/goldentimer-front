import { apiRequest } from '../client'
import { env } from '../../config/env'
import { MEDICAL_STAFF_API_PATHS } from './endpoints'
import type { MedicalStaffApi } from './medicalStaffApi'
import type {
  IncomingPatient,
  KtasLevel,
  KtasSummaryItem,
  LoadStatus,
  MedicalStaffDashboard,
} from './types'

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

type HospitalPatientStatusResponse = {
  hospital_id: string
  hospital_name: string
  total_er_beds: number
  active_incoming_count: number
  patients: BackendIncomingPatient[]
  summary: string
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatTransportSource(patient: BackendIncomingPatient): string {
  const status = patient.transport_status?.replaceAll('_', ' ') ?? 'Paramedic'
  if (
    patient.transport_status === 'in_transit' &&
    patient.estimated_arrival_minutes != null
  ) {
    return `${status} · ETA ${patient.estimated_arrival_minutes} min`
  }
  return status
}

function buildKtasSummary(patients: BackendIncomingPatient[]): KtasSummaryItem[] {
  const counts = { ktas1: 0, ktas2: 0, ktasOther: 0 }

  for (const patient of patients) {
    if (patient.ktas_level === 1) counts.ktas1 += 1
    else if (patient.ktas_level === 2) counts.ktas2 += 1
    else counts.ktasOther += 1
  }

  return [
    { key: 'ktas-1', label: 'KTAS 1 (Immediate)', count: counts.ktas1, tone: 'red' },
    { key: 'ktas-2', label: 'KTAS 2 (Urgent)', count: counts.ktas2, tone: 'amber' },
    {
      key: 'ktas-3-5',
      label: 'KTAS 3–5 (Non-urgent)',
      count: counts.ktasOther,
      tone: 'slate',
    },
  ]
}

function mapIncomingPatient(patient: BackendIncomingPatient): IncomingPatient {
  const ktas = (patient.ktas_level ?? 3) as KtasLevel

  return {
    id: patient.assignment_id,
    time: formatTime(patient.assigned_at),
    name: patient.patient_name?.trim() || 'Unknown',
    gender: 'M',
    age: 0,
    ktas,
    source: formatTransportSource(patient),
    symptoms: patient.chief_complaint?.trim() || '—',
  }
}

function deriveLoadStatus(
  activeCount: number,
  totalBeds: number,
): { loadStatus: LoadStatus; loadPercent: number } {
  if (totalBeds <= 0) {
    return { loadStatus: 'stable', loadPercent: 0 }
  }

  const loadPercent = Math.min(100, Math.round((activeCount / totalBeds) * 100))

  if (loadPercent >= 90) return { loadStatus: 'overload', loadPercent }
  if (loadPercent >= 60) return { loadStatus: 'caution', loadPercent }
  return { loadStatus: 'stable', loadPercent }
}

function mapPatientStatusToDashboard(
  response: HospitalPatientStatusResponse,
): MedicalStaffDashboard {
  const { loadStatus, loadPercent } = deriveLoadStatus(
    response.active_incoming_count,
    response.total_er_beds,
  )

  return {
    ktasSummary: buildKtasSummary(response.patients),
    incomingPatients: response.patients.map(mapIncomingPatient),
    resources: {
      specialists: 0,
      residents: 0,
      nurses: 0,
    },
    loadStatus,
    loadPercent,
    aiRecommendations: response.summary
      ? [{ id: 'summary', text: response.summary }]
      : [],
  }
}

export function createHttpMedicalStaffApi(baseUrl: string): MedicalStaffApi {
  const normalizedBase = baseUrl.replace(/\/$/, '')

  return {
    getDashboard() {
      return apiRequest<HospitalPatientStatusResponse>(
        `${normalizedBase}${MEDICAL_STAFF_API_PATHS.hospitalPatients(env.hospitalId)}`,
      ).then(mapPatientStatusToDashboard)
    },
  }
}
