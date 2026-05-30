import type { SpeechError, SpeechRecognizer } from './types'
import { isMediaRecorderSttAvailable } from './speechSupport'

function pickRecordingMimeType(): string | undefined {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ]

  return candidates.find((type) => MediaRecorder.isTypeSupported(type))
}

export function createMediaRecorderSttRecognizer(apiUrl: string): SpeechRecognizer {
  let mediaStream: MediaStream | null = null
  let mediaRecorder: MediaRecorder | null = null
  let chunks: Blob[] = []
  let active = false
  let recordingLang = 'en-US'
  let resultCallback: ((text: string, isFinal: boolean) => void) | null = null
  let errorCallback: ((error: SpeechError) => void) | null = null

  const releaseStream = () => {
    mediaStream?.getTracks().forEach((track) => track.stop())
    mediaStream = null
    mediaRecorder = null
    chunks = []
  }

  const transcribeRecording = async (blob: Blob) => {
    if (!blob.size) {
      errorCallback?.({
        code: 'no-speech',
        message: 'No audio recorded. Please try again.',
      })
      return
    }

    const language = recordingLang.split('-')[0] || 'en'
    const formData = new FormData()
    formData.append('file', blob, 'recording.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', language)
    formData.append('response_format', 'json')

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const detail = await response.text().catch(() => '')
        throw new Error(detail || `Transcription failed (${response.status})`)
      }

      const payload = (await response.json()) as { text?: string }
      const text = payload.text?.trim()
      if (!text) {
        errorCallback?.({
          code: 'no-speech',
          message: 'No speech detected. Please try again.',
        })
        return
      }

      resultCallback?.(text, true)
    } catch (error) {
      errorCallback?.({
        code: 'network',
        message:
          error instanceof Error
            ? error.message
            : 'Could not transcribe audio. Check your connection and try again.',
      })
    }
  }

  return {
    isSupported() {
      return isMediaRecorderSttAvailable() && apiUrl.length > 0
    },

    start(options) {
      if (!this.isSupported()) {
        errorCallback?.({
          code: 'not-supported',
          message: 'Cloud speech recognition is not configured.',
        })
        return
      }

      recordingLang = options?.lang ?? 'en-US'
      active = true
      chunks = []

      void navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          if (!active) {
            stream.getTracks().forEach((track) => track.stop())
            return
          }

          mediaStream = stream
          const mimeType = pickRecordingMimeType()
          mediaRecorder = mimeType
            ? new MediaRecorder(stream, { mimeType })
            : new MediaRecorder(stream)

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data)
            }
          }

          mediaRecorder.onerror = () => {
            errorCallback?.({
              code: 'unknown',
              message: 'Audio recording failed.',
            })
          }

          mediaRecorder.start(250)
        })
        .catch(() => {
          active = false
          errorCallback?.({
            code: 'permission-denied',
            message: 'Microphone permission is required. Allow access in browser settings.',
          })
        })
    },

    stop() {
      active = false

      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        releaseStream()
        return
      }

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder?.mimeType || 'audio/webm'
        const blob = new Blob(chunks, { type: mimeType })
        releaseStream()
        void transcribeRecording(blob)
      }

      mediaRecorder.stop()
    },

    onResult(callback) {
      resultCallback = callback
    },

    onError(callback) {
      errorCallback = callback
    },

    dispose() {
      active = false
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.onstop = null
        mediaRecorder.stop()
      }
      releaseStream()
      resultCallback = null
      errorCallback = null
    },
  }
}
