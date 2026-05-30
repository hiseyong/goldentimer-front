export type StatusTagVariant =
  | 'normal'
  | 'crowded'
  | 'positive'
  | 'warning'
  | 'neutral'

export type StatusTag = {
  label: string
  variant: StatusTagVariant
}

export type HospitalRecommendation = {
  rank: number
  hospitalId: string
  hospitalName: string
  travelMinutes: number
  tags: StatusTag[]
}

export type HospitalRecommendationsRequest = {
  transcript: string
}

export type HospitalRecommendationsResponse = {
  recommendations: HospitalRecommendation[]
  footerNote: string
  announcementText: string
}

export type ErMetricStatus = 'crowded' | 'normal' | 'available'

export type ErMetric = {
  label: string
  value: string
  status: ErMetricStatus
}

export type ErStatusItem = {
  hospitalId: string
  hospitalName: string
  metrics: ErMetric[]
}

export type BackendWaitLevel = 'low' | 'moderate' | 'high' | 'severe'

export type NearbyLocationParams = {
  latitude: number
  longitude: number
  limit?: number
}

export type NearbyHospitalDetail = {
  hospital_id: string
  hpid: string | null
  hospital_name: string
  address: string
  stage1: string | null
  stage2: string | null
  latitude: number
  longitude: number
  distance_km: number
  total_er_beds: number
  er_beds_available: boolean
  estimated_wait_minutes: number
  wait_level: BackendWaitLevel
  trauma_center: boolean
  stroke_center: boolean
  cardiac_center: boolean
  updated_at: string | null
}

export type NearbyHospitalsResponse = {
  latitude: number
  longitude: number
  count: number
  hospitals: NearbyHospitalDetail[]
}

export type HospitalWaitTimeBreakdown = {
  bed_pressure_minutes: number
  existing_patient_minutes: number
  incoming_queue_minutes: number
}

export type HospitalWaitTimeResponse = {
  hospital_id: string
  hospital_name: string
  total_er_beds: number
  active_incoming_count: number
  estimated_wait_minutes: number
  wait_level: BackendWaitLevel
  breakdown: HospitalWaitTimeBreakdown
  guidance: string
  data_as_of: string
}
