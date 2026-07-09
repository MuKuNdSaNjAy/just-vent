import { useState, useRef, useCallback, useEffect } from 'react'

// Convert a Blob to a base64 string (safe for large files)
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Send base64 audio to Whisper (dev-server or Firebase callable)
async function whisperTranscribe(base64, language) {
  if (import.meta.env.DEV) {
    const res = await fetch('http://localhost:3001/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio: base64, language }),
    })
    if (!res.ok) {
      // Non-JSON error responses (e.g. 404 HTML) would throw on .json()
      let msg = `Transcription server error (${res.status})`
      try { const d = await res.json(); msg = d.error ?? msg } catch { /* ignore */ }
      throw new Error(msg)
    }
    const data = await res.json()
    if (!data.transcript) throw new Error(data.error ?? 'No transcript returned.')
    return data.transcript
  }
  // Production → Firebase callable
  const { httpsCallable } = await import('firebase/functions')
  const { functions }     = await import('../services/firebase')
  const fn = httpsCallable(functions, 'transcribeAudio')
  const { data } = await fn({ audio: base64, language })
  if (!data?.transcript) throw new Error('No transcript returned.')
  return data.transcript
}

const MAX_SECS = 120

export function useAudioRecorder({ language = 'en', onTranscript, onError }) {
  const [isRecording, setIsRecording]   = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [elapsed, setElapsed]           = useState(0)

  const mediaRecorderRef = useRef(null)
  const chunksRef        = useRef([])
  const streamRef        = useRef(null)
  const tickRef          = useRef(null)
  const startTimeRef     = useRef(null)

  // Keep callback refs stable
  const langRef         = useRef(language)
  const onTranscriptRef = useRef(onTranscript)
  const onErrorRef      = useRef(onError)
  useEffect(() => { langRef.current         = language     }, [language])
  useEffect(() => { onTranscriptRef.current = onTranscript }, [onTranscript])
  useEffect(() => { onErrorRef.current      = onError      }, [onError])

  const stopRecording = useCallback(() => {
    const mr = mediaRecorderRef.current
    if (!mr || mr.state === 'inactive') return

    clearInterval(tickRef.current)

    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })

      // Release mic immediately
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current        = null
      mediaRecorderRef.current = null
      chunksRef.current        = []
      setIsRecording(false)
      setElapsed(0)

      if (blob.size < 500) return // below this, it's silence/noise, not speech

      setIsProcessing(true)
      try {
        const base64    = await blobToBase64(blob)
        const transcript = await whisperTranscribe(base64, langRef.current)
        if (transcript?.trim()) onTranscriptRef.current?.(transcript.trim())
      } catch (err) {
        onErrorRef.current?.(err.message ?? 'Failed to transcribe audio.')
      } finally {
        setIsProcessing(false)
      }
    }

    mr.stop()
  }, [])

  const startRecording = useCallback(async () => {
    if (isRecording || isProcessing) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const mr = new MediaRecorder(stream, { mimeType })
      chunksRef.current      = []
      mr.ondataavailable     = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mediaRecorderRef.current = mr
      mr.start(250) // collect a chunk every 250 ms

      startTimeRef.current = Date.now()
      setElapsed(0)
      setIsRecording(true)

      tickRef.current = setInterval(() => {
        const s = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setElapsed(s)
        if (s >= MAX_SECS) {
          clearInterval(tickRef.current)
          stopRecording() // auto-stop → triggers onstop → Whisper
        }
      }, 1000)
    } catch (err) {
      const msg =
        err.name === 'NotAllowedError'
          ? 'Microphone access denied. Click the 🔒 icon in the address bar → allow microphone.'
          : err.name === 'NotFoundError'
          ? 'No microphone found. Plug one in and try again.'
          : `Could not start recording: ${err.message}`
      onErrorRef.current?.(msg)
    }
  }, [isRecording, isProcessing, stopRecording])

  // Cleanup on unmount
  useEffect(() => () => {
    clearInterval(tickRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [])

  return { isRecording, isProcessing, elapsed, startRecording, stopRecording }
}
