import { useCallback, useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage } from '../../api/client'
import { createTriageApi } from '../../api/triage/triageApi'
import type { HospitalErDetail, HospitalWaitTime, SymptomOption } from '../../api/triage/types'

type PatientSelectionStep = 'symptoms' | 'hospitals'

type PatientSelectionState = {
  step: PatientSelectionStep
  loading: boolean
  symptoms: SymptomOption[]
  waitTimes: HospitalWaitTime[]
  recommendationNote: string
  selectedSymptomId: string | null
  selectedHospitalId: string | null
  detailHospitalId: string | null
  hospitalDetail: HospitalErDetail | null
  detailLoading: boolean
  proceeding: boolean
  error: string | null
}

const initialState: PatientSelectionState = {
  step: 'symptoms',
  loading: true,
  symptoms: [],
  waitTimes: [],
  recommendationNote: '',
  selectedSymptomId: null,
  selectedHospitalId: null,
  detailHospitalId: null,
  hospitalDetail: null,
  detailLoading: false,
  proceeding: false,
  error: null,
}

const WAIT_TIMES_POLL_MS = 45_000

export function usePatientSelection() {
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

  const proceedToHospitals = useCallback(async () => {
    if (!state.selectedSymptomId) {
      setState((prev) => ({
        ...prev,
        error: 'Please select a symptom to continue.',
      }))
      return
    }

    setState((prev) => ({ ...prev, proceeding: true, error: null }))

    try {
      await triageApi.submitPreTriage({ symptomId: state.selectedSymptomId })
      setState((prev) => ({
        ...prev,
        proceeding: false,
        step: 'hospitals',
      }))
    } catch (error) {
      const message = getApiErrorMessage(error, 'Could not continue to hospital list.')
      setState((prev) => ({ ...prev, proceeding: false, error: message }))
    }
  }, [state.selectedSymptomId, triageApi])

  return {
    ...state,
    isDetailOpen: Boolean(state.detailHospitalId),
    selectSymptom,
    proceedToHospitals,
    openHospitalDetail,
    closeHospitalDetail,
    refreshHospitalDetail,
  }
}
