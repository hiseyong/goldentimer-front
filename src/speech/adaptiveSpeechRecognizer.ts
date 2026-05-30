import type { SpeechRecognizer } from './types'
import {
  getSpeechRecognitionAvailability,
  type SpeechRecognitionMode,
} from './speechSupport'

export function createAdaptiveSpeechRecognizer(
  webSpeech: SpeechRecognizer,
  cloudStt: SpeechRecognizer | null,
  cloudSttApiUrl: string | null,
): SpeechRecognizer & { getMode(): SpeechRecognitionMode } {
  let activeRecognizer: SpeechRecognizer | null = null
  let resultCallback: ((text: string, isFinal: boolean) => void) | null = null
  let errorCallback: ((error: import('./types').SpeechError) => void) | null = null

  const getAvailability = () =>
    getSpeechRecognitionAvailability(cloudSttApiUrl)

  const pickRecognizer = (): SpeechRecognizer | null => {
    const availability = getAvailability()
    if (availability.mode === 'webspeech' && webSpeech.isSupported()) {
      return webSpeech
    }
    if (availability.mode === 'cloud' && cloudStt?.isSupported()) {
      return cloudStt
    }
    return null
  }

  const wireCallbacks = (recognizer: SpeechRecognizer) => {
    if (resultCallback) {
      recognizer.onResult(resultCallback)
    }
    if (errorCallback) {
      recognizer.onError(errorCallback)
    }
  }

  return {
    getMode() {
      return getAvailability().mode
    },

    isSupported() {
      return getAvailability().mode !== 'none'
    },

    start(options) {
      const recognizer = pickRecognizer()
      if (!recognizer) {
        errorCallback?.({
          code: 'not-supported',
          message:
            'Speech recognition is not available. Use Chrome/Edge on HTTPS, or configure cloud STT.',
        })
        return
      }

      activeRecognizer = recognizer
      wireCallbacks(recognizer)
      recognizer.start(options)
    },

    stop() {
      activeRecognizer?.stop()
      activeRecognizer = null
    },

    onResult(callback) {
      resultCallback = callback
      webSpeech.onResult(callback)
      cloudStt?.onResult(callback)
    },

    onError(callback) {
      errorCallback = callback
      webSpeech.onError(callback)
      cloudStt?.onError(callback)
    },

    dispose() {
      activeRecognizer = null
      webSpeech.dispose()
      cloudStt?.dispose()
      resultCallback = null
      errorCallback = null
    },
  }
}
