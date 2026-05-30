import type { AssignmentApi } from './assignmentApi'
import type {
  CreateAssignmentRequest,
  CreateAssignmentResponse,
} from './types'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function createMockAssignmentApi(): AssignmentApi {
  return {
    async createAssignment(
      request: CreateAssignmentRequest,
    ): Promise<CreateAssignmentResponse> {
      await delay(900 + Math.random() * 600)

      return {
        emergency_case: {
          case_id: '8fa9f952-d93c-42a9-a8b7-f68a29cd3698',
          patient_id: 'b13e79ab-f98c-460a-a40f-8e2b57a05253',
          chief_complaint: request.transcript,
          detailed_description: `paramedic_id=${request.paramedic_id}`,
          ktas_level: 2,
          transport_status: 'in_transit',
          status: 'active',
          created_at: new Date().toISOString(),
        },
        hospital: {
          hospital_id: '787337ac-d703-4480-b15a-916d7e2adae8',
          hospital_name: '연세대학교의과대학강남세브란스병원',
          address:
            '서울특별시 강남구 언주로 211, 강남세브란스병원 (도곡동)',
          latitude: 37.492807,
          longitude: 127.0463125,
          total_er_beds: 4,
          trauma_center: true,
          stroke_center: true,
          cardiac_center: true,
        },
        message:
          'Recommended 연세대학교의과대학강남세브란스병원 (1.7 km, 4 ER beds available)',
        wait_time: {
          distance_km: 1.7,
          travel_minutes: 5,
          estimated_wait_minutes: 10,
          wait_level: 'low',
          breakdown: {
            bed_pressure_minutes: 10,
            existing_patient_minutes: 0,
            incoming_queue_minutes: 0,
          },
        },
      }
    },
  }
}
