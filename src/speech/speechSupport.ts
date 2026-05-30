export type SpeechRecognitionMode = 'webspeech' | 'cloud' | 'none'

export type SpeechRecognitionAvailability = {
  mode: SpeechRecognitionMode
  secureContext: boolean
  webSpeechApi: boolean
  mediaRecorder: boolean
  cloudSttConfigured: boolean
}

export function isWebSpeechRecognitionApiAvailable(): boolean {
  if (typeof window === 'undefined') return false
  const win = window as Window & {
    SpeechRecognition?: unknown
    webkitSpeechRecognition?: unknown
  }
  return Boolean(win.SpeechRecognition ?? win.webkitSpeechRecognition)
}

export function isMediaRecorderSttAvailable(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== 'undefined'
  )
}

export function getSpeechRecognitionAvailability(
  cloudSttApiUrl: string | null,
): SpeechRecognitionAvailability {
  const secureContext =
    typeof window !== 'undefined' ? window.isSecureContext : false
  const webSpeechApi = isWebSpeechRecognitionApiAvailable()
  const mediaRecorder = isMediaRecorderSttAvailable()
  const cloudSttConfigured = Boolean(cloudSttApiUrl)

  let mode: SpeechRecognitionMode = 'none'
  if (secureContext && webSpeechApi) {
    mode = 'webspeech'
  } else if (secureContext && mediaRecorder && cloudSttConfigured) {
    mode = 'cloud'
  }

  return {
    mode,
    secureContext,
    webSpeechApi,
    mediaRecorder,
    cloudSttConfigured,
  }
}

export function getSpeechRecognitionUnavailableMessage(
  availability: SpeechRecognitionAvailability,
): string {
  if (!availability.secureContext) {
    return 'Voice input requires HTTPS (or localhost). Open the app via https:// or http://localhost.'
  }

  if (availability.mode === 'none' && !availability.cloudSttConfigured) {
    if (!availability.webSpeechApi) {
      return 'Use Chrome or Edge for live voice input, or set OPENAI_API_KEY in .env for cloud STT in dev.'
    }
    return 'Speech recognition is not available in this browser.'
  }

  if (availability.mode === 'none') {
    return 'Speech recognition is not available. Check microphone permissions.'
  }

  return 'Speech recognition unavailable. Type the report below.'
}
