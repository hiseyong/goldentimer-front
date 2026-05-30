export type KtasLevel = 1 | 2 | 3 | 4 | 5

export type KtasSummaryItem = {
  key: string
  label: string
  count: number
  tone: 'red' | 'amber' | 'slate'
}

export type IncomingPatient = {
  id: string
  time: string
  name: string
  gender: 'M' | 'F'
  age: number
  ktas: KtasLevel
  source: string
  symptoms: string
}

export type ResourceCounts = {
  specialists: number
  residents: number
  nurses: number
}

export type LoadStatus = 'overload' | 'caution' | 'stable'

export type AiRecommendation = {
  id: string
  text: string
}

export type MedicalStaffDashboard = {
  ktasSummary: KtasSummaryItem[]
  incomingPatients: IncomingPatient[]
  resources: ResourceCounts
  loadStatus: LoadStatus
  loadPercent: number
  aiRecommendations: AiRecommendation[]
}
