const parseBool = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined || value === '') return defaultValue
  return value === 'true' || value === '1'
}

const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (value === undefined || value === '') return defaultValue
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : defaultValue
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  useMockApi: parseBool(import.meta.env.VITE_USE_MOCK_API, true),
  paramedicId: import.meta.env.VITE_PARAMEDIC_ID ?? 'EMT-001',
  hospitalId:
    import.meta.env.VITE_HOSPITAL_ID ?? '787337ac-d703-4480-b15a-916d7e2adae8',
  defaultLatitude: parseNumber(import.meta.env.VITE_DEFAULT_LATITUDE, 37.4979),
  defaultLongitude: parseNumber(import.meta.env.VITE_DEFAULT_LONGITUDE, 127.0276),
} as const
