import {
  createWebSpeechRecognizer,
  createWebSpeechSynthesizer,
} from './webSpeechProvider'
import type { SpeechServices } from './types'

export function createSpeechServices(): SpeechServices {
  return {
    recognizer: createWebSpeechRecognizer(),
    synthesizer: createWebSpeechSynthesizer(),
  }
}
