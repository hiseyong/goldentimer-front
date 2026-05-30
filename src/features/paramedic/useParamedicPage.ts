import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createAssignmentApi } from '../../api/assignment/assignmentApi'
import type { CreateAssignmentResponse } from '../../api/assignment/types'
import { ApiError, getApiErrorMessage } from '../../api/client'
import { createHospitalApi } from '../../api/hospital/hospitalApi'
import type { ErStatusItem } from '../../api/hospital/types'
import { env } from '../../config/env'
import { createSpeechServices } from '../../speech/createSpeechServices'
import {
  getSpeechRecognitionAvailability,
  getSpeechRecognitionUnavailableMessage,
  type SpeechRecognitionMode,
} from '../../speech/speechSupport'
import { loadSpeechVoices } from '../../speech/speechUtils'
import type { SpeechError } from '../../speech/types'
import {
  beginLocationRequest,
  GeolocationError,
  queryGeolocationPermission,
  trySilentLocation,
  type GeoLocation,
  type GeolocationPermissionState,
} from '../../utils/geolocation'

export type ParamedicFlowStatus =
  | 'idle'
  | 'listening'
  | 'transcribed'
  | 'submitting'
  | 'announcing'
  | 'error'

type ParamedicPageState = {
  status: ParamedicFlowStatus
  transcript: string
  interimTranscript: string
  erStatus: ErStatusItem[]
  erLoading: boolean
  assignment: CreateAssignmentResponse | null
  clientLocation: GeoLocation | null
  showRecommendationModal: boolean
  transportMessage: string | null
  patientId: string | null
  errorMessage: string | null
  locationPermission: GeolocationPermissionState | 'unknown'
  speechSupported: boolean
  speechMode: SpeechRecognitionMode
  speechHint: string | null
  ttsSupported: boolean
  isSpeaking: boolean
}

const ER_STATUS_POLL_MS = 45_000
const SPEECH_RECOGNITION_LANG = 'en-US'
const SPEECH_SYNTHESIS_LANG = 'en-US'

const SAMPLE_TRANSCRIPT =
  'Male, 62 years old, chest pain, alert consciousness, SpO2 91%.'

const initialState: ParamedicPageState = {
  status: 'idle',
  transcript: SAMPLE_TRANSCRIPT,
  interimTranscript: '',
  erStatus: [],
  erLoading: true,
  assignment: null,
  clientLocation: null,
  showRecommendationModal: false,
  transportMessage: null,
  patientId: null,
  errorMessage: null,
  locationPermission: 'unknown',
  speechSupported: true,
  speechMode: 'none',
  speechHint: null,
  ttsSupported: true,
  isSpeaking: false,
}

export function useParamedicPage() {
  const speechServices = useMemo(() => createSpeechServices(), [])
  const hospitalApi = useMemo(() => createHospitalApi(), [])
  const assignmentApi = useMemo(() => createAssignmentApi(), [])
  const finalTranscriptRef = useRef(SAMPLE_TRANSCRIPT)
  const erLocationRef = useRef({
    latitude: env.defaultLatitude,
    longitude: env.defaultLongitude,
  })

  const speechAvailability = useMemo(
    () => getSpeechRecognitionAvailability(env.sttApiUrl),
    [],
  )

  const [state, setState] = useState<ParamedicPageState>(() => {
    const availability = getSpeechRecognitionAvailability(env.sttApiUrl)
    return {
      ...initialState,
      speechSupported: speechServices.recognizer.isSupported(),
      speechMode: availability.mode,
      speechHint: availability.mode === 'none'
        ? getSpeechRecognitionUnavailableMessage(availability)
        : availability.mode === 'cloud'
          ? 'Record your report, then tap stop to transcribe.'
          : null,
      ttsSupported: speechServices.synthesizer.isSupported(),
    }
  })

  const loadErStatus = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setState((prev) => ({ ...prev, erLoading: true }))
    }
    try {
      const erStatus = await hospitalApi.getErStatus({
        latitude: erLocationRef.current.latitude,
        longitude: erLocationRef.current.longitude,
        limit: 5,
      })
      setState((prev) => ({ ...prev, erStatus, erLoading: false }))
    } catch {
      setState((prev) => ({ ...prev, erLoading: false }))
    }
  }, [hospitalApi])

  const refreshLocationPermission = useCallback(async () => {
    const permission = await queryGeolocationPermission()
    setState((prev) => ({ ...prev, locationPermission: permission }))
    return permission
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const [permission, silentLocation] = await Promise.all([
          queryGeolocationPermission(),
          trySilentLocation(),
        ])

        if (silentLocation) {
          erLocationRef.current = {
            latitude: silentLocation.latitude,
            longitude: silentLocation.longitude,
          }
        }

        const erStatus = await hospitalApi.getErStatus({
          latitude: erLocationRef.current.latitude,
          longitude: erLocationRef.current.longitude,
          limit: 5,
        })

        if (cancelled) return
        setState((prev) => ({
          ...prev,
          erStatus,
          erLoading: false,
          locationPermission: permission,
        }))
      } catch {
        if (cancelled) return
        setState((prev) => ({ ...prev, erLoading: false }))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [hospitalApi])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadErStatus()
    }, ER_STATUS_POLL_MS)

    return () => window.clearInterval(intervalId)
  }, [loadErStatus])

  useEffect(() => {
    if (speechServices.synthesizer.isSupported()) {
      void loadSpeechVoices()
    }
  }, [speechServices])

  useEffect(() => {
    const { recognizer } = speechServices

    recognizer.onResult((text, isFinal) => {
      if (isFinal) {
        finalTranscriptRef.current = `${finalTranscriptRef.current} ${text}`.trim()
        setState((prev) => ({
          ...prev,
          transcript: finalTranscriptRef.current,
          interimTranscript: '',
          status: 'transcribed',
        }))
      } else {
        setState((prev) => ({
          ...prev,
          interimTranscript: text,
          status: 'listening',
        }))
      }
    })

    recognizer.onError((error: SpeechError) => {
      if (error.code === 'aborted') return
      setState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: error.message,
      }))
    })

    return () => {
      recognizer.dispose()
      speechServices.synthesizer.cancel()
    }
  }, [speechServices])

  const startListening = useCallback(() => {
    if (!speechServices.recognizer.isSupported()) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: getSpeechRecognitionUnavailableMessage(speechAvailability),
      }))
      return
    }

    finalTranscriptRef.current = state.transcript
    speechServices.synthesizer.cancel()

    const interimTranscript =
      speechAvailability.mode === 'cloud' ? 'Recording… tap stop when finished.' : ''

    setState((prev) => ({
      ...prev,
      status: 'listening',
      interimTranscript,
      showRecommendationModal: false,
      assignment: null,
      clientLocation: null,
      errorMessage: null,
    }))

    speechServices.recognizer.start({ lang: SPEECH_RECOGNITION_LANG })
  }, [speechAvailability, speechServices, state.transcript])

  const stopListening = useCallback(() => {
    speechServices.recognizer.stop()

    if (speechAvailability.mode === 'cloud') {
      setState((prev) => ({
        ...prev,
        status: 'listening',
        interimTranscript: 'Transcribing audio…',
      }))
      return
    }

    setState((prev) => ({
      ...prev,
      status: 'transcribed',
      transcript: finalTranscriptRef.current || prev.interimTranscript,
      interimTranscript: '',
    }))
  }, [speechAvailability.mode, speechServices])

  const speakAssignmentMessage = useCallback(
    async (message: string) => {
      const text = message.trim()
      if (!text || !speechServices.synthesizer.isSupported()) {
        return false
      }

      setState((prev) => ({ ...prev, isSpeaking: true }))
      try {
        await speechServices.synthesizer.speak(text, {
          lang: SPEECH_SYNTHESIS_LANG,
        })
        return true
      } catch {
        return false
      } finally {
        setState((prev) => ({ ...prev, isSpeaking: false }))
      }
    },
    [speechServices],
  )

  const setTranscript = useCallback((transcript: string) => {
    finalTranscriptRef.current = transcript
    setState((prev) => ({
      ...prev,
      transcript,
      status: transcript.trim() ? 'transcribed' : 'idle',
    }))
  }, [])

  const requestRecommendations = useCallback(async () => {
    const text = state.transcript.trim()
    if (!text) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: 'Please enter or speak the patient condition.',
      }))
      return
    }

    const locationPromise = beginLocationRequest()

    setState((prev) => ({
      ...prev,
      status: 'submitting',
      errorMessage: null,
      showRecommendationModal: false,
    }))

    try {
      const clientLocation = await locationPromise
      void refreshLocationPermission()

      erLocationRef.current = {
        latitude: clientLocation.latitude,
        longitude: clientLocation.longitude,
      }
      void loadErStatus()

      const response = await assignmentApi.createAssignment({
        transcript: text,
        client_location: clientLocation,
        paramedic_id: env.paramedicId,
      })

      setState((prev) => ({
        ...prev,
        status: 'announcing',
        assignment: response,
        clientLocation: clientLocation,
        showRecommendationModal: true,
      }))

      if (speechServices.synthesizer.isSupported() && response.message.trim()) {
        await speakAssignmentMessage(response.message)
      }

      setState((prev) => ({
        ...prev,
        status: 'transcribed',
      }))
    } catch (error) {
      let message: string
      if (error instanceof GeolocationError) {
        message = error.message
        void refreshLocationPermission()
      } else if (error instanceof ApiError) {
        message = getApiErrorMessage(
          error,
          'Could not load hospital recommendations.',
        )
      } else {
        message = 'Could not load recommendations.'
      }
      setState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: message,
      }))
    }
  }, [
    assignmentApi,
    loadErStatus,
    refreshLocationPermission,
    speechServices,
    speakAssignmentMessage,
    state.transcript,
  ])

  const closeRecommendationModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showRecommendationModal: false,
    }))
  }, [])

  const openRecommendationModal = useCallback(() => {
    if (state.assignment) {
      setState((prev) => ({ ...prev, showRecommendationModal: true }))
    }
  }, [state.assignment])

  const transportToFirst = useCallback(() => {
    const assignment = state.assignment
    if (!assignment) return

    setState((prev) => ({
      ...prev,
      showRecommendationModal: false,
      transportMessage: `Transport confirmed to ${assignment.hospital.hospital_name}. Patient ID: ${assignment.emergency_case.patient_id}`,
      patientId: assignment.emergency_case.patient_id,
    }))
  }, [state.assignment])

  const dismissError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: prev.transcript.trim() ? 'transcribed' : 'idle',
      errorMessage: null,
    }))
  }, [])

  const displayTranscript =
    state.status === 'listening'
      ? state.transcript +
        (state.interimTranscript
          ? (state.transcript ? ' ' : '') + state.interimTranscript
          : '')
      : state.transcript

  return {
    ...state,
    displayTranscript,
    startListening,
    stopListening,
    setTranscript,
    requestRecommendations,
    closeRecommendationModal,
    openRecommendationModal,
    transportToFirst,
    dismissError,
    refreshLocationPermission,
    reloadErStatus: () => loadErStatus(true),
    speakAssignmentMessage,
  }
}
