export const MEDICAL_STAFF_API_PATHS = {
  hospitalPatients: (hospitalId: string) =>
    `/api/v1/hospitals/${hospitalId}/patients`,
  dashboard: '/api/v1/medical-staff/dashboard',
} as const
