import type {
  SpeechError,
  SpeechErrorCode,
  SpeechRecognizer,
  SpeechSynthesizer,
} from './types'
import {
  getBestTranscript,
  loadSpeechVoices,
  normalizeSpeechText,
  pickVoiceForLang,
} from './speechUtils'

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

function restartRecognition(instance: SpeechRecognition) {
  window.setTimeout(() => {
    try {
      instance.start()
    } catch {
      // Already running or stopping; onend will retry if still active.
    }
  }, 150)
}

export function createWebSpeechRecognizer(): SpeechRecognizer {
  const RecognitionCtor = getSpeechRecognitionConstructor()
  let recognition: SpeechRecognition | null = null
  let resultCallback: ((text: string, isFinal: boolean) => void) | null = null
  let errorCallback: ((error: SpeechError) => void) | null = null
  let active = false

  const ensureRecognition = (): SpeechRecognition | null => {
    if (!RecognitionCtor) return null
    if (!recognition) {
      recognition = new RecognitionCtor()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.maxAlternatives = 3

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = ''
        let final = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = getBestTranscript(result)
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
        if (!active) return

        if (event.error === 'no-speech' || event.error === 'aborted') {
          if (recognition) {
            restartRecognition(recognition)
          }
          return
        }

        errorCallback?.(mapRecognitionError(event))
      }

      recognition.onend = () => {
        if (active && recognition) {
          restartRecognition(recognition)
        }
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

      active = true
      instance.lang = options?.lang ?? 'en-US'
      try {
        instance.start()
      } catch {
        instance.stop()
        restartRecognition(instance)
      }
    },

    stop() {
      active = false
      recognition?.stop()
    },

    onResult(callback) {
      resultCallback = callback
    },

    onError(callback) {
      errorCallback = callback
    },

    dispose() {
      active = false
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

    async speak(text, options) {
      if (!this.isSupported()) {
        throw new Error('Speech synthesis is not supported.')
      }

      const normalizedText = normalizeSpeechText(text)
      if (!normalizedText) {
        return
      }

      const lang = options?.lang ?? 'en-US'
      const voices = await loadSpeechVoices()
      const voice = pickVoiceForLang(voices, lang)

      window.speechSynthesis.cancel()

      return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(normalizedText)
        utterance.lang = lang
        utterance.rate = 0.92
        if (voice) {
          utterance.voice = voice
        }

        utterance.onend = () => {
          window.clearInterval(resumeIntervalId)
          resolve()
        }

        utterance.onerror = (event) => {
          window.clearInterval(resumeIntervalId)
          if (event.error === 'interrupted' || event.error === 'canceled') {
            resolve()
            return
          }
          reject(new Error('Failed to play voice guidance.'))
        }

        // Chrome can pause long utterances unless synthesis is resumed periodically.
        const resumeIntervalId = window.setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            window.clearInterval(resumeIntervalId)
            return
          }
          window.speechSynthesis.pause()
          window.speechSynthesis.resume()
        }, 10_000)

        window.speechSynthesis.speak(utterance)
      })
    },

    cancel() {
      window.speechSynthesis.cancel()
    },
  }
}
