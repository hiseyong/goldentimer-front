export function normalizeSpeechText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

export function loadSpeechVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices()
    if (existing.length > 0) {
      resolve(existing)
      return
    }

    const onVoicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
      resolve(window.speechSynthesis.getVoices())
    }

    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged)

    window.setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
      resolve(window.speechSynthesis.getVoices())
    }, 1000)
  })
}

const PREFERRED_ENGLISH_VOICE_HINTS = [
  'google us english',
  'microsoft zira',
  'microsoft david',
  'samantha',
  'daniel',
  'karen',
  'moira',
]

function voiceQualityScore(voice: SpeechSynthesisVoice, langPrefix: string): number {
  const name = voice.name.toLowerCase()
  const lang = voice.lang.toLowerCase()
  let score = 0

  if (lang === langPrefix || lang.startsWith(`${langPrefix}-`)) {
    score += 10
  } else if (lang.startsWith(langPrefix)) {
    score += 5
  }

  if (voice.localService) score += 2
  if (!name.includes('compact')) score += 1

  for (let i = 0; i < PREFERRED_ENGLISH_VOICE_HINTS.length; i++) {
    if (name.includes(PREFERRED_ENGLISH_VOICE_HINTS[i]!)) {
      score += 20 - i
      break
    }
  }

  return score
}

export function pickVoiceForLang(
  voices: SpeechSynthesisVoice[],
  lang: string,
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null

  const normalized = lang.toLowerCase()
  const prefix = normalized.split('-')[0] ?? normalized

  const candidates = voices.filter(
    (voice) =>
      voice.lang.toLowerCase() === normalized ||
      voice.lang.toLowerCase().startsWith(`${prefix}-`) ||
      voice.lang.toLowerCase().startsWith(prefix),
  )

  const pool = candidates.length > 0 ? candidates : voices

  return pool.reduce((best, voice) => {
    const bestScore = voiceQualityScore(best, prefix)
    const voiceScore = voiceQualityScore(voice, prefix)
    return voiceScore > bestScore ? voice : best
  })
}

export function getBestTranscript(result: SpeechRecognitionResult): string {
  if (result.length === 0) return ''

  let bestTranscript = result[0]?.transcript ?? ''
  let bestConfidence = result[0]?.confidence ?? 0

  for (let i = 1; i < result.length; i++) {
    const alternative = result[i]
    if (!alternative) continue
    if (alternative.confidence >= bestConfidence) {
      bestTranscript = alternative.transcript
      bestConfidence = alternative.confidence
    }
  }

  return bestTranscript
}
