import { useState, useRef, useCallback, useEffect } from 'react'

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition

const MAX_DURATION_MS = 120_000 // 2 minutes — matches the voice-recorder cap in useAudioRecorder

function friendlyError(code) {
  switch (code) {
    case 'not-allowed':
    case 'permission-denied':
      return 'Microphone access denied. Click the 🔒 icon in the address bar → allow microphone.'
    case 'network':
      return 'Speech recognition needs Google servers. Check your internet connection or try typing instead.'
    case 'service-not-allowed':
      return 'Speech service not available in this browser. Try Chrome or Edge.'
    case 'audio-capture':
      return 'No microphone found. Plug one in and try again.'
    case 'aborted':
    case 'no-speech':
      return null // harmless — don't surface
    default:
      return `Microphone error: ${code}`
  }
}

export function useSpeechRecognition({ lang = 'en-IN', onTranscript, onError }) {
  const [isListening, setIsListening]   = useState(false)
  const [elapsed, setElapsed]           = useState(0)
  const [permissionState, setPermState] = useState('unknown') // 'unknown'|'granted'|'denied'

  const activeRef      = useRef(false)
  const recognitionRef = useRef(null)
  const startTimeRef   = useRef(null)
  const autoStopRef    = useRef(null)
  const tickRef        = useRef(null)
  const restartRef     = useRef(null)

  const onTranscriptRef = useRef(onTranscript)
  const onErrorRef      = useRef(onError)
  const langRef         = useRef(lang)
  useEffect(() => { onTranscriptRef.current = onTranscript }, [onTranscript])
  useEffect(() => { onErrorRef.current      = onError      }, [onError])
  useEffect(() => { langRef.current         = lang         }, [lang])

  const isSupported = Boolean(SpeechRecognition)

  const stopListeningRef = useRef(null)

  // Query current permission state from the Permissions API (best-effort)
  useEffect(() => {
    if (!navigator.permissions) return
    navigator.permissions.query({ name: 'microphone' }).then((status) => {
      setPermState(status.state)
      status.onchange = () => setPermState(status.state)
    }).catch(() => {})
  }, [])

  function clearTimers() {
    clearTimeout(autoStopRef.current)
    clearTimeout(restartRef.current)
    clearInterval(tickRef.current)
  }

  function spawnRecognition() {
    if (!activeRef.current) return

    const r = new SpeechRecognition()
    r.lang            = langRef.current
    r.continuous      = true
    r.interimResults  = false
    r.maxAlternatives = 1

    r.onresult = (event) => {
      const transcript = event.results[event.resultIndex][0].transcript
      onTranscriptRef.current?.(transcript)
    }

    r.onerror = (event) => {
      const msg = friendlyError(event.error)
      if (!msg) return // harmless — let onend restart
      onErrorRef.current?.(msg)
      stopListeningRef.current?.()
    }

    r.onend = () => {
      if (!activeRef.current) return
      restartRef.current = setTimeout(spawnRecognition, 200)
    }

    recognitionRef.current = r
    try {
      r.start()
    } catch {
      restartRef.current = setTimeout(spawnRecognition, 300)
    }
  }

  const stopListening = useCallback(() => {
    activeRef.current = false
    clearTimers()
    try { recognitionRef.current?.abort() } catch { /* already stopped */ }
    recognitionRef.current = null
    setIsListening(false)
    setElapsed(0)
  }, [])

  useEffect(() => { stopListeningRef.current = stopListening }, [stopListening])

  const startListening = useCallback(async () => {
    if (!isSupported) {
      onErrorRef.current?.(
        'Speech recognition is not supported in this browser. Try Chrome or Edge.'
      )
      return
    }
    if (activeRef.current) return

    // Explicitly request mic permission so Chrome shows the prompt.
    // This also catches "denied" before we even start the recogniser.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop()) // release — SpeechRecognition reacquires
      setPermState('granted')
    } catch {
      setPermState('denied')
      onErrorRef.current?.(
        'Microphone access denied. Click the 🔒 icon in the address bar → allow microphone, then refresh.'
      )
      return
    }

    activeRef.current    = true
    startTimeRef.current = Date.now()
    setElapsed(0)
    setIsListening(true)

    tickRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)

    autoStopRef.current = setTimeout(
      () => stopListeningRef.current?.(),
      MAX_DURATION_MS
    )

    spawnRecognition()
  }, [isSupported]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { activeRef.current = false; clearTimers() }, [])

  return { isListening, isSupported, elapsed, permissionState, startListening, stopListening }
}
