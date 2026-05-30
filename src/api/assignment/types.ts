export type ClientLocation = {
  latitude: number
  longitude: number
  address: string
}

export type CreateAssignmentRequest = {
  transcript: string
  client_location: ClientLocation
  paramedic_id: string
}

export type EmergencyCase = {
  case_id: string
  patient_id: string
  chief_complaint: string
  detailed_description: string
  ktas_level: number
  transport_status: string
  status: string
  created_at: string
}

export type AssignmentHospital = {
  hospital_id: string
  hospital_name: string
  address: string
  latitude: number
  longitude: number
  total_er_beds: number
  trauma_center: boolean
  stroke_center: boolean
  cardiac_center: boolean
}

export type WaitLevel = 'low' | 'moderate' | 'high' | 'severe'

export type AssignmentWaitTimeBreakdown = {
  bed_pressure_minutes: number
  existing_patient_minutes: number
  incoming_queue_minutes: number
}

export type AssignmentWaitTime = {
  distance_km: number
  travel_minutes: number
  estimated_wait_minutes: number
  wait_level: WaitLevel
  breakdown: AssignmentWaitTimeBreakdown
}

export type CreateAssignmentResponse = {
  emergency_case: EmergencyCase
  hospital: AssignmentHospital
  wait_time?: AssignmentWaitTime
  message: string
}
