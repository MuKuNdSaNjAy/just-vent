import { useState, useCallback } from 'react'
import { sendVent } from '../services/ventService'
import { DEFAULT_LANGUAGE } from '../utils/languages'
import { incrementSessionCount } from './useSessionCount'

const CRISIS_KEYWORDS = [
  // suicidal ideation
  'suicide', 'suicidal', 'kill myself', 'end it all', 'end my life',
  "can't go on", 'cant go on', 'no reason to live', 'want to die',
  'better off dead', 'better off without me', 'wish i was dead',
  'not worth living', 'ready to die', 'planning to die',
  // self-harm
  'self-harm', 'self harm', 'selfharm', 'cut myself', 'hurt myself',
  'harm myself', 'injure myself', 'burning myself',
  // hopelessness signals
  'nothing matters anymore', 'no point in living', 'give up on life',
  'everyone would be better off', 'disappear forever', 'goodbye forever',
]

function detectCrisis(text) {
  const lower = text.toLowerCase()
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw))
}

export function useVentState() {
  const [messages, setMessages]     = useState([])
  const [ventText, setVentText]     = useState('')
  const [language, setLanguage]     = useState(DEFAULT_LANGUAGE)
  const [isLoading, setIsLoading]   = useState(false)
  const [error, setError]           = useState(null)
  const [mood, setMood]             = useState(null)   // { emoji, label }
  const [tone, setTone]             = useState('listen') // 'listen' | 'warm' | 'perspective'
  const [showCrisis, setShowCrisis] = useState(false)
  const [isDone, setIsDone]         = useState(false)

  const appendTranscript = useCallback((transcript) => {
    setVentText((prev) => (prev ? `${prev} ${transcript}` : transcript))
  }, [])

  const submitVent = useCallback(async (overrideText = null) => {
    const trimmed = (overrideText ?? ventText).trim()
    if (!trimmed) return

    if (detectCrisis(trimmed)) setShowCrisis(true)

    const userMsg = { role: 'user', text: trimmed, time: Date.now() }
    const history = [...messages, userMsg]

    setMessages(history)
    if (!overrideText) setVentText('')
    setIsLoading(true)
    setError(null)

    try {
      const aiText = await sendVent(history, language.code, mood?.label ?? null, tone)
      setMessages([...history, { role: 'ai', text: aiText, time: Date.now() }])
    } catch (err) {
      setError(err.message ?? 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }, [ventText, language, messages, mood, tone])

  const requestAdvice = useCallback(async () => {
    const history = [...messages, { role: 'user', text: '__advice_request__' }]
    setMessages([...messages, { role: 'user', text: '💭 I\'d like some perspective on this.', time: Date.now() }])
    setIsLoading(true)
    setError(null)
    try {
      const aiText = await sendVent(history, language.code, mood?.label ?? null, 'perspective')
      setMessages((prev) => [...prev, { role: 'ai', text: aiText, time: Date.now() }])
    } catch (err) {
      setError(err.message ?? 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }, [messages, language, mood])

  const finishSession = useCallback(async () => {
    setIsDone(true)
    incrementSessionCount()
    const history = [...messages, { role: 'user', text: '__session_end__' }]
    setIsLoading(true)
    try {
      const aiText = await sendVent(history, language.code, mood?.label ?? null, 'closing')
      setMessages((prev) => [...prev, { role: 'ai', text: aiText, time: Date.now() }])
    } catch {
      // silently ignore
    } finally {
      setIsLoading(false)
    }
  }, [messages, language, mood])

  const clearAll = useCallback(() => {
    setMessages([])
    setVentText('')
    setError(null)
    setMood(null)
    setTone('listen')
    setShowCrisis(false)
    setIsDone(false)
  }, [])

  return {
    messages, ventText, setVentText,
    language, setLanguage,
    isLoading, error,
    mood, setMood,
    tone, setTone,
    showCrisis, setShowCrisis,
    isDone,
    appendTranscript, submitVent, requestAdvice, finishSession, clearAll,
  }
}
