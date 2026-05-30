import { env } from '../../config/env'
import type { HospitalApi } from './hospitalApi'
import type {
  ErStatusItem,
  HospitalRecommendationsRequest,
  HospitalRecommendationsResponse,
  HospitalRecommendation,
  HospitalWaitTimeResponse,
  NearbyHospitalsResponse,
  NearbyLocationParams,
} from './types'

const RECOMMENDATIONS: HospitalRecommendation[] = [
  {
    rank: 1,
    hospitalId: 'hosp-gangdong',
    hospitalName: 'Kyung Hee University Hospital at Gangdong',
    travelMinutes: 9,
    tags: [
      { label: 'General ER: Normal', variant: 'normal' },
      { label: 'Sufficient Specialists', variant: 'positive' },
    ],
  },
  {
    rank: 2,
    hospitalId: 'hosp-konkuk',
    hospitalName: 'Konkuk University Medical Center',
    travelMinutes: 12,
    tags: [
      { label: 'General ER: Crowded', variant: 'crowded' },
      { label: 'Trauma Response Available', variant: 'positive' },
    ],
  },
  {
    rank: 3,
    hospitalId: 'hosp-severance',
    hospitalName: 'Gangnam Severance Hospital',
    travelMinutes: 15,
    tags: [
      { label: 'Excellent Severe Case Response', variant: 'positive' },
      { label: 'Currently Crowded', variant: 'crowded' },
    ],
  },
]

const ER_STATUS: ErStatusItem[] = [
  {
    hospitalId: 'hosp-konkuk',
    hospitalName: 'Konkuk University Medical Center',
    metrics: [
      { label: 'General ER', value: 'Crowded (9/20 beds)', status: 'crowded' },
      { label: 'Trauma', value: 'Normal (4/4)', status: 'normal' },
      { label: 'Pediatric', value: 'Available (1/1)', status: 'available' },
    ],
  },
  {
    hospitalId: 'hosp-gangdong',
    hospitalName: 'Kyung Hee University Hospital at Gangdong',
    metrics: [
      { label: 'General ER', value: 'Normal (6/18 beds)', status: 'normal' },
      { label: 'Cardiac', value: 'Available (2/2)', status: 'available' },
    ],
  },
  {
    hospitalId: 'hosp-severance',
    hospitalName: 'Gangnam Severance Hospital',
    metrics: [
      { label: 'General ER', value: 'Crowded (14/16 beds)', status: 'crowded' },
      { label: 'Severe cases', value: 'Normal (3/4)', status: 'normal' },
    ],
  },
]

const MOCK_NEARBY: NearbyHospitalsResponse = {
  latitude: env.defaultLatitude,
  longitude: env.defaultLongitude,
  count: 3,
  hospitals: [
    {
      hospital_id: 'hosp-severance',
      hpid: 'A1100015',
      hospital_name: 'Gangnam Severance Hospital',
      address: 'Seoul',
      stage1: 'Seoul',
      stage2: 'Gangnam',
      latitude: 37.4928,
      longitude: 127.0463,
      distance_km: 1.75,
      total_er_beds: 4,
      er_beds_available: true,
      estimated_wait_minutes: 18,
      wait_level: 'high',
      trauma_center: true,
      stroke_center: true,
      cardiac_center: true,
      updated_at: new Date().toISOString(),
    },
    {
      hospital_id: 'hosp-gangdong',
      hpid: 'A1100020',
      hospital_name: 'Kyung Hee Univ. Hospital at Gangdong',
      address: 'Seoul',
      stage1: 'Seoul',
      stage2: 'Gangdong',
      latitude: 37.53,
      longitude: 127.08,
      distance_km: 7.1,
      total_er_beds: 8,
      er_beds_available: true,
      estimated_wait_minutes: 27,
      wait_level: 'moderate',
      trauma_center: true,
      stroke_center: false,
      cardiac_center: true,
      updated_at: new Date().toISOString(),
    },
    {
      hospital_id: 'hosp-konkuk',
      hpid: 'A1100030',
      hospital_name: 'Konkuk University Medical Center',
      address: 'Seoul',
      stage1: 'Seoul',
      stage2: 'Gwangjin',
      latitude: 37.54,
      longitude: 127.07,
      distance_km: 6.4,
      total_er_beds: 12,
      er_beds_available: true,
      estimated_wait_minutes: 22,
      wait_level: 'low',
      trauma_center: false,
      stroke_center: true,
      cardiac_center: false,
      updated_at: new Date().toISOString(),
    },
  ],
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function buildAnnouncement(top: HospitalRecommendation): string {
  return `Recommended destination is ${top.hospitalName}, ${top.travelMinutes} minutes away.`
}

export function createMockHospitalApi(): HospitalApi {
  return {
    async getRecommendations(
      request: HospitalRecommendationsRequest,
    ): Promise<HospitalRecommendationsResponse> {
      void request
      await delay(900 + Math.random() * 600)
      const top = RECOMMENDATIONS[0]
      return {
        recommendations: RECOMMENDATIONS,
        footerNote:
          'Recommendations based on distance, bed availability, staff capacity, and KTAS severity.',
        announcementText: buildAnnouncement(top),
      }
    },

    async getErStatus(): Promise<ErStatusItem[]> {
      await delay(400)
      return ER_STATUS
    },

    async getNearbyHospitals(_params: NearbyLocationParams): Promise<NearbyHospitalsResponse> {
      await delay(400)
      return MOCK_NEARBY
    },

    async getWaitTime(hospitalId: string): Promise<HospitalWaitTimeResponse> {
      await delay(300)
      const hospital = MOCK_NEARBY.hospitals.find((h) => h.hospital_id === hospitalId)
      if (!hospital) {
        throw new Error('Hospital not found')
      }
      return {
        hospital_id: hospital.hospital_id,
        hospital_name: hospital.hospital_name,
        total_er_beds: hospital.total_er_beds,
        active_incoming_count: 2,
        estimated_wait_minutes: hospital.estimated_wait_minutes,
        wait_level: hospital.wait_level,
        breakdown: {
          bed_pressure_minutes: 10,
          existing_patient_minutes: 5,
          incoming_queue_minutes: 3,
        },
        guidance: `${hospital.hospital_name} ER status is currently ${hospital.wait_level}.`,
        data_as_of: hospital.updated_at ?? new Date().toISOString(),
      }
    },
  }
}
