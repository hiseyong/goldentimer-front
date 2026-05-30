import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/client'
import { createTriageApi } from '../../api/triage/triageApi'
import type { HospitalErDetail, HospitalWaitTime, SymptomOption } from '../../api/triage/types'
import type { PatientRegistrationLocationState } from './types'

type PatientSelectionState = {
  loading: boolean
  symptoms: SymptomOption[]
  waitTimes: HospitalWaitTime[]
  recommendationNote: string
  selectedSymptomId: string | null
  selectedHospitalId: string | null
  detailHospitalId: string | null
  hospitalDetail: HospitalErDetail | null
  detailLoading: boolean
  sessionId: string | null
  starting: boolean
  error: string | null
}

const initialState: PatientSelectionState = {
  loading: true,
  symptoms: [],
  waitTimes: [],
  recommendationNote: '',
  selectedSymptomId: null,
  selectedHospitalId: null,
  detailHospitalId: null,
  hospitalDetail: null,
  detailLoading: false,
  sessionId: null,
  starting: false,
  error: null,
}

const WAIT_TIMES_POLL_MS = 45_000

export function usePatientSelection() {
  const navigate = useNavigate()
  const triageApi = useMemo(() => createTriageApi(), [])
  const [state, setState] = useState<PatientSelectionState>(initialState)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const overview = await triageApi.getOverview()
        if (cancelled) return
        setState((prev) => ({
          ...prev,
          loading: false,
          symptoms: overview.symptoms,
          waitTimes: overview.waitTimes,
          recommendationNote: overview.recommendationNote,
        }))
      } catch (error) {
        if (cancelled) return
        const message = getApiErrorMessage(error, 'Failed to load triage data.')
        setState((prev) => ({ ...prev, loading: false, error: message }))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [triageApi])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void triageApi.getOverview().then((overview) => {
        setState((prev) => ({
          ...prev,
          waitTimes: overview.waitTimes,
          recommendationNote: overview.recommendationNote,
        }))
      }).catch(() => {})
    }, WAIT_TIMES_POLL_MS)

    return () => window.clearInterval(intervalId)
  }, [triageApi])

  const selectSymptom = useCallback((symptomId: string) => {
    setState((prev) => ({
      ...prev,
      selectedSymptomId: symptomId,
      error: null,
    }))
  }, [])

  const openHospitalDetail = useCallback(
    async (hospitalId: string) => {
      setState((prev) => ({
        ...prev,
        selectedHospitalId: hospitalId,
        detailHospitalId: hospitalId,
        detailLoading: true,
        hospitalDetail: null,
        error: null,
      }))

      try {
        const detail = await triageApi.getHospitalDetail(hospitalId)
        setState((prev) => ({
          ...prev,
          hospitalDetail: detail,
          detailLoading: false,
        }))
      } catch (error) {
        const message = getApiErrorMessage(error, 'Failed to load hospital detail.')
        setState((prev) => ({
          ...prev,
          detailLoading: false,
          detailHospitalId: null,
          error: message,
        }))
      }
    },
    [triageApi],
  )

  const closeHospitalDetail = useCallback(() => {
    setState((prev) => ({
      ...prev,
      detailHospitalId: null,
      hospitalDetail: null,
      detailLoading: false,
    }))
  }, [])

  const refreshHospitalDetail = useCallback(async () => {
    if (!state.detailHospitalId) return
    setState((prev) => ({ ...prev, detailLoading: true }))
    try {
      const detail = await triageApi.getHospitalDetail(state.detailHospitalId)
      setState((prev) => ({
        ...prev,
        hospitalDetail: detail,
        detailLoading: false,
      }))
    } catch {
      setState((prev) => ({ ...prev, detailLoading: false }))
    }
  }, [state.detailHospitalId, triageApi])

  const navigateToRegistration = useCallback(
    async (hospitalId: string) => {
      const hospital = state.waitTimes.find((h) => h.hospitalId === hospitalId)
      const symptom = state.symptoms.find((s) => s.id === state.selectedSymptomId)

      if (!state.selectedSymptomId || !symptom) {
        setState((prev) => ({
          ...prev,
          error: 'Please select a symptom to continue.',
        }))
        return
      }

      if (!hospital) return

      setState((prev) => ({ ...prev, starting: true, error: null }))

      try {
        let sessionId = state.sessionId
        if (!sessionId) {
          const preTriage = await triageApi.submitPreTriage({
            symptomId: state.selectedSymptomId,
          })
          sessionId = preTriage.sessionId
        }

        const locationState: PatientRegistrationLocationState = {
          hospitalId: hospital.hospitalId,
          hospitalName: hospital.hospitalName,
          symptomId: symptom.id,
          symptomLabel: symptom.label,
          sessionId: sessionId ?? undefined,
        }

        closeHospitalDetail()
        navigate('/patient/register', { state: locationState })
      } catch (error) {
        const message = getApiErrorMessage(error, 'Could not start registration.')
        setState((prev) => ({ ...prev, starting: false, error: message }))
      }
    },
    [
      closeHospitalDetail,
      navigate,
      state.selectedSymptomId,
      state.sessionId,
      state.symptoms,
      state.waitTimes,
      triageApi,
    ],
  )

  const startRegistration = useCallback(() => {
    if (!state.selectedHospitalId) {
      setState((prev) => ({
        ...prev,
        error: 'Please select a hospital from the list.',
      }))
      return
    }
    void navigateToRegistration(state.selectedHospitalId)
  }, [navigateToRegistration, state.selectedHospitalId])

  const registerAtDetailHospital = useCallback(() => {
    if (state.detailHospitalId) {
      void navigateToRegistration(state.detailHospitalId)
    }
  }, [navigateToRegistration, state.detailHospitalId])

  return {
    ...state,
    isDetailOpen: Boolean(state.detailHospitalId),
    selectSymptom,
    openHospitalDetail,
    closeHospitalDetail,
    refreshHospitalDetail,
    startRegistration,
    registerAtDetailHospital,
  }
}
