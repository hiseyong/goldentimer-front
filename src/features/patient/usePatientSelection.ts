import { useCallback, useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage } from '../../api/client'
import { createHospitalApi } from '../../api/hospital/hospitalApi'
import type { HospitalRecommendResponse } from '../../api/hospital/types'
import type { HospitalWaitTime } from '../../api/triage/types'
import { env } from '../../config/env'
import { beginLocationRequest, GeolocationError } from '../../utils/geolocation'
import { mapNearbyToWaitTime } from './mapNearbyHospital'
import { getSymptomLabel } from './symptomOptions'

type PatientStep = 'symptoms' | 'recommendation'

type PatientLocation = {
  latitude: number
  longitude: number
}

type PatientSelectionState = {
  step: PatientStep
  selectedSymptomId: string | null
  proceeding: boolean
  error: string | null
  recommendation: HospitalRecommendResponse | null
  nearbyHospitals: HospitalWaitTime[]
  loadingNearby: boolean
  location: PatientLocation | null
}

const initialState: PatientSelectionState = {
  step: 'symptoms',
  selectedSymptomId: null,
  proceeding: false,
  error: null,
  recommendation: null,
  nearbyHospitals: [],
  loadingNearby: true,
  location: null,
}

async function resolveLocation(): Promise<PatientLocation> {
  try {
    return await beginLocationRequest()
  } catch (error: unknown) {
    if (error instanceof GeolocationError) {
      return {
        latitude: env.defaultLatitude,
        longitude: env.defaultLongitude,
      }
    }
    throw error
  }
}

export function usePatientSelection() {
  const hospitalApi = useMemo(() => createHospitalApi(), [])
  const [state, setState] = useState<PatientSelectionState>(initialState)

  useEffect(() => {
    let cancelled = false

    async function loadNearbyHospitals() {
      setState((prev) => ({ ...prev, loadingNearby: true, error: null }))

      try {
        const location = await resolveLocation()
        const nearby = await hospitalApi.getNearbyHospitals({
          latitude: location.latitude,
          longitude: location.longitude,
          limit: 10,
        })

        if (cancelled) return

        setState((prev) => ({
          ...prev,
          loadingNearby: false,
          location: {
            latitude: nearby.latitude,
            longitude: nearby.longitude,
          },
          nearbyHospitals: nearby.hospitals.map(mapNearbyToWaitTime),
        }))
      } catch (error) {
        if (cancelled) return
        const message = getApiErrorMessage(error, 'Could not load nearby hospitals.')
        setState((prev) => ({ ...prev, loadingNearby: false, error: message }))
      }
    }

    void loadNearbyHospitals()

    return () => {
      cancelled = true
    }
  }, [hospitalApi])

  const selectSymptom = useCallback((symptomId: string) => {
    setState((prev) => ({
      ...prev,
      selectedSymptomId: symptomId,
      error: null,
    }))
  }, [])

  const proceedToRecommendation = useCallback(async () => {
    const symptomId = state.selectedSymptomId
    const symptoms = symptomId ? getSymptomLabel(symptomId) : undefined

    if (!symptoms) {
      setState((prev) => ({
        ...prev,
        error: 'Please select a symptom to continue.',
      }))
      return
    }

    setState((prev) => ({ ...prev, proceeding: true, error: null }))

    try {
      const location = state.location ?? (await resolveLocation())
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
        location,
      }))
    } catch (error) {
      const message = getApiErrorMessage(error, 'Could not load hospital recommendation.')
      setState((prev) => ({ ...prev, proceeding: false, error: message }))
    }
  }, [hospitalApi, state.location, state.selectedSymptomId])

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
    selectSymptom,
    proceedToRecommendation,
    goBackToSymptoms,
  }
}
