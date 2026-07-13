/**
 * Supported languages for the vent input and AI response.
 * `speechCode` is a BCP-47 tag (e.g. 'hi-IN'); MicButton strips it down to the
 * base language code before passing it to Whisper for voice transcription.
 */
export const LANGUAGES = [
  { code: 'en', label: 'English',    speechCode: 'en-IN' },
  { code: 'hi', label: 'हिंदी',       speechCode: 'hi-IN' },
  { code: 'bn', label: 'বাংলা',       speechCode: 'bn-IN' },
  { code: 'mr', label: 'मराठी',       speechCode: 'mr-IN' },
  { code: 'ta', label: 'தமிழ்',       speechCode: 'ta-IN' },
  { code: 'te', label: 'తెలుగు',      speechCode: 'te-IN' },
  { code: 'kn', label: 'ಕನ್ನಡ',       speechCode: 'kn-IN' },
  { code: 'ml', label: 'മലയാളം',      speechCode: 'ml-IN' },
]

export const DEFAULT_LANGUAGE = LANGUAGES[0]

export function getLanguageByCode(code) {
  return LANGUAGES.find((l) => l.code === code) ?? DEFAULT_LANGUAGE
}
