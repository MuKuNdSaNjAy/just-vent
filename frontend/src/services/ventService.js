import { httpsCallable } from 'firebase/functions'
import { functions } from './firebase'

export async function sendVent(messages, languageCode = 'en', mood = null, tone = 'listen') {
  if (import.meta.env.DEV) {
    const res = await fetch('http://localhost:3001/vent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, languageCode, mood, tone }),
    })
    const data = await res.json()
    if (!data.response) throw new Error(data.error ?? 'No response received.')
    return data.response
  }

  const ventResponse = httpsCallable(functions, 'ventResponse')
  const { data } = await ventResponse({ messages, languageCode, mood, tone })
  if (!data?.response) throw new Error('No response received from the AI.')
  return data.response
}
