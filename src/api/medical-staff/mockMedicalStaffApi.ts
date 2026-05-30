import type { MedicalStaffApi } from './medicalStaffApi'
import type { MedicalStaffDashboard } from './types'

const DASHBOARD: MedicalStaffDashboard = {
  ktasSummary: [
    { key: 'ktas-1', label: 'KTAS 1 (Immediate)', count: 2, tone: 'red' },
    { key: 'ktas-2', label: 'KTAS 2 (Urgent)', count: 5, tone: 'amber' },
    { key: 'ktas-3-5', label: 'KTAS 3–5 (Non-urgent)', count: 18, tone: 'slate' },
  ],
  incomingPatients: [
    {
      id: 'p-001',
      time: '14:32',
      name: 'Kim',
      gender: 'M',
      age: 62,
      ktas: 2,
      source: 'Paramedic input',
      symptoms: 'Chest pain, SpO2 91%',
    },
    {
      id: 'p-002',
      time: '14:28',
      name: 'Lee',
      gender: 'F',
      age: 34,
      ktas: 3,
      source: 'Walk-in',
      symptoms: 'Abdominal pain',
    },
    {
      id: 'p-003',
      time: '14:15',
      name: 'Park',
      gender: 'M',
      age: 8,
      ktas: 4,
      source: 'Patient app',
      symptoms: 'Fever',
    },
    {
      id: 'p-004',
      time: '14:05',
      name: 'Choi',
      gender: 'F',
      age: 71,
      ktas: 1,
      source: 'Paramedic input',
      symptoms: 'Altered consciousness',
    },
  ],
  resources: {
    specialists: 4,
    residents: 6,
    nurses: 12,
  },
  loadStatus: 'caution',
  loadPercent: 72,
  aiRecommendations: [
    { id: 'r-1', text: 'Prioritize KTAS 1 assignment to available specialist.' },
    { id: 'r-2', text: 'General ER approaching capacity — consider diversion for KTAS 4–5.' },
    { id: 'r-3', text: 'Incoming paramedic report: chest pain, ETA 9 min.' },
  ],
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function createMockMedicalStaffApi(): MedicalStaffApi {
  return {
    async getDashboard(): Promise<MedicalStaffDashboard> {
      await delay(350)
      return DASHBOARD
    },
  }
}
