import { useCallback, useMemo, useState } from 'react'
import { getApiErrorMessage } from '../../api/client'
import { createHospitalApi } from '../../api/hospital/hospitalApi'
import type { HospitalRecommendResponse } from '../../api/hospital/types'
import { env } from '../../config/env'
import { beginLocationRequest, GeolocationError } from '../../utils/geolocation'

type PatientStep = 'symptoms' | 'recommendation'

type PatientSelectionState = {
  step: PatientStep
  symptomsText: string
  proceeding: boolean
  error: string | null
  recommendation: HospitalRecommendResponse | null
}

const initialState: PatientSelectionState = {
  step: 'symptoms',
  symptomsText: '',
  proceeding: false,
  error: null,
  recommendation: null,
}

export function usePatientSelection() {
  const hospitalApi = useMemo(() => createHospitalApi(), [])
  const [state, setState] = useState<PatientSelectionState>(initialState)

  const setSymptomsText = useCallback((symptomsText: string) => {
    setState((prev) => ({
      ...prev,
      symptomsText,
      error: null,
    }))
  }, [])

  const proceedToRecommendation = useCallback(async () => {
    const symptoms = state.symptomsText.trim()
    if (!symptoms) {
      setState((prev) => ({
        ...prev,
        error: 'Please describe your symptoms to continue.',
      }))
      return
    }

    setState((prev) => ({ ...prev, proceeding: true, error: null }))

    const locationPromise = beginLocationRequest().catch((error: unknown) => {
      if (error instanceof GeolocationError) {
        return {
          latitude: env.defaultLatitude,
          longitude: env.defaultLongitude,
        }
      }
      throw error
    })

    try {
      const location = await locationPromise
      const recommendation = await hospitalApi.recommendHospital({
        latitude: location.latitude,
        longitude: location.longitude,
        symptoms,
      })

      setState((prev) => ({
        ...prev,
        proceeding: false,
        step: 'recommendation',
        recommendation,
      }))
    } catch (error) {
      const message = getApiErrorMessage(error, 'Could not load hospital recommendation.')
      setState((prev) => ({ ...prev, proceeding: false, error: message }))
    }
  }, [hospitalApi, state.symptomsText])

  const goBackToSymptoms = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: 'symptoms',
      recommendation: null,
      error: null,
    }))
  }, [])

  return {
    ...state,
    setSymptomsText,
    proceedToRecommendation,
    goBackToSymptoms,
  }
}
