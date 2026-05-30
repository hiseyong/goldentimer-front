import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/client'
import { createTriageApi } from '../../api/triage/triageApi'
import type { HospitalErDetail } from '../../api/triage/types'
import type { PatientRegistrationLocationState } from './types'

export type RegistrationStep = 1 | 2 | 3

export type RegistrationFormData = {
  patientName: string
  age: string
  gender: string
  chiefComplaint: string
  onsetTime: string
  guardianContact: string
  additionalNotes: string
  consentAccepted: boolean
}

const emptyForm: RegistrationFormData = {
  patientName: '',
  age: '',
  gender: '',
  chiefComplaint: '',
  onsetTime: '',
  guardianContact: '',
  additionalNotes: '',
  consentAccepted: false,
}

export function usePatientRegistration() {
  const navigate = useNavigate()
  const location = useLocation()
  const triageApi = useMemo(() => createTriageApi(), [])

  const context = location.state as PatientRegistrationLocationState | null

  const [step, setStep] = useState<RegistrationStep>(1)
  const [form, setForm] = useState<RegistrationFormData>(() => ({
    ...emptyForm,
    chiefComplaint: context?.symptomLabel ?? '',
  }))
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [completionMessage, setCompletionMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusPopupOpen, setStatusPopupOpen] = useState(false)
  const [statusDetail, setStatusDetail] = useState<HospitalErDetail | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)

  const updateField = useCallback(
    <K extends keyof RegistrationFormData>(
      key: K,
      value: RegistrationFormData[K],
    ) => {
      setForm((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const openStatusPopup = useCallback(async () => {
    if (!context?.hospitalId) return
    setStatusPopupOpen(true)
    setStatusLoading(true)
    try {
      const detail = await triageApi.getHospitalDetail(context.hospitalId)
      setStatusDetail(detail)
    } catch {
      setStatusDetail(null)
    } finally {
      setStatusLoading(false)
    }
  }, [context, triageApi])

  const closeStatusPopup = useCallback(() => {
    setStatusPopupOpen(false)
  }, [])

  const nextStep = useCallback(() => {
    setError(null)

    if (step === 1) {
      setStep(2)
      return
    }

    if (step === 2) {
      if (!form.patientName.trim() || !form.age.trim() || !form.gender.trim()) {
        setError('Please fill in patient name, age, and gender.')
        return
      }
      if (!form.chiefComplaint.trim() || !form.onsetTime.trim()) {
        setError('Please fill in chief complaint and onset time.')
        return
      }
      if (!form.consentAccepted) {
        setError('Please accept the required consent to continue.')
        return
      }
      setStep(3)
      return
    }
  }, [form, step])

  const prevStep = useCallback(() => {
    setStep((s) => (s > 1 ? ((s - 1) as RegistrationStep) : s))
  }, [])

  const submitRegistration = useCallback(async () => {
    if (!context) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await triageApi.submitRegistration({
        sessionId: context.sessionId,
        hospitalId: context.hospitalId,
        symptomId: context.symptomId,
        patientName: form.patientName.trim(),
        age: Number(form.age),
        gender: form.gender.trim(),
        chiefComplaint: form.chiefComplaint.trim(),
        onsetTime: form.onsetTime.trim(),
        guardianContact: form.guardianContact.trim() || undefined,
        additionalNotes: form.additionalNotes.trim() || undefined,
        consentAccepted: form.consentAccepted,
      })
      setCompleted(true)
      setCompletionMessage(response.message)
    } catch (err) {
      const message = getApiErrorMessage(err, 'Registration failed.')
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }, [context, form, triageApi])

  const goBackToSelection = useCallback(() => {
    navigate('/patient')
  }, [navigate])

  return {
    context,
    step,
    form,
    submitting,
    completed,
    completionMessage,
    error,
    statusPopupOpen,
    statusDetail,
    statusLoading,
    updateField,
    nextStep,
    prevStep,
    submitRegistration,
    openStatusPopup,
    closeStatusPopup,
    goBackToSelection,
  }
}
