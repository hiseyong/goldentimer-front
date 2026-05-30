export type SubmitPatientReportRequest = {
  transcript: string
  reportedAt?: string
  metadata?: {
    crewId?: string
    location?: string
    hospitalId?: string
  }
}

export type HospitalAssignment = {
  hospitalId: string
  hospitalName: string
  address: string
  etaMinutes?: number
  specialty?: string
  notes?: string
}

export type SubmitPatientReportResponse = {
  patientId: string
  assignment: HospitalAssignment
  announcementText: string
}
