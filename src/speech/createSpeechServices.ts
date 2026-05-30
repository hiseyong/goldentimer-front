import { env } from '../config/env'
import { createAdaptiveSpeechRecognizer } from './adaptiveSpeechRecognizer'
import { createMediaRecorderSttRecognizer } from './mediaRecorderSttProvider'
import type { SpeechServices } from './types'
import {
  createWebSpeechRecognizer,
  createWebSpeechSynthesizer,
} from './webSpeechProvider'

export function createSpeechServices(): SpeechServices {
  const webSpeech = createWebSpeechRecognizer()
  const cloudStt = env.sttApiUrl
    ? createMediaRecorderSttRecognizer(env.sttApiUrl)
    : null

  return {
    recognizer: createAdaptiveSpeechRecognizer(
      webSpeech,
      cloudStt,
      env.sttApiUrl,
    ),
    synthesizer: createWebSpeechSynthesizer(),
  }
}
