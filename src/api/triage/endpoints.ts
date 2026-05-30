export const TRIAGE_API_PATHS = {
  overview: '/api/v1/triage/overview',
  preTriage: '/api/v1/triage/pre-triage',
  hospitalDetail: (hospitalId: string) =>
    `/api/v1/triage/hospitals/${hospitalId}/er-detail`,
  registration: '/api/v1/triage/registrations',
} as const
