export type WaitSeverity = 'low' | 'medium' | 'high'

export type SymptomOption = {
  id: string
  label: string
}

export type HospitalWaitTime = {
  hospitalId: string
  hospitalName: string
  distanceKm: number
  waitMinutes: number
  waitSeverity: WaitSeverity
}

export type KtasChange = {
  level: 1 | 2
  delta: number
  period: string
}

export type HospitalErDetail = {
  hospitalId: string
  hospitalName: string
  erName: string
  estimatedWaitMinutes: number
  waitSeverity: WaitSeverity
  lastUpdated: string
  ktasChanges: KtasChange[]
  recentInflow: {
    count: number
    period: string
    trend: number[]
  }
  warningText: string
}

export type PreTriageRequest = {
  symptomId: string
}

export type PreTriageResponse = {
  sessionId: string
  message: string
}

export type TriageOverview = {
  symptoms: SymptomOption[]
  waitTimes: HospitalWaitTime[]
  recommendationNote: string
}
