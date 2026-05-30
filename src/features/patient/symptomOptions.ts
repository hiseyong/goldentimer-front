import type { SymptomOption } from '../../api/triage/types'

export const PATIENT_SYMPTOM_OPTIONS: SymptomOption[] = [
  { id: 'abdominal', label: 'Abdominal Pain' },
  { id: 'breathing', label: 'Dyspnea' },
  { id: 'fever', label: 'Fever' },
  { id: 'dizziness', label: 'Dizziness' },
  { id: 'chest-pain', label: 'Chest Pain' },
  { id: 'trauma', label: 'Trauma / Injury' },
]

export function getSymptomLabel(symptomId: string): string | undefined {
  return PATIENT_SYMPTOM_OPTIONS.find((option) => option.id === symptomId)?.label
}
