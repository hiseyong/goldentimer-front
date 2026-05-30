import type {
  SpeechError,
  SpeechErrorCode,
  SpeechRecognizer,
  SpeechSynthesizer,
} from './types'

type SpeechRecognitionConstructor = new () => SpeechRecognition

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  const win = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null
}

function mapRecognitionError(event: SpeechRecognitionErrorEvent): SpeechError {
  const codeMap: Record<string, SpeechErrorCode> = {
    'not-allowed': 'permission-denied',
    'service-not-allowed': 'permission-denied',
    'no-speech': 'no-speech',
    network: 'network',
    aborted: 'aborted',
  }
  const code = codeMap[event.error] ?? 'unknown'
  const messages: Record<SpeechErrorCode, string> = {
    'not-supported': 'Speech recognition is not supported in this browser.',
    'permission-denied': 'Microphone permission is required. Allow access in browser settings.',
    'no-speech': 'No speech detected. Please try again.',
    network: 'Speech recognition failed due to a network error.',
    aborted: 'Speech recognition was aborted.',
    unknown: 'An error occurred during speech recognition.',
  }
  return { code, message: messages[code] }
}

export function createWebSpeechRecognizer(): SpeechRecognizer {
  const RecognitionCtor = getSpeechRecognitionConstructor()
  let recognition: SpeechRecognition | null = null
  let resultCallback: ((text: string, isFinal: boolean) => void) | null = null
  let errorCallback: ((error: SpeechError) => void) | null = null

  const ensureRecognition = (): SpeechRecognition | null => {
    if (!RecognitionCtor) return null
    if (!recognition) {
      recognition = new RecognitionCtor()
      recognition.continuous = true
      recognition.interimResults = true

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = ''
        let final = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0]?.transcript ?? ''
          if (result.isFinal) {
            final += transcript
          } else {
            interim += transcript
          }
        }

        const text = (final || interim).trim()
        if (text && resultCallback) {
          resultCallback(text, Boolean(final))
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        errorCallback?.(mapRecognitionError(event))
      }
    }
    return recognition
  }

  return {
    isSupported() {
      return RecognitionCtor !== null
    },

    start(options) {
      const instance = ensureRecognition()
      if (!instance) {
        errorCallback?.({
          code: 'not-supported',
          message: 'Speech recognition is not supported in this browser.',
        })
        return
      }
      instance.lang = options?.lang ?? 'en-US'
      try {
        instance.start()
      } catch {
        instance.stop()
        instance.start()
      }
    },

    stop() {
      recognition?.stop()
    },

    onResult(callback) {
      resultCallback = callback
    },

    onError(callback) {
      errorCallback = callback
    },

    dispose() {
      recognition?.abort()
      recognition = null
      resultCallback = null
      errorCallback = null
    },
  }
}

export function createWebSpeechSynthesizer(): SpeechSynthesizer {
  return {
    isSupported() {
      return 'speechSynthesis' in window
    },

    speak(text, options) {
      return new Promise((resolve, reject) => {
        if (!this.isSupported()) {
          reject(new Error('Speech synthesis is not supported.'))
          return
        }

        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = options?.lang ?? 'en-US'
        utterance.rate = 0.95

        utterance.onend = () => resolve()
        utterance.onerror = () =>
          reject(new Error('Failed to play voice guidance.'))

        window.speechSynthesis.speak(utterance)
      })
    },

    cancel() {
      window.speechSynthesis.cancel()
    },
  }
}
