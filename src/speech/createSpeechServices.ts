import type { SpeechServices } from './types'
import {
  createWebSpeechRecognizer,
  createWebSpeechSynthesizer,
} from './webSpeechProvider'

export function createSpeechServices(): SpeechServices {
  return {
    recognizer: createWebSpeechRecognizer(),
    synthesizer: createWebSpeechSynthesizer(),
  }
}
