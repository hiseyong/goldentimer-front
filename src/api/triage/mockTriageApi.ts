import type { TriageApi } from './triageApi'
import type {
  HospitalErDetail,
  PreTriageRequest,
  PreTriageResponse,
  TriageOverview,
} from './types'

const OVERVIEW: TriageOverview = {
  recommendationNote:
    'AI recommends hospitals by analyzing symptoms, severity, and availability.',
  symptoms: [
    { id: 'abdominal', label: 'Abdominal Pain' },
    { id: 'breathing', label: 'Dyspnea' },
    { id: 'fever', label: 'Fever' },
    { id: 'dizziness', label: 'Dizziness' },
  ],
  waitTimes: [
    {
      hospitalId: 'hosp-severance',
      hospitalName: 'Gangnam Severance Hospital',
      distanceKm: 9.3,
      waitMinutes: 18,
      waitSeverity: 'high',
    },
    {
      hospitalId: 'hosp-gangdong',
      hospitalName: 'Kyung Hee Univ. Hospital at Gangdong',
      distanceKm: 7.1,
      waitMinutes: 27,
      waitSeverity: 'medium',
    },
    {
      hospitalId: 'hosp-konkuk',
      hospitalName: 'Konkuk University Medical Center',
      distanceKm: 6.4,
      waitMinutes: 22,
      waitSeverity: 'low',
    },
  ],
}

const ER_DETAILS: Record<string, HospitalErDetail> = {
  'hosp-severance': {
    hospitalId: 'hosp-severance',
    hospitalName: 'Gangnam Severance Hospital',
    erName: 'Gangnam Severance ER',
    estimatedWaitMinutes: 18,
    waitSeverity: 'high',
    lastUpdated: '12:05',
    ktasChanges: [
      { level: 1, delta: 1, period: 'last 10 min' },
      { level: 2, delta: 2, period: 'last 10 min' },
    ],
    recentInflow: { count: 3, period: 'last 10 min', trend: [2, 3, 2, 4, 3] },
    warningText:
      'Wait times may change in real-time depending on the inflow of critical patients.',
  },
  'hosp-gangdong': {
    hospitalId: 'hosp-gangdong',
    hospitalName: 'Kyung Hee Univ. Hospital at Gangdong',
    erName: 'Kyung Hee Univ. Gangdong ER',
    estimatedWaitMinutes: 27,
    waitSeverity: 'medium',
    lastUpdated: '12:05',
    ktasChanges: [
      { level: 1, delta: 1, period: 'last 10 min' },
      { level: 2, delta: 2, period: 'last 10 min' },
    ],
    recentInflow: { count: 3, period: 'last 10 min', trend: [1, 2, 3, 2, 3] },
    warningText:
      'Wait times may change in real-time depending on the inflow of critical patients.',
  },
  'hosp-konkuk': {
    hospitalId: 'hosp-konkuk',
    hospitalName: 'Konkuk University Medical Center',
    erName: 'Konkuk University Medical Center ER',
    estimatedWaitMinutes: 22,
    waitSeverity: 'low',
    lastUpdated: '12:05',
    ktasChanges: [
      { level: 1, delta: 0, period: 'last 10 min' },
      { level: 2, delta: 1, period: 'last 10 min' },
    ],
    recentInflow: { count: 2, period: 'last 10 min', trend: [1, 1, 2, 1, 2] },
    warningText:
      'Wait times may change in real-time depending on the inflow of critical patients.',
  },
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function bumpWaitMinutes(base: number): number {
  return base + Math.floor(Math.random() * 3)
}

export function createMockTriageApi(): TriageApi {
  return {
    async getOverview(): Promise<TriageOverview> {
      await delay(300)
      return OVERVIEW
    },

    async getHospitalDetail(hospitalId: string): Promise<HospitalErDetail> {
      await delay(400)
      const detail = ER_DETAILS[hospitalId]
      if (!detail) {
        throw new Error('Hospital not found')
      }
      return {
        ...detail,
        estimatedWaitMinutes: bumpWaitMinutes(detail.estimatedWaitMinutes),
        lastUpdated: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      }
    },

    async submitPreTriage(request: PreTriageRequest): Promise<PreTriageResponse> {
      await delay(500)
      const symptom = OVERVIEW.symptoms.find((s) => s.id === request.symptomId)
      return {
        sessionId: `session-${Date.now()}`,
        message: symptom
          ? `Pre-triage started for ${symptom.label}.`
          : 'Pre-triage session started.',
      }
    },
  }
}
