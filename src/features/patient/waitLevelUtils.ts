import type { BackendWaitLevel } from '../../api/hospital/types'
import type { WaitSeverity } from '../../api/triage/types'
import { waitSeverityStyles } from './waitSeverityStyles'

export function waitLevelToSeverity(level: BackendWaitLevel): WaitSeverity {
  if (level === 'low') return 'low'
  if (level === 'moderate') return 'medium'
  return 'high'
}

export function waitLevelLabel(level: BackendWaitLevel): string {
  const labels: Record<BackendWaitLevel, string> = {
    low: 'Smooth',
    moderate: 'Moderate',
    high: 'Busy',
    severe: 'Severe',
  }
  return labels[level]
}

export { waitSeverityStyles }
