const DEFAULT_API_BASE_URL = 'https://api.hasclassmatching.com'

const parseBool = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined || value === '') return defaultValue
  return value === 'true' || value === '1'
}

const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (value === undefined || value === '') return defaultValue
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : defaultValue
}

const resolveApiBaseUrl = (): string => {
  const configured = import.meta.env.VITE_API_BASE_URL
  if (configured !== undefined && configured !== '') return configured
  return DEFAULT_API_BASE_URL
}

const resolveUseMockApi = (): boolean => {
  const configured = import.meta.env.VITE_USE_MOCK_API
  if (configured !== undefined && configured !== '') {
    return parseBool(configured, false)
  }
  // Dev defaults to mock when unset; production defaults to real API.
  return !import.meta.env.PROD
}

/** Cloud STT (Whisper). In dev, defaults to Vite `/api/stt` proxy. */
const resolveSttApiUrl = (): string | null => {
  const configured = import.meta.env.VITE_STT_API_URL
  if (configured !== undefined && configured !== '') return configured

  if (
    import.meta.env.DEV &&
    parseBool(import.meta.env.VITE_USE_DEV_STT_PROXY, true)
  ) {
    return '/api/stt'
  }

  return null
}

export const env = {
  apiBaseUrl: resolveApiBaseUrl(),
  useMockApi: resolveUseMockApi(),
  paramedicId: import.meta.env.VITE_PARAMEDIC_ID ?? 'EMT-001',
  hospitalId:
    import.meta.env.VITE_HOSPITAL_ID ?? '787337ac-d703-4480-b15a-916d7e2adae8',
  defaultLatitude: parseNumber(import.meta.env.VITE_DEFAULT_LATITUDE, 37.4979),
  defaultLongitude: parseNumber(import.meta.env.VITE_DEFAULT_LONGITUDE, 127.0276),
  sttApiUrl: resolveSttApiUrl(),
} as const
