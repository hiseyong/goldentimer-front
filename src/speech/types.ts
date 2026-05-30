export type SpeechErrorCode =
  | 'not-supported'
  | 'permission-denied'
  | 'no-speech'
  | 'network'
  | 'aborted'
  | 'unknown'

export type SpeechError = {
  code: SpeechErrorCode
  message: string
}

export interface SpeechRecognizer {
  isSupported(): boolean
  start(options?: { lang?: string }): void
  stop(): void
  onResult(callback: (text: string, isFinal: boolean) => void): void
  onError(callback: (error: SpeechError) => void): void
  dispose(): void
}

export interface SpeechSynthesizer {
  isSupported(): boolean
  speak(text: string, options?: { lang?: string }): Promise<void>
  cancel(): void
}

export type SpeechServices = {
  recognizer: SpeechRecognizer
  synthesizer: SpeechSynthesizer
}
