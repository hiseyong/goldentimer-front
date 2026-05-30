export const HOSPITAL_API_PATHS = {
  nearby: '/api/v1/hospitals/nearby',
  recommend: '/api/v1/hospitals/recommend',
  recommendations: '/api/v1/hospitals/recommendations',
  erStatus: '/api/v1/hospitals/er-status',
  waitTime: (hospitalId: string) => `/api/v1/hospitals/${hospitalId}/wait-time`,
  patients: (hospitalId: string) => `/api/v1/hospitals/${hospitalId}/patients`,
} as const
