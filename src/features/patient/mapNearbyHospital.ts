import type { NearbyHospitalDetail } from '../../api/hospital/types'
import type { HospitalWaitTime } from '../../api/triage/types'
import { waitLevelToSeverity } from './waitLevelUtils'

export function mapNearbyToWaitTime(hospital: NearbyHospitalDetail): HospitalWaitTime {
  return {
    hospitalId: hospital.hospital_id,
    hospitalName: hospital.hospital_name,
    distanceKm: hospital.distance_km,
    waitMinutes: hospital.estimated_wait_minutes,
    waitSeverity: waitLevelToSeverity(hospital.wait_level),
  }
}
